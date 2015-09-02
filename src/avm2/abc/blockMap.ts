/*
 * Copyright (c) 2009, 2011, Oracle and/or its affiliates. All rights reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 only, as
 * published by the Free Software Foundation.
 *
 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 *
 * You should have received a copy of the GNU General Public License version
 * 2 along with this work; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * Please contact Oracle, 500 Oracle Parkway, Redwood Shores, CA 94065 USA
 * or visit www.oracle.com if you need additional information or have any
 * questions.
 */

module Shumway.AVMX {
  import assert = Debug.assert;
  import pushUnique = ArrayUtilities.pushUnique;
  import Uint32ArrayBitSet = BitSets.Uint32ArrayBitSet;

  declare var Relooper;

  var writer = new IndentingWriter();

  export class CompilerBailout {
    constructor(public message: string) {
      // ...
    }
    toString(): string {
      return "CompilerBailout: " + this.message;
    }
  }

  export class Block {
    public startBci: number;
    public endBci: number;
    public isExceptionEntry: boolean;
    public isLoopHeader: boolean;
    public isLoopEnd: boolean;
    public hasHandlers: boolean;
    public blockID: number;
    public relooperBlockID: number;

    public region: any;

    public successors: Block [];
    public predecessors: Block [];
    public normalSuccessors: number;

    visited: boolean;
    active: boolean;
    public loops: number = 0; // long
    public exits: number = 0; // long
    public loopID: number = -1; // long

    public isInnerLoopHeader() {
      return this.isLoopHeader && (this.loops !== (1 << this.loopID));
    }

    constructor() {
      this.successors = [];
      this.predecessors = [];
    }

    public clone(): Block {
      var block = new Block();
      block.startBci = this.startBci;
      block.endBci = this.endBci;
      block.isExceptionEntry = this.isExceptionEntry;
      block.isLoopHeader = this.isLoopHeader;
      block.isLoopEnd = this.isLoopEnd;
      block.hasHandlers = this.hasHandlers;
      block.loops = this.loops;
      block.loopID = this.loopID;
      block.blockID = this.blockID;
      block.successors = this.successors.slice(0);
      block.predecessors = this.predecessors.slice(0);
      return block;
    }
  }

  export class ExceptionBlock extends Block {
    public handler: ExceptionInfo;
    public deoptBci: number;
  }

  export class BlockMap {
    method: MethodInfo;
    blocks: Block [];
    hasBackwardBranches: boolean;
    callCount: number;
    private body: MethodBodyInfo;
    private blockMap: Block [];
    private startBlock: Block;
    private canTrap: Uint32ArrayBitSet;

    constructor(body: MethodBodyInfo) {
      this.blocks = [];
      this.body = body;
      this.hasBackwardBranches = false;
      this.callCount = 0;
      this.blockMap = new Array<Block>(body.code.length);
      this.canTrap = new Uint32ArrayBitSet(this.blockMap.length);
    }

    build() {
      this.makeExceptionEntries();
      this.iterateOverBytecodes();
      this.addExceptionEdges();
      this.computeBlockOrder();
      this.fixLoopBits();
      this.initializeBlockIDs();
      this.computeLoopStores();
    }

    private makeExceptionEntries() {
      // start basic blocks at all exception handler blocks and mark them as exception entries
      var catchBlocks = this.body.catchBlocks;
      for (var i = 0; i < catchBlocks.length; i++) {
        var handler = catchBlocks[i];
        var block = this.makeBlock(handler.target);
        block.isExceptionEntry = true;
      }
    }

    private computeLoopStores() {

    }

    private initializeBlockIDs() {
      for (var i = 0; i < this.blocks.length; i++) {
        this.blocks[i].blockID = i;
      }
    }

    public getBlock(bci: number) {
      return this.blockMap[bci];
    }

    public getOSREntryPoints() {
      var points = [];
      for (var i = 0; i < this.blocks.length; i++) {
        var block = this.blocks[i];
        if (block.isLoopHeader && !block.isInnerLoopHeader()) {
          points.push(block.startBci);
        }
      }
      return points;
    }

    private makeBlock(startBci: number): Block {
      var oldBlock = this.blockMap[startBci];
      if (!oldBlock) {
        var newBlock = new Block();
        newBlock.startBci = startBci;
        this.blockMap[startBci] = newBlock;
        return newBlock;
      } else if (oldBlock.startBci != startBci) {
        // Backward branch into the middle of an already processed block.
        // Add the correct fall-through successor.
        var newBlock = new Block();
        newBlock.startBci = startBci;
        newBlock.endBci = oldBlock.endBci;
        ArrayUtilities.pushMany(newBlock.successors, oldBlock.successors);
        newBlock.normalSuccessors = oldBlock.normalSuccessors;

        oldBlock.endBci = startBci - 1;
        oldBlock.successors.length = 0;
        oldBlock.successors.push(newBlock);
        oldBlock.normalSuccessors = 1;

        for (var i = startBci; i <= newBlock.endBci; i++) {
          this.blockMap[i] = newBlock;
        }
        return newBlock;
      } else {
        return oldBlock;
      }
    }

    //private makeSwitchSuccessors(tswitch: BytecodeSwitch): Block [] {
    //  var max = tswitch.numberOfCases();
    //  var successors = new Array<Block>(max + 1);
    //  for (var i = 0; i < max; i++) {
    //      successors[i] = this.makeBlock(tswitch.targetAt(i));
    //  }
    //  successors[max] = this.makeBlock(tswitch.defaultTarget());
    //  return successors;
    //}

    private setSuccessors(predBci: number, successors: Block []) {
      if (!this.hasBackwardBranches) {
        for (var i = 0; i < successors.length; i++) {
          if (successors[i].startBci < predBci) {
            this.hasBackwardBranches = true;
          }
        }
      }
      var predecessor = this.blockMap[predBci];
      assert (predecessor.successors.length === 0, predecessor.successors.map(x => x.startBci).join(", "));
      ArrayUtilities.pushMany(predecessor.successors, successors);
      predecessor.normalSuccessors = successors.length;
    }

    public canTrapAt(opcode: Bytecode, bci: number): boolean {
      return canTrap(opcode);
    }

    private iterateOverBytecodes() {
      // iterate over the bytecodes top to bottom.
      // mark the entrypoints of basic blocks and build lists of successors for
      // all bytecodes that end basic blocks (i.e. goto, ifs, switches, throw, jsr, returns, ret)
      var code = this.body.code;
      var current: Block = null;
      var bci = 0;
      while (bci < code.length) {
        if (!current || this.blockMap[bci]) {
          var b = this.makeBlock(bci);
          if (current) {
            this.setSuccessors(current.endBci, [b]);
          }
          current = b;
        }
        this.blockMap[bci] = current;
        current.endBci = bci;

        var opcode = Bytes.u8(code, bci);
        switch (opcode) {
          case Bytecode.RETURNVOID:
          case Bytecode.RETURNVALUE: {
            current = null;
            break;
          }
          case Bytecode.THROW: {
            current = null;
            this.canTrap.set(bci);
            break;
          }
          case Bytecode.IFEQ:        // fall through
          case Bytecode.IFSTRICTEQ:  // fall through
          case Bytecode.IFNE:        // fall through
          case Bytecode.IFSTRICTNE:  // fall through
          case Bytecode.IFLT:        // fall through
          case Bytecode.IFGE:        // fall through
          case Bytecode.IFGT:        // fall through
          case Bytecode.IFLE:        // fall through
          case Bytecode.IFTRUE:      // fall through
          case Bytecode.IFFALSE: {   // fall through
            current = null;
            var probability = -1;
            var b1 = this.makeBlock(bci + 4 + Bytes.s24(code, bci + 1));
            var b2 = this.makeBlock(bci + 4);
            this.setSuccessors(bci, [b1, b2]);
            break;
          }
          case Bytecode.JUMP: {
            current = null;
            var b1 = this.makeBlock(bci + 4 + Bytes.s24(code, bci + 1));
            this.setSuccessors(bci, [b1]);
            break;
          }
          case Bytecode.LOOKUPSWITCH:
            current = null;
            // Default
            var successors = [this.makeBlock(bci + Bytes.s24(code, bci + 1))];
            var caseCount = Bytes.u30(code, bci + 4);
            var caseOffset = bci + 4 + Bytes.s32Length(code, bci + 4);
            for (var i = 0; i < caseCount; i++) {
              successors.push(this.makeBlock(bci + Bytes.s24(code, caseOffset)));
              caseOffset += 3;
            }
            this.setSuccessors(bci, successors);
            break;
          //case Bytecodes.INVOKEVIRTUAL:
          //case Bytecodes.INVOKESPECIAL:
          //case Bytecodes.INVOKESTATIC:
          //case Bytecodes.INVOKEINTERFACE:
          //  this.invokeCount ++;
          //  if (this.canTrapAt(opcode, bci)) {
          //    this.canTrap.set(bci);
          //  }
          //  break;
          default: {
            if (this.canTrapAt(opcode, bci)) {
              this.canTrap.set(bci);
            }
            if (isCall(opcode)) {
              this.callCount ++;
            }
          }
        }
        bci += lengthAt(code, bci);
      }
    }

    /**
     * The next available loop number.
     */
    private _nextLoop = 0;

    /**
     * Mark the block as a loop header, using the next available loop number.
     * Also checks for corner cases that we don't want to compile.
     */
    private makeLoopHeader(block: Block) {
      if (!block.isLoopHeader) {
        block.isLoopHeader = true;
        if (block.isExceptionEntry) {
          // Loops that are implicitly formed by an exception handler lead to all sorts of corner cases.
          // However, this doesn't affect the baseline JIT, so don't bail out.
          // TODO: Revisit for OPT JIT.
        }
        if (this._nextLoop >= 32) {
          // This restriction can be removed by using a fall-back to a BitSet in case we have more than 32 loops
          // Don't compile such methods for now, until we see a concrete case that allows checking for correctness.
          throw "Too many loops in method";
        }
        assert (!block.loops, block.loops);
        block.loops = 1 << this._nextLoop;
        block.loopID = this._nextLoop;
        this._nextLoop ++;
      }
      assert (IntegerUtilities.bitCount(block.loops) === 1);
    }

    // catch_type

    private handlerIsCatchAll(handler: ExceptionInfo) {
      return handler.getType() === null;
    }

    private exceptionDispatch: Map<ExceptionInfo, ExceptionBlock> = new Map<ExceptionInfo, ExceptionBlock>();

    private makeExceptionDispatch(handlers: ExceptionInfo [], index: number, bci: number): Block {
      var handler = handlers[index];
      if (this.handlerIsCatchAll(handler)) {
        return this.blockMap[handler.target];
      }
      var block = this.exceptionDispatch.get(handler);
      if (!block) {
        block = new ExceptionBlock();
        block.startBci = -1;
        block.endBci = -1;
        block.deoptBci = bci;
        block.handler = handler;
        block.successors.push(this.blockMap[handler.target]);
        if (index < handlers.length - 1) {
          block.successors.push(this.makeExceptionDispatch(handlers, index + 1, bci));
        }
        this.exceptionDispatch.set(handler, block);
      }
      return block;
    }

    private addExceptionEdges() {
      var length = this.canTrap.length;
      for (var bci = this.canTrap.nextSetBit(0, length); bci >= 0; bci = this.canTrap.nextSetBit(bci + 1, length)) {
        var block = this.blockMap[bci];
        var handlers: ExceptionInfo [] = null;
        var catchBlocks = this.body.catchBlocks;
        for (var i = 0; i < catchBlocks.length; i++) {
          var handler = catchBlocks[i];
          if (handler.start <= bci && bci < handler.end) {
            if (!handlers) {
              handlers = [];
            }
            handlers.push(handler);
            if (this.handlerIsCatchAll(handler)) {
              break;
            }
          }
        }
        if (handlers) {
          var dispatch = this.makeExceptionDispatch(handlers, 0, bci);
          block.successors.push(dispatch);
          block.hasHandlers = true;
        }
      }
    }


    private fixLoopBits() {
      var loopChanges: boolean = false;
      function _fixLoopBits(block: Block) {
        if (block.visited) {
          // Return cached loop information for this block.
          if (block.isLoopHeader) {
            return block.loops & ~(1 << block.loopID);
          } else {
            return block.loops;
          }
        }

        block.visited = true;
        var loops = block.loops;
        var successors = block.successors;
        for (var i = 0; i < successors.length; i++) {
          // Recursively process successors.
          loops |= _fixLoopBits(successors[i]);
        }
        for (var i = 0; i < successors.length; i++) {
          var successor = successors[i];
          successor.exits = loops & ~successor.loops;
        }
        if (block.loops !== loops) {
          loopChanges = true;
          block.loops = loops;
        }

        if (block.isLoopHeader) {
          loops &= ~(1 << block.loopID);
        }
        return loops;
      }

      do {
        loopChanges = false;
        for (var i = 0; i < this.blocks.length; i++) {
          this.blocks[i].visited = false;
        }
        var loop = _fixLoopBits(this.blockMap[0]);
        if (loop !== 0) {
          // There is a path from a loop end to the method entry that does not pass the loop
          // header.
          // Therefore, the loop is non reducible (has more than one entry).
          // We don't want to compile such methods because the IR only supports structured
          // loops.
          throw new CompilerBailout("Non-reducible loop");
        }
      } while (loopChanges);
    }

    private computeBlockOrder() {
      var loop = this.computeBlockOrderFrom(this.blockMap[0]);
      if (loop != 0) {
        // There is a path from a loop end to the method entry that does not pass the loop header.
        // Therefore, the loop is non reducible (has more than one entry).
        // We don't want to compile such methods because the IR only supports structured loops.
        throw new CompilerBailout("Non-reducible loop");
      }
      // Convert postorder to the desired reverse postorder.
      this.blocks.reverse();
    }

    /**
     * Depth-first traversal of the control flow graph. The flag {@linkplain Block#visited} is used to
     * visit every block only once. The flag {@linkplain Block#active} is used to detect cycles (backward
     * edges).
     */
    private computeBlockOrderFrom(block: Block): number {
      if (block.visited) {
        if (block.active) {
          // Reached block via backward branch.
          this.makeLoopHeader(block);
          return block.loops;
        } else if (block.isLoopHeader) {
          return block.loops & ~(1 << block.loopID);
        } else {
          return block.loops;
        }
      }

      block.visited = true;
      block.active = true;

      var loops = 0;

      for (var i = 0; i < block.successors.length; i++) {
        var successor = block.successors[i];
        pushUnique(successor.predecessors, block);
        // Recursively process successors.
        loops |= this.computeBlockOrderFrom(block.successors[i]);
        if (successor.active) {
          // Reached block via backward branch.
          block.isLoopEnd = true;
        }
      }

      block.loops = loops;

      if (block.isLoopHeader) {
        loops &= ~(1 << block.loopID);
      }

      block.active = false;
      this.blocks.push(block);
      return loops;
    }

    public static blockToString(block: Block): string {
      return "blockID: " + String(block.blockID +
      ", ").padRight(" ", 5) +
      "bci: [" + block.startBci + ", " + block.endBci + "]" +
      (block.successors.length ? ", successors: => " + block.successors.map(b => b.blockID).join(", ") : "") +
      (block.isLoopHeader ? " isLoopHeader, inner: " + block.isInnerLoopHeader() : "") +
      (block.isLoopEnd ? " isLoopEnd" : "") +
      (block.isExceptionEntry ? " isExceptionEntry" : "") +
      (block.hasHandlers ? " hasHandlers" : "") +
      ", loops: " + block.loops.toString(2) +
      ", exits: " + block.exits.toString(2) +
      ", loopID: " + block.loopID;
    }

    public trace(writer: IndentingWriter, traceBytecode: boolean = false) {
      var code = this.body.code;
      var stream = new BytecodeStream(code);

      writer.enter("Block Map: " + this.blocks.map(b => b.blockID).join(", "));
      this.blocks.forEach(block => {
        writer.enter(BlockMap.blockToString(block));
        if (traceBytecode) {
          var bci = block.startBci;
          stream.setBCI(bci);
          while (stream.currentBCI <= block.endBci) {
            writer.writeLn(stream.currentBCI + ": " + Bytecode[stream.currentBytecode()]);
            stream.next();
            bci = stream.currentBCI;
          }
        }
        writer.outdent();
      });
      writer.outdent();
    }

    public traceDOTFile(writer: IndentingWriter) {
      writer.enter("digraph CFG {");

      writer.writeLn("graph [bgcolor = gray10];");
      writer.writeLn("edge [fontname = Consolas, fontsize = 11, color = white, fontcolor = white];");
      writer.writeLn("node [shape = box, fontname = Consolas, fontsize = 11, color = white, fontcolor = black, style = filled];");
      writer.writeLn("rankdir = TB;");


      var blocks = this.blocks;
      blocks.forEach(function (block) {
        var label = "B" + block.blockID + " " +
          (block.isLoopHeader ? "H" : "") +
          (block.isLoopEnd ? "E" : "") +
          // (block.isExceptionEntry ? "X" : "") +
          // (block.hasHandlers ? "X" : "") +
          " l:" + block.loops.toString(2) +
          " e:" + block.exits.toString(2) +
          " i:" + block.loopID +
          " p:" + block.predecessors.length;

        writer.writeLn("B" + block.blockID + " [label = \"" + label + "\"];");
      });

      blocks.forEach(function (block) {
        block.successors.forEach(function (successor) {
          writer.writeLn("B" + block.blockID + " -> " + "B" + successor.blockID);
        });
      });
      writer.leave("}");
    }

  }
}
