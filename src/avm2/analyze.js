/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

    toString: function toString(abc) {
      var opDescription = opcodeTable[this.op];
      var str = opDescription.name.padRight(' ', 20);
      var i, j;

      if (this.op === OP_lookupswitch) {
        str += "targets:";
        for (i = 0, j = this.targets.length; i < j; i++) {
          str += (i > 0 ? "," : "") + this.targets[i].position;
        }
      } else {
        for (i = 0, j = opDescription.operands.length; i < j; i++) {
          var operand = opDescription.operands[i];
          if (operand.name === "offset") {
            str += "target:" + this.target.position;
          } else {
            str += operand.name + ": ";
            var value = this[operand.name];
            if (abc) {
              switch(operand.type) {
                case "":   str += value; break;
                case "I":  str += abc.constantPool.ints[value]; break;
                case "U":  str += abc.constantPool.uints[value]; break;
                case "D":  str += abc.constantPool.doubles[value]; break;
                case "S":  str += abc.constantPool.strings[value]; break;
                case "N":  str += abc.constantPool.namespaces[value]; break;
                case "CI": str += abc.classes[value]; break;
                case "M":  str += abc.constantPool.multinames[value]; break;
                default:   str += "?"; break;
              }
            } else {
              str += value;
            }
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

    var ADDRESS_BITS_PER_WORD = BlockSet.ADDRESS_BITS_PER_WORD;
    var BITS_PER_WORD = BlockSet.BITS_PER_WORD;
    var BIT_INDEX_MASK = BlockSet.BIT_INDEX_MASK;

    BlockSet.singleton = function singleton(b) {
      var bs = new BlockSet();
      bs.set(b.bid);
      bs.count = 1;
      bs.dirty = 0;
      return bs;
    };

    BlockSet.fromBlocks = function fromArray(other) {
      var bs = new BlockSet();
      bs.setBlocks(other);
      return bs;
    };

    var Bsp = BlockSet.prototype;

    if (BlockSet.singleword) {
      Bsp.forEachBlock = function forEach(fn) {
        release || assert(fn);
        var byId = blockById;
        var word = this.bits;
        if (word) {
          for (var k = 0; k < BITS_PER_WORD; k++) {
            if (word & (1 << k)) {
              fn(byId[k]);
            }
          }
        }
      };

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
        release || assert(fn);
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
      };

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

  function Analysis(method) {
    Counter.count("Analysis");
    // Normalize the code stream. The other analyses are run by the user
    // on demand.
    this.method = method;
    if (this.method.code) {
      Timer.start("Normalize");
      this.normalizeBytecode();
      Timer.stop();
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
          this.method.hasLookupSwitches = true;
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

        default:
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
            code.targets.push(bytecodes[newOffset] || getInvalidTarget(invalidJumps, offsets[i]));
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
          code.target = (bytecodes[newOffset] || getInvalidTarget(invalidJumps, code.offset));
          code.offset = newOffset;
          break;

        default:
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

        default:
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

      default:
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

        release || assert(currentBlock.succs);

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

      default:
      }
      currentBlock.end = code;

      this.BlockSet = blockSetClass(id, blockById);
    },

    normalizeReachableBlocks: function normalizeReachableBlocks() {
      var root = this.bytecodes[0];

      // The root must not have preds!
      release || assert(root.preds.length === 0);

      var ONCE = 1;
      var BUNCH_OF_TIMES = 2;
      var BlockSet = this.BlockSet;

      var blocks = [];
      var visited = {};
      var ancestors = {};
      var worklist = [root];
      var node;

      ancestors[root.bid] = true;
      while ((node = worklist.top())) {
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
          release || assert(newIdom in doms);

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
      var block;
      for (var b = 1; b < n; b++) {
        block = blocks[b];
        var idom = blocks[doms[b]];

        // Store the immediate dominator.
        block.dominator = idom;
        idom.dominatees.push(block);

        block.npreds = block.preds.length;
      }

      // Assign dominator tree levels.
      var worklist = [blocks[0]];
      blocks[0].level || (blocks[0].level = 0);
      while ((block = worklist.shift())) {
        var dominatees = block.dominatees;
        for (var i = 0, j = dominatees.length; i < j; i++) {
          dominatees[i].level = block.level + 1;
        }
        worklist.push.apply(worklist, dominatees);
      }
    },

    analyzeControlFlow: function analyzeControlFlow() {
      release || assert(this.bytecodes);
      this.detectBasicBlocks();
      this.normalizeReachableBlocks();
      this.computeDominance();
      this.analyzedControlFlow = true;
      return true;
    },

    markLoops: function markLoops() {
      if (!this.analyzedControlFlow && !this.analyzeControlFlow()) {
        return false;
      }

      var BlockSet = this.BlockSet;

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
        var u, s;

        while ((node = worklist.top())) {
          if (preorder[node.bid]) {
            if (pendingNodes.peek() === node) {
              pendingNodes.pop();

              var scc = [];
              do {
                u = unconnectedNodes.pop();
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
            s = succs[i];
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
                            while ((n = worklist.shift())) {
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
