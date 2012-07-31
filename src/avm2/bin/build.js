/**
 * Shumway AVM Build Script
 *
 * This script performs several source level transformations:
 * - Expands "load(file);" expression statements.
 * - Removes assertion statements.
 * - Replaces identifiers. This useful for constant folding, e.g.
 *   |$DEBUG ? A : B| can be optimized away to |B| by the closure compiler
 *   if the identifier $DEBUG is replaced with |false|.
 * - Optionally runs the closure compiler.
 */

var path = require('path');
var fs   = require('fs');
var readFile = fs.readFileSync;
var spawn = require('child_process').spawn;

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
var buildOptions = new OptionSet("Build Options");

var closure = buildOptions.register(new Option("c", "closure", "string", "", "runs the closure compiler"));
argumentParser.addBoundOptionSet(buildOptions);

argumentParser.addArgument("h", "help", "boolean", {parse: function (x) {
  console.log("build.js " + argumentParser.getUsage());
  process.exit();
}});

var file = argumentParser.addArgument("file", "file", "string", {
  positional: true
});

try {
  argumentParser.parse(arguments);
} catch (x) {
  console.log(x.message);
  process.exit();
}

if (!file.value) {
  process.exit();
}

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

if (closure.value) {
  if (!("CLOSURE" in process.env)) {
    console.log("Set the |CLOSURE| environment variable to the Closure-Compiler compiler.jar file");
    process.exit();
  }
  var closureOptions = ["-jar", process.env["CLOSURE"]];
  closureOptions.push("--accept_const_keyword");
  closureOptions.push("--language_in");
  closureOptions.push("ECMASCRIPT5");
  closureOptions.push("--compilation_level");
  var optimizations = {a: "ADVANCED_OPTIMIZATIONS", s: "SIMPLE_OPTIMIZATIONS", w: "WHITESPACE_ONLY"};
  if (!(closure.value in optimizations)) {
    console.log("Unknown optimization level: " + closure.value + ", must be one of:");
    console.log(optimizations);
    process.exit();
  }
  closureOptions.push(closure.value === "a" ? "ADVANCED_OPTIMIZATIONS" : "SIMPLE_OPTIMIZATIONS");
  var cc = spawn("java", closureOptions);
  cc.stdout.on('data', function (data) {
    process.stdout.write(data);
  });
  cc.stdin.write(code);
  cc.stdin.end();
} else {
  console.log(code);
}
