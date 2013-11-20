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
var enableRegisterAllocator = c4Options.register(new Option("ra", "ra", "boolean", false, "Enable register allocator."));

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
  var peepholeOptimizer = new IR.PeepholeOptimizer();

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
    };
    constructor.prototype.optimize = function optimize() {
      function optimize(x) {
        if (x instanceof Phi && !x.isLoop) {
          var args = x.args.unique();
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
      release || assert (control);
      release || assert (this.matches(other), this, " !== ", other);
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

  function globalProperty(name) {
    var node = new IR.GlobalProperty(name);
    node.mustFloat = true;
    return node;
  }

  function info(message) {
    console.info(message);
  }

  function unary(operator, argument) {
    var node = new Unary(operator, argument);
    if (peepholeOptimizer) {
      node = peepholeOptimizer.tryFold(node);
    }
    return node;
  }

  function binary(operator, left, right) {
    var node = new Binary(operator, left, right);
    if (left.ty && left.ty !== Type.Any && left.ty === right.ty) {
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

  function coerceInt(value) {
    return binary(Operator.OR, value, constant(0));
  }

  function coerceUint(value) {
    return binary(Operator.URSH, value, constant(0));
  }

  function coerceNumber(value) {
    if (hasNumericType(value)) {
      return value;
    }
    return unary(Operator.PLUS, value);
  }

  function coerceBoolean(value) {
    return unary(Operator.FALSE, unary(Operator.FALSE, value));
  }

  function shouldNotFloat(node) {
    node.shouldNotFloat = true;
    return node;
  }

  function shouldFloat(node) {
    release || assert (!(node instanceof IR.GetProperty), "Cannot float node : " + node);
    node.shouldFloat = true;
    return node;
  }

  function mustFloat(node) {
    node.mustFloat = true;
    return node;
  }

  function callPure(callee, object, args) {
    return new Call(null, null, callee, object, args, IR.Flags.PRISTINE);
  }

  function callGlobalProperty(name, value) {
    return callPure(globalProperty(name), null, [value]);
  }

  function convertString(value) {
    if (isStringConstant(value)) {
      return value;
    }
    return callPure(globalProperty("String"), null, [value]);
  }

  var coerceString = callGlobalProperty.bind(null, "asCoerceString");
  var coerceObject = callGlobalProperty.bind(null, "asCoerceObject");

  var coercers = createEmptyObject();
  coercers[Multiname.Int] = coerceInt;
  coercers[Multiname.Uint] = coerceUint;
  coercers[Multiname.Number] = coerceNumber;
  coercers[Multiname.String] = coerceString;
  coercers[Multiname.Object] = coerceObject;
  coercers[Multiname.Boolean] = coerceBoolean;

  function getCoercerForType(multiname) {
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

  function getCallableConstructorForType(multiname) {
    release || assert (multiname instanceof Multiname);
    return callableConstructors[Multiname.getQualifiedName(multiname)];
  }

  var Builder = (function () {
    function builder(methodInfo, scope, hasDynamicScope) {
      release || assert (methodInfo && methodInfo.abc && scope);
      this.abc = methodInfo.abc;
      this.scope = scope;
      this.methodInfo = methodInfo;
      this.hasDynamicScope = hasDynamicScope;
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
          new Call(start, state.store, globalProperty("sliceArguments"), null, [args, offset], IR.Flags.PRISTINE);
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
          var coercer = getCoercerForType(parameter.type);
          if (coercer) {
            local = coercer(local);
          } else if (c4CoerceNonPrimitiveParameters) {
            local = new Call(start, state.store, globalProperty("asCoerceByMultiname"), null, [constant(this.abc.applicationDomain), constant(parameter.type), local], true);
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

      var ints = this.abc.constantPool.ints;
      var uints = this.abc.constantPool.uints;
      var doubles = this.abc.constantPool.doubles;
      var strings = this.abc.constantPool.strings;
      var methods = this.abc.methods;
      var classes = this.abc.classes;
      var multinames = this.abc.constantPool.multinames;
      var domain = new Constant(this.abc.applicationDomain);

      var traceBuilder = c4TraceLevel.value > 2;

      var stopPoints = [];

      for (var i = 0; i < blocks.length; i++) {
        blocks[i].blockDominatorOrder = i;
      }

      var worklist = new SortedList(function compare(a, b) {
        return a.block.blockDominatorOrder - b.block.blockDominatorOrder;
      });

      var start = new Start(null);
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
        release || assert (region && block && state);
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
          return new IR.ASMultiname(namespaces, name, flags);
        }

        function simplifyName(name) {
          if (isMultinameConstant(name) && Multiname.isQName(name.value)) {
            return constant(Multiname.getQualifiedName(name.value));
          }
          return name;
        }

        function findProperty(multiname, strict, ti) {
          var slowPath = new IR.ASFindProperty(region, state.store, topScope(), multiname, domain, strict);
          if (ti) {
            if (ti.object) {
              if (ti.object instanceof Global && !ti.object.isExecuting()) {
                // If we find the property in a global whose script hasn't been executed yet
                // we have to emit the slow path so it gets executed.
                info("Can't optimize findProperty " + multiname + ", global object is not yet executed or executing.");
                return slowPath;
              }
              return constant(ti.object);
            } else if (ti.scopeDepth !== undefined) {
              return getScopeObject(topScope(ti.scopeDepth));
            }
          }
          info("Can't optimize findProperty " + multiname);
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
          if (c4CoerceNonPrimitive) {
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

        function resolveMultinameGlobally(multiname) {
          var namespaces = multiname.namespaces;
          var name = multiname.name;
          if (!globalMultinameAnalysis.value) {
            return;
          }
          if (!isConstant(namespaces) || !isConstant(name) || multiname.isAttribute()) {
            Counter.count("GlobalMultinameResolver: Cannot resolve runtime multiname or attribute.");
            return;
          }
          if (isNumeric(name.value) || !isString(name.value) || !name.value) {
            Counter.count("GlobalMultinameResolver: Cannot resolve numeric or any names.");
            return false;
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
              return store(new IR.CallProperty(region, state.store, object, constant(qn), args, 0));
            }
          } else if (ti && ti.propertyQName) {
            return store(new IR.CallProperty(region, state.store, object, constant(ti.propertyQName), args, IR.Flags.PRISTINE));
          }
          var qn = resolveMultinameGlobally(multiname);
          if (qn) {
            return store(new IR.ASCallProperty(region, state.store, object, constant(Multiname.getQualifiedName(qn)), args, IR.Flags.PRISTINE | IR.Flags.RESOLVED, isLex));
          }
          return store(new IR.ASCallProperty(region, state.store, object, multiname, args, IR.Flags.PRISTINE, isLex));
        }

        function getProperty(object, multiname, ti, getOpenMethod, ic) {
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
              return store(new IR.ASGetProperty(region, state.store, object, multiname, IR.Flags.INDEXED | (getOpenMethod ? IR.Flagas.IS_METHOD : 0)));
            }
          }
          info("Can't optimize getProperty " + multiname);
          var qn = resolveMultinameGlobally(multiname);
          if (qn) {
            return store(new IR.ASGetProperty(region, state.store, object, constant(Multiname.getQualifiedName(qn)), IR.Flags.RESOLVED | (getOpenMethod ? IR.Flagas.IS_METHOD : 0)));
          }
          Counter.count("Compiler: Slow ASGetProperty");
          return store(new IR.ASGetProperty(region, state.store, object, multiname, (getOpenMethod ? IR.Flagas.IS_METHOD : 0)));
        }

        function setProperty(object, multiname, value, ti, ic) {
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
          info("Can't optimize setProperty " + multiname);
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
          info("Can't optimize getSlot " + index);
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
          info("Can't optimize setSlot " + index);
          store(new IR.ASSetSlot(region, state.store, object, index, value));
        }

        function call(callee, object, args) {
          return store(new Call(region, state.store, callee, object, args, IR.Flags.PRISTINE));
        }

        function callCall(callee, object, args, pristine) {
          return store(new Call(region, state.store, callee, object, args, pristine ? IR.Flags.PRISTINE : 0));
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

        var stops = null;

        function buildIfStops(predicate) {
          release || assert (!stops);
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
          release || assert (!stops);
          stops = [{
            control: region,
            target: bc.target,
            state: state
          }];
        }

        function buildThrowStop() {
          release || assert (!stops);
          stops = [];
        }

        function buildReturnStop() {
          release || assert (!stops);
          stops = [];
        }

        function buildSwitchStops(determinant) {
          release || assert (!stops);
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
            release || assert (bc.targets.length === 2);
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
            case 0x03: // OP_throw
              store(new IR.Throw(region, pop()));
              stopPoints.push({
                region: region,
                store: state.store,
                value: Undefined
              });
              buildThrowStop();
              break;
            case 0x62: // OP_getlocal
              pushLocal(bc.index);
              break;
            case 0xD0: // OP_getlocal0
            case 0xD1: // OP_getlocal1
            case 0xD2: // OP_getlocal2
            case 0xD3: // OP_getlocal3
              pushLocal(op - OP_getlocal0);
              break;
            case 0x63: // OP_setlocal
              popLocal(bc.index);
              break;
            case 0xD4: // OP_setlocal0
            case 0xD5: // OP_setlocal1
            case 0xD6: // OP_setlocal2
            case 0xD7: // OP_setlocal3
              popLocal(op - OP_setlocal0);
              break;
            case 0x1C: // OP_pushwith
              scope.push(new IR.ASScope(topScope(), pop(), true));
              break;
            case 0x30: // OP_pushscope
              scope.push(new IR.ASScope(topScope(), pop(), false));
              break;
            case 0x1D: // OP_popscope
              scope.pop();
              break;
            case 0x64: // OP_getglobalscope
              push(new IR.ASGlobal(null, savedScope()));
              break;
            case 0x65: // OP_getscopeobject
              push(getScopeObject(state.scope[bc.index]));
              break;
            case 0x5D: // OP_findpropstrict
              push(findProperty(buildMultiname(bc.index), true, bc.ti));
              break;
            case 0x5E: // OP_findproperty
              push(findProperty(buildMultiname(bc.index), false, bc.ti));
              break;
            case 0x66: // OP_getproperty
              multiname = buildMultiname(bc.index);
              object = pop();
              push(getProperty(object, multiname, bc.ti, false, ic(bc)));
              break;
            case 0x59: // OP_getdescendants
              multiname = buildMultiname(bc.index);
              object = pop();
              push(getDescendants(object, multiname, bc.ti));
              break;
            case 0x60: // OP_getlex
              multiname = buildMultiname(bc.index);
              push(getProperty(findProperty(multiname, true, bc.ti), multiname, bc.ti, false, ic(bc)));
              break;
            case 0x68: // OP_initproperty
            case 0x61: // OP_setproperty
              value = pop();
              multiname = buildMultiname(bc.index);
              object = pop();
              setProperty(object, multiname, value, bc.ti, ic(bc));
              break;
            case 0x6A: // OP_deleteproperty
              multiname = buildMultiname(bc.index);
              object = pop();
              push(store(new IR.ASDeleteProperty(region, state.store, object, multiname)));
              break;
            case 0x6C: // OP_getslot
              object = pop();
              push(getSlot(object, constant(bc.index), bc.ti));
              break;
            case 0x6D: // OP_setslot
              value = pop();
              object = pop();
              setSlot(object, constant(bc.index), value, bc.ti);
              break;
            case 0x04: // OP_getsuper
              multiname = buildMultiname(bc.index);
              object = pop();
              push(getSuper(savedScope(), object, multiname, bc.ti));
              break;
            case 0x05: // OP_setsuper
              value = pop();
              multiname = buildMultiname(bc.index);
              object = pop();
              push(setSuper(savedScope(), object, multiname, value, bc.ti));
              break;
            case 0xF1: // OP_debugfile
            case 0xF0: // OP_debugline
              break;
            case 0x40: // OP_newfunction
              push(callPure(createFunctionCallee, null, [constant(methods[bc.index]), topScope(), constant(true)]));
              break;
            case 0x41: // OP_call
              args = popMany(bc.argCount);
              object = pop();
              callee = pop();
              push(callCall(callee, object, args));
              break;
            case 0x46: // OP_callproperty
            case 0x4F: // OP_callpropvoid
            case 0x4C: // OP_callproplex
              args = popMany(bc.argCount);
              multiname = buildMultiname(bc.index);
              object = pop();
              value = callProperty(object, multiname, args, op === OP_callproplex, bc.ti);
              if (op !== OP_callpropvoid) {
                push(value);
              }
              break;
            case 0x45: // OP_callsuper
            case 0x4E: // OP_callsupervoid
              multiname = buildMultiname(bc.index);
              args = popMany(bc.argCount);
              object = pop();
              value = callSuper(savedScope(), object, multiname, args, bc.ti);
              if (op !== OP_callsupervoid) {
                push(value);
              }
              break;
            case 0x42: // OP_construct
              args = popMany(bc.argCount);
              object = pop();
              push(store(new IR.ASNew(region, state.store, object, args)));
              break;
            case 0x49: // OP_constructsuper
              args = popMany(bc.argCount);
              object = pop();
              if (!(bc.ti && bc.ti.noCallSuperNeeded)) {
                callee = getJSProperty(savedScope(), "object.baseClass.instanceConstructorNoInitialize");
                call(callee, object, args);
              }
              break;
            case 0x4A: // OP_constructprop
              args = popMany(bc.argCount);
              multiname = buildMultiname(bc.index);
              object = pop();
              callee = getProperty(object, multiname, bc.ti, false, ic(bc));
              push(store(new IR.ASNew(region, state.store, callee, args)));
              break;
            case 0x80: // OP_coerce
              if (bc.ti && bc.ti.noCoercionNeeded) {
                Counter.count("Compiler: NoCoercionNeeded");
                break;
              } else {
                Counter.count("Compiler: CoercionNeeded");
              }
              value = pop();
              push(coerce(multinames[bc.index], value));
              break;
            case 0x83: // OP_coerce_i
            case 0x73: // OP_convert_i
              push(coerceInt(pop()));
              break;
            case 0x88: // OP_coerce_u
            case 0x74: // OP_convert_u
              push(coerceUint(pop()));
              break;
            case 0x84: // OP_coerce_d
            case 0x75: // OP_convert_d
              push(coerceNumber(pop()));
              break;
            case 0x81: // OP_coerce_b
            case 0x76: // OP_convert_b
              push(coerceBoolean(pop()));
              break;
            case 0x78: // OP_checkfilter
              push(call(globalProperty("checkFilter"), null, [pop()]));
              break;
            case 0x82: // OP_coerce_a
              /* NOP */ break;
            case 0x85: // OP_coerce_s
              push(coerceString(pop()));
              break;
            case 0x70: // OP_convert_s
              push(convertString(pop()));
              break;
            case 0x87: // OP_astypelate
              type = pop();
              if (c4AsTypeLate) {
                value = pop();
                push(call(globalProperty("asAsType"), null, [type, value]));
              }
              break;
            case 0x48: // OP_returnvalue
            case 0x47: // OP_returnvoid
              value = Undefined;
              if (op === OP_returnvalue) {
                value = pop();
                if (methodInfo.returnType) {
                  if (!(bc.ti && bc.ti.noCoercionNeeded)) {
                    value = coerce(methodInfo.returnType, value);
                  }
                }
              }
              stopPoints.push({
                region: region,
                store: state.store,
                value: value
              });
              buildReturnStop();
              break;
            case 0x1E: // OP_nextname
            case 0x23: // OP_nextvalue
              index = pop();
              object = pop();
              push(new IR.CallProperty(
                region, state.store, object,
                constant(op === OP_nextname ? "asNextName" : "asNextValue"),
                [index], IR.Flags.PRISTINE)
              );
              break;
            case 0x32: // OP_hasnext2
              var temp = call(globalProperty("asHasNext2"), null, [local[bc.object], local[bc.index]]);
              local[bc.object] = getJSProperty(temp, "object");
              push(local[bc.index] = getJSProperty(temp, "index"));
              break;
            case 0x20: // OP_pushnull
              push(Null);
              break;
            case 0x21: // OP_pushundefined
              push(Undefined);
              break;
            case 0x22: // OP_pushfloat
              notImplemented();
              break;
            case 0x24: // OP_pushbyte
              push(constant(bc.value));
              break;
            case 0x25: // OP_pushshort
              push(constant(bc.value));
              break;
            case 0x2C: // OP_pushstring
              push(constant(strings[bc.index]));
              break;
            case 0x2D: // OP_pushint
              push(constant(ints[bc.index]));
              break;
            case 0x2E: // OP_pushuint
              push(constant(uints[bc.index]));
              break;
            case 0x2F: // OP_pushdouble
              push(constant(doubles[bc.index]));
              break;
            case 0x26: // OP_pushtrue
              push(constant(true));
              break;
            case 0x27: // OP_pushfalse
              push(constant(false));
              break;
            case 0x28: // OP_pushnan
              push(constant(NaN));
              break;
            case 0x29: // OP_pop
              pop(); break;
            case 0x2A: // OP_dup
              value = shouldNotFloat(pop()); push(value); push(value);
              break;
            case 0x2B: // OP_swap
              state.stack.push(pop(), pop());
              break;
            case 0xEF: // OP_debug
            case OP_debugline:
            case OP_debugfile:
              break;
            case 0x0C: // OP_ifnlt
              buildIfStops(negatedTruthyCondition(Operator.LT));
              break;
            case 0x18: // OP_ifge
              buildIfStops(truthyCondition(Operator.GE));
              break;
            case 0x0D: // OP_ifnle
              buildIfStops(negatedTruthyCondition(Operator.LE));
              break;
            case 0x17: // OP_ifgt
              buildIfStops(truthyCondition(Operator.GT));
              break;
            case 0x0E: // OP_ifngt
              buildIfStops(negatedTruthyCondition(Operator.GT));
              break;
            case 0x16: // OP_ifle
              buildIfStops(truthyCondition(Operator.LE));
              break;
            case 0x0F: // OP_ifnge
              buildIfStops(negatedTruthyCondition(Operator.GE));
              break;
            case 0x15: // OP_iflt
              buildIfStops(truthyCondition(Operator.LT));
              break;
            case 0x10: // OP_jump
              buildJumpStop();
              break;
            case 0x11: // OP_iftrue
              buildIfStops(truthyCondition(Operator.TRUE));
              break;
            case 0x12: // OP_iffalse
              buildIfStops(truthyCondition(Operator.FALSE));
              break;
            case 0x13: // OP_ifeq
              buildIfStops(truthyCondition(Operator.EQ));
              break;
            case 0x14: // OP_ifne
              buildIfStops(truthyCondition(Operator.NE));
              break;
            case 0x19: // OP_ifstricteq
              buildIfStops(truthyCondition(Operator.SEQ));
              break;
            case 0x1A: // OP_ifstrictne
              buildIfStops(truthyCondition(Operator.SNE));
              break;
            case 0x1B: // OP_lookupswitch
              buildSwitchStops(pop());
              break;
            case 0x96: // OP_not
              pushExpression(Operator.FALSE);
              break;
            case 0x97: // OP_bitnot
              pushExpression(Operator.BITWISE_NOT);
              break;
            case 0xA0: // OP_add
              right = pop();
              left = pop();
              if (typesAreEqual(left, right)) {
                operator = Operator.ADD;
              } else if (useAsAdd) {
                operator = Operator.AS_ADD;
              } else {
                operator = Operator.ADD;
              }
              push(binary(operator, left, right));
              break;
            case 0xC5: // OP_add_i
              pushExpression(Operator.ADD, true);
              break;
            case 0xA1: // OP_subtract
              pushExpression(Operator.SUB);
              break;
            case 0xC6: // OP_subtract_i
              pushExpression(Operator.SUB, true);
              break;
            case 0xA2: // OP_multiply
              pushExpression(Operator.MUL);
              break;
            case 0xC7: // OP_multiply_i
              pushExpression(Operator.MUL, true);
              break;
            case 0xA3: // OP_divide
              pushExpression(Operator.DIV);
              break;
            case 0xA4: // OP_modulo
              pushExpression(Operator.MOD);
              break;
            case 0xA5: // OP_lshift
              pushExpression(Operator.LSH);
              break;
            case 0xA6: // OP_rshift
              pushExpression(Operator.RSH);
              break;
            case 0xA7: // OP_urshift
              pushExpression(Operator.URSH);
              break;
            case 0xA8: // OP_bitand
              pushExpression(Operator.AND);
              break;
            case 0xA9: // OP_bitor
              pushExpression(Operator.OR);
              break;
            case 0xAA: // OP_bitxor
              pushExpression(Operator.XOR);
              break;
            case 0xAB: // OP_equals
              pushExpression(Operator.EQ);
              break;
            case 0xAC: // OP_strictequals
              pushExpression(Operator.SEQ);
              break;
            case 0xAD: // OP_lessthan
              pushExpression(Operator.LT);
              break;
            case 0xAE: // OP_lessequals
              pushExpression(Operator.LE);
              break;
            case 0xAF: // OP_greaterthan
              pushExpression(Operator.GT);
              break;
            case 0xB0: // OP_greaterequals
              pushExpression(Operator.GE);
              break;
            case 0x90: // OP_negate
              pushExpression(Operator.NEG);
              break;
            case 0xC4: // OP_negate_i
              pushExpression(Operator.NEG, true);
              break;
            case 0x91: // OP_increment
            case 0xC0: // OP_increment_i
            case 0x93: // OP_decrement
            case 0xC1: // OP_decrement_i
              push(constant(1));
              if (op === OP_increment || op === OP_decrement) {
                push(coerceNumber(pop()));
              } else {
                push(coerceInt(pop()));
              }
              if (op === OP_increment || op === OP_increment_i) {
                pushExpression(Operator.ADD);
              } else {
                pushExpression(Operator.SUB);
              }
              break;
            case 0x92: // OP_inclocal
            case 0xC2: // OP_inclocal_i
            case 0x94: // OP_declocal
            case 0xC3: // OP_declocal_i
              push(constant(1));
              if (op === OP_inclocal || op === OP_declocal) {
                push(coerceNumber(local[bc.index]));
              } else {
                push(coerceInt(local[bc.index]));
              }
              if (op === OP_inclocal || op === OP_inclocal_i) {
                pushExpression(Operator.ADD);
              } else {
                pushExpression(Operator.SUB);
              }
              popLocal(bc.index);
              break;
            case 0xB1: // OP_instanceof
              type = pop();
              value = pop();
              push(call(getJSProperty(type, "isInstanceOf"), null, [value]));
              break;
            case 0xB2: // OP_istype
              value = pop();
              multiname = buildMultiname(bc.index);
              type = getProperty(findProperty(multiname, false), multiname);
              push(call(globalProperty("asIsType"), null, [type, value]));
              break;
            case 0xB3: // OP_istypelate
              type = pop();
              value = pop();
              push(call(globalProperty("asIsType"), null, [type, value]));
              break;
            case 0xB4: // OP_in
              object = pop();
              value = pop();
              multiname = new IR.ASMultiname(Undefined, value, 0);
              push(store(new IR.ASHasProperty(region, state.store, object, multiname)));
              break;
            case 0x95: // OP_typeof
              push(call(globalProperty("asTypeOf"), null, [pop()]));
              break;
            case 0x08: // OP_kill
              push(Undefined);
              popLocal(bc.index);
              break;
            case 0x53: // OP_applytype
              args = popMany(bc.argCount);
              type = pop();
              callee = globalProperty("applyType");
              push(call(callee, null, [domain, type, new NewArray(region, args)]));
              break;
            case 0x56: // OP_newarray
              args = popMany(bc.argCount);
              push(new NewArray(region, args));
              break;
            case 0x55: // OP_newobject
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
            case 0x57: // OP_newactivation
              push(new IR.ASNewActivation(constant(methodInfo)));
              break;
            case 0x58: // OP_newclass
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
        var stopRegion = new Region(null);
        var stopValuePhi = new Phi(stopRegion, null);
        var stopStorePhi = new Phi(stopRegion, null);
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
    Timer.start("Mark Loops");
    methodInfo.analysis.markLoops();
    Timer.stop();

    if (enableVerifier.value) {
      // TODO: Can we verify even if |hadDynamicScope| is |true|?
      Timer.start("Verify");
      verifier.verifyMethod(methodInfo, scope);
      Timer.stop();
    }

    var traceSource = c4TraceLevel.value > 0;
    var traceIR = c4TraceLevel.value > 1;

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
    var result = Backend.generate(cfg, enableRegisterAllocator.value);
    Timer.stop();
    traceSource && writer.writeLn(result.body);
    Node.stopNumbering();
    Timer.stop();

    return result;
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
