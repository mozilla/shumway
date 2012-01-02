/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var Stream = (function () {
    function constructor(bytes) {
        this.bytes = bytes;
        this.pos = 0;
    }

    var decode;
    var tmp;

    constructor.prototype = {
        remaining: function () {
            return this.bytes.length - this.pos;
        },
        readU8: function() {
            return this.bytes[this.pos++];
        },
        readU32: function() {
            var result = this.readU8();
            if (result & 0x80) {
                result = result & 0x7f | this.readU8() << 7;
                if (result & 0x4000) {
                    result = result & 0x3fff | this.readU8() << 14;
                    if (result & 0x200000) {
                        result = result & 0x1fffff | this.readU8() << 21;
                        if (result & 0x10000000)
                            result = result & 0x0fffffff | this.readU8() << 28;
                    }
                }
            }
            return result & 0xffffffff;
        },
        readU30: function() {
            return this.readU32();
        },
        readS32: function() {
            return this.readU32();
        },
        readWord: function() {
            return this.readU8() |
                   (this.readU8() << 8) |
                   (this.readU8() << 16) |
                   (this.readU8() << 24);
        },
        readS24: function() {
            var u = this.readU8() |
                    (this.readU8() << 8) |
                    (this.readU8() << 16);
            return (u << 8) >> 8;
        },
        readDouble: function() {
            if (!decode) {
                // Setup the decode buffer for doubles.
                var b = ArrayBuffer(8);
                var i8 = Uint8Array(b);
                var i32 = Uint32Array(b);
                var f64 = Float64Array(b);
                i32[0] = 0x11223344;
                decode = ({ i32: i32, f64: f64, bigEndian: i8[0] == 0x11 });
            }
            if (decode.bigEndian) {
                decode.i32[0] = readWord();
                decode.i32[1] = readWord();
            } else {
                decode.i32[1] = readWord();
                decode.i32[0] = readWord();
            }
            return decode.f64[0];
        },
        readUTFString: function(length) {
            if (!tmp || tmp.length < length)
                tmp = Uint8Array(length);
            for (var i = 0; i < length; ++i)
                tmp[i] = this.readU8();
            var result = "";
            for (var i = 0; i < length; i++) {
                if (tmp[i] <= 0x7f) {
                    result += String.fromCharCode(tmp[i]);
                } else if (tmp[i] >= 0xc0) { // multibyte
                    var code;
                    if (tmp[i] < 0xe0) { // 2 bytes
                        code = ((tmp[i++] & 0x1f) << 6) |
                               (tmp[i] & 0x3f);
                    } else if (tmp[i] < 0xf0) { // 3 bytes
                        code = ((tmp[i++] & 0x0f) << 12) |
                               ((tmp[i++] & 0x3f) << 6) |
                               (tmp[i] & 0x3f);
                    } else { // 4 bytes
                        // turned into two characters in JS as surrogate pair
                        code = (((tmp[i++] & 0x07) << 18) |
                                ((tmp[i++] & 0x3f) << 12) |
                                ((tmp[i++] & 0x3f) << 6) |
                                (tmp[i] & 0x3f)) - 0x10000;
                        // High surrogate
                        result += String.fromCharCode(((code & 0xffc00) >>> 10) + 0xd800);
                        // Low surrogate
                        code = (code & 0x3ff) + 0xdc00;
                    }
                    result += String.fromCharCode(code);
                } // Otherwise it's an invalid UTF8, skipped.
            }
            return result;
        }
    };

    return constructor;
})();

const CONSTANT_Utf8               = 0x01;
const CONSTANT_Integer            = 0x03;
const CONSTANT_UInt               = 0x04;
const CONSTANT_PrivateNamespace   = 0x05;
const CONSTANT_Double             = 0x06;
const CONSTANT_QName              = 0x07; // ns::name, const ns, const name
const CONSTANT_Namespace          = 0x08;
const CONSTANT_Multiname          = 0x09; // [ns...]::name, const [ns...], const name
const CONSTANT_False              = 0x0A;
const CONSTANT_True               = 0x0B;
const CONSTANT_Null               = 0x0C;
const CONSTANT_QNameA             = 0x0D; // @ns::name, const ns, const name
const CONSTANT_MultinameA         = 0x0E; // @[ns...]::name, const [ns...], const name
const CONSTANT_RTQName            = 0x0F; // ns::name, var ns, const name
const CONSTANT_RTQNameA           = 0x10; // @ns::name, var ns, const name
const CONSTANT_RTQNameL           = 0x11; // ns::[name], var ns, var name
const CONSTANT_RTQNameLA          = 0x12; // @ns::[name], var ns, var name
const CONSTANT_NameL              = 0x13; // o[name], var name
const CONSTANT_NameLA             = 0x14; // @[name], var name
const CONSTANT_NamespaceSet       = 0x15;
const CONSTANT_PackageNamespace   = 0x16; // namespace for a package
const CONSTANT_PackageInternalNS  = 0x17;
const CONSTANT_ProtectedNamespace = 0x18;
const CONSTANT_ExplicitNamespace  = 0x19;
const CONSTANT_StaticProtectedNS  = 0x1A;
const CONSTANT_MultinameL         = 0x1B;
const CONSTANT_MultinameLA        = 0x1C;
const CONSTANT_ClassSealed        = 0x01;
const CONSTANT_ClassFinal         = 0x02;
const CONSTANT_ClassInterface     = 0x04;
const CONSTANT_ClassProtectedNs   = 0x08;

const TRAIT_Slot                  = 0;
const TRAIT_Method                = 1;
const TRAIT_Getter                = 2;
const TRAIT_Setter                = 3;
const TRAIT_Class                 = 4;
const TRAIT_Function              = 5;
const TRAIT_Const                 = 6;

const ATTR_Final                  = 0x01;
const ATTR_Override               = 0x02;
const ATTR_Metadata               = 0x04;

const SLOT_var                    = 0;
const SLOT_method                 = 1;
const SLOT_getter                 = 2;
const SLOT_setter                 = 3;
const SLOT_class                  = 4;
const SLOT_function               = 6;

const METHOD_Arguments            = 0x1;
const METHOD_Activation           = 0x2;
const METHOD_Needrest             = 0x4;
const METHOD_HasOptional          = 0x8;
const METHOD_IgnoreRest           = 0x10;
const METHOD_Native               = 0x20;
const METHOD_Setsdxns             = 0x40;
const METHOD_HasParamNames        = 0x80;

function parseAbcFile(b) {
    function checkMagic(b) {
        var magic = b.readWord();
        if (magic < (46<<16|15)) // Flash Player Brannan
            throw new Error("not an abc file. magic=" + Number(magic).toString(16));
    }
    function parseCpool(b) {
        var int32 = [0];
        var uint32 = [0];
        var float64 = [0];
        var strings = [""];
        var ns = [(void 0)];
        var nsset = [(void 0)];
        var names = [(void 0)];
        var i, n;

        // ints
        n = b.readU30();
        for (i = 1; i < n; ++i) {
            int32.push(b.readS32());
        }

        // uints
        n = b.readU30();
        for (i = 1; i < n; ++i)
            uint32.push(b.readU32());

        // doubles
        n = b.readU30();
        for ( i =1; i < n; ++i)
            float64.push(b.readDouble());

        // strings
        n = b.readU30();
        for (i = 1; i < n; ++i)
            strings.push(b.readUTFString(b.readU32()));

        // namespaces
        n = b.readU30();
        for (i = 1; i < n; ++i)
            ns.push({ nskind: b.readU8(), name: strings[b.readU30()] });

        // namespace sets
        n = b.readU30();
        for (i = 1; i < n; ++i) {
            var count = b.readU30();
            var nss = [];
            for (var j = 0; j < count; ++j)
                nss.push(ns[b.readU30()]);
            nsset.push(nss);
        }

        // multinames
        n = b.readU30();
        for (i = 1; i < n; ++i) {
            var kind = b.readU8();
            switch (kind) {
            case CONSTANT_QName: case CONSTANT_QNameA:
                names[i] = { idx: i, ns: ns[b.readU30()], name: strings[b.readU30()], kind: kind };
                break;
            case CONSTANT_RTQName: case CONSTANT_RTQNameA:
                names[i] = { idx: i, name: strings[b.readU30()], kind: kind };
                break;
            case CONSTANT_RTQNameL: case CONSTANT_RTQNameLA:
                names[i] = { idx: i, kind: kind };
                break;
            case CONSTANT_Multiname: case CONSTANT_MultinameA:
                names[i] = { idx: i, name: strings[b.readU30()], nsset: nsset[b.readU30()], kind: kind };
                break;
            case CONSTANT_MultinameL: case CONSTANT_MultinameLA:
                names[i] = { idx: i, nsset: nsset[b.readU30()], kind: kind };
                break;
            }
        }

        return { int32: int32, uint32: uint32, float64: float64, strings: strings,
                 names: names, ns: ns };
    }
    function parseMethodInfo(constants, b) {
        var paramcount = b.readU30();
        var returntype = b.readU30();
        var params = [];
        for (var i = 0; i < paramcount; ++i)
            params.push(b.readU30());

        var name = constants.strings[b.readU30()];
        var flags = b.readU8();

        var optionalcount = 0;
        var optionals = null;
        if (flags & METHOD_HasOptional) {
            optionalcount = b.readU30();
            optionals = [];
            for (var i = 0; i < optionalcount; ++i)
                optionals[i] = { val: b.readU30(), kind:b.readU8() };
        }

        var paramnames = null;
        if (flags & METHOD_HasParamNames) {
            paramnames = [];
            for (var i = 0; i < paramcount; ++i)
                paramnames[i] = constants.strings[b.readU30()];
        }

        return { name: name, params: params, returntype: returntype, flags: flags,
                 optionals: optionals, paramnames: paramnames };
    }
    function parseMetadataInfo(b) {
        var name = b.readU30();
        var itemcount = b.readU30();

        var items = [];
        for (var i = 0; i < itemcount; ++i)
            items[i] = { key: readU30(), value: readU30() };

        return { name: name, items: items };
    }
    function parseTrait(b) {
        var name = b.readU30();
        var tag = b.readU8();
        var kind = tag & 0x0F;
        var attrs = (tag>>4) & 0x0F;
        var trait;

        switch (kind) {
        case TRAIT_Slot:
        case TRAIT_Const:
            var slotid = b.readU30();
            var typename = b.readU30();
            var value = b.readU30();
            var kind = null;
            if (value != 0)
                kind = b.readU8();
            trait = { name: name, attrs: attrs, kind: kind, slotid: slotid,
                      typename: typename, value: value };
            break;
        case TRAIT_Method:
        case TRAIT_Setter:
        case TRAIT_Getter:
            var dispid = b.readU30();
            var methinfo = b.readU30();
            trait = { name: name, attrs: attrs, kind: kind, dispid: dispid,
                      methinfo: methinfo };
            break;
        case TRAIT_Class:
            var slotid = b.readU30();
            var classinfo = b.readU30();
            trait = { name: name, attrs: attrs, kind: kind, slotid: slotid,
                      classinfo: classinfo };
            break;
        case TRAIT_Function: // TODO
            b.readU30();
            b.readU30();
            break;
        }

        if (attrs & ATTR_Metadata) {
            var metadata = [];
            var metadatacount = b.readU30();
            for (var i = 0; i < metadatacount; ++i)
                metadata.push(b.readU30());
            trait.metadata = metadata;
        }

        return trait;
    }
    function parseTraits(b, target) {
        var traitcount = b.readU30();
        var traits = [];
        for (var i = 0; i < traitcount; ++i)
            traits.push(parseTrait(b));
        target.traits = traits;
    }
    function parseInstanceInfo(b) {
        var name = b.readU30();
        var superclass = b.readU30();
        var flags = b.readU8();
        var protectedNS = 0;
        if (flags & 8)
            protectedNS = b.readU30();

        var interfacecount = b.readU30();
        var interfaces = [];
        for (var i = 0; i < interfacecount; ++i)
            interfaces[i] = b.readU30();
        var iinit = b.readU30();
        var instance_info = { name: name, superclass: superclass, flags: flags,
                              protectedNS: protectedNS, interfaces: interfaces,
                              iinit: iinit };
        parseTraits(b, instance_info);
        return instance_info;
    }
    function parseClassInfo(b) {
        var cinit = b.readU30();
        var class_info = { cinit: cinit };
        parseTraits(b, class_info);
        return class_info;
    }
    function parseScriptInfo(b) {
        var script = { init: b.readU30() };
        parseTraits(b, script);
        return script;
    }
    function parseException(b) {
        return { start: b.readU30(), end: b.readU30(), target: b.readU30(),
                 typename: b.readU30(), name: b.readU30() };
    }
    function parseMethodBody(methods, b) {
        var mb = { method: methods[b.readU30()], maxStack: b.readU30(), localCount: b.readU30(),
                   initScopeDepth: b.readU30(), maxScopeDepth: b.readU30() };

        var code_len = b.readU30();
        var code = Uint8Array(code_len);
        for (var i = 0; i < code_len; ++i)
            code[i] = b.readU8();
        mb.code = code;

        var exceptions = [];
        var excount = b.readU30();
        for (var i = 0; i < excount; ++i)
            exceptions = parseException(b);
        mb.exceptions = exceptions;

        parseTraits(b, mb);
        return mb;
    }

    checkMagic(b);

    var constants = parseCpool(b);
    var methods = [];
    var metadata = [];
    var instances = [];
    var classes = [];
    var scripts = [];
    var methodBodies = [];
    var i, n;

    // MethodInfos
    n = b.readU30();
    for (i = 0; i < n; ++i)
        methods.push(parseMethodInfo(constants, b));

    // MetaDataInfos
    n = b.readU30();
    for (i = 0; i < n; ++i)
        metadata.push(parseMetadata(b));

    // InstanceInfos
    n = b.readU30();
    for (i = 0; i < n; ++i)
        instances.push(parseInstanceInfo(b));

    // ClassInfos
    for (i = 0; i < n; ++i)
        classes.push(parseClassInfo(b));

    // ScriptInfos
    n = b.readU30();
    for (i = 0; i < n; ++i)
        scripts.push(parseScriptInfo(b));

    // MethodBodies
    n = b.readU30();
    for (i = 0; i < n; ++i)
        methodBodies.push(parseMethodBody(methods, b));

    return { constants: constants, methods: methods, metadata: metadata, instances: instances,
             classes: classes, scripts: scripts, methodBodies: methodBodies };
}

function compileAbc(abc) {
    var constants = abc.constants;
    var strings = constants.strings;
    var names = constants.names;

    function compileBody(body) {
        var maxStack = body.maxStack;
        var localCount = body.localCount;
        var src = "";

        src += "function f(ctx,";
        for (var i = 0; i < localCount; ++i)
            src += ("L" + i + ((i + 1 < localCount) ? "," : ""));
        src += ") {\n";
        src += "var "; // temporary
        for (var i = 0; i < maxStack; ++i)
            src += ("S" + i + ((i + 1 < maxStack) ? "," : ""));
        src += ";\n";
        src += "var label = 0;\n";
        src += "again: while (true) switch (label) {\n";
        src += "case 0:\n";

        function emit(code) {
            src += code;
            src += ";\n";
        }

        function local(n) {
            return "L" + n;
        }

        var sp = 0;

        function push() {
            return "S" + (sp++);
        }
        function pop() {
            return "S" + (--sp);
        }

        function assign(lval, rval) {
            emit(lval + "=" + rval);
        }

        var stream = new Stream(body.code);
        var start = stream.pos;

        function here() {
            return stream.pos - start;
        }
        function target() {
            var offset = stream.readS24();
            return here() + offset;
        }
        function if1(cond) {
            emit("if (" + cond + pop() + ") { label = " + target() + "; continue again; }");
        }
        function if2(neg, cond) {
            var v2 = pop(), v1 = pop();
            emit("if (" + neg + "(" + v1 + cond + v2 + ")) { label = " + target() + "; continue again; }");
        }
        function unary(expr) {
            var val = pop();
            assign(push(), expr.replace("$1", val, "g"));
        }
        function binary(expr) {
            var v2 = pop(), v1 = pop();
            assign(push(), expr.replace("$1", v1, "g").replace("$2", v2, "g"));
        }

        function quote(s) {
            return "\"" + s + "\"";
        }

        function popN(n) {
            var args = [];
            while (n--)
                args.push(pop());
            return args;
        }

        function multiname(index) {
            var mn = names[index ? index : stream.readU30()];
            if (!mn.name)
                emit("var name = " + pop());
            if (!mn.ns && !mn.nsset)
                emit("var ns = " + pop());
            return mn;
        }

        function mangle(ns, name) {
            return ns + "$" + name.replace("$", "_$", "g");
        }

        function propName(obj, mn) {
            if (mn.ns && mn.name)
                return mangle(mn.ns, mn.name);
            var ns = mn.ns ? quote(mn.ns) : (mn.nsset ? ("ctx.resolveNSSet(" + obj + "," + mn.idx + ")") : "ns");
            var name = mn.name ? quote(mn.name) : "name";
            return "ctx.mangle(" + ns + "," + name + ")";
        }

        function prop(obj, mn) {
            return obj + ((mn.ns && mn.name) ?
                          "." + mangle(mn.ns, mn.name) :
                          "[" + propName(obj, mn) + "]");
        }

        function call(fun, receiver, args) {
            return fun + "(" + args.reverse().join(",") + ")";
        }

        function construct(fun, args) {
            return "new " + call(fun, "(void 0)", args);
        }

        while (stream.remaining() > 0) {
            var h = here();
            if (h)
                src += "case " + h + ":\n";
            var op = stream.readU8();
            src += "// " + Number(op).toString(16) + "\n";
            switch (op) {
            case 0x02: // nop
                break;
            case 0x03: // throw
                emit("throw(" + pop() + ")");
                break;
            case 0x04: // getsuper
                var mn = multiname();
                var obj = pop();
                assign(push(), prop("ctx.super(" + obj + ")", mn));
                break;
            case 0x05: // setsuper
                var val = pop();
                var mn = multiname();
                var obj = pop();
                assign(prop("ctx.super(" + obj + ")", mn), val);
                break;
            case 0x08: // kill
                assign(local(stream.readU30()), "(void 0)");
                break;
            case 0x09: // label
                break;
            case 0x0c: // ifnlt
                if2("!", "<");
                break;
            case 0x0d: // ifnle
                if2("!", "<=");
                break;
            case 0x0e: // ifngt
                if2("!", ">");
                break;
            case 0x0f: // ifnge
                if2("!", ">=");
                break;
            case 0x10: // goto
                emit("label = " + target() + "; continue again");
                break;
            case 0x11: // iftrue
                if1("!!");
                break;
            case 0x12: // iffalse
                if1("!");
                break;
            case 0x13: // ifeq
                if2("", "==");
                break;
            case 0x14: // ifne
                if2("", "!=");
                break;
            case 0x15: // iflt
                if2("", "<");
                break;
            case 0x16: // ifle
                if2("", "<=");
                break;
            case 0x17: // ifgt
                if2("", ">");
                break;
            case 0x18: // ifge
                if2("", ">=");
                break;
            case 0x19: // ifstricteq
                if2("", "===");
                break;
            case 0x1a: // ifstrictne
                if2("", "!==");
                break;
            // case 0x1b: lookupswitch
            case 0x1c: // pushwith
                emit("ctx.pushwith(" + pop() + ")");
                break;
            case 0x1d: // popscope
                emit("ctx.popscope()");
                break;
            case 0x1e: // nextname
                var index = pop(), obj = pop();
                assign(push(), "nextname(" + obj + "," + index + ")");
                break;
            case 0x1f: // hasnext
                var index = pop(), obj = pop();
                assign(push(), "hasnext(" + obj + "," + index + ")");
                break;
            case 0x20: // pushnull
                assign(push(), "null");
                break;
            case 0x21: // pushundefined
                assign(push(), "undefined");
                break;
            case 0x23: // nextvalue
                assign(push(), "nextvalue(" + obj + "," + index + ")");
                break;
            case 0x24: // pushbyte
                assign(push(), stream.readU8());
                break;
            case 0x25: // pushshort
                assign(push(), stream.readU30());
                break;
            case 0x26: // pushtrue
            case 0x27: // pushfalse
                assign(push(), op == 0x26);
                break;
            case 0x28: // pushnan
                assign(push(), "NaN");
                break;
            case 0x29: // pop
                pop();
                break;
            case 0x2a: // dup
                var a = pop();
                assign(push(), a);
                assign(push(), a);
                break;
            case 0x2b: // swap
                var a = pop(), b = pop();
                assign(push(), a);
                assign(push(), b);
                break;
            case 0x2c: // pushstring
                assign(push(), quote(constants.strings[stream.readU30()]));
                break;
            case 0x2d: // pushint
                assign(push(), constants.int32[stream.readU30()]);
                break;
            case 0x2e: // pushuint
                assign(push(), constants.uint32[stream.readU30()]);
                break;
            case 0x2f: // pushdouble
                assign(push(), constants.doubles[stream.readU30()]);
                break;
            case 0x30: // pushscope
                emit("ctx.pushscope(" + pop() + ")");
                break;
            case 0x31: // pushnamespace
                assign(push(), constants.ns[stream.readU30()]);
                break;
            case 0x32: // hasnext2
                var obj = stream.readU30(), index = stream.readU30();
                assign(local(index), "ctx.hasnext2(" + local(obj) + "," + local(index) + ")");
                assign(local(obj), "ctx.hasnext2_obj");
                break;
            case 0x40: // newfunction
                assign(push(), "ctx.clone(" + stream.readU30() + ")");
                break;
            case 0x41: // call
                var argc = stream.readU30();
                var args = popN(argc);
                var receiver = pop();
                var fun = pop();
                assign(push(), call(fun, receiver, args));
                break;
            case 0x42: // construct
                var argc = stream.readU30();
                var args = popN(argc);
                var fun = pop();
                assign(push(), construct(fun, args));
                break;
            case 0x43: // callmethod
            case 0x44: // callstatic
            case 0x45: // callsuper
            case 0x4e: // callsupervoid
                var index = stream.readU30(), argc = stream.readU30();
                var args = popN(argc);
                var receiver = pop();
                switch (op) {
                case 0x43:
                    var x = receiver + ".methods";
                    break;
                case 0x44:
                    var x = "ctx.methods";
                    break;
                case 0x45:
                case 0x46:
                    var x = "ctx.super(" + receiver + ")" + ".methods";
                    break;
                }
                var x = call(x + "[" + index + "]", receiver, args);
                (op == 0x46) ? emit(x) : assign(push(), x);
                break;
            case 0x46: // callproperty
            case 0x4c: // callproplex
            case 0x4f: // callpropvoid
                var index = stream.readU30(), argc = stream.readU30();
                var args = popN(argc);
                var mn = multiname(index);
                var obj = pop();
                var x = call(prop(obj, mn), obj, args);
                (op == 0x4f) ? emit(x) : assign(push(), x);
                break;
            case 0x47: // returnvoid
                emit("return");
                break;
            case 0x48: // return value
                emit("return " + pop());
                break;
            case 0x49: // constructsuper
                var argc = stream.readU30();
                var args = popN(argc);
                var obj = pop();
                emit(call("ctx.super(" + obj + ").constructor", obj, args));
                break;
            case 0x4a: // constructprop
                var index = stream.readU30(), argc = stream.readU30();
                var args = popN(argc);
                var mn = multiname(index);
                var obj = pop();
                assign(push(), construct(prop(obj, mn), args));
                break;
            case 0x55: // newobject
                var argc = stream.readU30();
                var x = "";
                while (argc--) {
                    var val = pop();
                    x = "obj[" + pop() + "] = " + val + "; " + x;
                }
                assign(push(), "var obj = ({}); " + x + "obj");
                break;
            case 0x56: // newarray
                var argc = stream.readU30();
                assign(push(), "[" + popN(argc).reverse().join(",") + "]");
                break;
            case 0x57: // newactivation
                assign(push(), "ctx.newactivation()");
                break;
            case 0x58: // newclass
                var index = stream.readU30();
                assign(push(), "ctx.newclass(" + stream.readU30() + "," + pop());
                break;
            case 0x59: // getdescendants
                var mn = multiname();
                var obj = pop();
                assign(push(), "ctx.getdescendants(" + obj + "," + propName(obj, mn) + ")");
                break;
            case 0x5a: // newcatch
                assign(push(), "ctx.newcatch(" + stream.readU30() + ")");
                break;
            case 0x5d: // findpropstrict
            case 0x5e: // findproperty
                var mn = multiname();
                var helper = (op == 0x5d) ? "findpropstrict" : "findproperty";
                assign(push(), "ctx." + helper + "(" + propName("ctx.scope", mn) + ")");
                break;
            case 0x60: // getlex
                var mn = multiname();
                assign(push(), prop("ctx.scope", mn));
                break;
            case 0x61: // setproperty
                var val = pop();
                var mn = multiname();
                var obj = pop();
                assign(prop(obj, mn), val);
                break;
            case 0x62: // getlocal
                assign(push(), local(stream.readU30()));
                break;
            case 0x63: // setlocal
                assign(local(stream.readU30()), pop());
                break;
            case 0x64: // getglobalscope
                assign(push(), "ctx.global");
                break;
            case 0x65: // getscopeobject
                assign(push(), "ctx.getscopeobject[" + stream.readU30() + "]");
                break;
            case 0x66: // getproperty
            case 0x67: // initproperty
                var mn = multiname();
                var obj = pop();
                assign(push(), prop(obj, mn));
                break;
            case 0x6a: // deleteproperty
                var mn = multiname();
                var obj = pop();
                emit("delete " + prop(obj, mn));
                break;
            case 0x6c: // getslot
                var obj = pop();
                assign(push(), obj + ".slot" + stream.readU30());
                break;
            case 0x6d: // setslot
                var val = pop();
                var obj = pop();
                assign(obj + ".slot" + stream.readU30(), val);
                break;
            case 0x6e: // getglobalslot
                assign(push(), "ctx.global.slot" + stream.readU30());
                break;
            case 0x6f: // setglobalslot
                emit("ctx.global.slot" + stream.readU30(), pop());
                break;
            case 0x70: // convert_s
            case 0x71: // esc_xelem
            case 0x72: // esc_xattr
                unary("'' + $1");
                break;
            case 0x73: // convert_i
                unary("0|$1");
                break;
            case 0x74: // convert_u
                unary("$1 >>> 0");
                break;
            case 0x75: // convert_d
                unary("0 + $1");
                break;
            case 0x76: // convert_b
                unary("$1?true:false");
                break;
            case 0x77: // convert_o
                unary("Object.valueOf.call($1)");
                break;
            case 0x78: // checkfilter
                unary("($1.(0),$1)");
                break;
            case 0x80: // coerce
                var val = pop();
                var mn = multiname();
                assign(push(), "ctx.coerce(" + val + "," + quote(propName(null, mn)) + ")");
                break;
            case 0x82: // coerce_a
                break;
            case 0x85: // coerce_s
                unary("($1 == null || $1 == undefined) ? null : (\"\" + $1)");
                break;
            case 0x86: // astype
                var val = pop();
                var mn = multiname();
                assign(push(), "ctx.astype(" + val + "," + quote(propName(null, mn)) + ")");
                break;
            case 0x87: // astypelate
                var type = pop();
                var val = pop();
                assign(push(), "ctx.astypelate(" + val + "," + type);
                break;
            case 0x90: // negate
                unary("-$1");
                break;
            case 0x91: // increment
                unary("$1 + 1");
                break;
            case 0x92: // inclocal
                emit("++" + local(stream.readU30()));
                break;
            case 0x93: // decrement
                unary("$1 - 1");
                break;
            case 0x94: // declocal
                emit("--" + local(stream.readU30()));
                break;
            case 0x95: // typeof
                unary("typeof $1");
                break;
            case 0x96: // not
                unary("!!$1");
                break;
            case 0x97: // bitnot
                unary("~$1");
                break;
            case 0xa0: // add
                binary("$1+$2");
                break;
            case 0xa1: // substract
                binary("$1-$2");
                break;
            case 0xa2: // multiply
                binary("$1*$2");
                break;
            case 0xa3: // divide
                binary("$1/$2");
                break;
            case 0xa4: // modulo
                binary("$1%$2");
                break;
            case 0xa5: // lshift
                binary("$1<<$2");
                break;
            case 0xa6: // rshift
                binary("$1>>$2");
                break;
            case 0xa7: // urshift
                binary("$1>>>$2");
                break;
            case 0xa8: // bitand
                binary("$1&$2");
                break;
            case 0xa9: // bitor
                binary("$1|$2");
                break;
            case 0xaa: // bitxor
                binary("$1^$2");
                break;
            case 0xab: // equals
                binary("$1==$2");
                break;
            case 0xac: // strictequals
                binary("$1===$2");
                break;
            case 0xad: // lessthan
                binary("$1<$2");
                break;
            case 0xae: // lessequals
                binary("$1<=$2");
                break;
            case 0xaf: // greaterequals
                binary("$1>=$2");
                break;
            case 0xb1: // instanceof
                binary("$1 instanceof $2");
                break;
            case 0xb2: // istype
                var mn = multiname();
                unary("ctx.istype($1," + quote(propName(null, mn)) + ")");
                break;
            case 0xb3: // istypelate
                var type = pop();
                unary("ctx.istype($1," + type);
                break;
            case 0xb4: // in
                binary("$1 in $2");
                break;
            case 0xc0: // increment_i
                unary("(0|$1)+1");
                break;
            case 0xc1: // decrement_i
                unary("(0|$1)-1");
                break;
            case 0xc2: // inclocal_i
                var ref = stream.readU30();
                emit(ref + "|=0");
                emit("++" + ref);
                break;
            case 0xc3: // declocal_i
                var ref = stream.readU30();
                emit(ref + "|=0");
                emit("--" + ref);
                break;
            case 0xc4: // negate_i
                unary("-(0|$1)");
                break;
            case 0xc5: // add_i
                binary("(0|$1)+(0|$2)");
                break;
            case 0xc6: // subtract_i
                binary("(0|$1)-(0|$2)");
                break;
            case 0xc7: // multiply_i
                binary("(0|$1)*(0|$2)");
                break;
            case 0xd0: case 0xd1: case 0xd2: case 0xd3: // getlocalX
                assign(push(), local(op - 0xd0));
                break;
            case 0xd4: case 0xd5: case 0xd6: case 0xd7: // setlocalX
                assign(local(op - 0xd4), pop());
                break;
            case 0xef:
                stream.readU8(); // debug_type
                stream.readU30(); // index
                stream.readU8(); // reg
                stream.readU30(); // extra
                break;
            case 0xf0:
                stream.readU30(); // linenum
                break;
            case 0xf1:
                stream.readU30(); // debugfile
                break;
            default:
                print(src);
                throw new Error("not implemented: " + Number(op).toString(16));
            }
        }
        src += "}\n}\n";
        print(src);
        return src;
    }

    // Compile all method bodies
    var methodBodies = abc.methodBodies;
    var length = methodBodies.length;
    for (var n = 0; n < length; ++n)
        methodBodies[n].compiled = Function(compileBody(methodBodies[n]));

    //compile(methods[scripts[0].init]);
    return abc;
}

try {
    var bytes = snarf("tests/bitops-bits-in-byte.abc", "binary");
    var abc = parseAbcFile(new Stream(bytes));
    compileAbc(abc);
} catch (e) {
    print(e);
    print(e.stack);
}
