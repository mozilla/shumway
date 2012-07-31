/**
 * Shumway AVM Build Script
 *
 * This script performs several source level transformations:
 * - Expands "load(file);" expression statements.
 * - Removes assertion statements.
 * - Replaces identifiers, useful for constant folding, e.g.
 *   |$CHROME ? ... : ...|  can be optimized away by the closure compiler
 *   if the identifier $CHROME is replaced with |true| or |false|.
 */

var path = require('path');
var fs   = require('fs');
var readFile = fs.readFileSync;

global.assert = function () { };

var options = require("../options.js");

var ArgumentParser = options.ArgumentParser;
var Option = options.Option;
var OptionSet = options.OptionSet;

var esprima = require("../compiler/lljs/src/esprima.js");
var escodegen = require("../compiler/lljs/src/escodegen.js");
var estransform = require("../compiler/lljs/src/estransform.js");

// Import nodes
const T = estransform;
const Node = T.Node;
const Literal = T.Literal;
const Identifier = T.Identifier;
const CallExpression = T.CallExpression;
const ExpressionStatement = T.ExpressionStatement;
const BlockStatement = T.BlockStatement;

// Parse arguments
var arguments = process.argv.slice(2);
var argumentParser = new ArgumentParser();
var file = argumentParser.addArgument("file", "file", "string", {
  positional: true
});
argumentParser.parse(arguments);

Node.prototype.transform = T.makePass("transform", "transformNode");

CallExpression.prototype.transform = function (o) {
  this.callee = this.callee.transform(o);
  if (this.callee instanceof Identifier) {
    // Remove assertions.
    if (this.callee.name === "assert") {
      return null;
    }
  }
  this.arguments = this.arguments.map(function (x) {
    return x.transform(o);
  });
  return this;
};

Identifier.prototype.transform = function(o) {
  if (o.constants && o.constants.hasOwnProperty(this.name)) {
    return o.constants[this.name];
  }
  return this;
};

ExpressionStatement.prototype.transform = function (o) {
  this.expression = this.expression.transform(o);
  if (this.expression === null) {
    return null;
  }
  // Expand |load(file)|.
  if (this.expression instanceof CallExpression &&
      this.expression.callee.name === "load" &&
      this.expression.arguments.length === 1 &&
      this.expression.arguments[0] instanceof Literal) {
    var node = esprima.parse(readFile(this.expression.arguments[0].value));
    node = T.lift(node);
    node = node.transform(o);
    return new BlockStatement(node.body);
  }
  return this;
}

var source = readFile(file.value).toString();
var node = esprima.parse(source, { loc: true, comment: true, range: true, tokens: true });
node = T.lift(node);

var constants = {
  // "$X": new Literal(true)
};

node = node.transform({constants: constants});
var code = escodegen.generate(node, { base: "", indent: "  ", comment: false });
console.log(code);