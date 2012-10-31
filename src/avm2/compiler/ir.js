(function (exports) {

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


  function extend(c, name) {
    assert (c);
    return Object.create(c.prototype, {nodeName: { value: name }});
  }



  function nameOf(o) {
    var useColors = true;
    var result;
    if (o instanceof Constant) {
      if (o.value instanceof Multiname) {
        return o.value.name;
      }
      return o.value;
    } else if (o instanceof Phi) {
      return result = "|" + o.id + "|", useColors ? PURPLE + result + ENDC : result;
    } else if (o instanceof Control) {
      return result = "{" + o.id + "}", useColors ? RED + result + ENDC : result;
    } else if (o instanceof Projection) {
      if (o.type === Projection.Type.STORE) {
        return result = "[" + o.id + "]", useColors ? YELLOW + result + ENDC : result;
      }
      return result = "(" + o.id + ")", useColors ? GREEN + result + ENDC : result;
    } else if (o instanceof Value) {
      return result = "(" + o.id + ")", useColors ? GREEN + result + ENDC : result;
    } else if (o instanceof Node) {
      return o.id;
    }
    unexpected(o);
  }

  var Node = (function () {
    var nextID = 0;
    function constructor() {
      this.id = nextID += 1;
    }
    constructor.resetNextID = function () {
      nextID = 0;
    };
    constructor.prototype.nodeName = "Node";
    constructor.prototype.toString = function (brief) {
      if (brief) {
        return nameOf(this);
      }
      var inputs = [];
      this.visitInputs(function (input) {
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
    constructor.prototype.visitInputs = function (fn, visitConstants) {
      for (var k in this) {
        var v = this[k];
        if (v instanceof Constant && !visitConstants) {
          continue;
        }
        if (v instanceof Node) {
          fn(v);
        }
        if (v instanceof Array) {
          v.forEach(function (x) {
            if (x instanceof Constant && !visitConstants) {
              return;
            }
            fn(x);
          });
        }
      }
    };
    constructor.prototype.push = function (value) {
      if (this.length === undefined) {
        this.length = 0;
      }
      this[this.length ++] = value;
    };
    return constructor;
  })();

  var Control = (function () {
    function constructor(control) {
      Node.apply(this);
    }
    constructor.prototype = extend(Node);
    return constructor;
  })();

  var Value = (function () {
    function constructor(control) {
      Node.apply(this);
    }
    constructor.prototype = extend(Node);
    return constructor;
  })();

  var Region = (function () {
    function constructor(predecessor) {
      Control.call(this);
      this.predecessors = predecessor ? [predecessor] : [];
      this.phis = [];
      this.verify();
    }
    constructor.prototype = extend(Control, "Region");

    constructor.prototype.verify = function () {
      var predecessors = this.predecessors;
      predecessors.forEach(function (x) {
        assert (x);
        // assert (x instanceof Control, x);
      });
      if (predecessors.length > 1) {
        this.phis.forEach(function (x) {
          assert (x instanceof Phi);
          assert (x.arguments.length === predecessors.length);
        });
      }
    };
    return constructor;
  })();

  var Start = (function () {
    function constructor() {
      Region.call(this);
    }
    constructor.prototype = extend(Region, "Start");
    return constructor;
  })();

  var Phi = (function () {
    function constructor(control, value) {
      Node.call(this);
      assert (control instanceof Control);
      this.control = control;
      this.arguments = value ? [value] : [];
    }
    constructor.prototype = extend(Value, "Phi");
    constructor.prototype.pushValue = function pushValue(x) {
      this.arguments.push(x);
    }
    return constructor;
  })();

  var End = (function () {
    function constructor(control, predicate) {
      Control.call(this);
    }
    constructor.prototype = extend(Control, "End");
    return constructor;
  })();

  var If = (function () {
    function constructor(control, predicate) {
      Control.call(this);
      this.control = control;
      this.predicate = predicate;
    }
    constructor.prototype = extend(End, "If");
    return constructor;
  })();

  var Jump = (function () {
    function constructor(control) {
      Control.call(this);
      this.control = control;
    }
    constructor.prototype = extend(End, "Jump");
    return constructor;
  })();

  var Stop = (function () {
    function constructor(control, value) {
      Control.call(this);
      this.control = control;
      this.value = value;
    }
    constructor.prototype = extend(End, "Stop");
    return constructor;
  })();

  var Projection = (function () {
    function constructor(value, type) {
      Value.call(this);
      assert (type);
      assert (!(value instanceof Projection));
      this.value = value;
      this.type = type;
    }
    constructor.Type = {
      TRUE: "true",
      FALSE: "false",
      STORE: "store"
    };
    constructor.prototype = extend(Value, "Projection");
    constructor.prototype.project = function () {
      return this.value;
    };
    constructor.prototype.toStringDetails = function () {
      return String(this.type).toUpperCase();
    };
    return constructor;
  })();

  var Binary = (function () {
    function constructor(operator, left, right) {
      Node.call(this);
      this.operator = operator;
      this.left = left;
      this.right = right;
    }
    constructor.prototype = extend(Value, "Binary");
    constructor.prototype.toStringDetails = function () {
      return String(this.operator.name).toUpperCase();
    };
    return constructor;
  })();

  var Unary = (function () {
    function constructor(operator, value) {
      Node.call(this);
      this.operator = operator;
      this.value = value;
    }
    constructor.prototype = extend(Value, "Unary");
    constructor.prototype.toStringDetails = function () {
      return String(this.operator.name).toUpperCase();
    };
    return constructor;
  })();

  var Constant = (function () {
    function constructor(value) {
      Node.call(this);
      this.value = value;
    }
    constructor.prototype = extend(Value, "Constant");
    return constructor;
  })();

  var Scope = (function () {
    function constructor(parent) {
      Node.call(this);
      this.parent = parent;
    }
    constructor.prototype = extend(Value, "Scope");
    return constructor;
  })();

  var This = (function () {
    function constructor() {
      Node.call(this);
    }
    constructor.prototype = extend(Value, "This");
    return constructor;
  })();

  var GetProperty = (function () {
    function constructor(control, store, obj, name) {
      Node.call(this);
      this.control = control;
      this.store = store;
      this.obj = obj;
      this.name = name;
    }
    constructor.prototype = extend(Value, "GetProperty");
    return constructor;
  })();

  var FindProperty = (function () {
    function constructor(scope, name) {
      Node.call(this);
      this.scope = scope;
      this.name = name;
    }
    constructor.prototype = extend(Value, "FindProperty");
    return constructor;
  })();

  var Call = (function () {
    function constructor(obj, args) {
      Node.call(this);
      this.obj = obj;
      this.args = args;
    }
    constructor.prototype = extend(Value, "Call");
    return constructor;
  })();

  var Store = (function () {
    function constructor() {
      Node.call(this);
    }
    constructor.prototype = extend(Value, "Store");
    return constructor;
  })();

  var Undefined = new Node();

  Undefined.toString = function () {
    return "_";
  };

  var Parameter = (function () {
    function constructor(index, name) {
      Node.call(this);
      this.index = index;
      this.name = name;
    }
    constructor.prototype = extend(Value, "Parameter");
    return constructor;
  })();

  var Block = (function () {
    function constructor(id, start, end) {
      this.id = id;
      this.successors = [];
      this.nodes = [start, end];
    }
    constructor.prototype.pushSuccessor = function pushSuccessor(successor) {
      this.successors.push(successor);
    };
    constructor.prototype.visitNodes = function (fn) {
      this.nodes.forEach(fn);
    };
    constructor.prototype.visitSuccessors = function (fn) {
      this.successors.forEach(fn);
    };
    return constructor;
  })();

  function buildCFG(stop) {
    var root;
    var visited = {};
    var nextBlockID = 0;

    function buildEnd(end) {
      if (end instanceof Projection) {
        end = end.project();
      }
      assert (end instanceof End ||
              end instanceof Start, end);
      if (visited[end.id]) {
        return;
      }
      visited[end.id] = true;
      var start = end.control;
      if (!(start instanceof Region)) {
        start = end.control = new Region(start);
      }
      var block = start.block = new Block(nextBlockID++, start, end);
      if (start instanceof Start) {
        root = block; // Remember Root
      }
      for (var i = 0; i < start.predecessors.length; i++) {
        var c = start.predecessors[i];
        var d = c instanceof Projection ? c.project() : c;
        if (d instanceof Region) {
          d = new Jump(c);
          d = new Projection(d, Projection.Type.TRUE);
          start.predecessors[i] = d;
          d = d.project();
        }
        buildEnd(d);
        d.control.block.pushSuccessor(block);
      }
    }

    buildEnd(stop);
    assert (root);
    return root;
  }

  function buildDominatorTree(root) {

  }

  function traceCFG(writer, root) {
    var visited = [];
    var blocks = [];

    function next(block) {
      if (!visited[block.id]) {
        visited[block.id] = true;
        blocks.push(block);
        block.visitSuccessors(next);
      }
    }

    next(root);

    function colorOf(block) {
      return "black";
    }

    writer.writeLn("");
    writer.enter("digraph CFG {");
    writer.writeLn("node [shape = box, fontname = Consolas, fontsize = 11];");
    writer.writeLn("rankdir = BT;");

    blocks.forEach(function (block) {
      writer.writeLn("block_" + block.id + " [label = \"" + block.id + "\", color=\"" + colorOf(block) + "\"];");
    });

    blocks.forEach(function (block) {
      block.visitSuccessors(function (successor) {
        writer.writeLn("block_" + block.id + " -> " + "block_" + successor.id);
      });
    });

    writer.leave("}");
    writer.writeLn("");
  }

  function traceDFG(writer, stop) {
    var nodes = [];
    var visited = {};

    function colorOf(node) {
      if (node instanceof Control) {
        return "red";
      } else if (node instanceof Phi) {
        return "purple";
      } else if (node instanceof Value) {
        return "green";
      }
      return "black";
    }

    var blocks = [];

    function followProjection(node) {
      return node instanceof Projection ? node.project() : node;
      // return node;
    }

    function next(node) {
      node = followProjection(node);
      if (!visited[node.id]) {
        visited[node.id] = true;
        if (node.block) {
          blocks.push(node.block);
        }
        nodes.push(node);
        node.visitInputs(next);
      }
    }

    next(stop);

    writer.writeLn("");
    writer.enter("digraph DFG {");
    writer.writeLn("node [shape = box, fontname = Consolas, fontsize = 11];");
    writer.writeLn("rankdir = BT;");

    function writeNode(node) {
      writer.writeLn("node_" + node.id + " [label = \"" + node.toString() +
        "\", color=\"" + colorOf(node) + "\"];");
    }

    function defineNode(node) {
      writer.writeLn("node_" + node.id + ";");
    }

    blocks.forEach(function (block) {
      writer.enter("subgraph cluster" + block.nodes[0].id + " {");
      block.visitNodes(function (node) {
        defineNode(followProjection(node));
      });
      writer.leave("}");
    });

    nodes.forEach(writeNode);

    nodes.forEach(function (node) {
      node.visitInputs(function (input) {
        input = followProjection(input);
        writer.writeLn("node_" + node.id + " -> " + "node_" + input.id);
      });
    });

    writer.leave("}");
    writer.writeLn("");
  }

  exports.Node = Node;
  exports.Start = Start;
  exports.Undefined = Undefined;
  exports.This = This;
  exports.Projection = Projection;
  exports.Region = Region;
  exports.Binary = Binary;
  exports.Unary = Unary;
  exports.Constant = Constant;
  exports.FindProperty = FindProperty;
  exports.GetProperty = GetProperty;
  exports.Call = Call;
  exports.Phi = Phi;
  exports.Stop = Stop;
  exports.If = If;
  exports.Jump = Jump;
  exports.Scope = Scope;
  exports.Operator = Operator;

  exports.buildCFG = buildCFG;
  exports.traceDFG = traceDFG;
  exports.traceCFG = traceCFG;

})(typeof exports === "undefined" ? (IR = {}) : exports);