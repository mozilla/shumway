/*
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
///<reference path='references.ts' />

/**
 * Provides a definition of AVM2 Bytecodes.
 *
 * Type (size) Prefix:
 *
 *   u08 - a one-byte unsigned integer
 *   s08 - a one-byte signed integer
 *   s24 - a three byte signed integer
 *   s16 - a variable-length encoded 30-bit unsigned integer value that is casted to a short value
 *   u30 - a variable-length encoded 30-bit unsigned integer value
 *
 * Type (semantic) Suffix:
 *
 *     I - an index into the integer constant pool
 *     U - an index into the unsigned integer constant pool
 *     D - an index into the doubles constant pool
 *     S - an index into the string constant pool
 *     N - an index into the namespace constant pool
 *     M - an index into the multiname constant pool
 *    CI - an index into the class info list
 *    EI - an index into the exception info list
 *    MI - an index into the method info list
 */

module Shumway.AVM2 {
  export var opcodeTable = [
    null, // 0x0
    { name: "bkpt",                 canThrow: false,    operands: [] }, // 0x1
    { name: "nop",                  canThrow: false,    operands: [] }, // 0x2
    { name: "throw",                canThrow: true,     operands: [] }, // 0x3
    { name: "getsuper",             canThrow: true,     operands: [{name:"index",size:"u30",type:""}] }, // 0x4
    { name: "setsuper",             canThrow: true,     operands: [{name:"index",size:"u30",type:""}] }, // 0x5
    { name: "dxns",                 canThrow: true,     operands: [{name:"index",size:"u30",type:""}] }, // 0x6
    { name: "dxnslate",             canThrow: true,     operands: [] }, // 0x7
    { name: "kill",                 canThrow: false,    operands: [{name:"index",size:"u30",type:""}] }, // 0x8
    { name: "label",                canThrow: false,    operands: [] }, // 0x9
    { name: "lf32x4",               canThrow: true,     operands: [] }, // 0xA
    { name: "sf32x4",               canThrow: true,     operands: [] }, // 0xB
    { name: "ifnlt",                canThrow: true,     operands: [{name:"offset",size:"s24",type:""}] }, // 0xC
    { name: "ifnle",                canThrow: true,     operands: [{name:"offset",size:"s24",type:""}] }, // 0xD
    { name: "ifngt",                canThrow: true,     operands: [{name:"offset",size:"s24",type:""}] }, // 0xE
    { name: "ifnge",                canThrow: true,     operands: [{name:"offset",size:"s24",type:""}] }, // 0xF
    { name: "jump",                 canThrow: false,    operands: [{name:"offset",size:"s24",type:""}] }, // 0x10
    { name: "iftrue",               canThrow: false,    operands: [{name:"offset",size:"s24",type:""}] }, // 0x11
    { name: "iffalse",              canThrow: false,    operands: [{name:"offset",size:"s24",type:""}] }, // 0x12
    { name: "ifeq",                 canThrow: true,     operands: [{name:"offset",size:"s24",type:""}] }, // 0x13
    { name: "ifne",                 canThrow: true,     operands: [{name:"offset",size:"s24",type:""}] }, // 0x14
    { name: "iflt",                 canThrow: true,     operands: [{name:"offset",size:"s24",type:""}] }, // 0x15
    { name: "ifle",                 canThrow: true,     operands: [{name:"offset",size:"s24",type:""}] }, // 0x16
    { name: "ifgt",                 canThrow: true,     operands: [{name:"offset",size:"s24",type:""}] }, // 0x17
    { name: "ifge",                 canThrow: true,     operands: [{name:"offset",size:"s24",type:""}] }, // 0x18
    { name: "ifstricteq",           canThrow: false,    operands: [{name:"offset",size:"s24",type:""}] }, // 0x19
    { name: "ifstrictne",           canThrow: false,    operands: [{name:"offset",size:"s24",type:""}] }, // 0x1A
    { name: "lookupswitch",         canThrow: false,    operands: null }, // 0x1B
    { name: "pushwith",             canThrow: false,    operands: [] }, // 0x1C
    { name: "popscope",             canThrow: false,    operands: [] }, // 0x1D
    { name: "nextname",             canThrow: true,     operands: [] }, // 0x1E
    { name: "hasnext",              canThrow: true,     operands: [] }, // 0x1F
    { name: "pushnull",             canThrow: false,    operands: [] }, // 0x20
    { name: "pushundefined",        canThrow: false,    operands: [] }, // 0x21
    null, // 0x22
    { name: "nextvalue",            canThrow: true,     operands: [] }, // 0x23
    { name: "pushbyte",             canThrow: false,    operands: [{name:"value",size:"s08",type:""}] }, // 0x24
    { name: "pushshort",            canThrow: false,    operands: [{name:"value",size:"s16",type:""}] }, // 0x25
    { name: "pushtrue",             canThrow: false,    operands: [] }, // 0x26
    { name: "pushfalse",            canThrow: false,    operands: [] }, // 0x27
    { name: "pushnan",              canThrow: false,    operands: [] }, // 0x28
    { name: "pop",                  canThrow: false,    operands: [] }, // 0x29
    { name: "dup",                  canThrow: false,    operands: [] }, // 0x2A
    { name: "swap",                 canThrow: false,    operands: [] }, // 0x2B
    { name: "pushstring",           canThrow: false,    operands: [{name:"index",size:"u30",type:"S"}] }, // 0x2C
    { name: "pushint",              canThrow: false,    operands: [{name:"index",size:"u30",type:"I"}] }, // 0x2D
    { name: "pushuint",             canThrow: false,    operands: [{name:"index",size:"u30",type:"U"}] }, // 0x2E
    { name: "pushdouble",           canThrow: false,    operands: [{name:"index",size:"u30",type:"D"}] }, // 0x2F
    { name: "pushscope",            canThrow: false,    operands: [] }, // 0x30
    { name: "pushnamespace",        canThrow: false,    operands: [{name:"index",size:"u30",type:"N"}] }, // 0x31
    { name: "hasnext2",             canThrow: true,     operands: [{name:"object",size:"u30",type:""},{name:"index",size:"u30",type:""}] }, // 0x32
    { name: "lix8",                 canThrow: true,     operands: null }, // 0x33
    { name: "lix16",                canThrow: true,     operands: null }, // 0x34
    { name: "li8",                  canThrow: true,     operands: [] }, // 0x35
    { name: "li16",                 canThrow: true,     operands: [] }, // 0x36
    { name: "li32",                 canThrow: true,     operands: [] }, // 0x37
    { name: "lf32",                 canThrow: true,     operands: [] }, // 0x38
    { name: "lf64",                 canThrow: true,     operands: [] }, // 0x39
    { name: "si8",                  canThrow: true,     operands: [] }, // 0x3A
    { name: "si16",                 canThrow: true,     operands: [] }, // 0x3B
    { name: "si32",                 canThrow: true,     operands: [] }, // 0x3C
    { name: "sf32",                 canThrow: true,     operands: [] }, // 0x3D
    { name: "sf64",                 canThrow: true,     operands: [] }, // 0x3E
    null, // 0x3F
    { name: "newfunction",          canThrow: true,     operands: [{name:"index",size:"u30",type:"MI"}] }, // 0x40
    { name: "call",                 canThrow: true,     operands: [{name:"argCount",size:"u30",type:""}] }, // 0x41
    { name: "construct",            canThrow: true,     operands: [{name:"argCount",size:"u30",type:""}] }, // 0x42
    { name: "callmethod",           canThrow: true,     operands: [{name:"index",size:"u30",type:""},{name:"argCount",size:"u30",type:""}] }, // 0x43
    { name: "callstatic",           canThrow: true,     operands: [{name:"index",size:"u30",type:"MI"},{name:"argCount",size:"u30",type:""}] }, // 0x44
    { name: "callsuper",            canThrow: true,     operands: [{name:"index",size:"u30",type:"M"},{name:"argCount",size:"u30",type:""}] }, // 0x45
    { name: "callproperty",         canThrow: true,     operands: [{name:"index",size:"u30",type:"M"},{name:"argCount",size:"u30",type:""}] }, // 0x46
    { name: "returnvoid",           canThrow: false,    operands: [] }, // 0x47
    { name: "returnvalue",          canThrow: true,     operands: [] }, // 0x48
    { name: "constructsuper",       canThrow: true,     operands: [{name:"argCount",size:"u30",type:""}] }, // 0x49
    { name: "constructprop",        canThrow: true,     operands: [{name:"index",size:"u30",type:"M"},{name:"argCount",size:"u30",type:""}] }, // 0x4A
    { name: "callsuperid",          canThrow: true,     operands: null }, // 0x4B
    { name: "callproplex",          canThrow: true,     operands: [{name:"index",size:"u30",type:"M"},{name:"argCount",size:"u30",type:""}] }, // 0x4C
    { name: "callinterface",        canThrow: true,     operands: null }, // 0x4D
    { name: "callsupervoid",        canThrow: true,     operands: [{name:"index",size:"u30",type:"M"},{name:"argCount",size:"u30",type:""}] }, // 0x4E
    { name: "callpropvoid",         canThrow: true,     operands: [{name:"index",size:"u30",type:"M"},{name:"argCount",size:"u30",type:""}] }, // 0x4F
    { name: "sxi1",                 canThrow: false,    operands: [] }, // 0x50
    { name: "sxi8",                 canThrow: false,    operands: [] }, // 0x51
    { name: "sxi16",                canThrow: false,    operands: [] }, // 0x52
    { name: "applytype",            canThrow: true,     operands: [{name:"argCount",size:"u30",type:""}] }, // 0x53
    { name: "pushfloat4",           canThrow: false,    operands: null }, // 0x54
    { name: "newobject",            canThrow: true,     operands: [{name:"argCount",size:"u30",type:""}] }, // 0x55
    { name: "newarray",             canThrow: true,     operands: [{name:"argCount",size:"u30",type:""}] }, // 0x56
    { name: "newactivation",        canThrow: true,     operands: [] }, // 0x57
    { name: "newclass",             canThrow: true,     operands: [{name:"index",size:"u30",type:"CI"}] }, // 0x58
    { name: "getdescendants",       canThrow: true,     operands: [{name:"index",size:"u30",type:"M"}] }, // 0x59
    { name: "newcatch",             canThrow: true,     operands: [{name:"index",size:"u30",type:"EI"}] }, // 0x5A
    { name: "findpropglobalstrict", canThrow: true,     operands: null }, // 0x5B
    { name: "findpropglobal",       canThrow: true,     operands: null }, // 0x5C
    { name: "findpropstrict",       canThrow: true,     operands: [{name:"index",size:"u30",type:"M"}] }, // 0x5D
    { name: "findproperty",         canThrow: true,     operands: [{name:"index",size:"u30",type:"M"}] }, // 0x5E
    { name: "finddef",              canThrow: true,     operands: null }, // 0x5F
    { name: "getlex",               canThrow: true,     operands: [{name:"index",size:"u30",type:"M"}] }, // 0x60
    { name: "setproperty",          canThrow: true,     operands: [{name:"index",size:"u30",type:"M"}] }, // 0x61
    { name: "getlocal",             canThrow: false,    operands: [{name:"index",size:"u30",type:""}] }, // 0x62
    { name: "setlocal",             canThrow: false,    operands: [{name:"index",size:"u30",type:""}] }, // 0x63
    { name: "getglobalscope",       canThrow: false,    operands: [] }, // 0x64
    { name: "getscopeobject",       canThrow: false,    operands: [{name:"index",size:"u30",type:""}] }, // 0x65
    { name: "getproperty",          canThrow: true,     operands: [{name:"index",size:"u30",type:"M"}] }, // 0x66
    { name: "getouterscope",        canThrow: false,    operands: null }, // 0x67
    { name: "initproperty",         canThrow: true,     operands: [{name:"index",size:"u30",type:"M"}] }, // 0x68
    null, // 0x69
    { name: "deleteproperty",       canThrow: true,     operands: [{name:"index",size:"u30",type:"M"}] }, // 0x6A
    null, // 0x6B
    { name: "getslot",              canThrow: true,     operands: [{name:"index",size:"u30",type:""}] }, // 0x6C
    { name: "setslot",              canThrow: true,     operands: [{name:"index",size:"u30",type:""}] }, // 0x6D
    { name: "getglobalslot",        canThrow: false,    operands: [{name:"index",size:"u30",type:""}] }, // 0x6E
    { name: "setglobalslot",        canThrow: false,    operands: [{name:"index",size:"u30",type:""}] }, // 0x6F
    { name: "convert_s",            canThrow: true,     operands: [] }, // 0x70
    { name: "esc_xelem",            canThrow: true,     operands: [] }, // 0x71
    { name: "esc_xattr",            canThrow: true,     operands: [] }, // 0x72
    { name: "convert_i",            canThrow: true,     operands: [] }, // 0x73
    { name: "convert_u",            canThrow: true,     operands: [] }, // 0x74
    { name: "convert_d",            canThrow: true,     operands: [] }, // 0x75
    { name: "convert_b",            canThrow: true,     operands: [] }, // 0x76
    { name: "convert_o",            canThrow: true,     operands: [] }, // 0x77
    { name: "checkfilter",          canThrow: true,     operands: [] }, // 0x78
    { name: "convert_f",            canThrow: true,     operands: [] }, // 0x79
    { name: "unplus",               canThrow: true,     operands: [] }, // 0x7A
    { name: "convert_f4",           canThrow: true,     operands: [] }, // 0x7B
    null, // 0x7C
    null, // 0x7D
    null, // 0x7E
    null, // 0x7F
    { name: "coerce",               canThrow: true,     operands: [{name:"index",size:"u30",type:"M"}] }, // 0x80
    { name: "coerce_b",             canThrow: true,     operands: [] }, // 0x81
    { name: "coerce_a",             canThrow: true,     operands: [] }, // 0x82
    { name: "coerce_i",             canThrow: true,     operands: [] }, // 0x83
    { name: "coerce_d",             canThrow: true,     operands: [] }, // 0x84
    { name: "coerce_s",             canThrow: true,     operands: [] }, // 0x85
    { name: "astype",               canThrow: true,     operands: [{name:"index",size:"u30",type:"M"}] }, // 0x86
    { name: "astypelate",           canThrow: true,     operands: [] }, // 0x87
    { name: "coerce_u",             canThrow: true,     operands: [] }, // 0x88
    { name: "coerce_o",             canThrow: true,     operands: [] }, // 0x89
    null, // 0x8A
    null, // 0x8B
    null, // 0x8C
    null, // 0x8D
    null, // 0x8E
    null, // 0x8F
    { name: "negate",               canThrow: true,     operands: [] }, // 0x90
    { name: "increment",            canThrow: true,     operands: [] }, // 0x91
    { name: "inclocal",             canThrow: true,     operands: [{name:"index",size:"u30",type:""}] }, // 0x92
    { name: "decrement",            canThrow: true,     operands: [] }, // 0x93
    { name: "declocal",             canThrow: true,     operands: [{name:"index",size:"u30",type:""}] }, // 0x94
    { name: "typeof",               canThrow: false,    operands: [] }, // 0x95
    { name: "not",                  canThrow: false,    operands: [] }, // 0x96
    { name: "bitnot",               canThrow: true,     operands: [] }, // 0x97
    null, // 0x98
    null, // 0x99
    null, // 0x9A
    null, // 0x9B
    null, // 0x9C
    null, // 0x9D
    null, // 0x9E
    null, // 0x9F
    { name: "add",                  canThrow: true,     operands: [] }, // 0xA0
    { name: "subtract",             canThrow: true,     operands: [] }, // 0xA1
    { name: "multiply",             canThrow: true,     operands: [] }, // 0xA2
    { name: "divide",               canThrow: true,     operands: [] }, // 0xA3
    { name: "modulo",               canThrow: true,     operands: [] }, // 0xA4
    { name: "lshift",               canThrow: true,     operands: [] }, // 0xA5
    { name: "rshift",               canThrow: true,     operands: [] }, // 0xA6
    { name: "urshift",              canThrow: true,     operands: [] }, // 0xA7
    { name: "bitand",               canThrow: true,     operands: [] }, // 0xA8
    { name: "bitor",                canThrow: true,     operands: [] }, // 0xA9
    { name: "bitxor",               canThrow: true,     operands: [] }, // 0xAA
    { name: "equals",               canThrow: true,     operands: [] }, // 0xAB
    { name: "strictequals",         canThrow: true,     operands: [] }, // 0xAC
    { name: "lessthan",             canThrow: true,     operands: [] }, // 0xAD
    { name: "lessequals",           canThrow: true,     operands: [] }, // 0xAE
    { name: "greaterthan",          canThrow: true,     operands: [] }, // 0xAF
    { name: "greaterequals",        canThrow: true,     operands: [] }, // 0xB0
    { name: "instanceof",           canThrow: true,     operands: [] }, // 0xB1
    { name: "istype",               canThrow: true,     operands: [{name:"index",size:"u30",type:"M"}] }, // 0xB2
    { name: "istypelate",           canThrow: true,     operands: [] }, // 0xB3
    { name: "in",                   canThrow: true,     operands: [] }, // 0xB4
    null, // 0xB5
    null, // 0xB6
    null, // 0xB7
    null, // 0xB8
    null, // 0xB9
    null, // 0xBA
    null, // 0xBB
    null, // 0xBC
    null, // 0xBD
    null, // 0xBE
    null, // 0xBF
    { name: "increment_i",          canThrow: true,     operands: [] }, // 0xC0
    { name: "decrement_i",          canThrow: true,     operands: [] }, // 0xC1
    { name: "inclocal_i",           canThrow: true,     operands: [{name:"index",size:"u30",type:""}] }, // 0xC2
    { name: "declocal_i",           canThrow: true,     operands: [{name:"index",size:"u30",type:""}] }, // 0xC3
    { name: "negate_i",             canThrow: true,     operands: [] }, // 0xC4
    { name: "add_i",                canThrow: true,     operands: [] }, // 0xC5
    { name: "subtract_i",           canThrow: true,     operands: [] }, // 0xC6
    { name: "multiply_i",           canThrow: true,     operands: [] }, // 0xC7
    null, // 0xC8
    null, // 0xC9
    null, // 0xCA
    null, // 0xCB
    null, // 0xCC
    null, // 0xCD
    null, // 0xCE
    null, // 0xCF
    { name: "getlocal0",            canThrow: false,    operands: [] }, // 0xD0
    { name: "getlocal1",            canThrow: false,    operands: [] }, // 0xD1
    { name: "getlocal2",            canThrow: false,    operands: [] }, // 0xD2
    { name: "getlocal3",            canThrow: false,    operands: [] }, // 0xD3
    { name: "setlocal0",            canThrow: false,    operands: [] }, // 0xD4
    { name: "setlocal1",            canThrow: false,    operands: [] }, // 0xD5
    { name: "setlocal2",            canThrow: false,    operands: [] }, // 0xD6
    { name: "setlocal3",            canThrow: false,    operands: [] }, // 0xD7
    null, // 0xD8
    null, // 0xD9
    null, // 0xDA
    null, // 0xDB
    null, // 0xDC
    null, // 0xDD
    null, // 0xDE
    null, // 0xDF
    null, // 0xE0
    null, // 0xE1
    null, // 0xE2
    null, // 0xE3
    null, // 0xE4
    null, // 0xE5
    null, // 0xE6
    null, // 0xE7
    null, // 0xE8
    null, // 0xE9
    null, // 0xEA
    null, // 0xEB
    null, // 0xEC
    { name: "invalid",              canThrow: false,    operands: [] }, // 0xED
    null, // 0xEE
    { name: "debug",                canThrow: true,     operands: [{name:"debugType",size:"u08",type:""},{name:"index",size:"u30",type:"S"},{name:"reg",size:"u08",type:""},{name:"extra",size:"u30",type:""}] }, // 0xEF
    { name: "debugline",            canThrow: true,     operands: [{name:"lineNumber",size:"u30",type:""}] }, // 0xF0
    { name: "debugfile",            canThrow: true,     operands: [{name:"index",size:"u30",type:"S"}] }, // 0xF1
    null, // 0xF2
    null, // 0xF3
    null, // 0xF4
    null, // 0xF5
    null, // 0xF6
    null, // 0xF7
    null, // 0xF8
    null, // 0xF9
    null, // 0xFA
    null, // 0xFB
    null, // 0xFC
    null, // 0xFD
    null, // 0xFE
    null, // 0xFF
  ];

  export function opcodeName(op) {
    return opcodeTable[op].name;
  }
}

import opcodeTable = Shumway.AVM2.opcodeTable;
import opcodeName = Shumway.AVM2.opcodeName;
