var Control = (function () {

  function formatBlock(block) {
    return "#" + block.blockId + "#";
  }

  function Clusterfuck(body) {
    this.body = body;
  }

  Clusterfuck.prototype = {
    trace: function (writer) {
      writer.writeLn("clusterfuck " + formatBlock(this.body));
    }
  };

  function Seq(body, exit) {
    this.body = body;
    this.exit = exit;
  }

  Seq.prototype = {
    trace: function (writer) {
      writer.writeLn(formatBlock(this.body));
      if (this.exit) {
        this.exit.trace(writer);
      }
    }
  };

  function Loop(body, exit) {
    this.body = body;
    this.exit = exit;
  }

  Loop.prototype = {
    trace: function (writer) {
      writer.enter("loop {");
      this.body.trace(writer);
      writer.leave("}");
      if (this.exit) {
        this.exit.trace(writer);
      }
    }
  };

  function If(cond, then, els, negated, exit) {
    this.cond = cond;
    this.then = then;
    this.else = els;
    this.negated = negated;
    this.exit = exit;
  }

  If.prototype = {
    trace: function (writer) {
      writer.writeLn(formatBlock(this.cond));
      writer.enter("if" + (this.negated ? " not" : "") + " {");
      this.then.trace(writer);
      if (this.else) {
        writer.outdent();
        writer.enter("} else {");
        this.else.trace(writer);
      }
      writer.leave("}");
      if (this.exit) {
        this.exit.trace(writer);
      }
    }
  };

  function LabeledBreak(target) {
    this.target = target;
  }

  LabeledBreak.prototype = {
    trace: function (writer) {
      var str = "break";
      if (this.target) {
        str += " to " + formatBlock(this.target);
      }
      writer.writeLn(str);
    }
  };

  function LabeledContinue(target) {
    this.target = target;
  }

  LabeledContinue.prototype = {
    trace: function (writer) {
      var str = "continue";
      if (this.target) {
        str += " to " + formatBlock(this.target);
      }
      writer.writeLn(str);
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
      /* offsets[0] is the default offset. */
      this.offsets = [code.readS24()];
      var n = code.readU30() + 1;
      for (i = 0; i < n; i++) {
        this.offsets.push(code.readS24());
      }
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

  var Bp = Bytecode.prototype;

  Bp.makeBlockHead = function makeBlockHead() {
    if (this.succs) {
      return;
    }

    this.succs = [];
    this.preds = [];
  };

  Bp.makeLoopHead = function makeLoopHead(backEdge) {
    if (this.loop && this.loop.has(backEdge) >= 0) {
      return;
    }

    var body = new BytecodeSet([this]);
    var pending = [backEdge];
    var p;
    while (p = pending.pop()) {
      if (!body.has(p)) {
        p.inLoop = this;
        body.add(p);
        pending.push.apply(pending, p.preds);
      }
    }

    body.snapshot();
    this.loop = body;
  }

  Bp.doubleLink = function doubleLink(target) {
    assert(this.succs);
    this.succs.push(target);
    target.preds.push(this);
  };

  Bp.leadsTo = function leadsTo(target) {
    return ((this === target) ||
            (this.frontier.size === 1) &&
            (this.frontier.members[0] === target));
  };

  /* Find the dominator set from immediate dominators. */
  function dom() {
    assert(this.succs);
    assert(this.dominator);

    var b = this;
    var d = new BytecodeSet([b]);
    do {
      d.add(b.dominator);
      b = b.dominator;
    } while (b !== b.dominator);

    this.dom = d;
    return d;
  }
  Object.defineProperty(Bp, "dom", { get: dom,
                                     configurable: true,
                                     enumerable: true });

  Bp.toString = function toString() {
    var opdesc = opcodeTable[this.op];
    var str = opdesc.name.padRight(' ', 20);
    var i, j;

    if (this.op === OP_lookupswitch) {
      str += "defaultTarget:" + this.targets[0].position;
      for (i = 1, j = this.offsets.length; i < j; i++) {
        str += ", target:" + this.targets[i].position;
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
  };

  return Bytecode;
})();

/*
 * It's only sane to use this data structure for bytecodes within the same
 * bytecode stream, since positions are used as keys.
 */
var BytecodeSet = (function () {

  function hasOwn(obj, name) {
    return Object.hasOwnProperty.call(obj, name);
  }

  function BytecodeSet(init) {
    var backing = Object.create(null, {});
    if (init) {
      for (var i = 0, j = init.length; i < j; i++) {
        backing[init[i].position] = init[i];
      }
    }
    this.backing = backing;
    this.size = init ? init.length : 0;
  }

  BytecodeSet.prototype = {
    has: function (x) {
      return hasOwn(this.backing, x.position);
    },

    add: function (x) {
      if (!hasOwn(this.backing, x.position)) {
        this.backing[x.position] = x;
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

    difference: function (other) {
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
      if (this.members) {
        return this.members.top();
      }

      var backing = this.backing;
      return backing[Object.keys(backing)[0]];
    },

    /*
     * Snapshot current state into an array for iteration.
     * NB: It's up to the user to make sure this is not stale before using!
     */
    snapshot: function () {
      var n = this.size;
      var a = new Array(n);
      var i = 0;
      var backing = this.backing;
      for (var position in backing) {
        a[i++] = backing[position];
      }
      this.members = a;
    }
  };

  return BytecodeSet;

})();

var Analysis = (function () {

  function dfs(root, pre, post, succ) {
    var visited = {};

    function visit(node) {
      visited[node.position] = true;

      if (pre) {
        pre(node);
      }

      var succs = node.succs;
      for (var i = 0, j = succs.length; i < j; i++) {
        var s = succs[i];
        var v = visited[s.position];

        if (succ) {
          succ(node, s, v);
        }

        if (!v) {
          visit(s);
        }
      }

      if (post) {
        post(node);
      }
    }

    visit(root);
  }

  function detectBasicBlocks(bytecodes) {
    var code;
    var pc, end;

    assert(bytecodes);

    bytecodes[0].makeBlockHead();
    for (pc = 0, end = bytecodes.length; pc < end; pc++) {
      code = bytecodes[pc];
      switch (code.op) {
      case OP_lookupswitch:
        code.targets.forEach(function (target) {
          target.makeBlockHead();
        });
        break;

      case OP_jump:
      case OP_iflt:
      case OP_ifnlt:
      case OP_ifle:
      case OP_ifnlt:
      case OP_ifnle:
      case OP_ifgt:
      case OP_ifge:
      case OP_ifngt:
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
      case OP_lookupswitch:
        code.targets.forEach(currentBlock.doubleLink.bind(currentBlock));
        break;

      case OP_jump:
        currentBlock.doubleLink(code.target);
        break;

      case OP_iflt:
      case OP_ifnlt:
      case OP_ifle:
      case OP_ifnlt:
      case OP_ifnle:
      case OP_ifgt:
      case OP_ifge:
      case OP_ifngt:
      case OP_ifeq:
      case OP_ifne:
      case OP_ifstricteq:
      case OP_ifstrictne:
      case OP_iftrue:
      case OP_iffalse:
        currentBlock.doubleLink(code.target);
        currentBlock.doubleLink(nextBlock);
        break;

      default:
        currentBlock.doubleLink(nextBlock);
      }

      currentBlock = nextBlock;
    }
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
    var block;
    dfs(root, null, blocks.push.bind(blocks), null);
    var n = blocks.length;
    for (var i = 0; i < n; i++) {
      block = blocks[i];
      block.blockId = i;
      block.frontier = new BytecodeSet();
    }

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
      block = blocks[b];

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
      block.frontier.snapshot();
    }
  }

  function findNaturalLoops(root) {
    dfs(root,
        null,
        function post(v) {
          var succs = v.succs;
          for (var i = 0, j = succs.length; i < j; i++) {
            if (v.dom.has(succs[i])) {
              succs[i].makeLoopHead(v);
            }
          }
        },
        null);
  }

  function ControlTreeContext() {
    /*
     * Because of labeled continues and and breaks we need to make a stack of
     * such targets. Note that |continueTargets.top() === exit|.
     */
    this.break = null;
    this.continue = null;
    this.parentLoops = [];
    this.loop = null;
    this.exit = null;
  }

  ControlTreeContext.prototype.update = function update(props) {
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

  function inducibleLoop(block, cx, loopCx) {
    /* Natural loop information should already be computed. */
    if (!block.loop) {
      return undefined;
    }

    var loop = block.loop;
    var exits = new BytecodeSet();
    var loopBody = loop.members;

    for (var i = 0, j = loopBody.length; i < j; i++) {
      exits.unionArray(loopBody[i].succs);
    }
    exits.difference(loop);
    exits.snapshot();

    var exitNodes = exits.members;
    var parentLoops = cx.parentLoops;
    if (parentLoops.length > 0) {
      for (var i = 0, j = exitNodes.length; i < j; i++) {
        var exit = exitNodes[i];
        for (var k = 0, l = parentLoops.length; k < l; k++) {
          if (exit.leadsTo(parentLoops[k].break) ||
              exit.leadsTo(parentLoops[k].continue)) {
            exits.remove(exit);
          }
        }
      }

      exits.snapshot();
      exitNodes = exits.members;
    }

    /* There should be a single exit node. */
    var mainExit;
    if (exits.size > 1) {
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
      mainExit = exitNodes.top();
    }

    if (exits.size > 1 && !mainExit) {
      return undefined;
    }

    if (!mainExit && parentLoops.length > 0) {
      mainExit = parentLoops.top().exit;
    }

    loopCx = cx.update({ break: mainExit,
                         continue: block,
                         loop: loop,
                         exit: block });

    return cx.update({ break: mainExit,
                       continue: block,
                       loop: loop,
                       exit: block });
  }

  /*
   * Returns the original context if trivial conditional, an updated context
   * if neither branch is trivial, undefined otherwise.
   */
  function inducibleIf(block, cx, info) {
    var succs = block.succs;

    if (succs.length !== 2) {
      return undefined;
    }

    var branch1 = succs[0];
    var branch2 = succs[1];
    var exit = cx.exit;
    info.negated = false;

    if (branch1.leadsTo(exit)) {
      info.thenBranch = branch2;
      info.negated = true;
      return cx;
    } else if (branch2.leadsTo(exit)) {
      info.thenBranch = branch1;
      return cx;
    }

    if (branch1.leadsTo(branch2)) {
      info.thenBranch = branch1;
      exit = branch2;
    } else if (branch2.leadsTo(branch1)) {
      info.thenBranch = branch2;
      info.negated = true;
      exit = branch1;
    } else {
      if (branch1.frontier.size > 1 || branch2.frontier.size > 1) {
        return undefined;
      }

      exit = branch1.frontier.choose();
      if (exit && branch2.frontier.choose() !== exit) {
        return undefined;
      }

      info.thenBranch = branch2;
      info.elseBranch = branch1;
      info.negated = true;
    }

    return cx.update({ exit: exit });
  }

  function inducibleSeq(block, cx) {
    if (block.succs.length > 1) {
      return false;
    }

    return true;
  }

  function induceControlTree(root) {
    function visit(block, cx) {
      var cxx;
      var overlay;

      if (block === cx.exit) {
        return null;
      }

      if (!block) {
        return Control.Return;
      }

      if (block === cx.break) {
        return Control.Break;
      }

      if (block === cx.continue) {
        return (cx.continue === cx.exit ? null : Control.Continue);
      }

      if (cx.loop && !cx.loop.has(block)) {
        var parentLoops = cx.parentLoops;
        for (var i = 0, j = parentLoops.length; i < j; i++) {
          var parentLoop = parentLoops[i];

          if (block === parentLoop.break) {
            return new Control.LabeledBreak(parentLoop.break);
          }

          if (block === parentLoop.continue) {
            return new Control.LabeledContinue(parentLoop.exit);
          }
        }
      }

      var info = {};

      if (cxx = inducibleLoop(block, cx)) {
        /*
         * If we have two succs, we emit an if. Else we emit a seq. This is
         * safe as |inducibleLoop| has already checked that the entire loop
         * body (including the header) has a single exit node. Note that the
         * entry to the loop body cannot be a continue or a break.
         */
        cxx.parentLoops.push(cxx);
        var body;
        var succs = block.succs;
        if (block.succs === 1) {
          body = new Control.Seq(block, visit(succs[0], cxx));
        } else {
          var branch1 = succs[0];
          var branch2 = succs[1];
          if (branch1.leadsTo(cxx.break)) {
            body = new Control.If(block, visit(branch1, cxx), null, false,
                                  visit(branch2, cxx));
          } else {
            body = new Control.If(block, visit(branch2, cxx), null, true,
                                  visit(branch1, cxx));
          }
        }
        cxx.parentLoops.pop();

        var l = new Control.Loop(body, visit(cxx.break, cx));
        return l;
      }

      if (cxx = inducibleIf(block, cx, info)) {
        return new Control.If(block,
                              visit(info.thenBranch, cxx),
                              info.elseBranch ? visit(info.elseBranch, cxx) : null,
                              info.negated, visit(cxx.exit, cx));
      }

      if (inducibleSeq(block, cx)) {
        return new Control.Seq(block, visit(block.succs.top(), cx));
      }

      return new Control.Clusterfuck(block);
    }

    return visit(root, new ControlTreeContext());
  }

  function Analysis(codeStream) {
    /*
     * Normalize the code stream. The other analyses are run by the user
     * on demand.
     */
    this.normalizeBytecode(new AbcStream(codeStream));
  }

  var Ap = Analysis.prototype;

  Ap.normalizeBytecode = function normalizeBytecode(codeStream) {
    /* This array is sparse, indexed by offset. */
    var bytecodesOffset = [];
    /* This array is dense. */
    var bytecodes = [];
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
          offsets[i] += codeStream.position;
        }
        break;

      case OP_jump:
      case OP_iflt:
      case OP_ifnlt:
      case OP_ifle:
      case OP_ifnlt:
      case OP_ifnle:
      case OP_ifgt:
      case OP_ifge:
      case OP_ifngt:
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

    for (var pc = 0, end = bytecodes.length; pc < end; pc++) {
      code = bytecodes[pc];
      switch (code.op) {
      case OP_lookupswitch:
        var offsets = code.offsets;
        for (var i = 0, j = offsets.length; i < j; i++) {
          code.targets.push(bytecodes[bytecodesOffset[offsets[i]]]);
        }
        code.offsets = undefined;
        break;

      case OP_jump:
      case OP_iflt:
      case OP_ifnlt:
      case OP_ifle:
      case OP_ifnlt:
      case OP_ifnle:
      case OP_ifgt:
      case OP_ifge:
      case OP_ifngt:
      case OP_ifeq:
      case OP_ifne:
      case OP_ifstricteq:
      case OP_ifstrictne:
      case OP_iftrue:
      case OP_iffalse:
        code.target = bytecodes[bytecodesOffset[code.offset]];
        code.offset = undefined;
        break;

      default:;
      }
    }

    this.bytecodes = bytecodes;
  };

  Ap.analyzeControlFlow = function analyzeControlFlow() {
    var bytecodes = this.bytecodes;
    assert(bytecodes);

    /*
     * There are some assumptions here that must be maintained if you want to
     * add new analyses:
     *
     * Anything after |computeDominance| should re-snapshot |.frontier| upon
     * mutation.
     *
     * Anything after |findNaturalLoops| should re-snapshot |.loop| upon
     * mutation.
     *
     * All extant analyses operate on the |.members| array of the above sets.
     */

    detectBasicBlocks(bytecodes);
    var root = bytecodes[0];
    computeDominance(root);
    findNaturalLoops(root);
    this.controlTree = induceControlTree(root);
  }

  /*
   * Prints a normalized bytecode along with metainfo.
   */
  Ap.trace = function(writer) {
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

          writer.writeLn("idom".padRight(' ', 10) + code.dominator.blockId);
          writer.writeLn("frontier".padRight(' ', 10) + "{" + code.frontier.members.map(blockId).join(",") + "}");
        }

        if (code.loop) {
          writer.writeLn("loop".padRight(' ', 10) + "{" + code.loop.members.map(blockId).join(",") + "}");
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
  };

  Ap.traceGraphViz = function traceGraphViz(writer, name, prefix) {
    prefix = prefix || "";
    if (!this.bytecodes) {
      return;
    }
    writeGraphViz(writer, name.toString(), this.bytecodes[0],
      function (n) {
        return prefix + n.blockId;
      },
      function (n) {
        return n.succs ? n.succs : [];
      }, function (n) {
        return n.preds ? n.preds : [];
      }, function (n) {
        return "Block: " + n.blockId;
      }
    );
  };

  return Analysis;

})();