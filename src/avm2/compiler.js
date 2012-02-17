var C = [];

function objectId(obj) {
  assert(obj);
  if (obj.hasOwnProperty("objectId")) {
    return obj.objectId;
  }
  return registerObject(obj);
}

function registerObject(obj) {
  var id = C.length;
  Object.defineProperty(obj, "objectId", {value: id, writable: false, enumerable: false});
  C.push(obj);
  return id;
}

function getLocalVariableName(i) {
  if (i < 26) {
    return String.fromCharCode("a".charCodeAt(0) + i);
  }
  return "v" + (i - 26);
}

/**
 * Used as a marker to help with source indentation.
 */
function Indent(statements) {
  this.statements = statements;
}

var Compiler = (function () {

  /* Attach compile method to each control structure node. These thread a compilation context as well
   * as an abstract program state. As control nodes are visited recursively, they construct a tree of
   * statement arrays which if flattened after compilation is done.
   */

  Control.LabeledBreak.prototype.compile = function (mcx, state) {
    notImplemented();
  };

  Control.LabeledContinue.prototype.compile = function (mcx) {
    notImplemented();
  };

  Control.Break.compile = function (mcx, state) {
    return {statements: ["break;"]};
  };

  Control.Continue.compile = function (mcx, state) {
    return {statements: ["continue;"]};
  };

  Control.Return.compile = function (mcx, state) {
    return {statements: []};
  };

  Control.Clusterfuck.prototype.compile = function (mcx, state) {
    notImplemented();
  };

  Control.Seq.prototype.compile = function (mcx, state) {
    var statements = [];
    this.body.forEach(function (block) {
      var result = block.compile(mcx, state);
      statements.push(result.statements);
    });
    return {statements: statements};
  };

  Bytecode.prototype.compile = function (mcx, state) {
    return mcx.compileBlock(this, state);
  };

  Control.Loop.prototype.compile = function (mcx, state) {
    var body = this.body;
    var statements = [];

    if (body instanceof Control.Seq && 
        body.first() instanceof Control.If && body.first().isThenBreak()) {
      ir = body.first().compile(mcx, state);
      statements.push("while (" + ir.condition.negate() + ") {");
      statements.push(new Indent(body.slice(1).compile(mcx, state).statements));
      statements.push("}");
    } else {
      statements.push("while (true) {");
      statements.push(new Indent(body.compile(mcx, state).statements));
      statements.push("}");
    }
    return {statements: statements};
  };

  Control.If.prototype.isThenBreak = function () {
    return this.then === Control.Break && !this.else; 
  };

  Control.If.prototype.compile = function (mcx, state) {
    var cr = this.cond.compile(mcx, state);
    var tr = this.then.compile(mcx, cr.state.clone());
    var er = null;
    if (this.else) {
      er = this.else.compile(mcx, cr.state.clone());
    }
    var condition = this.negated ? cr.condition.negate() : cr.condition;
    var statements = cr.statements;
    statements.push("if (" + condition + ") {");
    statements.push(new Indent(tr.statements));
    if (er) {
      statements.push("} else {");
      statements.push(new Indent(er.statements));
    }
    statements.push("}");
    return {statements: statements, condition: condition};
  };

  /**
   * Abstract program state.
   */
  var State = (function () {
    function state() {
      this.local = [];
      this.stack = [];
      this.scope = [];
    }
    state.prototype.clone = function clone() {
      var s = new State();
      s.local = this.local.slice(0);
      s.stack = this.stack.slice(0);
      s.scope = this.scope.slice(0);
      return s;
    };
    state.prototype.pushLocal = function pushLocal(index) {
      this.stack.push(this.local[index]);
    };
    state.prototype.callExpression = function callExpression(name, argumentCount) {
      var arguments = this.stack.popMany(argumentCount);
      this.stack.push(name + "(" + arguments.join(",") + ")");
    };

    state.prototype.trace = function trace(writer) {
      writer.enter("scope:");
      writer.writeArray(this.scope);
      writer.outdent();
      writer.enter("local:");
      writer.writeArray(this.local);
      writer.outdent();
      writer.enter("stack:");
      writer.writeArray(this.stack);
      writer.outdent();
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
    operator.OR = new operator("|", function (l, r) { return l | r; }, true, false);
    operator.XOR = new operator("^", function (l, r) { return l ^ r; }, true, false);

    operator.LSH = new operator("<<", function (l, r) { return l << r; }, true, false);
    operator.RSH = new operator(">>", function (l, r) { return l >> r; }, true, false);
    operator.URSH = new operator(">>>", function (l, r) { return l >>> r; }, true, false);
    /* TODO */

    operator.SEQ = new operator("===", function (l, r) { return l === r; }, true, true);
    operator.SNE = new operator("!==", function (l, r) { return l !== r; }, true, true);
    operator.EQ = new operator("==", function (l, r) { return l == r; }, true, true);
    operator.NE = new operator("!=", function (l, r) { return l != r; }, true, true);
    operator.LE = new operator("<=", function (l, r) { return l <= r; }, true, true);
    operator.GT = new operator(">", function (l, r) { return l > r; }, true, true);
    operator.LT = new operator("<", function (l, r) { return l < r; }, true, true);
    operator.GE = new operator(">=", function (l, r) { return l >= r; }, true, true);
    operator.NOT = new operator("~", function (a) { return ~a; }, false, true);
    operator.NEG = new operator("!", function (a) { return !a; }, false, true);

    function linkOpposites(a, b) {
      a.not = b;
      b.not = a;
    }

    linkOpposites(operator.SEQ, operator.SNE);
    linkOpposites(operator.EQ, operator.NE);
    linkOpposites(operator.LE, operator.GT);
    linkOpposites(operator.LT, operator.GE);

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

  /**
   * As we perform abstract interpretation we create expression trees. Expressions are flattened when they
   * are assigned to local variables. Dealing with expressions this way gives us more flexibility and allows
   * us to perform optimizations.
   */
  var Expression = (function () {
    function expression(left, operator, right) {
      this.left = left;
      this.right = right;
      this.operator = operator;
    }
    /**
     * Creates a new expression with the operator negated, this is usually used when we want to negate a
     * branch condition.
     */
    expression.prototype.negate = function negate() {
      assert(this.operator.isConditional());
      if (this.operator === Operator.EQ && this.right instanceof Constant && this.right.value === false) {
        return this.left;
      }
      return new expression(this.left, this.operator.not, this.right);
    };
    expression.prototype.isBinary = function isBinary() {
      return !!this.right;
    };
    expression.prototype.isUnary = function isUnary() {
      return !this.right;
    };
    expression.prototype.eval = function eval() {
      return this.operator.eval(left, right);
    };
    expression.prototype.toString = function toString() {
      if (this.isBinary()) {
        return this.left + " " + this.operator + " " + this.right;
      } else {
        return this.operator + this.left;
      }
    }
    return expression;
  })();

  var Call = (function () {
    function call(obj, name, arguments) {
      this.obj = obj;
      this.name = name;
      this.arguments = arguments || [];
    }
    call.prototype.toString = function toString() {
      var str = this.obj ? this.obj.toString() + "." : "";
      return str + this.name + "(" + this.arguments.join(", ") + ")";
    };
    return call;
  })();

  function objectConstant(obj) {
    return "C[" + objectId(obj) + "]";
  }

  var FindProperty = (function () {
    function findProperty(multiname, strict) {
      this.multiname = multiname;
      this.strict = strict;
    };
    findProperty.prototype.toString = function toString() {
      return new Call("scope", "findProperty", [objectConstant(this.multiname), this.strict]).toString();
    };
    return findProperty;
  })();

  var GetProperty = (function () {
    function getProperty(obj, multiname) {
      this.obj = obj;
      this.multiname = multiname;
    };
    getProperty.prototype.toString = function toString() {
      return this.obj + "." + this.multiname.name;
    };
    return getProperty;
  })();

  /**
   * Wrapper around a named local variable.
   */
  var Variable = (function () {
    function variable(name) {
      this.name = name;
    }
    variable.prototype.eval = function eval() {
      return this;
    };
    variable.prototype.toString = function toString() {
      return this.name;
    }
    return variable;
  })();

  /**
   * Silly wrapper around constants, so that they fit neatly in our expression trees.
   */
  var Constant = (function () {
    function constant(value) {
      this.value = value;
    }
    constant.prototype.eval = function eval() {
      return this.value;
    };
    constant.prototype.toString = function toString() {
      return this.value;
    }
    return constant;
  })();

  /**
   * Distinguish between literals and string constants.
   */
  var Literal = (function () {
    function literal(value) {
      this.value = value;
    }
    literal.prototype.eval = function eval() {
      return this.value;
    };
    literal.prototype.toString = function toString() {
      return this.value;
    }
    literal.Undefined = new literal("undefined");
    return literal; 
  })();

  function MethodCompilerContext(compiler, method) {
    this.compiler = compiler;
    this.method = method;
    this.worklist = [method.analysis.controlTree];
    this.state = new State();
    this.writer = new IndentingWriter();
    

    /* Initialize local variables. */
    this.local = [new Variable("this")];
    for (var i = 1; i < method.localCount; i++) {
      this.local.push(new Variable(getLocalVariableName(i - 1)));
    }
    this.state.local = this.local.slice(0);

    this.temporary = [new Variable("t0")];
    
    this.header = [];
    this.header.push("var scope = savedScope;");
  }

  MethodCompilerContext.prototype.compileBlock = function compileBlock(block, state) {
    var writer = this.writer;
    // writer = false;

    if (writer) {
      writer.enter("block " + block.blockId + " [" + block.position + "-" + block.end.position + "] {");
      writer.enter("entryState {");
      state.trace(writer);
      writer.leave("}");
    }

    var statements = [];

    function getSlot(obj, index) {
      state.stack.push(obj + ".S" + index);
    }

    function setSlot(obj, index, value) {
      assert (state.stack.length == 0);
      statements.push(obj + ".S" + index + " = " + value +";");
    }

    var local = this.local;
    var temporary = this.temporary;

    function expression(operator) {
      var b = state.stack.pop();
      var a = state.stack.pop();
      state.stack.push(new Expression(a, operator, b));
    }

    function setLocal(index) {
      state.local[index] = state.stack.pop();
      flushLocals();
    }

    function flushLocals() {
      for (var i = 0; i < local.length; i++) {
        if (local[i] !== state.local[i]) {
          emitStatement(local[i] + " = " + state.local[i]);
          state.local[i] = local[i];
        }
      }
    }

    /**
     * Stores all stack values into temporaries. At the end of a block, the state stack
     * may not be empty. This usually occurs for short-circuited conditional expressions.
     */
    function flushStack() {
      assert (state.stack.length <= 1);
      for (var i = 0; i < state.stack.length; i++) {
        if (state.stack[i] !== temporary[i]) {
          emitStatement(temporary[i] + " = " + state.stack[i]);
          state.stack[i] = temporary[i];
        }
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
      condition = new Expression(a, operator, b);
    }

    function emitStatement(statement) {
      statements.push(statement + ";");
    }
    
    function emitComment(comment) {
      statements.push("/* " + comment + " */");
    }

    var abc = this.compiler.abc;
    var ints = abc.constantPool.ints;
    var uints = abc.constantPool.uints;
    var doubles = abc.constantPool.doubles;
    var strings = abc.constantPool.strings;
    var methods = abc.methods;
    var multinames = abc.constantPool.multinames;
    var classes = abc.classes;

    var multiname, args, value, obj, res;

    function createMultiname(multiname) {
      if (multiname.isRuntime()) {
        multiname = multiname.clone();
        if (multiname.isRuntimeName()) {
          multiname.setName(state.stack.pop());
        }
        if (multiname.isRuntimeNamespace()) {
          multiname.setNamespace(state.stack.pop());
        }
      }
      assert(!multiname.isRuntime());
      return multiname;
    }

    function getAndCreateMultiname(multiname) {
      return createMultiname(multiname);
    }

    var bytecodes = this.method.analysis.bytecodes;
    for (var bci = block.position, end = block.end.position; bci <= end; bci++) {
      var bc = bytecodes[bci];
      var op = bc.op;

      if (writer) {
        writer.enter("bytecode bci: " + bci + ", name: " + opcodeName(op) + " {");
      }

      switch (op) {
      case OP_bkpt:           notImplemented(); break;
      case OP_nop:            notImplemented(); break;
      case OP_throw:          notImplemented(); break;
      case OP_getsuper:       notImplemented(); break;
      case OP_setsuper:       notImplemented(); break;
      case OP_dxns:           notImplemented(); break;
      case OP_dxnslate:       notImplemented(); break;
      case OP_kill:           /* NOP */ break;
      case OP_label: 
        /* Do nothing. Used to indicate that this location is the target of a branch, which
         * is only useful for static analysis. */
        break;
      case OP_lf32x4:         notImplemented(); break;
      case OP_sf32x4:         notImplemented(); break;
      case OP_ifnlt:          setCondition(Operator.GE); break;
      case OP_ifge:           setCondition(Operator.GE); break;
      case OP_ifnle:          setCondition(Operator.GT); break;
      case OP_ifgt:           setCondition(Operator.GT); break;
      case OP_ifngt:          setCondition(Operator.LE); break;
      case OP_ifle:           setCondition(Operator.LE); break;
      case OP_ifnge:          setCondition(Operator.LT); break;
      case OP_iflt:           setCondition(Operator.LT); break;
      case OP_jump:
        // NOP
        break;
      case OP_iftrue:
        state.stack.push(new Constant(true));
        setCondition(Operator.EQ);
        break;
      case OP_iffalse:
        state.stack.push(new Constant(false));
        setCondition(Operator.EQ);
        break;
      case OP_ifeq:           setCondition(Operator.EQ); break;
      case OP_ifne:           setCondition(Operator.NE); break;
      case OP_ifstricteq:     setCondition(Operator.SEQ); break;
      case OP_ifstrictne:     setCondition(Operator.SNE); break;
      case OP_lookupswitch:   notImplemented(); break;
      case OP_pushwith:       notImplemented(); break;
      case OP_popscope:       notImplemented(); break;
      case OP_nextname:       notImplemented(); break;
      case OP_hasnext:        notImplemented(); break;
      case OP_pushnull:       notImplemented(); break; 
      case OP_pushundefined:  state.stack.push(Literal.Undefined); break;
      case OP_pushfloat:      notImplemented(); break;
      case OP_nextvalue:      notImplemented(); break;
      case OP_pushbyte:       state.stack.push(new Constant(bc.value)); break;
      case OP_pushshort:      state.stack.push(new Constant(bc.value)); break;
      case OP_pushstring:     state.stack.push(new Constant("\"" + strings[bc.index]) + "\""); break;
      case OP_pushint:        state.stack.push(new Constant(ints[bc.index])); break;
      case OP_pushuint:       state.stack.push(new Constant(uints[bc.index])); break;
      case OP_pushdouble:     state.stack.push(new Constant(doubles[bc.index])); break;
      case OP_pushtrue:       state.stack.push(new Constant(true)); break;
      case OP_pushfalse:      state.stack.push(new Constant(false)); break;
      case OP_pushnan:        state.stack.push(new Constant(NaN)); break;
      case OP_pop:
        emitStatement(state.stack.pop());
        break;
      case OP_dup:            state.stack.push(state.stack.peek()); break;
      case OP_swap:           state.stack.push(state.stack.pop(), state.stack.pop()); break;
      case OP_pushscope:
        obj = state.stack.pop();
        emitStatement("scope = new " + new Call(null, "Scope", ["scope", obj]));
        state.scope.push(obj);
        break;
      case OP_pushnamespace:  notImplemented(); break;
      case OP_hasnext2:       notImplemented(); break;
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
        value = new Call(null, "createFunction", [objectConstant(methods[bc.index])]);
        value = new Call(value, "bind", ["null", "scope"]);
        state.stack.push(value);
        break;
      case OP_call:
        args = state.stack.popMany(bc.argCount);
        obj = state.stack.pop();
        print("Args: " + bc.argCount);
        state.stack.push(new Call(state.stack.pop(), "call", [obj].concat(args)));
        break;
      case OP_construct:      notImplemented(); break;
      case OP_callmethod:     notImplemented(); break;
      case OP_callstatic:     notImplemented(); break;
      case OP_callsuper:      notImplemented(); break;
      case OP_callproperty:
        multiname = getAndCreateMultiname(multinames[bc.index]);
        args = state.stack.popMany(bc.argCount);
        obj = state.stack.pop();
        state.stack.push(new Call(new GetProperty(obj, multiname), "call", [obj].concat(args)));
        break;
      case OP_returnvoid:     emitStatement("return"); break;
      case OP_returnvalue:    emitStatement("return " + state.stack.pop()); break;
      case OP_constructsuper: notImplemented(); break;
      case OP_constructprop:  notImplemented(); break;
      case OP_callsuperid:    notImplemented(); break;
      case OP_callproplex:    notImplemented(); break;
      case OP_callinterface:  notImplemented(); break;
      case OP_callsupervoid:  notImplemented(); break;
      case OP_callpropvoid:   notImplemented(); break;
      case OP_sxi1:           notImplemented(); break;
      case OP_sxi8:           notImplemented(); break;
      case OP_sxi16:          notImplemented(); break;
      case OP_applytype:      notImplemented(); break;
      case OP_pushfloat4:     notImplemented(); break;
      case OP_newobject:      notImplemented(); break;
      case OP_newarray:       state.stack.push(new Literal("[]")); break;
      case OP_newactivation:
        assert (this.method.needsActivation());
        emitStatement("var activation = " + new Call(null, "createActivation", [objectConstant(this.method)]));
        state.stack.push("activation");
        break;
      case OP_newclass:       notImplemented(); break;
      case OP_getdescendants: notImplemented(); break;
      case OP_newcatch:       notImplemented(); break;
      case OP_findpropstrict:
        multiname = getAndCreateMultiname(multinames[bc.index]);
        state.stack.push(new FindProperty(multiname, true));
        break;
      case OP_findproperty:
        multiname = getAndCreateMultiname(multinames[bc.index]);
        state.stack.push(new FindProperty(multiname, false));
        break;
      case OP_finddef:        notImplemented(); break;
      case OP_getlex:         notImplemented(); break;
      case OP_setproperty:
        value = state.stack.pop();
        multiname = getAndCreateMultiname(multinames[bc.index]);
        obj = state.stack.pop();
        emitStatement(obj + "[" + multiname.name + "] = " + value);
        break;
      case OP_getlocal:       state.pushLocal(bc.index); break;
      case OP_setlocal:       setLocal(bc.index); break;
      case OP_getglobalscope: 
        state.stack.push("scope.global.object");
        break;
      case OP_getscopeobject:
        obj = "scope";
        for (var i = 0; i < bc.index; i++) {
          obj += ".parent";
        }
        state.stack.push(obj + ".object");
        break;
      case OP_getproperty:
        multiname = getAndCreateMultiname(multinames[bc.index]);
        obj = state.stack.pop();
        state.stack.push(new GetProperty(obj, multiname));
        break;
      case OP_getouterscope:      notImplemented(); break;
      case OP_initproperty:       notImplemented(); break;
      case OP_setpropertylate:    notImplemented(); break;
      case OP_deleteproperty:     notImplemented(); break;
      case OP_deletepropertylate: notImplemented(); break;
      case OP_getslot:            getSlot(state.stack.pop(), bc.index); break;
      case OP_setslot: 
        value = state.stack.pop();
        obj = state.stack.pop();
        setSlot(obj, bc.index, value);
        break;
      case OP_getglobalslot:  notImplemented(); break;
      case OP_setglobalslot:  notImplemented(); break;
      case OP_convert_s:      notImplemented(); break;
      case OP_esc_xelem:      notImplemented(); break;
      case OP_esc_xattr:      notImplemented(); break;
      case OP_convert_i:      notImplemented(); break;
      case OP_convert_u:      notImplemented(); break;
      case OP_convert_d:      notImplemented(); break;
      case OP_convert_b:
        /* NOP state.callExpression("toBoolean", 1); */
        break;
      case OP_convert_o:      notImplemented(); break;
      case OP_checkfilter:    notImplemented(); break;
      case OP_convert_f:      notImplemented(); break;
      case OP_unplus:         notImplemented(); break;
      case OP_convert_f4:     notImplemented(); break;
      case OP_coerce:         notImplemented(); break;
      case OP_coerce_b:       notImplemented(); break;
      case OP_coerce_a:       /* NOP */ break;
      case OP_coerce_i:       notImplemented(); break;
      case OP_coerce_d:       notImplemented(); break;
      case OP_coerce_s:       notImplemented(); break;
      case OP_astype:         notImplemented(); break;
      case OP_astypelate:     notImplemented(); break;
      case OP_coerce_u:       notImplemented(); break;
      case OP_coerce_o:       notImplemented(); break;
      case OP_negate:         expression(Operator.NEG); break;
      case OP_increment:
        state.stack.push(new Constant(1));
        expression(Operator.ADD);
        break;
      case OP_inclocal:       notImplemented(); break;
      case OP_decrement:      notImplemented(); break;
      case OP_declocal:       notImplemented(); break;
      case OP_typeof:         notImplemented(); break;
      case OP_not:            notImplemented(); break;
      case OP_bitnot:         expression(Operator.NOT); break;
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
      case OP_instanceof:     notImplemented(); break;
      case OP_istype:         notImplemented(); break;
      case OP_istypelate:     notImplemented(); break;
      case OP_in:             notImplemented(); break;
      case OP_increment_i:    notImplemented(); break;
      case OP_decrement_i:    notImplemented(); break;
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
        state.pushLocal(op - OP_getlocal0);
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
        console.info("Not Implemented: " + opcodeName(bc));
      }

      if (writer) {
        state.trace(writer);
        writer.enter("statements:");
        writer.writeArray(statements);
        writer.outdent();
        writer.leave("}");
      }
    }

    if (writer) {
      writer.leave("}");
    }

    flushStack();

    return {state: state, condition: condition, statements: statements};
  };

  function compiler(abc) {
    this.abc = abc;
  };

  compiler.prototype.compileMethod = function compileMethod(method) {
    assert(method.analysis);
    var mcx = new MethodCompilerContext(this, method);
    var statements = mcx.header;
    statements.push(method.analysis.controlTree.compile(mcx, mcx.state).statements);
    return {statements: statements};
  }

  return compiler;
})();

var createFunction;
var createActivation;

function applyTraits(obj, traits) {
  traits.forEach(function (trait) {
    if (trait.isSlot()) {
      obj["S" + trait.slotId] = trait.value;
      Object.defineProperty(obj, trait.name.name, {
        get: function () {
          return obj["S" + trait.slotId];
        },
        set: function (val) {
          return obj["S" + trait.slotId] = val;
        }
      });
    }
  });
}

function compileAbc(abc) {
  var runtime = new Runtime(abc);
  createFunction = runtime.createFunction.bind(runtime);
  createActivation = runtime.createActivation.bind(runtime);
  
  var global = {
    trace: function (val) {
      console.info(val);
    }
  };
  applyTraits(global, abc.lastScript.traits);
  
  var fn = runtime.createFunction(abc.entryPoint);
  print(fn);
  fn.call(global, null);
}

var Scope = (function () {
  function scope(parent, object) {
    this.parent = parent;
    this.object = object;
  }
  
  Object.defineProperty(scope.prototype, "global", {
    get: function () {
      if (this.parent === null) {
        return this;
      } else {
        return this.parent.global;
      }
    }
  });
  
  scope.prototype.findProperty = function(multiname, strict) {
    if (this.object.hasOwnProperty(multiname.name)) {
      return this.object;
    } else if (this.parent) {
      return this.parent.findProperty(multiname, strict);
    }
  }

  return scope;
})();

var Runtime = (function () {
  function runtime(abc) {
    this.abc = abc;
    this.compiler = new Compiler(abc);
  }

  runtime.prototype.createActivation = function (method) {
    var obj = {};
    applyTraits(obj, method.traits);
    return obj;
  };
  
  runtime.prototype.createFunction = function (method) {
    method.analysis = new Analysis(method);
    method.analysis.analyzeControlFlow();
    var result = this.compiler.compileMethod(method, true);

    var defaultParameters = ["savedScope"];
    var parameters = defaultParameters.concat(method.parameters.mapWithIndex(function (p, i) {
      var name = p.name || getLocalVariableName(i);
      if (p.type) {
        name += "_" + p.type.name;
      }
      return name;
    }));

    function flatten(array, indent) {
      var str = "";
      array.forEach(function (x) {
        if (x instanceof Indent) {
          str += flatten(x.statements, indent + "  ");
        } else if (x instanceof Array) {
          str += flatten(x, indent);
        } else {
          str += indent + x + "\n";
        }
      })
      return str;
    }

    print("Created Function: " + parameters.join(", "));
    print('\033[92m' + flatten(result.statements, "") + '\033[0m');

    return new Function(parameters, flatten(result.statements, ""));
  };
  return runtime;
})();