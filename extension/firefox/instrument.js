var path = require('path');
var fs   = require('fs');
var readFile = fs.readFileSync;

var shumwayRoot = __dirname + "/../../";
var amv2Root = shumwayRoot + "src/avm2/";

var esprima = require(amv2Root + "compiler/lljs/src/esprima.js");
var escodegen = require(amv2Root + "compiler/lljs/src/escodegen.js");
var estransform = require(amv2Root + "compiler/lljs/src/estransform.js");

var T = estransform;
T.Node.prototype.transform = T.makePass("transform", "transformNode");

var arguments = process.argv.slice(2);

var ast = esprima.parse(readFile(arguments[0]), {loc: true});

ast = T.lift(ast);

var Literal = T.Literal;
var Identifier = T.Identifier;

var C = {
  loops: { name: "$L", counters: [] },
  functions: { name: "$F", counters: [] },
  allocations: { name: "$A", counters: [] }
}

function update(name, id) {
  return new T.UpdateExpression("++", new T.MemberExpression(new Identifier(name), new Literal(id), true));
}

T.ForStatement.prototype.transform =
  T.WhileStatement.prototype.transform =
    T.DoWhileStatement.prototype.transform = function () {
      var id = C.loops.counters.length;
      C.loops.counters.push(this.loc.start.line);
      if (!(this.body instanceof T.BlockStatement)) {
        this.body = new T.BlockStatement([this.body]);
      }
      this.body.transform();
      this.body.body.unshift(new T.ExpressionStatement(update(C.loops.name, id)));
      return this;
    };

T.FunctionExpression.prototype.transform =
  T.FunctionDeclaration.prototype.transform = function () {
    var id = C.functions.counters.length;
    C.functions.counters.push(this.loc.start.line);
    if (!(this.body instanceof T.BlockStatement)) {
      this.body = new T.BlockStatement([this.body]);
    }
    this.body.transform();
    this.body.body.unshift(new T.ExpressionStatement(update(C.functions.name, id)));
    return this;
  };

T.ArrayExpression.prototype.transform =
  T.ObjectExpression.prototype.transform =
    T.NewExpression.prototype.transform = function () {
      var id = C.allocations.counters.length;
      C.allocations.counters.push(this.loc.start.line);
      return new T.SequenceExpression([update(C.allocations.name, id), this]);
    };

ast.transform();

for (var k in C) {
  console.log("var " + C[k].name + " = new Int32Array(" + C[k].counters.length + ");");
  console.log("var " + C[k].name + "L = " + "[" + C[k].counters.join(",") + "];");
}

console.log(escodegen.generate(ast, {
  format: {
    indent: {
      style: '  ',
      base: 0
    }
  }
}));