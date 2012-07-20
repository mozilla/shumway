var compilerOptions = systemOptions.register(new OptionSet("Compiler Options"));
var enableOpt = compilerOptions.register(new Option("opt", "optimizations", "boolean", false, "Enable optimizations."));
var enableVerifier = compilerOptions.register(new Option("verify", "verify", "boolean", false, "Enable verifier."));

const T = estransform;

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
const FunctionDeclaration = T.FunctionDeclaration;
const FunctionExpression = T.FunctionExpression;
const ConditionalExpression = T.ConditionalExpression;
const ObjectExpression = T.ObjectExpression;
const ArrayExpression = T.ArrayExpression;
const UnaryExpression = T.UnaryExpression;
const NewExpression = T.NewExpression;
const UpdateExpression = T.UpdateExpression;
const ForStatement = T.ForStatement;
const BlockStatement = T.BlockStatement;
const ThisExpression = T.ThisExpression;
const TypeAliasDirective = T.TypeAliasDirective;
const CastExpression = T.CastExpression;
const ThrowStatement = T.ThrowStatement;
const IfStatement = T.IfStatement;
const WhileStatement = T.WhileStatement;
const BreakStatement = T.BreakStatement;
const ContinueStatement = T.ContinueStatement;
const TryStatement = T.TryStatement;
const CatchClause = T.CatchClause;

const scopeName = new Identifier("$S");
const savedScopeName = new Identifier("$$S");
const constantsName = new Identifier("$C");
const lastCaughtName = new Identifier("$E");

/**
 * To embed object references in compiled code we index into globally accessible constant table [$C].
 * This table maintains an unique set of object references, each of which holds its own position in
 * the constant table, thus providing for fast lookup. To embed a reference to an object [k] we call
 * [constant(k)] which may generate the literal "$C[12]".
 */

var $C = [];
const SCOPE_NAME = "$S";
const SAVED_SCOPE_NAME = "$" + SCOPE_NAME;

function generate(node) {
  return escodegen.generate(node, {base: "", indent: "  "});
}

var Compiler = (function () {

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

  Control.Try.prototype.compile = function (cx, state) {
    return cx.compileTry(this, state);
  };

  var Constant = (function () {
    function constant(value) {
      this.value = value;
      if (value === undefined) {
        Identifier.call(this, "undefined");
      } else if (value !== null && typeof value === "object") {
        assert (value instanceof Multiname ||
                value instanceof Runtime ||
                value instanceof Domain ||
                value instanceof MethodInfo ||
                value instanceof ClassInfo ||
                value instanceof AbcFile ||
                value instanceof Array ||
                value instanceof CatchScopeObject ||
                value.forceConstify === true,
                "Should not make constants from ", value);
        MemberExpression.call(this, constantsName, new Literal(objectId(value)), true);
      } else {
        Literal.call(this, value);
      }
    }
    constant.prototype.isEquivalent = function (other) {
      return other instanceof Constant && this.value === other.value;
    };
    return constant;
  })();

  function constant(value) {
    return new Constant(value);
  }

  function property(obj, path) {
    path.split(".").forEach(function(x) {
      obj = new MemberExpression(obj, new Identifier(x), false);
    });
    return obj;
  }

  function call(callee, args) {
    assert (args instanceof Array);
    args.forEach(function (x) {
      assert (!(x instanceof Array));
    });
    return new CallExpression(callee, args);
  }

  function callCall(callee, args) {
    return call(property(callee, "call"), args);
  }

  function assignment(left, right) {
    assert (left && right);
    return new AssignmentExpression(left, "=", right);
  }

  function binary (operator, left, right) {
    return new BinaryExpression(operator.name, left, right);
  }

  function asInt32(value) {
    return binary(Operator.OR, value, constant(0));
  }

  function id(name) {
    return new Identifier(name);
  }

  function checkType(value, type) {
    return new BinaryExpression("===",
      new UnaryExpression("typeof", value), new Literal(type));
  }

  function conditional(test, consequent, alternate) {
    return new ConditionalExpression(test, consequent, alternate);
  }

  function removeBlock(node) {
    if (node instanceof BlockStatement) {
      return node.body;
    }
    return node;
  }

  function compiler(abc) {
    this.abc = abc;
    this.writer = new IndentingWriter();
    this.verifier = new Verifier(abc);
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
      writer.enter("state id: " + stateCounter + ", scopeHeight: " + this.scopeHeight + ", stack: {");
      for (var i = 0; i < this.stack.length; i++) {
        writer.writeLn(i + ": " + generate(this.stack[i]));
      }
      writer.leave("}");
    };
    return state;
  })();

  /**
   * Describes binary and unary operators.
   */
  var Operator = (function () {
    var map = {};

    function operator(name, fn, binary) {
      this.name = name;
      this.fn = fn;
      this.binary = binary;
      map[name] = this;
    }

    operator.ADD = new operator("+", function (l, r) { return l + r; }, true);
    operator.SUB = new operator("-", function (l, r) { return l - r; }, true);
    operator.MUL = new operator("*", function (l, r) { return l * r; }, true);
    operator.DIV = new operator("/", function (l, r) { return l / r; }, true);
    operator.MOD = new operator("%", function (l, r) { return l % r; }, true);
    operator.AND = new operator("&", function (l, r) { return l & r; }, true);
    operator.OR = new operator("|", function (l, r) { return l | r; }, true);
    operator.XOR = new operator("^", function (l, r) { return l ^ r; }, true);
    operator.LSH = new operator("<<", function (l, r) { return l << r; }, true);
    operator.RSH = new operator(">>", function (l, r) { return l >> r; }, true);
    operator.URSH = new operator(">>>", function (l, r) { return l >>> r; }, true);
    operator.SEQ = new operator("===", function (l, r) { return l === r; }, true);
    operator.SNE = new operator("!==", function (l, r) { return l !== r; }, true);
    operator.EQ = new operator("==", function (l, r) { return l == r; }, true);
    operator.NE = new operator("!=", function (l, r) { return l != r; }, true);
    operator.LE = new operator("<=", function (l, r) { return l <= r; }, true);
    operator.GT = new operator(">", function (l, r) { return l > r; }, true);
    operator.LT = new operator("<", function (l, r) { return l < r; }, true);
    operator.GE = new operator(">=", function (l, r) { return l >= r; }, true);
    operator.BITWISE_NOT = new operator("~", function (a) { return ~a; }, false);
    operator.NEG = new operator("-", function (a) { return -a; }, false);
    operator.TRUE = new operator("!!", function (a) { return !!a; }, false);
    operator.FALSE = new operator("!", function (a) { return !a; }, false);

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

    operator.fromName = function fromName(name) {
      return map[name];
    };

    operator.prototype.isBinary = function isBinary() {
      return this.binary;
    };

    operator.prototype.toString = function toString() {
      return this.name;
    };
    return operator;
  })();

  function negate(node) {
    assert (node instanceof BinaryExpression || node instanceof UnaryExpression);
    var left = node instanceof BinaryExpression ? node.left : node.argument;
    var right = node.right;
    var operator = Operator.fromName(node.operator);
    if (operator === Operator.EQ && right instanceof Literal && right.value === false) {
      return left;
    }
    if (operator === Operator.FALSE) {
      return left;
    }
    if (operator.not) {
      if (node instanceof BinaryExpression) {
        return new BinaryExpression(operator.not.name, left, right);
      } else {
        return new UnaryExpression(operator.not.name, left);
      }
    }
    return new UnaryExpression(Operator.FALSE.name, node);
  }

  var FindProperty = (function () {
    function findProperty(multiname, domain, strict) {
      this.strict = strict;
      this.multiname = multiname;
      var args = [this.multiname, domain, new Literal(this.strict)];
      CallExpression.call(this, property(scopeName, "findProperty"), args);
    }
    findProperty.prototype = Object.create(CallExpression.prototype);
    findProperty.prototype.isEquivalent = function isEquivalent(other) {
      return other instanceof findProperty &&
             this.multiname.isEquivalent(other.multiname) &&
             this.strict === other.strict;
    };
    return findProperty;
  })();

  /**
   * Wrapper around a named local variable.
   */
  var Variable = (function () {
    function variable(name) {
      Identifier.call(this, name);
    }
    variable.prototype = Object.create(Identifier.prototype);
    variable.prototype.toString = function toString() {
      return this.name;
    };
    variable.prototype.isEquivalent = function isEquivalent(other) {
      return other instanceof variable && this.name === other.name;
    };
    return variable;
  })();

  /**
   * Keeps track of a pool of variables that may be reused.
   */
  var VariablePool = (function () {
    function variablePool() {
      this.count = 0;
      this.used = [];
      this.available = [];
    }
    variablePool.prototype.acquire = function () {
      if (!this.available.empty()) {
        return this.available.pop();
      }
      var variable = new Variable("v" + this.count++);
      this.used.push(variable);
      return variable;
    };
    variablePool.prototype.release = function (variable) {
      assert (this.used.contains(variable));
      this.available.push(variable);
    };
    variablePool.prototype.releaseAll = function () {
      this.available = this.available.concat(this.used);
      this.used = [];
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
     * If |allocate| is true and an equivalent value is not found, then
     * a variable is allocated for the current value and the original value
     * is returned.
     */
    cse.prototype.get = function get(value, allocate) {
      if (value instanceof Variable || value instanceof Literal) {
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

    cse.prototype.reset = function reset() {
      this.values = [];
      this.variablePool.releaseAll();
    };

    return cse;
  })();

  var Compilation = (function () {

    function compilation(compiler, methodInfo, scope) {
      this.compiler = compiler;
      var abc = this.compiler.abc;
      var mi = this.methodInfo = methodInfo;
      this.bytecodes = methodInfo.analysis.bytecodes;
      this.state = new State();
      this.variablePool = new VariablePool();
      this.temporary = [];

      /* Initialize local variables, first local is the |this| reference. */
      this.local = [new Variable("this")];

      var freeVariableNames = "abcdefghijklmnopqrstuvwxyz".split("");

      /* Create variables for the method's parameters. */
      for (var i = 0; i < mi.parameters.length; i++) {
        var name = mi.parameters[i].name;
        this.local.push(new Variable(name));
        if (freeVariableNames.indexOf(name) >= 0) {
          delete freeVariableNames[freeVariableNames.indexOf(name)];
        }
      }

      var freshVariableCount = 0;

      function newVariableName() {
        var name = null;
        for (var i = 0; i < freeVariableNames.length; i++) {
          if ((name = freeVariableNames[i])) {
            delete freeVariableNames[i];
            return name;
          }
        }
        return "$l" + freshVariableCount++;
      }

      /* Create variables for the method's remaining locals. */
      for (var i = mi.parameters.length; i < mi.localCount; i++) {
        this.local.push(new Variable(newVariableName()));
      }

      this.prologue = [];

      this.prologue.push(new ExpressionStatement(
        call(property(id("Runtime"), "stack.push"), [constant(abc.runtime)])));

      this.prologue.push(new VariableDeclaration("var", [
        new VariableDeclarator(id(SCOPE_NAME), id(SAVED_SCOPE_NAME))
      ]));

      /* Declare local variables. */
      if (this.local.length > 1) {
        this.prologue.push(new VariableDeclaration("var", this.local.slice(1).map(function (x) {
          return new VariableDeclarator(x, null);
        })));
      }

      var parameterCount = mi.parameters.length;
      if (mi.needsRest() || mi.needsArguments()) {
        this.prologue.push(new ExpressionStatement(
          assignment(this.local[parameterCount + 1],
                     call(property(id("Array"), "prototype.slice.call"),
                          [id("arguments"), constant(mi.needsRest() ? parameterCount + 1 : 1)]))));
      }

      /* Initialize default arguments. */
      var argumentCount = property(id("arguments"), "length");
      for (var i = 0; i < parameterCount; i++) {
        var value = mi.parameters[i].value;
        if (value) {
          var local = this.local[i + 1];
          this.prologue.push(new IfStatement(binary(Operator.LT, argumentCount, constant(i + 2)),
                                             new ExpressionStatement(assignment(local, constant(value))),
                                             null));
        }
      }
    }

    compilation.prototype.compile = function compile() {
      var node = this.methodInfo.analysis.controlTree.compile(this, this.state).node;
      assert (node instanceof BlockStatement);
      if (this.temporary.length > 1) {
        this.prologue.push(new VariableDeclaration("var", this.temporary.map(function (x) {
          return new VariableDeclarator(x, null);
        })));
      }
      var usedVariables = this.variablePool.used;
      if (usedVariables.length) {
        this.prologue.push(new VariableDeclaration("var", usedVariables.map(function (x) {
          return new VariableDeclarator(x, null);
        })));
      }
      Array.prototype.unshift.apply(node.body, this.prologue);
      return node;
    };

    compilation.prototype.compileLabelSwitch = function compileLabelSwitch(item, state) {
      var node = null;
      var firstCase = true;

      function labelEq(labelId) {
        assert (typeof labelId === "number");
        return new BinaryExpression("===", id("$label"), new Literal(labelId));
      }

      for (var i = item.cases.length - 1; i >=0; i--) {
        var c = item.cases[i];
        var labels = c.labels;

        var labelExpr = labelEq(labels[0]);

        for (var j = 1; j < labels.length; j++) {
          labelExpr = new BinaryExpression("||", labelExpr, labelEq(labels[j]));
        }

        node = new IfStatement(labelExpr,
                               c.body ? c.body.compile(this, state).node : new BlockStatement(),
                               node);
      }
      return {node: node, state: state};
    };

    compilation.prototype.compileContinue = function compileContinue(item, state) {
      var body = [];
      if (item.label) {
        body.push(new VariableDeclaration("var", [
          new VariableDeclarator(id("$label"), id(item.label))
        ]));
      }
      body.push(new ContinueStatement(null));
      return {node: new BlockStatement(body), state: state};
    };

    compilation.prototype.compileBreak = function compileBreak(item, state) {
      var body = [];
      if (item.label) {
        body.push(new VariableDeclaration("var", [
          new VariableDeclarator(id("$label"), id(item.label))
        ]));
      }
      body.push(new BreakStatement(null));
      return {node: new BlockStatement(body), state: state};
    };

    compilation.prototype.compileExit = function compileBreak(item, state) {
      var body = [];
      if (item.label) {
        body.push(new VariableDeclaration("var", [
          new VariableDeclarator(id("$label"), id(item.label))
        ]));
      }
      return {node: new BlockStatement(body), state: state};
    };

    compilation.prototype.compileSequence = function compileSequence(item, state) {
      var cx = this;
      var body = [];
      item.body.forEach(function (x) {
        var result = x.compile(cx, state);
        if (result.node instanceof BlockStatement) {
          body = body.concat(result.node.body);
        } else {
          body.push(result.node);
        }
        state = result.state;
      });
      return {node: new BlockStatement(body), state: state};
    };

    compilation.prototype.compileLoop = function compileLoop(item, state) {
      var br = item.body.compile(this, state);
      return {node: new WhileStatement(constant(true), br.node), state: state};
    };

    compilation.prototype.compileSwitch = function compileSwitch(item, state) {
    };

    compilation.prototype.compileIf = function compileIf(item, state) {
      var cr = item.cond.compile(this, state);
      var tr = null, er = null;
      if (item.then) {
        tr = item.then.compile(this, cr.state.clone());
      }
      if (item.else) {
        er = item.else.compile(this, cr.state.clone());
      }
      assert (tr || er);

      var node;
      if (item.nothingThrownLabel) {
        var inner = cr.inner;
        var condition = item.negated ? negate(inner.condition) : inner.condition;
        var ifs = new IfStatement(new BinaryExpression("===", id("$label"), constant(item.nothingThrownLabel)),
                                  new IfStatement(id("$c"), tr ? tr.node : new BlockStatement([]),
                                                  er ? er.node : null));
        cr.node = new BlockStatement([cr.node, ifs]);
      } else {
        var condition = item.negated ? negate(cr.condition) : cr.condition;
        cr.node.body.push(new IfStatement(condition, tr ? tr.node : new BlockStatement([]), er ? er.node : null));
      }

      return {node: cr.node, state: (tr || er).state};
    };

    compilation.prototype.compileTry = function compileTry(item, state) {
      var br = item.body.compile(this, state);
      var cx = this;
      var catches = [];
      var exceptionName = id("e");

      if (br.condition) {
        br.node.body.push(new ExpressionStatement(assignment(id("$c"), br.condition)));
      }

      if (item.nothingThrownLabel > 0) {
        var nothingThrownLabel = new VariableDeclaration("var", [
          new VariableDeclarator(id("$label"), id(item.nothingThrownLabel))
        ]);
        if (br.node instanceof BlockStatement) {
          br.node.body.push(nothingThrownLabel);
        } else {
          br.node = new BlockStatement([br.node, nothingThrownLabel]);
        }
      }

      item.catches.forEach(function (x) {
        var cr = x.body.compile(cx, state);

        var assign = new VariableDeclaration("var", [new VariableDeclarator(lastCaughtName, exceptionName)]);
        if (cr.node instanceof BlockStatement) {
          cr.node.body.unshift(assign);
        } else {
          cr.node = new BlockStatement([assign, cr.node]);
        }

        if (x.typeName) {
          var type = this.compiler.abc.domain.getProperty(x.typeName, true, true);
          var checkType = call(property(constant(type), "isInstance"), [exceptionName]);
          var rethrow = new ThrowStatement(exceptionName);
          var checkAndRethrow = new IfStatement(new UnaryExpression(Operator.FALSE.name, checkType), rethrow, null);
          cr.node.body.unshift(checkAndRethrow);
        }

        catches.push(new CatchClause(exceptionName, null, cr.node));
        state = cr.state;
      }, this);

      if (br.condition) {
      }

      return {node: new TryStatement(br.node, catches, null), inner: br, state: state};
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

      const abc = this.compiler.abc;
      const ints = abc.constantPool.ints;
      const uints = abc.constantPool.uints;
      const doubles = abc.constantPool.doubles;
      const strings = abc.constantPool.strings;
      const methods = abc.methods;
      const multinames = abc.constantPool.multinames;
      const runtime = abc.runtime;
      const exceptions = this.methodInfo.exceptions;

      var savedScope = this.savedScope;
      var multiname, args, value, obj, qn, ns, name, type, factory, index;

      function classObject() {
        return property(savedScopeName, "object");
      }

      function superClassInstanceObject() {
        return property(classObject(), "baseClass.instance");
      }

      function superOf(obj) {
        return property(obj, "public$constructor.baseClass.instance.prototype");
      }

      function runtimeProperty(propertyName) {
        var result = constant(abc.runtime);
        if (propertyName) {
          result = property(result, propertyName);
        }
        return result;
      }

      function push(value) {
        assert (typeof value !== "string");
        state.stack.push(value);
      }

      function cseValue(value) {
        if (block.cse) {
          var otherValue = block.cse.get(value, true);
          if (otherValue === value) {
            // flushStack();
            emit(assignment(value.variable, value));
            value.variable.value = value;
            // print("CSE: " + generate(value) + " -> " + value.variable);
          }
          return otherValue.variable;
        }
        return value;
      }

      function flushScope() {
        if (block.cse) {
          block.cse.reset();
        }
      }

      function setLocal(index) {
        assert (state.stack.length);
        var value = state.stack.pop();
        flushStack();
        emit(assignment(local[index], value));
      }

      function duplicate(value) {
        var temp = getTemporary(state.stack.length);
        state.stack.push(assignment(temp, value));
        state.stack.push(temp);
      }

      function popValue() {
        emit(state.stack.pop());
      }

      function kill(index) {
        flushStack();
        emit(assignment(local[index], constant(undefined)));
      }

      function getSlot(obj, index) {
        push(call(id("getSlot"), [obj, constant(index)]));
      }

      function setSlot(obj, index, value) {
        flushStack();
        emit(call(id("setSlot"), [obj, constant(index), value]));
      }

      function getTemporary(index) {
        if (index in temporary) {
          return temporary[index];
        }
        return temporary[index] = id("t" + index);
      }

      /**
       * Emits assignments that store stack expressions into temporaries.
       */
      function flushStack() {
        for (var i = 0; i < state.stack.length; i++) {
          if (state.stack[i] !== getTemporary(i)) {
            emit(assignment(getTemporary(i), state.stack[i]));
            state.stack[i] = getTemporary(i);
          }
        }
      }

      function emit(value) {
        if (!(value instanceof Statement)) {
          value = new ExpressionStatement(value);
        }
        body.push(value);
      }

      function emitComment(value) {
        // TODO
      }

      if (enableOpt.value) {
        if (block.dominator === block) {
          block.cse = new CSE(null, this.variablePool);
        } else {
          assert (block.dominator.cse, "Dominator should have a CSE map.");
          block.cse = new CSE(block.dominator.cse, this.variablePool);
        }
      }

      function expression(operator, intPlease) {
        var a, b;
        if (operator.isBinary()) {
          b = state.stack.pop();
          a = state.stack.pop();
          if (intPlease) {
            a = asInt32(a);
            b = asInt32(b);
          }
          push(new BinaryExpression(operator.name, a, b));
        } else {
          a = state.stack.pop();
          if (intPlease) {
            a = asInt32(a);
          }
          push(new UnaryExpression(operator.name, a));
        }
      }

      var condition = null;

      /**
       * Remembers the branch condition for this block, which is passed and used by the If control
       * node.
       */
      function setCondition(operator) {
        assert (condition === null);
        var b;
        if (operator.isBinary()) {
          b = state.stack.pop();
        }
        var a = state.stack.pop();
        if (b) {
          condition = new BinaryExpression(operator.name, a, b);
        } else {
          condition = new UnaryExpression(operator.name, a);
        }
      }

      function setNegatedCondition(operator) {
        setCondition(operator);
        condition = new UnaryExpression(Operator.FALSE.name, condition);
      }

      /**
       * Find the scope object containing the specified multiname.
       */
      function findProperty(multiname, strict) {
        return cseValue(new FindProperty(multiname, constant(abc.domain), strict));
      }

      function getProperty(obj, multiname, propertyType) {
        assert (!(multiname instanceof Multiname), multiname);
        var slowPath = call(id("getProperty"), [obj, multiname]);

        // If the multiname is a runtime multiname and the name is a number then
        // emit a fast object[name] property lookup.
        // FIXME: This doesn't work for vectors, we need to chack for |indexGet|.
        if (enableOpt.value && multiname instanceof RuntimeMultiname) {
          var fastPath = new MemberExpression(obj, multiname.name, true);
         

          if (propertyType && propertyType.isNumeric()) {
            return fastPath;
          }

          return conditional(checkType(multiname.name, "number"), fastPath, slowPath);
        }

        if (multiname instanceof Constant) {
          var val = obj instanceof Variable ? obj.value : obj;
          if (val instanceof FindProperty && multiname.isEquivalent(val.multiname)) {
            if (multiname.value.isQName()) {
              return property(obj, multiname.value.getQualifiedName());
            }
          }
        }

        return slowPath;
      }

      function setProperty(obj, multiname, value, propertyType) {
        var slowPath = call(id("setProperty"), [obj, multiname, value]);

        // Fastpath for runtime multinames with number names.
        if (enableOpt.value && multiname instanceof RuntimeMultiname) {
          var fastPath = assignment(new MemberExpression(obj, multiname.name, true), value);

          if (propertyType && propertyType.isNumeric()) {
            return fastPath;
          }

          return conditional(checkType(multiname.name, "number"), fastPath, slowPath);
        }

        return slowPath;
      }

      function getMultiname(index) {
        var multiname = multinames[index];
        assert (!multiname.isRuntime());
        var c = constant(multiname);
        c.multiname = multiname;
        return c;
      }

      var RuntimeMultiname = (function () {
        function runtimeMultiname(multiname, namespaces, name) {
          this.multiname = multiname;
          this.namespaces = namespaces;
          this.name = name;
          NewExpression.call(this, id("Multiname"), [namespaces, name]);
        }
        runtimeMultiname.prototype.isEquivalent = function isEquivalent(other) {
          return false;
        };
        return runtimeMultiname;
      })();

      function popMultiname(index) {
        var multiname = multinames[index];
        if (multiname.isRuntime()) {
          flushStack();
          var namespaces = constant(multiname.namespaces);
          var name = constant(multiname.name);
          if (multiname.isRuntimeName()) {
            name = state.stack.pop();
          }
          if (multiname.isRuntimeNamespace()) {
            namespaces = state.stack.pop();
          }
          return new RuntimeMultiname(multiname, namespaces, name);
        } else {
          return constant(multiname);
        }
      }

      // If this is a catch block, we need clear the stack, the scope stack,
      // unwind the runtime stack, and push the exception. We push the last
      // caught exception here based on the invariant that the restructuring
      // should have a trail of labels that leads from the JavaScript catch to
      // this catch.
      if (block.exception) {
        emit(new ExpressionStatement(call(property(id("Runtime"), "unwindStackTo"),
                                          [constant(abc.runtime)])));
        emit(assignment(scopeName, savedScopeName));
        flushScope();
        state.scopeHeight = -1;
        state.stack.length = 0;
        push(lastCaughtName);
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
          emit(new ThrowStatement(state.stack.pop()));
          break;
        case OP_getsuper:
          multiname = popMultiname(bc.index);
          obj = state.stack.pop();
          push(call(id("getSuper"), [obj, multiname]));
          break;
        case OP_setsuper:
          value = state.stack.pop();
          multiname = popMultiname(bc.index);
          flushStack();
          obj = state.stack.pop();
          emit(call(id("setSuper"), [obj, multiname, value]));
          break;
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
          emit(assignment(scopeName, new NewExpression(id("Scope"), [scopeName, obj])));
          state.scopeHeight += 1;
          break;
        case OP_popscope:
          flushStack();
          flushScope();
          emit(assignment(scopeName, property(scopeName, "parent")));
          state.scopeHeight -= 1;
          break;
        case OP_nextname:
          index = state.stack.pop();
          obj = state.stack.pop();
          push(call(id("nextName"), [obj, index]));
          break;
        case OP_nextvalue:
          index = state.stack.pop();
          obj = state.stack.pop();
          push(call(id("nextValue"), [obj, index]));
          break;
        case OP_hasnext:
          // TODO: Temporary implementation, totally broken.
          push(constant(false));
          break;
        case OP_hasnext2:
          flushStack();
          obj = local[bc.object];
          index = local[bc.index];
          emit(assignment(getTemporary(0), call(id("hasNext2"), [obj, index])));
          emit(assignment(local[bc.object], property(getTemporary(0), "object")));
          emit(assignment(local[bc.index], property(getTemporary(0), "index")));
          push(property(getTemporary(0), "index"));
          break;
        case OP_pushnull:       push(constant(null)); break;
        case OP_pushundefined:  push(constant(undefined)); break;
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
        case OP_pop:            popValue(); break;
        case OP_dup:            duplicate(state.stack.pop()); break;
        case OP_swap:           state.stack.push(state.stack.pop(), state.stack.pop()); break;
        case OP_pushscope:
          flushStack();
          flushScope();
          obj = state.stack.pop();
          emit(assignment(scopeName, new NewExpression(id("Scope"), [scopeName, obj])));
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
          push(call(runtimeProperty("createFunction"), [constant(methods[bc.index]), scopeName]));
          break;
        case OP_call:
          args = state.stack.popMany(bc.argCount);
          obj = state.stack.pop();
          push(callCall(state.stack.pop(), [obj].concat(args)));
          break;
        case OP_construct:
          args = state.stack.popMany(bc.argCount);
          obj = state.stack.pop();
          push(new NewExpression(property(obj, "instance"), args));
          break;
        case OP_callmethod:     notImplemented(); break;
        case OP_callstatic:     notImplemented(); break;
        case OP_callsuper:
          flushStack();
          multiname = getMultiname(bc.index);
          args = state.stack.popMany(bc.argCount);
          obj = state.stack.pop();
          push(callCall(call(id("getSuper"), [obj, multiname]), [obj].concat(args)));
          break;
        case OP_callproperty:
          flushStack();
          args = state.stack.popMany(bc.argCount);
          multiname = popMultiname(bc.index);
          obj = state.stack.pop();
          push(callCall(getProperty(obj, multiname), [obj].concat(args)));
          break;
        case OP_returnvoid:
          flushStack();
          emit(call(property(id("Runtime"), "stack.pop"), []));
          emit(new ReturnStatement());
          break;
        case OP_returnvalue:
          flushStack();
          emit(call(property(id("Runtime"), "stack.pop"), []));
          emit(new ReturnStatement(state.stack.pop())); break;
        case OP_constructsuper:
          args = state.stack.popMany(bc.argCount);
          obj = state.stack.pop();
          emit(callCall(superClassInstanceObject(), [obj].concat(args)));
          break;
        case OP_constructprop:
          multiname = getMultiname(bc.index);
          args = state.stack.popMany(bc.argCount);
          obj = getProperty(state.stack.pop(), multiname);
          push(new NewExpression(property(obj, "instance"), args));
          break;
        case OP_callsuperid:    notImplemented(); break;
        case OP_callproplex:
          multiname = getMultiname(bc.index);
          args = state.stack.popMany(bc.argCount);
          obj = state.stack.pop();
          push(callCall(getProperty(obj, multiname), [obj].concat(args)));
          break;
        case OP_callinterface:  notImplemented(); break;
        case OP_callsupervoid:
          flushStack();
          multiname = getMultiname(bc.index);
          args = state.stack.popMany(bc.argCount);
          obj = state.stack.pop();
          emit(callCall(call(id("getSuper"), [obj, multiname]), [obj].concat(args)));
          break;
        case OP_callpropvoid:
          args = state.stack.popMany(bc.argCount);
          multiname = popMultiname(bc.index);
          obj = state.stack.pop();
          emit(callCall(getProperty(obj, multiname), [obj].concat(args)));
          break;
        case OP_sxi1:           notImplemented(); break;
        case OP_sxi8:           notImplemented(); break;
        case OP_sxi16:          notImplemented(); break;
        case OP_applytype:
          args = state.stack.popMany(bc.argCount);
          factory = state.stack.pop();
          push(call(runtimeProperty("applyType"), [factory].concat(new ArrayExpression(args))));
          flushStack();
          break;
        case OP_pushfloat4:     notImplemented(); break;
        case OP_newobject:
          var properties = [];
          for (var i = 0; i < bc.argCount; i++) {
            var value = state.stack.pop();
            var key = state.stack.pop();
            assert (key.value !== undefined && typeof key.value !== "object");

            var mangledKey = "public$" + key.value;
            properties.unshift(new T.Property(new Literal(mangledKey), value, "init"));
          }
          push(new ObjectExpression(properties));
          break;
        case OP_newarray:       push(new ArrayExpression(state.stack.popMany(bc.argCount))); break;
        case OP_newactivation:
          assert (this.methodInfo.needsActivation());
          emit(new VariableDeclaration("var", [
            new VariableDeclarator(id("activation"),
                                   call(runtimeProperty("createActivation"), [constant(this.methodInfo)]))
          ]));
          push(id("activation"));
          break;
        case OP_newclass:
          push(call(property(constant(abc), "runtime.createClass"),
                    [constant(abc.classes[bc.index]), state.stack.pop(), scopeName]));
          break;
        case OP_getdescendants:
          multiname = popMultiname(bc.index);
          obj = state.stack.pop();
          push(call(id("getDescendants"), [multiname, obj]));
          break;
        case OP_newcatch:
          assert(exceptions[bc.index].scopeObject);
          flushStack();
          flushScope();
          push(constant(exceptions[bc.index].scopeObject));
          state.scopeHeight += 1;
          break;
        case OP_findpropstrict:
          multiname = popMultiname(bc.index);
          push(findProperty(multiname, true));
          break;
        case OP_findproperty:
          multiname = popMultiname(bc.index);
          push(findProperty(multiname, false));
          break;
        case OP_finddef:        notImplemented(); break;
        case OP_getlex:
          multiname = getMultiname(bc.index);
          push(getProperty(findProperty(multiname, true), multiname));
          break;
        case OP_initproperty:
        case OP_setproperty:
          value = state.stack.pop();
          multiname = popMultiname(bc.index);
          flushStack();
          obj = state.stack.pop();
          emit(setProperty(obj, multiname, value, bc.propertyType));
          break;
        case OP_getlocal:       push(local[bc.index]); break;
        case OP_setlocal:       setLocal(bc.index); break;
        case OP_getglobalscope:
          push(property(scopeName, "global.object"));
          break;
        case OP_getscopeobject:
          obj = scopeName;
          for (var i = 0; i < (state.scopeHeight - 1) - bc.index; i++) {
            obj = property(obj, "parent");
          }
          push(property(obj, "object"));
          break;
        case OP_getproperty:
          multiname = popMultiname(bc.index);
          obj = state.stack.pop();
          push(getProperty(obj, multiname, bc.propertyType));
          break;
        case OP_getouterscope:      notImplemented(); break;
        case OP_setpropertylate:    notImplemented(); break;
        case OP_deleteproperty:
          multiname = popMultiname(bc.index);
          obj = state.stack.pop();
          push(call(id("deleteProperty"), [obj, multiname]));
          flushStack();
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
        case OP_convert_s:      push(call(id("toString"), [state.stack.pop()])); break;
        case OP_esc_xelem:      notImplemented(); break;
        case OP_esc_xattr:      notImplemented(); break;
        case OP_coerce_i:
        case OP_convert_i:
          push(asInt32(state.stack.pop()));
          break;
        case OP_coerce_u:
        case OP_convert_u:
          push(call(id("toUint"), [state.stack.pop()]));
          break;
        case OP_coerce_d:
        case OP_convert_d:
          push(call(id("toDouble"), [state.stack.pop()]));
          break;
        case OP_coerce_b:
        case OP_convert_b:
          push(new UnaryExpression(Operator.FALSE, new UnaryExpression(Operator.FALSE, state.stack.pop())));
          break;
        case OP_convert_o:      notImplemented(); break;
        case OP_checkfilter:
          push(call(id("checkFilter"), [state.stack.pop()]));
          break;
        case OP_convert_f:      notImplemented(); break;
        case OP_unplus:         notImplemented(); break;
        case OP_convert_f4:     notImplemented(); break;
        case OP_coerce:
          value = state.stack.pop();
          multiname = getMultiname(bc.index);
          type = getProperty(findProperty(multiname, true), multiname);
          push(call(id("coerce"), [value, type]));
          break;
        case OP_coerce_a:       /* NOP */ break;
        case OP_coerce_s:       push(call(id("coerceString"), [state.stack.pop()])); break;
        case OP_astype:         notImplemented(); break;
        case OP_astypelate:     notImplemented(); break;
        case OP_coerce_o:       notImplemented(); break;
        case OP_negate:         expression(Operator.NEG); break;
        case OP_increment:
          push(constant(1));
          expression(Operator.ADD);
          break;
        case OP_inclocal:
          emit(new UpdateExpression("++", local[bc.index]));
          break;
        case OP_decrement:
          push(constant(1));
          expression(Operator.SUB);
          break;
        case OP_declocal:
          emit(new UpdateExpression("--", local[bc.index]));
          break;
        case OP_typeof:
          push(call(id("typeOf"), [state.stack.pop()]));
          break;
        case OP_not:            expression(Operator.FALSE); break;
        case OP_bitnot:         expression(Operator.BITWISE_NOT); break;
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
          type = state.stack.pop();
          value = state.stack.pop();
          push(call(id("instanceOf"), [value, type]));
          break;
        case OP_istype:
          value = state.stack.pop();
          multiname = getMultiname(bc.index);
          type = getProperty(findProperty(multiname, true), multiname);
          push(call(id("isType"), [value, type]));
          break;
        case OP_istypelate:
          type = state.stack.pop();
          value = state.stack.pop();
          push(call(id("isType"), [value, type]));
          break;
        case OP_in:             notImplemented(); break;
        case OP_increment_i:
          push(constant(1));
          expression(Operator.ADD, true);
          break;
        case OP_decrement_i:
          push(constant(1));
          expression(Operator.SUB, true);
          break;
        case OP_inclocal_i:
          emit(new UpdateExpression("++", asInt32(local[bc.index])));
          break;
        case OP_declocal_i:
          emit(new UpdateExpression("--", asInt32(local[bc.index])));
          break;
        case OP_negate_i:       expression(Operator.NEG, true); break;
        case OP_add_i:          expression(Operator.ADD, true); break;
        case OP_subtract_i:     expression(Operator.SUB, true); break;
        case OP_multiply_i:     expression(Operator.MUL, true); break;
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
      }

      flushStack();

      if (writer) {
        state.trace(writer);
        writer.enter("body: {");
        for (var i = 0; i < body.length; i++) {
          writer.writeLn(generate(body[i]));
        }
        writer.leave("}");
      }

      return {node: new BlockStatement(body), condition: condition, state: state};
    };

    return compilation;

  })();

  compiler.prototype.compileMethod = function compileMethod(methodInfo, hasDefaults, scope) {
    assert(methodInfo.analysis);
    // methodInfo.analysis.trace(new IndentingWriter());

    if (enableVerifier.value) {
      this.verifier.verifyMethod(methodInfo, scope);
    }

    Timer.start("compiler");
    var cx = new Compilation(this, methodInfo, scope);
    Timer.start("ast");
    var node = cx.compile();
    Timer.stop();
    Timer.start("gen");
    var code = generate(node);
    Timer.stop();
    Timer.stop();
    return code;
  };

  compiler.Operator = Operator;

  return compiler;
})();
