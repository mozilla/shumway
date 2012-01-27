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
                unexpected();
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
        if (this.isBlockHead) {
            return;
        }

        this.isBlockHead = true;
        this.succs = [];
        this.preds = [];
    };

    Bp.addSucc = function addSucc(succ) {
        assert(this.isBlockHead);
        this.succs.push(succ);
    };

    Bp.addPred = function addPred(pred) {
        assert(this.isBlockHead);
        this.preds.push(pred);
    };

    Bp.toString = function toString() {
        var opdesc = opcodeTable[this.op];
        var str = opdesc.name.padRight(' ', 20);
        var i, j;

        if (this.op === OP_lookupswitch) {
            str += "defaultOffset:" + this.offsets[0];
            for (i = 1, j = this.offsets.length; i < j; i++) {
                str += ", offset:" + this.offsets[i];
            }
        } else {
            for (i = 0, j = opdesc.operands.length; i < j; i++) {
                var operand = opdesc.operands[i];
                str += operand.name + ":" + this[operand.name];
                if (i < j - 1) {
                    str += ", ";
                }
            }
        }

        return str;
    }

    return Bytecode;
})();

var Analysis = (function () {

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

    function depthFirstSearch(bytecodes, pre, post) {
        /* Block 0 is always the root block. */
        var dfs = [0];
        var visited = [];
        var node;

        while (dfs.length) {
            node = dfs[dfs.length - 1];
            if (node in visited) {
                dfs.pop();
                if (post) {
                    post(node);
                }
            }

            var succs = bytecodes[node].succs;
            for (var i = 0, j = succs.length; i < j; i++) {
                if (succs[i] in visited) {
                    continue;
                }
                dfs.push(succs[i]);
            }

            if (pre) {
                pre(node);
            }
            visited.push(node);
        }
    }

    function analyzeBasicBlocks(bytecodes) {
        var code;
        var pc, end;

        function doubleLink(pred, succ) {
            bytecodes[pred].addSucc(succ);
            bytecodes[succ].addPred(pred);
        }

        assert(bytecodes);

        bytecodes[0].makeBlockHead();
        for (pc = 0, end = bytecodes.length; pc < end; pc++) {
            code = bytecodes[pc];
            switch (code.op) {
            case OP_lookupswitch:
                code.offsets.forEach(function (offset) {
                    bytecodes[pc + offset].makeBlockHead();
                });
                break;

            case OP_jump:
                bytecodes[pc + code.offset].makeBlockHead();
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
                bytecodes[pc + code.offset].makeBlockHead();
                bytecodes[++pc].makeBlockHead();
                break;

            default:;
            }
        }

        var start = 0;
        for (pc = 1, end = bytecodes.length; pc < end; pc++) {
            if (!bytecodes[pc].isBlockHead) {
                continue;
            }

            assert(bytecodes[start].isBlockHead);
            var nextBlockCode = bytecodes[pc];

            code = bytecodes[pc - 1];
            switch (code.op) {
            case OP_lookupswitch:
                code.offsets.forEach(function (offset) {
                    doubleLink(start, pc - 1 + offset);
                });
                break;

            case OP_jump:
                doubleLink(start, pc - 1 + code.offset);
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
                print(pc - 1 + code.offset);
                doubleLink(start, pc - 1 + code.offset);
                doubleLink(start, pc);
                break;

            default:
                doubleLink(start, pc);
            }

            start = pc;
        }
    }

    /*
     * Calculate the dominance relation.
     *
     * Algorithm is from [1].
     *
     * [1] Cooper et al. "A Simple, Fast Dominance Algorithm"
     */
    function analyzeDominance(bytecodes) {
        /* For this algorithm we id blocks by their index in reverse postorder. */
        var blocks = [];
        depthFirstSearch(bytecodes, null, blocks.push.bind(blocks));
        var n = blocks.length;
        var sortedIndices = {};
        for (var i = 0; i < n; i++) {
            sortedIndices[blocks[i]] = i;
        }

        /* The indices in dom is the block's index in sortedIndices, not blocks! */
        var doms = new Array(n);
        doms[n-1] = n-1;
        var changed = true;

        while (changed) {
            changed = false;

            /* Iterate all blocks but the starting block in reverse postorder. */
            for (var b = n - 2; b >= 0; b--) {
                var preds = bytecodes[blocks[b]].preds;
                var newIdom = sortedIndices[preds[0]];

                for (var i = 1, j = preds.length; i < j; i++) {
                    var p = sortedIndices[preds[i]];

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
            bytecodes[blocks[i]].dominator = blocks[doms[i]];
        }
    }

    function Analysis(codeStream) {
        /*
         * Normalize the code stream. The other analyses are run by the user
         * on demand.
         */
        this.analyzeBytecode(new AbcStream(codeStream));
    }

    var Ap = Analysis.prototype;

    Ap.analyzeBytecode = function analyzeBytecode(codeStream) {
        /* This array is sparse, indexed by offset. */
        var bytecodesOffset = [];
        /* This array is dense. */
        var bytecodes = [];
        var code;

        var normalizedOffset = 0;
        while (codeStream.remaining() > 0) {
            var pos = codeStream.position;
            code = new Bytecode(codeStream);

            /* Get absolute offsets for normalization to new indices below. */
            switch (code.op) {
            case OP_lookupswitch:
                code.offsets.map(function (offset) {
                    return codeStream.position + offset;
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
                code.offset = codeStream.position + code.offset;
                break;

            default:;
            }

            bytecodesOffset[pos] = normalizedOffset++;
            bytecodes.push(code);
        }

        for (var pc = 0, end = bytecodes.length; pc < end; pc++) {
            code = bytecodes[pc];
            switch (code.op) {
            case OP_lookupswitch:
                code.offsets.map(function (offset) {
                    return bytecodesOffset[offset] - pc;
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
                code.offset = bytecodesOffset[code.offset] - pc;
                break;

            default:;
            }
        }

        this.bytecodes = bytecodes;
    };

    Ap.analyzeControlFlow = function analyzeControlFlow() {
        assert(this.bytecodes);

        var bytecodes = this.bytecodes;
        analyzeBasicBlocks(bytecodes);
        analyzeDominance(bytecodes);
    }

    Ap.trace = function(writer) {
        writer.enter("analysis {");

        var ranControlFlow = !!this.bytecodes[0].isBlockHead;

        for (var pc = 0, end = this.bytecodes.length; pc < end; pc++) {
            var code = this.bytecodes[pc];

            if (ranControlFlow && code.isBlockHead) {
                if (pc > 0) {
                    writer.leave("}");
                }

                writer.enter("block " + code.dominator + " >> " + pc +
                             (code.succs.length > 0 ? " -> " + code.succs : "") + " {");
            }

            writer.writeLn(("" + pc).padRight(' ', 5) + code);

            if (ranControlFlow && pc === end - 1) {
                writer.leave("}");
            }
        }

        writer.leave("}");
    };

    return Analysis;

})();