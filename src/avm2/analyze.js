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
  const TRY = 11;
  const CATCH = 12;

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

  function If(cond, then, els, nothingThrownLabel) {
    this.kind = IF;
    this.cond = cond;
    this.then = then;
    this.else = els;
    this.negated = false;
    this.nothingThrownLabel = nothingThrownLabel;
  }

  If.prototype = {
    trace: function (writer) {
      this.cond.trace(writer);
      if (this.nothingThrownLabel) {
        writer.enter("if (label is " + this.nothingThrownLabel + ") {");
      }
      writer.enter("if" + (this.negated ? " not" : "") + " {");
      this.then && this.then.trace(writer);
      if (this.else) {
        writer.outdent();
        writer.enter("} else {");
        this.else.trace(writer);
      }
      writer.leave("}");
      if (this.nothingThrownLabel) {
        writer.leave("}");
      }
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

  function Switch(determinant, cases, nothingThrownLabel) {
    this.kind = SWITCH;
    this.determinant = determinant;
    this.cases = cases;
    this.nothingThrownLabel = nothingThrownLabel;
  }

  Switch.prototype = {
    trace: function (writer) {
      if (this.nothingThrownLabel) {
        writer.enter("if (label is " + this.nothingThrownLabel + ") {");
      }
      this.determinant.trace(writer);
      writer.writeLn("switch {");
      for (var i = 0, j = this.cases.length; i < j; i++) {
        this.cases[i].trace(writer);
      }
      writer.writeLn("}");
      if (this.nothingThrownLabel) {
        writer.leave("}");
      }
    }
  };

  function LabelCase(labels, body) {
    this.kind = LABEL_CASE;
    this.labels = labels;
    this.body = body;
  }

  LabelCase.prototype = {
    trace: function (writer) {
      writer.enter("if (label is " + this.labels.join(" or ") + ") {");
      this.body && this.body.trace(writer);
      writer.leave("}");
    }
  };

  function LabelSwitch(cases) {
    var labelMap = {};

    for (var i = 0, j = cases.length; i < j; i++) {
      var c = cases[i];
      if (!c.labels) {
        print(c.toSource());
      }
      for (var k = 0, l = c.labels.length; k < l; k++) {
        labelMap[c.labels[k]] = c;
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

  function Try(body, catches) {
    this.kind = TRY;
    this.body = body;
    this.catches = catches;
  }

  Try.prototype = {
    trace: function (writer) {
      writer.enter("try {");
      this.body.trace(writer);
      writer.writeLn("label = " + this.nothingThrownLabel);
      for (var i = 0, j = this.catches.length; i < j; i++) {
        this.catches[i].trace(writer);
      }
      writer.leave("}");
    }
  };

  function Catch(varName, typeName, body) {
    this.kind = CATCH;
    this.varName = varName;
    this.typeName = typeName;
    this.body = body;
  }

  Catch.prototype = {
    trace: function (writer) {
      writer.outdent();
      writer.enter("} catch (" + (this.varName || "e") +
                   (this.typeName ? (" : " + this.typeName) : "") + ") {");
      this.body.trace(writer);
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
    TRY: TRY,
    CATCH: CATCH,

    Seq: Seq,
    Loop: Loop,
    If: If,
    Case: Case,
    Switch: Switch,
    LabelCase: LabelCase,
    LabelSwitch: LabelSwitch,
    Exit: Exit,
    Break: Break,
    Continue: Continue,
    Try: Try,
    Catch: Catch
  };

})();

var Bytecode = (function () {

  function Bytecode(code) {
    var op = code.readU8();
    this.op = op;
    this.originalPosition = code.position;

    var opdesc = opcodeTable[op];
    if (!opdesc) {
      unexpected("Unknown Op " + op);
    }

    this.canThrow = opdesc.canThrow;

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

      // CFG edges.
      this.succs = [];
      this.preds = [];

      // Dominance relation edges.
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
    // Normalize the code stream. The other analyses are run by the user
    // on demand.
    this.method = method;
    this.options = options || {};
    if (this.method.code) {
      this.normalizeBytecode();
    }
  }

  Analysis.prototype = {
    normalizeBytecode: function normalizeBytecode() {
      // Internal bytecode used for bogus jumps. They should be emitted as throws
      // so that if control flow ever reaches them, we crash.
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

      // This array is sparse, indexed by offset.
      var bytecodesOffset = [];
      // This array is dense.
      var bytecodes = [];
      var codeStream = new AbcStream(this.method.code);
      var code;

      while (codeStream.remaining() > 0) {
        var pos = codeStream.position;
        code = new Bytecode(codeStream);

        // Get absolute offsets for normalization to new indices below.
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

        // Cache the position in the bytecode array.
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

      // Normalize exceptions table to use new offsets.
      var exceptions = this.method.exceptions;
      for (var i = 0, j = exceptions.length; i < j; i++) {
        var ex = exceptions[i];
        ex.start = bytecodesOffset[ex.start];
        ex.end = bytecodesOffset[ex.end];
        ex.offset = bytecodesOffset[ex.target];
        ex.target = bytecodes[ex.offset];
        ex.target.exception = ex;
      }
    },

    detectBasicBlocks: function detectBasicBlocks() {
      var bytecodes = this.bytecodes;
      var exceptions = this.method.exceptions;
      var hasExceptions = exceptions.length > 0;
      var blockById = {};
      var code;
      var pc, end;
      var id = 0;

      function tryTargets(block) {
        var targets = [];
        for (var i = 0, j = exceptions.length; i < j; i++) {
          var ex = exceptions[i];
          if (block.position >= ex.start && block.end.position <= ex.end) {
            targets.push(ex.target);
          }
        }
        return targets;
      }

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

      // Mark exceptions.
      if (hasExceptions) {
        for (var i = 0, j = exceptions.length; i < j; i++) {
          var ex = exceptions[i];
          var tryStart = bytecodes[ex.start];
          var afterTry = bytecodes[ex.end + 1];

          id = tryStart.makeBlockHead(id);
          if (afterTry) {
            id = afterTry.makeBlockHead(id);
          }
          id = ex.target.makeBlockHead(id);
        }
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

        if (hasExceptions) {
          var targets = tryTargets(currentBlock);
          currentBlock.hasCatches = targets.length > 0;
          currentBlock.succs.push.apply(currentBlock.succs, targets);
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

      // The root must not have preds!
      assert(root.preds.length === 0);

      const ONCE = 1;
      const BUNCH_OF_TIMES = 2;
      const BlockSet = this.BlockSet;

      var blocks = [];
      var visited = {};
      var ancestors = {};
      var worklist = [root];
      var node;

      ancestors[root.bid] = true;
      while (node = worklist.top()) {
        if (visited[node.bid]) {
          if (visited[node.bid] === ONCE) {
            visited[node.bid] = BUNCH_OF_TIMES;
            blocks.push(node);

            // Doubly link reachable blocks.
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

    //
    // Calculate the dominance relation iteratively.
    //
    // Algorithm is from [1].
    //
    // [1] Cooper et al. "A Simple, Fast Dominance Algorithm"
    //
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

      // Blocks must be given to us in reverse postorder.
      var rpo = {};
      for (var b = 0; b < n; b++) {
        rpo[blocks[b].bid] = b;
      }

      var changed = true;
      while (changed) {
        changed = false;

        // Iterate all blocks but the starting block.
        for (var b = 1; b < n; b++) {
          var preds = blocks[b].preds;
          var j = preds.length;

          var newIdom = rpo[preds[0].bid];
          // Because 0 is falsy, have to use |in| here.
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

        // Store the immediate dominator.
        block.dominator = idom;
        idom.dominatees.push(block);

        block.npreds = block.preds.length;
      }

      // Assign dominator tree levels.
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

      //
      // Find all SCCs at or below the level of some root that are not already
      // natural loops.
      //
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
      const hasExceptions = this.method.exceptions.length > 0;
      const BlockSet = this.BlockSet;

      function maybe(exit, save) {
        exit.recount();
        if (exit.count === 0) {
          return null;
        }
        exit.save = save;
        return exit;
      }

      var exceptionId = this.blocks.length;

      //
      // Based on emscripten's relooper algorithm.
      // The algorithm is O(|E|) -- it visits every edge in the CFG once.
      //
      // Loop header detection is done separately, using an overlaid DJ graph.
      //
      // For a vertex v, let succ(v) denote its non-exceptional successors.
      //
      // Basic blocks can be restructured into 4 types of nodes:
      //
      //  1. Switch. |succ(v) > 2|
      //  2. If.     |succ(v) = 2|
      //  3. Plain.  |succ(v) = 1|
      //  4. Loop.   marked as a loop header.
      //
      // The idea is fairly simple: start at a set of heads, induce all its
      // successors recursively in that head's context, discharging the edges
      // that we take. If a vertex no longer has any incoming edges when we
      // visit it, emit the vertex, else emit a label marking that we need to
      // go to that vertex and mark that vertex as an exit in the current
      // context.
      //
      // The algorithm starts at the root, the first instruction.
      //
      // Exceptions are restructured via rewriting. AVM bytecode stores try
      // blocks as a range of bytecode positions. Our basic blocks respects
      // these range boundaries. Each basic block which is in one or more of
      // such exception ranges have exceptional successors (jumps) to all
      // matching catch blocks. We then restructure the entire basic block as
      // a try and have the restructuring take care of the jumps to the actual
      // catch blocks. Finally blocks fall out naturally, but are not emitted
      // as JavaScript |finally|.
      //
      // Implementation Notes
      // --------------------
      //
      // We discharge edges by keeping a property |npreds| on each block that
      // says how many incoming edges we have _not yet_ discharged. We
      // discharge edges as we recur on the tree, but in case we can't emit a
      // block (i.e. its |npreds| > 0), we need to restore its |npreds| before
      // we pop out. We do this via a |save| proeprty on each block that says
      // how many predecessors we should restore.
      //
      // |exit| is the set of exits in the current context, i.e. the set of
      // vertices that we visited but have not yet discharged every incoming
      // edge.
      //
      // |save| is a mapping of block id -> save numbers.
      //
      // When setting an exit in the exit set, the save number must be set for
      // it also in the save set.
      //
      function induce(head, exit, save, loop, inLoopHead, lookupSwitch, fallthrough) {
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
                    // Don't even enter the loop if we're just going to exit
                    // anyways.
                    h.npreds -= head.save[bid];
                    h.save = head.save[bid];
                    c = induce(h, exit2, save2, loop);
                    cases.push(new Control.LabelCase([bid], c));
                  } else {
                    for (k = 0, l = lheads.length; k < l; k++) {
                      var lh = lheads[k];
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
                cases.push(new Control.LabelCase([bid], c));
              }
            }

            var pruned = [];
            var k = 0;
            for (var i = 0, j = cases.length; i < j; i++) {
              var c = cases[i];
              var labels = c.labels;
              var lk = 0;
              for (var ln = 0, nlabels = labels.length; ln < nlabels; ln++) {
                var bid = labels[ln];
                if (exit2.get(bid) && heads[i].npreds - head.save[bid] > 0) {
                  pruned.push(bid);
                } else {
                  labels[lk++] = bid;
                }
              }
              labels.length = lk;

              // Prune the case unless it still has some entry labels.
              if (labels.length > 0) {
                cases[k++] = c;
              }
            }
            cases.length = k;

            if (cases.length === 0) {
              for (var i = 0, j = pruned.length; i < j; i++) {
                var bid = pruned[i];
                save[bid] = (save[bid] || 0) + head.save[bid];
                exit.set(bid);
              }
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
                  lcases.push(new Control.LabelCase([lbid], c));
                }

                body = new Control.LabelSwitch(lcases);
              }

              v.push(new Control.Loop(body));
              head = maybe(l.exit, l.save);
              continue;
            }
          }

          var sv;
          var succs;
          var exit2 = new BlockSet();
          var save2 = {};

          if (hasExceptions && h.hasCatches) {
            var allSuccs = h.succs;
            var catchSuccs = [];
            succs = [];

            for (var i = 0, j = allSuccs.length; i < j; i++) {
              var s = allSuccs[i];
              (s.exception ? catchSuccs : succs).push(s);
            }

            var catches = [];
            for (var i = 0, j = catchSuccs.length; i < j; i++) {
              var t = catchSuccs[i];
              t.npreds -= 1;
              t.save = 1;
              var c = induce(t, exit2, save2, loop);
              var ex = t.exception;
              catches.push(new Control.Catch(ex.varName, ex.typeName, c));
            }

            sv = new Control.Try(h, catches);
          } else {
            succs = h.succs;
            sv = h;
          }

          if (h.end.op === OP_lookupswitch) {
            var cases = [];
            var targets = h.end.targets;

            for (var i = targets.length - 1; i >= 0; i--) {
              var t = targets[i];
              t.npreds -= 1;
              t.save = 1;
              var c = induce(t, exit2, save2, loop, null, h, targets[i + 1]);
              cases.unshift(new Control.Case(i, c));
            }

            // The last case is the default case.
            cases.top().index = undefined;

            if (hasExceptions && h.hasCatches) {
              sv.nothingThrownLabel = exceptionId;
              sv = new Control.Switch(sv, cases, exceptionId++);
            } else {
              sv = new Control.Switch(sv, cases);
            }

            head = maybe(exit2, save2);
          } else if (succs.length === 2) {
            var branch1 = succs[0];
            var branch2 = succs[1];

            branch1.npreds -= 1;
            branch1.save = 1;
            var c1 = induce(branch1, exit2, save2, loop);

            branch2.npreds -= 1;
            branch2.save = 1;
            var c2 = induce(branch2, exit2, save2, loop);

            if (hasExceptions && h.hasCatches) {
              sv.nothingThrownLabel = exceptionId;
              sv = new Control.If(sv, c1, c2, exceptionId++);
            } else {
              sv = new Control.If(sv, c1, c2);
            }

            head = maybe(exit2, save2);
          } else {
            c = succs[0];

            if (c) {
              if (hasExceptions && h.hasCatches) {
                sv.nothingThrownLabel = c.bid;
                save2[c.bid] = (save2[c.bid] || 0) + 1;
                exit2.set(c.bid);

                head = maybe(exit2, save2);
              } else {
                c.npreds -= 1;
                c.save = 1;
                head = c;
              }
            } else {
              if (hasExceptions && h.hasCatches) {
                sv.nothingThrownLabel = -1;
                head = maybe(exit2, save2);
              } else {
                head = c;
              }
            }
          }

          v.push(sv);
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
              var labels = c.labels;
              for (var n = 0, m = labels.length; n < m; n++) {
                delete labelMap[labels[n]];
              }
            }
          }
          cases.length = k;
          return k ? node : null;

        case Control.EXIT:
          if (exit && exit.kind === Control.LABEL_SWITCH) {
            if (!(node.label in exit.labelMap)) {
              // -1 is a sentinel value to kill the label register.
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
      Timer.start("restructureControlFlow");
      if (!this.markedLoops && !this.markLoops()) {
        Timer.stop();
        return false;
      }

      this.induceControlTree();
      if (this.options.massage) {
        this.massageControlTree();
      }

      this.restructuredControlFlow = true;
      Timer.stop();
      return true;
    },

    //
    // Prints a normalized bytecode along with metainfo.
    //
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
