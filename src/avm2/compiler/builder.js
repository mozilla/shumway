var c2Options = systemOptions.register(new OptionSet("Compiler 2 Options"));
var compilerTraceLevel = compilerOptions.register(new Option("tir", "compilerTraceLevel", "number", 0, "Compiler Trace Level"));

(function (exports) {

  var Node = IR.Node;
  var Start = IR.Start;
  var Undefined = IR.Undefined;
  var This = IR.This;
  var Global = IR.Global;
  var Projection = IR.Projection;
  var Region = IR.Region;
  var Binary = IR.Binary;
  var Unary = IR.Unary;
  var Constant = IR.Constant;
  var FindProperty = IR.FindProperty;
  var GetProperty = IR.GetProperty;
  var SetProperty = IR.SetProperty;
  var GetSlot = IR.GetSlot;
  var SetSlot = IR.SetSlot;
  var Call = IR.Call;
  var Phi = IR.Phi;
  var Stop = IR.Stop;
  var If = IR.If;
  var Jump = IR.Jump;
  var Scope = IR.Scope;
  var Operator = IR.Operator;
  var Parameter = IR.Parameter;

  var DFG = IR.DFG;
  var CFG = IR.CFG;

  var writer;

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

    function pushPhis(a, b) {
      assert (a.length === b.length);
      for (var i = 0; i < a.length; i++) {
        assert (a[i] instanceof Phi, a[i]);
        a[i].pushValue(b[i]);
      }
    }

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
      assert (this.matches(other));
      mergeValues(control, this.local, other.local);
      mergeValues(control, this.stack, other.stack);
      mergeValues(control, this.scope, other.scope);
      this.store = mergeValue(control, this.store, other.store);
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
        ("M: " + toBriefString(this.store)).padRight(' ', 14) +
        ("X: " + toBriefString(this.saved)).padRight(' ', 14) +
        ("$: " + this.scope.map(toBriefString).join(", ")).padRight(' ', 20) +
        ("L: " + this.local.map(toBriefString).join(", ")).padRight(' ', 40) +
        ("S: " + this.stack.map(toBriefString).join(", ")).padRight(' ', 60);
    };
    return constructor;
  })();

  var Builder = (function () {
    function constructor (abc, methodInfo, scope) {
      assert (abc && methodInfo && scope);
      this.abc = abc;
      this.scope = scope;
      this.methodInfo = methodInfo;
      Node.resetNextID();
    }

    constructor.prototype.buildStart = function () {
      var mi = this.methodInfo;
      var start = new Start();
      var state = start.entryState = new State(0);

      /* First local is the |this| reference. */
      state.local.push(new This(start));

      /* Create the method's parameters. */
      for (var i = 0; i < mi.parameters.length; i++) {
        state.local.push(new Parameter(start, i, ARGUMENT_PREFIX + mi.parameters[i].name));
      }

      /* Wipe out the method's remaining locals. */
      for (var i = mi.parameters.length; i < mi.localCount; i++) {
        state.local.push(Undefined);
      }

      start.scope = new Constant(this.scope);
      state.store = new Projection(start, Projection.Type.STORE);
      state.saved = new Projection(start, Projection.Type.SCOPE);
      return start;
    };

    constructor.prototype.build = function build() {
      var analysis = this.methodInfo.analysis;
      var blocks = analysis.blocks;
      var bytecodes = analysis.bytecodes;

      const ints = this.abc.constantPool.ints;
      const uints = this.abc.constantPool.uints;
      const doubles = this.abc.constantPool.doubles;
      const strings = this.abc.constantPool.strings;
      const methods = this.abc.methods;
      const multinames = this.abc.constantPool.multinames;

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
      while (next = worklist.pop()) {
        buildNodes(next.region, next.block, next.region.entryState.clone()).forEach(function (stop) {
          var target = stop.target;
          var region = target.region;
          if (region) {
            writer && writer.enter("Merging into region: " + region + " @ " + target.position + ", block " + target.bid + " {");
            writer && writer.writeLn("  R " + region.entryState);
            writer && writer.writeLn("+ I " + stop.state);

            region.entryState.merge(region, stop.state);
            region.predecessors.push(stop.control);

            writer && writer.writeLn("  = " + region.entryState);
            writer && writer.leave("}");
          } else {
            region = target.region = new Region(stop.control);
            if (target.loop) {
              writer && writer.writeLn("Adding PHIs to loop region.");
            }
            region.entryState = target.loop ? stop.state.makePhis(region) : stop.state.clone(target.position);
            writer && writer.writeLn("Adding new region: " + region + " @ " + target.position + " to worklist.");
            worklist.push({region: region, block: target});
          }
        });

        writer && writer.enter("Worklist: {");
        worklist.forEach(function (item) {
          writer && writer.writeLn(item.region + " " + item.block.bdo + " " + item.region.entryState);
        });
        writer && writer.leave("}");
      }

      writer && writer.writeLn("Done");

      function buildNodes(region, block, state) {
        assert (region && block && state);

        var local = state.local;
        var stack = state.stack;
        var scope = state.scope;

        function topScope() {
          if (scope.length > 0) {
            return scope.top();
          }
          return state.saved;
        }

        var object, value, multiname, type;

        function push(x) {
          stack.push(x);
        }

        function pop() {
          return stack.pop();
        }

        function pushLocal(index) {
          push(local[index]);
        }

        function popLocal(index) {
          local[index] = pop();
        }

        function buildMultiname(index) {
          var multiname = multinames[index];
          if (multiname.isRuntime()) {
            var namespaces = new Constant(multiname.namespaces);
            var name = new Constant(multiname.name);
            if (multiname.isRuntimeName()) {
              name = pop();
            }
            if (multiname.isRuntimeNamespace()) {
              namespaces = pop();
            }
            assert (false);
            return new RuntimeMultiname(new Constant(multiname), namespaces, name);
          } else {
            return new Constant(multiname);
          }
        }

        function findProperty(name) {
          return new FindProperty(state.scope.top(), name);
        }

        function getProperty(object, name) {
          return new GetProperty(null, state.store, object, name);
        }

        function store(node) {
          state.store = new Projection(node, Projection.Type.STORE);
          return node;
        }

        function setProperty(object, name, value) {
          store(new SetProperty(null, state.store, object, name, value));
        }

        function getSlot(object, index, ti) {
          return new GetSlot(region, state.store, object, index);
        }

        function setSlot(object, index, value, ti) {
          store(new SetSlot(region, state.store, object, index, value));
        }

        function call(object, args) {
          return store(new Call(region, state.store, object, args));
        }

        function constant(value) {
          return new Constant(value);
        }

        function condition(operator) {
          var right;
          if (operator.isBinary()) {
            right = pop();
          }
          var left = pop();
          if (right) {
            return new Binary(operator, left, right);
          } else {
            return new Unary(operator, left);
          }
        }

        function negatedCondition(operator) {
          return new Unary(Operator.FALSE, condition(operator));
        }

        function pushExpression(operator) {
          var left, right;
          if (operator.isBinary()) {
            right = pop();
            left = pop();
            push(new Binary(operator, left, right));
          } else {
            left = pop();
            push(new Unary(operator, left));
          }
        }

        var stops = null;

        function buildIfStops(predicate) {
          assert (!stops);
          var _if = new If(region, predicate);
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

        function buildReturnStop() {
          assert (!stops);
          stops = [];
        }

        function toInt32(value) {
          return new Binary(Operator.OR, value, constant(0));
        }

        function toDouble(value) {
          // TODO: FIX THIS;
          return new Binary(Operator.OR, value, constant(0));
        }

        if (writer) {
          writer.writeLn("Processing Region: " + region + ", Block: " + block.bid);
          writer.enter(("> state: " + region.entryState.toString()).padRight(' ', 100));
        }

        region.processed = true;

        var bc;
        for (var index = block.position, end = block.end.position; index <= end; index++) {
          bc = bytecodes[index];
          var op = bc.op;
          state.index = index;
          switch (op) {
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
            case OP_pushscope:
              scope.push(new Scope(topScope(), pop()));
              break;
            case OP_getglobalscope:
              push(new Global(null, topScope()));
              break;
            case OP_findpropstrict:
              push(findProperty(buildMultiname(bc.index)));
              break;
            case OP_getproperty:
              multiname = buildMultiname(bc.index);
              object = pop();
              push(getProperty(object, multiname));
              break;
            case OP_setproperty:
              value = pop();
              multiname = buildMultiname(bc.index);
              object = pop();
              setProperty(object, multiname, value);
              break;
            case OP_getslot:
              var obj = pop();
              push(getSlot(obj, constant(bc.index), bc.ti));
              break;
            case OP_setslot:
              value = pop();
              object = pop();
              setSlot(object, constant(bc.index), value, bc.ti);
              break;
            case OP_debugfile:
            case OP_debugline:
              break;
            case OP_callproperty:
              args = stack.popMany(bc.argCount);
              multiname = buildMultiname(bc.index);
              object = pop();
              push(call(getProperty(object, multiname), args));
              break;
            case OP_coerce_a:       /* NOP */ break;
            case OP_returnvalue:
              stopPoints.push({
                region: region,
                store: state.store,
                value: pop()
              });
              buildReturnStop();
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
            case OP_pop:            stack.pop(); break;
            case OP_dup:            value = pop(); push(value); push(value); break;
            case OP_swap:           state.stack.push(pop(), pop()); break;
            case OP_debug:
            case OP_debugline:
            case OP_debugfile:
              break;
            case OP_ifnlt:          buildIfStops(negatedCondition(Operator.LT)); break;
            case OP_ifge:           buildIfStops(condition(Operator.GE)); break;
            case OP_ifnle:          buildIfStops(negatedCondition(Operator.LE)); break;
            case OP_ifgt:           buildIfStops(condition(Operator.GT)); break;
            case OP_ifngt:          buildIfStops(negatedCondition(Operator.GT)); break;
            case OP_ifle:           buildIfStops(condition(Operator.LE)); break;
            case OP_ifnge:          buildIfStops(negatedCondition(Operator.GE)); break;
            case OP_iflt:           buildIfStops(condition(Operator.LT)); break;
            case OP_jump:           buildJumpStop(); break;
            case OP_iftrue:         buildIfStops(condition(Operator.TRUE)); break;
            case OP_iffalse:        buildIfStops(condition(Operator.FALSE)); break;
            case OP_ifeq:           buildIfStops(condition(Operator.EQ)); break;
            case OP_ifne:           buildIfStops(condition(Operator.NE)); break;
            case OP_ifstricteq:     buildIfStops(condition(Operator.SEQ)); break;
            case OP_ifstrictne:     buildIfStops(condition(Operator.SNE)); break;
            case OP_not:            pushExpression(Operator.FALSE); break;
            case OP_bitnot:         pushExpression(Operator.BITWISE_NOT); break;
            case OP_add:            pushExpression(Operator.ADD); break;
            case OP_subtract:       pushExpression(Operator.SUB); break;
            case OP_multiply:       pushExpression(Operator.MUL); break;
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
            case OP_increment:
              push(constant(1));
              pushExpression(Operator.ADD);
              break;
            case OP_istype:
              value = pop();
              multiname = buildMultiname(bc.index);
              type = getProperty(findProperty(multiname), multiname);
              push(call("isInstance", [value, type]));
              break;
            case OP_convert_i:
              push(toInt32(pop()));
              break;
            case OP_convert_d:
              push(toDouble(pop()));
              break;
            case OP_convert_b:
              push(new Unary(Operator.FALSE, new Unary(Operator.FALSE, pop())));
              break;
            case OP_kill:
              push(Undefined);
              popLocal(bc.index);
              break;
            default:
              unexpected("Not Implemented: " + bc);
          }

          if (op === OP_debug || op === OP_debugfile || op === OP_debugline) {
            continue;
          }
          if (writer) {
            writer.writeLn(("state: " + state.toString()).padRight(' ', 100) + " : " + index + ", " + bc.toString(this.abc));
          }
        }
        if (writer) {
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

  var count = 0;

  function build(abc, methodInfo, scope, hasDynamicScope) {

    if (hasDynamicScope) {
      return false;
    }

    if (count ++ !== 1) {
      print("Skipping " + (count - 1));
      return;
    }

    if (compilerTraceLevel.value > 0) {
      writer = new IndentingWriter();
    }

    Timer.start("IR Builder");
    var dfg = new Builder(abc, methodInfo, scope).build();
    Timer.stop();

    writer && dfg.trace(writer);

    Timer.start("IR CFG");
    var cfg = dfg.buildCFG();
    Timer.stop();

    Timer.start("IR OPTIMIZE PHIs");
    cfg.optimizePhis();
    Timer.stop();

    Timer.start("IR SCHEDULE");
    cfg.scheduleEarly();
    Timer.stop();

    writer && dfg.trace(writer);

    writer && cfg.trace(writer);

    cfg.verify();

    Timer.start("IR ALLOCATE VARIABLES");
    cfg.allocateVariables();
    Timer.stop();

    Timer.start("IR DOM");
    cfg.computeDominators(true);
    Timer.stop();

    // writer && cfg.trace(writer);

    return Backend.generate(cfg);
  }

  exports.build = build;

})(typeof exports === "undefined" ? (builder = {}) : exports);