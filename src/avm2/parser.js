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

    function parseTrait(stream) {
        var name = stream.readU30();
        var tag = stream.readU8();
        var kind = tag & 0x0F;
        var attrs = (tag >> 4) & 0x0F;
        var trait;

        switch (kind) {
        case TRAIT_Slot:
        case TRAIT_Const:
            var slotid = stream.readU30();
            var typename = stream.readU30();
            var value = stream.readU30();
            var kind = null;
            if (value != 0)
                kind = stream.readU8();
            trait = { name: name, attrs: attrs, kind: kind, slotid: slotid,
                      typename: typename, value: value };
            break;
        case TRAIT_Method:
        case TRAIT_Setter:
        case TRAIT_Getter:
            var dispid = stream.readU30();
            var methinfo = stream.readU30();
            trait = { name: name, attrs: attrs, kind: kind, dispid: dispid,
                      methinfo: methinfo };
            break;
        case TRAIT_Class:
            var slotid = stream.readU30();
            var classinfo = stream.readU30();
            trait = { name: name, attrs: attrs, kind: kind, slotid: slotid,
                      classinfo: classinfo };
            break;
        case TRAIT_Function: // TODO
            stream.readU30();
            stream.readU30();
            break;
        }

        if (attrs & ATTR_Metadata) {
            var metadata = [];
            var metadatacount = stream.readU30();
            for (var i = 0; i < metadatacount; ++i)
                metadata.push(stream.readU30());
            trait.metadata = metadata;
        }

        return trait;
    }
    
    function parseTraits(stream, target) {
        var traitCount = stream.readU30();
        var traits = [];
        for (var i = 0; i < traitCount; ++i)
            traits.push(parseTrait(stream));
        target.traits = traits;
    }
    
    var ConstantPool = (function constantPool() {
        function constructor(stream) {
            var i, n;

            // ints
            var ints = [0];
            n = stream.readU30();
            for (i = 1; i < n; ++i) {
                ints.push(stream.readS32());
            }

            // uints
            var uints = [0];
            n = stream.readU30();
            for (i = 1; i < n; ++i) {
                uints.push(stream.readU32());
            }

            // doubles
            var doubles = [0];
            n = stream.readU30();
            for (i = 1; i < n; ++i) {
                doubles.push(stream.readDouble());
            }

            // strings
            var strings = [""];
            n = stream.readU30();
            for (i = 1; i < n; ++i) {
                strings.push(stream.readUTFString(stream.readU32()));
            }

            // namespaces
            var namespaces = [(void 0)];
            n = stream.readU30();
            for (i = 1; i < n; ++i) {
                namespaces.push({ kind: stream.readU8(), name: strings[stream.readU30()] });
            }

            // namespace sets
            var namespaceSets = [(void 0)];
            n = stream.readU30();
            for (i = 1; i < n; ++i) {
                var count = stream.readU30();
                var set = [];
                for (var j = 0; j < count; ++j) {
                    set.push(namespaces[stream.readU30()]);
                }
                namespaceSets.push(set);
            }

            // multinames
            var multinames = [(void 0)];
            n = stream.readU30();
            for (i = 1; i < n; ++i) {
                var kind = stream.readU8();
                switch (kind) {
                case CONSTANT_QName: case CONSTANT_QNameA:
                    multinames[i] = { idx: i, namespace: namespaces[stream.readU30()], name: strings[stream.readU30()], kind: kind };
                    break;
                case CONSTANT_RTQName: case CONSTANT_RTQNameA:
                    multinames[i] = { idx: i, name: strings[stream.readU30()], kind: kind };
                    break;
                case CONSTANT_RTQNameL: case CONSTANT_RTQNameLA:
                    multinames[i] = { idx: i, kind: kind };
                    break;
                case CONSTANT_Multiname: case CONSTANT_MultinameA:
                    multinames[i] = { idx: i, name: strings[stream.readU30()], namespaceSet: namespaceSets[stream.readU30()], kind: kind };
                    break;
                case CONSTANT_MultinameL: case CONSTANT_MultinameLA:
                    multinames[i] = { idx: i, nsset: namespaceSets[stream.readU30()], kind: kind };
                    break;
                }
            }

            this.ints = ints;
            this.uints = uints;
            this.doubles = doubles;
            this.strings = strings;
            this.namespaces = namespaces;
            this.namespaceSets = namespaceSets;
            this.multinames = multinames;
        }
        
        constructor.prototype = {
            
        };
        
        return constructor;
    })();
    
    var MethodInfo = (function methodInfo() {
        function constructor(cp, stream) {
            var paramcount = stream.readU30();
            var returntype = stream.readU30();
            var params = [];
            for (var i = 0; i < paramcount; ++i)
                params.push(stream.readU30());
    
            var name = cp.strings[stream.readU30()];
            var flags = stream.readU8();
    
            var optionalcount = 0;
            var optionals = null;
            if (flags & METHOD_HasOptional) {
                optionalcount = stream.readU30();
                optionals = [];
                for (var i = 0; i < optionalcount; ++i) {
                    optionals[i] = { val: stream.readU30(), kind:stream.readU8() };
                }
            }
    
            var paramnames = null;
            if (flags & METHOD_HasParamNames) {
                paramnames = [];
                for (var i = 0; i < paramcount; ++i) {
                    paramnames[i] = cp.strings[stream.readU30()];
                }
            }
    
            this.name = name;
            this.params = params;
            this.returntype = returntype;
            this.flags = flags;
            this.optionals = optionals;
            this.paramnames = paramnames;
        }
        
        constructor.prototype = {
            
        };
        
        return constructor;
    })();

    
    var MetaDataInfo = (function metaDataInfo() {
        function constructor(stream) {
            var name = stream.readU30();
            var itemcount = stream.readU30();
            
            var items = [];
            for (var i = 0; i < itemcount; ++i) {
                items[i] = { key: stream.readU30(), value: stream.readU30() };
            }

            this.name = name;
            this.items = items;
        }
        return constructor;
    })();
    
    var InstanceInfo = (function instanceInfo() {
        function constructor(stream) {
            this.name = stream.readU30();
            this.superclass = stream.readU30();
            this.flags = stream.readU8();
            this.protectedNS = 0;
            if (this.flags & 8)
                this.protectedNS = stream.readU30();

            var interfaceCount = stream.readU30();
            this.interfaces = [];
            for (var i = 0; i < interfaceCount; ++i)
                this.interfaces[i] = stream.readU30();
            this.iinit = stream.readU30();
            parseTraits(stream, this);
        }
        return constructor;
    })();

    var ClassInfo = (function classInfo() {
        function constructor(stream) {
            this.cinit = stream.readU30();
            parseTraits(stream, this);
        }
        return constructor;
    })();
    
    var ScriptInfo = (function scriptInfo() {
        function constructor(stream) {
            this.init = stream.readU30();
            parseTraits(stream, this);
        }
        return constructor;
    })();

    var MethodBody = (function methodBody() {
        function parseException(stream) {
            return {
                start: stream.readU30(), 
                end: stream.readU30(), 
                target: stream.readU30(),
                typename: stream.readU30(), 
                name: stream.readU30()
            };
        }
        
        function constructor(methods, stream) {
            this.methodInfo = methods[stream.readU30()];
            this.maxStack = stream.readU30();
            this.localCount = stream.readU30();
            this.initScopeDepth = stream.readU30();
            this.maxScopeDepth = stream.readU30();

            var code = new Uint8Array(stream.readU30());
            for (var i = 0; i < code.length; ++i) { 
                code[i] = stream.readU8();
            }
            this.code = code;
    
            var exceptions = [];
            var exceptionCount = stream.readU30();
            for (var i = 0; i < exceptionCount; ++i) {
                exceptions = parseException(stream);
            }
            this.exceptions = exceptions;
            parseTraits(stream, this);
        }
        return constructor;
    })();

    var AbcFile = (function abcFile() {
        function constructor(bytes) {
            var n;
            var stream = new Stream(bytes);
            checkMagic(stream);
            this.constantPool = new ConstantPool(stream);
            
            // Method Infos
            this.methods = [];
            n = stream.readU30();
            for (i = 0; i < n; ++i) {
                this.methods.push(new MethodInfo(this.constantPool, stream));
            }
                        
            // MetaData Infos
            this.metadata = [];
            n = stream.readU30();
            for (i = 0; i < n; ++i) {
                this.metadata.push(new MetaDataInfo(stream));
            }

            // Instance Infos
            this.instances = [];
            n = stream.readU30();
            for (i = 0; i < n; ++i) {
                this.instances.push(new InstanceInfo(stream));
            }

            // Class Infos
            this.classes = [];
            for (i = 0; i < n; ++i) {
                this.classes.push(new ClassInfo(stream));
            }

            // Script Infos
            this.scripts = [];
            n = stream.readU30();
            for (i = 0; i < n; ++i) {
                this.scripts.push(new ScriptInfo(stream));
            }

            // Method Bodies
            this.methodBodies = [];
            n = stream.readU30();
            for (i = 0; i < n; ++i) {
                this.methodBodies.push(new MethodBody(this.methods, stream));
            }
        }
        
        function checkMagic(stream) {
            var magic = stream.readWord();
            var flashPlayerBrannan = 46 << 16 | 15; 
            if (magic < flashPlayerBrannan) {
                throw new Error("Invalid ABC File (magic = " + Number(magic).toString(16) + ")");
            }
        }
        
        constructor.prototype = {
            
        };
        
        return constructor;
    })();
    
    return new AbcFile(bytes);
    // console.info(JSON.stringify(new AbcFile(bytes)));
}
