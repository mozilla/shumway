/*
 * Copyright 2014 Mozilla Foundation
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
///<reference path='../../references.ts' />

module Shumway.AVM2.Compiler.Looper {
  import top = Shumway.ArrayUtilities.top;
  import peek = Shumway.ArrayUtilities.peek;

  import CFG = Compiler.IR.CFG;
  import Block = Compiler.IR.Block;
  import BlockVisitor = Compiler.IR.BlockVisitor;

  import assert = Shumway.Debug.assert;

  export module Control {
    export enum Kind {
      SEQ = 1,
      LOOP = 2,
      IF = 3,
      CASE = 4,
      SWITCH = 5,
      LABEL_CASE = 6,
      LABEL_SWITCH = 7,
      EXIT = 8,
      BREAK = 9,
      CONTINUE = 10,
      TRY = 11,
      CATCH = 12
    }
    
    export class ControlNode {
      constructor(public kind: Kind) {

      }

      compile: (cx, state) => Compiler.AST.Node;
    }

    export class Seq extends ControlNode {
      constructor(public body) {
        super(Kind.SEQ);
      }

      trace(writer) {
        var body = this.body;
        for (var i = 0, j = body.length; i < j; i++) {
          body[i].trace(writer);
        }
      }

      first() {
        return this.body[0];
      }

      slice(begin, end) {
        return new Seq(this.body.slice(begin, end));
      }
    }

    export class Loop extends ControlNode {
      constructor(public body) {
        super(Kind.LOOP);
      }

      trace(writer) {
        writer.enter("loop {");
        this.body.trace(writer);
        writer.leave("}");
      }
    }

    export class If extends ControlNode {
      negated: boolean;
      else: any;
      constructor(public cond, public then, els, public nothingThrownLabel?) {
        super(Kind.IF);
        this.negated = false;
        this.else = els;
      }

      trace(writer) {
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
    }

    export class Case extends ControlNode {
      constructor(public index, public body) {
        super(Kind.CASE);
      }

      trace(writer) {
        if (this.index >= 0) {
          writer.writeLn("case " + this.index + ":");
        } else {
          writer.writeLn("default:");
        }
        writer.indent();
        this.body && this.body.trace(writer);
        writer.outdent();
      }
    }

    export class Switch extends ControlNode {
      constructor(public determinant, public cases, public nothingThrownLabel?) {
        super(Kind.SWITCH);
      }

      trace(writer) {
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
    }

    export class LabelCase extends ControlNode {
      constructor(public labels, public body) {
        super(Kind.LABEL_CASE);
      }

      trace(writer) {
        writer.enter("if (label is " + this.labels.join(" or ") + ") {");
        this.body && this.body.trace(writer);
        writer.leave("}");
      }
    }

    export class LabelSwitch extends ControlNode {
      labelMap: any;
      constructor(public cases) {
        super(Kind.LABEL_SWITCH);
        var labelMap = {};

        for (var i = 0, j = cases.length; i < j; i++) {
          var c = cases[i];
          if (!c.labels) {
            // print(c.toSource());
          }
          for (var k = 0, l = c.labels.length; k < l; k++) {
            labelMap[c.labels[k]] = c;
          }
        }


        this.labelMap = labelMap;
      }

      trace(writer) {
        for (var i = 0, j = this.cases.length; i < j; i++) {
          this.cases[i].trace(writer);
        }
      }
    }

    export class Exit extends ControlNode {
      constructor(public label) {
        super(Kind.EXIT);
      }

      trace(writer) {
        writer.writeLn("label = " + this.label);
      }
    }

    export class Break extends ControlNode {
      constructor(public label, public head) {
        super(Kind.BREAK);
      }

      trace(writer) {
        this.label && writer.writeLn("label = " + this.label);
        writer.writeLn("break");
      }
    }

    export class Continue extends ControlNode {
      necessary: boolean;
      constructor (public label, public head) {
        super(Kind.CONTINUE);
        this.necessary = true;
      }
      trace(writer) {
        this.label && writer.writeLn("label = " + this.label);
        this.necessary && writer.writeLn("continue");
      }
    }

    export class Try extends ControlNode {
      nothingThrownLabel: boolean;
      constructor(public body, public catches) {
        super(Kind.TRY);
      }

      trace(writer) {
        writer.enter("try {");
        this.body.trace(writer);
        writer.writeLn("label = " + this.nothingThrownLabel);
        for (var i = 0, j = this.catches.length; i < j; i++) {
          this.catches[i].trace(writer);
        }
        writer.leave("}");
      }
    }

    export class Catch extends ControlNode {
      constructor (public varName, public typeName, public body) {
        super(Kind.CATCH);
      }

      trace(writer) {
        writer.outdent();
        writer.enter("} catch (" + (this.varName || "e") +
          (this.typeName ? (" : " + this.typeName) : "") + ") {");
        this.body.trace(writer);
      }
    }
  }

  import BITS_PER_WORD = Shumway.BitSets.BITS_PER_WORD;
  import ADDRESS_BITS_PER_WORD = Shumway.BitSets.ADDRESS_BITS_PER_WORD;
  import BIT_INDEX_MASK = Shumway.BitSets.BIT_INDEX_MASK;
  
  export class BlockSet extends Shumway.BitSets.Uint32ArrayBitSet {
    constructor(length: number, public blockById: Shumway.Map<Block>) {
      super(length);
    }

    forEachBlock(fn: BlockVisitor) {
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

    choose(): Block {
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

    members(): Block [] {
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

    setBlocks(bs: Block []) {
      var bits = this.bits;
      for (var i = 0, j = bs.length; i < j; i++) {
        var id = bs[i].id;
        bits[id >> ADDRESS_BITS_PER_WORD] |= 1 << (id & BIT_INDEX_MASK);
      }
    }
  }

  export class Analysis {
    blocks: Block [];
    boundBlockSet: any;
    analyzedControlFlow: boolean;
    markedLoops: boolean;
    hasExceptions: boolean;
    restructuredControlFlow: boolean;
    controlTree: Control.ControlNode;
    constructor (cfg: CFG) {
      this.makeBlockSetFactory(cfg.blocks.length, cfg.blocks);
      this.hasExceptions = false;
      this.normalizeReachableBlocks(cfg.root);
    }

    makeBlockSetFactory(length: number, blockById: Block []) {
      release || assert (!this.boundBlockSet);
      this.boundBlockSet = <any>(function blockSet() {
        return new BlockSet(length, <any>blockById);
      });
    }

    normalizeReachableBlocks(root) {

      // The root must not have preds!
      release || assert(root.predecessors.length === 0);

      var ONCE = 1;
      var BUNCH_OF_TIMES = 2;
      var BlockSet = this.boundBlockSet;

      var blocks = [];
      var visited = {};
      var ancestors = {};
      var worklist = [root];
      var node;

      ancestors[root.id] = true;
      while ((node = top(worklist))) {
        if (visited[node.id]) {
          if (visited[node.id] === ONCE) {
            visited[node.id] = BUNCH_OF_TIMES;
            blocks.push(node);

            // Doubly link reachable blocks.
            // var successors = node.successors;
            // for (var i = 0, j = successors.length; i < j; i++) {
            //  successors[i].preds.push(node);
            // }
          }

          ancestors[node.id] = false;
          worklist.pop();
          continue;
        }

        visited[node.id] = ONCE;
        ancestors[node.id] = true;

        var successors = node.successors;
        for (var i = 0, j = successors.length; i < j; i++) {
          var s = successors[i];

          if (ancestors[s.id]) {
            if (!node.spbacks) {
              node.spbacks = new BlockSet();
            }
            node.spbacks.set(s.id);
          }
          !visited[s.id] && worklist.push(s);
        }
      }

      this.blocks = blocks.reverse();
    }

    //
    // Calculate the dominance relation iteratively.
    //
    // Algorithm is from [1].
    //
    // [1] Cooper et al. "A Simple, Fast Dominance Algorithm"
    //
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
      var rpo = [];
      for (var b = 0; b < n; b++) {
        rpo[blocks[b].id] = b;
        blocks[b].dominatees = [];
      }

      var changed = true;
      while (changed) {
        changed = false;

        // Iterate all blocks but the starting block.
        for (var b = 1; b < n; b++) {
          var predecessors = blocks[b].predecessors;
          var j = predecessors.length;

          var newIdom = rpo[predecessors[0].id];
          // Because 0 is falsy, have to use |in| here.
          if (!(newIdom in doms)) {
            for (var i = 1; i < j; i++) {
              newIdom = rpo[predecessors[i].id];
              if (newIdom in doms) {
                break;
              }
            }
          }
          release || assert(newIdom in doms);

          for (var i = 0; i < j; i++) {
            var p = rpo[predecessors[i].id];
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

        block.npredecessors = block.predecessors.length;
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

    computeFrontiers() {
      var BlockSet = this.boundBlockSet;
      var blocks = this.blocks;

      for (var b = 0, n = blocks.length; b < n; b++) {
        blocks[b].frontier = new BlockSet();
      }

      for (var b = 1, n = blocks.length; b < n; b++) {
        var block = blocks[b];
        var predecessors = block.predecessors;

        if (predecessors.length >= 2) {
          var idom = block.dominator;
          for (var i = 0, j = predecessors.length; i < j; i++) {
            var runner = predecessors[i];

            while (runner !== idom) {
              runner.frontier.set(block.id);
              runner = runner.dominator;
            }
          }
        }
      }
    }

    analyzeControlFlow() {
      this.computeDominance();
      this.analyzedControlFlow = true;
      return true;
    }

    markLoops() {
      if (!this.analyzedControlFlow && !this.analyzeControlFlow()) {
        return false;
      }

      var BlockSet = this.boundBlockSet;

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
          if (preorder[node.id]) {
            if (peek(pendingNodes) === node) {
              pendingNodes.pop();

              var scc = [];
              do {
                u = unconnectedNodes.pop();
                assigned[u.id] = true;
                scc.push(u);
              } while (u !== node);

              if (scc.length > 1 || (u.spbacks && u.spbacks.get(u.id))) {
                sccs.push(scc);
              }
            }

            worklist.pop();
            continue;
          }

          preorder[node.id] = preorderId++;
          unconnectedNodes.push(node);
          pendingNodes.push(node);

          var successors = node.successors;
          for (var i = 0, j = successors.length; i < j; i++) {
            s = successors[i];
            if (s.level < level) {
              continue;
            }

            var sid = s.id;
            if (!preorder[sid]) {
              worklist.push(s);
            } else if (!assigned[sid]) {
              while (preorder[peek(pendingNodes).id] > preorder[sid]) {
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

          var successors = block.successors;
          for (var k = 0, l = successors.length; k < l; k++) {
            var s = successors[k];
            if (spbacks.get(s.id)) {
              heads.set(s.dominator.id);
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
        this.npredecessors = 0;
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
              loop.head.set(h.id);

              var predecessors = h.predecessors;
              for (var pi = 0, pj = predecessors.length; pi < pj; pi++) {
                loop.body.get(predecessors[pi].id) && h.npredecessors--;
              }
              loop.npredecessors += h.npredecessors;
            }
          }

          for (var k = 0, l = scc.length; k < l; k++) {
            var h = scc[k];
            if (h.level === t.level + 1) {
              h.npredecessors = loop.npredecessors;
            }
          }

          loop.head.recount();
        }
      }

      this.markedLoops = true;
      return true;
    }

    induceControlTree() {
      var hasExceptions = this.hasExceptions;
      var BlockSet = this.boundBlockSet;

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
      // For a vertex v, let successor(v) denote its non-exceptional successoressors.
      //
      // Basic blocks can be restructured into 4 types of nodes:
      //
      //  1. Switch. |successor(v) > 2|
      //  2. If.     |successor(v) = 2|
      //  3. Plain.  |successor(v) = 1|
      //  4. Loop.   marked as a loop header.
      //
      // The idea is fairly simple: start at a set of heads, induce all its
      // successoressors recursively in that head's context, discharging the edges
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
      // such exception ranges have exceptional successoressors (jumps) to all
      // matching catch blocks. We then restructure the entire basic block as
      // a try and have the restructuring take care of the jumps to the actual
      // catch blocks. Finally blocks fall out naturally, but are not emitted
      // as JavaScript |finally|.
      //
      // Implementation Notes
      // --------------------
      //
      // We discharge edges by keeping a property |npredecessors| on each block that
      // says how many incoming edges we have _not yet_ discharged. We
      // discharge edges as we recur on the tree, but in case we can't emit a
      // block (i.e. its |npredecessors| > 0), we need to restore its |npredecessors| before
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
      function induce(head, exit, save, loop?, inLoopHead?, lookupSwitch?, fallthrough?) {
        var v = [];

        while (head) {
          if (head.count > 1) {
            var exit2 = new BlockSet();
            var save2 = {};

            var cases = [];
            var heads = head.members();

            for (var i = 0, j = heads.length; i < j; i++) {
              var h = heads[i];
              var bid = h.id;
              var c;

              if (h.loop && head.contains(h.loop.head)) {
                var loop2 = h.loop;
                if (!loop2.induced) {
                  var lheads = loop2.head.members();
                  var lheadsave = 0;

                  for (k = 0, l = lheads.length; k < l; k++) {
                    lheadsave += head.save[lheads[k].id];
                  }

                  if (h.npredecessors - lheadsave > 0) {
                    // Don't even enter the loop if we're just going to exit
                    // anyways.
                    h.npredecessors -= head.save[bid];
                    h.save = head.save[bid];
                    c = induce(h, exit2, save2, loop);
                    cases.push(new Control.LabelCase([bid], c));
                  } else {
                    for (k = 0, l = lheads.length; k < l; k++) {
                      var lh = lheads[k];
                      lh.npredecessors -= lheadsave;
                      lh.save = lheadsave;
                    }
                    c = induce(h, exit2, save2, loop);
                    cases.push(new Control.LabelCase(loop2.head.toArray(), c));
                    loop2.induced = true;
                  }
                }
              } else {
                h.npredecessors -= head.save[bid];
                h.save = head.save[bid];
                c = induce(h, exit2, save2, loop);
                cases.push(new Control.LabelCase([bid], c));
              }
            }

            var pruned = [];
            var k = 0;
            var c;
            for (var i = 0; i < cases.length; i++) {
              c = cases[i];
              var labels = c.labels;
              var lk = 0;
              for (var ln = 0, nlabels = labels.length; ln < nlabels; ln++) {
                var bid = labels[ln];
                if (exit2.get(bid) && heads[i].npredecessors - head.save[bid] > 0) {
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
              for (var i = 0; i < pruned.length; i++) {
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

          var h, bid, c;

          if (head.count === 1) {
            h = head.choose();
            bid = h.id;
            h.npredecessors -= head.save[bid];
            h.save = head.save[bid];
          } else {
            h = head;
            bid = h.id;
          }

          if (inLoopHead) {
            inLoopHead = false;
          } else {
            if (loop && !loop.body.get(bid)) {
              h.npredecessors += h.save;
              loop.exit.set(bid);
              loop.save[bid] = (loop.save[bid] || 0) + h.save;
              v.push(new Control.Break(bid, loop));
              break;
            }

            if (loop && h.loop === loop) {
              h.npredecessors += h.save;
              v.push(new Control.Continue(bid, loop));
              break;
            }

            if (h === fallthrough) {
              break;
            }

            if (h.npredecessors > 0) {
              h.npredecessors += h.save;
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
                  var lbid = lh.id;
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
          var successors;
          var exit2 = new BlockSet();
          var save2 = {};

          if (hasExceptions && h.hasCatches) {
            var allsuccessors = h.successors;
            var catchsuccessors = [];
            successors = [];

            for (var i = 0, j = allsuccessors.length; i < j; i++) {
              var s = allsuccessors[i];
              (s.exception ? catchsuccessors : successors).push(s);
            }

            var catches = [];
            for (var i = 0; i < catchsuccessors.length; i++) {
              var t = catchsuccessors[i];
              t.npredecessors -= 1;
              t.save = 1;
              var c = induce(t, exit2, save2, loop);
              var ex = t.exception;
              catches.push(new Control.Catch(ex.varName, ex.typeName, c));
            }

            sv = new Control.Try(h, catches);
          } else {
            successors = h.successors;
            sv = h;
          }

          /*
           if (h.end.op === OP_lookupswitch) {
           var cases = [];
           var targets = h.end.targets;

           for (var i = targets.length - 1; i >= 0; i--) {
           var t = targets[i];
           t.npredecessors -= 1;
           t.save = 1;
           c = induce(t, exit2, save2, loop, null, h, targets[i + 1]);
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
           } else
           */

          if (successors.length > 2) {
            var cases = [];
            var targets = successors;

            for (var i = targets.length - 1; i >= 0; i--) {
              var t = targets[i];
              t.npredecessors -= 1;
              t.save = 1;
              c = induce(t, exit2, save2, loop, null, h, targets[i + 1]);
              cases.unshift(new Control.Case(i, c));
            }

            // The last case is the default case.
            top(cases).index = undefined;

            if (hasExceptions && h.hasCatches) {
              sv.nothingThrownLabel = exceptionId;
              sv = new Control.Switch(sv, cases, exceptionId++);
            } else {
              sv = new Control.Switch(sv, cases);
            }

            head = maybe(exit2, save2);
          } else if (successors.length === 2) {
            var branch1 = h.hasFlippedSuccessors ? successors[1] : successors[0];
            var branch2 = h.hasFlippedSuccessors ? successors[0] : successors[1];
            branch1.npredecessors -= 1;
            branch1.save = 1;
            var c1 = induce(branch1, exit2, save2, loop);

            branch2.npredecessors -= 1;
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
            c = successors[0];

            if (c) {
              if (hasExceptions && h.hasCatches) {
                sv.nothingThrownLabel = c.id;
                save2[c.id] = (save2[c.id] || 0) + 1;
                exit2.set(c.id);

                head = maybe(exit2, save2);
              } else {
                c.npredecessors -= 1;
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
    }

    restructureControlFlow() {
      enterTimeline("Restructure Control Flow");
      if (!this.markedLoops && !this.markLoops()) {
        leaveTimeline();
        return false;
      }
      this.induceControlTree();
      this.restructuredControlFlow = true;
      leaveTimeline();
      return true;
    }
  }

  export function analyze(cfg: CFG): Control.ControlNode {
    var analysis = new Analysis(cfg);
    analysis.restructureControlFlow();
    return analysis.controlTree;
  }
}
