(function (exports) {

  /**
   * Sea-of-Nodes IR based on Cliff Click's Work:
   * A simple graph-based intermediate representation (http://doi.acm.org/10.1145/202530.202534)
   *
   * Control flow restructuring is based on Cristina Cifuentes's Work:
   * Reverse Compilation Techniques (http://www.phatcode.net/res/228/files/decompilation_thesis.pdf)
   */

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
      this.control = this;
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
    function constructor(control) {
      Node.call(this);
      assert (control);
      this.control = control;
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
    function constructor(control, index, name) {
      Node.call(this);
      assert (control);
      this.control = control;
      this.index = index;
      this.name = name;
    }
    constructor.prototype = extend(Value, "Parameter");
    return constructor;
  })();

  var Block = (function () {
    function constructor(id, start, end) {
      if (start) {
        assert (start instanceof Region);
      }
      this.region = start;
      this.id = id;
      this.successors = [];
      this.predecessors = [];
      this.nodes = [start, end];
    }
    constructor.prototype.pushSuccessor = function pushSuccessor(successor, pushPredecessor) {
      assert (successor);
      this.successors.push(successor);
      if (pushPredecessor) {
        successor.pushPredecessor(this);
      }
    };
    constructor.prototype.pushPredecessor = function pushPredecessor(predecessor) {
      assert (predecessor);
      this.predecessors.push(predecessor);
    };
    constructor.prototype.visitNodes = function (fn) {
      this.nodes.forEach(fn);
    };
    constructor.prototype.visitSuccessors = function (fn) {
      this.successors.forEach(fn);
    };
    constructor.prototype.getPredecessors = function () {
      var predecessors = [];
      this.visitPredecessors(predecessors.push.bind(predecessors));
      return predecessors;
    };
    constructor.prototype.visitPredecessors = function (fn) {
      this.predecessors.forEach(fn);
      /*
      this.region.predecessors.forEach(function (predecessor) {
        if (predecessor instanceof Projection) {
          predecessor = predecessor.project();
        }
        var region = predecessor.control;
        fn(region.block);
      });
      */
    };
    constructor.prototype.append = function (node) {
      assert (this.nodes.length >= 2);
      this.nodes.splice(this.nodes.length - 1, 0, node);
    };
    constructor.prototype.toString = function () {
      return "B" + this.id + (this.name ? " (" + this.name + ")" : "");
    };
    return constructor;
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
      while (node = worklist.pop()) {
        if (visited[node.id]) {
          continue;
        }
        visited[node.id] = true;
        pre(node);
        worklist.push(node);
        visitChildren(node, push);
      }
    }

    constructor.prototype.forEach = function visitAll(visitor) {
      preOrderDepthFirstSearch(this.exit, function (node, v) {
        node.visitInputs(v);
      }, visitor);
    };

    constructor.prototype.traceMetrics = function (writer) {
      var counter = new metrics.Counter(true);
      preOrderDepthFirstSearch(this.exit, function (node, visitor) {
        node.visitInputs(visitor);
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
          node.visitInputs(next);
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
        node.visitInputs(function (input) {
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

      assert (dfg && dfg instanceof DFG);
      cfg.dfg = dfg;

      var visited = [];

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
        var block = start.block = cfg.buildBlock(start, end);
        if (start instanceof Start) {
          cfg.root = block;
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
          d.control.block.pushSuccessor(block, true);
        }
      }

      buildEnd(dfg.exit);
      cfg.exit = dfg.exit.control.block;
      return cfg;
    };

    constructor.prototype.fromAnalysis = function (analysis) {
      var blocks = analysis.blocks;

      var map = [];
      for (var i = 0; i < blocks.length; i++) {
        var block = new Block(this.nextBlockID++);
        map[blocks[i].bid] = block;
        this.blocks.push(block);
      }

      for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        var succs = block.succs;
        for (var j = 0; j < succs.length; j++) {
          map[block.bid].pushSuccessor(map[succs[j].bid], true);
        }
      }

      this.buildRootAndExit();
    };

    /**
     * Makes sure root node has no predecessors and that there is only one
     * exit node.
     */
    constructor.prototype.buildRootAndExit = function buildRootAndExit() {
      assert (!this.root && !this.exit);

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

      assert (this.root && this.exit);
      assert (this.root !== this.exit);
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

      assert (rootName && names[rootName]);
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
      assert (this.root.predecessors.length === 0, "Root node " + this.root + " must not have predecessors.");

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

    constructor.prototype.scheduleEarly = function scheduleEarly() {
      var writer = new IndentingWriter();

      var cfg = this;
      var dfg = this.dfg;

      function schedule(node) {
        writer.enter("> Scheduling: " + node);
        var inputs = [];
        node.visitInputs(function (input) {
          if (!(input instanceof Control)) {
            inputs.push(followProjection(input));
          }
        });
        for (var i = 0; i < inputs.length; i++) {
          if (!inputs[i].control) {
            writer.writeLn("Scheduling Input: " + i + " : " + inputs[i]);
            schedule(inputs[i]);
          }
        }
        if (node.control || node instanceof Start) {
          writer.leave("< Already Scheduled or is Start Node");
          return;
        }
        if (inputs.length === 0) {
          node.control = cfg.root.region;
          cfg.root.append(node);
          writer.leave("< No Inputs");
          writer.writeLn("Scheduled: " + node + " in " + node.control);
          return;
        }

        assert (inputs[0].control, inputs[0]);
        var a = inputs[0].control.block;
        for (var i = 1; i < inputs.length; i++) {
          var b = inputs[i].control.block;
          if (a.dominatorDepth < b.dominatorDepth) {
            a = b;
          }
        }

        node.control = a.region;
        a.append(node);
        writer.writeLn("Scheduled: " + node + " in " + node.control);
        assert (node.control, a.region);
        writer.leave();
      }

      dfg.forEach(function (node) {
        if (node instanceof Phi) {
          node.control.block.append(node);
        }
        if (node.control) {
          schedule(node);
        }
      });
    };

    /**
     * Encodes an interval as (header, set) pair.
     */
    var Interval = (function () {
      function constructor(header, set) {
        this.header = header;
        this.set = set;
      }
      constructor.prototype.toString = function() {
        return "I header: " + this.header.id + ", set: " + this.set.toString();
      };
      return constructor;
    })();

    function Edges () {
      this.successors = [];
      this.predecessors = [];
    }

    function blockType(node) {
      return node.successors.length;
    }

    /**
     * Computes the Allen-Cocke interval partitioning.
     *
     * Definitions:
     *
     *  Interval: an interval I(h) in a control-flow graph is a maximal, single entry subgraph
     *    in which h is the only entry to I(h) and all closed paths in I(h) contain h.
     *
     *  Interval Header: h, in I(h), is the sole entry point of the interval and is called the
     *    interval header.
     *
     * This function derives a sequence of collapsed interval graphs and passes its results to
     * a callback.
     *
     * @param {function(Array.<Interval>, Edges)} callback
     *
     * @return {Boolean}
     */
    constructor.prototype.computeIntervals = function computeIntervals(callback) {

      var root = this.root;
      var order = this.computeReversePostOrder();
      var headers = [root];
      var processedHeaders = this.createBlockSet();

      var edges = new Edges();

      order.forEach(function (block) {
        edges.successors[block.id] = block.successors;
        edges.predecessors[block.id] = block.predecessors;
      });

      var intervals;
      var intervalMap = [];
      function findIntervalContaining(block) {
        for (var i = 0; i < intervals.length; i++) {
          if (intervals[i].set.get(block.id)) {
            return intervals[i];
          }
        }
        unexpected("Cannot find an interval for " + block);
      }

      while (order.length > 1) {
        intervals = [];

        while (headers.length) {
          var header = headers.pop();
          processedHeaders.set(header.id);
          var set = this.createBlockSet();
          set.set(header.id);

          /**
           * Expand the interval by adding all nodes whose predecessors are within the interval.
           */
          var expanded = true;
          while (expanded) {
            expanded = false;
            for (var i = 0; i < order.length; i++) {
              var block = order[i];
              if (block === root) {
                continue;
              }
              if (set.get(block.id)) {
                continue;
              }
              var predecessors = edges.predecessors[block.id];
              var allPredecessorsInSet = predecessors.length > 0;
              for (var j = 0; j < predecessors.length; j++) {
                if (!set.get(predecessors[j].id)) {
                  allPredecessorsInSet = false;
                  break;
                }
              }
              if (allPredecessorsInSet) {
                set.set(block.id);
                expanded = true;
              }
            }
          }

          intervals.push(new Interval(header, set));

          /**
           * Add header nodes which have not been processed and have at least one predecessor
           * in the interval.
           */
          for (var i = 0; i < order.length; i++) {
            var block = order[i];
            if (processedHeaders.get(block.id)) {
              continue;
            }
            if (set.get(block.id)) {
              continue;
            }
            var predecessors = edges.predecessors[block.id];
            for (var j = 0; j < predecessors.length; j++) {
              if (set.get(predecessors[j].id)) {
                headers.pushUnique(block);
                break;
              }
            }
          }
        }

        var newOrder = [];
        var newEdges = new Edges();

        // Collapse intervals.
        intervals.forEach(function (interval) {
          var header = interval.header;
          newOrder.push(header);
          var newSuccessors = newEdges.successors[header.id] = [];
          var newPredecessors = newEdges.predecessors[header.id] = [];
          var set = interval.set.toArray();
          // Collapse intervals into nodes.
          set.forEach(function (blockID) {
            var successors = edges.successors[blockID];
            for (var i = 0; i < successors.length; i++) {
              if (!interval.set.get(successors[i].id)) {
                newSuccessors.pushUnique(findIntervalContaining(successors[i]).header);
              }
            }
            var predecessors = edges.predecessors[blockID];
            for (var i = 0; i < predecessors.length; i++) {
              if (!interval.set.get(predecessors[i].id)) {
                newPredecessors.pushUnique(findIntervalContaining(predecessors[i]).header);
              }
            }
            // Merge interval sets.
            var oldInterval = intervalMap[blockID];
            if (oldInterval) {
              interval.set._union(oldInterval.set);
            }
          });
          // Remember interval so it can be merged next level.
          intervalMap[header.id] = interval;
        });

        var notReducible = newOrder.length === order.length;
        if (notReducible) {
          return false;
        }

        callback && callback(intervals, edges, newEdges);

        order = newOrder;
        edges = newEdges;
        headers = [root];
        processedHeaders.clearAll();
      }

      return true;
    };

    constructor.prototype.restructure = function restructure() {
      var isHeaderOrLatch = this.createBlockSet();
      this.computeDominators(true);
      this.restructureLoops(isHeaderOrLatch);
      this.restructureIfs(isHeaderOrLatch);
    };

    var Control = {
      If: function (block, _then, _else) {
        this.block = block;
        this.then = _then;
        this.else = _else;
      },
      Block: function (block) {
        this.block = block;
      },
      Sequence: function () {
        this.elements = [];
      }
    };

    constructor.prototype.buildStructure = function buildStructure() {
      var writer = new IndentingWriter();

      var trace = true;

      function walkBlock(block, latch, ifFollow) {
        assert (block);
        writer.writeLn(block);
        assert (!block.loopType && !block.ifType);
        var successor = block.successors[0];
        assert (successor !== block);
        walk(successor, latch, ifFollow);
      }

      function walkSelfLoop(block, latch, ifFollow) {
        var left = block.successors[0];
        var right = block.successors[1];
        var follow = block.follow;
        assert (left === follow || right === follow);
        writer.enter("while (true) {");
        writer.enter("if (" + block + ") { " + block.loopType);
        writer.writeLn("break;");
        writer.leave("}");
        writer.leave("}");
        walk(follow, latch, ifFollow);
      }

      var loops = [];
      function walkPostTestedLoop(block, latch, ifFollow) {
        trace && writer.debugLn("walkPostTestedLoop: " + block + ", loopFollow: " + block.follow + ", loopLatch: " + block.latch);
        var left = block.successors[0];
        var right = block.successors[1];
        var follow = block.follow;
        loops.push(block);
        writer.enter("while (true) {");
        writer.writeLn(block);
        if (blockType(block) === 1) {
          assert (left !== follow);
          walk(left, block.latch, ifFollow);
        } else if (blockType(block) === 2) {
          writer.enter("if () {");
          walk(left, block.latch, ifFollow);
          writer.leaveAndEnter("} else {");
          walk(right, block.latch, ifFollow);
          writer.leave("}");
        } else {
          unexpected();
        }
        writer.enter("if (" + block.latch + ") { " + block.loopType);
        writer.writeLn("break;");
        writer.leave("}");
        writer.leave("}");
        loops.pop();
        if (left !== follow && right !== follow) {
          walk(follow, latch, ifFollow);
        }
      }

      function walkPreTestedLoop(block, latch, ifFollow) {
        trace && writer.debugLn("walkPreTestedLoop: " + block + " " + block.follow);
        var left = block.successors[0];
        var right = block.successors[1];
        var follow = block.follow;
        var inner = left === follow ? right : left;
        loops.push(block);
        writer.enter("while (true) {");
        writer.enter("if (" + block + ") { " + block.loopType);
        writer.writeLn("break;");
        writer.leave("}");
        assert (blockType(block) === 2);
        walk(inner, block.latch, ifFollow);
        writer.writeLn(block.latch);
        writer.leave("}");
        loops.pop();
        walk(follow, latch, ifFollow);
      }


      function walkIf(block, latch, ifFollow) {
        trace && writer.debugLn("walkIf: " + block + ", latch: " + latch + ", ifFollow: " + ifFollow);
        writer.enter("if (" + block + ") {");
        var left = block.successors[0];
        var right = block.successors[1];
        walk(left, latch);
        writer.leaveAndEnter("} else {");
        walk(right, latch);
        writer.leave("}");
      }

      function walkIfThen(block, latch, ifFollow) {
        trace && writer.debugLn("walkIfThen: " + block + ", latch: " + latch + ", ifFollow: " + ifFollow);
        writer.enter("if (" + block + ") {");
        var left = block.successors[0];
        var right = block.successors[1];
        var follow = block.follow;
        if (left !== follow) {
          walk(left, latch, follow);
        } else {
          assert (right !== follow);
          walk(right, latch, follow);
        }
        writer.leave("}");
        walk(follow, latch, ifFollow);
      }

      function walkIfThenElse(block, latch, ifFollow) {
        trace && writer.debugLn("walkIfThenElse: " + block + ", latch: " + latch + ", ifFollow: " + ifFollow);
        writer.enter("if (" + block + ") {");
        var left = block.successors[0];
        var right = block.successors[1];
        var follow = block.follow;
        walk(left, latch, follow);
        writer.leaveAndEnter("} else {");
        walk(right, latch, follow);
        writer.leave("}");
        walk(follow, latch, ifFollow);
      }

      var walked = this.createBlockSet();

      function walk(block, latch, ifFollow) {
        if (block === latch || block === ifFollow) {
          trace && writer.debugLn("skipping: " + block + ", latch: " + latch + ", ifFollow: " + ifFollow);
          return;
        }
        for (var i = loops.length - 1; i >= 0; i--) {
          var depth = loops.length - i - 1;
          if (loops[i] === block) {
            writer.writeLn("continue " + depth + ";");
            return;
          } else if (loops[i].follow === block) {
            writer.writeLn("break " + depth + ";");
            return;
          }
        }
        trace && writer.debugLn("walk: " + block + ", latch: " + latch + ", ifFollow: " + ifFollow);
        assert (!walked.get(block.id), "Already walked: " + block);
        walked.set(block.id);
        if (block.ifType === IfType.IF) {
          walkIf(block, latch, ifFollow);
        } else if (block.ifType === IfType.IF_THEN) {
          walkIfThen(block, latch, ifFollow);
        } else if (block.ifType === IfType.IF_THEN_ELSE) {
          walkIfThenElse(block, latch, ifFollow);
        } else if (block.loopType === LoopType.PRE_TESTED) {
          walkPreTestedLoop(block, latch, ifFollow);
        } else if (block.loopType === LoopType.POST_TESTED) {
          walkPostTestedLoop(block, latch, ifFollow);
        } else if (block.loopType === LoopType.SELF) {
          walkSelfLoop(block, latch, ifFollow);
        } else if (block.loopType === LoopType.ENDLESS) {
          walkEndlessLoop(block, latch, ifFollow);
        } else {
          walkBlock(block, latch, ifFollow);
        }
      }

      walk(this.root);
    };

    var IfType = {
      IF: "If",
      IF_THEN: "If Then",
      IF_THEN_ELSE: "If Else"
    };

    var LoopType = {
      SELF: "Self",
      POST_TESTED: "Post",
      PRE_TESTED: "Pre",
      ENDLESS: "Endless"
    };

    /**
     * Traverses blocks in reverse dominator order and marks 2-way header blocks as: if-then or if-then-else.
     * The if follow node (the last node (in dominator order) to immediately dominate the if header) is also
     * computed.
     *
     * Blocks that are marked as loop headers or latches are not considered.
     */
    constructor.prototype.restructureIfs = function restructureIfs(isHeaderOrLatch) {
      var order = this.order;
      var blocks = this.blocks;
      var follow;

      var unresolved = this.createBlockSet();
      for (var i = order.length - 1; i >= 0; i--) {
        var block = order[i];
        // Is it a 2-Way header block?
        if (blockType(block) === 2 && !isHeaderOrLatch.get(block.id)) {
          print("2-Way Header Block: " + block);
          // Search for a follow block.
          follow = null;
          print("Order: " + order + " I " + i);
          for (var j = i + 1; j < order.length; j++) {
            // Is the block immediately dominated by the header and does it have at least two
            // predecessors. It must be reached by at least two paths from the header.
            if (order[j].dominator === block && order[j].predecessors.length >= 2) {
              follow = order[j];
            }
            // if (!follow && order[j].loopHeader) {
            //   follow = order[j];
            // }
          }
          if (follow) {
            print("2-Way Follow Block: " + follow + " for Header Block: " + block);
            block.ifType = findIfType(block, follow);
            block.follow = follow;
            /*
            unresolved.forEach(function (blockID) {
              var unresolvedBlock = blocks[blockID];
              unresolvedBlock.ifType = findIfType(unresolvedBlock, follow);
              unresolvedBlock.follow = follow;
              unresolved.clear(blockID);
            });
            */
          } else {
            unresolved.set(block.id);
          }
        }
      }

      unresolved.forEach(function (blockID) {
        blocks[blockID].ifType = IfType.IF;
      });

      // assert (unresolved.isEmpty(), unresolved);

      function findIfType(header, follow) {
        if (header.successors[0] === follow || header.successors[1] === follow) {
          return IfType.IF_THEN;
        }
        return IfType.IF_THEN_ELSE;
      }
    };

    /**
     * Find loop structures.
     */
    constructor.prototype.restructureLoops = function restructureLoops(isHeaderOrLatch) {
      var writer = new IndentingWriter();
      var blocks = this.blocks;

      var inLoop = this.createBlockSet();
      var inAnyLoop = this.createBlockSet();

      function inSet(set, block) {
        return set.get(block.id);
      }

      /**
       * Marks the blocks belonging to the loop that is induced by the back edge
       * from the latch to the interval header. This is the set of blocks in the
       * interval whose reverse-post-order (rpo) number is less than or equal to
       * the latch's rpo.
       */
      function markLoopBlocks(inLoop, interval, latch) {
        assert (inLoop.isEmpty());
        interval.set.forEach(function (blockID) {
          var block = blocks[blockID];
          assert (block.rpo >= interval.header.rpo);
          if (block.rpo <= latch.rpo) {
            assert (!inLoop.get(block.id));
            inLoop.set(block.id);
          }
        });
      }

      function findLoopType(inLoop, header, latch) {
        writer && writer.writeLn("header: " + header + ", successors: " + header.successors);
        writer && writer.writeLn(" latch: " + latch + ", successors: " + latch.successors);

        var latchType = blockType(latch);
        var headerType = blockType(header);

        if (header === latch) {
          return LoopType.SELF;
        } else if (latchType === 1) {
          if (headerType === 1) {
            return LoopType.ENDLESS;
          } else if (headerType === 2) {
            return LoopType.PRE_TESTED;
          }
        } else if (latchType === 2) {
          if (headerType === 1) {
            return LoopType.POST_TESTED;
          } else if (headerType === 2) {
            var successors = header.successors;
            writer && writer.writeLn("inLoop: " + inLoop + " succ " + successors);
            if (inSet(inLoop, successors[0]) && inSet(inLoop, successors[1])) {
              return LoopType.POST_TESTED;
            } else {
              return LoopType.PRE_TESTED;
            }
          }
        }
      }

      function findLoopFollow(inLoop, header, latch) {
        assert (header.loopType, header);

        var loopType = header.loopType;
        var successors;
        if (loopType === LoopType.SELF) {
          if (header.successors[0] === header) {
            return header.successors[1];
          }
          return header.successors[0];
        } else if (loopType === LoopType.PRE_TESTED) {
          successors = header.successors;
          if (inSet(inLoop, successors[0])) {
            return successors[1];
          } else {
            return successors[0];
          }
        } else if (loopType === LoopType.POST_TESTED) {
          successors = latch.successors;
          if (inSet(inLoop, successors[0])) {
            if (inSet(inLoop, successors[1])) {
              return null;
            }
            return successors[1];
          } else {
            return successors[0];
          }
        } else if (loopType === LoopType.ENDLESS) {
          var max = {rpo: Number.MAX_VALUE};
          var follow = max;
          inLoop.forEach(function (blockID) {
            var block = blocks[blockID];
            successors = block.successors;
            if (successors.length !== 2) {
              return;
            }
            for (var i = 0; i < successors.length; i++) {
              if (!inSet(inLoop, successors[i]) && successors[i].rpo < follow.rpo) {
                follow = successors[i];
                break;
              }
            }
          });
          if (follow !== max) {
            return follow;
          } else {
            return null;
          }
        }
      }

      var level = 0;
      this.computeIntervals(function process(intervals) {
        inAnyLoop.clearAll();

        /*
        var links = [];
        intervals.forEach(function (interval) {
          var header = interval.header;
          links.push(header.id);
          header.successors.forEach(function (successor) {
            links.push(header.id + "->" + successor.id);
          });
        });

        var str = links.join(",");
        var cfg = new CFG();
        cfg.fromString(str, "" + intervals[0].header.id);
        cfg.trace(writer);
        */

        writer && writer.enter("> Restructuring Level: " + level++);
        for (var j = 0; j < intervals.length; j++) {
          var interval = intervals[j];
          // print(interval);
          var header = interval.header;
          var predecessors = header.predecessors;
          writer && writer.writeLn("Interval, header: " + header + ", predecessors: " + predecessors);
          writer && writer.writeLn("Interval, set: " + interval.set);

          // Find Latching Node, there can be many, what to do about the rest??
          // Insert continues i guess.
          // Should we look for the last latch node?
          var latch = null;

          for (var k = 0; k < predecessors.length; k++) {
            var predecessor = predecessors[k];
            if (inSet(interval.set, predecessor) && !inSet(inAnyLoop, predecessor)) {
              predecessor.loopHeader = header;
              if (!latch || latch.rpo < predecessor.rpo) {
                latch = predecessor;
              }
            }
          }

          if (latch) {
            writer && writer.writeLn("Latch Node: " + latch);
            inLoop.clearAll();
            markLoopBlocks(inLoop, interval, latch);
            writer && writer.writeLn("Loop Blocks: " + inLoop);

            writer && writer.enter("findLoopType");
            header.loopType = findLoopType(inLoop, header, latch);
            writer && writer.writeLn("loopType: " + header.loopType);
            writer && writer.leaveAndEnter("findLoopFollow");
            header.follow = findLoopFollow(inLoop, header, latch);
            latch.isLatch = true;
            writer && writer.writeLn(header.follow);
            writer && writer.outdent();
            header.latch = latch;
            inAnyLoop._union(inLoop);

            isHeaderOrLatch.set(header.id);
            isHeaderOrLatch.set(latch.id);
          } else {
            writer && writer.writeLn("No latch found.");
          }
        }
        writer && writer.leave("<");
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
        return "white";
      }

      function styleOf(block) {
        if (block.loopType) {
          return "rounded";
        }
        return "none";
      }
      function shapeOf(block) {
        assert (block);
        if (block === root) {
          return "house";
        } else if (block === exit) {
          return "invhouse";
        } else if (block.loopType) {
          return "box"
        } else if (block.loopHeader) {
          return "hexagon";
        }
        return "box";
      }

      writer.writeLn("");
      writer.enter("digraph CFG {");

      writer.writeLn("graph [bgcolor = gray10];");
      writer.writeLn("edge [fontname = Consolas, fontsize = 11, color = white, fontcolor = white];");
      writer.writeLn("node [shape = box, fontname = Consolas, fontsize = 11, color = white, fontcolor = white];");
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
          blockInfo += " O" + block.rpo;
        }
        if (block.loopType) {
          blockInfo += ", " + block.loopType;
        }
        if (block.ifType) {
          blockInfo += ", " + block.ifType;
        }
        if (block.follow) {
          blockInfo += ", follow: " + block.follow;
        }
        if (block.latch) {
          blockInfo += ", latch: " + block.latch;
        }
        if (block.loopHeader) {
          blockInfo += ", loopHeader: " + block.loopHeader;
        }
        writer.writeLn("B" + block.id + " [label = \"B" + block.id + blockInfo + loopInfo + "\", color = \"" + colorOf(block) + "\", shape=" + shapeOf(block) + ", style=" + styleOf(block) + "];");
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
        // if (block.loopHeader) {
          // writer.writeLn("B" + block.id + " -> " + "B" + block.loopHeader.id + " [color = red];");
        // }
      });

      writer.leave("}");
      writer.writeLn("");
    };

    return constructor;
  })();

  const selfTest = false;

  if (selfTest) {
    var writer = new IndentingWriter();
    function build(str) {
      var cfg = new CFG();
      cfg.fromString(str);
      return cfg;
    }

    // var a = build("0->0, 0->1->2->4->5, 1->3->4");
    var a = build("0->0");
    a.computeDominators(true);
    a.trace(writer);

    writer.writeLn("DONE SELF TESTING");
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

  exports.DFG = DFG;
  exports.CFG= CFG;

})(typeof exports === "undefined" ? (IR = {}) : exports);