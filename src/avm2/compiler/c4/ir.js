/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function (exports) {

  var debug = false;

  /**
   * SSA-based Sea-of-Nodes IR based on Cliff Click's Work: A simple graph-based intermediate
   * representation (http://doi.acm.org/10.1145/202530.202534)
   *
   * Node Hierarchy:
   *
   * Node
   *  - Control
   *    - Region
   *      - Start
   *    - End
   *      - Stop
   *      - If
   *      - Jump
   *  - Value
   *    - Constant, Parameter, Phi, Binary, GetProperty ...
   *
   * Control flow is modeled with control edges rather than with CFGs. Each basic block is represented
   * as a region node which has control dependencies on predecessor regions. Nodes that are dependent
   * on the execution of a region, have a |control| property assigned to the region they belong to.
   *
   * Memory (and the external world) is modeled as an SSA value called the Store. Nodes that mutate the
   * Store produce a new Store.
   *
   * Nodes that produce multiple values, such as Ifs which produce two values (a True and False control
   * value) can have their values projected (extracted) using Projection nodes.
   *
   * A node scheduler is responsible for serializing nodes back into a CFG such that all dependencies
   * are satisfied.
   *
   * Compiler Pipeline:
   *
   * Graph Builder -> IR (DFG) -> Optimizations -> CFG -> Restructuring -> Backend
   *
   */
 
  var IRDefinition = {
    name: "Node",
    properties: [],
    children: [{
      name: "Control",
      properties: [

      ],
      children: [{
        name: "Region",
        properties: [{ name: "predecessors", array: true, expand: "control" }],
        children: [{
          name: "Start",
          constructorText: "this.control = this;",
          properties: [
            { name: "scope", dynamic: true }, { name: "domain", dynamic: true }
          ]
        }]
      }, {
        name: "End",
        properties: [
          { name: "control", assert: "isControlOrNull" },
        ],
        children: [{
          name: "Stop",
          properties: [
            { name: "store", assert: "isStore" },
            { name: "argument", assert: "" }
          ]
        }, {
          name: "If",
          properties: [{ name: "predicate", assert: "" }]
        }, {
          name: "Switch",
          properties: [{ name: "determinant", assert: "" }]
        }, {
          name: "Jump",
          properties: []
        }]
      }]
    }, {
      name: "Value",
      properties: [],
      children: [{
        name: "StoreDependent",
        properties: [
          { name: "control", assert: "isControlOrNull", nullable: true },
          { name: "store", assert: "isStoreOrNull", nullable: true },
          { name: "loads", dynamic: true, nullable: true, array: true }
        ],
        children: [{
          name: "Call",
          properties: [
            { name: "callee", assert: "" },
            { name: "object", assert: "isValueOrNull", nullable: true },
            { name: "args", assert: "isArray", array: true },
            { name: "pristine", internal: true }
          ]
        }, {
          name: "CallProperty",
          properties: [
            { name: "object", assert: ""},
            { name: "name", assert: "" },
            { name: "args", assert: "isArray", array: true },
            { name: "pristine", internal: true }
          ],
          children: [{
            name: "ASCallProperty",
            properties: [
              { name: "isLex", assert: "", internal: true }
            ]
          }]
        }, {
          name: "New",
          properties: [
            { name: "callee", assert: "" },
            { name: "args", assert: "", array: true },
          ],
          children: [{
            name: "ASNew",
            properties: [
            ]
          }]
        }, {
          name: "GetProperty",
          properties: [
            { name: "object", assert: ""},
            { name: "name", assert: "" },
          ],
          children: [{
            name: "ASGetProperty",
            properties: [
              { name: "isIndexed", assert: "", internal: true },
              { name: "isMethod", assert: "", internal: true }
            ]
          }, {
            name: "ASGetDescendants",
            properties: [

            ]
          }, {
            name: "ASHasProperty",
            properties: []
          }, {
            name: "ASGetSlot",
            properties: []
          }]
        }, {
          name: "SetProperty",
          properties: [
            { name: "object", assert: ""},
            { name: "name", assert: "" },
            { name: "value", assert: "" }
          ],
          children: [{
            name: "ASSetProperty",
            properties: [
              { name: "isIndexed", assert: "", internal: true }
            ]
          }, {
            name: "ASSetSlot",
            properties: []
          }]
        }, {
          name: "DeleteProperty",
          properties: [
            { name: "object", assert: ""},
            { name: "name", assert: "" },
          ],
          children: [{
            name: "ASDeleteProperty",
            properties: []
          }]
        }, {
          name: "ASFindProperty",
          properties: [
            { name: "scope", assert: "" },
            { name: "name", assert: "" },
            { name: "domain", assert: "" },
            { name: "strict", internal: true }
          ]
        }]
      }, {
        name: "Phi",
        properties: [
          { name: "control", assert: "isControl", nullable: true },
          { name: "args", array: true, expand: "value" }
        ]
      }, {
        name: "Variable",
        properties: [{ name: "name", internal: true }]
      }, {
        name: "Copy",
        properties: [{ name: "argument" }]
      }, {
        name: "Move",
        properties: [{ name: "to" }, { name: "from" }]
      }, {
        name: "Projection",
        properties: [{ name: "argument" }, { name: "type", internal: true }, { name: "selector", internal: true, optional: true }]
      }, {
        name: "Latch",
        properties: [
          { name: "control", assert: "isControlOrNull", nullable: true },
          { name: "condition" },
          { name: "left"},
          { name: "right" }
        ]
      }, {
        name: "Binary",
        properties: [{ name: "operator", internal: true}, { name: "left"}, { name: "right" }]
      }, {
        name: "Unary",
        properties: [{ name: "operator", internal: true}, { name: "argument"}]
      }, {
        name: "Constant",
        properties: [{ name: "value", internal: true}]
      }, {
        name: "Store",
        properties: []
      }, {
        name: "GlobalProperty",
        properties: [{ name: "name", internal: true}]
      }, {
        name: "This",
        properties: [{ name: "control", assert: "isControl" }]
      }, {
        name: "Throw",
        properties: [{ name: "control", assert: "isControl" }, { name: "argument" }]
      }, {
        name: "Arguments",
        properties: [{ name: "control", assert: "isControl" }]
      }, {
        name: "Parameter",
        properties: [
          { name: "control", assert: "isControl" },
          { name: "index", internal: true },
          { name: "name", internal: true }
        ]
      }, {
        name: "NewArray",
        properties: [{ name: "control", assert: "isControl" }, { name: "elements", array: true }]
      }, {
        name: "NewObject",
        properties: [{ name: "control", assert: "isControl" }, { name: "properties", array: true }]
      }, {
        name: "KeyValuePair",
        properties: [{ name: "key" }, { name: "value" }]
      }, {
        name: "ASScope",
        properties: [{ name: "parent" }, { name: "object" }, { name: "isWith", internal: true }]
      }, {
        name: "ASGlobal",
        properties: [{ name: "control", assert: "isControlOrNull", nullable: true }, { name: "scope", assert: "isScope" }]
      }, {
        name: "ASNewActivation",
        properties: [{ name: "methodInfo", internal: true }]
      }, {
        name: "ASMultiname",
        properties: [
          { name: "namespaces" },
          { name: "name" },
          { name: "flags", internal: true }]
      }]
    }]
  };

  var IRSource = (function IRGenerator(root) {
    var str = "";
    function out(s) {
      str += s + "\n";
    }
    var writer = new IndentingWriter(false, out);
    function generate(node, path) {
      path = path.concat([node]);
      writer.enter("var " + node.name + " = (function () {")
      var constructorName = node.name[0].toLowerCase() + node.name.slice(1) + "Node";
      if (constructorName.substring(0, 2) === "aS") {
        constructorName = "as" + constructorName.substring(2);
      }
      // var constructorName = "constructor";
      var prototypeName = constructorName + ".prototype";
      var properties = path.reduce(function (a, v) {
        return a.concat(v.properties);
      }, []);
      var parameters = properties.filter(function (property) {
        return !property.dynamic;
      });
      var optionalParameters = parameters.filter(function (property) {
        return property.optional;
      });
      var parameterString = parameters.map(function (property) {
        if (property.expand) {
          return property.expand;
        }
        return property.name;
      }).join(", ");
      writer.enter("function " + constructorName + "(" + parameterString + ") {");
      properties.forEach(function (property) {
        if (property.assert === "") {
          writer.writeLn("release || assert (!(" + property.name + " == undefined));");
        } else if (property.assert) {
          writer.writeLn("release || assert (" + property.assert + "(" + property.name + "));");
        }
      });
      writer.writeLn("release || assert (arguments.length >= " + (parameters.length - optionalParameters.length) + ", \"" + node.name + " not enough args.\");");

      writer.writeLn("this.id = nextID[nextID.length - 1] += 1;");
      if (node.constructorText) {
        writer.writeLn(node.constructorText);
      }

      properties.forEach(function (property) {
        if (property.expand) {
          writer.writeLn("this." + property.name + " = " + property.expand + " ? [" + property.expand + "] : [];");
        } else if (property.dynamic) {
          writer.writeLn("this." + property.name + " = undefined;");
        } else {
          writer.writeLn("this." + property.name + " = " + property.name + ";");
        }
      });

      writer.leave("}");
      if (path.length > 1) {
        writer.writeLn(prototypeName + " = " + "extend(" + path[path.length - 2].name + ", \"" + node.name + "\")");
      }

      writer.writeLn(prototypeName + ".nodeName = \"" + node.name + "\";");

      writer.enter(prototypeName + ".visitInputs = function (visitor) {");
      properties.forEach(function (property) {
        if (property.internal) {
          return;
        }
        var str = "";
        if (property.nullable) {
          str += "this." + property.name + " && ";
        }
        if (property.array) {
          str += "visitArrayInputs(this." + property.name + ", visitor);";
        } else {
          str += "visitor(this." + property.name + ");";
        }
        writer.writeLn(str);
      });
      writer.leave("};");

      writer.writeLn("return " + constructorName + ";");
      writer.leave("})();");
      writer.writeLn("");
      if (node.children) {
        node.children.forEach(function (child) {
          generate(child, path);
        });
      }
    }
    generate(IRDefinition, []);
    return str;
  })(IR);


  var nextID = [];

  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  // print(IRSource);
  eval(IRSource); // TODO: We can pre-generate this in production builds.
  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  function node() {
    this.id = nextID[nextID.length - 1] += 1;
  }

  Node.startNumbering = function () {
    nextID.push(0);
  };

  Node.stopNumbering = function () {
    nextID.pop();
  };

  Node.prototype.toString = function (brief) {
    if (brief) {
      return nameOf(this);
    }
    var inputs = [];
    this.visitInputsNoConstants(function (input) {
      inputs.push(nameOf(input));
    }, true);
    var str = nameOf(this) + " = " + this.nodeName.toUpperCase();
    if (this.toStringDetails) {
      str += " " + this.toStringDetails();
    }
    if (inputs.length) {
      str += " " + inputs.join(", ");
    }
    return str;
  };

  Node.prototype.visitInputsNoConstants = function visitInputs(visitor) {
    this.visitInputs(function (node) {
      if (isConstant(node)) {
        return;
      }
      visitor(node);
    });
  };

  Node.prototype.replaceInput = function(oldInput, newInput) {
    var count = 0;
    for (var k in this) {
      var v = this[k];
      if (v instanceof Node) {
        if (v === oldInput) {
          this[k] = newInput;
          count ++;
        }
      }
      if (v instanceof Array) {
        count += v.replace(oldInput, newInput);
      }
    }
    return count;
  };

  Projection.Type = {
    CASE: "case",
    TRUE: "true",
    FALSE: "false",
    STORE: "store",
    SCOPE: "scope"
  };

  Projection.prototype.project = function () {
    return this.argument;
  };

  Phi.prototype.seal = function seal() {
    this.sealed = true;
  };

  Phi.prototype.pushValue = function pushValue(x) {
    release || assert (isValue(x));
    release || assert (!this.sealed);
    this.args.push(x);
  };

  KeyValuePair.prototype.mustFloat = true;
  ASMultiname.prototype.mustFloat = true;

  var Operator = (function () {
    var map = {};

    function operator(name, evaluate, binary) {
      this.name = name;
      this.binary = binary;
      this.evaluate = evaluate;
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
    operator.PLUS = new operator("+", function (a) { return +a; }, false);
    operator.NEG = new operator("-", function (a) { return -a; }, false);
    operator.TRUE = new operator("!!", function (a) { return !!a; }, false);
    operator.FALSE = new operator("!", function (a) { return !a; }, false);

    operator.AS_ADD = new operator("+", function (l, r) {
      if (typeof l === "string" || typeof r === "string") {
        return String(l) + String(r);
      }
      return l + r;
    }, true);

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


  function extend(c, name) {
    release || assert (c);
    return Object.create(c.prototype, {nodeName: { value: name }});
  }

  function nameOf(o) {
    var useColors = false;
    var result;
    if (o instanceof Constant) {
      if (o.value instanceof Multiname) {
        return o.value.name;
      }
      return o.value;
    } else if (o instanceof Variable) {
      return o.name;
    } else if (o instanceof Phi) {
      return result = "|" + o.id + "|", useColors ? PURPLE + result + ENDC : result;
    } else if (o instanceof Control) {
      return result = "{" + o.id + "}", useColors ? RED + result + ENDC : result;
    } else if (o instanceof Projection) {
      if (o.type === Projection.Type.STORE) {
        return result = "[" + o.id + "->" + o.argument.id + "]", useColors ? YELLOW + result + ENDC : result;
      }
      return result = "(" + o.id + ")", useColors ? GREEN + result + ENDC : result;
    } else if (o instanceof Value) {
      return result = "(" + o.id + ")", useColors ? GREEN + result + ENDC : result;
    } else if (o instanceof Node) {
      return o.id;
    }
    unexpected(o + " " + typeof o);
  }

  function toID(node) {
    return node.id;
  }

  function visitArrayInputs(array, visitor) {
    for (var i = 0; i < array.length; i++) {
      visitor(array[i]);
    }
  }

  function visitNothing() {

  }

  function isNotPhi(phi) {
    return !isPhi(phi);
  }

  function isPhi(phi) {
    return phi instanceof Phi;
  }

  function isScope(scope) {
    return isPhi(scope) || scope instanceof ASScope || isProjection(scope, Projection.Type.SCOPE);
  }

  function isMultinameConstant(node) {
    return node instanceof Constant && node.value instanceof Multiname;
  }

  function isMultiname(name) {
    return isMultinameConstant(name) || name instanceof ASMultiname;
  }

  function isStore(store) {
    return isPhi(store) || store instanceof Store || isProjection(store, Projection.Type.STORE);
  }

  function isConstant(constant) {
    return constant instanceof Constant;
  }

  function isBoolean(boolean) {
    return boolean === true || boolean === false;
  }

  function isInteger(integer) {
    return integer | 0 === integer;
  }

  function isArray(array) {
    return array instanceof Array;
  }

  function isControlOrNull(control) {
    return isControl(control) || control === null;
  }

  function isStoreOrNull(store) {
    return isStore(store) || store === null;
  }

  function isControl(control) {
    return control instanceof Control;
  }

  function isValueOrNull(value) {
    return isValue(value) || value === null;
  }

  function isValue(value) {
    return value instanceof Value;
  }

  function isProjection(node, type) {
    return node instanceof Projection && (!type || node.type === type);
  }

  var Null = new Constant(null);
  var Undefined = new Constant(undefined);

  Undefined.toString = function () {
    return "_";
  };

  var Block = (function () {
    function block(id, start, end) {
      if (start) {
        release || assert (start instanceof Region);
      }
      this.region = start;
      this.id = id;
      this.successors = [];
      this.predecessors = [];
      this.nodes = [start, end];
    }
    block.prototype.pushSuccessorAt = function pushSuccessor(successor, index, pushPredecessor) {
      release || assert (successor);
      release || assert (!this.successors[index]);
      this.successors[index] = successor;
      if (pushPredecessor) {
        successor.pushPredecessor(this);
      }
    };
    block.prototype.pushSuccessor = function pushSuccessor(successor, pushPredecessor) {
      release || assert (successor);
      this.successors.push(successor);
      if (pushPredecessor) {
        successor.pushPredecessor(this);
      }
    };
    block.prototype.pushPredecessor = function pushPredecessor(predecessor) {
      release || assert (predecessor);
      this.predecessors.push(predecessor);
    };
    block.prototype.visitNodes = function (fn) {
      var nodes = this.nodes;
      for (var i = 0, j = nodes.length; i < j; i++) {
        fn(nodes[i]);
      }
    };
    block.prototype.visitSuccessors = function (fn) {
      var successors = this.successors;
      for (var i = 0, j = successors.length; i < j; i++) {
        fn(successors[i]);
      }
    };
    block.prototype.visitPredecessors = function (fn) {
      var predecessors = this.predecessors;
      for (var i = 0, j = predecessors.length; i < j; i++) {
        fn(predecessors[i]);
      }
    };
    block.prototype.append = function (node) {
      release || assert (this.nodes.length >= 2);
      release || assert (isValue(node), node);
      release || assert (isNotPhi(node));
      release || assert (this.nodes.indexOf(node) < 0);
      if (node.mustFloat) {
        return;
      }
      this.nodes.splice(this.nodes.length - 1, 0, node);
    };
    block.prototype.toString = function () {
      return "B" + this.id + (this.name ? " (" + this.name + ")" : "");
    };
    block.prototype.trace = function (writer) {
      writer.writeLn(this);
    };
    return block;
  })();

  var DFG = (function () {
    function constructor(exit) {
      this.exit = exit;
    }

    constructor.prototype.buildCFG = function () {
      return CFG.fromDFG(this);
    };

    function preOrderDepthFirstSearch(root, visitChildren, pre) {
      var visited = [];
      var worklist = [root];
      var push = worklist.push.bind(worklist);
      var node;
      while ((node = worklist.pop())) {
        if (visited[node.id]) {
          continue;
        }
        visited[node.id] = 1;
        pre(node);
        worklist.push(node);
        visitChildren(node, push);
      }
    }

    function postOrderDepthFirstSearch(root, visitChildren, post) {
      var ONE_TIME = 1, MANY_TIMES = 2;
      var visited = [];
      var worklist = [root];
      function visitChild(child) {
        if (!visited[child.id]) {
          worklist.push(child);
        }
      }
      var node;
      while ((node = worklist.top())) {
        if (visited[node.id]) {
          if (visited[node.id] === ONE_TIME) {
            visited[node.id] = MANY_TIMES;
            post(node);
          }
          worklist.pop();
          continue;
        }
        visited[node.id] = ONE_TIME;
        visitChildren(node, visitChild);
      }
    }

    constructor.prototype.forEachInPreOrderDepthFirstSearch = function forEachInPreOrderDepthFirstSearch(visitor) {
      var visited = new Array(1024);
      var worklist = [this.exit];
      function push(node) {
        assert (node instanceof Node);
        worklist.push(node);
      }
      var node;
      while ((node = worklist.pop())) {
        if (visited[node.id] === 1) {
          continue;
        }
        visited[node.id] = 1;
        visitor(node);
        worklist.push(node);
        node.visitInputsNoConstants(push);
      }
    };

    constructor.prototype.forEach = function forEach(visitor, postOrder) {
      var search = postOrder ? postOrderDepthFirstSearch : preOrderDepthFirstSearch;
      search(this.exit, function (node, v) {
        node.visitInputsNoConstants(v);
      }, visitor);
    };

    constructor.prototype.traceMetrics = function (writer) {
      var counter = new metrics.Counter(true);
      preOrderDepthFirstSearch(this.exit, function (node, visitor) {
        node.visitInputsNoConstants(visitor);
      }, function (node) {
        counter.count(node.nodeName);
      });
      counter.trace(writer);
    };

    constructor.prototype.trace = function (writer) {
      var nodes = [];
      var visited = {};

      function colorOf(node) {
        if (node instanceof Control) {
          return "yellow";
        } else if (node instanceof Phi) {
          return "purple";
        } else if (node instanceof Value) {
          return "green";
        }
        return "white";
      }

      var blocks = [];

      function followProjection(node) {
        return node instanceof Projection ? node.project() : node;
      }

      function next(node) {
        node = followProjection(node);
        if (!visited[node.id]) {
          visited[node.id] = true;
          if (node.block) {
            blocks.push(node.block);
          }
          nodes.push(node);
          node.visitInputsNoConstants(next);
        }
      }

      next(this.exit);

      writer.writeLn("");
      writer.enter("digraph DFG {");
      writer.writeLn("graph [bgcolor = gray10];");
      writer.writeLn("edge [color = white];");
      writer.writeLn("node [shape = box, fontname = Consolas, fontsize = 11, color = white, fontcolor = white];");
      writer.writeLn("rankdir = BT;");

      function writeNode(node) {
        writer.writeLn("N" + node.id + " [label = \"" + node.toString() +
          "\", color = \"" + colorOf(node) + "\"];");
      }

      function defineNode(node) {
        writer.writeLn("N" + node.id + ";");
      }

      blocks.forEach(function (block) {
        writer.enter("subgraph cluster" + block.nodes[0].id + " { bgcolor = gray20;");
        block.visitNodes(function (node) {
          defineNode(followProjection(node));
        });
        writer.leave("}");
      });

      nodes.forEach(writeNode);

      nodes.forEach(function (node) {
        node.visitInputsNoConstants(function (input) {
          input = followProjection(input);
          writer.writeLn("N" + node.id + " -> " + "N" + input.id + " [color=" + colorOf(input) + "];");
        });
      });

      writer.leave("}");
      writer.writeLn("");
    };

    return constructor;
  })();

  var CFG = (function () {
    function constructor() {
      this.nextBlockID = 0;
      this.blocks = [];
      this.exit;
      this.root;
    }

    constructor.fromDFG = function fromDFG(dfg) {
      var cfg = new CFG();

      release || assert (dfg && dfg instanceof DFG);
      cfg.dfg = dfg;

      var visited = [];

      function buildEnd(end) {
        if (end instanceof Projection) {
          end = end.project();
        }
        release || assert (end instanceof End || end instanceof Start, end);
        if (visited[end.id]) {
          return;
        }
        visited[end.id] = true;
        var start = end.control;
        if (!(start instanceof Region)) {
          start = end.control = new Region(start);
        }
        var block = start.block = cfg.buildBlock(start, end);
        if (start instanceof Start) {
          cfg.root = block;
        }
        for (var i = 0; i < start.predecessors.length; i++) {
          var c = start.predecessors[i];
          var d;
          var trueProjection = false;
          if (c instanceof Projection) {
            d = c.project();
            trueProjection = c.type === Projection.Type.TRUE;
          } else {
            d = c;
          }
          if (d instanceof Region) {
            d = new Jump(c);
            d = new Projection(d, Projection.Type.TRUE);
            start.predecessors[i] = d;
            d = d.project();
            trueProjection = true;
          }
          buildEnd(d);
          var controlBlock = d.control.block;
          if (d instanceof Switch) {
            release || assert (isProjection(c, Projection.Type.CASE));
            controlBlock.pushSuccessorAt(block, c.selector.value, true);
          } else if (trueProjection && controlBlock.successors.length > 0) {
            controlBlock.pushSuccessor(block, true);
            controlBlock.hasFlippedSuccessors = true;
          } else {
            controlBlock.pushSuccessor(block, true);
          }
        }
      }

      buildEnd(dfg.exit);
      cfg.splitCriticalEdges();
      cfg.exit = dfg.exit.control.block;
      cfg.computeDominators(true);
      return cfg;
    };

    /**
     * Makes sure root node has no predecessors and that there is only one
     * exit node.
     */
    constructor.prototype.buildRootAndExit = function buildRootAndExit() {
      release || assert (!this.root && !this.exit);

      // Create new root node if the root node has predecessors.
      if (this.blocks[0].predecessors.length > 0) {
        this.root = new Block(this.nextBlockID++);
        this.blocks.push(this.root);
        this.root.pushSuccessor(this.blocks[0], true);
      } else {
        this.root = this.blocks[0];
      }
      var exitBlocks = [];

      // Collect exit blocks (blocks with no successors).
      for (var i = 0; i < this.blocks.length; i++) {
        var block = this.blocks[i];
        if (block.successors.length === 0) {
          exitBlocks.push(block);
        }
      }

      if (exitBlocks.length === 0) {
        unexpected("Must have an exit block.");
      } else if (exitBlocks.length === 1 && exitBlocks[0] !== this.root) {
        this.exit = exitBlocks[0];
      } else {
        // Create new exit block to merge flow.
        this.exit = new Block(this.nextBlockID++);
        this.blocks.push(this.exit);
        for (var i = 0; i < exitBlocks.length; i++) {
          exitBlocks[i].pushSuccessor(this.exit, true);
        }
      }

      release || assert (this.root && this.exit);
      release || assert (this.root !== this.exit);
    };

    constructor.prototype.fromString = function (list, rootName) {
      var cfg = this;
      var names = cfg.blockNames || (cfg.blockNames = {});
      var blocks = cfg.blocks;

      var sets = list.replace(/\ /g,"").split(",");
      sets.forEach(function (set) {
        var edgeList = set.split("->");
        var last = null;
        for (var i = 0; i < edgeList.length; i++) {
          var next = edgeList[i];
          if (last) {
            buildEdge(last, next);
          } else {
            buildBlock(next);
          }
          last = next;
        }
      });

      function buildBlock(name) {
        var block = names[name];
        if (block) {
          return block;
        }
        names[name] = block = new Block(cfg.nextBlockID++);
        block.name = name;
        blocks.push(block);
        return block;
      }

      function buildEdge(from, to) {
        buildBlock(from).pushSuccessor(buildBlock(to), true);
      }

      release || assert (rootName && names[rootName]);
      this.root = names[rootName];
    };

    constructor.prototype.buildBlock = function (start, end) {
      var block = new Block(this.nextBlockID++, start, end);
      this.blocks.push(block);
      return block;
    };

    constructor.prototype.createBlockSet = function () {
      if (!this.setConstructor) {
        this.setConstructor = BitSetFunctor(this.blocks.length);
      }
      return new this.setConstructor();
    };

    constructor.prototype.computeReversePostOrder = function computeReversePostOrder() {
      if (this.order) {
        return this.order;
      }
      var order = this.order = [];
      this.depthFirstSearch(null, order.push.bind(order));
      order.reverse();
      for (var i = 0; i < order.length; i++) {
        order[i].rpo = i;
      }
      return order;
    };

    constructor.prototype.depthFirstSearch = function depthFirstSearch(preFn, postFn) {
      var visited = this.createBlockSet();
      function visit(node) {
        visited.set(node.id);
        if (preFn) preFn(node);
        var successors = node.successors;
        for (var i = 0, j = successors.length; i < j; i++) {
          var s = successors[i];
          if (!visited.get(s.id)) {
            visit(s);
          }
        }
        if (postFn) postFn(node);
      }
      visit(this.root);
    };

    constructor.prototype.computeDominators = function (apply) {
      release || assert (this.root.predecessors.length === 0, "Root node ", this.root, " must not have predecessors.");

      var dom = new Int32Array(this.blocks.length);
      for (var i = 0; i < dom.length; i++) {
        dom[i] = -1;
      }
      var map = this.createBlockSet();
      function computeCommonDominator(a, b) {
        map.clearAll();
        while (a >= 0) {
          map.set(a);
          a = dom[a];
        }
        while (b >= 0 && !map.get(b)) {
          b = dom[b];
        }
        return b;
      }
      function computeDominator(blockID, parentID) {
        if (dom[blockID] < 0) {
          dom[blockID] = parentID;
        } else {
          dom[blockID] = computeCommonDominator(dom[blockID], parentID);
        }
      }
      this.depthFirstSearch (
        function visit(block) {
          var s = block.successors;
          for (var i = 0, j = s.length; i < j; i++) {
            computeDominator(s[i].id, block.id);
          }
        }
      );
      if (apply) {
        for (var i = 0, j = this.blocks.length; i < j; i++) {
          this.blocks[i].dominator = this.blocks[dom[i]];
        }
        function computeDominatorDepth(block) {
          var dominatorDepth;
          if (block.dominatorDepth !== undefined) {
            return block.dominatorDepth;
          } else if (!block.dominator) {
            dominatorDepth = 0;
          } else {
            dominatorDepth = computeDominatorDepth(block.dominator) + 1;
          }
          return block.dominatorDepth = dominatorDepth;
        }
        for (var i = 0, j = this.blocks.length; i < j; i++) {
          computeDominatorDepth(this.blocks[i]);
        }
      }
      return dom;
    };

    constructor.prototype.computeLoops = function computeLoops() {
      var active = this.createBlockSet();
      var visited = this.createBlockSet();
      var nextLoop = 0;

      function makeLoopHeader(block) {
        if (!block.isLoopHeader) {
          assert(nextLoop < 32, "Can't handle too many loops, fall back on BitMaps if it's a problem.");
          block.isLoopHeader = true;
          block.loops = 1 << nextLoop;
          nextLoop += 1;
        }
        assert(bitCount(block.loops) === 1);
      }

      function visit(block) {
        if (visited.get(block.id)) {
          if (active.get(block.id)) {
            makeLoopHeader(block);
          }
          return block.loops;
        }
        visited.set(block.id);
        active.set(block.id);
        var loops = 0;
        for (var i = 0, j = block.successors.length; i < j; i++) {
          loops |= visit(block.successors[i]);
        }
        if (block.isLoopHeader) {
          assert(bitCount(block.loops) === 1);
          loops &= ~block.loops;
        }
        block.loops = loops;
        active.clear(block.id);
        return loops;
      }

      var loop = visit(this.root);
      assert(loop === 0);
    };

    function followProjection(node) {
      return node instanceof Projection ? node.project() : node;
    }

    var Uses = (function () {
      function constructor() {
        this.entries = [];
      }
      constructor.prototype.addUse = function addUse(def, use) {
        var entry = this.entries[def.id];
        if (!entry) {
          entry = this.entries[def.id] = {def: def, uses:[]};
        }
        entry.uses.pushUnique(use);
      };
      constructor.prototype.trace = function (writer) {
        writer.enter("> Uses");
        this.entries.forEach(function (entry) {
          writer.writeLn(entry.def.id + " -> [" + entry.uses.map(toID).join(", ") + "] " + entry.def);
        });
        writer.leave("<");
      };
      constructor.prototype.replace = function (def, value) {
        var entry = this.entries[def.id];
        if (entry.uses.length === 0) {
          return false;
        }
        var count = 0;
        entry.uses.forEach(function (use) {
          count += use.replaceInput(def, value);
        });
        release || assert (count >= entry.uses.length);
        entry.uses = [];
        return true;
      };
      function updateUses(def, value) {
        debug && writer.writeLn("Update " + def + " with " + value);
        var entry = useEntries[def.id];
        if (entry.uses.length === 0) {
          return false;
        }
        debug && writer.writeLn("Replacing: " + def.id + " in [" + entry.uses.map(toID).join(", ") + "] with " + value.id);
        var count = 0;
        entry.uses.forEach(function (use) {
          count += use.replaceInput(def, value);
        });
        release || assert (count >= entry.uses.length);
        entry.uses = [];
        return true;
      }
      return constructor;
    })();

    /**
     * Computes def-use chains.
     *
     * () -> Map[id -> {def:Node, uses:Array[Node]}]
     */
    constructor.prototype.computeUses = function computeUses() {
      Timer.start("computeUses");
      var writer = debug && new IndentingWriter();

      debug && writer.enter("> Compute Uses");
      var dfg = this.dfg;

      var uses = new Uses();

      dfg.forEachInPreOrderDepthFirstSearch(function (use) {
        use.visitInputs(function (def) {
          uses.addUse(def, use);
        });
      });

      if (debug) {
        writer.enter("> Uses");
        uses.entries.forEach(function (entry) {
          writer.writeLn(entry.def.id + " -> [" + entry.uses.map(toID).join(", ") + "] " + entry.def);
        });
        writer.leave("<");
        writer.leave("<");
      }
      Timer.stop();
      return uses;
    };

    constructor.prototype.verify = function verify() {
      var writer = debug && new IndentingWriter();
      debug && writer.enter("> Verify");

      var order = this.computeReversePostOrder();

      order.forEach(function (block) {
        if (block.phis) {
          block.phis.forEach(function (phi) {
            release || assert (phi.control === block.region);
            release || assert (phi.args.length === block.predecessors.length);
          });
        }
      });

      debug && writer.leave("<");
    };

    /**
     * Simplifies phis of the form:
     *
     * replace |x = phi(y)| -> y
     * replace |x = phi(x, y)| -> y
     * replace |x = phi(y, y, x, y, x)| -> |phi(y, x)| -> y
     */
    constructor.prototype.optimizePhis = function optimizePhis() {
      var writer = debug && new IndentingWriter();
      debug && writer.enter("> Optimize Phis");

      var phis = [];
      var useEntries = this.computeUses().entries;
      useEntries.forEach(function (entry) {
        if (isPhi(entry.def)) {
          phis.push(entry.def);
        }
      });

      debug && writer.writeLn("Trying to optimize " + phis.length + " phis.");

      /**
       * Updates all uses to a new definition. Returns true if anything was updated.
       */
      function updateUses(def, value) {
        debug && writer.writeLn("Update " + def + " with " + value);
        var entry = useEntries[def.id];
        if (entry.uses.length === 0) {
          return false;
        }
        debug && writer.writeLn("Replacing: " + def.id + " in [" + entry.uses.map(toID).join(", ") + "] with " + value.id);
        var count = 0;
        var entryUses = entry.uses;
        for (var i = 0, j = entryUses.length; i < j; i++) {
          count += entryUses[i].replaceInput(def, value);
        }
        release || assert (count >= entry.uses.length);
        entry.uses = [];
        return true;
      }

      function simplify(phi, args) {
        args = args.unique();
        if (args.length === 1) {
          // x = phi(y) -> y
          return args[0];
        } else {
          if (args.length === 2) {
            // x = phi(y, x) -> y
            if (args[0] === phi) {
              return args[1];
            } else if (args[1] === phi) {
              return args[0];
            }
            return phi;
          }
        }
        return phi;
      }

      var count = 0;
      var iterations = 0;
      var changed = true;
      while (changed) {
        iterations ++;
        changed = false;
        phis.forEach(function (phi) {
          var value = simplify(phi, phi.args);
          if (value !== phi) {
            if (updateUses(phi, value)) {
              changed = true;
              count ++;
            }
          }
        });
      }

      if (debug) {
        writer.writeLn("Simplified " + count + " phis, in " + iterations + " iterations.");
        writer.leave("<");
      }
    };

    /**
     * "A critical edge is an edge which is neither the only edge leaving its source block, nor the only edge entering
     * its destination block. These edges must be split: a new block must be created in the middle of the edge, in order
     * to insert computations on the edge without affecting any other edges." - Wikipedia
     */
    constructor.prototype.splitCriticalEdges = function splitCriticalEdges() {
      var writer = debug && new IndentingWriter();
      var blocks = this.blocks;
      var criticalEdges = [];
      debug && writer.enter("> Splitting Critical Edges");
      for (var i = 0; i < blocks.length; i++) {
        var successors = blocks[i].successors;
        if (successors.length > 1) {
          for (var j = 0; j < successors.length; j++) {
            if (successors[j].predecessors.length > 1) {
              criticalEdges.push({from: blocks[i], to: successors[j]});
            }
          }
        }
      }

      var criticalEdgeCount = criticalEdges.length;
      if (criticalEdgeCount && debug) {
        writer.writeLn("Splitting: " + criticalEdgeCount);
        this.trace(writer);
      }

      var edge;
      while ((edge = criticalEdges.pop())) {
        var fromIndex = edge.from.successors.indexOf(edge.to);
        var toIndex = edge.to.predecessors.indexOf(edge.from);
        release || assert (fromIndex >= 0 && toIndex >= 0);
        debug && writer.writeLn("Splitting critical edge: " + edge.from + " -> " + edge.to);
        var toBlock = edge.to;
        var toRegion = toBlock.region;
        var control = toRegion.predecessors[toIndex];
        var region = new Region(control);
        var jump = new Jump(region);
        var block = this.buildBlock(region, jump);
        toRegion.predecessors[toIndex] = new Projection(jump, Projection.Type.TRUE);

        var fromBlock = edge.from;
        fromBlock.successors[fromIndex] = block;
        block.pushPredecessor(fromBlock);
        block.pushSuccessor(toBlock);
        toBlock.predecessors[toIndex] = block;
      }

      if (criticalEdgeCount && debug) {
        this.trace(writer);
      }

      if (criticalEdgeCount && !release) {
        release || assert (this.splitCriticalEdges() === 0);
      }

      debug && writer.leave("<");

      return criticalEdgeCount;
    };

    /**
     * Allocate virtual registers and break out of SSA.
     */
    constructor.prototype.allocateVariables = function allocateVariables() {
      var writer = debug && new IndentingWriter();

      debug && writer.enter("> Allocating Virtual Registers");
      var order = this.computeReversePostOrder();

      function allocate(node) {
        if (isProjection(node, Projection.Type.STORE)) {
          return;
        }
        if (node instanceof SetProperty) {
          return;
        }
        if (node instanceof Value) {
          node.variable = new Variable("l" + node.id);
          debug && writer.writeLn("Allocated: " + node.variable + " to " + node);
        }
      }

      order.forEach(function (block) {
        block.nodes.forEach(allocate);
        if (block.phis) {
          block.phis.forEach(allocate);
        }
      });

      /**
       * To break out of SSA form we need to emit moves in the phi's predecessor blocks. Here we
       * collect the set of all moves in |blockMoves| : Map[id -> Array[Move]]
       *
       * The moves actually need to be emitted along the phi's predecessor edges. Emitting them in the
       * predecessor blocks is only correct in the absence of CFG critical edges.
       */

      var blockMoves = [];
      for (var i = 0; i < order.length; i++) {
        var block = order[i];
        var phis = block.phis;
        var predecessors = block.predecessors;
        if (phis) {
          for (var j = 0; j < phis.length; j++) {
            var phi = phis[j];
            debug && writer.writeLn("Emitting moves for: " + phi);
            var arguments = phi.args;
            release || assert (predecessors.length === arguments.length);
            for (var k = 0; k < predecessors.length; k++) {
              var predecessor = predecessors[k];
              var argument = arguments[k];
              if (argument.abstract || isProjection(argument, Projection.Type.STORE)) {
                continue;
              }
              var moves = blockMoves[predecessor.id] || (blockMoves[predecessor.id] = []);
              argument = argument.variable || argument;
              if (phi.variable !== argument) {
                moves.push(new Move(phi.variable, argument));
              }
            }
          }
        }
      }

      /**
       * All move instructions must execute simultaneously. Since there may be dependencies between
       * source and destination operands we need to sort moves topologically. This is not always
       * possible because of cyclic dependencies. In such cases break the cycles using temporaries.
       *
       * Simplest example where this happens:
       *   var a, b, t;
       *   while (true) {
       *     t = a; a = b; b = t;
       *   }
       */
      var blocks = this.blocks;
      blockMoves.forEach(function (moves, blockID) {
        var block = blocks[blockID];
        var temporary = 0;
        debug && writer.writeLn(block + " Moves: " + moves);
        while (moves.length) {
          // Find a move that is safe to emit, i.e. no other move depends on its destination.
          for (var i = 0; i < moves.length; i++) {
            var move = moves[i];
            // Find a move that depends on the move's destination?
            for (var j = 0; j < moves.length; j++) {
              if (i === j) {
                continue;
              }
              if (moves[j].from === move.to) {
                move = null;
                break;
              }
            }
            if (move) {
              moves.splice(i--, 1);
              block.append(move);
            }
          }

          if (moves.length) {
            // We have a cycle, break it with a temporary.
            debug && writer.writeLn("Breaking Cycle");
            // 1. Pick any move.
            var move = moves[0];
            // 2. Emit a move to save its destination in a temporary.
            var temp = new Variable("t" + temporary++);
            blocks[blockID].append(new Move(temp, move.to));
            // 3. Update all moves's source to refer to the temporary.
            for (var i = 1; i < moves.length; i++) {
              if (moves[i].from === move.to) {
                moves[i].from = temp;
              }
            }
            // 4. Loop, baby, loop.
          }
        }
      });

      debug && writer.leave("<");
    };

    constructor.prototype.scheduleEarly = function scheduleEarly() {
      var debugScheduler = false;
      var writer = debugScheduler && new IndentingWriter();

      debugScheduler && writer.enter("> Schedule Early");

      var cfg = this;
      var dfg = this.dfg;

      var scheduled = [];

      var roots = [];

      dfg.forEachInPreOrderDepthFirstSearch(function (node) {
        if (node instanceof Region || node instanceof Jump) {
          return;
        }
        if (node.control) {
          roots.push(node);
        }
        if (isPhi(node)) {
          /**
           * When breaking out of SSA, move instructions need to have non-floating source nodes. Otherwise
           * the topological sorting of moves gets more complicated, especially when cyclic dependencies
           * are involved. Here we just mark all floating inputs of phi nodes as non-floating which forces
           * them to get scheduled.
           *
           * TODO: Find out if this requirement is too expensive. We can make the move insertion algorithm
           * more intelligent so that it walks the inputs of floating nodes when looking for dependencies.
           */
          node.args.forEach(function (input) {
            if (shouldFloat(input)) {
              input.mustNotFloat = true;
            }
          });
        }
      }, true);

      if (debugScheduler) {
        roots.forEach(function (node) {
          print("Root: " + node);
        });
      }

      for (var i = 0; i < roots.length; i++) {
        var root = roots[i];
        if (root instanceof Phi) {
          var block = root.control.block;
          (block.phis || (block.phis = [])).push(root);
        }
        if (root.control) {
          schedule(root);
        }
      }

      function isScheduled(node) {
        return scheduled[node.id];
      }

      function shouldFloat(node) {
        if (node.mustNotFloat || node.shouldNotFloat) {
          return false;
        }
        if (node.mustFloat || node.shouldFloat) {
          return true;
        }
        if (node instanceof Parameter || node instanceof This || node instanceof Arguments) {
          return true;
        }
        return node instanceof Binary || node instanceof Unary || node instanceof Parameter;
      }

      function append(node) {
        release || assert (!isScheduled(node), "Already scheduled " + node);
        scheduled[node.id] = true;
        release || assert (node.control, node);
        if (shouldFloat(node)) {

        } else {
          node.control.block.append(node);
        }
      }

      function scheduleIn(node, region) {
        release || assert (!node.control, node);
        release || assert (!isScheduled(node));
        release || assert (region);
        debugScheduler && writer.writeLn("Scheduled: " + node + " in " + region);
        node.control = region;
        append(node);
      }

      function schedule(node) {
        debugScheduler && writer.enter("> Schedule: " + node);

        var inputs = [];
        // node.checkInputVisitors();
        node.visitInputs(function (input) {
          if (isConstant(input)) {{
            return;
          }}
          if (isValue(input)) {
            inputs.push(followProjection(input));
          }
        });

        debugScheduler && writer.writeLn("Inputs: [" + inputs.map(toID) + "], length: " + inputs.length);

        for (var i = 0; i < inputs.length; i++) {
          var input = inputs[i];
          if (isNotPhi(input) && !isScheduled(input)) {
            schedule(input);
          }
        }

        if (node.control) {
          if (node instanceof End || node instanceof Phi || node instanceof Start || isScheduled(node)) {

          } else {
            append(node);
          }
        } else {
          if (inputs.length) {
            var x = inputs[0].control;
            for (var i = 1; i < inputs.length; i++) {
              var y = inputs[i].control;
              if (x.block.dominatorDepth < y.block.dominatorDepth) {
                x = y;
              }
            }
            scheduleIn(node, x);
          } else {
            scheduleIn(node, cfg.root.region);
          }
        }

        debugScheduler && writer.leave("<");
      }

      debugScheduler && writer.leave("<");

      roots.forEach(function (node) {
        node = followProjection(node);
        if (node === dfg.start || node instanceof Region) {
          return;
        }
        release || assert (node.control, "Node is not scheduled: " + node);
      });
    };

    constructor.prototype.trace = function (writer) {
      var visited = [];
      var blocks = [];

      function next(block) {
        if (!visited[block.id]) {
          visited[block.id] = true;
          blocks.push(block);
          block.visitSuccessors(next);
        }
      }

      var root = this.root;
      var exit = this.exit;

      next(root);

      function colorOf(block) {
        return "black";
      }

      function styleOf(block) {
        return "filled";
      }

      function shapeOf(block) {
        release || assert (block);
        if (block === root) {
          return "house";
        } else if (block === exit) {
          return "invhouse";
        }
        return "box";
      }

      writer.writeLn("");
      writer.enter("digraph CFG {");

      writer.writeLn("graph [bgcolor = gray10];");
      writer.writeLn("edge [fontname = Consolas, fontsize = 11, color = white, fontcolor = white];");
      writer.writeLn("node [shape = box, fontname = Consolas, fontsize = 11, color = white, fontcolor = white, style = filled];");
      writer.writeLn("rankdir = TB;");

      blocks.forEach(function (block) {
        var loopInfo = "";
        var blockInfo = "";
        var intervalInfo = "";
        // if (block.dominatorDepth !== undefined) {
        //  blockInfo = " D" + block.dominatorDepth;
        // }
        if (block.loops !== undefined) {
          // loopInfo = "loop: " + block.loops + ", nest: " + bitCount(block.loops);
          // loopInfo = " L" + bitCount(block.loops);
        }
        if (block.name !== undefined) {
          blockInfo += " " + block.name;
        }
        if (block.rpo !== undefined) {
          blockInfo += " O: " + block.rpo;
        }
        writer.writeLn("B" + block.id + " [label = \"B" + block.id + blockInfo + loopInfo + "\", fillcolor = \"" + colorOf(block) + "\", shape=" + shapeOf(block) + ", style=" + styleOf(block) + "];");
      });

      blocks.forEach(function (block) {
        block.visitSuccessors(function (successor) {
          writer.writeLn("B" + block.id + " -> " + "B" + successor.id);
        });
        if (block.dominator) {
          writer.writeLn("B" + block.id + " -> " + "B" + block.dominator.id + " [color = orange];");
        }
        if (block.follow) {
          writer.writeLn("B" + block.id + " -> " + "B" + block.follow.id + " [color = purple];");
        }
      });

      writer.leave("}");
      writer.writeLn("");
    };

    return constructor;
  })();

  /**
   * Peephole optimizations:
   */
  var PeepholeOptimizer = (function () {
    function constructor() {

    }
    function foldUnary(node, truthy) {
      release || assert (node instanceof Unary);
      if (isConstant(node.argument)) {
        return new Constant(node.operator.evaluate(node.argument.value));
      }
      if (truthy) {
        var argument = fold(node.argument, true);
        if (node.operator === Operator.TRUE) {
          return argument;
        }
        if (argument instanceof Unary) {
          if (node.operator === Operator.FALSE && argument.operator === Operator.FALSE) {
            return argument.argument;
          }
        } else {
          return new Unary(node.operator, argument);
        }
      }
      return node;
    }
    function foldBinary(node, truthy) {
      release || assert (node instanceof Binary);
      if (isConstant(node.left) && isConstant(node.right)) {
        return new Constant(node.operator.evaluate(node.left.value, node.right.value));
      }
      return node;
    }
    function fold(node, truthy) {
      if (node instanceof Unary) {
        return foldUnary(node, truthy);
      } else if (node instanceof Binary) {
        return foldBinary(node, truthy);
      }
      return node;
    }
    constructor.prototype.tryFold = fold;
    return constructor;
  })();

  exports.isConstant = isConstant;

  exports.Block = Block;
  exports.Node = Node;
  exports.Start = Start;
  exports.Null = Null;
  exports.Undefined = Undefined;
  exports.This = This;
  exports.Throw = Throw;
  exports.Arguments = Arguments;
  exports.ASGlobal = ASGlobal;
  exports.Projection = Projection;
  exports.Region = Region;
  exports.Latch = Latch;
  exports.Binary = Binary;
  exports.Unary = Unary;
  exports.Constant = Constant;
  exports.ASFindProperty = ASFindProperty;
  exports.GlobalProperty = GlobalProperty;
  exports.GetProperty = GetProperty;
  exports.SetProperty = SetProperty;
  exports.CallProperty = CallProperty;
  exports.ASCallProperty = ASCallProperty;
  exports.ASGetProperty = ASGetProperty;
  exports.ASHasProperty = ASHasProperty;
  exports.ASDeleteProperty = ASDeleteProperty;
  exports.ASGetDescendants = ASGetDescendants;
  exports.ASSetProperty = ASSetProperty;
  exports.ASGetSlot = ASGetSlot;
  exports.ASSetSlot = ASSetSlot;
  exports.Call = Call;
  exports.ASNew = ASNew;
  exports.Phi = Phi;
  exports.Stop = Stop;
  exports.If = If;
  exports.Switch = Switch;
  exports.End = End;
  exports.Jump = Jump;
  exports.ASScope = ASScope;
  exports.Operator = Operator;
  exports.Variable = Variable;
  exports.Move = Move;
  exports.Copy = Copy;
  exports.Parameter = Parameter;
  exports.NewArray = NewArray;
  exports.NewObject = NewObject;
  exports.ASNewActivation = ASNewActivation;
  exports.KeyValuePair = KeyValuePair;
  exports.ASMultiname = ASMultiname;

  exports.DFG = DFG;
  exports.CFG = CFG;

  exports.PeepholeOptimizer = PeepholeOptimizer;

})(typeof exports === "undefined" ? (IR = {}) : exports);
