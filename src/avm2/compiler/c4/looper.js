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

(function (exports) {

  var Control = (function () {

    var SEQ = 1;
    var LOOP = 2;
    var IF = 3;
    var CASE = 4;
    var SWITCH = 5;
    var LABEL_CASE = 6;
    var LABEL_SWITCH = 7;
    var EXIT = 8;
    var BREAK = 9;
    var CONTINUE = 10;
    var TRY = 11;
    var CATCH = 12;

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

  var Analysis = (function () {

    function blockSetClass(length, blockById) {
      var BlockSet = BitSetFunctor(length);

      var ADDRESS_BITS_PER_WORD = BlockSet.ADDRESS_BITS_PER_WORD;
      var BITS_PER_WORD = BlockSet.BITS_PER_WORD;
      var BIT_INDEX_MASK = BlockSet.BIT_INDEX_MASK;

      BlockSet.singleton = function singleton(b) {
        var bs = new BlockSet();
        bs.set(b.id);
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
            var id = bs[i].id;
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
            var id = bs[i].id;
            bits[id >> ADDRESS_BITS_PER_WORD] |= 1 << (id & BIT_INDEX_MASK);
          }
        };
      }

      return BlockSet;
    }

    function Analysis(cfg, options) {
      this.options = options || {};
      this.BlockSet = blockSetClass(cfg.blocks.length, cfg.blocks);
      // this.blocks = cfg.computeReversePostOrder();
      this.hasExceptions = false;
      this.normalizeReachableBlocks(cfg.root);
    }

    Analysis.prototype = {

      normalizeReachableBlocks: function normalizeReachableBlocks(root) {

        // The root must not have preds!
        release || assert(root.predecessors.length === 0);

        var ONCE = 1;
        var BUNCH_OF_TIMES = 2;
        var BlockSet = this.BlockSet;

        var blocks = [];
        var visited = {};
        var ancestors = {};
        var worklist = [root];
        var node;

        ancestors[root.id] = true;
        while ((node = worklist.top())) {
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
          for (var i = 0, j = dominatees.length; i < j; i++) {
            dominatees[i].level = block.level + 1;
          }
          worklist.push.apply(worklist, dominatees);
        }
      },

      computeFrontiers: function computeFrontiers() {
        var BlockSet = this.BlockSet;
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
      },

      analyzeControlFlow: function analyzeControlFlow() {
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
            if (preorder[node.id]) {
              if (pendingNodes.peek() === node) {
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
                while (preorder[pendingNodes.peek().id] > preorder[sid]) {
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
              if (h.level === top.level + 1) {
                h.npredecessors = loop.npredecessors;
              }
            }

            loop.head.recount();
          }
        }

        this.markedLoops = true;
        return true;
      },

      induceControlTree: function induceControlTree() {
        var hasExceptions = this.hasExceptions;
        var BlockSet = this.BlockSet;

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
              for (var i = 0, j = cases.length; i < j; i++) {
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
              for (var i = 0, j = catchsuccessors.length; i < j; i++) {
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
              cases.top().index = undefined;

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
      },

      /*
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
                  c.body = massage(c.body, exit, cont, exit);
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
                if ((body = massage(c.body, exit, cont, br))) {
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
                  // 0 is a sentinel value to kill the label register. This is
                  // safe as block id #0 is always the entry block and so should
                  // never be targeted by a label.
                  node.label = 0;
                }
                return node;
              }
              return null;

            case Control.BREAK:
              if (br && br.kind === Control.LABEL_SWITCH) {
                if (!(node.label in br.labelMap)) {
                  node.label = 0;
                }
              } else {
                delete node.label;
              }
              return node;

            case Control.CONTINUE:
              if (cont && cont.kind === Control.LABEL_SWITCH) {
                if (!(node.label in cont.labelMap)) {
                  node.label = 0;
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
      */

      restructureControlFlow: function restructureControlFlow() {
        Timer.start("Restructure Control Flow");
        if (!this.markedLoops && !this.markLoops()) {
          Timer.stop();
          return false;
        }

        this.induceControlTree();

        this.restructuredControlFlow = true;
        Timer.stop();
        return true;
      },

      //
      // Prints a normalized bytecode along with metainfo.
      //
      trace: function (writer) {
        function bid(node) {
          return node.id;
        }

        function traceBlock(block) {
          if (!block.dominator) {
            writer.enter("block unreachable {");
          } else {
            writer.enter("block " + block.id +
              (block.successors.length > 0 ? " -> " +
                block.successors.map(bid).join(",") : "") + " {");

            writer.writeLn("npredecessors".padRight(' ', 10) + block.npredecessors);
            writer.writeLn("idom".padRight(' ', 10) + block.dominator.id);
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
            writer.writeLn("  npredecessors".padRight(' ', 10) + block.loop.npredecessors);
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

      traceCFG: makeVizTrace([{ fn: function (n) { return n.successors || []; },
        style: "" }],
        [{ fn: function (n) { return n.predecessors || []; },
          style: "" }]),

      traceDJ: makeVizTrace([{ fn: function (n) { return n.dominatees || []; },
        style: "style=dashed" },
        { fn:
          function (n) {
            var crosses = new this.BlockSet();
            crosses.setBlocks(n.successors);
            crosses.subtract(this.BlockSet.fromBlocks(n.dominatees));
            n.spbacks && crosses.subtract(n.spbacks);
            return crosses.members();
          },
          style: "" },
        { fn: function (n) { return n.spbacks ? n.spbacks.members() : []; },
          style: "style=bold" }],
        [{ fn: function (n) { return n.predecessors || []; },
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

    function makeVizTrace(successorFns, predecessorFns, postHook) {
      return function (writer, name, prefix) {
        function idFn(n) {
          return prefix + n.id;
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

        successorFns.forEach(bindToThis);
        predecessorFns.forEach(bindToThis);

        writeGraphViz(writer, name.toString(), bytecodes[0], idFn,
          function (n) { return n.successors || []; },
          successorFns, predecessorFns,
          function (n) {
            var str = "Block: " + n.id + "\\l";
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

  exports.Control = Control;

  exports.analyze = function (cfg) {
    var analysis = new Analysis(cfg);
    analysis.restructureControlFlow();
    return analysis.controlTree;
  };

})(typeof exports === "undefined" ? (Looper = {}) : exports);
