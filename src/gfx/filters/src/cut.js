/*
 * Copyright 2014 Mozilla Foundation
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

exports.reduceFilterToAsmjs = function (sourcePath, outputPath) {
  var esprima = require('esprima');
  var escodegen = require('escodegen');
  var fs = require('fs');

  var code = esprima.parse(fs.readFileSync(sourcePath).toString(), {raw: true});

  var totalMemory, staticBase, staticTop, allocate, globalBase, stackMax, asm;

  function traverse(node) {
    if (typeof node !== 'object' || node === null) {
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(traverse);
      return;
    }

    if (node.type === "Literal") {
      if (JSON.stringify(node.value) != node.raw) {
        node.verbatim_js = node.raw;
      }
    }
    if (node.type === "VariableDeclaration" &&
      node.declarations[0].id.name === 'TOTAL_MEMORY') {
      totalMemory = node;
    }
    if (node.type === "VariableDeclaration" &&
      node.declarations[0].id.name === 'asm') {
      asm = node;
    }
    if (node.type === "ExpressionStatement" &&
      node.expression.type === "AssignmentExpression" &&
      node.expression.left.name === 'STATIC_BASE') {
      staticBase = node;
    }
    if (node.type === "ExpressionStatement" &&
      node.expression.type === "AssignmentExpression" &&
      node.expression.left.name === 'STATICTOP') {
      staticTop = node;
    }
    if (node.type === "ExpressionStatement" &&
      node.expression.type === "AssignmentExpression" &&
      node.expression.left.name === 'STACK_MAX') {
      stackMax = node;
    }
    if (node.type === "ExpressionStatement" &&
      node.expression.type === "CallExpression" &&
      node.expression.callee.name === "allocate" &&
      node.expression.arguments[2].name === 'ALLOC_NONE') {
      allocate = node;
    }
    if (node.type === "Property" &&
      node.key.name === 'GLOBAL_BASE') {
      globalBase = node.value;
    }
    for (var i in node) {
      traverse(node[i]);
    }
  }

  traverse(code);

  var newBody = [];
  //var TOTAL_MEMORY = 1;
  newBody.push({
    "type": "VariableDeclaration",
    "declarations": [
      {
        "type": "VariableDeclarator",
        "id": {
          "type": "Identifier",
          "name": "TOTAL_MEMORY"
        },
        "init": totalMemory.declarations[0].init.right
      }
    ],
    "kind": "var"
  });

  //var buffer = new ArrayBuffer(TOTAL_MEMORY);
  //var HEAPU8 = new Uint8Array(buffer);
  //var HEAPF32 = new Float32Array(buffer);
  newBody.push({
      "type": "VariableDeclaration",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "id": {
            "type": "Identifier",
            "name": "buffer"
          },
          "init": {
            "type": "NewExpression",
            "callee": {
              "type": "Identifier",
              "name": "ArrayBuffer"
            },
            "arguments": [
              {
                "type": "Identifier",
                "name": "TOTAL_MEMORY"
              }
            ]
          }
        }
      ],
      "kind": "var"
    },
    {
      "type": "VariableDeclaration",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "id": {
            "type": "Identifier",
            "name": "HEAPU8"
          },
          "init": {
            "type": "NewExpression",
            "callee": {
              "type": "Identifier",
              "name": "Uint8Array"
            },
            "arguments": [
              {
                "type": "Identifier",
                "name": "buffer"
              }
            ]
          }
        }
      ],
      "kind": "var"
    },
    {
      "type": "VariableDeclaration",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "id": {
            "type": "Identifier",
            "name": "HEAPF32"
          },
          "init": {
            "type": "NewExpression",
            "callee": {
              "type": "Identifier",
              "name": "Float32Array"
            },
            "arguments": [
              {
                "type": "Identifier",
                "name": "buffer"
              }
            ]
          }
        }
      ],
      "kind": "var"
    });

/*
  // 	var STATIC_BASE, STATIC_TOP, STACK_BASE, STACKTOP, STACK_MAX;
  newBody.push({
      "type": "VariableDeclaration",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "id": {
            "type": "Identifier",
            "name": "STATIC_BASE"
          },
          "init": null
        },
        {
          "type": "VariableDeclarator",
          "id": {
            "type": "Identifier",
            "name": "STATIC_TOP"
          },
          "init": null
        },
        {
          "type": "VariableDeclarator",
          "id": {
            "type": "Identifier",
            "name": "STACK_BASE"
          },
          "init": null
        },
        {
          "type": "VariableDeclarator",
          "id": {
            "type": "Identifier",
            "name": "STACKTOP"
          },
          "init": null
        },
        {
          "type": "VariableDeclarator",
          "id": {
            "type": "Identifier",
            "name": "STACK_MAX"
          },
          "init": null
        }
      ],
      "kind": "var"
    }
  );
  // STACK_BASE = STACKTOP = STATICTOP;
  newBody.push({
    "type": "ExpressionStatement",
    "expression": {
      "type": "AssignmentExpression",
      "operator": "=",
      "left": {
        "type": "Identifier",
        "name": "STACK_BASE"
      },
      "right": {
        "type": "AssignmentExpression",
        "operator": "=",
        "left": {
          "type": "Identifier",
          "name": "STACKTOP"
        },
        "right": {
          "type": "Identifier",
          "name": "STATICTOP"
        }
      }
    }
  });
  newBody.push(stackMax);
  newBody.push(staticBase, staticTop);
*/

  // HEAPU8.set(new Uint8Array([16, 0, 0]), 8);
  newBody.push({
    "type": "ExpressionStatement",
    "expression": {
      "type": "CallExpression",
      "callee": {
        "type": "MemberExpression",
        "computed": false,
        "object": {
          "type": "Identifier",
          "name": "HEAPU8"
        },
        "property": {
          "type": "Identifier",
          "name": "set"
        }
      },
      "arguments": [
        {
          "type": "NewExpression",
          "callee": {
            "type": "Identifier",
            "name": "Uint8Array"
          },
          "arguments": [allocate.expression.arguments[0]]
        },
        globalBase
      ]
    }
  });

  newBody.push(asm);

  var exportedFunctions = ['_allocMemory', '_freeMemory', '_preMultiplyAlpha', '_unpreMultiplyAlpha', '_blur', '_dropshadow', '_colormatrix'];
  // return
  newBody.push({
    "type": "ReturnStatement",
    "argument": {
      "type": "ObjectExpression",
      "properties": exportedFunctions.map(function (fn) {
        return {
          "type": "Property",
          "key": {
            "type": "Identifier",
            "name": fn.substring(1)
          },
          "value": {
            "type": "MemberExpression",
            "computed": false,
            "object": {
              "type": "Identifier",
              "name": "asm"
            },
            "property": {
              "type": "Identifier",
              "name": fn
            }
          },
          "kind": "init"
        };
      }).concat([
          {
            "type": "Property",
            "key": {
              "type": "Identifier",
              "name": "HEAPU8"
            },
            "value": {
              "type": "Identifier",
              "name": "HEAPU8"
            },
            "kind": "init"
          },
          {
            "type": "Property",
            "key": {
              "type": "Identifier",
              "name": "HEAPF32"
            },
            "value": {
              "type": "Identifier",
              "name": "HEAPF32"
            },
            "kind": "init"
          }
        ])
    }
  });

  var newCode = {
    "type": "Program",
    "body": [
      {
        "type": "VariableDeclaration",
        "declarations": [
          {
            "type": "VariableDeclarator",
            "id": {
              "type": "Identifier",
              "name": "FILTERS"
            },
            "init": {
              "type": "CallExpression",
              "callee": {
                "type": "FunctionExpression",
                "id": null,
                "params": [],
                "defaults": [],
                "body": {
                  "type": "BlockStatement",
                  "body": newBody
                },
                "rest": null,
                "generator": false,
                "expression": false
              },
              "arguments": []
            }
          }
        ],
        "kind": "var"
      }
    ]
  };

  (function cleanupAsm(asm) {
    var body = asm.declarations[0].init.callee.body.body;
    var asmArgs = asm.declarations[0].init.arguments;
    var map = {}, ret;
    for (var i = 0; i < body.length; i++) {
      if (body[i].type === "VariableDeclaration" && body[i].declarations.length === 1) {
        var decl = body[i].declarations[0];
        map[decl.id.name] = {type: 'var', statement: body[i]};
      }
      if (body[i].type === "FunctionDeclaration") {
        var decl = body[i];
        map[decl.id.name] = {type: 'fun', statement: body[i]};
      }
      if (body[i].type === "ReturnStatement") {
        ret = body[i];
      }
    }
    var usefulFunctions = [];
    for (var i = 0; i < ret.argument.properties.length;) {
      if (exportedFunctions.indexOf(ret.argument.properties[i].key.name) < 0) {
        ret.argument.properties.splice(i, 1);
      } else {
        usefulFunctions.push(ret.argument.properties[i].value.name);
        i++;
      }
    }
    var used = {}, queue = [];
    usefulFunctions.forEach(function (fn) {
      used[fn] = true;
      if (map[fn].type === 'fun') {
        queue.push(map[fn].statement);
      }
    });
    while (queue.length > 0) {
      var f = queue.shift();
      var locals = {};
      for (var i = 0; i < f.params.length; i++) {
        locals[f.params[i].name] = 'param';
      }
      for (var i = 0; i < f.body.body.length; i++) {
        if (f.body.body[i].type === 'VariableDeclaration') {
          var decl = f.body.body[i];
          for (var j = 0; j < decl.declarations.length; j++) {
            locals[decl.declarations[j].id.name] = 'var';
          }
        }
      }
      var bodyQueue = [f.body.body];
      while (bodyQueue.length > 0) {
        var bodyItem = bodyQueue.shift();
        if (typeof bodyItem === 'object' && bodyItem !== null) {
          if (Array.isArray(bodyItem)) {
            Array.prototype.push.apply(bodyQueue, bodyItem);
          } else if (bodyItem.type === 'Identifier') {
            var name = bodyItem.name;
            if (!locals[name] && !used[name]) {
              used[name] = true;
              if (map[name] && map[name].type === 'fun') {
                queue.push(map[name].statement);
              }
            }
          } else {
            for (var q in bodyItem) {
              bodyQueue.push(bodyItem[q]);
            }
          }
        }
      }
    }

    for (var i = 0; i < body.length; i++) {
      if (body[i].type === "VariableDeclaration" && body[i].declarations.length === 1) {
        var decl = body[i].declarations[0];
        if (!used[decl.id.name]) {
          body.splice(i, 1);
          i--;
        }
      }
      if (body[i].type === "FunctionDeclaration") {
        var decl = body[i];
        if (!used[decl.id.name]) {
          body.splice(i, 1);
          i--;
        }
      }
    }
    // no need for env
    asmArgs[1] = {
      "type": "ObjectExpression",
      "properties": []
    };
  })(asm);

  var options = {
    format: {
      compact: true
    },
    verbatim: 'verbatim_js'
  };

  fs.writeFileSync(outputPath, escodegen.generate(newCode, options));
}

