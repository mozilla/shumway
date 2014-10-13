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

module Shumway.AVM2.Compiler.Backend {
  import assert = Shumway.Debug.assert;
  import unexpected = Shumway.Debug.unexpected;
  import notImplemented = Shumway.Debug.notImplemented;
  import pushUnique = Shumway.ArrayUtilities.pushUnique;

  import AST = Shumway.AVM2.Compiler.AST;
  import Literal = AST.Literal;
  import Identifier = AST.Identifier;
  import VariableDeclaration = AST.VariableDeclaration;
  import VariableDeclarator = AST.VariableDeclarator;
  import MemberExpression = AST.MemberExpression;
  import BinaryExpression = AST.BinaryExpression;
  import CallExpression = AST.CallExpression;
  import AssignmentExpression = AST.AssignmentExpression;
  import ExpressionStatement = AST.ExpressionStatement;
  import ReturnStatement = AST.ReturnStatement;
  import FunctionDeclaration = AST.FunctionDeclaration;
  import ConditionalExpression = AST.ConditionalExpression;
  import ObjectExpression = AST.ObjectExpression;
  import ArrayExpression = AST.ArrayExpression;
  import UnaryExpression = AST.UnaryExpression;
  import NewExpression = AST.NewExpression;
  import Property = AST.Property;
  import BlockStatement = AST.BlockStatement;
  import ThisExpression = AST.ThisExpression;
  import ThrowStatement = AST.ThrowStatement;
  import IfStatement = AST.IfStatement;
  import WhileStatement = AST.WhileStatement;
  import BreakStatement = AST.BreakStatement;
  import ContinueStatement = AST.ContinueStatement;
  import SwitchStatement = AST.SwitchStatement;
  import SwitchCase = AST.SwitchCase;

  import Start = IR.Start;
  import Block = IR.Block;
  import Variable = IR.Variable;
  import Constant = IR.Constant;
  import Operator = IR.Operator;
  import Projection = IR.Projection;

  var Control = Shumway.AVM2.Compiler.Looper.Control;

  import ControlNode = Looper.Control.ControlNode;
  import last = Shumway.ArrayUtilities.last;

  Control.Break.prototype.compile = function (cx: Context): Compiler.AST.Node {
    return cx.compileBreak(this);
  };

  Control.Continue.prototype.compile = function (cx: Context): Compiler.AST.Node {
    return cx.compileContinue(this);
  };

  Control.Exit.prototype.compile = function (cx: Context): Compiler.AST.Node {
    return cx.compileExit(this);
  };

  Control.LabelSwitch.prototype.compile = function (cx: Context): Compiler.AST.Node {
    return cx.compileLabelSwitch(this);
  };

  Control.Seq.prototype.compile = function (cx: Context): Compiler.AST.Node {
    return cx.compileSequence(this);
  };

  Control.Loop.prototype.compile = function (cx: Context): Compiler.AST.Node {
    return cx.compileLoop(this);
  };

  Control.Switch.prototype.compile = function (cx: Context): Compiler.AST.Node {
    return cx.compileSwitch(this);
  };

  Control.If.prototype.compile = function (cx: Context): Compiler.AST.Node {
    return cx.compileIf(this);
  };

  Control.Try.prototype.compile = function (cx: Context): Compiler.AST.Node {
    notImplemented("try");
    return null;
  };

  var F = new Identifier("$F");
  var C = new Identifier("$C");

  function isLazyConstant(value) {
    return value instanceof Shumway.AVM2.Runtime.LazyInitializer;
  }

  function constant(value, cx?: Context): AST.Node {
    if (typeof value === "string" || value === null || value === true || value === false) {
      return new Literal(value);
    } else if (value === undefined) {
      return new Identifier("undefined");
    } else if (typeof value === "object" || typeof value === "function") {
      if (isLazyConstant(value)) {
        return call(property(F, "C"), [new Literal(cx.useConstant(value))]);
      } else {
        return new MemberExpression(C, new Literal(cx.useConstant(value)), true);
      }
    } else if (typeof value === "number" && isNaN(value)) {
      return new Identifier("NaN");
    } else if (value === Infinity) {
      return new Identifier("Infinity");
    } else if (value === -Infinity) {
      return new UnaryExpression("-", true, new Identifier("Infinity"));
    } else if (typeof value === "number" && (1 / value) < 0) {
      return new UnaryExpression("-", true, new Literal(Math.abs(value)));
    } else if (typeof value === "number") {
      return new Literal(value);
    } else {
      unexpected("Cannot emit constant for value: " + value);
    }
  }

  function id(name) {
    release || assert (typeof name === "string");
    return new Identifier(name);
  }

  function isIdentifierStart(c) {
    return (c === '$') || (c === '_') || (c === '\\') || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
  }

  function isIdentifierPart(c) {
    return (c === '$') || (c === '_') || (c === '\\') || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || ((c >= '0') && (c <= '9'));
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

  function property(obj, ...args) {
    for (var i = 0; i < args.length; i++) {
      var x = args[i];
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
    }
    return obj;
  }

  function call(callee, args): CallExpression {
    release || assert(args instanceof Array);
    release || args.forEach(function (x) {
      release || assert(!(x instanceof Array));
      release || assert(x !== undefined);
    });
    return new CallExpression(callee, args);
  }

  function callAsCall(callee, object, args) {
    return call(property(callee, "asCall"), [object].concat(args));
  }

  function callCall(callee, object, args) {
    return call(property(callee, "call"), [object].concat(args));
  }

  function assignment(left, right) {
    release || assert(left && right);
    return new AssignmentExpression("=", left, right);
  }

  function variableDeclaration(declarations) {
    return new VariableDeclaration(declarations, "var");
  }

  function negate(node) {
    if (node instanceof Constant) {
      if (node.value === true || node.value === false) {
        return constant(!node.value);
      }
    } else if (node instanceof Identifier) {
      return new UnaryExpression(Operator.FALSE.name, true, node);
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
        return new UnaryExpression(operator.not.name, true, left);
      }
    }
    return new UnaryExpression(Operator.FALSE.name, true, node);
  }

  export class Context {
    label = new Variable("$L");
    variables = [];
    constants = [];
    parameters = [];

    useConstant(constant: IR.Constant): number {
      return pushUnique(this.constants, constant);
    }

    useVariable(variable: IR.Variable) {
      release || assert (variable);
      return pushUnique(this.variables, variable);
    }

    useParameter(parameter: IR.Parameter) {
      return this.parameters[parameter.index] = parameter;
    }

    compileLabelBody(node) {
      var body = [];
      if (node.label !== undefined) {
        this.useVariable(this.label);
        body.push(new ExpressionStatement(assignment(id(this.label.name), new Literal(node.label))));
      }
      return body;
    }

    compileBreak(node) {
      var body = this.compileLabelBody(node);
      body.push(new BreakStatement(null));
      return new BlockStatement(body);
    }

    compileContinue(node) {
      var body = this.compileLabelBody(node);
      body.push(new ContinueStatement(null));
      return new BlockStatement(body);
    }

    compileExit(node) {
      return new BlockStatement(this.compileLabelBody(node));
    }

    compileIf(node) {
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
    }

    compileSwitch(node) {
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
    }

    compileLabelSwitch(node) {
      var statement: IfStatement = null;
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
          c.body ? c.body.compile(this) : new BlockStatement([]),
          statement);
      }
      return statement;
    }

    compileLoop(node) {
      var br = node.body.compile(this);
      return new WhileStatement(constant(true), br);
    }

    compileSequence(node) {
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
    }

    compileBlock(block) {
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
      var end = last(block.nodes);
      if (end instanceof IR.Stop) {
        body.push(new ReturnStatement(compileValue(end.argument, this)));
      }
      var result = new BlockStatement(body);
      result.end = last(block.nodes);
      release || assert (result.end instanceof IR.End);
      // print("Block: " + block + " -> " + generateSource(result));
      return result;
    }
  }

  function compileValue(value, cx: Context, noVariable?) {
    release || assert (value);
    release || assert (value.compile, "Implement |compile| for " + value + " (" + value.nodeName + ")");
    release || assert (cx instanceof Context);
    release || assert (!isArray(value));
    if (noVariable || !value.variable) {
      var node = value.compile(cx);
      return node;
    }
    release || assert (value.variable, "Value has no variable: " + value);
    return id(value.variable.name);
  }

  function compileMultiname(name, cx: Context) {
    return [
      compileValue(name.namespaces, cx),
      compileValue(name.name, cx),
      constant(name.flags)
    ];
  }

  function isArray(array) {
    return array instanceof Array;
  }

  function compileValues(values, cx: Context) {
    release || assert (isArray(values));
    return values.map(function (value) {
      return compileValue(value, cx);
    });
  }

  IR.Parameter.prototype.compile = function (cx: Context): Compiler.AST.Node {
    cx.useParameter(this);
    return id(this.name);
  }

  IR.Constant.prototype.compile = function (cx: Context): Compiler.AST.Node {
    return constant(this.value, cx);
  }

  IR.Variable.prototype.compile = function (cx: Context): Compiler.AST.Node {
    return id(this.name);
  }

  IR.Phi.prototype.compile = function (cx: Context): Compiler.AST.Node {
    release || assert (this.variable);
    return compileValue(this.variable, cx);
  }

  IR.ASScope.prototype.compile = function (cx: Context): Compiler.AST.Node {
    var parent = compileValue(this.parent, cx);
    var object = compileValue(this.object, cx);
    var isWith = new Literal(this.isWith);
    return new NewExpression(id("Scope"), [parent, object, isWith]);
  }

  IR.ASFindProperty.prototype.compile = function (cx: Context): Compiler.AST.Node {
    var scope = compileValue(this.scope, cx);
    var name = compileMultiname(this.name, cx);
    var methodInfo = compileValue(this.methodInfo, cx);
    var strict = new Literal(this.strict);
    return call(property(scope, "findScopeProperty"), name.concat([methodInfo, strict]));
  }

  IR.ASGetProperty.prototype.compile = function (cx: Context): Compiler.AST.Node {
    var object = compileValue(this.object, cx);
    if (this.flags & IR.Flags.NumericProperty) {
      release || assert (!(this.flags & IR.Flags.IS_METHOD));
      return call(property(object, "asGetNumericProperty"), [compileValue(this.name.name, cx)]);
    } else if (this.flags & IR.Flags.RESOLVED) {
      return call(property(object, "asGetResolvedStringProperty"), [compileValue(this.name, cx)]);
    }
    var name = compileMultiname(this.name, cx);
    var isMethod = new Literal(this.flags & IR.Flags.IS_METHOD);
    return call(property(object, "asGetProperty"), name.concat(isMethod));
  }

  IR.ASGetSuper.prototype.compile = function (cx: Context): Compiler.AST.Node {
    var scope = compileValue(this.scope, cx);
    var object = compileValue(this.object, cx);
    var name = compileMultiname(this.name, cx);
    return call(property(object, "asGetSuper"), [scope].concat(name));
  }

  IR.Latch.prototype.compile = function (cx: Context): Compiler.AST.Node {
    return new ConditionalExpression (
      compileValue(this.condition, cx),
      compileValue(this.left, cx),
      compileValue(this.right, cx)
    );
  }

  IR.Unary.prototype.compile = function (cx: Context): Compiler.AST.Node {
    return new UnaryExpression (
      this.operator.name,
      true,
      compileValue(this.argument, cx)
    );
  }

  IR.Copy.prototype.compile = function (cx: Context): Compiler.AST.Node {
    return compileValue(this.argument, cx);
  }

  IR.Binary.prototype.compile = function (cx: Context): AST.Expression {
    var left = compileValue(this.left, cx);
    var right = compileValue(this.right, cx);
    if (this.operator === IR.Operator.AS_ADD) {
      return call(id("asAdd"), [left, right]);
    }
    return new BinaryExpression (this.operator.name, left, right);
  }

  IR.CallProperty.prototype.compile = function (cx: Context): Compiler.AST.Node {
    var object = compileValue(this.object, cx);
    var name = compileValue(this.name, cx);
    var callee = property(object, name);
    var args = this.args.map(function (arg) {
      return compileValue(arg, cx);
    });
    if (this.flags & IR.Flags.AS_CALL) {
      return callAsCall(callee, object, args);
    } else if (this.flags & IR.Flags.PRISTINE) {
      return call(callee, args);
    } else {
      return callCall(callee, object, args);
    }
  }

  IR.ASCallProperty.prototype.compile = function (cx: Context): Compiler.AST.Node {
    var object = compileValue(this.object, cx);
    var args = this.args.map(function (arg) {
      return compileValue(arg, cx);
    });
    if (this.flags & IR.Flags.RESOLVED) {
      return call(property(object, "asCallResolvedStringProperty"), [compileValue(this.name, cx), new Literal(this.isLex), new ArrayExpression(args)]);
    }
    var name = compileMultiname(this.name, cx);
    return call(property(object, "asCallProperty"), name.concat([new Literal(this.isLex), new ArrayExpression(args)]));
  }

  IR.ASCallSuper.prototype.compile = function (cx: Context): Compiler.AST.Node {
    var scope = compileValue(this.scope, cx);
    var object = compileValue(this.object, cx);
    var args = this.args.map(function (arg) {
      return compileValue(arg, cx);
    });
    var name = compileMultiname(this.name, cx);
    return call(property(object, "asCallSuper"), [scope].concat(name).concat(new ArrayExpression(args)));
  }

  IR.Call.prototype.compile = function (cx: Context): Compiler.AST.Node {
    var args = this.args.map(function (arg) {
      return compileValue(arg, cx);
    });
    var callee = compileValue(this.callee, cx);
    var object;
    if (this.object) {
      object = compileValue(this.object, cx);
    } else {
      object = new Literal(null);
    }
    if (this.flags & IR.Flags.AS_CALL) {
      return callAsCall(callee, object, args);
    } else if (false && this.pristine &&
        (this.callee instanceof IR.GetProperty && this.callee.object === this.object) ||
        this.object === null) {
      return call(callee, args);
    } else {
      return callCall(callee, object, args);
    }
  }

  IR.ASNew.prototype.compile = function (cx: Context): Compiler.AST.Node {
    var args = this.args.map(function (arg) {
      return compileValue(arg, cx);
    });
    var callee = compileValue(this.callee, cx);
    callee = property(callee, "instanceConstructor");
    return new NewExpression(callee, args);
  }

  IR.This.prototype.compile = function (cx: Context): Compiler.AST.Node {
    return new ThisExpression();
  }

  IR.Throw.prototype.compile = function (cx: Context): Compiler.AST.Node {
    var argument = compileValue(this.argument, cx);
    return new ThrowStatement(argument);
  }

  IR.Arguments.prototype.compile = function (cx: Context): Compiler.AST.Node {
    return id("arguments");
  }

  IR.ASGlobal.prototype.compile = function (cx: Context): Compiler.AST.Node {
    var scope = compileValue(this.scope, cx);
    return property(scope, "global", "object");
  }

  IR.ASSetProperty.prototype.compile = function (cx: Context): Compiler.AST.Node {
    var object = compileValue(this.object, cx);
    var value = compileValue(this.value, cx);
    if (this.flags & IR.Flags.NumericProperty) {
      return call(property(object, "asSetNumericProperty"), [compileValue(this.name.name, cx), value]);
    }
    var name = compileMultiname(this.name, cx);
    return call(property(object, "asSetProperty"), name.concat(value));
  }

  IR.ASSetSuper.prototype.compile = function (cx: Context): Compiler.AST.Node {
    var scope = compileValue(this.scope, cx);
    var object = compileValue(this.object, cx);
    var name = compileMultiname(this.name, cx);
    var value = compileValue(this.value, cx);
    return call(property(object, "asSetSuper"), [scope].concat(name).concat([value]));
  }

  IR.ASDeleteProperty.prototype.compile = function (cx: Context): Compiler.AST.Node {
    var object = compileValue(this.object, cx);
    var name = compileMultiname(this.name, cx);
    return call(property(object, "asDeleteProperty"), name);
  }

  IR.ASHasProperty.prototype.compile = function (cx: Context): Compiler.AST.Node {
    var object = compileValue(this.object, cx);
    var name = compileMultiname(this.name, cx);
    return call(property(object, "asHasProperty"), name);
  }

  IR.GlobalProperty.prototype.compile = function (cx: Context): Compiler.AST.Node {
    return id(this.name);
  }

  IR.GetProperty.prototype.compile = function (cx: Context): Compiler.AST.Node {
    var object = compileValue(this.object, cx);
    var name = compileValue(this.name, cx);
    return property(object, name);
  }

  IR.SetProperty.prototype.compile = function (cx: Context): Compiler.AST.Node {
    var object = compileValue(this.object, cx);
    var name = compileValue(this.name, cx);
    var value = compileValue(this.value, cx);
    return assignment(property(object, name), value);
  }

  IR.ASGetDescendants.prototype.compile = function (cx: Context): Compiler.AST.Node {
    var object = compileValue(this.object, cx);
    var name = compileValue(this.name, cx);
    return call(id("getDescendants"), [object, name]);
  }

  IR.ASSetSlot.prototype.compile = function (cx: Context): Compiler.AST.Node {
    var object = compileValue(this.object, cx);
    var name = compileValue(this.name, cx);
    var value = compileValue(this.value, cx);
    return(call(id("asSetSlot"), [object, name, value]));
  }

  IR.ASGetSlot.prototype.compile = function (cx: Context): Compiler.AST.Node {
    var object = compileValue(this.object, cx);
    var name = compileValue(this.name, cx);
    return(call(id("asGetSlot"), [object, name]));
  }

  IR.Projection.prototype.compile = function (cx: Context): Compiler.AST.Node {
    release || assert (this.type === IR.ProjectionType.SCOPE);
    release || assert (this.argument instanceof Start);
    return compileValue(this.argument.scope, cx);
  }

  IR.NewArray.prototype.compile = function (cx: Context): Compiler.AST.Node {
    return new ArrayExpression(compileValues(this.elements, cx));
  }

  IR.NewObject.prototype.compile = function (cx: Context): Compiler.AST.Node {
    var properties = this.properties.map(function (property) {
      var key = compileValue(property.key, cx);
      var value = compileValue(property.value, cx);
      return new Property(key, value, "init");
    });
    return new ObjectExpression(properties);
  }

  IR.ASNewActivation.prototype.compile = function (cx: Context): Compiler.AST.Node {
    var methodInfo = compileValue(this.methodInfo, cx);
    return call(id("asCreateActivation"), [methodInfo]);
  }

  IR.ASNewHasNext2.prototype.compile = function (cx: Context): Compiler.AST.Node {
    return new NewExpression(id("HasNext2Info"), []);
  }

  IR.ASMultiname.prototype.compile = function (cx: Context): Compiler.AST.Node {
    var namespaces = compileValue(this.namespaces, cx);
    var name = compileValue(this.name, cx);
    return call(id("createName"), [namespaces, name]);
  }

  IR.Block.prototype.compile = function (cx: Context): Compiler.AST.Node {
    return cx.compileBlock(this);
  };

  function generateSource(node) {
    return node.toSource();
  }

  export class Compilation {
    static id: number = 0;
    constructor(public parameters: string [],
                public body: string,
                public constants: any []) {
      // ...
    }

    /**
     * Object references are stored on the compilation object in a property called |constants|. Some of
     * these constants are |LazyInitializer|s and the backend makes sure to emit a call to a function
     * named |C| that resolves them.
     */
    public C(index: number) {
      var value = this.constants[index];
      // TODO: Avoid using |instanceof| here since this can be called quite frequently.
      if (value._isLazyInitializer) {
        this.constants[index] = value.resolve();
      }
      return this.constants[index];
    }
  }

  export function generate(cfg): Compilation {
    enterTimeline("Looper");
    var root = Looper.analyze(cfg);
    leaveTimeline();

    var writer = new IndentingWriter();

    var cx = new Context();
    enterTimeline("Construct AST");
    var code = <BlockStatement>root.compile(cx);
    leaveTimeline();

    var parameters = [];
    for (var i = 0; i < cx.parameters.length; i++) {
      // Closure Compiler complains if the parameter names are the same even if they are not used,
      // so we differentiate them here.
      var name = cx.parameters[i] ? cx.parameters[i].name : "_" + i;
      parameters.push(id(name));
    }
    var compilationId = Compilation.id ++;
    var compilationGlobalPropertyName = "$$F" + compilationId;
    if (cx.constants.length) {
      var compilation = new Identifier(compilationGlobalPropertyName);
      var constants = new MemberExpression(compilation, new Identifier("constants"), false);
      code.body.unshift(variableDeclaration([
        new VariableDeclarator(id("$F"), compilation),
        new VariableDeclarator(id("$C"), constants)
      ]));
    }
    if (cx.variables.length) {
      countTimeline("Backend: Locals", cx.variables.length);
      var variables = variableDeclaration(cx.variables.map(function (variable) {
        return new VariableDeclarator(id(variable.name));
      }));
      code.body.unshift(variables);
    }

    enterTimeline("Serialize AST");
    var source = generateSource(code);
    leaveTimeline();
    // Save compilation as a globa property name.
    return jsGlobal[compilationGlobalPropertyName] = new Compilation (
      parameters.map(function (p) { return p.name; }),
      source,
      cx.constants
    );
  }
}
