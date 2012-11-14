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
    } else if (o instanceof Variable) {
      return o.name;
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
    function constructor() {
      Node.apply(this);
    }
    constructor.prototype = extend(Node);
    return constructor;
  })();

  var Value = (function () {
    function constructor() {
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
      assert (control instanceof Region);
      this.control = control;
      this.arguments = value ? [value] : [];
    }
    constructor.prototype = extend(Value, "Phi");
    constructor.prototype.pushValue = function pushValue(x) {
      this.arguments.push(x);
    }
    return constructor;
  })();

  var Variable = (function () {
    function constructor(name) {
      assert (isString(name));
      this.name = name;
    }
    constructor.prototype = extend(Value, "Variable");
    return constructor;
  })();

  var Move = (function () {
    function constructor(to, from) {
      assert (to instanceof Variable);
      assert (from instanceof Value);
      this.to = to;
      this.from = from;
    }
    constructor.prototype = extend(Value, "Move");
    constructor.prototype.toString = function () {
      return this.to.name + " <= " + this.from;
    };
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
    function constructor(control, argument) {
      Control.call(this);
      this.control = control;
      this.argument = argument;
    }
    constructor.prototype = extend(End, "Stop");
    return constructor;
  })();

  var Projection = (function () {
    function constructor(argument, type) {
      Value.call(this);
      assert (type);
      assert (!(argument instanceof Projection));
      this.argument = argument;
      this.type = type;
    }
    constructor.Type = {
      TRUE: "true",
      FALSE: "false",
      STORE: "store",
      SCOPE: "scope"
    };
    constructor.prototype = extend(Value, "Projection");
    constructor.prototype.project = function () {
      return this.argument;
    };
    constructor.prototype.toStringDetails = function () {
      return String(this.type).toUpperCase();
    };
    return constructor;
  })();

  function isProjection(node, type) {
    return node instanceof Projection && node.type === type;
  }

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
    function constructor(operator, argument) {
      Node.call(this);
      assert (operator instanceof Operator);
      assert (argument)
      this.operator = operator;
      this.argument = argument;
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


  function isPhi(phi) {
    return phi instanceof Phi;
  }

  function isScope(scope) {
    return isPhi(scope) || scope instanceof Scope || isProjection(scope, Projection.Type.SCOPE);
  }

  function isStore(store) {
    return isPhi(store) || store instanceof Store || isProjection(store, Projection.Type.STORE);
  }

  function isString(string) {
    return typeof string === "string";
  }

  function isInteger(integer) {
    return integer | 0 === integer;
  }

  function isArray(array) {
    return array instanceof Array;
  }

  var Scope = (function () {
    function constructor(parent, object) {
      Node.call(this);
      assert (isScope(parent));
      assert (object);
      this.parent = parent;
      this.object = object;
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

  function isControlOrNull(control) {
    return control instanceof Control || control === null;
  }

  var GetProperty = (function () {
    function constructor(control, store, object, name) {
      Node.call(this);
      assert (isControlOrNull(control));
      assert (isStore(store));
      assert (object);
      assert (name);
      this.control = control;
      this.store = store;
      this.object = object;
      this.name = name;
    }
    constructor.prototype = extend(Value, "GetProperty");
    return constructor;
  })();

  var FindProperty = (function () {
    function constructor(scope, name) {
      Node.call(this);
      assert (isScope(scope));
      assert (name);
      this.scope = scope;
      this.name = name;
    }
    constructor.prototype = extend(Value, "FindProperty");
    return constructor;
  })();

  var Call = (function () {
    function constructor(control, callee, args) {
      Node.call(this);
      assert (isControlOrNull(control));
      assert (callee);
      assert (isArray(args));
      this.callee = callee;
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
      assert (isInteger(index));
      assert (isString(name));
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
    constructor.prototype.trace = function (writer) {
      writer.writeLn(this);
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

    constructor.prototype.allocateVariables = function allocateVariables() {
      var writer = new IndentingWriter();
      var order = this.computeReversePostOrder();

      function allocate (node) {
        if (node instanceof Value) {
          node.variable = new Variable("l" + node.id);
        }
      }

      order.forEach(function (block) {
        block.nodes.forEach(allocate);
        block.phis && block.phis.forEach(allocate);
      });

      /*
      function Move(to, from) {
        assert (to && from, String(to) + " <- " + from);
        this.to = to;
        this.from = from;
      }
      */

      var blockMoves = [];
      order.forEach(function (block) {
        if (block.phis) {
          block.phis.forEach(function (phi) {
            var predecessors = block.predecessors;
            var arguments = phi.arguments;
            assert (predecessors.length === arguments.length);
            for (var i = 0; i < predecessors.length; i++) {
              var predecessor = predecessors[i];
              var moves = blockMoves[predecessor.id] || (blockMoves[predecessor.id] = []);
              moves.push(new Move(phi.variable, arguments[i]));
            }
          });
        }
      });

      var blocks = this.blocks;
      blockMoves.forEach(function (moves, i) {
        print (i + " Moves: " + moves);
        moves.forEach(function (move) {
          blocks[i].append(move);
        });
      });
    };

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
          var block = node.control.block;
          (block.phis || (block.phis = [])).push(node);
        }
        if (node.control) {
          schedule(node);
        }
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
        assert (block);
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

  exports.Block = Block;
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
  exports.End = End;
  exports.Jump = Jump;
  exports.Scope = Scope;
  exports.Operator = Operator;
  exports.Variable = Variable;
  exports.Move = Move;
  exports.Parameter = Parameter;

  exports.DFG = DFG;
  exports.CFG= CFG;

})(typeof exports === "undefined" ? (IR = {}) : exports);