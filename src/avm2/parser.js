/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

function parseAbcFile(bytes) {
    var Stream = (function () {
        function constructor(bytes) {
            this.bytes = bytes;
            this.pos = 0;
        }

        var decode;

        constructor.prototype = {
            remaining: function () {
                return this.bytes.length - this.pos;
            },
            readU8: function() {
                return this.bytes[this.pos++];
            },
            readU32: function() {
                return this.readS32() >>> 0;
            },
            readU30: function() {
                var result = this.readU32();
                if (result & 0xc0000000) {
                    throw "Corrupt ABC File";
                }
                return result;
            },
            /**
             * Read a variable-length encoded 32-bit signed integer. The value may use one to five bytes (little endian), 
             * each contributing 7 bits. The most significant bit of each byte indicates that the next byte is part of
             * the value. The spec indicates that the most significant bit of the last byte to be read is sign extended
             * but this turns out not to be the case in the real implementation, for instance 0x7f should technically be
             * -1, but instead it's 127. Moreover, what happens to the remaining 4 high bits of the fifth byte that is
             * read? Who knows, here we'll just stay true to the Tamarin implementation.
             */
            readS32: function() {
                var result = this.readU8();
                if (result & 0x80) {
                    result = result & 0x7f | this.readU8() << 7;
                    if (result & 0x4000) {
                        result = result & 0x3fff | this.readU8() << 14;
                        if (result & 0x200000) {
                            result = result & 0x1fffff | this.readU8() << 21;
                            if (result & 0x10000000) {
                                result = result & 0x0fffffff | this.readU8() << 28;
                                result = result & 0xffffffff;
                            }
                        }
                    }
                }
                return result;
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
                // XXX: this code is not working.
                // Should probably treat the data as 8 bytes rather than
                // two words. Given that this.bytes is a typed array, 
                // we can optimize this, if the endianness is right.
                if (!decode) {
                    // Setup the decode buffer for doubles.
                    var b = new ArrayBuffer(8);
                    var i8 = new Uint8Array(b);
                    var i32 = new Uint32Array(b);
                    var f64 = new Float64Array(b);
                    i32[0] = 0x11223344;
                    decode = ({ i32: i32, f64: f64, bigEndian: i8[0] == 0x11 });
                }
                if (decode.bigEndian) {
                    decode.i32[0] = this.readWord();
                    decode.i32[1] = this.readWord();
                } else {
                    decode.i32[1] = this.readWord();
                    decode.i32[0] = this.readWord();
                }

                var result = decode.f64[0];
                return result;
            },
            readUTFString: function(length) {
                var result = "", end = this.pos + length;
                
                while(this.pos < end) {
                    var c = this.bytes[this.pos++];
                    if (c <= 0x7f) {
                        result += String.fromCharCode(c);
                    }
                    else if (c >= 0xc0) { // multibyte
                        var code;
                        if (c < 0xe0) { // 2 bytes
                            code = ((c & 0x1f) << 6) |
                                (this.bytes[this.pos++] & 0x3f);
                        }
                        else if (c < 0xf0) { // 3 bytes
                            code = ((c & 0x0f) << 12) |
                                ((this.bytes[this.pos++] & 0x3f) << 6) |
                                (this.bytes[this.pos++] & 0x3f);
                        } else { // 4 bytes
                            // turned into two characters in JS as surrogate pair
                            code = (((c & 0x07) << 18) |
                                    ((this.bytes[this.pos++] & 0x3f) << 12) |
                                    ((this.bytes[this.pos++] & 0x3f) << 6) |
                                    (this.bytes[this.pos++] & 0x3f)) - 0x10000;
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

        return { int32: int32, uint32: uint32, doubles: float64, strings: strings,
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
            items[i] = { key: b.readU30(), value: b.readU30() };

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
        var code = new Uint8Array(code_len);
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

    var b = new Stream(bytes);
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
        metadata.push(parseMetadataInfo(b));

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

    return {
        constants: constants,
        methods: methods,
        metadata: metadata,
        instances: instances,
        classes: classes,
        scripts: scripts,
        methodBodies: methodBodies
    };
}
