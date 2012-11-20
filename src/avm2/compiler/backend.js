(function (exports) {

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
  const Property = T.Property;
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
  const SwitchStatement = T.SwitchStatement;
  const SwitchCase = T.SwitchCase;
  const TryStatement = T.TryStatement;
  const CatchClause = T.CatchClause;

  var Block = IR.Block;
  var Operator = IR.Operator;
  var If = IR.If;
  var Jump = IR.Jump;
  var Projection = IR.Projection;
  var Start = IR.Start;
  var Control = Looper.Control;

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

  Block.prototype.compile = function (cx, state) {
    return cx.compileBlock(this, state);
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
    const constantsName = new Identifier("$C");

    function objectId(object) {
      release || assert(object);
      if (object.hasOwnProperty("objectID")) {
        return object.objectId;
      }
      var id = $C.length;
      Object.defineProperty(object, "objectID", {value: id, writable: false, enumerable: false});
      $C.push(object);
      return id;
    }

    function constant(value) {
      this.value = value;
      if (value === undefined) {
        Identifier.call(this, "undefined");
      } else if (value !== null && typeof value === "object") {
        release || assert(value instanceof Multiname ||
          value instanceof Runtime ||
          value instanceof Domain ||
          value instanceof MethodInfo ||
          value instanceof ClassInfo ||
          value instanceof AbcFile ||
          value instanceof Array ||
          value instanceof CatchScopeObject ||
          value instanceof Scope ||
          value instanceof Global ||
          value instanceof Interface,
          "Should not make constants from ", value);
        MemberExpression.call(this, constantsName, new Literal(objectId(value)), true);
      } else {
        if (typeof value === "number" && isNaN(value)) {
          Identifier.call(this, "NaN");
        } else if (value === Infinity) {
          Identifier.call(this, "Infinity");
        } else if (value === -Infinity) {
          UnaryExpression.call(this, "-", new Identifier("Infinity"));
        } else if (typeof value === "number" && (1 / value) < 0) {
          UnaryExpression.call(this, "-", new Literal(Math.abs(value)));
        } else {
          Literal.call(this, value);
        }
      }
    }
    return constant;
  })();

  function constant(value) {
    return new Constant(value);
  }

  function id(name) {
    assert (typeof name === "string");
    return new Identifier(name);
  }


  function isIdentifierStart(c) {
    return (c === '$') || (c === '_') || (c === '\\') || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
  }

  function isIdentifierPart(c) {
    return (c === '$') || (c === '_') || (c === '\\') || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') ||
      ((c >= '0') && (c <= '9'));
  }

  function isIdentifier(s) {
    if (!isIdentifierStart(s[0])) {
      return false;
    }
    for (var i = 1; i < s.length; i++) {
      if (!isIdentifierPart(s[i])) {
        return false;
      }
    }
    return true;
  }

  function property(obj) {
    var path = Array.prototype.slice.call(arguments, 1);
    path.forEach(function(x) {
      if (isIdentifier(x)) {
        obj = new MemberExpression(obj, new Identifier(x), false);
      } else {
        obj = new MemberExpression(obj, new Literal(x), true);
      }
    });
    return obj;
  }

  function call(callee, arguments) {
    assert(arguments instanceof Array);
    arguments.forEach(function (x) {
      assert(!(x instanceof Array));
      assert(x !== undefined);
    });
    return new CallExpression(callee, arguments);
  }

  function callCall(callee, object, arguments) {
    return call(property(callee, "call"), [object].concat(arguments));
  }

  function assignment(left, right) {
    assert(left && right);
    return new AssignmentExpression(left, "=", right);
  }

  function variableDeclaration(declarations) {
    return new VariableDeclaration("var", declarations);
  }

  function negate(node) {
    if (node instanceof Constant) {
      if (node.value === true || node.value === false) {
        return new Constant(!node.value);
      }
    } else if (node instanceof Identifier) {
      return new UnaryExpression(Operator.FALSE.name, node);
    }
    release || assert(node instanceof BinaryExpression || node instanceof UnaryExpression, node);
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

  function Context () {
    this.parameters = [];
  }

  Context.prototype.useParameter = function (parameter) {
    return this.parameters[parameter.index] = parameter;
  };

  Context.prototype.compileBreak = function compileBreak(node) {
    var body = [new BreakStatement(null)];
    return new BlockStatement(body);
  };

  Context.prototype.compileIf = function compileIf(node) {
    var cr = node.cond.compile(this);
    var tr = null, er = null;
    if (node.then) {
      tr = node.then.compile(this);
    }
    if (node.else) {
      er = node.else.compile(this);
    }
    var condition = compileValue(cr.end.predicate, this);
    condition = node.negated ? negate(condition) : condition;
    cr.body.push(new IfStatement(condition, tr || new BlockStatement([]), er || null));
    return cr;
  };

  Context.prototype.compileLoop = function compileLoop(node) {
    var br = node.body.compile(this);
    return new WhileStatement(constant(true), br);
  };

  Context.prototype.compileSequence = function compileSequence(node) {
    var cx = this;
    var body = [];
    node.body.forEach(function (x) {
      var result = x.compile(cx);
      if (result instanceof BlockStatement) {
        body = body.concat(result.body);
      } else {
        body.push(result);
      }
    });
    return new BlockStatement(body);
  };

  Context.prototype.compileBlock = function compileBlock(block) {
    var body = [];
    for (var i = 1; i < block.nodes.length - 1; i++) {
      print("Block[" + i + "]: " + block.nodes[i]);
    }
    for (var i = 1; i < block.nodes.length - 1; i++) {
      var node = block.nodes[i];
      print("Generating: " + node);

      var statement;

      var to;
      var from;

      if (node instanceof IR.Move) {
        to = id(node.to.name);
        from = compileValue(node.from, this);
      } else {
        to = id(node.variable.name);
        from = compileValue(node, this, true);
      }

      statement = variableDeclaration([
        new VariableDeclarator(to, from)
      ]);

      print(generateSource(statement));
      body.push(statement);
    }
    var end = block.nodes.last();
    if (end instanceof IR.Stop) {
      body.push(new ReturnStatement(compileValue(end.argument, this)));
    }
    var result = new BlockStatement(body);
    result.end = block.nodes.last();
    assert (result.end instanceof IR.End);
    return result;
  };

  function compileValue(value, cx, noVariable) {
    assert (value);
    assert (value.compile, "Implement |compile| for " + value + " (" + value.nodeName + ")");
    assert (cx instanceof Context);
    assert (!isArray(value));
    if (noVariable || !value.variable) {
      return value.compile(cx);
    }
    assert (value.variable, "Value has no variable: " + value);
    return id(value.variable.name);
  }

  function isArray(array) {
    return array instanceof Array;
  }

  function compileValues(values, cx) {
    assert (isArray(values));
    return values.map(function (value) {
      return compileValue(value, cx);
    });
  }

  IR.Parameter.prototype.compile = function (cx) {
    cx.useParameter(this);
    return id(this.name);
  };

  IR.Constant.prototype.compile = function (cx) {
    return constant(this.value);
  };

  IR.Variable.prototype.compile = function (cx) {
    return id(this.name);
  };

  IR.Phi.prototype.compile = function (cx) {
    assert (this.variable);
    return compileValue(this.variable, cx);
  };

  IR.Scope.prototype.compile = function (cx) {
    var parent = compileValue(this.parent, cx);
    return new NewExpression(id("Scope"), [parent]);
  };

  IR.FindProperty.prototype.compile = function (cx) {
    var scope = compileValue(this.scope, cx);
    return call(property(scope, "findProperty"), []);
  };

  IR.GetProperty.prototype.compile = function (cx) {
    var object = compileValue(this.object, cx);
    var name = compileValue(this.name, cx);
    return call(id("getProperty"), [object, name]);
  };

  IR.Unary.prototype.compile = function (cx) {
    return new UnaryExpression(this.operator.name, compileValue(this.argument, cx));
  };

  IR.Binary.prototype.compile = function (cx) {
    return new BinaryExpression(this.operator.name, compileValue(this.left, cx), compileValue(this.right, cx));
  };

  IR.Call.prototype.compile = function (cx) {
    var arguments = this.arguments.map(function (arg) {
      return compileValue(arg, cx);
    });
    var callee = compileValue(this.callee, cx);
    if (this.object) {
      var object = compileValue(this.object, cx);
      return callCall(callee, object, arguments);
    }
    return call(callee, arguments);
  };

  IR.This.prototype.compile = function (cx) {
    return new ThisExpression();
  };

  IR.Global.prototype.compile = function (cx) {
    var scope = compileValue(this.scope, cx);
    return property(scope, "global", "object");
  };

  IR.SetProperty.prototype.compile = function (cx) {
    var object = compileValue(this.object, cx);
    var name = compileValue(this.name, cx);
    var value = compileValue(this.value, cx);
    return call(id("setProperty"), [object, name, value]);
  };

  IR.GetProperty.prototype.compile = function (cx) {
    var object = compileValue(this.object, cx);
    var name = compileValue(this.name, cx);
    return call(id("getProperty"), [object, name]);
  };

  IR.SetSlot.prototype.compile = function (cx) {
    notImplemented();
  };

  IR.GetSlot.prototype.compile = function (cx) {
    var object = compileValue(this.object, cx);
    var index = compileValue(this.index, cx);
    return(call(id("getSlot"), [object, index]));
  };

  IR.Projection.prototype.compile = function (cx) {
    assert (this.type === Projection.Type.SCOPE);
    assert (this.argument instanceof Start);
    return compileValue(this.argument.scope, cx);
  };

  IR.NewArray.prototype.compile = function (cx) {
    return new ArrayExpression(compileValues(this.elements, cx));
  };

  IR.NewObject.prototype.compile = function (cx) {
    var properties = this.properties.map(function (property) {
      var key = compileValue(property.key, cx);
      var value = compileValue(property.value, cx);
      return new Property(key, value, "init");
    });
    return new ObjectExpression(properties);
  };

  IR.RuntimeMultiname.prototype.compile = function (cx) {
    // CallExpression.call(this, property(id("Multiname"), "getMultiname"), [namespaces, name]);
    var namespaces = compileValue(this.namespaces, cx);
    var name = compileValue(this.name, cx);
    return call(property(id("Multiname"), "getMultiname"), [namespaces, name]);
  };
  function generateSource(node) {
    return escodegen.generate(node, {base: "", indent: "  ", comment: true});
  }

  function generate(cfg) {
    var root = Looper.analyze(cfg);

    var writer = new IndentingWriter();
    root.trace(writer);

    var cx = new Context();
    var body = root.compile(cx);

    var parameters = [];
    for (var i = 0; i < cx.parameters.length; i++) {
      var name = cx.parameters[i] ? cx.parameters[i].name : "_";
      parameters.push(id(name));
    }
    var node = new FunctionDeclaration(id("fn"), parameters, body);

    writer.writeLn("==================================");
    writer.writeLn(generateSource(node));
    writer.writeLn("==================================");

    return generateSource(body);
  }

  Backend.generate = generate;
})(typeof exports === "undefined" ? (Backend = {}) : exports);