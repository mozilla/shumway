var Bytecode = (function () {
    function Bytecode(code) {
        this.position = code.position;
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
            if (opdesc) {
                for (i = 0, n = opdesc.operands.length; i < n; i++) {
                    var operand = opdesc.operands[i];
                    var value = 0;

                    switch(operand.size) {
                    case "u08": this[operand.name] = code.readU8(); break;
                    case "s16": this[operand.name] = code.readU30Unsafe(); break;
                    case "s24": this[operand.name] = code.readS24(); break;
                    case "u30": this[operand.name] = code.readU30(); break;
                    case "u32": this[operand.name] = code.readU32(); break;
                    default: assert(false); break;
                    }
                }
            } else {
                unexpected();
            }
            break;
        }

        /* The base of offset operands is the start of the next bytecode. */
        this.base = code.position;
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

    Bp.trace = function trace(writer, abc) {
        var opdesc = opcodeTable[this.op];
        var str = ("" + this.position).padRight(' ', 5) + opdesc.name.padRight(' ', 20);
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

                var description;
                switch(operand.type) {
                case "": break;
                case "I": description = abc.constantPool.ints[value]; break;
                case "U": description = abc.constantPool.uints[value]; break;
                case "D": description = abc.constantPool.doubles[value]; break;
                case "S": description = abc.constantPool.strings[value]; break;
                case "N": description = abc.constantPool.namespaces[value]; break;
                case "CI": description = abc.classes[value]; break;
                case "M":
                    return abc.constantPool.multinames[value];
                default: description = "?"; break;
                }
                if (description) {
                    str += "(" + description + ")";
                }

                if (i < j - 1) {
                    str += ", ";
                }
            }
        }

        if (this.isBlockHead) {
            if (this.position > 0)
                writer.leave("}");
            writer.enter("block " + this.position + " {");
            writer.writeLn("dominator: " + this.dominator);
            writer.writeLn("");
        }
        writer.writeLn(str);
    }

    return Bytecode;
})();

var Analysis = (function () {
    function analyzeBytecode(analysis, code) {
        /* This array is sparse, indexed by offset. */
        var bytecodesOffset = [];
        /* This array is dense. */
        var bytecodes = [];

        while (code.remaining() > 0) {
            var offset = code.position;
            var bc = new Bytecode(code);
            bytecodesOffset[offset] = bc;
            bytecodes.push(bc);
        }

        analysis.bytecodesOffset = bytecodesOffset;
        analysis.bytecodes = bytecodes;
    }

    function analyzeBasicBlocks(analysis) {
        var bytecodesOffset = analysis.bytecodesOffset;
        var bytecodes = analysis.bytecodes;
        var code;
        var i, j;

        function doubleLink(pred, succ) {
            bytecodesOffset[pred].addSucc(succ);
            bytecodesOffset[succ].addPred(pred);
        }

        assert(bytecodesOffset);
        assert(bytecodes);

        bytecodes[0].makeBlockHead();
        for (i = 0, j = bytecodes.length; i < j; i++) {
            code = bytecodes[i];
            switch (code.op) {
            case OP_lookupswitch:
                code.offsets.forEach(function (offset) {
                    bytecodesOffset[code.base + offset].makeBlockHead();
                });
                break;

            case OP_jump:
                bytecodesOffset[code.base + code.offset].makeBlockHead();
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
                bytecodesOffset[code.base + code.offset].makeBlockHead();
                bytecodes[++i].makeBlockHead();
                break;

            default:;
            }
        }

        var start = 0;
        for (i = 1, j = bytecodes.length; i < j; i++) {
            if (!bytecodes[i].isBlockHead) {
                continue;
            }

            assert(bytecodesOffset[start].isBlockHead);
            var nextBlockCode = bytecodes[i];
            var offset = nextBlockCode.position;

            code = bytecodes[i - 1];
            switch (code.op) {
            case OP_lookupswitch:
                code.offsets.forEach(function (offset) {
                    doubleLink(start, code.base + offset);
                });
                break;

            case OP_jump:
                doubleLink(start, code.base + code.offset);
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
                doubleLink(start, code.base + code.offset);
                doubleLink(start, nextBlockCode.position);
                break;

            default:
                doubleLink(start, nextBlockCode.position);
            }

            bytecodesOffset[start].blockEnd = offset;
            start = offset;
        }
        /* The last block ends one past the end of code. */
        bytecodesOffset[start].blockEnd = offset + 1;

        analyzeDominance(analysis);
    }

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

    function depthFirstSearch(bytecodesOffset, pre, post) {
        /* Block 0 is always the root block. */
        var dfs = [0];
        var visited = [];
        var node;

        while (dfs.length) {
            node = dfs[dfs.length - 1];
            if (node in visited && post){
                post(dfs.pop());
            }

            var succs = bytecodesOffset[node].succs;
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

    /*
     * Calculate the dominance relation.
     *
     * Algorithm is from [1].
     *
     * [1] Cooper et al. "A Simple, Fast Dominance Algorithm"
     */
    function analyzeDominance(analysis) {
        var bytecodesOffset = analysis.bytecodesOffset;
        assert(bytecodesOffset);

        /* For this algorithm we id blocks by their index in reverse postorder. */
        var blocks = [];
        depthFirstSearch(bytecodesOffset, null, blocks.push.bind(blocks));
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
                var preds = bytecodesOffset[blocks[b]].preds;
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
            bytecodesOffset[blocks[i]].dominator = blocks[doms[i]];
        }
    }

    function Analysis(code) {
        analyzeBytecode(this, new AbcStream(code));
        analyzeBasicBlocks(this);
    }

    var Ap = Analysis.prototype;

    Ap.trace = function(writer) {
        this.bytecodes.forEach(function(code) {
            code.trace(writer);
        });
        writer.leave("}");
    }

    return Analysis;
})();