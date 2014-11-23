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

module Shumway.AVM2.Compiler.IR {
  import assert = Shumway.Debug.assert;
  import unexpected = Shumway.Debug.unexpected;
  import Multiname = Shumway.AVM2.ABC.Multiname;
  import top = Shumway.ArrayUtilities.top;
  import bitCount = Shumway.IntegerUtilities.bitCount;
  import IndentingWriter = Shumway.IndentingWriter;
  import pushUnique = Shumway.ArrayUtilities.pushUnique;
  import unique = Shumway.ArrayUtilities.unique;

  var debug = false;

  function toID(node) {
    return node.id;
  }

  function visitNothing() {

  }

  export function isNotPhi(phi) {
    return !isPhi(phi);
  }

  export function isPhi(phi) {
    return phi instanceof Phi;
  }

  export function isScope(scope) {
    return isPhi(scope) || scope instanceof ASScope || isProjection(scope, ProjectionType.SCOPE);
  }

  export function isMultinameConstant(node) {
    return node instanceof Constant && node.value instanceof Multiname;
  }

  export function isMultiname(name) {
    return isMultinameConstant(name) || name instanceof ASMultiname;
  }

  export function isStore(store) {
    return isPhi(store) || store instanceof Store || isProjection(store, ProjectionType.STORE);
  }

  export function isConstant(constant) {
    return constant instanceof Constant;
  }

  function isBoolean(value) {
    return value === true || value === false;
  }

  export function isControlOrNull(control) {
    return isControl(control) || control === null;
  }

  export function isStoreOrNull(store) {
    return isStore(store) || store === null;
  }

  export function isControl(control) {
    return control instanceof Control;
  }

  export function isValueOrNull(value) {
    return isValue(value) || value === null;
  }

  export function isValue(value) {
    return value instanceof Value;
  }

  export function isProjection(node, type) {
    return node instanceof Projection && (!type || node.type === type);
  }

  function followProjection(node) {
    return node instanceof Projection ? node.project() : node;
  }

  export var Null = new Constant(null);
  export var Undefined = new Constant(undefined);
  export var True = new Constant(true);
  export var False = new Constant(false);

  export class Block {
    id: number;
    rpo: number;
    name: string;
    phis: Phi [];
    nodes: Node [];
    region: Node;
    dominator: Block;
    successors: Block [];
    predecessors: Block [];

    /**
     * This is added by the codegen.
     */
    compile: (cx, state) => void;

    /**
     * This is stuff added on by the looper which needs to be really cleaned up.
     */
    dominatees: Block [];
    npredecessors: number;
    level: number;
    frontier: any;

    constructor(id: number, start?: Region, end?: Node) {
      this.id = id;
      this.nodes = [start, end];
      this.region = start;
      this.successors = [];
      this.predecessors = [];
    }
    pushSuccessorAt(successor: Block, index: number, pushPredecessor?: boolean) {
      release || assert (successor);
      release || assert (!this.successors[index]);
      this.successors[index] = successor;
      if (pushPredecessor) {
        successor.pushPredecessor(this);
      }
    }
    pushSuccessor(successor: Block, pushPredecessor?: boolean) {
      release || assert (successor);
      this.successors.push(successor);
      if (pushPredecessor) {
        successor.pushPredecessor(this);
      }
    }
    pushPredecessor(predecessor: Block) {
      release || assert (predecessor);
      this.predecessors.push(predecessor);
    }
    visitNodes(fn: NodeVisitor) {
      var nodes = this.nodes;
      for (var i = 0, j = nodes.length; i < j; i++) {
        fn(nodes[i]);
      }
    }
    visitSuccessors(fn: BlockVisitor) {
      var successors = this.successors;
      for (var i = 0, j = successors.length; i < j; i++) {
        fn(successors[i]);
      }
    }
    visitPredecessors(fn: BlockVisitor) {
      var predecessors = this.predecessors;
      for (var i = 0, j = predecessors.length; i < j; i++) {
        fn(predecessors[i]);
      }
    }
    append(node: Node) {
      release || assert (this.nodes.length >= 2);
      release || assert (isValue(node), node);
      release || assert (isNotPhi(node));
      release || assert (this.nodes.indexOf(node) < 0);
      if (node.mustFloat) {
        return;
      }
      this.nodes.splice(this.nodes.length - 1, 0, node);
    }
    toString() {
      return "B" + this.id + (this.name ? " (" + this.name + ")" : "");
    }
    trace(writer: IndentingWriter) {
      writer.writeLn(this.toString());
    }
  }

  export class DFG {
    start: Node;
    constructor(public exit: Node) {
      this.exit = exit;
    }

    buildCFG() {
      return CFG.fromDFG(this);
    }

    static preOrderDepthFirstSearch(root, visitChildren, pre) {
      var visited = [];
      var worklist = [root];
      var push = worklist.push.bind(worklist);
      var node;
      while ((node = worklist.pop())) {
        if (visited[node.id] === 1) {
          continue;
        }
        visited[node.id] = 1;
        pre(node);
        worklist.push(node);
        visitChildren(node, push);
      }
    }

    static postOrderDepthFirstSearch(root, visitChildren, post) {
      var ONE_TIME = 1, MANY_TIMES = 2;
      var visited = [];
      var worklist = [root];
      function visitChild(child) {
        if (!visited[child.id]) {
          worklist.push(child);
        }
      }
      var node;
      while ((node = top(worklist))) {
        if (visited[node.id]) {
          if (visited[node.id] === ONE_TIME) {
            visited[node.id] = MANY_TIMES;
            post(node);
          }
          worklist.pop();
          continue;
        }
        visited[node.id] = ONE_TIME;
        visitChildren(node, visitChild);
      }
    }

    forEachInPreOrderDepthFirstSearch(visitor) {
      var visited = new Array(1024);
      var worklist = [this.exit];
      function push(node) {
        if (isConstant(node)) {
          return;
        }
        release || assert (node instanceof Node);
        worklist.push(node);
      }
      var node;
      while ((node = worklist.pop())) {
        if (visited[node.id]) {
          continue;
        }
        visited[node.id] = 1;
        visitor && visitor(node);
        worklist.push(node);
        node.visitInputs(push);
      }
    }

    forEach(visitor, postOrder: boolean) {
      var search = postOrder ? DFG.postOrderDepthFirstSearch : DFG.preOrderDepthFirstSearch;
      search(this.exit, function (node, v) {
        node.visitInputsNoConstants(v);
      }, visitor);
    }

    traceMetrics(writer: IndentingWriter) {
      var counter = new Shumway.Metrics.Counter(true);
      DFG.preOrderDepthFirstSearch(this.exit, function (node, visitor) {
        node.visitInputsNoConstants(visitor);
      }, function (node) {
        countTimeline(node.nodeName);
      });
      counter.trace(writer);
    }

    trace(writer: IndentingWriter) {
      var nodes = [];
      var visited = {};

      function colorOf(node) {
        if (node instanceof Control) {
          return "yellow";
        } else if (node instanceof Phi) {
          return "purple";
        } else if (node instanceof Value) {
          return "green";
        }
        return "white";
      }

      var blocks = [];

      function followProjection(node) {
        return node instanceof Projection ? node.project() : node;
      }

      function next(node) {
        node = followProjection(node);
        if (!visited[node.id]) {
          visited[node.id] = true;
          if (node.block) {
            blocks.push(node.block);
          }
          nodes.push(node);
          node.visitInputsNoConstants(next);
        }
      }

      next(this.exit);

      writer.writeLn("");
      writer.enter("digraph DFG {");
      writer.writeLn("graph [bgcolor = gray10];");
      writer.writeLn("edge [color = white];");
      writer.writeLn("node [shape = box, fontname = Consolas, fontsize = 11, color = white, fontcolor = white];");
      writer.writeLn("rankdir = BT;");

      function writeNode(node) {
        writer.writeLn("N" + node.id + " [label = \"" + node.toString() +
          "\", color = \"" + colorOf(node) + "\"];");
      }

      function defineNode(node) {
        writer.writeLn("N" + node.id + ";");
      }

      blocks.forEach(function (block) {
        writer.enter("subgraph cluster" + block.nodes[0].id + " { bgcolor = gray20;");
        block.visitNodes(function (node) {
          defineNode(followProjection(node));
        });
        writer.leave("}");
      });

      nodes.forEach(writeNode);

      nodes.forEach(function (node) {
        node.visitInputsNoConstants(function (input) {
          input = followProjection(input);
          writer.writeLn("N" + node.id + " -> " + "N" + input.id + " [color=" + colorOf(input) + "];");
        });
      });

      writer.leave("}");
      writer.writeLn("");
    }
  }

  export class Uses {
    entries: any [];
    constructor() {
      this.entries = [];
    }
    addUse(def, use) {
      var entry = this.entries[def.id];
      if (!entry) {
        entry = this.entries[def.id] = {def: def, uses:[]};
      }
      pushUnique(entry.uses, use);
    }
    trace(writer) {
      writer.enter("> Uses");
      this.entries.forEach(function (entry) {
        writer.writeLn(entry.def.id + " -> [" + entry.uses.map(toID).join(", ") + "] " + entry.def);
      });
      writer.leave("<");
    }
    replace(def, value) {
      var entry = this.entries[def.id];
      if (entry.uses.length === 0) {
        return false;
      }
      var count = 0;
      entry.uses.forEach(function (use) {
        count += use.replaceInput(def, value);
      });
      release || assert (count >= entry.uses.length);
      entry.uses = [];
      return true;
    }
    updateUses(def, value, useEntries, writer) {
      debug && writer.writeLn("Update " + def + " with " + value);
      var entry = useEntries[def.id];
      if (entry.uses.length === 0) {
        return false;
      }
      debug && writer.writeLn("Replacing: " + def.id + " in [" + entry.uses.map(toID).join(", ") + "] with " + value.id);
      var count = 0;
      entry.uses.forEach(function (use) {
        count += use.replaceInput(def, value);
      });
      release || assert (count >= entry.uses.length);
      entry.uses = [];
      return true;
    }
  }

  export class CFG {
    dfg: DFG;
    exit: Block;
    root: Block;
    order: Block [];
    blocks: Block [];
    nextBlockID: number;
    blockNames: Shumway.Map<Block>;
    setConstructor: any;
    constructor() {
      this.nextBlockID = 0;
      this.blocks = [];
    }

    static fromDFG(dfg) {
      var cfg = new CFG();

      release || assert (dfg && dfg instanceof DFG);
      cfg.dfg = dfg;

      var visited = [];

      function buildEnd(end) {
        if (end instanceof Projection) {
          end = end.project();
        }
        release || assert (end instanceof End || end instanceof Start, end);
        if (visited[end.id]) {
          return;
        }
        visited[end.id] = true;
        var start = end.control;
        if (!(start instanceof Region)) {
          start = end.control = new Region(start);
        }
        var block = start.block = cfg.buildBlock(start, end);
        if (start instanceof Start) {
          cfg.root = block;
        }
        for (var i = 0; i < start.predecessors.length; i++) {
          var c = start.predecessors[i];
          var d;
          var trueProjection = false;
          if (c instanceof Projection) {
            d = c.project();
            trueProjection = c.type === ProjectionType.TRUE;
          } else {
            d = c;
          }
          if (d instanceof Region) {
            d = new Jump(c);
            d = new Projection(d, ProjectionType.TRUE);
            start.predecessors[i] = d;
            d = d.project();
            trueProjection = true;
          }
          buildEnd(d);
          var controlBlock = d.control.block;
          if (d instanceof Switch) {
            release || assert (isProjection(c, ProjectionType.CASE));
            controlBlock.pushSuccessorAt(block, c.selector.value, true);
          } else if (trueProjection && controlBlock.successors.length > 0) {
            controlBlock.pushSuccessor(block, true);
            controlBlock.hasFlippedSuccessors = true;
          } else {
            controlBlock.pushSuccessor(block, true);
          }
        }
      }

      buildEnd(dfg.exit);
      cfg.splitCriticalEdges();
      cfg.exit = dfg.exit.control.block;
      cfg.computeDominators(true);
      return cfg;
    }

    /**
     * Makes sure root node has no predecessors and that there is only one
     * exit node.
     */
    buildRootAndExit() {
      release || assert (!this.root && !this.exit);

      // Create new root node if the root node has predecessors.
      if (this.blocks[0].predecessors.length > 0) {
        this.root = new Block(this.nextBlockID++);
        this.blocks.push(this.root);
        this.root.pushSuccessor(this.blocks[0], true);
      } else {
        this.root = this.blocks[0];
      }
      var exitBlocks = [];

      // Collect exit blocks (blocks with no successors).
      for (var i = 0; i < this.blocks.length; i++) {
        var block = this.blocks[i];
        if (block.successors.length === 0) {
          exitBlocks.push(block);
        }
      }

      if (exitBlocks.length === 0) {
        unexpected("Must have an exit block.");
      } else if (exitBlocks.length === 1 && exitBlocks[0] !== this.root) {
        this.exit = exitBlocks[0];
      } else {
        // Create new exit block to merge flow.
        this.exit = new Block(this.nextBlockID++);
        this.blocks.push(this.exit);
        for (var i = 0; i < exitBlocks.length; i++) {
          exitBlocks[i].pushSuccessor(this.exit, true);
        }
      }

      release || assert (this.root && this.exit);
      release || assert (this.root !== this.exit);
    }

    fromString(list, rootName) {
      var cfg = this;
      var names = cfg.blockNames || (cfg.blockNames = {});
      var blocks = cfg.blocks;

      var sets = list.replace(/\ /g,"").split(",");
      sets.forEach(function (set) {
        var edgeList = set.split("->");
        var last = null;
        for (var i = 0; i < edgeList.length; i++) {
          var next = edgeList[i];
          if (last) {
            buildEdge(last, next);
          } else {
            buildBlock(next);
          }
          last = next;
        }
      });

      function buildBlock(name) {
        var block = names[name];
        if (block) {
          return block;
        }
        names[name] = block = new Block(cfg.nextBlockID++);
        block.name = name;
        blocks.push(block);
        return block;
      }

      function buildEdge(from, to) {
        buildBlock(from).pushSuccessor(buildBlock(to), true);
      }

      release || assert (rootName && names[rootName]);
      this.root = names[rootName];
    }

    buildBlock(start, end) {
      var block = new Block(this.nextBlockID++, start, end);
      this.blocks.push(block);
      return block;
    }

    createBlockSet() {
      if (!this.setConstructor) {
        this.setConstructor = Shumway.BitSets.BitSetFunctor(this.blocks.length);
      }
      return new this.setConstructor();
    }

    computeReversePostOrder() {
      if (this.order) {
        return this.order;
      }
      var order = this.order = [];
      this.depthFirstSearch(null, order.push.bind(order));
      order.reverse();
      for (var i = 0; i < order.length; i++) {
        order[i].rpo = i;
      }
      return order;
    }

    depthFirstSearch(preFn, postFn?) {
      var visited = this.createBlockSet();
      function visit(node) {
        visited.set(node.id);
        if (preFn) preFn(node);
        var successors = node.successors;
        for (var i = 0, j = successors.length; i < j; i++) {
          var s = successors[i];
          if (!visited.get(s.id)) {
            visit(s);
          }
        }
        if (postFn) postFn(node);
      }
      visit(this.root);
    }

    computeDominators(apply) {
      release || assert (this.root.predecessors.length === 0, "Root node " + this.root + " must not have predecessors.");

      var dom = new Int32Array(this.blocks.length);
      for (var i = 0; i < dom.length; i++) {
        dom[i] = -1;
      }
      var map = this.createBlockSet();
      function computeCommonDominator(a, b) {
        map.clearAll();
        while (a >= 0) {
          map.set(a);
          a = dom[a];
        }
        while (b >= 0 && !map.get(b)) {
          b = dom[b];
        }
        return b;
      }
      function computeDominator(blockID, parentID) {
        if (dom[blockID] < 0) {
          dom[blockID] = parentID;
        } else {
          dom[blockID] = computeCommonDominator(dom[blockID], parentID);
        }
      }
      this.depthFirstSearch (
        function visit(block) {
          var s = block.successors;
          for (var i = 0, j = s.length; i < j; i++) {
            computeDominator(s[i].id, block.id);
          }
        }
      );
      if (apply) {
        for (var i = 0, j = this.blocks.length; i < j; i++) {
          this.blocks[i].dominator = this.blocks[dom[i]];
        }
        function computeDominatorDepth(block) {
          var dominatorDepth;
          if (block.dominatorDepth !== undefined) {
            return block.dominatorDepth;
          } else if (!block.dominator) {
            dominatorDepth = 0;
          } else {
            dominatorDepth = computeDominatorDepth(block.dominator) + 1;
          }
          return block.dominatorDepth = dominatorDepth;
        }
        for (var i = 0, j = this.blocks.length; i < j; i++) {
          computeDominatorDepth(this.blocks[i]);
        }
      }
      return dom;
    }

    computeLoops() {
      var active = this.createBlockSet();
      var visited = this.createBlockSet();
      var nextLoop = 0;

      function makeLoopHeader(block) {
        if (!block.isLoopHeader) {
          release || assert(nextLoop < 32, "Can't handle too many loops, fall back on BitMaps if it's a problem.");
          block.isLoopHeader = true;
          block.loops = 1 << nextLoop;
          nextLoop += 1;
        }
        release || assert(bitCount(block.loops) === 1);
      }

      function visit(block) {
        if (visited.get(block.id)) {
          if (active.get(block.id)) {
            makeLoopHeader(block);
          }
          return block.loops;
        }
        visited.set(block.id);
        active.set(block.id);
        var loops = 0;
        for (var i = 0, j = block.successors.length; i < j; i++) {
          loops |= visit(block.successors[i]);
        }
        if (block.isLoopHeader) {
          release || assert(bitCount(block.loops) === 1);
          loops &= ~block.loops;
        }
        block.loops = loops;
        active.clear(block.id);
        return loops;
      }

      var loop = visit(this.root);
      release || assert(loop === 0);
    }

    /**
     * Computes def-use chains.
     *
     * () -> Map[id -> {def:Node, uses:Array[Node]}]
     */
    computeUses() {
      enterTimeline("computeUses");
      var writer = debug && new IndentingWriter();

      debug && writer.enter("> Compute Uses");
      var dfg = this.dfg;

      var uses = new Uses();

      dfg.forEachInPreOrderDepthFirstSearch(function (use) {
        use.visitInputs(function (def) {
          uses.addUse(def, use);
        });
      });

      if (debug) {
        writer.enter("> Uses");
        uses.entries.forEach(function (entry) {
          writer.writeLn(entry.def.id + " -> [" + entry.uses.map(toID).join(", ") + "] " + entry.def);
        });
        writer.leave("<");
        writer.leave("<");
      }
      leaveTimeline();
      return uses;
    }

    verify() {
      var writer = debug && new IndentingWriter();
      debug && writer.enter("> Verify");

      var order = this.computeReversePostOrder();

      order.forEach(function (block) {
        if (block.phis) {
          block.phis.forEach(function (phi) {
            release || assert (phi.control === block.region);
            release || assert (phi.args.length === block.predecessors.length);
          });
        }
      });

      debug && writer.leave("<");
    }

    /**
     * Simplifies phis of the form:
     *
     * replace |x = phi(y)| -> y
     * replace |x = phi(x, y)| -> y
     * replace |x = phi(y, y, x, y, x)| -> |phi(y, x)| -> y
     */
    optimizePhis() {
      var writer = debug && new IndentingWriter();
      debug && writer.enter("> Optimize Phis");

      var phis = [];
      var useEntries = this.computeUses().entries;
      useEntries.forEach(function (entry) {
        if (isPhi(entry.def)) {
          phis.push(entry.def);
        }
      });

      debug && writer.writeLn("Trying to optimize " + phis.length + " phis.");

      /**
       * Updates all uses to a new definition. Returns true if anything was updated.
       */
      function updateUses(def, value) {
        debug && writer.writeLn("Update " + def + " with " + value);
        var entry = useEntries[def.id];
        if (entry.uses.length === 0) {
          return false;
        }
        debug && writer.writeLn("Replacing: " + def.id + " in [" + entry.uses.map(toID).join(", ") + "] with " + value.id);
        var count = 0;
        var entryUses = entry.uses;
        for (var i = 0, j = entryUses.length; i < j; i++) {
          count += entryUses[i].replaceInput(def, value);
        }
        release || assert (count >= entry.uses.length);
        entry.uses = [];
        return true;
      }

      function simplify(phi, args) {
        args = unique(args);
        if (args.length === 1) {
          // x = phi(y) -> y
          return args[0];
        } else {
          if (args.length === 2) {
            // x = phi(y, x) -> y
            if (args[0] === phi) {
              return args[1];
            } else if (args[1] === phi) {
              return args[0];
            }
            return phi;
          }
        }
        return phi;
      }

      var count = 0;
      var iterations = 0;
      var changed = true;
      while (changed) {
        iterations ++;
        changed = false;
        phis.forEach(function (phi) {
          var value = simplify(phi, phi.args);
          if (value !== phi) {
            if (updateUses(phi, value)) {
              changed = true;
              count ++;
            }
          }
        });
      }

      if (debug) {
        writer.writeLn("Simplified " + count + " phis, in " + iterations + " iterations.");
        writer.leave("<");
      }
    }

    /**
     * "A critical edge is an edge which is neither the only edge leaving its source block, nor the only edge entering
     * its destination block. These edges must be split: a new block must be created in the middle of the edge, in order
     * to insert computations on the edge without affecting any other edges." - Wikipedia
     */
    splitCriticalEdges() {
      var writer = debug && new IndentingWriter();
      var blocks = this.blocks;
      var criticalEdges = [];
      debug && writer.enter("> Splitting Critical Edges");
      for (var i = 0; i < blocks.length; i++) {
        var successors = blocks[i].successors;
        if (successors.length > 1) {
          for (var j = 0; j < successors.length; j++) {
            if (successors[j].predecessors.length > 1) {
              criticalEdges.push({from: blocks[i], to: successors[j]});
            }
          }
        }
      }

      var criticalEdgeCount = criticalEdges.length;
      if (criticalEdgeCount && debug) {
        writer.writeLn("Splitting: " + criticalEdgeCount);
        this.trace(writer);
      }

      var edge;
      while ((edge = criticalEdges.pop())) {
        var fromIndex = edge.from.successors.indexOf(edge.to);
        var toIndex = edge.to.predecessors.indexOf(edge.from);
        release || assert (fromIndex >= 0 && toIndex >= 0);
        debug && writer.writeLn("Splitting critical edge: " + edge.from + " -> " + edge.to);
        var toBlock = edge.to;
        var toRegion = toBlock.region;
        var control = toRegion.predecessors[toIndex];
        var region = new Region(control);
        var jump = new Jump(region);
        var block = this.buildBlock(region, jump);
        toRegion.predecessors[toIndex] = new Projection(jump, ProjectionType.TRUE);

        var fromBlock = edge.from;
        fromBlock.successors[fromIndex] = block;
        block.pushPredecessor(fromBlock);
        block.pushSuccessor(toBlock);
        toBlock.predecessors[toIndex] = block;
      }

      if (criticalEdgeCount && debug) {
        this.trace(writer);
      }

      if (criticalEdgeCount && !release) {
        release || assert (this.splitCriticalEdges() === 0);
      }

      debug && writer.leave("<");

      return criticalEdgeCount;
    }

    /**
     * Allocate virtual registers and break out of SSA.
     */
    allocateVariables() {
      var writer = debug && new IndentingWriter();

      debug && writer.enter("> Allocating Virtual Registers");
      var order = this.computeReversePostOrder();

      function allocate(node) {
        if (isProjection(node, ProjectionType.STORE)) {
          return;
        }
        if (node instanceof SetProperty) {
          return;
        }
        if (node instanceof Value) {
          node.variable = new Variable("v" + node.id);
          debug && writer.writeLn("Allocated: " + node.variable + " to " + node);
        }
      }

      order.forEach(function (block) {
        block.nodes.forEach(allocate);
        if (block.phis) {
          block.phis.forEach(allocate);
        }
      });

      /**
       * To break out of SSA form we need to emit moves in the phi's predecessor blocks. Here we
       * collect the set of all moves in |blockMoves| : Map[id -> Array[Move]]
       *
       * The moves actually need to be emitted along the phi's predecessor edges. Emitting them in the
       * predecessor blocks is only correct in the absence of CFG critical edges.
       */

      var blockMoves = [];
      for (var i = 0; i < order.length; i++) {
        var block = order[i];
        var phis = block.phis;
        var predecessors = block.predecessors;
        if (phis) {
          for (var j = 0; j < phis.length; j++) {
            var phi = phis[j];
            debug && writer.writeLn("Emitting moves for: " + phi);
            var arguments = phi.args;
            release || assert (predecessors.length === arguments.length);
            for (var k = 0; k < predecessors.length; k++) {
              var predecessor = predecessors[k];
              var argument = arguments[k];
              if (argument.abstract || isProjection(argument, ProjectionType.STORE)) {
                continue;
              }
              var moves = blockMoves[predecessor.id] || (blockMoves[predecessor.id] = []);
              argument = argument.variable || argument;
              if (phi.variable !== argument) {
                moves.push(new Move(phi.variable, argument));
              }
            }
          }
        }
      }

      /**
       * All move instructions must execute simultaneously. Since there may be dependencies between
       * source and destination operands we need to sort moves topologically. This is not always
       * possible because of cyclic dependencies. In such cases break the cycles using temporaries.
       *
       * Simplest example where this happens:
       *   var a, b, t;
       *   while (true) {
         *     t = a; a = b; b = t;
         *   }
       */
      var blocks = this.blocks;
      blockMoves.forEach(function (moves, blockID) {
        var block = blocks[blockID];
        var temporary = 0;
        debug && writer.writeLn(block + " Moves: " + moves);
        while (moves.length) {
          // Find a move that is safe to emit, i.e. no other move depends on its destination.
          for (var i = 0; i < moves.length; i++) {
            var move = moves[i];
            // Find a move that depends on the move's destination?
            for (var j = 0; j < moves.length; j++) {
              if (i === j) {
                continue;
              }
              if (moves[j].from === move.to) {
                move = null;
                break;
              }
            }
            if (move) {
              moves.splice(i--, 1);
              block.append(move);
            }
          }

          if (moves.length) {
            // We have a cycle, break it with a temporary.
            debug && writer.writeLn("Breaking Cycle");
            // 1. Pick any move.
            var move = moves[0];
            // 2. Emit a move to save its destination in a temporary.
            var temp = new Variable("t" + temporary++);
            blocks[blockID].append(new Move(temp, move.to));
            // 3. Update all moves's source to refer to the temporary.
            for (var i = 1; i < moves.length; i++) {
              if (moves[i].from === move.to) {
                moves[i].from = temp;
              }
            }
            // 4. Loop, baby, loop.
          }
        }
      });

      debug && writer.leave("<");
    }

    scheduleEarly() {
      var debugScheduler = false;
      var writer = debugScheduler && new IndentingWriter();

      debugScheduler && writer.enter("> Schedule Early");

      var cfg = this;
      var dfg = this.dfg;

      var scheduled = [];

      var roots = [];

      dfg.forEachInPreOrderDepthFirstSearch(function (node) {
        if (node instanceof Region || node instanceof Jump) {
          return;
        }
        if (node.control) {
          roots.push(node);
        }
        if (isPhi(node)) {
          /**
           * When breaking out of SSA, move instructions need to have non-floating source nodes. Otherwise
           * the topological sorting of moves gets more complicated, especially when cyclic dependencies
           * are involved. Here we just mark all floating inputs of phi nodes as non-floating which forces
           * them to get scheduled.
           *
           * TODO: Find out if this requirement is too expensive. We can make the move insertion algorithm
           * more intelligent so that it walks the inputs of floating nodes when looking for dependencies.
           */
          node.args.forEach(function (input) {
            if (shouldFloat(input)) {
              input.mustNotFloat = true;
            }
          });
        }
      });

      if (debugScheduler) {
        roots.forEach(function (node) {
          writer && writer.writeLn("Root: " + node);
        });
      }

      for (var i = 0; i < roots.length; i++) {
        var root = roots[i];
        if (root instanceof Phi) {
          var block = (<any>root.control).block;
          (block.phis || (block.phis = [])).push(root);
        }
        if (root.control) {
          schedule(root);
        }
      }

      function isScheduled(node) {
        return scheduled[node.id];
      }

      function shouldFloat(node) {
        if (node.mustNotFloat || node.shouldNotFloat) {
          return false;
        }
        if (node.mustFloat || node.shouldFloat) {
          return true;
        }
        if (node instanceof Parameter || node instanceof This || node instanceof Arguments) {
          return true;
        }
        return node instanceof Binary || node instanceof Unary || node instanceof Parameter;
      }

      function append(node) {
        release || assert (!isScheduled(node), "Already scheduled " + node);
        scheduled[node.id] = true;
        release || assert (node.control, node);
        if (shouldFloat(node)) {

        } else {
          node.control.block.append(node);
        }
      }

      function scheduleIn(node, region) {
        release || assert (!node.control, node);
        release || assert (!isScheduled(node));
        release || assert (region);
        debugScheduler && writer.writeLn("Scheduled: " + node + " in " + region);
        node.control = region;
        append(node);
      }

      function schedule(node) {
        debugScheduler && writer.enter("> Schedule: " + node);

        var inputs = [];
        // node.checkInputVisitors();
        node.visitInputs(function (input) {
          if (isConstant(input)) {{
            return;
          }}
          if (isValue(input)) {
            inputs.push(followProjection(input));
          }
        });

        debugScheduler && writer.writeLn("Inputs: [" + inputs.map(toID) + "], length: " + inputs.length);

        for (var i = 0; i < inputs.length; i++) {
          var input = inputs[i];
          if (isNotPhi(input) && !isScheduled(input)) {
            schedule(input);
          }
        }

        if (node.control) {
          if (node instanceof End || node instanceof Phi || node instanceof Start || isScheduled(node)) {

          } else {
            append(node);
          }
        } else {
          if (inputs.length) {
            var x = inputs[0].control;
            for (var i = 1; i < inputs.length; i++) {
              var y = inputs[i].control;
              if (x.block.dominatorDepth < y.block.dominatorDepth) {
                x = y;
              }
            }
            scheduleIn(node, x);
          } else {
            scheduleIn(node, cfg.root.region);
          }
        }

        debugScheduler && writer.leave("<");
      }

      debugScheduler && writer.leave("<");

      roots.forEach(function (node) {
        node = followProjection(node);
        if (node === dfg.start || node instanceof Region) {
          return;
        }
        release || assert (node.control, "Node is not scheduled: " + node);
      });
    }

    trace (writer: IndentingWriter) {
      var visited = [];
      var blocks = [];

      function next(block) {
        if (!visited[block.id]) {
          visited[block.id] = true;
          blocks.push(block);
          block.visitSuccessors(next);
        }
      }

      var root = this.root;
      var exit = this.exit;

      next(root);

      function colorOf(block) {
        return "black";
      }

      function styleOf(block) {
        return "filled";
      }

      function shapeOf(block) {
        release || assert (block);
        if (block === root) {
          return "house";
        } else if (block === exit) {
          return "invhouse";
        }
        return "box";
      }

      writer.writeLn("");
      writer.enter("digraph CFG {");

      writer.writeLn("graph [bgcolor = gray10];");
      writer.writeLn("edge [fontname = Consolas, fontsize = 11, color = white, fontcolor = white];");
      writer.writeLn("node [shape = box, fontname = Consolas, fontsize = 11, color = white, fontcolor = white, style = filled];");
      writer.writeLn("rankdir = TB;");

      blocks.forEach(function (block) {
        var loopInfo = "";
        var blockInfo = "";
        var intervalInfo = "";
        // if (block.dominatorDepth !== undefined) {
        //  blockInfo = " D" + block.dominatorDepth;
        // }
        if (block.loops !== undefined) {
          // loopInfo = "loop: " + block.loops + ", nest: " + bitCount(block.loops);
          // loopInfo = " L" + bitCount(block.loops);
        }
        if (block.name !== undefined) {
          blockInfo += " " + block.name;
        }
        if (block.rpo !== undefined) {
          blockInfo += " O: " + block.rpo;
        }
        writer.writeLn("B" + block.id + " [label = \"B" + block.id + blockInfo + loopInfo + "\", fillcolor = \"" + colorOf(block) + "\", shape=" + shapeOf(block) + ", style=" + styleOf(block) + "];");
      });

      blocks.forEach(function (block) {
        block.visitSuccessors(function (successor) {
          writer.writeLn("B" + block.id + " -> " + "B" + successor.id);
        });
        if (block.dominator) {
          writer.writeLn("B" + block.id + " -> " + "B" + block.dominator.id + " [color = orange];");
        }
        if (block.follow) {
          writer.writeLn("B" + block.id + " -> " + "B" + block.follow.id + " [color = purple];");
        }
      });

      writer.leave("}");
      writer.writeLn("");
    }
  }

  /**
   * Peephole optimizations:
   */
  export class PeepholeOptimizer {
    foldUnary(node, truthy?) {
      release || assert (node instanceof Unary);
      if (isConstant(node.argument)) {
        return new Constant(node.operator.evaluate(node.argument.value));
      }
      if (truthy) {
        var argument = this.fold(node.argument, true);
        if (node.operator === Operator.TRUE) {
          return argument;
        }
        if (argument instanceof Unary) {
          if (node.operator === Operator.FALSE && argument.operator === Operator.FALSE) {
            return argument.argument;
          }
        } else {
          return new Unary(node.operator, argument);
        }
      }
      return node;
    }
    foldBinary(node, truthy?) {
      release || assert (node instanceof Binary);
      if (isConstant(node.left) && isConstant(node.right)) {
        return new Constant(node.operator.evaluate(node.left.value, node.right.value));
      }
      return node;
    }
    fold(node, truthy?) {
      if (node instanceof Unary) {
        return this.foldUnary(node, truthy);
      } else if (node instanceof Binary) {
        return this.foldBinary(node, truthy);
      }
      return node;
    }
  }
}
