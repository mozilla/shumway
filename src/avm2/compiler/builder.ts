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
  import popManyIntoVoid = Shumway.ArrayUtilities.popManyIntoVoid;
  import unique = Shumway.ArrayUtilities.unique;
  import Scope = Shumway.AVM2.Runtime.Scope;
  import createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;
  import asCoerceByMultiname = Shumway.AVM2.Runtime.asCoerceByMultiname;
  import GlobalMultinameResolver = Shumway.AVM2.Runtime.GlobalMultinameResolver;

  import Node = IR.Node;
  import Control = IR.Control;
  import Value = IR.Value;
  import Start = IR.Start;
  import Region = IR.Region;
  import Null = IR.Null;
  import Undefined = IR.Undefined;
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
  import Block = IR.Block;
  import isConstant = IR.isConstant;


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

    makeLoopPhis(control: Control) {
      var s = new State();
      release || assert (control);
      function makePhi(x) {
        var phi = new Phi(control, x);
        phi.isLoop = true;
        return phi;
      }
      s.index = this.index;
      s.local = this.local.map(makePhi);
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
          Counter.count("Builder: OptimizedPhi");
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

  function globalProperty(name: string) {
    var node = new IR.GlobalProperty(name);
    node.mustFloat = true;
    return node;
  }

  function warn(message) {
    // console.warn(message);
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
    block: Block;
  }

  /**
   * All the state needed when building blocks.
   */
  class BlockState {
    bc: Bytecode;
    stops: any [];
    constructor(public region: Region, public state: State) {

    }
  }

  class Builder {
    abc: AbcFile;
    scope: Scope;
    domain: Constant;
    methodInfo: MethodInfo;
    hasDynamicScope: boolean;
    traceBuilder: boolean;
    constantPool: ConstantPool;
    createFunctionCallee: Value;
    bytecodes: Bytecode [];
    stopPoints: any [];
    blockState: BlockState;
    constructor(methodInfo, scope, hasDynamicScope) {
      release || assert (methodInfo && methodInfo.abc && scope);
      this.abc = methodInfo.abc;
      this.domain = new Constant(methodInfo.abc.applicationDomain);
      this.scope = scope;
      this.methodInfo = methodInfo;
      this.hasDynamicScope = hasDynamicScope;
      this.traceBuilder = Shumway.AVM2.Compiler.traceLevel.value > 2;
      this.constantPool = this.abc.constantPool;
      this.createFunctionCallee = globalProperty("createFunction");
      this.bytecodes = this.methodInfo.analysis.bytecodes;
      this.stopPoints = [];
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
        blocks[i].blockDominatorOrder = i;
      }

      var worklist = new Shumway.SortedList<WorklistItem>(function compare(a: WorklistItem, b: WorklistItem) {
        return a.block.blockDominatorOrder - b.block.blockDominatorOrder;
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
            if (target.loop) {
              traceBuilder && writer.writeLn("Adding PHIs to loop region.");
            }
            region.entryState = target.loop ? stop.state.makeLoopPhis(region) : stop.state.clone(target.position);
            traceBuilder && writer.writeLn("Adding new region: " + region + " @ " + target.position + " to worklist.");
            worklist.push({region: region, block: target});
          }
        });

        traceBuilder && writer.enter("Worklist: {");
        worklist.forEach(function (item) {
          traceBuilder && writer.writeLn(item.region + " " + item.block.blockDominatorOrder + " " + item.region.entryState);
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

    buildMultiname(region: Region, state: State, index: number) {
      var multiname = this.constantPool.multinames[index];
      var namespaces, name, flags = multiname.flags;
      if (multiname.isRuntimeName()) {
        name = state.stack.pop();
      } else {
        name = constant(multiname.name);
      }
      if (multiname.isRuntimeNamespace()) {
        namespaces = shouldFloat(new NewArray(region, [state.stack.pop()]));
      } else {
        namespaces = constant(multiname.namespaces);
      }
      return new IR.ASMultiname(namespaces, name, flags);
    }

    buildIfStops(predicate) {
      var blockState = this.blockState;
      release || assert (!blockState.stops);
      var _if = new IR.If(blockState.region, predicate);
      blockState.stops = [{
        control: new Projection(_if, ProjectionType.FALSE),
        target: this.bytecodes[blockState.bc.position + 1],
        state: blockState.state
      }, {
        control: new Projection(_if, ProjectionType.TRUE),
        target: blockState.bc.target,
        state: blockState.state
      }];
    }

    buildJumpStop() {
      var blockState = this.blockState;
      release || assert (!blockState.stops);
      blockState.stops = [{
        control: blockState.region,
        target: blockState.bc.target,
        state: blockState.state
      }];
    }

    buildThrowStop() {
      var blockState = this.blockState;
      release || assert (!blockState.stops);
      blockState.stops = [];
    }

    buildReturnStop() {
      var blockState = this.blockState;
      release || assert (!blockState.stops);
      blockState.stops = [];
    }

    buildSwitchStops(determinant) {
      var blockState = this.blockState;
      release || assert (!blockState.stops);
      if (blockState.bc.targets.length > 2) {
        blockState.stops = [];
        var _switch = new IR.Switch(blockState.region, determinant);
        for (var i = 0; i < blockState.bc.targets.length; i++) {
          blockState.stops.push({
            control: new Projection(_switch, ProjectionType.CASE, constant(i)),
            target: blockState.bc.targets[i],
            state: blockState.state
          });
        }
      } else {
        release || assert (blockState.bc.targets.length === 2);
        var predicate = binary(Operator.SEQ, determinant, constant(0));
        var _if = new IR.If(blockState.region, predicate);
        blockState.stops = [{
          control: new Projection(_if, ProjectionType.FALSE),
          target: blockState.bc.targets[1],
          state: blockState.state
        }, {
          control: new Projection(_if, ProjectionType.TRUE),
          target: blockState.bc.targets[0],
          state: blockState.state
        }];
      }
    }

    buildBlock(region: Region, block, state) {
      release || assert (region && block && state);
      state.optimize();
      var typeState = block.entryState;
      if (typeState) {
        this.traceBuilder && writer.writeLn("Type State: " + typeState);
        for (var i = 0; i < typeState.local.length; i++) {
          var type = typeState.local[i];
          var local = state.local[i];
          if (local.ty) {
            // assert (type.isSubtypeOf(local.ty), local + " " + local.ty + " !== " + type + " " + type.merge(local.ty));
          } else {
            local.ty = type;
          }
        }
      }

      this.blockState = new BlockState(region, state);

      var local = state.local;
      var stack = state.stack;
      var scope = state.scope;
      var domain = this.domain;

      var bytecodes = this.bytecodes;

      function savedScope() {
        return state.saved;
      }

      function topScope(depth?: number) {
        if (depth !== undefined) {
          if (depth < scope.length) {
            return scope[scope.length - 1 - depth];
          } else if (depth === scope.length) {
            return savedScope();
          } else {
            var s = savedScope();
            var savedScopeDepth = depth - scope.length;
            for (var i = 0; i < savedScopeDepth; i ++) {
              s = getJSProperty(s, "parent");
            }
            return s;
          }
        }
        if (scope.length > 0) {
          return scope.top();
        }
        return savedScope();
      }

      var object, receiver, index, callee, value, multiname, type, args, pristine, left, right, operator;

      function push(x) {
        release || assert (x instanceof IR.Node);
        if (bc.ti) {
          if (x.ty) {
            // assert (x.ty == bc.ti.type);
          } else {
            x.ty = bc.ti.type;
          }
        }
        stack.push(x);
      }

      function pop() {
        return stack.pop();
      }

      function popMany(count) {
        return stack.popMany(count);
      }

      function pushLocal(index) {
        push(local[index]);
      }

      function popLocal(index) {
        local[index] = shouldNotFloat(pop());
      }

      function simplifyName(name) {
        if (isMultinameConstant(name) && Multiname.isQName(name.value)) {
          return constant(Multiname.getQualifiedName(name.value));
        }
        return name;
      }

      function getGlobalScope(ti): Value {
        if (ti && ti.object) {
          return constant(ti.object);
        }
        return new IR.ASGlobal(null, savedScope());
      }

      function findProperty(multiname, strict, ti?) {
        var slowPath = new IR.ASFindProperty(region, state.store, topScope(), multiname, domain, strict);
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
            return getScopeObject(topScope(ti.scopeDepth));
          }
        }
        warn("Can't optimize findProperty " + multiname);
        return slowPath;
      }

      function getJSProperty(object, path) {
        return getJSPropertyWithState(state, object, path);
      }

      function coerce(multiname, value) {
        // TODO: Try to do the coercion of constant values without causing classes to be
        // loaded, as is the case when calling |asCoerceByMultiname|.
        if (false && isConstant(value)) {
          return constant(asCoerceByMultiname(domain.value, multiname, value.value));
        } else {
          var coercer = getCoercerForType(multiname);
          if (coercer) {
            return coercer(value);
          }
        }
        if (emitCoerceNonPrimitive) {
          return call(globalProperty("asCoerceByMultiname"), null, [domain, constant(multiname), value]);
        }
        return value;
      }

      function getScopeObject(scope) {
        if (scope instanceof IR.ASScope) {
          return scope.object;
        }
        return getJSProperty(scope, "object");
      }

      /**
       * Marks the |node| as the active store node, with dependencies on all loads appearing after the
       * previous active store node.
       */
      function store(node) {
        state.store = new Projection(node, ProjectionType.STORE);
        node.loads = state.loads.slice(0);
        state.loads.length = 0;
        return node;
      }

      /**
       * Keeps track of the current set of loads.
       */
      function load(node) {
        state.loads.push(node);
        return node;
      }

      function resolveMultinameGlobally(multiname): Multiname {
        var namespaces = multiname.namespaces;
        var name = multiname.name;
        if (!Shumway.AVM2.Runtime.globalMultinameAnalysis.value) {
          return;
        }
        if (!isConstant(namespaces) || !isConstant(name) || multiname.isAttribute()) {
          Counter.count("GlobalMultinameResolver: Cannot resolve runtime multiname or attribute.");
          return;
        }
        if (isNumeric(name.value) || !isString(name.value) || !name.value) {
          Counter.count("GlobalMultinameResolver: Cannot resolve numeric or any names.");
          return;
        }
        return GlobalMultinameResolver.resolveMultiname(new Multiname(namespaces.value, name.value, multiname.flags));
      }

      function callSuper(scope, object, multiname, args, ti) {
        if (ti && ti.trait && ti.trait.isMethod() && ti.baseClass) {
          var qn = VM_OPEN_METHOD_PREFIX + Multiname.getQualifiedName(ti.trait.name);
          var callee = getJSProperty(constant(ti.baseClass), "traitsPrototype." + qn);
          return call(callee, object, args);
        }
        return store(new IR.ASCallSuper(region, state.store, object, multiname, args, IR.Flags.PRISTINE, scope));
      }

      function getSuper(scope, object, multiname, ti) {
        if (ti && ti.trait && ti.trait.isGetter() && ti.baseClass) {
          var qn = VM_OPEN_GET_METHOD_PREFIX + Multiname.getQualifiedName(ti.trait.name);
          var callee = getJSProperty(constant(ti.baseClass), "traitsPrototype." + qn);
          return call(callee, object, []);
        }
        return store(new IR.ASGetSuper(region, state.store, object, multiname, scope));
      }

      function setSuper(scope, object, multiname, value, ti) {
        if (ti && ti.trait && ti.trait.isSetter() && ti.baseClass) {
          var qn = VM_OPEN_SET_METHOD_PREFIX + Multiname.getQualifiedName(ti.trait.name);
          var callee = getJSProperty(constant(ti.baseClass), "traitsPrototype." + qn);
          return call(callee, object, [value]);
        }
        return store(new IR.ASSetSuper(region, state.store, object, multiname, value, scope));
      }

      function constructSuper(scope, object, args, ti) {
        if (ti) {
          if (ti.noCallSuperNeeded) {
            return;
          } else if (ti.baseClass) {
            var callee = getJSProperty(constant(ti.baseClass), "instanceConstructorNoInitialize");
            call(callee, object, args);
            return;
          }
        }
        callee = getJSProperty(scope, "object.baseClass.instanceConstructorNoInitialize");
        call(callee, object, args);
        return;
      }

      function callProperty(object, multiname, args, isLex, ti) {
        if (ti && ti.trait) {
          if (ti.trait.isMethod()) {
            var openQn;
            if (ti.trait.holder instanceof InstanceInfo &&
              ti.trait.holder.isInterface()) {
              openQn = Multiname.getPublicQualifiedName(Multiname.getName(ti.trait.name));
            } else {
              openQn = Multiname.getQualifiedName(ti.trait.name);
            }
            openQn = VM_OPEN_METHOD_PREFIX + openQn;
            return store(new IR.CallProperty(region, state.store, object, constant(openQn), args, IR.Flags.PRISTINE));
          } else if (ti.trait.isClass()) {
            var constructor = getCallableConstructorForType(ti.trait.name);
            if (constructor) {
              return constructor(args[0]);
            }
            var qn = Multiname.getQualifiedName(ti.trait.name);
            return store(new IR.CallProperty(region, state.store, object, constant(qn), args, IR.Flags.AS_CALL));
          }
        } else if (ti && ti.propertyQName) {
          return store(new IR.CallProperty(region, state.store, object, constant(ti.propertyQName), args, IR.Flags.PRISTINE));
        }
        var mn = resolveMultinameGlobally(multiname);
        if (mn) {
          return store(new IR.ASCallProperty(region, state.store, object, constant(Multiname.getQualifiedName(mn)), args, IR.Flags.PRISTINE | IR.Flags.RESOLVED, isLex));
        }
        return store(new IR.ASCallProperty(region, state.store, object, multiname, args, IR.Flags.PRISTINE, isLex));
      }

      function getProperty(object, multiname, ti?, getOpenMethod?) {
        release || assert (multiname instanceof IR.ASMultiname);
        getOpenMethod = !!getOpenMethod;
        if (ti) {
          if (ti.trait) {
            if (ti.trait.isConst() && ti.trait.hasDefaultValue) {
              return constant(ti.trait.value);
            }
            var get = new IR.GetProperty(region, state.store, object, qualifiedNameConstant(ti.trait.name));
            return ti.trait.isGetter() ? store(get) : load(get);
          }
          if (ti.propertyQName) {
            return store(new IR.GetProperty(region, state.store, object, constant(ti.propertyQName)));
          } else if (ti.isDirectlyReadable) {
            return store(new IR.GetProperty(region, state.store, object, multiname.name));
          } else if (ti.isIndexedReadable) {
            return store(new IR.ASGetProperty(region, state.store, object, multiname, IR.Flags.INDEXED | (getOpenMethod ? IR.Flags.IS_METHOD : 0)));
          }
        }
        warn("Can't optimize getProperty " + multiname);
        var qn = resolveMultinameGlobally(multiname);
        if (qn) {
          return store(new IR.ASGetProperty(region, state.store, object, constant(Multiname.getQualifiedName(qn)), IR.Flags.RESOLVED | (getOpenMethod ? IR.Flags.IS_METHOD : 0)));
        }
        Counter.count("Compiler: Slow ASGetProperty");
        return store(new IR.ASGetProperty(region, state.store, object, multiname, (getOpenMethod ? IR.Flags.IS_METHOD : 0)));
      }

      function setProperty(object, multiname, value, ti) {
        release || assert (multiname instanceof IR.ASMultiname);
        if (ti) {
          if (ti.trait) {
            var coercer = ti.trait.typeName ? getCoercerForType(ti.trait.typeName) : null;
            if (coercer) {
              value = coercer(value);
            }
            store(new IR.SetProperty(region, state.store, object, qualifiedNameConstant(ti.trait.name), value));
            return;
          }
          if (ti.propertyQName) {
            return store(new IR.SetProperty(region, state.store, object, constant(ti.propertyQName), value));
          } else if (ti.isDirectlyWriteable) {
            return store(new IR.SetProperty(region, state.store, object, multiname.name, value));
          } else if (ti.isIndexedWriteable) {
            return store(new IR.ASSetProperty(region, state.store, object, multiname, value, IR.Flags.INDEXED));
          }
        }
        warn("Can't optimize setProperty " + multiname);
        var qn = resolveMultinameGlobally(multiname);
        if (qn) {
          // TODO: return store(new IR.SetProperty(region, state.store, object, constant(Multiname.getQualifiedName(qn)), value));
        }
        return store(new IR.ASSetProperty(region, state.store, object, multiname, value, 0));
      }

      function getDescendants(object, name, ti) {
        name = simplifyName(name);
        return new IR.ASGetDescendants(region, state.store, object, name);
      }

      function getSlot(object, index, ti) {
        if (ti) {
          var trait = ti.trait;
          if (trait) {
            if (trait.isConst() && ti.trait.hasDefaultValue) {
              return constant(trait.value);
            }
            var slotQn = Multiname.getQualifiedName(trait.name);
            return store(new IR.GetProperty(region, state.store, object, constant(slotQn)));
          }
        }
        warn("Can't optimize getSlot " + index);
        return store(new IR.ASGetSlot(null, state.store, object, index));
      }

      function setSlot(object, index, value, ti) {
        if (ti) {
          var trait = ti.trait;
          if (trait) {
            var slotQn = Multiname.getQualifiedName(trait.name);
            store(new IR.SetProperty(region, state.store, object, constant(slotQn), value));
            return;
          }
        }
        warn("Can't optimize setSlot " + index);
        store(new IR.ASSetSlot(region, state.store, object, index, value));
      }

      function call(callee: Value, object: Value, args: Value []) {
        return store(new Call(region, state.store, callee, object, args, IR.Flags.PRISTINE));
      }

      function callCall(callee: Value, object: Value, args: Value []) {
        return store(new Call(region, state.store, callee, object, args, IR.Flags.AS_CALL));
      }

      function truthyCondition(operator: IR.Operator) {
        var right;
        if (operator.isBinary) {
          right = pop();
        }
        var left = pop();
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

      function negatedTruthyCondition(operator) {
        var node = unary(Operator.FALSE, truthyCondition(operator));
        if (peepholeOptimizer) {
          node = peepholeOptimizer.fold(node, true);
        }
        return node;
      }

      function pushExpression(operator, toInt?) {
        var left, right;
        if (operator.isBinary) {
          right = pop();
          left = pop();
          if (toInt) {
            right = coerceInt(right);
            left = coerceInt(left);
          }
          push(binary(operator, left, right));
        } else {
          left = pop();
          if (toInt) {
            left = coerceInt(left);
          }
          push(unary(operator, left));
        }
      }

      this.blockState.stops = null;

      if (this.traceBuilder) {
        writer.writeLn("Processing Region: " + region + ", Block: " + block.bid);
        writer.enter(("> state: " + region.entryState.toString()).padRight(' ', 100));
      }

      var bc;
      for (var bci = block.position, end = block.end.position; bci <= end; bci++) {
        this.blockState.bc = bc = bytecodes[bci];
        var op = bc.op;
        state.index = bci;
        switch (op) {
          case OP.throw:
            store(new IR.Throw(region, pop()));
            this.stopPoints.push({
              region: region,
              store: state.store,
              value: Undefined
            });
            this.buildThrowStop();
            break;
          case OP.getlocal:
            pushLocal(bc.index);
            break;
          case OP.getlocal0:
          case OP.getlocal1:
          case OP.getlocal2:
          case OP.getlocal3:
            pushLocal(op - OP.getlocal0);
            break;
          case OP.setlocal:
            popLocal(bc.index);
            break;
          case OP.setlocal0:
          case OP.setlocal1:
          case OP.setlocal2:
          case OP.setlocal3:
            popLocal(op - OP.setlocal0);
            break;
          case OP.pushwith:
            scope.push(new IR.ASScope(topScope(), pop(), true));
            break;
          case OP.pushscope:
            scope.push(new IR.ASScope(topScope(), pop(), false));
            break;
          case OP.popscope:
            scope.pop();
            break;
          case OP.getglobalscope:
            push(getGlobalScope(bc.ti));
            break;
          case OP.getscopeobject:
            push(getScopeObject(state.scope[bc.index]));
            break;
          case OP.findpropstrict:
            push(findProperty(this.buildMultiname(region, state, bc.index), true, bc.ti));
            break;
          case OP.findproperty:
            push(findProperty(this.buildMultiname(region, state, bc.index), false, bc.ti));
            break;
          case OP.getproperty:
            multiname = this.buildMultiname(region, state, bc.index);
            object = pop();
            push(getProperty(object, multiname, bc.ti, false));
            break;
          case OP.getdescendants:
            multiname = this.buildMultiname(region, state, bc.index);
            object = pop();
            push(getDescendants(object, multiname, bc.ti));
            break;
          case OP.getlex:
            multiname = this.buildMultiname(region, state, bc.index);
            push(getProperty(findProperty(multiname, true, bc.ti), multiname, bc.ti, false));
            break;
          case OP.initproperty:
          case OP.setproperty:
            value = pop();
            multiname = this.buildMultiname(region, state, bc.index);
            object = pop();
            setProperty(object, multiname, value, bc.ti);
            break;
          case OP.deleteproperty:
            multiname = this.buildMultiname(region, state, bc.index);
            object = pop();
            push(store(new IR.ASDeleteProperty(region, state.store, object, multiname)));
            break;
          case OP.getslot:
            object = pop();
            push(getSlot(object, constant(bc.index), bc.ti));
            break;
          case OP.setslot:
            value = pop();
            object = pop();
            setSlot(object, constant(bc.index), value, bc.ti);
            break;
          case OP.getsuper:
            multiname = this.buildMultiname(region, state, bc.index);
            object = pop();
            push(getSuper(savedScope(), object, multiname, bc.ti));
            break;
          case OP.setsuper:
            value = pop();
            multiname = this.buildMultiname(region, state, bc.index);
            object = pop();
            setSuper(savedScope(), object, multiname, value, bc.ti);
            break;
          case OP.debugfile:
          case OP.debugline:
            break;
          case OP.newfunction:
            push(callPure(this.createFunctionCallee, null, [constant(this.abc.methods[bc.index]), topScope(), constant(true)]));
            break;
          case OP.call:
            args = popMany(bc.argCount);
            object = pop();
            callee = pop();
            push(callCall(callee, object, args));
            break;
          case OP.callproperty:
          case OP.callpropvoid:
          case OP.callproplex:
            args = popMany(bc.argCount);
            multiname = this.buildMultiname(region, state, bc.index);
            object = pop();
            value = callProperty(object, multiname, args, op === OP.callproplex, bc.ti);
            if (op !== OP.callpropvoid) {
              push(value);
            }
            break;
          case OP.callsuper:
          case OP.callsupervoid:
            multiname = this.buildMultiname(region, state, bc.index);
            args = popMany(bc.argCount);
            object = pop();
            value = callSuper(savedScope(), object, multiname, args, bc.ti);
            if (op !== OP.callsupervoid) {
              push(value);
            }
            break;
          case OP.construct:
            args = popMany(bc.argCount);
            object = pop();
            push(store(new IR.ASNew(region, state.store, object, args)));
            break;
          case OP.constructsuper:
            args = popMany(bc.argCount);
            object = pop();
            constructSuper(savedScope(), object, args, bc.ti);
            break;
          case OP.constructprop:
            args = popMany(bc.argCount);
            multiname = this.buildMultiname(region, state, bc.index);
            object = pop();
            callee = getProperty(object, multiname, bc.ti, false);
            push(store(new IR.ASNew(region, state.store, callee, args)));
            break;
          case OP.coerce:
            if (bc.ti && bc.ti.noCoercionNeeded) {
              Counter.count("Compiler: NoCoercionNeeded");
              break;
            } else {
              Counter.count("Compiler: CoercionNeeded");
            }
            value = pop();
            push(coerce(this.constantPool.multinames[bc.index], value));
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
            push(call(globalProperty("checkFilter"), null, [pop()]));
            break;
          case OP.coerce_a:
            /* NOP */ break;
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
              push(call(globalProperty("asAsType"), null, [type, value]));
            }
            break;
          case OP.returnvalue:
          case OP.returnvoid:
            value = Undefined;
            if (op === OP.returnvalue) {
              value = pop();
              if (this.methodInfo.returnType) {
                if (!(bc.ti && bc.ti.noCoercionNeeded)) {
                  value = coerce(this.methodInfo.returnType, value);
                }
              }
            }
            this.stopPoints.push({
              region: region,
              store: state.store,
              value: value
            });
            this.buildReturnStop();
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
            var temp = call(globalProperty("asHasNext2"), null, [local[bc.object], local[bc.index]]);
            local[bc.object] = getJSProperty(temp, "object");
            push(local[bc.index] = getJSProperty(temp, "index"));
            break;
          case OP.pushnull:
            push(Null);
            break;
          case OP.pushundefined:
            push(Undefined);
            break;
          case OP.pushfloat:
            notImplemented(String(bc));
            break;
          case OP.pushbyte:
            push(constant(bc.value));
            break;
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
          case OP.pushtrue:
            push(constant(true));
            break;
          case OP.pushfalse:
            push(constant(false));
            break;
          case OP.pushnan:
            push(constant(NaN));
            break;
          case OP.pop:
            pop(); break;
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
          case OP.ifnlt:
            this.buildIfStops(negatedTruthyCondition(Operator.LT));
            break;
          case OP.ifge:
            this.buildIfStops(truthyCondition(Operator.GE));
            break;
          case OP.ifnle:
            this.buildIfStops(negatedTruthyCondition(Operator.LE));
            break;
          case OP.ifgt:
            this.buildIfStops(truthyCondition(Operator.GT));
            break;
          case OP.ifngt:
            this.buildIfStops(negatedTruthyCondition(Operator.GT));
            break;
          case OP.ifle:
            this.buildIfStops(truthyCondition(Operator.LE));
            break;
          case OP.ifnge:
            this.buildIfStops(negatedTruthyCondition(Operator.GE));
            break;
          case OP.iflt:
            this.buildIfStops(truthyCondition(Operator.LT));
            break;
          case OP.jump:
            this.buildJumpStop();
            break;
          case OP.iftrue:
            this.buildIfStops(truthyCondition(Operator.TRUE));
            break;
          case OP.iffalse:
            this.buildIfStops(truthyCondition(Operator.FALSE));
            break;
          case OP.ifeq:
            this.buildIfStops(truthyCondition(Operator.EQ));
            break;
          case OP.ifne:
            this.buildIfStops(truthyCondition(Operator.NE));
            break;
          case OP.ifstricteq:
            this.buildIfStops(truthyCondition(Operator.SEQ));
            break;
          case OP.ifstrictne:
            this.buildIfStops(truthyCondition(Operator.SNE));
            break;
          case OP.lookupswitch:
            this.buildSwitchStops(pop());
            break;
          case OP.not:
            pushExpression(Operator.FALSE);
            break;
          case OP.bitnot:
            pushExpression(Operator.BITWISE_NOT);
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
          case OP.add_i:
            pushExpression(Operator.ADD, true);
            break;
          case OP.subtract:
            pushExpression(Operator.SUB);
            break;
          case OP.subtract_i:
            pushExpression(Operator.SUB, true);
            break;
          case OP.multiply:
            pushExpression(Operator.MUL);
            break;
          case OP.multiply_i:
            pushExpression(Operator.MUL, true);
            break;
          case OP.divide:
            pushExpression(Operator.DIV);
            break;
          case OP.modulo:
            pushExpression(Operator.MOD);
            break;
          case OP.lshift:
            pushExpression(Operator.LSH);
            break;
          case OP.rshift:
            pushExpression(Operator.RSH);
            break;
          case OP.urshift:
            pushExpression(Operator.URSH);
            break;
          case OP.bitand:
            pushExpression(Operator.AND);
            break;
          case OP.bitor:
            pushExpression(Operator.OR);
            break;
          case OP.bitxor:
            pushExpression(Operator.XOR);
            break;
          case OP.equals:
            pushExpression(Operator.EQ);
            break;
          case OP.strictequals:
            pushExpression(Operator.SEQ);
            break;
          case OP.lessthan:
            pushExpression(Operator.LT);
            break;
          case OP.lessequals:
            pushExpression(Operator.LE);
            break;
          case OP.greaterthan:
            pushExpression(Operator.GT);
            break;
          case OP.greaterequals:
            pushExpression(Operator.GE);
            break;
          case OP.negate:
            pushExpression(Operator.NEG);
            break;
          case OP.negate_i:
            pushExpression(Operator.NEG, true);
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
              pushExpression(Operator.ADD);
            } else {
              pushExpression(Operator.SUB);
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
              pushExpression(Operator.ADD);
            } else {
              pushExpression(Operator.SUB);
            }
            popLocal(bc.index);
            break;
          case OP.instanceof:
            type = pop();
            value = pop();
            push(call(getJSProperty(type, "isInstanceOf"), null, [value]));
            break;
          case OP.istype:
            value = pop();
            multiname = this.buildMultiname(region, state, bc.index);
            type = getProperty(findProperty(multiname, false), multiname);
            push(call(globalProperty("asIsType"), null, [type, value]));
            break;
          case OP.istypelate:
            type = pop();
            value = pop();
            push(call(globalProperty("asIsType"), null, [type, value]));
            break;
          case OP.in:
            object = pop();
            value = pop();
            multiname = new IR.ASMultiname(Undefined, value, 0);
            push(store(new IR.ASHasProperty(region, state.store, object, multiname)));
            break;
          case OP.typeof:
            push(call(globalProperty("asTypeOf"), null, [pop()]));
            break;
          case OP.kill:
            push(Undefined);
            popLocal(bc.index);
            break;
          case OP.applytype:
            args = popMany(bc.argCount);
            type = pop();
            callee = globalProperty("applyType");
            push(call(callee, null, [domain, type, new NewArray(region, args)]));
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
              release || assert (isConstant(key) && isString(key.value));
              key = constant(Multiname.getPublicQualifiedName(key.value));
              properties.push(new KeyValuePair(key, value));
            }
            push(new NewObject(region, properties));
            break;
          case OP.newactivation:
            push(new IR.ASNewActivation(constant(this.methodInfo)));
            break;
          case OP.newclass:
            callee = globalProperty("createClass");
            push(call(callee, null, [constant(this.abc.classes[bc.index]), pop(), topScope()]));
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

      var stops = this.blockState.stops;
      if (!stops) {
        stops = [];
        if (bc.position + 1 <= bytecodes.length) {
          stops.push({
            control: region,
            target: this.bytecodes[bc.position + 1],
            state: state
          });
        }
      }

      return stops;
    }

    static buildMethod(verifier, methodInfo, scope, hasDynamicScope) {
      release || assert (scope);
      release || assert (methodInfo.analysis);
      release || assert (!methodInfo.hasExceptions());

      Counter.count("Compiler: Compiled Methods");

      Timer.start("Compiler");
      Timer.start("Mark Loops");
      methodInfo.analysis.markLoops();
      Timer.stop();


      if (Shumway.AVM2.Verifier.enabled.value) {
        // TODO: Can we verify even if |hadDynamicScope| is |true|?
        Timer.start("Verify");
        verifier.verifyMethod(methodInfo, scope);
        Timer.stop();
      }

      var traceSource = Shumway.AVM2.Compiler.traceLevel.value > 0;
      var traceIR = Shumway.AVM2.Compiler.traceLevel.value > 1;

      Timer.start("Build IR");
      Node.startNumbering();
      var dfg = new Builder(methodInfo, scope, hasDynamicScope).buildGraph();
      Timer.stop();

      traceIR && dfg.trace(writer);

      Timer.start("Build CFG");
      var cfg = dfg.buildCFG();
      Timer.stop();

      Timer.start("Optimize Phis");
      cfg.optimizePhis();
      Timer.stop();

      Timer.start("Schedule Nodes");
      cfg.scheduleEarly();
      Timer.stop();

      // traceIR && dfg.trace(writer);

      traceIR && cfg.trace(writer);

      Timer.start("Verify IR");
      cfg.verify();
      Timer.stop();

      Timer.start("Allocate Variables");
      cfg.allocateVariables();
      Timer.stop();

      Timer.start("Generate Source");
      var result = Shumway.AVM2.Compiler.Backend.generate(cfg);
      Timer.stop();
      traceSource && writer.writeLn(result.body);
      Node.stopNumbering();
      Timer.stop();

      return result;
    }
  }

  var verifier = new Shumway.AVM2.Verifier.Verifier();
  export function compileMethod(methodInfo: MethodInfo, scope: Scope, hasDynamicScope) {
    return Builder.buildMethod(verifier, methodInfo, scope, hasDynamicScope);
  }
}
