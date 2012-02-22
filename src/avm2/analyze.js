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
      this.then.trace(writer);
      if (this.else) {
        writer.outdent();
        writer.enter("} else {");
        this.else.trace(writer);
      }
      writer.leave("}");
    }
  };

  /*
   * Switches Overview
   *
   * Because asc can generate both ``spined'' and lookup switches, not all
   * induced switches will look the same.
   *
   * If a Control.Switch has the .determinant property, its determinant is the
   * block that ends in the lookupswitch, and all its cases have the .index
   * property for which integer index it matches.
   *
   * Otherwise it is a spined switch, and at this point we do not know what
   * the actual determinant is, and all its cases will instead of the .cond
   * property, which is the block that branches on the determinant.
   *
   * If during compilation it is discovered than not the same determinant is
   * used, some kind of fixup will be needed.
   */

  function Case(cond, index, body) {
    this.cond = cond;
    this.index = index;
    this.body = body;
  }

  Case.prototype = {
    trace: function (writer) {
      if (this.cond) {
        writer.writeLn("case #" + this.cond.blockId + ":");
      } else if (this.index !== undefined && this.index !== null) {
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
    makeBlockHead: function makeBlockHead() {
      if (this.succs) {
        return;
      }

      this.succs = [];
      this.preds = [];
    },

    makeLoopHead: function makeLoopHead(backEdge) {
      if (this.loop && this.loop.has(backEdge) >= 0) {
        return;
      }

      var body = new BytecodeDict();
      var pending = [backEdge];
      var p;
      body.add(this);
      while (p = pending.pop()) {
        if (!body.has(p)) {
          p.inLoop = this;
          body.add(p);
          pending.push.apply(pending, p.preds);
        }
      }

      this.loop = body;
    },

    leadsTo: function leadsTo(target) {
      return (target && ((this === target) ||
                         (this.frontier.size === 1) &&
                         (this.frontier.has(target))));
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
 * bytecode stream, since positions are used as keys.
 */
var BytecodeDict = (function () {

  function hasOwn(obj, name) {
    return Object.hasOwnProperty.call(obj, name);
  }

  function BytecodeDict() {
    this.backing = Object.create(null, {});
    this.size = 0;
  }

  BytecodeDict.prototype = {
    has: function (x) {
      return hasOwn(this.backing, x.position);
    },

    get: function (x) {
      return this.backing[x.position];
    },

    add: function (x, v) {
      if (!hasOwn(this.backing, x.position)) {
        this.backing[x.position] = v || x;
        this.size++;
      }
    },

    remove: function (x) {
      if (hasOwn(this.backing, x.position)) {
        delete this.backing[x.position];
        this.size--;
      }
    },

    unionArray: function (arr) {
      var backing = this.backing;
      for (var i = 0, j = arr.length; i < j; i++) {
        var position = arr[i].position;
        if (!hasOwn(backing, position)) {
          this.size++;
        }
        backing[position] = arr[i];
      }
    },

    union: function (other) {
      var otherBacking = other.backing;
      var backing = this.backing;
      for (var position in otherBacking) {
        if (!hasOwn(backing, position)) {
          this.size++;
        }
        backing[position] = otherBacking[position];
      }
    },

    subtract: function (other) {
      var otherBacking = other.backing;
      var backing = this.backing;
      for (var position in otherBacking) {
        if (hasOwn(backing, position)) {
          delete backing[position];
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
      for (var position in backing) {
        a[i++] = backing[position];
      }
      this.snapshot = a;
    },

    /* Convenience function to get an up-to-date snapshot. */
    flatten: function () {
      this.takeSnapshot();
      return this.snapshot;
    }
  };

  return BytecodeDict;

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
   * Internal bytecode used for bogus jumps. They should be emitted as throws
   * so that if control flow ever reaches them, we crash.
   */
  function getInvalidTarget(cache, offset) {
    if (cache[offset]) {
      return cache[offset];
    }

    var code = Object.create(Bytecode.prototype);
    code.op = OP_invalid;
    code.position = offset;
    cache[offset] = code;
    return code;
  }

  function dfs(root, pre, post, succ) {
    var visited = {};
    var pended = {};
    var worklist = [root];
    var node;

    pended[root.position] = true;
    while (node = worklist.top()) {
      if (!visited[node.position]) {
        visited[node.position] = true;

        if (pre) {
          pre(node);
        }
      } else {
        if (post) {
          post(node);
        }
        worklist.pop();
        continue;
      }

      var succs = node.succs;
      for (var i = 0, j = succs.length; i < j; i++) {
        var s = succs[i];
        var p = pended[s.position];

        if (succ) {
          succ(node, s, v);
        }

        if (!p) {
          worklist.push(s);
          pended[s.position] = true;
        }
      }
    }
  }

  function detectBasicBlocks(bytecodes) {
    var code;
    var pc, end;

    assert(bytecodes);

    bytecodes[0].makeBlockHead();
    for (pc = 0, end = bytecodes.length - 1; pc < end; pc++) {
      code = bytecodes[pc];
      switch (code.op) {
      case OP_returnvoid:
      case OP_returnvalue:
      case OP_throw:
        bytecodes[pc + 1].makeBlockHead();
        break;

      case OP_lookupswitch:
        var targets = code.targets;
        for (var i = 0, j = targets.length; i < j; i++) {
          targets[i].makeBlockHead();
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
        code.target.makeBlockHead();
        bytecodes[pc + 1].makeBlockHead();
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
        targets[i].makeBlockHead();
      }
      break;

    case OP_jump:
      code.target.makeBlockHead();
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
      code.target.makeBlockHead();
      bytecodes[pc + 1] = getInvalidTarget(null, pc + 1);
      bytecodes[pc + 1].makeBlockHead();
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
  }

  /*
   * Calculate the dominance relation iteratively.
   *
   * Algorithm is from [1].
   *
   * [1] Cooper et al. "A Simple, Fast Dominance Algorithm"
   */
  function computeDominance(root) {
    var doms;

    function intersect(b1, b2) {
      var finger1 = b1;
      var finger2 = b2;
      while (finger1 !== finger2) {
        while (finger1 < finger2) {
          finger1 = doms[finger1];
        }
        while (finger2 < finger1) {
          finger2 = doms[finger2];
        }
      }
      return finger1;
    }

    /* The root must not have incoming edges! */
    assert(root.preds.length === 0);

    /*
     * For this algorithm we id blocks by their index in postorder. We will
     * change the id to the more familiar reverse postorder after we run the
     * algorithm.
     */
    var blocks = [];
    var postorder = 0;
    dfs(root, null,
        function post(block) {
          blocks.push(block);

          /* Doubly link reachable blocks. */
          var succs = block.succs;
          for (var i = 0, j = succs.length; i < j; i++) {
            succs[i].preds.push(block);
          }

          block.blockId = postorder++;
          block.frontier = new BytecodeDict();
        }, null);
    var n = blocks.length;
    doms = new Array(n);
    doms[n - 1] =  n - 1;
    var changed = true;

    while (changed) {
      changed = false;

      /* Iterate all blocks but the starting block in reverse postorder. */
      for (var b = n - 2; b >= 0; b--) {
        var preds = blocks[b].preds;
        var j = preds.length;

        var newIdom = preds[0].blockId;
        if (!doms[newIdom]) {
          for (var i = 1; i < j; i++) {
            newIdom = preds[i].blockId;
            if (doms[newIdom]) {
              break;
            }
          }
        }
        assert(doms[newIdom]);

        for (var i = 0; i < j; i++) {
          var p = preds[i].blockId;
          if (p === newIdom) {
            continue;
          }

          if (doms[p]) {
            newIdom = intersect(p, newIdom);
          }
        }

        if (doms[b] !== newIdom) {
          doms[b] = newIdom;
          changed = true;
        }
      }
    }

    for (var b = 0; b < n; b++) {
      var block = blocks[b];

      /* Store the immediate dominator. */
      block.dominator = blocks[doms[b]];

      /* Compute the dominance frontier. */
      var preds = block.preds;
      if (preds.length >= 2) {
        for (var i = 0, j = preds.length; i < j; i++) {
          var runner = preds[i];
          while (runner !== block.dominator) {
            runner.frontier.add(block);
            runner = blocks[doms[runner.blockId]];
          }
        }
      }
    }

    /* Fix block id to be reverse postorder (program order). */
    for (var b = 0; b < n; b++) {
      block = blocks[b];
      block.blockId = n - 1 - block.blockId;
    }

    return blocks;
  }

  function findNaturalLoops(blocks) {
    for (var i = 0, j = blocks.length; i < j; i++) {
      var block = blocks[i];
      var succs = block.succs;
      for (var k = 0, l = succs.length; k < l; k++) {
        if (block.dominatedBy(succs[k])) {
          succs[k].makeLoopHead(block);
        }
      }
    }
  }

  function ExitsStack() {
    this.stack = [];
    this.exits = new BytecodeDict();
    this.size = 0;
  }

  ExitsStack.prototype = {
    push: function (xs) {
      this.stack.push(xs);
      var b = xs.break;
      var c = xs.continue;
      b && this.exits.add(b, new Control.LabeledBreak(b));
      c && this.exits.add(c, new Control.LabeledBreak(c));
      this.exits.takeSnapshot();
      this.size++;
    },

    pop: function () {
      var xs = this.stack.pop();
      if (xs) {
        var b = xs.break;
        var c = xs.continue;
        b && this.exits.remove(b);
        c && this.exits.remove(c);
        this.exits.takeSnapshot();
        this.size--;
      }
    }
  };

  function ExtractionContext() {
    this.break = null;
    this.continue = null;
    this.loop = null;
    this.exit = {};
  }

  ExtractionContext.prototype.update = function update(props) {
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
  };

  function pruneNestedExits(exits, nestedExits) {
    var pruned = false;
    var exitNodes = exits.flatten();
    var allowTailDuplication = exits.size !== 1;
    var nestedExitNodes = nestedExits.exits.snapshot;
    for (var i = 0, j = exitNodes.length; i < j; i++) {
      var exit = exitNodes[i];
      for (var k = 0, l = nestedExitNodes.length; k < l; k++) {
        var nestedExit = nestedExitNodes[k].target;
        if ((allowTailDuplication && exit.leadsTo(nestedExit)) ||
            exit === nestedExit) {
          pruned = true;
          exits.remove(exit);
        }
      }
    }
    return pruned;
  }

  /*
   * Returns a new context updated with loop information if loop is inducible,
   * undefined otherwise.
   *
   * Let `loop exit' mean either the continue node or break node of a loop.
   *
   * A loop is inducible iff it:
   *  - Is reducible (single entry node into the cycle).
   *  - Has at most a single exit node, after loop exits of parent loops are pruned.
   *
   * If a loop has no exit nodes, its exit node is set to the exit node of the
   * parent context.
   *
   * For the loop body, its:
   *  - break node is the loop's single exit node
   *  - continue node is the loop header
   */
  function inducibleLoop(block, cx, nestedExits) {
    var loop = block.loop;
    var loopBody = loop.flatten();
    var pruned = true;

    var exits = new BytecodeDict();
    exits.unionArray(block.succs);
    for (var i = 0, j = loopBody.length; i < j; i++) {
      exits.union(loopBody[i].frontier);
    }
    exits.subtract(loop);

    /* Also prune the current loop header, which can't be the break node. */
    nestedExits.push({ continue: block });
    if (exits.size > 0 && nestedExits.size > 0) {
      pruned = pruneNestedExits(exits, nestedExits);
    }
    nestedExits.pop();

    /* There should be a single exit node. */
    var mainExit;
    if (exits.size > 1) {
      var exitNodes = pruned ? exits.flatten() : exits.snapshot;
      for (var i = 0, j = exitNodes.length; i < j; i++) {
        mainExit = exitNodes[i];

        for (var k = 0, l = exitNodes.length; k < l; k++) {
          if (!exitNodes[k].leadsTo(mainExit)) {
            mainExit = null;
            break;
          }
        }

        if (mainExit) {
          break;
        }
      }
    } else {
      mainExit = exits.choose();
    }

    if (exits.size > 1 && !mainExit) {
      return undefined;
    }

    if (!mainExit && nestedExits.size > 0) {
      mainExit = cx.exit;
    }

    return cx.update({ break: mainExit,
                       continue: block,
                       loop: loop,
                       exit: block });
  }

  /*
   * Returns an updated context if a conditional is inducible, undefined
   * otherwise.
   *
   * A conditional is inducible iff:
   *  - It has two successors in the CFG. And,
   *   - One branch's exit node is the other branch. Or,
   *   - The cardinality of the union of its two branchs' exit nodes is at
   *     most 1, after loop exits of parent loops are pruned.
   *
   * If one branch's exit node is the other branch, the conditional has no
   * else branch and the other branch is the join.
   *
   * If there are no exit nodes, the conditional has no else branch and one of
   * the branches is the join.
   *
   * Otherwise there is a single exit node, one branch is the then branch, the
   * other the else branch, and the single exit is the join.
   */
  function inducibleIf(block, cx, nestedExits, info) {
    var succs = block.succs;

    if (succs.length !== 2) {
      return undefined;
    }

    var branch1 = succs[0];
    var branch2 = succs[1];
    var exit;
    info.negated = false;

    if (branch1.leadsTo(branch2)) {
      info.then = branch1;
      exit = branch2;
    } else if (branch2.leadsTo(branch1)) {
      info.then = branch2;
      info.negated = true;
      exit = branch1;
    } else {
      var exits = new BytecodeDict();
      exits.union(branch1.frontier);
      exits.union(branch2.frontier);
      if (exits.size > 0 && nestedExits.size > 0) {
        pruneNestedExits(exits, nestedExits);
      }

      if (exits.size > 1) {
        return undefined;
      }

      exit = exits.choose();
      info.then = branch2;
      if (exit) {
        info.else = branch1;
      } else {
        exit = branch1;
      }
      info.negated = true;
    }

    return cx.update({ exit: exit });
  }

  /*
   * Returns an updated context if a spined switch is inducible, undefined
   * otherwise.
   *
   * For switches with < 5 cases, asc emits a ``spined switch'', i.e. instead
   * of a lookupswitch, a series of two-way conditionals is emitted along a
   * ``spine''. If there are fallthroughts, the spined switch is not
   * expressible using source-level ifs.
   *
   * A spined switch is inducible iff:
   *  - It has a spine along which each spine node has a frontier of size 2.
   *  - Each node that dangles off the spine has a frontier of size at most 1.
   *  - The very last spine node is an inducible if.
   *  - There is only a single break node. (See below)
   *
   * Each node that dangles off the spine is the body of a case, and each
   * spine node is a case. If one body leads to the next body or is the next
   * body, it is a fallthrough. Else, it is assumed to lead to the break
   * node. If a different break node is found further down the spine, the
   * switch is not structured.
   */
  function inducibleSpinedSwitch(block, cx, nestedExits, info) {
    var currentCase, prevCase, defaultCase, possibleBreak;
    var spine = block, prevSpine;
    var cases = [];

    while (spine) {
      if (spine.end.op !== OP_ifstricteq) {
        return undefined;
      }

      var succs = spine.succs;

      if (succs.length !== 2) {
        return undefined;
      }

      var branch1 = succs[0];
      var branch2 = succs[1];

      var cxx, iinfo = {};
      if (branch1.frontier.size === 2) {
        prevSpine = spine;
        spine = branch1;
        currentCase = branch2;
      } else if (branch2.frontier.size === 2) {
        prevSpine = spine;
        spine = branch2;
        currentCase = branch1;
      } else if (cxx = inducibleIf(spine, cx, nestedExits, iinfo)) {
        if (iinfo.negated) {
          currentCase = iinfo.else ? iinfo.else : iinfo.exit;
          defaultCase = iinfo.then;
        } else {
          currentCase = iinfo.then;
          defaultCase = iinfo.else ? iinfo.else : iinfo.exit;
        }

        if (!possibleBreak) {
          possibleBreak = cxx.exit;
        }

        if (possibleBreak !== cxx.exit) {
          return undefined;
        }
      } else {
        return undefined;
      }

      if (prevCase === currentCase) {
        cases.push({ cond: prevSpine, exit: currentCase });
      } else if (prevCase) {
        var exits = new BytecodeDict();
        exits.union(prevCase.frontier);
        if (exits.size > 0 && nestedExits.size > 0) {
          pruneNestedExits(exits, nestedExits);
        }

        if (exits.size > 1) {
          return undefined;
        }

        var exit;
        if (exits.size === 1) {
          exit = exits.choose();

          if (exit === currentCase) {
            cases.push({ cond: prevSpine, body: prevCase, exit: currentCase });
          } else {
            if (!possibleBreak) {
              possibleBreak = exit;
            }

            if (exit !== possibleBreak) {
              return undefined;
            }

            cases.push({ cond: prevSpine, body: prevCase });
          }
        } else {
          cases.push({ cond: prevSpine, body: prevCase });
        }
      }

      if (defaultCase) {
        if (currentCase === defaultCase) {
          cases.push({ cond: spine });
        } else {
          cases.push({ cond: spine, body: currentCase });
        }
        break;
      }

      prevCase = currentCase;
    }

    if (!defaultCase) {
      return undefined;
    }

    if (defaultCase !== possibleBreak) {
      cases.push({ body: defaultCase });
    }
    info.cases = cases;

    return cx.update({ break: possibleBreak });
  }

  /*
   * Returns an updated context if a lookup switch is inducible, undefined otherwise.
   *
   * A lookup switch is inducible iff:
   *  - It ends in a lookupswitch opcode.
   *  - The union of all its targets' frontiers, after removing any targets
   *    themselves that might be in the union, is of size at most 1. This is
   *    the exit node.
   *  - For each case body, its break node is the exit node above.
   */
  function inducibleLookupSwitch(block, cx, nestedExits, info) {
    if (block.end.op !== OP_lookupswitch) {
      return undefined;
    }

    var targets = block.end.targets;
    var cases = [];
    var exits = new BytecodeDict();

    for (var i = 0, j = targets.length; i < j; i++) {
      var c = targets[i];
      exits.union(c.frontier);
      exits.remove(c);
    }

    if (exits.size > 0 && nestedExits.size > 0) {
      pruneNestedExits(exits, nestedExits);
    }
    if (exits.size > 1) {
      return undefined;
    }

    var defaultCase = targets.top();
    var mainExit = exits.choose();

    for (var i = 0, j = targets.length - 1; i < j; i++) {
      var c = targets[i];

      if (c === defaultCase) {
        continue;
      }

      if (i < j - 1 && c === targets[i + 1]) {
        cases.push({ index: i });
        continue;
      }

      exits = new BytecodeDict();
      exits.union(c.frontier);
      if (exits.size > 0 && nestedExits.size > 0) {
        pruneNestedExits(exits, nestedExits);
      }

      if (exits.size > 1) {
        return undefined;
      }

      var exit = exits.choose();

      if (exit) {
        if (exit === mainExit) {
          cases.push({ index: i, body: c });
        } else {
          cases.push({ index: i, body: c, exit: exit });
        }
      } else {
        cases.push({ index: i, body: c });
      }
    }

    cases.push({ body: defaultCase });
    info.cases = cases;

    return cx.update({ break: mainExit });
  }

  /*
   * Returns true if a sequenced block is inducible, false otherwise.
   *
   * A sequence is inducible if the block has at most one successor.
   */
  function inducibleSeq(block, cx) {
    if (block.succs.length > 1) {
      return false;
    }

    return true;
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
    var nestedExits = new ExitsStack();
    var cx = new ExtractionContext();
    var block = root;

    const K_LOOP_BODY = 0;
    const K_LOOP = 1;
    const K_IF_THEN = 2;
    const K_IF_ELSE = 3;
    const K_IF = 4;
    const K_SEQ = 5;
    const K_SWITCH_CASE = 6;
    const K_SWITCH = 7;

    for (;;) {
      var v = [];

      pushing:
      while (block !== cx.exit) {
        if (!block) {
          v.push(Control.Return);
          break;
        }

        if (block === cx.break) {
          v.push(Control.Break);
          break;
        }

        if (block === cx.continue && cx.continue !== cx.exit) {
          v.push(Control.Continue);
          break;
        }

        if (nestedExits.exits.has(block)) {
          v.push(nestedExits.exits.get(block));
          break;
        }

        if (block.loop) {
          if (cxx = inducibleLoop(block, cx, nestedExits)) {
            conts.push({ kind: K_LOOP_BODY,
                         next: cxx.break,
                         cx: cx });
            nestedExits.push(cxx);

            var cxxx;
            if (cxxx = inducibleIf(block, cxx, nestedExits, info)) {
              conts.push({ kind: K_IF_THEN,
                           cond: block,
                           negated: info.negated,
                           else: info.else,
                           join: cxxx.exit,
                           joinCx: cxx,
                           cx: cxxx });
              block = info.then;
              cx = cxxx;
            } else {
              conts.push({ kind: K_SEQ,
                           block: block });
              block = block.succs[0] || null;
              cx = cxx;
            }

            continue;
          }

          /* A non-inducible loop can't be anything else. */
          if (chokeOnClusterfucks) {
            throw new Unanalyzable("has clusterfuck");
          }
          v.push(new Control.Clusterfuck(block));
          break;
        }

        var info = {};
        if (cxx = inducibleIf(block, cx, nestedExits, info)) {
          conts.push({ kind: K_IF_THEN,
                       cond: block,
                       negated: info.negated,
                       else: info.else,
                       join: cxx.exit,
                       joinCx: cx,
                       cx: cxx });
          block = info.then;
          cx = cxx;
        } else if (cxx = inducibleSpinedSwitch(block, cx, nestedExits, info)) {
          var c;
          var cases = [];
          while (c = info.cases.pop()) {
            if (c.body) {
              conts.push({ kind: K_SWITCH_CASE,
                           cond: c.cond,
                           cases: cases,
                           pendingCases: info.cases,
                           join: cxx.break,
                           joinCx: cx,
                           cx: cxx });
              nestedExits.push(cxx);
              block = c.body;
              cx = cxx.update({ exit: c.exit });
              break;
            }

            cases.push(new Control.Case(c.cond));
          }
        } else if (cxx = inducibleLookupSwitch(block, cx, nestedExits, info)) {
          var c;
          var cases = [];
          while (c = info.cases.pop()) {
            if (c.body) {
              conts.push({ kind: K_SWITCH_CASE,
                           det: block,
                           index: c.index,
                           cases: cases,
                           pendingCases: info.cases,
                           join: cxx.break,
                           joinCx: cx,
                           cx: cxx });
              nestedExits.push(cxx);
              block = c.body;
              cx = cxx.update({ exit: c.exit });
              break;
            }

            cases.push(new Control.Case(null, c.index));
          }
        } else if (inducibleSeq(block, cx)) {
          conts.push({ kind: K_SEQ,
                       block: block });
          block = block.succs[0] || null;
        } else {
          if (chokeOnClusterfucks) {
            throw new Unanalyzable("has clusterfuck");
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
          block = k.next;
          cx = k.cx;
          conts.push({ kind: K_LOOP,
                       body: maybeSequence(v) });
          nestedExits.pop();
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
        case K_SWITCH_CASE:
          k.cases.push(new Control.Case(k.cond, k.index, maybeSequence(v)));

          var c;
          while (c = k.pendingCases.pop()) {
            if (c.body) {
              block = c.body;
              cx = k.cx.update({ exit: c.exit });
              conts.push({ kind: K_SWITCH_CASE,
                           det: k.det,
                           cond: c.cond,
                           index: c.index,
                           cases: k.cases,
                           pendingCases: k.pendingCases,
                           join: k.join,
                           joinCx: k.joinCx,
                           cx: k.cx });
              break popping;
            }

            k.cases.push(new Control.Case(c.cond, c.index));
          }

          block = k.join;
          cx = k.joinCx;
          conts.push({ kind: K_SWITCH,
                       det: k.det,
                       cases: k.cases });
          nestedExits.pop();
          break popping;
        case K_SWITCH:
          k.cases.reverse();
          v.push(new Control.Switch(k.det, k.cases));
          break;
        case K_SEQ:
          v.push(k.block);
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
      /* FIXME Exceptions aren't supported. */
      if (this.method.exceptions.length > 0) {
        throw new Unanalyzable("has exceptions");
      }

      var options = this.options;
      var bytecodes = this.bytecodes;
      assert(bytecodes);
      detectBasicBlocks(bytecodes);
      var root = bytecodes[0];
      findNaturalLoops(computeDominance(root));
      this.controlTree = induceControlTree(root, options.chokeOnClusterfucks);
      return true;
    },

    /*
     * Prints a normalized bytecode along with metainfo.
     */
    trace: function (writer) {
      function blockId(node) {
        return node.blockId;
      }

      writer.enter("analysis {");
      writer.enter("cfg {");

      var ranControlFlow = !!this.bytecodes[0].succs;

      for (var pc = 0, end = this.bytecodes.length; pc < end; pc++) {
        var code = this.bytecodes[pc];

        if (ranControlFlow && code.succs) {
          if (pc > 0) {
            writer.leave("}");
          }

          if (!code.dominator) {
            writer.enter("block unreachable {");
          } else {
            writer.enter("block " + code.blockId +
                         (code.succs.length > 0 ? " -> " +
                          code.succs.map(blockId).join(",") : "") + " {");

            writer.writeLn("end".padRight(' ', 10) + code.end.position);
            writer.writeLn("idom".padRight(' ', 10) + code.dominator.blockId);
            writer.writeLn("frontier".padRight(' ', 10) + "{" + code.frontier.flatten().map(blockId).join(",") + "}");
          }

          if (code.inLoop) {
            writer.writeLn("inloop".padRight(' ', 10) + code.inLoop.blockId);
          }

          if (code.loop) {
            writer.writeLn("loop".padRight(' ', 10) + "{" + code.loop.flatten().map(blockId).join(",") + "}");
          }

          writer.writeLn("");
        }

        writer.writeLn(("" + pc).padRight(' ', 5) + code);

        if (ranControlFlow && pc === end - 1) {
          writer.leave("}");
        }
      }

      writer.leave("}");

      if (this.controlTree) {
        writer.enter("control-tree {");
        this.controlTree.trace(writer);
        writer.leave("}");
      }

      writer.leave("}");
    },

    traceGraphViz: function traceGraphViz(writer, name, prefix) {
      prefix = prefix || "";
      var bytecodes = this.bytecodes;
      if (!bytecodes) {
        return;
      }
      writeGraphViz(writer, name.toString(), bytecodes[0],
                    function (n) {
                      return prefix + n.blockId;
                    },
                    function (n) {
                      return n.succs ? n.succs : [];
                    },
                    function (n) {
                      return n.preds ? n.preds : [];
                    },
                    function (n) {
                      var str = "Block: " + n.blockId + "\\l";
                      for (var bci = n.position; bci <= n.end.position; bci++) {
                        str += bci + ": " + bytecodes[bci] + "\\l";
                      }
                      return str;
                    }
                   );
    }
  };

  return Analysis;

})();