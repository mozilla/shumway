/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
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

/**
 * Provides a definition of AVM2 Bytecodes. Operands for each bytecode operation are pairs of (name:type) and are
 * delimited by commas. There are several possible types, which are represented using a size prefix followed by an
 * optional semantic suffix.
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

var opcodeTable = [
  null,
  {name:"bkpt",               operands:"",                 canThrow:false, stackDelta:0},  //0x01
  {name:"nop",                operands:"",                 canThrow:false, stackDelta:0},  //0x02
  {name:"throw",              operands:"",                 canThrow:true, stackDelta:-1},  //0x03
  {name:"getsuper",           operands:"index:u30",        canThrow:true, stackDelta:0},   //0x04
  {name:"setsuper",           operands:"index:u30",        canThrow:true, stackDelta:-2},  //0x05
  {name:"dxns",               operands:"index:u30",        canThrow:true, stackDelta:0},   //0x06
  {name:"dxnslate",           operands:"",                 canThrow:true, stackDelta:-1},  //0x07
  {name:"kill",               operands:"index:u30",        canThrow:false, stackDelta:0},  //0x08
  {name:"label",              operands:"",                 canThrow:false, stackDelta:0},  //0x09
  {name:"lf32x4",             operands:"",                 canThrow:true, stackDelta:0},   //0x0A
  {name:"sf32x4",             operands:"",                 canThrow:true, stackDelta:-2},  //0x0B
  {name:"ifnlt",              operands:"offset:s24",       canThrow:true, stackDelta:-2},  //0x0C
  {name:"ifnle",              operands:"offset:s24",       canThrow:true, stackDelta:-2},  //0x0D
  {name:"ifngt",              operands:"offset:s24",       canThrow:true, stackDelta:-2},  //0x0E
  {name:"ifnge",              operands:"offset:s24",       canThrow:true, stackDelta:-2},  //0x0F
  {name:"jump",               operands:"offset:s24",       canThrow:false, stackDelta:0},  //0x10
  {name:"iftrue",             operands:"offset:s24",       canThrow:false, stackDelta:-1}, //0x11
  {name:"iffalse",            operands:"offset:s24",       canThrow:false, stackDelta:-1}, //0x12
  {name:"ifeq",               operands:"offset:s24",       canThrow:true, stackDelta:-2},  //0x13
  {name:"ifne",               operands:"offset:s24",       canThrow:true, stackDelta:-2},  //0x14
  {name:"iflt",               operands:"offset:s24",       canThrow:true, stackDelta:-2},  //0x15
  {name:"ifle",               operands:"offset:s24",       canThrow:true, stackDelta:-2},  //0x16
  {name:"ifgt",               operands:"offset:s24",       canThrow:true, stackDelta:-2},  //0x17
  {name:"ifge",               operands:"offset:s24",       canThrow:true, stackDelta:-2},  //0x18
  {name:"ifstricteq",         operands:"offset:s24",       canThrow:false, stackDelta:-2}, //0x19
  {name:"ifstrictne",         operands:"offset:s24",       canThrow:false, stackDelta:-2}, //0x1A
  {name:"lookupswitch",       operands:null,               canThrow:false, stackDelta:-1}, //0x1B
  {name:"pushwith",           operands:"",                 canThrow:false, stackDelta:-1}, //0x1C
  {name:"popscope",           operands:"",                 canThrow:false, stackDelta:0},  //0x1D
  {name:"nextname",           operands:"",                 canThrow:true, stackDelta:-1},  //0x1E
  {name:"hasnext",            operands:"",                 canThrow:true, stackDelta:-1},  //0x1F
  {name:"pushnull",           operands:"",                 canThrow:false, stackDelta:1},  //0x20
  {name:"pushundefined",      operands:"",                 canThrow:false, stackDelta:1},  //0x21
  null,  //0x22
  {name:"nextvalue",          operands:"",                 canThrow:true, stackDelta:-1},  //0x23
  {name:"pushbyte",           operands:"value:s08",        canThrow:false, stackDelta:1},  //0x24
  {name:"pushshort",          operands:"value:s16",        canThrow:false, stackDelta:1},  //0x25
  {name:"pushtrue",           operands:"",                 canThrow:false, stackDelta:1},  //0x26
  {name:"pushfalse",          operands:"",                 canThrow:false, stackDelta:1},  //0x27
  {name:"pushnan",            operands:"",                 canThrow:false, stackDelta:1},  //0x28
  {name:"pop",                operands:"",                 canThrow:false, stackDelta:-1}, //0x29
  {name:"dup",                operands:"",                 canThrow:false, stackDelta:1},  //0x2A
  {name:"swap",               operands:"",                 canThrow:false, stackDelta:0},  //0x2B
  {name:"pushstring",         operands:"index:u30S",       canThrow:false, stackDelta:1},  //0x2C
  {name:"pushint",            operands:"index:u30I",       canThrow:false, stackDelta:1},  //0x2D
  {name:"pushuint",           operands:"index:u30U",       canThrow:false, stackDelta:1},  //0x2E
  {name:"pushdouble",         operands:"index:u30D",       canThrow:false, stackDelta:1},  //0x2F
  {name:"pushscope",          operands:"",                 canThrow:false, stackDelta:-1}, //0x30
  {name:"pushnamespace",      operands:"index:u30N",       canThrow:false, stackDelta:1},  //0x31
  {name:"hasnext2",           operands:"object:u30,index:u30",          canThrow:true, stackDelta:1},  //0x32

  {name:"lix8",               operands:null,               canThrow:true, stackDelta:0, internal:true},  //0x33
  {name:"lix16",              operands:null,               canThrow:true, stackDelta:0, internal:true},  //0x34
  {name:"li8",                operands:"",                 canThrow:true, stackDelta:0},   //0x35
  {name:"li16",               operands:"",                 canThrow:true, stackDelta:0},   //0x36
  {name:"li32",               operands:"",                 canThrow:true, stackDelta:0},   //0x37
  {name:"lf32",               operands:"",                 canThrow:true, stackDelta:0},   //0x38
  {name:"lf64",               operands:"",                 canThrow:true, stackDelta:0},   //0x39
  {name:"si8",                operands:"",                 canThrow:true, stackDelta:-2},  //0x3A
  {name:"si16",               operands:"",                 canThrow:true, stackDelta:-2},  //0x3B
  {name:"si32",               operands:"",                 canThrow:true, stackDelta:-2},  //0x3C
  {name:"sf32",               operands:"",                 canThrow:true, stackDelta:-2},  //0x3D
  {name:"sf64",               operands:"",                 canThrow:true, stackDelta:-2},  //0x3E

  null,  //0x3F
  {name:"newfunction",        operands:"index:u30MI",      canThrow:true, stackDelta:1},  //0x40
  {name:"call",               operands:"argCount:u30",     canThrow:true, stackDelta:-1}, //0x41
  {name:"construct",          operands:"argCount:u30",     canThrow:true, stackDelta:0},  //0x42
  {name:"callmethod",         operands:"index:u30,argCount:u30",        canThrow:true, stackDelta:0},  //0x43
  {name:"callstatic",         operands:"index:u30MI,argCount:u30",      canThrow:true, stackDelta:0},  //0x44
  {name:"callsuper",          operands:"index:u30M,argCount:u30",       canThrow:true, stackDelta:0},  //0x45
  {name:"callproperty",       operands:"index:u30M,argCount:u30",       canThrow:true, stackDelta:0},  //0x46
  {name:"returnvoid",         operands:"",                              canThrow:false, stackDelta:0}, //0x47
  {name:"returnvalue",        operands:"",                              canThrow:true, stackDelta:-1}, //0x48
  {name:"constructsuper",     operands:"argCount:u30",                  canThrow:true, stackDelta:-1}, //0x49
  {name:"constructprop",      operands:"index:u30M,argCount:u30",       canThrow:true, stackDelta:0},  //0x4A
  {name:"callsuperid",        operands:null,                            canThrow:true, stackDelta:0, internal:true},  //0x4B
  {name:"callproplex",        operands:"index:u30M,argCount:u30",       canThrow:true, stackDelta:0},  //0x4C
  {name:"callinterface",      operands:null,                            canThrow:true, stackDelta:0, internal:true},  //0x4D
  {name:"callsupervoid",      operands:"index:u30M,argCount:u30",       canThrow:true, stackDelta:-1},  //0x4E
  {name:"callpropvoid",       operands:"index:u30M,argCount:u30",       canThrow:true, stackDelta:-1},  //0x4F
  {name:"sxi1",               operands:"",                 canThrow:false, stackDelta:0},  //0x50
  {name:"sxi8",               operands:"",                 canThrow:false, stackDelta:0},  //0x51
  {name:"sxi16",              operands:"",                 canThrow:false, stackDelta:0},  //0x52
  {name:"applytype",          operands:"argCount:u30",     canThrow:true, stackDelta:0},   //0x53
  {name:"pushfloat4",         operands:null,               canThrow:false, stackDelta:1},  //0x54
  {name:"newobject",          operands:"argCount:u30",     canThrow:true, stackDelta:1},   //0x55
  {name:"newarray",           operands:"argCount:u30",     canThrow:true, stackDelta:1},   //0x56
  {name:"newactivation",      operands:"",                 canThrow:true, stackDelta:1},   //0x57
  {name:"newclass",           operands:"index:u30CI",      canThrow:true, stackDelta:0},   //0x58
  {name:"getdescendants",     operands:"index:u30M",       canThrow:true, stackDelta:0},   //0x59
  {name:"newcatch",           operands:"index:u30EI",      canThrow:true, stackDelta:1},   //0x5A
  {name:"findpropglobalstrict", operands:null,             canThrow:true, stackDelta:0, internal:true},  //0x5B
  {name:"findpropglobal",     operands:null,               canThrow:true, stackDelta:0, internal:true},  //0x5C

    /**
     * This searches the scope stack, and then the saved scope stack in the current method closure for a property
     * with the name specified by the multiname. If property is unresolved, then an exception is thrown, or
     * in case of "findproperty" the global object is pushed on the stack.
     */
  {name:"findpropstrict",     operands:"index:u30M",       canThrow:true, stackDelta:1},   //0x5D
  {name:"findproperty",       operands:"index:u30M",       canThrow:true, stackDelta:1},   //0x5E
  {name:"finddef",            operands:null,               canThrow:true, stackDelta:1},   //0x5F
  {name:"getlex",             operands:"index:u30M",       canThrow:true, stackDelta:1},   //0x60
  {name:"setproperty",        operands:"index:u30M",       canThrow:true, stackDelta:-2},  //0x61
  {name:"getlocal",           operands:"index:u30",        canThrow:false, stackDelta:1},  //0x62
  {name:"setlocal",           operands:"index:u30",        canThrow:false, stackDelta:-1}, //0x63
  {name:"getglobalscope",     operands:"",                 canThrow:false, stackDelta:1},  //0x64
  {name:"getscopeobject",     operands:"index:u30",        canThrow:false, stackDelta:1},  //0x65
  {name:"getproperty",        operands:"index:u30M",       canThrow:true, stackDelta:0},   //0x66
  {name:"getouterscope",      operands:null,               canThrow:false, stackDelta:1},  //0x67
  {name:"initproperty",       operands:"index:u30M",       canThrow:true, stackDelta:-2},  //0x68
  null,  //0x69
  {name:"deleteproperty",     operands:"index:u30M",       canThrow:true, stackDelta:0},   //0x6A
  null,  //0x6B
  {name:"getslot",            operands:"index:u30",        canThrow:true, stackDelta:0},   //0x6C
  {name:"setslot",            operands:"index:u30",        canThrow:true, stackDelta:-2},  //0x6D
  {name:"getglobalslot",      operands:"index:u30",        canThrow:false, stackDelta:1},  //0x6E
  {name:"setglobalslot",      operands:"index:u30",        canThrow:false, stackDelta:-1}, //0x6F
  {name:"convert_s",          operands:"",                 canThrow:true, stackDelta:0},   //0x70
  {name:"esc_xelem",          operands:"",                 canThrow:true, stackDelta:0},   //0x71
  {name:"esc_xattr",          operands:"",                 canThrow:true, stackDelta:0},   //0x72
  {name:"convert_i",          operands:"",                 canThrow:true, stackDelta:0},   //0x73
  {name:"convert_u",          operands:"",                 canThrow:true, stackDelta:0},   //0x74
  {name:"convert_d",          operands:"",                 canThrow:true, stackDelta:0},   //0x75
  {name:"convert_b",          operands:"",                 canThrow:true, stackDelta:0},   //0x76
  {name:"convert_o",          operands:"",                 canThrow:true, stackDelta:0},   //0x77
  {name:"checkfilter",        operands:"",                 canThrow:true, stackDelta:0},   //0x78
  {name:"convert_f",          operands:"",                 canThrow:true, stackDelta:0},   //0x79
  {name:"unplus",             operands:"",                 canThrow:true, stackDelta:0},   //0x7A
  {name:"convert_f4",         operands:"",                 canThrow:true, stackDelta:0},   //0x7B
  null,  //0x7C
  null,  //0x7D
  null,  //0x7E
  null,  //0x7F
  {name:"coerce",             operands:"index:u30M",       canThrow:true, stackDelta:0},  //0x80
  {name:"coerce_b",           operands:"",                 canThrow:true, stackDelta:0},  //0x81
  {name:"coerce_a",           operands:"",                 canThrow:true, stackDelta:0},  //0x82
  {name:"coerce_i",           operands:"",                 canThrow:true, stackDelta:0},  //0x83
  {name:"coerce_d",           operands:"",                 canThrow:true, stackDelta:0},  //0x84
  {name:"coerce_s",           operands:"",                 canThrow:true, stackDelta:0},  //0x85
  {name:"astype",             operands:"index:u30M",       canThrow:true, stackDelta:0},  //0x86
  {name:"astypelate",         operands:"",                 canThrow:true, stackDelta:-1}, //0x87
  {name:"coerce_u",           operands:"",                 canThrow:true, stackDelta:0},  //0x88
  {name:"coerce_o",           operands:"",                 canThrow:true, stackDelta:0},  //0x89
  null,  //0x8A
  null,  //0x8B
  null,  //0x8C
  null,  //0x8D
  null,  //0x8E
  null,  //0x8F
  {name:"negate",             operands:"",                 canThrow:true, stackDelta:0},  //0x90
  {name:"increment",          operands:"",                 canThrow:true, stackDelta:0},  //0x91
  {name:"inclocal",           operands:"index:u30",        canThrow:true, stackDelta:0},  //0x92
  {name:"decrement",          operands:"",                 canThrow:true, stackDelta:0},  //0x93
  {name:"declocal",           operands:"index:u30",        canThrow:true, stackDelta:0},  //0x94
  {name:"typeof",             operands:"",                 canThrow:false, stackDelta:0}, //0x95
  {name:"not",                operands:"",                 canThrow:false, stackDelta:0}, //0x96
  {name:"bitnot",             operands:"",                 canThrow:true, stackDelta:0},  //0x97
  null,  //0x98
  null,  //0x99
  null,  //0x9A
  null,  //0x9B
  null,  //0x9C
  null,  //0x9D
  null,  //0x9E
  null,  //0x9F
  {name:"add",                operands:"",                 canThrow:true, stackDelta:-1},  //0xA0
  {name:"subtract",           operands:"",                 canThrow:true, stackDelta:-1},  //0xA1
  {name:"multiply",           operands:"",                 canThrow:true, stackDelta:-1},  //0xA2
  {name:"divide",             operands:"",                 canThrow:true, stackDelta:-1},  //0xA3
  {name:"modulo",             operands:"",                 canThrow:true, stackDelta:-1},  //0xA4
  {name:"lshift",             operands:"",                 canThrow:true, stackDelta:-1},  //0xA5
  {name:"rshift",             operands:"",                 canThrow:true, stackDelta:-1},  //0xA6
  {name:"urshift",            operands:"",                 canThrow:true, stackDelta:-1},  //0xA7
  {name:"bitand",             operands:"",                 canThrow:true, stackDelta:-1},  //0xA8
  {name:"bitor",              operands:"",                 canThrow:true, stackDelta:-1},  //0xA9
  {name:"bitxor",             operands:"",                 canThrow:true, stackDelta:-1},  //0xAA
  {name:"equals",             operands:"",                 canThrow:true, stackDelta:-1},  //0xAB
  {name:"strictequals",       operands:"",                 canThrow:true, stackDelta:-1},  //0xAC
  {name:"lessthan",           operands:"",                 canThrow:true, stackDelta:-1},  //0xAD
  {name:"lessequals",         operands:"",                 canThrow:true, stackDelta:-1},  //0xAE
  {name:"greaterthan",        operands:"",                 canThrow:true, stackDelta:-1},  //0xAF
  {name:"greaterequals",      operands:"",                 canThrow:true, stackDelta:-1},  //0xB0
  {name:"instanceof",         operands:"",                 canThrow:true, stackDelta:-1},  //0xB1
  {name:"istype",             operands:"index:u30M",       canThrow:true, stackDelta:0},   //0xB2
  {name:"istypelate",         operands:"",                 canThrow:true, stackDelta:-1},  //0xB3
  {name:"in",                 operands:"",                 canThrow:true, stackDelta:-1},  //0xB4
  null,  //0xB5
  null,  //0xB6
  null,  //0xB7
  null,  //0xB8
  null,  //0xB9
  null,  //0xBA
  null,  //0xBB
  null,  //0xBC
  null,  //0xBD
  null,  //0xBE
  null,  //0xBF
  {name:"increment_i",        operands:"",                 canThrow:true, stackDelta:0},   //0xC0
  {name:"decrement_i",        operands:"",                 canThrow:true, stackDelta:0},   //0xC1
  {name:"inclocal_i",         operands:"index:u30",        canThrow:true, stackDelta:0},   //0xC2
  {name:"declocal_i",         operands:"index:u30",        canThrow:true, stackDelta:0},   //0xC3
  {name:"negate_i",           operands:"",                 canThrow:true, stackDelta:0},   //0xC4
  {name:"add_i",              operands:"",                 canThrow:true, stackDelta:-1},  //0xC5
  {name:"subtract_i",         operands:"",                 canThrow:true, stackDelta:-1},  //0xC6
  {name:"multiply_i",         operands:"",                 canThrow:true, stackDelta:-1},  //0xC7
  null,  //0xC8
  null,  //0xC9
  null,  //0xCA
  null,  //0xCB
  null,  //0xCC
  null,  //0xCD
  null,  //0xCE
  null,  //0xCF
  {name:"getlocal0",          operands:"",                 canThrow:false, stackDelta:1},   //0xD0
  {name:"getlocal1",          operands:"",                 canThrow:false, stackDelta:1},   //0xD1
  {name:"getlocal2",          operands:"",                 canThrow:false, stackDelta:1},   //0xD2
  {name:"getlocal3",          operands:"",                 canThrow:false, stackDelta:1},   //0xD3
  {name:"setlocal0",          operands:"",                 canThrow:false, stackDelta:-1},  //0xD4
  {name:"setlocal1",          operands:"",                 canThrow:false, stackDelta:-1},  //0xD5
  {name:"setlocal2",          operands:"",                 canThrow:false, stackDelta:-1},  //0xD6
  {name:"setlocal3",          operands:"",                 canThrow:false, stackDelta:-1},  //0xD7
  null,  //0xD8
  null,  //0xD9
  null,  //0xDA
  null,  //0xDB
  null,  //0xDC
  null,  //0xDD
  null,  //0xDE
  null,  //0xDF
  null,  //0xE0
  null,  //0xE1
  null,  //0xE2
  null,  //0xE3
  null,  //0xE4
  null,  //0xE5
  null,  //0xE6
  null,  //0xE7
  null,  //0xE8
  null,  //0xE9
  null,  //0xEA
  null,  //0xEB
  null,  //0xEC
  {name:"invalid",            operands:"",                 canThrow:false, stackDelta:0},  //0xED
  null,  //0xEE-wasOP_abs_jump
  {name:"debug",              operands:"debugType:u08,index:u30S,reg:u08,extra:u30",  canThrow:true, stackDelta:0},  //0xEF
  {name:"debugline",          operands:"lineNumber:u30",   canThrow:true, stackDelta:0},  //0xF0
  {name:"debugfile",          operands:"index:u30S",       canThrow:true, stackDelta:0},  //0xF1
  null,  //0xF2
  null,  //0xF3
  null,  //0xF4
  null,  //0xF5
  null,  //0xF6
  null,  //0xF7
  null,  //0xF8
  null,  //0xF9
  null,  //0xFA
  null,  //0xFB
  null,  //0xFC
  null,  //0xFD
  null,  //0xFE
  null   //0xFF
];

/**
 * Performs additional operations on the opcodeTable such as expanding the operands into objects.
 */
(function processOpcodeTable() {
  function splitter(value) {
    var list = value.split(":");
    return {name:list[0], size:list[1].substring(0,3), type:list[1].substring(3)};
  }
  for (var i = 0; i < opcodeTable.length; i++) {
    var entry = opcodeTable[i];
    if (entry && entry.operands !== null) {
      if (entry.operands === "") {
        entry.operands = [];
      } else {
        entry.operands = entry.operands.split(",").map(splitter);
      }
    }
  }
})();

function opcodeName(op) {
  return opcodeTable[op].name;
}
