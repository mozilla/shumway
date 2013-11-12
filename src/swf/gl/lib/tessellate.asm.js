// Note: Some Emscripten settings will significantly limit the speed of the generated code.
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');
// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function(filename) { return Module['read'](filename, true) };
  Module['load'] = function(f) {
    globalEval(read(f));
  };
  Module['arguments'] = process['argv'].slice(2);
  module.exports = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function() { throw 'no read() available (jsc?)' };
  }
  Module['readBinary'] = function(f) {
    return read(f, 'binary');
  };
  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  this['Module'] = Module;
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  if (ENVIRONMENT_IS_WEB) {
    Module['print'] = function(x) {
      console.log(x);
    };
    Module['printErr'] = function(x) {
      console.log(x);
    };
    this['Module'] = Module;
  } else if (ENVIRONMENT_IS_WORKER) {
    // We can do very little here...
    var TRY_USE_DUMP = false;
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];
// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (type == 'i64' || type == 'double' || vararg) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2 + 2*i;
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;
      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }
      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+(((low)>>>(0))))+((+(((high)>>>(0))))*(+(4294967296)))) : ((+(((low)>>>(0))))+((+(((high)|(0))))*(+(4294967296))))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math.abs(tempDouble))) >= (+(1)) ? (tempDouble > (+(0)) ? ((Math.min((+(Math.floor((tempDouble)/(+(4294967296))))), (+(4294967295))))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+(4294967296)))))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;
  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;
// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr', 
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0
}
Module['stringToUTF16'] = stringToUTF16;
// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;
  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;
// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr', 
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0
}
Module['stringToUTF32'] = stringToUTF32;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', or (2) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited
var runtimeInitialized = false;
function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;
function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;
function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;
function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;
function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul']) Math['imul'] = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledInit = false, calledRun = false;
var runDependencyWatcher = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    } 
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
  }
  // always do this asynchronously, to keep shell and web as similar as possible
  addOnPreRun(function() {
    if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
      applyData(Module['readBinary'](filename));
    } else {
      Browser.asyncLoad(filename, function(data) {
        applyData(data);
      }, function(data) {
        throw 'could not load memory initializer ' + filename;
      });
    }
  });
}
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 2808;
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });
var _stderr;
var _stderr = _stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([69,100,103,101,83,105,103,110,40,32,100,115,116,85,112,44,32,116,101,115,115,45,62,101,118,101,110,116,44,32,111,114,103,85,112,32,41,32,60,61,32,48,0,0,0,0,0,0,101,45,62,79,114,103,32,61,61,32,118,0,0,0,0,0,33,32,86,101,114,116,69,113,40,32,100,115,116,76,111,44,32,100,115,116,85,112,32,41,0,0,0,0,0,0,0,0,99,104,105,108,100,32,60,61,32,112,113,45,62,109,97,120,0,0,0,0,0,0,0,0,118,45,62,112,114,101,118,32,61,61,32,118,80,114,101,118,0,0,0,0,0,0,0,0,69,82,82,79,82,44,32,99,97,110,39,116,32,104,97,110,100,108,101,32,37,100,10,0,114,101,103,80,114,101,118,45,62,119,105,110,100,105,110,103,78,117,109,98,101,114,32,45,32,101,45,62,119,105,110,100,105,110,103,32,61,61,32,114,101,103,45,62,119,105,110,100,105,110,103,78,117,109,98,101,114,0,0,0,0,0,0,0,99,117,114,114,32,60,32,112,113,45,62,109,97,120,32,38,38,32,112,113,45,62,107,101,121,115,91,99,117,114,114,93,32,33,61,32,78,85,76,76,0,0,0,0,0,0,0,0,116,101,115,115,109,111,110,111,46,99,0,0,0,0,0,0,102,45,62,112,114,101,118,32,61,61,32,102,80,114,101,118,32,38,38,32,102,45,62,97,110,69,100,103,101,32,61,61,32,78,85,76,76,32,38,38,32,102,45,62,100,97,116,97,32,61,61,32,78,85,76,76,0,0,0,0,0,0,0,0,86,101,114,116,76,101,113,40,32,101,45,62,79,114,103,44,32,101,45,62,68,115,116,32,41,0,0,0,0,0,0,0,99,117,114,114,32,33,61,32,76,79,78,71,95,77,65,88,0,0,0,0,0,0,0,0,101,45,62,76,102,97,99,101,32,61,61,32,102,0,0,0,114,101,103,45,62,101,85,112,45,62,119,105,110,100,105,110,103,32,61,61,32,48,0,0,76,69,81,40,32,42,42,40,105,43,49,41,44,32,42,42,105,32,41,0,0,0,0,0,115,119,101,101,112,46,99,0,101,45,62,79,110,101,120,116,45,62,83,121,109,45,62,76,110,101,120,116,32,61,61,32,101,0,0,0,0,0,0,0,114,101,103,45,62,119,105,110,100,105,110,103,78,117,109,98,101,114,32,61,61,32,48,0,112,113,32,33,61,32,78,85,76,76,0,0,0,0,0,0,46,47,112,114,105,111,114,105,116,121,113,45,104,101,97,112,46,99,0,0,0,0,0,0,101,45,62,76,110,101,120,116,45,62,79,110,101,120,116,45,62,83,121,109,32,61,61,32,101,0,0,0,0,0,0,0,43,43,102,105,120,101,100,69,100,103,101,115,32,61,61,32,49,0,0,0,0,0,0,0,112,114,105,111,114,105,116,121,113,46,99,0,0,0,0,0,103,101,111,109,46,99,0,0,115,105,122,101,32,61,61,32,49,0,0,0,0,0,0,0,101,45,62,83,121,109,45,62,83,121,109,32,61,61,32,101,0,0,0,0,0,0,0,0,108,111,45,62,76,110,101,120,116,32,33,61,32,117,112,0,114,101,103,45,62,102,105,120,85,112,112,101,114,69,100,103,101,0,0,0,0,0,0,0,104,67,117,114,114,32,62,61,32,49,32,38,38,32,104,67,117,114,114,32,60,61,32,112,113,45,62,109,97,120,32,38,38,32,104,91,104,67,117,114,114,93,46,107,101,121,32,33,61,32,78,85,76,76,0,0,84,114,97,110,115,76,101,113,40,32,117,44,32,118,32,41,32,38,38,32,84,114,97,110,115,76,101,113,40,32,118,44,32,119,32,41,0,0,0,0,115,105,122,101,32,61,61,32,48,0,0,0,0,0,0,0,101,45,62,83,121,109,32,33,61,32,101,0,0,0,0,0,84,79,76,69,82,65,78,67,69,95,78,79,78,90,69,82,79,0,0,0,0,0,0,0,70,65,76,83,69,0,0,0,33,32,86,101,114,116,69,113,40,32,101,85,112,45,62,68,115,116,44,32,101,76,111,45,62,68,115,116,32,41,0,0,117,112,45,62,76,110,101,120,116,32,33,61,32,117,112,32,38,38,32,117,112,45,62,76,110,101,120,116,45,62,76,110,101,120,116,32,33,61,32,117,112,0,0,0,0,0,0,0,114,101,110,100,101,114,46,99,0,0,0,0,0,0,0,0,105,115,101,99,116,46,115,32,60,61,32,77,65,88,40,32,111,114,103,76,111,45,62,115,44,32,111,114,103,85,112,45,62,115,32,41,0,0,0,0,118,78,101,119,32,33,61,32,78,85,76,76,0,0,0,0,77,73,78,40,32,100,115,116,76,111,45,62,115,44,32,100,115,116,85,112,45,62,115,32,41,32,60,61,32,105,115,101,99,116,46,115,0,0,0,0,101,45,62,76,110,101,120,116,32,33,61,32,101,0,0,0,102,78,101,119,32,33,61,32,78,85,76,76,0,0,0,0,105,115,101,99,116,46,116,32,60,61,32,77,65,88,40,32,111,114,103,76,111,45,62,116,44,32,100,115,116,76,111,45,62,116,32,41,0,0,0,0,102,114,101,101,95,104,97,110,100,108,101,32,33,61,32,76,79,78,71,95,77,65,88,0,101,45,62,83,121,109,45,62,110,101,120,116,32,61,61,32,101,80,114,101,118,45,62,83,121,109,32,38,38,32,101,45,62,83,121,109,32,61,61,32,38,109,101,115,104,45,62,101,72,101,97,100,83,121,109,32,38,38,32,101,45,62,83,121,109,45,62,83,121,109,32,61,61,32,101,32,38,38,32,101,45,62,79,114,103,32,61,61,32,78,85,76,76,32,38,38,32,101,45,62,68,115,116,32,61,61,32,78,85,76,76,32,38,38,32,101,45,62,76,102,97,99,101,32,61,61,32,78,85,76,76,32,38,38,32,101,45,62,82,102,97,99,101,32,61,61,32,78,85,76,76,0,77,73,78,40,32,111,114,103,85,112,45,62,116,44,32,100,115,116,85,112,45,62,116,32,41,32,60,61,32,105,115,101,99,116,46,116,0,0,0,0,86,101,114,116,76,101,113,40,32,117,44,32,118,32,41,32,38,38,32,86,101,114,116,76,101,113,40,32,118,44,32,119,32,41,0,0,0,0,0,0,101,45,62,68,115,116,32,33,61,32,78,85,76,76,0,0,33,32,114,101,103,85,112,45,62,102,105,120,85,112,112,101,114,69,100,103,101,32,38,38,32,33,32,114,101,103,76,111,45,62,102,105,120,85,112,112,101,114,69,100,103,101,0,0,101,45,62,79,114,103,32,33,61,32,78,85,76,76,0,0,102,45,62,109,97,114,107,101,100,0,0,0,0,0,0,0,111,114,103,85,112,32,33,61,32,116,101,115,115,45,62,101,118,101,110,116,32,38,38,32,111,114,103,76,111,32,33,61,32,116,101,115,115,45,62,101,118,101,110,116,0,0,0,0,101,45,62,83,121,109,45,62,110,101,120,116,32,61,61,32,101,80,114,101,118,45,62,83,121,109,0,0,0,0,0,0,69,100,103,101,83,105,103,110,40,32,100,115,116,76,111,44,32,116,101,115,115,45,62,101,118,101,110,116,44,32,111,114,103,76,111,32,41,32,62,61,32,48,0,0,0,0,0,0,118,45,62,112,114,101,118,32,61,61,32,118,80,114,101,118,32,38,38,32,118,45,62,97,110,69,100,103,101,32,61,61,32,78,85,76,76,32,38,38,32,118,45,62,100,97,116,97,32,61,61,32,78,85,76,76,0,0,0,0,0,0,0,0,102,45,62,112,114,101,118,32,61,61,32,102,80,114,101,118,0,0,0,0,0,0,0,0,109,101,115,104,46,99,0,0,95,95,103,108,95,116,114,97,110,115,83,105,103,110,0,0,95,95,103,108,95,116,114,97,110,115,69,118,97,108,0,0,95,95,103,108,95,114,101,110,100,101,114,77,101,115,104,0,95,95,103,108,95,112,113,83,111,114,116,73,110,115,101,114,116,0,0,0,0,0,0,0,95,95,103,108,95,112,113,83,111,114,116,73,110,105,116,0,95,95,103,108,95,112,113,83,111,114,116,68,101,108,101,116,101,80,114,105,111,114,105,116,121,81,0,0,0,0,0,0,95,95,103,108,95,112,113,83,111,114,116,68,101,108,101,116,101,0,0,0,0,0,0,0,95,95,103,108,95,112,113,72,101,97,112,73,110,115,101,114,116,0,0,0,0,0,0,0,95,95,103,108,95,112,113,72,101,97,112,68,101,108,101,116,101,0,0,0,0,0,0,0,95,95,103,108,95,109,101,115,104,84,101,115,115,101,108,108,97,116,101,77,111,110,111,82,101,103,105,111,110,0,0,0,95,95,103,108,95,109,101,115,104,67,104,101,99,107,77,101,115,104,0,0,0,0,0,0,95,95,103,108,95,101,100,103,101,83,105,103,110,0,0,0,95,95,103,108,95,101,100,103,101,69,118,97,108,0,0,0,82,101,110,100,101,114,84,114,105,97,110,103,108,101,0,0,82,101,110,100,101,114,83,116,114,105,112,0,0,0,0,0,82,101,110,100,101,114,70,97,110,0,0,0,0,0,0,0,82,101,109,111,118,101,68,101,103,101,110,101,114,97,116,101,70,97,99,101,115,0,0,0,77,97,107,101,86,101,114,116,101,120,0,0,0,0,0,0,77,97,107,101,70,97,99,101,0,0,0,0,0,0,0,0,73,115,87,105,110,100,105,110,103,73,110,115,105,100,101,0,70,108,111,97,116,68,111,119,110,0,0,0,0,0,0,0,70,105,120,85,112,112,101,114,69,100,103,101,0,0,0,0,68,111,110,101,69,100,103,101,68,105,99,116,0,0,0,0,68,101,108,101,116,101,82,101,103,105,111,110,0,0,0,0,67,111,110,110,101,99,116,76,101,102,116,68,101,103,101,110,101,114,97,116,101,0,0,0,67,104,101,99,107,70,111,114,76,101,102,116,83,112,108,105,99,101,0,0,0,0,0,0,67,104,101,99,107,70,111,114,73,110,116,101,114,115,101,99,116,0,0,0,0,0,0,0,65,100,100,82,105,103,104,116,69,100,103,101,115,0,0,0,0,0,0,63,0,0,0,63,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
  function ___assert_func(filename, line, func, condition) {
      throw 'Assertion failed: ' + (condition ? Pointer_stringify(condition) : 'unknown condition') + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + new Error().stack;
    }
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i64=_memset;
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:35,EIDRM:36,ECHRNG:37,EL2NSYNC:38,EL3HLT:39,EL3RST:40,ELNRNG:41,EUNATCH:42,ENOCSI:43,EL2HLT:44,EDEADLK:45,ENOLCK:46,EBADE:50,EBADR:51,EXFULL:52,ENOANO:53,EBADRQC:54,EBADSLT:55,EDEADLOCK:56,EBFONT:57,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:74,EDOTDOT:76,EBADMSG:77,ENOTUNIQ:80,EBADFD:81,EREMCHG:82,ELIBACC:83,ELIBBAD:84,ELIBSCN:85,ELIBMAX:86,ELIBEXEC:87,ENOSYS:88,ENOTEMPTY:90,ENAMETOOLONG:91,ELOOP:92,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:106,EPROTOTYPE:107,ENOTSOCK:108,ENOPROTOOPT:109,ESHUTDOWN:110,ECONNREFUSED:111,EADDRINUSE:112,ECONNABORTED:113,ENETUNREACH:114,ENETDOWN:115,ETIMEDOUT:116,EHOSTDOWN:117,EHOSTUNREACH:118,EINPROGRESS:119,EALREADY:120,EDESTADDRREQ:121,EMSGSIZE:122,EPROTONOSUPPORT:123,ESOCKTNOSUPPORT:124,EADDRNOTAVAIL:125,ENETRESET:126,EISCONN:127,ENOTCONN:128,ETOOMANYREFS:129,EUSERS:131,EDQUOT:132,ESTALE:133,ENOTSUP:134,ENOMEDIUM:135,EILSEQ:138,EOVERFLOW:139,ECANCELED:140,ENOTRECOVERABLE:141,EOWNERDEAD:142,ESTRPIPE:143};
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"No message of desired type",36:"Identifier removed",37:"Channel number out of range",38:"Level 2 not synchronized",39:"Level 3 halted",40:"Level 3 reset",41:"Link number out of range",42:"Protocol driver not attached",43:"No CSI structure available",44:"Level 2 halted",45:"Deadlock condition",46:"No record locks available",50:"Invalid exchange",51:"Invalid request descriptor",52:"Exchange full",53:"No anode",54:"Invalid request code",55:"Invalid slot",56:"File locking deadlock error",57:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",74:"Multihop attempted",76:"Cross mount point (not really error)",77:"Trying to read unreadable message",80:"Given log. name not unique",81:"f.d. invalid for this operation",82:"Remote address changed",83:"Can   access a needed shared lib",84:"Accessing a corrupted shared lib",85:".lib section in a.out corrupted",86:"Attempting to link in too many libs",87:"Attempting to exec a shared library",88:"Function not implemented",90:"Directory not empty",91:"File or path name too long",92:"Too many symbolic links",95:"Operation not supported on transport endpoint",96:"Protocol family not supported",104:"Connection reset by peer",105:"No buffer space available",106:"Address family not supported by protocol family",107:"Protocol wrong type for socket",108:"Socket operation on non-socket",109:"Protocol not available",110:"Can't send after socket shutdown",111:"Connection refused",112:"Address already in use",113:"Connection aborted",114:"Network is unreachable",115:"Network interface is not configured",116:"Connection timed out",117:"Host is down",118:"Host is unreachable",119:"Connection already in progress",120:"Socket already connected",121:"Destination address required",122:"Message too long",123:"Unknown protocol",124:"Socket type not supported",125:"Address not available",126:"Connection reset by network",127:"Socket is already connected",128:"Socket is not connected",129:"Too many references",131:"Too many users",132:"Quota exceeded",133:"Stale file handle",134:"Not supported",135:"No medium (in tape drive)",138:"Illegal byte sequence",139:"Value too large for defined data type",140:"Operation canceled",141:"State not recoverable",142:"Previous owner died",143:"Streams pipe error"};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }
  var VFS=undefined;
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path, ext) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var f = PATH.splitPath(path)[2];
        if (ext && f.substr(-1 * ext.length) === ext) {
          f = f.substr(0, f.length - ext.length);
        }
        return f;
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.filter(function(p, index) {
          if (typeof p !== 'string') {
            throw new TypeError('Arguments to path.join must be strings');
          }
          return p;
        }).join('/'));
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  var MEMFS={CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },mount:function (mount) {
        return MEMFS.create_node(null, '/', 0040000 | 0777, 0);
      },create_node:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            lookup: MEMFS.node_ops.lookup,
            mknod: MEMFS.node_ops.mknod,
            mknod: MEMFS.node_ops.mknod,
            rename: MEMFS.node_ops.rename,
            unlink: MEMFS.node_ops.unlink,
            rmdir: MEMFS.node_ops.rmdir,
            readdir: MEMFS.node_ops.readdir,
            symlink: MEMFS.node_ops.symlink
          };
          node.stream_ops = {
            llseek: MEMFS.stream_ops.llseek
          };
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr
          };
          node.stream_ops = {
            llseek: MEMFS.stream_ops.llseek,
            read: MEMFS.stream_ops.read,
            write: MEMFS.stream_ops.write,
            allocate: MEMFS.stream_ops.allocate,
            mmap: MEMFS.stream_ops.mmap
          };
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            readlink: MEMFS.node_ops.readlink
          };
          node.stream_ops = {};
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr
          };
          node.stream_ops = FS.chrdev_stream_ops;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.create_node(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.create_node(parent, newname, 0777 | 0120000, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          var size = Math.min(contents.length - position, length);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            assert(buffer.length);
            if (canOwn && buffer.buffer === HEAP8.buffer && offset === 0) {
              node.contents = buffer; // this is a subarray of the heap, and we can own it
              node.contentMode = MEMFS.CONTENT_OWNING;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 0x02) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,devices:[null],streams:[null],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
        },handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + new Error().stack;
        return ___setErrNo(e.errno);
      },cwd:function () {
        return FS.currentPath;
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.currentPath, path);
        opts = opts || { recurse_count: 0 };
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
        // start at the root
        var current = FS.root;
        var current_path = '/';
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join(current_path, parts[i]);
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            current = current.mount.root;
          }
          // follow symlinks
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            return path ? PATH.join(node.mount.mountpoint, path) : node.mount.mountpoint;
          }
          path = path ? PATH.join(node.name, path) : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          if (node.parent.id === parent.id && node.name === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        var node = {
          id: FS.nextInode++,
          name: name,
          mode: mode,
          node_ops: {},
          stream_ops: {},
          rdev: rdev,
          parent: null,
          mount: null
        };
        if (!parent) {
          parent = node;  // root node sets parent to itself
        }
        node.parent = parent;
        node.mount = parent.mount;
        // compatibility
        var readMode = 292 | 73;
        var writeMode = 146;
        // NOTE we must use Object.defineProperties instead of individual calls to
        // Object.defineProperty in order to make closure compiler happy
        Object.defineProperties(node, {
          read: {
            get: function() { return (node.mode & readMode) === readMode; },
            set: function(val) { val ? node.mode |= readMode : node.mode &= ~readMode; }
          },
          write: {
            get: function() { return (node.mode & writeMode) === writeMode; },
            set: function(val) { val ? node.mode |= writeMode : node.mode &= ~writeMode; }
          },
          isFolder: {
            get: function() { return FS.isDir(node.mode); },
          },
          isDevice: {
            get: function() { return FS.isChrdev(node.mode); },
          },
        });
        FS.hashAddNode(node);
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return node.mounted;
      },isFile:function (mode) {
        return (mode & 0170000) === 0100000;
      },isDir:function (mode) {
        return (mode & 0170000) === 0040000;
      },isLink:function (mode) {
        return (mode & 0170000) === 0120000;
      },isChrdev:function (mode) {
        return (mode & 0170000) === 0020000;
      },isBlkdev:function (mode) {
        return (mode & 0170000) === 0060000;
      },isFIFO:function (mode) {
        return (mode & 0170000) === 0010000;
      },isSocket:function (mode) {
        return (mode & 0140000) === 0140000;
      },flagModes:{"r":0,"rs":8192,"r+":2,"w":1537,"wx":3585,"xw":3585,"w+":1538,"wx+":3586,"xw+":3586,"a":521,"ax":2569,"xa":2569,"a+":522,"ax+":2570,"xa+":2570},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 3;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 1024)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.currentPath) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 3) !== 0 ||  // opening for write
              (flags & 1024)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 1;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        // compatibility
        Object.defineProperties(stream, {
          object: {
            get: function() { return stream.node; },
            set: function(val) { stream.node = val; }
          },
          isRead: {
            get: function() { return (stream.flags & 3) !== 1; }
          },
          isWrite: {
            get: function() { return (stream.flags & 3) !== 0; }
          },
          isAppend: {
            get: function() { return (stream.flags & 8); }
          }
        });
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },mount:function (type, opts, mountpoint) {
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          root: null
        };
        var lookup;
        if (mountpoint) {
          lookup = FS.lookupPath(mountpoint, { follow: false });
        }
        // create a root node for the fs
        var root = type.mount(mount);
        root.mount = mount;
        mount.root = root;
        // assign the mount info to the mountpoint's node
        if (lookup) {
          lookup.node.mount = mount;
          lookup.node.mounted = true;
          // compatibility update FS.root if we mount to /
          if (mountpoint === '/') {
            FS.root = mount.root;
          }
        }
        return root;
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 0666;
        mode &= 4095;
        mode |= 0100000;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 0777;
        mode &= 511 | 0001000;
        mode |= 0040000;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 0666;
        }
        mode |= 0020000;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path, { follow: false });
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 3) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        path = PATH.normalize(path);
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 0666 : mode;
        if ((flags & 512)) {
          mode = (mode & 4095) | 0100000;
        } else {
          mode = 0;
        }
        var node;
        try {
          var lookup = FS.lookupPath(path, {
            follow: !(flags & 0200000)
          });
          node = lookup.node;
          path = lookup.path;
        } catch (e) {
          // ignore
        }
        // perhaps we need to create the node
        if ((flags & 512)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 2048)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~1024;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 1024)) {
          FS.truncate(node, 0);
        }
        // register the stream with the filesystem
        var stream = FS.createStream({
          path: path,
          node: node,
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 3) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 3) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 8) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 3) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 3) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.errnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0);
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=stdin.fd;
        assert(stdin.fd === 1, 'invalid handle for stdin (' + stdin.fd + ')');
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=stdout.fd;
        assert(stdout.fd === 2, 'invalid handle for stdout (' + stdout.fd + ')');
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=stderr.fd;
        assert(stderr.fd === 3, 'invalid handle for stderr (' + stderr.fd + ')');
      },staticInit:function () {
        FS.nameTable = new Array(4096);
        FS.root = FS.createNode(null, '/', 0040000 | 0777, 0);
        FS.mount(MEMFS, {}, '/');
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(path, mode | 146);
          var stream = FS.open(path, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(path, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          var LazyUint8Array = function() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
              if (!hasByteServing) chunkSize = datalength;
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          var size = Math.min(contents.length - position, length);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 0040000 | 0777, 0);
      },nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 0140000, 0);
        node.sock = sock;
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              var url = 'ws://' + addr + ':' + port;
              // the node ws library API is slightly different than the browser's
              var opts = ENVIRONMENT_IS_NODE ? {} : ['binary'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
          var handleMessage = function(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (0 /* XXX missing C define POLLRDNORM */ | 1) : 0;
          }
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (0 /* XXX missing C define POLLRDNORM */ | 1);
          }
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 2;
          }
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 1:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)|0)]=chr
      var ret = _write(stream, _fputc.ret, 1);
      if (ret == -1) {
        var streamObj = FS.getStream(stream);
        if (streamObj) streamObj.error = true;
        return -1;
      } else {
        return chr;
      }
    }function _putchar(c) {
      // int putchar(int c);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/putchar.html
      return _fputc(c, HEAP32[((_stdout)>>2)]);
    } 
  Module["_saveSetjmp"] = _saveSetjmp;
  Module["_testSetjmp"] = _testSetjmp;var _setjmp=undefined;
  function _longjmp(env, value) {
      asm['setThrew'](env, value || 1);
      throw 'longjmp';
    }
  var _llvm_memset_p0i8_i32=_memset;
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStream(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  Module["_strlen"] = _strlen;
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
              // Add sign if needed
              if (flagAlwaysSigned) {
                if (currArg < 0) {
                  prefix = '-' + prefix;
                } else {
                  prefix = '+' + prefix;
                }
              }
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
                // Add sign.
                if (flagAlwaysSigned && currArg >= 0) {
                  argText = '+' + argText;
                }
              }
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }
  function _abort() {
      Module['abort']();
    }
  function ___errno_location() {
      return ___errno_state;
    }var ___errno=___errno_location;
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }
  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 8: return PAGE_SIZE;
        case 54:
        case 56:
        case 21:
        case 61:
        case 63:
        case 22:
        case 67:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 69:
        case 28:
        case 101:
        case 70:
        case 71:
        case 29:
        case 30:
        case 199:
        case 75:
        case 76:
        case 32:
        case 43:
        case 44:
        case 80:
        case 46:
        case 47:
        case 45:
        case 48:
        case 49:
        case 42:
        case 82:
        case 33:
        case 7:
        case 108:
        case 109:
        case 107:
        case 112:
        case 119:
        case 121:
          return 200809;
        case 13:
        case 104:
        case 94:
        case 95:
        case 34:
        case 35:
        case 77:
        case 81:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 91:
        case 94:
        case 95:
        case 110:
        case 111:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 120:
        case 40:
        case 16:
        case 79:
        case 19:
          return -1;
        case 92:
        case 93:
        case 5:
        case 72:
        case 6:
        case 74:
        case 92:
        case 93:
        case 96:
        case 97:
        case 98:
        case 99:
        case 102:
        case 103:
        case 105:
          return 1;
        case 38:
        case 66:
        case 50:
        case 51:
        case 4:
          return 1024;
        case 15:
        case 64:
        case 41:
          return 32;
        case 55:
        case 37:
        case 17:
          return 2147483647;
        case 18:
        case 1:
          return 47839;
        case 59:
        case 57:
          return 99;
        case 68:
        case 58:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 14: return 32768;
        case 73: return 32767;
        case 39: return 16384;
        case 60: return 1000;
        case 106: return 700;
        case 52: return 256;
        case 62: return 255;
        case 2: return 100;
        case 65: return 64;
        case 36: return 20;
        case 100: return 16;
        case 20: return 6;
        case 53: return 4;
        case 10: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (window.scrollX + rect.left);
              y = t.pageY - (window.scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (window.scrollX + rect.left);
            y = event.pageY - (window.scrollY + rect.top);
          }
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var Math_min = Math.min;
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm = (function(global, env, buffer) {
  'use asm';
  var HEAP8 = new global.Int8Array(buffer);
  var HEAP16 = new global.Int16Array(buffer);
  var HEAP32 = new global.Int32Array(buffer);
  var HEAPU8 = new global.Uint8Array(buffer);
  var HEAPU16 = new global.Uint16Array(buffer);
  var HEAPU32 = new global.Uint32Array(buffer);
  var HEAPF32 = new global.Float32Array(buffer);
  var HEAPF64 = new global.Float64Array(buffer);
  var STACKTOP=env.STACKTOP|0;
  var STACK_MAX=env.STACK_MAX|0;
  var tempDoublePtr=env.tempDoublePtr|0;
  var ABORT=env.ABORT|0;
  var _stderr=env._stderr|0;
  var NaN=+env.NaN;
  var Infinity=+env.Infinity;
  var __THREW__ = 0;
  var threwValue = 0;
  var setjmpId = 0;
  var undef = 0;
  var tempInt = 0, tempBigInt = 0, tempBigIntP = 0, tempBigIntS = 0, tempBigIntR = 0.0, tempBigIntI = 0, tempBigIntD = 0, tempValue = 0, tempDouble = 0.0;
  var tempRet0 = 0;
  var tempRet1 = 0;
  var tempRet2 = 0;
  var tempRet3 = 0;
  var tempRet4 = 0;
  var tempRet5 = 0;
  var tempRet6 = 0;
  var tempRet7 = 0;
  var tempRet8 = 0;
  var tempRet9 = 0;
  var Math_floor=global.Math.floor;
  var Math_abs=global.Math.abs;
  var Math_sqrt=global.Math.sqrt;
  var Math_pow=global.Math.pow;
  var Math_cos=global.Math.cos;
  var Math_sin=global.Math.sin;
  var Math_tan=global.Math.tan;
  var Math_acos=global.Math.acos;
  var Math_asin=global.Math.asin;
  var Math_atan=global.Math.atan;
  var Math_atan2=global.Math.atan2;
  var Math_exp=global.Math.exp;
  var Math_log=global.Math.log;
  var Math_ceil=global.Math.ceil;
  var Math_imul=global.Math.imul;
  var abort=env.abort;
  var assert=env.assert;
  var asmPrintInt=env.asmPrintInt;
  var asmPrintFloat=env.asmPrintFloat;
  var Math_min=env.min;
  var invoke_ii=env.invoke_ii;
  var invoke_viiiii=env.invoke_viiiii;
  var invoke_vi=env.invoke_vi;
  var invoke_vii=env.invoke_vii;
  var invoke_iiii=env.invoke_iiii;
  var invoke_viii=env.invoke_viii;
  var invoke_v=env.invoke_v;
  var invoke_iii=env.invoke_iii;
  var invoke_viiii=env.invoke_viiii;
  var _sysconf=env._sysconf;
  var _abort=env._abort;
  var _fprintf=env._fprintf;
  var _fflush=env._fflush;
  var __reallyNegative=env.__reallyNegative;
  var _fputc=env._fputc;
  var ___setErrNo=env.___setErrNo;
  var _fwrite=env._fwrite;
  var _send=env._send;
  var _longjmp=env._longjmp;
  var __formatString=env.__formatString;
  var ___assert_func=env.___assert_func;
  var _pwrite=env._pwrite;
  var _putchar=env._putchar;
  var _sbrk=env._sbrk;
  var ___errno_location=env.___errno_location;
  var _write=env._write;
  var _time=env._time;
// EMSCRIPTEN_START_FUNCS
function stackAlloc(size){size=size|0;var ret=0;ret=STACKTOP;STACKTOP=STACKTOP+size|0;STACKTOP=STACKTOP+7>>3<<3;return ret|0}function stackSave(){return STACKTOP|0}function stackRestore(top){top=top|0;STACKTOP=top}function setThrew(threw,value){threw=threw|0;value=value|0;if((__THREW__|0)==0){__THREW__=threw;threwValue=value}}function copyTempFloat(ptr){ptr=ptr|0;HEAP8[tempDoublePtr]=HEAP8[ptr];HEAP8[tempDoublePtr+1|0]=HEAP8[ptr+1|0];HEAP8[tempDoublePtr+2|0]=HEAP8[ptr+2|0];HEAP8[tempDoublePtr+3|0]=HEAP8[ptr+3|0]}function copyTempDouble(ptr){ptr=ptr|0;HEAP8[tempDoublePtr]=HEAP8[ptr];HEAP8[tempDoublePtr+1|0]=HEAP8[ptr+1|0];HEAP8[tempDoublePtr+2|0]=HEAP8[ptr+2|0];HEAP8[tempDoublePtr+3|0]=HEAP8[ptr+3|0];HEAP8[tempDoublePtr+4|0]=HEAP8[ptr+4|0];HEAP8[tempDoublePtr+5|0]=HEAP8[ptr+5|0];HEAP8[tempDoublePtr+6|0]=HEAP8[ptr+6|0];HEAP8[tempDoublePtr+7|0]=HEAP8[ptr+7|0]}function setTempRet0(value){value=value|0;tempRet0=value}function setTempRet1(value){value=value|0;tempRet1=value}function setTempRet2(value){value=value|0;tempRet2=value}function setTempRet3(value){value=value|0;tempRet3=value}function setTempRet4(value){value=value|0;tempRet4=value}function setTempRet5(value){value=value|0;tempRet5=value}function setTempRet6(value){value=value|0;tempRet6=value}function setTempRet7(value){value=value|0;tempRet7=value}function setTempRet8(value){value=value|0;tempRet8=value}function setTempRet9(value){value=value|0;tempRet9=value}function runPostSets(){}function _Splice($a,$b){$a=$a|0;$b=$b|0;var $1=0,$2=0,$3=0,$4=0;$1=$a+8|0;$2=HEAP32[$1>>2]|0;$3=$b+8|0;$4=HEAP32[$3>>2]|0;HEAP32[(HEAP32[$2+4>>2]|0)+12>>2]=$b;HEAP32[(HEAP32[$4+4>>2]|0)+12>>2]=$a;HEAP32[$1>>2]=$4;HEAP32[$3>>2]=$2;return}function ___gl_dictListNewDict($frame,$leq){$frame=$frame|0;$leq=$leq|0;var $1=0,$5=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=_malloc(20)|0;if(($1|0)==0){$_0=0;label=3;break}else{label=2;break};case 2:$5=$1;HEAP32[$1>>2]=0;HEAP32[$1+4>>2]=$5;HEAP32[$1+8>>2]=$5;HEAP32[$1+12>>2]=$frame;HEAP32[$1+16>>2]=$leq;$_0=$1;label=3;break;case 3:return $_0|0}return 0}function ___gl_dictListDeleteDict($dict){$dict=$dict|0;var $1=0,$3=0,$node_05=0,$6=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$dict|0;$3=HEAP32[$dict+4>>2]|0;if(($3|0)==($1|0)){label=3;break}else{$node_05=$3;label=2;break};case 2:$6=HEAP32[$node_05+4>>2]|0;_free($node_05);if(($6|0)==($1|0)){label=3;break}else{$node_05=$6;label=2;break};case 3:_free($dict);return}}function ___gl_dictListInsertBefore($dict,$node,$key){$dict=$dict|0;$node=$node|0;$key=$key|0;var $_018=0,$5=0,$7=0,$14=0,$15=0,$19=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$_018=$node;label=2;break;case 2:$5=HEAP32[$_018+8>>2]|0;$7=HEAP32[$5>>2]|0;if(($7|0)==0){label=4;break}else{label=3;break};case 3:if((FUNCTION_TABLE_iiii[HEAP32[$dict+16>>2]&127](HEAP32[$dict+12>>2]|0,$7,$key)|0)==0){$_018=$5;label=2;break}else{label=4;break};case 4:$14=_malloc(12)|0;$15=$14;if(($14|0)==0){$_0=0;label=6;break}else{label=5;break};case 5:HEAP32[$14>>2]=$key;$19=$5+4|0;HEAP32[$14+4>>2]=HEAP32[$19>>2];HEAP32[(HEAP32[$19>>2]|0)+8>>2]=$15;HEAP32[$14+8>>2]=$5;HEAP32[$19>>2]=$15;$_0=$15;label=6;break;case 6:return $_0|0}return 0}function ___gl_dictListDelete($dict,$node){$dict=$dict|0;$node=$node|0;var $1=0,$3=0;$1=$node+8|0;$3=$node+4|0;HEAP32[(HEAP32[$3>>2]|0)+8>>2]=HEAP32[$1>>2];HEAP32[(HEAP32[$1>>2]|0)+4>>2]=HEAP32[$3>>2];_free($node);return}function ___gl_dictListSearch($dict,$key){$dict=$dict|0;$key=$key|0;var $node_0=0,$6=0,$8=0,label=0;label=1;while(1)switch(label|0){case 1:$node_0=$dict|0;label=2;break;case 2:$6=HEAP32[$node_0+4>>2]|0;$8=HEAP32[$6>>2]|0;if(($8|0)==0){label=4;break}else{label=3;break};case 3:if((FUNCTION_TABLE_iiii[HEAP32[$dict+16>>2]&127](HEAP32[$dict+12>>2]|0,$key,$8)|0)==0){$node_0=$6;label=2;break}else{label=4;break};case 4:return $6|0}return 0}function ___gl_meshMakeEdge($mesh){$mesh=$mesh|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$18=0,$25=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=_allocVertex()|0;$2=_allocVertex()|0;$3=_allocFace()|0;$4=($1|0)==0;$5=($2|0)==0;$6=($3|0)==0;if($4|$5|$6){label=2;break}else{label=8;break};case 2:if($4){label=4;break}else{label=3;break};case 3:_free($1);label=4;break;case 4:if($5){label=6;break}else{label=5;break};case 5:_free($2);label=6;break;case 6:if($6){$_0=0;label=11;break}else{label=7;break};case 7:_free($3);$_0=0;label=11;break;case 8:$18=_MakeEdge($mesh+92|0)|0;if(($18|0)==0){label=9;break}else{label=10;break};case 9:_free($1);_free($2);_free($3);$_0=0;label=11;break;case 10:$25=$mesh|0;_MakeVertex($1,$18,$25);_MakeVertex($2,HEAP32[$18+4>>2]|0,$25);_MakeFace($3,$18,$mesh+64|0);$_0=$18;label=11;break;case 11:return $_0|0}return 0}function _MakeEdge($eNext){$eNext=$eNext|0;var $1=0,$4=0,$5=0,$6=0,$8=0,$_eNext=0,$10=0,$13=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=_malloc(64)|0;if(($1|0)==0){$_0=0;label=3;break}else{label=2;break};case 2:$4=$1;$5=$1+32|0;$6=$5;$8=HEAP32[$eNext+4>>2]|0;$_eNext=$8>>>0<$eNext>>>0?$8:$eNext;$10=$_eNext+4|0;$13=HEAP32[HEAP32[$10>>2]>>2]|0;HEAP32[$5>>2]=$13;HEAP32[HEAP32[$13+4>>2]>>2]=$4;HEAP32[$1>>2]=$_eNext;HEAP32[HEAP32[$10>>2]>>2]=$6;HEAP32[$1+4>>2]=$6;HEAP32[$1+8>>2]=$4;HEAP32[$1+12>>2]=$6;_memset($1+16|0,0,16);HEAP32[$1+36>>2]=$4;HEAP32[$1+40>>2]=$6;HEAP32[$1+44>>2]=$4;_memset($1+48|0,0,16);$_0=$4;label=3;break;case 3:return $_0|0}return 0}function ___gl_meshSplice($eOrg,$eDst){$eOrg=$eOrg|0;$eDst=$eDst|0;var $4=0,$5=0,$6=0,$joiningVertices_0=0,$11=0,$12=0,$13=0,$joiningLoops_0=0,$19=0,$28=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:if(($eOrg|0)==($eDst|0)){$_0=1;label=12;break}else{label=2;break};case 2:$4=HEAP32[$eDst+16>>2]|0;$5=$eOrg+16|0;$6=HEAP32[$5>>2]|0;if(($4|0)==($6|0)){$joiningVertices_0=0;label=4;break}else{label=3;break};case 3:_KillVertex($4,$6);$joiningVertices_0=1;label=4;break;case 4:$11=HEAP32[$eDst+20>>2]|0;$12=$eOrg+20|0;$13=HEAP32[$12>>2]|0;if(($11|0)==($13|0)){$joiningLoops_0=0;label=6;break}else{label=5;break};case 5:_KillFace($11,$13);$joiningLoops_0=1;label=6;break;case 6:_Splice($eDst,$eOrg);if(($joiningVertices_0|0)==0){label=7;break}else{label=9;break};case 7:$19=_allocVertex()|0;if(($19|0)==0){$_0=0;label=12;break}else{label=8;break};case 8:_MakeVertex($19,$eDst,HEAP32[$5>>2]|0);HEAP32[(HEAP32[$5>>2]|0)+8>>2]=$eOrg;label=9;break;case 9:if(($joiningLoops_0|0)==0){label=10;break}else{$_0=1;label=12;break};case 10:$28=_allocFace()|0;if(($28|0)==0){$_0=0;label=12;break}else{label=11;break};case 11:_MakeFace($28,$eDst,HEAP32[$12>>2]|0);HEAP32[(HEAP32[$12>>2]|0)+8>>2]=$eOrg;$_0=1;label=12;break;case 12:return $_0|0}return 0}function _KillVertex($vDel,$newOrg){$vDel=$vDel|0;$newOrg=$newOrg|0;var $2=0,$e_0=0,$6=0,$10=0,$12=0,label=0;label=1;while(1)switch(label|0){case 1:$2=HEAP32[$vDel+8>>2]|0;$e_0=$2;label=2;break;case 2:HEAP32[$e_0+16>>2]=$newOrg;$6=HEAP32[$e_0+8>>2]|0;if(($6|0)==($2|0)){label=3;break}else{$e_0=$6;label=2;break};case 3:$10=HEAP32[$vDel+4>>2]|0;$12=HEAP32[$vDel>>2]|0;HEAP32[$12+4>>2]=$10;HEAP32[$10>>2]=$12;_free($vDel);return}}function _KillFace($fDel,$newLface){$fDel=$fDel|0;$newLface=$newLface|0;var $2=0,$e_0=0,$6=0,$10=0,$12=0,label=0;label=1;while(1)switch(label|0){case 1:$2=HEAP32[$fDel+8>>2]|0;$e_0=$2;label=2;break;case 2:HEAP32[$e_0+20>>2]=$newLface;$6=HEAP32[$e_0+12>>2]|0;if(($6|0)==($2|0)){label=3;break}else{$e_0=$6;label=2;break};case 3:$10=HEAP32[$fDel+4>>2]|0;$12=HEAP32[$fDel>>2]|0;HEAP32[$12+4>>2]=$10;HEAP32[$10>>2]=$12;_free($fDel);return}}function ___gl_meshDelete($eDel){$eDel=$eDel|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$joiningLoops_0=0,$10=0,$17=0,$32=0,$37=0,$45=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$eDel+4|0;$2=HEAP32[$1>>2]|0;$3=$eDel+20|0;$4=HEAP32[$3>>2]|0;$5=$2+20|0;$6=HEAP32[$5>>2]|0;if(($4|0)==($6|0)){$joiningLoops_0=0;label=3;break}else{label=2;break};case 2:_KillFace($4,$6);$joiningLoops_0=1;label=3;break;case 3:$10=$eDel+8|0;if((HEAP32[$10>>2]|0)==($eDel|0)){label=4;break}else{label=5;break};case 4:_KillVertex(HEAP32[$eDel+16>>2]|0,0);label=8;break;case 5:$17=HEAP32[$1>>2]|0;HEAP32[(HEAP32[$17+20>>2]|0)+8>>2]=HEAP32[$17+12>>2];HEAP32[(HEAP32[$eDel+16>>2]|0)+8>>2]=HEAP32[$10>>2];_Splice($eDel,HEAP32[(HEAP32[$1>>2]|0)+12>>2]|0);if(($joiningLoops_0|0)==0){label=6;break}else{label=8;break};case 6:$32=_allocFace()|0;if(($32|0)==0){$_0=0;label=12;break}else{label=7;break};case 7:_MakeFace($32,$eDel,HEAP32[$3>>2]|0);label=8;break;case 8:$37=$2+8|0;if((HEAP32[$37>>2]|0)==($2|0)){label=9;break}else{label=10;break};case 9:_KillVertex(HEAP32[$2+16>>2]|0,0);_KillFace(HEAP32[$5>>2]|0,0);label=11;break;case 10:$45=$2+4|0;HEAP32[(HEAP32[$3>>2]|0)+8>>2]=HEAP32[(HEAP32[$45>>2]|0)+12>>2];HEAP32[(HEAP32[$2+16>>2]|0)+8>>2]=HEAP32[$37>>2];_Splice($2,HEAP32[(HEAP32[$45>>2]|0)+12>>2]|0);label=11;break;case 11:_KillEdge($eDel);$_0=1;label=12;break;case 12:return $_0|0}return 0}function _KillEdge($eDel){$eDel=$eDel|0;var $2=0,$_eDel=0,$5=0,$9=0;$2=HEAP32[$eDel+4>>2]|0;$_eDel=$2>>>0<$eDel>>>0?$2:$eDel;$5=HEAP32[$_eDel>>2]|0;$9=HEAP32[HEAP32[$_eDel+4>>2]>>2]|0;HEAP32[HEAP32[$5+4>>2]>>2]=$9;HEAP32[HEAP32[$9+4>>2]>>2]=$5;_free($_eDel);return}function ___gl_meshAddEdgeVertex($eOrg){$eOrg=$eOrg|0;var $1=0,$5=0,$12=0,$13=0,$18=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=_MakeEdge($eOrg)|0;if(($1|0)==0){$_0=0;label=4;break}else{label=2;break};case 2:$5=HEAP32[$1+4>>2]|0;_Splice($1,HEAP32[$eOrg+12>>2]|0);$12=$1+16|0;HEAP32[$12>>2]=HEAP32[(HEAP32[$eOrg+4>>2]|0)+16>>2];$13=_allocVertex()|0;if(($13|0)==0){$_0=0;label=4;break}else{label=3;break};case 3:_MakeVertex($13,$5,HEAP32[$12>>2]|0);$18=HEAP32[$eOrg+20>>2]|0;HEAP32[$5+20>>2]=$18;HEAP32[$1+20>>2]=$18;$_0=$1;label=4;break;case 4:return $_0|0}return 0}function ___gl_meshSplitEdge($eOrg){$eOrg=$eOrg|0;var $1=0,$5=0,$6=0,$7=0,$17=0,$18=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=___gl_meshAddEdgeVertex($eOrg)|0;if(($1|0)==0){$_0=0;label=3;break}else{label=2;break};case 2:$5=HEAP32[$1+4>>2]|0;$6=$eOrg+4|0;$7=HEAP32[$6>>2]|0;_Splice($7,HEAP32[(HEAP32[$7+4>>2]|0)+12>>2]|0);_Splice(HEAP32[$6>>2]|0,$5);HEAP32[(HEAP32[$6>>2]|0)+16>>2]=HEAP32[$5+16>>2];$17=$5+4|0;$18=HEAP32[$17>>2]|0;HEAP32[(HEAP32[$18+16>>2]|0)+8>>2]=$18;HEAP32[(HEAP32[$17>>2]|0)+20>>2]=HEAP32[(HEAP32[$6>>2]|0)+20>>2];HEAP32[$5+28>>2]=HEAP32[$eOrg+28>>2];HEAP32[(HEAP32[$17>>2]|0)+28>>2]=HEAP32[(HEAP32[$6>>2]|0)+28>>2];$_0=$5;label=3;break;case 3:return $_0|0}return 0}function ___gl_meshConnect($eOrg,$eDst){$eOrg=$eOrg|0;$eDst=$eDst|0;var $1=0,$5=0,$7=0,$8=0,$9=0,$joiningLoops_0=0,$23=0,$29=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=_MakeEdge($eOrg)|0;if(($1|0)==0){$_0=0;label=7;break}else{label=2;break};case 2:$5=HEAP32[$1+4>>2]|0;$7=HEAP32[$eDst+20>>2]|0;$8=$eOrg+20|0;$9=HEAP32[$8>>2]|0;if(($7|0)==($9|0)){$joiningLoops_0=0;label=4;break}else{label=3;break};case 3:_KillFace($7,$9);$joiningLoops_0=1;label=4;break;case 4:_Splice($1,HEAP32[$eOrg+12>>2]|0);_Splice($5,$eDst);HEAP32[$1+16>>2]=HEAP32[(HEAP32[$eOrg+4>>2]|0)+16>>2];HEAP32[$5+16>>2]=HEAP32[$eDst+16>>2];$23=HEAP32[$8>>2]|0;HEAP32[$5+20>>2]=$23;HEAP32[$1+20>>2]=$23;HEAP32[(HEAP32[$8>>2]|0)+8>>2]=$5;if($joiningLoops_0){$_0=$1;label=7;break}else{label=5;break};case 5:$29=_allocFace()|0;if(($29|0)==0){$_0=0;label=7;break}else{label=6;break};case 6:_MakeFace($29,$1,HEAP32[$8>>2]|0);$_0=$1;label=7;break;case 7:return $_0|0}return 0}function ___gl_meshZapFace($fZap){$fZap=$fZap|0;var $2=0,$eNext_0=0,$7=0,$9=0,$16=0,$19=0,$27=0,$29=0,$32=0,$45=0,$47=0,label=0;label=1;while(1)switch(label|0){case 1:$2=HEAP32[$fZap+8>>2]|0;$eNext_0=HEAP32[$2+12>>2]|0;label=2;break;case 2:$7=HEAP32[$eNext_0+12>>2]|0;HEAP32[$eNext_0+20>>2]=0;$9=$eNext_0+4|0;if((HEAP32[(HEAP32[$9>>2]|0)+20>>2]|0)==0){label=3;break}else{label=10;break};case 3:$16=HEAP32[$eNext_0+8>>2]|0;$19=HEAP32[$eNext_0+16>>2]|0;if(($16|0)==($eNext_0|0)){label=4;break}else{label=5;break};case 4:_KillVertex($19,0);label=6;break;case 5:HEAP32[$19+8>>2]=$16;_Splice($eNext_0,HEAP32[(HEAP32[$9>>2]|0)+12>>2]|0);label=6;break;case 6:$27=HEAP32[$9>>2]|0;$29=HEAP32[$27+8>>2]|0;$32=HEAP32[$27+16>>2]|0;if(($29|0)==($27|0)){label=7;break}else{label=8;break};case 7:_KillVertex($32,0);label=9;break;case 8:HEAP32[$32+8>>2]=$29;_Splice($27,HEAP32[(HEAP32[$27+4>>2]|0)+12>>2]|0);label=9;break;case 9:_KillEdge($eNext_0);label=10;break;case 10:if(($eNext_0|0)==($2|0)){label=11;break}else{$eNext_0=$7;label=2;break};case 11:$45=HEAP32[$fZap+4>>2]|0;$47=HEAP32[$fZap>>2]|0;HEAP32[$47+4>>2]=$45;HEAP32[$45>>2]=$47;_free($fZap);return}}function ___gl_meshNewMesh(){var $1=0,$5=0,$6=0,$7=0,$8=0,$9=0,$10=0,$11=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=_malloc(160)|0;if(($1|0)==0){$_0=0;label=3;break}else{label=2;break};case 2:$5=$1;$6=$1+64|0;$7=$6;$8=$1+92|0;$9=$8;$10=$1+124|0;$11=$10;HEAP32[$1+4>>2]=$5;HEAP32[$1>>2]=$5;HEAP32[$1+8>>2]=0;HEAP32[$1+12>>2]=0;HEAP32[$1+68>>2]=$7;HEAP32[$6>>2]=$7;_memset($1+72|0,0,20);HEAP32[$8>>2]=$9;HEAP32[$1+96>>2]=$11;_memset($1+100|0,0,24);HEAP32[$10>>2]=$11;HEAP32[$1+128>>2]=$9;_memset($1+132|0,0,24);$_0=$1;label=3;break;case 3:return $_0|0}return 0}function ___gl_meshDeleteMesh($mesh){$mesh=$mesh|0;var $1=0,$3=0,$f_018=0,$6=0,$9=0,$11=0,$v_014=0,$14=0,$17=0,$19=0,$e_013=0,$22=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$mesh+64|0;$3=HEAP32[$1>>2]|0;if(($3|0)==($1|0)){label=3;break}else{$f_018=$3;label=2;break};case 2:$6=HEAP32[$f_018>>2]|0;_free($f_018);if(($6|0)==($1|0)){label=3;break}else{$f_018=$6;label=2;break};case 3:$9=$mesh|0;$11=HEAP32[$mesh>>2]|0;if(($11|0)==($9|0)){label=5;break}else{$v_014=$11;label=4;break};case 4:$14=HEAP32[$v_014>>2]|0;_free($v_014);if(($14|0)==($9|0)){label=5;break}else{$v_014=$14;label=4;break};case 5:$17=$mesh+92|0;$19=HEAP32[$17>>2]|0;if(($19|0)==($17|0)){label=7;break}else{$e_013=$19;label=6;break};case 6:$22=HEAP32[$e_013>>2]|0;_free($e_013);if(($22|0)==($17|0)){label=7;break}else{$e_013=$22;label=6;break};case 7:_free($mesh);return}}function _MakeVertex($newVertex,$eOrig,$vNext){$newVertex=$newVertex|0;$eOrig=$eOrig|0;$vNext=$vNext|0;var $4=0,$5=0,$e_0=0,$14=0,label=0;label=1;while(1)switch(label|0){case 1:if(($newVertex|0)==0){label=2;break}else{label=3;break};case 2:___assert_func(1744,141,2104,1048);case 3:$4=$vNext+4|0;$5=HEAP32[$4>>2]|0;HEAP32[$newVertex+4>>2]=$5;HEAP32[$5>>2]=$newVertex;HEAP32[$newVertex>>2]=$vNext;HEAP32[$4>>2]=$newVertex;HEAP32[$newVertex+8>>2]=$eOrig;HEAP32[$newVertex+12>>2]=0;$e_0=$eOrig;label=4;break;case 4:HEAP32[$e_0+16>>2]=$newVertex;$14=HEAP32[$e_0+8>>2]|0;if(($14|0)==($eOrig|0)){label=5;break}else{$e_0=$14;label=4;break};case 5:return}}function _MakeFace($newFace,$eOrig,$fNext){$newFace=$newFace|0;$eOrig=$eOrig|0;$fNext=$fNext|0;var $4=0,$5=0,$e_0=0,$19=0,label=0;label=1;while(1)switch(label|0){case 1:if(($newFace|0)==0){label=2;break}else{label=3;break};case 2:___assert_func(1744,174,2120,1120);case 3:$4=$fNext+4|0;$5=HEAP32[$4>>2]|0;HEAP32[$newFace+4>>2]=$5;HEAP32[$5>>2]=$newFace;HEAP32[$newFace>>2]=$fNext;HEAP32[$4>>2]=$newFace;HEAP32[$newFace+8>>2]=$eOrig;HEAP32[$newFace+12>>2]=0;HEAP32[$newFace+16>>2]=0;HEAP32[$newFace+20>>2]=0;HEAP32[$newFace+24>>2]=HEAP32[$fNext+24>>2];$e_0=$eOrig;label=4;break;case 4:HEAP32[$e_0+20>>2]=$newFace;$19=HEAP32[$e_0+12>>2]|0;if(($19|0)==($eOrig|0)){label=5;break}else{$e_0=$19;label=4;break};case 5:return}}function _allocFace(){return _malloc(28)|0}function _allocVertex(){return _malloc(64)|0}function _RenderMaximumFaceGroup($tess,$fOrig){$tess=$tess|0;$fOrig=$fOrig|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$8=0,$newFace_sroa_0_0_copyload27=0,$max_sroa_2_0=0,$max_sroa_1_0=0,$max_sroa_0_0=0,$16=0,$newFace_sroa_0_0_copyload22=0,$max_sroa_2_1=0,$max_sroa_1_1=0,$max_sroa_0_1=0,$21=0,$newFace_sroa_0_0_copyload17=0,$max_sroa_2_2=0,$max_sroa_1_2=0,$max_sroa_0_2=0,$newFace_sroa_0_0_copyload12=0,$max_sroa_2_3=0,$max_sroa_1_3=0,$max_sroa_0_3=0,$newFace_sroa_0_0_copyload7=0,$max_sroa_2_4=0,$max_sroa_1_4=0,$max_sroa_0_4=0,$newFace_sroa_0_0_copyload2=0,$max_sroa_2_5=0,$max_sroa_1_5=0,$max_sroa_0_5=0,label=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+96|0;label=1;while(1)switch(label|0){case 1:$1=sp|0;$2=sp+16|0;$3=sp+32|0;$4=sp+48|0;$5=sp+64|0;$6=sp+80|0;$8=HEAP32[$fOrig+8>>2]|0;if((HEAP32[$tess+120>>2]|0)==0){label=2;break}else{$max_sroa_0_5=1;$max_sroa_1_5=$8;$max_sroa_2_5=24;label=14;break};case 2:_MaximumFan($1,$8);$newFace_sroa_0_0_copyload27=HEAP32[$1>>2]|0;if(($newFace_sroa_0_0_copyload27|0)>1){label=3;break}else{$max_sroa_0_0=1;$max_sroa_1_0=$8;$max_sroa_2_0=24;label=4;break};case 3:$max_sroa_0_0=$newFace_sroa_0_0_copyload27;$max_sroa_1_0=HEAP32[$1+4>>2]|0;$max_sroa_2_0=HEAP32[$1+8>>2]|0;label=4;break;case 4:$16=$8+12|0;_MaximumFan($2,HEAP32[$16>>2]|0);$newFace_sroa_0_0_copyload22=HEAP32[$2>>2]|0;if(($newFace_sroa_0_0_copyload22|0)>($max_sroa_0_0|0)){label=5;break}else{$max_sroa_0_1=$max_sroa_0_0;$max_sroa_1_1=$max_sroa_1_0;$max_sroa_2_1=$max_sroa_2_0;label=6;break};case 5:$max_sroa_0_1=$newFace_sroa_0_0_copyload22;$max_sroa_1_1=HEAP32[$2+4>>2]|0;$max_sroa_2_1=HEAP32[$2+8>>2]|0;label=6;break;case 6:$21=$8+8|0;_MaximumFan($3,HEAP32[(HEAP32[$21>>2]|0)+4>>2]|0);$newFace_sroa_0_0_copyload17=HEAP32[$3>>2]|0;if(($newFace_sroa_0_0_copyload17|0)>($max_sroa_0_1|0)){label=7;break}else{$max_sroa_0_2=$max_sroa_0_1;$max_sroa_1_2=$max_sroa_1_1;$max_sroa_2_2=$max_sroa_2_1;label=8;break};case 7:$max_sroa_0_2=$newFace_sroa_0_0_copyload17;$max_sroa_1_2=HEAP32[$3+4>>2]|0;$max_sroa_2_2=HEAP32[$3+8>>2]|0;label=8;break;case 8:_MaximumStrip($4,$8);$newFace_sroa_0_0_copyload12=HEAP32[$4>>2]|0;if(($newFace_sroa_0_0_copyload12|0)>($max_sroa_0_2|0)){label=9;break}else{$max_sroa_0_3=$max_sroa_0_2;$max_sroa_1_3=$max_sroa_1_2;$max_sroa_2_3=$max_sroa_2_2;label=10;break};case 9:$max_sroa_0_3=$newFace_sroa_0_0_copyload12;$max_sroa_1_3=HEAP32[$4+4>>2]|0;$max_sroa_2_3=HEAP32[$4+8>>2]|0;label=10;break;case 10:_MaximumStrip($5,HEAP32[$16>>2]|0);$newFace_sroa_0_0_copyload7=HEAP32[$5>>2]|0;if(($newFace_sroa_0_0_copyload7|0)>($max_sroa_0_3|0)){label=11;break}else{$max_sroa_0_4=$max_sroa_0_3;$max_sroa_1_4=$max_sroa_1_3;$max_sroa_2_4=$max_sroa_2_3;label=12;break};case 11:$max_sroa_0_4=$newFace_sroa_0_0_copyload7;$max_sroa_1_4=HEAP32[$5+4>>2]|0;$max_sroa_2_4=HEAP32[$5+8>>2]|0;label=12;break;case 12:_MaximumStrip($6,HEAP32[(HEAP32[$21>>2]|0)+4>>2]|0);$newFace_sroa_0_0_copyload2=HEAP32[$6>>2]|0;if(($newFace_sroa_0_0_copyload2|0)>($max_sroa_0_4|0)){label=13;break}else{$max_sroa_0_5=$max_sroa_0_4;$max_sroa_1_5=$max_sroa_1_4;$max_sroa_2_5=$max_sroa_2_4;label=14;break};case 13:$max_sroa_0_5=$newFace_sroa_0_0_copyload2;$max_sroa_1_5=HEAP32[$6+4>>2]|0;$max_sroa_2_5=HEAP32[$6+8>>2]|0;label=14;break;case 14:FUNCTION_TABLE_viii[$max_sroa_2_5&127]($tess,$max_sroa_1_5,$max_sroa_0_5);STACKTOP=sp;return}}function _RenderLonelyTriangles($tess,$f){$tess=$tess|0;$f=$f|0;var $2=0,$edgeState_025=0,$_024=0,$19=0,$e_0=0,$edgeState_1=0,$32=0,$35=0,$edgeState_2=0,$42=0,$58=0,$63=0,$66=0,label=0;label=1;while(1)switch(label|0){case 1:$2=HEAP32[$tess+3360>>2]|0;if(($2|0)==74){label=3;break}else{label=2;break};case 2:FUNCTION_TABLE_vii[$2&127](4,HEAP32[$tess+3424>>2]|0);label=4;break;case 3:FUNCTION_TABLE_vi[HEAP32[$tess+132>>2]&127](4);label=4;break;case 4:if(($f|0)==0){label=17;break}else{label=5;break};case 5:$_024=$f;$edgeState_025=-1;label=6;break;case 6:$19=$_024+8|0;$edgeState_1=$edgeState_025;$e_0=HEAP32[$19>>2]|0;label=7;break;case 7:if((HEAP32[$tess+120>>2]|0)==0){$edgeState_2=$edgeState_1;label=12;break}else{label=8;break};case 8:$32=(HEAP32[(HEAP32[(HEAP32[$e_0+4>>2]|0)+20>>2]|0)+24>>2]|0)==0|0;if(($edgeState_1|0)==($32|0)){$edgeState_2=$edgeState_1;label=12;break}else{label=9;break};case 9:$35=HEAP32[$tess+3364>>2]|0;if(($35|0)==58){label=11;break}else{label=10;break};case 10:FUNCTION_TABLE_vii[$35&127]($32,HEAP32[$tess+3424>>2]|0);$edgeState_2=$32;label=12;break;case 11:FUNCTION_TABLE_vi[HEAP32[$tess+136>>2]&127]($32);$edgeState_2=$32;label=12;break;case 12:$42=HEAP32[$tess+3368>>2]|0;if(($42|0)==10){label=14;break}else{label=13;break};case 13:FUNCTION_TABLE_vii[$42&127](HEAP32[(HEAP32[$e_0+16>>2]|0)+12>>2]|0,HEAP32[$tess+3424>>2]|0);label=15;break;case 14:FUNCTION_TABLE_vi[HEAP32[$tess+140>>2]&127](HEAP32[(HEAP32[$e_0+16>>2]|0)+12>>2]|0);label=15;break;case 15:$58=HEAP32[$e_0+12>>2]|0;if(($58|0)==(HEAP32[$19>>2]|0)){label=16;break}else{$edgeState_1=$edgeState_2;$e_0=$58;label=7;break};case 16:$63=HEAP32[$_024+16>>2]|0;if(($63|0)==0){label=17;break}else{$_024=$63;$edgeState_025=$edgeState_2;label=6;break};case 17:$66=HEAP32[$tess+3372>>2]|0;if(($66|0)==16){label=19;break}else{label=18;break};case 18:FUNCTION_TABLE_vi[$66&127](HEAP32[$tess+3424>>2]|0);label=20;break;case 19:FUNCTION_TABLE_v[HEAP32[$tess+144>>2]&127]();label=20;break;case 20:return}}function ___gl_renderBoundary($tess,$mesh){$tess=$tess|0;$mesh=$mesh|0;var $1=0,$f_019=0,$f_020=0,$f_0=0,$18=0,$25=0,$e_0=0,$28=0,$44=0,$48=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$mesh+64|0;$f_019=HEAP32[$1>>2]|0;if(($f_019|0)==($1|0)){label=16;break}else{label=2;break};case 2:$f_020=$f_019;label=3;break;case 3:if((HEAP32[$f_020+24>>2]|0)==0){label=4;break}else{label=5;break};case 4:$f_0=HEAP32[$f_020>>2]|0;if(($f_0|0)==($1|0)){label=16;break}else{$f_020=$f_0;label=3;break};case 5:$18=HEAP32[$tess+3360>>2]|0;if(($18|0)==74){label=7;break}else{label=6;break};case 6:FUNCTION_TABLE_vii[$18&127](2,HEAP32[$tess+3424>>2]|0);label=8;break;case 7:FUNCTION_TABLE_vi[HEAP32[$tess+132>>2]&127](2);label=8;break;case 8:$25=$f_020+8|0;$e_0=HEAP32[$25>>2]|0;label=9;break;case 9:$28=HEAP32[$tess+3368>>2]|0;if(($28|0)==10){label=11;break}else{label=10;break};case 10:FUNCTION_TABLE_vii[$28&127](HEAP32[(HEAP32[$e_0+16>>2]|0)+12>>2]|0,HEAP32[$tess+3424>>2]|0);label=12;break;case 11:FUNCTION_TABLE_vi[HEAP32[$tess+140>>2]&127](HEAP32[(HEAP32[$e_0+16>>2]|0)+12>>2]|0);label=12;break;case 12:$44=HEAP32[$e_0+12>>2]|0;if(($44|0)==(HEAP32[$25>>2]|0)){label=13;break}else{$e_0=$44;label=9;break};case 13:$48=HEAP32[$tess+3372>>2]|0;if(($48|0)==16){label=15;break}else{label=14;break};case 14:FUNCTION_TABLE_vi[$48&127](HEAP32[$tess+3424>>2]|0);label=4;break;case 15:FUNCTION_TABLE_v[HEAP32[$tess+144>>2]&127]();label=4;break;case 16:return}}function ___gl_meshCheckMesh($mesh){$mesh=$mesh|0;var $1=0,$2=0,$3=0,$5=0,$9=0,$11=0,$15=0,$16=0,$17=0,$20=0,$e_0=0,$24=0,$34=0,$_lcssa112=0,$_lcssa105=0,$67=0,$71=0,$74=0,$78=0,$79=0,$80=0,$83=0,$e_1=0,$87=0,$106=0,$_lcssa96=0,$_lcssa89=0,$ePrev_0=0,$131=0,$134=0,$139=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$mesh+64|0;$2=$mesh|0;$3=$mesh+92|0;$5=HEAP32[$1>>2]|0;$9=(HEAP32[$5+4>>2]|0)==($1|0);if(($5|0)==($1|0)){$_lcssa105=$5;$_lcssa112=$9;label=17;break}else{$17=$5;$16=$9;label=3;break};case 2:$11=HEAP32[$17>>2]|0;$15=(HEAP32[$11+4>>2]|0)==($17|0);if(($11|0)==($1|0)){$_lcssa105=$11;$_lcssa112=$15;label=17;break}else{$17=$11;$16=$15;label=3;break};case 3:if($16){label=5;break}else{label=4;break};case 4:___assert_func(1744,753,1976,1720);case 5:$20=$17+8|0;$e_0=HEAP32[$20>>2]|0;label=6;break;case 6:$24=HEAP32[$e_0+4>>2]|0;if(($24|0)==($e_0|0)){label=7;break}else{label=8;break};case 7:___assert_func(1744,756,1976,864);case 8:if((HEAP32[$24+4>>2]|0)==($e_0|0)){label=10;break}else{label=9;break};case 9:___assert_func(1744,757,1976,688);case 10:$34=HEAP32[$e_0+12>>2]|0;if((HEAP32[(HEAP32[$34+8>>2]|0)+4>>2]|0)==($e_0|0)){label=12;break}else{label=11;break};case 11:___assert_func(1744,758,1976,592);case 12:if((HEAP32[(HEAP32[(HEAP32[$e_0+8>>2]|0)+4>>2]|0)+12>>2]|0)==($e_0|0)){label=14;break}else{label=13;break};case 13:___assert_func(1744,759,1976,496);case 14:if((HEAP32[$e_0+20>>2]|0)==($17|0)){label=16;break}else{label=15;break};case 15:___assert_func(1744,760,1976,424);case 16:if(($34|0)==(HEAP32[$20>>2]|0)){label=2;break}else{$e_0=$34;label=6;break};case 17:if($_lcssa112){label=18;break}else{label=21;break};case 18:if((HEAP32[$_lcssa105+8>>2]|0)==0){label=19;break}else{label=21;break};case 19:if((HEAP32[$_lcssa105+12>>2]|0)==0){label=20;break}else{label=21;break};case 20:$67=HEAP32[$mesh>>2]|0;$71=(HEAP32[$67+4>>2]|0)==($2|0);if(($67|0)==($2|0)){$_lcssa89=$67;$_lcssa96=$71;label=37;break}else{$80=$67;$79=$71;label=23;break};case 21:___assert_func(1744,764,1976,304);case 22:$74=HEAP32[$80>>2]|0;$78=(HEAP32[$74+4>>2]|0)==($80|0);if(($74|0)==($2|0)){$_lcssa89=$74;$_lcssa96=$78;label=37;break}else{$80=$74;$79=$78;label=23;break};case 23:if($79){label=25;break}else{label=24;break};case 24:___assert_func(1744,768,1976,128);case 25:$83=$80+8|0;$e_1=HEAP32[$83>>2]|0;label=26;break;case 26:$87=HEAP32[$e_1+4>>2]|0;if(($87|0)==($e_1|0)){label=27;break}else{label=28;break};case 27:___assert_func(1744,771,1976,864);case 28:if((HEAP32[$87+4>>2]|0)==($e_1|0)){label=30;break}else{label=29;break};case 29:___assert_func(1744,772,1976,688);case 30:if((HEAP32[(HEAP32[(HEAP32[$e_1+12>>2]|0)+8>>2]|0)+4>>2]|0)==($e_1|0)){label=32;break}else{label=31;break};case 31:___assert_func(1744,773,1976,592);case 32:$106=HEAP32[$e_1+8>>2]|0;if((HEAP32[(HEAP32[$106+4>>2]|0)+12>>2]|0)==($e_1|0)){label=34;break}else{label=33;break};case 33:___assert_func(1744,774,1976,496);case 34:if((HEAP32[$e_1+16>>2]|0)==($80|0)){label=36;break}else{label=35;break};case 35:___assert_func(1744,775,1976,56);case 36:if(($106|0)==(HEAP32[$83>>2]|0)){label=22;break}else{$e_1=$106;label=26;break};case 37:if($_lcssa96){label=38;break}else{label=40;break};case 38:if((HEAP32[$_lcssa89+8>>2]|0)==0){label=39;break}else{label=40;break};case 39:if((HEAP32[$_lcssa89+12>>2]|0)==0){$ePrev_0=$3;label=41;break}else{label=40;break};case 40:___assert_func(1744,779,1976,1656);case 41:$131=HEAP32[$ePrev_0>>2]|0;$134=HEAP32[$131+4>>2]|0;$139=(HEAP32[$134>>2]|0)==(HEAP32[$ePrev_0+4>>2]|0);if(($131|0)==($3|0)){label=56;break}else{label=42;break};case 42:if($139){label=44;break}else{label=43;break};case 43:___assert_func(1744,783,1976,1576);case 44:if(($134|0)==($131|0)){label=45;break}else{label=46;break};case 45:___assert_func(1744,784,1976,864);case 46:if((HEAP32[$134+4>>2]|0)==($131|0)){label=48;break}else{label=47;break};case 47:___assert_func(1744,785,1976,688);case 48:if((HEAP32[$131+16>>2]|0)==0){label=49;break}else{label=50;break};case 49:___assert_func(1744,786,1976,1496);case 50:if((HEAP32[$134+16>>2]|0)==0){label=51;break}else{label=52;break};case 51:___assert_func(1744,787,1976,1432);case 52:if((HEAP32[(HEAP32[(HEAP32[$131+12>>2]|0)+8>>2]|0)+4>>2]|0)==($131|0)){label=54;break}else{label=53;break};case 53:___assert_func(1744,788,1976,592);case 54:if((HEAP32[(HEAP32[(HEAP32[$131+8>>2]|0)+4>>2]|0)+12>>2]|0)==($131|0)){$ePrev_0=$131;label=41;break}else{label=55;break};case 55:___assert_func(1744,789,1976,496);case 56:if($139){label=57;break}else{label=63;break};case 57:if(($134|0)==($mesh+124|0)){label=58;break}else{label=63;break};case 58:if((HEAP32[$134+4>>2]|0)==($131|0)){label=59;break}else{label=63;break};case 59:if((HEAP32[$131+16>>2]|0)==0){label=60;break}else{label=63;break};case 60:if((HEAP32[$134+16>>2]|0)==0){label=61;break}else{label=63;break};case 61:if((HEAP32[$131+20>>2]|0)==0){label=62;break}else{label=63;break};case 62:if((HEAP32[$134+20>>2]|0)==0){label=64;break}else{label=63;break};case 63:___assert_func(1744,795,1976,1200);case 64:return}}function ___gl_renderMesh($tess,$mesh){$tess=$tess|0;$mesh=$mesh|0;var $1=0,$2=0,$3=0,$f_020=0,$f_118=0,$f_021=0,$f_0=0,$f_119=0,$13=0,$f_1=0,$23=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$tess+128|0;HEAP32[$1>>2]=0;$2=$mesh+64|0;$3=$2|0;$f_020=HEAP32[$3>>2]|0;if(($f_020|0)==($2|0)){label=2;break}else{$f_021=$f_020;label=3;break};case 2:$f_118=HEAP32[$3>>2]|0;if(($f_118|0)==($2|0)){label=9;break}else{$f_119=$f_118;label=4;break};case 3:HEAP32[$f_021+20>>2]=0;$f_0=HEAP32[$f_021>>2]|0;if(($f_0|0)==($2|0)){label=2;break}else{$f_021=$f_0;label=3;break};case 4:if((HEAP32[$f_119+24>>2]|0)==0){label=8;break}else{label=5;break};case 5:$13=$f_119+20|0;if((HEAP32[$13>>2]|0)==0){label=6;break}else{label=8;break};case 6:_RenderMaximumFaceGroup($tess,$f_119);if((HEAP32[$13>>2]|0)==0){label=7;break}else{label=8;break};case 7:___assert_func(992,100,1784,1512);case 8:$f_1=HEAP32[$f_119>>2]|0;if(($f_1|0)==($2|0)){label=9;break}else{$f_119=$f_1;label=4;break};case 9:$23=HEAP32[$1>>2]|0;if(($23|0)==0){label=11;break}else{label=10;break};case 10:_RenderLonelyTriangles($tess,$23);HEAP32[$1>>2]=0;label=11;break;case 11:return}}function _MaximumFan($agg_result,$eOrig){$agg_result=$agg_result|0;$eOrig=$eOrig|0;var $1=0,$2=0,$6=0,$7=0,$e_035=0,$trail_034=0,$newFace_sroa_0_033=0,$trail_0_lcssa=0,$newFace_sroa_0_0_lcssa=0,$10=0,$13=0,$19=0,$21=0,$23=0,$24=0,$25=0,$29=0,$30=0,$e_129=0,$trail_128=0,$newFace_sroa_0_127=0,$e_1_lcssa=0,$trail_1_lcssa=0,$newFace_sroa_0_1_lcssa=0,$37=0,$39=0,$42=0,$43=0,$46=0,$trail_226=0,$52=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$eOrig+20|0;$2=HEAP32[$1>>2]|0;if((HEAP32[$2+24>>2]|0)==0){$newFace_sroa_0_0_lcssa=0;$trail_0_lcssa=0;label=3;break}else{$newFace_sroa_0_033=0;$trail_034=0;$e_035=$eOrig;$7=$1;$6=$2;label=2;break};case 2:if((HEAP32[$6+20>>2]|0)==0){label=4;break}else{$newFace_sroa_0_0_lcssa=$newFace_sroa_0_033;$trail_0_lcssa=$trail_034;label=3;break};case 3:$10=$eOrig+4|0;$13=HEAP32[(HEAP32[$10>>2]|0)+20>>2]|0;if((HEAP32[$13+24>>2]|0)==0){$newFace_sroa_0_1_lcssa=$newFace_sroa_0_0_lcssa;$trail_1_lcssa=$trail_0_lcssa;$e_1_lcssa=$eOrig;label=6;break}else{$newFace_sroa_0_127=$newFace_sroa_0_0_lcssa;$trail_128=$trail_0_lcssa;$e_129=$eOrig;$30=$10;$29=$13;label=5;break};case 4:HEAP32[$6+16>>2]=$trail_034;$19=HEAP32[$7>>2]|0;HEAP32[$19+20>>2]=1;$21=$newFace_sroa_0_033+1|0;$23=HEAP32[$e_035+8>>2]|0;$24=$23+20|0;$25=HEAP32[$24>>2]|0;if((HEAP32[$25+24>>2]|0)==0){$newFace_sroa_0_0_lcssa=$21;$trail_0_lcssa=$19;label=3;break}else{$newFace_sroa_0_033=$21;$trail_034=$19;$e_035=$23;$7=$24;$6=$25;label=2;break};case 5:if((HEAP32[$29+20>>2]|0)==0){label=7;break}else{$newFace_sroa_0_1_lcssa=$newFace_sroa_0_127;$trail_1_lcssa=$trail_128;$e_1_lcssa=$e_129;label=6;break};case 6:if(($trail_1_lcssa|0)==0){label=9;break}else{$trail_226=$trail_1_lcssa;label=8;break};case 7:HEAP32[$29+16>>2]=$trail_128;$37=HEAP32[(HEAP32[$30>>2]|0)+20>>2]|0;HEAP32[$37+20>>2]=1;$39=$newFace_sroa_0_127+1|0;$42=HEAP32[(HEAP32[$30>>2]|0)+12>>2]|0;$43=$42+4|0;$46=HEAP32[(HEAP32[$43>>2]|0)+20>>2]|0;if((HEAP32[$46+24>>2]|0)==0){$newFace_sroa_0_1_lcssa=$39;$trail_1_lcssa=$37;$e_1_lcssa=$42;label=6;break}else{$newFace_sroa_0_127=$39;$trail_128=$37;$e_129=$42;$30=$43;$29=$46;label=5;break};case 8:HEAP32[$trail_226+20>>2]=0;$52=HEAP32[$trail_226+16>>2]|0;if(($52|0)==0){label=9;break}else{$trail_226=$52;label=8;break};case 9:HEAP32[$agg_result>>2]=$newFace_sroa_0_1_lcssa;HEAP32[$agg_result+4>>2]=$e_1_lcssa;HEAP32[$agg_result+8>>2]=26;return}}function _MaximumStrip($agg_result,$eOrig){$agg_result=$agg_result|0;$eOrig=$eOrig|0;var $1=0,$2=0,$6=0,$7=0,$e_056=0,$trail_055=0,$tailSize_054=0,$12=0,$14=0,$18=0,$19=0,$20=0,$30=0,$32=0,$34=0,$35=0,$36=0,$tailSize_1=0,$trail_1=0,$e_1=0,$40=0,$43=0,$47=0,$48=0,$e_250=0,$trail_249=0,$headSize_048=0,$55=0,$57=0,$60=0,$61=0,$64=0,$76=0,$78=0,$83=0,$84=0,$87=0,$headSize_1=0,$trail_3=0,$e_3=0,$91=0,$newFace_sroa_0_0_ph=0,$newFace_sroa_1_0_ph=0,$trail_447=0,$107=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$eOrig+20|0;$2=HEAP32[$1>>2]|0;if((HEAP32[$2+24>>2]|0)==0){$e_1=$eOrig;$trail_1=0;$tailSize_1=0;label=6;break}else{$tailSize_054=0;$trail_055=0;$e_056=$eOrig;$7=$1;$6=$2;label=2;break};case 2:if((HEAP32[$6+20>>2]|0)==0){label=3;break}else{$e_1=$e_056;$trail_1=$trail_055;$tailSize_1=$tailSize_054;label=6;break};case 3:HEAP32[$6+16>>2]=$trail_055;$12=HEAP32[$7>>2]|0;HEAP32[$12+20>>2]=1;$14=$tailSize_054|1;$18=HEAP32[(HEAP32[$e_056+12>>2]|0)+4>>2]|0;$19=$18+20|0;$20=HEAP32[$19>>2]|0;if((HEAP32[$20+24>>2]|0)==0){$e_1=$18;$trail_1=$12;$tailSize_1=$14;label=6;break}else{label=4;break};case 4:if((HEAP32[$20+20>>2]|0)==0){label=5;break}else{$e_1=$18;$trail_1=$12;$tailSize_1=$14;label=6;break};case 5:HEAP32[$20+16>>2]=$12;$30=HEAP32[$19>>2]|0;HEAP32[$30+20>>2]=1;$32=$tailSize_054+2|0;$34=HEAP32[$18+8>>2]|0;$35=$34+20|0;$36=HEAP32[$35>>2]|0;if((HEAP32[$36+24>>2]|0)==0){$e_1=$34;$trail_1=$30;$tailSize_1=$32;label=6;break}else{$tailSize_054=$32;$trail_055=$30;$e_056=$34;$7=$35;$6=$36;label=2;break};case 6:$40=$eOrig+4|0;$43=HEAP32[(HEAP32[$40>>2]|0)+20>>2]|0;if((HEAP32[$43+24>>2]|0)==0){$e_3=$eOrig;$trail_3=$trail_1;$headSize_1=0;label=11;break}else{$headSize_048=0;$trail_249=$trail_1;$e_250=$eOrig;$48=$40;$47=$43;label=7;break};case 7:if((HEAP32[$47+20>>2]|0)==0){label=8;break}else{$e_3=$e_250;$trail_3=$trail_249;$headSize_1=$headSize_048;label=11;break};case 8:HEAP32[$47+16>>2]=$trail_249;$55=HEAP32[(HEAP32[$48>>2]|0)+20>>2]|0;HEAP32[$55+20>>2]=1;$57=$headSize_048|1;$60=HEAP32[(HEAP32[$48>>2]|0)+12>>2]|0;$61=$60+4|0;$64=HEAP32[(HEAP32[$61>>2]|0)+20>>2]|0;if((HEAP32[$64+24>>2]|0)==0){$e_3=$60;$trail_3=$55;$headSize_1=$57;label=11;break}else{label=9;break};case 9:if((HEAP32[$64+20>>2]|0)==0){label=10;break}else{$e_3=$60;$trail_3=$55;$headSize_1=$57;label=11;break};case 10:HEAP32[$64+16>>2]=$55;$76=HEAP32[(HEAP32[$61>>2]|0)+20>>2]|0;HEAP32[$76+20>>2]=1;$78=$headSize_048+2|0;$83=HEAP32[(HEAP32[(HEAP32[$61>>2]|0)+8>>2]|0)+4>>2]|0;$84=$83+4|0;$87=HEAP32[(HEAP32[$84>>2]|0)+20>>2]|0;if((HEAP32[$87+24>>2]|0)==0){$e_3=$83;$trail_3=$76;$headSize_1=$78;label=11;break}else{$headSize_048=$78;$trail_249=$76;$e_250=$83;$48=$84;$47=$87;label=7;break};case 11:$91=$headSize_1+$tailSize_1|0;if(($tailSize_1&1|0)==0){label=12;break}else{label=13;break};case 12:$newFace_sroa_1_0_ph=HEAP32[$e_1+4>>2]|0;$newFace_sroa_0_0_ph=$91;label=15;break;case 13:if(($headSize_1&1|0)==0){$newFace_sroa_1_0_ph=$e_3;$newFace_sroa_0_0_ph=$91;label=15;break}else{label=14;break};case 14:$newFace_sroa_1_0_ph=HEAP32[$e_3+8>>2]|0;$newFace_sroa_0_0_ph=$91-1|0;label=15;break;case 15:if(($trail_3|0)==0){label=17;break}else{$trail_447=$trail_3;label=16;break};case 16:HEAP32[$trail_447+20>>2]=0;$107=HEAP32[$trail_447+16>>2]|0;if(($107|0)==0){label=17;break}else{$trail_447=$107;label=16;break};case 17:HEAP32[$agg_result>>2]=$newFace_sroa_0_0_ph;HEAP32[$agg_result+4>>2]=$newFace_sroa_1_0_ph;HEAP32[$agg_result+8>>2]=68;return}}function ___gl_renderCache($tess){$tess=$tess|0;var $norm=0,$1=0,$2=0,$3=0,$4=0,$9=0,$12=0,$14=0.0,$25=0,$29=0,$36=0,$47=0,$61=0,$63=0,$64=0,$vc_045=0,$84=0,$95=0,$_sum=0,$vc_147=0,$103=0,$114=0,$117=0,$_0=0,label=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+24|0;label=1;while(1)switch(label|0){case 1:$norm=sp|0;$1=$tess+160|0;$2=$tess+156|0;$3=HEAP32[$2>>2]|0;$4=$tess+160+($3<<5)|0;if(($3|0)<3){$_0=1;label=36;break}else{label=2;break};case 2:$9=$norm|0;HEAPF64[$9>>3]=+HEAPF64[$tess+16>>3];$12=$norm+8|0;HEAPF64[$12>>3]=+HEAPF64[$tess+24>>3];$14=+HEAPF64[$tess+32>>3];HEAPF64[$norm+16>>3]=$14;if(+HEAPF64[$9>>3]==0.0){label=3;break}else{label=5;break};case 3:if(+HEAPF64[$12>>3]==0.0&$14==0.0){label=4;break}else{label=5;break};case 4:_ComputeNormal($tess,$9,0)|0;label=5;break;case 5:$25=_ComputeNormal($tess,$9,1)|0;if(($25|0)==0){label=6;break}else if(($25|0)==2){$_0=0;label=36;break}else{label=7;break};case 6:$_0=1;label=36;break;case 7:$29=HEAP32[$tess+96>>2]|0;if(($29|0)==100132){label=8;break}else if(($29|0)==100133){label=9;break}else if(($29|0)==100134){$_0=1;label=36;break}else{label=10;break};case 8:if(($25|0)<0){$_0=1;label=36;break}else{label=10;break};case 9:if(($25|0)>0){$_0=1;label=36;break}else{label=10;break};case 10:$36=HEAP32[$tess+3360>>2]|0;if(($36|0)==74){label=14;break}else{label=11;break};case 11:if((HEAP32[$tess+124>>2]|0)==0){label=12;break}else{$47=2;label=13;break};case 12:$47=(HEAP32[$2>>2]|0)>3?6:4;label=13;break;case 13:FUNCTION_TABLE_vii[$36&127]($47,HEAP32[$tess+3424>>2]|0);label=17;break;case 14:if((HEAP32[$tess+124>>2]|0)==0){label=15;break}else{$61=2;label=16;break};case 15:$61=(HEAP32[$2>>2]|0)>3?6:4;label=16;break;case 16:FUNCTION_TABLE_vi[HEAP32[$tess+132>>2]&127]($61);label=17;break;case 17:$63=$tess+3368|0;$64=HEAP32[$63>>2]|0;if(($64|0)==10){label=19;break}else{label=18;break};case 18:FUNCTION_TABLE_vii[$64&127](HEAP32[$tess+184>>2]|0,HEAP32[$tess+3424>>2]|0);label=20;break;case 19:FUNCTION_TABLE_vi[HEAP32[$tess+140>>2]&127](HEAP32[$tess+184>>2]|0);label=20;break;case 20:if(($25|0)>0){label=21;break}else{label=27;break};case 21:if(($3|0)>1){label=22;break}else{label=33;break};case 22:$vc_045=$tess+192|0;label=23;break;case 23:$84=HEAP32[$63>>2]|0;if(($84|0)==10){label=25;break}else{label=24;break};case 24:FUNCTION_TABLE_vii[$84&127](HEAP32[$vc_045+24>>2]|0,HEAP32[$tess+3424>>2]|0);label=26;break;case 25:FUNCTION_TABLE_vi[HEAP32[$tess+140>>2]&127](HEAP32[$vc_045+24>>2]|0);label=26;break;case 26:$95=$vc_045+32|0;if($95>>>0<$4>>>0){$vc_045=$95;label=23;break}else{label=33;break};case 27:$_sum=$3-1|0;if(($_sum|0)>0){label=28;break}else{label=33;break};case 28:$vc_147=$tess+160+($_sum<<5)|0;label=29;break;case 29:$103=HEAP32[$63>>2]|0;if(($103|0)==10){label=31;break}else{label=30;break};case 30:FUNCTION_TABLE_vii[$103&127](HEAP32[$vc_147+24>>2]|0,HEAP32[$tess+3424>>2]|0);label=32;break;case 31:FUNCTION_TABLE_vi[HEAP32[$tess+140>>2]&127](HEAP32[$vc_147+24>>2]|0);label=32;break;case 32:$114=$vc_147-32|0;if($114>>>0>$1>>>0){$vc_147=$114;label=29;break}else{label=33;break};case 33:$117=HEAP32[$tess+3372>>2]|0;if(($117|0)==16){label=35;break}else{label=34;break};case 34:FUNCTION_TABLE_vi[$117&127](HEAP32[$tess+3424>>2]|0);$_0=1;label=36;break;case 35:FUNCTION_TABLE_v[HEAP32[$tess+144>>2]&127]();$_0=1;label=36;break;case 36:STACKTOP=sp;return $_0|0}return 0}function _ComputeNormal($tess,$norm,$check){$tess=$tess|0;$norm=$norm|0;$check=$check|0;var $2=0,$3=0,$4=0,$8=0,$9=0,$10=0,$11=0,$26=0,$27=0,$28=0,$sign_0_ph61=0,$vc_0_ph60=0,$xc_0_ph59=0.0,$yc_0_ph58=0.0,$zc_0_ph57=0.0,$30=0,$vc_052=0,$xc_051=0.0,$yc_050=0.0,$zc_049=0.0,$34=0.0,$38=0.0,$42=0.0,$45=0.0,$48=0.0,$51=0.0,$52=0.0,$59=0.0,$76=0,$sign_0_ph_be=0,$82=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$2=HEAP32[$tess+156>>2]|0;$3=$tess+160+($2<<5)|0;$4=($check|0)!=0;if($4){label=3;break}else{label=2;break};case 2:_memset($norm|0,0,24);label=3;break;case 3:$8=$tess+192|0;$9=$tess+160|0;$10=$tess+168|0;$11=$tess+176|0;if(($2|0)>2){label=4;break}else{$_0=0;label=16;break};case 4:$26=$norm+8|0;$27=$norm+16|0;$zc_0_ph57=+HEAPF64[$tess+208>>3]- +HEAPF64[$11>>3];$yc_0_ph58=+HEAPF64[$tess+200>>3]- +HEAPF64[$10>>3];$xc_0_ph59=+HEAPF64[$8>>3]- +HEAPF64[$9>>3];$vc_0_ph60=$8;$sign_0_ph61=0;$28=$tess+224|0;label=5;break;case 5:$zc_049=$zc_0_ph57;$yc_050=$yc_0_ph58;$xc_051=$xc_0_ph59;$vc_052=$vc_0_ph60;$30=$28;label=6;break;case 6:$34=+HEAPF64[$30>>3]- +HEAPF64[$9>>3];$38=+HEAPF64[$vc_052+40>>3]- +HEAPF64[$10>>3];$42=+HEAPF64[$vc_052+48>>3]- +HEAPF64[$11>>3];$45=$yc_050*$42-$zc_049*$38;$48=$zc_049*$34-$xc_051*$42;$51=$xc_051*$38-$yc_050*$34;$52=+HEAPF64[$norm>>3];$59=$51*+HEAPF64[$27>>3]+($52*$45+ +HEAPF64[$26>>3]*$48);if($4){label=10;break}else{label=7;break};case 7:if($59<0.0){label=9;break}else{label=8;break};case 8:HEAPF64[$norm>>3]=$52+$45;HEAPF64[$26>>3]=$48+ +HEAPF64[$26>>3];HEAPF64[$27>>3]=$51+ +HEAPF64[$27>>3];label=11;break;case 9:HEAPF64[$norm>>3]=$52-$45;HEAPF64[$26>>3]=+HEAPF64[$26>>3]-$48;HEAPF64[$27>>3]=+HEAPF64[$27>>3]-$51;label=11;break;case 10:if($59!=0.0){label=12;break}else{label=11;break};case 11:$76=$30+32|0;if($76>>>0<$3>>>0){$zc_049=$42;$yc_050=$38;$xc_051=$34;$vc_052=$30;$30=$76;label=6;break}else{$_0=$sign_0_ph61;label=16;break};case 12:if($59>0.0){label=13;break}else{label=15;break};case 13:if(($sign_0_ph61|0)<0){$_0=2;label=16;break}else{$sign_0_ph_be=1;label=14;break};case 14:$82=$30+32|0;if($82>>>0<$3>>>0){$zc_0_ph57=$42;$yc_0_ph58=$38;$xc_0_ph59=$34;$vc_0_ph60=$30;$sign_0_ph61=$sign_0_ph_be;$28=$82;label=5;break}else{$_0=$sign_0_ph_be;label=16;break};case 15:if(($sign_0_ph61|0)>0){$_0=2;label=16;break}else{$sign_0_ph_be=-1;label=14;break};case 16:return $_0|0}return 0}function _RenderTriangle($tess,$e,$size){$tess=$tess|0;$e=$e|0;$size=$size|0;var $4=0,$6=0,label=0;label=1;while(1)switch(label|0){case 1:if(($size|0)==1){label=3;break}else{label=2;break};case 2:___assert_func(992,243,2032,672);case 3:$4=$tess+128|0;$6=$e+20|0;HEAP32[(HEAP32[$6>>2]|0)+16>>2]=HEAP32[$4>>2];HEAP32[$4>>2]=HEAP32[$6>>2];HEAP32[(HEAP32[$6>>2]|0)+20>>2]=1;return}}function _RenderStrip($tess,$e,$size){$tess=$tess|0;$e=$e|0;$size=$size|0;var $2=0,$11=0,$12=0,$29=0,$50=0,$59=0,$_039=0,$_03738=0,$60=0,$63=0,$67=0,$68=0,$84=0,$89=0,$93=0,$95=0,$96=0,$115=0,$_1=0,$123=0,label=0;label=1;while(1)switch(label|0){case 1:$2=HEAP32[$tess+3360>>2]|0;if(($2|0)==74){label=3;break}else{label=2;break};case 2:FUNCTION_TABLE_vii[$2&127](5,HEAP32[$tess+3424>>2]|0);label=4;break;case 3:FUNCTION_TABLE_vi[HEAP32[$tess+132>>2]&127](5);label=4;break;case 4:$11=$tess+3368|0;$12=HEAP32[$11>>2]|0;if(($12|0)==10){label=6;break}else{label=5;break};case 5:FUNCTION_TABLE_vii[$12&127](HEAP32[(HEAP32[$e+16>>2]|0)+12>>2]|0,HEAP32[$tess+3424>>2]|0);label=7;break;case 6:FUNCTION_TABLE_vi[HEAP32[$tess+140>>2]&127](HEAP32[(HEAP32[$e+16>>2]|0)+12>>2]|0);label=7;break;case 7:$29=HEAP32[$11>>2]|0;if(($29|0)==10){label=9;break}else{label=8;break};case 8:FUNCTION_TABLE_vii[$29&127](HEAP32[(HEAP32[(HEAP32[$e+4>>2]|0)+16>>2]|0)+12>>2]|0,HEAP32[$tess+3424>>2]|0);label=10;break;case 9:FUNCTION_TABLE_vi[HEAP32[$tess+140>>2]&127](HEAP32[(HEAP32[(HEAP32[$e+4>>2]|0)+16>>2]|0)+12>>2]|0);label=10;break;case 10:$50=HEAP32[$e+20>>2]|0;if((HEAP32[$50+24>>2]|0)==0){$_1=$size;label=22;break}else{label=11;break};case 11:$_03738=$e;$_039=$size;$59=$50;label=12;break;case 12:$60=$59+20|0;if((HEAP32[$60>>2]|0)==0){label=13;break}else{$_1=$_039;label=22;break};case 13:HEAP32[$60>>2]=1;$63=$_039-1|0;$67=HEAP32[(HEAP32[$_03738+12>>2]|0)+4>>2]|0;$68=HEAP32[$11>>2]|0;if(($68|0)==10){label=15;break}else{label=14;break};case 14:FUNCTION_TABLE_vii[$68&127](HEAP32[(HEAP32[$67+16>>2]|0)+12>>2]|0,HEAP32[$tess+3424>>2]|0);label=16;break;case 15:FUNCTION_TABLE_vi[HEAP32[$tess+140>>2]&127](HEAP32[(HEAP32[$67+16>>2]|0)+12>>2]|0);label=16;break;case 16:$84=HEAP32[$67+20>>2]|0;if((HEAP32[$84+24>>2]|0)==0){$_1=$63;label=22;break}else{label=17;break};case 17:$89=$84+20|0;if((HEAP32[$89>>2]|0)==0){label=18;break}else{$_1=$63;label=22;break};case 18:HEAP32[$89>>2]=1;$93=$_039-2|0;$95=HEAP32[$67+8>>2]|0;$96=HEAP32[$11>>2]|0;if(($96|0)==10){label=20;break}else{label=19;break};case 19:FUNCTION_TABLE_vii[$96&127](HEAP32[(HEAP32[(HEAP32[$95+4>>2]|0)+16>>2]|0)+12>>2]|0,HEAP32[$tess+3424>>2]|0);label=21;break;case 20:FUNCTION_TABLE_vi[HEAP32[$tess+140>>2]&127](HEAP32[(HEAP32[(HEAP32[$95+4>>2]|0)+16>>2]|0)+12>>2]|0);label=21;break;case 21:$115=HEAP32[$95+20>>2]|0;if((HEAP32[$115+24>>2]|0)==0){$_1=$93;label=22;break}else{$_03738=$95;$_039=$93;$59=$115;label=12;break};case 22:if(($_1|0)==0){label=24;break}else{label=23;break};case 23:___assert_func(992,328,2048,848);case 24:$123=HEAP32[$tess+3372>>2]|0;if(($123|0)==16){label=26;break}else{label=25;break};case 25:FUNCTION_TABLE_vi[$123&127](HEAP32[$tess+3424>>2]|0);label=27;break;case 26:FUNCTION_TABLE_v[HEAP32[$tess+144>>2]&127]();label=27;break;case 27:return}}function ___gl_noBeginData($type,$polygonData){$type=$type|0;$polygonData=$polygonData|0;return}function ___gl_noEdgeFlagData($boundaryEdge,$polygonData){$boundaryEdge=$boundaryEdge|0;$polygonData=$polygonData|0;return}function ___gl_noVertexData($data,$polygonData){$data=$data|0;$polygonData=$polygonData|0;return}function ___gl_noEndData($polygonData){$polygonData=$polygonData|0;return}function ___gl_noErrorData($errnum,$polygonData){$errnum=$errnum|0;$polygonData=$polygonData|0;return}function ___gl_noCombineData($coords,$data,$weight,$outData,$polygonData){$coords=$coords|0;$data=$data|0;$weight=$weight|0;$outData=$outData|0;$polygonData=$polygonData|0;return}function _noBegin($type){$type=$type|0;return}function _noEdgeFlag($boundaryEdge){$boundaryEdge=$boundaryEdge|0;return}function _noVertex($data){$data=$data|0;return}function _noEnd(){return}function _noError($errnum){$errnum=$errnum|0;return}function _noCombine($coords,$data,$weight,$dataOut){$coords=$coords|0;$data=$data|0;$weight=$weight|0;$dataOut=$dataOut|0;return}function _noMesh($mesh){$mesh=$mesh|0;return}function _CacheVertex($tess,$coords,$data){$tess=$tess|0;$coords=$coords|0;$data=$data|0;var $1=0,$2=0;$1=$tess+156|0;$2=HEAP32[$1>>2]|0;HEAP32[$tess+160+($2<<5)+24>>2]=$data;HEAPF64[$tess+160+($2<<5)>>3]=+HEAPF64[$coords>>3];HEAPF64[$tess+160+($2<<5)+8>>3]=+HEAPF64[$coords+8>>3];HEAPF64[$tess+160+($2<<5)+16>>3]=+HEAPF64[$coords+16>>3];HEAP32[$1>>2]=(HEAP32[$1>>2]|0)+1;return}function _gluNewTess(){var $4=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:if((___gl_memInit(64)|0)==0){$_0=0;label=4;break}else{label=2;break};case 2:$4=_malloc(3432)|0;if(($4|0)==0){$_0=0;label=4;break}else{label=3;break};case 3:HEAP32[$4>>2]=0;HEAPF64[$4+88>>3]=0.0;_memset($4+16|0,0,24);HEAP32[$4+96>>2]=100130;HEAP32[$4+120>>2]=0;HEAP32[$4+124>>2]=0;HEAP32[$4+132>>2]=50;HEAP32[$4+136>>2]=60;HEAP32[$4+140>>2]=70;HEAP32[$4+144>>2]=64;HEAP32[$4+12>>2]=66;HEAP32[$4+116>>2]=14;HEAP32[$4+148>>2]=46;HEAP32[$4+3360>>2]=74;HEAP32[$4+3364>>2]=58;HEAP32[$4+3368>>2]=10;HEAP32[$4+3372>>2]=16;HEAP32[$4+3376>>2]=44;HEAP32[$4+3380>>2]=76;HEAP32[$4+3424>>2]=0;$_0=$4;label=4;break;case 4:return $_0|0}return 0}function _gluDeleteTess($tess){$tess=$tess|0;var label=0;label=1;while(1)switch(label|0){case 1:if((HEAP32[$tess>>2]|0)==0){label=3;break}else{label=2;break};case 2:_GotoState($tess,0);label=3;break;case 3:_free($tess);return}}function _GotoState($tess,$newState){$tess=$tess|0;$newState=$newState|0;var $1=0,$2=0,$4=0,$5=0,$6=0,$7=0,$8=0,$9=0,$10=0,$11=0,$12=0,$13=0,$14=0,$15=0,$17=0,$21=0,$29=0,$38=0,$45=0,$48=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$tess|0;$2=HEAP32[$1>>2]|0;if(($2|0)==($newState|0)){label=23;break}else{label=2;break};case 2:$4=$tess+3376|0;$5=$tess+12|0;$6=$tess+3424|0;$7=$tess+3376|0;$8=$tess+12|0;$9=$tess+3424|0;$10=$tess+3376|0;$11=$tess+12|0;$12=$tess+3424|0;$13=$tess+3376|0;$14=$tess+12|0;$15=$tess+3424|0;$17=$2;label=3;break;case 3:if($17>>>0<$newState>>>0){label=4;break}else{label=13;break};case 4:if(($17|0)==0){label=5;break}else if(($17|0)==1){label=9;break}else{label=18;break};case 5:$21=HEAP32[$4>>2]|0;if(($21|0)==44){label=7;break}else{label=6;break};case 6:FUNCTION_TABLE_vii[$21&127](100151,HEAP32[$6>>2]|0);label=8;break;case 7:FUNCTION_TABLE_vi[HEAP32[$5>>2]&127](100151);label=8;break;case 8:_gluTessBeginPolygon($tess,0);label=18;break;case 9:$29=HEAP32[$7>>2]|0;if(($29|0)==44){label=11;break}else{label=10;break};case 10:FUNCTION_TABLE_vii[$29&127](100152,HEAP32[$9>>2]|0);label=12;break;case 11:FUNCTION_TABLE_vi[HEAP32[$8>>2]&127](100152);label=12;break;case 12:_gluTessBeginContour($tess);label=18;break;case 13:if(($17|0)==2){label=14;break}else if(($17|0)==1){label=19;break}else{label=18;break};case 14:$38=HEAP32[$10>>2]|0;if(($38|0)==44){label=16;break}else{label=15;break};case 15:FUNCTION_TABLE_vii[$38&127](100154,HEAP32[$12>>2]|0);label=17;break;case 16:FUNCTION_TABLE_vi[HEAP32[$11>>2]&127](100154);label=17;break;case 17:_gluTessEndContour($tess);label=18;break;case 18:$45=HEAP32[$1>>2]|0;if(($45|0)==($newState|0)){label=23;break}else{$17=$45;label=3;break};case 19:$48=HEAP32[$13>>2]|0;if(($48|0)==44){label=21;break}else{label=20;break};case 20:FUNCTION_TABLE_vii[$48&127](100153,HEAP32[$15>>2]|0);label=22;break;case 21:FUNCTION_TABLE_vi[HEAP32[$14>>2]&127](100153);label=22;break;case 22:_MakeDormant($tess);label=18;break;case 23:return}}function _gluTessProperty($tess,$which,$value){$tess=$tess|0;$which=$which|0;$value=+$value;var $7=0,$19=0,$29=0,label=0;label=1;while(1)switch(label|0){case 1:if(($which|0)==100142){label=2;break}else if(($which|0)==100140){label=4;break}else if(($which|0)==100141){label=7;break}else{label=8;break};case 2:if($value<0.0|$value>1.0){label=11;break}else{label=3;break};case 3:HEAPF64[$tess+88>>3]=$value;label=14;break;case 4:$7=~~$value;if(+($7>>>0>>>0)!=$value){label=11;break}else{label=5;break};case 5:if(($7-100130|0)>>>0<5){label=6;break}else{label=7;break};case 6:HEAP32[$tess+96>>2]=$7;label=14;break;case 7:HEAP32[$tess+124>>2]=$value!=0.0;label=14;break;case 8:$19=HEAP32[$tess+3376>>2]|0;if(($19|0)==44){label=10;break}else{label=9;break};case 9:FUNCTION_TABLE_vii[$19&127](100900,HEAP32[$tess+3424>>2]|0);label=14;break;case 10:FUNCTION_TABLE_vi[HEAP32[$tess+12>>2]&127](100900);label=14;break;case 11:$29=HEAP32[$tess+3376>>2]|0;if(($29|0)==44){label=13;break}else{label=12;break};case 12:FUNCTION_TABLE_vii[$29&127](100901,HEAP32[$tess+3424>>2]|0);label=14;break;case 13:FUNCTION_TABLE_vi[HEAP32[$tess+12>>2]&127](100901);label=14;break;case 14:return}}function _gluTessCallback($tess,$which,$fn){$tess=$tess|0;$which=$which|0;$fn=$fn|0;var $6=0,$13=0,$20=0,$30=0,$40=0,$47=0,$58=0,$65=0,$72=0,$79=0,$86=0,$93=0,$97=0,label=0;label=1;while(1)switch(label|0){case 1:switch($which|0){case 100100:{label=2;break};case 100106:{label=5;break};case 100104:{label=8;break};case 100110:{label=11;break};case 100101:{label=14;break};case 100107:{label=17;break};case 100102:{label=20;break};case 100108:{label=21;break};case 100103:{label=24;break};case 100109:{label=27;break};case 100105:{label=30;break};case 100111:{label=33;break};case 100112:{label=36;break};default:{label=39;break}}break;case 2:if(($fn|0)==0){$6=50;label=4;break}else{label=3;break};case 3:$6=$fn;label=4;break;case 4:HEAP32[$tess+132>>2]=$6;label=42;break;case 5:if(($fn|0)==0){$13=74;label=7;break}else{label=6;break};case 6:$13=$fn;label=7;break;case 7:HEAP32[$tess+3360>>2]=$13;label=42;break;case 8:if(($fn|0)==0){$20=60;label=10;break}else{label=9;break};case 9:$20=$fn;label=10;break;case 10:HEAP32[$tess+136>>2]=$20;HEAP32[$tess+120>>2]=($fn|0)!=0;label=42;break;case 11:if(($fn|0)==0){$30=58;label=13;break}else{label=12;break};case 12:$30=$fn;label=13;break;case 13:HEAP32[$tess+3364>>2]=$30;HEAP32[$tess+120>>2]=($fn|0)!=0;label=42;break;case 14:if(($fn|0)==0){$40=70;label=16;break}else{label=15;break};case 15:$40=$fn;label=16;break;case 16:HEAP32[$tess+140>>2]=$40;label=42;break;case 17:if(($fn|0)==0){$47=10;label=19;break}else{label=18;break};case 18:$47=$fn;label=19;break;case 19:HEAP32[$tess+3368>>2]=$47;label=42;break;case 20:HEAP32[$tess+144>>2]=($fn|0)==0?64:$fn;label=42;break;case 21:if(($fn|0)==0){$58=16;label=23;break}else{label=22;break};case 22:$58=$fn;label=23;break;case 23:HEAP32[$tess+3372>>2]=$58;label=42;break;case 24:if(($fn|0)==0){$65=66;label=26;break}else{label=25;break};case 25:$65=$fn;label=26;break;case 26:HEAP32[$tess+12>>2]=$65;label=42;break;case 27:if(($fn|0)==0){$72=44;label=29;break}else{label=28;break};case 28:$72=$fn;label=29;break;case 29:HEAP32[$tess+3376>>2]=$72;label=42;break;case 30:if(($fn|0)==0){$79=14;label=32;break}else{label=31;break};case 31:$79=$fn;label=32;break;case 32:HEAP32[$tess+116>>2]=$79;label=42;break;case 33:if(($fn|0)==0){$86=76;label=35;break}else{label=34;break};case 34:$86=$fn;label=35;break;case 35:HEAP32[$tess+3380>>2]=$86;label=42;break;case 36:if(($fn|0)==0){$93=46;label=38;break}else{label=37;break};case 37:$93=$fn;label=38;break;case 38:HEAP32[$tess+148>>2]=$93;label=42;break;case 39:$97=HEAP32[$tess+3376>>2]|0;if(($97|0)==44){label=41;break}else{label=40;break};case 40:FUNCTION_TABLE_vii[$97&127](100900,HEAP32[$tess+3424>>2]|0);label=42;break;case 41:FUNCTION_TABLE_vi[HEAP32[$tess+12>>2]&127](100900);label=42;break;case 42:return}}function _gluTessVertex($tess,$coords,$data){$tess=$tess|0;$coords=$coords|0;$data=$data|0;var $clamped=0,$14=0,$24=0.0,$25=0,$x_0=0.0,$26=0,$29=0.0,$30=0,$x_0_1=0.0,$31=0,$34=0.0,$35=0,$x_0_2=0.0,$36=0,$40=0,$63=0,$77=0,label=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+24|0;label=1;while(1)switch(label|0){case 1:$clamped=sp|0;if((HEAP32[$tess>>2]|0)==2){label=3;break}else{label=2;break};case 2:_GotoState($tess,2);label=3;break;case 3:if((HEAP32[$tess+152>>2]|0)==0){label=9;break}else{label=4;break};case 4:if((_EmptyCache($tess)|0)==0){label=5;break}else{label=8;break};case 5:$14=HEAP32[$tess+3376>>2]|0;if(($14|0)==44){label=7;break}else{label=6;break};case 6:FUNCTION_TABLE_vii[$14&127](100902,HEAP32[$tess+3424>>2]|0);label=24;break;case 7:FUNCTION_TABLE_vi[HEAP32[$tess+12>>2]&127](100902);label=24;break;case 8:HEAP32[$tess+4>>2]=0;label=9;break;case 9:$24=+HEAPF64[$coords>>3];$25=$24<-1.0e+150;$x_0=$25?-1.0e+150:$24;$26=$x_0>1.0e+150;HEAPF64[$clamped>>3]=$26?1.0e+150:$x_0;$29=+HEAPF64[$coords+8>>3];$30=$29<-1.0e+150;$x_0_1=$30?-1.0e+150:$29;$31=$x_0_1>1.0e+150;HEAPF64[$clamped+8>>3]=$31?1.0e+150:$x_0_1;$34=+HEAPF64[$coords+16>>3];$35=$34<-1.0e+150;$x_0_2=$35?-1.0e+150:$34;$36=$x_0_2>1.0e+150;HEAPF64[$clamped+16>>3]=$36?1.0e+150:$x_0_2;if($25|$26|$30|$31|$35|$36){label=10;break}else{label=13;break};case 10:$40=HEAP32[$tess+3376>>2]|0;if(($40|0)==44){label=12;break}else{label=11;break};case 11:FUNCTION_TABLE_vii[$40&127](100155,HEAP32[$tess+3424>>2]|0);label=13;break;case 12:FUNCTION_TABLE_vi[HEAP32[$tess+12>>2]&127](100155);label=13;break;case 13:if((HEAP32[$tess+8>>2]|0)==0){label=14;break}else{label=20;break};case 14:if((HEAP32[$tess+156>>2]|0)<100){label=15;break}else{label=16;break};case 15:_CacheVertex($tess,$clamped|0,$data);label=24;break;case 16:if((_EmptyCache($tess)|0)==0){label=17;break}else{label=20;break};case 17:$63=HEAP32[$tess+3376>>2]|0;if(($63|0)==44){label=19;break}else{label=18;break};case 18:FUNCTION_TABLE_vii[$63&127](100902,HEAP32[$tess+3424>>2]|0);label=24;break;case 19:FUNCTION_TABLE_vi[HEAP32[$tess+12>>2]&127](100902);label=24;break;case 20:if((_AddVertex($tess,$clamped|0,$data)|0)==0){label=21;break}else{label=24;break};case 21:$77=HEAP32[$tess+3376>>2]|0;if(($77|0)==44){label=23;break}else{label=22;break};case 22:FUNCTION_TABLE_vii[$77&127](100902,HEAP32[$tess+3424>>2]|0);label=24;break;case 23:FUNCTION_TABLE_vi[HEAP32[$tess+12>>2]&127](100902);label=24;break;case 24:STACKTOP=sp;return}}function _EmptyCache($tess){$tess=$tess|0;var $1=0,$6=0,$v_0=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=___gl_meshNewMesh()|0;HEAP32[$tess+8>>2]=$1;if(($1|0)==0){$_0=0;label=6;break}else{label=2;break};case 2:$6=$tess+156|0;$v_0=$tess+160|0;label=3;break;case 3:if($v_0>>>0<($tess+160+(HEAP32[$6>>2]<<5)|0)>>>0){label=4;break}else{label=5;break};case 4:if((_AddVertex($tess,$v_0|0,HEAP32[$v_0+24>>2]|0)|0)==0){$_0=0;label=6;break}else{$v_0=$v_0+32|0;label=3;break};case 5:HEAP32[$6>>2]=0;HEAP32[$tess+152>>2]=0;$_0=1;label=6;break;case 6:return $_0|0}return 0}function _AddVertex($tess,$coords,$data){$tess=$tess|0;$coords=$coords|0;$data=$data|0;var $1=0,$2=0,$7=0,$e_0=0,$21=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$tess+4|0;$2=HEAP32[$1>>2]|0;if(($2|0)==0){label=2;break}else{label=4;break};case 2:$7=___gl_meshMakeEdge(HEAP32[$tess+8>>2]|0)|0;if(($7|0)==0){$_0=0;label=7;break}else{label=3;break};case 3:if((___gl_meshSplice($7,HEAP32[$7+4>>2]|0)|0)==0){$_0=0;label=7;break}else{$e_0=$7;label=6;break};case 4:if((___gl_meshSplitEdge($2)|0)==0){$_0=0;label=7;break}else{label=5;break};case 5:$e_0=HEAP32[$2+12>>2]|0;label=6;break;case 6:$21=$e_0+16|0;HEAP32[(HEAP32[$21>>2]|0)+12>>2]=$data;HEAPF64[(HEAP32[$21>>2]|0)+16>>3]=+HEAPF64[$coords>>3];HEAPF64[(HEAP32[$21>>2]|0)+24>>3]=+HEAPF64[$coords+8>>3];HEAPF64[(HEAP32[$21>>2]|0)+32>>3]=+HEAPF64[$coords+16>>3];HEAP32[$e_0+28>>2]=1;HEAP32[(HEAP32[$e_0+4>>2]|0)+28>>2]=-1;HEAP32[$1>>2]=$e_0;$_0=1;label=7;break;case 7:return $_0|0}return 0}function _RenderFan($tess,$e,$size){$tess=$tess|0;$e=$e|0;$size=$size|0;var $2=0,$11=0,$12=0,$29=0,$50=0,$57=0,$_029=0,$_02728=0,$58=0,$61=0,$63=0,$64=0,$83=0,$_0_lcssa=0,$91=0,label=0;label=1;while(1)switch(label|0){case 1:$2=HEAP32[$tess+3360>>2]|0;if(($2|0)==74){label=3;break}else{label=2;break};case 2:FUNCTION_TABLE_vii[$2&127](6,HEAP32[$tess+3424>>2]|0);label=4;break;case 3:FUNCTION_TABLE_vi[HEAP32[$tess+132>>2]&127](6);label=4;break;case 4:$11=$tess+3368|0;$12=HEAP32[$11>>2]|0;if(($12|0)==10){label=6;break}else{label=5;break};case 5:FUNCTION_TABLE_vii[$12&127](HEAP32[(HEAP32[$e+16>>2]|0)+12>>2]|0,HEAP32[$tess+3424>>2]|0);label=7;break;case 6:FUNCTION_TABLE_vi[HEAP32[$tess+140>>2]&127](HEAP32[(HEAP32[$e+16>>2]|0)+12>>2]|0);label=7;break;case 7:$29=HEAP32[$11>>2]|0;if(($29|0)==10){label=9;break}else{label=8;break};case 8:FUNCTION_TABLE_vii[$29&127](HEAP32[(HEAP32[(HEAP32[$e+4>>2]|0)+16>>2]|0)+12>>2]|0,HEAP32[$tess+3424>>2]|0);label=10;break;case 9:FUNCTION_TABLE_vi[HEAP32[$tess+140>>2]&127](HEAP32[(HEAP32[(HEAP32[$e+4>>2]|0)+16>>2]|0)+12>>2]|0);label=10;break;case 10:$50=HEAP32[$e+20>>2]|0;if((HEAP32[$50+24>>2]|0)==0){$_0_lcssa=$size;label=17;break}else{label=11;break};case 11:$_02728=$e;$_029=$size;$57=$50;label=12;break;case 12:$58=$57+20|0;if((HEAP32[$58>>2]|0)==0){label=13;break}else{$_0_lcssa=$_029;label=17;break};case 13:HEAP32[$58>>2]=1;$61=$_029-1|0;$63=HEAP32[$_02728+8>>2]|0;$64=HEAP32[$11>>2]|0;if(($64|0)==10){label=15;break}else{label=14;break};case 14:FUNCTION_TABLE_vii[$64&127](HEAP32[(HEAP32[(HEAP32[$63+4>>2]|0)+16>>2]|0)+12>>2]|0,HEAP32[$tess+3424>>2]|0);label=16;break;case 15:FUNCTION_TABLE_vi[HEAP32[$tess+140>>2]&127](HEAP32[(HEAP32[(HEAP32[$63+4>>2]|0)+16>>2]|0)+12>>2]|0);label=16;break;case 16:$83=HEAP32[$63+20>>2]|0;if((HEAP32[$83+24>>2]|0)==0){$_0_lcssa=$61;label=17;break}else{$_02728=$63;$_029=$61;$57=$83;label=12;break};case 17:if(($_0_lcssa|0)==0){label=19;break}else{label=18;break};case 18:___assert_func(992,300,2064,848);case 19:$91=HEAP32[$tess+3372>>2]|0;if(($91|0)==16){label=21;break}else{label=20;break};case 20:FUNCTION_TABLE_vi[$91&127](HEAP32[$tess+3424>>2]|0);label=22;break;case 21:FUNCTION_TABLE_v[HEAP32[$tess+144>>2]&127]();label=22;break;case 22:return}}function ___gl_vertLeq($u,$v){$u=$u|0;$v=$v|0;var $2=0.0,$4=0.0,$15=0,label=0;label=1;while(1)switch(label|0){case 1:$2=+HEAPF64[$u+40>>3];$4=+HEAPF64[$v+40>>3];if($2<$4){$15=1;label=4;break}else{label=2;break};case 2:if($2==$4){label=3;break}else{$15=0;label=4;break};case 3:$15=+HEAPF64[$u+48>>3]<=+HEAPF64[$v+48>>3]|0;label=4;break;case 4:return $15|0}return 0}function _gluTessBeginPolygon($tess,$data){$tess=$tess|0;$data=$data|0;var $1=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$tess|0;if((HEAP32[$1>>2]|0)==0){label=3;break}else{label=2;break};case 2:_GotoState($tess,0);label=3;break;case 3:HEAP32[$1>>2]=1;HEAP32[$tess+156>>2]=0;HEAP32[$tess+152>>2]=0;HEAP32[$tess+8>>2]=0;HEAP32[$tess+3424>>2]=$data;return}}function _gluTessBeginContour($tess){$tess=$tess|0;var $1=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$tess|0;if((HEAP32[$1>>2]|0)==1){label=3;break}else{label=2;break};case 2:_GotoState($tess,1);label=3;break;case 3:HEAP32[$1>>2]=2;HEAP32[$tess+4>>2]=0;if((HEAP32[$tess+156>>2]|0)>0){label=4;break}else{label=5;break};case 4:HEAP32[$tess+152>>2]=1;label=5;break;case 5:return}}function _gluTessEndContour($tess){$tess=$tess|0;var $1=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$tess|0;if((HEAP32[$1>>2]|0)==2){label=3;break}else{label=2;break};case 2:_GotoState($tess,2);label=3;break;case 3:HEAP32[$1>>2]=1;return}}function _MakeDormant($tess){$tess=$tess|0;var $1=0,$2=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$tess+8|0;$2=HEAP32[$1>>2]|0;if(($2|0)==0){label=3;break}else{label=2;break};case 2:___gl_meshDeleteMesh($2);label=3;break;case 3:HEAP32[$tess>>2]=0;HEAP32[$tess+4>>2]=0;HEAP32[$1>>2]=0;return}}function _gluTessEndPolygon($tess){$tess=$tess|0;var $1=0,$2=0,$6=0,$15=0,$20=0,$32=0,$37=0,$41=0,$45=0,$50=0,$54=0,$56=0,$rc_0=0,$98=0,label=0,setjmpLabel=0,setjmpTable=0;label=1;setjmpLabel=0;setjmpTable=STACKTOP;STACKTOP=STACKTOP+168|0;HEAP32[setjmpTable>>2]=0;while(1)switch(label|0){case 1:$1=$tess+3384|0;$2=_saveSetjmp($1|0,label,setjmpTable)|0;label=37;break;case 37:if(($2|0)==0){label=5;break}else{label=2;break};case 2:$6=HEAP32[$tess+3376>>2]|0;if(($6|0)==44){label=4;break}else{label=3;break};case 3:invoke_vii($6|0,100902,HEAP32[$tess+3424>>2]|0);if((__THREW__|0)!=0&(threwValue|0)!=0){setjmpLabel=_testSetjmp(HEAP32[__THREW__>>2]|0,setjmpTable)|0;if((setjmpLabel|0)>0){label=-1;break}else return}__THREW__=threwValue=0;label=36;break;case 4:invoke_vi(HEAP32[$tess+12>>2]|0,100902);if((__THREW__|0)!=0&(threwValue|0)!=0){setjmpLabel=_testSetjmp(HEAP32[__THREW__>>2]|0,setjmpTable)|0;if((setjmpLabel|0)>0){label=-1;break}else return}__THREW__=threwValue=0;label=36;break;case 5:$15=$tess|0;if((HEAP32[$15>>2]|0)==1){label=7;break}else{label=6;break};case 6:invoke_vii(72,$tess|0,1);if((__THREW__|0)!=0&(threwValue|0)!=0){setjmpLabel=_testSetjmp(HEAP32[__THREW__>>2]|0,setjmpTable)|0;if((setjmpLabel|0)>0){label=-1;break}else return}__THREW__=threwValue=0;label=7;break;case 7:HEAP32[$15>>2]=0;$20=$tess+8|0;if((HEAP32[$20>>2]|0)==0){label=8;break}else{label=14;break};case 8:if((HEAP32[$tess+120>>2]|0)==0){label=9;break}else{label=12;break};case 9:if((HEAP32[$tess+148>>2]|0)==46){label=10;break}else{label=12;break};case 10:$32=invoke_ii(20,$tess|0)|0;if((__THREW__|0)!=0&(threwValue|0)!=0){setjmpLabel=_testSetjmp(HEAP32[__THREW__>>2]|0,setjmpTable)|0;if((setjmpLabel|0)>0){label=-1;break}else return}__THREW__=threwValue=0;if(($32|0)==0){label=12;break}else{label=11;break};case 11:HEAP32[$tess+3424>>2]=0;label=36;break;case 12:$37=invoke_ii(6,$tess|0)|0;if((__THREW__|0)!=0&(threwValue|0)!=0){setjmpLabel=_testSetjmp(HEAP32[__THREW__>>2]|0,setjmpTable)|0;if((setjmpLabel|0)>0){label=-1;break}else return}__THREW__=threwValue=0;if(($37|0)==0){label=13;break}else{label=14;break};case 13:invoke_vii(22,$1|0,1);if((__THREW__|0)!=0&(threwValue|0)!=0){setjmpLabel=_testSetjmp(HEAP32[__THREW__>>2]|0,setjmpTable)|0;if((setjmpLabel|0)>0){label=-1;break}else return}__THREW__=threwValue=0;case 14:invoke_vi(38,$tess|0);if((__THREW__|0)!=0&(threwValue|0)!=0){setjmpLabel=_testSetjmp(HEAP32[__THREW__>>2]|0,setjmpTable)|0;if((setjmpLabel|0)>0){label=-1;break}else return}__THREW__=threwValue=0;$41=invoke_ii(40,$tess|0)|0;if((__THREW__|0)!=0&(threwValue|0)!=0){setjmpLabel=_testSetjmp(HEAP32[__THREW__>>2]|0,setjmpTable)|0;if((setjmpLabel|0)>0){label=-1;break}else return}__THREW__=threwValue=0;if(($41|0)==0){label=15;break}else{label=16;break};case 15:invoke_vii(22,$1|0,1);if((__THREW__|0)!=0&(threwValue|0)!=0){setjmpLabel=_testSetjmp(HEAP32[__THREW__>>2]|0,setjmpTable)|0;if((setjmpLabel|0)>0){label=-1;break}else return}__THREW__=threwValue=0;case 16:$45=HEAP32[$20>>2]|0;if((HEAP32[$tess+100>>2]|0)==0){label=17;break}else{label=35;break};case 17:$50=$tess+124|0;if((HEAP32[$50>>2]|0)==0){label=19;break}else{label=18;break};case 18:$54=invoke_iiii(52,$45|0,1,1)|0;if((__THREW__|0)!=0&(threwValue|0)!=0){setjmpLabel=_testSetjmp(HEAP32[__THREW__>>2]|0,setjmpTable)|0;if((setjmpLabel|0)>0){label=-1;break}else return}__THREW__=threwValue=0;$rc_0=$54;label=20;break;case 19:$56=invoke_ii(28,$45|0)|0;if((__THREW__|0)!=0&(threwValue|0)!=0){setjmpLabel=_testSetjmp(HEAP32[__THREW__>>2]|0,setjmpTable)|0;if((setjmpLabel|0)>0){label=-1;break}else return}__THREW__=threwValue=0;$rc_0=$56;label=20;break;case 20:if(($rc_0|0)==0){label=21;break}else{label=22;break};case 21:invoke_vii(22,$1|0,1);if((__THREW__|0)!=0&(threwValue|0)!=0){setjmpLabel=_testSetjmp(HEAP32[__THREW__>>2]|0,setjmpTable)|0;if((setjmpLabel|0)>0){label=-1;break}else return}__THREW__=threwValue=0;case 22:invoke_vi(2,$45|0);if((__THREW__|0)!=0&(threwValue|0)!=0){setjmpLabel=_testSetjmp(HEAP32[__THREW__>>2]|0,setjmpTable)|0;if((setjmpLabel|0)>0){label=-1;break}else return}__THREW__=threwValue=0;if((HEAP32[$tess+132>>2]|0)==50){label=23;break}else{label=30;break};case 23:if((HEAP32[$tess+144>>2]|0)==64){label=24;break}else{label=30;break};case 24:if((HEAP32[$tess+140>>2]|0)==70){label=25;break}else{label=30;break};case 25:if((HEAP32[$tess+136>>2]|0)==60){label=26;break}else{label=30;break};case 26:if((HEAP32[$tess+3360>>2]|0)==74){label=27;break}else{label=30;break};case 27:if((HEAP32[$tess+3372>>2]|0)==16){label=28;break}else{label=30;break};case 28:if((HEAP32[$tess+3368>>2]|0)==10){label=29;break}else{label=30;break};case 29:if((HEAP32[$tess+3364>>2]|0)==58){label=33;break}else{label=30;break};case 30:if((HEAP32[$50>>2]|0)==0){label=32;break}else{label=31;break};case 31:invoke_vii(32,$tess|0,$45|0);if((__THREW__|0)!=0&(threwValue|0)!=0){setjmpLabel=_testSetjmp(HEAP32[__THREW__>>2]|0,setjmpTable)|0;if((setjmpLabel|0)>0){label=-1;break}else return}__THREW__=threwValue=0;label=33;break;case 32:invoke_vii(42,$tess|0,$45|0);if((__THREW__|0)!=0&(threwValue|0)!=0){setjmpLabel=_testSetjmp(HEAP32[__THREW__>>2]|0,setjmpTable)|0;if((setjmpLabel|0)>0){label=-1;break}else return}__THREW__=threwValue=0;label=33;break;case 33:$98=$tess+148|0;if((HEAP32[$98>>2]|0)==46){label=35;break}else{label=34;break};case 34:invoke_vi(12,$45|0);if((__THREW__|0)!=0&(threwValue|0)!=0){setjmpLabel=_testSetjmp(HEAP32[__THREW__>>2]|0,setjmpTable)|0;if((setjmpLabel|0)>0){label=-1;break}else return}__THREW__=threwValue=0;invoke_vi(HEAP32[$98>>2]|0,$45|0);if((__THREW__|0)!=0&(threwValue|0)!=0){setjmpLabel=_testSetjmp(HEAP32[__THREW__>>2]|0,setjmpTable)|0;if((setjmpLabel|0)>0){label=-1;break}else return}__THREW__=threwValue=0;HEAP32[$20>>2]=0;HEAP32[$tess+3424>>2]=0;label=36;break;case 35:invoke_vi(34,$45|0);if((__THREW__|0)!=0&(threwValue|0)!=0){setjmpLabel=_testSetjmp(HEAP32[__THREW__>>2]|0,setjmpTable)|0;if((setjmpLabel|0)>0){label=-1;break}else return}__THREW__=threwValue=0;HEAP32[$tess+3424>>2]=0;HEAP32[$20>>2]=0;label=36;break;case 36:return;case-1:if((setjmpLabel|0)==1){$2=threwValue;label=37}__THREW__=threwValue=0;break}}function ___gl_edgeEval($u,$v,$w){$u=$u|0;$v=$v|0;$w=$w|0;var $1=0,$2=0.0,$3=0,$4=0.0,$15=0.0,$16=0,$17=0.0,$29=0.0,$31=0.0,$33=0.0,$34=0.0,$39=0.0,$42=0.0,$52=0.0,$_0=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$u+40|0;$2=+HEAPF64[$1>>3];$3=$v+40|0;$4=+HEAPF64[$3>>3];if($2<$4){label=4;break}else{label=2;break};case 2:if($2==$4){label=3;break}else{label=7;break};case 3:if(+HEAPF64[$u+48>>3]>+HEAPF64[$v+48>>3]){label=7;break}else{label=4;break};case 4:$15=+HEAPF64[$3>>3];$16=$w+40|0;$17=+HEAPF64[$16>>3];if($15<$17){label=8;break}else{label=5;break};case 5:if($15==$17){label=6;break}else{label=7;break};case 6:if(+HEAPF64[$v+48>>3]>+HEAPF64[$w+48>>3]){label=7;break}else{label=8;break};case 7:___assert_func(664,61,2016,1392);return 0.0;case 8:$29=+HEAPF64[$3>>3];$31=$29- +HEAPF64[$1>>3];$33=+HEAPF64[$16>>3]-$29;$34=$31+$33;if($34>0.0){label=9;break}else{$_0=0.0;label=12;break};case 9:$39=+HEAPF64[$v+48>>3];if($31<$33){label=10;break}else{label=11;break};case 10:$42=+HEAPF64[$u+48>>3];$_0=$39-$42+($42- +HEAPF64[$w+48>>3])*($31/$34);label=12;break;case 11:$52=+HEAPF64[$w+48>>3];$_0=$39-$52+($52- +HEAPF64[$u+48>>3])*($33/$34);label=12;break;case 12:return+$_0}return 0.0}function ___gl_edgeSign($u,$v,$w){$u=$u|0;$v=$v|0;$w=$w|0;var $1=0,$2=0.0,$3=0,$4=0.0,$15=0.0,$16=0,$17=0.0,$29=0.0,$31=0.0,$33=0.0,$38=0.0,$_0=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$u+40|0;$2=+HEAPF64[$1>>3];$3=$v+40|0;$4=+HEAPF64[$3>>3];if($2<$4){label=4;break}else{label=2;break};case 2:if($2==$4){label=3;break}else{label=7;break};case 3:if(+HEAPF64[$u+48>>3]>+HEAPF64[$v+48>>3]){label=7;break}else{label=4;break};case 4:$15=+HEAPF64[$3>>3];$16=$w+40|0;$17=+HEAPF64[$16>>3];if($15<$17){label=8;break}else{label=5;break};case 5:if($15==$17){label=6;break}else{label=7;break};case 6:if(+HEAPF64[$v+48>>3]>+HEAPF64[$w+48>>3]){label=7;break}else{label=8;break};case 7:___assert_func(664,85,2e3,1392);return 0.0;case 8:$29=+HEAPF64[$3>>3];$31=$29- +HEAPF64[$1>>3];$33=+HEAPF64[$16>>3]-$29;if($31+$33>0.0){label=9;break}else{$_0=0.0;label=10;break};case 9:$38=+HEAPF64[$v+48>>3];$_0=$31*($38- +HEAPF64[$w+48>>3])+$33*($38- +HEAPF64[$u+48>>3]);label=10;break;case 10:return+$_0}return 0.0}function ___gl_transEval($u,$v,$w){$u=$u|0;$v=$v|0;$w=$w|0;var $1=0,$2=0.0,$3=0,$4=0.0,$15=0.0,$16=0,$17=0.0,$29=0.0,$31=0.0,$33=0.0,$34=0.0,$39=0.0,$42=0.0,$52=0.0,$_0=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$u+48|0;$2=+HEAPF64[$1>>3];$3=$v+48|0;$4=+HEAPF64[$3>>3];if($2<$4){label=4;break}else{label=2;break};case 2:if($2==$4){label=3;break}else{label=7;break};case 3:if(+HEAPF64[$u+40>>3]>+HEAPF64[$v+40>>3]){label=7;break}else{label=4;break};case 4:$15=+HEAPF64[$3>>3];$16=$w+48|0;$17=+HEAPF64[$16>>3];if($15<$17){label=8;break}else{label=5;break};case 5:if($15==$17){label=6;break}else{label=7;break};case 6:if(+HEAPF64[$v+40>>3]>+HEAPF64[$w+40>>3]){label=7;break}else{label=8;break};case 7:___assert_func(664,116,1768,808);return 0.0;case 8:$29=+HEAPF64[$3>>3];$31=$29- +HEAPF64[$1>>3];$33=+HEAPF64[$16>>3]-$29;$34=$31+$33;if($34>0.0){label=9;break}else{$_0=0.0;label=12;break};case 9:$39=+HEAPF64[$v+40>>3];if($31<$33){label=10;break}else{label=11;break};case 10:$42=+HEAPF64[$u+40>>3];$_0=$39-$42+($42- +HEAPF64[$w+40>>3])*($31/$34);label=12;break;case 11:$52=+HEAPF64[$w+40>>3];$_0=$39-$52+($52- +HEAPF64[$u+40>>3])*($33/$34);label=12;break;case 12:return+$_0}return 0.0}function ___gl_transSign($u,$v,$w){$u=$u|0;$v=$v|0;$w=$w|0;var $1=0,$2=0.0,$3=0,$4=0.0,$15=0.0,$16=0,$17=0.0,$29=0.0,$31=0.0,$33=0.0,$38=0.0,$_0=0.0,label=0;label=1;while(1)switch(label|0){case 1:$1=$u+48|0;$2=+HEAPF64[$1>>3];$3=$v+48|0;$4=+HEAPF64[$3>>3];if($2<$4){label=4;break}else{label=2;break};case 2:if($2==$4){label=3;break}else{label=7;break};case 3:if(+HEAPF64[$u+40>>3]>+HEAPF64[$v+40>>3]){label=7;break}else{label=4;break};case 4:$15=+HEAPF64[$3>>3];$16=$w+48|0;$17=+HEAPF64[$16>>3];if($15<$17){label=8;break}else{label=5;break};case 5:if($15==$17){label=6;break}else{label=7;break};case 6:if(+HEAPF64[$v+40>>3]>+HEAPF64[$w+40>>3]){label=7;break}else{label=8;break};case 7:___assert_func(664,140,1752,808);return 0.0;case 8:$29=+HEAPF64[$3>>3];$31=$29- +HEAPF64[$1>>3];$33=+HEAPF64[$16>>3]-$29;if($31+$33>0.0){label=9;break}else{$_0=0.0;label=10;break};case 9:$38=+HEAPF64[$v+40>>3];$_0=$31*($38- +HEAPF64[$w+40>>3])+$33*($38- +HEAPF64[$u+40>>3]);label=10;break;case 10:return+$_0}return 0.0}function ___gl_memInit($maxFast){$maxFast=$maxFast|0;return 1}function _LongAxis($v){$v=$v|0;var $2=0.0,$7=0.0,$8=0.0,$13=0.0,$i_0=0,$16=0.0,$21=0.0,$23=0.0,$28=0.0,label=0;label=1;while(1)switch(label|0){case 1:$2=+HEAPF64[$v+8>>3];if($2<0.0){label=2;break}else{$7=$2;label=3;break};case 2:$7=-0.0-$2;label=3;break;case 3:$8=+HEAPF64[$v>>3];if($8<0.0){label=4;break}else{$13=$8;label=5;break};case 4:$13=-0.0-$8;label=5;break;case 5:$i_0=$7>$13|0;$16=+HEAPF64[$v+16>>3];if($16<0.0){label=6;break}else{$21=$16;label=7;break};case 6:$21=-0.0-$16;label=7;break;case 7:$23=+HEAPF64[$v+($i_0<<3)>>3];if($23<0.0){label=8;break}else{$28=$23;label=9;break};case 8:$28=-0.0-$23;label=9;break;case 9:return($21>$28?2:$i_0)|0}return 0}function _CheckOrientation($tess){$tess=$tess|0;var $2=0,$3=0,$_pn_ph=0,$area_0_ph=0.0,$_pn=0,$f_0=0,$7=0,$8=0,$area_1=0.0,$e_0=0,$15=0,$21=0,$31=0.0,$33=0,$36=0,$v_023=0,$v_024=0,$41=0,$v_0=0,$46=0,$49=0,$52=0,label=0;label=1;while(1)switch(label|0){case 1:$2=HEAP32[$tess+8>>2]|0;$3=$2+64|0;$area_0_ph=0.0;$_pn_ph=$3;label=2;break;case 2:$_pn=$_pn_ph;label=3;break;case 3:$f_0=HEAP32[$_pn>>2]|0;if(($f_0|0)==($3|0)){label=7;break}else{label=4;break};case 4:$7=$f_0+8|0;$8=HEAP32[$7>>2]|0;if((HEAP32[$8+28>>2]|0)<1){$_pn=$f_0;label=3;break}else{label=5;break};case 5:$e_0=$8;$area_1=$area_0_ph;label=6;break;case 6:$15=HEAP32[$e_0+16>>2]|0;$21=HEAP32[(HEAP32[$e_0+4>>2]|0)+16>>2]|0;$31=$area_1+(+HEAPF64[$15+40>>3]- +HEAPF64[$21+40>>3])*(+HEAPF64[$15+48>>3]+ +HEAPF64[$21+48>>3]);$33=HEAP32[$e_0+12>>2]|0;if(($33|0)==(HEAP32[$7>>2]|0)){$area_0_ph=$31;$_pn_ph=$f_0;label=2;break}else{$e_0=$33;$area_1=$31;label=6;break};case 7:$36=$2|0;if($area_0_ph<0.0){label=8;break}else{label=11;break};case 8:$v_023=HEAP32[$2>>2]|0;if(($v_023|0)==($36|0)){label=10;break}else{$v_024=$v_023;label=9;break};case 9:$41=$v_024+48|0;HEAPF64[$41>>3]=-0.0- +HEAPF64[$41>>3];$v_0=HEAP32[$v_024>>2]|0;if(($v_0|0)==($36|0)){label=10;break}else{$v_024=$v_0;label=9;break};case 10:$46=$tess+64|0;HEAPF64[$46>>3]=-0.0- +HEAPF64[$46>>3];$49=$tess+72|0;HEAPF64[$49>>3]=-0.0- +HEAPF64[$49>>3];$52=$tess+80|0;HEAPF64[$52>>3]=-0.0- +HEAPF64[$52>>3];label=11;break;case 11:return}}function ___gl_edgeIntersect($o1,$d1,$o2,$d2,$v){$o1=$o1|0;$d1=$d1|0;$o2=$o2|0;$d2=$d2|0;$v=$v|0;var $2=0.0,$4=0.0,$_0200=0,$_0=0,$17=0.0,$19=0.0,$_0208=0,$_0204=0,$32=0.0,$34=0.0,$_1209=0,$_1205=0,$_1201=0,$_1=0,$46=0,$47=0.0,$48=0,$49=0.0,$66=0.0,$67=0,$68=0.0,$79=0.0,$80=0.0,$z2_0=0.0,$z1_0=0.0,$88=0.0,$90=0.0,$94=0.0,$95=0.0,$106=0.0,$114=0.0,$117=0.0,$118=0.0,$z2_1=0.0,$z1_1=0.0,$126=0.0,$128=0.0,$132=0.0,$133=0.0,$144=0.0,$152=0.0,$156=0.0,$158=0.0,$_2202=0,$_2=0,$170=0.0,$172=0.0,$_2210=0,$_2206=0,$184=0.0,$186=0.0,$_3211=0,$_3207=0,$_3203=0,$_3=0,$198=0,$199=0.0,$200=0,$201=0.0,$218=0.0,$219=0,$220=0.0,$231=0.0,$232=0.0,$z2_2=0.0,$z1_2=0.0,$240=0.0,$242=0.0,$246=0.0,$247=0.0,$258=0.0,$266=0.0,$269=0.0,$270=0.0,$z2_3=0.0,$z1_3=0.0,$278=0.0,$280=0.0,$284=0.0,$285=0.0,$296=0.0,$304=0.0,label=0;label=1;while(1)switch(label|0){case 1:$2=+HEAPF64[$o1+40>>3];$4=+HEAPF64[$d1+40>>3];if($2<$4){$_0=$o1;$_0200=$d1;label=5;break}else{label=2;break};case 2:if($2==$4){label=3;break}else{label=4;break};case 3:if(+HEAPF64[$o1+48>>3]>+HEAPF64[$d1+48>>3]){label=4;break}else{$_0=$o1;$_0200=$d1;label=5;break};case 4:$_0=$d1;$_0200=$o1;label=5;break;case 5:$17=+HEAPF64[$o2+40>>3];$19=+HEAPF64[$d2+40>>3];if($17<$19){$_0204=$o2;$_0208=$d2;label=9;break}else{label=6;break};case 6:if($17==$19){label=7;break}else{label=8;break};case 7:if(+HEAPF64[$o2+48>>3]>+HEAPF64[$d2+48>>3]){label=8;break}else{$_0204=$o2;$_0208=$d2;label=9;break};case 8:$_0204=$d2;$_0208=$o2;label=9;break;case 9:$32=+HEAPF64[$_0+40>>3];$34=+HEAPF64[$_0204+40>>3];if($32<$34){$_1=$_0;$_1201=$_0200;$_1205=$_0204;$_1209=$_0208;label=13;break}else{label=10;break};case 10:if($32==$34){label=11;break}else{label=12;break};case 11:if(+HEAPF64[$_0+48>>3]>+HEAPF64[$_0204+48>>3]){label=12;break}else{$_1=$_0;$_1201=$_0200;$_1205=$_0204;$_1209=$_0208;label=13;break};case 12:$_1=$_0204;$_1201=$_0208;$_1205=$_0;$_1209=$_0200;label=13;break;case 13:$46=$_1205+40|0;$47=+HEAPF64[$46>>3];$48=$_1201+40|0;$49=+HEAPF64[$48>>3];if($47<$49){label=17;break}else{label=14;break};case 14:if($47==$49){label=15;break}else{label=16;break};case 15:if(+HEAPF64[$_1205+48>>3]>+HEAPF64[$_1201+48>>3]){label=16;break}else{label=17;break};case 16:HEAPF64[$v+40>>3]=(+HEAPF64[$46>>3]+ +HEAPF64[$48>>3])*.5;label=36;break;case 17:$66=+HEAPF64[$48>>3];$67=$_1209+40|0;$68=+HEAPF64[$67>>3];if($66<$68){label=20;break}else{label=18;break};case 18:if($66==$68){label=19;break}else{label=28;break};case 19:if(+HEAPF64[$_1201+48>>3]>+HEAPF64[$_1209+48>>3]){label=28;break}else{label=20;break};case 20:$79=+___gl_edgeEval($_1,$_1205,$_1201);$80=+___gl_edgeEval($_1205,$_1201,$_1209);if($79+$80<0.0){label=21;break}else{$z1_0=$79;$z2_0=$80;label=22;break};case 21:$z1_0=-0.0-$79;$z2_0=-0.0-$80;label=22;break;case 22:$88=$z1_0<0.0?0.0:$z1_0;$90=$z2_0<0.0?0.0:$z2_0;if($88>$90){label=26;break}else{label=23;break};case 23:$94=+HEAPF64[$46>>3];$95=+HEAPF64[$48>>3];if($90==0.0){label=24;break}else{label=25;break};case 24:$114=($94+$95)*.5;label=27;break;case 25:$114=$94+($95-$94)*($88/($90+$88));label=27;break;case 26:$106=+HEAPF64[$48>>3];$114=$106+(+HEAPF64[$46>>3]-$106)*($90/($90+$88));label=27;break;case 27:HEAPF64[$v+40>>3]=$114;label=36;break;case 28:$117=+___gl_edgeSign($_1,$_1205,$_1201);$118=+___gl_edgeSign($_1,$_1209,$_1201);if($117-$118<0.0){label=29;break}else{$z1_1=$117;$z2_1=-0.0-$118;label=30;break};case 29:$z1_1=-0.0-$117;$z2_1=$118;label=30;break;case 30:$126=$z1_1<0.0?0.0:$z1_1;$128=$z2_1<0.0?0.0:$z2_1;if($126>$128){label=34;break}else{label=31;break};case 31:$132=+HEAPF64[$46>>3];$133=+HEAPF64[$67>>3];if($128==0.0){label=32;break}else{label=33;break};case 32:$152=($132+$133)*.5;label=35;break;case 33:$152=$132+($133-$132)*($126/($128+$126));label=35;break;case 34:$144=+HEAPF64[$67>>3];$152=$144+(+HEAPF64[$46>>3]-$144)*($128/($128+$126));label=35;break;case 35:HEAPF64[$v+40>>3]=$152;label=36;break;case 36:$156=+HEAPF64[$_1+48>>3];$158=+HEAPF64[$_1201+48>>3];if($156<$158){$_2=$_1;$_2202=$_1201;label=40;break}else{label=37;break};case 37:if($156==$158){label=38;break}else{label=39;break};case 38:if(+HEAPF64[$_1+40>>3]>+HEAPF64[$48>>3]){label=39;break}else{$_2=$_1;$_2202=$_1201;label=40;break};case 39:$_2=$_1201;$_2202=$_1;label=40;break;case 40:$170=+HEAPF64[$_1205+48>>3];$172=+HEAPF64[$_1209+48>>3];if($170<$172){$_2206=$_1205;$_2210=$_1209;label=44;break}else{label=41;break};case 41:if($170==$172){label=42;break}else{label=43;break};case 42:if(+HEAPF64[$46>>3]>+HEAPF64[$_1209+40>>3]){label=43;break}else{$_2206=$_1205;$_2210=$_1209;label=44;break};case 43:$_2206=$_1209;$_2210=$_1205;label=44;break;case 44:$184=+HEAPF64[$_2+48>>3];$186=+HEAPF64[$_2206+48>>3];if($184<$186){$_3=$_2;$_3203=$_2202;$_3207=$_2206;$_3211=$_2210;label=48;break}else{label=45;break};case 45:if($184==$186){label=46;break}else{label=47;break};case 46:if(+HEAPF64[$_2+40>>3]>+HEAPF64[$_2206+40>>3]){label=47;break}else{$_3=$_2;$_3203=$_2202;$_3207=$_2206;$_3211=$_2210;label=48;break};case 47:$_3=$_2206;$_3203=$_2210;$_3207=$_2;$_3211=$_2202;label=48;break;case 48:$198=$_3207+48|0;$199=+HEAPF64[$198>>3];$200=$_3203+48|0;$201=+HEAPF64[$200>>3];if($199<$201){label=52;break}else{label=49;break};case 49:if($199==$201){label=50;break}else{label=51;break};case 50:if(+HEAPF64[$_3207+40>>3]>+HEAPF64[$_3203+40>>3]){label=51;break}else{label=52;break};case 51:HEAPF64[$v+48>>3]=(+HEAPF64[$198>>3]+ +HEAPF64[$200>>3])*.5;label=71;break;case 52:$218=+HEAPF64[$200>>3];$219=$_3211+48|0;$220=+HEAPF64[$219>>3];if($218<$220){label=55;break}else{label=53;break};case 53:if($218==$220){label=54;break}else{label=63;break};case 54:if(+HEAPF64[$_3203+40>>3]>+HEAPF64[$_3211+40>>3]){label=63;break}else{label=55;break};case 55:$231=+___gl_transEval($_3,$_3207,$_3203);$232=+___gl_transEval($_3207,$_3203,$_3211);if($231+$232<0.0){label=56;break}else{$z1_2=$231;$z2_2=$232;label=57;break};case 56:$z1_2=-0.0-$231;$z2_2=-0.0-$232;label=57;break;case 57:$240=$z1_2<0.0?0.0:$z1_2;$242=$z2_2<0.0?0.0:$z2_2;if($240>$242){label=61;break}else{label=58;break};case 58:$246=+HEAPF64[$198>>3];$247=+HEAPF64[$200>>3];if($242==0.0){label=59;break}else{label=60;break};case 59:$266=($246+$247)*.5;label=62;break;case 60:$266=$246+($247-$246)*($240/($242+$240));label=62;break;case 61:$258=+HEAPF64[$200>>3];$266=$258+(+HEAPF64[$198>>3]-$258)*($242/($242+$240));label=62;break;case 62:HEAPF64[$v+48>>3]=$266;label=71;break;case 63:$269=+___gl_transSign($_3,$_3207,$_3203);$270=+___gl_transSign($_3,$_3211,$_3203);if($269-$270<0.0){label=64;break}else{$z1_3=$269;$z2_3=-0.0-$270;label=65;break};case 64:$z1_3=-0.0-$269;$z2_3=$270;label=65;break;case 65:$278=$z1_3<0.0?0.0:$z1_3;$280=$z2_3<0.0?0.0:$z2_3;if($278>$280){label=69;break}else{label=66;break};case 66:$284=+HEAPF64[$198>>3];$285=+HEAPF64[$219>>3];if($280==0.0){label=67;break}else{label=68;break};case 67:$304=($284+$285)*.5;label=70;break;case 68:$304=$284+($285-$284)*($278/($280+$278));label=70;break;case 69:$296=+HEAPF64[$219>>3];$304=$296+(+HEAPF64[$198>>3]-$296)*($280/($280+$278));label=70;break;case 70:HEAPF64[$v+48>>3]=$304;label=71;break;case 71:return}}function ___gl_projectPolygon($tess){$tess=$tess|0;var $norm=0,$2=0,$3=0,$6=0,$9=0,$11=0.0,$computedNormal_0=0,$23=0,$26=0,$29=0,$32=0,$v_035=0,$v_036=0,$48=0,$52=0,$57=0,$v_0=0,label=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+24|0;label=1;while(1)switch(label|0){case 1:$norm=sp|0;$2=HEAP32[$tess+8>>2]|0;$3=$2|0;$6=$norm|0;HEAPF64[$6>>3]=+HEAPF64[$tess+16>>3];$9=$norm+8|0;HEAPF64[$9>>3]=+HEAPF64[$tess+24>>3];$11=+HEAPF64[$tess+32>>3];HEAPF64[$norm+16>>3]=$11;if(+HEAPF64[$6>>3]==0.0){label=2;break}else{$computedNormal_0=0;label=4;break};case 2:if(+HEAPF64[$9>>3]==0.0&$11==0.0){label=3;break}else{$computedNormal_0=0;label=4;break};case 3:_ComputeNormal40($tess,$6);$computedNormal_0=1;label=4;break;case 4:$23=_LongAxis($6)|0;HEAPF64[$tess+40+($23<<3)>>3]=0.0;$26=($23+1|0)%3|0;HEAPF64[$tess+40+($26<<3)>>3]=1.0;$29=($23+2|0)%3|0;HEAPF64[$tess+40+($29<<3)>>3]=0.0;HEAPF64[$tess+64+($23<<3)>>3]=0.0;$32=$norm+($23<<3)|0;HEAPF64[$tess+64+($26<<3)>>3]=+HEAPF64[$32>>3]>0.0?-0.0:0.0;HEAPF64[$tess+64+($29<<3)>>3]=+HEAPF64[$32>>3]>0.0?1.0:-1.0;$v_035=HEAP32[$2>>2]|0;if(($v_035|0)==($3|0)){label=7;break}else{label=5;break};case 5:$v_036=$v_035;label=6;break;case 6:$48=$v_036+16|0;$52=$v_036+24|0;$57=$v_036+32|0;HEAPF64[$v_036+40>>3]=+HEAPF64[$48>>3]*+HEAPF64[$tess+40>>3]+ +HEAPF64[$52>>3]*+HEAPF64[$tess+48>>3]+ +HEAPF64[$57>>3]*+HEAPF64[$tess+56>>3];HEAPF64[$v_036+48>>3]=+HEAPF64[$48>>3]*+HEAPF64[$tess+64>>3]+ +HEAPF64[$52>>3]*+HEAPF64[$tess+72>>3]+ +HEAPF64[$57>>3]*+HEAPF64[$tess+80>>3];$v_0=HEAP32[$v_036>>2]|0;if(($v_0|0)==($3|0)){label=7;break}else{$v_036=$v_0;label=6;break};case 7:if(($computedNormal_0|0)==0){label=9;break}else{label=8;break};case 8:_CheckOrientation($tess);label=9;break;case 9:STACKTOP=sp;return}}function _ComputeNormal40($tess,$norm){$tess=$tess|0;$norm=$norm|0;var $maxVal=0,$minVal=0,$d1=0,$maxVert=0,$minVert=0,$2=0,$3=0,$4=0,$5=0,$6=0,$7=0,$8=0,$9=0,$10=0,$v_062=0,$v_063=0,$13=0.0,$14=0,$20=0,$27=0.0,$28=0,$i_1=0,$i_2=0,$57=0,$59=0,$62=0,$65=0,$68=0,$71=0,$74=0,$77=0,$v_158=0,$79=0.0,$80=0.0,$81=0.0,$v_160=0,$maxLen2_059=0.0,$88=0.0,$92=0.0,$96=0.0,$99=0.0,$102=0.0,$105=0.0,$110=0.0,$maxLen2_1=0.0,$v_1=0,$124=0,$131=0.0,$132=0,$138=0,$v_0=0,label=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+104|0;label=1;while(1)switch(label|0){case 1:$maxVal=sp|0;$minVal=sp+24|0;$d1=sp+48|0;$maxVert=sp+72|0;$minVert=sp+88|0;$2=HEAP32[$tess+8>>2]|0;$3=$2|0;$4=$maxVal+16|0;HEAPF64[$4>>3]=-2.0e+150;$5=$maxVal+8|0;HEAPF64[$5>>3]=-2.0e+150;$6=$maxVal|0;HEAPF64[$6>>3]=-2.0e+150;$7=$minVal+16|0;HEAPF64[$7>>3]=2.0e+150;$8=$minVal+8|0;HEAPF64[$8>>3]=2.0e+150;$9=$minVal|0;HEAPF64[$9>>3]=2.0e+150;$10=$2|0;$v_062=HEAP32[$10>>2]|0;if(($v_062|0)==($3|0)){label=7;break}else{$v_063=$v_062;label=2;break};case 2:$13=+HEAPF64[$v_063+16>>3];$14=$minVal|0;if($13<+HEAPF64[$14>>3]){label=3;break}else{label=4;break};case 3:HEAPF64[$14>>3]=$13;HEAP32[$minVert>>2]=$v_063;label=4;break;case 4:$20=$maxVal|0;if($13>+HEAPF64[$20>>3]){label=5;break}else{label=6;break};case 5:HEAPF64[$20>>3]=$13;HEAP32[$maxVert>>2]=$v_063;label=6;break;case 6:$27=+HEAPF64[$v_063+24>>3];$28=$minVal+8|0;if($27<+HEAPF64[$28>>3]){label=17;break}else{label=18;break};case 7:$i_1=+HEAPF64[$5>>3]- +HEAPF64[$8>>3]>+HEAPF64[$6>>3]- +HEAPF64[$9>>3]|0;$i_2=+HEAPF64[$4>>3]- +HEAPF64[$7>>3]>+HEAPF64[$maxVal+($i_1<<3)>>3]- +HEAPF64[$minVal+($i_1<<3)>>3]?2:$i_1;if(+HEAPF64[$minVal+($i_2<<3)>>3]<+HEAPF64[$maxVal+($i_2<<3)>>3]){label=9;break}else{label=8;break};case 8:_memset($norm|0,0,16);HEAPF64[$norm+16>>3]=1.0;label=16;break;case 9:$57=HEAP32[$minVert+($i_2<<2)>>2]|0;$59=HEAP32[$maxVert+($i_2<<2)>>2]|0;$62=$59+16|0;$65=$d1|0;HEAPF64[$65>>3]=+HEAPF64[$57+16>>3]- +HEAPF64[$62>>3];$68=$59+24|0;$71=$d1+8|0;HEAPF64[$71>>3]=+HEAPF64[$57+24>>3]- +HEAPF64[$68>>3];$74=$59+32|0;$77=$d1+16|0;HEAPF64[$77>>3]=+HEAPF64[$57+32>>3]- +HEAPF64[$74>>3];$v_158=HEAP32[$10>>2]|0;if(($v_158|0)==($3|0)){label=15;break}else{label=10;break};case 10:$79=+HEAPF64[$71>>3];$80=+HEAPF64[$77>>3];$81=+HEAPF64[$65>>3];$maxLen2_059=0.0;$v_160=$v_158;label=11;break;case 11:$88=+HEAPF64[$v_160+16>>3]- +HEAPF64[$62>>3];$92=+HEAPF64[$v_160+24>>3]- +HEAPF64[$68>>3];$96=+HEAPF64[$v_160+32>>3]- +HEAPF64[$74>>3];$99=$79*$96-$92*$80;$102=$88*$80-$96*$81;$105=$92*$81-$88*$79;$110=$105*$105+($99*$99+$102*$102);if($110>$maxLen2_059){label=12;break}else{$maxLen2_1=$maxLen2_059;label=13;break};case 12:HEAPF64[$norm>>3]=$99;HEAPF64[$norm+8>>3]=$102;HEAPF64[$norm+16>>3]=$105;$maxLen2_1=$110;label=13;break;case 13:$v_1=HEAP32[$v_160>>2]|0;if(($v_1|0)==($3|0)){label=14;break}else{$maxLen2_059=$maxLen2_1;$v_160=$v_1;label=11;break};case 14:if($maxLen2_1>0.0){label=16;break}else{label=15;break};case 15:_memset($norm|0,0,24);HEAPF64[$norm+((_LongAxis($65)|0)<<3)>>3]=1.0;label=16;break;case 16:STACKTOP=sp;return;case 17:HEAPF64[$28>>3]=$27;HEAP32[$minVert+4>>2]=$v_063;label=18;break;case 18:$124=$maxVal+8|0;if($27>+HEAPF64[$124>>3]){label=19;break}else{label=20;break};case 19:HEAPF64[$124>>3]=$27;HEAP32[$maxVert+4>>2]=$v_063;label=20;break;case 20:$131=+HEAPF64[$v_063+32>>3];$132=$minVal+16|0;if($131<+HEAPF64[$132>>3]){label=21;break}else{label=22;break};case 21:HEAPF64[$132>>3]=$131;HEAP32[$minVert+8>>2]=$v_063;label=22;break;case 22:$138=$maxVal+16|0;if($131>+HEAPF64[$138>>3]){label=23;break}else{label=24;break};case 23:HEAPF64[$138>>3]=$131;HEAP32[$maxVert+8>>2]=$v_063;label=24;break;case 24:$v_0=HEAP32[$v_063>>2]|0;if(($v_0|0)==($3|0)){label=7;break}else{$v_063=$v_0;label=2;break}}}function _FloatUp($pq,$curr){$pq=$pq|0;$curr=$curr|0;var $2=0,$4=0,$6=0,$7=0,$_pn=0,$_028=0,$11=0,$13=0,$16=0.0,$17=0,$20=0.0,$_0_lcssa=0,$37=0,label=0;label=1;while(1)switch(label|0){case 1:$2=HEAP32[$pq>>2]|0;$4=HEAP32[$pq+4>>2]|0;$6=HEAP32[$2+($curr<<2)>>2]|0;$7=$curr>>1;if(($7|0)==0){$_0_lcssa=$curr;label=6;break}else{label=2;break};case 2:$_028=$curr;$_pn=$7;label=3;break;case 3:$11=HEAP32[$2+($_pn<<2)>>2]|0;$13=HEAP32[$4+($11<<3)>>2]|0;$16=+HEAPF64[$13+40>>3];$17=HEAP32[$4+($6<<3)>>2]|0;$20=+HEAPF64[$17+40>>3];if($16<$20){$_0_lcssa=$_028;label=6;break}else{label=4;break};case 4:if($16==$20){label=5;break}else{label=7;break};case 5:if(+HEAPF64[$13+48>>3]>+HEAPF64[$17+48>>3]){label=7;break}else{$_0_lcssa=$_028;label=6;break};case 6:HEAP32[$2+($_0_lcssa<<2)>>2]=$6;HEAP32[$4+($6<<3)+4>>2]=$_0_lcssa;return;case 7:HEAP32[$2+($_028<<2)>>2]=$11;HEAP32[$4+($11<<3)+4>>2]=$_028;$37=$_pn>>1;if(($37|0)==0){$_0_lcssa=$_pn;label=6;break}else{$_028=$_pn;$_pn=$37;label=3;break}}}function ___gl_pqHeapNewPriorityQ($leq){$leq=$leq|0;var $1=0,$9=0,$11=0,$15=0,$18=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=_malloc(28)|0;if(($1|0)==0){$_0=0;label=7;break}else{label=2;break};case 2:HEAP32[$1+8>>2]=0;HEAP32[$1+12>>2]=32;$9=_malloc(132)|0;$11=$1;HEAP32[$11>>2]=$9;if(($9|0)==0){label=3;break}else{label=4;break};case 3:_free($1);$_0=0;label=7;break;case 4:$15=_malloc(264)|0;$18=$1+4|0;HEAP32[$18>>2]=$15;if(($15|0)==0){label=5;break}else{label=6;break};case 5:_free(HEAP32[$11>>2]|0);_free($1);$_0=0;label=7;break;case 6:HEAP32[$1+20>>2]=0;HEAP32[$1+16>>2]=0;HEAP32[$1+24>>2]=$leq;HEAP32[(HEAP32[$11>>2]|0)+4>>2]=1;HEAP32[(HEAP32[$18>>2]|0)+8>>2]=0;$_0=$1;label=7;break;case 7:return $_0|0}return 0}function ___gl_pqHeapDeletePriorityQ($pq){$pq=$pq|0;_free(HEAP32[$pq+4>>2]|0);_free(HEAP32[$pq>>2]|0);_free($pq);return}function ___gl_pqHeapInit($pq){$pq=$pq|0;var $2=0,$i_04=0,$4=0,label=0;label=1;while(1)switch(label|0){case 1:$2=HEAP32[$pq+8>>2]|0;if(($2|0)>0){$i_04=$2;label=2;break}else{label=3;break};case 2:_FloatDown($pq,$i_04);$4=$i_04-1|0;if(($4|0)>0){$i_04=$4;label=2;break}else{label=3;break};case 3:HEAP32[$pq+20>>2]=1;return}}function ___gl_pqHeapExtractMin($pq){$pq=$pq|0;var $2=0,$4=0,$5=0,$6=0,$7=0,$8=0,$9=0,$10=0,$14=0,$16=0,$20=0,label=0;label=1;while(1)switch(label|0){case 1:$2=HEAP32[$pq>>2]|0;$4=HEAP32[$pq+4>>2]|0;$5=$2+4|0;$6=HEAP32[$5>>2]|0;$7=$4+($6<<3)|0;$8=HEAP32[$7>>2]|0;$9=$pq+8|0;$10=HEAP32[$9>>2]|0;if(($10|0)>0){label=2;break}else{label=4;break};case 2:$14=HEAP32[$2+($10<<2)>>2]|0;HEAP32[$5>>2]=$14;HEAP32[$4+($14<<3)+4>>2]=1;HEAP32[$7>>2]=0;$16=$pq+16|0;HEAP32[$4+($6<<3)+4>>2]=HEAP32[$16>>2];HEAP32[$16>>2]=$6;$20=(HEAP32[$9>>2]|0)-1|0;HEAP32[$9>>2]=$20;if(($20|0)>0){label=3;break}else{label=4;break};case 3:_FloatDown($pq,1);label=4;break;case 4:return $8|0}return 0}function ___gl_pqSortNewPriorityQ($leq){$leq=$leq|0;var $1=0,$5=0,$6=0,$10=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=_malloc(28)|0;if(($1|0)==0){$_0=0;label=7;break}else{label=2;break};case 2:$5=___gl_pqHeapNewPriorityQ($leq)|0;$6=$1;HEAP32[$6>>2]=$5;if(($5|0)==0){label=3;break}else{label=4;break};case 3:_free($1);$_0=0;label=7;break;case 4:$10=_malloc(128)|0;HEAP32[$1+4>>2]=$10;if(($10|0)==0){label=5;break}else{label=6;break};case 5:___gl_pqHeapDeletePriorityQ(HEAP32[$6>>2]|0);_free($1);$_0=0;label=7;break;case 6:HEAP32[$1+12>>2]=0;HEAP32[$1+16>>2]=32;HEAP32[$1+20>>2]=0;HEAP32[$1+24>>2]=$leq;$_0=$1;label=7;break;case 7:return $_0|0}return 0}function _FloatDown($pq,$curr){$pq=$pq|0;$curr=$curr|0;var $2=0,$4=0,$6=0,$7=0,$_0=0,$11=0,$15=0,$19=0,$22=0.0,$26=0,$29=0.0,$child_0=0,$48=0,$52=0,$55=0.0,$57=0,$60=0.0,label=0;label=1;while(1)switch(label|0){case 1:$2=HEAP32[$pq>>2]|0;$4=HEAP32[$pq+4>>2]|0;$6=HEAP32[$2+($curr<<2)>>2]|0;$7=$pq+8|0;$_0=$curr;label=2;break;case 2:$11=$_0<<1;if(($11|0)<(HEAP32[$7>>2]|0)){label=3;break}else{$child_0=$11;label=7;break};case 3:$15=$11|1;$19=HEAP32[$4+(HEAP32[$2+($15<<2)>>2]<<3)>>2]|0;$22=+HEAPF64[$19+40>>3];$26=HEAP32[$4+(HEAP32[$2+($11<<2)>>2]<<3)>>2]|0;$29=+HEAPF64[$26+40>>3];if($22<$29){label=6;break}else{label=4;break};case 4:if($22==$29){label=5;break}else{$child_0=$11;label=7;break};case 5:if(+HEAPF64[$19+48>>3]>+HEAPF64[$26+48>>3]){$child_0=$11;label=7;break}else{label=6;break};case 6:$child_0=$15;label=7;break;case 7:if(($child_0|0)>(HEAP32[$pq+12>>2]|0)){label=8;break}else{label=9;break};case 8:___assert_func(568,112,2152,104);case 9:$48=HEAP32[$2+($child_0<<2)>>2]|0;if(($child_0|0)>(HEAP32[$7>>2]|0)){label=13;break}else{label=10;break};case 10:$52=HEAP32[$4+($6<<3)>>2]|0;$55=+HEAPF64[$52+40>>3];$57=HEAP32[$4+($48<<3)>>2]|0;$60=+HEAPF64[$57+40>>3];if($55<$60){label=13;break}else{label=11;break};case 11:if($55==$60){label=12;break}else{label=14;break};case 12:if(+HEAPF64[$52+48>>3]>+HEAPF64[$57+48>>3]){label=14;break}else{label=13;break};case 13:HEAP32[$2+($_0<<2)>>2]=$6;HEAP32[$4+($6<<3)+4>>2]=$_0;return;case 14:HEAP32[$2+($_0<<2)>>2]=$48;HEAP32[$4+($48<<3)+4>>2]=$_0;$_0=$child_0;label=2;break}}function ___gl_pqHeapInsert($pq,$keyNew){$pq=$pq|0;$keyNew=$keyNew|0;var $1=0,$3=0,$5=0,$6=0,$9=0,$10=0,$11=0,$12=0,$18=0,$28=0,$33=0,$34=0,$free_handle_0=0,$45=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$pq+8|0;$3=(HEAP32[$1>>2]|0)+1|0;HEAP32[$1>>2]=$3;$5=$pq+12|0;$6=HEAP32[$5>>2]|0;if(($3<<1|0)>($6|0)){label=2;break}else{label=6;break};case 2:$9=$pq|0;$10=HEAP32[$9>>2]|0;$11=$pq+4|0;$12=HEAP32[$11>>2]|0;HEAP32[$5>>2]=$6<<1;$18=_realloc(HEAP32[$9>>2]|0,$6<<3|4)|0;HEAP32[$9>>2]=$18;if(($18|0)==0){label=3;break}else{label=4;break};case 3:HEAP32[$9>>2]=$10;$_0=2147483647;label=12;break;case 4:$28=_realloc(HEAP32[$11>>2]|0,(HEAP32[$5>>2]<<3)+8|0)|0;HEAP32[$11>>2]=$28;if(($28|0)==0){label=5;break}else{label=6;break};case 5:HEAP32[$11>>2]=$12;$_0=2147483647;label=12;break;case 6:$33=$pq+16|0;$34=HEAP32[$33>>2]|0;if(($34|0)==0){$free_handle_0=$3;label=8;break}else{label=7;break};case 7:HEAP32[$33>>2]=HEAP32[(HEAP32[$pq+4>>2]|0)+($34<<3)+4>>2];$free_handle_0=$34;label=8;break;case 8:HEAP32[(HEAP32[$pq>>2]|0)+($3<<2)>>2]=$free_handle_0;$45=$pq+4|0;HEAP32[(HEAP32[$45>>2]|0)+($free_handle_0<<3)+4>>2]=$3;HEAP32[(HEAP32[$45>>2]|0)+($free_handle_0<<3)>>2]=$keyNew;if((HEAP32[$pq+20>>2]|0)==0){label=10;break}else{label=9;break};case 9:_FloatUp($pq,$3);label=10;break;case 10:if(($free_handle_0|0)==2147483647){label=11;break}else{$_0=$free_handle_0;label=12;break};case 11:___assert_func(568,207,1896,1176);return 0;case 12:return $_0|0}return 0}function ___gl_pqHeapDelete($pq,$hCurr){$pq=$pq|0;$hCurr=$hCurr|0;var $2=0,$4=0,$11=0,$16=0,$17=0,$18=0,$21=0,$22=0,$25=0,$34=0,$37=0.0,$40=0,$43=0.0,$58=0,label=0;label=1;while(1)switch(label|0){case 1:$2=HEAP32[$pq>>2]|0;$4=HEAP32[$pq+4>>2]|0;if(($hCurr|0)>0){label=2;break}else{label=4;break};case 2:if((HEAP32[$pq+12>>2]|0)<($hCurr|0)){label=4;break}else{label=3;break};case 3:$11=$4+($hCurr<<3)|0;if((HEAP32[$11>>2]|0)==0){label=4;break}else{label=5;break};case 4:___assert_func(568,241,1920,752);case 5:$16=$4+($hCurr<<3)+4|0;$17=HEAP32[$16>>2]|0;$18=$pq+8|0;$21=HEAP32[$2+(HEAP32[$18>>2]<<2)>>2]|0;$22=$2+($17<<2)|0;HEAP32[$22>>2]=$21;HEAP32[$4+($21<<3)+4>>2]=$17;$25=(HEAP32[$18>>2]|0)-1|0;HEAP32[$18>>2]=$25;if(($17|0)>($25|0)){label=12;break}else{label=6;break};case 6:if(($17|0)<2){label=10;break}else{label=7;break};case 7:$34=HEAP32[$4+(HEAP32[$2+($17>>1<<2)>>2]<<3)>>2]|0;$37=+HEAPF64[$34+40>>3];$40=HEAP32[$4+(HEAP32[$22>>2]<<3)>>2]|0;$43=+HEAPF64[$40+40>>3];if($37<$43){label=10;break}else{label=8;break};case 8:if($37==$43){label=9;break}else{label=11;break};case 9:if(+HEAPF64[$34+48>>3]>+HEAPF64[$40+48>>3]){label=11;break}else{label=10;break};case 10:_FloatDown($pq,$17);label=12;break;case 11:_FloatUp($pq,$17);label=12;break;case 12:HEAP32[$11>>2]=0;$58=$pq+16|0;HEAP32[$16>>2]=HEAP32[$58>>2];HEAP32[$58>>2]=$hCurr;return}}function ___gl_pqSortDeletePriorityQ($pq){$pq=$pq|0;var $5=0,$10=0,$16=0,label=0;label=1;while(1)switch(label|0){case 1:if(($pq|0)==0){label=2;break}else{label=3;break};case 2:___assert_func(648,78,1840,552);case 3:$5=HEAP32[$pq>>2]|0;if(($5|0)==0){label=5;break}else{label=4;break};case 4:___gl_pqHeapDeletePriorityQ($5);label=5;break;case 5:$10=HEAP32[$pq+8>>2]|0;if(($10|0)==0){label=7;break}else{label=6;break};case 6:_free($10);label=7;break;case 7:$16=HEAP32[$pq+4>>2]|0;if(($16|0)==0){label=9;break}else{label=8;break};case 8:_free($16);label=9;break;case 9:_free($pq);return}}function ___gl_pqSortInit($pq){$pq=$pq|0;var $Stack=0,$2=0,$6=0,$7=0,$8=0,$12=0,$piv_0161=0,$i_0160=0,$18=0,$24=0,$27=0,$seed_0158=0,$top_0157=0,$29=0,$31=0,$p_0_ph152=0,$seed_1_ph151=0,$top_1_ph150=0,$r_0_ph149=0,$34=0,$p_0132=0,$seed_1131=0,$top_1130=0,$38=0,$39=0,$44=0,$45=0,$i_1_ph=0,$j_0_ph=0,$48=0,$50=0,$53=0.0,$54=0,$57=0.0,$59=0.0,$60=0,$61=0.0,$62=0,$63=0,$i_1119=0,$72=0,$74=0,$77=0.0,$78=0,$81=0.0,$_lcssa118=0,$i_1_lcssa=0,$83=0,$84=0,$87=0.0,$89=0,$92=0.0,$94=0.0,$95=0,$96=0.0,$97=0,$98=0,$j_1115=0,$107=0,$108=0,$111=0.0,$113=0,$116=0.0,$_lcssa=0,$j_1_lcssa=0,$118=0,$122=0,$128=0,$130=0,$135=0,$r_0_ph145=0,$p_0_lcssa=0,$seed_1_lcssa=0,$top_1_lcssa=0,$i_2141=0,$i_2142=0,$139=0,$j_2137=0,$141=0,$144=0.0,$145=0,$147=0,$150=0.0,$j_2_lcssa=0,$i_2=0,$169=0,$_sum106=0,$i_3114=0,$173=0,$175=0,$178=0.0,$180=0,$183=0.0,$_0=0,label=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+400|0;label=1;while(1)switch(label|0){case 1:$Stack=sp|0;$2=$pq+12|0;$6=_malloc((HEAP32[$2>>2]<<2)+4|0)|0;$7=$6;$8=$pq+8|0;HEAP32[$8>>2]=$7;if(($6|0)==0){$_0=0;label=35;break}else{label=2;break};case 2:$12=$7+((HEAP32[$2>>2]|0)-1<<2)|0;if($7>>>0>$12>>>0){label=5;break}else{label=3;break};case 3:$i_0160=$7;$piv_0161=HEAP32[$pq+4>>2]|0;label=4;break;case 4:HEAP32[$i_0160>>2]=$piv_0161;$18=$i_0160+4|0;if($18>>>0>$12>>>0){label=5;break}else{$i_0160=$18;$piv_0161=$piv_0161+4|0;label=4;break};case 5:HEAP32[$Stack>>2]=$7;HEAP32[$Stack+4>>2]=$12;$top_0157=$Stack+8|0;$seed_0158=2016473283;$27=$Stack|0;label=7;break;case 6:$24=$top_1_lcssa-8|0;if($24>>>0<($Stack|0)>>>0){label=29;break}else{$top_0157=$top_1_lcssa;$seed_0158=$seed_1_lcssa;$27=$24;label=7;break};case 7:$29=HEAP32[$27>>2]|0;$31=HEAP32[$top_0157-8+4>>2]|0;if($31>>>0>($29+40|0)>>>0){$r_0_ph149=$31;$top_1_ph150=$27;$seed_1_ph151=$seed_0158;$p_0_ph152=$29;label=8;break}else{$top_1_lcssa=$27;$seed_1_lcssa=$seed_0158;$p_0_lcssa=$29;$r_0_ph145=$31;label=22;break};case 8:$34=$r_0_ph149;$top_1130=$top_1_ph150;$seed_1131=$seed_1_ph151;$p_0132=$p_0_ph152;label=9;break;case 9:$38=(Math_imul($seed_1131,1539415821)|0)+1|0;$39=$p_0132;$44=$p_0132+((($38>>>0)%((($34-$39>>2)+1|0)>>>0)|0)<<2)|0;$45=HEAP32[$44>>2]|0;HEAP32[$44>>2]=HEAP32[$p_0132>>2];HEAP32[$p_0132>>2]=$45;$j_0_ph=$r_0_ph149+4|0;$i_1_ph=$p_0132-4|0;label=10;break;case 10:$48=$i_1_ph+4|0;$50=HEAP32[HEAP32[$48>>2]>>2]|0;$53=+HEAPF64[$50+40>>3];$54=HEAP32[$45>>2]|0;$57=+HEAPF64[$54+40>>3];if($53<$57){$i_1_lcssa=$i_1_ph;$_lcssa118=$48;label=14;break}else{$i_1119=$i_1_ph;$63=$48;$62=$50;$61=$53;$60=$54;$59=$57;label=11;break};case 11:if($61==$59){label=12;break}else{label=13;break};case 12:if(+HEAPF64[$62+48>>3]>+HEAPF64[$60+48>>3]){label=13;break}else{$i_1_lcssa=$i_1119;$_lcssa118=$63;label=14;break};case 13:$72=$63+4|0;$74=HEAP32[HEAP32[$72>>2]>>2]|0;$77=+HEAPF64[$74+40>>3];$78=HEAP32[$45>>2]|0;$81=+HEAPF64[$78+40>>3];if($77<$81){$i_1_lcssa=$63;$_lcssa118=$72;label=14;break}else{$i_1119=$63;$63=$72;$62=$74;$61=$77;$60=$78;$59=$81;label=11;break};case 14:$83=$j_0_ph-4|0;$84=HEAP32[$45>>2]|0;$87=+HEAPF64[$84+40>>3];$89=HEAP32[HEAP32[$83>>2]>>2]|0;$92=+HEAPF64[$89+40>>3];if($87<$92){$j_1_lcssa=$j_0_ph;$_lcssa=$83;label=18;break}else{$j_1115=$j_0_ph;$98=$83;$97=$84;$96=$87;$95=$89;$94=$92;label=15;break};case 15:if($96==$94){label=16;break}else{label=17;break};case 16:if(+HEAPF64[$97+48>>3]>+HEAPF64[$95+48>>3]){label=17;break}else{$j_1_lcssa=$j_1115;$_lcssa=$98;label=18;break};case 17:$107=$98-4|0;$108=HEAP32[$45>>2]|0;$111=+HEAPF64[$108+40>>3];$113=HEAP32[HEAP32[$107>>2]>>2]|0;$116=+HEAPF64[$113+40>>3];if($111<$116){$j_1_lcssa=$98;$_lcssa=$107;label=18;break}else{$j_1115=$98;$98=$107;$97=$108;$96=$111;$95=$113;$94=$116;label=15;break};case 18:$118=HEAP32[$_lcssa118>>2]|0;HEAP32[$_lcssa118>>2]=HEAP32[$_lcssa>>2];HEAP32[$_lcssa>>2]=$118;if($_lcssa118>>>0<$_lcssa>>>0){$j_0_ph=$_lcssa;$i_1_ph=$_lcssa118;label=10;break}else{label=19;break};case 19:$122=HEAP32[$_lcssa118>>2]|0;HEAP32[$_lcssa118>>2]=$118;HEAP32[$_lcssa>>2]=$122;$128=$top_1130|0;if(($_lcssa118-$39|0)<($34-$_lcssa|0)){label=20;break}else{label=21;break};case 20:HEAP32[$128>>2]=$j_1_lcssa;HEAP32[$top_1130+4>>2]=$r_0_ph149;$130=$top_1130+8|0;if($i_1_lcssa>>>0>($p_0132+40|0)>>>0){$r_0_ph149=$i_1_lcssa;$top_1_ph150=$130;$seed_1_ph151=$38;$p_0_ph152=$p_0132;label=8;break}else{$top_1_lcssa=$130;$seed_1_lcssa=$38;$p_0_lcssa=$p_0132;$r_0_ph145=$i_1_lcssa;label=22;break};case 21:HEAP32[$128>>2]=$p_0132;HEAP32[$top_1130+4>>2]=$i_1_lcssa;$135=$top_1130+8|0;if($r_0_ph149>>>0>($j_1_lcssa+40|0)>>>0){$top_1130=$135;$seed_1131=$38;$p_0132=$j_1_lcssa;label=9;break}else{$top_1_lcssa=$135;$seed_1_lcssa=$38;$p_0_lcssa=$j_1_lcssa;$r_0_ph145=$r_0_ph149;label=22;break};case 22:$i_2141=$p_0_lcssa+4|0;if($i_2141>>>0>$r_0_ph145>>>0){label=6;break}else{$i_2142=$i_2141;label=23;break};case 23:$139=HEAP32[$i_2142>>2]|0;if($i_2142>>>0>$p_0_lcssa>>>0){$j_2137=$i_2142;label=24;break}else{$j_2_lcssa=$i_2142;label=28;break};case 24:$141=HEAP32[$139>>2]|0;$144=+HEAPF64[$141+40>>3];$145=$j_2137-4|0;$147=HEAP32[HEAP32[$145>>2]>>2]|0;$150=+HEAPF64[$147+40>>3];if($144<$150){$j_2_lcssa=$j_2137;label=28;break}else{label=25;break};case 25:if($144==$150){label=26;break}else{label=27;break};case 26:if(+HEAPF64[$141+48>>3]>+HEAPF64[$147+48>>3]){label=27;break}else{$j_2_lcssa=$j_2137;label=28;break};case 27:HEAP32[$j_2137>>2]=HEAP32[$145>>2];if($145>>>0>$p_0_lcssa>>>0){$j_2137=$145;label=24;break}else{$j_2_lcssa=$145;label=28;break};case 28:HEAP32[$j_2_lcssa>>2]=$139;$i_2=$i_2142+4|0;if($i_2>>>0>$r_0_ph145>>>0){label=6;break}else{$i_2142=$i_2;label=23;break};case 29:HEAP32[$pq+16>>2]=HEAP32[$2>>2];HEAP32[$pq+20>>2]=1;___gl_pqHeapInit(HEAP32[$pq>>2]|0);$169=HEAP32[$8>>2]|0;$_sum106=(HEAP32[$2>>2]|0)-1|0;if(($_sum106|0)>0){$i_3114=$169;label=30;break}else{$_0=1;label=35;break};case 30:$173=$i_3114+4|0;$175=HEAP32[HEAP32[$173>>2]>>2]|0;$178=+HEAPF64[$175+40>>3];$180=HEAP32[HEAP32[$i_3114>>2]>>2]|0;$183=+HEAPF64[$180+40>>3];if($178<$183){label=33;break}else{label=31;break};case 31:if($178==$183){label=32;break}else{label=34;break};case 32:if(+HEAPF64[$175+48>>3]>+HEAPF64[$180+48>>3]){label=34;break}else{label=33;break};case 33:if($173>>>0<($169+($_sum106<<2)|0)>>>0){$i_3114=$173;label=30;break}else{$_0=1;label=35;break};case 34:___assert_func(648,164,1824,464);return 0;case 35:STACKTOP=sp;return $_0|0}return 0}function ___gl_pqSortInsert($pq,$keyNew){$pq=$pq|0;$keyNew=$keyNew|0;var $9=0,$10=0,$11=0,$12=0,$13=0,$16=0,$17=0,$22=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:if((HEAP32[$pq+20>>2]|0)==0){label=3;break}else{label=2;break};case 2:$_0=___gl_pqHeapInsert(HEAP32[$pq>>2]|0,$keyNew)|0;label=9;break;case 3:$9=$pq+12|0;$10=HEAP32[$9>>2]|0;$11=$10+1|0;HEAP32[$9>>2]=$11;$12=$pq+16|0;$13=HEAP32[$12>>2]|0;if(($11|0)<($13|0)){label=6;break}else{label=4;break};case 4:$16=$pq+4|0;$17=HEAP32[$16>>2]|0;HEAP32[$12>>2]=$13<<1;$22=_realloc(HEAP32[$16>>2]|0,$13<<3)|0;HEAP32[$16>>2]=$22;if(($22|0)==0){label=5;break}else{label=6;break};case 5:HEAP32[$16>>2]=$17;$_0=2147483647;label=9;break;case 6:if(($10|0)==2147483647){label=7;break}else{label=8;break};case 7:___assert_func(648,194,1800,400);return 0;case 8:HEAP32[(HEAP32[$pq+4>>2]|0)+($10<<2)>>2]=$keyNew;$_0=~$10;label=9;break;case 9:return $_0|0}return 0}function ___gl_pqSortMinimum($pq){$pq=$pq|0;var $2=0,$6=0,$21=0,$23=0,$35=0,$38=0.0,$41=0.0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$2=HEAP32[$pq+12>>2]|0;if(($2|0)==0){label=2;break}else{label=3;break};case 2:$6=HEAP32[$pq>>2]|0;$_0=HEAP32[(HEAP32[$6+4>>2]|0)+(HEAP32[(HEAP32[$6>>2]|0)+4>>2]<<3)>>2]|0;label=8;break;case 3:$21=HEAP32[HEAP32[(HEAP32[$pq+8>>2]|0)+($2-1<<2)>>2]>>2]|0;$23=HEAP32[$pq>>2]|0;if((HEAP32[$23+8>>2]|0)==0){label=7;break}else{label=4;break};case 4:$35=HEAP32[(HEAP32[$23+4>>2]|0)+(HEAP32[(HEAP32[$23>>2]|0)+4>>2]<<3)>>2]|0;$38=+HEAPF64[$35+40>>3];$41=+HEAPF64[$21+40>>3];if($38<$41){$_0=$35;label=8;break}else{label=5;break};case 5:if($38==$41){label=6;break}else{label=7;break};case 6:if(+HEAPF64[$35+48>>3]>+HEAPF64[$21+48>>3]){label=7;break}else{$_0=$35;label=8;break};case 7:$_0=$21;label=8;break;case 8:return $_0|0}return 0}function ___gl_pqSortExtractMin($pq){$pq=$pq|0;var $1=0,$2=0,$10=0,$14=0,$15=0,$16=0,$28=0,$31=0.0,$34=0.0,$49=0,$50=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$pq+12|0;$2=HEAP32[$1>>2]|0;if(($2|0)==0){label=2;break}else{label=3;break};case 2:$_0=___gl_pqHeapExtractMin(HEAP32[$pq>>2]|0)|0;label=10;break;case 3:$10=$pq+8|0;$14=HEAP32[HEAP32[(HEAP32[$10>>2]|0)+($2-1<<2)>>2]>>2]|0;$15=$pq|0;$16=HEAP32[$15>>2]|0;if((HEAP32[$16+8>>2]|0)==0){label=8;break}else{label=4;break};case 4:$28=HEAP32[(HEAP32[$16+4>>2]|0)+(HEAP32[(HEAP32[$16>>2]|0)+4>>2]<<3)>>2]|0;$31=+HEAPF64[$28+40>>3];$34=+HEAPF64[$14+40>>3];if($31<$34){label=7;break}else{label=5;break};case 5:if($31==$34){label=6;break}else{label=8;break};case 6:if(+HEAPF64[$28+48>>3]>+HEAPF64[$14+48>>3]){label=8;break}else{label=7;break};case 7:$_0=___gl_pqHeapExtractMin(HEAP32[$15>>2]|0)|0;label=10;break;case 8:$49=HEAP32[$1>>2]|0;$50=$49-1|0;HEAP32[$1>>2]=$50;if(($50|0)>0){label=9;break}else{$_0=$14;label=10;break};case 9:if((HEAP32[HEAP32[(HEAP32[$10>>2]|0)+($49-2<<2)>>2]>>2]|0)==0){label=8;break}else{$_0=$14;label=10;break};case 10:return $_0|0}return 0}function ___gl_computeInterior($tess){$tess=$tess|0;var $5=0,$7=0,$_in=0,$11=0,$20=0,$34=0,$40=0,$43=0,$56=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:HEAP32[$tess+100>>2]=0;_RemoveDegenerateEdges($tess);if((_InitPriorityQ($tess)|0)==0){$_0=0;label=11;break}else{label=2;break};case 2:_InitEdgeDict($tess);$5=$tess+108|0;$7=___gl_pqSortExtractMin(HEAP32[$5>>2]|0)|0;if(($7|0)==0){label=9;break}else{$_in=$7;label=3;break};case 3:$11=___gl_pqSortMinimum(HEAP32[$5>>2]|0)|0;if(($11|0)==0){label=8;break}else{label=4;break};case 4:$20=$11;label=5;break;case 5:if(+HEAPF64[$20+40>>3]==+HEAPF64[$_in+40>>3]){label=6;break}else{label=8;break};case 6:if(+HEAPF64[$20+48>>3]==+HEAPF64[$_in+48>>3]){label=7;break}else{label=8;break};case 7:$34=___gl_pqSortExtractMin(HEAP32[$5>>2]|0)|0;_SpliceMergeVertices($tess,HEAP32[$_in+8>>2]|0,HEAP32[$34+8>>2]|0);$40=___gl_pqSortMinimum(HEAP32[$5>>2]|0)|0;if(($40|0)==0){label=8;break}else{$20=$40;label=5;break};case 8:_SweepEvent($tess,$_in);$43=___gl_pqSortExtractMin(HEAP32[$5>>2]|0)|0;if(($43|0)==0){label=9;break}else{$_in=$43;label=3;break};case 9:HEAP32[$tess+112>>2]=HEAP32[(HEAP32[HEAP32[HEAP32[(HEAP32[$tess+104>>2]|0)+4>>2]>>2]>>2]|0)+16>>2];_DoneEdgeDict($tess);_DonePriorityQ($tess);$56=$tess+8|0;if((_RemoveDegenerateFaces(HEAP32[$56>>2]|0)|0)==0){$_0=0;label=11;break}else{label=10;break};case 10:___gl_meshCheckMesh(HEAP32[$56>>2]|0);$_0=1;label=11;break;case 11:return $_0|0}return 0}function _InitPriorityQ($tess){$tess=$tess|0;var $1=0,$2=0,$6=0,$v_0_in=0,$v_0=0,$13=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=___gl_pqSortNewPriorityQ(48)|0;$2=$tess+108|0;HEAP32[$2>>2]=$1;if(($1|0)==0){$_0=0;label=7;break}else{label=2;break};case 2:$6=HEAP32[$tess+8>>2]|0;$v_0_in=$6|0;label=3;break;case 3:$v_0=HEAP32[$v_0_in>>2]|0;if(($v_0|0)==($6|0)){label=5;break}else{label=4;break};case 4:$13=___gl_pqSortInsert($1,$v_0)|0;HEAP32[$v_0+56>>2]=$13;if(($13|0)==2147483647){label=6;break}else{$v_0_in=$v_0|0;label=3;break};case 5:if((___gl_pqSortInit($1)|0)==0){label=6;break}else{$_0=1;label=7;break};case 6:___gl_pqSortDeletePriorityQ(HEAP32[$2>>2]|0);HEAP32[$2>>2]=0;$_0=0;label=7;break;case 7:return $_0|0}return 0}function _DonePriorityQ($tess){$tess=$tess|0;___gl_pqSortDeletePriorityQ(HEAP32[$tess+108>>2]|0);return}function _TopLeftRegion($reg){$reg=$reg|0;var $_011=0,$11=0,$12=0,$14=0,$25=0,$37=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$_011=$reg;label=2;break;case 2:$11=HEAP32[HEAP32[(HEAP32[$_011+4>>2]|0)+4>>2]>>2]|0;$12=$11;$14=HEAP32[$11>>2]|0;if((HEAP32[$14+16>>2]|0)==(HEAP32[(HEAP32[$reg>>2]|0)+16>>2]|0)){$_011=$12;label=2;break}else{label=3;break};case 3:if((HEAP32[$11+24>>2]|0)==0){$_0=$12;label=7;break}else{label=4;break};case 4:$25=$11+4|0;$37=___gl_meshConnect(HEAP32[(HEAP32[HEAP32[HEAP32[(HEAP32[$25>>2]|0)+8>>2]>>2]>>2]|0)+4>>2]|0,HEAP32[$14+12>>2]|0)|0;if(($37|0)==0){$_0=0;label=7;break}else{label=5;break};case 5:if((_FixUpperEdge($12,$37)|0)==0){$_0=0;label=7;break}else{label=6;break};case 6:$_0=HEAP32[HEAP32[(HEAP32[$25>>2]|0)+4>>2]>>2]|0;label=7;break;case 7:return $_0|0}return 0}function ___gl_pqSortDelete($pq,$curr){$pq=$pq|0;$curr=$curr|0;var $6=0,$13=0,$18=0,$19=0,$23=0,$24=0,label=0;label=1;while(1)switch(label|0){case 1:if(($curr|0)>-1){label=2;break}else{label=3;break};case 2:___gl_pqHeapDelete(HEAP32[$pq>>2]|0,$curr);label=10;break;case 3:$6=~$curr;if((HEAP32[$pq+16>>2]|0)>($6|0)){label=4;break}else{label=5;break};case 4:$13=(HEAP32[$pq+4>>2]|0)+($6<<2)|0;if((HEAP32[$13>>2]|0)==0){label=5;break}else{label=6;break};case 5:___assert_func(648,254,1872,240);case 6:HEAP32[$13>>2]=0;$18=$pq+12|0;$19=HEAP32[$18>>2]|0;if(($19|0)>0){label=7;break}else{label=10;break};case 7:$23=$19;label=8;break;case 8:$24=$23-1|0;if((HEAP32[HEAP32[(HEAP32[$pq+8>>2]|0)+($24<<2)>>2]>>2]|0)==0){label=9;break}else{label=10;break};case 9:HEAP32[$18>>2]=$24;if(($24|0)>0){$23=$24;label=8;break}else{label=10;break};case 10:return}}function _RemoveDegenerateEdges($tess){$tess=$tess|0;var $3=0,$5=0,$e_034=0,$8=0,$10=0,$12=0,$18=0,$29=0,$eLnext_0=0,$e_1=0,$eNext_0=0,$eNext_1=0,$eNext_2=0,$e_0_be=0,label=0;label=1;while(1)switch(label|0){case 1:$3=(HEAP32[$tess+8>>2]|0)+92|0;$5=HEAP32[$3>>2]|0;if(($5|0)==($3|0)){label=21;break}else{$e_034=$5;label=2;break};case 2:$8=HEAP32[$e_034>>2]|0;$10=HEAP32[$e_034+12>>2]|0;$12=HEAP32[$e_034+16>>2]|0;$18=HEAP32[(HEAP32[$e_034+4>>2]|0)+16>>2]|0;if(+HEAPF64[$12+40>>3]==+HEAPF64[$18+40>>3]){label=3;break}else{$e_1=$e_034;$eLnext_0=$10;label=8;break};case 3:if(+HEAPF64[$12+48>>3]==+HEAPF64[$18+48>>3]){label=4;break}else{$e_1=$e_034;$eLnext_0=$10;label=8;break};case 4:$29=$10+12|0;if((HEAP32[$29>>2]|0)==($e_034|0)){$e_1=$e_034;$eLnext_0=$10;label=8;break}else{label=5;break};case 5:_SpliceMergeVertices($tess,$10,$e_034);if((___gl_meshDelete($e_034)|0)==0){label=6;break}else{label=7;break};case 6:_longjmp($tess+3384|0,1);case 7:$e_1=$10;$eLnext_0=HEAP32[$29>>2]|0;label=8;break;case 8:if((HEAP32[$eLnext_0+12>>2]|0)==($e_1|0)){label=9;break}else{$e_0_be=$8;label=19;break};case 9:if(($eLnext_0|0)==($e_1|0)){$eNext_1=$8;label=15;break}else{label=10;break};case 10:if(($eLnext_0|0)==($8|0)){label=12;break}else{label=11;break};case 11:if(($eLnext_0|0)==(HEAP32[$8+4>>2]|0)){label=12;break}else{$eNext_0=$8;label=13;break};case 12:$eNext_0=HEAP32[$8>>2]|0;label=13;break;case 13:if((___gl_meshDelete($eLnext_0)|0)==0){label=14;break}else{$eNext_1=$eNext_0;label=15;break};case 14:_longjmp($tess+3384|0,1);case 15:if(($e_1|0)==($eNext_1|0)){label=17;break}else{label=16;break};case 16:if(($e_1|0)==(HEAP32[$eNext_1+4>>2]|0)){label=17;break}else{$eNext_2=$eNext_1;label=18;break};case 17:$eNext_2=HEAP32[$eNext_1>>2]|0;label=18;break;case 18:if((___gl_meshDelete($e_1)|0)==0){label=20;break}else{$e_0_be=$eNext_2;label=19;break};case 19:if(($e_0_be|0)==($3|0)){label=21;break}else{$e_034=$e_0_be;label=2;break};case 20:_longjmp($tess+3384|0,1);case 21:return}}function _InitEdgeDict($tess){$tess=$tess|0;var $2=0,label=0;label=1;while(1)switch(label|0){case 1:$2=___gl_dictListNewDict($tess,30)|0;HEAP32[$tess+104>>2]=$2;if(($2|0)==0){label=2;break}else{label=3;break};case 2:_longjmp($tess+3384|0,1);case 3:_AddSentinel($tess,-4.0e+150);_AddSentinel($tess,4.0e+150);return}}function _SpliceMergeVertices($tess,$e1,$e2){$tess=$tess|0;$e1=$e1|0;$e2=$e2|0;var $data=0,$weights=0,$2=0,$3=0,$7=0,label=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+32|0;label=1;while(1)switch(label|0){case 1:$data=sp|0;$weights=sp+16|0;_memset($data|0,0,16);$2=$weights;HEAP32[$2>>2]=HEAP32[576];HEAP32[$2+4>>2]=HEAP32[577];HEAP32[$2+8>>2]=HEAP32[578];HEAP32[$2+12>>2]=HEAP32[579];$3=$e1+16|0;$7=$data|0;HEAP32[$7>>2]=HEAP32[(HEAP32[$3>>2]|0)+12>>2];HEAP32[$data+4>>2]=HEAP32[(HEAP32[$e2+16>>2]|0)+12>>2];_CallCombine($tess,HEAP32[$3>>2]|0,$7,$weights|0,0);if((___gl_meshSplice($e1,$e2)|0)==0){label=2;break}else{label=3;break};case 2:_longjmp($tess+3384|0,1);case 3:STACKTOP=sp;return}}function _SweepEvent($tess,$vEvent){$tess=$tess|0;$vEvent=$vEvent|0;var $2=0,$e_0=0,$6=0,$10=0,$15=0,$25=0,$28=0,$29=0,$31=0,label=0;label=1;while(1)switch(label|0){case 1:HEAP32[$tess+112>>2]=$vEvent;$2=$vEvent+8|0;$e_0=HEAP32[$2>>2]|0;label=2;break;case 2:$6=HEAP32[$e_0+24>>2]|0;if(($6|0)==0){label=3;break}else{label=5;break};case 3:$10=HEAP32[$e_0+8>>2]|0;if(($10|0)==(HEAP32[$2>>2]|0)){label=4;break}else{$e_0=$10;label=2;break};case 4:_ConnectLeftVertex($tess,$vEvent);label=10;break;case 5:$15=_TopLeftRegion($6)|0;if(($15|0)==0){label=6;break}else{label=7;break};case 6:_longjmp($tess+3384|0,1);case 7:$25=HEAP32[HEAP32[(HEAP32[$15+4>>2]|0)+8>>2]>>2]|0;$28=HEAP32[$25>>2]|0;$29=_FinishLeftRegions($tess,$25,0)|0;$31=HEAP32[$29+8>>2]|0;if(($31|0)==($28|0)){label=8;break}else{label=9;break};case 8:_ConnectRightVertex($tess,$15,$29);label=10;break;case 9:_AddRightEdges($tess,$15,$31,$28,$28,1);label=10;break;case 10:return}}function _DoneEdgeDict($tess){$tess=$tess|0;var $1=0,$2=0,$6=0,$_in=0,$fixedEdges_09=0,$fixedEdges_1=0,$30=0,$34=0,$_lcssa=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$tess+104|0;$2=HEAP32[$1>>2]|0;$6=HEAP32[HEAP32[$2+4>>2]>>2]|0;if(($6|0)==0){$_lcssa=$2;label=10;break}else{$fixedEdges_09=0;$_in=$6;label=2;break};case 2:if((HEAP32[$_in+16>>2]|0)==0){label=3;break}else{$fixedEdges_1=$fixedEdges_09;label=7;break};case 3:if((HEAP32[$_in+24>>2]|0)==0){label=4;break}else{label=5;break};case 4:___assert_func(488,1188,2184,728);case 5:if(($fixedEdges_09|0)==0){$fixedEdges_1=$fixedEdges_09+1|0;label=7;break}else{label=6;break};case 6:___assert_func(488,1189,2184,624);case 7:if((HEAP32[$_in+8>>2]|0)==0){label=9;break}else{label=8;break};case 8:___assert_func(488,1191,2184,528);case 9:_DeleteRegion($tess,$_in);$30=HEAP32[$1>>2]|0;$34=HEAP32[HEAP32[$30+4>>2]>>2]|0;if(($34|0)==0){$_lcssa=$30;label=10;break}else{$fixedEdges_09=$fixedEdges_1;$_in=$34;label=2;break};case 10:___gl_dictListDeleteDict($_lcssa);return}}function _RemoveDegenerateFaces($mesh){$mesh=$mesh|0;var $1=0,$3=0,$f_013=0,$6=0,$8=0,$10=0,$20=0,$22=0,$32=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$mesh+64|0;$3=HEAP32[$1>>2]|0;if(($3|0)==($1|0)){$_0=1;label=7;break}else{$f_013=$3;label=2;break};case 2:$6=HEAP32[$f_013>>2]|0;$8=HEAP32[$f_013+8>>2]|0;$10=HEAP32[$8+12>>2]|0;if(($10|0)==($8|0)){label=3;break}else{label=4;break};case 3:___assert_func(488,1290,2080,1104);return 0;case 4:if((HEAP32[$10+12>>2]|0)==($8|0)){label=5;break}else{label=6;break};case 5:$20=$8+8|0;$22=(HEAP32[$20>>2]|0)+28|0;HEAP32[$22>>2]=(HEAP32[$22>>2]|0)+(HEAP32[$8+28>>2]|0);$32=(HEAP32[(HEAP32[$20>>2]|0)+4>>2]|0)+28|0;HEAP32[$32>>2]=(HEAP32[$32>>2]|0)+(HEAP32[(HEAP32[$8+4>>2]|0)+28>>2]|0);if((___gl_meshDelete($8)|0)==0){$_0=0;label=7;break}else{label=6;break};case 6:if(($6|0)==($1|0)){$_0=1;label=7;break}else{$f_013=$6;label=2;break};case 7:return $_0|0}return 0}function _DeleteRegion($tess,$reg){$tess=$tess|0;$reg=$reg|0;var label=0;label=1;while(1)switch(label|0){case 1:if((HEAP32[$reg+24>>2]|0)==0){label=4;break}else{label=2;break};case 2:if((HEAP32[(HEAP32[$reg>>2]|0)+28>>2]|0)==0){label=4;break}else{label=3;break};case 3:___assert_func(488,158,2200,440);case 4:HEAP32[(HEAP32[$reg>>2]|0)+24>>2]=0;___gl_dictListDelete(HEAP32[$tess+104>>2]|0,HEAP32[$reg+4>>2]|0);_free($reg);return}}function _ConnectLeftVertex($tess,$vEvent){$tess=$tess|0;$vEvent=$vEvent|0;var $tmp=0,$1=0,$11=0,$12=0,$19=0,$22=0,$24=0,$25=0,$35=0,$38=0,$40=0.0,$43=0,$45=0.0,$57=0,$74=0,$85=0,$eNew_0=0,$105=0,label=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+32|0;label=1;while(1)switch(label|0){case 1:$tmp=sp|0;$1=$vEvent+8|0;HEAP32[$tmp>>2]=HEAP32[(HEAP32[$1>>2]|0)+4>>2];$11=HEAP32[(___gl_dictListSearch(HEAP32[$tess+104>>2]|0,$tmp)|0)>>2]|0;$12=$11;$19=HEAP32[HEAP32[(HEAP32[$11+4>>2]|0)+8>>2]>>2]|0;$22=HEAP32[$11>>2]|0;$24=HEAP32[$19>>2]|0;$25=$22+4|0;if(+___gl_edgeSign(HEAP32[(HEAP32[$25>>2]|0)+16>>2]|0,$vEvent,HEAP32[$22+16>>2]|0)==0.0){label=2;break}else{label=3;break};case 2:_ConnectLeftDegenerate($tess,$12,$vEvent);label=21;break;case 3:$35=$24+4|0;$38=HEAP32[(HEAP32[$35>>2]|0)+16>>2]|0;$40=+HEAPF64[$38+40>>3];$43=HEAP32[(HEAP32[$25>>2]|0)+16>>2]|0;$45=+HEAPF64[$43+40>>3];if($40<$45){$57=$12;label=7;break}else{label=4;break};case 4:if($40==$45){label=5;break}else{label=6;break};case 5:if(+HEAPF64[$38+48>>3]>+HEAPF64[$43+48>>3]){label=6;break}else{$57=$12;label=7;break};case 6:$57=$19;label=7;break;case 7:if((HEAP32[$11+12>>2]|0)==0){label=8;break}else{label=9;break};case 8:if((HEAP32[$57+24>>2]|0)==0){label=20;break}else{label=9;break};case 9:if(($57|0)==($12|0)){label=10;break}else{label=12;break};case 10:$74=___gl_meshConnect(HEAP32[(HEAP32[$1>>2]|0)+4>>2]|0,HEAP32[$22+12>>2]|0)|0;if(($74|0)==0){label=11;break}else{$eNew_0=$74;label=15;break};case 11:_longjmp($tess+3384|0,1);case 12:$85=___gl_meshConnect(HEAP32[(HEAP32[(HEAP32[$35>>2]|0)+8>>2]|0)+4>>2]|0,HEAP32[$1>>2]|0)|0;if(($85|0)==0){label=13;break}else{label=14;break};case 13:_longjmp($tess+3384|0,1);case 14:$eNew_0=HEAP32[$85+4>>2]|0;label=15;break;case 15:if((HEAP32[$57+24>>2]|0)==0){label=18;break}else{label=16;break};case 16:if((_FixUpperEdge($57,$eNew_0)|0)==0){label=17;break}else{label=19;break};case 17:_longjmp($tess+3384|0,1);case 18:_ComputeWinding($tess,_AddRegionBelow($tess,$12,$eNew_0)|0);label=19;break;case 19:_SweepEvent($tess,$vEvent);label=21;break;case 20:$105=HEAP32[$1>>2]|0;_AddRightEdges($tess,$12,$105,$105,0,1);label=21;break;case 21:STACKTOP=sp;return}}function _FinishLeftRegions($tess,$regFirst,$regLast){$tess=$tess|0;$regFirst=$regFirst|0;$regLast=$regLast|0;var $ePrev_039=0,$ePrev_041=0,$regPrev_040=0,$9=0,$10=0,$11=0,$12=0,$31=0,$e_0=0,$ePrev_0=0,$ePrev_038=0,label=0;label=1;while(1)switch(label|0){case 1:$ePrev_039=HEAP32[$regFirst>>2]|0;if(($regFirst|0)==($regLast|0)){$ePrev_038=$ePrev_039;label=15;break}else{$regPrev_040=$regFirst;$ePrev_041=$ePrev_039;label=2;break};case 2:HEAP32[$regPrev_040+24>>2]=0;$9=HEAP32[HEAP32[(HEAP32[$regPrev_040+4>>2]|0)+8>>2]>>2]|0;$10=$9;$11=$9;$12=HEAP32[$11>>2]|0;if((HEAP32[$12+16>>2]|0)==(HEAP32[$ePrev_041+16>>2]|0)){$e_0=$12;label=9;break}else{label=3;break};case 3:if((HEAP32[$9+24>>2]|0)==0){label=4;break}else{label=5;break};case 4:_FinishRegion($tess,$regPrev_040);$ePrev_038=$ePrev_041;label=15;break;case 5:$31=___gl_meshConnect(HEAP32[(HEAP32[$ePrev_041+8>>2]|0)+4>>2]|0,HEAP32[$12+4>>2]|0)|0;if(($31|0)==0){label=6;break}else{label=7;break};case 6:_longjmp($tess+3384|0,1);return 0;case 7:if((_FixUpperEdge($10,$31)|0)==0){label=8;break}else{$e_0=$31;label=9;break};case 8:_longjmp($tess+3384|0,1);return 0;case 9:if((HEAP32[$ePrev_041+8>>2]|0)==($e_0|0)){label=14;break}else{label=10;break};case 10:if((___gl_meshSplice(HEAP32[(HEAP32[$e_0+4>>2]|0)+12>>2]|0,$e_0)|0)==0){label=11;break}else{label=12;break};case 11:_longjmp($tess+3384|0,1);return 0;case 12:if((___gl_meshSplice($ePrev_041,$e_0)|0)==0){label=13;break}else{label=14;break};case 13:_longjmp($tess+3384|0,1);return 0;case 14:_FinishRegion($tess,$regPrev_040);$ePrev_0=HEAP32[$11>>2]|0;if(($10|0)==($regLast|0)){$ePrev_038=$ePrev_0;label=15;break}else{$regPrev_040=$10;$ePrev_041=$ePrev_0;label=2;break};case 15:return $ePrev_038|0}return 0}function _ConnectRightVertex($tess,$regUp,$eBottomLeft){$tess=$tess|0;$regUp=$regUp|0;$eBottomLeft=$eBottomLeft|0;var $2=0,$8=0,$9=0,$11=0,$13=0,$18=0,$26=0,$27=0,$30=0,$31=0,$51=0,$61=0,$64=0,$eTopLeft_0=0,$_0=0,$degenerate_0=0,$67=0,$68=0,$71=0,$_04950=0,$96=0,$98=0.0,$99=0,$101=0.0,$eNew_0=0,$120=0,$126=0,label=0;label=1;while(1)switch(label|0){case 1:$2=HEAP32[$eBottomLeft+8>>2]|0;$8=HEAP32[HEAP32[(HEAP32[$regUp+4>>2]|0)+8>>2]>>2]|0;$9=$8;$11=HEAP32[$regUp>>2]|0;$13=HEAP32[$8>>2]|0;$18=$13+4|0;if((HEAP32[(HEAP32[$11+4>>2]|0)+16>>2]|0)==(HEAP32[(HEAP32[$18>>2]|0)+16>>2]|0)){label=3;break}else{label=2;break};case 2:_CheckForIntersect($tess,$regUp)|0;label=3;break;case 3:$26=$11+16|0;$27=HEAP32[$26>>2]|0;$30=$tess+112|0;$31=HEAP32[$30>>2]|0;if(+HEAPF64[$27+40>>3]==+HEAPF64[$31+40>>3]){label=4;break}else{$degenerate_0=0;$_0=$regUp;$eTopLeft_0=$2;label=10;break};case 4:if(+HEAPF64[$27+48>>3]==+HEAPF64[$31+48>>3]){label=5;break}else{$degenerate_0=0;$_0=$regUp;$eTopLeft_0=$2;label=10;break};case 5:if((___gl_meshSplice(HEAP32[(HEAP32[$2+4>>2]|0)+12>>2]|0,$11)|0)==0){label=6;break}else{label=7;break};case 6:_longjmp($tess+3384|0,1);case 7:$51=_TopLeftRegion($regUp)|0;if(($51|0)==0){label=8;break}else{label=9;break};case 8:_longjmp($tess+3384|0,1);case 9:$61=HEAP32[HEAP32[(HEAP32[$51+4>>2]|0)+8>>2]>>2]|0;$64=HEAP32[$61>>2]|0;_FinishLeftRegions($tess,$61,$9)|0;$degenerate_0=1;$_0=$51;$eTopLeft_0=$64;label=10;break;case 10:$67=$13+16|0;$68=HEAP32[$67>>2]|0;$71=HEAP32[$30>>2]|0;if(+HEAPF64[$68+40>>3]==+HEAPF64[$71+40>>3]){label=11;break}else{label=15;break};case 11:if(+HEAPF64[$68+48>>3]==+HEAPF64[$71+48>>3]){label=12;break}else{label=15;break};case 12:if((___gl_meshSplice($eBottomLeft,HEAP32[(HEAP32[$18>>2]|0)+12>>2]|0)|0)==0){label=13;break}else{label=14;break};case 13:_longjmp($tess+3384|0,1);case 14:$_04950=_FinishLeftRegions($tess,$9,0)|0;label=16;break;case 15:if(($degenerate_0|0)==0){label=17;break}else{$_04950=$eBottomLeft;label=16;break};case 16:_AddRightEdges($tess,$_0,HEAP32[$_04950+8>>2]|0,$eTopLeft_0,$eTopLeft_0,1);label=24;break;case 17:$96=HEAP32[$67>>2]|0;$98=+HEAPF64[$96+40>>3];$99=HEAP32[$26>>2]|0;$101=+HEAPF64[$99+40>>3];if($98<$101){label=20;break}else{label=18;break};case 18:if($98==$101){label=19;break}else{$eNew_0=$11;label=21;break};case 19:if(+HEAPF64[$96+48>>3]>+HEAPF64[$99+48>>3]){$eNew_0=$11;label=21;break}else{label=20;break};case 20:$eNew_0=HEAP32[(HEAP32[$18>>2]|0)+12>>2]|0;label=21;break;case 21:$120=___gl_meshConnect(HEAP32[(HEAP32[$eBottomLeft+8>>2]|0)+4>>2]|0,$eNew_0)|0;if(($120|0)==0){label=22;break}else{label=23;break};case 22:_longjmp($tess+3384|0,1);case 23:$126=HEAP32[$120+8>>2]|0;_AddRightEdges($tess,$_0,$120,$126,$126,0);HEAP32[(HEAP32[(HEAP32[$120+4>>2]|0)+24>>2]|0)+24>>2]=1;_WalkDirtyRegions($tess,$_0);label=24;break;case 24:return}}function _AddRightEdges($tess,$regUp,$eFirst,$eLast,$eTopLeft,$cleanUp){$tess=$tess|0;$regUp=$regUp|0;$eFirst=$eFirst|0;$eLast=$eLast|0;$eTopLeft=$eTopLeft|0;$cleanUp=$cleanUp|0;var $e_0=0,$3=0,$5=0.0,$6=0,$9=0,$11=0.0,$26=0,$ePrev_0_ph=0,$48=0,$52=0,$58=0,$_in=0,$firstTime_063=0,$ePrev_062=0,$regPrev_061=0,$59=0,$84=0,$86=0,$108=0,$119=0,$123=0,$_lcssa57=0,$_lcssa=0,$regPrev_0_lcssa=0,label=0;label=1;while(1)switch(label|0){case 1:$e_0=$eFirst;label=2;break;case 2:$3=HEAP32[$e_0+16>>2]|0;$5=+HEAPF64[$3+40>>3];$6=$e_0+4|0;$9=HEAP32[(HEAP32[$6>>2]|0)+16>>2]|0;$11=+HEAPF64[$9+40>>3];if($5<$11){label=6;break}else{label=3;break};case 3:if($5==$11){label=4;break}else{label=5;break};case 4:if(+HEAPF64[$3+48>>3]>+HEAPF64[$9+48>>3]){label=5;break}else{label=6;break};case 5:___assert_func(488,361,2288,368);case 6:_AddRegionBelow($tess,$regUp,HEAP32[$6>>2]|0)|0;$26=HEAP32[$e_0+8>>2]|0;if(($26|0)==($eLast|0)){label=7;break}else{$e_0=$26;label=2;break};case 7:if(($eTopLeft|0)==0){label=8;break}else{$ePrev_0_ph=$eTopLeft;label=9;break};case 8:$ePrev_0_ph=HEAP32[(HEAP32[(HEAP32[HEAP32[HEAP32[(HEAP32[$regUp+4>>2]|0)+8>>2]>>2]>>2]|0)+4>>2]|0)+8>>2]|0;label=9;break;case 9:$48=HEAP32[HEAP32[(HEAP32[$regUp+4>>2]|0)+8>>2]>>2]|0;$52=HEAP32[(HEAP32[$48>>2]|0)+4>>2]|0;if((HEAP32[$52+16>>2]|0)==(HEAP32[$ePrev_0_ph+16>>2]|0)){$regPrev_061=$regUp;$ePrev_062=$ePrev_0_ph;$firstTime_063=1;$_in=$48;$58=$52;label=10;break}else{$regPrev_0_lcssa=$regUp;$_lcssa=$48;$_lcssa57=$52;label=20;break};case 10:$59=$_in;if((HEAP32[$58+8>>2]|0)==($ePrev_062|0)){label=15;break}else{label=11;break};case 11:if((___gl_meshSplice(HEAP32[(HEAP32[$58+4>>2]|0)+12>>2]|0,$58)|0)==0){label=12;break}else{label=13;break};case 12:_longjmp($tess+3384|0,1);case 13:if((___gl_meshSplice(HEAP32[(HEAP32[$ePrev_062+4>>2]|0)+12>>2]|0,$58)|0)==0){label=14;break}else{label=15;break};case 14:_longjmp($tess+3384|0,1);case 15:$84=$58+28|0;$86=(HEAP32[$regPrev_061+8>>2]|0)-(HEAP32[$84>>2]|0)|0;HEAP32[$_in+8>>2]=$86;HEAP32[$_in+12>>2]=_IsWindingInside($tess,$86)|0;HEAP32[$regPrev_061+20>>2]=1;if(($firstTime_063|0)==0){label=16;break}else{label=18;break};case 16:if((_CheckForRightSplice($tess,$regPrev_061)|0)==0){label=18;break}else{label=17;break};case 17:HEAP32[$84>>2]=(HEAP32[$84>>2]|0)+(HEAP32[$ePrev_062+28>>2]|0);$108=(HEAP32[$58+4>>2]|0)+28|0;HEAP32[$108>>2]=(HEAP32[$108>>2]|0)+(HEAP32[(HEAP32[$ePrev_062+4>>2]|0)+28>>2]|0);_DeleteRegion($tess,$regPrev_061);if((___gl_meshDelete($ePrev_062)|0)==0){label=19;break}else{label=18;break};case 18:$119=HEAP32[HEAP32[(HEAP32[$_in+4>>2]|0)+8>>2]>>2]|0;$123=HEAP32[(HEAP32[$119>>2]|0)+4>>2]|0;if((HEAP32[$123+16>>2]|0)==(HEAP32[$58+16>>2]|0)){$regPrev_061=$59;$ePrev_062=$58;$firstTime_063=0;$_in=$119;$58=$123;label=10;break}else{$regPrev_0_lcssa=$59;$_lcssa=$119;$_lcssa57=$123;label=20;break};case 19:_longjmp($tess+3384|0,1);case 20:HEAP32[$regPrev_0_lcssa+20>>2]=1;if(((HEAP32[$regPrev_0_lcssa+8>>2]|0)-(HEAP32[$_lcssa57+28>>2]|0)|0)==(HEAP32[$_lcssa+8>>2]|0)){label=22;break}else{label=21;break};case 21:___assert_func(488,403,2288,176);case 22:if(($cleanUp|0)==0){label=24;break}else{label=23;break};case 23:_WalkDirtyRegions($tess,$regPrev_0_lcssa);label=24;break;case 24:return}}function _AddRegionBelow($tess,$regAbove,$eNewUp){$tess=$tess|0;$regAbove=$regAbove|0;$eNewUp=$eNewUp|0;var $1=0,$2=0,$12=0,label=0;label=1;while(1)switch(label|0){case 1:$1=_malloc(28)|0;$2=$1;if(($1|0)==0){label=2;break}else{label=3;break};case 2:_longjmp($tess+3384|0,1);return 0;case 3:HEAP32[$1>>2]=$eNewUp;$12=___gl_dictListInsertBefore(HEAP32[$tess+104>>2]|0,HEAP32[$regAbove+4>>2]|0,$1)|0;HEAP32[$1+4>>2]=$12;if(($12|0)==0){label=4;break}else{label=5;break};case 4:_longjmp($tess+3384|0,1);return 0;case 5:HEAP32[$1+24>>2]=0;HEAP32[$1+16>>2]=0;HEAP32[$1+20>>2]=0;HEAP32[$eNewUp+24>>2]=$2;return $2|0}return 0}function _IsWindingInside($tess,$n){$tess=$tess|0;$n=$n|0;var $_0=0,label=0;label=1;while(1)switch(label|0){case 1:switch(HEAP32[$tess+96>>2]|0){case 100130:{label=2;break};case 100131:{label=3;break};case 100132:{label=4;break};case 100133:{label=5;break};case 100134:{label=6;break};default:{label=8;break}}break;case 2:$_0=$n&1;label=9;break;case 3:$_0=($n|0)!=0|0;label=9;break;case 4:$_0=($n|0)>0|0;label=9;break;case 5:$_0=$n>>>31;label=9;break;case 6:if(($n|0)>1){$_0=1;label=9;break}else{label=7;break};case 7:$_0=($n|0)<-1|0;label=9;break;case 8:___assert_func(488,253,2136,904);return 0;case 9:return $_0|0}return 0}function _CheckForRightSplice($tess,$regUp){$tess=$tess|0;$regUp=$regUp|0;var $1=0,$6=0,$8=0,$10=0,$11=0,$12=0,$14=0.0,$15=0,$16=0,$18=0.0,$29=0,$38=0,$41=0,$80=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$regUp+4|0;$6=HEAP32[HEAP32[(HEAP32[$1>>2]|0)+8>>2]>>2]|0;$8=HEAP32[$regUp>>2]|0;$10=HEAP32[$6>>2]|0;$11=$8+16|0;$12=HEAP32[$11>>2]|0;$14=+HEAPF64[$12+40>>3];$15=$10+16|0;$16=HEAP32[$15>>2]|0;$18=+HEAPF64[$16+40>>3];if($14<$18){label=4;break}else{label=2;break};case 2:if($14==$18){label=3;break}else{label=14;break};case 3:if(+HEAPF64[$12+48>>3]>+HEAPF64[$16+48>>3]){label=14;break}else{label=4;break};case 4:$29=$10+4|0;if(+___gl_edgeSign(HEAP32[(HEAP32[$29>>2]|0)+16>>2]|0,HEAP32[$11>>2]|0,HEAP32[$15>>2]|0)>0.0){$_0=0;label=19;break}else{label=5;break};case 5:$38=HEAP32[$11>>2]|0;$41=HEAP32[$15>>2]|0;if(+HEAPF64[$38+40>>3]==+HEAPF64[$41+40>>3]){label=6;break}else{label=7;break};case 6:if(+HEAPF64[$38+48>>3]==+HEAPF64[$41+48>>3]){label=12;break}else{label=7;break};case 7:if((___gl_meshSplitEdge(HEAP32[$29>>2]|0)|0)==0){label=8;break}else{label=9;break};case 8:_longjmp($tess+3384|0,1);return 0;case 9:if((___gl_meshSplice($8,HEAP32[(HEAP32[$29>>2]|0)+12>>2]|0)|0)==0){label=10;break}else{label=11;break};case 10:_longjmp($tess+3384|0,1);return 0;case 11:HEAP32[$6+20>>2]=1;HEAP32[$regUp+20>>2]=1;$_0=1;label=19;break;case 12:if(($38|0)==($41|0)){$_0=1;label=19;break}else{label=13;break};case 13:___gl_pqSortDelete(HEAP32[$tess+108>>2]|0,HEAP32[$38+56>>2]|0);_SpliceMergeVertices($tess,HEAP32[(HEAP32[$29>>2]|0)+12>>2]|0,$8);$_0=1;label=19;break;case 14:$80=$8+4|0;if(+___gl_edgeSign(HEAP32[(HEAP32[$80>>2]|0)+16>>2]|0,HEAP32[$15>>2]|0,HEAP32[$11>>2]|0)<0.0){$_0=0;label=19;break}else{label=15;break};case 15:HEAP32[$regUp+20>>2]=1;HEAP32[(HEAP32[HEAP32[(HEAP32[$1>>2]|0)+4>>2]>>2]|0)+20>>2]=1;if((___gl_meshSplitEdge(HEAP32[$80>>2]|0)|0)==0){label=16;break}else{label=17;break};case 16:_longjmp($tess+3384|0,1);return 0;case 17:if((___gl_meshSplice(HEAP32[(HEAP32[$10+4>>2]|0)+12>>2]|0,$8)|0)==0){label=18;break}else{$_0=1;label=19;break};case 18:_longjmp($tess+3384|0,1);return 0;case 19:return $_0|0}return 0}function _WalkDirtyRegions($tess,$regUp){$tess=$tess|0;$regUp=$regUp|0;var $_0=0,$regLo_0=0,$30=0,$_1=0,$regLo_1=0,$41=0,$43=0,$71=0,$90=0,$_2=0,$regLo_2=0,$eUp_0=0,$eLo_0=0,$95=0,$97=0,$104=0,$108=0,$119=0,$132=0,$136=0,$144=0,$151=0,label=0;label=1;while(1)switch(label|0){case 1:$regLo_0=HEAP32[HEAP32[(HEAP32[$regUp+4>>2]|0)+8>>2]>>2]|0;$_0=$regUp;label=2;break;case 2:if((HEAP32[$regLo_0+20>>2]|0)==0){label=4;break}else{label=3;break};case 3:$_0=$regLo_0;$regLo_0=HEAP32[HEAP32[(HEAP32[$regLo_0+4>>2]|0)+8>>2]>>2]|0;label=2;break;case 4:if((HEAP32[$_0+20>>2]|0)==0){label=5;break}else{$regLo_1=$regLo_0;$_1=$_0;label=7;break};case 5:$30=HEAP32[HEAP32[(HEAP32[$_0+4>>2]|0)+4>>2]>>2]|0;if(($30|0)==0){label=29;break}else{label=6;break};case 6:if((HEAP32[$30+20>>2]|0)==0){label=29;break}else{$regLo_1=$_0;$_1=$30;label=7;break};case 7:HEAP32[$_1+20>>2]=0;$41=HEAP32[$_1>>2]|0;$43=HEAP32[$regLo_1>>2]|0;if((HEAP32[(HEAP32[$41+4>>2]|0)+16>>2]|0)==(HEAP32[(HEAP32[$43+4>>2]|0)+16>>2]|0)){$eLo_0=$43;$eUp_0=$41;$regLo_2=$regLo_1;$_2=$_1;label=17;break}else{label=8;break};case 8:if((_CheckForLeftSplice($tess,$_1)|0)==0){$eLo_0=$43;$eUp_0=$41;$regLo_2=$regLo_1;$_2=$_1;label=17;break}else{label=9;break};case 9:if((HEAP32[$regLo_1+24>>2]|0)==0){label=13;break}else{label=10;break};case 10:_DeleteRegion($tess,$regLo_1);if((___gl_meshDelete($43)|0)==0){label=11;break}else{label=12;break};case 11:_longjmp($tess+3384|0,1);case 12:$71=HEAP32[HEAP32[(HEAP32[$_1+4>>2]|0)+8>>2]>>2]|0;$eLo_0=HEAP32[$71>>2]|0;$eUp_0=$41;$regLo_2=$71;$_2=$_1;label=17;break;case 13:if((HEAP32[$_1+24>>2]|0)==0){$eLo_0=$43;$eUp_0=$41;$regLo_2=$regLo_1;$_2=$_1;label=17;break}else{label=14;break};case 14:_DeleteRegion($tess,$_1);if((___gl_meshDelete($41)|0)==0){label=15;break}else{label=16;break};case 15:_longjmp($tess+3384|0,1);case 16:$90=HEAP32[HEAP32[(HEAP32[$regLo_1+4>>2]|0)+4>>2]>>2]|0;$eLo_0=$43;$eUp_0=HEAP32[$90>>2]|0;$regLo_2=$regLo_1;$_2=$90;label=17;break;case 17:$95=$eUp_0+16|0;$97=$eLo_0+16|0;if((HEAP32[$95>>2]|0)==(HEAP32[$97>>2]|0)){label=24;break}else{label=18;break};case 18:$104=HEAP32[(HEAP32[$eUp_0+4>>2]|0)+16>>2]|0;$108=HEAP32[(HEAP32[$eLo_0+4>>2]|0)+16>>2]|0;if(($104|0)==($108|0)){label=23;break}else{label=19;break};case 19:if((HEAP32[$_2+24>>2]|0)==0){label=20;break}else{label=23;break};case 20:if((HEAP32[$regLo_2+24>>2]|0)==0){label=21;break}else{label=23;break};case 21:$119=HEAP32[$tess+112>>2]|0;if(($104|0)==($119|0)|($108|0)==($119|0)){label=22;break}else{label=23;break};case 22:if((_CheckForIntersect($tess,$_2)|0)==0){label=24;break}else{label=29;break};case 23:_CheckForRightSplice($tess,$_2)|0;label=24;break;case 24:if((HEAP32[$95>>2]|0)==(HEAP32[$97>>2]|0)){label=25;break}else{$regLo_0=$regLo_2;$_0=$_2;label=2;break};case 25:$132=$eUp_0+4|0;$136=$eLo_0+4|0;if((HEAP32[(HEAP32[$132>>2]|0)+16>>2]|0)==(HEAP32[(HEAP32[$136>>2]|0)+16>>2]|0)){label=26;break}else{$regLo_0=$regLo_2;$_0=$_2;label=2;break};case 26:$144=$eLo_0+28|0;HEAP32[$144>>2]=(HEAP32[$144>>2]|0)+(HEAP32[$eUp_0+28>>2]|0);$151=(HEAP32[$136>>2]|0)+28|0;HEAP32[$151>>2]=(HEAP32[$151>>2]|0)+(HEAP32[(HEAP32[$132>>2]|0)+28>>2]|0);_DeleteRegion($tess,$_2);if((___gl_meshDelete($eUp_0)|0)==0){label=27;break}else{label=28;break};case 27:_longjmp($tess+3384|0,1);case 28:$regLo_0=$regLo_2;$_0=HEAP32[HEAP32[(HEAP32[$regLo_2+4>>2]|0)+4>>2]>>2]|0;label=2;break;case 29:return}}function _CheckForLeftSplice($tess,$regUp){$tess=$tess|0;$regUp=$regUp|0;var $1=0,$6=0,$8=0,$10=0,$11=0,$14=0,$17=0,$20=0,$34=0,$36=0.0,$39=0,$41=0.0,$71=0,$102=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$regUp+4|0;$6=HEAP32[HEAP32[(HEAP32[$1>>2]|0)+8>>2]>>2]|0;$8=HEAP32[$regUp>>2]|0;$10=HEAP32[$6>>2]|0;$11=$8+4|0;$14=HEAP32[(HEAP32[$11>>2]|0)+16>>2]|0;$17=$10+4|0;$20=HEAP32[(HEAP32[$17>>2]|0)+16>>2]|0;if(+HEAPF64[$14+40>>3]==+HEAPF64[$20+40>>3]){label=2;break}else{label=4;break};case 2:if(+HEAPF64[$14+48>>3]==+HEAPF64[$20+48>>3]){label=3;break}else{label=4;break};case 3:___assert_func(488,581,2240,912);return 0;case 4:$34=HEAP32[(HEAP32[$11>>2]|0)+16>>2]|0;$36=+HEAPF64[$34+40>>3];$39=HEAP32[(HEAP32[$17>>2]|0)+16>>2]|0;$41=+HEAPF64[$39+40>>3];if($36<$41){label=7;break}else{label=5;break};case 5:if($36==$41){label=6;break}else{label=13;break};case 6:if(+HEAPF64[$34+48>>3]>+HEAPF64[$39+48>>3]){label=13;break}else{label=7;break};case 7:if(+___gl_edgeSign(HEAP32[(HEAP32[$11>>2]|0)+16>>2]|0,HEAP32[(HEAP32[$17>>2]|0)+16>>2]|0,HEAP32[$8+16>>2]|0)<0.0){$_0=0;label=19;break}else{label=8;break};case 8:HEAP32[$regUp+20>>2]=1;HEAP32[(HEAP32[HEAP32[(HEAP32[$1>>2]|0)+4>>2]>>2]|0)+20>>2]=1;$71=___gl_meshSplitEdge($8)|0;if(($71|0)==0){label=9;break}else{label=10;break};case 9:_longjmp($tess+3384|0,1);return 0;case 10:if((___gl_meshSplice(HEAP32[$17>>2]|0,$71)|0)==0){label=11;break}else{label=12;break};case 11:_longjmp($tess+3384|0,1);return 0;case 12:HEAP32[(HEAP32[$71+20>>2]|0)+24>>2]=HEAP32[$regUp+12>>2];$_0=1;label=19;break;case 13:if(+___gl_edgeSign(HEAP32[(HEAP32[$17>>2]|0)+16>>2]|0,HEAP32[(HEAP32[$11>>2]|0)+16>>2]|0,HEAP32[$10+16>>2]|0)>0.0){$_0=0;label=19;break}else{label=14;break};case 14:HEAP32[$6+20>>2]=1;HEAP32[$regUp+20>>2]=1;$102=___gl_meshSplitEdge($10)|0;if(($102|0)==0){label=15;break}else{label=16;break};case 15:_longjmp($tess+3384|0,1);return 0;case 16:if((___gl_meshSplice(HEAP32[$8+12>>2]|0,HEAP32[$17>>2]|0)|0)==0){label=17;break}else{label=18;break};case 17:_longjmp($tess+3384|0,1);return 0;case 18:HEAP32[(HEAP32[(HEAP32[$102+4>>2]|0)+20>>2]|0)+24>>2]=HEAP32[$regUp+12>>2];$_0=1;label=19;break;case 19:return $_0|0}return 0}function _TopRightRegion($reg){$reg=$reg|0;var $_0=0,$13=0,$14=0,label=0;label=1;while(1)switch(label|0){case 1:$_0=$reg;label=2;break;case 2:$13=HEAP32[HEAP32[(HEAP32[$_0+4>>2]|0)+4>>2]>>2]|0;$14=$13;if((HEAP32[(HEAP32[(HEAP32[$13>>2]|0)+4>>2]|0)+16>>2]|0)==(HEAP32[(HEAP32[(HEAP32[$reg>>2]|0)+4>>2]|0)+16>>2]|0)){$_0=$14;label=2;break}else{label=3;break};case 3:return $14|0}return 0}function _VertexWeights($isect,$org,$dst,$weights){$isect=$isect|0;$org=$org|0;$dst=$dst|0;$weights=$weights|0;var $3=0,$5=0.0,$10=0.0,$13=0,$15=0.0,$20=0.0,$21=0.0,$25=0.0,$30=0.0,$34=0.0,$39=0.0,$40=0.0,$42=0.0,$47=0.0,$48=0,$59=0,$73=0,$87=0,label=0;label=1;while(1)switch(label|0){case 1:$3=$isect+40|0;$5=+HEAPF64[$org+40>>3]- +HEAPF64[$3>>3];if($5<0.0){label=2;break}else{$10=$5;label=3;break};case 2:$10=-0.0-$5;label=3;break;case 3:$13=$isect+48|0;$15=+HEAPF64[$org+48>>3]- +HEAPF64[$13>>3];if($15<0.0){label=4;break}else{$20=$15;label=5;break};case 4:$20=-0.0-$15;label=5;break;case 5:$21=$10+$20;$25=+HEAPF64[$dst+40>>3]- +HEAPF64[$3>>3];if($25<0.0){label=6;break}else{$30=$25;label=7;break};case 6:$30=-0.0-$25;label=7;break;case 7:$34=+HEAPF64[$dst+48>>3]- +HEAPF64[$13>>3];if($34<0.0){label=8;break}else{$39=$34;label=9;break};case 8:$39=-0.0-$34;label=9;break;case 9:$40=$30+$39;$42=$21+$40;HEAPF32[$weights>>2]=$40*.5/$42;$47=$21*.5/$42;$48=$weights+4|0;HEAPF32[$48>>2]=$47;$59=$isect+16|0;HEAPF64[$59>>3]=+HEAPF64[$59>>3]+(+HEAPF32[$weights>>2]*+HEAPF64[$org+16>>3]+$47*+HEAPF64[$dst+16>>3]);$73=$isect+24|0;HEAPF64[$73>>3]=+HEAPF64[$73>>3]+(+HEAPF32[$weights>>2]*+HEAPF64[$org+24>>3]+ +HEAPF32[$48>>2]*+HEAPF64[$dst+24>>3]);$87=$isect+32|0;HEAPF64[$87>>3]=+HEAPF64[$87>>3]+(+HEAPF32[$weights>>2]*+HEAPF64[$org+32>>3]+ +HEAPF32[$48>>2]*+HEAPF64[$dst+32>>3]);return}}function _GetIntersectData($tess,$isect,$orgUp,$dstUp,$orgLo,$dstLo){$tess=$tess|0;$isect=$isect|0;$orgUp=$orgUp|0;$dstUp=$dstUp|0;$orgLo=$orgLo|0;$dstLo=$dstLo|0;var $data=0,$weights=0,$3=0,$14=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+32|0;$data=sp|0;$weights=sp+16|0;$3=$data|0;HEAP32[$3>>2]=HEAP32[$orgUp+12>>2];HEAP32[$data+4>>2]=HEAP32[$dstUp+12>>2];HEAP32[$data+8>>2]=HEAP32[$orgLo+12>>2];HEAP32[$data+12>>2]=HEAP32[$dstLo+12>>2];$14=$weights|0;_memset($isect+16|0,0,24);_VertexWeights($isect,$orgUp,$dstUp,$14);_VertexWeights($isect,$orgLo,$dstLo,$weights+8|0);_CallCombine($tess,$isect,$3,$14,1);STACKTOP=sp;return}function _CallCombine($tess,$isect,$data,$weights,$needed){$tess=$tess|0;$isect=$isect|0;$data=$data|0;$weights=$weights|0;$needed=$needed|0;var $coords=0,$3=0,$10=0,$12=0,$28=0,$33=0,label=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+24|0;label=1;while(1)switch(label|0){case 1:$coords=sp|0;$3=$coords|0;HEAPF64[$3>>3]=+HEAPF64[$isect+16>>3];HEAPF64[$coords+8>>3]=+HEAPF64[$isect+24>>3];HEAPF64[$coords+16>>3]=+HEAPF64[$isect+32>>3];$10=$isect+12|0;HEAP32[$10>>2]=0;$12=HEAP32[$tess+3380>>2]|0;if(($12|0)==76){label=3;break}else{label=2;break};case 2:FUNCTION_TABLE_viiiii[$12&127]($3,$data,$weights,$10,HEAP32[$tess+3424>>2]|0);label=4;break;case 3:FUNCTION_TABLE_viiii[HEAP32[$tess+116>>2]&127]($3,$data,$weights,$10);label=4;break;case 4:if((HEAP32[$10>>2]|0)==0){label=5;break}else{label=12;break};case 5:if(($needed|0)==0){label=6;break}else{label=7;break};case 6:HEAP32[$10>>2]=HEAP32[$data>>2];label=12;break;case 7:$28=$tess+100|0;if((HEAP32[$28>>2]|0)==0){label=8;break}else{label=12;break};case 8:$33=HEAP32[$tess+3376>>2]|0;if(($33|0)==44){label=10;break}else{label=9;break};case 9:FUNCTION_TABLE_vii[$33&127](100156,HEAP32[$tess+3424>>2]|0);label=11;break;case 10:FUNCTION_TABLE_vi[HEAP32[$tess+12>>2]&127](100156);label=11;break;case 11:HEAP32[$28>>2]=1;label=12;break;case 12:STACKTOP=sp;return}}function _FinishRegion($tess,$reg){$tess=$tess|0;$reg=$reg|0;var $2=0,$4=0;$2=HEAP32[$reg>>2]|0;$4=HEAP32[$2+20>>2]|0;HEAP32[$4+24>>2]=HEAP32[$reg+12>>2];HEAP32[$4+8>>2]=$2;_DeleteRegion($tess,$reg);return}function _CheckForIntersect($tess,$regUp){$tess=$tess|0;$regUp=$regUp|0;var $isect=0,$1=0,$6=0,$8=0,$9=0,$11=0,$12=0,$13=0,$14=0,$15=0,$16=0,$19=0,$20=0,$23=0,$24=0,$26=0,$37=0,$48=0,$65=0,$66=0.0,$67=0,$68=0.0,$70=0,$71=0.0,$72=0,$73=0.0,$78=0,$79=0.0,$80=0,$81=0.0,$93=0.0,$94=0.0,$96=0,$97=0.0,$101=0.0,$102=0.0,$107=0.0,$108=0.0,$110=0,$111=0.0,$115=0.0,$116=0.0,$121=0,$123=0.0,$139=0.0,$140=0.0,$150=0,$151=0,$152=0.0,$153=0.0,$186=0,$201=0,$215=0,$230=0,$240=0,$243=0,$268=0,$280=0,$286=0,$369=0,$373=0,$376=0,$_0=0,label=0,sp=0;sp=STACKTOP;STACKTOP=STACKTOP+64|0;label=1;while(1)switch(label|0){case 1:$isect=sp|0;$1=$regUp+4|0;$6=HEAP32[HEAP32[(HEAP32[$1>>2]|0)+8>>2]>>2]|0;$8=$regUp|0;$9=HEAP32[$8>>2]|0;$11=HEAP32[$6>>2]|0;$12=$9+16|0;$13=HEAP32[$12>>2]|0;$14=$11+16|0;$15=HEAP32[$14>>2]|0;$16=$9+4|0;$19=HEAP32[(HEAP32[$16>>2]|0)+16>>2]|0;$20=$11+4|0;$23=HEAP32[(HEAP32[$20>>2]|0)+16>>2]|0;$24=$23+40|0;$26=$19+40|0;if(+HEAPF64[$24>>3]==+HEAPF64[$26>>3]){label=2;break}else{label=4;break};case 2:if(+HEAPF64[$23+48>>3]==+HEAPF64[$19+48>>3]){label=3;break}else{label=4;break};case 3:___assert_func(488,628,2264,72);return 0;case 4:$37=$tess+112|0;if(+___gl_edgeSign($19,HEAP32[$37>>2]|0,$13)>0.0){label=5;break}else{label=6;break};case 5:___assert_func(488,629,2264,8);return 0;case 6:if(+___gl_edgeSign($23,HEAP32[$37>>2]|0,$15)<0.0){label=7;break}else{label=8;break};case 7:___assert_func(488,630,2264,1608);return 0;case 8:$48=HEAP32[$37>>2]|0;if(($13|0)==($48|0)|($15|0)==($48|0)){label=9;break}else{label=10;break};case 9:___assert_func(488,631,2264,1528);return 0;case 10:if((HEAP32[$regUp+24>>2]|0)==0){label=11;break}else{label=12;break};case 11:if((HEAP32[$6+24>>2]|0)==0){label=13;break}else{label=12;break};case 12:___assert_func(488,632,2264,1448);return 0;case 13:if(($13|0)==($15|0)){$_0=0;label=81;break}else{label=14;break};case 14:$65=$13+48|0;$66=+HEAPF64[$65>>3];$67=$19+48|0;$68=+HEAPF64[$67>>3];$70=$15+48|0;$71=+HEAPF64[$70>>3];$72=$23+48|0;$73=+HEAPF64[$72>>3];if(($66>$68?$68:$66)>($71<$73?$73:$71)){$_0=0;label=81;break}else{label=15;break};case 15:$78=$13+40|0;$79=+HEAPF64[$78>>3];$80=$15+40|0;$81=+HEAPF64[$80>>3];if($79<$81){label=17;break}else{label=16;break};case 16:if($79!=$81|$66>$71){label=18;break}else{label=17;break};case 17:if(+___gl_edgeSign($23,$13,$15)>0.0){$_0=0;label=81;break}else{label=19;break};case 18:if(+___gl_edgeSign($19,$15,$13)<0.0){$_0=0;label=81;break}else{label=19;break};case 19:___gl_edgeIntersect($19,$13,$23,$15,$isect);$93=+HEAPF64[$65>>3];$94=+HEAPF64[$67>>3];$96=$isect+48|0;$97=+HEAPF64[$96>>3];if(($93>$94?$94:$93)>$97){label=20;break}else{label=21;break};case 20:___assert_func(488,651,2264,1352);return 0;case 21:$101=+HEAPF64[$70>>3];$102=+HEAPF64[$72>>3];if($97>($101<$102?$102:$101)){label=22;break}else{label=23;break};case 22:___assert_func(488,652,2264,1136);return 0;case 23:$107=+HEAPF64[$24>>3];$108=+HEAPF64[$26>>3];$110=$isect+40|0;$111=+HEAPF64[$110>>3];if(($107>$108?$108:$107)>$111){label=24;break}else{label=25;break};case 24:___assert_func(488,653,2264,1064);return 0;case 25:$115=+HEAPF64[$80>>3];$116=+HEAPF64[$78>>3];if($111>($115<$116?$116:$115)){label=26;break}else{label=27;break};case 26:___assert_func(488,654,2264,1008);return 0;case 27:$121=HEAP32[$37>>2]|0;$123=+HEAPF64[$121+40>>3];if($111<$123){label=30;break}else{label=28;break};case 28:if($111==$123){label=29;break}else{label=31;break};case 29:if($97>+HEAPF64[$121+48>>3]){label=31;break}else{label=30;break};case 30:HEAPF64[$110>>3]=+HEAPF64[(HEAP32[$37>>2]|0)+40>>3];HEAPF64[$96>>3]=+HEAPF64[(HEAP32[$37>>2]|0)+48>>3];label=31;break;case 31:$139=+HEAPF64[$78>>3];$140=+HEAPF64[$80>>3];if($139<$140){$150=$13;label=35;break}else{label=32;break};case 32:if($139==$140){label=33;break}else{label=34;break};case 33:if(+HEAPF64[$65>>3]>+HEAPF64[$70>>3]){label=34;break}else{$150=$13;label=35;break};case 34:$150=$15;label=35;break;case 35:$151=$150+40|0;$152=+HEAPF64[$151>>3];$153=+HEAPF64[$110>>3];if($152<$153){label=38;break}else{label=36;break};case 36:if($152==$153){label=37;break}else{label=39;break};case 37:if(+HEAPF64[$150+48>>3]>+HEAPF64[$96>>3]){label=39;break}else{label=38;break};case 38:HEAPF64[$110>>3]=+HEAPF64[$151>>3];HEAPF64[$96>>3]=+HEAPF64[$150+48>>3];label=39;break;case 39:if(+HEAPF64[$110>>3]==+HEAPF64[$78>>3]){label=40;break}else{label=41;break};case 40:if(+HEAPF64[$96>>3]==+HEAPF64[$65>>3]){label=43;break}else{label=41;break};case 41:if(+HEAPF64[$110>>3]==+HEAPF64[$80>>3]){label=42;break}else{label=44;break};case 42:if(+HEAPF64[$96>>3]==+HEAPF64[$70>>3]){label=43;break}else{label=44;break};case 43:_CheckForRightSplice($tess,$regUp)|0;$_0=0;label=81;break;case 44:$186=HEAP32[$37>>2]|0;if(+HEAPF64[$26>>3]==+HEAPF64[$186+40>>3]){label=45;break}else{label=46;break};case 45:if(+HEAPF64[$67>>3]==+HEAPF64[$186+48>>3]){label=47;break}else{label=46;break};case 46:if(+___gl_edgeSign($19,HEAP32[$37>>2]|0,$isect)<0.0){label=47;break}else{label=50;break};case 47:$201=HEAP32[$37>>2]|0;if(+HEAPF64[$24>>3]==+HEAPF64[$201+40>>3]){label=48;break}else{label=49;break};case 48:if(+HEAPF64[$72>>3]==+HEAPF64[$201+48>>3]){label=72;break}else{label=49;break};case 49:if(+___gl_edgeSign($23,HEAP32[$37>>2]|0,$isect)>0.0){label=72;break}else{label=50;break};case 50:$215=HEAP32[$37>>2]|0;if(($23|0)==($215|0)){label=51;break}else{label=58;break};case 51:if((___gl_meshSplitEdge(HEAP32[$16>>2]|0)|0)==0){label=52;break}else{label=53;break};case 52:_longjmp($tess+3384|0,1);return 0;case 53:if((___gl_meshSplice(HEAP32[$20>>2]|0,$9)|0)==0){label=54;break}else{label=55;break};case 54:_longjmp($tess+3384|0,1);return 0;case 55:$230=_TopLeftRegion($regUp)|0;if(($230|0)==0){label=56;break}else{label=57;break};case 56:_longjmp($tess+3384|0,1);return 0;case 57:$240=HEAP32[HEAP32[(HEAP32[$230+4>>2]|0)+8>>2]>>2]|0;$243=HEAP32[$240>>2]|0;_FinishLeftRegions($tess,$240,$6)|0;_AddRightEdges($tess,$230,HEAP32[(HEAP32[$243+4>>2]|0)+12>>2]|0,$243,$243,1);$_0=1;label=81;break;case 58:if(($19|0)==($215|0)){label=59;break}else{label=64;break};case 59:if((___gl_meshSplitEdge(HEAP32[$20>>2]|0)|0)==0){label=60;break}else{label=61;break};case 60:_longjmp($tess+3384|0,1);return 0;case 61:if((___gl_meshSplice(HEAP32[$9+12>>2]|0,HEAP32[(HEAP32[$20>>2]|0)+12>>2]|0)|0)==0){label=62;break}else{label=63;break};case 62:_longjmp($tess+3384|0,1);return 0;case 63:$268=_TopRightRegion($regUp)|0;$280=HEAP32[(HEAP32[(HEAP32[HEAP32[HEAP32[(HEAP32[$268+4>>2]|0)+8>>2]>>2]>>2]|0)+4>>2]|0)+8>>2]|0;HEAP32[$8>>2]=HEAP32[(HEAP32[$20>>2]|0)+12>>2];$286=HEAP32[(_FinishLeftRegions($tess,$regUp,0)|0)+8>>2]|0;_AddRightEdges($tess,$268,$286,HEAP32[(HEAP32[$16>>2]|0)+8>>2]|0,$280,1);$_0=1;label=81;break;case 64:if(+___gl_edgeSign($19,$215,$isect)<0.0){label=68;break}else{label=65;break};case 65:HEAP32[$regUp+20>>2]=1;HEAP32[(HEAP32[HEAP32[(HEAP32[$1>>2]|0)+4>>2]>>2]|0)+20>>2]=1;if((___gl_meshSplitEdge(HEAP32[$16>>2]|0)|0)==0){label=66;break}else{label=67;break};case 66:_longjmp($tess+3384|0,1);return 0;case 67:HEAPF64[(HEAP32[$12>>2]|0)+40>>3]=+HEAPF64[(HEAP32[$37>>2]|0)+40>>3];HEAPF64[(HEAP32[$12>>2]|0)+48>>3]=+HEAPF64[(HEAP32[$37>>2]|0)+48>>3];label=68;break;case 68:if(+___gl_edgeSign($23,HEAP32[$37>>2]|0,$isect)>0.0){$_0=0;label=81;break}else{label=69;break};case 69:HEAP32[$6+20>>2]=1;HEAP32[$regUp+20>>2]=1;if((___gl_meshSplitEdge(HEAP32[$20>>2]|0)|0)==0){label=70;break}else{label=71;break};case 70:_longjmp($tess+3384|0,1);return 0;case 71:HEAPF64[(HEAP32[$14>>2]|0)+40>>3]=+HEAPF64[(HEAP32[$37>>2]|0)+40>>3];HEAPF64[(HEAP32[$14>>2]|0)+48>>3]=+HEAPF64[(HEAP32[$37>>2]|0)+48>>3];$_0=0;label=81;break;case 72:if((___gl_meshSplitEdge(HEAP32[$16>>2]|0)|0)==0){label=73;break}else{label=74;break};case 73:_longjmp($tess+3384|0,1);return 0;case 74:if((___gl_meshSplitEdge(HEAP32[$20>>2]|0)|0)==0){label=75;break}else{label=76;break};case 75:_longjmp($tess+3384|0,1);return 0;case 76:if((___gl_meshSplice(HEAP32[(HEAP32[$20>>2]|0)+12>>2]|0,$9)|0)==0){label=77;break}else{label=78;break};case 77:_longjmp($tess+3384|0,1);return 0;case 78:HEAPF64[(HEAP32[$12>>2]|0)+40>>3]=+HEAPF64[$110>>3];HEAPF64[(HEAP32[$12>>2]|0)+48>>3]=+HEAPF64[$96>>3];$369=$tess+108|0;$373=___gl_pqSortInsert(HEAP32[$369>>2]|0,HEAP32[$12>>2]|0)|0;HEAP32[(HEAP32[$12>>2]|0)+56>>2]=$373;$376=HEAP32[$12>>2]|0;if((HEAP32[$376+56>>2]|0)==2147483647){label=79;break}else{label=80;break};case 79:___gl_pqSortDeletePriorityQ(HEAP32[$369>>2]|0);HEAP32[$369>>2]=0;_longjmp($tess+3384|0,1);return 0;case 80:_GetIntersectData($tess,$376,$13,$19,$15,$23);HEAP32[$6+20>>2]=1;HEAP32[$regUp+20>>2]=1;HEAP32[(HEAP32[HEAP32[(HEAP32[$1>>2]|0)+4>>2]>>2]|0)+20>>2]=1;$_0=0;label=81;break;case 81:STACKTOP=sp;return $_0|0}return 0}function _FixUpperEdge($reg,$newEdge){$reg=$reg|0;$newEdge=$newEdge|0;var $1=0,$6=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$reg+24|0;if((HEAP32[$1>>2]|0)==0){label=2;break}else{label=3;break};case 2:___assert_func(488,171,2168,728);return 0;case 3:$6=$reg|0;if((___gl_meshDelete(HEAP32[$6>>2]|0)|0)==0){$_0=0;label=5;break}else{label=4;break};case 4:HEAP32[$1>>2]=0;HEAP32[$6>>2]=$newEdge;HEAP32[$newEdge+24>>2]=$reg;$_0=1;label=5;break;case 5:return $_0|0}return 0}function _ConnectLeftDegenerate($tess,$regUp,$vEvent){$tess=$tess|0;$regUp=$regUp|0;$vEvent=$vEvent|0;var $2=0,$4=0,$7=0,$18=0,$21=0,$39=0,label=0;label=1;while(1)switch(label|0){case 1:$2=HEAP32[$regUp>>2]|0;$4=HEAP32[$2+16>>2]|0;$7=$vEvent+40|0;if(+HEAPF64[$4+40>>3]==+HEAPF64[$7>>3]){label=2;break}else{label=4;break};case 2:if(+HEAPF64[$4+48>>3]==+HEAPF64[$vEvent+48>>3]){label=3;break}else{label=4;break};case 3:___assert_func(488,957,2216,880);case 4:$18=$2+4|0;$21=HEAP32[(HEAP32[$18>>2]|0)+16>>2]|0;if(+HEAPF64[$21+40>>3]==+HEAPF64[$7>>3]){label=5;break}else{label=6;break};case 5:if(+HEAPF64[$21+48>>3]==+HEAPF64[$vEvent+48>>3]){label=15;break}else{label=6;break};case 6:if((___gl_meshSplitEdge(HEAP32[$18>>2]|0)|0)==0){label=7;break}else{label=8;break};case 7:_longjmp($tess+3384|0,1);case 8:$39=$regUp+24|0;if((HEAP32[$39>>2]|0)==0){label=12;break}else{label=9;break};case 9:if((___gl_meshDelete(HEAP32[$2+8>>2]|0)|0)==0){label=10;break}else{label=11;break};case 10:_longjmp($tess+3384|0,1);case 11:HEAP32[$39>>2]=0;label=12;break;case 12:if((___gl_meshSplice(HEAP32[$vEvent+8>>2]|0,$2)|0)==0){label=13;break}else{label=14;break};case 13:_longjmp($tess+3384|0,1);case 14:_SweepEvent($tess,$vEvent);return;case 15:___assert_func(488,978,2216,880)}}function _skip_vertex($v,$ctx){$v=$v|0;$ctx=$ctx|0;return}function _ComputeWinding($tess,$reg){$tess=$tess|0;$reg=$reg|0;var $14=0;$14=(HEAP32[(HEAP32[$reg>>2]|0)+28>>2]|0)+(HEAP32[(HEAP32[HEAP32[(HEAP32[$reg+4>>2]|0)+4>>2]>>2]|0)+8>>2]|0)|0;HEAP32[$reg+8>>2]=$14;HEAP32[$reg+12>>2]=_IsWindingInside($tess,$14)|0;return}function _EdgeLeq($tess,$reg1,$reg2){$tess=$tess|0;$reg1=$reg1|0;$reg2=$reg2|0;var $2=0,$4=0,$6=0,$7=0,$10=0,$12=0,$15=0,$16=0,$19=0,$20=0,$22=0.0,$23=0,$24=0,$26=0.0,$59=0,$64=0.0,$_0_in=0,label=0;label=1;while(1)switch(label|0){case 1:$2=HEAP32[$tess+112>>2]|0;$4=HEAP32[$reg1>>2]|0;$6=HEAP32[$reg2>>2]|0;$7=$4+4|0;$10=HEAP32[(HEAP32[$7>>2]|0)+16>>2]|0;$12=$6+4|0;$15=HEAP32[(HEAP32[$12>>2]|0)+16>>2]|0;$16=($15|0)==($2|0);if(($10|0)==($2|0)){label=2;break}else{label=9;break};case 2:if($16){label=3;break}else{label=8;break};case 3:$19=$4+16|0;$20=HEAP32[$19>>2]|0;$22=+HEAPF64[$20+40>>3];$23=$6+16|0;$24=HEAP32[$23>>2]|0;$26=+HEAPF64[$24+40>>3];if($22<$26){label=6;break}else{label=4;break};case 4:if($22==$26){label=5;break}else{label=7;break};case 5:if(+HEAPF64[$20+48>>3]>+HEAPF64[$24+48>>3]){label=7;break}else{label=6;break};case 6:$_0_in=+___gl_edgeSign(HEAP32[(HEAP32[$12>>2]|0)+16>>2]|0,HEAP32[$19>>2]|0,HEAP32[$23>>2]|0)<=0.0;label=12;break;case 7:$_0_in=+___gl_edgeSign(HEAP32[(HEAP32[$7>>2]|0)+16>>2]|0,HEAP32[$23>>2]|0,HEAP32[$19>>2]|0)>=0.0;label=12;break;case 8:$_0_in=+___gl_edgeSign($15,$2,HEAP32[$6+16>>2]|0)<=0.0;label=12;break;case 9:$59=HEAP32[$4+16>>2]|0;if($16){label=10;break}else{label=11;break};case 10:$_0_in=+___gl_edgeSign($10,$2,$59)>=0.0;label=12;break;case 11:$64=+___gl_edgeEval($10,$2,$59);$_0_in=$64>=+___gl_edgeEval(HEAP32[(HEAP32[$12>>2]|0)+16>>2]|0,$2,HEAP32[$6+16>>2]|0);label=12;break;case 12:return $_0_in&1|0}return 0}function ___gl_meshTessellateInterior($mesh){$mesh=$mesh|0;var $1=0,$3=0,$f_06=0,$6=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$mesh+64|0;$3=HEAP32[$1>>2]|0;if(($3|0)==($1|0)){$_0=1;label=5;break}else{$f_06=$3;label=2;break};case 2:$6=HEAP32[$f_06>>2]|0;if((HEAP32[$f_06+24>>2]|0)==0){label=4;break}else{label=3;break};case 3:if((___gl_meshTessellateMonoRegion($f_06)|0)==0){$_0=0;label=5;break}else{label=4;break};case 4:if(($6|0)==($1|0)){$_0=1;label=5;break}else{$f_06=$6;label=2;break};case 5:return $_0|0}return 0}function ___gl_meshDiscardExterior($mesh){$mesh=$mesh|0;var $1=0,$3=0,$f_05=0,$6=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$mesh+64|0;$3=HEAP32[$1>>2]|0;if(($3|0)==($1|0)){label=5;break}else{$f_05=$3;label=2;break};case 2:$6=HEAP32[$f_05>>2]|0;if((HEAP32[$f_05+24>>2]|0)==0){label=4;break}else{label=3;break};case 3:if(($6|0)==($1|0)){label=5;break}else{$f_05=$6;label=2;break};case 4:___gl_meshZapFace($f_05);label=3;break;case 5:return}}function ___gl_meshSetWindingNumber($mesh,$value,$keepOnlyBoundary){$mesh=$mesh|0;$value=$value|0;$keepOnlyBoundary=$keepOnlyBoundary|0;var $1=0,$3=0,$e_011=0,$9=0,$19=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$mesh+92|0;$3=HEAP32[$1>>2]|0;if(($3|0)==($1|0)){$_0=1;label=9;break}else{label=2;break};case 2:$e_011=$3;label=3;break;case 3:$9=HEAP32[$e_011>>2]|0;$19=HEAP32[(HEAP32[$e_011+20>>2]|0)+24>>2]|0;if((HEAP32[(HEAP32[(HEAP32[$e_011+4>>2]|0)+20>>2]|0)+24>>2]|0)==($19|0)){label=5;break}else{label=4;break};case 4:HEAP32[$e_011+28>>2]=($19|0)!=0?$value:-$value|0;label=8;break;case 5:if(($keepOnlyBoundary|0)==0){label=6;break}else{label=7;break};case 6:HEAP32[$e_011+28>>2]=0;label=8;break;case 7:if((___gl_meshDelete($e_011)|0)==0){$_0=0;label=9;break}else{label=8;break};case 8:if(($9|0)==($1|0)){$_0=1;label=9;break}else{$e_011=$9;label=3;break};case 9:return $_0|0}return 0}function _new_tess_context(){var $1=0;$1=_malloc(32)|0;_memset($1|0,0,20);HEAP32[$1+28>>2]=8;HEAP32[$1+24>>2]=0;return $1|0}function _destroy_tess_context($ctx){$ctx=$ctx|0;_free($ctx);return}function _new_vertex($ctx,$x,$y){$ctx=$ctx|0;$x=+$x;$y=+$y;var $1=0,$2=0,$3=0,$12=0,label=0;label=1;while(1)switch(label|0){case 1:$1=_malloc(32)|0;$2=$1;$3=$ctx+16|0;HEAP32[$1+28>>2]=HEAP32[$3>>2];HEAPF64[$1>>3]=$x;HEAPF64[$1+8>>3]=$y;HEAPF64[$1+16>>3]=0.0;$12=HEAP32[$3>>2]|0;if(($12|0)==0){label=2;break}else{label=3;break};case 2:HEAP32[$1+24>>2]=0;label=4;break;case 3:HEAP32[$1+24>>2]=(HEAP32[$12+24>>2]|0)+1;label=4;break;case 4:HEAP32[$3>>2]=$2;return $2|0}return 0}function _new_triangle($ctx,$v1,$v2,$v3){$ctx=$ctx|0;$v1=$v1|0;$v2=$v2|0;$v3=$v3|0;var $1=0,$2=0,$3=0,$12=0;$1=_malloc(16)|0;$2=$1;$3=$ctx|0;HEAP32[$1+12>>2]=HEAP32[$3>>2];HEAP32[$1>>2]=$v1;HEAP32[$1+4>>2]=$v2;HEAP32[$1+8>>2]=$v3;$12=$ctx+4|0;HEAP32[$12>>2]=(HEAP32[$12>>2]|0)+1;HEAP32[$3>>2]=$2;return $2|0}function _fan_vertex($v,$ctx){$v=$v|0;$ctx=$ctx|0;var $1=0,$2=0,$6=0,$7=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ctx+12|0;$2=HEAP32[$1>>2]|0;if(($2|0)==0){label=2;break}else{label=3;break};case 2:HEAP32[$1>>2]=$v;label=6;break;case 3:$6=$ctx+8|0;$7=HEAP32[$6>>2]|0;if(($7|0)==0){label=4;break}else{label=5;break};case 4:HEAP32[$6>>2]=$v;label=6;break;case 5:_new_triangle($ctx,HEAP32[$2+24>>2]|0,HEAP32[$7+24>>2]|0,HEAP32[$v+24>>2]|0)|0;HEAP32[$6>>2]=$v;label=6;break;case 6:return}}function _strip_vertex($v,$ctx){$v=$v|0;$ctx=$ctx|0;var $1=0,$2=0,$6=0,$7=0,$11=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ctx+8|0;$2=HEAP32[$1>>2]|0;if(($2|0)==0){label=2;break}else{label=3;break};case 2:HEAP32[$1>>2]=$v;label=9;break;case 3:$6=$ctx+12|0;$7=HEAP32[$6>>2]|0;if(($7|0)==0){label=4;break}else{label=5;break};case 4:HEAP32[$6>>2]=$v;label=9;break;case 5:$11=$ctx+24|0;if((HEAP32[$11>>2]|0)==0){label=7;break}else{label=6;break};case 6:_new_triangle($ctx,HEAP32[$7+24>>2]|0,HEAP32[$2+24>>2]|0,HEAP32[$v+24>>2]|0)|0;label=8;break;case 7:_new_triangle($ctx,HEAP32[$2+24>>2]|0,HEAP32[$7+24>>2]|0,HEAP32[$v+24>>2]|0)|0;label=8;break;case 8:HEAP32[$11>>2]=(HEAP32[$11>>2]|0)==0;HEAP32[$1>>2]=HEAP32[$6>>2];HEAP32[$6>>2]=$v;label=9;break;case 9:return}}function _triangle_vertex($v,$ctx){$v=$v|0;$ctx=$ctx|0;var $1=0,$2=0,$6=0,$7=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ctx+12|0;$2=HEAP32[$1>>2]|0;if(($2|0)==0){label=2;break}else{label=3;break};case 2:HEAP32[$1>>2]=$v;label=6;break;case 3:$6=$ctx+8|0;$7=HEAP32[$6>>2]|0;if(($7|0)==0){label=4;break}else{label=5;break};case 4:HEAP32[$6>>2]=$v;label=6;break;case 5:_new_triangle($ctx,HEAP32[$2+24>>2]|0,HEAP32[$7+24>>2]|0,HEAP32[$v+24>>2]|0)|0;HEAP32[$1>>2]=0;HEAP32[$6>>2]=0;label=6;break;case 6:return}}function _vertex($vertex_data,$poly_data){$vertex_data=$vertex_data|0;$poly_data=$poly_data|0;FUNCTION_TABLE_vii[HEAP32[$poly_data+28>>2]&127]($vertex_data,$poly_data);return}function _begin($which,$poly_data){$which=$which|0;$poly_data=$poly_data|0;var label=0,tempVarArgs=0,sp=0;sp=STACKTOP;label=1;while(1)switch(label|0){case 1:HEAP32[$poly_data+12>>2]=0;HEAP32[$poly_data+8>>2]=0;HEAP32[$poly_data+24>>2]=0;if(($which|0)==4){label=2;break}else if(($which|0)==5){label=3;break}else if(($which|0)==6){label=4;break}else{label=5;break};case 2:HEAP32[$poly_data+28>>2]=18;label=6;break;case 3:HEAP32[$poly_data+28>>2]=54;label=6;break;case 4:HEAP32[$poly_data+28>>2]=36;label=6;break;case 5:_fprintf(HEAP32[_stderr>>2]|0,152,(tempVarArgs=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempVarArgs>>2]=$which,tempVarArgs)|0)|0;STACKTOP=tempVarArgs;HEAP32[$poly_data+28>>2]=8;label=6;break;case 6:STACKTOP=sp;return}}function _combine($newVertex,$neighborVertex,$neighborWeight,$outData,$polyData){$newVertex=$newVertex|0;$neighborVertex=$neighborVertex|0;$neighborWeight=$neighborWeight|0;$outData=$outData|0;$polyData=$polyData|0;HEAP32[$outData>>2]=_new_vertex($polyData,+HEAPF64[$newVertex>>3],+HEAPF64[$newVertex+8>>3])|0;return}function _AddSentinel($tess,$t){$tess=$tess|0;$t=+$t;var $1=0,$8=0,$13=0,$18=0,$43=0,$45=0,label=0;label=1;while(1)switch(label|0){case 1:$1=_malloc(28)|0;if(($1|0)==0){label=2;break}else{label=3;break};case 2:_longjmp($tess+3384|0,1);case 3:$8=___gl_meshMakeEdge(HEAP32[$tess+8>>2]|0)|0;if(($8|0)==0){label=4;break}else{label=5;break};case 4:_longjmp($tess+3384|0,1);case 5:$13=$8+16|0;HEAPF64[(HEAP32[$13>>2]|0)+40>>3]=4.0e+150;HEAPF64[(HEAP32[$13>>2]|0)+48>>3]=$t;$18=$8+4|0;HEAPF64[(HEAP32[(HEAP32[$18>>2]|0)+16>>2]|0)+40>>3]=-4.0e+150;HEAPF64[(HEAP32[(HEAP32[$18>>2]|0)+16>>2]|0)+48>>3]=$t;HEAP32[$tess+112>>2]=HEAP32[(HEAP32[$18>>2]|0)+16>>2];HEAP32[$1>>2]=$8;HEAP32[$1+8>>2]=0;HEAP32[$1+12>>2]=0;HEAP32[$1+24>>2]=0;HEAP32[$1+16>>2]=1;HEAP32[$1+20>>2]=0;$43=HEAP32[$tess+104>>2]|0;$45=___gl_dictListInsertBefore($43,$43|0,$1)|0;HEAP32[$1+4>>2]=$45;if(($45|0)==0){label=6;break}else{label=7;break};case 6:_longjmp($tess+3384|0,1);case 7:return}}function ___gl_meshTessellateMonoRegion($face){$face=$face|0;var $2=0,$4=0,$up_0=0,$14=0,$16=0.0,$18=0,$20=0.0,$up_1=0,$35=0,$37=0.0,$41=0,$43=0.0,$58=0,$up_2_ph101=0,$lo_0_ph100=0,$63=0,$up_288=0,$68=0,$70=0.0,$71=0,$73=0.0,$83=0,$84=0,$88=0,$89=0,$lo_182=0,$93=0,$95=0.0,$97=0,$99=0.0,$124=0,$128=0,$129=0,$130=0,$lo_1_lcssa=0,$135=0,$up_375=0,$139=0,$142=0,$144=0,$146=0.0,$150=0,$152=0.0,$179=0,$183=0,$up_3_lcssa=0,$187=0,$lo_0_ph96=0,$up_2_lcssa=0,$195=0,$200=0,$lo_271=0,$201=0,$205=0,$207=0,$_0=0,label=0;label=1;while(1)switch(label|0){case 1:$2=HEAP32[$face+8>>2]|0;$4=HEAP32[$2+12>>2]|0;if(($4|0)==($2|0)){label=3;break}else{label=2;break};case 2:if((HEAP32[$4+12>>2]|0)==($2|0)){label=3;break}else{$up_0=$2;label=4;break};case 3:___assert_func(288,82,1944,944);return 0;case 4:$14=HEAP32[(HEAP32[$up_0+4>>2]|0)+16>>2]|0;$16=+HEAPF64[$14+40>>3];$18=HEAP32[$up_0+16>>2]|0;$20=+HEAPF64[$18+40>>3];if($16<$20){label=7;break}else{label=5;break};case 5:if($16==$20){label=6;break}else{$up_1=$up_0;label=8;break};case 6:if(+HEAPF64[$14+48>>3]>+HEAPF64[$18+48>>3]){$up_1=$up_0;label=8;break}else{label=7;break};case 7:$up_0=HEAP32[(HEAP32[$up_0+8>>2]|0)+4>>2]|0;label=4;break;case 8:$35=HEAP32[$up_1+16>>2]|0;$37=+HEAPF64[$35+40>>3];$41=HEAP32[(HEAP32[$up_1+4>>2]|0)+16>>2]|0;$43=+HEAPF64[$41+40>>3];if($37<$43){label=11;break}else{label=9;break};case 9:if($37==$43){label=10;break}else{label=12;break};case 10:if(+HEAPF64[$35+48>>3]>+HEAPF64[$41+48>>3]){label=12;break}else{label=11;break};case 11:$up_1=HEAP32[$up_1+12>>2]|0;label=8;break;case 12:$58=HEAP32[(HEAP32[$up_1+8>>2]|0)+4>>2]|0;if((HEAP32[$up_1+12>>2]|0)==($58|0)){$up_2_lcssa=$up_1;$lo_0_ph96=$58;label=33;break}else{$lo_0_ph100=$58;$up_2_ph101=$up_1;label=13;break};case 13:$63=$lo_0_ph100+12|0;$up_288=$up_2_ph101;label=14;break;case 14:$68=HEAP32[(HEAP32[$up_288+4>>2]|0)+16>>2]|0;$70=+HEAPF64[$68+40>>3];$71=HEAP32[$lo_0_ph100+16>>2]|0;$73=+HEAPF64[$71+40>>3];if($70<$73){label=17;break}else{label=15;break};case 15:if($70==$73){label=16;break}else{label=18;break};case 16:if(+HEAPF64[$68+48>>3]>+HEAPF64[$71+48>>3]){label=18;break}else{label=17;break};case 17:$83=$lo_0_ph100+12|0;$84=HEAP32[$83>>2]|0;if(($84|0)==($up_288|0)){$lo_1_lcssa=$lo_0_ph100;label=25;break}else{$lo_182=$lo_0_ph100;$89=$83;$88=$84;label=19;break};case 18:if((HEAP32[$63>>2]|0)==($up_288|0)){$up_3_lcssa=$up_288;label=32;break}else{$up_375=$up_288;label=26;break};case 19:$93=HEAP32[(HEAP32[$88+4>>2]|0)+16>>2]|0;$95=+HEAPF64[$93+40>>3];$97=HEAP32[$88+16>>2]|0;$99=+HEAPF64[$97+40>>3];if($95<$99){label=23;break}else{label=20;break};case 20:if($95==$99){label=21;break}else{label=22;break};case 21:if(+HEAPF64[$93+48>>3]>+HEAPF64[$97+48>>3]){label=22;break}else{label=23;break};case 22:if(+___gl_edgeSign(HEAP32[$lo_182+16>>2]|0,HEAP32[(HEAP32[$lo_182+4>>2]|0)+16>>2]|0,HEAP32[(HEAP32[(HEAP32[$89>>2]|0)+4>>2]|0)+16>>2]|0)>0.0){$lo_1_lcssa=$lo_182;label=25;break}else{label=23;break};case 23:$124=___gl_meshConnect(HEAP32[$89>>2]|0,$lo_182)|0;if(($124|0)==0){$_0=0;label=38;break}else{label=24;break};case 24:$128=HEAP32[$124+4>>2]|0;$129=$128+12|0;$130=HEAP32[$129>>2]|0;if(($130|0)==($up_288|0)){$lo_1_lcssa=$128;label=25;break}else{$lo_182=$128;$89=$129;$88=$130;label=19;break};case 25:$135=HEAP32[(HEAP32[$lo_1_lcssa+8>>2]|0)+4>>2]|0;if((HEAP32[$up_288+12>>2]|0)==($135|0)){$up_2_lcssa=$up_288;$lo_0_ph96=$135;label=33;break}else{$lo_0_ph100=$135;$up_2_ph101=$up_288;label=13;break};case 26:$139=$up_375+8|0;$142=HEAP32[(HEAP32[$139>>2]|0)+4>>2]|0;$144=HEAP32[$142+16>>2]|0;$146=+HEAPF64[$144+40>>3];$150=HEAP32[(HEAP32[$142+4>>2]|0)+16>>2]|0;$152=+HEAPF64[$150+40>>3];if($146<$152){label=30;break}else{label=27;break};case 27:if($146==$152){label=28;break}else{label=29;break};case 28:if(+HEAPF64[$144+48>>3]>+HEAPF64[$150+48>>3]){label=29;break}else{label=30;break};case 29:if(+___gl_edgeSign(HEAP32[(HEAP32[$up_375+4>>2]|0)+16>>2]|0,HEAP32[$up_375+16>>2]|0,HEAP32[(HEAP32[(HEAP32[$139>>2]|0)+4>>2]|0)+16>>2]|0)<0.0){$up_3_lcssa=$up_375;label=32;break}else{label=30;break};case 30:$179=___gl_meshConnect($up_375,HEAP32[(HEAP32[$139>>2]|0)+4>>2]|0)|0;if(($179|0)==0){$_0=0;label=38;break}else{label=31;break};case 31:$183=HEAP32[$179+4>>2]|0;if((HEAP32[$63>>2]|0)==($183|0)){$up_3_lcssa=$183;label=32;break}else{$up_375=$183;label=26;break};case 32:$187=HEAP32[$up_3_lcssa+12>>2]|0;if((HEAP32[$187+12>>2]|0)==($lo_0_ph100|0)){$up_2_lcssa=$187;$lo_0_ph96=$lo_0_ph100;label=33;break}else{$up_288=$187;label=14;break};case 33:if((HEAP32[$lo_0_ph96+12>>2]|0)==($up_2_lcssa|0)){label=35;break}else{label=34;break};case 34:$195=HEAP32[$lo_0_ph96+12>>2]|0;if((HEAP32[$195+12>>2]|0)==($up_2_lcssa|0)){$_0=1;label=38;break}else{$lo_271=$lo_0_ph96;$200=$195;label=36;break};case 35:___assert_func(288,118,1944,712);return 0;case 36:$201=___gl_meshConnect($200,$lo_271)|0;if(($201|0)==0){$_0=0;label=38;break}else{label=37;break};case 37:$205=HEAP32[$201+4>>2]|0;$207=HEAP32[$205+12>>2]|0;if((HEAP32[$207+12>>2]|0)==($up_2_lcssa|0)){$_0=1;label=38;break}else{$lo_271=$205;$200=$207;label=36;break};case 38:return $_0|0}return 0}function _write_output($ctx,$coordinates_out,$tris_out,$vc,$tc){$ctx=$ctx|0;$coordinates_out=$coordinates_out|0;$tris_out=$tris_out|0;$vc=$vc|0;$tc=$tc|0;var $1=0,$5=0,$6=0,$7=0,$11=0,$17=0,$_pr=0,$19=0,$20=0,$22=0,$30=0,$39=0,$41=0,$44=0,$n_tris_copy_033=0,$47=0,$63=0,$65=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$ctx+16|0;$5=(HEAP32[(HEAP32[$1>>2]|0)+24>>2]|0)+1|0;HEAP32[$vc>>2]=$5;$6=$ctx+4|0;$7=HEAP32[$6>>2]|0;HEAP32[$tc>>2]=$7;HEAP32[$coordinates_out>>2]=_malloc($5<<4)|0;$11=HEAP32[$6>>2]|0;if(($11|0)==0){$17=0;label=3;break}else{label=2;break};case 2:$17=_malloc($11*12|0)|0;label=3;break;case 3:HEAP32[$tris_out>>2]=$17;$_pr=HEAP32[$1>>2]|0;if(($_pr|0)==0){label=4;break}else{$22=$_pr;label=5;break};case 4:$19=$ctx|0;$20=HEAP32[$19>>2]|0;if(($20|0)==0){label=7;break}else{$n_tris_copy_033=$7;$44=$20;label=6;break};case 5:HEAPF64[(HEAP32[$coordinates_out>>2]|0)+(HEAP32[$22+24>>2]<<1<<3)>>3]=+HEAPF64[$22>>3];$30=HEAP32[$1>>2]|0;HEAPF64[(HEAP32[$coordinates_out>>2]|0)+((HEAP32[$30+24>>2]<<1|1)<<3)>>3]=+HEAPF64[$30+8>>3];$39=HEAP32[$1>>2]|0;$41=HEAP32[$39+28>>2]|0;_free($39);HEAP32[$1>>2]=$41;if(($41|0)==0){label=4;break}else{$22=$41;label=5;break};case 6:$47=$n_tris_copy_033*3|0;HEAP32[(HEAP32[$tris_out>>2]|0)+($47-3<<2)>>2]=HEAP32[$44>>2];HEAP32[(HEAP32[$tris_out>>2]|0)+($47-2<<2)>>2]=HEAP32[(HEAP32[$19>>2]|0)+4>>2];HEAP32[(HEAP32[$tris_out>>2]|0)+($47-1<<2)>>2]=HEAP32[(HEAP32[$19>>2]|0)+8>>2];$63=HEAP32[$19>>2]|0;$65=HEAP32[$63+12>>2]|0;_free($63);HEAP32[$19>>2]=$65;if(($65|0)==0){label=7;break}else{$n_tris_copy_033=$n_tris_copy_033-1|0;$44=$65;label=6;break};case 7:return}}function _tessellate($verts,$nverts,$tris,$ntris,$contoursbegin,$contoursend){$verts=$verts|0;$nverts=$nverts|0;$tris=$tris|0;$ntris=$ntris|0;$contoursbegin=$contoursbegin|0;$contoursend=$contoursend|0;var $1=0,$2=0,$_0=0,$6=0,$7=0,$8=0,$contourbegin_024=0,$13=0,$14=0,label=0;label=1;while(1)switch(label|0){case 1:$1=_gluNewTess()|0;$2=_new_tess_context()|0;_gluTessProperty($1,100140,100131.0);_gluTessCallback($1,100107,62);_gluTessCallback($1,100106,4);_gluTessCallback($1,100111,56);_gluTessBeginPolygon($1,$2);$_0=$contoursbegin;label=2;break;case 2:$6=$_0+4|0;$7=HEAP32[$_0>>2]|0;$8=HEAP32[$6>>2]|0;_gluTessBeginContour($1);if(($7|0)==($8|0)){label=4;break}else{$contourbegin_024=$7;label=3;break};case 3:$13=_new_vertex($2,+HEAPF64[$contourbegin_024>>3],+HEAPF64[$contourbegin_024+8>>3])|0;$14=$contourbegin_024+16|0;_gluTessVertex($1,$13|0,$13);if(($14|0)==($8|0)){label=4;break}else{$contourbegin_024=$14;label=3;break};case 4:_gluTessEndContour($1);if(($6|0)==($contoursend-4|0)){label=5;break}else{$_0=$6;label=2;break};case 5:_gluTessEndPolygon($1);_write_output($2,$verts,$tris,$nverts,$ntris);_destroy_tess_context($2);_gluDeleteTess($1);return}}function _malloc($bytes){$bytes=$bytes|0;var $8=0,$9=0,$10=0,$11=0,$17=0,$18=0,$20=0,$21=0,$22=0,$23=0,$24=0,$35=0,$40=0,$45=0,$56=0,$59=0,$62=0,$64=0,$65=0,$67=0,$69=0,$71=0,$73=0,$75=0,$77=0,$79=0,$82=0,$83=0,$85=0,$86=0,$87=0,$88=0,$89=0,$100=0,$105=0,$106=0,$109=0,$117=0,$120=0,$121=0,$122=0,$124=0,$125=0,$126=0,$132=0,$133=0,$_pre_phi=0,$F4_0=0,$145=0,$150=0,$152=0,$153=0,$155=0,$157=0,$159=0,$161=0,$163=0,$165=0,$167=0,$172=0,$rsize_0_i=0,$v_0_i=0,$t_0_i=0,$179=0,$183=0,$185=0,$189=0,$190=0,$192=0,$193=0,$196=0,$201=0,$203=0,$207=0,$211=0,$215=0,$220=0,$221=0,$224=0,$225=0,$RP_0_i=0,$R_0_i=0,$227=0,$228=0,$231=0,$232=0,$R_1_i=0,$242=0,$244=0,$258=0,$274=0,$286=0,$300=0,$304=0,$315=0,$318=0,$319=0,$320=0,$322=0,$323=0,$324=0,$330=0,$331=0,$_pre_phi_i=0,$F1_0_i=0,$342=0,$348=0,$349=0,$350=0,$353=0,$354=0,$361=0,$362=0,$365=0,$367=0,$370=0,$375=0,$idx_0_i=0,$383=0,$391=0,$rst_0_i=0,$sizebits_0_i=0,$t_0_i116=0,$rsize_0_i117=0,$v_0_i118=0,$396=0,$397=0,$rsize_1_i=0,$v_1_i=0,$403=0,$406=0,$rst_1_i=0,$t_1_i=0,$rsize_2_i=0,$v_2_i=0,$414=0,$417=0,$422=0,$424=0,$425=0,$427=0,$429=0,$431=0,$433=0,$435=0,$437=0,$439=0,$t_2_ph_i=0,$v_330_i=0,$rsize_329_i=0,$t_228_i=0,$449=0,$450=0,$_rsize_3_i=0,$t_2_v_3_i=0,$452=0,$455=0,$v_3_lcssa_i=0,$rsize_3_lcssa_i=0,$463=0,$464=0,$467=0,$468=0,$472=0,$474=0,$478=0,$482=0,$486=0,$491=0,$492=0,$495=0,$496=0,$RP_0_i119=0,$R_0_i120=0,$498=0,$499=0,$502=0,$503=0,$R_1_i122=0,$513=0,$515=0,$529=0,$545=0,$557=0,$571=0,$575=0,$586=0,$589=0,$591=0,$592=0,$593=0,$599=0,$600=0,$_pre_phi_i128=0,$F5_0_i=0,$612=0,$613=0,$620=0,$621=0,$624=0,$626=0,$629=0,$634=0,$I7_0_i=0,$641=0,$648=0,$649=0,$668=0,$T_0_i=0,$K12_0_i=0,$677=0,$678=0,$694=0,$695=0,$697=0,$711=0,$nb_0=0,$714=0,$717=0,$718=0,$721=0,$736=0,$743=0,$746=0,$747=0,$748=0,$762=0,$772=0,$773=0,$774=0,$775=0,$776=0,$779=0,$782=0,$783=0,$791=0,$794=0,$sp_0_i_i=0,$796=0,$797=0,$800=0,$806=0,$809=0,$812=0,$813=0,$814=0,$ssize_0_i=0,$824=0,$825=0,$829=0,$835=0,$836=0,$840=0,$843=0,$847=0,$ssize_1_i=0,$br_0_i=0,$tsize_0_i=0,$tbase_0_i=0,$856=0,$860=0,$ssize_2_i=0,$tsize_0303639_i=0,$tsize_1_i=0,$876=0,$877=0,$881=0,$883=0,$_tbase_1_i=0,$tbase_245_i=0,$tsize_244_i=0,$886=0,$890=0,$893=0,$i_02_i_i=0,$899=0,$901=0,$904=0,$908=0,$914=0,$917=0,$sp_067_i=0,$925=0,$926=0,$927=0,$932=0,$939=0,$944=0,$946=0,$947=0,$949=0,$955=0,$958=0,$sp_160_i=0,$970=0,$975=0,$982=0,$986=0,$993=0,$996=0,$1003=0,$1004=0,$1005=0,$_sum_i21_i=0,$1009=0,$1010=0,$1011=0,$1019=0,$1028=0,$_sum2_i23_i=0,$1037=0,$1041=0,$1042=0,$1047=0,$1050=0,$1053=0,$1076=0,$_pre_phi57_i_i=0,$1081=0,$1084=0,$1087=0,$1092=0,$1097=0,$1101=0,$_sum67_i_i=0,$1107=0,$1108=0,$1112=0,$1113=0,$RP_0_i_i=0,$R_0_i_i=0,$1115=0,$1116=0,$1119=0,$1120=0,$R_1_i_i=0,$1132=0,$1134=0,$1148=0,$_sum3233_i_i=0,$1165=0,$1178=0,$qsize_0_i_i=0,$oldfirst_0_i_i=0,$1194=0,$1202=0,$1205=0,$1207=0,$1208=0,$1209=0,$1215=0,$1216=0,$_pre_phi_i25_i=0,$F4_0_i_i=0,$1228=0,$1229=0,$1236=0,$1237=0,$1240=0,$1242=0,$1245=0,$1250=0,$I7_0_i_i=0,$1257=0,$1264=0,$1265=0,$1284=0,$T_0_i27_i=0,$K8_0_i_i=0,$1293=0,$1294=0,$1310=0,$1311=0,$1313=0,$1327=0,$sp_0_i_i_i=0,$1330=0,$1334=0,$1335=0,$1341=0,$1348=0,$1349=0,$1353=0,$1354=0,$1358=0,$1364=0,$1367=0,$1377=0,$1380=0,$1381=0,$1389=0,$1392=0,$1398=0,$1401=0,$1403=0,$1404=0,$1405=0,$1411=0,$1412=0,$_pre_phi_i_i=0,$F_0_i_i=0,$1422=0,$1423=0,$1430=0,$1431=0,$1434=0,$1436=0,$1439=0,$1444=0,$I1_0_i_i=0,$1451=0,$1455=0,$1456=0,$1471=0,$T_0_i_i=0,$K2_0_i_i=0,$1480=0,$1481=0,$1494=0,$1495=0,$1497=0,$1507=0,$1510=0,$1511=0,$1512=0,$mem_0=0,label=0;label=1;while(1)switch(label|0){case 1:if($bytes>>>0<245){label=2;break}else{label=78;break};case 2:if($bytes>>>0<11){$8=16;label=4;break}else{label=3;break};case 3:$8=$bytes+11&-8;label=4;break;case 4:$9=$8>>>3;$10=HEAP32[586]|0;$11=$10>>>($9>>>0);if(($11&3|0)==0){label=12;break}else{label=5;break};case 5:$17=($11&1^1)+$9|0;$18=$17<<1;$20=2384+($18<<2)|0;$21=2384+($18+2<<2)|0;$22=HEAP32[$21>>2]|0;$23=$22+8|0;$24=HEAP32[$23>>2]|0;if(($20|0)==($24|0)){label=6;break}else{label=7;break};case 6:HEAP32[586]=$10&~(1<<$17);label=11;break;case 7:if($24>>>0<(HEAP32[590]|0)>>>0){label=10;break}else{label=8;break};case 8:$35=$24+12|0;if((HEAP32[$35>>2]|0)==($22|0)){label=9;break}else{label=10;break};case 9:HEAP32[$35>>2]=$20;HEAP32[$21>>2]=$24;label=11;break;case 10:_abort();return 0;return 0;case 11:$40=$17<<3;HEAP32[$22+4>>2]=$40|3;$45=$22+($40|4)|0;HEAP32[$45>>2]=HEAP32[$45>>2]|1;$mem_0=$23;label=341;break;case 12:if($8>>>0>(HEAP32[588]|0)>>>0){label=13;break}else{$nb_0=$8;label=160;break};case 13:if(($11|0)==0){label=27;break}else{label=14;break};case 14:$56=2<<$9;$59=$11<<$9&($56|-$56);$62=($59&-$59)-1|0;$64=$62>>>12&16;$65=$62>>>($64>>>0);$67=$65>>>5&8;$69=$65>>>($67>>>0);$71=$69>>>2&4;$73=$69>>>($71>>>0);$75=$73>>>1&2;$77=$73>>>($75>>>0);$79=$77>>>1&1;$82=($67|$64|$71|$75|$79)+($77>>>($79>>>0))|0;$83=$82<<1;$85=2384+($83<<2)|0;$86=2384+($83+2<<2)|0;$87=HEAP32[$86>>2]|0;$88=$87+8|0;$89=HEAP32[$88>>2]|0;if(($85|0)==($89|0)){label=15;break}else{label=16;break};case 15:HEAP32[586]=$10&~(1<<$82);label=20;break;case 16:if($89>>>0<(HEAP32[590]|0)>>>0){label=19;break}else{label=17;break};case 17:$100=$89+12|0;if((HEAP32[$100>>2]|0)==($87|0)){label=18;break}else{label=19;break};case 18:HEAP32[$100>>2]=$85;HEAP32[$86>>2]=$89;label=20;break;case 19:_abort();return 0;return 0;case 20:$105=$82<<3;$106=$105-$8|0;HEAP32[$87+4>>2]=$8|3;$109=$87;HEAP32[$109+($8|4)>>2]=$106|1;HEAP32[$109+$105>>2]=$106;$117=HEAP32[588]|0;if(($117|0)==0){label=26;break}else{label=21;break};case 21:$120=HEAP32[591]|0;$121=$117>>>3;$122=$121<<1;$124=2384+($122<<2)|0;$125=HEAP32[586]|0;$126=1<<$121;if(($125&$126|0)==0){label=22;break}else{label=23;break};case 22:HEAP32[586]=$125|$126;$F4_0=$124;$_pre_phi=2384+($122+2<<2)|0;label=25;break;case 23:$132=2384+($122+2<<2)|0;$133=HEAP32[$132>>2]|0;if($133>>>0<(HEAP32[590]|0)>>>0){label=24;break}else{$F4_0=$133;$_pre_phi=$132;label=25;break};case 24:_abort();return 0;return 0;case 25:HEAP32[$_pre_phi>>2]=$120;HEAP32[$F4_0+12>>2]=$120;HEAP32[$120+8>>2]=$F4_0;HEAP32[$120+12>>2]=$124;label=26;break;case 26:HEAP32[588]=$106;HEAP32[591]=$109+$8;$mem_0=$88;label=341;break;case 27:$145=HEAP32[587]|0;if(($145|0)==0){$nb_0=$8;label=160;break}else{label=28;break};case 28:$150=($145&-$145)-1|0;$152=$150>>>12&16;$153=$150>>>($152>>>0);$155=$153>>>5&8;$157=$153>>>($155>>>0);$159=$157>>>2&4;$161=$157>>>($159>>>0);$163=$161>>>1&2;$165=$161>>>($163>>>0);$167=$165>>>1&1;$172=HEAP32[2648+(($155|$152|$159|$163|$167)+($165>>>($167>>>0))<<2)>>2]|0;$t_0_i=$172;$v_0_i=$172;$rsize_0_i=(HEAP32[$172+4>>2]&-8)-$8|0;label=29;break;case 29:$179=HEAP32[$t_0_i+16>>2]|0;if(($179|0)==0){label=30;break}else{$185=$179;label=31;break};case 30:$183=HEAP32[$t_0_i+20>>2]|0;if(($183|0)==0){label=32;break}else{$185=$183;label=31;break};case 31:$189=(HEAP32[$185+4>>2]&-8)-$8|0;$190=$189>>>0<$rsize_0_i>>>0;$t_0_i=$185;$v_0_i=$190?$185:$v_0_i;$rsize_0_i=$190?$189:$rsize_0_i;label=29;break;case 32:$192=$v_0_i;$193=HEAP32[590]|0;if($192>>>0<$193>>>0){label=76;break}else{label=33;break};case 33:$196=$192+$8|0;if($192>>>0<$196>>>0){label=34;break}else{label=76;break};case 34:$201=HEAP32[$v_0_i+24>>2]|0;$203=HEAP32[$v_0_i+12>>2]|0;if(($203|0)==($v_0_i|0)){label=40;break}else{label=35;break};case 35:$207=HEAP32[$v_0_i+8>>2]|0;if($207>>>0<$193>>>0){label=39;break}else{label=36;break};case 36:$211=$207+12|0;if((HEAP32[$211>>2]|0)==($v_0_i|0)){label=37;break}else{label=39;break};case 37:$215=$203+8|0;if((HEAP32[$215>>2]|0)==($v_0_i|0)){label=38;break}else{label=39;break};case 38:HEAP32[$211>>2]=$203;HEAP32[$215>>2]=$207;$R_1_i=$203;label=47;break;case 39:_abort();return 0;return 0;case 40:$220=$v_0_i+20|0;$221=HEAP32[$220>>2]|0;if(($221|0)==0){label=41;break}else{$R_0_i=$221;$RP_0_i=$220;label=42;break};case 41:$224=$v_0_i+16|0;$225=HEAP32[$224>>2]|0;if(($225|0)==0){$R_1_i=0;label=47;break}else{$R_0_i=$225;$RP_0_i=$224;label=42;break};case 42:$227=$R_0_i+20|0;$228=HEAP32[$227>>2]|0;if(($228|0)==0){label=43;break}else{$R_0_i=$228;$RP_0_i=$227;label=42;break};case 43:$231=$R_0_i+16|0;$232=HEAP32[$231>>2]|0;if(($232|0)==0){label=44;break}else{$R_0_i=$232;$RP_0_i=$231;label=42;break};case 44:if($RP_0_i>>>0<$193>>>0){label=46;break}else{label=45;break};case 45:HEAP32[$RP_0_i>>2]=0;$R_1_i=$R_0_i;label=47;break;case 46:_abort();return 0;return 0;case 47:if(($201|0)==0){label=67;break}else{label=48;break};case 48:$242=$v_0_i+28|0;$244=2648+(HEAP32[$242>>2]<<2)|0;if(($v_0_i|0)==(HEAP32[$244>>2]|0)){label=49;break}else{label=51;break};case 49:HEAP32[$244>>2]=$R_1_i;if(($R_1_i|0)==0){label=50;break}else{label=57;break};case 50:HEAP32[587]=HEAP32[587]&~(1<<HEAP32[$242>>2]);label=67;break;case 51:if($201>>>0<(HEAP32[590]|0)>>>0){label=55;break}else{label=52;break};case 52:$258=$201+16|0;if((HEAP32[$258>>2]|0)==($v_0_i|0)){label=53;break}else{label=54;break};case 53:HEAP32[$258>>2]=$R_1_i;label=56;break;case 54:HEAP32[$201+20>>2]=$R_1_i;label=56;break;case 55:_abort();return 0;return 0;case 56:if(($R_1_i|0)==0){label=67;break}else{label=57;break};case 57:if($R_1_i>>>0<(HEAP32[590]|0)>>>0){label=66;break}else{label=58;break};case 58:HEAP32[$R_1_i+24>>2]=$201;$274=HEAP32[$v_0_i+16>>2]|0;if(($274|0)==0){label=62;break}else{label=59;break};case 59:if($274>>>0<(HEAP32[590]|0)>>>0){label=61;break}else{label=60;break};case 60:HEAP32[$R_1_i+16>>2]=$274;HEAP32[$274+24>>2]=$R_1_i;label=62;break;case 61:_abort();return 0;return 0;case 62:$286=HEAP32[$v_0_i+20>>2]|0;if(($286|0)==0){label=67;break}else{label=63;break};case 63:if($286>>>0<(HEAP32[590]|0)>>>0){label=65;break}else{label=64;break};case 64:HEAP32[$R_1_i+20>>2]=$286;HEAP32[$286+24>>2]=$R_1_i;label=67;break;case 65:_abort();return 0;return 0;case 66:_abort();return 0;return 0;case 67:if($rsize_0_i>>>0<16){label=68;break}else{label=69;break};case 68:$300=$rsize_0_i+$8|0;HEAP32[$v_0_i+4>>2]=$300|3;$304=$192+($300+4)|0;HEAP32[$304>>2]=HEAP32[$304>>2]|1;label=77;break;case 69:HEAP32[$v_0_i+4>>2]=$8|3;HEAP32[$192+($8|4)>>2]=$rsize_0_i|1;HEAP32[$192+($rsize_0_i+$8)>>2]=$rsize_0_i;$315=HEAP32[588]|0;if(($315|0)==0){label=75;break}else{label=70;break};case 70:$318=HEAP32[591]|0;$319=$315>>>3;$320=$319<<1;$322=2384+($320<<2)|0;$323=HEAP32[586]|0;$324=1<<$319;if(($323&$324|0)==0){label=71;break}else{label=72;break};case 71:HEAP32[586]=$323|$324;$F1_0_i=$322;$_pre_phi_i=2384+($320+2<<2)|0;label=74;break;case 72:$330=2384+($320+2<<2)|0;$331=HEAP32[$330>>2]|0;if($331>>>0<(HEAP32[590]|0)>>>0){label=73;break}else{$F1_0_i=$331;$_pre_phi_i=$330;label=74;break};case 73:_abort();return 0;return 0;case 74:HEAP32[$_pre_phi_i>>2]=$318;HEAP32[$F1_0_i+12>>2]=$318;HEAP32[$318+8>>2]=$F1_0_i;HEAP32[$318+12>>2]=$322;label=75;break;case 75:HEAP32[588]=$rsize_0_i;HEAP32[591]=$196;label=77;break;case 76:_abort();return 0;return 0;case 77:$342=$v_0_i+8|0;if(($342|0)==0){$nb_0=$8;label=160;break}else{$mem_0=$342;label=341;break};case 78:if($bytes>>>0>4294967231){$nb_0=-1;label=160;break}else{label=79;break};case 79:$348=$bytes+11|0;$349=$348&-8;$350=HEAP32[587]|0;if(($350|0)==0){$nb_0=$349;label=160;break}else{label=80;break};case 80:$353=-$349|0;$354=$348>>>8;if(($354|0)==0){$idx_0_i=0;label=83;break}else{label=81;break};case 81:if($349>>>0>16777215){$idx_0_i=31;label=83;break}else{label=82;break};case 82:$361=($354+1048320|0)>>>16&8;$362=$354<<$361;$365=($362+520192|0)>>>16&4;$367=$362<<$365;$370=($367+245760|0)>>>16&2;$375=14-($365|$361|$370)+($367<<$370>>>15)|0;$idx_0_i=$349>>>(($375+7|0)>>>0)&1|$375<<1;label=83;break;case 83:$383=HEAP32[2648+($idx_0_i<<2)>>2]|0;if(($383|0)==0){$v_2_i=0;$rsize_2_i=$353;$t_1_i=0;label=90;break}else{label=84;break};case 84:if(($idx_0_i|0)==31){$391=0;label=86;break}else{label=85;break};case 85:$391=25-($idx_0_i>>>1)|0;label=86;break;case 86:$v_0_i118=0;$rsize_0_i117=$353;$t_0_i116=$383;$sizebits_0_i=$349<<$391;$rst_0_i=0;label=87;break;case 87:$396=HEAP32[$t_0_i116+4>>2]&-8;$397=$396-$349|0;if($397>>>0<$rsize_0_i117>>>0){label=88;break}else{$v_1_i=$v_0_i118;$rsize_1_i=$rsize_0_i117;label=89;break};case 88:if(($396|0)==($349|0)){$v_2_i=$t_0_i116;$rsize_2_i=$397;$t_1_i=$t_0_i116;label=90;break}else{$v_1_i=$t_0_i116;$rsize_1_i=$397;label=89;break};case 89:$403=HEAP32[$t_0_i116+20>>2]|0;$406=HEAP32[$t_0_i116+16+($sizebits_0_i>>>31<<2)>>2]|0;$rst_1_i=($403|0)==0|($403|0)==($406|0)?$rst_0_i:$403;if(($406|0)==0){$v_2_i=$v_1_i;$rsize_2_i=$rsize_1_i;$t_1_i=$rst_1_i;label=90;break}else{$v_0_i118=$v_1_i;$rsize_0_i117=$rsize_1_i;$t_0_i116=$406;$sizebits_0_i=$sizebits_0_i<<1;$rst_0_i=$rst_1_i;label=87;break};case 90:if(($t_1_i|0)==0&($v_2_i|0)==0){label=91;break}else{$t_2_ph_i=$t_1_i;label=93;break};case 91:$414=2<<$idx_0_i;$417=$350&($414|-$414);if(($417|0)==0){$nb_0=$349;label=160;break}else{label=92;break};case 92:$422=($417&-$417)-1|0;$424=$422>>>12&16;$425=$422>>>($424>>>0);$427=$425>>>5&8;$429=$425>>>($427>>>0);$431=$429>>>2&4;$433=$429>>>($431>>>0);$435=$433>>>1&2;$437=$433>>>($435>>>0);$439=$437>>>1&1;$t_2_ph_i=HEAP32[2648+(($427|$424|$431|$435|$439)+($437>>>($439>>>0))<<2)>>2]|0;label=93;break;case 93:if(($t_2_ph_i|0)==0){$rsize_3_lcssa_i=$rsize_2_i;$v_3_lcssa_i=$v_2_i;label=96;break}else{$t_228_i=$t_2_ph_i;$rsize_329_i=$rsize_2_i;$v_330_i=$v_2_i;label=94;break};case 94:$449=(HEAP32[$t_228_i+4>>2]&-8)-$349|0;$450=$449>>>0<$rsize_329_i>>>0;$_rsize_3_i=$450?$449:$rsize_329_i;$t_2_v_3_i=$450?$t_228_i:$v_330_i;$452=HEAP32[$t_228_i+16>>2]|0;if(($452|0)==0){label=95;break}else{$t_228_i=$452;$rsize_329_i=$_rsize_3_i;$v_330_i=$t_2_v_3_i;label=94;break};case 95:$455=HEAP32[$t_228_i+20>>2]|0;if(($455|0)==0){$rsize_3_lcssa_i=$_rsize_3_i;$v_3_lcssa_i=$t_2_v_3_i;label=96;break}else{$t_228_i=$455;$rsize_329_i=$_rsize_3_i;$v_330_i=$t_2_v_3_i;label=94;break};case 96:if(($v_3_lcssa_i|0)==0){$nb_0=$349;label=160;break}else{label=97;break};case 97:if($rsize_3_lcssa_i>>>0<((HEAP32[588]|0)-$349|0)>>>0){label=98;break}else{$nb_0=$349;label=160;break};case 98:$463=$v_3_lcssa_i;$464=HEAP32[590]|0;if($463>>>0<$464>>>0){label=158;break}else{label=99;break};case 99:$467=$463+$349|0;$468=$467;if($463>>>0<$467>>>0){label=100;break}else{label=158;break};case 100:$472=HEAP32[$v_3_lcssa_i+24>>2]|0;$474=HEAP32[$v_3_lcssa_i+12>>2]|0;if(($474|0)==($v_3_lcssa_i|0)){label=106;break}else{label=101;break};case 101:$478=HEAP32[$v_3_lcssa_i+8>>2]|0;if($478>>>0<$464>>>0){label=105;break}else{label=102;break};case 102:$482=$478+12|0;if((HEAP32[$482>>2]|0)==($v_3_lcssa_i|0)){label=103;break}else{label=105;break};case 103:$486=$474+8|0;if((HEAP32[$486>>2]|0)==($v_3_lcssa_i|0)){label=104;break}else{label=105;break};case 104:HEAP32[$482>>2]=$474;HEAP32[$486>>2]=$478;$R_1_i122=$474;label=113;break;case 105:_abort();return 0;return 0;case 106:$491=$v_3_lcssa_i+20|0;$492=HEAP32[$491>>2]|0;if(($492|0)==0){label=107;break}else{$R_0_i120=$492;$RP_0_i119=$491;label=108;break};case 107:$495=$v_3_lcssa_i+16|0;$496=HEAP32[$495>>2]|0;if(($496|0)==0){$R_1_i122=0;label=113;break}else{$R_0_i120=$496;$RP_0_i119=$495;label=108;break};case 108:$498=$R_0_i120+20|0;$499=HEAP32[$498>>2]|0;if(($499|0)==0){label=109;break}else{$R_0_i120=$499;$RP_0_i119=$498;label=108;break};case 109:$502=$R_0_i120+16|0;$503=HEAP32[$502>>2]|0;if(($503|0)==0){label=110;break}else{$R_0_i120=$503;$RP_0_i119=$502;label=108;break};case 110:if($RP_0_i119>>>0<$464>>>0){label=112;break}else{label=111;break};case 111:HEAP32[$RP_0_i119>>2]=0;$R_1_i122=$R_0_i120;label=113;break;case 112:_abort();return 0;return 0;case 113:if(($472|0)==0){label=133;break}else{label=114;break};case 114:$513=$v_3_lcssa_i+28|0;$515=2648+(HEAP32[$513>>2]<<2)|0;if(($v_3_lcssa_i|0)==(HEAP32[$515>>2]|0)){label=115;break}else{label=117;break};case 115:HEAP32[$515>>2]=$R_1_i122;if(($R_1_i122|0)==0){label=116;break}else{label=123;break};case 116:HEAP32[587]=HEAP32[587]&~(1<<HEAP32[$513>>2]);label=133;break;case 117:if($472>>>0<(HEAP32[590]|0)>>>0){label=121;break}else{label=118;break};case 118:$529=$472+16|0;if((HEAP32[$529>>2]|0)==($v_3_lcssa_i|0)){label=119;break}else{label=120;break};case 119:HEAP32[$529>>2]=$R_1_i122;label=122;break;case 120:HEAP32[$472+20>>2]=$R_1_i122;label=122;break;case 121:_abort();return 0;return 0;case 122:if(($R_1_i122|0)==0){label=133;break}else{label=123;break};case 123:if($R_1_i122>>>0<(HEAP32[590]|0)>>>0){label=132;break}else{label=124;break};case 124:HEAP32[$R_1_i122+24>>2]=$472;$545=HEAP32[$v_3_lcssa_i+16>>2]|0;if(($545|0)==0){label=128;break}else{label=125;break};case 125:if($545>>>0<(HEAP32[590]|0)>>>0){label=127;break}else{label=126;break};case 126:HEAP32[$R_1_i122+16>>2]=$545;HEAP32[$545+24>>2]=$R_1_i122;label=128;break;case 127:_abort();return 0;return 0;case 128:$557=HEAP32[$v_3_lcssa_i+20>>2]|0;if(($557|0)==0){label=133;break}else{label=129;break};case 129:if($557>>>0<(HEAP32[590]|0)>>>0){label=131;break}else{label=130;break};case 130:HEAP32[$R_1_i122+20>>2]=$557;HEAP32[$557+24>>2]=$R_1_i122;label=133;break;case 131:_abort();return 0;return 0;case 132:_abort();return 0;return 0;case 133:if($rsize_3_lcssa_i>>>0<16){label=134;break}else{label=135;break};case 134:$571=$rsize_3_lcssa_i+$349|0;HEAP32[$v_3_lcssa_i+4>>2]=$571|3;$575=$463+($571+4)|0;HEAP32[$575>>2]=HEAP32[$575>>2]|1;label=159;break;case 135:HEAP32[$v_3_lcssa_i+4>>2]=$349|3;HEAP32[$463+($349|4)>>2]=$rsize_3_lcssa_i|1;HEAP32[$463+($rsize_3_lcssa_i+$349)>>2]=$rsize_3_lcssa_i;$586=$rsize_3_lcssa_i>>>3;if($rsize_3_lcssa_i>>>0<256){label=136;break}else{label=141;break};case 136:$589=$586<<1;$591=2384+($589<<2)|0;$592=HEAP32[586]|0;$593=1<<$586;if(($592&$593|0)==0){label=137;break}else{label=138;break};case 137:HEAP32[586]=$592|$593;$F5_0_i=$591;$_pre_phi_i128=2384+($589+2<<2)|0;label=140;break;case 138:$599=2384+($589+2<<2)|0;$600=HEAP32[$599>>2]|0;if($600>>>0<(HEAP32[590]|0)>>>0){label=139;break}else{$F5_0_i=$600;$_pre_phi_i128=$599;label=140;break};case 139:_abort();return 0;return 0;case 140:HEAP32[$_pre_phi_i128>>2]=$468;HEAP32[$F5_0_i+12>>2]=$468;HEAP32[$463+($349+8)>>2]=$F5_0_i;HEAP32[$463+($349+12)>>2]=$591;label=159;break;case 141:$612=$467;$613=$rsize_3_lcssa_i>>>8;if(($613|0)==0){$I7_0_i=0;label=144;break}else{label=142;break};case 142:if($rsize_3_lcssa_i>>>0>16777215){$I7_0_i=31;label=144;break}else{label=143;break};case 143:$620=($613+1048320|0)>>>16&8;$621=$613<<$620;$624=($621+520192|0)>>>16&4;$626=$621<<$624;$629=($626+245760|0)>>>16&2;$634=14-($624|$620|$629)+($626<<$629>>>15)|0;$I7_0_i=$rsize_3_lcssa_i>>>(($634+7|0)>>>0)&1|$634<<1;label=144;break;case 144:$641=2648+($I7_0_i<<2)|0;HEAP32[$463+($349+28)>>2]=$I7_0_i;HEAP32[$463+($349+20)>>2]=0;HEAP32[$463+($349+16)>>2]=0;$648=HEAP32[587]|0;$649=1<<$I7_0_i;if(($648&$649|0)==0){label=145;break}else{label=146;break};case 145:HEAP32[587]=$648|$649;HEAP32[$641>>2]=$612;HEAP32[$463+($349+24)>>2]=$641;HEAP32[$463+($349+12)>>2]=$612;HEAP32[$463+($349+8)>>2]=$612;label=159;break;case 146:if(($I7_0_i|0)==31){$668=0;label=148;break}else{label=147;break};case 147:$668=25-($I7_0_i>>>1)|0;label=148;break;case 148:$K12_0_i=$rsize_3_lcssa_i<<$668;$T_0_i=HEAP32[$641>>2]|0;label=149;break;case 149:if((HEAP32[$T_0_i+4>>2]&-8|0)==($rsize_3_lcssa_i|0)){label=154;break}else{label=150;break};case 150:$677=$T_0_i+16+($K12_0_i>>>31<<2)|0;$678=HEAP32[$677>>2]|0;if(($678|0)==0){label=151;break}else{$K12_0_i=$K12_0_i<<1;$T_0_i=$678;label=149;break};case 151:if($677>>>0<(HEAP32[590]|0)>>>0){label=153;break}else{label=152;break};case 152:HEAP32[$677>>2]=$612;HEAP32[$463+($349+24)>>2]=$T_0_i;HEAP32[$463+($349+12)>>2]=$612;HEAP32[$463+($349+8)>>2]=$612;label=159;break;case 153:_abort();return 0;return 0;case 154:$694=$T_0_i+8|0;$695=HEAP32[$694>>2]|0;$697=HEAP32[590]|0;if($T_0_i>>>0<$697>>>0){label=157;break}else{label=155;break};case 155:if($695>>>0<$697>>>0){label=157;break}else{label=156;break};case 156:HEAP32[$695+12>>2]=$612;HEAP32[$694>>2]=$612;HEAP32[$463+($349+8)>>2]=$695;HEAP32[$463+($349+12)>>2]=$T_0_i;HEAP32[$463+($349+24)>>2]=0;label=159;break;case 157:_abort();return 0;return 0;case 158:_abort();return 0;return 0;case 159:$711=$v_3_lcssa_i+8|0;if(($711|0)==0){$nb_0=$349;label=160;break}else{$mem_0=$711;label=341;break};case 160:$714=HEAP32[588]|0;if($nb_0>>>0>$714>>>0){label=165;break}else{label=161;break};case 161:$717=$714-$nb_0|0;$718=HEAP32[591]|0;if($717>>>0>15){label=162;break}else{label=163;break};case 162:$721=$718;HEAP32[591]=$721+$nb_0;HEAP32[588]=$717;HEAP32[$721+($nb_0+4)>>2]=$717|1;HEAP32[$721+$714>>2]=$717;HEAP32[$718+4>>2]=$nb_0|3;label=164;break;case 163:HEAP32[588]=0;HEAP32[591]=0;HEAP32[$718+4>>2]=$714|3;$736=$718+($714+4)|0;HEAP32[$736>>2]=HEAP32[$736>>2]|1;label=164;break;case 164:$mem_0=$718+8|0;label=341;break;case 165:$743=HEAP32[589]|0;if($nb_0>>>0<$743>>>0){label=166;break}else{label=167;break};case 166:$746=$743-$nb_0|0;HEAP32[589]=$746;$747=HEAP32[592]|0;$748=$747;HEAP32[592]=$748+$nb_0;HEAP32[$748+($nb_0+4)>>2]=$746|1;HEAP32[$747+4>>2]=$nb_0|3;$mem_0=$747+8|0;label=341;break;case 167:if((HEAP32[580]|0)==0){label=168;break}else{label=171;break};case 168:$762=_sysconf(8)|0;if(($762-1&$762|0)==0){label=170;break}else{label=169;break};case 169:_abort();return 0;return 0;case 170:HEAP32[582]=$762;HEAP32[581]=$762;HEAP32[583]=-1;HEAP32[584]=-1;HEAP32[585]=0;HEAP32[697]=0;HEAP32[580]=(_time(0)|0)&-16^1431655768;label=171;break;case 171:$772=HEAP32[582]|0;$773=$nb_0+47|0;$774=$772+$773|0;$775=-$772|0;$776=$774&$775;if($776>>>0>$nb_0>>>0){label=172;break}else{$mem_0=0;label=341;break};case 172:$779=HEAP32[696]|0;if(($779|0)==0){label=174;break}else{label=173;break};case 173:$782=HEAP32[694]|0;$783=$782+$776|0;if($783>>>0<=$782>>>0|$783>>>0>$779>>>0){$mem_0=0;label=341;break}else{label=174;break};case 174:if((HEAP32[697]&4|0)==0){label=175;break}else{$tsize_1_i=0;label=198;break};case 175:$791=HEAP32[592]|0;if(($791|0)==0){label=181;break}else{label=176;break};case 176:$794=$791;$sp_0_i_i=2792;label=177;break;case 177:$796=$sp_0_i_i|0;$797=HEAP32[$796>>2]|0;if($797>>>0>$794>>>0){label=179;break}else{label=178;break};case 178:$800=$sp_0_i_i+4|0;if(($797+(HEAP32[$800>>2]|0)|0)>>>0>$794>>>0){label=180;break}else{label=179;break};case 179:$806=HEAP32[$sp_0_i_i+8>>2]|0;if(($806|0)==0){label=181;break}else{$sp_0_i_i=$806;label=177;break};case 180:if(($sp_0_i_i|0)==0){label=181;break}else{label=188;break};case 181:$809=_sbrk(0)|0;if(($809|0)==-1){$tsize_0303639_i=0;label=197;break}else{label=182;break};case 182:$812=$809;$813=HEAP32[581]|0;$814=$813-1|0;if(($814&$812|0)==0){$ssize_0_i=$776;label=184;break}else{label=183;break};case 183:$ssize_0_i=$776-$812+($814+$812&-$813)|0;label=184;break;case 184:$824=HEAP32[694]|0;$825=$824+$ssize_0_i|0;if($ssize_0_i>>>0>$nb_0>>>0&$ssize_0_i>>>0<2147483647){label=185;break}else{$tsize_0303639_i=0;label=197;break};case 185:$829=HEAP32[696]|0;if(($829|0)==0){label=187;break}else{label=186;break};case 186:if($825>>>0<=$824>>>0|$825>>>0>$829>>>0){$tsize_0303639_i=0;label=197;break}else{label=187;break};case 187:$835=_sbrk($ssize_0_i|0)|0;$836=($835|0)==($809|0);$tbase_0_i=$836?$809:-1;$tsize_0_i=$836?$ssize_0_i:0;$br_0_i=$835;$ssize_1_i=$ssize_0_i;label=190;break;case 188:$840=$774-(HEAP32[589]|0)&$775;if($840>>>0<2147483647){label=189;break}else{$tsize_0303639_i=0;label=197;break};case 189:$843=_sbrk($840|0)|0;$847=($843|0)==((HEAP32[$796>>2]|0)+(HEAP32[$800>>2]|0)|0);$tbase_0_i=$847?$843:-1;$tsize_0_i=$847?$840:0;$br_0_i=$843;$ssize_1_i=$840;label=190;break;case 190:if(($tbase_0_i|0)==-1){label=191;break}else{$tsize_244_i=$tsize_0_i;$tbase_245_i=$tbase_0_i;label=201;break};case 191:if(($br_0_i|0)!=-1&$ssize_1_i>>>0<2147483647&$ssize_1_i>>>0<($nb_0+48|0)>>>0){label=192;break}else{$ssize_2_i=$ssize_1_i;label=196;break};case 192:$856=HEAP32[582]|0;$860=$773-$ssize_1_i+$856&-$856;if($860>>>0<2147483647){label=193;break}else{$ssize_2_i=$ssize_1_i;label=196;break};case 193:if((_sbrk($860|0)|0)==-1){label=195;break}else{label=194;break};case 194:$ssize_2_i=$860+$ssize_1_i|0;label=196;break;case 195:_sbrk(-$ssize_1_i|0)|0;$tsize_0303639_i=$tsize_0_i;label=197;break;case 196:if(($br_0_i|0)==-1){$tsize_0303639_i=$tsize_0_i;label=197;break}else{$tsize_244_i=$ssize_2_i;$tbase_245_i=$br_0_i;label=201;break};case 197:HEAP32[697]=HEAP32[697]|4;$tsize_1_i=$tsize_0303639_i;label=198;break;case 198:if($776>>>0<2147483647){label=199;break}else{label=340;break};case 199:$876=_sbrk($776|0)|0;$877=_sbrk(0)|0;if(($877|0)!=-1&($876|0)!=-1&$876>>>0<$877>>>0){label=200;break}else{label=340;break};case 200:$881=$877-$876|0;$883=$881>>>0>($nb_0+40|0)>>>0;$_tbase_1_i=$883?$876:-1;if(($_tbase_1_i|0)==-1){label=340;break}else{$tsize_244_i=$883?$881:$tsize_1_i;$tbase_245_i=$_tbase_1_i;label=201;break};case 201:$886=(HEAP32[694]|0)+$tsize_244_i|0;HEAP32[694]=$886;if($886>>>0>(HEAP32[695]|0)>>>0){label=202;break}else{label=203;break};case 202:HEAP32[695]=$886;label=203;break;case 203:$890=HEAP32[592]|0;if(($890|0)==0){label=204;break}else{$sp_067_i=2792;label=211;break};case 204:$893=HEAP32[590]|0;if(($893|0)==0|$tbase_245_i>>>0<$893>>>0){label=205;break}else{label=206;break};case 205:HEAP32[590]=$tbase_245_i;label=206;break;case 206:HEAP32[698]=$tbase_245_i;HEAP32[699]=$tsize_244_i;HEAP32[701]=0;HEAP32[595]=HEAP32[580];HEAP32[594]=-1;$i_02_i_i=0;label=207;break;case 207:$899=$i_02_i_i<<1;$901=2384+($899<<2)|0;HEAP32[2384+($899+3<<2)>>2]=$901;HEAP32[2384+($899+2<<2)>>2]=$901;$904=$i_02_i_i+1|0;if($904>>>0<32){$i_02_i_i=$904;label=207;break}else{label=208;break};case 208:$908=$tbase_245_i+8|0;if(($908&7|0)==0){$914=0;label=210;break}else{label=209;break};case 209:$914=-$908&7;label=210;break;case 210:$917=$tsize_244_i-40-$914|0;HEAP32[592]=$tbase_245_i+$914;HEAP32[589]=$917;HEAP32[$tbase_245_i+($914+4)>>2]=$917|1;HEAP32[$tbase_245_i+($tsize_244_i-36)>>2]=40;HEAP32[593]=HEAP32[584];label=338;break;case 211:$925=HEAP32[$sp_067_i>>2]|0;$926=$sp_067_i+4|0;$927=HEAP32[$926>>2]|0;if(($tbase_245_i|0)==($925+$927|0)){label=213;break}else{label=212;break};case 212:$932=HEAP32[$sp_067_i+8>>2]|0;if(($932|0)==0){label=218;break}else{$sp_067_i=$932;label=211;break};case 213:if((HEAP32[$sp_067_i+12>>2]&8|0)==0){label=214;break}else{label=218;break};case 214:$939=$890;if($939>>>0>=$925>>>0&$939>>>0<$tbase_245_i>>>0){label=215;break}else{label=218;break};case 215:HEAP32[$926>>2]=$927+$tsize_244_i;$944=HEAP32[592]|0;$946=(HEAP32[589]|0)+$tsize_244_i|0;$947=$944;$949=$944+8|0;if(($949&7|0)==0){$955=0;label=217;break}else{label=216;break};case 216:$955=-$949&7;label=217;break;case 217:$958=$946-$955|0;HEAP32[592]=$947+$955;HEAP32[589]=$958;HEAP32[$947+($955+4)>>2]=$958|1;HEAP32[$947+($946+4)>>2]=40;HEAP32[593]=HEAP32[584];label=338;break;case 218:if($tbase_245_i>>>0<(HEAP32[590]|0)>>>0){label=219;break}else{label=220;break};case 219:HEAP32[590]=$tbase_245_i;label=220;break;case 220:$sp_160_i=2792;label=221;break;case 221:$970=$sp_160_i|0;if((HEAP32[$970>>2]|0)==($tbase_245_i+$tsize_244_i|0)){label=223;break}else{label=222;break};case 222:$975=HEAP32[$sp_160_i+8>>2]|0;if(($975|0)==0){label=304;break}else{$sp_160_i=$975;label=221;break};case 223:if((HEAP32[$sp_160_i+12>>2]&8|0)==0){label=224;break}else{label=304;break};case 224:HEAP32[$970>>2]=$tbase_245_i;$982=$sp_160_i+4|0;HEAP32[$982>>2]=(HEAP32[$982>>2]|0)+$tsize_244_i;$986=$tbase_245_i+8|0;if(($986&7|0)==0){$993=0;label=226;break}else{label=225;break};case 225:$993=-$986&7;label=226;break;case 226:$996=$tbase_245_i+($tsize_244_i+8)|0;if(($996&7|0)==0){$1003=0;label=228;break}else{label=227;break};case 227:$1003=-$996&7;label=228;break;case 228:$1004=$tbase_245_i+($1003+$tsize_244_i)|0;$1005=$1004;$_sum_i21_i=$993+$nb_0|0;$1009=$tbase_245_i+$_sum_i21_i|0;$1010=$1009;$1011=$1004-($tbase_245_i+$993)-$nb_0|0;HEAP32[$tbase_245_i+($993+4)>>2]=$nb_0|3;if(($1005|0)==(HEAP32[592]|0)){label=229;break}else{label=230;break};case 229:$1019=(HEAP32[589]|0)+$1011|0;HEAP32[589]=$1019;HEAP32[592]=$1010;HEAP32[$tbase_245_i+($_sum_i21_i+4)>>2]=$1019|1;label=303;break;case 230:if(($1005|0)==(HEAP32[591]|0)){label=231;break}else{label=232;break};case 231:$1028=(HEAP32[588]|0)+$1011|0;HEAP32[588]=$1028;HEAP32[591]=$1010;HEAP32[$tbase_245_i+($_sum_i21_i+4)>>2]=$1028|1;HEAP32[$tbase_245_i+($1028+$_sum_i21_i)>>2]=$1028;label=303;break;case 232:$_sum2_i23_i=$tsize_244_i+4|0;$1037=HEAP32[$tbase_245_i+($_sum2_i23_i+$1003)>>2]|0;if(($1037&3|0)==1){label=233;break}else{$oldfirst_0_i_i=$1005;$qsize_0_i_i=$1011;label=280;break};case 233:$1041=$1037&-8;$1042=$1037>>>3;if($1037>>>0<256){label=234;break}else{label=246;break};case 234:$1047=HEAP32[$tbase_245_i+(($1003|8)+$tsize_244_i)>>2]|0;$1050=HEAP32[$tbase_245_i+($tsize_244_i+12+$1003)>>2]|0;$1053=2384+($1042<<1<<2)|0;if(($1047|0)==($1053|0)){label=237;break}else{label=235;break};case 235:if($1047>>>0<(HEAP32[590]|0)>>>0){label=245;break}else{label=236;break};case 236:if((HEAP32[$1047+12>>2]|0)==($1005|0)){label=237;break}else{label=245;break};case 237:if(($1050|0)==($1047|0)){label=238;break}else{label=239;break};case 238:HEAP32[586]=HEAP32[586]&~(1<<$1042);label=279;break;case 239:if(($1050|0)==($1053|0)){label=240;break}else{label=241;break};case 240:$_pre_phi57_i_i=$1050+8|0;label=243;break;case 241:if($1050>>>0<(HEAP32[590]|0)>>>0){label=244;break}else{label=242;break};case 242:$1076=$1050+8|0;if((HEAP32[$1076>>2]|0)==($1005|0)){$_pre_phi57_i_i=$1076;label=243;break}else{label=244;break};case 243:HEAP32[$1047+12>>2]=$1050;HEAP32[$_pre_phi57_i_i>>2]=$1047;label=279;break;case 244:_abort();return 0;return 0;case 245:_abort();return 0;return 0;case 246:$1081=$1004;$1084=HEAP32[$tbase_245_i+(($1003|24)+$tsize_244_i)>>2]|0;$1087=HEAP32[$tbase_245_i+($tsize_244_i+12+$1003)>>2]|0;if(($1087|0)==($1081|0)){label=252;break}else{label=247;break};case 247:$1092=HEAP32[$tbase_245_i+(($1003|8)+$tsize_244_i)>>2]|0;if($1092>>>0<(HEAP32[590]|0)>>>0){label=251;break}else{label=248;break};case 248:$1097=$1092+12|0;if((HEAP32[$1097>>2]|0)==($1081|0)){label=249;break}else{label=251;break};case 249:$1101=$1087+8|0;if((HEAP32[$1101>>2]|0)==($1081|0)){label=250;break}else{label=251;break};case 250:HEAP32[$1097>>2]=$1087;HEAP32[$1101>>2]=$1092;$R_1_i_i=$1087;label=259;break;case 251:_abort();return 0;return 0;case 252:$_sum67_i_i=$1003|16;$1107=$tbase_245_i+($_sum2_i23_i+$_sum67_i_i)|0;$1108=HEAP32[$1107>>2]|0;if(($1108|0)==0){label=253;break}else{$R_0_i_i=$1108;$RP_0_i_i=$1107;label=254;break};case 253:$1112=$tbase_245_i+($_sum67_i_i+$tsize_244_i)|0;$1113=HEAP32[$1112>>2]|0;if(($1113|0)==0){$R_1_i_i=0;label=259;break}else{$R_0_i_i=$1113;$RP_0_i_i=$1112;label=254;break};case 254:$1115=$R_0_i_i+20|0;$1116=HEAP32[$1115>>2]|0;if(($1116|0)==0){label=255;break}else{$R_0_i_i=$1116;$RP_0_i_i=$1115;label=254;break};case 255:$1119=$R_0_i_i+16|0;$1120=HEAP32[$1119>>2]|0;if(($1120|0)==0){label=256;break}else{$R_0_i_i=$1120;$RP_0_i_i=$1119;label=254;break};case 256:if($RP_0_i_i>>>0<(HEAP32[590]|0)>>>0){label=258;break}else{label=257;break};case 257:HEAP32[$RP_0_i_i>>2]=0;$R_1_i_i=$R_0_i_i;label=259;break;case 258:_abort();return 0;return 0;case 259:if(($1084|0)==0){label=279;break}else{label=260;break};case 260:$1132=$tbase_245_i+($tsize_244_i+28+$1003)|0;$1134=2648+(HEAP32[$1132>>2]<<2)|0;if(($1081|0)==(HEAP32[$1134>>2]|0)){label=261;break}else{label=263;break};case 261:HEAP32[$1134>>2]=$R_1_i_i;if(($R_1_i_i|0)==0){label=262;break}else{label=269;break};case 262:HEAP32[587]=HEAP32[587]&~(1<<HEAP32[$1132>>2]);label=279;break;case 263:if($1084>>>0<(HEAP32[590]|0)>>>0){label=267;break}else{label=264;break};case 264:$1148=$1084+16|0;if((HEAP32[$1148>>2]|0)==($1081|0)){label=265;break}else{label=266;break};case 265:HEAP32[$1148>>2]=$R_1_i_i;label=268;break;case 266:HEAP32[$1084+20>>2]=$R_1_i_i;label=268;break;case 267:_abort();return 0;return 0;case 268:if(($R_1_i_i|0)==0){label=279;break}else{label=269;break};case 269:if($R_1_i_i>>>0<(HEAP32[590]|0)>>>0){label=278;break}else{label=270;break};case 270:HEAP32[$R_1_i_i+24>>2]=$1084;$_sum3233_i_i=$1003|16;$1165=HEAP32[$tbase_245_i+($_sum3233_i_i+$tsize_244_i)>>2]|0;if(($1165|0)==0){label=274;break}else{label=271;break};case 271:if($1165>>>0<(HEAP32[590]|0)>>>0){label=273;break}else{label=272;break};case 272:HEAP32[$R_1_i_i+16>>2]=$1165;HEAP32[$1165+24>>2]=$R_1_i_i;label=274;break;case 273:_abort();return 0;return 0;case 274:$1178=HEAP32[$tbase_245_i+($_sum2_i23_i+$_sum3233_i_i)>>2]|0;if(($1178|0)==0){label=279;break}else{label=275;break};case 275:if($1178>>>0<(HEAP32[590]|0)>>>0){label=277;break}else{label=276;break};case 276:HEAP32[$R_1_i_i+20>>2]=$1178;HEAP32[$1178+24>>2]=$R_1_i_i;label=279;break;case 277:_abort();return 0;return 0;case 278:_abort();return 0;return 0;case 279:$oldfirst_0_i_i=$tbase_245_i+(($1041|$1003)+$tsize_244_i)|0;$qsize_0_i_i=$1041+$1011|0;label=280;break;case 280:$1194=$oldfirst_0_i_i+4|0;HEAP32[$1194>>2]=HEAP32[$1194>>2]&-2;HEAP32[$tbase_245_i+($_sum_i21_i+4)>>2]=$qsize_0_i_i|1;HEAP32[$tbase_245_i+($qsize_0_i_i+$_sum_i21_i)>>2]=$qsize_0_i_i;$1202=$qsize_0_i_i>>>3;if($qsize_0_i_i>>>0<256){label=281;break}else{label=286;break};case 281:$1205=$1202<<1;$1207=2384+($1205<<2)|0;$1208=HEAP32[586]|0;$1209=1<<$1202;if(($1208&$1209|0)==0){label=282;break}else{label=283;break};case 282:HEAP32[586]=$1208|$1209;$F4_0_i_i=$1207;$_pre_phi_i25_i=2384+($1205+2<<2)|0;label=285;break;case 283:$1215=2384+($1205+2<<2)|0;$1216=HEAP32[$1215>>2]|0;if($1216>>>0<(HEAP32[590]|0)>>>0){label=284;break}else{$F4_0_i_i=$1216;$_pre_phi_i25_i=$1215;label=285;break};case 284:_abort();return 0;return 0;case 285:HEAP32[$_pre_phi_i25_i>>2]=$1010;HEAP32[$F4_0_i_i+12>>2]=$1010;HEAP32[$tbase_245_i+($_sum_i21_i+8)>>2]=$F4_0_i_i;HEAP32[$tbase_245_i+($_sum_i21_i+12)>>2]=$1207;label=303;break;case 286:$1228=$1009;$1229=$qsize_0_i_i>>>8;if(($1229|0)==0){$I7_0_i_i=0;label=289;break}else{label=287;break};case 287:if($qsize_0_i_i>>>0>16777215){$I7_0_i_i=31;label=289;break}else{label=288;break};case 288:$1236=($1229+1048320|0)>>>16&8;$1237=$1229<<$1236;$1240=($1237+520192|0)>>>16&4;$1242=$1237<<$1240;$1245=($1242+245760|0)>>>16&2;$1250=14-($1240|$1236|$1245)+($1242<<$1245>>>15)|0;$I7_0_i_i=$qsize_0_i_i>>>(($1250+7|0)>>>0)&1|$1250<<1;label=289;break;case 289:$1257=2648+($I7_0_i_i<<2)|0;HEAP32[$tbase_245_i+($_sum_i21_i+28)>>2]=$I7_0_i_i;HEAP32[$tbase_245_i+($_sum_i21_i+20)>>2]=0;HEAP32[$tbase_245_i+($_sum_i21_i+16)>>2]=0;$1264=HEAP32[587]|0;$1265=1<<$I7_0_i_i;if(($1264&$1265|0)==0){label=290;break}else{label=291;break};case 290:HEAP32[587]=$1264|$1265;HEAP32[$1257>>2]=$1228;HEAP32[$tbase_245_i+($_sum_i21_i+24)>>2]=$1257;HEAP32[$tbase_245_i+($_sum_i21_i+12)>>2]=$1228;HEAP32[$tbase_245_i+($_sum_i21_i+8)>>2]=$1228;label=303;break;case 291:if(($I7_0_i_i|0)==31){$1284=0;label=293;break}else{label=292;break};case 292:$1284=25-($I7_0_i_i>>>1)|0;label=293;break;case 293:$K8_0_i_i=$qsize_0_i_i<<$1284;$T_0_i27_i=HEAP32[$1257>>2]|0;label=294;break;case 294:if((HEAP32[$T_0_i27_i+4>>2]&-8|0)==($qsize_0_i_i|0)){label=299;break}else{label=295;break};case 295:$1293=$T_0_i27_i+16+($K8_0_i_i>>>31<<2)|0;$1294=HEAP32[$1293>>2]|0;if(($1294|0)==0){label=296;break}else{$K8_0_i_i=$K8_0_i_i<<1;$T_0_i27_i=$1294;label=294;break};case 296:if($1293>>>0<(HEAP32[590]|0)>>>0){label=298;break}else{label=297;break};case 297:HEAP32[$1293>>2]=$1228;HEAP32[$tbase_245_i+($_sum_i21_i+24)>>2]=$T_0_i27_i;HEAP32[$tbase_245_i+($_sum_i21_i+12)>>2]=$1228;HEAP32[$tbase_245_i+($_sum_i21_i+8)>>2]=$1228;label=303;break;case 298:_abort();return 0;return 0;case 299:$1310=$T_0_i27_i+8|0;$1311=HEAP32[$1310>>2]|0;$1313=HEAP32[590]|0;if($T_0_i27_i>>>0<$1313>>>0){label=302;break}else{label=300;break};case 300:if($1311>>>0<$1313>>>0){label=302;break}else{label=301;break};case 301:HEAP32[$1311+12>>2]=$1228;HEAP32[$1310>>2]=$1228;HEAP32[$tbase_245_i+($_sum_i21_i+8)>>2]=$1311;HEAP32[$tbase_245_i+($_sum_i21_i+12)>>2]=$T_0_i27_i;HEAP32[$tbase_245_i+($_sum_i21_i+24)>>2]=0;label=303;break;case 302:_abort();return 0;return 0;case 303:$mem_0=$tbase_245_i+($993|8)|0;label=341;break;case 304:$1327=$890;$sp_0_i_i_i=2792;label=305;break;case 305:$1330=HEAP32[$sp_0_i_i_i>>2]|0;if($1330>>>0>$1327>>>0){label=307;break}else{label=306;break};case 306:$1334=HEAP32[$sp_0_i_i_i+4>>2]|0;$1335=$1330+$1334|0;if($1335>>>0>$1327>>>0){label=308;break}else{label=307;break};case 307:$sp_0_i_i_i=HEAP32[$sp_0_i_i_i+8>>2]|0;label=305;break;case 308:$1341=$1330+($1334-39)|0;if(($1341&7|0)==0){$1348=0;label=310;break}else{label=309;break};case 309:$1348=-$1341&7;label=310;break;case 310:$1349=$1330+($1334-47+$1348)|0;$1353=$1349>>>0<($890+16|0)>>>0?$1327:$1349;$1354=$1353+8|0;$1358=$tbase_245_i+8|0;if(($1358&7|0)==0){$1364=0;label=312;break}else{label=311;break};case 311:$1364=-$1358&7;label=312;break;case 312:$1367=$tsize_244_i-40-$1364|0;HEAP32[592]=$tbase_245_i+$1364;HEAP32[589]=$1367;HEAP32[$tbase_245_i+($1364+4)>>2]=$1367|1;HEAP32[$tbase_245_i+($tsize_244_i-36)>>2]=40;HEAP32[593]=HEAP32[584];HEAP32[$1353+4>>2]=27;HEAP32[$1354>>2]=HEAP32[698];HEAP32[$1354+4>>2]=HEAP32[2796>>2];HEAP32[$1354+8>>2]=HEAP32[2800>>2];HEAP32[$1354+12>>2]=HEAP32[2804>>2];HEAP32[698]=$tbase_245_i;HEAP32[699]=$tsize_244_i;HEAP32[701]=0;HEAP32[700]=$1354;$1377=$1353+28|0;HEAP32[$1377>>2]=7;if(($1353+32|0)>>>0<$1335>>>0){$1380=$1377;label=313;break}else{label=314;break};case 313:$1381=$1380+4|0;HEAP32[$1381>>2]=7;if(($1380+8|0)>>>0<$1335>>>0){$1380=$1381;label=313;break}else{label=314;break};case 314:if(($1353|0)==($1327|0)){label=338;break}else{label=315;break};case 315:$1389=$1353-$890|0;$1392=$1327+($1389+4)|0;HEAP32[$1392>>2]=HEAP32[$1392>>2]&-2;HEAP32[$890+4>>2]=$1389|1;HEAP32[$1327+$1389>>2]=$1389;$1398=$1389>>>3;if($1389>>>0<256){label=316;break}else{label=321;break};case 316:$1401=$1398<<1;$1403=2384+($1401<<2)|0;$1404=HEAP32[586]|0;$1405=1<<$1398;if(($1404&$1405|0)==0){label=317;break}else{label=318;break};case 317:HEAP32[586]=$1404|$1405;$F_0_i_i=$1403;$_pre_phi_i_i=2384+($1401+2<<2)|0;label=320;break;case 318:$1411=2384+($1401+2<<2)|0;$1412=HEAP32[$1411>>2]|0;if($1412>>>0<(HEAP32[590]|0)>>>0){label=319;break}else{$F_0_i_i=$1412;$_pre_phi_i_i=$1411;label=320;break};case 319:_abort();return 0;return 0;case 320:HEAP32[$_pre_phi_i_i>>2]=$890;HEAP32[$F_0_i_i+12>>2]=$890;HEAP32[$890+8>>2]=$F_0_i_i;HEAP32[$890+12>>2]=$1403;label=338;break;case 321:$1422=$890;$1423=$1389>>>8;if(($1423|0)==0){$I1_0_i_i=0;label=324;break}else{label=322;break};case 322:if($1389>>>0>16777215){$I1_0_i_i=31;label=324;break}else{label=323;break};case 323:$1430=($1423+1048320|0)>>>16&8;$1431=$1423<<$1430;$1434=($1431+520192|0)>>>16&4;$1436=$1431<<$1434;$1439=($1436+245760|0)>>>16&2;$1444=14-($1434|$1430|$1439)+($1436<<$1439>>>15)|0;$I1_0_i_i=$1389>>>(($1444+7|0)>>>0)&1|$1444<<1;label=324;break;case 324:$1451=2648+($I1_0_i_i<<2)|0;HEAP32[$890+28>>2]=$I1_0_i_i;HEAP32[$890+20>>2]=0;HEAP32[$890+16>>2]=0;$1455=HEAP32[587]|0;$1456=1<<$I1_0_i_i;if(($1455&$1456|0)==0){label=325;break}else{label=326;break};case 325:HEAP32[587]=$1455|$1456;HEAP32[$1451>>2]=$1422;HEAP32[$890+24>>2]=$1451;HEAP32[$890+12>>2]=$890;HEAP32[$890+8>>2]=$890;label=338;break;case 326:if(($I1_0_i_i|0)==31){$1471=0;label=328;break}else{label=327;break};case 327:$1471=25-($I1_0_i_i>>>1)|0;label=328;break;case 328:$K2_0_i_i=$1389<<$1471;$T_0_i_i=HEAP32[$1451>>2]|0;label=329;break;case 329:if((HEAP32[$T_0_i_i+4>>2]&-8|0)==($1389|0)){label=334;break}else{label=330;break};case 330:$1480=$T_0_i_i+16+($K2_0_i_i>>>31<<2)|0;$1481=HEAP32[$1480>>2]|0;if(($1481|0)==0){label=331;break}else{$K2_0_i_i=$K2_0_i_i<<1;$T_0_i_i=$1481;label=329;break};case 331:if($1480>>>0<(HEAP32[590]|0)>>>0){label=333;break}else{label=332;break};case 332:HEAP32[$1480>>2]=$1422;HEAP32[$890+24>>2]=$T_0_i_i;HEAP32[$890+12>>2]=$890;HEAP32[$890+8>>2]=$890;label=338;break;case 333:_abort();return 0;return 0;case 334:$1494=$T_0_i_i+8|0;$1495=HEAP32[$1494>>2]|0;$1497=HEAP32[590]|0;if($T_0_i_i>>>0<$1497>>>0){label=337;break}else{label=335;break};case 335:if($1495>>>0<$1497>>>0){label=337;break}else{label=336;break};case 336:HEAP32[$1495+12>>2]=$1422;HEAP32[$1494>>2]=$1422;HEAP32[$890+8>>2]=$1495;HEAP32[$890+12>>2]=$T_0_i_i;HEAP32[$890+24>>2]=0;label=338;break;case 337:_abort();return 0;return 0;case 338:$1507=HEAP32[589]|0;if($1507>>>0>$nb_0>>>0){label=339;break}else{label=340;break};case 339:$1510=$1507-$nb_0|0;HEAP32[589]=$1510;$1511=HEAP32[592]|0;$1512=$1511;HEAP32[592]=$1512+$nb_0;HEAP32[$1512+($nb_0+4)>>2]=$1510|1;HEAP32[$1511+4>>2]=$nb_0|3;$mem_0=$1511+8|0;label=341;break;case 340:HEAP32[(___errno_location()|0)>>2]=12;$mem_0=0;label=341;break;case 341:return $mem_0|0}return 0}function _free($mem){$mem=$mem|0;var $3=0,$5=0,$10=0,$11=0,$14=0,$15=0,$16=0,$21=0,$_sum232=0,$24=0,$25=0,$26=0,$32=0,$37=0,$40=0,$43=0,$64=0,$_pre_phi306=0,$69=0,$72=0,$75=0,$80=0,$84=0,$88=0,$94=0,$95=0,$99=0,$100=0,$RP_0=0,$R_0=0,$102=0,$103=0,$106=0,$107=0,$R_1=0,$118=0,$120=0,$134=0,$151=0,$164=0,$177=0,$psize_0=0,$p_0=0,$189=0,$193=0,$194=0,$204=0,$215=0,$222=0,$223=0,$228=0,$231=0,$234=0,$257=0,$_pre_phi304=0,$262=0,$265=0,$268=0,$273=0,$278=0,$282=0,$288=0,$289=0,$293=0,$294=0,$RP9_0=0,$R7_0=0,$296=0,$297=0,$300=0,$301=0,$R7_1=0,$313=0,$315=0,$329=0,$346=0,$359=0,$psize_1=0,$385=0,$388=0,$390=0,$391=0,$392=0,$398=0,$399=0,$_pre_phi=0,$F16_0=0,$409=0,$410=0,$417=0,$418=0,$421=0,$423=0,$426=0,$431=0,$I18_0=0,$438=0,$442=0,$443=0,$458=0,$T_0=0,$K19_0=0,$467=0,$468=0,$481=0,$482=0,$484=0,$496=0,$sp_0_in_i=0,$sp_0_i=0,label=0;label=1;while(1)switch(label|0){case 1:if(($mem|0)==0){label=140;break}else{label=2;break};case 2:$3=$mem-8|0;$5=HEAP32[590]|0;if($3>>>0<$5>>>0){label=139;break}else{label=3;break};case 3:$10=HEAP32[$mem-4>>2]|0;$11=$10&3;if(($11|0)==1){label=139;break}else{label=4;break};case 4:$14=$10&-8;$15=$mem+($14-8)|0;$16=$15;if(($10&1|0)==0){label=5;break}else{$p_0=$3;$psize_0=$14;label=56;break};case 5:$21=HEAP32[$3>>2]|0;if(($11|0)==0){label=140;break}else{label=6;break};case 6:$_sum232=-8-$21|0;$24=$mem+$_sum232|0;$25=$24;$26=$21+$14|0;if($24>>>0<$5>>>0){label=139;break}else{label=7;break};case 7:if(($25|0)==(HEAP32[591]|0)){label=54;break}else{label=8;break};case 8:$32=$21>>>3;if($21>>>0<256){label=9;break}else{label=21;break};case 9:$37=HEAP32[$mem+($_sum232+8)>>2]|0;$40=HEAP32[$mem+($_sum232+12)>>2]|0;$43=2384+($32<<1<<2)|0;if(($37|0)==($43|0)){label=12;break}else{label=10;break};case 10:if($37>>>0<$5>>>0){label=20;break}else{label=11;break};case 11:if((HEAP32[$37+12>>2]|0)==($25|0)){label=12;break}else{label=20;break};case 12:if(($40|0)==($37|0)){label=13;break}else{label=14;break};case 13:HEAP32[586]=HEAP32[586]&~(1<<$32);$p_0=$25;$psize_0=$26;label=56;break;case 14:if(($40|0)==($43|0)){label=15;break}else{label=16;break};case 15:$_pre_phi306=$40+8|0;label=18;break;case 16:if($40>>>0<$5>>>0){label=19;break}else{label=17;break};case 17:$64=$40+8|0;if((HEAP32[$64>>2]|0)==($25|0)){$_pre_phi306=$64;label=18;break}else{label=19;break};case 18:HEAP32[$37+12>>2]=$40;HEAP32[$_pre_phi306>>2]=$37;$p_0=$25;$psize_0=$26;label=56;break;case 19:_abort();case 20:_abort();case 21:$69=$24;$72=HEAP32[$mem+($_sum232+24)>>2]|0;$75=HEAP32[$mem+($_sum232+12)>>2]|0;if(($75|0)==($69|0)){label=27;break}else{label=22;break};case 22:$80=HEAP32[$mem+($_sum232+8)>>2]|0;if($80>>>0<$5>>>0){label=26;break}else{label=23;break};case 23:$84=$80+12|0;if((HEAP32[$84>>2]|0)==($69|0)){label=24;break}else{label=26;break};case 24:$88=$75+8|0;if((HEAP32[$88>>2]|0)==($69|0)){label=25;break}else{label=26;break};case 25:HEAP32[$84>>2]=$75;HEAP32[$88>>2]=$80;$R_1=$75;label=34;break;case 26:_abort();case 27:$94=$mem+($_sum232+20)|0;$95=HEAP32[$94>>2]|0;if(($95|0)==0){label=28;break}else{$R_0=$95;$RP_0=$94;label=29;break};case 28:$99=$mem+($_sum232+16)|0;$100=HEAP32[$99>>2]|0;if(($100|0)==0){$R_1=0;label=34;break}else{$R_0=$100;$RP_0=$99;label=29;break};case 29:$102=$R_0+20|0;$103=HEAP32[$102>>2]|0;if(($103|0)==0){label=30;break}else{$R_0=$103;$RP_0=$102;label=29;break};case 30:$106=$R_0+16|0;$107=HEAP32[$106>>2]|0;if(($107|0)==0){label=31;break}else{$R_0=$107;$RP_0=$106;label=29;break};case 31:if($RP_0>>>0<$5>>>0){label=33;break}else{label=32;break};case 32:HEAP32[$RP_0>>2]=0;$R_1=$R_0;label=34;break;case 33:_abort();case 34:if(($72|0)==0){$p_0=$25;$psize_0=$26;label=56;break}else{label=35;break};case 35:$118=$mem+($_sum232+28)|0;$120=2648+(HEAP32[$118>>2]<<2)|0;if(($69|0)==(HEAP32[$120>>2]|0)){label=36;break}else{label=38;break};case 36:HEAP32[$120>>2]=$R_1;if(($R_1|0)==0){label=37;break}else{label=44;break};case 37:HEAP32[587]=HEAP32[587]&~(1<<HEAP32[$118>>2]);$p_0=$25;$psize_0=$26;label=56;break;case 38:if($72>>>0<(HEAP32[590]|0)>>>0){label=42;break}else{label=39;break};case 39:$134=$72+16|0;if((HEAP32[$134>>2]|0)==($69|0)){label=40;break}else{label=41;break};case 40:HEAP32[$134>>2]=$R_1;label=43;break;case 41:HEAP32[$72+20>>2]=$R_1;label=43;break;case 42:_abort();case 43:if(($R_1|0)==0){$p_0=$25;$psize_0=$26;label=56;break}else{label=44;break};case 44:if($R_1>>>0<(HEAP32[590]|0)>>>0){label=53;break}else{label=45;break};case 45:HEAP32[$R_1+24>>2]=$72;$151=HEAP32[$mem+($_sum232+16)>>2]|0;if(($151|0)==0){label=49;break}else{label=46;break};case 46:if($151>>>0<(HEAP32[590]|0)>>>0){label=48;break}else{label=47;break};case 47:HEAP32[$R_1+16>>2]=$151;HEAP32[$151+24>>2]=$R_1;label=49;break;case 48:_abort();case 49:$164=HEAP32[$mem+($_sum232+20)>>2]|0;if(($164|0)==0){$p_0=$25;$psize_0=$26;label=56;break}else{label=50;break};case 50:if($164>>>0<(HEAP32[590]|0)>>>0){label=52;break}else{label=51;break};case 51:HEAP32[$R_1+20>>2]=$164;HEAP32[$164+24>>2]=$R_1;$p_0=$25;$psize_0=$26;label=56;break;case 52:_abort();case 53:_abort();case 54:$177=$mem+($14-4)|0;if((HEAP32[$177>>2]&3|0)==3){label=55;break}else{$p_0=$25;$psize_0=$26;label=56;break};case 55:HEAP32[588]=$26;HEAP32[$177>>2]=HEAP32[$177>>2]&-2;HEAP32[$mem+($_sum232+4)>>2]=$26|1;HEAP32[$15>>2]=$26;label=140;break;case 56:$189=$p_0;if($189>>>0<$15>>>0){label=57;break}else{label=139;break};case 57:$193=$mem+($14-4)|0;$194=HEAP32[$193>>2]|0;if(($194&1|0)==0){label=139;break}else{label=58;break};case 58:if(($194&2|0)==0){label=59;break}else{label=112;break};case 59:if(($16|0)==(HEAP32[592]|0)){label=60;break}else{label=62;break};case 60:$204=(HEAP32[589]|0)+$psize_0|0;HEAP32[589]=$204;HEAP32[592]=$p_0;HEAP32[$p_0+4>>2]=$204|1;if(($p_0|0)==(HEAP32[591]|0)){label=61;break}else{label=140;break};case 61:HEAP32[591]=0;HEAP32[588]=0;label=140;break;case 62:if(($16|0)==(HEAP32[591]|0)){label=63;break}else{label=64;break};case 63:$215=(HEAP32[588]|0)+$psize_0|0;HEAP32[588]=$215;HEAP32[591]=$p_0;HEAP32[$p_0+4>>2]=$215|1;HEAP32[$189+$215>>2]=$215;label=140;break;case 64:$222=($194&-8)+$psize_0|0;$223=$194>>>3;if($194>>>0<256){label=65;break}else{label=77;break};case 65:$228=HEAP32[$mem+$14>>2]|0;$231=HEAP32[$mem+($14|4)>>2]|0;$234=2384+($223<<1<<2)|0;if(($228|0)==($234|0)){label=68;break}else{label=66;break};case 66:if($228>>>0<(HEAP32[590]|0)>>>0){label=76;break}else{label=67;break};case 67:if((HEAP32[$228+12>>2]|0)==($16|0)){label=68;break}else{label=76;break};case 68:if(($231|0)==($228|0)){label=69;break}else{label=70;break};case 69:HEAP32[586]=HEAP32[586]&~(1<<$223);label=110;break;case 70:if(($231|0)==($234|0)){label=71;break}else{label=72;break};case 71:$_pre_phi304=$231+8|0;label=74;break;case 72:if($231>>>0<(HEAP32[590]|0)>>>0){label=75;break}else{label=73;break};case 73:$257=$231+8|0;if((HEAP32[$257>>2]|0)==($16|0)){$_pre_phi304=$257;label=74;break}else{label=75;break};case 74:HEAP32[$228+12>>2]=$231;HEAP32[$_pre_phi304>>2]=$228;label=110;break;case 75:_abort();case 76:_abort();case 77:$262=$15;$265=HEAP32[$mem+($14+16)>>2]|0;$268=HEAP32[$mem+($14|4)>>2]|0;if(($268|0)==($262|0)){label=83;break}else{label=78;break};case 78:$273=HEAP32[$mem+$14>>2]|0;if($273>>>0<(HEAP32[590]|0)>>>0){label=82;break}else{label=79;break};case 79:$278=$273+12|0;if((HEAP32[$278>>2]|0)==($262|0)){label=80;break}else{label=82;break};case 80:$282=$268+8|0;if((HEAP32[$282>>2]|0)==($262|0)){label=81;break}else{label=82;break};case 81:HEAP32[$278>>2]=$268;HEAP32[$282>>2]=$273;$R7_1=$268;label=90;break;case 82:_abort();case 83:$288=$mem+($14+12)|0;$289=HEAP32[$288>>2]|0;if(($289|0)==0){label=84;break}else{$R7_0=$289;$RP9_0=$288;label=85;break};case 84:$293=$mem+($14+8)|0;$294=HEAP32[$293>>2]|0;if(($294|0)==0){$R7_1=0;label=90;break}else{$R7_0=$294;$RP9_0=$293;label=85;break};case 85:$296=$R7_0+20|0;$297=HEAP32[$296>>2]|0;if(($297|0)==0){label=86;break}else{$R7_0=$297;$RP9_0=$296;label=85;break};case 86:$300=$R7_0+16|0;$301=HEAP32[$300>>2]|0;if(($301|0)==0){label=87;break}else{$R7_0=$301;$RP9_0=$300;label=85;break};case 87:if($RP9_0>>>0<(HEAP32[590]|0)>>>0){label=89;break}else{label=88;break};case 88:HEAP32[$RP9_0>>2]=0;$R7_1=$R7_0;label=90;break;case 89:_abort();case 90:if(($265|0)==0){label=110;break}else{label=91;break};case 91:$313=$mem+($14+20)|0;$315=2648+(HEAP32[$313>>2]<<2)|0;if(($262|0)==(HEAP32[$315>>2]|0)){label=92;break}else{label=94;break};case 92:HEAP32[$315>>2]=$R7_1;if(($R7_1|0)==0){label=93;break}else{label=100;break};case 93:HEAP32[587]=HEAP32[587]&~(1<<HEAP32[$313>>2]);label=110;break;case 94:if($265>>>0<(HEAP32[590]|0)>>>0){label=98;break}else{label=95;break};case 95:$329=$265+16|0;if((HEAP32[$329>>2]|0)==($262|0)){label=96;break}else{label=97;break};case 96:HEAP32[$329>>2]=$R7_1;label=99;break;case 97:HEAP32[$265+20>>2]=$R7_1;label=99;break;case 98:_abort();case 99:if(($R7_1|0)==0){label=110;break}else{label=100;break};case 100:if($R7_1>>>0<(HEAP32[590]|0)>>>0){label=109;break}else{label=101;break};case 101:HEAP32[$R7_1+24>>2]=$265;$346=HEAP32[$mem+($14+8)>>2]|0;if(($346|0)==0){label=105;break}else{label=102;break};case 102:if($346>>>0<(HEAP32[590]|0)>>>0){label=104;break}else{label=103;break};case 103:HEAP32[$R7_1+16>>2]=$346;HEAP32[$346+24>>2]=$R7_1;label=105;break;case 104:_abort();case 105:$359=HEAP32[$mem+($14+12)>>2]|0;if(($359|0)==0){label=110;break}else{label=106;break};case 106:if($359>>>0<(HEAP32[590]|0)>>>0){label=108;break}else{label=107;break};case 107:HEAP32[$R7_1+20>>2]=$359;HEAP32[$359+24>>2]=$R7_1;label=110;break;case 108:_abort();case 109:_abort();case 110:HEAP32[$p_0+4>>2]=$222|1;HEAP32[$189+$222>>2]=$222;if(($p_0|0)==(HEAP32[591]|0)){label=111;break}else{$psize_1=$222;label=113;break};case 111:HEAP32[588]=$222;label=140;break;case 112:HEAP32[$193>>2]=$194&-2;HEAP32[$p_0+4>>2]=$psize_0|1;HEAP32[$189+$psize_0>>2]=$psize_0;$psize_1=$psize_0;label=113;break;case 113:$385=$psize_1>>>3;if($psize_1>>>0<256){label=114;break}else{label=119;break};case 114:$388=$385<<1;$390=2384+($388<<2)|0;$391=HEAP32[586]|0;$392=1<<$385;if(($391&$392|0)==0){label=115;break}else{label=116;break};case 115:HEAP32[586]=$391|$392;$F16_0=$390;$_pre_phi=2384+($388+2<<2)|0;label=118;break;case 116:$398=2384+($388+2<<2)|0;$399=HEAP32[$398>>2]|0;if($399>>>0<(HEAP32[590]|0)>>>0){label=117;break}else{$F16_0=$399;$_pre_phi=$398;label=118;break};case 117:_abort();case 118:HEAP32[$_pre_phi>>2]=$p_0;HEAP32[$F16_0+12>>2]=$p_0;HEAP32[$p_0+8>>2]=$F16_0;HEAP32[$p_0+12>>2]=$390;label=140;break;case 119:$409=$p_0;$410=$psize_1>>>8;if(($410|0)==0){$I18_0=0;label=122;break}else{label=120;break};case 120:if($psize_1>>>0>16777215){$I18_0=31;label=122;break}else{label=121;break};case 121:$417=($410+1048320|0)>>>16&8;$418=$410<<$417;$421=($418+520192|0)>>>16&4;$423=$418<<$421;$426=($423+245760|0)>>>16&2;$431=14-($421|$417|$426)+($423<<$426>>>15)|0;$I18_0=$psize_1>>>(($431+7|0)>>>0)&1|$431<<1;label=122;break;case 122:$438=2648+($I18_0<<2)|0;HEAP32[$p_0+28>>2]=$I18_0;HEAP32[$p_0+20>>2]=0;HEAP32[$p_0+16>>2]=0;$442=HEAP32[587]|0;$443=1<<$I18_0;if(($442&$443|0)==0){label=123;break}else{label=124;break};case 123:HEAP32[587]=$442|$443;HEAP32[$438>>2]=$409;HEAP32[$p_0+24>>2]=$438;HEAP32[$p_0+12>>2]=$p_0;HEAP32[$p_0+8>>2]=$p_0;label=136;break;case 124:if(($I18_0|0)==31){$458=0;label=126;break}else{label=125;break};case 125:$458=25-($I18_0>>>1)|0;label=126;break;case 126:$K19_0=$psize_1<<$458;$T_0=HEAP32[$438>>2]|0;label=127;break;case 127:if((HEAP32[$T_0+4>>2]&-8|0)==($psize_1|0)){label=132;break}else{label=128;break};case 128:$467=$T_0+16+($K19_0>>>31<<2)|0;$468=HEAP32[$467>>2]|0;if(($468|0)==0){label=129;break}else{$K19_0=$K19_0<<1;$T_0=$468;label=127;break};case 129:if($467>>>0<(HEAP32[590]|0)>>>0){label=131;break}else{label=130;break};case 130:HEAP32[$467>>2]=$409;HEAP32[$p_0+24>>2]=$T_0;HEAP32[$p_0+12>>2]=$p_0;HEAP32[$p_0+8>>2]=$p_0;label=136;break;case 131:_abort();case 132:$481=$T_0+8|0;$482=HEAP32[$481>>2]|0;$484=HEAP32[590]|0;if($T_0>>>0<$484>>>0){label=135;break}else{label=133;break};case 133:if($482>>>0<$484>>>0){label=135;break}else{label=134;break};case 134:HEAP32[$482+12>>2]=$409;HEAP32[$481>>2]=$409;HEAP32[$p_0+8>>2]=$482;HEAP32[$p_0+12>>2]=$T_0;HEAP32[$p_0+24>>2]=0;label=136;break;case 135:_abort();case 136:$496=(HEAP32[594]|0)-1|0;HEAP32[594]=$496;if(($496|0)==0){$sp_0_in_i=2800;label=137;break}else{label=140;break};case 137:$sp_0_i=HEAP32[$sp_0_in_i>>2]|0;if(($sp_0_i|0)==0){label=138;break}else{$sp_0_in_i=$sp_0_i+8|0;label=137;break};case 138:HEAP32[594]=-1;label=140;break;case 139:_abort();case 140:return}}function _realloc($oldmem,$bytes){$oldmem=$oldmem|0;$bytes=$bytes|0;var $14=0,$17=0,$23=0,$28=0,$33=0,$mem_0=0,label=0;label=1;while(1)switch(label|0){case 1:if(($oldmem|0)==0){label=2;break}else{label=3;break};case 2:$mem_0=_malloc($bytes)|0;label=11;break;case 3:if($bytes>>>0>4294967231){label=4;break}else{label=5;break};case 4:HEAP32[(___errno_location()|0)>>2]=12;$mem_0=0;label=11;break;case 5:if($bytes>>>0<11){$14=16;label=7;break}else{label=6;break};case 6:$14=$bytes+11&-8;label=7;break;case 7:$17=_try_realloc_chunk($oldmem-8|0,$14)|0;if(($17|0)==0){label=9;break}else{label=8;break};case 8:$mem_0=$17+8|0;label=11;break;case 9:$23=_malloc($bytes)|0;if(($23|0)==0){$mem_0=0;label=11;break}else{label=10;break};case 10:$28=HEAP32[$oldmem-4>>2]|0;$33=($28&-8)-(($28&3|0)==0?8:4)|0;_memcpy($23|0,$oldmem|0,$33>>>0<$bytes>>>0?$33:$bytes)|0;_free($oldmem);$mem_0=$23;label=11;break;case 11:return $mem_0|0}return 0}function _try_realloc_chunk($p,$nb){$p=$p|0;$nb=$nb|0;var $1=0,$2=0,$3=0,$4=0,$5=0,$6=0,$7=0,$10=0,$15=0,$16=0,$34=0,$52=0,$55=0,$69=0,$72=0,$86=0,$94=0,$storemerge27=0,$storemerge=0,$103=0,$106=0,$107=0,$112=0,$115=0,$118=0,$139=0,$_pre_phi=0,$144=0,$147=0,$150=0,$155=0,$159=0,$163=0,$169=0,$170=0,$174=0,$175=0,$RP_0=0,$R_0=0,$177=0,$178=0,$181=0,$182=0,$R_1=0,$193=0,$195=0,$209=0,$226=0,$239=0,$258=0,$272=0,$newp_0=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$p+4|0;$2=HEAP32[$1>>2]|0;$3=$2&-8;$4=$p;$5=$4+$3|0;$6=$5;$7=HEAP32[590]|0;if($4>>>0<$7>>>0){label=72;break}else{label=2;break};case 2:$10=$2&3;if(($10|0)!=1&$4>>>0<$5>>>0){label=3;break}else{label=72;break};case 3:$15=$4+($3|4)|0;$16=HEAP32[$15>>2]|0;if(($16&1|0)==0){label=72;break}else{label=4;break};case 4:if(($10|0)==0){label=5;break}else{label=9;break};case 5:if($nb>>>0<256){$newp_0=0;label=73;break}else{label=6;break};case 6:if($3>>>0<($nb+4|0)>>>0){label=8;break}else{label=7;break};case 7:if(($3-$nb|0)>>>0>HEAP32[582]<<1>>>0){label=8;break}else{$newp_0=$p;label=73;break};case 8:$newp_0=0;label=73;break;case 9:if($3>>>0<$nb>>>0){label=12;break}else{label=10;break};case 10:$34=$3-$nb|0;if($34>>>0>15){label=11;break}else{$newp_0=$p;label=73;break};case 11:HEAP32[$1>>2]=$2&1|$nb|2;HEAP32[$4+($nb+4)>>2]=$34|3;HEAP32[$15>>2]=HEAP32[$15>>2]|1;_dispose_chunk($4+$nb|0,$34);$newp_0=$p;label=73;break;case 12:if(($6|0)==(HEAP32[592]|0)){label=13;break}else{label=15;break};case 13:$52=(HEAP32[589]|0)+$3|0;if($52>>>0>$nb>>>0){label=14;break}else{$newp_0=0;label=73;break};case 14:$55=$52-$nb|0;HEAP32[$1>>2]=$2&1|$nb|2;HEAP32[$4+($nb+4)>>2]=$55|1;HEAP32[592]=$4+$nb;HEAP32[589]=$55;$newp_0=$p;label=73;break;case 15:if(($6|0)==(HEAP32[591]|0)){label=16;break}else{label=21;break};case 16:$69=(HEAP32[588]|0)+$3|0;if($69>>>0<$nb>>>0){$newp_0=0;label=73;break}else{label=17;break};case 17:$72=$69-$nb|0;if($72>>>0>15){label=18;break}else{label=19;break};case 18:HEAP32[$1>>2]=$2&1|$nb|2;HEAP32[$4+($nb+4)>>2]=$72|1;HEAP32[$4+$69>>2]=$72;$86=$4+($69+4)|0;HEAP32[$86>>2]=HEAP32[$86>>2]&-2;$storemerge=$4+$nb|0;$storemerge27=$72;label=20;break;case 19:HEAP32[$1>>2]=$2&1|$69|2;$94=$4+($69+4)|0;HEAP32[$94>>2]=HEAP32[$94>>2]|1;$storemerge=0;$storemerge27=0;label=20;break;case 20:HEAP32[588]=$storemerge27;HEAP32[591]=$storemerge;$newp_0=$p;label=73;break;case 21:if(($16&2|0)==0){label=22;break}else{$newp_0=0;label=73;break};case 22:$103=($16&-8)+$3|0;if($103>>>0<$nb>>>0){$newp_0=0;label=73;break}else{label=23;break};case 23:$106=$103-$nb|0;$107=$16>>>3;if($16>>>0<256){label=24;break}else{label=36;break};case 24:$112=HEAP32[$4+($3+8)>>2]|0;$115=HEAP32[$4+($3+12)>>2]|0;$118=2384+($107<<1<<2)|0;if(($112|0)==($118|0)){label=27;break}else{label=25;break};case 25:if($112>>>0<$7>>>0){label=35;break}else{label=26;break};case 26:if((HEAP32[$112+12>>2]|0)==($6|0)){label=27;break}else{label=35;break};case 27:if(($115|0)==($112|0)){label=28;break}else{label=29;break};case 28:HEAP32[586]=HEAP32[586]&~(1<<$107);label=69;break;case 29:if(($115|0)==($118|0)){label=30;break}else{label=31;break};case 30:$_pre_phi=$115+8|0;label=33;break;case 31:if($115>>>0<$7>>>0){label=34;break}else{label=32;break};case 32:$139=$115+8|0;if((HEAP32[$139>>2]|0)==($6|0)){$_pre_phi=$139;label=33;break}else{label=34;break};case 33:HEAP32[$112+12>>2]=$115;HEAP32[$_pre_phi>>2]=$112;label=69;break;case 34:_abort();return 0;return 0;case 35:_abort();return 0;return 0;case 36:$144=$5;$147=HEAP32[$4+($3+24)>>2]|0;$150=HEAP32[$4+($3+12)>>2]|0;if(($150|0)==($144|0)){label=42;break}else{label=37;break};case 37:$155=HEAP32[$4+($3+8)>>2]|0;if($155>>>0<$7>>>0){label=41;break}else{label=38;break};case 38:$159=$155+12|0;if((HEAP32[$159>>2]|0)==($144|0)){label=39;break}else{label=41;break};case 39:$163=$150+8|0;if((HEAP32[$163>>2]|0)==($144|0)){label=40;break}else{label=41;break};case 40:HEAP32[$159>>2]=$150;HEAP32[$163>>2]=$155;$R_1=$150;label=49;break;case 41:_abort();return 0;return 0;case 42:$169=$4+($3+20)|0;$170=HEAP32[$169>>2]|0;if(($170|0)==0){label=43;break}else{$R_0=$170;$RP_0=$169;label=44;break};case 43:$174=$4+($3+16)|0;$175=HEAP32[$174>>2]|0;if(($175|0)==0){$R_1=0;label=49;break}else{$R_0=$175;$RP_0=$174;label=44;break};case 44:$177=$R_0+20|0;$178=HEAP32[$177>>2]|0;if(($178|0)==0){label=45;break}else{$R_0=$178;$RP_0=$177;label=44;break};case 45:$181=$R_0+16|0;$182=HEAP32[$181>>2]|0;if(($182|0)==0){label=46;break}else{$R_0=$182;$RP_0=$181;label=44;break};case 46:if($RP_0>>>0<$7>>>0){label=48;break}else{label=47;break};case 47:HEAP32[$RP_0>>2]=0;$R_1=$R_0;label=49;break;case 48:_abort();return 0;return 0;case 49:if(($147|0)==0){label=69;break}else{label=50;break};case 50:$193=$4+($3+28)|0;$195=2648+(HEAP32[$193>>2]<<2)|0;if(($144|0)==(HEAP32[$195>>2]|0)){label=51;break}else{label=53;break};case 51:HEAP32[$195>>2]=$R_1;if(($R_1|0)==0){label=52;break}else{label=59;break};case 52:HEAP32[587]=HEAP32[587]&~(1<<HEAP32[$193>>2]);label=69;break;case 53:if($147>>>0<(HEAP32[590]|0)>>>0){label=57;break}else{label=54;break};case 54:$209=$147+16|0;if((HEAP32[$209>>2]|0)==($144|0)){label=55;break}else{label=56;break};case 55:HEAP32[$209>>2]=$R_1;label=58;break;case 56:HEAP32[$147+20>>2]=$R_1;label=58;break;case 57:_abort();return 0;return 0;case 58:if(($R_1|0)==0){label=69;break}else{label=59;break};case 59:if($R_1>>>0<(HEAP32[590]|0)>>>0){label=68;break}else{label=60;break};case 60:HEAP32[$R_1+24>>2]=$147;$226=HEAP32[$4+($3+16)>>2]|0;if(($226|0)==0){label=64;break}else{label=61;break};case 61:if($226>>>0<(HEAP32[590]|0)>>>0){label=63;break}else{label=62;break};case 62:HEAP32[$R_1+16>>2]=$226;HEAP32[$226+24>>2]=$R_1;label=64;break;case 63:_abort();return 0;return 0;case 64:$239=HEAP32[$4+($3+20)>>2]|0;if(($239|0)==0){label=69;break}else{label=65;break};case 65:if($239>>>0<(HEAP32[590]|0)>>>0){label=67;break}else{label=66;break};case 66:HEAP32[$R_1+20>>2]=$239;HEAP32[$239+24>>2]=$R_1;label=69;break;case 67:_abort();return 0;return 0;case 68:_abort();return 0;return 0;case 69:if($106>>>0<16){label=70;break}else{label=71;break};case 70:HEAP32[$1>>2]=$103|HEAP32[$1>>2]&1|2;$258=$4+($103|4)|0;HEAP32[$258>>2]=HEAP32[$258>>2]|1;$newp_0=$p;label=73;break;case 71:HEAP32[$1>>2]=HEAP32[$1>>2]&1|$nb|2;HEAP32[$4+($nb+4)>>2]=$106|3;$272=$4+($103|4)|0;HEAP32[$272>>2]=HEAP32[$272>>2]|1;_dispose_chunk($4+$nb|0,$106);$newp_0=$p;label=73;break;case 72:_abort();return 0;return 0;case 73:return $newp_0|0}return 0}function _dispose_chunk($p,$psize){$p=$p|0;$psize=$psize|0;var $1=0,$2=0,$3=0,$5=0,$10=0,$15=0,$16=0,$17=0,$18=0,$24=0,$29=0,$32=0,$35=0,$56=0,$_pre_phi63=0,$61=0,$64=0,$67=0,$72=0,$76=0,$80=0,$_sum28=0,$86=0,$87=0,$91=0,$92=0,$RP_0=0,$R_0=0,$94=0,$95=0,$98=0,$99=0,$R_1=0,$110=0,$112=0,$126=0,$_sum31=0,$143=0,$156=0,$169=0,$_0277=0,$_0=0,$181=0,$185=0,$186=0,$194=0,$205=0,$213=0,$214=0,$219=0,$222=0,$225=0,$246=0,$_pre_phi61=0,$251=0,$254=0,$257=0,$262=0,$266=0,$270=0,$276=0,$277=0,$281=0,$282=0,$RP9_0=0,$R7_0=0,$284=0,$285=0,$288=0,$289=0,$R7_1=0,$300=0,$302=0,$316=0,$333=0,$346=0,$_1=0,$374=0,$377=0,$379=0,$380=0,$381=0,$387=0,$388=0,$_pre_phi=0,$F16_0=0,$398=0,$399=0,$406=0,$407=0,$410=0,$412=0,$415=0,$420=0,$I19_0=0,$427=0,$431=0,$432=0,$447=0,$T_0=0,$K20_0=0,$456=0,$457=0,$470=0,$471=0,$473=0,label=0;label=1;while(1)switch(label|0){case 1:$1=$p;$2=$1+$psize|0;$3=$2;$5=HEAP32[$p+4>>2]|0;if(($5&1|0)==0){label=2;break}else{$_0=$p;$_0277=$psize;label=54;break};case 2:$10=HEAP32[$p>>2]|0;if(($5&3|0)==0){label=134;break}else{label=3;break};case 3:$15=$1+(-$10|0)|0;$16=$15;$17=$10+$psize|0;$18=HEAP32[590]|0;if($15>>>0<$18>>>0){label=53;break}else{label=4;break};case 4:if(($16|0)==(HEAP32[591]|0)){label=51;break}else{label=5;break};case 5:$24=$10>>>3;if($10>>>0<256){label=6;break}else{label=18;break};case 6:$29=HEAP32[$1+(8-$10)>>2]|0;$32=HEAP32[$1+(12-$10)>>2]|0;$35=2384+($24<<1<<2)|0;if(($29|0)==($35|0)){label=9;break}else{label=7;break};case 7:if($29>>>0<$18>>>0){label=17;break}else{label=8;break};case 8:if((HEAP32[$29+12>>2]|0)==($16|0)){label=9;break}else{label=17;break};case 9:if(($32|0)==($29|0)){label=10;break}else{label=11;break};case 10:HEAP32[586]=HEAP32[586]&~(1<<$24);$_0=$16;$_0277=$17;label=54;break;case 11:if(($32|0)==($35|0)){label=12;break}else{label=13;break};case 12:$_pre_phi63=$32+8|0;label=15;break;case 13:if($32>>>0<$18>>>0){label=16;break}else{label=14;break};case 14:$56=$32+8|0;if((HEAP32[$56>>2]|0)==($16|0)){$_pre_phi63=$56;label=15;break}else{label=16;break};case 15:HEAP32[$29+12>>2]=$32;HEAP32[$_pre_phi63>>2]=$29;$_0=$16;$_0277=$17;label=54;break;case 16:_abort();case 17:_abort();case 18:$61=$15;$64=HEAP32[$1+(24-$10)>>2]|0;$67=HEAP32[$1+(12-$10)>>2]|0;if(($67|0)==($61|0)){label=24;break}else{label=19;break};case 19:$72=HEAP32[$1+(8-$10)>>2]|0;if($72>>>0<$18>>>0){label=23;break}else{label=20;break};case 20:$76=$72+12|0;if((HEAP32[$76>>2]|0)==($61|0)){label=21;break}else{label=23;break};case 21:$80=$67+8|0;if((HEAP32[$80>>2]|0)==($61|0)){label=22;break}else{label=23;break};case 22:HEAP32[$76>>2]=$67;HEAP32[$80>>2]=$72;$R_1=$67;label=31;break;case 23:_abort();case 24:$_sum28=16-$10|0;$86=$1+($_sum28+4)|0;$87=HEAP32[$86>>2]|0;if(($87|0)==0){label=25;break}else{$R_0=$87;$RP_0=$86;label=26;break};case 25:$91=$1+$_sum28|0;$92=HEAP32[$91>>2]|0;if(($92|0)==0){$R_1=0;label=31;break}else{$R_0=$92;$RP_0=$91;label=26;break};case 26:$94=$R_0+20|0;$95=HEAP32[$94>>2]|0;if(($95|0)==0){label=27;break}else{$R_0=$95;$RP_0=$94;label=26;break};case 27:$98=$R_0+16|0;$99=HEAP32[$98>>2]|0;if(($99|0)==0){label=28;break}else{$R_0=$99;$RP_0=$98;label=26;break};case 28:if($RP_0>>>0<$18>>>0){label=30;break}else{label=29;break};case 29:HEAP32[$RP_0>>2]=0;$R_1=$R_0;label=31;break;case 30:_abort();case 31:if(($64|0)==0){$_0=$16;$_0277=$17;label=54;break}else{label=32;break};case 32:$110=$1+(28-$10)|0;$112=2648+(HEAP32[$110>>2]<<2)|0;if(($61|0)==(HEAP32[$112>>2]|0)){label=33;break}else{label=35;break};case 33:HEAP32[$112>>2]=$R_1;if(($R_1|0)==0){label=34;break}else{label=41;break};case 34:HEAP32[587]=HEAP32[587]&~(1<<HEAP32[$110>>2]);$_0=$16;$_0277=$17;label=54;break;case 35:if($64>>>0<(HEAP32[590]|0)>>>0){label=39;break}else{label=36;break};case 36:$126=$64+16|0;if((HEAP32[$126>>2]|0)==($61|0)){label=37;break}else{label=38;break};case 37:HEAP32[$126>>2]=$R_1;label=40;break;case 38:HEAP32[$64+20>>2]=$R_1;label=40;break;case 39:_abort();case 40:if(($R_1|0)==0){$_0=$16;$_0277=$17;label=54;break}else{label=41;break};case 41:if($R_1>>>0<(HEAP32[590]|0)>>>0){label=50;break}else{label=42;break};case 42:HEAP32[$R_1+24>>2]=$64;$_sum31=16-$10|0;$143=HEAP32[$1+$_sum31>>2]|0;if(($143|0)==0){label=46;break}else{label=43;break};case 43:if($143>>>0<(HEAP32[590]|0)>>>0){label=45;break}else{label=44;break};case 44:HEAP32[$R_1+16>>2]=$143;HEAP32[$143+24>>2]=$R_1;label=46;break;case 45:_abort();case 46:$156=HEAP32[$1+($_sum31+4)>>2]|0;if(($156|0)==0){$_0=$16;$_0277=$17;label=54;break}else{label=47;break};case 47:if($156>>>0<(HEAP32[590]|0)>>>0){label=49;break}else{label=48;break};case 48:HEAP32[$R_1+20>>2]=$156;HEAP32[$156+24>>2]=$R_1;$_0=$16;$_0277=$17;label=54;break;case 49:_abort();case 50:_abort();case 51:$169=$1+($psize+4)|0;if((HEAP32[$169>>2]&3|0)==3){label=52;break}else{$_0=$16;$_0277=$17;label=54;break};case 52:HEAP32[588]=$17;HEAP32[$169>>2]=HEAP32[$169>>2]&-2;HEAP32[$1+(4-$10)>>2]=$17|1;HEAP32[$2>>2]=$17;label=134;break;case 53:_abort();case 54:$181=HEAP32[590]|0;if($2>>>0<$181>>>0){label=133;break}else{label=55;break};case 55:$185=$1+($psize+4)|0;$186=HEAP32[$185>>2]|0;if(($186&2|0)==0){label=56;break}else{label=109;break};case 56:if(($3|0)==(HEAP32[592]|0)){label=57;break}else{label=59;break};case 57:$194=(HEAP32[589]|0)+$_0277|0;HEAP32[589]=$194;HEAP32[592]=$_0;HEAP32[$_0+4>>2]=$194|1;if(($_0|0)==(HEAP32[591]|0)){label=58;break}else{label=134;break};case 58:HEAP32[591]=0;HEAP32[588]=0;label=134;break;case 59:if(($3|0)==(HEAP32[591]|0)){label=60;break}else{label=61;break};case 60:$205=(HEAP32[588]|0)+$_0277|0;HEAP32[588]=$205;HEAP32[591]=$_0;HEAP32[$_0+4>>2]=$205|1;HEAP32[$_0+$205>>2]=$205;label=134;break;case 61:$213=($186&-8)+$_0277|0;$214=$186>>>3;if($186>>>0<256){label=62;break}else{label=74;break};case 62:$219=HEAP32[$1+($psize+8)>>2]|0;$222=HEAP32[$1+($psize+12)>>2]|0;$225=2384+($214<<1<<2)|0;if(($219|0)==($225|0)){label=65;break}else{label=63;break};case 63:if($219>>>0<$181>>>0){label=73;break}else{label=64;break};case 64:if((HEAP32[$219+12>>2]|0)==($3|0)){label=65;break}else{label=73;break};case 65:if(($222|0)==($219|0)){label=66;break}else{label=67;break};case 66:HEAP32[586]=HEAP32[586]&~(1<<$214);label=107;break;case 67:if(($222|0)==($225|0)){label=68;break}else{label=69;break};case 68:$_pre_phi61=$222+8|0;label=71;break;case 69:if($222>>>0<$181>>>0){label=72;break}else{label=70;break};case 70:$246=$222+8|0;if((HEAP32[$246>>2]|0)==($3|0)){$_pre_phi61=$246;label=71;break}else{label=72;break};case 71:HEAP32[$219+12>>2]=$222;HEAP32[$_pre_phi61>>2]=$219;label=107;break;case 72:_abort();case 73:_abort();case 74:$251=$2;$254=HEAP32[$1+($psize+24)>>2]|0;$257=HEAP32[$1+($psize+12)>>2]|0;if(($257|0)==($251|0)){label=80;break}else{label=75;break};case 75:$262=HEAP32[$1+($psize+8)>>2]|0;if($262>>>0<$181>>>0){label=79;break}else{label=76;break};case 76:$266=$262+12|0;if((HEAP32[$266>>2]|0)==($251|0)){label=77;break}else{label=79;break};case 77:$270=$257+8|0;if((HEAP32[$270>>2]|0)==($251|0)){label=78;break}else{label=79;break};case 78:HEAP32[$266>>2]=$257;HEAP32[$270>>2]=$262;$R7_1=$257;label=87;break;case 79:_abort();case 80:$276=$1+($psize+20)|0;$277=HEAP32[$276>>2]|0;if(($277|0)==0){label=81;break}else{$R7_0=$277;$RP9_0=$276;label=82;break};case 81:$281=$1+($psize+16)|0;$282=HEAP32[$281>>2]|0;if(($282|0)==0){$R7_1=0;label=87;break}else{$R7_0=$282;$RP9_0=$281;label=82;break};case 82:$284=$R7_0+20|0;$285=HEAP32[$284>>2]|0;if(($285|0)==0){label=83;break}else{$R7_0=$285;$RP9_0=$284;label=82;break};case 83:$288=$R7_0+16|0;$289=HEAP32[$288>>2]|0;if(($289|0)==0){label=84;break}else{$R7_0=$289;$RP9_0=$288;label=82;break};case 84:if($RP9_0>>>0<$181>>>0){label=86;break}else{label=85;break};case 85:HEAP32[$RP9_0>>2]=0;$R7_1=$R7_0;label=87;break;case 86:_abort();case 87:if(($254|0)==0){label=107;break}else{label=88;break};case 88:$300=$1+($psize+28)|0;$302=2648+(HEAP32[$300>>2]<<2)|0;if(($251|0)==(HEAP32[$302>>2]|0)){label=89;break}else{label=91;break};case 89:HEAP32[$302>>2]=$R7_1;if(($R7_1|0)==0){label=90;break}else{label=97;break};case 90:HEAP32[587]=HEAP32[587]&~(1<<HEAP32[$300>>2]);label=107;break;case 91:if($254>>>0<(HEAP32[590]|0)>>>0){label=95;break}else{label=92;break};case 92:$316=$254+16|0;if((HEAP32[$316>>2]|0)==($251|0)){label=93;break}else{label=94;break};case 93:HEAP32[$316>>2]=$R7_1;label=96;break;case 94:HEAP32[$254+20>>2]=$R7_1;label=96;break;case 95:_abort();case 96:if(($R7_1|0)==0){label=107;break}else{label=97;break};case 97:if($R7_1>>>0<(HEAP32[590]|0)>>>0){label=106;break}else{label=98;break};case 98:HEAP32[$R7_1+24>>2]=$254;$333=HEAP32[$1+($psize+16)>>2]|0;if(($333|0)==0){label=102;break}else{label=99;break};case 99:if($333>>>0<(HEAP32[590]|0)>>>0){label=101;break}else{label=100;break};case 100:HEAP32[$R7_1+16>>2]=$333;HEAP32[$333+24>>2]=$R7_1;label=102;break;case 101:_abort();case 102:$346=HEAP32[$1+($psize+20)>>2]|0;if(($346|0)==0){label=107;break}else{label=103;break};case 103:if($346>>>0<(HEAP32[590]|0)>>>0){label=105;break}else{label=104;break};case 104:HEAP32[$R7_1+20>>2]=$346;HEAP32[$346+24>>2]=$R7_1;label=107;break;case 105:_abort();case 106:_abort();case 107:HEAP32[$_0+4>>2]=$213|1;HEAP32[$_0+$213>>2]=$213;if(($_0|0)==(HEAP32[591]|0)){label=108;break}else{$_1=$213;label=110;break};case 108:HEAP32[588]=$213;label=134;break;case 109:HEAP32[$185>>2]=$186&-2;HEAP32[$_0+4>>2]=$_0277|1;HEAP32[$_0+$_0277>>2]=$_0277;$_1=$_0277;label=110;break;case 110:$374=$_1>>>3;if($_1>>>0<256){label=111;break}else{label=116;break};case 111:$377=$374<<1;$379=2384+($377<<2)|0;$380=HEAP32[586]|0;$381=1<<$374;if(($380&$381|0)==0){label=112;break}else{label=113;break};case 112:HEAP32[586]=$380|$381;$F16_0=$379;$_pre_phi=2384+($377+2<<2)|0;label=115;break;case 113:$387=2384+($377+2<<2)|0;$388=HEAP32[$387>>2]|0;if($388>>>0<(HEAP32[590]|0)>>>0){label=114;break}else{$F16_0=$388;$_pre_phi=$387;label=115;break};case 114:_abort();case 115:HEAP32[$_pre_phi>>2]=$_0;HEAP32[$F16_0+12>>2]=$_0;HEAP32[$_0+8>>2]=$F16_0;HEAP32[$_0+12>>2]=$379;label=134;break;case 116:$398=$_0;$399=$_1>>>8;if(($399|0)==0){$I19_0=0;label=119;break}else{label=117;break};case 117:if($_1>>>0>16777215){$I19_0=31;label=119;break}else{label=118;break};case 118:$406=($399+1048320|0)>>>16&8;$407=$399<<$406;$410=($407+520192|0)>>>16&4;$412=$407<<$410;$415=($412+245760|0)>>>16&2;$420=14-($410|$406|$415)+($412<<$415>>>15)|0;$I19_0=$_1>>>(($420+7|0)>>>0)&1|$420<<1;label=119;break;case 119:$427=2648+($I19_0<<2)|0;HEAP32[$_0+28>>2]=$I19_0;HEAP32[$_0+20>>2]=0;HEAP32[$_0+16>>2]=0;$431=HEAP32[587]|0;$432=1<<$I19_0;if(($431&$432|0)==0){label=120;break}else{label=121;break};case 120:HEAP32[587]=$431|$432;HEAP32[$427>>2]=$398;HEAP32[$_0+24>>2]=$427;HEAP32[$_0+12>>2]=$_0;HEAP32[$_0+8>>2]=$_0;label=134;break;case 121:if(($I19_0|0)==31){$447=0;label=123;break}else{label=122;break};case 122:$447=25-($I19_0>>>1)|0;label=123;break;case 123:$K20_0=$_1<<$447;$T_0=HEAP32[$427>>2]|0;label=124;break;case 124:if((HEAP32[$T_0+4>>2]&-8|0)==($_1|0)){label=129;break}else{label=125;break};case 125:$456=$T_0+16+($K20_0>>>31<<2)|0;$457=HEAP32[$456>>2]|0;if(($457|0)==0){label=126;break}else{$K20_0=$K20_0<<1;$T_0=$457;label=124;break};case 126:if($456>>>0<(HEAP32[590]|0)>>>0){label=128;break}else{label=127;break};case 127:HEAP32[$456>>2]=$398;HEAP32[$_0+24>>2]=$T_0;HEAP32[$_0+12>>2]=$_0;HEAP32[$_0+8>>2]=$_0;label=134;break;case 128:_abort();case 129:$470=$T_0+8|0;$471=HEAP32[$470>>2]|0;$473=HEAP32[590]|0;if($T_0>>>0<$473>>>0){label=132;break}else{label=130;break};case 130:if($471>>>0<$473>>>0){label=132;break}else{label=131;break};case 131:HEAP32[$471+12>>2]=$398;HEAP32[$470>>2]=$398;HEAP32[$_0+8>>2]=$471;HEAP32[$_0+12>>2]=$T_0;HEAP32[$_0+24>>2]=0;label=134;break;case 132:_abort();case 133:_abort();case 134:return}}function _memset(ptr,value,num){ptr=ptr|0;value=value|0;num=num|0;var stop=0,value4=0,stop4=0,unaligned=0;stop=ptr+num|0;if((num|0)>=20){value=value&255;unaligned=ptr&3;value4=value|value<<8|value<<16|value<<24;stop4=stop&~3;if(unaligned){unaligned=ptr+4-unaligned|0;while((ptr|0)<(unaligned|0)){HEAP8[ptr]=value;ptr=ptr+1|0}}while((ptr|0)<(stop4|0)){HEAP32[ptr>>2]=value4;ptr=ptr+4|0}}while((ptr|0)<(stop|0)){HEAP8[ptr]=value;ptr=ptr+1|0}}function _saveSetjmp(env,label,table){env=env|0;label=label|0;table=table|0;var i=0;setjmpId=setjmpId+1|0;HEAP32[env>>2]=setjmpId;while((i|0)<40){if((HEAP32[table+(i<<2)>>2]|0)==0){HEAP32[table+(i<<2)>>2]=setjmpId;HEAP32[table+((i<<2)+4)>>2]=label;HEAP32[table+((i<<2)+8)>>2]=0;return 0}i=i+2|0}_putchar(116);_putchar(111);_putchar(111);_putchar(32);_putchar(109);_putchar(97);_putchar(110);_putchar(121);_putchar(32);_putchar(115);_putchar(101);_putchar(116);_putchar(106);_putchar(109);_putchar(112);_putchar(115);_putchar(32);_putchar(105);_putchar(110);_putchar(32);_putchar(97);_putchar(32);_putchar(102);_putchar(117);_putchar(110);_putchar(99);_putchar(116);_putchar(105);_putchar(111);_putchar(110);_putchar(32);_putchar(99);_putchar(97);_putchar(108);_putchar(108);_putchar(44);_putchar(32);_putchar(98);_putchar(117);_putchar(105);_putchar(108);_putchar(100);_putchar(32);_putchar(119);_putchar(105);_putchar(116);_putchar(104);_putchar(32);_putchar(97);_putchar(32);_putchar(104);_putchar(105);_putchar(103);_putchar(104);_putchar(101);_putchar(114);_putchar(32);_putchar(118);_putchar(97);_putchar(108);_putchar(117);_putchar(101);_putchar(32);_putchar(102);_putchar(111);_putchar(114);_putchar(32);_putchar(77);_putchar(65);_putchar(88);_putchar(95);_putchar(83);_putchar(69);_putchar(84);_putchar(74);_putchar(77);_putchar(80);_putchar(83);_putchar(10);abort(0);return 0}function _testSetjmp(id,table){id=id|0;table=table|0;var i=0,curr=0;while((i|0)<20){curr=HEAP32[table+(i<<2)>>2]|0;if((curr|0)==0)break;if((curr|0)==(id|0)){return HEAP32[table+((i<<2)+4)>>2]|0}i=i+2|0}return 0}function _memcpy(dest,src,num){dest=dest|0;src=src|0;num=num|0;var ret=0;ret=dest|0;if((dest&3)==(src&3)){while(dest&3){if((num|0)==0)return ret|0;HEAP8[dest]=HEAP8[src]|0;dest=dest+1|0;src=src+1|0;num=num-1|0}while((num|0)>=4){HEAP32[dest>>2]=HEAP32[src>>2];dest=dest+4|0;src=src+4|0;num=num-4|0}}while((num|0)>0){HEAP8[dest]=HEAP8[src]|0;dest=dest+1|0;src=src+1|0;num=num-1|0}return ret|0}function _strlen(ptr){ptr=ptr|0;var curr=0;curr=ptr;while(HEAP8[curr]|0){curr=curr+1|0}return curr-ptr|0}function vii__longjmp__wrapper(a1,a2){a1=a1|0;a2=a2|0;_longjmp(a1|0,a2|0)}function dynCall_ii(index,a1){index=index|0;a1=a1|0;return FUNCTION_TABLE_ii[index&127](a1|0)|0}function dynCall_viiiii(index,a1,a2,a3,a4,a5){index=index|0;a1=a1|0;a2=a2|0;a3=a3|0;a4=a4|0;a5=a5|0;FUNCTION_TABLE_viiiii[index&127](a1|0,a2|0,a3|0,a4|0,a5|0)}function dynCall_vi(index,a1){index=index|0;a1=a1|0;FUNCTION_TABLE_vi[index&127](a1|0)}function dynCall_vii(index,a1,a2){index=index|0;a1=a1|0;a2=a2|0;FUNCTION_TABLE_vii[index&127](a1|0,a2|0)}function dynCall_iiii(index,a1,a2,a3){index=index|0;a1=a1|0;a2=a2|0;a3=a3|0;return FUNCTION_TABLE_iiii[index&127](a1|0,a2|0,a3|0)|0}function dynCall_viii(index,a1,a2,a3){index=index|0;a1=a1|0;a2=a2|0;a3=a3|0;FUNCTION_TABLE_viii[index&127](a1|0,a2|0,a3|0)}function dynCall_v(index){index=index|0;FUNCTION_TABLE_v[index&127]()}function dynCall_iii(index,a1,a2){index=index|0;a1=a1|0;a2=a2|0;return FUNCTION_TABLE_iii[index&127](a1|0,a2|0)|0}function dynCall_viiii(index,a1,a2,a3,a4){index=index|0;a1=a1|0;a2=a2|0;a3=a3|0;a4=a4|0;FUNCTION_TABLE_viiii[index&127](a1|0,a2|0,a3|0,a4|0)}function b0(p0){p0=p0|0;abort(0);return 0}function b1(p0,p1,p2,p3,p4){p0=p0|0;p1=p1|0;p2=p2|0;p3=p3|0;p4=p4|0;abort(1)}function b2(p0){p0=p0|0;abort(2)}function b3(p0,p1){p0=p0|0;p1=p1|0;abort(3)}function b4(p0,p1,p2){p0=p0|0;p1=p1|0;p2=p2|0;abort(4);return 0}function b5(p0,p1,p2){p0=p0|0;p1=p1|0;p2=p2|0;abort(5)}function b6(){abort(6)}function b7(p0,p1){p0=p0|0;p1=p1|0;abort(7);return 0}function b8(p0,p1,p2,p3){p0=p0|0;p1=p1|0;p2=p2|0;p3=p3|0;abort(8)}
// EMSCRIPTEN_END_FUNCS
  var FUNCTION_TABLE_ii = [b0,b0,b0,b0,b0,b0,_EmptyCache,b0,b0,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,___gl_renderCache
  ,b0,b0,b0,b0,b0,b0,b0,___gl_meshTessellateInterior,b0,b0
  ,b0,b0,b0,b0,b0,b0,b0,b0,b0,___gl_computeInterior,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0,b0];
  var FUNCTION_TABLE_viiiii = [b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1
  ,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1
  ,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1
  ,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1
  ,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1
  ,b1,b1,b1,b1,b1,_combine,b1,b1,b1,b1
  ,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,___gl_noCombineData,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1];
  var FUNCTION_TABLE_vi = [b2,b2,___gl_meshCheckMesh,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,___gl_meshDiscardExterior,b2,b2,b2,___gl_noEndData,b2,b2,b2,b2
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2
  ,b2,b2,b2,___gl_meshDeleteMesh,b2,b2,b2,___gl_projectPolygon,b2,b2
  ,b2,b2,b2,b2,b2,_noMesh,b2,b2,b2,_noBegin
  ,b2,b2,b2,b2,b2,b2,b2,b2,b2,_noEdgeFlag
  ,b2,b2,b2,b2,b2,_noError,b2,b2,b2,_noVertex,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2,b2];
  var FUNCTION_TABLE_vii = [b3,b3,b3,b3,_begin,b3,b3,b3,_skip_vertex,b3,___gl_noVertexData
  ,b3,b3,b3,b3,b3,b3,b3,_triangle_vertex,b3,b3
  ,b3,vii__longjmp__wrapper,b3,b3,b3,b3,b3,b3,b3,b3
  ,b3,___gl_renderBoundary,b3,b3,b3,_fan_vertex,b3,b3,b3,b3
  ,b3,___gl_renderMesh,b3,___gl_noErrorData,b3,b3,b3,b3,b3,b3
  ,b3,b3,b3,_strip_vertex,b3,b3,b3,___gl_noEdgeFlagData,b3,b3
  ,b3,_vertex,b3,b3,b3,b3,b3,b3,b3,b3,b3,_GotoState,b3,___gl_noBeginData,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3,b3];
  var FUNCTION_TABLE_iiii = [b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,_EdgeLeq
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,___gl_meshSetWindingNumber,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4];
  var FUNCTION_TABLE_viii = [b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,_RenderTriangle,b5,_RenderFan,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5
  ,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,_RenderStrip,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5,b5];
  var FUNCTION_TABLE_v = [b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6
  ,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,_noEnd,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6,b6];
  var FUNCTION_TABLE_iii = [b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7
  ,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,___gl_vertLeq,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7,b7];
  var FUNCTION_TABLE_viiii = [b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,_noCombine,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8,b8];
  return { _testSetjmp: _testSetjmp, _strlen: _strlen, _free: _free, _realloc: _realloc, _tessellate: _tessellate, _memset: _memset, _malloc: _malloc, _saveSetjmp: _saveSetjmp, _memcpy: _memcpy, runPostSets: runPostSets, stackAlloc: stackAlloc, stackSave: stackSave, stackRestore: stackRestore, setThrew: setThrew, setTempRet0: setTempRet0, setTempRet1: setTempRet1, setTempRet2: setTempRet2, setTempRet3: setTempRet3, setTempRet4: setTempRet4, setTempRet5: setTempRet5, setTempRet6: setTempRet6, setTempRet7: setTempRet7, setTempRet8: setTempRet8, setTempRet9: setTempRet9, dynCall_ii: dynCall_ii, dynCall_viiiii: dynCall_viiiii, dynCall_vi: dynCall_vi, dynCall_vii: dynCall_vii, dynCall_iiii: dynCall_iiii, dynCall_viii: dynCall_viii, dynCall_v: dynCall_v, dynCall_iii: dynCall_iii, dynCall_viiii: dynCall_viiii };
})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_ii": invoke_ii, "invoke_viiiii": invoke_viiiii, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_iiii": invoke_iiii, "invoke_viii": invoke_viii, "invoke_v": invoke_v, "invoke_iii": invoke_iii, "invoke_viiii": invoke_viiii, "_sysconf": _sysconf, "_abort": _abort, "_fprintf": _fprintf, "_fflush": _fflush, "__reallyNegative": __reallyNegative, "_fputc": _fputc, "___setErrNo": ___setErrNo, "_fwrite": _fwrite, "_send": _send, "_longjmp": _longjmp, "__formatString": __formatString, "___assert_func": ___assert_func, "_pwrite": _pwrite, "_putchar": _putchar, "_sbrk": _sbrk, "___errno_location": ___errno_location, "_write": _write, "_time": _time, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity, "_stderr": _stderr }, buffer);
var _testSetjmp = Module["_testSetjmp"] = asm["_testSetjmp"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _tessellate = Module["_tessellate"] = asm["_tessellate"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _saveSetjmp = Module["_saveSetjmp"] = asm["_saveSetjmp"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];
Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;
var initialStackTop;
var preloadStartTime = null;
var calledMain = false;
Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    Module.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  initialStackTop = STACKTOP;
  try {
    var ret = Module['_main'](argc, argv, 0);
    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      throw e;
    }
  } finally {
    calledMain = true;
  }
}
function run(args) {
  args = args || Module['arguments'];
  if (preloadStartTime === null) preloadStartTime = Date.now();
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }
  preRun();
  if (runDependencies > 0) {
    // a preRun added a dependency, run will be called later
    return;
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    calledRun = true;
    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }
    postRun();
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;
function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;
  // exit the runtime
  exitRuntime();
  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371
  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;
function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }
  ABORT = true;
  EXITSTATUS = 1;
  throw 'abort() at ' + (new Error().stack);
}
Module['abort'] = Module.abort = abort;
// {{PRE_RUN_ADDITIONS}}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
// {{MODULE_ADDITIONS}}
