var c4Options = systemOptions.register(new OptionSet("C4 Options"));
var enableC4 = c4Options.register(new Option("c4", "c4", "boolean", false, "Enable the C4 compiler."));
var c4TraceLevel = c4Options.register(new Option("tc4", "tc4", "number", 0, "Compiler Trace Level"));

(function (exports) {

  var Node = IR.Node;
  var Start = IR.Start;
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
      this.saved = Undefined;
    }
    constructor.prototype.clone = function clone(index) {
      var s = new State();
      s.index = index !== undefined ? index : this.index;
      s.local = this.local.slice(0);
      s.stack = this.stack.slice(0);
      s.scope = this.scope.slice(0);
      s.saved = this.saved;
      s.store = this.store;
      return s;
    };
    constructor.prototype.matches = function matches(other) {
      return this.stack.length === other.stack.length &&
             this.scope.length === other.scope.length &&
             this.local.length === other.local.length;
    };
    constructor.prototype.makePhis = function makePhis(control) {
      var s = new State();
      assert (control);
      function makePhi(x) {
        return new Phi(control, x);
      }
      s.index = this.index;
      s.local = this.local.map(makePhi);
      s.stack = this.stack.map(makePhi);
      s.scope = this.scope.map(makePhi);
      s.saved = this.saved;
      s.store = makePhi(this.store);
      return s;
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
      assert (this.matches(other), this + " !== " + other);
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

  function constant(value) {
    return new Constant(value);
  }

  function getJSPropertyWithStore(store, object, path) {
    assert (isString(path));
    var names = path.split(".");
    var node = object;
    for (var i = 0; i < names.length; i++) {
      node = new IR.GetProperty(null, store, node, constant(names[i]));
      node.shouldFloat = true;
    }
    return node;
  }

  function globalProperty(name) {
    var node = new IR.GlobalProperty(name);
    node.mustFloat = true;
    return node;
  }

  var Builder = (function () {
    function constructor (abc, methodInfo, scope, hasDynamicScope) {
      assert (abc && methodInfo && scope);
      this.abc = abc;
      this.scope = scope;
      this.methodInfo = methodInfo;
      this.hasDynamicScope = hasDynamicScope;
      this.peepholeOptimizer = new IR.PeepholeOptimizer();
    }

    constructor.prototype.buildStart = function () {
      var mi = this.methodInfo;
      var start = new Start();
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

      var arguments = new IR.Arguments(start);

      if (mi.needsRest() || mi.needsArguments()) {
        var offset = constant(parameterIndexOffset + (mi.needsRest() ? parameterCount : 0));
        state.local[parameterCount + 1] =
          new Call(start, state.store, globalProperty("sliceArguments"), null, [arguments, offset]);
      }

      var argumentsLength = getJSPropertyWithStore(state.store, arguments, "length");

      for (var i = 0; i < parameterCount; i++) {
        var parameter = mi.parameters[i];
        var index = i + 1;
        var local = state.local[index];
        if (parameter.value !== undefined) {
          var condition = new IR.Binary(Operator.LT, argumentsLength, constant(parameterIndexOffset + i + 1));
          local = new IR.Latch(condition, constant(parameter.value), local);
        }
        if (parameter.type && !parameter.type.isAnyName()) {
          var coercer = this.coercers[parameter.type.name];
          if (coercer) {
            local = coercer(local);
          } else {
            var type = this.abc.domain.getProperty(parameter.type, true, false);
            if (type) {
              local = new Call(start, state.store, globalProperty("coerce"), null, [local, constant(type)]);
            } else {
              // unexpected();
            }
          }
        }
        state.local[index] = local;
      }

      return start;
    };

    constructor.prototype.build = function build() {
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
      var runtime = new Constant(this.abc.runtime);

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
        return toNumber(value);
      }

      function toBoolean(value) {
        return unary(Operator.FALSE, unary(Operator.FALSE, value));
      }

      function toString(value) {
        return binary(Operator.ADD, constant(""), value);
      }

      function getPublicQualifiedName(value) {
        return binary(Operator.ADD, constant("public$"), value);
      }

      assert(!this.coercers);

      var coercers = this.coercers = {
        "int": toInt32,
        "uint": toUInt32,
        "Number": toNumber,
        "Boolean": toBoolean,
        "String": toString
      };

      var regions = [];

      var stopPoints = [];

      for (var i = 0; i < blocks.length; i++) {
        blocks[i].blockDominatorOrder = i;
      }

      var worklist = new SortedList(function compare(a, b) {
        return a.block.blockDominatorOrder - b.block.blockDominatorOrder;
      });

      var start = this.buildStart();

      worklist.push({region: start, block: blocks[0]});

      var next;
      while ((next = worklist.pop())) {
        buildNodes(next.region, next.block, next.region.entryState.clone()).forEach(function (stop) {
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
            region.entryState = target.loop ? stop.state.makePhis(region) : stop.state.clone(target.position);
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

      function buildNodes(region, block, state) {
        assert (region && block && state);

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

        var object, index, callee, value, multiname, type, arguments;

        function push(x) {
          assert (x);
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
              assert (false, "Is |namespaces| an array or not?");
              namespaces = pop();
            }
            return new IR.AVM2RuntimeMultiname(new Constant(multiname), namespaces, name);
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

        function findProperty(name, strict, ti) {
          var slowPath = new IR.AVM2FindProperty(region, state.store, topScope(), name, domain, strict);
          if (ti) {
            if (ti.object) {
              if (ti.object instanceof Global && !ti.object.isExecuted()) {
                // If we found the property in a global that hasn't been executed yet then
                // we have to emit the slow path so it gets executed lazily.
                return slowPath;
              }
              return constant(ti.object);
            } else if (ti.scopeDepth !== undefined) {
              return getScopeObject(topScope(ti.scopeDepth));
            }
          }
          return slowPath;
        }

        function getJSProperty(object, path) {
          return getJSPropertyWithStore(state.store, object, path);
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

        function coerceValue(value, type) {
          if (isConstant(value) && isConstant(type)) {
            return constant(coerce(value.value, type.value));
          } else if (isConstant(type)) {
            var coercer = coercers[type.name];
            if (coercer) {
              return coercer(value);
            }
          }
          return call(globalProperty("coerce"), null, [value, type]);
        }

        function coerceString(value) {
          return call(globalProperty("coerceString"), null, [value]);
        }

        function getScopeObject(scope) {
          if (scope instanceof IR.AVM2Scope) {
            return scope.object;
          }
          return getJSProperty(scope, "object");
        }

        function getProperty(object, name, ti, getOpenMethod) {
          name = simplifyName(name);
          if (ti) {
            var propertyQName = ti.trait ? Multiname.getQualifiedName(ti.trait.name) : ti.propertyQName;
            if (propertyQName) {
              if (getOpenMethod && ti.trait && ti.trait.isMethod()) {
                propertyQName = VM_OPEN_METHOD_PREFIX + propertyQName;
                return shouldFloat(new IR.GetProperty(region, state.store, object, constant(propertyQName)));
              }
              return new IR.GetProperty(region, state.store, object, constant(propertyQName));
            }
          }
          if (hasNumericType(name) || isStringConstant(name)) {
            var get = shouldFloat(new IR.GetProperty(region, state.store, object, name));
            if (!hasNumericType(name)) {
              return get;
            }
            var indexGet = shouldFloat(call(getJSProperty(object, "indexGet"), object, [name]));
            return shouldFloat(new IR.Latch(getJSProperty(object, "indexGet"), indexGet, get));
          }
          return new IR.AVM2GetProperty(region, state.store, object, name);
        }

        function store(node) {
          state.store = new Projection(node, Projection.Type.STORE);
          return node;
        }

        function setProperty(object, name, value, ti) {
          name = simplifyName(name);
          if (hasNumericType(name) || isStringConstant(name)) {
            var set = new IR.SetProperty(region, state.store, object, name, value);
            if (!hasNumericType(name)) {
              return store(set);
            }
            var indexSet = call(getJSProperty(object, "indexSet"), object, [name, value]);
            return store(new IR.Latch(getJSProperty(object, "indexSet"), mustFloat(indexSet), mustFloat(set)));
          }
          if (ti) {
            var propertyQName = ti.trait ? Multiname.getQualifiedName(ti.trait.name) : ti.propertyQName;
            if (propertyQName) {
              store(new IR.SetProperty(region, state.store, object, constant(propertyQName), value));
              return;
            }
          }
          store(new IR.AVM2SetProperty(region, state.store, object, name, value));
        }

        function getSlot(object, index, ti) {
          if (ti) {
            var trait = ti.trait;
            if (trait) {
              if (trait.isConst()) {
                return constant(trait.value);
              }
              var slotQName = Multiname.getQualifiedName(trait.name);
              return new IR.GetProperty(region, state.store, object, constant(slotQName));
            }
          }
          return new IR.AVM2GetSlot(null, state.store, object, index);
        }

        function setSlot(object, index, value, ti) {
          if (ti) {
            var trait = ti.trait;
            if (trait) {
              var slotQName = Multiname.getQualifiedName(trait.name);
              store(new IR.SetProperty(region, state.store, object, constant(slotQName), value));
              return;
            }
          }
          store(new IR.AVM2SetSlot(region, state.store, object, index, value));
        }

        function call(callee, object, arguments) {
          return store(new Call(region, state.store, callee, object, arguments));
        }

        function callCall(callee, object, arguments) {
          // TODO: Mark Call IR nodes as non-pristine.
          return call(callee, object, arguments);
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
          stops = [];
          var _switch = new IR.Switch(region, determinant);
          for (var i = 0; i < bc.targets.length; i++) {
            stops.push({
              control: new Projection(_switch, Projection.Type.CASE, constant(i)),
              target: bc.targets[i],
              state: state
            });
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
              push(getProperty(object, multiname, bc.ti));
              break;
            case OP_getlex:
              multiname = buildMultiname(bc.index);
              push(getProperty(findProperty(multiname, true, bc.ti), multiname));
              break;
            case OP_initproperty:
            case OP_setproperty:
              value = pop();
              multiname = buildMultiname(bc.index);
              object = pop();
              setProperty(object, multiname, value, bc.ti);
              break;
            case OP_deleteproperty:
              multiname = buildMultiname(bc.index);
              object = pop();
              push(call(globalProperty("deleteProperty"), null, [object, multiname]));
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
              push(call(globalProperty("getSuper"), null, [object, multiname]));
              break;
            case OP_setsuper:
              value = pop();
              multiname = buildMultiname(bc.index);
              object = pop();
              store(call(globalProperty("setSuper"), null, [object, multiname, value]));
              break;
            case OP_debugfile:
            case OP_debugline:
              break;
            case OP_newfunction:
              callee = getJSProperty(runtime, "createFunction");
              push(call(callee, runtime, [constant(methods[bc.index]), topScope(), constant(true)]));
              break;
            case OP_call:
              arguments = popMany(bc.argCount);
              object = pop();
              callee = pop();
              push(callCall(callee, object, arguments));
              break;
            case OP_callproperty: case OP_callproplex: case OP_callpropvoid:
              arguments = popMany(bc.argCount);
              multiname = buildMultiname(bc.index);
              object = pop();
              callee = getProperty(object, multiname, bc.ti, true);
              if (op === OP_callproperty || op === OP_callpropvoid) {
                value = callCall(callee, object, arguments);
              } else {
                value = callCall(callee, null, arguments);
              }
              if (op !== OP_callpropvoid) {
                push(value);
              }
              break;
            case OP_callsuper:
              multiname = buildMultiname(bc.index);
              arguments = popMany(bc.argCount);
              object = pop();
              callee = call(globalProperty("getSuper"), null, [object, multiname]);
              push(call(callee, object, arguments));
              break;
            case OP_construct:
              arguments = popMany(bc.argCount);
              object = pop();
              push(store(new IR.AVM2New(region, state.store, object, arguments)));
              break;
            case OP_constructsuper:
              arguments = popMany(bc.argCount);
              object = pop();
              if (!(bc.ti && bc.ti.noCallSuperNeeded)) {
                callee = getJSProperty(savedScope(), "object.baseClass.instanceNoInitialize");
                push(call(callee, object, arguments));
              }
              break;
            case OP_constructprop:
              arguments = popMany(bc.argCount);
              multiname = buildMultiname(bc.index);
              object = pop();
              callee = getProperty(object, multiname, bc.ti);
              push(store(new IR.AVM2New(region, state.store, callee, arguments)));
              break;
            case OP_coerce:
              if (bc.ti && bc.ti.noCoercionNeeded) {
                Counter.count("Compiler: NoCoercionNeeded");
                break;
              } else {
                Counter.count("Compiler: CoercionNeeded");
              }
              value = pop();
              multiname = buildMultiname(bc.index);
              assert (isMultinameConstant(multiname));
              type = getDomainProperty(multiname);
              push(coerceValue(value, type));
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
            case OP_coerce_a:       /* NOP */ break;
            case OP_coerce_s:
              push(coerceString(pop()));
              break;
            case OP_convert_s:
              push(toString(pop()));
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
            case OP_pushnull:       push(constant(null)); break;
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
            case OP_add:            pushExpression(Operator.ADD); break;
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
              multiname = getPublicQualifiedName(stack.pop());
              push(call(globalProperty("hasProperty"), null, [object, multiname]));
              break;
            case OP_typeof:
              push(call(globalProperty("typeOf"), null, [pop()]));
              break;
            case OP_kill:
              push(Undefined);
              popLocal(bc.index);
              break;
            case OP_applytype:
              arguments = popMany(bc.argCount);
              type = pop();
              callee = getJSProperty(runtime, "applyType");
              push(call(callee, runtime, [type, new NewArray(arguments)]));
              break;
            case OP_newarray:
              arguments = popMany(bc.argCount);
              push(new NewArray(arguments));
              break;
            case OP_newobject:
              var properties = [];
              for (var i = 0; i < bc.argCount; i++) {
                var value = pop();
                var key = pop();
                assert (isConstant(key) && isString(key.value));
                key = constant(Multiname.getPublicQualifiedName(key.value));
                properties.unshift(new KeyValuePair(key, value));
              }
              push(new NewObject(properties));
              break;
            case OP_newactivation:
              push(new IR.AVM2NewActivation(constant(methodInfo)));
              break;
            case OP_newclass:
              callee = getJSProperty(runtime, "createClass");
              push(call(callee, runtime, [constant(classes[bc.index]), pop(), topScope()]));
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
    return constructor;
  })();

  function build(abc, verifier, methodInfo, scope, hasDynamicScope) {
    release || assert(scope);
    release || assert(methodInfo.analysis);
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
    var dfg = new Builder(abc, methodInfo, scope, hasDynamicScope).build();
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

  exports.build = build;

})(typeof exports === "undefined" ? (Builder = {}) : exports);

var C4Compiler = (function () {
  function constructor(abc) {
    this.abc = abc;
    this.verifier = new Verifier(abc);
  }
  constructor.prototype.compileMethod = function (methodInfo, hasDefaults, scope, hasDynamicScope) {
    return Builder.build(this.abc, this.verifier, methodInfo, scope, hasDynamicScope);
  };
  return constructor;
})();