var Control = (function () {

  function Clusterfuck(body) {
    this.body = body;
  }

  Clusterfuck.prototype = {
    trace: function (writer, worklist) {
      writer.writeLn("clusterfuck #" + this.body.blockId);
    }
  };

  function Seq(body) {
    this.body = body;
  }

  Seq.prototype = {
    trace: function (writer) {
      var body = this.body;
      for (var i = 0, j = body.length; i < j; i++) {
        body[i].trace(writer);
      }
    },

    first: function () {
      return this.body[0];
    },

    slice: function (begin, end) {
      return new Seq(this.body.slice(begin, end));
    }
  };

  function Loop(body) {
    this.body = body;
  }

  Loop.prototype = {
    trace: function (writer) {
      writer.enter("loop {");
      this.body.trace(writer);
      writer.leave("}");
    }
  };

  function If(cond, then, els, negated) {
    this.cond = cond;
    this.then = then;
    this.else = els;
    this.negated = negated;
  }

  If.prototype = {
    trace: function (writer) {
      this.cond.trace(writer);
      writer.enter("if" + (this.negated ? " not" : "") + " {");
      this.then && this.then.trace(writer);
      if (this.else) {
        writer.outdent();
        writer.enter("} else {");
        this.else.trace(writer);
      }
      writer.leave("}");
    }
  };

  function Case(index, body) {
    this.index = index;
    this.body = body;
  }

  Case.prototype = {
    trace: function (writer) {
      if (this.index >= 0) {
        writer.writeLn("case " + this.index + ":");
      } else {
        writer.writeLn("default:");
      }
      writer.indent();
      this.body && this.body.trace(writer);
      writer.outdent();
    }
  };

  function Switch(determinant, cases) {
    this.determinant = determinant;
    this.cases = cases;
  }

  Switch.prototype = {
    trace: function (writer) {
      this.determinant && this.determinant.trace(writer);
      writer.writeLn("switch {");
      for (var i = 0, j = this.cases.length; i < j; i++) {
        this.cases[i].trace(writer);
      }
      writer.writeLn("}");
    }
  };

  function LabelSwitch(cases) {
    this.cases = cases;
  }

  LabelSwitch.prototype = {
    trace: function (writer) {
      for (var i = 0, j = this.cases.length; i < j; i++) {
        this.cases[i].trace(writer);
      }
    }
  };

  function LabelCase(label, body) {
    this.label = label;
    this.body = body;
  }

  LabelCase.prototype = {
    trace: function (writer) {
      writer.enter("if (label is " + this.label + ") {");
      this.body && this.body.trace(writer);
      writer.leave("}");
    }
  };

  function SetLabel(target) {
    this.target = target;
  }

  SetLabel.prototype = {
    trace: function (writer) {
      writer.writeLn("label = " + this.target.blockId);
    }
  };

  function LabeledBreak(target) {
    this.target = target;
  }

  LabeledBreak.prototype = {
    trace: function (writer) {
      writer.writeLn("break to #" + this.target.blockId);
    }
  };

  function LabeledContinue(target) {
    this.target = target;
  }

  LabeledContinue.prototype = {
    trace: function (writer) {
      writer.writeLn("continue to #" + this.target.blockId);
    }
  };

  function nullaryControl(name) {
    var c = {};
    c.trace = function (writer) {
      writer.writeLn(name);
    }
    return c;
  };

  var Break = nullaryControl("break");
  var Continue = nullaryControl("continue");
  var Return = nullaryControl("return");

  return {
    Clusterfuck: Clusterfuck,
    Seq: Seq,
    Loop: Loop,
    If: If,
    Case: Case,
    Switch: Switch,
    LabelSwitch: LabelSwitch,
    LabelCase: LabelCase,
    SetLabel: SetLabel,
    LabeledBreak: LabeledBreak,
    LabeledContinue: LabeledContinue,
    Break: Break,
    Continue: Continue,
    Return: Return
  };

})();

var Bytecode = (function () {

  function Bytecode(code) {
    var op = code.readU8();
    this.op = op;
    this.originalPosition = code.position;

    var i, n;

    switch (op) {
    case OP_lookupswitch:
      var defaultOffset = code.readS24();
      this.offsets = [];
      var n = code.readU30() + 1;
      for (i = 0; i < n; i++) {
        this.offsets.push(code.readS24());
      }
      this.offsets.push(defaultOffset);
      break;
    default:
      var opdesc = opcodeTable[op];
      if (!opdesc) {
        unexpected("Unknown Op " + op);
      }

      for (i = 0, n = opdesc.operands.length; i < n; i++) {
        var operand = opdesc.operands[i];

        switch (operand.size) {
        case "u08":
          this[operand.name] = code.readU8();
          break;
        case "s08":
          this[operand.name] = code.readS8();
          break;
        case "s16":
          this[operand.name] = code.readU30Unsafe();
          break;
        case "s24":
          this[operand.name] = code.readS24();
          break;
        case "u30":
          this[operand.name] = code.readU30();
          break;
        case "u32":
          this[operand.name] = code.readU32();
          break;
        default:
          unexpected();
        }
      }
    }
  }

  Bytecode.prototype = {
    makeBlockHead: function makeBlockHead(id) {
      if (this.succs) {
        return id;
      }

      this.blockId = id;

      /* CFG edges. */
      this.succs = [];
      this.preds = [];

      /* Dominance relation edges. */
      this.dominatees = [];
      this.frontier = new BlockDict();

      return id + 1;
    },

    makeLoopHead: function makeLoopHead(backEdge) {
      if (this.loop && this.loop.has(backEdge)) {
        return;
      }

      if (!this.loop) {
        this.loop = new BlockDict();
        this.loop.add(this);
      }
      var body = this.loop;
      var pending = [backEdge];
      var p;
      while (p = pending.pop()) {
        if (!body.has(p)) {
          body.add(p);
          pending.push.apply(pending, p.preds);
        }
      }
    },

    addSpback: function addSpback(target) {
      if (!this.spbacks) {
        this.spbacks = new BlockDict();
      }
      this.spbacks.add(target);
    },

    /*
     * Compute and memoize the weight of itself and all its dominatees.
     *
     * The weight of a basic block is its length in bytecodes + the weight of
     * all its dominatees.
     */
    computeWeight: function computeWeight() {
      assert(this.dominatees);

      if (this.weight) {
        return;
      }

      var worklist = this.dominatees.slice();
      var postorder = [this];
      var node;
      while (node = worklist.pop()) {
        if (!node.weight) {
          postorder.push(node);
          worklist.push.apply(worklist, node.dominatees);
        }
      }

      while (node = postorder.pop()) {
        node.weight = node.end.position - node.position + 1;
        var doms = node.dominatees;
        for (var i = 0, j = doms.length; i < j; i++) {
          node.weight += doms[i].weight;
        }
      }
    },

    dominatedBy: function dominatedBy(d) {
      assert(this.dominator);

      var b = this;
      do {
        if (b === d) {
          return true;
        }
        b = b.dominator;
      } while (b !== b.dominator);

      return false;
    },

    trace: function trace(writer) {
      if (!this.succs) {
        return;
      }

      writer.writeLn("#" + this.blockId);
    },

    toString: function toString() {
      if (this.blockId >= 0) return this.blockId;
      var opdesc = opcodeTable[this.op];
      var str = opdesc.name.padRight(' ', 20);
      var i, j;

      if (this.op === OP_lookupswitch) {
        str += "targets:";
        for (i = 0, j = this.targets.length; i < j; i++) {
          str += (i > 0 ? "," : "") + this.targets[i].position;
        }
      } else {
        for (i = 0, j = opdesc.operands.length; i < j; i++) {
          var operand = opdesc.operands[i];

          if (operand.name === "offset") {
            str += "target:" + this.target.position;
          } else {
            str += operand.name + ":" + this[operand.name];
          }

          if (i < j - 1) {
            str += ", ";
          }
        }
      }

      return str;
    }
  };

  return Bytecode;

})();

/*
 * It's only sane to use this data structure for bytecodes within the same
 * bytecode stream, since block ids are used as keys.
 */
var BlockDict = (function () {

  function hasOwn(obj, name) {
    return Object.hasOwnProperty.call(obj, name);
  }

  function BlockDict() {
    this.backing = Object.create(null, {});
    this.size = 0;
  }

  BlockDict.prototype = {
    contains: function (other) {
      if (other.size > this.size) {
        return false;
      }

      var otherBacking = other.backing;
      var backing = this.backing;
      for (var blockId in otherBacking) {
        if (!hasOwn(backing, blockId)) {
          return false;
        }
      }
      return true;
    },

    has: function (x) {
      return hasOwn(this.backing, x.blockId);
    },

    get: function (x) {
      return this.backing[x.blockId];
    },

    add: function (x, v) {
      if (!hasOwn(this.backing, x.blockId)) {
        this.backing[x.blockId] = v || x;
        this.size++;
      }
    },

    remove: function (x) {
      if (!x) {
        return false;
      }

      if (hasOwn(this.backing, x.blockId)) {
        delete this.backing[x.blockId];
        this.size--;
        return true;
      }
      return false;
    },

    unionArray: function (arr) {
      var backing = this.backing;
      for (var i = 0, j = arr.length; i < j; i++) {
        var blockId = arr[i].blockId;
        if (!hasOwn(backing, blockId)) {
          backing[blockId] = arr[i];
          this.size++;
        }
      }
    },

    union: function (other) {
      var otherBacking = other.backing;
      var backing = this.backing;
      for (var blockId in otherBacking) {
        if (!hasOwn(backing, blockId)) {
          backing[blockId] = otherBacking[blockId];
          this.size++;
        }
      }
    },

    intersect: function (other) {
      var otherBacking = other.backing;
      var backing = this.backing;
      for (var blockId in backing) {
        if (!hasOwn(otherBacking, blockId)) {
          delete backing[blockId];
          this.size--;
        }
      }
    },

    equalsArray: function (arr) {
      var backing = this.backing;
      for (var i = 0, j = arr.length; i < j; i++) {
        if (!hasOwn(backing, arr[i].blockId)) {
          return false;
        }
      }

      return true;
    },

    subtractArray: function (arr) {
      var backing = this.backing;
      for (var i = 0, j = arr.length; i < j; i++) {
        var blockId = arr[i].blockId;
        if (hasOwn(backing, blockId)) {
          delete backing[blockId];
          this.size--;
        }
      }
    },

    subtract: function (other) {
      var otherBacking = other.backing;
      var backing = this.backing;
      for (var blockId in otherBacking) {
        if (hasOwn(backing, blockId)) {
          delete backing[blockId];
          this.size--;
        }
      }
    },

    choose: function () {
      var backing = this.backing;
      return backing[Object.keys(backing)[0]];
    },

    /*
     * Snapshot current state into an array for iteration.
     *
     * NB: It's up to the user to make sure this is not stale before using!
     */
    takeSnapshot: function () {
      var n = this.size;
      var a = new Array(n);
      var i = 0;
      var backing = this.backing;
      for (var blockId in backing) {
        a[i++] = backing[blockId];
      }
      this.snapshot = a;
    },

    /* Convenience function to get an up-to-date snapshot. */
    flatten: function () {
      this.takeSnapshot();
      return this.snapshot;
    }
  };

  return BlockDict;

})();

var Analysis = (function () {

  function Unanalyzable(reason) {
    this.reason = reason;
  }

  Unanalyzable.prototype = {
    toString: function () {
      return "Method is unanalyzable: " + this.reason;
    }
  };

  /*
   * Original blocks are just the bytecodes themselves.
   *
   * Split blocks point back into the bytecode array but have no content
   * themselves.
   */
  function SplitBlock(code, newId) {
    assert(code.blockId);

    this.original = code;
    this.position = code.position;
    this.end = code.end;
    this.blockId = newId;

    this.succs = [];
    this.preds = [];
    this.dominatees = [];
    this.frontier = new BlockDict();

    this.level = code.level;
  }

  SplitBlock.prototype = Object.create(Bytecode.prototype);
  SplitBlock.prototype.toString = function toString() {
    return "split of #" + this.original.blockId;
  };

  /*
   * Internal bytecode used for bogus jumps. They should be emitted as throws
   * so that if control flow ever reaches them, we crash.
   */
  function getInvalidTarget(cache, offset) {
    if (cache && cache[offset]) {
      return cache[offset];
    }

    var code = Object.create(Bytecode.prototype);
    code.op = OP_invalid;
    code.position = offset;
    cache && (cache[offset] = code);
    return code;
  }

  function detectBasicBlocks(bytecodes) {
    var code;
    var pc, end;
    var id = 0;

    assert(bytecodes);

    id = bytecodes[0].makeBlockHead(id);
    for (pc = 0, end = bytecodes.length - 1; pc < end; pc++) {
      code = bytecodes[pc];
      switch (code.op) {
      case OP_returnvoid:
      case OP_returnvalue:
      case OP_throw:
        id = bytecodes[pc + 1].makeBlockHead(id);
        break;

      case OP_lookupswitch:
        var targets = code.targets;
        for (var i = 0, j = targets.length; i < j; i++) {
          id = targets[i].makeBlockHead(id);
        }
        id = bytecodes[pc + 1].makeBlockHead(id);
        break;

      case OP_jump:
      case OP_iflt:
      case OP_ifnlt:
      case OP_ifle:
      case OP_ifnle:
      case OP_ifgt:
      case OP_ifngt:
      case OP_ifge:
      case OP_ifnge:
      case OP_ifeq:
      case OP_ifne:
      case OP_ifstricteq:
      case OP_ifstrictne:
      case OP_iftrue:
      case OP_iffalse:
        id = code.target.makeBlockHead(id);
        id = bytecodes[pc + 1].makeBlockHead(id);
        break;

      default:;
      }
    }

    code = bytecodes[end];
    switch (code.op) {
    case OP_returnvoid:
    case OP_returnvalue:
    case OP_throw:
      break;

    case OP_lookupswitch:
      var targets = code.targets;
      for (var i = 0, j = targets.length; i < j; i++) {
        id = targets[i].makeBlockHead(id);
      }
      break;

    case OP_jump:
      id = code.target.makeBlockHead(id);
      break;

    case OP_iflt:
    case OP_ifnlt:
    case OP_ifle:
    case OP_ifnle:
    case OP_ifgt:
    case OP_ifngt:
    case OP_ifge:
    case OP_ifnge:
    case OP_ifeq:
    case OP_ifne:
    case OP_ifstricteq:
    case OP_ifstrictne:
    case OP_iftrue:
    case OP_iffalse:
      id = code.target.makeBlockHead(id);
      bytecodes[pc + 1] = getInvalidTarget(null, pc + 1);
      id = bytecodes[pc + 1].makeBlockHead(id);
      break;

    default:;
    }

    var currentBlock = bytecodes[0];
    for (pc = 1, end = bytecodes.length; pc < end; pc++) {
      if (!bytecodes[pc].succs) {
        continue;
      }

      assert(currentBlock.succs);

      code = bytecodes[pc - 1];
      currentBlock.end = code;
      var nextBlock = bytecodes[pc];

      switch (code.op) {
      case OP_returnvoid:
      case OP_returnvalue:
      case OP_throw:
        break;

      case OP_lookupswitch:
        for (var i = 0, j = code.targets.length; i < j; i++) {
          currentBlock.succs.push(code.targets[i]);
        }
        break;

      case OP_jump:
        currentBlock.succs.push(code.target);
        break;

      case OP_iflt:
      case OP_ifnlt:
      case OP_ifle:
      case OP_ifnle:
      case OP_ifgt:
      case OP_ifngt:
      case OP_ifge:
      case OP_ifnge:
      case OP_ifeq:
      case OP_ifne:
      case OP_ifstricteq:
      case OP_ifstrictne:
      case OP_iftrue:
      case OP_iffalse:
        currentBlock.succs.push(code.target);
        if (code.target !== nextBlock) {
          currentBlock.succs.push(nextBlock);
        }
        break;

      default:
        currentBlock.succs.push(nextBlock);
      }

      currentBlock = nextBlock;
    }

    code = bytecodes[end - 1];
    switch (code.op) {
    case OP_lookupswitch:
      for (var i = 0, j = code.targets.length; i < j; i++) {
        currentBlock.succs.push(code.targets[i]);
      }
      break;

    case OP_jump:
      currentBlock.succs.push(code.target);
      break;

    default:;
    }
    currentBlock.end = code;

    return id;
  }

  function intersectDominators(doms, b1, b2) {
    var finger1 = b1;
    var finger2 = b2;
    while (finger1 !== finger2) {
      while (finger1 > finger2) {
        finger1 = doms[finger1];
      }
      while (finger2 > finger1) {
        finger2 = doms[finger2];
      }
    }
    return finger1;
  }

  /*
   * Give block ids to reachable blocks, as well as mark which successors are
   * back targets.
   *
   * Returns a reverse postordering of blocks.
   */
  function normalizeReachableBlocks(root, noLinking) {
    /* The root must not have preds! */
    assert(root.preds.length === 0);

    const ONCE = 1;
    const BUNCH_OF_TIMES = 2;

    var blocks = [];
    var visited = {};
    var ancestors = {};
    var worklist = [root];
    var node;
    var level = root.level || 0;

    ancestors[root.blockId] = true;
    while (node = worklist.top()) {
      if (visited[node.blockId]) {
        if (visited[node.blockId] === ONCE) {
          visited[node.blockId] = BUNCH_OF_TIMES;
          blocks.push(node);

          if (!noLinking) {
            /* Doubly link reachable blocks. */
            var succs = node.succs;
            for (var i = 0, j = succs.length; i < j; i++) {
              succs[i].preds.push(node);
            }
          }
        }

        ancestors[node.blockId] = false;
        worklist.pop();
        continue;
      }

      visited[node.blockId] = ONCE;
      ancestors[node.blockId] = true;

      var succs = node.succs;
      for (var i = 0, j = succs.length; i < j; i++) {
        var s = succs[i];
        if (s.level < level) {
          continue;
        }

        ancestors[s.blockId] && node.addSpback(s);
        !visited[s.blockId] && worklist.push(s);
      }
    }

    return blocks.reverse();
  }

  /*
   * Calculate the dominance relation iteratively.
   *
   * Algorithm is from [1].
   *
   * [1] Cooper et al. "A Simple, Fast Dominance Algorithm"
   */
  function computeDominance(blocks, redoms) {
    var n = blocks.length;
    var doms = new Array(n);
    doms[0] =  0;

    /* Blocks must be given to us in reverse postorder. */
    var rpo = {};
    for (var b = 0; b < n; b++) {
      rpo[blocks[b].blockId] = b;
    }

    if (redoms) {
      for (var b = 1; b < n; b++) {
        var block = blocks[b];
        var idom = block.dominator;

        if (redoms.has(block) || !idom ||
            !(rpo[idom.blockId] in doms)) {
          continue;
        }

        doms[rpo[block.blockId]] = rpo[idom.blockId];
      }
    }

    var changed = true;

    while (changed) {
      changed = false;

      /* Iterate all blocks but the starting block. */
      for (var b = 1; b < n; b++) {
        var preds = blocks[b].preds;
        var j = preds.length;

        var newIdom = rpo[preds[0].blockId];
        /* Because 0 is falsy, have to use |in| here. */
        if (!(newIdom in doms)) {
          for (var i = 1; i < j; i++) {
            newIdom = rpo[preds[i].blockId];
            if (newIdom in doms) {
              break;
            }
          }
        }
        assert(newIdom in doms);

        for (var i = 0; i < j; i++) {
          var p = rpo[preds[i].blockId];
          if (p === newIdom) {
            continue;
          }

          if (p in doms) {
            newIdom = intersectDominators(doms, p, newIdom);
          }
        }

        if (doms[b] !== newIdom) {
          doms[b] = newIdom;
          changed = true;
        }
      }
    }

    blocks[0].dominator = blocks[0];
    for (var b = 1; b < n; b++) {
      var block = blocks[b];
      var idom = blocks[doms[b]];

      /* Store the immediate dominator. */
      block.dominator = idom;
      idom.dominatees.push(block);
    }

    /* Assign dominator tree levels. */
    var worklist = [blocks[0]];
    blocks[0].level || (blocks[0].level = 0);
    while (block = worklist.shift()) {
      var dominatees = block.dominatees;
      for (var i = 0, j = dominatees.length; i < j; i++) {
        dominatees[i].level = block.level + 1;
      }
      worklist.push.apply(worklist, dominatees);
    }
  }

  function computeFrontiers(blocks) {
    for (var b = 1, n = blocks.length; b < n; b++) {
      var block = blocks[b];
      var preds = block.preds;

      if (preds.length >= 2) {
        var idom = block.dominator;
        for (var i = 0, j = preds.length; i < j; i++) {
          var runner = preds[i];

          while (runner !== idom) {
            runner.frontier.add(block);
            runner = runner.dominator;
          }
        }
      }
    }
  }

  /*
   * Find all SCCs at or below the level of some root that are not already
   * natural loops.
   */
  function findUnnaturalSCCs(root) {
    var preorderId = 1;
    var preorder = {};
    var assigned = {};
    var unconnectedNodes = [];
    var pendingNodes = [];
    var sccs = [];
    var level = root.level;
    var worklist = [root];
    var node;

    while (node = worklist.top()) {
      if (preorder[node.blockId]) {
        if (pendingNodes.peek() === node) {
          pendingNodes.pop();

          var scc = [];
          var loop;
          do {
            var u = unconnectedNodes.pop();
            assigned[u.blockId] = true;
            if (u.loop && (!loop || u.loop.size > loop.size)) {
              loop = u.loop;
            }
            scc.push(u);
          } while (u !== node);

          if (scc.length > 1 && !(loop && loop.equalsArray(scc))) {
            sccs.push(scc);
          }
        }

        worklist.pop();
        continue;
      }

      preorder[node.blockId] = preorderId++;
      unconnectedNodes.push(node);
      pendingNodes.push(node);

      var succs = node.succs;
      for (var i = 0, j = succs.length; i < j; i++) {
        var s = succs[i];
        if (s.level < level) {
          continue;
        }

        var sid = s.blockId;
        if (!preorder[sid]) {
          worklist.push(s);
        } else if (!assigned[sid]) {
          while (preorder[pendingNodes.peek().blockId] > preorder[sid]) {
            pendingNodes.pop();
          }
        }
      }
    }

    return sccs;
  }

  function maxWeightNode(top, scc) {
    var msed = [];
    for (var i = 0, j = scc.length; i < j; i++) {
      var node = scc[i];

      if (node.level === top.level + 1) {
        node.weight || node.computeWeight();
        msed.push(node);
      }
    }

    var maxWeight = 0;
    var max;
    for (var i = 0, j = msed.length; i < j; i++) {
      var node = msed[i];
      if (node.weight > maxWeight) {
        maxWeight = node.weight;
        max = node;
      }
    }

    return max;
  }

  function splitSCC(head, scc, redoms, newBlockId) {
    var clones = [];
    var cloneMap = new BlockDict();
    var headDomain = {};
    var clone, original;

    for (var i = 0, j = scc.length; i < j; i++) {
      if (scc[i].dominatedBy(head)) {
        headDomain[scc[i].blockId] = true;
      } else {
        original = scc[i];
        clone = new SplitBlock(original, newBlockId++);
        clones.push(clone);
        cloneMap.add(original, clone);
      }
    }

    var nodes, node;
    for (var i = 0, j = clones.length; i < j; i++) {
      clone = clones[i];
      original = clone.original;

      nodes = original.succs;
      for (var k = 0, l = nodes.length; k < l; k++) {
        node = nodes[k];

        if (cloneMap.has(node)) {
          /* The edge goes to somewhere inside the split region. */
          clone.succs[k] = cloneMap.get(node);
        } else {
          /* The edge goes to somewhere outside. */
          clone.succs[k] = node;
          node.preds.push(clone);
          redoms.add(node);
        }
      }

      nodes = original.preds;
      original.preds = [];
      delete original.dominator;

      for (var k = 0, l = nodes.length; k < l; k++) {
        node = nodes[k];

        if (cloneMap.has(node)) {
          /* The edge comes from somewhere inside the split region. */
          clone.preds.push(cloneMap.get(node));
          original.preds.push(node);
        } else if (headDomain[node.blockId]) {
          /*
           * The edge comes from the head domain, we point the head region to
           * the clone.
           */
          clone.preds.push(node);
          node.succs[node.succs.indexOf(original)] = clone;
          node.weight = undefined;
        } else {
          /* The edge comes from somewhere outside. */
          original.preds.push(node);
        }
      }
    }

    return clones;
  }

  function findIrreducibleLoops(blocks) {
    var irreducibles = new BlockDict();

    for (var i = 0, j = blocks.length; i < j; i++) {
      var block = blocks[i];
      var spbacks = block.spbacks;
      if (!spbacks) {
        continue;
      }

      var succs = block.succs;
      for (var k = 0, l = succs.length; k < l; k++) {
        var s = succs[k];

        if (spbacks.has(s) && !block.dominatedBy(s)) {
          irreducibles.add(s.dominator);
        }
      }
    }

    return irreducibles;
  }

  function ExtractionContext() {
    this.exit = null;
  }

  ExtractionContext.prototype = {
    update: function update(props) {
      var desc = {};
      for (var p in props) {
        desc[p] = {
          value: props[p],
          writable: true,
          enumerable: true,
          configurable: true
        };
      }
      return Object.create(this, desc);
    }
  }

  function pruneExit(blocks, exit) {
    if (exit) {
      if (exit.size) {
        blocks.subtract(exit);
      } else {
        blocks.remove(exit);
      }
    }
  }

  function isExit(block, exit) {
    return exit && (block === exit || (exit.size && exit.has(block)));
  }

  function exitSet(body, cx) {
    var exits = new BlockDict();

    for (var i = 0, j = body.length; i < j; i++) {
      var b = body[i];

      if (isExit(b, cx.exit) || isExit(b, cx.break)) {
        continue;
      }

      exits.union(b.frontier);
    }

    pruneExit(cx.exit);
    pruneExit(cx.break);

    cx.continue && exits.remove(cx.continue);
    cx.loop && exits.intersect(cx.loop);

    return exits.size <= 1 ? exits.choose() : exits;
  }

  function inducibleIf(block, cx, info) {
    var succs = block.succs;

    if (succs.length !== 2) {
      return null;
    }

    var branch1 = succs[0];
    var branch2 = succs[1];

    /*
     * Try heuristic for triangle ifs first as to avoid unnecessary
     * labeling.
     */
    if (branch1.frontier.size === 1 &&
        branch1.frontier.has(branch2)) {
      info.then = branch1;
      info.negated = false;
      exit = branch2;
    } else if (branch2.frontier.size === 1 &&
               branch2.frontier.has(branch1)) {
      info.then = branch2;
      info.negated = true;
      exit = branch1;
    } else {
      var exit = exitSet([branch1, branch2], cx);

      /* Simple heuristic to stop some long if-else cascades. */
      var via1 = false;
      var via2 = false;
      if (cx.loop) {
        via1 = !cx.loop.has(branch1);
        via2 = !cx.loop.has(branch2);
      }

      if (via1) {
        info.then = branch1;
        info.negated = false;
        exit = branch2;
      } else if (via2) {
        info.then = branch2;
        info.negated = true;
        exit = branch1;
      } else {
        info.then = branch1;
        info.else = branch2;
        info.negated = false;
      }
    }

    return exit ? cx.update({ exit: exit }) : cx;
  }

  function inducibleLookupSwitch(block, cx, info) {
    if (!block.end || block.end.op !== OP_lookupswitch) {
      return null;
    }

    var cases = [];
    var targets = block.end.targets;
    var exits = new BlockDict();
    var defaultCase = targets.top();

    cases.unshift({ body: defaultCase });

    var c = defaultCase;
    var nextCase = defaultCase;
    for (var i = targets.length - 2; i >= 0; i--) {
      if (targets[i] === defaultCase) {
        continue;
      }

      nextCase = c;
      c = targets[i];

      if (c === nextCase) {
        cases.unshift({ index: i });
        continue;
      }

      var cexit = exitSet([c], cx);
      if (nextCase && cexit) {
        if (cexit === nextCase) {
          cases.unshift({ index: i, body: c, exit: nextCase });
        } else if (cexit.has(nextCase)) {
          cexit.remove(nextCase);
          exits.union(cexit);
          cases.unshift({ index: i, body: c, exit: nextCase });
        } else {
          exits.add(cexit);
          cases.unshift({ index: i, body: c });
        }
      } else {
        cases.unshift({ index: i, body: c });
      }
    }

    info.cases = cases;

    var exit = exits.size <= 1 ? exits.choose() : exits;
    if (exit) {
      return cx.update({ break: exit, exit: exit });
    }
    return cx.update({ break: exit });
  }

  function maybeSequence(v) {
    if (v.length > 1) {
      return new Control.Seq(v.reverse());
    }

    return v[0];
  }

  /*
   * Induce a tree of control structures from a CFG.
   *
   * Algorithm is inspired by [2].
   *
   * [2] Moll. Decompilation of LLVM IR.
   */
  function induceControlTree(root, chokeOnClusterfucks) {
    var conts = [];
    var cx = new ExtractionContext();
    var block = root;
    var prevBlock;

    const K_LOOP_BODY = 0;
    const K_LOOP = 1;
    const K_IF_THEN = 2;
    const K_IF_ELSE = 3;
    const K_IF = 4;
    const K_SEQ = 5;
    const K_SWITCH_CASE = 6;
    const K_SWITCH = 7;
    const K_LABEL_CASE = 8;
    const K_LABEL_SWITCH = 9;

    var loopBodyCx;
    for (;;) {
      var v = [];

      pushing:
      while (block) {
        if (block.size) {
          var blocks = block.flatten();
          var exit = exitSet(blocks, cx);
          cxx = exit ? cx.update({ exit: exit }) : cx;
          block = blocks.pop();
          conts.push({ kind: K_LABEL_CASE,
                       label: block.blockId,
                       cases: [],
                       pendingCases: blocks,
                       join: exit,
                       joinCx: cx,
                       cx: cxx });
          cx = cxx;
          continue;
        }

        if (cx.exit) {
          if (block === cx.exit) {
            break;
          }

          if (cx.exit.size && cx.exit.has(block)) {
            v.push(new Control.SetLabel(block));
            break;
          }
        }

        if (cx.break) {
          if (block === cx.break) {
            v.push(Control.Break);
            break;
          }

          if (cx.break.size && cx.break.has(block)) {
            v.push(Control.Break);
            v.push(new Control.SetLabel(block));
            break;
          }
        }

        if (loopBodyCx) {
          /*
           * Don't try to match breaks/continues and loop heads if we just
           * matched one, since cx.exit will be set to the head (i.e. this
           * node).
           */
          cx = loopBodyCx;
          loopBodyCx = null;
        } else {
          if (cx.loop && !cx.loop.has(block)) {
            if (cx.break) {
              /*
               * We are breaking out of a loop inside another break
               * environment, like a switch, so we should break directly out
               * of the loop.
               */
              v.push(new Control.LabeledBreak(cx.continue));
            } else {
              v.push(Control.Break);
            }
            v.push(new Control.SetLabel(block));
            cx.loopExit.add(block);
            break;
          }

          if (block === cx.continue) {
            v.push(Control.Continue);
            break;
          }

          if (block.loop) {
            /* |loopExit| will be added to as we leave the loop. */
            cxx = cx.update({ loopExit: new BlockDict(),
                              continue: block,
                              loop: block.loop,
                              exit: block });
            loopBodyCx = cxx;
            conts.push({ kind: K_LOOP_BODY,
                         loopExit: cxx.loopExit,
                         cx: cx });
            continue;
          }
        }

        var info = {};
        if (cxx = inducibleIf(block, cx, info)) {
          conts.push({ kind: K_IF_THEN,
                       cond: block,
                       negated: info.negated,
                       else: info.else,
                       join: (cx.exit === cxx.exit ? null : cxx.exit),
                       joinCx: cx,
                       cx: cxx });
          block = info.then;
          cx = cxx;
        } else if (cxx = inducibleLookupSwitch(block, cx, info)) {
          var c;
          var cases = [];
          while (c = info.cases.pop()) {
            if (c.body) {
              conts.push({ kind: K_SWITCH_CASE,
                           det: block,
                           index: c.index,
                           cases: cases,
                           pendingCases: info.cases,
                           join: (cx.exit === cxx.exit ? null : cxx.exit),
                           joinCx: cx,
                           cx: cxx });
              block = c.body;
              cx = c.exit ? cxx.update({ exit: c.exit }) : cxx;
              break;
            }

            cases.push(new Control.Case(c.index));
          }
        } else if (block.succs.length <= 1) {
          conts.push({ kind: K_SEQ,
                       block: block });

          if (block.end.op === OP_returnvoid ||
              block.end.op === OP_returnvalue) {
            v.push(Control.Return);
            break;
          }

          block = block.succs[0];
        } else {
          if (chokeOnClusterfucks) {
            throw new Unanalyzable("has clusterfuck on " + block.blockId);
          }
          v.push(new Control.Clusterfuck(block));
          break;
        }
      }

      var k;
      popping:
      while (k = conts.pop()) {
        switch (k.kind) {
        case K_LOOP_BODY:
          block = k.loopExit.size <= 1 ? k.loopExit.choose() : k.loopExit;
          cx = k.cx;
          conts.push({ kind: K_LOOP,
                       body: maybeSequence(v) });
          break popping;
        case K_LOOP:
          v.push(new Control.Loop(k.body));
          break;
        case K_IF_THEN:
          if (k.else) {
            block = k.else;
            cx = k.cx;
            conts.push({ kind: K_IF_ELSE,
                         cond: k.cond,
                         negated: k.negated,
                         then: maybeSequence(v),
                         join: k.join,
                         cx: k.joinCx });
          } else {
            block = k.join;
            cx = k.joinCx;
            conts.push({ kind: K_IF,
                         cond: k.cond,
                         negated: k.negated,
                         then: maybeSequence(v) });
          }
          break popping;
        case K_IF_ELSE:
          block = k.join;
          cx = k.cx;
          conts.push({ kind: K_IF,
                       cond: k.cond,
                       negated: k.negated,
                       then: k.then,
                       else: maybeSequence(v) });
          break popping;
        case K_IF:
          v.push(new Control.If(k.cond, k.then, k.else, k.negated, v));
          break;
        case K_SEQ:
          v.push(k.block);
          break;
        case K_SWITCH_CASE:
          k.cases.push(new Control.Case(k.index, maybeSequence(v)));

          var c;
          while (c = k.pendingCases.pop()) {
            if (c.body) {
              block = c.body;
              cx = c.exit ? k.cx.update({ exit: c.exit }) : k.cx;
              conts.push({ kind: K_SWITCH_CASE,
                           det: k.det,
                           index: c.index,
                           cases: k.cases,
                           pendingCases: k.pendingCases,
                           join: k.join,
                           joinCx: k.joinCx,
                           cx: k.cx });
              break popping;
            }

            k.cases.push(new Control.Case(c.index));
          }

          block = k.join;
          cx = k.joinCx;
          conts.push({ kind: K_SWITCH,
                       det: k.det,
                       cases: k.cases });
          break popping;
        case K_SWITCH:
          k.cases.reverse();
          v.push(new Control.Switch(k.det, k.cases));
          break;
        case K_LABEL_CASE:
          k.cases.push(new Control.LabelCase(k.label, maybeSequence(v)));
          block = k.pendingCases.pop();
          cx = k.cx;
          if (block) {
            conts.push({ kind: K_LABEL_CASE,
                         label: block.blockId,
                         cases: k.cases,
                         pendingCases: k.pendingCases,
                         join: k.join,
                         joinCx: k.joinCx,
                         cx: k.cx });
            break popping;
          }

          block = k.join;
          cx = k.joinCx;
          conts.push({ kind: K_LABEL_SWITCH,
                       cases: k.cases });
          break popping;
        case K_LABEL_SWITCH:
          k.cases.reverse();
          v.push(new Control.LabelSwitch(k.cases));
          break;
        default:
          unexpected();
        }
      }

      if (conts.length === 0) {
        return maybeSequence(v);
      }
    }
  }

  function Analysis(method, options) {
    /*
     * Normalize the code stream. The other analyses are run by the user
     * on demand.
     */
    this.method = method;
    this.options = options || {};
    this.normalizeBytecode();
  }

  Analysis.Unanalyzable = Unanalyzable;

  Analysis.prototype = {
    normalizeBytecode: function normalizeBytecode() {
      /* This array is sparse, indexed by offset. */
      var bytecodesOffset = [];
      /* This array is dense. */
      var bytecodes = [];
      var codeStream = new AbcStream(this.method.code);
      var code;

      while (codeStream.remaining() > 0) {
        var pos = codeStream.position;
        code = new Bytecode(codeStream);

        /* Get absolute offsets for normalization to new indices below. */
        switch (code.op) {
        case OP_nop:
        case OP_label:
          bytecodesOffset[pos] = bytecodes.length;
          continue;

        case OP_lookupswitch:
          code.targets = [];
          var offsets = code.offsets;
          for (var i = 0, j = offsets.length; i < j; i++) {
            offsets[i] += pos;
          }
          break;

        case OP_jump:
        case OP_iflt:
        case OP_ifnlt:
        case OP_ifle:
        case OP_ifnle:
        case OP_ifgt:
        case OP_ifngt:
        case OP_ifge:
        case OP_ifnge:
        case OP_ifeq:
        case OP_ifne:
        case OP_ifstricteq:
        case OP_ifstrictne:
        case OP_iftrue:
        case OP_iffalse:
          code.offset += codeStream.position;
          break;

        default:;
        }

        /* Cache the position in the bytecode array. */
        code.position = bytecodes.length;
        bytecodesOffset[pos] = bytecodes.length;
        bytecodes.push(code);
      }

      var invalidJumps = {};
      for (var pc = 0, end = bytecodes.length; pc < end; pc++) {
        code = bytecodes[pc];
        switch (code.op) {
        case OP_lookupswitch:
          var offsets = code.offsets;
          for (var i = 0, j = offsets.length; i < j; i++) {
            code.targets.push(bytecodes[bytecodesOffset[offsets[i]]] ||
                              getInvalidTarget(invalidJumps, offsets[i]));
          }
          code.offsets = undefined;
          break;

        case OP_jump:
        case OP_iflt:
        case OP_ifnlt:
        case OP_ifle:
        case OP_ifnle:
        case OP_ifgt:
        case OP_ifngt:
        case OP_ifge:
        case OP_ifnge:
        case OP_ifeq:
        case OP_ifne:
        case OP_ifstricteq:
        case OP_ifstrictne:
        case OP_iftrue:
        case OP_iffalse:
          code.target = (bytecodes[bytecodesOffset[code.offset]] ||
                         getInvalidTarget(invalidJumps, code.offset));
          code.offset = undefined;
          break;

        default:;
        }
      }

      this.bytecodes = bytecodes;
    },

    analyzeControlFlow: function analyzeControlFlow() {
      /* TODO: Exceptions aren't supported. */
      if (this.method.exceptions.length > 0) {
        // TODO: Temporarily disabled this exeption so that we may execute the test suite harness,
        // albeit incorrectly.
        // throw new Unanalyzable("has exceptions");
      }

      var bytecodes = this.bytecodes;
      assert(bytecodes);
      this.nextBlockId = detectBasicBlocks(bytecodes);
      var blocks = normalizeReachableBlocks(bytecodes[0], false);
      computeDominance(blocks);
      this.blocks = blocks;

      this.ranAnalyzeControlFlow = true;
    },

    reanalyzeControlFlow: function reanalyzeControlFlow(redoms) {
      var blocks = this.blocks;

      /* Reset computed information. */
      for (var i = 0, j = blocks.length; i < j; i++) {
        var block = blocks[i];
        block.dominatees.length = 0;
        block.spbacks && delete block.spbacks;
      }

      blocks = normalizeReachableBlocks(this.bytecodes[0], true);
      computeDominance(blocks, redoms);
      this.blocks = blocks;
    },

    /*
     * Split irreducible SCCs recursively.
     *
     * Algorithm from [3].
     *
     * [3] Unger and Mueller. Handling Irreducible Loops: Optimized Node
     *     Splitting vs DJ-Graphs.
     */
    splitLoops: function splitLoops() {
      if (!this.ranAnalyzeControlFlow) {
        this.analyzeControlFlow();
      }

      var options = this.options;

      var irreducibles = findIrreducibleLoops(this.blocks);
      if (irreducibles.size <= 0) {
        this.ranSplitLoops = true;
        return;
      }

      if (!options.splitLoops) {
        throw new Unanalyzable("has irreducible loops");
      }

      var worklist = levelSort(irreducibles.flatten());
      var top;
      while (top = worklist.pop()) {
        irreducibles.remove(top);

        var sccs = findUnnaturalSCCs(top);
        if (sccs.length === 0) {
          continue;
        }

        var redoms = new BlockDict();
        var topDomain = [];
        for (var i = 0, j = sccs.length; i < j; i++) {
          var scc = sccs[i];
          var head = maxWeightNode(top, scc);
          if (head) {
            var clones = splitSCC(head, scc, redoms, this.nextBlockId);
            this.nextBlockId += clones.length;
            topDomain.push.apply(topDomain, scc);
            topDomain.push.apply(topDomain, clones);
          }
        }

        this.reanalyzeControlFlow(redoms);

        irreducibles.union(findIrreducibleLoops(topDomain));
        worklist = levelSort(irreducibles.flatten());
      }

      this.ranSplitLoops = true;
    },

    /*
     * Mark all natural loops with a set of all nodes in the loop body.
     */
    markNaturalLoops: function markNaturalLoops() {
      if (!this.ranSplitLoops) {
        this.splitLoops();
      }

      var blocks = this.blocks;
      var naturals = new BlockDict();

      for (var i = 0, j = blocks.length; i < j; i++) {
        var block = blocks[i];
        var spbacks = block.spbacks;
        if (!spbacks) {
          continue;
        }

        var succs = block.succs;
        for (var k = 0, l = succs.length; k < l; k++) {
          var s = succs[k];

          if (spbacks.has(s) && block.dominatedBy(s)) {
            s.makeLoopHead(block);
            naturals.add(s);
          }
        }
      }

      this.ranMarkNaturalLoops = true;
    },

    restructureControlFlow: function restructureControlFlow() {
      if (!this.ranMarkNaturalLoops) {
        this.markNaturalLoops();
      }

      var options = this.options;
      var root = this.bytecodes[0];

      computeFrontiers(this.blocks);
      this.controlTree = induceControlTree(root, options.chokeOnClusterfucks);
    },

    /*
     * Prints a normalized bytecode along with metainfo.
     */
    trace: function (writer) {
      function blockId(node) {
        return node.blockId;
      }

      function traceBlock(block) {
        if (!block.dominator) {
          writer.enter("block unreachable {");
        } else {
          writer.enter("block " + block.blockId +
                       (block.succs.length > 0 ? " -> " +
                        block.succs.map(blockId).join(",") : "") + " {");

          writer.writeLn("preds".padRight(' ', 10) + block.preds.map(blockId).join(","));
          writer.writeLn("idom".padRight(' ', 10) + block.dominator.blockId);
          writer.writeLn("domcs".padRight(' ', 10) + block.dominatees.map(blockId).join(","));
          writer.writeLn("frontier".padRight(' ', 10) + "{" + block.frontier.flatten().map(blockId).join(",") + "}");
          writer.writeLn("weight".padRight(' ', 10) + (block.weight || "0"));
        }

        if (block.loop) {
          writer.writeLn("loop".padRight(' ', 10) + "{" + block.loop.flatten().map(blockId).join(",") + "}");
        }

        writer.writeLn("");

        if (block.position >= 0) {
          for (var bci = block.position; bci <= block.end.position; bci++) {
            writer.writeLn(("" + bci).padRight(' ', 5) + bytecodes[bci]);
          }
        } else {
          writer.writeLn("abstract");
        }

        writer.leave("}");
      }

      var bytecodes = this.bytecodes;

      writer.enter("analysis {");
      writer.enter("cfg {");
      this.blocks.forEach(traceBlock);
      writer.leave("}");

      if (this.controlTree) {
        writer.enter("control-tree {");
        this.controlTree.trace(writer);
        writer.leave("}");
      }

      writer.leave("}");
    },

    traceCFG: makeVizTrace([{ fn: function (n) { return n.succs || []; },
                              style: "" }],
                           [{ fn: function (n) { return n.preds || []; },
                              style: "" }]),

    traceDJ: makeVizTrace([{ fn: function (n) { return n.dominatees || []; },
                             style: "[style=dashed]" },
                           { fn:
                             function (n) {
                               var crosses = new BlockDict();
                               crosses.unionArray(n.succs);
                               crosses.subtractArray(n.dominatees);
                               var cs = crosses.flatten();
                               if (n.spbacks) {
                                 for (var i = 0, j = cs.length; i < j; i++) {
                                   n.spbacks.has(cs[i]) && crosses.remove(cs[i]);
                                 }
                               }
                               return crosses.flatten();
                             },
                             style: "" },
                           { fn: function (n) { return n.spbacks ? n.spbacks.flatten() : []; },
                             style: "[color=red,style=bold]" }],
                          [{ fn: function (n) { return n.preds || []; },
                             style: "" }],
                          function (idFn, writer) {
                            var root = this.bytecodes[0];
                            var worklist = [root];
                            var n;
                            var level = root.level;
                            var currentLevel = [];
                            while (n = worklist.shift()) {
                              if (!n.level) {
                                continue;
                              }

                              if (level != n.level) {
                                writer.writeLn("{rank=same; " +
                                               currentLevel.map(function (n) {
                                                 return "block_" + idFn(n);
                                               }).join(" ") + "}");
                                currentLevel.length = 0;
                                level = n.level;
                              }
                              currentLevel.push(n);
                              worklist.push.apply(worklist, n.dominatees);
                            }
                          })
  };

  function makeVizTrace(succFns, predFns, postHook) {
    return function (writer, name, prefix) {
      function idFn(n) {
        return prefix + n.blockId;
      }

      prefix = prefix || "";
      var bytecodes = this.bytecodes;
      if (!bytecodes) {
        return;
      }

      writeGraphViz(writer, name.toString(), bytecodes[0], idFn,
                    function (n) { return n.succs || []; },
                    succFns, predFns,
                    function (n) {
                      if (n.original) {
                        return ("Split: " + n.blockId + " of " +
                                n.original.blockId + "\\l");
                      }

                      var str = "Block: " + n.blockId + "\\l";
                      for (var bci = n.position; bci <= n.end.position; bci++) {
                        str += bci + ": " + bytecodes[bci] + "\\l";
                      }
                      return str;
                    },
                    postHook && postHook.bind(this, idFn));
    }
  }

  return Analysis;

})();