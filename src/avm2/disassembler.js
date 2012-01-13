var IndentingWriter = (function () {
    function indentingWriter() {
        this.padding = "";
    }
    
    indentingWriter.prototype.writeLn = function writeLn(str) {
        console.info(this.padding + str);
    };
    
    indentingWriter.prototype.enter = function enter(str) {
        console.info(this.padding + str);
        this.indent();
    };
    
    indentingWriter.prototype.leave = function leave(str) {
        this.outdent();
        console.info(this.padding + str);
    };
    
    indentingWriter.prototype.indent = function indent() {
        this.padding += " ";
    };
    
    indentingWriter.prototype.outdent = function outdent() {
        if (this.padding.length > 0) {
            this.padding = this.padding.substring(0, this.padding.length - 1);
        }
    };
    
    return indentingWriter;
})();

function getFlags(value, flags) {
    var str = "";
    for (var i = 0; i < flags.length; i++) {
        if (value & (1 << i)) {
            str += flags[i] + " ";
        }
    }
    if (str.length == 0) {
        return "NONE";
    }
    return str;
}

function traceMethodInfo(writer, constantPool, methodInfo) {
    var mi = methodInfo;
    writer.enter("methodInfo {");
    writer.writeLn("name: " + mi.name);
    writer.writeLn("flags: " + getFlags(mi.flags, "NEED_ARGUMENTS|NEED_ACTIVATION|NEED_REST|HAS_OPTIONAL|||SET_DXN|HAS_PARAM_NAMES".split("|")));
    writer.leave("}");
}

function traceMethodBodyInfo(writer, constantPool, methodBodyInfo) {
    var mbi = methodBodyInfo;
    writer.enter("methodBodyInfo {");
    traceMethodInfo(writer, constantPool, mbi.methodInfo);
    
    var code = new ABCStream(mbi.code);
    
    function readOperand(operand) {
        var value = 0;
        switch(operand.size) {
            case "u08": value = code.readU8(); break;
            case "s24": value = code.readS24(); break;
            case "u30": value = code.readU30(); break;
            case "u32": value = code.readU32(); break;
            default: assert (false); break;
        }
        var description = "";
        switch(operand.type) {
            case "": break;
            case "I": description = constantPool.ints[value]; break;
            case "U": description = constantPool.uints[value]; break;
            case "D": description = constantPool.doubles[value]; break;
            case "S": description = constantPool.strings[value]; break;
            case "N": description = constantPool.namespaces[value]; break;
            case "M": description = constantPool.multinames[value]; break;
            default: detail = "?"; break;
        }
        return operand.name + ":" + value + (description == "" ? "" : "(" + operand.type + ":" + description + ")");
    }
    
    while (code.remaining() > 0) {
        var bc = code.readU8();
        
        switch (bc) {
        default:
            var opcode = opcodeTable[bc];
            if (opcode) {
                var str = opcode.name;
                if (opcode.operands.length > 0) {
                    str += ": ";
                    for (var i = 0; i < opcode.operands.length; i++) {
                        str += readOperand(opcode.operands[i]) + " ";
                    }
                }
                writer.writeLn(str);
            }
        }
    }
    
    writer.leave("}");
}