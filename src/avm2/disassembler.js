var IndentingWriter = (function () {
    function indentingWriter(suppressOutput) {
        this.tab = "  ";
        this.padding = "";
        this.suppressOutput = suppressOutput;
    }

    indentingWriter.prototype.writeLn = function writeLn(str) {
        if (!this.suppressOutput) {
            console.info(this.padding + str);
        }
    };

    indentingWriter.prototype.enter = function enter(str) {
        if (!this.suppressOutput) {
            console.info(this.padding + str);
        }
        this.indent();
    };

    indentingWriter.prototype.leave = function leave(str) {
        this.outdent();
        if (!this.suppressOutput) {
            console.info(this.padding + str);
        }
    };

    indentingWriter.prototype.indent = function indent() {
        this.padding += this.tab;
    };

    indentingWriter.prototype.outdent = function outdent() {
        if (this.padding.length > 0) {
            this.padding = this.padding.substring(0, this.padding.length - this.tab.length);
        }
    };

    indentingWriter.prototype.writeArray = function writeArray(arr) {
        for (var i = 0, j = arr.length; i < j; i++) {
            this.writeLn(("" + i).padRight(' ', 3) + arr[i]);
        }
    };

    return indentingWriter;
})();

function traceArray(writer, name, array, abc) {
    if (array.length === 0) {
        return;
    }
    writer.enter(name + " {");
    array.forEach(function (a) {
        a.trace(writer, abc);
    });
    writer.leave("}");
}

AbcFile.prototype.trace = function trace(writer) {
    this.constantPool.trace(writer);
    traceArray(writer, "classes", this.classes);
    traceArray(writer, "instances", this.instances);
    traceArray(writer, "metadata", this.metadata);
    traceArray(writer, "scripts", this.scripts);
    traceArray(writer, "methods", this.methods, this);
};

ConstantPool.prototype.trace = function (writer) {
    writer.enter("constantPool {");
    for (var key in this) {
        /* Special-case namespaces to print out full names. */
        if (key === "namespaces") {
            writer.enter("namespaces {");
            this.namespaces.forEach(function (ns, i) {
                writer.writeLn(("" + i).padRight(' ', 3) +
                               (ns ? ns.nameAndKind() : "*"));
            });
            writer.leave("}");
        } else if (this[key] instanceof Array) {
            writer.enter(key + " " + this[key].length + " {");
            writer.writeArray(this[key]);
            writer.leave("}");
        }
    }
    writer.leave("}");
};

ClassInfo.prototype.trace = function (writer) {
    writer.enter("class " + this.init + "{");
    traceArray(writer, "traits", this.traits);
    writer.leave("}");
};

InstanceInfo.prototype.trace = function (writer) {
    writer.enter("instance " + this + " {");
    traceArray(writer, "traits", this.traits);
    writer.leave("}");
};

ScriptInfo.prototype.trace = function (writer) {
    writer.writeLn(this);
};

Trait.prototype.trace = function (writer) {
    writer.writeLn(this);
};

function traceAbc(writer, abc) {
    abc.trace(writer);
}

function traceOperand(operand, abc, code) {
    var value = 0;
    switch(operand.size) {
        case "u08": value = code.readU8(); break;
        case "s16": value = code.readU30Unsafe(); break;
        case "s24": value = code.readS24(); break;
        case "u30": value = code.readU30(); break;
        case "u32": value = code.readU32(); break;
        default: assert (false); break;
    }
    var description = "";
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
    return operand.name + ":" + value + (description === "" ? "" : " (" + description + ")");

}

function traceOperands(opcode, abc, code, rewind) {
    rewind = rewind || false;
    var old = code.position;
    var str = "";
    opcode.operands.forEach(function (op, i) {
        str += traceOperand(op, abc, code);
        if (i < opcode.operands.length - 1) {
            str += ", ";
        }
    });
    if (rewind) {
        code.seek(old);
    }
    return str;
}

MethodInfo.prototype.trace = function trace(writer, abc) {
    writer.enter("method" + (this.name ? " " + this.name : "") + " {");
    writer.writeLn("flags: " + getFlags(this.flags, "NEED_ARGUMENTS|NEED_ACTIVATION|NEED_REST|HAS_OPTIONAL|||SET_DXN|HAS_PARAM_NAMES".split("|")));

    if (!this.code) {
        writer.leave("}");
        return;
    }

    var code = new AbcStream(this.code);

    writer.enter("code {");
    while (code.remaining() > 0) {
        var bc = code.readU8();
        var opcode = opcodeTable[bc];
        var str, defaultOffset, offset, count;
        str = ("" + code.position).padRight(' ', 5);
        switch (bc) {
            case OP_lookupswitch:
                str += opcode.name + ": defaultOffset: " + code.readS24();
                count = code.readU30() + 1;
                for (var i = 0; i < count; i++) {
                    str += " offset: " + code.readS24();
                }
                writer.writeLn(str);
                break;
            default:
                if (opcode) {
                    str += opcode.name.padRight(' ', 20);
                    if (!opcode.operands) {
                        assert(false, "Opcode: " + opcode.name + " has undefined operands.");
                    } else {
                        if (opcode.operands.length > 0) {
                            str += traceOperands(opcode, abc, code);
                        }
                        writer.writeLn(str);
                    }
                } else {
                    assert(false, "Opcode: " + bc + " is not implemented.");
                }
                break;
        }
    }
    writer.leave("}");
    writer.leave("}");
}