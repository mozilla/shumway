const T = estransform;

const Node = T.Node;
const Literal = T.Literal;
const Identifier = T.Identifier;
const VariableDeclaration = T.VariableDeclaration;
const VariableDeclarator = T.VariableDeclarator;
const MemberExpression = T.MemberExpression;
const BinaryExpression = T.BinaryExpression;
const SequenceExpression = T.SequenceExpression;
const CallExpression = T.CallExpression;
const AssignmentExpression = T.AssignmentExpression;
const ExpressionStatement = T.ExpressionStatement;
const ReturnStatement = T.ReturnStatement;
const Program = T.Program;
const Statement = T.Statement;
const Comment = T.Comment;
const FunctionDeclaration = T.FunctionDeclaration;
const FunctionExpression = T.FunctionExpression;
const ConditionalExpression = T.ConditionalExpression;
const ObjectExpression = T.ObjectExpression;
const UnaryExpression = T.UnaryExpression;
const NewExpression = T.NewExpression;
const UpdateExpression = T.UpdateExpression;
const ForStatement = T.ForStatement;
const BlockStatement = T.BlockStatement;
const ThisExpression = T.ThisExpression;
const TypeAliasDirective = T.TypeAliasDirective;
const CastExpression = T.CastExpression;

const scopeName = new Identifier("$S");
const savedScopeName = new Identifier("$$S");
const constantsName = new Identifier("$C");

function objectConstant(obj) {
  return new MemberExpression(constantsName, new Literal(objectId(obj)), true);
}

function objectProperty(obj, path) {
  path.split(".").forEach(function(x) {
    obj = new MemberExpression(obj, new Identifier(x), false);
  });
  return obj;
}

var C1 = (function () {

  function compiler(abc) {
    Control.Break.prototype.compile = function (cx, state) {
      return cx.compileBreak(this, state);
    };

    Control.Continue.prototype.compile = function (cx, state) {
      return cx.compileContinue(this, state);
    };

    Control.Exit.prototype.compile = function (cx, state) {
      return cx.compileExit(this, state);
    };

    Control.LabelSwitch.prototype.compile = function (cx, state) {
      return cx.compileLabelSwitch(this, state);
    };

    Control.Seq.prototype.compile = function (cx, state) {
      return cx.compileSequence(this, state);
    };

    Bytecode.prototype.compile = function (cx, state) {
      return cx.compileBytecode(this, state);
    };

    Control.Loop.prototype.compile = function (cx, state) {
      return cx.compileLoop(this, state);
    };

    Control.Switch.prototype.compile = function (cx, state) {
      return cx.compileSwitch(this, state);
    };

    Control.If.prototype.compile = function (cx, state) {
      return cx.compileIf(this, state);
    };

    this.writer = new IndentingWriter();
    this.abc = abc;
  }

  /**
   * Abstract program state.
   */
  var State = (function () {
    var stateCounter = 0;
    function state() {
      this.stack = [];
      this.scopeHeight = 0;
      this.id = stateCounter ++;
    }
    state.prototype.clone = function clone() {
      var s = new State();
      s.stack = this.stack.slice(0);
      s.scopeHeight = this.scopeHeight;
      return s;
    };
    state.prototype.trace = function trace(writer) {
      writer.writeLn("id: " + stateCounter + ", scopeHeight: " + this.scopeHeight);
      writer.enter("stack: {");
      for (var i = 0; i < this.stack.length; i++) {
        writer.writeLn(i + ": " + escodegen.generate(this.stack[i]));
      }
      writer.leave("}");
    };
    return state;
  })();

  /**
   * Describes binary and unary operators.
   */
  var Operator = (function () {
    function operator(name, fn, binary, conditional) {
      this.name = name;
      this.fn = fn;
      this.binary = binary;
      this.conditional = conditional;
    }

    operator.ADD = new operator("+", function (l, r) { return l + r; }, true, false);
    operator.SUB = new operator("-", function (l, r) { return l - r; }, true, false);
    operator.MUL = new operator("*", function (l, r) { return l * r; }, true, false);
    operator.DIV = new operator("/", function (l, r) { return l / r; }, true, false);
    operator.MOD = new operator("%", function (l, r) { return l % r; }, true, false);

    operator.AND = new operator("&", function (l, r) { return l & r; }, true, false);
    operator.OR  = new operator("|", function (l, r) { return l | r; }, true, false);
    operator.XOR = new operator("^", function (l, r) { return l ^ r; }, true, false);

    operator.LSH = new operator("<<", function (l, r) { return l << r; }, true, false);
    operator.RSH = new operator(">>", function (l, r) { return l >> r; }, true, false);
    operator.URSH = new operator(">>>", function (l, r) { return l >>> r; }, true, false);

    operator.SEQ  = new operator("===", function (l, r) { return l === r; }, true, true);
    operator.SNE = new operator("!==", function (l, r) { return l !== r; }, true, true);
    operator.EQ = new operator("==", function (l, r) { return l == r; }, true, true);
    operator.NE = new operator("!=", function (l, r) { return l != r; }, true, true);
    operator.LE = new operator("<=", function (l, r) { return l <= r; }, true, true);
    operator.GT = new operator(">", function (l, r) { return l > r; }, true, true);
    operator.LT = new operator("<", function (l, r) { return l < r; }, true, true);
    operator.GE = new operator(">=", function (l, r) { return l >= r; }, true, true);
    operator.BITWISE_NOT = new operator("~", function (a) { return ~a; }, false, true);
    operator.NEG = new operator("-", function (a) { return -a; }, false, true);

    operator.TRUE = new operator("!!", function (a) { return !!a; }, false, true);
    operator.FALSE = new operator("!", function (a) { return !a; }, false, true);

    function linkOpposites(a, b) {
      a.not = b;
      b.not = a;
    }

    /**
     * Note that arithmetic comparisons aren't partial orders and cannot be
     * negated to each other.
     */

    linkOpposites(operator.SEQ, operator.SNE);
    linkOpposites(operator.EQ, operator.NE);
    linkOpposites(operator.TRUE, operator.FALSE);

    operator.prototype.eval = function eval() {
      return this.fn.apply(arguments);
    };

    operator.prototype.isConditional = function isConditional() {
      return this.conditional;
    };

    operator.prototype.isBinary = function isBinary() {
      return this.binary;
    };

    operator.prototype.toString = function toString() {
      return this.name;
    };

    return operator;
  })();

  var FindProperty = (function () {
    function findProperty(multiname, strict) {
      this.strict = strict;
      this.multiname = multiname;
      CallExpression.call(this, objectProperty(scopeName, "findProperty"), [objectConstant(this.multiname), new Literal(this.strict)]);
    };
    findProperty.prototype = Object.create(CallExpression.prototype);
    findProperty.prototype.isEquivalent = function isEquivalent(other) {
      return other instanceof findProperty && this.multiname === other.multiname && this.strict === other.strict;
    };
    return findProperty;
  })();

  var Compilation = (function () {
    function compilation(compiler, methodInfo, scope) {
      this.compiler = compiler;
      var mi = this.methodInfo = methodInfo;
      this.bytecodes = methodInfo.analysis.bytecodes;

      this.state = new State();

      /* Initialize local variables. First declare the [this] reference, then ... */
      this.local = [new Identifier("this")];

      /* push the method's parameters, followed by ... */
      for (var i = 0; i < mi.parameters.length; i++) {
        this.local.push(new Identifier(mi.parameters[i].name));
      }

      /* push the method's remaining locals.*/
      for (var i = mi.parameters.length; i < mi.localCount; i++) {
        this.local.push(new Identifier(getLocalVariableName(i)));
      }

      this.temporary = [];
    }
    compilation.prototype.compileSequence = function compileSequence(item, state) {
      var cx = this;
      item.body.forEach(function (x) {
        x.compile(cx, state);
      });
    };
    compilation.prototype.compileIf = function compileIf(item, state) {
      var condition = item.cond.compile(this, state);
    };
    compilation.prototype.compileBytecode = function compileBytecode(block, state) {
      var writer = traceLevel.value <= 2 ? null : this.compiler.writer;
      if (writer) {
        writer.enter("block " + block.blockId + ", dom: " + block.dominator.blockId + " [" + block.position + "-" + block.end.position + "] {");
        writer.leave("}");
      }

      var body = [];
      var local = this.local;
      var temporary = this.temporary;

      var abc = this.compiler.abc;
      var ints = abc.constantPool.ints;
      var uints = abc.constantPool.uints;
      var doubles = abc.constantPool.doubles;
      var strings = abc.constantPool.strings;
      var methods = abc.methods;
      var multinames = abc.constantPool.multinames;
      var runtime = abc.runtime;
      var savedScope = this.savedScope;
      var multiname, args, value, obj, ns, name, type, factory, index;

      function runtimeProperty(propertyName) {
        var result = objectConstant(abc.runtime);
        if (propertyName) {
          result = objectProperty(result, propertyName);
        }
        return result;
      }

      function push(value) {
        state.stack.push(value);
      }


      function setLocal(index) {
        var value = state.stack.pop();
        flushStack();
        emitStatement(new AssignmentExpression(local[index], "=", value));
      }

      function duplicate(value) {
        var temp = getTemporary(state.stack.length);
        state.stack.push(new AssignmentExpression(temp, "=", value));
        state.stack.push(temp);
      }

      function popValue() {
        emitStatement(state.stack.pop());
      }

      function kill(index) {
        flushStack();
        emitStatement(new AssignmentExpression(local[index], "=", constant(undefined)));
      }

      function getSlot(obj, index) {
        push(new MemberExpression(obj, new Identifier("S" + index), true));
      }

      function setSlot(obj, index, value) {
        flushStack();
        push(new AssignmentExpression(new MemberExpression(obj, new Identifier("S" + index), true), "=", value));
      }

      function getTemporary(index) {
        if (index in temporary) {
          return temporary[index];
        }
        return temporary[index] = new Identifier("$T" + i);
      }

      function constant(value) {
        if (value === undefined) {
          return new Identifier("undefined");
        }
        return new Literal(value);
      }

      /**
       * Stores all stack values into temporaries. At the end of a block, the state stack
       * may not be empty. This usually occurs for short-circuited conditional expressions.
       */
      function flushStack() {
        // assert (state.stack.length <= 2, "Stack Length is " + state.stack.length);
        for (var i = 0; i < state.stack.length; i++) {
          if (state.stack[i] !== getTemporary(i)) {
            emitStatement(new AssignmentExpression(getTemporary(i), "=", state.stack[i]));
            state.stack[i] = getTemporary(i);
          }
        }
      }

      function emitStatement(value) {
        if (!(value instanceof Statement)) {
          value = new ExpressionStatement(value);
        }
        body.push(value);
      }

      function emitComment(value) {
        // TODO
      }

      function expression(operator) {
        if (operator.isBinary()) {
          var b = state.stack.pop();
          var a = state.stack.pop();
          push(new BinaryExpression(operator.name, a, b));
        } else {
          var a = state.stack.pop();
          push(new UnaryExpression(operator, a));
        }
      }

      var condition = null;

      /**
       * Remembers the branch condition for this block, which is passed and used by the If control
       * node.
       */
      function setCondition(operator) {
        assert (condition === null);
        var b = undefined;
        if (operator.isBinary()) {
          b = state.stack.pop();
        }
        var a = state.stack.pop();
        condition = new BinaryExpression(operator, a, b);
      }

      function setNegatedCondition(operator) {
        setCondition(operator);
        condition = new UnaryExpression(condition, Operator.FALSE);
      }

      /**
       * Find the scope object containing the specified multiname.
       */
      function findProperty(multiname, strict) {
        if (false && !multiname.isQName()) {
          if (savedScope) {
            var resolved = savedScope.resolveMultiname(multiname);
            if (resolved) {
              return new FindProperty(resolved, strict);
            }
          }
        }
        return new FindProperty(multiname, strict);
      }


      function getProperty(obj, multiname) {
        /*
        if (obj instanceof FindProperty &&
            obj.multiname.name === multiname.name &&
            obj.multiname.isQName()) {
          return obj + "." + obj.multiname.getQualifiedName();
        }
        */

        /**
         * Looping over arrays by index will use a MultinameL
         * as it's the simplest type of late name. Instead of
         * doing a runtime looking, quickly go through late
         * name lookup here.
         */
        if (multiname.isRuntimeName() && !multiname.isPublicNamespaced()) {
          var value = state.stack.pop();
          return new CallExpression(objectProperty(obj, GET_ACCESSOR), [value]);
        }

        return new CallExpression(new Identifier("getProperty"), [obj, objectConstant(multiname)]);
      }



      var bytecodes = this.bytecodes;
      for (var bci = block.position, end = block.end.position; bci <= end; bci++) {
        var bc = bytecodes[bci];
        var op = bc.op;

        if (writer) {
          writer.writeLn("bytecode bci: " + bci + ", originalBci: " + bc.originalPosition + ", " + bc);
        }

        switch (op) {

        case OP_bkpt:           notImplemented(); break;
        case OP_throw:
          emitStatement(temporary[0] + " = " +
                        objectConstant(abc) + ".runtime.exception");
          emitStatement(temporary[0] + ".value = " + state.stack.pop());
          emitStatement("throw " + temporary[0]);
          break;
        case OP_getsuper:       notImplemented(); break;
        case OP_setsuper:       notImplemented(); break;
        case OP_dxns:           notImplemented(); break;
        case OP_dxnslate:       notImplemented(); break;
        case OP_kill:           kill(bc.index); break;
        case OP_lf32x4:         notImplemented(); break;
        case OP_sf32x4:         notImplemented(); break;
        case OP_ifnlt:          setNegatedCondition(Operator.LT); break;
        case OP_ifge:           setCondition(Operator.GE); break;
        case OP_ifnle:          setNegatedCondition(Operator.LE); break;
        case OP_ifgt:           setCondition(Operator.GT); break;
        case OP_ifngt:          setNegatedCondition(Operator.GT); break;
        case OP_ifle:           setCondition(Operator.LE); break;
        case OP_ifnge:          setNegatedCondition(Operator.GE); break;
        case OP_iflt:           setCondition(Operator.LT); break;
        case OP_jump:
          // NOP
          break;
        case OP_iftrue:
          setCondition(Operator.TRUE);
          break;
        case OP_iffalse:
          setCondition(Operator.FALSE);
          break;
        case OP_ifeq:           setCondition(Operator.EQ); break;
        case OP_ifne:           setCondition(Operator.NE); break;
        case OP_ifstricteq:     setCondition(Operator.SEQ); break;
        case OP_ifstrictne:     setCondition(Operator.SNE); break;
        case OP_lookupswitch:
          // notImplemented();
          break;
        case OP_pushwith:
          flushStack();
          obj = state.stack.pop();
          emitStatement(scopeName + " = new Scope" + argumentList(scopeName, obj));
          state.scopeHeight += 1;
          break;
        case OP_popscope:
          flushStack();
          emitStatement(scopeName + " = " + scopeName + ".parent");
          state.scopeHeight -= 1;
          break;
        case OP_nextname:
          index = state.stack.pop();
          obj = state.stack.pop();
          push("nextName" + argumentList(obj, index));
          break;
        case OP_hasnext:
          // TODO: Temporary implementation, totally broken.
          push(constant(false));
          break;
        case OP_hasnext2:
          flushStack();
          obj = local[bc.object];
          index = local[bc.index];
          emitStatement(temporary[0] + " = hasNext2" + argumentList(obj, index));
          emitStatement(local[bc.object] + " = " + temporary[0] + ".object");
          emitStatement(local[bc.index] + " = " + temporary[0] + ".index");
          push(temporary[0] + ".index");
          break;
        case OP_pushnull:       push(constant(null)); break;
        case OP_pushundefined:  push(constant(undefined)); break;
        case OP_pushfloat:      notImplemented(); break;
        case OP_nextvalue:      notImplemented(); break;
        case OP_pushbyte:       push(constant(bc.value)); break;
        case OP_pushshort:      push(constant(bc.value)); break;
        case OP_pushstring:     push(constant(strings[bc.index])); break;
        case OP_pushint:        push(constant(ints[bc.index])); break;
        case OP_pushuint:       push(constant(uints[bc.index])); break;
        case OP_pushdouble:     push(constant(doubles[bc.index])); break;
        case OP_pushtrue:       push(constant(true)); break;
        case OP_pushfalse:      push(constant(false)); break;
        case OP_pushnan:        push(constant(NaN)); break;
        case OP_pop:            popValue(); break;
        case OP_dup:            duplicate(state.stack.pop()); break;
        case OP_swap:           state.stack.push(state.stack.pop(), state.stack.pop()); break;
        case OP_pushscope:
          flushStack();
          obj = state.stack.pop();
          emitStatement(new AssignmentExpression(scopeName, "=",
                                                 new NewExpression(new Identifier("Scope"), [scopeName, obj])));
          state.scopeHeight += 1;
          break;
        case OP_pushnamespace:  notImplemented(); break;
        case OP_li8:            notImplemented(); break;
        case OP_li16:           notImplemented(); break;
        case OP_li32:           notImplemented(); break;
        case OP_lf32:           notImplemented(); break;
        case OP_lf64:           notImplemented(); break;
        case OP_si8:            notImplemented(); break;
        case OP_si16:           notImplemented(); break;
        case OP_si32:           notImplemented(); break;
        case OP_sf32:           notImplemented(); break;
        case OP_sf64:           notImplemented(); break;
        case OP_newfunction:
          push(new CallExpression(runtimeProperty("createFunction"), [objectConstant(methods[bc.index]), scopeName]));
          break;
        case OP_call:
          args = state.stack.popMany(bc.argCount);
          obj = state.stack.pop();
          push(new CallExpression(state.stack.pop(), args));
          break;
        case OP_construct:
          args = state.stack.popMany(bc.argCount);
          obj = state.stack.pop();
          push(new NewExpression(objectProperty(obj, "instance"), args));
          break;
        case OP_callmethod:     notImplemented(); break;
        case OP_callstatic:     notImplemented(); break;
        case OP_callsuper:
          flushStack();
          multiname = multinames[bc.index];
          args = state.stack.popMany(bc.argCount);
          obj = state.stack.pop();
          push(getProperty(superOf(obj), multiname) + ".call" + argumentList.apply(null, [obj].concat(args)));
          push(new CallExpression(objectProperty(getProperty(superOf(obj), multiname), "call"), [obj].concat(args)));
          break;
        case OP_callproperty:
          flushStack();
          multiname = multinames[bc.index];
          args = state.stack.popMany(bc.argCount);
          obj = state.stack.pop();
          push(new CallExpression(objectProperty(getProperty(obj, multiname), "call"), [obj].concat(args)));
          break;
        case OP_returnvoid:     emitStatement(new ReturnStatement()); break;
        case OP_returnvalue:    emitStatement(new ReturnStatement(state.stack.pop())); break;
        case OP_constructsuper:
          args = state.stack.popMany(bc.argCount);
          obj = state.stack.pop();
          emitStatement(new CallExpression(objectProperty(superClassInstanceObject(), "call"), [obj].concat(args)));
          break;
        case OP_constructprop:
          multiname = multinames[bc.index];
          args = state.stack.popMany(bc.argCount);
          obj = state.stack.pop();
          push(new NewExpression(objectProperty(getProperty(obj, multiname), "instance"), args));
          break;
        case OP_callsuperid:    notImplemented(); break;
        case OP_callproplex:
          multiname = multinames[bc.index];
          args = state.stack.popMany(bc.argCount);
          obj = state.stack.pop();
          push(getProperty(obj, multiname) + ".call" + argumentList.apply(null, [obj].concat(args)));
          break;
        case OP_callinterface:  notImplemented(); break;
        case OP_callsupervoid:
          flushStack();
          multiname = multinames[bc.index];
          args = state.stack.popMany(bc.argCount);
          obj = state.stack.pop();
          emitStatement(getProperty(superOf(obj), multiname) + ".call" + argumentList.apply(null, [obj].concat(args)));
          break;
        case OP_callpropvoid:
          multiname = multinames[bc.index];
          args = state.stack.popMany(bc.argCount);
          obj = state.stack.pop();
          assert(!multiname.isRuntime());
          emitStatement(getProperty(obj, multiname) + ".call" + argumentList.apply(null, [obj].concat(args)));
          break;
        case OP_sxi1:           notImplemented(); break;
        case OP_sxi8:           notImplemented(); break;
        case OP_sxi16:          notImplemented(); break;
        case OP_applytype:
          args = state.stack.popMany(bc.argCount);
          factory = state.stack.pop();
          push("applyType" + argumentList(factory, args));
          flushStack();
          break;
        case OP_pushfloat4:     notImplemented(); break;
        case OP_newobject:
          var nameValuePairs = [];
          for (var i = 0; i < bc.argCount; i++) {
            var pair = state.stack.popMany(2);
            nameValuePairs.push(pair[0] + ": " + pair[1]);
          }
          push("{" + nameValuePairs.join(", ") + "}");
          break;
        case OP_newarray:       push("[" + state.stack.popMany(bc.argCount) + "]"); break;
        case OP_newactivation:
          assert (this.method.needsActivation());
          emitStatement("var activation = " + objectConstant(abc) + ".runtime.createActivation" + argumentList(objectConstant(this.method)));
          push("activation");
          break;
        case OP_newclass:
          push(objectConstant(abc) + ".runtime.createClass" + argumentList(objectConstant(abc.classes[bc.index]), state.stack.pop(), scopeName));
          break;
        case OP_getdescendants: notImplemented(); break;
        case OP_newcatch:       notImplemented(); break;
        case OP_findpropstrict:
          multiname = multinames[bc.index];
          assertNotImplemented (!multiname.isRuntime());
          push(findProperty(multiname, true));
          break;
        case OP_findproperty:
          multiname = multinames[bc.index];
          assertNotImplemented (!multiname.isRuntime());
          push(findProperty(multiname, false));
          break;
        case OP_finddef:        notImplemented(); break;
        case OP_getlex:
          multiname = multinames[bc.index];
          assert (!multiname.isRuntime());
          push(getProperty(findProperty(multiname, true), multiname));
          break;
        case OP_setproperty:
          value = state.stack.pop();
          multiname = multinames[bc.index];
          flushStack();
          if (!multiname.isRuntime()) {
            obj = state.stack.pop();
            emitStatement(new CallExpression(new Identifier("setProperty"), [obj, objectConstant(multiname), value]));
          } else {
            ns = name = null;
            if (multiname.isRuntimeName()) {
              name = state.stack.pop();
            }
            if (multiname.isRuntimeNamespace()) {
              ns = state.stack.pop();
            }
            obj = state.stack.pop();
            emitStatement(obj + "." + SET_ACCESSOR + "(" + name + ", " + value + ")");
            emitStatement(new CallExpression(objectProperty(obj, SET_ACCESSOR), [name, value]));
          }
          break;
        case OP_getlocal:       push(local[bc.index]); break;
        case OP_setlocal:       setLocal(bc.index); break;
        case OP_getglobalscope:
          push(objectProperty(scopeName, "global.object"));
          break;
        case OP_getscopeobject:
          obj = scopeName;
          for (var i = 0; i < (state.scopeHeight - 1) - bc.index; i++) {
            obj += ".parent";
          }
          push(obj + ".object");
          break;
        case OP_getproperty:
          multiname = multinames[bc.index];
          if (!multiname.isRuntime()) {
            obj = state.stack.pop();
            push(getProperty(obj, multiname));
          } else {
            ns = name = null;
            if (multiname.isRuntimeName()) {
              name = state.stack.pop();
            }
            if (multiname.isRuntimeNamespace()) {
              ns = state.stack.pop();
            }
            obj = state.stack.pop();
            push(new GetPropertyRuntime(obj, ns, name));
          }
          break;
        case OP_getouterscope:      notImplemented(); break;
        case OP_initproperty:
          value = state.stack.pop();
          multiname = multinames[bc.index];
          if (!multiname.isRuntime()) {
            obj = state.stack.pop();
            emitStatement("setProperty" + argumentList(obj, objectConstant(multiname), value));
          } else {
            notImplemented();
          }
          break;
        case OP_setpropertylate:    notImplemented(); break;
        case OP_deleteproperty:
          multiname = multinames[bc.index];
          if (!multiname.isRuntime()) {
            obj = state.stack.pop();
            push("deleteProperty" + argumentList(obj, objectConstant(multiname)));
            flushStack();
          } else {
            notImplemented();
          }
          break;
        case OP_deletepropertylate: notImplemented(); break;
        case OP_getslot:            getSlot(state.stack.pop(), bc.index); break;
        case OP_setslot:
          value = state.stack.pop();
          obj = state.stack.pop();
          setSlot(obj, bc.index, value);
          break;
        case OP_getglobalslot:  notImplemented(); break;
        case OP_setglobalslot:  notImplemented(); break;
        case OP_convert_s:      push("toString" + argumentList(state.stack.pop())); break;
        case OP_esc_xelem:      notImplemented(); break;
        case OP_esc_xattr:      notImplemented(); break;
        case OP_coerce_i:
        case OP_convert_i:
          push("toInt" + argumentList(state.stack.pop()));
          break;
        case OP_coerce_u:
        case OP_convert_u:
          push("toUint" + argumentList(state.stack.pop()));
          break;
        case OP_coerce_d:
        case OP_convert_d:
          push("toDouble" + argumentList(state.stack.pop()));
          break;
        case OP_coerce_b:
        case OP_convert_b:
          push("toBoolean" + argumentList(state.stack.pop()));
          break;
        case OP_convert_o:      notImplemented(); break;
        case OP_checkfilter:    notImplemented(); break;
        case OP_convert_f:      notImplemented(); break;
        case OP_unplus:         notImplemented(); break;
        case OP_convert_f4:     notImplemented(); break;
        case OP_coerce:
          value = state.stack.pop();
          multiname = multinames[bc.index];
          type = getProperty(findProperty(multiname, true), multiname);
          push("coerce" + argumentList(value, type));
        case OP_coerce_a:       /* NOP */ break;
        case OP_coerce_s:       push("coerceString" + argumentList(state.stack.pop())); break;
        case OP_astype:         notImplemented(); break;
        case OP_astypelate:     notImplemented(); break;
        case OP_coerce_o:       notImplemented(); break;
        case OP_negate:         expression(Operator.NEG); break;
        case OP_increment:
          push(constant(1));
          expression(Operator.ADD);
          break;
        case OP_inclocal:
          emitStatement("++" + local[bc.index]);
          break;
        case OP_decrement:
          push(constant(1));
          expression(Operator.SUB);
          break;
        case OP_declocal:
          emitStatement("--" + local[bc.index]);
          break;
        case OP_typeof:
          push("typeOf" + argumentList(state.stack.pop()));
          break;
        case OP_not:            expression(Operator.FALSE); break;
        case OP_bitnot:         expression(Operator.BITWISE_NOT); break;
        case OP_add_d:          notImplemented(); break;
        case OP_add:            expression(Operator.ADD); break;
        case OP_subtract:       expression(Operator.SUB); break;
        case OP_multiply:       expression(Operator.MUL); break;
        case OP_divide:         expression(Operator.DIV); break;
        case OP_modulo:         expression(Operator.MOD); break;
        case OP_lshift:         expression(Operator.LSH); break;
        case OP_rshift:         expression(Operator.RSH); break;
        case OP_urshift:        expression(Operator.URSH); break;
        case OP_bitand:         expression(Operator.AND); break;
        case OP_bitor:          expression(Operator.OR); break;
        case OP_bitxor:         expression(Operator.XOR); break;
        case OP_equals:         expression(Operator.EQ); break;
        case OP_strictequals:   expression(Operator.SEQ); break;
        case OP_lessthan:       expression(Operator.LT); break;
        case OP_lessequals:     expression(Operator.LE); break;
        case OP_greaterthan:    expression(Operator.GT); break;
        case OP_greaterequals:  expression(Operator.GE); break;
        case OP_instanceof:
          // TODO: Temporary implementation, totally broken.
          state.stack.pop();
          state.stack.pop();
          push(constant(true));
          break;
        case OP_istype:
          value = state.stack.pop();
          multiname = multinames[bc.index];
          assert (!multiname.isRuntime());
          type = getProperty(findProperty(multiname, true), multiname);
          push(type + " instanceof Class ? " + type + ".isInstance" + argumentList(value) + " : false");
          break;
        case OP_istypelate:
          type = state.stack.pop();
          value = state.stack.pop();
          push(type + " instanceof Class ? " + type + ".isInstance" + argumentList(value) + " : false");
          break;
        case OP_in:             notImplemented(); break;
        case OP_increment_i:
          toInt32();
          push(constant(1));
          expression(Operator.ADD);
          break;
        case OP_decrement_i:
          toInt32();
          push(constant(1));
          expression(Operator.SUB);
          break;
        case OP_inclocal_i:     notImplemented(); break;
        case OP_declocal_i:     notImplemented(); break;
        case OP_negate_i:       notImplemented(); break;
        case OP_add_i:          notImplemented(); break;
        case OP_subtract_i:     notImplemented(); break;
        case OP_multiply_i:     notImplemented(); break;
        case OP_getlocal0:
        case OP_getlocal1:
        case OP_getlocal2:
        case OP_getlocal3:
          push(local[op - OP_getlocal0]);
          break;
        case OP_setlocal0:
        case OP_setlocal1:
        case OP_setlocal2:
        case OP_setlocal3:
          setLocal(op - OP_setlocal0);
          break;
        case OP_debug:
          /* NOP */
          break;
        case OP_debugline:
          emitComment("line: " + bc.lineNumber);
          break;
        case OP_debugfile:
          emitComment("file: " + strings[bc.index]);
          break;
        case OP_bkptline:       notImplemented(); break;
        case OP_timestamp:      notImplemented(); break;
        default:
          console.info("Not Implemented: " + bc);
        }

        if (writer) {
          state.trace(writer);
          writer.enter("body: {");
          for (var i = 0; i < body.length; i++) {
            writer.writeLn(escodegen.generate(body[i]));
          }
          writer.leave("}");
        }
      }
    };
    return compilation;
  })();

  compiler.prototype.compileMethod = function compileMethod(methodInfo, hasDefaults, scope) {
    assert(methodInfo.analysis);
    var cx = new Compilation(this, methodInfo, scope);
    var node = methodInfo.analysis.controlTree.compile(cx, cx.state);
    print("Result: " + escodegen.generate(node, {base: "", indent: "  "}));
  };

  return compiler;
})();
