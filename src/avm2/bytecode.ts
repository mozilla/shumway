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

module Shumway.AVM2 {
  import unexpected = Shumway.Debug.unexpected;

  import OP = Shumway.AVM2.ABC.OP;
  import AbcFile = Shumway.AVM2.ABC.AbcFile;
  import Trait = Shumway.AVM2.ABC.Trait;
  import Info = Shumway.AVM2.ABC.Info;
  import AbcStream = Shumway.AVM2.ABC.AbcStream;
  import ConstantPool = Shumway.AVM2.ABC.ConstantPool;
  import ClassInfo = Shumway.AVM2.ABC.ClassInfo;
  import MethodInfo = Shumway.AVM2.ABC.MethodInfo;
  import top = Shumway.ArrayUtilities.top;
  import peek = Shumway.ArrayUtilities.peek;

  export class Bytecode {
    op: number;
    position: number;
    originalPosition: number;
    canThrow: boolean;
    offsets: number [];
    succs: Bytecode [];
    preds: Bytecode [];
    dominatees: Bytecode [];
    targets: Bytecode [];
    target: Bytecode;
    dominator: Bytecode;
    bid: number;
    end: Bytecode;
    level: number;
    hasCatches: boolean;
    spbacks: BlockSet;

    constructor(code) {
      var op = code.readU8();
      this.op = op;
      this.originalPosition = code.position;

      var opdesc = Shumway.AVM2.opcodeTable[op];
      if (!opdesc) {
        unexpected("Unknown Op " + op);
      }

      this.canThrow = opdesc.canThrow;

      var i, n;

      switch (op) {
        case OP.lookupswitch:
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

    makeBlockHead(id) {
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
    }

    trace(writer) {
      if (!this.succs) {
        return;
      }

      writer.writeLn("#" + this.bid);
    }

    toString(abc) {
      var opDescription = Shumway.AVM2.opcodeTable[this.op];
      var str = opDescription.name.padRight(' ', 20);
      var i, j;

      if (this.op === OP.lookupswitch) {
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
  }

  export interface BytecodeVisitor {
    (bytecode: Bytecode): void;
  }

  import BITS_PER_WORD = Shumway.BitSets.BITS_PER_WORD;
  import ADDRESS_BITS_PER_WORD = Shumway.BitSets.ADDRESS_BITS_PER_WORD;
  import BIT_INDEX_MASK = Shumway.BitSets.BIT_INDEX_MASK;

  export class BlockSet extends Shumway.BitSets.Uint32ArrayBitSet {
    constructor(length: number, public blockById: Shumway.Map<Bytecode>) {
      super(length);
    }

    forEachBlock(fn: BytecodeVisitor) {
      release || assert(fn);
      var byId = this.blockById;
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
    }

    choose(): Bytecode {
      var byId = this.blockById;
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
    }

    members(): Bytecode [] {
      var byId = this.blockById;
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
    }

    setBlocks(bs: Bytecode []) {
      var bits = this.bits;
      for (var i = 0, j = bs.length; i < j; i++) {
        var id = bs[i].bid;
        bits[id >> ADDRESS_BITS_PER_WORD] |= 1 << (id & BIT_INDEX_MASK);
      }
    }
  }
  
  export class Analysis {
    blocks: Bytecode [];
    bytecodes: Bytecode [];
    boundBlockSet: any;
    markedLoops: boolean;
    analyzedControlFlow: boolean;
    constructor(public methodInfo: MethodInfo) {
      if (this.methodInfo.code) {
        this.normalizeBytecode();
      }
    }

    makeBlockSetFactory(length: number, blockById: Shumway.Map<Bytecode>) {
      assert (!this.boundBlockSet);
      this.boundBlockSet = <any>(function blockSet() {
        return new Shumway.AVM2.BlockSet(length, blockById);
      });
    }

    /**
     * Marks the parameter as used if it's ever accessed via getLocal.
     */
    accessLocal(index: number) {
      if (index-- === 0) return; // First index is |this|.
      if (index < this.methodInfo.parameters.length) {
        this.methodInfo.parameters[index].isUsed = true;
      }
    }

    /**
     * Internal bytecode used for bogus jumps. They should be emitted as throws
     * so that if control flow ever reaches them, we crash.
     */
    getInvalidTarget(cache, offset) {
      if (cache && cache[offset]) {
        return cache[offset];
      }

      var code = Object.create(Bytecode.prototype);
      code.op = OP.invalid;
      code.position = offset;
      cache && (cache[offset] = code);
      return code;
    }

    normalizeBytecode() {
      var methodInfo = this.methodInfo;

      // This array is sparse, indexed by offset.
      var bytecodesOffset = [];
      
      // This array is dense.
      var bytecodes = [];
      var codeStream = new AbcStream(this.methodInfo.code);
      var bytecode;

      while (codeStream.remaining() > 0) {
        var pos = codeStream.position;
        bytecode = new Bytecode(codeStream);

        // Get absolute offsets for normalization to new indices below.
        switch (bytecode.op) {
          case OP.nop:
          case OP.label:
            bytecodesOffset[pos] = bytecodes.length;
            continue;

          case OP.lookupswitch:
            this.methodInfo.hasLookupSwitches = true;
            bytecode.targets = [];
            var offsets = bytecode.offsets;
            for (var i = 0, j = offsets.length; i < j; i++) {
              offsets[i] += pos;
            }
            break;

          case OP.jump:
          case OP.iflt:
          case OP.ifnlt:
          case OP.ifle:
          case OP.ifnle:
          case OP.ifgt:
          case OP.ifngt:
          case OP.ifge:
          case OP.ifnge:
          case OP.ifeq:
          case OP.ifne:
          case OP.ifstricteq:
          case OP.ifstrictne:
          case OP.iftrue:
          case OP.iffalse:
            bytecode.offset += codeStream.position;
            break;
          case OP.getlocal0:
          case OP.getlocal1:
          case OP.getlocal2:
          case OP.getlocal3:
            this.accessLocal(bytecode.op - OP.getlocal0);
            break;
          case OP.getlocal:
            this.accessLocal(bytecode.index);
            break;
          default:
            break;
        }

        // Cache the position in the bytecode array.
        bytecode.position = bytecodes.length;
        bytecodesOffset[pos] = bytecodes.length;
        bytecodes.push(bytecode);
      }

      var invalidJumps = {};
      var newOffset;
      for (var pc = 0, end = bytecodes.length; pc < end; pc++) {
        bytecode = bytecodes[pc];
        switch (bytecode.op) {
          case OP.lookupswitch:
            var offsets = bytecode.offsets;
            for (var i = 0, j = offsets.length; i < j; i++) {
              newOffset = bytecodesOffset[offsets[i]];
              bytecode.targets.push(bytecodes[newOffset] || this.getInvalidTarget(invalidJumps, offsets[i]));
              offsets[i] = newOffset;
            }
            break;

          case OP.jump:
          case OP.iflt:
          case OP.ifnlt:
          case OP.ifle:
          case OP.ifnle:
          case OP.ifgt:
          case OP.ifngt:
          case OP.ifge:
          case OP.ifnge:
          case OP.ifeq:
          case OP.ifne:
          case OP.ifstricteq:
          case OP.ifstrictne:
          case OP.iftrue:
          case OP.iffalse:
            newOffset = bytecodesOffset[bytecode.offset];
            bytecode.target = (bytecodes[newOffset] || this.getInvalidTarget(invalidJumps, bytecode.offset));
            bytecode.offset = newOffset;
            break;
          default:
        }
      }

      this.bytecodes = bytecodes;

      // Normalize exceptions table to use new offsets.
      var exceptions = this.methodInfo.exceptions;
      for (var i = 0, j = exceptions.length; i < j; i++) {
        var ex = exceptions[i];
        ex.start = bytecodesOffset[ex.start];
        ex.end = bytecodesOffset[ex.end];
        ex.offset = bytecodesOffset[ex.target];
        ex.target = bytecodes[ex.offset];
        ex.target.exception = ex;
      }
    }

    analyzeControlFlow() {
      release || assert(this.bytecodes);
      this.detectBasicBlocks();
      this.normalizeReachableBlocks();
      this.computeDominance();
      this.analyzedControlFlow = true;
      return true;
    }

    detectBasicBlocks() {
      var bytecodes = this.bytecodes;
      var exceptions = this.methodInfo.exceptions;
      var hasExceptions = exceptions.length > 0;
      var blockById: Shumway.Map<Bytecode> = {};
      var code: Bytecode;
      var pc, end;
      var id = 0;
  
      function tryTargets(block): Bytecode [] {
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
          case OP.returnvoid:
          case OP.returnvalue:
          case OP.throw:
            id = bytecodes[pc + 1].makeBlockHead(id);
            break;
  
          case OP.lookupswitch:
            var targets = code.targets;
            for (var i = 0, j = targets.length; i < j; i++) {
              id = targets[i].makeBlockHead(id);
            }
            id = bytecodes[pc + 1].makeBlockHead(id);
            break;
  
          case OP.jump:
          case OP.iflt:
          case OP.ifnlt:
          case OP.ifle:
          case OP.ifnle:
          case OP.ifgt:
          case OP.ifngt:
          case OP.ifge:
          case OP.ifnge:
          case OP.ifeq:
          case OP.ifne:
          case OP.ifstricteq:
          case OP.ifstrictne:
          case OP.iftrue:
          case OP.iffalse:
            id = code.target.makeBlockHead(id);
            id = bytecodes[pc + 1].makeBlockHead(id);
            break;
  
          default:
        }
      }
  
      code = bytecodes[end];
      switch (code.op) {
        case OP.returnvoid:
        case OP.returnvalue:
        case OP.throw:
          break;
  
        case OP.lookupswitch:
          var targets = code.targets;
          for (var i = 0, j = targets.length; i < j; i++) {
            id = targets[i].makeBlockHead(id);
          }
          break;
  
        case OP.jump:
          id = code.target.makeBlockHead(id);
          break;
  
        case OP.iflt:
        case OP.ifnlt:
        case OP.ifle:
        case OP.ifnle:
        case OP.ifgt:
        case OP.ifngt:
        case OP.ifge:
        case OP.ifnge:
        case OP.ifeq:
        case OP.ifne:
        case OP.ifstricteq:
        case OP.ifstrictne:
        case OP.iftrue:
        case OP.iffalse:
          id = code.target.makeBlockHead(id);
          bytecodes[pc + 1] = this.getInvalidTarget(null, pc + 1);
          id = bytecodes[pc + 1].makeBlockHead(id);
          break;
  
        default:
      }
  
      // Mark exceptions.
      if (hasExceptions) {
        for (var i = 0; i < exceptions.length; i++) {
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
          case OP.returnvoid:
          case OP.returnvalue:
          case OP.throw:
            break;
  
          case OP.lookupswitch:
            for (var i = 0, j = code.targets.length; i < j; i++) {
              currentBlock.succs.push(code.targets[i]);
            }
            break;
  
          case OP.jump:
            currentBlock.succs.push(code.target);
            break;
  
          case OP.iflt:
          case OP.ifnlt:
          case OP.ifle:
          case OP.ifnle:
          case OP.ifgt:
          case OP.ifngt:
          case OP.ifge:
          case OP.ifnge:
          case OP.ifeq:
          case OP.ifne:
          case OP.ifstricteq:
          case OP.ifstrictne:
          case OP.iftrue:
          case OP.iffalse:
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
        case OP.lookupswitch:
          for (var i = 0, j = code.targets.length; i < j; i++) {
            currentBlock.succs.push(code.targets[i]);
          }
          break;
  
        case OP.jump:
          currentBlock.succs.push(code.target);
          break;
  
        default:
      }
      currentBlock.end = code;

      this.makeBlockSetFactory(id, blockById);
    }

    normalizeReachableBlocks() {
      var root = this.bytecodes[0];

      // The root must not have preds!
      release || assert(root.preds.length === 0);

      var ONCE = 1;
      var BUNCH_OF_TIMES = 2;


      var blocks = [];
      var visited = {};
      var ancestors = {};
      var worklist = [root];
      var node;

      ancestors[root.bid] = true;
      while ((node = top(worklist))) {
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
              node.spbacks = new this.boundBlockSet();
            }
            node.spbacks.set(s.bid);
          }
          !visited[s.bid] && worklist.push(s);
        }
      }

      this.blocks = blocks.reverse();
    }

    /**
     * Calculate the dominance relation iteratively.
     * Algorithm is from [1].
     * [1] Cooper et al. "A Simple, Fast Dominance Algorithm"
     */
    computeDominance() {
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
        for (var i = 0; i < dominatees.length; i++) {
          dominatees[i].level = block.level + 1;
        }
        worklist.push.apply(worklist, dominatees);
      }
    }

    markLoops() {
      if (!this.analyzedControlFlow && !this.analyzeControlFlow()) {
        return false;
      }

      var BoundBlockSet = this.boundBlockSet;

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

        while ((node = top(worklist))) {
          if (preorder[node.bid]) {
            if (peek(pendingNodes) === node) {
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
              while (preorder[peek(pendingNodes).bid] > preorder[sid]) {
                pendingNodes.pop();
              }
            }
          }
        }

        return sccs;
      }

      function findLoopHeads(blocks) {
        var heads = new BoundBlockSet();

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
        var body = new BoundBlockSet();
        body.setBlocks(scc);
        body.recount();

        this.id = loopId;
        this.body = body;
        this.exit = new BoundBlockSet();
        this.save = {};
        this.head = new BoundBlockSet();
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
        var t = worklist[n];
        var sccs = findSCCs(t);
        if (sccs.length === 0) {
          continue;
        }

        for (var i = 0, j = sccs.length; i < j; i++) {
          var scc = sccs[i];
          var loop = new LoopInfo(scc, loopId++);
          for (var k = 0, l = scc.length; k < l; k++) {
            var h = scc[k];
            if (h.level === t.level + 1 && !h.loop) {
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
            if (h.level === t.level + 1) {
              h.npreds = loop.npreds;
            }
          }

          loop.head.recount();
        }
      }

      this.markedLoops = true;
      return true;
    }
  }
}

var Bytecode = Shumway.AVM2.Bytecode;
var Analysis = Shumway.AVM2.Analysis;