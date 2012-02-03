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

  Bp.makeLoopHead = function makeLoopHead(loop) {
    if (this.loop) {
      return;
    }

    assert(this.succs);

    this.loop = loop;
    for (var i = 0, j = loop.length; i < j; i++) {
      loop[i].inLoop = this;
    }
  };

  Bp.doubleLink = function doubleLink(target) {
    assert(this.succs);
    this.succs.push(target);
    target.preds.push(this);
  };

  /*
   * Find the dominator set from immediate dominators.
   */
  function dom() {
    if (this.hasOwnProperty("dom")) {
      return this.dom;
    }

    assert(this.succs);
    assert(this.dominator);

    var b = this;
    var d = [b];
    do {
      d.push(b.dominator);
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
        if (!visited[s.position]) {
          visit(s);
        } else if (succ) {
          succ(s);
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
   * Calculate the dominance relation.
   *
   * Algorithm is from [1].
   *
   * [1] Cooper et al. "A Simple, Fast Dominance Algorithm"
   */
  function computeDominance(root) {
    var doms;

    function intersect(doms, b1, b2) {
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
    dfs(root, null, blocks.push.bind(blocks), null);
    var n = blocks.length;
    for (var i = 0; i < n; i++) {
      blocks[i].blockId = i;
    }

    var doms = new Array(n);
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

        for (var i = 1, j = preds.length; i < j; i++) {
          var p = preds[i].blockId;

          if (doms[p]) {
            newIdom = intersect(doms, p, newIdom);
          }
        }

        if (doms[b] !== newIdom) {
          doms[b] = newIdom;
          changed = true;
        }
      }
    }

    for (var i = 0; i < n; i++) {
      var block = blocks[i];
      block.blockId = n - 1 - block.blockId;
      block.dominator = blocks[doms[i]];
    }
  }

  /*
   * Find the node that dominates all other nodes in the loop.
   */
  function findLoopHead(loop) {
    var loopHead;

    for (var i = 0, j = loop.length; i < j; i++) {
      /* Candidate loop head. */
      loopHead = loop[i];

      for (var k = 0; k < j; k++) {
        if (loop[k].dom.indexOf(loopHead) < 0) {
          break;
        }
      }

      if (k === j && loop.indexOf(loopHead) >= 0) {
        return loopHead;
      }
    }

    unexpected();
  }

  /*
   * Find strongly connected components and mark them as loops.
   */
  function findLoops(root) {
    var preorderId = 0;

    /*
     * Don't fatten bytecodes with a preorder field, we don't need it outside
     * of loop detection.
     */
    var preorder = {};
    var done = [];
    var unconnectedNodes = [];
    var pendingNodes = [];

    /* Find SCCs by Gabow's algorithm in linear time. */
    dfs(root,
        function pre(v) {
          preorder[v.blockId] = preorderId++;
          unconnectedNodes.push(v);
          pendingNodes.push(v);
        },
        function post(v) {
          if (pendingNodes.peek() !== v) {
            return;
          }

          pendingNodes.pop();

          var l = [];
          do {
            var w = unconnectedNodes.pop();
            l.push(w);
            done.push(w);
          } while (w !== v);

          if (l.length > 1) {
            findLoopHead(l).makeLoopHead(l);
          }
        },
        function succ(w) {
          if (done.indexOf(w) >= 0) {
            return;
          }

          while (preorder[pendingNodes.peek().blockId] > preorder[w.blockId]) {
            pendingNodes.pop();
          }
        });
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
    assert(this.bytecodes);

    var bytecodes = this.bytecodes;
    detectBasicBlocks(bytecodes);
    computeDominance(bytecodes[0]);
    findLoops(bytecodes[0]);
  };

  /*
   * Prints a normalized bytecode along with metainfo.
   *
   * Basic blocks are identified by the position of the first bytecode in the
   * block. The format for each blocks, b, is:
   *   idom(b) >> b -> succ(b) 1, ...
   *
   * Loops are identified by:
   *   loop [loop body block 0, loop body block 1, ...]
   */

  Ap.trace = function(writer) {
    function blockId(node) {
      return node.blockId;
    }

    writer.enter("analysis {");

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
          writer.enter("block " + code.dominator.blockId + " >> " + code.blockId +
                       (code.succs.length > 0 ? " -> " +
                        code.succs.map(blockId).join(",") : "") + " {");
        }

        if (code.loop) {
          writer.writeLn("loop [" + code.loop.map(blockId).join(",") + "]");
          writer.writeLn("");
        }
      }

      writer.writeLn(("" + pc).padRight(' ', 5) + code);

      if (ranControlFlow && pc === end - 1) {
        writer.leave("}");
      }
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