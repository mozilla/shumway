var Control = (function () {

  const SEQ = 1;
  const LOOP = 2;
  const IF = 3;
  const CASE = 4;
  const SWITCH = 5;
  const LABEL_CASE = 6;
  const LABEL_SWITCH = 7;
  const EXIT = 8;
  const BREAK = 9;
  const CONTINUE = 10;

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

  function Loop(body) {
    this.kind = LOOP;
    this.body = body;
  }

  Loop.prototype = {
    trace: function (writer) {
      writer.enter("loop {");
      this.body.trace(writer);
      writer.leave("}");
    }
  };

  function If(cond, then, els) {
    this.kind = IF;
    this.cond = cond;
    this.then = then;
    this.else = els;
    this.negated = false;
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
      this.determinant.trace(writer);
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

  function LabelSwitch(cases) {
    var labelMap = {};

    for (var i = 0, j = cases.length; i < j; i++) {
      var c = cases[i];
      if (c.label.length) {
        for (var k = 0, l = c.label.length; k < l; k++) {
          labelMap[c.label[k]] = c;
        }
      } else {
        labelMap[c.label] = c;
      }
    }

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

  function Exit(label) {
    this.kind = EXIT;
    this.label = label;
  }

  Exit.prototype = {
    trace: function (writer) {
      writer.writeLn("label = " + this.label);
    }
  };

  function Break(label, head) {
    this.kind = BREAK;
    this.label = label;
    this.head = head;
  }

  Break.prototype = {
    trace: function (writer) {
      this.label && writer.writeLn("label = " + this.label);
      writer.writeLn("break");
    }
  };

  function Continue(label, head) {
    this.kind = CONTINUE;
    this.label = label;
    this.head = head;
    this.necessary = true;
  }

  Continue.prototype = {
    trace: function (writer) {
      this.label && writer.writeLn("label = " + this.label);
      this.necessary && writer.writeLn("continue");
    }
  };

  return {
    SEQ: SEQ,
    LOOP: LOOP,
    IF: IF,
    CASE: CASE,
    SWITCH: SWITCH,
    LABEL_CASE: LABEL_CASE,
    LABEL_SWITCH: LABEL_SWITCH,
    EXIT: EXIT,
    BREAK: BREAK,
    CONTINUE: CONTINUE,

    Seq: Seq,
    Loop: Loop,
    If: If,
    Case: Case,
    Switch: Switch,
    LabelCase: LabelCase,
    LabelSwitch: LabelSwitch,
    Exit: Exit,
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
          this[operand.name] = code.readS16();
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

    if (BlockSet.singleword) {
      Bsp.forEachBlock = function forEach(fn) {
        assert (fn);
        var byId = blockById;
        var word = this.bits;
        if (word) {
          for (var k = 0; k < BITS_PER_WORD; k++) {
            if (word & (1 << k)) {
              fn(byId[k]);
            }
          }
        }
      },

      Bsp.choose = function choose() {
        var byId = blockById;
        var word = this.bits;
        if (word) {
          for (var k = 0; k < BITS_PER_WORD; k++) {
            if (word & (1 << k)) {
              return byId[k];
            }
          }
        }
      };

      Bsp.members = function members() {
        var byId = blockById;
        var set = [];
        var word = this.bits;
        if (word) {
          for (var k = 0; k < BITS_PER_WORD; k++) {
            if (word & (1 << k)) {
              set.push(byId[k]);
            }
          }
        }
        return set;
      };

      Bsp.setBlocks = function setBlocks(bs) {
        var bits = this.bits;
        for (var i = 0, j = bs.length; i < j; i++) {
          var id = bs[i].bid;
          bits |= 1 << (id & BIT_INDEX_MASK);
        }
        this.bits = bits;
      };
    } else {
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
    }

    return BlockSet;
  }

  function Analysis(method, options) {
    /**
     * Normalize the code stream. The other analyses are run by the user
     * on demand.
     */
    this.method = method;
    this.options = options || {};
    if (this.method.code) {
      this.normalizeBytecode();
    }
  }

  Analysis.prototype = {
    normalizeBytecode: function normalizeBytecode() {
      /**
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
      var newOffset;
      for (var pc = 0, end = bytecodes.length; pc < end; pc++) {
        code = bytecodes[pc];
        switch (code.op) {
        case OP_lookupswitch:
          var offsets = code.offsets;
          for (var i = 0, j = offsets.length; i < j; i++) {
            newOffset = bytecodesOffset[offsets[i]];
            code.targets.push(bytecodes[newOffset] ||
                              getInvalidTarget(invalidJumps, offsets[i]));
            offsets[i] = newOffset;
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
          newOffset = bytecodesOffset[code.offset];
          code.target = (bytecodes[newOffset] ||
                         getInvalidTarget(invalidJumps, code.offset));
          code.offset = newOffset;
          break;

        default:;
        }
      }

      this.bytecodes = bytecodes;

      /**
       * Normalize exceptions table to use new offsets.
       */
      var exceptions = this.method.exceptions;
      for (var i = 0, j = exceptions.length; i < j; i++) {
        var ex = exceptions[i];
        ex.start = bytecodesOffset[ex.start];
        ex.end = bytecodesOffset[ex.end];
        ex.offset = bytecodesOffset[ex.target];
        ex.target = bytecodes[ex.offset];
      }
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

    /**
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

      blocks[0].dominator = blocks[0];
      for (var b = 1; b < n; b++) {
        var block = blocks[b];
        var idom = blocks[doms[b]];

        /* Store the immediate dominator. */
        block.dominator = idom;
        idom.dominatees.push(block);

        block.npreds = block.preds.length;
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
      const BlockSet = this.BlockSet;
      var blocks = this.blocks;

      for (var b = 0, n = blocks.length; b < n; b++) {
        blocks[b].frontier = new BlockSet();
      }

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
        return false;
      }

      assert(this.bytecodes);
      this.detectBasicBlocks();
      this.normalizeReachableBlocks();
      this.computeDominance();
      //this.computeFrontiers();

      this.analyzedControlFlow = true;
      return true;
    },

    markLoops: function markLoops() {
      if (!this.analyzedControlFlow && !this.analyzeControlFlow()) {
        return false;
      }

      const BlockSet = this.BlockSet;

      /**
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
        body.recount();

        this.id = loopId;
        this.body = body;
        this.exit = new BlockSet();
        this.save = {};
        this.head = new BlockSet();
        this.npreds = 0;
      }

      var heads = findLoopHeads(this.blocks);
      if (heads.length <= 0) {
        this.markedLoops = true;
        return true;
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
            var h = scc[k];
            if (h.level === top.level + 1 && !h.loop) {
              h.loop = loop;
              loop.head.set(h.bid);

              var preds = h.preds;
              for (var pi = 0, pj = preds.length; pi < pj; pi++) {
                loop.body.get(preds[pi].bid) && h.npreds--;
              }
              loop.npreds += h.npreds;
            }
          }

          for (var k = 0, l = scc.length; k < l; k++) {
            var h = scc[k];
            if (h.level === top.level + 1) {
              h.npreds = loop.npreds;
            }
          }

          loop.head.recount();
        }
      }

      this.markedLoops = true;
      return true;
    },

    induceControlTree: function induceControlTree() {
      const BlockSet = this.BlockSet;

      function maybe(exit, save) {
        exit.recount();
        if (exit.count === 0) {
          return null;
        }
        exit.save = save;
        return exit;
      }

      function induce(head, exit, save,
                      loop, inLoopHead,
                      lookupSwitch, fallthrough) {
        var v = [];

        while (head) {
          if (head.count > 1) {
            var exit2 = new BlockSet();
            var save2 = {};

            var cases = [];
            var heads = head.members();

            for (var i = 0, j = heads.length; i < j; i++) {
              var h = heads[i];
              var bid = h.bid;
              var c;

              if (h.loop && head.contains(h.loop.head)) {
                var loop2 = h.loop;
                if (!loop2.induced) {
                  var lheads = loop2.head.members();
                  var lheadsave = 0;

                  for (k = 0, l = lheads.length; k < l; k++) {
                    lheadsave += head.save[lheads[k].bid];
                  }

                  if (h.npreds - lheadsave > 0) {
                    /**
                     * Don't even enter the loop if we're just going to exit
                     * anyways.
                     */
                    h.npreds -= head.save[bid];
                    h.save = head.save[bid];
                    c = induce(h, exit2, save2, loop);
                    cases.push(new Control.LabelCase(bid, c));
                  } else {
                    for (k = 0, l = lheads.length; k < l; k++) {
                      var lh = lheads[k];
                      var lbid = lh.bid;
                      lh.npreds -= lheadsave;
                      lh.save = lheadsave;
                    }
                    c = induce(h, exit2, save2, loop);
                    cases.push(new Control.LabelCase(loop2.head.toArray(), c));
                    loop2.induced = true;
                  }
                }
              } else {
                h.npreds -= head.save[bid];
                h.save = head.save[bid];
                c = induce(h, exit2, save2, loop);
                cases.push(new Control.LabelCase(bid, c));
              }
            }

            var k = 0;
            for (var i = 0, j = cases.length; i < j; i++) {
              var c = cases[i];
              var bid = c.label;
              if (exit2.get(bid) && heads[i].npreds - save2[bid] > 0) {
                save[bid] = (save[bid] || 0) + head.save[bid];
                exit.set(bid);
              } else {
                cases[k++] = c;
              }
            }
            cases.length = k;

            if (cases.length === 0) {
              break;
            }

            v.push(new Control.LabelSwitch(cases));

            head = maybe(exit2, save2);
            continue;
          }

          var h, bid;
          if (head.count === 1) {
            h = head.choose();
            bid = h.bid;
            h.npreds -= head.save[bid];
            h.save = head.save[bid];
          } else {
            h = head;
            bid = h.bid;
          }

          if (inLoopHead) {
            inLoopHead = false;
          } else {
            if (loop && !loop.body.get(bid)) {
              h.npreds += h.save;
              loop.exit.set(bid);
              loop.save[bid] = (loop.save[bid] || 0) + h.save;
              v.push(new Control.Break(bid, loop));
              break;
            }

            if (loop && h.loop === loop) {
              h.npreds += h.save;
              v.push(new Control.Continue(bid, loop));
              break;
            }

            if (h === fallthrough) {
              break;
            }

            if (h.npreds > 0) {
              h.npreds += h.save;
              save[bid] = (save[bid] || 0) + h.save;
              exit.set(bid);
              v.push(lookupSwitch ?
                     new Control.Break(bid, lookupSwitch) :
                     new Control.Exit(bid));
              break;
            }

            if (h.loop) {
              var l = h.loop;

              var body;
              if (l.head.count === 1) {
                body = induce(l.head.choose(), null, null, l, true);
              } else {
                var lcases = [];
                var lheads = l.head.members();

                for (var i = 0, j = lheads.length; i < j; i++) {
                  var lh = lheads[i];
                  var lbid = lh.bid;
                  var c = induce(lh, null, null, l, true);
                  lcases.push(new Control.LabelCase(lbid, c));
                }

                body = new Control.LabelSwitch(lcases);
              }

              v.push(new Control.Loop(body));
              head = maybe(l.exit, l.save);
              continue;
            }
          }

          var succs = h.succs;
          if (h.end.op === OP_lookupswitch) {
            var exit2 = new BlockSet();
            var save2 = {};

            var cases = [];
            var targets = h.end.targets;

            for (var i = targets.length - 1; i >= 0; i--) {
              var t = targets[i];
              t.npreds -= 1;
              t.save = 1;
              var c = induce(t, exit2, save2, loop, null, h, targets[i + 1]);
              cases.unshift(new Control.Case(i, c));
            }

            /* The last case is the default case. */
            cases.top().index = undefined;

            v.push(new Control.Switch(h, cases));
            head = maybe(exit2, save2);
          } else if (succs.length === 2) {
            var exit2 = new BlockSet();
            var save2 = {};

            var branch1 = succs[0];
            var branch2 = succs[1];

            branch1.npreds -= 1;
            branch1.save = 1;
            var c1 = induce(branch1, exit2, save2, loop);

            branch2.npreds -= 1;
            branch2.save = 1;
            var c2 = induce(branch2, exit2, save2, loop);

            v.push(new Control.If(h, c1, c2));
            head = maybe(exit2, save2);
          } else {
            v.push(h);
            head = succs[0];
            if (head) {
              head.npreds -= 1;
              head.save = 1;
            }
          }
        }

        if (v.length > 1) {
          return new Control.Seq(v);
        }

        return v[0];
      }

      var root = this.blocks[0];
      this.controlTree = induce(root, new BlockSet(), {});
    },

    massageControlTree: function massageControlTree() {
      function massage(node, exit, cont, br) {
        switch (node.kind) {
        case Control.SEQ:
          var body = node.body;
          for (var i = body.length - 1; i >= 0; i--) {
            body[i] = massage(body[i], body[i + 1] || exit, cont, br);
          }

          var k = 0;
          for (var i = 0, j = body.length; i < j; i++) {
            if (body[i]) {
              body[k++] = body[i];
            }
          }
          body.length = k;
          return k ? node : null;

        case Control.LOOP:
          node.body = massage(node.body, null, node.body, exit);
          return node;

        case Control.IF:
          node.then = massage(node.then, exit, cont, br);
          node.else = massage(node.else, exit, cont, br);

          if (!node.then) {
            node.then = node.else;
            node.else = null;
            node.negated = true;
          }
          return node.then ? node : null;

        case Control.SWITCH:
          var cases = node.cases;
          for (var i = 0, j = cases.length; i < j; i++) {
            var c = cases[i];
            if (c.body) {
              c.body = massage(c.body, exit, cont, br);
            }
          }
          return node;

        case Control.LABEL_SWITCH:
          var labelMap = node.labelMap;
          var cases = node.cases;
          var c, body;
          var k = 0;
          for (var i = 0, j = cases.length; i < j; i++) {
            c = cases[i];
            if (body = massage(c.body, exit, cont, br)) {
              c.body = body;
              cases[k++] = c;
            } else {
              var label = c.label;
              if (label.length) {
                for (var n = 0, m = label.length; n < m; n++) {
                  delete labelMap[label[n]];
                }
              } else {
                delete labelMap[label];
              }
            }
          }
          cases.length = k;
          return k ? node : null;

        case Control.EXIT:
          if (exit && exit.kind === Control.LABEL_SWITCH) {
            if (!(node.label in exit.labelMap)) {
              node.label = -1;
            }
            return node;
          }
          return null;

        case Control.BREAK:
          if (br && br.kind === Control.LABEL_SWITCH) {
            if (!(node.label in br.labelMap)) {
              node.label = -1;
            }
          } else {
            delete node.label;
          }
          return node;

        case Control.CONTINUE:
          if (cont && cont.kind === Control.LABEL_SWITCH) {
            if (!(node.label in cont.labelMap)) {
              node.label = -1;
            }
          } else {
            delete node.label;
          }
          node.necessary = !!exit;
          return (node.necessary || node.label) ? node : null;

        default:
          return node;
        }
      }

      this.controlTree = massage(this.controlTree);
    },

    restructureControlFlow: function restructureControlFlow() {
      if (!this.markedLoops && !this.markLoops()) {
        return false;
      }

      this.induceControlTree();
      if (this.options.massage) {
        this.massageControlTree();
      }

      this.restructuredControlFlow = true;
      return true;
    },

    /**
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

          writer.writeLn("npreds".padRight(' ', 10) + block.npreds);
          writer.writeLn("idom".padRight(' ', 10) + block.dominator.bid);
          writer.writeLn("domcs".padRight(' ', 10) + block.dominatees.map(bid).join(","));
          if (block.frontier) {
            writer.writeLn("frontier".padRight(' ', 10) + "{" + block.frontier.toArray().join(",") + "}");
          }
          writer.writeLn("level".padRight(' ', 10) + block.level);
        }

        if (block.loop) {
          writer.writeLn("loop".padRight(' ', 10) + "{" + block.loop.body.toArray().join(",") + "}");
          writer.writeLn("  id".padRight(' ', 10) + block.loop.id);
          writer.writeLn("  head".padRight(' ', 10) + "{" + block.loop.head.toArray().join(",") + "}");
          writer.writeLn("  exit".padRight(' ', 10) + "{" + block.loop.exit.toArray().join(",") + "}");
          writer.writeLn("  npreds".padRight(' ', 10) + block.loop.npreds);
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
