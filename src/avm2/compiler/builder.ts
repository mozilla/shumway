/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module Shumway.AVM2.Compiler {
  import AbcFile = Shumway.AVM2.ABC.AbcFile;
  import Trait = Shumway.AVM2.ABC.Trait;
  import Info = Shumway.AVM2.ABC.Info;
  import MethodInfo = Shumway.AVM2.ABC.MethodInfo;
  import notImplemented = Shumway.Debug.notImplemented;
  import assert = Shumway.Debug.assert;
  import popManyIntoVoid = Shumway.ArrayUtilities.popManyIntoVoid;
  import top = Shumway.ArrayUtilities.top;
  import unique = Shumway.ArrayUtilities.unique;
  import Scope = Shumway.AVM2.Runtime.Scope;
  import createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;
  import Runtime = Shumway.AVM2.Runtime
  import GlobalMultinameResolver = Shumway.AVM2.Runtime.GlobalMultinameResolver;
  import Timer = Shumway.Metrics.Timer;

  var counter = Shumway.Metrics.Counter.instance;

  import Node = IR.Node;
  import Control = IR.Control;
  import Value = IR.Value;
  import StoreDependent = IR.StoreDependent;
  import Start = IR.Start;
  import Region = IR.Region;
  import Null = IR.Null;
  import Undefined = IR.Undefined;
  import True = IR.True;
  import False = IR.False;
  import This = IR.This;
  import Projection = IR.Projection;
  import ProjectionType = IR.ProjectionType;
  import Binary = IR.Binary;
  import Unary = IR.Unary;
  import Constant = IR.Constant;
  import Call = IR.Call;
  import Phi = IR.Phi;
  import Stop = IR.Stop;
  import Operator = IR.Operator;
  import Parameter = IR.Parameter;
  import NewArray = IR.NewArray;
  import NewObject = IR.NewObject;
  import KeyValuePair = IR.KeyValuePair;
  import isConstant = IR.isConstant;

  import ASScope = IR.ASScope;
  import ASMultiname = IR.ASMultiname;

  import TypeInformation = Verifier.TypeInformation;
  var writer = new IndentingWriter();
  var peepholeOptimizer = new IR.PeepholeOptimizer();

  declare var SAVED_SCOPE_NAME;
  declare var VM_OPEN_METHOD_PREFIX;
  declare var VM_OPEN_SET_METHOD_PREFIX;
  declare var VM_OPEN_GET_METHOD_PREFIX;

  /**
   * Use the 'typeof argument === "undefined" ? defaultValue : argument' pattern to
   * check for undefined arguments instead of the more correct arguments.length version.
   */
  var useTypeOfForDefaultArgumentChecking = false;

  /**
   * Coerce non-primitive parameters. We can "safely" ignore non-primitive coercions because AS3
   * programs with invalid coercions would throw runtime exceptions.
   */
  var emitCoerceNonPrimitiveParameters = false;

  /**
   * Coerce non-primitive values. Same logic as above.
   */
  var emitCoerceNonPrimitive = false;

  var emitAsTypeLate = true;

  class State {
    private static _nextID = 0;
    id: number
    index: number;
    local: Value [];
    stack: Value [];
    scope: Value [];
    store: Value;
    loads: Value [];
    saved: Value;
    constructor(index: number = 0) {
      this.id = State._nextID += 1;
      this.index = index;
      this.local = [];
      this.stack = [];
      this.scope = [];
      this.store = Undefined;
      this.loads = [];
      this.saved = Undefined;
    }

    clone(index: number) {
      var s = new State();
      s.index = index !== undefined ? index : this.index;
      s.local = this.local.slice(0);
      s.stack = this.stack.slice(0);
      s.scope = this.scope.slice(0);
      s.loads = this.loads.slice(0);
      s.saved = this.saved;
      s.store = this.store;
      return s;
    }

    matches(other: State) {
      return this.stack.length === other.stack.length &&
        this.scope.length === other.scope.length &&
        this.local.length === other.local.length;
    }

    makeLoopPhis(control: Control, dirtyLocals: boolean []) {
      var s = new State();
      release || assert (control);
      function makePhi(x) {
        var phi = new Phi(control, x);
        phi.isLoop = true;
        return phi;
      }
      s.index = this.index;
      s.local = this.local.map(function (v, i) {
        if (dirtyLocals[i]) {
          return makePhi(v);
        }
        return v;
      });
      s.stack = this.stack.map(makePhi);
      s.scope = this.scope.map(makePhi);
      s.loads = this.loads.slice(0);
      s.saved = this.saved;
      s.store = makePhi(this.store);
      return s;
    }

    static tryOptimizePhi(x: Value) {
      if (x instanceof Phi) {
        var phi: Phi = <Phi>x;
        if (phi.isLoop) {
          return phi;
        }
        var args = unique(phi.args);
        if (args.length === 1) {
          phi.seal();
          counter.count("Builder: OptimizedPhi");
          return args[0];
        }
      }
      return x;
    }

    optimize() {
      this.local = this.local.map(State.tryOptimizePhi);
      this.stack = this.stack.map(State.tryOptimizePhi);
      this.scope = this.scope.map(State.tryOptimizePhi);
      this.saved = State.tryOptimizePhi(this.saved);
      this.store = State.tryOptimizePhi(this.store);
    }

    static mergeValue(control: Control, a: Value, b: Value): Phi {
      var phi: Phi = <Phi>(a instanceof Phi && a.control === control ? a : new Phi(control, a));
      phi.pushValue(b);
      return phi;
    }

    static mergeValues(control: Control, a: Value [], b: Value []) {
      for (var i = 0; i < a.length; i++) {
        a[i] = State.mergeValue(control, a[i], b[i]);
      }
    }

    merge(control: Control, other: State) {
      release || assert (control);
      release || assert (this.matches(other), this, " !== ", other);
      State.mergeValues(control, this.local, other.local);
      State.mergeValues(control, this.stack, other.stack);
      State.mergeValues(control, this.scope, other.scope);
      this.store = State.mergeValue(control, this.store, other.store);
      this.store.abstract = true;
    }

    trace(writer: IndentingWriter) {
      writer.writeLn(this.toString());
    }

    static toBriefString(x: Node) {
      if (x instanceof Node) {
        return x.toString(true);
      }
      return x;
    }

    toString(): string {
      return "<" + String(this.id + " @ " + this.index).padRight(' ', 10) +
        (" M: " + State.toBriefString(this.store)).padRight(' ', 14) +
        (" X: " + State.toBriefString(this.saved)).padRight(' ', 14) +
        (" $: " + this.scope.map(State.toBriefString).join(", ")).padRight(' ', 20) +
        (" L: " + this.local.map(State.toBriefString).join(", ")).padRight(' ', 40) +
        (" S: " + this.stack.map(State.toBriefString).join(", ")).padRight(' ', 60);
    }
  }

  function asConstant(node: Value): Constant {
    release || assert (node instanceof Constant);
    return <Constant>node;
  }

  function isNumericConstant(node: Value): boolean {
    return node instanceof Constant && isNumeric((<Constant>node).value);
  }

  function isStringConstant(node: Value): boolean {
    return node instanceof Constant && isString((<Constant>node).value);
  }

  function isMultinameConstant(node: Value): boolean {
    return node instanceof Constant && (<Constant>node).value instanceof Multiname;
  }

  function hasNumericType(node: Value): boolean {
    if (isNumericConstant(node)) {
      return true;
    }
    return node.ty && node.ty.isNumeric();
  }

  function typesAreEqual(a: Value, b: Value): boolean {
    if (hasNumericType(a) && hasNumericType(b) ||
      hasStringType(a) && hasStringType(b)) {
      return true;
    }
    return false;
  }

  function hasStringType(node: Value): boolean {
    if (isStringConstant(node)) {
      return true;
    }
    return node.ty && node.ty.isString();
  }

  function constant(value: any): Constant {
    return new Constant(value);
  }

  function qualifiedNameConstant(name): Constant {
    return constant(Multiname.getQualifiedName(name));
  }

  function operatorFromOP(op: OP): IR.Operator {
    switch (op) {
      case OP.subtract:       return Operator.SUB;
      case OP.multiply:       return Operator.MUL;
      case OP.divide:         return Operator.DIV;
      case OP.modulo:         return Operator.MOD;
      case OP.lshift:         return Operator.LSH;
      case OP.rshift:         return Operator.RSH;
      case OP.urshift:        return Operator.URSH;
      case OP.bitand:         return Operator.AND;
      case OP.bitor:          return Operator.OR;
      case OP.bitxor:         return Operator.XOR;
      case OP.ifne:           return Operator.NE;
      case OP.ifstrictne:     return Operator.SNE;
      case OP.ifeq:
      case OP.equals:         return Operator.EQ;
      case OP.ifstricteq:
      case OP.strictequals:   return Operator.SEQ;
      case OP.iflt:
      case OP.lessthan:       return Operator.LT;
      case OP.ifle:
      case OP.lessequals:     return Operator.LE;
      case OP.ifgt:
      case OP.greaterthan:    return Operator.GT;
      case OP.ifge:
      case OP.greaterequals:  return Operator.GE;
      case OP.negate:         return Operator.NEG;
      case OP.negate_i:       return Operator.NEG;
      case OP.add_i:          return Operator.ADD;
      case OP.subtract_i:     return Operator.SUB;
      case OP.multiply_i:     return Operator.MUL;
      case OP.iftrue:         return Operator.TRUE;
      case OP.iffalse:        return Operator.FALSE;
      case OP.not:            return Operator.FALSE;
      case OP.bitnot:         return Operator.BITWISE_NOT;
      default:
        notImplemented(String(op));
    }
  }

  function getJSPropertyWithState(state: State, object: Value, path: string) {
    release || assert (isString(path));
    var names = path.split(".");
    var node = object;
    for (var i = 0; i < names.length; i++) {
      node = new IR.GetProperty(null, state.store, node, constant(names[i]));
      node.shouldFloat = true;
      state.loads.push(node);
    }
    return node;
  }

  function globalProperty(name: string): Value {
    var node = new IR.GlobalProperty(name);
    node.mustFloat = true;
    return node;
  }

  function warn(message) {
    // writer.warnLn(message);
  }

  function unary(operator: IR.Operator, argument: Value): Value {
    var node = new Unary(operator, argument);
    if (peepholeOptimizer) {
      node = peepholeOptimizer.fold(node);
    }
    return node;
  }

  function binary(operator: IR.Operator, left: Value, right: Value): Value {
    var node = new Binary(operator, left, right);
    if (left.ty && left.ty !== Shumway.AVM2.Verifier.Type.Any && left.ty === right.ty) {
      if (operator === Operator.EQ) {
        node.operator = Operator.SEQ;
      } else if (operator === Operator.NE) {
        node.operator = Operator.SNE;
      }
    }
    if (peepholeOptimizer) {
      node = peepholeOptimizer.fold(node);
    }
    return node;
  }

  function coerceInt(value: Value): Value {
    return binary(Operator.OR, value, constant(0));
  }

  function coerceUint(value: Value): Value {
    return binary(Operator.URSH, value, constant(0));
  }

  function coerceNumber(value: Value): Value {
    if (hasNumericType(value)) {
      return value;
    }
    return unary(Operator.PLUS, value);
  }

  function coerceBoolean(value: Value): Value {
    return unary(Operator.FALSE, unary(Operator.FALSE, value));
  }

  function shouldNotFloat(node: Value): Value {
    node.shouldNotFloat = true;
    return node;
  }

  function shouldFloat(node: Value): Value {
    release || assert (!(node instanceof IR.GetProperty), "Cannot float node : " + node);
    node.shouldFloat = true;
    return node;
  }

  function mustFloat(node: Value): Value {
    node.mustFloat = true;
    return node;
  }

  function callPure(callee: Value, object: Value, args: Value []): Call {
    return new Call(null, null, callee, object, args, IR.Flags.PRISTINE);
  }

  function callGlobalProperty(name: string, value: Value) {
    return callPure(globalProperty(name), null, [value]);
  }

  function convertString(value: Value): Value {
    if (isStringConstant(value)) {
      return value;
    }
    return callPure(globalProperty("String"), null, [value]);
  }

  function coerceString(value: Value): Value {
    if (isStringConstant(value)) {
      return value;
    } else if (isConstant(value)) {
      return new Constant(Runtime.asCoerceString(asConstant(value).value));
    }
    return callPure(globalProperty("asCoerceString"), null, [value]);
  }

  var coerceObject = callGlobalProperty.bind(null, "asCoerceObject");

  var coercers = createEmptyObject();
  coercers[Multiname.Int] = coerceInt;
  coercers[Multiname.Uint] = coerceUint;
  coercers[Multiname.Number] = coerceNumber;
  coercers[Multiname.String] = coerceString;
  coercers[Multiname.Object] = coerceObject;
  coercers[Multiname.Boolean] = coerceBoolean;

  function getCoercerForType(multiname: Multiname) {
    release || assert (multiname instanceof Multiname);
    return coercers[Multiname.getQualifiedName(multiname)];
  }

  var callableConstructors = createEmptyObject();
  callableConstructors[Multiname.Int] = coerceInt;
  callableConstructors[Multiname.Uint] = coerceUint;
  callableConstructors[Multiname.Number] = callGlobalProperty.bind(null, "Number");
  callableConstructors[Multiname.String] = callGlobalProperty.bind(null, "String");
  callableConstructors[Multiname.Object] = callGlobalProperty.bind(null, "Object");
  callableConstructors[Multiname.Boolean] = callGlobalProperty.bind(null, "Boolean");

  function getCallableConstructorForType(multiname: Multiname) {
    release || assert (multiname instanceof Multiname);
    return callableConstructors[Multiname.getQualifiedName(multiname)];
  }

  interface WorklistItem {
    region: Region;
    block: Bytecode;
  }

  /**
   * All the state needed when building blocks.
   */
  class BlockBuilder {
    bc: Bytecode;
    abc: AbcFile;
    bytecodes: Bytecode [];
    stops: any [];
    constantPool: ConstantPool;
    domain: Constant;
    traceBuilder: boolean;
    methodInfo: MethodInfo;
    constructor(public builder: Builder, public region: Region, public block: Bytecode, public state: State) {
      this.abc = builder.abc;
      this.domain = builder.domain;
      this.bytecodes = builder.methodInfo.analysis.bytecodes;
      this.constantPool = builder.abc.constantPool;
      this.traceBuilder = builder.traceBuilder;
      this.methodInfo = builder.methodInfo;
    }

    popMultiname(): ASMultiname {
      var multiname = this.constantPool.multinames[this.bc.index];
      var namespaces, name, flags = multiname.flags;
      if (multiname.isRuntimeName()) {
        name = this.state.stack.pop();
      } else {
        name = constant(multiname.name);
      }
      if (multiname.isRuntimeNamespace()) {
        namespaces = shouldFloat(new NewArray(this.region, [this.state.stack.pop()]));
      } else {
        namespaces = constant(multiname.namespaces);
      }
      return new IR.ASMultiname(namespaces, name, flags);
    }

    setIfStops(predicate: Value) {
      release || assert (!this.stops);
      var _if = new IR.If(this.region, predicate);
      this.stops = [{
        control: new Projection(_if, ProjectionType.FALSE),
        target: this.bytecodes[this.bc.position + 1],
        state: this.state
      }, {
        control: new Projection(_if, ProjectionType.TRUE),
        target: this.bc.target,
        state: this.state
      }];
    }

    setJumpStop() {
      release || assert (!this.stops);
      this.stops = [{
        control: this.region,
        target: this.bc.target,
        state: this.state
      }];
    }

    setThrowStop() {
      release || assert (!this.stops);
      this.stops = [];
    }

    setReturnStop() {
      release || assert (!this.stops);
      this.stops = [];
    }

    setSwitchStops(determinant: Value) {
      release || assert (!this.stops);
      if (this.bc.targets.length > 2) {
        this.stops = [];
        var _switch = new IR.Switch(this.region, determinant);
        for (var i = 0; i < this.bc.targets.length; i++) {
          this.stops.push({
            control: new Projection(_switch, ProjectionType.CASE, constant(i)),
            target: this.bc.targets[i],
            state: this.state
          });
        }
      } else {
        release || assert (this.bc.targets.length === 2);
        var predicate = binary(Operator.SEQ, determinant, constant(0));
        var _if = new IR.If(this.region, predicate);
        this.stops = [{
          control: new Projection(_if, ProjectionType.FALSE),
          target: this.bc.targets[1],
          state: this.state
        }, {
          control: new Projection(_if, ProjectionType.TRUE),
          target: this.bc.targets[0],
          state: this.state
        }];
      }
    }

    savedScope(): ASScope {
      return <ASScope>this.state.saved;
    }

    topScope(depth?: number): ASScope {
      var scope = this.state.scope;
      if (depth !== undefined) {
        if (depth < scope.length) {
          return <ASScope>scope[scope.length - 1 - depth];
        } else if (depth === scope.length) {
          return this.savedScope();
        } else {
          var s = this.savedScope();
          var savedScopeDepth = depth - scope.length;
          for (var i = 0; i < savedScopeDepth; i ++) {
            s = <ASScope>getJSPropertyWithState(this.state, s, "parent");
          }
          return s;
        }
      }
      if (scope.length > 0) {
        return top(scope);
      }
      return this.savedScope();
    }

    getGlobalScope(): Value {
      var ti = this.bc.ti;
      if (ti && ti.object) {
        return constant(ti.object);
      }
      return new IR.ASGlobal(null, this.savedScope());
    }

    getScopeObject(scope: Value): Value {
      if (scope instanceof IR.ASScope) {
        return (<IR.ASScope>scope).object;
      }
      return getJSPropertyWithState(this.state, scope, "object");
    }

    findProperty(multiname: ASMultiname, strict: boolean): Value {
      var ti = this.bc.ti;
      var slowPath = new IR.ASFindProperty(this.region, this.state.store, this.topScope(), multiname, this.domain, strict);
      if (ti) {
        if (ti.object) {
          if (ti.object instanceof Shumway.AVM2.Runtime.Global && !ti.object.isExecuting()) {
            // If we find the property in a global whose script hasn't been executed yet
            // we have to emit the slow path so it gets executed.
            warn("Can't optimize findProperty " + multiname + ", global object is not yet executed or executing.");
            return slowPath;
          }
          return constant(ti.object);
        } else if (ti.scopeDepth !== undefined) {
          return this.getScopeObject(this.topScope(ti.scopeDepth));
        }
      }
      warn("Can't optimize findProperty " + multiname);
      return slowPath;
    }

    coerce(multiname: Multiname, value: Value): Value {
      // TODO: Try to do the coercion of constant values without causing classes to be
      // loaded, as is the case when calling |asCoerceByMultiname|.
      if (false && isConstant(value)) {
        return constant(Runtime.asCoerceByMultiname(this.domain.value, multiname, (<Constant>value).value));
      } else {
        var coercer = getCoercerForType(multiname);
        if (coercer) {
          return coercer(value);
        }
      }
      if (emitCoerceNonPrimitive) {
        return this.call(globalProperty("asCoerceByMultiname"), null, [this.domain, constant(multiname), value]);
      }
      return value;
    }

    /**
     * Marks the |node| as the active store node, with dependencies on all loads appearing after the
     * previous active store node.
     */
    store(node: any): Value {
      var state = this.state;
      state.store = new Projection(node, ProjectionType.STORE);
      node.loads = state.loads.slice(0);
      state.loads.length = 0;
      return node;
    }

    /**
     * Keeps track of the current set of loads.
     */
    load(node): Value {
      var state = this.state;
      state.loads.push(node);
      return node;
    }

    call(callee: Value, object: Value, args: Value []): Value {
      return this.store(new Call(this.region, this.state.store, callee, object, args, IR.Flags.PRISTINE));
    }

    callCall(callee: Value, object: Value, args: Value []) {
      return this.store(new Call(this.region, this.state.store, callee, object, args, IR.Flags.AS_CALL));
    }

    callProperty(object: Value, multiname: ASMultiname, args: Value [], isLex: boolean) {
      var ti = this.bc.ti;
      var region = this.region;
      var state = this.state;
      if (ti && ti.trait) {
        if (ti.trait.isMethod()) {
          var openQn;
          if (ti.trait.holder instanceof InstanceInfo &&
            (<InstanceInfo>ti.trait.holder).isInterface()) {
            openQn = Multiname.getPublicQualifiedName(Multiname.getName(ti.trait.name));
          } else {
            openQn = Multiname.getQualifiedName(ti.trait.name);
          }
          openQn = VM_OPEN_METHOD_PREFIX + openQn;
          return this.store(new IR.CallProperty(region, state.store, object, constant(openQn), args, IR.Flags.PRISTINE));
        } else if (ti.trait.isClass()) {
          var constructor = getCallableConstructorForType(ti.trait.name);
          if (constructor) {
            return constructor(args[0]);
          }
          var qn = Multiname.getQualifiedName(ti.trait.name);
          return this.store(new IR.CallProperty(region, state.store, object, constant(qn), args, IR.Flags.AS_CALL));
        }
      }
      var mn = this.resolveMultinameGlobally(multiname);
      if (mn) {
        return this.store(new IR.ASCallProperty(region, state.store, object, constant(Multiname.getQualifiedName(mn)), args, IR.Flags.PRISTINE | IR.Flags.RESOLVED, isLex));
      }
      return this.store(new IR.ASCallProperty(region, state.store, object, multiname, args, IR.Flags.PRISTINE, isLex));
    }

    getProperty(object: Value, multiname: ASMultiname, getOpenMethod?: boolean) {
      var ti = this.bc.ti;
      var region = this.region;
      var state = this.state;
      release || assert (multiname instanceof IR.ASMultiname);
      getOpenMethod = !!getOpenMethod;
      if (ti) {
        if (ti.trait) {
          if (ti.trait.isConst() && ti.trait.hasDefaultValue) {
            return constant(ti.trait.value);
          }
          var get = new IR.GetProperty(region, state.store, object, qualifiedNameConstant(ti.trait.name));
          return ti.trait.isGetter() ? this.store(get) : this.load(get);
        }
      }
      if (hasNumericType(multiname.name)) {
        return this.store(new IR.ASGetProperty(region, state.store, object, multiname, IR.Flags.NumericProperty));
      }
      warn("Can't optimize getProperty " + multiname.name + " " + multiname.name.ty);
      var qn = this.resolveMultinameGlobally(multiname);
      if (qn) {
        return this.store(new IR.ASGetProperty(region, state.store, object, constant(Multiname.getQualifiedName(qn)), IR.Flags.RESOLVED | (getOpenMethod ? IR.Flags.IS_METHOD : 0)));
      }
      counter.count("Compiler: Slow ASGetProperty");
      return this.store(new IR.ASGetProperty(region, state.store, object, multiname, (getOpenMethod ? IR.Flags.IS_METHOD : 0)));
    }

    setProperty(object: Value, multiname: ASMultiname, value: Value) {
      var ti = this.bc.ti;
      var region = this.region;
      var state = this.state;
      release || assert (multiname instanceof IR.ASMultiname);
      if (ti) {
        if (ti.trait) {
          var coercer = ti.trait.typeName ? getCoercerForType(ti.trait.typeName) : null;
          if (coercer) {
            value = coercer(value);
          }
          this.store(new IR.SetProperty(region, state.store, object, qualifiedNameConstant(ti.trait.name), value));
          return;
        }
      }
      if (hasNumericType(multiname.name)) {
        return this.store(new IR.ASSetProperty(region, state.store, object, multiname, value, IR.Flags.NumericProperty));
      }
      warn("Can't optimize setProperty " + multiname);
      var qn = this.resolveMultinameGlobally(multiname);
      if (qn) {
        // TODO: return store(new IR.SetProperty(region, state.store, object, constant(Multiname.getQualifiedName(qn)), value));
      }
      return this.store(new IR.ASSetProperty(region, state.store, object, multiname, value, 0));
    }

    callSuper(scope: ASScope, object: Value, multiname: ASMultiname, args: Value []): Value {
      var ti = this.bc.ti;
      var region = this.region;
      var state = this.state;
      if (ti && ti.trait && ti.trait.isMethod() && ti.baseClass) {
        var qn = VM_OPEN_METHOD_PREFIX + Multiname.getQualifiedName(ti.trait.name);
        var callee = this.getJSProperty(constant(ti.baseClass), "traitsPrototype." + qn);
        return this.call(callee, object, args);
      }
      return this.store(new IR.ASCallSuper(region, state.store, object, multiname, args, IR.Flags.PRISTINE, scope));
    }

    getSuper(scope: ASScope, object: Value, multiname: ASMultiname): Value {
      var ti = this.bc.ti;
      var region = this.region;
      var state = this.state;
      if (ti && ti.trait && ti.trait.isGetter() && ti.baseClass) {
        var qn = VM_OPEN_GET_METHOD_PREFIX + Multiname.getQualifiedName(ti.trait.name);
        var callee = this.getJSProperty(constant(ti.baseClass), "traitsPrototype." + qn);
        return this.call(callee, object, []);
      }
      return this.store(new IR.ASGetSuper(region, state.store, object, multiname, scope));
    }

    setSuper(scope: ASScope, object: Value, multiname: ASMultiname, value: Value) {
      var ti = this.bc.ti;
      var region = this.region;
      var state = this.state;
      if (ti && ti.trait && ti.trait.isSetter() && ti.baseClass) {
        var qn = VM_OPEN_SET_METHOD_PREFIX + Multiname.getQualifiedName(ti.trait.name);
        var callee = this.getJSProperty(constant(ti.baseClass), "traitsPrototype." + qn);
        return this.call(callee, object, [value]);
      }
      return this.store(new IR.ASSetSuper(region, state.store, object, multiname, value, scope));
    }

    constructSuper(scope: Value, object: Value, args: Value []) {
      var ti = this.bc.ti;
      var region = this.region;
      var state = this.state;
      if (ti) {
        if (ti.noCallSuperNeeded) {
          return;
        } else if (ti.baseClass) {
          var callee = this.getJSProperty(constant(ti.baseClass), "instanceConstructorNoInitialize");
          this.call(callee, object, args);
          return;
        }
      }
      callee = this.getJSProperty(scope, "object.baseClass.instanceConstructorNoInitialize");
      this.call(callee, object, args);
      return;
    }

    getSlot(object: Value, index: Value): Value {
      var ti = this.bc.ti;
      var region = this.region;
      var state = this.state;
      if (ti) {
        var trait = ti.trait;
        if (trait) {
          if (trait.isConst() && ti.trait.hasDefaultValue) {
            return constant(trait.value);
          }
          var slotQn = Multiname.getQualifiedName(trait.name);
          return this.store(new IR.GetProperty(region, state.store, object, constant(slotQn)));
        }
      }
      warn("Can't optimize getSlot " + index);
      return this.store(new IR.ASGetSlot(null, state.store, object, index));
    }

    setSlot(object: Value, index: Value, value: Value) {
      var ti = this.bc.ti;
      var region = this.region;
      var state = this.state;
      if (ti) {
        var trait = ti.trait;
        if (trait) {
          var slotQn = Multiname.getQualifiedName(trait.name);
          this.store(new IR.SetProperty(region, state.store, object, constant(slotQn), value));
          return;
        }
      }
      warn("Can't optimize setSlot " + index);
      this.store(new IR.ASSetSlot(region, state.store, object, index, value));
    }

    resolveMultinameGlobally(multiname): Multiname {
      var namespaces = multiname.namespaces;
      var name = multiname.name;
      if (!Shumway.AVM2.Runtime.globalMultinameAnalysis.value) {
        return;
      }
      if (!isConstant(namespaces) || !isConstant(name) || multiname.isAttribute()) {
        counter.count("GlobalMultinameResolver: Cannot resolve runtime multiname or attribute.");
        return;
      }
      if (isNumeric(name.value) || !isString(name.value) || !name.value) {
        counter.count("GlobalMultinameResolver: Cannot resolve numeric or any names.");
        return;
      }
      return GlobalMultinameResolver.resolveMultiname(new Multiname(namespaces.value, name.value, multiname.flags));
    }

    getJSProperty(object: Value, path: string): Value {
      return getJSPropertyWithState(this.state, object, path);
    }

    simplifyName(name): Value {
      if (isMultinameConstant(name) && Multiname.isQName(name.value)) {
        return constant(Multiname.getQualifiedName(name.value));
      }
      return name;
    }

    getDescendants(object: Value, name): Value {
      var ti = this.bc.ti;
      var region = this.region;
      var state = this.state;
      name = this.simplifyName(name);
      return new IR.ASGetDescendants(region, state.store, object, name);
    }

    truthyCondition(operator: IR.Operator): Value {
      var stack = this.state.stack;
      var right;
      if (operator.isBinary) {
        right = stack.pop();
      }
      var left = stack.pop();
      var node;
      if (right) {
        node = binary(operator, left, right);
      } else {
        node = unary(operator, left);
      }
      if (peepholeOptimizer) {
        node = peepholeOptimizer.fold(node, true);
      }
      return node;
    }

    negatedTruthyCondition(operator: IR.Operator) {
      var node = unary(Operator.FALSE, this.truthyCondition(operator));
      if (peepholeOptimizer) {
        node = peepholeOptimizer.fold(node, true);
      }
      return node;
    }

    pushExpression(operator: IR.Operator, toInt?: boolean) {
      var stack = this.state.stack;
      var left, right;
      if (operator.isBinary) {
        right = stack.pop();
        left = stack.pop();
        if (toInt) {
          right = coerceInt(right);
          left = coerceInt(left);
        }
        this.push(binary(operator, left, right));
      } else {
        left = stack.pop();
        if (toInt) {
          left = coerceInt(left);
        }
        this.push(unary(operator, left));
      }
    }

    push(x: Value) {
      var bc = this.bc;
      release || assert (x instanceof IR.Node);
      if (bc.ti) {
        if (x.ty) {
          // release || assert (x.ty == bc.ti.type);
        } else {
          x.ty = bc.ti.type;
        }
      }
      this.state.stack.push(x);
    }

    pushLocal(index: number) {
      var local = this.state.local;
      this.push(local[index]);
    }

    popLocal(index: number) {
      var state = this.state;
      state.local[index] = shouldNotFloat(state.stack.pop());
    }

    build() {
      var block = this.block;
      var state = this.state;
      var local = this.state.local;
      var stack = this.state.stack;
      var scope = this.state.scope;
      var region = this.region;
      var bytecodes = this.bytecodes;

      var left: Value, right: Value, index: Value;
      var value: Value, object: Value, callee: Value;
      var multiname: ASMultiname, type: Value, args: Value [];
      var operator: Operator;

      var push = this.push.bind(this);

      function pop(): Value {
        return stack.pop();
      }

      function popMany(count) {
        return Shumway.ArrayUtilities.popMany(stack, count);
      }

      this.stops = null;

      if (this.traceBuilder) {
        writer.writeLn("Processing Region: " + region + ", Block: " + block.bid);
        writer.enter(("> state: " + region.entryState.toString()).padRight(' ', 100));
      }

      var bc;
      for (var bci = block.position, end = block.end.position; bci <= end; bci++) {
        this.bc = bc = bytecodes[bci];
        var op = bc.op;
        state.index = bci;
        switch (op) {
          case OP.throw:
            this.store(new IR.Throw(region, pop()));
            this.builder.stopPoints.push({
              region: region,
              store: state.store,
              value: Undefined
            });
            this.setThrowStop();
            break;
          case OP.getlocal:
            this.pushLocal(bc.index);
            break;
          case OP.getlocal0:
          case OP.getlocal1:
          case OP.getlocal2:
          case OP.getlocal3:
            this.pushLocal(op - OP.getlocal0);
            break;
          case OP.setlocal:
            this.popLocal(bc.index);
            break;
          case OP.setlocal0:
          case OP.setlocal1:
          case OP.setlocal2:
          case OP.setlocal3:
            this.popLocal(op - OP.setlocal0);
            break;
          case OP.pushwith:
          case OP.pushscope:
            scope.push(new IR.ASScope(this.topScope(), pop(), op === OP.pushwith));
            break;
          case OP.popscope:
            scope.pop();
            break;
          case OP.getglobalscope:
            push(this.getGlobalScope());
            break;
          case OP.getscopeobject:
            push(this.getScopeObject(state.scope[bc.index]));
            break;
          case OP.findproperty:
          case OP.findpropstrict:
            push(this.findProperty(this.popMultiname(), op === OP.findpropstrict));
            break;
          case OP.getproperty:
            multiname = this.popMultiname();
            object = pop();
            push(this.getProperty(object, multiname, false));
            break;
          case OP.getdescendants:
            multiname = this.popMultiname();
            object = pop();
            push(this.getDescendants(object, multiname));
            break;
          case OP.getlex:
            multiname = this.popMultiname();
            push(this.getProperty(this.findProperty(multiname, true), multiname, false));
            break;
          case OP.initproperty:
          case OP.setproperty:
            value = pop();
            multiname = this.popMultiname();
            object = pop();
            this.setProperty(object, multiname, value);
            break;
          case OP.deleteproperty:
            multiname = this.popMultiname();
            object = pop();
            push(this.store(new IR.ASDeleteProperty(region, state.store, object, multiname)));
            break;
          case OP.getslot:
            object = pop();
            push(this.getSlot(object, constant(bc.index)));
            break;
          case OP.setslot:
            value = pop();
            object = pop();
            this.setSlot(object, constant(bc.index), value);
            break;
          case OP.getsuper:
            multiname = this.popMultiname();
            object = pop();
            push(this.getSuper(this.savedScope(), object, multiname));
            break;
          case OP.setsuper:
            value = pop();
            multiname = this.popMultiname();
            object = pop();
            this.setSuper(this.savedScope(), object, multiname, value);
            break;
          case OP.debugfile:
          case OP.debugline:
            break;
          case OP.newfunction:
            push(callPure(this.builder.createFunctionCallee, null, [constant(this.abc.methods[bc.index]), this.topScope(), constant(true)]));
            break;
          case OP.call:
            args = popMany(bc.argCount);
            object = pop();
            callee = pop();
            push(this.callCall(callee, object, args));
            break;
          case OP.callproperty:
          case OP.callpropvoid:
          case OP.callproplex:
            args = popMany(bc.argCount);
            multiname = this.popMultiname();
            object = pop();
            value = this.callProperty(object, multiname, args, op === OP.callproplex);
            if (op !== OP.callpropvoid) {
              push(value);
            }
            break;
          case OP.callsuper:
          case OP.callsupervoid:
            multiname = this.popMultiname();
            args = popMany(bc.argCount);
            object = pop();
            value = this.callSuper(this.savedScope(), object, multiname, args);
            if (op !== OP.callsupervoid) {
              push(value);
            }
            break;
          case OP.construct:
            args = popMany(bc.argCount);
            object = pop();
            push(this.store(new IR.ASNew(region, state.store, object, args)));
            break;
          case OP.constructsuper:
            args = popMany(bc.argCount);
            object = pop();
            this.constructSuper(this.savedScope(), object, args);
            break;
          case OP.constructprop:
            args = popMany(bc.argCount);
            multiname = this.popMultiname();
            object = pop();
            callee = this.getProperty(object, multiname, false);
            push(this.store(new IR.ASNew(region, state.store, callee, args)));
            break;
          case OP.coerce:
            if (bc.ti && bc.ti.noCoercionNeeded) {
              counter.count("Compiler: NoCoercionNeeded");
              break;
            } else {
              counter.count("Compiler: CoercionNeeded");
            }
            value = pop();
            push(this.coerce(this.constantPool.multinames[bc.index], value));
            break;
          case OP.coerce_i:
          case OP.convert_i:
            push(coerceInt(pop()));
            break;
          case OP.coerce_u:
          case OP.convert_u:
            push(coerceUint(pop()));
            break;
          case OP.coerce_d:
          case OP.convert_d:
            push(coerceNumber(pop()));
            break;
          case OP.coerce_b:
          case OP.convert_b:
            push(coerceBoolean(pop()));
            break;
          case OP.checkfilter:
            push(this.call(globalProperty("checkFilter"), null, [pop()]));
            break;
          case OP.coerce_a:
            /* NOP */
            break;
          case OP.coerce_s:
            push(coerceString(pop()));
            break;
          case OP.convert_s:
            push(convertString(pop()));
            break;
          case OP.astypelate:
            type = pop();
            if (emitAsTypeLate) {
              value = pop();
              push(this.call(globalProperty("asAsType"), null, [type, value]));
            }
            break;
          case OP.returnvalue:
          case OP.returnvoid:
            value = Undefined;
            if (op === OP.returnvalue) {
              value = pop();
              if (this.methodInfo.returnType) {
                if (!(bc.ti && bc.ti.noCoercionNeeded)) {
                  value = this.coerce(this.methodInfo.returnType, value);
                }
              }
            }
            this.builder.stopPoints.push({
              region: region,
              store: state.store,
              value: value
            });
            this.setReturnStop();
            break;
          case OP.nextname:
          case OP.nextvalue:
            index = pop();
            object = pop();
            push(new IR.CallProperty(
              region, state.store, object,
              constant(op === OP.nextname ? "asNextName" : "asNextValue"),
              [index], IR.Flags.PRISTINE)
            );
            break;
          case OP.hasnext2:
            var temp = this.call(globalProperty("asHasNext2"), null, [local[bc.object], local[bc.index]]);
            local[bc.object] = this.getJSProperty(temp, "object");
            push(local[bc.index] = this.getJSProperty(temp, "index"));
            break;
          case OP.pushnull:
            push(Null);
            break;
          case OP.pushundefined:
            push(Undefined);
            break;
          case OP.pushtrue:
            push(True);
            break;
          case OP.pushfalse:
            push(False);
            break;
          case OP.pushnan:
            push(constant(NaN));
            break;
          case OP.pushfloat:
            notImplemented(String(bc));
            break;
          case OP.pushbyte:
          case OP.pushshort:
            push(constant(bc.value));
            break;
          case OP.pushstring:
            push(constant(this.constantPool.strings[bc.index]));
            break;
          case OP.pushint:
            push(constant(this.constantPool.ints[bc.index]));
            break;
          case OP.pushuint:
            push(constant(this.constantPool.uints[bc.index]));
            break;
          case OP.pushdouble:
            push(constant(this.constantPool.doubles[bc.index]));
            break;
          case OP.pop:
            pop();
            break;
          case OP.dup:
            value = shouldNotFloat(pop()); push(value); push(value);
            break;
          case OP.swap:
            state.stack.push(pop(), pop());
            break;
          case OP.debug:
          case OP.debugline:
          case OP.debugfile:
            break;
          case OP.jump:
            this.setJumpStop();
            break;
          case OP.ifnlt:
            this.setIfStops(this.negatedTruthyCondition(Operator.LT));
            break;
          case OP.ifnge:
            this.setIfStops(this.negatedTruthyCondition(Operator.GE));
            break;
          case OP.ifngt:
            this.setIfStops(this.negatedTruthyCondition(Operator.GT));
            break;
          case OP.ifnle:
            this.setIfStops(this.negatedTruthyCondition(Operator.LE));
            break;
          case OP.ifge:
          case OP.ifgt:
          case OP.ifle:
          case OP.iflt:
          case OP.iftrue:
          case OP.iffalse:
          case OP.ifeq:
          case OP.ifne:
          case OP.ifstricteq:
          case OP.ifstrictne:
            this.setIfStops(this.truthyCondition(operatorFromOP(op)));
            break;
          case OP.lookupswitch:
            this.setSwitchStops(pop());
            break;
          case OP.add:
            right = pop();
            left = pop();
            if (typesAreEqual(left, right)) {
              operator = Operator.ADD;
            } else if (Shumway.AVM2.Runtime.useAsAdd) {
              operator = Operator.AS_ADD;
            } else {
              operator = Operator.ADD;
            }
            push(binary(operator, left, right));
            break;
          case OP.subtract:
          case OP.multiply:
          case OP.divide:
          case OP.modulo:
          case OP.lshift:
          case OP.rshift:
          case OP.urshift:
          case OP.bitand:
          case OP.bitor:
          case OP.bitxor:
          case OP.equals:
          case OP.strictequals:
          case OP.lessthan:
          case OP.lessequals:
          case OP.greaterthan:
          case OP.greaterequals:
          case OP.negate:
          case OP.not:
          case OP.bitnot:
            this.pushExpression(operatorFromOP(op));
            break;
          case OP.negate_i:
          case OP.add_i:
          case OP.subtract_i:
          case OP.multiply_i:
            this.pushExpression(operatorFromOP(op), true);
            break;
          case OP.increment:
          case OP.increment_i:
          case OP.decrement:
          case OP.decrement_i:
            push(constant(1));
            if (op === OP.increment || op === OP.decrement) {
              push(coerceNumber(pop()));
            } else {
              push(coerceInt(pop()));
            }
            if (op === OP.increment || op === OP.increment_i) {
              this.pushExpression(Operator.ADD);
            } else {
              this.pushExpression(Operator.SUB);
            }
            break;
          case OP.inclocal:
          case OP.inclocal_i:
          case OP.declocal:
          case OP.declocal_i:
            push(constant(1));
            if (op === OP.inclocal || op === OP.declocal) {
              push(coerceNumber(local[bc.index]));
            } else {
              push(coerceInt(local[bc.index]));
            }
            if (op === OP.inclocal || op === OP.inclocal_i) {
              this.pushExpression(Operator.ADD);
            } else {
              this.pushExpression(Operator.SUB);
            }
            this.popLocal(bc.index);
            break;
          case OP.instanceof:
            type = pop();
            value = pop();
            push(this.call(this.getJSProperty(type, "isInstanceOf"), null, [value]));
            break;
          case OP.istype:
            value = pop();
            multiname = this.popMultiname();
            type = this.getProperty(this.findProperty(multiname, false), multiname);
            push(this.call(globalProperty("asIsType"), null, [type, value]));
            break;
          case OP.istypelate:
            type = pop();
            value = pop();
            push(this.call(globalProperty("asIsType"), null, [type, value]));
            break;
          case OP.in:
            object = pop();
            value = pop();
            multiname = new IR.ASMultiname(Undefined, value, 0);
            push(this.store(new IR.ASHasProperty(region, state.store, object, multiname)));
            break;
          case OP.typeof:
            push(this.call(globalProperty("asTypeOf"), null, [pop()]));
            break;
          case OP.kill:
            push(Undefined);
            this.popLocal(bc.index);
            break;
          case OP.applytype:
            args = popMany(bc.argCount);
            type = pop();
            callee = globalProperty("applyType");
            push(this.call(callee, null, [this.domain, type, new NewArray(region, args)]));
            break;
          case OP.newarray:
            args = popMany(bc.argCount);
            push(new NewArray(region, args));
            break;
          case OP.newobject:
            var properties = [];
            for (var i = 0; i < bc.argCount; i++) {
              var value = pop();
              var key = pop();
              release || assert (isConstant(key) && isString((<Constant>key).value));
              key = constant(Multiname.getPublicQualifiedName((<Constant>key).value));
              properties.push(new KeyValuePair(key, value));
            }
            push(new NewObject(region, properties));
            break;
          case OP.newactivation:
            push(new IR.ASNewActivation(constant(this.methodInfo)));
            break;
          case OP.newclass:
            callee = globalProperty("createClass");
            push(this.call(callee, null, [constant(this.abc.classes[bc.index]), pop(), this.topScope()]));
            break;
          default:
            notImplemented(String(bc));
        }
        if (op === OP.debug || op === OP.debugfile || op === OP.debugline) {
          continue;
        }
        if (this.traceBuilder) {
          writer.writeLn(("state: " + state.toString()).padRight(' ', 100) + " : " + bci + ", " + bc.toString(this.abc));
        }
      }
      if (this.traceBuilder) {
        writer.leave(("< state: " + state.toString()).padRight(' ', 100));
      }
    }
  }

  class Builder {
    abc: AbcFile;
    scope: Scope;
    domain: Constant;
    methodInfo: MethodInfo;
    hasDynamicScope: boolean;
    traceBuilder: boolean;
    createFunctionCallee: Value;
    stopPoints: any [];
    bytecodes: Bytecode [];
    constructor(methodInfo, scope, hasDynamicScope) {
      release || assert (methodInfo && methodInfo.abc && scope);
      this.abc = methodInfo.abc;
      this.domain = new Constant(methodInfo.abc.applicationDomain);
      this.scope = scope;
      this.methodInfo = methodInfo;
      this.hasDynamicScope = hasDynamicScope;
      this.traceBuilder = Shumway.AVM2.Compiler.traceLevel.value > 2;
      this.createFunctionCallee = globalProperty("createFunction");
      this.stopPoints = [];
      this.bytecodes = this.methodInfo.analysis.bytecodes;
    }

    buildStart(start: Start) {
      var mi = this.methodInfo;
      var state = start.entryState = new State(0);

      /**
       * [dynamicScope] this parameters ... [arguments|rest] locals
       */

      /* First local is the |this| reference. */
      state.local.push(new This(start));

      var parameterIndexOffset = this.hasDynamicScope ? 1 : 0;
      var parameterCount = mi.parameters.length;

      /* Create the method's parameters. */
      for (var i = 0; i < parameterCount; i++) {
        state.local.push(new Parameter(start, parameterIndexOffset + i, mi.parameters[i].name));
      }

      /* Wipe out the method's remaining locals. */
      for (var i = parameterCount; i < mi.localCount; i++) {
        state.local.push(Undefined);
      }

      state.store = new Projection(start, ProjectionType.STORE);
      if (this.hasDynamicScope) {
        start.scope = new Parameter(start, 0, SAVED_SCOPE_NAME);
      } else {
        start.scope = new Constant(this.scope);
      }
      state.saved = new Projection(start, ProjectionType.SCOPE);
      start.domain = this.domain;

      var args = new IR.Arguments(start);

      if (mi.needsRest() || mi.needsArguments()) {
        var offset = constant(parameterIndexOffset + (mi.needsRest() ? parameterCount : 0));
        state.local[parameterCount + 1] =
          new Call(start, state.store, globalProperty("sliceArguments"), null, [args, offset], IR.Flags.PRISTINE);
      }

      var argumentsLength = getJSPropertyWithState(state, args, "length");

      for (var i = 0; i < parameterCount; i++) {
        var parameter = mi.parameters[i];
        var index = i + 1;
        var local = state.local[index];
        if (parameter.value !== undefined) {
          var condition: Value;
          if (useTypeOfForDefaultArgumentChecking) {
            condition = new IR.Binary(Operator.SEQ, new IR.Unary(Operator.TYPE_OF, local), constant("undefined"));
          } else {
            condition = new IR.Binary(Operator.LT, argumentsLength, constant(parameterIndexOffset + i + 1));
          }
          local = new IR.Latch(null, condition, constant(parameter.value), local);
        }
        if (parameter.type && !parameter.type.isAnyName()) {
          var coercer = getCoercerForType(parameter.type);
          if (coercer) {
            local = coercer(local);
          } else if (emitCoerceNonPrimitiveParameters) {
            local = new Call(start, state.store, globalProperty("asCoerceByMultiname"), null, [this.domain, constant(parameter.type), local], 0);
          }
        }
        state.local[index] = local;
      }

      return start;
    }

    buildGraph() {
      var analysis = this.methodInfo.analysis;
      var blocks = analysis.blocks;
      var methodInfo = this.methodInfo;
      var traceBuilder = this.traceBuilder;

      for (var i = 0; i < blocks.length; i++) {
        blocks[i].bdo = i;
      }

      var worklist = new Shumway.SortedList<WorklistItem>(function compare(a: WorklistItem, b: WorklistItem) {
        return a.block.bdo - b.block.bdo;
      });

      var start = new Start();
      this.buildStart(start);

      worklist.push({region: start, block: blocks[0]});

      var next;
      while ((next = worklist.pop())) {
        this.buildBlock(next.region, next.block, next.region.entryState.clone()).forEach(function (stop) {
          var target = stop.target;
          var region = target.region;
          if (region) {
            traceBuilder && writer.enter("Merging into region: " + region + " @ " + target.position + ", block " + target.bid + " {");
            traceBuilder && writer.writeLn("  R " + region.entryState);
            traceBuilder && writer.writeLn("+ I " + stop.state);

            region.entryState.merge(region, stop.state);
            region.predecessors.push(stop.control);

            traceBuilder && writer.writeLn("  = " + region.entryState);
            traceBuilder && writer.leave("}");
          } else {
            region = target.region = new Region(stop.control);
            var dirtyLocals: boolean [] = null;
            if (target.loop) {
              dirtyLocals = enableDirtyLocals.value && target.loop.getDirtyLocals();
              traceBuilder && writer.writeLn("Adding PHIs to loop region. " + dirtyLocals);
            }
            region.entryState = target.loop ? stop.state.makeLoopPhis(region, dirtyLocals) : stop.state.clone(target.position);
            traceBuilder && writer.writeLn("Adding new region: " + region + " @ " + target.position + " to worklist.");
            worklist.push({region: region, block: target});
          }
        });

        traceBuilder && writer.enter("Worklist: {");
        worklist.forEach(function (item) {
          traceBuilder && writer.writeLn(item.region + " " + item.block.bdo + " " + item.region.entryState);
        });
        traceBuilder && writer.leave("}");
      }

      traceBuilder && writer.writeLn("Done");

      var stop;
      if (this.stopPoints.length > 1) {
        var stopRegion = new Region(null);
        var stopValuePhi = new Phi(stopRegion, null);
        var stopStorePhi = new Phi(stopRegion, null);
        this.stopPoints.forEach(function (stopPoint) {
          stopRegion.predecessors.push(stopPoint.region);
          stopValuePhi.pushValue(stopPoint.value);
          stopStorePhi.pushValue(stopPoint.store);
        });
        stop = new Stop(stopRegion, stopStorePhi, stopValuePhi);
      } else {
        stop = new Stop(this.stopPoints[0].region, this.stopPoints[0].store, this.stopPoints[0].value);
      }

      return new IR.DFG(stop);
    }


    buildBlock(region: Region, block: Bytecode, state: State) {
      release || assert (region && block && state);
      state.optimize();
      var typeState = block.verifierEntryState;
      if (typeState) {
        this.traceBuilder && writer.writeLn("Type State: " + typeState);
        for (var i = 0; i < typeState.local.length; i++) {
          var type = typeState.local[i];
          var local = state.local[i];
          if (local.ty) {
            // release || assert (type.isSubtypeOf(local.ty), local + " " + local.ty + " !== " + type + " " + type.merge(local.ty));
          } else {
            local.ty = type;
          }
        }
      }

      var blockBuilder = new BlockBuilder(this, region, block, state);
      blockBuilder.build();

      var stops = blockBuilder.stops;
      if (!stops) {
        stops = [];
        if (blockBuilder.bc.position + 1 <= this.bytecodes.length) {
          stops.push({
            control: region,
            target: this.bytecodes[blockBuilder.bc.position + 1],
            state: state
          });
        }
      }

      return stops;
    }

    static buildMethod(verifier: Verifier.Verifier, methodInfo: MethodInfo, scope: Scope, hasDynamicScope: boolean) {
      release || assert (scope);
      release || assert (methodInfo.analysis);
      release || assert (!methodInfo.hasExceptions());

      counter.count("Compiler: Compiled Methods");

      enterTimeline("Compiler");
      enterTimeline("Mark Loops");
      methodInfo.analysis.markLoops();
      leaveTimeline();


      if (Shumway.AVM2.Verifier.enabled.value) {
        // TODO: Can we verify even if |hadDynamicScope| is |true|?
        enterTimeline("Verify");
        verifier.verifyMethod(methodInfo, scope);
        leaveTimeline();
      }

      var traceSource = Shumway.AVM2.Compiler.traceLevel.value > 0;
      var traceIR = Shumway.AVM2.Compiler.traceLevel.value > 1;

      enterTimeline("Build IR");
      Node.startNumbering();
      var dfg = new Builder(methodInfo, scope, hasDynamicScope).buildGraph();
      leaveTimeline();

      traceIR && dfg.trace(writer);

      enterTimeline("Build CFG");
      var cfg = dfg.buildCFG();
      leaveTimeline();

      enterTimeline("Optimize Phis");
      cfg.optimizePhis();
      leaveTimeline();

      enterTimeline("Schedule Nodes");
      cfg.scheduleEarly();
      leaveTimeline();

      traceIR && cfg.trace(writer);

      enterTimeline("Verify IR");
      cfg.verify();
      leaveTimeline();

      enterTimeline("Allocate Variables");
      cfg.allocateVariables();
      leaveTimeline();

      enterTimeline("Generate Source");
      var result = Shumway.AVM2.Compiler.Backend.generate(cfg);
      leaveTimeline();
      traceSource && writer.writeLn(result.body);
      Node.stopNumbering();
      leaveTimeline();

      return result;
    }
  }

  var verifier = new Shumway.AVM2.Verifier.Verifier();
  export function compileMethod(methodInfo: MethodInfo, scope: Scope, hasDynamicScope) {
    return Builder.buildMethod(verifier, methodInfo, scope, hasDynamicScope);
  }
}
