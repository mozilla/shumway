var Control = (function () {

  const SEQ = 1;
  const LOOP = 2;
  const IF = 3;
  const CASE = 4;
  const SWITCH = 5;
  const LABEL_CASE = 6;
  const LABEL_SWITCH = 7;
  const SET_LABEL = 8;
  const LONG_BREAK = 9;
  const LONG_CONTINUE = 10;

  var freshLabel = 0;

  function Seq(body) {
    this.kind = SEQ;
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

  function Loop(body, needsLabel) {
    this.kind = LOOP;
    this.body = body;
    this.needsLabel = needsLabel;
  }

  Loop.prototype = {
    trace: function (writer) {
      if (this.needsLabel) {
        this.label = freshLabel++;
        writer.writeLn("L" + this.label + ":");
      }
      writer.enter("loop {");
      this.body.trace(writer);
      writer.leave("}");
    }
  };

  function If(cond, then, els, negated) {
    this.kind = IF;
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
    this.kind = CASE;
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
    this.kind = SWITCH;
    this.determinant = determinant;
    this.cases = cases;
  }

  Switch.prototype = {
    trace: function (writer) {
      if (this.determinant) {
        this.determinant.trace(writer);
        if (this.determinant.needsLabel) {
          this.label = freshLabel++
          writer.writeLn("L" + this.label + ":");
        }
      }
      writer.writeLn("switch {");
      for (var i = 0, j = this.cases.length; i < j; i++) {
        this.cases[i].trace(writer);
      }
      writer.writeLn("}");
    }
  };

  function LabelCase(label, body) {
    this.kind = LABEL_CASE;
    this.label = label;
    this.body = body;
  }

  LabelCase.prototype = {
    trace: function (writer) {
      if (this.label.length) {
        writer.enter("if (label is " + this.label.join(" or ") + ") {");
      } else {
        writer.enter("if (label is " + this.label + ") {");
      }
      this.body && this.body.trace(writer);
      writer.leave("}");
    }
  };

  function LabelSwitch(cases, labelMap) {
    this.kind = LABEL_SWITCH;
    this.cases = cases;
    this.labelMap = labelMap;
  }

  LabelSwitch.prototype = {
    trace: function (writer) {
      for (var i = 0, j = this.cases.length; i < j; i++) {
        this.cases[i].trace(writer);
      }
    }
  };

  function SetLabel(target) {
    this.kind = SET_LABEL;
    this.label = target.bid;
  }

  SetLabel.prototype = {
    trace: function (writer) {
      writer.writeLn("label = " + this.label);
    }
  };

  function LongBreak(target) {
    this.kind = LONG_BREAK;
    target.needsLabel = true;
    this.target = target;
  }

  LongBreak.prototype = {
    trace: function (writer) {
      writer.writeLn("break L" + this.target.label);
    }
  };

  function LongContinue(target) {
    this.kind = LONG_CONTINUE;
    target.needsLabel = true;
    this.target = target;
  }

  LongContinue.prototype = {
    trace: function (writer) {
      writer.writeLn("continue L" + this.target.label);
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

  return {
    SEQ: SEQ,
    LOOP: LOOP,
    IF: IF,
    CASE: CASE,
    SWITCH: SWITCH,
    LABEL_CASE: LABEL_CASE,
    LABEL_SWITCH: LABEL_SWITCH,
    SET_LABEL: SET_LABEL,
    LONG_BREAK: LONG_BREAK,
    LONG_CONTINUE: LONG_CONTINUE,

    Seq: Seq,
    Loop: Loop,
    If: If,
    Case: Case,
    Switch: Switch,
    LabelCase: LabelCase,
    LabelSwitch: LabelSwitch,
    SetLabel: SetLabel,
    LongBreak: LongBreak,
    LongContinue: LongContinue,
    Break: Break,
    Continue: Continue
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

      this.bid = id;

      /* CFG edges. */
      this.succs = [];
      this.preds = [];

      /* Dominance relation edges. */
      this.dominatees = [];

      return id + 1;
    },

    trace: function trace(writer) {
      if (!this.succs) {
        return;
      }

      writer.writeLn("#" + this.bid);
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

var Analysis = (function () {

  function Unanalyzable(reason) {
    this.reason = reason;
  }

  Unanalyzable.prototype = {
    toString: function () {
      return "Method is unanalyzable: " + this.reason;
    }
  };

  function blockSetClass(length, blockById) {
    var BlockSet = BitSetFunctor(length);

    const ADDRESS_BITS_PER_WORD = BlockSet.ADDRESS_BITS_PER_WORD;
    const BITS_PER_WORD = BlockSet.BITS_PER_WORD;
    const BIT_INDEX_MASK = BlockSet.BIT_INDEX_MASK;

    BlockSet.singleton = function singleton(b) {
      var bs = new BlockSet();
      bs.set(b.bid);
      bs.count = 1;
      bs.dirty = 0;
      return bs;
    };

    BlockSet.fromBlocks = function fromArray(bs) {
      var bs = new BlockSet();
      bs.setBlocks(bs);
      return bs;
    };

    var Bsp = BlockSet.prototype;

    Bsp.forEachBlock = function forEach(fn) {
      assert (fn);
      var byId = blockById;
      var bits = this.bits;
      for (var i = 0, j = bits.length; i < j; i++) {
        var word = bits[i];
        if (word) {
          for (var k = 0; k < BITS_PER_WORD; k++) {
            if (word & (1 << k)) {
              fn(byId[i * BITS_PER_WORD + k]);
            }
          }
        }
      }
    },

    Bsp.choose = function choose() {
      var byId = blockById;
      var bits = this.bits;
      for (var i = 0, j = bits.length; i < j; i++) {
        var word = bits[i];
        if (word) {
          for (var k = 0; k < BITS_PER_WORD; k++) {
            if (word & (1 << k)) {
              return byId[i * BITS_PER_WORD + k];
            }
          }
        }
      }
    };

    Bsp.members = function members() {
      var byId = blockById;
      var set = [];
      var bits = this.bits;
      for (var i = 0, j = bits.length; i < j; i++) {
        var word = bits[i];
        if (word) {
          for (var k = 0; k < BITS_PER_WORD; k++) {
            if (word & (1 << k)) {
              set.push(byId[i * BITS_PER_WORD + k]);
            }
          }
        }
      }
      return set;
    };

    Bsp.setBlocks = function setBlocks(bs) {
      var bits = this.bits;
      for (var i = 0, j = bs.length; i < j; i++) {
        var id = bs[i].bid;
        bits[id >> ADDRESS_BITS_PER_WORD] |= 1 << (id & BIT_INDEX_MASK);
      }
    };

    return BlockSet;
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
          delete code.offsets;
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
          delete code.offset;
          break;

        default:;
        }
      }

      this.bytecodes = bytecodes;
    },

    detectBasicBlocks: function detectBasicBlocks() {
      var bytecodes = this.bytecodes;
      var blockById = {};
      var code;
      var pc, end;
      var id = 0;

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

        blockById[currentBlock.bid] = currentBlock;
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
      blockById[currentBlock.bid] = currentBlock;

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

      this.BlockSet = blockSetClass(id, blockById);
    },

    normalizeReachableBlocks: function normalizeReachableBlocks() {
      var root = this.bytecodes[0];

      /* The root must not have preds! */
      assert(root.preds.length === 0);

      const ONCE = 1;
      const BUNCH_OF_TIMES = 2;
      const BlockSet = this.BlockSet;

      var blocks = [];
      var visited = {};
      var ancestors = {};
      var worklist = [root];
      var node;
      var level = root.level || 0;

      ancestors[root.bid] = true;
      while (node = worklist.top()) {
        if (visited[node.bid]) {
          if (visited[node.bid] === ONCE) {
            visited[node.bid] = BUNCH_OF_TIMES;
            blocks.push(node);

            /* Doubly link reachable blocks. */
            var succs = node.succs;
            for (var i = 0, j = succs.length; i < j; i++) {
              succs[i].preds.push(node);
            }
          }

          ancestors[node.bid] = false;
          worklist.pop();
          continue;
        }

        visited[node.bid] = ONCE;
        ancestors[node.bid] = true;

        var succs = node.succs;
        for (var i = 0, j = succs.length; i < j; i++) {
          var s = succs[i];
          if (s.level < level) {
            continue;
          }

          if (ancestors[s.bid]) {
            if (!node.spbacks) {
              node.spbacks = new BlockSet();
            }
            node.spbacks.set(s.bid);
          }
          !visited[s.bid] && worklist.push(s);
        }
      }

      this.blocks = blocks.reverse();
    },

    /*
     * Calculate the dominance relation iteratively.
     *
     * Algorithm is from [1].
     *
     * [1] Cooper et al. "A Simple, Fast Dominance Algorithm"
     */
    computeDominance: function computeDominance() {
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

      var blocks = this.blocks;
      var n = blocks.length;
      var doms = new Array(n);
      doms[0] =  0;

      /* Blocks must be given to us in reverse postorder. */
      var rpo = {};
      for (var b = 0; b < n; b++) {
        rpo[blocks[b].bid] = b;
      }

      var changed = true;
      while (changed) {
        changed = false;

        /* Iterate all blocks but the starting block. */
        for (var b = 1; b < n; b++) {
          var preds = blocks[b].preds;
          var j = preds.length;

          var newIdom = rpo[preds[0].bid];
          /* Because 0 is falsy, have to use |in| here. */
          if (!(newIdom in doms)) {
            for (var i = 1; i < j; i++) {
              newIdom = rpo[preds[i].bid];
              if (newIdom in doms) {
                break;
              }
            }
          }
          assert(newIdom in doms);

          for (var i = 0; i < j; i++) {
            var p = rpo[preds[i].bid];
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

      const BlockSet = this.BlockSet;

      blocks[0].dominator = blocks[0];
      blocks[0].frontier = new BlockSet();
      for (var b = 1; b < n; b++) {
        var block = blocks[b];
        var idom = blocks[doms[b]];

        /* Store the immediate dominator. */
        block.dominator = idom;
        idom.dominatees.push(block);

        /* Make the frontier set. */
        block.frontier = new BlockSet();
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
    },

    computeFrontiers: function computeFrontiers() {
      var blocks = this.blocks;
      for (var b = 1, n = blocks.length; b < n; b++) {
        var block = blocks[b];
        var preds = block.preds;

        if (preds.length >= 2) {
          var idom = block.dominator;
          for (var i = 0, j = preds.length; i < j; i++) {
            var runner = preds[i];

            while (runner !== idom) {
              runner.frontier.set(block.bid);
              runner = runner.dominator;
            }
          }
        }
      }
    },

    analyzeControlFlow: function analyzeControlFlow() {
      /* TODO: Exceptions aren't supported. */
      if (this.method.exceptions.length > 0) {
        // TODO: Temporarily disabled this exeption so that we may execute the test suite harness,
        // albeit incorrectly.
        // throw new Unanalyzable("has exceptions");
      }

      assert(this.bytecodes);
      this.detectBasicBlocks();
      this.normalizeReachableBlocks();
      this.computeDominance();
      this.computeFrontiers();

      this.ranAnalyzeControlFlow = true;
    },

    markLoops: function markLoops() {
      if (!this.ranAnalyzeControlFlow) {
        this.analyzeControlFlow();
      }

      const BlockSet = this.BlockSet;

      /*
       * Find all SCCs at or below the level of some root that are not already
       * natural loops.
       */
      function findSCCs(root) {
        var preorderId = 1;
        var preorder = {};
        var assigned = {};
        var unconnectedNodes = [];
        var pendingNodes = [];
        var sccs = [];
        var level = root.level + 1;
        var worklist = [root];
        var node;

        while (node = worklist.top()) {
          if (preorder[node.bid]) {
            if (pendingNodes.peek() === node) {
              pendingNodes.pop();

              var scc = [];
              do {
                var u = unconnectedNodes.pop();
                assigned[u.bid] = true;
                scc.push(u);
              } while (u !== node);

              if (scc.length > 1 || (u.spbacks && u.spbacks.get(u.bid))) {
                sccs.push(scc);
              }
            }

            worklist.pop();
            continue;
          }

          preorder[node.bid] = preorderId++;
          unconnectedNodes.push(node);
          pendingNodes.push(node);

          var succs = node.succs;
          for (var i = 0, j = succs.length; i < j; i++) {
            var s = succs[i];
            if (s.level < level) {
              continue;
            }

            var sid = s.bid;
            if (!preorder[sid]) {
              worklist.push(s);
            } else if (!assigned[sid]) {
              while (preorder[pendingNodes.peek().bid] > preorder[sid]) {
                pendingNodes.pop();
              }
            }
          }
        }

        return sccs;
      }

      function findLoopHeads(blocks) {
        var heads = new BlockSet();

        for (var i = 0, j = blocks.length; i < j; i++) {
          var block = blocks[i];
          var spbacks = block.spbacks;

          if (!spbacks) {
            continue;
          }

          var succs = block.succs;
          for (var k = 0, l = succs.length; k < l; k++) {
            var s = succs[k];
            if (spbacks.get(s.bid)) {
              heads.set(s.dominator.bid);
            }
          }
        }

        return heads.members();
      }

      function LoopInfo(scc, loopId) {
        var body = new BlockSet();
        body.setBlocks(scc);

        var exit = new BlockSet();
        for (var i = 0, j = scc.length; i < j; i++) {
          exit.setBlocks(scc[i].succs);
        }
        exit.subtract(body);

        body.recount();
        exit.recount();

        this.id = loopId;
        this.body = body;
        this.exit = exit;
        this.head = new BlockSet();
      }

      var heads = findLoopHeads(this.blocks);
      if (heads.length <= 0) {
        return;
      }

      var worklist = heads.sort(function (a, b) {
        return a.level - b.level;
      });
      var loopId = 0;

      for (var n = worklist.length - 1; n >= 0; n--) {
        var top = worklist[n];
        var sccs = findSCCs(top);
        if (sccs.length === 0) {
          continue;
        }

        for (var i = 0, j = sccs.length; i < j; i++) {
          var scc = sccs[i];
          var loop = new LoopInfo(scc, loopId++);
          for (var k = 0, l = scc.length; k < l; k++) {
            if (scc[k].level === top.level + 1 && !scc[k].loop) {
              scc[k].loop = loop;
              loop.head.set(scc[k].bid);
            }
          }
          loop.head.recount();
        }
      }

      this.ranMarkLoops = true;
    },

    /* Induce a tree of control structures from a CFG.
     *
     * Algorithm is inspired by [2], but we do not split nodes.
     *
     * [2] Moll. Decompilation of LLVM IR.
     */
    induceControlTree: function induceControlTree() {
      const BlockSet = this.BlockSet;

      function ExtractionContext() {
      }

      ExtractionContext.prototype = {
        update: function update(props) {
          var desc = {};
          var n = 0;
          for (var p in props) {
            if (!props[p]) {
              continue;
            }

            desc[p] = {
              value: props[p],
              writable: true,
              enumerable: true,
              configurable: true
            };
            n++;
          }

          if (props === 0) {
            return this;
          }

          return Object.create(this, desc);
        }
      };

      function exitSet(body, cx) {
        var exit = new BlockSet();

        for (var i = 0, j = body.length; i < j; i++) {
          var b = body[i];
          var bbid = b.bid;

          if ((cx.exit && cx.exit.get(bbid)) ||
              (cx.break && cx.break.get(bbid)) ||
              (cx.loop && cx.loop.head.get(bbid))) {
            continue;
          }

          /*
           * NB: We destructively prune loop heads from the frontier of those
           * heads!
           */
          if (b.loop) {
            b.frontier.subtract(b.loop.head);
          }

          exit.union(b.frontier);
        }

        /* OPTIMIZEME: Can we not iterate over this somehow? */
        exit.forEachBlock(function (b) {
          b.loop && exit.union(b.loop.head);
        });

        cx.exit && exit.subtract(cx.exit);
        cx.break && exit.subtract(cx.break);
        if (cx.loop) {
          exit.intersect(cx.loop.body);
          exit.subtract(cx.loop.head);
        }

        exit.recount();
        return exit.count ? exit : null;
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
        if (branch1.frontier.count === 1 &&
            branch1.frontier.get(branch2.bid)) {
          info.then = branch1;
          info.negated = false;
          exit = BlockSet.singleton(branch2);
        } else if (branch2.frontier.count === 1 &&
                   branch2.frontier.get(branch1.bid)) {
          info.then = branch2;
          info.negated = true;
          exit = BlockSet.singleton(branch1);
        } else {
          var exit = exitSet([branch1, branch2], cx);

          /* Simple heuristic to stop some long if-else cascades. */
          var via1 = false;
          var via2 = false;
          if (cx.loop) {
            via1 = !cx.loop.body.get(branch1.bid);
            via2 = !cx.loop.body.get(branch2.bid);
          }

          if (via1) {
            info.then = branch1;
            info.negated = false;
            exit = BlockSet.singleton(branch2);
          } else if (via2) {
            info.then = branch2;
            info.negated = true;
            exit = BlockSet.singleton(branch1);
          } else {
            info.then = branch1;
            info.else = branch2;
            info.negated = false;
          }
        }

        return cx.update({ exit: exit });
      }

      function inducibleLookupSwitch(block, cx, info) {
        if (block.end.op !== OP_lookupswitch) {
          return null;
        }

        var cases = [];
        var targets = block.end.targets;
        var exit = new BlockSet();
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
            if (cexit.get(nextCase.bid)) {
              cases.unshift({ index: i, body: c, exit: BlockSet.singleton(nextCase) });
              cexit.clear(nextCase.bid);
            } else {
              cases.unshift({ index: i, body: c });
            }
            exit.union(cexit);
          } else {
            cases.unshift({ index: i, body: c });
            cexit && exit.union(cexit);
          }
        }

        info.cases = cases;
        exit.recount();
        exit = exit.count ? exit : null;

        return cx.update({ break: exit, exit: exit });
      }

      function maybeSequence(v) {
        if (v.length > 1) {
          return new Control.Seq(v.reverse());
        }
        return v[0];
      }

      function joinOf(cx, cxx) {
        if (cx.exit === cxx.exit) {
          return null;
        }
        return cxx.exit;
      }

      function labelOf(block) {
        if (block.loop) {
          var label = block.loop.head.toArray();
          if (label.length === 1) {
            return label[0];
          }
          return label;
        } else {
          return block.bid;
        }
      }

      var root = this.blocks[0];
      var conts = [];
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
      const K_LABEL_CASE = 8;
      const K_LABEL_SWITCH = 9;

      var loopBodyCx;
      for (;;) {
        var v = [];

        pushing:
        while (block) {
          if (block.count === 1) {
            block = block.choose();
          }

          if (block.count) {
            var blocks = block.members();
            if (loopBodyCx) {
              block = blocks.pop();
              conts.push({ kind: K_LABEL_CASE,
                           label: block.bid,
                           labelMap: {},
                           cases: [],
                           pendingCases: blocks,
                           loopBodyCx: loopBodyCx });
            } else {
              var loopMap = {};
              var entries = [];
              var exit = exitSet(blocks, cx);

              for (var i = 0, j = blocks.length; i < j; i++) {
                var b = blocks[i];
                if (exit && exit.get(b.bid)) {
                  continue;
                }

                if (b.loop) {
                  if (!(b.loop.id in loopMap)) {
                    loopMap[b.loop.id] = true;
                    entries.push(b);
                  }
                } else {
                  entries.push(b);
                }
              }

              block = entries.pop();
              cxx = cx.update({ exit: exit });
              conts.push({ kind: K_LABEL_CASE,
                           label: labelOf(block),
                           labelMap: {},
                           cases: [],
                           pendingCases: entries,
                           join: exit,
                           joinCx: cx,
                           cx: cxx });
              cx = cxx;
            }

            continue;
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
            var bbid = block.bid;

            if (cx.loop && cx.loop.exit.get(bbid)) {
              if (cx.break) {
                /*
                 * We are breaking out of a loop inside another break
                 * environment, like a switch, so we should break directly out
                 * of the loop.
                 */
                v.push(new Control.LongBreak(cx.loop));
              } else {
                v.push(Control.Break);
              }

              if (cx.loop.exit.count > 1) {
                v.push(new Control.SetLabel(block));
              }

              break;
            }

            if (cx.break && cx.break.get(bbid)) {
              v.push(Control.Break);
              if (cx.break.count > 1) {
                v.push(new Control.SetLabel(block));
              }
              break;
            }

            if (cx.exit && cx.exit.get(bbid)) {
              if (cx.exit.count > 1) {
                v.push(new Control.SetLabel(block));
              }
              break;
            }

            if (block.loop) {
              var loop = block.loop;
              if (loop === cx.loop) {
                v.push(Control.Continue);
                if (loop.head.count > 1) {
                  v.push(new Control.SetLabel(block));
                }
                break;
              }

              block = loop.head;
              loopBodyCx = cx.update({ loop: loop, exit: loop.head });
              conts.push({ kind: K_LOOP_BODY,
                           loop: loop,
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
                         join: joinOf(cx, cxx),
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
                             join: joinOf(cx, cxx),
                             joinCx: cx,
                             cx: cxx });
                block = c.body;
                cx = cxx.update({ exit: c.exit });
                break;
              }

              cases.push(new Control.Case(c.index));
            }
          } else if (block.succs.length <= 1) {
            conts.push({ kind: K_SEQ,
                         block: block });

            block = block.succs[0];
          } else {
            throw new Unanalyzable("has clusterfuck on " + block.bid);
          }
        }

        var k;
        popping:
        while (k = conts.pop()) {
          switch (k.kind) {
          case K_LOOP_BODY:
            var loop = k.loop;
            block = loop.exit;
            cx = k.cx;
            conts.push({ kind: K_LOOP,
                         loop: loop,
                         body: maybeSequence(v) });
            break popping;
          case K_LOOP:
            v.push(new Control.Loop(k.body, k.loop.needsLabel));
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
                cx = k.cx.update({ exit: c.exit });
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
            var c = new Control.LabelCase(k.label, maybeSequence(v));
            k.cases.push(c);
            if (k.label.length) {
              var label = k.label;
              for (var i = 0, j = label.length; i < j; i++) {
                k.labelMap[label[i]] = c;
              }
            } else {
              k.labelMap[k.label] = c;
            }

            block = k.pendingCases.pop();
            if (block) {
              if (k.loopBodyCx) {
                loopBodyCx = k.loopBodyCx;
                conts.push({ kind: K_LABEL_CASE,
                             label: block.bid,
                             labelMap: k.labelMap,
                             cases: k.cases,
                             pendingCases: k.pendingCases,
                             join: k.join,
                             joinCx: k.joinCx,
                             loopBodyCx: k.loopBodyCx });
              } else {
                cx = k.cx;
                conts.push({ kind: K_LABEL_CASE,
                             label: labelOf(block),
                             labelMap: k.labelMap,
                             cases: k.cases,
                             pendingCases: k.pendingCases,
                             join: k.join,
                             joinCx: k.joinCx,
                             cx: cx });
              }

              break popping;
            }

            block = k.join;
            cx = k.joinCx;
            conts.push({ kind: K_LABEL_SWITCH,
                         labelMap: k.labelMap,
                         cases: k.cases });
            break popping;
          case K_LABEL_SWITCH:
            k.cases.reverse();
            v.push(new Control.LabelSwitch(k.cases, k.labelMap));
            break;
          default:
            unexpected();
          }
        }

        if (conts.length === 0) {
          this.controlTree = maybeSequence(v);
          return;
        }
      }
    },

    massageControlTree: function massageControlTree() {
      function MassageContext() {
      }

      MassageContext.prototype = {
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

      function compact(a) {
        var k = 0;
        outer:
        for (var i = 0, j = a.length; i < j; i++) {
          while (!a[i]) {
            i++;
            if (i === j) {
              break outer;
            }
          }
          a[k++] = a[i];
        }
        a.length = k;
      }

      function addHoists(hoists, exit, breakTo, continueTo) {
        if (!exit || exit.kind !== Control.LABEL_SWITCH) {
          return;
        }

        exit.breakTo = breakTo;
        exit.continueTo = continueTo;

        var cases = exit.cases;
        for (var i = 0, j = cases.length; i < j; i++) {
          if (!cases[i].label.length) {
            var cf = exit.comeFroms[cases[i].label];
            if (cf.length === 1 && !cf.pendingHoist) {
              cf[0].labelSwitch = exit;
              cf[0].index = i;
              hoists.push(cf[0]);
              cf.pendingHoist = true;
            }
          }
        }
      }

      function transformTerminators(root, breakTo, continueTo) {
        if (root === Control.Break) {
          return new Control.LongBreak(breakTo);
        } else if (continueTo && root === Control.Continue) {
          return new Control.LongContinue(continueTo);
        }

        var worklist = [root];
        var node;

        /* It doesn't matter what order we iterate this in. */
        while (node = worklist.pop()) {
          switch (node.kind) {
          case Control.SEQ:
            var body = node.body;
            for (var i = 0, j = body.length; i < j; i++) {
              if (body[i] === Control.Break) {
                body[i] = new Control.LongBreak(breakTo);
              } else if (continueTo && body[i] === Control.Continue) {
                body[i] = new Control.LongContinue(continueTo);
              } else if (body[i].kind) {
                worklist.push(body[i]);
              }
            }
            break;

          case Control.LOOP:
            if (node.body === Control.Break) {
              node.body = new Control.LongBreak(breakTo);
            } else if (continueTo && node.body === Control.Continue) {
              node.body = new Control.LongContinue(continueTo);
            }
            worklist.push(node.body);
            break;

          case Control.IF:
            if (node.then) {
              if (node.then === Control.Break) {
                node.then = new Control.LongBreak(breakTo);
              } else if (continueTo && node.then === Control.Continue) {
                node.then = new Control.LongContinue(continueTo);
              } else {
                worklist.push(node.then);
              }
            }

            if (node.else) {
              if (node.else === Control.Break) {
                node.else = new Control.LongBreak(breakTo);
              } else if (continueTo && node.else === Control.Continue) {
                node.else = new Control.LongContinue(continueTo);
              } else {
                worklist.push(node.else);
              }
            }
            break;

          case Control.SWITCH:
          case Control.LABEL_SWITCH:
            var cases = node.cases;
            for (var i = 0, j = cases.length; i < j; i++) {
              if (cases[i].body === Control.Break) {
                cases[i].body = new Control.LongBreak(breakTo);
              } else if (continueTo && cases[i].body === Control.Continue) {
                cases[i].body = new Control.LongContinue(continueTo);
              } else {
                worklist.push(cases[i].body);
              }
            }
            break;
          }
        }

        return root;
      }

      function terminatesControl(block) {
        if (!block.end) {
          return false;
        }

        var op = block.end.op;
        return (op === OP_returnvoid ||
                op === OP_returnvalue ||
                op === OP_throw);
      }

      var worklist = [this.controlTree];
      var hoists = [];
      var cx = new MassageContext();
      var node, next;

      while (node = worklist.pop()) {
        if (!node.delay) {
          switch (node.kind) {
          case Control.SEQ:
            worklist.push({ delay: node });
            worklist.push.apply(worklist, node.body);
            next = null;
            break;

          case Control.LOOP:
            worklist.push({ delay: node, cx: cx });
            cx = cx.update({ break: next, breakTo: node, continueTo: node });
            if (node.body.kind === Control.LABEL_SWITCH) {
              worklist.push({ delay: node.body, cx: cx });
              worklist.push.apply(worklist, node.body.cases);
              cx = cx.update({ exit: node });
            } else {
              worklist.push(node.body);
            }
            next = null;
            break;

          case Control.IF:
            worklist.push({ delay: node, cx: cx });
            node.then && worklist.push(node.then);
            node.else && worklist.push(node.else);
            cx = cx.update({ exit: next });
            next = null;
            break;

          case Control.CASE:
            worklist.push({ delay: node });
            worklist.push(node.body);
            next = null;
            break;

          case Control.SWITCH:
            worklist.push({ delay: node, cx: cx });
            worklist.push.apply(worklist, node.cases);
            cx = cx.update({ break: next, breakTo: node });
            next = null;
            break;

          case Control.LABEL_CASE:
            worklist.push({ delay: node });
            node.body && worklist.push(node.body);
            next = null;
            break;

          case Control.LABEL_SWITCH:
            worklist.push({ delay: node, cx: cx });
            worklist.push.apply(worklist, node.cases);
            cx = cx.update({ exit: next });
            next = null;
            break;

          case Control.SET_LABEL:
            var precedesBreak = next === Control.Break;
            var exit = precedesBreak ? cx.break : cx.exit;

            if (exit && exit.kind === Control.LABEL_SWITCH) {
              if (!(node.label in exit.labelMap)) {
                node.prune = true;
              } else {
                node.maybeTransplant = true;
                exit.comeFroms[node.label].push({ setLabel: node,
                                                  precedesBreak: precedesBreak });
              }
            } else if (exit && exit.kind === Control.LOOP &&
                       exit.body.kind === Control.LABEL_SWITCH) {
              if (!(node.label in exit.body.labelMap)) {
                node.prune = true;
              }
            } else {
              node.prune = true;
            }

            next = node;
            break;

          default:
            next = node;
          }
        } else {
          var box = node;
          node = node.delay;
          next = node;

          switch (node.kind) {
          case Control.SEQ:
            var body = node.body;
            var allPruned = true;
            var shouldCompact = false;

            for (var i = 0, j = body.length; i < j; i++) {
              if (body[i].maybeTransplant) {
                body[i].maybeTransplantBase = body;
                body[i].maybeTransplantKey = i;
                allPruned = false;
              } else if (body[i].prune) {
                body[i] = undefined;
                shouldCompact = true;
              } else {
                allPruned = false;
              }
            }

            if (allPruned) {
              node.prune = true;
            } else if (shouldCompact) {
              compact(body);
            }
            break;

          case Control.LOOP:
            addHoists(hoists, cx.break, box.cx.breakTo, box.cx.continueTo);
            cx =  box.cx;
            break;

          case Control.IF:
            if (node.then && node.then.prune) {
              node.then = undefined;
            }

            if (!node.then) {
              node.negated = !node.negated;
              node.then = node.else;
              node.else = undefined;
            }

            if (!node.then) {
              node.prune = true;
            } else {
              if (node.then.maybeTransplant) {
                node.then.maybeTransplantBase = node;
                node.then.maybeTransplantKey = "then";
              }

              if (node.else) {
                if (node.else.maybeTransplant) {
                  node.else.maybeTransplantBase = node;
                  node.else.maybeTransplantKey = "else";
                } else if (node.else.prune) {
                  node.else = undefined;
                }
              }
            }

            addHoists(hoists, cx.exit);
            cx = box.cx;
            break;

          case Control.CASE:
            if (node.body.maybeTransplant) {
              node.body.maybeTransplantBase = node;
              node.body.maybeTransplantKey = "body";
            } else if (node.body.prune) {
              node.body = undefined;
            }

            /*
             * NB: DO NOT PRUNE EMPTY CASES! We need them for fallthrough.
             *
             * We never prune breaks, so |node.body| should always be defined if
             * there's a break.
             */
            break;

          case Control.SWITCH:
            addHoists(hoists, cx.break, box.cx.breakTo);
            cx = box.cx;
            break;

          case Control.LABEL_CASE:
            if (node.body) {
              if (node.body.maybeTransplant) {
                node.body.maybeTransplantBase = node;
                node.body.maybeTransplantKey = "body";
              } else if (node.body.prune) {
                node.body = undefined;
              }
            }

            if (!node.body) {
              node.prune = true;
            }
            break;

          case Control.LABEL_SWITCH:
            var cases = node.cases;
            var labelMap = node.labelMap;
            var comeFroms = {};
            var allPruned = true;
            var shouldCompact = false;

            for (var i = 0, j = cases.length; i < j; i++) {
              var c = cases[i];
              if (c.prune) {
                cases[i] = undefined;
                delete labelMap[c.label];
                shouldCompact = true;
              } else {
                allPruned = false;
              }

              if (c.label.length) {
                var label = c.label;
                for (var k = 0, l = label.length; k < l; k++) {
                  comeFroms[label[k]] = [];
                }
              } else {
                comeFroms[c.label] = [];
              }
            }

            node.comeFroms = comeFroms;

            if (allPruned) {
              node.prune = true;
            } else if (shouldCompact) {
              compact(cases);
            }

            addHoists(hoists, cx.exit);
            cx = box.cx;
            break;
          }
        }
      }

      /*
       * Hoist label cases up into their environments, outermost first in
       * nesting order.
       */
      if (hoists.length > 0) {
        for (var i = hoists.length - 1; i >= 0; i--) {
          var hoist = hoists[i];
          var ls = hoist.labelSwitch;
          var c = ls.cases[hoist.index];
          var transplant = c.body;
          var transplantBase = hoist.setLabel.maybeTransplantBase;
          var transplantKey = hoist.setLabel.maybeTransplantKey;

          if (ls.breakTo) {
            transplant = transformTerminators(transplant,
                                              ls.breakTo, ls.continueTo);
          }

          if (transplant.kind === Control.SEQ) {
            var tbody = transplant.body;
            var tend = tbody.top();

            if (transplantBase.length) {
              hoist.precedesBreak && transplantBase.pop();
              transplantBase.pop();

              /* Append the transplant body if it's already a sequence. */
              transplantBase.push.apply(transplantBase, tbody);

              /*
               * If we hoist something that terminates control or breaks out to an
               * outer loop, pop the break.
               */
              if (tend && (tend.kind !== Control.LONG_BREAK &&
                           tend.kind !== Control.LONG_CONTINUE &&
                           !terminatesControl(tend)) &&
                  hoist.precedesBreak) {
                transplantBase.push(Control.Break);
              }
            } else {
              transplantBase[transplantKey] = transplant;
            }
          } else {
            transplantBase[transplantKey] = transplant;
            if (hoist.precedesBreak &&
                (transplant.kind === Control.LONG_BREAK ||
                 transplant.kind === Control.LONG_CONTINUE ||
                 terminatesControl(transplant))) {
              transplantBase.pop();
            }
          }

          ls.cases[hoist.index] = undefined;
          ls.shouldCompact = true;
        }

        for (var i = hoists.length - 1; i >= 0; i--) {
          var ls = hoists[i].labelSwitch;
          if (ls.shouldCompact) {
            compact(ls.cases);
            delete ls.shouldCompact;
          }
        }
      }
    },

    restructureControlFlow: function restructureControlFlow() {
      if (!this.ranMarkLoops) {
        this.markLoops();
      }

      this.induceControlTree();
      if (this.options.massage) {
        this.massageControlTree();
      }
    },

    /*
     * Prints a normalized bytecode along with metainfo.
     */
    trace: function (writer) {
      function bid(node) {
        return node.bid;
      }

      function traceBlock(block) {
        if (!block.dominator) {
          writer.enter("block unreachable {");
        } else {
          writer.enter("block " + block.bid +
                       (block.succs.length > 0 ? " -> " +
                        block.succs.map(bid).join(",") : "") + " {");

          writer.writeLn("preds".padRight(' ', 10) + block.preds.map(bid).join(","));
          writer.writeLn("idom".padRight(' ', 10) + block.dominator.bid);
          writer.writeLn("domcs".padRight(' ', 10) + block.dominatees.map(bid).join(","));
          writer.writeLn("frontier".padRight(' ', 10) + "{" + block.frontier.toArray().join(",") + "}");
          writer.writeLn("level".padRight(' ', 10) + block.level);
        }

        if (block.loop) {
          writer.writeLn("loop".padRight(' ', 10) + "{" + block.loop.body.toArray().join(",") + "}");
          writer.writeLn("  id".padRight(' ', 10) + block.loop.id);
          writer.writeLn("  head".padRight(' ', 10) + "{" + block.loop.head.toArray().join(",") + "}");
          writer.writeLn("  exit".padRight(' ', 10) + "{" + block.loop.exit.toArray().join(",") + "}");
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
                             style: "style=dashed" },
                           { fn:
                             function (n) {
                               var crosses = new this.BlockSet();
                               crosses.setBlocks(n.succs);
                               crosses.subtract(this.BlockSet.fromBlocks(n.dominatees));
                               n.spbacks && crosses.subtract(n.spbacks);
                               return crosses.members();
                             },
                             style: "" },
                           { fn: function (n) { return n.spbacks ? n.spbacks.members() : []; },
                             style: "style=bold" }],
                          [{ fn: function (n) { return n.preds || []; },
                             style: "" }],
                          function (idFn, writer) {
                            var root = this.bytecodes[0];
                            var worklist = [root];
                            var n;
                            var level = root.level;
                            var currentLevel = [];
                            while (n = worklist.shift()) {
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
        return prefix + n.bid;
      }

      var analysis = this;
      function bindToThis(x) {
        x.fn = x.fn.bind(analysis);
      }

      prefix = prefix || "";
      var bytecodes = this.bytecodes;
      if (!bytecodes) {
        return;
      }

      succFns.forEach(bindToThis);
      predFns.forEach(bindToThis);

      writeGraphViz(writer, name.toString(), bytecodes[0], idFn,
                    function (n) { return n.succs || []; },
                    succFns, predFns,
                    function (n) {
                      var str = "Block: " + n.bid + "\\l";
                      /*
                      for (var bci = n.position; bci <= n.end.position; bci++) {
                        str += bci + ": " + bytecodes[bci] + "\\l";
                      }
                      */
                      return str;
                    },
                    postHook && postHook.bind(this, idFn));
    }
  }

  return Analysis;

})();