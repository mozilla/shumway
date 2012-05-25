var enableCSE = options.register(new Option("cse", "cse", false, "Common Subexpression Elimination"));

/**
 * To embed object references in compiled code we index into globally accessible constant table [$C].
 * This table maintains an unique set of object references, each of which holds its own position in
 * the constant table, thus providing for fast lookup. To embed a reference to an object [k] we call
 * [objectConstant(k)] which may generate the literal "$C[12]".
 */

var $C = [];

const SCOPE_NAME = "$S";
const SAVED_SCOPE_NAME = "$" + SCOPE_NAME;

function objectId(obj) {
  assert(obj);
  if (obj.hasOwnProperty("objectId")) {
    return obj.objectId;
  }
  var id = $C.length;
  Object.defineProperty(obj, "objectId", {value: id, writable: false, enumerable: false});
  $C.push(obj);
  return id;
}

function objectConstant(obj) {
  assert (obj !== undefined);
  return "$C[" + objectId(obj) + "]";
}

function getLocalVariableName(i) {
  if (i < 26) {
    return "l" + String.fromCharCode("A".charCodeAt(0) + i);
  }
  return "l" + (i - 26);
}

/**
 * Used as a marker to help with source indentation.
 */
function Indent(statements) {
  this.statements = statements;
}

var Compiler = (function () {

  /* Print coarse level state vectors at control node boundaries. */
  var controlWriter = false ? new IndentingWriter() : null;

  /* Attach compile method to each control structure node. These thread a compilation context as well
   * as an abstract program state. As control nodes are visited recursively, they construct a tree of
   * statement arrays which if flattened after compilation is done.
   */

  Control.Break.prototype.compile = function (mcx, state) {
    controlWriter && controlWriter.enter("Break {");
    var statements = [];
    if (this.label) {
      statements.push(["var $label = " + this.label + ";"]);
    }
    statements.push("break;");
    var res = {statements: statements, state: state};
    controlWriter && controlWriter.leave("}");
    return res;
  };

  Control.Continue.prototype.compile = function (mcx, state) {
    controlWriter && controlWriter.enter("Continue {");
    var statements = [];
    if (this.label) {
      statements.push(["var $label = " + this.label + ";"]);
    }
    if (this.necessary) {
      statements.push("continue;");
    }
    var res = {statements: statements, state: state};
    controlWriter && controlWriter.leave("}");
    return res;
  };

  Control.Exit.prototype.compile = function (mcx, state) {
    return {statements: ["var $label = " + this.label + ";"], state: state};
  };

  Control.LabelSwitch.prototype.compile = function (mcx, state) {
    var statements = [];
    var firstCase = true;
    this.cases.forEach(function (item) {
      statements.push((firstCase ? "if" : "else if") + "($label === " + item.label + ") {");
      firstCase = false;
      if (item.body) {
        var result = item.body.compile(mcx, state);
        statements.push(result.statements);
      }
      statements.push("}");
    });
    return {statements: statements, state: state};
  };

  Control.Seq.prototype.compile = function (mcx, state) {
    if (controlWriter) {
      controlWriter.enter("Sequence {");
    }
    var statements = [];
    this.body.forEach(function (item) {
      controlWriter && controlWriter.writeLn("entryState: " + state);
      var result = item.compile(mcx, state);
      state = result.state;
      statements.push(result.statements);
    });
    if (controlWriter) {
      controlWriter.writeLn("exitState:  " + state);
      controlWriter.leave("}");
    }
    // TODO: Figure out exit state.
    return {statements: statements, state: state};
  };

  Bytecode.prototype.compile = function (mcx, state) {
    if (controlWriter) {
      controlWriter.enter("Block {");
      controlWriter.writeLn("entryState: " + state);
    }
    var res = mcx.compileBlock(this, state);
    if (controlWriter) {
      controlWriter.writeLn("exitState:  " + res.state);
      controlWriter.leave("}");
    }
    return res;
  };

  Control.Loop.prototype.compile = function (mcx, state) {
    if (controlWriter) {
      controlWriter.enter("Loop {");
      controlWriter.writeLn("entryState: " + state);
    }

    var body = this.body;
    var statements = [];

    // TODO: The while condition may have statements, temporarily disabling
    // this optimization.
    if (false && body instanceof Control.Seq &&
        body.first() instanceof Control.If &&
        body.first().isThenBreak()) {
      ir = body.first().compile(mcx, state);
      statements.push("while (" + ir.condition.negate() + ") {");
      statements.push(new Indent(body.slice(1).compile(mcx, state).statements));
      statements.push("}");
    } else {
      statements.push("while (true) {");
      statements.push(new Indent(body.compile(mcx, state).statements));
      statements.push("}");
    }
    if (controlWriter) {
      controlWriter.writeLn("exitState:  " + state);
      controlWriter.leave("}");
    }
    return {statements: statements, state: state};
  };

  Control.Switch.prototype.compile = function (mcx, state) {
    var result = this.determinant.compile(mcx, state);
    var statements = result.statements;
    statements.push("switch (" + result.state.stack.peek() + ") {");
    this.cases.forEach(function (item) {
      if (item.index !== undefined) {
        statements.push("case " + item.index + ":");
      } else {
        statements.push("default:");
      }
      if (item.body) {
        result = item.body.compile(mcx, state);
        statements.push(result.statements);
      }
    });
    statements.push("}");
    return {statements: statements, state: state};
  };

  Control.If.prototype.isThenBreak = function () {
    return this.then === Control.Break && !this.else;
  };

  Control.If.prototype.compile = function (mcx, state) {
    if (controlWriter) {
      controlWriter.enter("If {");
      controlWriter.writeLn("entryState: " + state);
    }

    controlWriter && controlWriter.enter("Condition {");
    var cr = this.cond.compile(mcx, state);
    controlWriter && controlWriter.leave("}");

    var tr = null;
    if (this.then) {
      controlWriter && controlWriter.enter("Then {");
      tr = this.then.compile(mcx, cr.state.clone());
      controlWriter && controlWriter.leave("}");
    }

    var er = null;
    if (this.else) {
      controlWriter && controlWriter.enter("Else {");
      er = this.else.compile(mcx, cr.state.clone());
      controlWriter && controlWriter.leave("}");
    }

    assert (tr || er);

    var condition = this.negated ? cr.condition.negate() : cr.condition;
    var statements = cr.statements;
    statements.push("if (" + condition + ") {");
    if (tr) {
      statements.push(new Indent(tr.statements));
    }
    if (er) {
      statements.push("} else {");
      statements.push(new Indent(er.statements));
    }
    statements.push("}");
    var exitState = (tr || er).state;
    if (controlWriter) {
      controlWriter.writeLn("exitState:  " + exitState);
      controlWriter.leave("}");
    }
    return {statements: statements, condition: condition, state: exitState};
  };

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
    state.prototype.callExpression = function callExpression(name, argumentCount) {
      var arguments = this.stack.popMany(argumentCount);
      this.stack.push(name + "(" + arguments.join(",") + ")");
    };
    state.prototype.trace = function trace(writer) {
      writer.writeLn("id: " + stateCounter);
      writer.writeLn("scopeHeight: " + this.scopeHeight);
      writer.enter("stack:");
      writer.writeArray(this.stack);
      writer.outdent();
    };
    state.prototype.toString = function toString() {
      return "id: " + this.id + ", scope: [" + this.scope.join(", ") + "], stack: [" + this.stack.join(", ") + "]";
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

    operator.SEQ = new operator("===", function (l, r) { return l === r; }, true, true);
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
      if (this.operator === Operator.FALSE) {
        return this.left;
      }
      if (this.operator.not) {
        return new expression(this.left, this.operator.not, this.right);
      }
      return new expression(this, Operator.FALSE);
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
      if (this.hasOwnProperty("variable")) {
        return this.variable.toString();
      }
      if (this.isBinary()) {
        return "(" + this.left + " " + this.operator + " " + this.right + ")";
      } else {
        return this.operator + this.left;
      }
    };
    expression.prototype.isEquivalent = function isEquivalent(other) {
      return false;
    };
    expression.prototype.isPure = function isPure() {
      if (this.isBinary()) {
        return this.left.isPure() && this.right.isPure();
      } else {
        return this.left.isPure();
      }
    };
    return expression;
  })();

  var FindProperty = (function () {
    function findProperty(multiname, strict) {
      this.multiname = multiname;
      this.strict = strict;
    };
    findProperty.prototype.toString = function toString() {
      return SCOPE_NAME + ".findProperty" + argumentList(objectConstant(this.multiname), this.strict);
    };
    findProperty.prototype.isEquivalent = function isEquivalent(other) {
      return other instanceof findProperty && this.multiname === other.multiname && this.strict === other.strict;
    };
    findProperty.prototype.isPure = function isPure() {
      return false;
    };
    return findProperty;
  })();

  /*
  var GetProperty = (function () {
    function getProperty(obj, multiname) {
      assert (!multiname.isRuntime());
      this.obj = obj;
      this.multiname = multiname;
    }
    getProperty.prototype.toString = function toString() {
      return objectConstant(abc) + ".runtime.getProperty" + argumentList(this.obj,  objectConstant(this.multiname));
      // return this.obj + "." + this.multiname.name;
    };
    getProperty.prototype.isEquivalent = function isEquivalent(other) {
      return other instanceof getProperty && this.multiname === other.multiname && this.obj.isEquivalent(other.obj);
    };
    getProperty.prototype.isPure = function isPure() {
      return false;
    };
    return getProperty;
  })();
  */

  var GetPropertyRuntime = (function () {
    function getPropertyRuntime(obj, ns, name) {
      this.obj = obj;
      this.ns = ns;
      this.name = name;
    }
    getPropertyRuntime.prototype.toString = function toString() {
      return this.obj + "." + GET_ACCESSOR + "(" + this.name + ")";
    };
    getPropertyRuntime.prototype.isEquivalent = function isEquivalent(other) {
      return other instanceof getPropertyRuntime && this.ns === other.ns && this.name === other.name;
    };
    getPropertyRuntime.prototype.isPure = function isPure() {
      return false;
    };
    return getPropertyRuntime;
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
    };
    variable.prototype.isEquivalent = function isEquivalent(other) {
      return other instanceof variable && this.name === other.name;
    };
    variable.prototype.isPure = function isPure() {
      return false;
    };
    return variable;
  })();

  /**
   * Wrapper around a named local variable.
   */
  var GetGlobalScope = (function () {
    function getGlobalScope() {}
    getGlobalScope.prototype.toString = function toString() {
      return SCOPE_NAME + ".global.object";
    };
    getGlobalScope.prototype.isEquivalent = function isEquivalent(other) {
      return other instanceof getGlobalScope;
    };
    getGlobalScope.prototype.isPure = function isPure() {
      return false;
    };
    return getGlobalScope;
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
      if (typeof this.value === "string") {
        // TODO: Don't embed large strings.
        return JSON.stringify(this.value);
      }
      if (this.value === 0 && 1 / this.value === -Infinity) {
        return "-0";
      }
      return literal(this.value);
    };
    constant.prototype.isEquivalent = function isEquivalent(other) {
      return other instanceof constant && this.value === other.value;
    };
    constant.prototype.isPure = function isPure() {
      return true;
    };
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
    };
    literal.prototype.isPure = function isPure() {
      return false;
    };
    return literal;
  })();

  /**
   * Keeps track of a pool of variables that may be reused.
   */
  var VariablePool = (function () {
    var count = 0;
    function variablePool() {
      this.used = [];
      this.available = [];
    }
    variablePool.prototype.acquire = function () {
      if (!this.available.empty()) {
        return this.available.pop();
      }
      var variable = new Variable("v" + count++);
      this.used.push(variable);
      return variable;
    };
    variablePool.prototype.release = function (variable) {
      assert (this.used.contains(variable));
      this.available.push(variable);
    };
    return variablePool;
  })();

  /**
   * Common subexpression elimination is only used to CSE scope lookups for now,
   * use it more aggressively. Each basic block maintains a list of values which
   * are checked whenever new values are added to the list. If a [equivalent] value
   * already exists in the list, the old value is returned. The values are first
   * looked up in the current list, then in the parent's (immediate dominator) list.
   */
  var CSE = (function () {
    function cse(parent, variablePool) {
      this.parent = parent;
      this.variablePool = variablePool;
      this.values = [];
    }

    /**
     * Finds and returns an equivalent value or returns null if not found.
     * If [allocate] is true, then if an equivalent value is not found the
     * a variable is allocated for the current value and the original value
     * is returned.
     */
    cse.prototype.get = function get(value, allocate) {
      if (value instanceof Variable || value instanceof Constant) {
        return value;
      }
      var values = this.values;
      for (var i = values.length - 1; i >= 0; i--) {
        var other = values[i];
        if (value.isEquivalent(other)) {
          assert (other.variable);
          return other;
        }
      }
      if (this.parent) {
        var otherValue = this.parent.get(value, false);
        if (otherValue) {
          return otherValue;
        }
      }
      if (!allocate) {
        return null;
      }
      value.variable = this.variablePool.acquire();
      this.values.push(value);
      return value;
    };

    return cse;
  })();

  function literal(obj) {
    if (obj === null) {
      return "null";
    } else if (obj === undefined) {
      return "undefined";
    } else if (obj instanceof Array) {
      return "[" + obj.map(literal).join(", ") + "]";
    }
    return obj.toString();
  }

  function valueList() {
    return Array.prototype.slice.call(arguments, 0).map(literal).join(", ");
  }

  function argumentList() {
    return "(" + valueList.apply(null, arguments) + ")";
  }

  /**
   * Local state for compiling a method.
   */
  function MethodCompilerContext(compiler, method, savedScope) {
    this.compiler = compiler;
    this.method = method;
    this.worklist = [method.analysis.controlTree];
    this.state = new State();
    this.savedScope = savedScope;
    this.variablePool = new VariablePool();

    /* Initialize local variables. First declare the [this] reference, then ... */
    this.local = [new Variable("this")];

    /* push the method's parameters, followed by ... */
    for (var i = 0; i < method.parameters.length; i++) {
      this.local.push(new Variable(method.parameters[i].name));
    }

    /* push the method's remaining locals.*/
    for (var i = method.parameters.length; i < method.localCount; i++) {
      this.local.push(new Variable(getLocalVariableName(i)));
    }

    this.temporary = [];
    for (var i = 0; i < 20; i++) {
      this.temporary.push(new Variable("s" + i));
    }

    this.header = [];

    var parameterCount = method.parameters.length;
    if (method.needsRest()) {
      this.header.push(this.local[parameterCount + 1] + " = Array.prototype.slice.call(arguments, " + (parameterCount + 1) + ");");
    } else if (method.needsArguments()) {
      this.header.push(this.local[parameterCount + 1] + " = Array.prototype.slice.call(arguments, 1);");
    }

    if (this.local.length > 1) {
      this.header.push("var " + this.local.slice(1).join(", ") + ";");
    }

    if (this.temporary.length > 1) {
      this.header.push("var " + this.temporary.slice(0).join(", ") + ";");
    }

    this.header.push("var " + SCOPE_NAME + " = " + SAVED_SCOPE_NAME + ";");
  }

  MethodCompilerContext.prototype.compileBlock = function compileBlock(block, state) {
    var writer = this.compiler.writer;

    if (traceLevel.value <= 2) {
      writer = null;
    }

    if (writer) {
      writer.enter("block " + block.blockId + ", dom: " + block.dominator.blockId + " [" + block.position + "-" + block.end.position + "] {");
      writer.enter("entryState {");
      state.trace(writer);
      writer.leave("}");
    }

    var statements = [];

    function getSlot(obj, index) {
      pushValue(obj + ".S" + index);
    }

    function setSlot(obj, index, value) {
      flushStack();
      statements.push(obj + ".S" + index + " = " + value + ";");
    }

    var local = this.local;
    var temporary = this.temporary;

    if (enableCSE.value) {
      if (block.dominator === block) {
        block.cse = new CSE(null, this.variablePool);
      } else {
        assert (block.dominator.cse, "Dominator should have a CSE map.");
        block.cse = new CSE(block.dominator.cse, this.variablePool);
      }
    }

    function expression(operator) {
      if (operator.isBinary()) {
        var b = state.stack.pop();
        var a = state.stack.pop();
        pushValue(new Expression(a, operator, b));
      } else {
        var a = state.stack.pop();
        pushValue(new Expression(a, operator));
      }
    }

    function pushValue(value) {
      if (typeof value === "string") {
        value = new Literal(value);
      }
      if (enableCSE.value &&
          (value instanceof FindProperty || value instanceof GetGlobalScope)) {
        cseValue(value);
      } else {
        state.stack.push(value);
      }
    }

    function setLocal(index) {
      var value = state.stack.pop();
      flushStack();
      emitStatement(local[index] + " = " + value);
    }

    function duplicate(value) {
      var temp = temporary[state.stack.length];
      state.stack.push("(" + temp + " = " + value + ")");
      state.stack.push(temp);
    }

    function popValue() {
      emitStatement(state.stack.pop());
    }

    function kill(index) {
      flushStack();
      emitStatement(local[index] + " = " + new Constant(undefined));
    }

    /**
     * Stores all stack values into temporaries. At the end of a block, the state stack
     * may not be empty. This usually occurs for short-circuited conditional expressions.
     */
    function flushStack() {
      // assert (state.stack.length <= 2, "Stack Length is " + state.stack.length);
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

    function setNegatedCondition(operator) {
      setCondition(operator);
      condition = new Expression(condition, Operator.FALSE);
    }

    function emitStatement(statement) {
      statements.push(statement + ";");
    }

    function emitAssignment(variable, expression) {
      statements.push(variable + " = " + expression + ";");
    }

    function emitComment(comment) {
      statements.push("/* " + comment + " */");
    }

    function cseValue(value) {
      assert (value);
      if (block.cse) {
        var otherValue = block.cse.get(value, true);
        if (otherValue === value) {
          emitAssignment(value.variable, value);
        }
        state.stack.push(otherValue.variable);
      }
    }

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

    function classObject() {
      return SAVED_SCOPE_NAME + ".object";
    }

    function superClassInstanceObject() {
      return classObject() + ".baseClass.instance";
    }

    function superOf(obj) {
      return obj + ".public$constructor.baseClass.instance.prototype";
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
      if (obj instanceof FindProperty &&
          obj.multiname.name === multiname.name &&
          obj.multiname.isQName()) {
        return obj + "." + obj.multiname.getQualifiedName();
      }
      return "getProperty" + argumentList(obj, objectConstant(multiname));
    }

    function toInt32() {
      pushValue(new Constant(0));
      expression(Operator.OR);
    }

    var bytecodes = this.method.analysis.bytecodes;
    for (var bci = block.position, end = block.end.position; bci <= end; bci++) {
      var bc = bytecodes[bci];
      var op = bc.op;

      if (writer) {
        writer.enter("bytecode bci: " + bci + ", originalBci: " + bc.originalPosition +", " + bc +  " {");
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
        emitStatement(SCOPE_NAME + " = new Scope" + argumentList(SCOPE_NAME, obj));
        state.scopeHeight += 1;
        break;
      case OP_popscope:
        flushStack();
        emitStatement(SCOPE_NAME + " = " + SCOPE_NAME + ".parent");
        state.scopeHeight -= 1;
        break;
      case OP_nextname:
        index = state.stack.pop();
        obj = state.stack.pop();
        pushValue("nextName" + argumentList(obj, index));
        break;
      case OP_hasnext:
        // TODO: Temporary implementation, totally broken.
        pushValue(new Constant(false));
        break;
      case OP_hasnext2:
        flushStack();
        obj = local[bc.object];
        index = local[bc.index];
        emitStatement(temporary[0] + " = hasNext2" + argumentList(obj, index));
        emitStatement(local[bc.object] + " = " + temporary[0] + ".object");
        emitStatement(local[bc.index] + " = " + temporary[0] + ".index");
        pushValue(temporary[0] + ".index");
        break;
      case OP_pushnull:       pushValue(new Constant(null)); break;
      case OP_pushundefined:  pushValue(new Constant(undefined)); break;
      case OP_pushfloat:      notImplemented(); break;
      case OP_nextvalue:      notImplemented(); break;
      case OP_pushbyte:       pushValue(new Constant(bc.value)); break;
      case OP_pushshort:      pushValue(new Constant(bc.value)); break;
      case OP_pushstring:     pushValue(new Constant(strings[bc.index])); break;
      case OP_pushint:        pushValue(new Constant(ints[bc.index])); break;
      case OP_pushuint:       pushValue(new Constant(uints[bc.index])); break;
      case OP_pushdouble:     pushValue(new Constant(doubles[bc.index])); break;
      case OP_pushtrue:       pushValue(new Constant(true)); break;
      case OP_pushfalse:      pushValue(new Constant(false)); break;
      case OP_pushnan:        pushValue(new Constant(NaN)); break;
      case OP_pop:            popValue(); break;
      case OP_dup:            duplicate(state.stack.pop()); break;
      case OP_swap:           state.stack.push(state.stack.pop(), state.stack.pop()); break;
      case OP_pushscope:
        flushStack();
        obj = state.stack.pop();
        emitStatement(SCOPE_NAME + " = new Scope" + argumentList(SCOPE_NAME, obj));
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
        pushValue(objectConstant(abc) + ".runtime.createFunction" + argumentList(objectConstant(methods[bc.index]), SCOPE_NAME));
        break;
      case OP_call:
        args = state.stack.popMany(bc.argCount);
        obj = state.stack.pop();
        pushValue(state.stack.pop() + argumentList.apply(null, args));
        break;
      case OP_construct:
        args = state.stack.popMany(bc.argCount);
        obj = state.stack.pop();
        pushValue("new (" + obj + ".instance)" + argumentList.apply(null, args));
        break;
      case OP_callmethod:     notImplemented(); break;
      case OP_callstatic:     notImplemented(); break;
      case OP_callsuper:
        flushStack();
        multiname = multinames[bc.index];
        args = state.stack.popMany(bc.argCount);
        obj = state.stack.pop();
        pushValue(getProperty(superOf(obj), multiname) + ".call" + argumentList.apply(null, [obj].concat(args)));
        break;
      case OP_callproperty:
        flushStack();
        multiname = multinames[bc.index];
        args = state.stack.popMany(bc.argCount);
        obj = state.stack.pop();
        pushValue(getProperty(obj, multiname) + ".call" + argumentList.apply(null, [obj].concat(args)));
        break;
      case OP_returnvoid:     emitStatement("return"); break;
      case OP_returnvalue:    emitStatement("return " + state.stack.pop()); break;
      case OP_constructsuper:
        args = state.stack.popMany(bc.argCount);
        obj = state.stack.pop();
        emitStatement(superClassInstanceObject() + ".call" + argumentList.apply(null, [obj].concat(args)));
        break;
      case OP_constructprop:
        multiname = multinames[bc.index];
        args = state.stack.popMany(bc.argCount);
        obj = state.stack.pop();
        pushValue("new (" + getProperty(obj, multiname) + ".instance)" + argumentList.apply(null, args));
        break;
      case OP_callsuperid:    notImplemented(); break;
      case OP_callproplex:
        multiname = multinames[bc.index];
        args = state.stack.popMany(bc.argCount);
        obj = state.stack.pop();
        pushValue(getProperty(obj, multiname) + ".call" + argumentList.apply(null, [obj].concat(args)));
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
        pushValue("applyType" + argumentList(factory, args));
        flushStack();
        break;
      case OP_pushfloat4:     notImplemented(); break;
      case OP_newobject:
        var nameValuePairs = [];
        for (var i = 0; i < bc.argCount; i++) {
          var pair = state.stack.popMany(2);
          nameValuePairs.push(pair[0] + ": " + pair[1]);
        }
        pushValue("{" + nameValuePairs.join(", ") + "}");
        break;
      case OP_newarray:       pushValue("[" + state.stack.popMany(bc.argCount) + "]"); break;
      case OP_newactivation:
        assert (this.method.needsActivation());
        emitStatement("var activation = " + objectConstant(abc) + ".runtime.createActivation" + argumentList(objectConstant(this.method)));
        pushValue("activation");
        break;
      case OP_newclass:
        pushValue(objectConstant(abc) + ".runtime.createClass" + argumentList(objectConstant(abc.classes[bc.index]), state.stack.pop(), SCOPE_NAME));
        break;
      case OP_getdescendants: notImplemented(); break;
      case OP_newcatch:       notImplemented(); break;
      case OP_findpropstrict:
        multiname = multinames[bc.index];
        assertNotImplemented (!multiname.isRuntime());
        pushValue(findProperty(multiname, true));
        break;
      case OP_findproperty:
        multiname = multinames[bc.index];
        assertNotImplemented (!multiname.isRuntime());
        pushValue(findProperty(multiname, false));
        break;
      case OP_finddef:        notImplemented(); break;
      case OP_getlex:
        multiname = multinames[bc.index];
        assert (!multiname.isRuntime());
        pushValue(getProperty(findProperty(multiname, true), multiname));
        break;
      case OP_setproperty:
        value = state.stack.pop();
        multiname = multinames[bc.index];
        flushStack();
        if (!multiname.isRuntime()) {
          obj = state.stack.pop();
          emitStatement("setProperty" + argumentList(obj, objectConstant(multiname), value));
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
        }
        break;
      case OP_getlocal:       pushValue(local[bc.index]); break;
      case OP_setlocal:       setLocal(bc.index); break;
      case OP_getglobalscope:
        pushValue(new GetGlobalScope());
        break;
      case OP_getscopeobject:
        obj = SCOPE_NAME;
        for (var i = 0; i < (state.scopeHeight - 1) - bc.index; i++) {
          obj += ".parent";
        }
        pushValue(obj + ".object");
        break;
      case OP_getproperty:
        multiname = multinames[bc.index];
        if (!multiname.isRuntime()) {
          obj = state.stack.pop();
          pushValue(getProperty(obj, multiname));
        } else {
          ns = name = null;
          if (multiname.isRuntimeName()) {
            name = state.stack.pop();
          }
          if (multiname.isRuntimeNamespace()) {
            ns = state.stack.pop();
          }
          obj = state.stack.pop();
          pushValue(new GetPropertyRuntime(obj, ns, name));
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
          pushValue("deleteProperty" + argumentList(obj, objectConstant(multiname)));
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
      case OP_convert_s:      pushValue("toString" + argumentList(state.stack.pop())); break;
      case OP_esc_xelem:      notImplemented(); break;
      case OP_esc_xattr:      notImplemented(); break;
      case OP_convert_i:      pushValue("toInt" + argumentList(state.stack.pop())); break;
      case OP_convert_u:      pushValue("toUint" + argumentList(state.stack.pop())); break;
      case OP_convert_d:      pushValue("toDouble" + argumentList(state.stack.pop())); break;
      case OP_convert_b:      pushValue("toBoolean" + argumentList(state.stack.pop())); break;
      case OP_convert_o:      notImplemented(); break;
      case OP_checkfilter:    notImplemented(); break;
      case OP_convert_f:      notImplemented(); break;
      case OP_unplus:         notImplemented(); break;
      case OP_convert_f4:     notImplemented(); break;
      case OP_coerce:
        // TODO:
        break;
      case OP_coerce_b:       notImplemented(); break;
      case OP_coerce_a:       /* NOP */ break;
      case OP_coerce_i:       notImplemented(); break;
      case OP_coerce_d:       notImplemented(); break;
      case OP_coerce_s:       pushValue("coerceString" + argumentList(state.stack.pop())); break;
      case OP_astype:         notImplemented(); break;
      case OP_astypelate:     notImplemented(); break;
      case OP_coerce_u:       notImplemented(); break;
      case OP_coerce_o:       notImplemented(); break;
      case OP_negate:         expression(Operator.NEG); break;
      case OP_increment:
        pushValue(new Constant(1));
        expression(Operator.ADD);
        break;
      case OP_inclocal:       notImplemented(); break;
      case OP_decrement:
        pushValue(new Constant(1));
        expression(Operator.SUB);
        break;
      case OP_declocal:       notImplemented(); break;
      case OP_typeof:
        pushValue("typeOf" + argumentList(state.stack.pop()));
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
        pushValue(new Constant(true));
        break;
      case OP_istype:
        value = state.stack.pop();
        multiname = multinames[bc.index];
        assert (!multiname.isRuntime());
        type = getProperty(findProperty(multiname, true), multiname);
        pushValue(type + " instanceof Class ? " + type + ".isInstance" + argumentList(value) + " : false");
        break;
      case OP_istypelate:
        type = state.stack.pop();
        value = state.stack.pop();
        pushValue(type + " instanceof Class ? " + type + ".isInstance" + argumentList(value) + " : false");
        break;
      case OP_in:             notImplemented(); break;
      case OP_increment_i:
        toInt32();
        pushValue(new Constant(1));
        expression(Operator.ADD);
        break;
      case OP_decrement_i:
        toInt32();
        pushValue(new Constant(1));
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
        pushValue(local[op - OP_getlocal0]);
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
        if (statements.length > 10) {
          writer.writeArray(statements.slice(statements.length - 10));
        } else {
          writer.writeArray(statements);
        }
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
    this.writer = typeof(webShell) === undefined ? null : new IndentingWriter();
    this.abc = abc;
  };

  compiler.prototype.compileMethod = function compileMethod(methodInfo, hasDefaults, scope) {
    var mi = methodInfo;
    assert(mi.analysis);

    var mcx = new MethodCompilerContext(this, mi, scope);
    var statements = mcx.header;

    var body = mi.analysis.controlTree.compile(mcx, mcx.state).statements;

    var usedVariables = mcx.variablePool.used;
    if (usedVariables.notEmpty()) {
      statements.push("var " + usedVariables.join(", ") + ";");
    }

    if (hasDefaults) {
      statements.push("const nargs = arguments.length;");
      mi.parameters.forEach(function (p, i) {
        if (p.value) {
          /**
           * We do i + 2 because the first argument to compiled functions is
           * always the saved scope.
           */
          statements.push("if (nargs < " + (i + 2) + ") { " +
                          p.name + " = " + new Constant(p.value) + "; }");
        }
      });
    }

    statements.push(body);
    return {statements: statements};
  };

  compiler.Operator = Operator;

  return compiler;
})();

function stop() {
  var breakpoint = 0; /* SET BREAKPOINT HERE */
}
