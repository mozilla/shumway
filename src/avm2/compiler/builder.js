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

var c4Options = systemOptions.register(new OptionSet("C4 Options"));
var enableC4 = c4Options.register(new Option("c4", "c4", "boolean", false, "Enable the C4 compiler."));
var c4TraceLevel = c4Options.register(new Option("tc4", "tc4", "number", 0, "Compiler Trace Level"));

/**
 * Helper functions used by the compiler.
 */
var getPublicQualifiedName = Multiname.getPublicQualifiedName;
var createName = function createName(namespaces, name) {
  if (isNumeric(name) || isObject(name)) {
    return name;
  }
  return new Multiname(namespaces, name);
};

(function (exports) {

  var Node = IR.Node;
  var Start = IR.Start;
  var Null = IR.Null;
  var Undefined = IR.Undefined;
  var This = IR.This;
  var Projection = IR.Projection;
  var Region = IR.Region;
  var Binary = IR.Binary;
  var Unary = IR.Unary;
  var Constant = IR.Constant;
  var Call = IR.Call;
  var Phi = IR.Phi;
  var Stop = IR.Stop;
  var Operator = IR.Operator;
  var Parameter = IR.Parameter;
  var NewArray = IR.NewArray;
  var NewObject = IR.NewObject;
  var KeyValuePair = IR.KeyValuePair;
  var isConstant = IR.isConstant;

  var DFG = IR.DFG;
  var CFG = IR.CFG;

  var writer = new IndentingWriter();

  var State = (function() {
    var nextID = 0;
    function constructor(index) {
      this.id = nextID += 1;
      this.index = index;
      this.local = [];
      this.stack = [];
      this.scope = [];
      this.store = Undefined;
      this.loads = [];
      this.saved = Undefined;
    }
    constructor.prototype.clone = function clone(index) {
      var s = new State();
      s.index = index !== undefined ? index : this.index;
      s.local = this.local.slice(0);
      s.stack = this.stack.slice(0);
      s.scope = this.scope.slice(0);
      s.loads = this.loads.slice(0);
      s.saved = this.saved;
      s.store = this.store;
      return s;
    };
    constructor.prototype.matches = function matches(other) {
      return this.stack.length === other.stack.length &&
             this.scope.length === other.scope.length &&
             this.local.length === other.local.length;
    };
    constructor.prototype.makeLoopPhis = function makeLoopPhis(control) {
      var s = new State();
      assert (control);
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
    };
    constructor.prototype.optimize = function optimize() {
      function optimize(x) {
        if (x instanceof Phi && !x.isLoop) {
          var args = x.arguments.unique();
          if (args.length === 1) {
            x.seal();
            Counter.count("Builder: OptimizedPhi");
            return args[0];
          }
        }
        return x;
      }
      this.local = this.local.map(optimize);
      this.stack = this.stack.map(optimize);
      this.scope = this.scope.map(optimize);
      this.saved = optimize(this.saved);
      this.store = optimize(this.store);
    };

    function mergeValue(control, a, b) {
      var phi = a instanceof Phi && a.control === control ? a : new Phi(control, a);
      phi.pushValue(b);
      return phi;
    }

    function mergeValues(control, a, b) {
      for (var i = 0; i < a.length; i++) {
        a[i] = mergeValue(control, a[i], b[i]);
      }
    }

    constructor.prototype.merge = function merge(control, other) {
      assert (control);
      assert (this.matches(other), this, " !== ", other);
      mergeValues(control, this.local, other.local);
      mergeValues(control, this.stack, other.stack);
      mergeValues(control, this.scope, other.scope);
      this.store = mergeValue(control, this.store, other.store);
      this.store.abstract = true;
    };

    constructor.prototype.trace = function trace(writer) {
      writer.writeLn(this.toString());
    };
    function toBriefString(x) {
      if (x instanceof Node) {
        return x.toString(true);
      }
      return x;
    }
    constructor.prototype.toString = function () {
      return "<" + String(this.id + " @ " + this.index).padRight(' ', 10) +
        (" M: " + toBriefString(this.store)).padRight(' ', 14) +
        (" X: " + toBriefString(this.saved)).padRight(' ', 14) +
        (" $: " + this.scope.map(toBriefString).join(", ")).padRight(' ', 20) +
        (" L: " + this.local.map(toBriefString).join(", ")).padRight(' ', 40) +
        (" S: " + this.stack.map(toBriefString).join(", ")).padRight(' ', 60);
    };
    return constructor;
  })();

  function isNumericConstant(node) {
    return node instanceof Constant && isNumeric(node.value);
  }

  function isStringConstant(node) {
    return node instanceof Constant && isString(node.value);
  }

  function isMultinameConstant(node) {
    return node instanceof Constant && node.value instanceof Multiname;
  }

  function hasNumericType(node) {
    if (isNumericConstant(node)) {
      return true;
    }
    return node.ty && node.ty.isNumeric();
  }

  function typesAreEqual(a, b) {
    if (hasNumericType(a) && hasNumericType(b) ||
        hasStringType(a) && hasStringType(b)) {
      return true;
    }
    return false;
  }

  function hasStringType(node) {
    if (isStringConstant(node)) {
      return true;
    }
    return node.ty && node.ty.isString();
  }

  function constant(value) {
    return new Constant(value);
  }

  function qualifiedNameConstant(name) {
    return constant(Multiname.getQualifiedName(name));
  }

  function getJSPropertyWithState(state, object, path) {
    assert (isString(path));
    var names = path.split(".");
    var node = object;
    for (var i = 0; i < names.length; i++) {
      node = new IR.GetProperty(null, state.store, node, constant(names[i]));
      node.shouldFloat = true;
      state.loads.push(node);
    }
    return node;
  }

  function globalProperty(name) {
    var node = new IR.GlobalProperty(name);
    node.mustFloat = true;
    return node;
  }

  function warn(message) {
    console.warn(message);
  }

  var Builder = (function () {
    function builder(methodInfo, scope, hasDynamicScope) {
      assert (methodInfo && methodInfo.abc && scope);
      this.abc = methodInfo.abc;
      this.scope = scope;
      this.methodInfo = methodInfo;
      this.hasDynamicScope = hasDynamicScope;
      this.peepholeOptimizer = new IR.PeepholeOptimizer();
    }

    builder.prototype.buildStart = function (start) {
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
        state.local.push(new Parameter(start, parameterIndexOffset + i, PARAMETER_PREFIX + mi.parameters[i].name));
      }

      /* Wipe out the method's remaining locals. */
      for (var i = parameterCount; i < mi.localCount; i++) {
        state.local.push(Undefined);
      }

      state.store = new Projection(start, Projection.Type.STORE);
      if (this.hasDynamicScope) {
        start.scope = new Parameter(start, 0, SAVED_SCOPE_NAME);
      } else {
        start.scope = new Constant(this.scope);
      }
      state.saved = new Projection(start, Projection.Type.SCOPE);
      start.domain = new Constant(this.domain);

      var args = new IR.Arguments(start);

      if (mi.needsRest() || mi.needsArguments()) {
        var offset = constant(parameterIndexOffset + (mi.needsRest() ? parameterCount : 0));
        state.local[parameterCount + 1] =
          new Call(start, state.store, globalProperty("sliceArguments"), null, [args, offset], true);
      }

      var argumentsLength = getJSPropertyWithState(state, args, "length");

      for (var i = 0; i < parameterCount; i++) {
        var parameter = mi.parameters[i];
        var index = i + 1;
        var local = state.local[index];
        if (parameter.value !== undefined) {
          var condition = new IR.Binary(Operator.LT, argumentsLength, constant(parameterIndexOffset + i + 1));
          local = new IR.Latch(null, condition, constant(parameter.value), local);
        }
        if (parameter.type && !parameter.type.isAnyName()) {
          var coercer = this.coercers[Multiname.getQualifiedName(parameter.type)];
          if (coercer) {
            local = coercer(local);
          } else {
            var type = this.abc.domain.getProperty(parameter.type, true, false);
            if (type && COERCE_PARAMETERS) {
              local = new Call(start, state.store, globalProperty("coerce"), null, [local, constant(type)], true);
            } else {
              // unexpected();
            }
          }
        }
        state.local[index] = local;
      }

      return start;
    };

    builder.prototype.buildGraph = function buildGraph(callerRegion, callerState, inlineArguments) {
      var analysis = this.methodInfo.analysis;
      var blocks = analysis.blocks;
      var bytecodes = analysis.bytecodes;
      var methodInfo = this.methodInfo;
      var peepholeOptimizer = this.peepholeOptimizer;

      var ints = this.abc.constantPool.ints;
      var uints = this.abc.constantPool.uints;
      var doubles = this.abc.constantPool.doubles;
      var strings = this.abc.constantPool.strings;
      var methods = this.abc.methods;
      var classes = this.abc.classes;
      var multinames = this.abc.constantPool.multinames;
      var domain = new Constant(this.abc.domain);

      var traceBuilder = c4TraceLevel.value > 2;

      function unary(operator, argument) {
        var node = new Unary(operator, argument);
        if (peepholeOptimizer) {
          node = peepholeOptimizer.tryFold(node);
        }
        return node;
      }

      function binary(operator, left, right) {
        var node = new Binary(operator, left, right);
        if (left.ty && left.ty === right.ty) {
          if (operator === Operator.EQ) {
            node.operator = Operator.SEQ;
          } else if (operator === Operator.NE) {
            node.operator = Operator.SNE;
          }
        }
        if (peepholeOptimizer) {
          node = peepholeOptimizer.tryFold(node);
        }
        return node;
      }

      function toInt32(value) {
        return binary(Operator.OR, value, constant(0));
      }

      function toUInt32(value) {
        return binary(Operator.URSH, value, constant(0));
      }

      function toNumber(value) {
        return unary(Operator.PLUS, value);
      }

      function toDouble(value) {
        if (hasNumericType(value)) {
          return value;
        }
        return toNumber(value);
      }

      function toBoolean(value) {
        return unary(Operator.FALSE, unary(Operator.FALSE, value));
      }

      function convertString(value) {
        return binary(Operator.ADD, constant(""), value);
      }

      function getPublicQualifiedName(value) {
        assert (isConstant(value));
        if (isNumericConstant(value)) {
          return value;
        } else if (isStringConstant(value) || value === Null || value === Undefined) {
          return binary(Operator.ADD, constant(Multiname.PUBLIC_QUALIFIED_NAME_PREFIX), value);
        }
        unexpected();
      }

      function coerceString(value) {
        return new Call(null, start.entryState.store, globalProperty("coerceString"), null, [value], true);
      }

      assert(!this.coercers);

      var coercers = this.coercers = createEmptyObject();

      coercers[Multiname.Int] = toInt32;
      coercers[Multiname.Uint] = toUInt32;
      coercers[Multiname.Number] = toNumber;
      coercers[Multiname.Boolean] = toBoolean;
      coercers[Multiname.String] = coerceString;

      function getCoercerForType(type) {
        switch (type) {
          case Type.Int:
            return toInt32;
          case Type.Uint:
            return toUInt32;
          case Type.Number:
            return toNumber;
          case Type.Boolean:
            return toBoolean;
          case Type.String:
            return coerceString;
        }
      }

      var regions = [];

      var stopPoints = [];

      for (var i = 0; i < blocks.length; i++) {
        blocks[i].blockDominatorOrder = i;
      }

      var worklist = new SortedList(function compare(a, b) {
        return a.block.blockDominatorOrder - b.block.blockDominatorOrder;
      });

      var start = new Start();
      this.buildStart(start);

      var createFunctionCallee = globalProperty("createFunction");

      worklist.push({region: start, block: blocks[0]});

      var next;
      while ((next = worklist.pop())) {
        buildBlock(next.region, next.block, next.region.entryState.clone()).forEach(function (stop) {
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
          traceBuilder && writer.writeLn(item.region + " " + item.block.bdo + " " + item.region.entryState);
        });
        traceBuilder && writer.leave("}");
      }

      traceBuilder && writer.writeLn("Done");

      function buildBlock(region, block, state) {
        assert (region && block && state);
        state.optimize();
        var typeState = block.entryState;
        if (typeState) {
          traceBuilder && writer.writeLn("Type State: " + typeState);
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

        var local = state.local;
        var stack = state.stack;
        var scope = state.scope;

        function savedScope() {
          return state.saved;
        }

        function topScope(depth) {
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
          assert (x instanceof IR.Node);
          if (bc.ti) {
            if (x.ty) {
              // assert (x.ty == bc.ti.type);
            } else {
              x.ty = bc.ti.type;
            }
          }
          stack.push(x);
        }

        function shouldNotFloat(node) {
          node.shouldNotFloat = true;
          return node;
        }

        function shouldFloat(node) {
          assert (!(node instanceof IR.GetProperty), "Cannot float node : " + node);
          node.shouldFloat = true;
          return node;
        }

        function mustFloat(node) {
          node.mustFloat = true;
          return node;
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

        function buildMultiname(index) {
          var multiname = multinames[index];
          var namespaces, name, flags = multiname.flags;
          if (multiname.isRuntimeName()) {
            name = stack.pop();
          } else {
            name = constant(multiname.name);
          }
          if (multiname.isRuntimeNamespace()) {
            namespaces = shouldFloat(new NewArray(region, [pop()]));
          } else {
            namespaces = constant(multiname.namespaces);
          }
          return new IR.AVM2Multiname(namespaces, name, flags);
        }

        function buildMultiname2(index) {
          var multiname = multinames[index];
          if (multiname.isRuntime()) {
            var namespaces = new Constant(multiname.namespaces);
            var name = new Constant(multiname.name);
            if (multiname.isRuntimeName()) {
              name = pop();
              if (hasNumericType(name)) {
                return name;
              }
            }
            if (multiname.isRuntimeNamespace()) {
              // assert (false, "Is |namespaces| an array or not?");
              namespaces = pop();
            }
            return new IR.AVM2Multiname(new Constant(multiname), namespaces, name);
          } else {
            return new Constant(multiname);
          }
        }

        function simplifyName(name) {
          if (isMultinameConstant(name) && Multiname.isQName(name.value)) {
            return constant(Multiname.getQualifiedName(name.value));
          }
          return name;
        }

        function findProperty(multiname, strict, ti) {
          var slowPath = new IR.AVM2FindProperty(region, state.store, topScope(), multiname, domain, strict);
          if (ti) {
            if (ti.object) {
              if (ti.object instanceof Global && !ti.object.isExecuting()) {
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

        function getDomainProperty(name) {
          if (isMultinameConstant(name)) {
            var value = domain.value.getProperty(name.value, true, true);
            if (value) {
              return constant(value);
            }
          }
          return getProperty(findProperty(name, true), name);
        }

        function coerceValue(value, multiname) {
          var type = domain.value.getProperty(multiname, true, true);
          if (!type) {
            warn("This is because the type is not available yet, we need to fix this by using ClassInfo's for types.");
            return value;
          }
          if (isConstant(value)) {
            return constant(coerce(value.value, type));
          } else {
            var coercer = coercers[Multiname.getQualifiedName(multiname)];
            if (coercer) {
              return coercer(value);
            }
          }
          if (COERCE) {
            return call(globalProperty("coerce"), null, [value, constant(type)]);
          }
          return value;
        }

        function getScopeObject(scope) {
          if (scope instanceof IR.AVM2Scope) {
            return scope.object;
          }
          return getJSProperty(scope, "object");
        }

        /**
         * Marks the |node| as the active store node, with dependencies on all loads appearing after the
         * previous active store node.
         */
        function store(node) {
          state.store = new Projection(node, Projection.Type.STORE);
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

        function callProperty(object, multiname, args, isLex, ti, ic) {
          // name = simplifyName(name);
          if (ti && ti.trait) {
            if (ti.trait.isMethod()) {
              var openQn;
              if (ti.trait.holder instanceof InstanceInfo &&
                  ti.trait.holder.isInterface()) {
                openQn = Multiname.getPublicQualifiedName(Multiname.getName(ti.trait.name))
              } else {
                openQn = Multiname.getQualifiedName(ti.trait.name);
              }
              openQn = VM_OPEN_METHOD_PREFIX + openQn;
              return store(new IR.CallProperty(region, state.store, object, constant(openQn), args, true));
            } else if (ti.trait.isClass()) {
              var qn = Multiname.getQualifiedName(ti.trait.name);
              switch (qn) {
                case Multiname.Int:
                  return toInt32(args[0]);
                case Multiname.Uint:
                  return toUInt32(args[0]);
                case Multiname.Boolean:
                  return toBoolean(args[0]);
                case Multiname.Number:
                  return toNumber(args[0]);
                case Multiname.String:
                  return convertString(args[0]);
              }
              return store(new IR.CallProperty(region, state.store, object, constant(qn), args, false));
            }
          } else if (ti && ti.propertyQName) {
            return store(new IR.CallProperty(region, state.store, object, constant(ti.propertyQName), args, true));
          }
          if (isConstant(multiname)) {
            assert (ic);
            return store(new IR.AVM2CallProperty(region, state.store, object, multiname, isLex, args, true, constant(ic)));
          } else {
            warn("Can't optimize call to " + multiname.value);
            return store(new IR.AVM2CallProperty(region, state.store, object, multiname, isLex, args, true));
          }
        }

        function getProperty(object, multiname, ti, getOpenMethod, ic) {
          assert (multiname instanceof IR.AVM2Multiname);
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
            }
          }
          return store(new IR.AVM2GetProperty(region, state.store, object, multiname, false, getOpenMethod));
        }

        function setProperty(object, multiname, value, ti, ic) {
          assert (multiname instanceof IR.AVM2Multiname);
          if (ti) {
            if (ti.trait) {
              store(new IR.SetProperty(region, state.store, object, qualifiedNameConstant(ti.trait.name), value));
              return;
            }
            if (ti.propertyQName) {
              return store(new IR.SetProperty(region, state.store, object, constant(ti.propertyQName), value));
            } else if (ti.isDirectlyWriteable) {
              return store(new IR.SetProperty(region, state.store, object, multiname.name, value));
            } else if (ti.isDirectlyWriteableWithCoercion) {
              var coercer = getCoercerForType(ti.targetType);
              if (coercer) {
                value = coercer(value);
                return store(new IR.SetProperty(region, state.store, object, multiname.name, value));
              }
            }
          }
          return store(new IR.AVM2SetProperty(region, state.store, object, multiname, value, false));
        }

        function getDescendants(object, name, ti) {
          name = simplifyName(name);
          return new IR.AVM2GetDescendants(region, state.store, object, name);
        }

        function getSlot(object, index, ti) {
          if (ti) {
            var trait = ti.trait;
            if (trait) {
              if (trait.isConst()) {
                return constant(trait.value);
              }
              var slotQn = Multiname.getQualifiedName(trait.name);
              return store(new IR.GetProperty(region, state.store, object, constant(slotQn)));
            }
          }
          return store(new IR.AVM2GetSlot(null, state.store, object, index));
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
          store(new IR.AVM2SetSlot(region, state.store, object, index, value));
        }

        function call(callee, object, args) {
          return store(new Call(region, state.store, callee, object, args, true));
        }

        function callPure(callee, object, args) {
          return new Call(null, null, callee, object, args, true);
        }

        function callCall(callee, object, args, pristine) {
          return store(new Call(region, state.store, callee, object, args, pristine));
        }

        function truthyCondition(operator) {
          var right;
          if (operator.isBinary()) {
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
            node = peepholeOptimizer.tryFold(node, true);
          }
          return node;
        }

        function negatedTruthyCondition(operator) {
          var node = unary(Operator.FALSE, truthyCondition(operator));
          if (peepholeOptimizer) {
            node = peepholeOptimizer.tryFold(node, true);
          }
          return node;
        }

        function pushExpression(operator, toInt) {
          var left, right;
          if (operator.isBinary()) {
            right = pop();
            left = pop();
            if (toInt) {
              right = toInt32(right);
              left = toInt32(left);
            }
            push(binary(operator, left, right));
          } else {
            left = pop();
            if (toInt) {
              left = toInt32(left);
            }
            push(unary(operator, left));
          }
        }

        var stops = null;

        function buildIfStops(predicate) {
          assert (!stops);
          var _if = new IR.If(region, predicate);
          stops = [{
            control: new Projection(_if, Projection.Type.FALSE),
            target: bytecodes[bc.position + 1],
            state: state
          }, {
            control: new Projection(_if, Projection.Type.TRUE),
            target: bc.target,
            state: state
          }];
        }

        function buildJumpStop() {
          assert (!stops);
          stops = [{
            control: region,
            target: bc.target,
            state: state
          }];
        }

        function buildThrowStop() {
          assert (!stops);
          stops = [];
        }

        function buildReturnStop() {
          assert (!stops);
          stops = [];
        }

        function buildSwitchStops(determinant) {
          assert (!stops);
          if (bc.targets.length > 2) {
            stops = [];
            var _switch = new IR.Switch(region, determinant);
            for (var i = 0; i < bc.targets.length; i++) {
              stops.push({
                control: new Projection(_switch, Projection.Type.CASE, constant(i)),
                target: bc.targets[i],
                state: state
              });
            }
          } else {
            assert (bc.targets.length === 2);
            var predicate = binary(Operator.SEQ, determinant, constant(0));
            var _if = new IR.If(region, predicate);
            stops = [{
              control: new Projection(_if, Projection.Type.FALSE),
              target: bc.targets[1],
              state: state
            }, {
              control: new Projection(_if, Projection.Type.TRUE),
              target: bc.targets[0],
              state: state
            }];
          }
        }

        if (traceBuilder) {
          writer.writeLn("Processing Region: " + region + ", Block: " + block.bid);
          writer.enter(("> state: " + region.entryState.toString()).padRight(' ', 100));
        }

        region.processed = true;

        var bc;
        for (var bci = block.position, end = block.end.position; bci <= end; bci++) {
          bc = bytecodes[bci];
          var op = bc.op;
          state.index = bci;
          switch (op) {
            case OP_throw:
              store(new IR.Throw(region, pop()));
              stopPoints.push({
                region: region,
                store: state.store,
                value: Undefined
              });
              buildThrowStop();
              break;
            case OP_getlocal:
              pushLocal(bc.index);
              break;
            case OP_getlocal0:
            case OP_getlocal1:
            case OP_getlocal2:
            case OP_getlocal3:
              pushLocal(op - OP_getlocal0);
              break;
            case OP_setlocal:
              popLocal(bc.index);
              break;
            case OP_setlocal0:
            case OP_setlocal1:
            case OP_setlocal2:
            case OP_setlocal3:
              popLocal(op - OP_setlocal0);
              break;
            case OP_pushwith:
              scope.push(new IR.AVM2Scope(topScope(), pop(), true));
              break;
            case OP_pushscope:
              scope.push(new IR.AVM2Scope(topScope(), pop(), false));
              break;
            case OP_popscope:
              scope.pop();
              break;
            case OP_getglobalscope:
              push(new IR.AVM2Global(null, topScope()));
              break;
            case OP_getscopeobject:
              push(getScopeObject(state.scope[bc.index]));
              break;
            case OP_findpropstrict:
              push(findProperty(buildMultiname(bc.index), true, bc.ti));
              break;
            case OP_findproperty:
              push(findProperty(buildMultiname(bc.index), false, bc.ti));
              break;
            case OP_getproperty:
              multiname = buildMultiname(bc.index);
              object = pop();
              push(getProperty(object, multiname, bc.ti, false, ic(bc)));
              break;
            case OP_getdescendants:
              multiname = buildMultiname(bc.index);
              object = pop();
              push(getDescendants(object, multiname, bc.ti));
              break;
            case OP_getlex:
              multiname = buildMultiname(bc.index);
              push(getProperty(findProperty(multiname, true, bc.ti), multiname, bc.ti, false, ic(bc)));
              break;
            case OP_initproperty:
            case OP_setproperty:
              value = pop();
              multiname = buildMultiname(bc.index);
              object = pop();
              setProperty(object, multiname, value, bc.ti, ic(bc));
              break;
            case OP_deleteproperty:
              multiname = buildMultiname(bc.index);
              object = pop();
              push(store(new IR.AVM2DeleteProperty(region, state.store, object, multiname)));
              break;
            case OP_getslot:
              object = pop();
              push(getSlot(object, constant(bc.index), bc.ti));
              break;
            case OP_setslot:
              value = pop();
              object = pop();
              setSlot(object, constant(bc.index), value, bc.ti);
              break;
            case OP_getsuper:
              multiname = buildMultiname(bc.index);
              object = pop();
              push(call(globalProperty("getSuper"), null, [savedScope(), object, multiname]));
              break;
            case OP_setsuper:
              value = pop();
              multiname = buildMultiname(bc.index);
              object = pop();
              store(call(globalProperty("setSuper"), null, [savedScope(), object, multiname, value]));
              break;
            case OP_debugfile:
            case OP_debugline:
              break;
            case OP_newfunction:
              push(callPure(createFunctionCallee, null, [constant(methods[bc.index]), topScope(), constant(true)]));
              break;
            case OP_call:
              args = popMany(bc.argCount);
              object = pop();
              callee = pop();
              push(callCall(callee, object, args));
              break;
            case OP_callproperty:
            case OP_callpropvoid:
            case OP_callproplex:
              args = popMany(bc.argCount);
              multiname = buildMultiname(bc.index);
              object = pop();
              value = callProperty(object, multiname, args, op === OP_callproplex, bc.ti, ic(bc));
              if (op !== OP_callpropvoid) {
                push(value);
              }
              break;
            case OP_callsuper:
            case OP_callsupervoid:
              multiname = buildMultiname(bc.index);
              args = popMany(bc.argCount);
              object = pop();
              callee = call(globalProperty("getSuper"), null, [savedScope(), object, multiname]);
              value = call(callee, object, args);
              if (op !== OP_callsupervoid) {
                push(value);
              }
              break;
            case OP_construct:
              args = popMany(bc.argCount);
              object = pop();
              push(store(new IR.AVM2New(region, state.store, object, args)));
              break;
            case OP_constructsuper:
              args = popMany(bc.argCount);
              object = pop();
              if (!(bc.ti && bc.ti.noCallSuperNeeded)) {
                callee = getJSProperty(savedScope(), "object.baseClass.instanceConstructorNoInitialize");
                call(callee, object, args);
              }
              break;
            case OP_constructprop:
              args = popMany(bc.argCount);
              multiname = buildMultiname(bc.index);
              object = pop();
              callee = getProperty(object, multiname, bc.ti, false, ic(bc));
              push(store(new IR.AVM2New(region, state.store, callee, args)));
              break;
            case OP_coerce:
              if (bc.ti && bc.ti.noCoercionNeeded) {
                Counter.count("Compiler: NoCoercionNeeded");
                break;
              } else {
                Counter.count("Compiler: CoercionNeeded");
              }
              value = pop();
              push(coerceValue(value, multinames[bc.index]));
              break;
            case OP_coerce_i: case OP_convert_i:
              push(toInt32(pop()));
              break;
            case OP_coerce_u: case OP_convert_u:
              push(toUInt32(pop()));
              break;
            case OP_coerce_d: case OP_convert_d:
              push(toDouble(pop()));
              break;
            case OP_coerce_b: case OP_convert_b:
              push(toBoolean(pop()));
              break;
            case OP_checkfilter:
              push(call(globalProperty("checkFilter"), null, [pop()]));
              break;
            case OP_coerce_a:       /* NOP */ break;
            case OP_coerce_s:
              push(coerceString(pop()));
              break;
            case OP_convert_s:
              push(convertString(pop()));
              break;
            case OP_astypelate:
              type = pop();
              value = pop();
              push(call(globalProperty("asInstance"), null, [value, type]));
              break;
            case OP_returnvalue:
            case OP_returnvoid:
              value = op === OP_returnvalue ? pop() : Undefined;
              stopPoints.push({
                region: region,
                store: state.store,
                value: value
              });
              buildReturnStop();
              break;
            case OP_nextname:
            case OP_nextvalue:
              index = pop();
              object = pop();
              push(call(globalProperty(op === OP_nextname ? "nextName" : "nextValue"), null, [object, index]));
              break;
            case OP_hasnext2:
              var temp = call(globalProperty("hasNext2"), null, [local[bc.object], local[bc.index]]);
              local[bc.object] = getJSProperty(temp, "object");
              push(local[bc.index] = getJSProperty(temp, "index"));
              break;
            case OP_pushnull:       push(Null); break;
            case OP_pushundefined:  push(Undefined); break;
            case OP_pushfloat:      notImplemented(); break;
            case OP_pushbyte:       push(constant(bc.value)); break;
            case OP_pushshort:      push(constant(bc.value)); break;
            case OP_pushstring:     push(constant(strings[bc.index])); break;
            case OP_pushint:        push(constant(ints[bc.index])); break;
            case OP_pushuint:       push(constant(uints[bc.index])); break;
            case OP_pushdouble:     push(constant(doubles[bc.index])); break;
            case OP_pushtrue:       push(constant(true)); break;
            case OP_pushfalse:      push(constant(false)); break;
            case OP_pushnan:        push(constant(NaN)); break;
            case OP_pop:            pop(); break;
            case OP_dup:            value = shouldNotFloat(pop()); push(value); push(value); break;
            case OP_swap:           state.stack.push(pop(), pop()); break;
            case OP_debug:
            case OP_debugline:
            case OP_debugfile:
              break;
            case OP_ifnlt:          buildIfStops(negatedTruthyCondition(Operator.LT)); break;
            case OP_ifge:           buildIfStops(truthyCondition(Operator.GE)); break;
            case OP_ifnle:          buildIfStops(negatedTruthyCondition(Operator.LE)); break;
            case OP_ifgt:           buildIfStops(truthyCondition(Operator.GT)); break;
            case OP_ifngt:          buildIfStops(negatedTruthyCondition(Operator.GT)); break;
            case OP_ifle:           buildIfStops(truthyCondition(Operator.LE)); break;
            case OP_ifnge:          buildIfStops(negatedTruthyCondition(Operator.GE)); break;
            case OP_iflt:           buildIfStops(truthyCondition(Operator.LT)); break;
            case OP_jump:           buildJumpStop(); break;
            case OP_iftrue:         buildIfStops(truthyCondition(Operator.TRUE)); break;
            case OP_iffalse:        buildIfStops(truthyCondition(Operator.FALSE)); break;
            case OP_ifeq:           buildIfStops(truthyCondition(Operator.EQ)); break;
            case OP_ifne:           buildIfStops(truthyCondition(Operator.NE)); break;
            case OP_ifstricteq:     buildIfStops(truthyCondition(Operator.SEQ)); break;
            case OP_ifstrictne:     buildIfStops(truthyCondition(Operator.SNE)); break;
            case OP_lookupswitch:   buildSwitchStops(pop()); break;
            case OP_not:            pushExpression(Operator.FALSE); break;
            case OP_bitnot:         pushExpression(Operator.BITWISE_NOT); break;
            case OP_add:
              right = pop();
              left = pop();
              if (typesAreEqual(left, right)) {
                operator = Operator.ADD;
              } else if (compatibility) {
                operator = Operator.AVM2ADD;
              } else {
                operator = Operator.ADD;
              }
              push(binary(operator, left, right));
              break;
            case OP_add_i:          pushExpression(Operator.ADD, true); break;
            case OP_subtract:       pushExpression(Operator.SUB); break;
            case OP_subtract_i:     pushExpression(Operator.SUB, true); break;
            case OP_multiply:       pushExpression(Operator.MUL); break;
            case OP_multiply_i:     pushExpression(Operator.MUL, true); break;
            case OP_divide:         pushExpression(Operator.DIV); break;
            case OP_modulo:         pushExpression(Operator.MOD); break;
            case OP_lshift:         pushExpression(Operator.LSH); break;
            case OP_rshift:         pushExpression(Operator.RSH); break;
            case OP_urshift:        pushExpression(Operator.URSH); break;
            case OP_bitand:         pushExpression(Operator.AND); break;
            case OP_bitor:          pushExpression(Operator.OR); break;
            case OP_bitxor:         pushExpression(Operator.XOR); break;
            case OP_equals:         pushExpression(Operator.EQ); break;
            case OP_strictequals:   pushExpression(Operator.SEQ); break;
            case OP_lessthan:       pushExpression(Operator.LT); break;
            case OP_lessequals:     pushExpression(Operator.LE); break;
            case OP_greaterthan:    pushExpression(Operator.GT); break;
            case OP_greaterequals:  pushExpression(Operator.GE); break;
            case OP_negate:         pushExpression(Operator.NEG); break;
            case OP_negate_i:       pushExpression(Operator.NEG, true); break;
            case OP_increment:  case OP_increment_i:
            case OP_decrement:  case OP_decrement_i:
              push(constant(1));
              if (op === OP_increment || op === OP_decrement) {
                push(toNumber(pop()));
              } else {
                push(toInt32(pop()));
              }
              if (op === OP_increment || op === OP_increment_i) {
                pushExpression(Operator.ADD);
              } else {
                pushExpression(Operator.SUB);
              }
              break;
            case OP_inclocal: case OP_inclocal_i:
            case OP_declocal: case OP_declocal_i:
              push(constant(1));
              if (op === OP_inclocal || op === OP_declocal) {
                push(toNumber(local[bc.index]));
              } else {
                push(toInt32(local[bc.index]));
              }
              if (op === OP_inclocal || op === OP_inclocal_i) {
                pushExpression(Operator.ADD);
              } else {
                pushExpression(Operator.SUB);
              }
              popLocal(bc.index);
              break;
            case OP_instanceof:
              type = pop();
              value = pop();
              push(call(getJSProperty(type, "isInstanceOf"), null, [value]));
              break;
            case OP_istype:
              value = pop();
              multiname = buildMultiname(bc.index);
              type = getProperty(findProperty(multiname, false), multiname);
              push(call(globalProperty("isInstance"), null, [value, type]));
              break;
            case OP_istypelate:
              type = pop();
              value = pop();
              push(call(globalProperty("isInstance"), null, [value, type]));
              break;
            case OP_in:
              object = pop();
              value = pop();
              multiname = new IR.AVM2Multiname(Undefined, value, 0);
              push(store(new IR.AVM2HasProperty(region, state.store, object, multiname)));
              break;
            case OP_typeof:
              push(call(globalProperty("typeOf"), null, [pop()]));
              break;
            case OP_kill:
              push(Undefined);
              popLocal(bc.index);
              break;
            case OP_applytype:
              args = popMany(bc.argCount);
              type = pop();
              callee = globalProperty("applyType");
              push(call(callee, null, [domain, type, new NewArray(region, args)]));
              break;
            case OP_newarray:
              args = popMany(bc.argCount);
              push(new NewArray(region, args));
              break;
            case OP_newobject:
              var properties = [];
              for (var i = 0; i < bc.argCount; i++) {
                var value = pop();
                var key = pop();
                assert (isConstant(key) && isString(key.value));
                key = constant(Multiname.getPublicQualifiedName(key.value));
                properties.push(new KeyValuePair(key, value));
              }
              push(new NewObject(region, properties));
              break;
            case OP_newactivation:
              push(new IR.AVM2NewActivation(constant(methodInfo)));
              break;
            case OP_newclass:
              callee = globalProperty("createClass");
              push(call(callee, null, [constant(classes[bc.index]), pop(), topScope()]));
              break;
            default:
              unexpected("Not Implemented: " + bc);
          }

          if (op === OP_debug || op === OP_debugfile || op === OP_debugline) {
            continue;
          }
          if (traceBuilder) {
            writer.writeLn(("state: " + state.toString()).padRight(' ', 100) + " : " + bci + ", " + bc.toString(this.abc));
          }
        }
        if (traceBuilder) {
          writer.leave(("< state: " + state.toString()).padRight(' ', 100));
        }

        if (!stops) {
          stops = [];
          if (bc.position + 1 <= bytecodes.length) {
            stops.push({
              control: region,
              target: bytecodes[bc.position + 1],
              state: state
            });
          }
        }

        return stops;
      }

      var stop;
      if (stopPoints.length > 1) {
        var stopRegion = new Region();
        var stopValuePhi = new Phi(stopRegion);
        var stopStorePhi = new Phi(stopRegion);
        stopPoints.forEach(function (stopPoint) {
          stopRegion.predecessors.push(stopPoint.region);
          stopValuePhi.pushValue(stopPoint.value);
          stopStorePhi.pushValue(stopPoint.store);
        });
        stop = new Stop(stopRegion, stopStorePhi, stopValuePhi);
      } else {
        stop = new Stop(stopPoints[0].region, stopPoints[0].store, stopPoints[0].value);
      }

      return new DFG(stop);
    }
    return builder;
  })();

  function buildMethod(verifier, methodInfo, scope, hasDynamicScope) {
    release || assert (scope);
    release || assert (methodInfo.analysis);
    release || assert (!methodInfo.hasExceptions());

    Counter.count("Compiler: Compiled Methods");

    Timer.start("Compiler");

    methodInfo.analysis.markLoops();

    if (enableVerifier.value) {
      // TODO: Can we verify even if |hadDynamicScope| is |true|?
      Timer.start("ver");
      verifier.verifyMethod(methodInfo, scope);
      Timer.stop();
    }

    var traceSource = c4TraceLevel.value > 0;
    var traceIR = c4TraceLevel.value > 1;

    Timer.start("IR Builder");
    Node.startNumbering();
    var dfg = new Builder(methodInfo, scope, hasDynamicScope).buildGraph();
    Timer.stop();

    traceIR && dfg.trace(writer);

    Timer.start("IR CFG");
    var cfg = dfg.buildCFG();
    Timer.stop();

    Timer.start("IR OPTIMIZE PHIs");
    cfg.optimizePhis();
    Timer.stop();

    Timer.start("IR SCHEDULE");
    cfg.scheduleEarly();
    Timer.stop();

    // traceIR && dfg.trace(writer);

    traceIR && cfg.trace(writer);

    cfg.verify();

    Timer.start("IR ALLOCATE VARIABLES");
    cfg.allocateVariables();
    Timer.stop();

    var src = Backend.generate(cfg);
    traceSource && writer.writeLn(src);
    Node.stopNumbering();
    Timer.stop();

    return src;
  }

  exports.buildMethod = buildMethod;

})(typeof exports === "undefined" ? (Builder = {}) : exports);

/**
 * The compiler is a singleton.
 */
var Compiler = new ((function () {
  function constructor() {
    this.verifier = new Verifier();
  }
  constructor.prototype.compileMethod = function (methodInfo, scope, hasDynamicScope) {
    return Builder.buildMethod(this.verifier, methodInfo, scope, hasDynamicScope);
  };
  return constructor;
})());
