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

/**
 * Shumway Build Script
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
global.release = false;

var shumwayRoot = __dirname + "/../../";
var srcRoot = shumwayRoot + "src/";
var amv2Root = srcRoot + "avm2/";

var options = require(srcRoot + "options.js");

var ArgumentParser = options.Shumway.Options.ArgumentParser;
var Option = options.Shumway.Options.Option;
var OptionSet = options.Shumway.Options.OptionSet;

var esprima = require(amv2Root + "compiler/lljs/src/esprima.js");
var escodegen = require(amv2Root + "compiler/lljs/src/escodegen.js");
var estransform = require(amv2Root + "compiler/lljs/src/estransform.js");

// Import nodes
var T = estransform;
var Node = T.Node;
var Literal = T.Literal;
var Identifier = T.Identifier;
var CallExpression = T.CallExpression;
var ExpressionStatement = T.ExpressionStatement;
var FunctionExpression = T.FunctionExpression;
var FunctionDeclaration = T.FunctionDeclaration;
var MemberExpression = T.MemberExpression;
var AssignmentExpression = T.AssignmentExpression;
var BlockStatement = T.BlockStatement;
var VariableDeclaration = T.VariableDeclaration;
var VariableDeclarator = T.VariableDeclarator;
var ArrayExpression = T.ArrayExpression;
var BinaryExpression = T.BinaryExpression;
var LogicalExpression = T.LogicalExpression;
var ObjectExpression = T.ObjectExpression;
var Property = T.Property;


// Parse arguments
var arguments = process.argv.slice(2);
var argumentParser = new ArgumentParser();
var buildOptions = new OptionSet("Build Options");

var closure = buildOptions.register(new Option("c", "closure", "string", "", "runs the closure compiler"));
var instrument = buildOptions.register(new Option("ic", "instrument", "boolean", false, "instruments functions"));
var profileLoad = buildOptions.register(new Option("pl", "profileLoad", "boolean", false, "profile load statements"));
var foldConstants = buildOptions.register(new Option("fc", "foldConstants", "boolean", false, "folds constants of the form XXX_..."));

var debug = buildOptions.register(new Option("d", "debug", "boolean", false, "debug mode"));

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

function listJSFiles(dir, prefix, output) {
  var files = fs.readdirSync(dir);
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var s = fs.statSync(path.join(dir, file));
    if (s.isDirectory()) {
      listJSFiles(path.join(dir, file), prefix + file + '/', output);
    } else if (s.isFile() && /\.js$/i.test(file)) {
      output.push(prefix + file);
    }
  }
}

Node.prototype.transform = T.makePass("transform", "transformNode");

CallExpression.prototype.transform = function (o) {
  this.callee = this.callee.transform(o);
  if (this.callee instanceof Identifier) {
    // Remove assertions.
    if (this.callee.name === "assert" && !debug.value) {
      return new Literal(true);
    } else if (this.callee.name === "loadJSON") {
      var path = this.arguments[0].transform(o).value;
      var node = esprima.parse("(" + readFile(path) + ")");
      node = T.lift(node);
      node = node.transform(o);
      return node.body[0].expression;
    }
  }
  this.arguments = this.arguments.map(function (x) {
    return x.transform(o);
  });
  return this;
};

Identifier.prototype.transform = function(o) {
  if (!o.inVariableDeclaration && !o.inAssignment &&
      o.constants && o.constants.hasOwnProperty(this.name)) {
    return o.constants[this.name];
  }
  return this;
};

function wrapBlockWithProfilingStatements(name, block) {
  name = path.normalize(name);
  name = "..." + name.substring(name.length - 24);
  var body = [];
  body.push(esprima.parse("console.time(\"" + name + "\");"));
  body.push(block);
  body.push(esprima.parse("console.timeEnd(\"" + name + "\");"));
  return new BlockStatement(body);
}

ExpressionStatement.prototype.transform = function (o) {
  if (this.expression instanceof CallExpression &&
      this.expression.callee.name === "assert") {
    return null;
  }
  this.expression = this.expression.transform(o);
  if (this.expression === null) {
    return null;
  }
  // Expand |load(file)|.
  if (this.expression instanceof CallExpression &&
      this.expression.callee.name === "load" &&
      this.expression.arguments.length === 1 &&
      this.expression.arguments[0] instanceof Literal) {
    var path = this.expression.arguments[0].value;
    if (path[0] !== "/" && path[1] !== ':') {
      path = __dirname + "/" + path;
    }
    if(fs.statSync(path).isDirectory()) {
      var list = [];
      listJSFiles(path, '', list);
      list.sort();
      var block =  new BlockStatement(list.map(function (file) {
        var node = esprima.parse(readFile(path + "/" + file));
        node = T.lift(node);
        node = node.transform(o);
        return new BlockStatement(node.body);
      }));
      if (profileLoad.value) {
        block = wrapBlockWithProfilingStatements(path, block);
      }
      return block;
    } else {
      var node = esprima.parse(readFile(path));
      node = T.lift(node);
      node = node.transform(o);
      var block = new BlockStatement(node.body);
      if (profileLoad.value) {
        block = wrapBlockWithProfilingStatements(path, block);
      }
      return block;
    }
  } else if (this.expression instanceof Literal &&
             this.expression.value === "use strict") {
    return null;
  }
  return this;
};

BinaryExpression.prototype.transform = function (o) {
  this.left = this.left.transform(o);
  this.right = this.right.transform(o);
  if (this.operator === "+" && this.left instanceof Literal &&
      this.right instanceof Literal) {
    return new Literal(this.left.value + this.right.value);
  } else if (this.operator === "||" &&
             this.left instanceof Literal &&
             this.left.value === true) {
    return this.left;
  }
  return this;
};

LogicalExpression.prototype.transform = function (o) {
  this.left = this.left.transform(o);
  this.right = this.right.transform(o);
  if (this.operator === "||" && this.left instanceof Literal &&
      this.left.value === true) {
    return this.left;
  }
  return this;
};

function isUpperCase(s) {
  return s === s.toUpperCase();
}

function isConstantIdentifier(name) {
  if (name.length > 0 && name[0] === "$") {
    return false;
  }
  var i = name.indexOf("_");
  if (i > 0) {
    return isUpperCase(name.substr(0, i));
  }
  return isUpperCase(name);
}

VariableDeclarator.prototype.transform = function (o) {
  this.id = this.id.transform(Object.create({inVariableDeclarator: true}, o));
  if (this.init) {
    this.init = this.init.transform(o);
    if (foldConstants.value && isConstantIdentifier(this.id.name) && this.init instanceof Literal) {
      if (this.id.name in constants && this.init.value !== constants[this.id.name].value) {
        throw "Constant " + this.id.name + " already defined as " + constants[this.id.name].value + " now redefining as " + this.init.value;
      }
      constants[this.id.name] = this.init;
    }
  }
  return this;
};

AssignmentExpression.prototype.transform = function (o) {
  this.left = this.left.transform(Object.create({inAssignment: true}, o));
  this.right = this.right.transform(o);
  return this;
};

Property.prototype.transform = function (o) {
  // this.key = NOP
  this.value = this.value.transform(o);
  return this;
};

MemberExpression.prototype.transform = function (o) {
  this.object = this.object.transform(o);
  if (this.computed) {
    this.property = this.property.transform(o);
  }
  return this;
};

var functionCounterMap = {};

if (instrument.value) {
  FunctionExpression.prototype.transform = FunctionDeclaration.prototype.transform = function (o) {
    o.scopePath.push(o.scopePath.pop() + 1);
    var functionId = "FN_" + o.scopePath.join("_");
    functionCounterMap[functionId] = this.id ? this.id.name : functionId;
    var a = new AssignmentExpression(new Identifier(functionId), "+=", new Literal(1));
    o.scopePath.push(0);
    this.body.transform(o);
    o.scopePath.pop();
    this.body.body.unshift(new ExpressionStatement(a));
    return this;
  };
}

var source = readFile(file.value).toString();
var node = esprima.parse(source, { loc: true, comment: true, range: true, tokens: true });
node = T.lift(node);

var constants = {
  $EXTENSION: new Literal(true),
  // "$X": new Literal(true)
};

process.env["SHUMWAY_ROOT"] = shumwayRoot;

// Make environment variables available.
for (var key in process.env) {
  constants["$" + key] = new Literal(process.env[key]);
}

constants["$DEBUG"] = new Literal(debug.value);
constants["$RELEASE"] = new Literal(!debug.value);
constants["release"] = new Literal(!debug.value);

node = node.transform({constants: constants, scopePath: [0]});

// Declare function counters.
if (Object.keys(functionCounterMap).length) {
  // Declare counters.
  node.body.unshift(new BlockStatement([
    new VariableDeclaration("var", Object.keys(functionCounterMap).map(function (x) {
      return new VariableDeclarator(new Identifier(x), new Literal(0));
    }))
  ]));

  // Collect counters in an object expression.
  node.body.push(new BlockStatement([
    new VariableDeclaration("var", [
      new VariableDeclarator(new Identifier("FUNCTION_COUNTERS"),
        new ObjectExpression(
          Object.keys(functionCounterMap).map(function (x) {
            return new Property(new Literal(functionCounterMap[x]), new Identifier(x), "init");
          })
        )
      )
    ])
  ]));

  // Print out counters at the end.
  node.body.push(new BlockStatement(esprima.parse('print(Object.keys(FUNCTION_COUNTERS).map(function (x) {' +
    'return {name: x, value: FUNCTION_COUNTERS[x]};})' +
    '.sort(function (a, b) { return a.value - b.value; })' +
    '.filter(function (x) { return x.value > 1000; })' +
    '.map(function (x) { return x.name + ": " + x.value; })' +
    '.join("\\n"))').body));
}

for (var i = 0; i < node.body.length; i++) {
  if (node.body[i] instanceof BlockStatement) {
    Array.prototype.splice.apply(node.body, [i, 1].concat(node.body[i].body));
  }
}

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
  closureOptions.push("--jscomp_off=suspiciousCode");
  closureOptions.push("--jscomp_off=uselessCode");
  closureOptions.push("--jscomp_off=globalThis");
  closureOptions.push("--compilation_level");
  var optimizations = {a: "ADVANCED_OPTIMIZATIONS", s: "SIMPLE_OPTIMIZATIONS", w: "WHITESPACE_ONLY"};
  if (!(closure.value in optimizations)) {
    console.log("Unknown optimization level: " + closure.value + ", must be one of:");
    console.log(optimizations);
    process.exit();
  }
  closureOptions.push(optimizations[closure.value]);
  if (closure.value === "a") {
    closureOptions.push("--externs");
    closureOptions.push("templates/externs.js");
  }
  var cc = spawn("java", closureOptions);
  cc.stdout.on('data', function (data) {
    process.stdout.write(data);
  });
  cc.stderr.on('data', function (data) {
    process.stderr.write(data);
  });
  cc.stdin.write(code);
  cc.stdin.end();
} else {
  console.log(code);
}
