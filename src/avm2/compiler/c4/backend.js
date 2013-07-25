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

(function (exports) {

  var T = estransform;
  var Literal = T.Literal;
  var Identifier = T.Identifier;
  var VariableDeclaration = T.VariableDeclaration;
  var VariableDeclarator = T.VariableDeclarator;
  var MemberExpression = T.MemberExpression;
  var BinaryExpression = T.BinaryExpression;
  var SequenceExpression = T.SequenceExpression;
  var CallExpression = T.CallExpression;
  var AssignmentExpression = T.AssignmentExpression;
  var ExpressionStatement = T.ExpressionStatement;
  var ReturnStatement = T.ReturnStatement;
  var Program = T.Program;
  var Statement = T.Statement;
  var FunctionDeclaration = T.FunctionDeclaration;
  var FunctionExpression = T.FunctionExpression;
  var ConditionalExpression = T.ConditionalExpression;
  var ObjectExpression = T.ObjectExpression;
  var ArrayExpression = T.ArrayExpression;
  var UnaryExpression = T.UnaryExpression;
  var NewExpression = T.NewExpression;
  var Property = T.Property;
  var UpdateExpression = T.UpdateExpression;
  var ForStatement = T.ForStatement;
  var BlockStatement = T.BlockStatement;
  var ThisExpression = T.ThisExpression;
  var TypeAliasDirective = T.TypeAliasDirective;
  var CastExpression = T.CastExpression;
  var ThrowStatement = T.ThrowStatement;
  var IfStatement = T.IfStatement;
  var WhileStatement = T.WhileStatement;
  var BreakStatement = T.BreakStatement;
  var ContinueStatement = T.ContinueStatement;
  var SwitchStatement = T.SwitchStatement;
  var SwitchCase = T.SwitchCase;
  var TryStatement = T.TryStatement;
  var CatchClause = T.CatchClause;

  var Block = IR.Block;
  var Operator = IR.Operator;
  var If = IR.If;
  var Jump = IR.Jump;
  var Projection = IR.Projection;
  var Start = IR.Start;
  var Control = Looper.Control;
  var Variable = IR.Variable;

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

  function constant(value) {
    // TODO MEMORY: Cache AST nodes for constants.
    if (typeof value === "string" || value === null || value === true || value === false) {
      return new Literal(value);
    } else if (value === undefined) {
      return new Identifier("undefined");
    } else if (typeof value === "object" || typeof value === "function") {
      return new Identifier(objectConstantName(value));
    } else if (typeof value === "number" && isNaN(value)) {
      return new Identifier("NaN");
    } else if (value === Infinity) {
      return new Identifier("Infinity");
    } else if (value === -Infinity) {
      return new UnaryExpression("-", new Identifier("Infinity"));
    } else if (typeof value === "number" && (1 / value) < 0) {
      return new UnaryExpression("-", new Literal(Math.abs(value)));
    } else if (typeof value === "number") {
      return new Literal(value);
    } else {
      unexpected("Cannot emit constant for value: ", value);
    }
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

  function isIdentifierName(s) {
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
      if (typeof x === "string") {
        if (isIdentifierName(x)) {
          obj = new MemberExpression(obj, new Identifier(x), false);
        } else {
          obj = new MemberExpression(obj, new Literal(x), true);
        }
      } else if (x instanceof Literal && isIdentifierName(x.value)) {
        obj = new MemberExpression(obj, new Identifier(x.value), false);
      } else {
        obj = new MemberExpression(obj, x, true);
      }
    });
    return obj;
  }

  function call(callee, args) {
    assert(args instanceof Array);
    args.forEach(function (x) {
      assert(!(x instanceof Array));
      assert(x !== undefined);
    });
    return new CallExpression(callee, args);
  }

  function callCall(callee, object, args) {
    return call(property(callee, "call"), [object].concat(args));
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
        return constant(!node.value);
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
    this.label = new Variable("$L");
    this.variables = [];
    this.parameters = [];
  }

  Context.prototype.useVariable = function (variable) {
    assert (variable);
    return this.variables.pushUnique(variable);
  };

  Context.prototype.useParameter = function (parameter) {
    return this.parameters[parameter.index] = parameter;
  };

  Context.prototype.compileLabelBody = function compileLabelBody(node) {
    var body = [];
    if (node.label !== undefined) {
      this.useVariable(this.label);
      body.push(new ExpressionStatement(assignment(id(this.label.name), new Literal(node.label))));
    }
    return body;
  };

  Context.prototype.compileBreak = function compileBreak(node) {
    var body = this.compileLabelBody(node);
    body.push(new BreakStatement(null));
    return new BlockStatement(body);
  };

  Context.prototype.compileContinue = function compileContinue(node) {
    var body = this.compileLabelBody(node);
    body.push(new ContinueStatement(null));
    return new BlockStatement(body);
  };

  Context.prototype.compileExit = function compileExit(node) {
    return new BlockStatement(this.compileLabelBody(node));
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

  Context.prototype.compileSwitch = function compileSwitch(node) {
    var dr = node.determinant.compile(this);
    var cases = [];
    node.cases.forEach(function (x) {
      var br;
      if (x.body) {
        br = x.body.compile(this);
      }
      var test = typeof x.index === "number" ? new Literal(x.index) : undefined;
      cases.push(new SwitchCase(test, br ? [br] : []));
    }, this);
    var determinant = compileValue(dr.end.determinant, this);
    dr.body.push(new SwitchStatement(determinant, cases, false))
    return dr;
  };

  Context.prototype.compileLabelSwitch = function compileLabelSwitch(node) {
    var statement = null;
    var labelName = id(this.label.name);

    function compileLabelTest(labelID) {
      release || assert(typeof labelID === "number");
      return new BinaryExpression("===", labelName, new Literal(labelID));
    }

    for (var i = node.cases.length - 1; i >= 0; i--) {
      var c = node.cases[i];
      var labels = c.labels;

      var labelTest = compileLabelTest(labels[0]);

      for (var j = 1; j < labels.length; j++) {
        labelTest = new BinaryExpression("||", labelTest, compileLabelTest(labels[j]));
      }

      statement = new IfStatement(
        labelTest,
        c.body ? c.body.compile(this) : new BlockStatement(),
        statement);
    }
    return statement;
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
    /*
    for (var i = 1; i < block.nodes.length - 1; i++) {
      print("Block[" + i + "]: " + block.nodes[i]);
    }
    */
    for (var i = 1; i < block.nodes.length - 1; i++) {
      var node = block.nodes[i];
      var statement;
      var to;
      var from;

      if (node instanceof IR.Throw) {
        statement = compileValue(node, this, true);
      } else {
        if (node instanceof IR.Move) {
          to = id(node.to.name);
          this.useVariable(node.to);
          from = compileValue(node.from, this);
        } else {
          if (node.variable) {
            to = id(node.variable.name);
            this.useVariable(node.variable);
          } else {
            to = null;
          }
          from = compileValue(node, this, true);
        }
        if (to) {
          statement = new ExpressionStatement(assignment(to, from));
        } else {
          statement = new ExpressionStatement(from);
        }
      }
      body.push(statement);
    }
    var end = block.nodes.last();
    if (end instanceof IR.Stop) {
      body.push(new ReturnStatement(compileValue(end.argument, this)));
    }
    var result = new BlockStatement(body);
    result.end = block.nodes.last();
    assert (result.end instanceof IR.End);
    // print("Block: " + block + " -> " + generateSource(result));
    return result;
  };

  function compileValue(value, cx, noVariable) {
    assert (value);
    assert (value.compile, "Implement |compile| for ", value, " (", value.nodeName + ")");
    assert (cx instanceof Context);
    assert (!isArray(value));
    if (noVariable || !value.variable) {
      var node = value.compile(cx);
      return node;
    }
    assert (value.variable, "Value has no variable: ", value);
    return id(value.variable.name);
  }

  function compileMultiname(name, cx) {
    return [
      compileValue(name.namespaces, cx),
      compileValue(name.name, cx),
      constant(name.flags)
    ];
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

  IR.AVM2Scope.prototype.compile = function (cx) {
    var parent = compileValue(this.parent, cx);
    var object = compileValue(this.object, cx);
    var isWith = new Literal(this.isWith);
    return new NewExpression(id("Scope"), [parent, object, isWith]);
  };


  IR.AVM2FindProperty.prototype.compile = function (cx) {
    var scope = compileValue(this.scope, cx);
    var name = compileMultiname(this.name, cx);
    var domain = compileValue(this.domain, cx);
    var strict = new Literal(this.strict);
    return call(property(scope, "findScopeProperty"), name.concat([domain, strict]));
  };

  IR.AVM2GetProperty.prototype.compile = function (cx) {
    var object = compileValue(this.object, cx);
    var name = compileMultiname(this.name, cx);
    if (this.isIndexed) {
      assert (this.isMethod === false);
      return new ConditionalExpression (
        property(object, "indexGet"),
        call(property(object, "indexGet"), [name]),
        property(object, name)
      );
    }
    var isMethod = new Literal(this.isMethod);
    return call(property(object, "getMultinameProperty"), name.concat(isMethod));
  };

  IR.Latch.prototype.compile = function (cx) {
    return new ConditionalExpression (
      compileValue(this.condition, cx),
      compileValue(this.left, cx),
      compileValue(this.right, cx)
    );
  };

  IR.Unary.prototype.compile = function (cx) {
    return new UnaryExpression (
      this.operator.name,
      compileValue(this.argument, cx)
    );
  };

  IR.Copy.prototype.compile = function (cx) {
    return compileValue(this.argument, cx);
  };

  IR.Binary.prototype.compile = function (cx) {
    var left = compileValue(this.left, cx);
    var right = compileValue(this.right, cx);
    if (this.operator === Operator.AVM2ADD) {
      return call(id("avm2Add"), [left, right]);
    }
    return new BinaryExpression (this.operator.name, left, right);
  };

  IR.CallProperty.prototype.compile = function (cx) {
    var object = compileValue(this.object, cx);
    var name = compileValue(this.name, cx);
    var callee = property(object, name);
    var args = this.arguments.map(function (arg) {
      return compileValue(arg, cx);
    });
    if (this.pristine) {
      return call(callee, args);
    } else {
      return callCall(callee, object, args);
    }
  };

  IR.AVM2CallProperty.prototype.compile = function (cx) {
    var object = compileValue(this.object, cx);
    var name = compileMultiname(this.name, cx);
    var args = this.arguments.map(function (arg) {
      return compileValue(arg, cx);
    });
    return call(property(object, "callMultinameProperty"), name.concat([new Literal(this.isLex), new ArrayExpression(args)]));
  };

  IR.Call.prototype.compile = function (cx) {
    var args = this.arguments.map(function (arg) {
      return compileValue(arg, cx);
    });
    var callee = compileValue(this.callee, cx);
    var object;
    if (this.object) {
      object = compileValue(this.object, cx);
    } else {
      object = new Literal(null);
    }
    if (false && this.pristine &&
        (this.callee instanceof IR.GetProperty && this.callee.object === this.object) ||
        this.object === null) {
      return call(callee, args);
    } else {
      return callCall(callee, object, args);
    }
  };

  IR.AVM2New.prototype.compile = function (cx) {
    var args = this.arguments.map(function (arg) {
      return compileValue(arg, cx);
    });
    var callee = compileValue(this.callee, cx);
    callee = property(callee, "instanceConstructor");
    return new NewExpression(callee, args);
  };

  IR.This.prototype.compile = function (cx) {
    return new ThisExpression();
  };

  IR.Throw.prototype.compile = function (cx) {
    var argument = compileValue(this.argument, cx);
    return new ThrowStatement(argument);
  };

  IR.Arguments.prototype.compile = function (cx) {
    return id("arguments");
  };

  IR.AVM2Global.prototype.compile = function (cx) {
    var scope = compileValue(this.scope, cx);
    return property(scope, "global", "object");
  };

  IR.AVM2SetProperty.prototype.compile = function (cx) {
    var object = compileValue(this.object, cx);
    var name = compileMultiname(this.name, cx);
    var value = compileValue(this.value, cx);
    if (this.isIndexed) {
      return new ConditionalExpression (
        property(object, "indexSet"),
        call(property(object, "indexSet"), [name, value]),
        assignment(property(object, name), value)
      );
    }
    return call(property(object, "setMultinameProperty"), name.concat(value));
  };

  IR.AVM2DeleteProperty.prototype.compile = function (cx) {
    var object = compileValue(this.object, cx);
    var name = compileMultiname(this.name, cx);
    return call(property(object, "deleteMultinameProperty"), name);
  };

  IR.AVM2HasProperty.prototype.compile = function (cx) {
    var object = compileValue(this.object, cx);
    var name = compileMultiname(this.name, cx);
    return call(property(object, "hasMultinameProperty"), name);
  };

  IR.GlobalProperty.prototype.compile = function (cx) {
    return id(this.name);
  };

  IR.GetProperty.prototype.compile = function (cx) {
    var object = compileValue(this.object, cx);
    var name = compileValue(this.name, cx);
    return property(object, name);
  };

  IR.SetProperty.prototype.compile = function (cx) {
    var object = compileValue(this.object, cx);
    var name = compileValue(this.name, cx);
    var value = compileValue(this.value, cx);
    return assignment(property(object, name), value);
  };

  IR.AVM2GetDescendants.prototype.compile = function (cx) {
    var object = compileValue(this.object, cx);
    var name = compileValue(this.name, cx);
    return call(id("getDescendants"), [object, name]);
  };

  IR.AVM2SetSlot.prototype.compile = function (cx) {
    var object = compileValue(this.object, cx);
    var index = compileValue(this.index, cx);
    var value = compileValue(this.value, cx);
    return(call(id("setSlot"), [object, index, value]));
  };

  IR.AVM2GetSlot.prototype.compile = function (cx) {
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

  IR.AVM2NewActivation.prototype.compile = function (cx) {
    var methodInfo = compileValue(this.methodInfo, cx);
    return call(id("createActivation"), [methodInfo]);
  };

  IR.AVM2Multiname.prototype.compile = function (cx) {
    var namespaces = compileValue(this.namespaces, cx);
    var name = compileValue(this.name, cx);
    return call(id("createName"), [namespaces, name]);
  };

  function generateSource(node) {
    return escodegen.generate(node, {base: "", indent: "  ", comment: true});
  }

  function generate(cfg) {
    var root = Looper.analyze(cfg);

    var writer = new IndentingWriter();
    // root.trace(writer);

    var cx = new Context();
    var code = root.compile(cx);

    var parameters = [];
    for (var i = 0; i < cx.parameters.length; i++) {
      var name = cx.parameters[i] ? cx.parameters[i].name : "_";
      parameters.push(id(name));
    }

    if (cx.variables.length) {
      Counter.count("Backend: Locals", cx.variables.length);
      var variables = variableDeclaration(cx.variables.map(function (variable) {
        return new VariableDeclarator(id(variable.name));
      }));
      code.body.unshift(variables);
    }

    // var node = new FunctionDeclaration(id("fn"), parameters, code);

    // writer.writeLn("==================================");
    // writer.writeLn(generateSource(node));
    // writer.writeLn("==================================");

    return generateSource(code);
  }

  Backend.generate = generate;
})(typeof exports === "undefined" ? (Backend = {}) : exports);
