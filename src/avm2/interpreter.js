/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

function createGlobalObject(script) {
    var global = new ASObject();
    global.traits = script.traits;
    global.trace = function (val) {
        console.info(val);
    };
    global.Date = {
        construct: function (obj, args) {
            assert(args.length == 0);
            return new Date();
        }
    };
    global.Array = {
        construct: function (obj, args) {
            if (args.length == 0) {
                return new Array();
            } else if (args.length == 1) {
                return new Array(args[0]);
            } else {
                assert(false);
            }
        }
    };
    global.Math = Math;
    global.Object = {
        construct: function (obj, args) {
            return new ASObject();
        }
    };
    global.String = String;
    global.RegExp = {
        construct: function (obj, args) {
            assert(args.length == 2);
            return new RegExp(args[0], args[1]);
        }
    };
    global.parseInt = parseInt;
    global.print = function (val) {
        console.info(val);
    };
    global.toString = function () {
        return "[global]";
    };
    return global;
}

var Scope = (function () {
    function scope(original) {
        if (original) {
            this.stack = original.stack.slice(0);
        } else {
            this.stack = [];
        }
    }
    
    scope.prototype.push = function push(val) {
        this.stack.push(val);
    };
    
    scope.prototype.pop = function pop() {
        return this.stack.pop();
    };
    
    scope.prototype.global = function global() {
        return this.stack[0];
    };
    
    scope.prototype.scope = function scope(i) {
        return this.stack[i];
    };
    
    scope.prototype.clone = function clone() {
        return new Scope(this);
    };
    
    scope.prototype.findProperty = function findProperty(multiname) {
        var stack = this.stack;
        for (var i = stack.length - 1; i >= 0; i--) {
            var s = stack[i];
            if (s.traits) {
                var trait = findTrait(s.traits, multiname);
                if (trait != null) {
                    return s;
                }
            }
            if (i == 0 && s.hasOwnProperty(multiname.name)) {
                return s;
            }
        }
        return null;
    };
    
    return scope;
})();

function interpretAbc(abc) {
    var methodInfo = abc.entryPoint;
    var global = createGlobalObject(abc.lastScript);
    var scope = new Scope();
    scope.push(global);
    var $this = new ASObject();
    new Closure(abc, methodInfo, scope).apply($this);
}

Object.prototype.getProperty = function(multiname) {
    return this[multiname.name];
};

Array.prototype.setProperty = function setProperty(multiname, value) {
    return this[multiname.name] = value;
};

function wrap(fn) {
    return function () { 
        return fn.apply(null, Array.prototype.slice.call(arguments, 0));
    };
}

String.prototype.getProperty = function(multiname) {
    if (multiname.name == "replace") {
        return function (regexp, val) {
            return this.replace(regexp, wrap(val));
        };
    }
    return this[multiname.name];
};

var ASObject = (function () {
    var counter = 0;
    
    function asObject() {
        this.slots = [];
        this.traits = null;
        this.id = counter++; 
    }
    
    asObject.prototype.getProperty = function getProperty(multiname) {
        if (this.traits) {
            var trait = findTrait(this.traits, multiname);
            if (trait) {
                if (trait.isSlot()) {
                    return this.slots[trait.slotId];
                } else if (trait.isMethod()) {
                    return trait.method;
                } 
            }
        }
        return Object.prototype.getProperty.call(this, multiname);
    };
    
    asObject.prototype.setProperty = function setProperty(multiname, value) {
        if (this.traits) {
            var trait = findTrait(this.traits, multiname);
            if (trait) {
                assert (trait.isSlot());
                this.slots[trait.slotId] = value;
            }
        }
        return this[multiname.name] = value;
    };
    
    asObject.prototype.applyTraits = function applyTraits(traits) {
        for (var i = 0; i < traits.length; i++) {
            var trait = traits[i];
            if (trait.isSlot()) {
                this.slots[trait.slotId] = trait.value;
            }
        }
    };
    
    asObject.prototype.toString = function () {
        return "[ASObject " + this.id + "]";
    };
    
    return asObject;
})();

var Klass = (function () {
    function klass(classInfo, baseType) {
        ASObject.call(this);
        ASObject.prototype.applyTraits.call(this, classInfo.traits);
        this.traits = classInfo.traits;
    }
    klass.prototype = inherit(ASObject, {
        
    });
    return klass;
})();

function findTrait(traits, multiname) {
    for (var i = 0; i < traits.length; i++) {
        if (traits[i].name.matches(multiname)) {
            return traits[i];
        }
    }
    return null;
};

function toDouble(x) {
    return Number(x);
}

function toBoolean(x) {
    return Boolean(x);
}

var traceExecution = inBrowser ? null : new IndentingWriter();
if (traceExecution) {
    traceExecution.tab = "    ";
}

var Closure = (function () {
    function closure (abc, methodInfo, scope) {
        this.abc = abc;
        this.methodInfo = methodInfo;
        this.scope = scope;
    }
    
    closure.prototype = {
        toString: function toString() {
            return "[closure " + this.methodInfo + "]";
        },
        apply: function($this, args) {
            var abc = this.abc;
            var code = new AbcStream(this.methodInfo.methodBody.code);
            var ints = abc.constantPool.ints;
            var uints = abc.constantPool.uints;
            var doubles = abc.constantPool.doubles;
            var strings = abc.constantPool.strings;
            var multinames = abc.constantPool.multinames;
            
            var local = [$this];
            if (args) {
                local = local.concat(args);
            }
            var stack = [];
            var scope = this.scope;
            
            var offset, value2, value1, value, index, multiname, args, obj, classInfo, baseType;
            var methodInfo, methodBody, klass, debugFile = null, debugLine = null;
            
            function jump (offset) {
                code.seek(code.pos + offset);
            }
            
            /**
             * Finds the object with a property that matches the given multiname. This first searches the scope stack,
             * and then the saved scope stack. 
             */
            function findProperty(multiname, strict) {
                var res = scope.findProperty(multiname);
                if (res == null) {
                    assert(!strict, "Property " + multiname + " not found.");
                    return scope.global();
                } else {
                    return res;
                }
            };
            
            function readMultiname() {
                return multinames[code.readU30()];
            }
            
            /**
             * Creates a multiname by fetching the name and namespace from the stack if necessary.
             */
            function createMultiname(multiname) {
                if (multiname.isRuntime()) {
                    multiname = multiname.clone();
                    if (multiname.isRuntimeName()) {
                        multiname.setName(stack.pop());
                    } 
                    if (multiname.isRuntimeNamespace()) {
                        multiname.setNamespace(stack.pop());
                    }
                }
                assert(!multiname.isRuntime());
                return multiname;
            }
            
            function readAndCreateMultiname() {
                return createMultiname(readMultiname());
            }
            
            while (code.remaining() > 0) {
                var bc = code.readU8();
                
                function notImplemented() {
                    assert (false, "Not Implemented: " + opcodeName(bc));
                }
                
                if (traceExecution) {
                    var debugInfo = debugFile && debugLine ? debugFile + ":" + debugLine : ""; 
                    traceExecution.enter(String(code.position).padRight(' ', 4) + opcodeName(bc) + " " + 
                                         traceOperands(opcodeTable[bc], abc, code, true) + " " + debugInfo);
                }
                
                switch (bc) {
                case OP_bkpt: notImplemented(); break;
                case OP_nop: notImplemented(); break;
                case OP_throw: notImplemented(); break;
                case OP_getsuper: notImplemented(); break;
                case OP_setsuper: notImplemented(); break;
                case OP_dxns: notImplemented(); break;
                case OP_dxnslate: notImplemented(); break;
                case OP_kill:
                    local[code.readU30()] = undefined;
                    break;
                case OP_label: 
                    /* Do nothing. Used to indicate that this location is the target of a branch, which
                     * is only useful for static analysis. */
                    break;
                case OP_lf32x4: notImplemented(); break;
                case OP_sf32x4: notImplemented(); break;
                case OP_ifnlt:
                case OP_ifge:
                    offset = code.readS24(); value2 = stack.pop(); value1 = stack.pop();
                    if (isNaN(value1) || isNaN(value2)) {
                        if (bc === OP_ifnlt) jump(offse);
                    } else if (value1 < value2 === false) {
                        jump(offset);
                    }
                    break;
                case OP_ifnle:
                case OP_ifgt:
                    offset = code.readS24(); value2 = stack.pop(); value1 = stack.pop();
                    if (isNaN(value1) || isNaN(value2)) {
                        if (bc === OP_ifnle) jump(offse);
                    } else if (value2 < value1 === true) {
                        jump(offset);
                    }
                    break;
                case OP_ifngt: 
                case OP_ifle:
                    offset = code.readS24(); value2 = stack.pop(); value1 = stack.pop();
                    if (isNaN(value1) || isNaN(value2)) {
                        if (bc === OP_ifngt) jump(offse);
                    } else if (value2 < value1 === false) {
                        jump(offset);
                    }
                    break;
                case OP_ifnge:
                case OP_iflt: 
                    offset = code.readS24(); value2 = stack.pop(); value1 = stack.pop();
                    if (isNaN(value1) || isNaN(value2)) {
                        if (bc === OP_ifnge) jump(offse);
                    } else if (value1 < value2 === true) {
                        jump(offset);
                    }
                    break;
                case OP_jump: 
                    jump(code.readS24());
                    break;
                case OP_iftrue:
                    offset = code.readS24();
                    if (toBoolean(stack.pop())) jump(offset);
                    break;
                case OP_iffalse:
                    offset = code.readS24();
                    if (toBoolean(stack.pop()) === false) jump(offset);
                    break;
                case OP_ifeq:
                    offset = code.readS24(); value2 = stack.pop(); value1 = stack.pop();
                    if (value1 == value2) jump(offset);
                    break;
                case OP_ifne: 
                    offset = code.readS24(); value2 = stack.pop(); value1 = stack.pop();
                    if ((value1 == value2) === false) jump(offset);
                    break;
                case OP_ifstricteq: notImplemented(); break;
                case OP_ifstrictne: notImplemented(); break;
                case OP_lookupswitch: notImplemented(); break;
                case OP_pushwith: notImplemented(); break;
                case OP_popscope:
                    scope.pop();
                    break;
                case OP_nextname: notImplemented(); break;
                case OP_hasnext: notImplemented(); break;
                case OP_pushnull: 
                    stack.push(null); 
                    break;
                case OP_pushundefined:
                    stack.push(undefined);
                    break;
                case OP_pushfloat: notImplemented(); break;
                case OP_nextvalue: notImplemented(); break;
                case OP_pushbyte: 
                    stack.push(code.readU8());
                    break;
                case OP_pushshort:
                    stack.push(code.readU30());
                    break;
                case OP_pushtrue: notImplemented(); break;
                case OP_pushfalse: notImplemented(); break;
                case OP_pushnan: notImplemented(); break;
                case OP_pop:
                    stack.pop();
                    break;
                case OP_dup:
                    stack.push(stack.peek());
                    break;
                case OP_swap:         stack.push(stack.pop(), stack.pop());       break;
                case OP_pushstring: 
                    stack.push(strings[code.readU30()]);
                    break;
                case OP_pushint: 
                    stack.push(ints[code.readU30()]);
                    break;
                case OP_pushuint: 
                    stack.push(uints[code.readU30()]);
                    break;
                case OP_pushdouble: 
                    stack.push(doubles[code.readU30()]);
                    break;
                case OP_pushscope:
                    scope.push(stack.pop());
                    break;
                case OP_pushnamespace: notImplemented(); break;
                case OP_hasnext2: notImplemented(); break;
                case OP_li8: notImplemented(); break;
                case OP_li16: notImplemented(); break;
                case OP_li32: notImplemented(); break;
                case OP_lf32: notImplemented(); break;
                case OP_lf64: notImplemented(); break;
                case OP_si8: notImplemented(); break;
                case OP_si16: notImplemented(); break;
                case OP_si32: notImplemented(); break;
                case OP_sf32: notImplemented(); break;
                case OP_sf64: notImplemented(); break;
                case OP_newfunction:
                    methodInfo = abc.methods[code.readU30()];
                    stack.push(new Closure(abc, methodInfo, scope.clone()));
                    break;
                case OP_call:
                    args = stack.popMany(code.readU30());
                    obj = stack.pop();
                    stack.push(stack.pop().apply(obj, args));
                    break;
                case OP_construct:
                    args = stack.popMany(code.readU30());
                    obj = stack.pop();
                    stack.push(obj.construct(obj, args));
                    break;
                case OP_callmethod: notImplemented(); break;
                case OP_callstatic: notImplemented(); break;
                case OP_callsuper: notImplemented(); break;
                case OP_callproperty:
                    multiname = readMultiname();
                    args = stack.popMany(code.readU30());
                    multiname = createMultiname(multiname);
                    obj = stack.pop();
                    val = obj.getProperty(multiname);
                    if (val instanceof MethodInfo) {
                        val = new Closure(abc, val, scope);
                    }
                    stack.push(val.apply(obj, args));
                    break;
                case OP_returnvoid:
                    if (traceExecution) {
                        traceExecution.outdent();
                    }
                    return undefined;
                    break;
                case OP_returnvalue:
                    if (traceExecution) {
                        traceExecution.outdent();
                    }
                    return stack.pop();
                case OP_constructsuper: notImplemented(); break;
                case OP_constructprop: 
                    multiname = multinames[code.readU30()];
                    args = stack.popMany(code.readU30());
                    if (multiname.isRuntime()) {
                        assert(false);
                    } else {
                        obj = stack.pop();
                        stack.push(obj.getProperty(multiname).construct(obj, args));
                    }
                    break;
                case OP_callsuperid: notImplemented(); break;
                case OP_callproplex: notImplemented(); break;
                case OP_callinterface: notImplemented(); break;
                case OP_callsupervoid: notImplemented(); break;
                case OP_callpropvoid: notImplemented(); break;
                case OP_sxi1: notImplemented(); break;
                case OP_sxi8: notImplemented(); break;
                case OP_sxi16: notImplemented(); break;
                case OP_applytype: notImplemented(); break;
                case OP_pushfloat4: notImplemented(); break;
                case OP_newobject: notImplemented(); break;
                case OP_newarray: 
                    stack.push(stack.popMany(code.readU32()));
                    break;
                case OP_newactivation:
                    obj = new ASObject();
                    obj.traits = this.methodInfo.methodBody.traits;
                    stack.push(obj);
                    break;
                case OP_newclass:
                    classInfo = abc.classes[code.readU30()];
                    methodBody = classInfo.init.methodBody;
                    baseType = stack.pop();
                    klass = new Klass(classInfo, baseType);
                    new Closure(abc, methodBody, scope.clone()).apply(klass);
                    stack.push(klass);
                    break;
                case OP_getdescendants: notImplemented(); break;
                case OP_newcatch: notImplemented(); break;
                case OP_findpropstrict:
                    multiname = multinames[code.readU30()];
                    if (multiname.isRuntime()) {
                        assert(false);
                    } else {
                        stack.push(findProperty(multiname, true));
                    }
                    break;
                case OP_findproperty:
                    multiname = readAndCreateMultiname();
                    stack.push(findProperty(multiname, false));
                    break;
                case OP_finddef: notImplemented(); break;
                case OP_getlex: notImplemented(); break;
                case OP_setproperty: 
                    value = stack.pop();
                    multiname = readAndCreateMultiname();
                    obj = stack.pop();
                    obj.setProperty(multiname, value);
                    break;
                case OP_getlocal: 
                    stack.push(local[code.readU30()]);
                    break;
                case OP_setlocal:
                    local[code.readU30()] = stack.pop();
                    break;
                case OP_getglobalscope:
                    stack.push(scope.global());
                    break;
                case OP_getscopeobject:
                    stack.push(scope.scope(code.readU8()));
                    break;
                case OP_getproperty:
                    multiname = readAndCreateMultiname();
                    stack.push(stack.pop().getProperty(multiname));
                    break;
                case OP_getouterscope: notImplemented(); break;
                case OP_initproperty:
                    value = stack.pop();
                    multiname = readAndCreateMultiname();
                    stack.pop().setProperty(multiname, value);
                    break;
                case OP_setpropertylate: notImplemented(); break;
                case OP_deleteproperty: notImplemented(); break;
                case OP_deletepropertylate: notImplemented(); break;
                case OP_getslot:
                    stack.push(stack.pop().slots[code.readU30()]);
                    break;
                case OP_setslot: 
                    index = code.readU30();
                    assert(index > 0);
                    value = stack.pop();
                    stack.pop().slots[index] = value; 
                    break;
                case OP_getglobalslot: notImplemented(); break;
                case OP_setglobalslot: notImplemented(); break;
                case OP_convert_s: notImplemented(); break;
                case OP_esc_xelem: notImplemented(); break;
                case OP_esc_xattr: notImplemented(); break;
                case OP_convert_i: notImplemented(); break;
                case OP_convert_u: notImplemented(); break;
                case OP_convert_d:
                    stack.push(toDouble(stack.pop()));
                    break;
                case OP_convert_b:
                    stack.push(toBoolean(stack.pop()));
                    break;
                case OP_convert_o: notImplemented(); break;
                case OP_checkfilter: notImplemented(); break;
                case OP_convert_f: notImplemented(); break;
                case OP_unplus: notImplemented(); break;
                case OP_convert_f4: notImplemented(); break;
                case OP_coerce: notImplemented(); break;
                case OP_coerce_b: notImplemented(); break;
                case OP_coerce_a: 
                    // NOP
                    break;
                case OP_coerce_i: notImplemented(); break;
                case OP_coerce_d: notImplemented(); break;
                case OP_coerce_s: notImplemented(); break;
                case OP_astype: notImplemented(); break;
                case OP_astypelate: notImplemented(); break;
                case OP_coerce_u: notImplemented(); break;
                case OP_coerce_o: notImplemented(); break;
                case OP_negate: notImplemented(); break;
                case OP_increment: 
                    stack.push(stack.pop() + 1);
                    break;
                case OP_inclocal: notImplemented(); break;
                case OP_decrement: notImplemented(); break;
                case OP_declocal: notImplemented(); break;
                case OP_typeof: notImplemented(); break;
                case OP_not: 
                    stack.push(!stack.pop());
                    break;
                case OP_bitnot:
                    stack.push(~stack.pop());
                    break;
                case OP_add_d: notImplemented(); break;
                case OP_add:
                    value2 = stack.pop(); value1 = stack.pop();
                    stack.push(value1 + value2);
                    break;
                case OP_subtract:
                    value2 = stack.pop(); value1 = stack.pop();
                    stack.push(value1 - value2);
                    break;
                case OP_multiply: 
                    value2 = stack.pop(); value1 = stack.pop();
                    stack.push(value1 * value2);
                    break;
                case OP_divide:
                    value2 = stack.pop(); value1 = stack.pop();
                    stack.push(value1 / value2);
                    break;
                case OP_modulo:
                    value2 = stack.pop(); value1 = stack.pop();
                    stack.push(value1 % value2);
                    break;
                case OP_lshift: 
                    value2 = stack.pop(); value1 = stack.pop();
                    stack.push(value1 << value2);
                    break;
                case OP_rshift: 
                    value2 = stack.pop(); value1 = stack.pop();
                    stack.push(value1 >> value2);
                    break;
                case OP_urshift: 
                    value2 = stack.pop(); value1 = stack.pop();
                    stack.push(value1 >>> value2);
                    break;
                case OP_bitand:
                    value2 = stack.pop(); value1 = stack.pop();
                    stack.push(value1 & value2);
                    break;
                case OP_bitor: 
                    value2 = stack.pop(); value1 = stack.pop();
                    stack.push(value1 | value2);
                    break;
                case OP_bitxor:
                    value2 = stack.pop(); value1 = stack.pop();
                    stack.push(value1 ^ value2);
                    break;
                case OP_equals:
                    value2 = stack.pop(); value1 = stack.pop();
                    stack.push(value1 == value2);
                    break;
                case OP_strictequals:
                    value2 = stack.pop(); value1 = stack.pop();
                    stack.push(value1 === value2);
                    break;
                case OP_lessthan: 
                    value2 = stack.pop(); value1 = stack.pop();
                    stack.push(value1 < value2);
                    break;
                case OP_lessequals:
                    value2 = stack.pop(); value1 = stack.pop();
                    stack.push(value1 <= value2);
                    break;
                case OP_greaterthan:
                    value2 = stack.pop(); value1 = stack.pop();
                    stack.push(value1 > value2);
                    break;
                case OP_greaterequals:
                    value2 = stack.pop(); value1 = stack.pop();
                    stack.push(value1 >= value2);
                    break;
                case OP_instanceof: notImplemented(); break;
                case OP_istype: notImplemented(); break;
                case OP_istypelate: notImplemented(); break;
                case OP_in: notImplemented(); break;
                case OP_increment_i: notImplemented(); break;
                case OP_decrement_i: notImplemented(); break;
                case OP_inclocal_i: notImplemented(); break;
                case OP_declocal_i: notImplemented(); break;
                case OP_negate_i: notImplemented(); break;
                case OP_add_i: notImplemented(); break;
                case OP_subtract_i: notImplemented(); break;
                case OP_multiply_i: notImplemented(); break;
                case OP_getlocal0:
                case OP_getlocal1:
                case OP_getlocal2:
                case OP_getlocal3:
                    stack.push(local[bc - OP_getlocal0]);
                    break;
                case OP_setlocal0:
                case OP_setlocal1:
                case OP_setlocal2:
                case OP_setlocal3:
                    local[bc - OP_setlocal0] = stack.pop();
                    break;
                case OP_debug:
                    code.readU8();
                    code.readU30();
                    code.readU8();
                    code.readU30();
                    break;
                case OP_debugline: 
                    debugLine = code.readU30(); 
                    break;
                case OP_debugfile:
                    debugFile = strings[code.readU30()];
                    break;
                case OP_bkptline: break;
                case OP_timestamp: notImplemented(); break;
                default:
                    console.info("Not Implemented: " + opcodeName(bc));
                }
                
                if (traceExecution) {
                    traceExecution.enter("scope:");
                    traceExecution.writeArray(scope.stack);
                    traceExecution.outdent();
                    traceExecution.enter("local:");
                    traceExecution.writeArray(local);
                    traceExecution.outdent();
                    traceExecution.enter("stack:");
                    traceExecution.writeArray(stack);
                    traceExecution.outdent();
                    traceExecution.outdent();
                }
                
            }
        }
    };
    
    return closure;
})();