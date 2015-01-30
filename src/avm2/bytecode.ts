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

module Shumway.AVM2 {
  import assert = Shumway.Debug.assert;
  import unexpected = Shumway.Debug.unexpected;

  import AbcFile = Shumway.AVM2.ABC.AbcFile;
  import Trait = Shumway.AVM2.ABC.Trait;
  import Info = Shumway.AVM2.ABC.Info;
  import AbcStream = Shumway.AVM2.ABC.AbcStream;
  import ConstantPool = Shumway.AVM2.ABC.ConstantPool;
  import ClassInfo = Shumway.AVM2.ABC.ClassInfo;
  import MethodInfo = Shumway.AVM2.ABC.MethodInfo;
  import top = Shumway.ArrayUtilities.top;
  import peek = Shumway.ArrayUtilities.peek;

  export enum OP {
    bkpt               = 0x01,
    nop                = 0x02,
    getsuper           = 0x04,
    setsuper           = 0x05,
    dxns               = 0x06,
    dxnslate           = 0x07,
    kill               = 0x08,
    label              = 0x09,
    lf32x4             = 0x0A,
    sf32x4             = 0x0B,
    ifnlt              = 0x0C,
    ifnle              = 0x0D,
    ifngt              = 0x0E,
    ifnge              = 0x0F,
    jump               = 0x10,
    iftrue             = 0x11,
    iffalse            = 0x12,
    ifeq               = 0x13,
    ifne               = 0x14,
    iflt               = 0x15,
    ifle               = 0x16,
    ifgt               = 0x17,
    ifge               = 0x18,
    ifstricteq         = 0x19,
    ifstrictne         = 0x1A,
    lookupswitch       = 0x1B,
    pushwith           = 0x1C,
    popscope           = 0x1D,
    nextname           = 0x1E,
    hasnext            = 0x1F,
    pushnull           = 0x20,
    pushundefined      = 0x21,
    pushfloat          = 0x22,
    nextvalue          = 0x23,
    pushbyte           = 0x24,
    pushshort          = 0x25,
    pushtrue           = 0x26,
    pushfalse          = 0x27,
    pushnan            = 0x28,
    pop                = 0x29,
    dup                = 0x2A,
    swap               = 0x2B,
    pushstring         = 0x2C,
    pushint            = 0x2D,
    pushuint           = 0x2E,
    pushdouble         = 0x2F,
    pushscope          = 0x30,
    pushnamespace      = 0x31,
    hasnext2           = 0x32,
    li8                = 0x35,
    li16               = 0x36,
    li32               = 0x37,
    lf32               = 0x38,
    lf64               = 0x39,
    si8                = 0x3A,
    si16               = 0x3B,
    si32               = 0x3C,
    sf32               = 0x3D,
    sf64               = 0x3E,
    newfunction        = 0x40,
    call               = 0x41,
    construct          = 0x42,
    callmethod         = 0x43,
    callstatic         = 0x44,
    callsuper          = 0x45,
    callproperty       = 0x46,
    returnvoid         = 0x47,
    returnvalue        = 0x48,
    constructsuper     = 0x49,
    constructprop      = 0x4A,
    callsuperid        = 0x4B,
    callproplex        = 0x4C,
    callinterface      = 0x4D,
    callsupervoid      = 0x4E,
    callpropvoid       = 0x4F,
    sxi1               = 0x50,
    sxi8               = 0x51,
    sxi16              = 0x52,
    applytype          = 0x53,
    pushfloat4         = 0x54,
    newobject          = 0x55,
    newarray           = 0x56,
    newactivation      = 0x57,
    newclass           = 0x58,
    getdescendants     = 0x59,
    newcatch           = 0x5A,
    findpropstrict     = 0x5D,
    findproperty       = 0x5E,
    finddef            = 0x5F,
    getlex             = 0x60,
    setproperty        = 0x61,
    getlocal           = 0x62,
    setlocal           = 0x63,
    getglobalscope     = 0x64,
    getscopeobject     = 0x65,
    getproperty        = 0x66,
    getouterscope      = 0x67,
    initproperty       = 0x68,
    setpropertylate    = 0x69,
    deleteproperty     = 0x6A,
    deletepropertylate = 0x6B,
    getslot            = 0x6C,
    setslot            = 0x6D,
    getglobalslot      = 0x6E,
    setglobalslot      = 0x6F,
    convert_s          = 0x70,
    esc_xelem          = 0x71,
    esc_xattr          = 0x72,
    convert_i          = 0x73,
    convert_u          = 0x74,
    convert_d          = 0x75,
    convert_b          = 0x76,
    convert_o          = 0x77,
    checkfilter        = 0x78,
    convert_f          = 0x79,
    unplus             = 0x7a,
    convert_f4         = 0x7b,
    coerce             = 0x80,
    coerce_b           = 0x81,
    coerce_a           = 0x82,
    coerce_i           = 0x83,
    coerce_d           = 0x84,
    coerce_s           = 0x85,
    astype             = 0x86,
    astypelate         = 0x87,
    coerce_u           = 0x88,
    coerce_o           = 0x89,
    negate             = 0x90,
    increment          = 0x91,
    inclocal           = 0x92,
    decrement          = 0x93,
    declocal           = 0x94,
    not                = 0x96,
    bitnot             = 0x97,
    add                = 0xA0,
    subtract           = 0xA1,
    multiply           = 0xA2,
    divide             = 0xA3,
    modulo             = 0xA4,
    lshift             = 0xA5,
    rshift             = 0xA6,
    urshift            = 0xA7,
    bitand             = 0xA8,
    bitor              = 0xA9,
    bitxor             = 0xAA,
    equals             = 0xAB,
    strictequals       = 0xAC,
    lessthan           = 0xAD,
    lessequals         = 0xAE,
    greaterthan        = 0xAF,
    greaterequals      = 0xB0,
    istype             = 0xB2,
    istypelate         = 0xB3,
    increment_i        = 0xC0,
    decrement_i        = 0xC1,
    inclocal_i         = 0xC2,
    declocal_i         = 0xC3,
    negate_i           = 0xC4,
    add_i              = 0xC5,
    subtract_i         = 0xC6,
    multiply_i         = 0xC7,
    getlocal0          = 0xD0,
    getlocal1          = 0xD1,
    getlocal2          = 0xD2,
    getlocal3          = 0xD3,
    setlocal0          = 0xD4,
    setlocal1          = 0xD5,
    setlocal2          = 0xD6,
    setlocal3          = 0xD7,
    invalid            = 0xED,
    debug              = 0xEF,
    debugline          = 0xF0,
    debugfile          = 0xF1,
    bkptline           = 0xF2,
    timestamp          = 0xF3,
    // TODO: move these to their correct places in the list once IntelliJ doesn't show them as
    // syntax errors.
    throw              = 0x03,
    typeof             = 0x95,
    instanceof         = 0xB1,
    in                 = 0xB4,
  }

  export interface OpcodeOperandDescription {
    name: string;
    size: OpcodeSize;
    type: string;
  }

  export interface OpcodeDescription {
    canThrow: boolean;
    operands: OpcodeOperandDescription [];
  }

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
  export var opcodeTable: OpcodeDescription [] = [
    null,
    /* bkpt */ { canThrow: false, operands: [] },
    /* nop */ { canThrow: false, operands: [] },
    /* throw */ { canThrow: true, operands: [] },
    /* getsuper */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "" }] },
    /* setsuper */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "" }] },
    /* dxns */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "" }] },
    /* dxnslate */ { canThrow: true, operands: [] },
    /* kill */ { canThrow: false, operands: [{ name: "index", size: OpcodeSize.u30, type: "" }] },
    /* label */ { canThrow: false, operands: [] },
    /* lf32x4 */ { canThrow: true, operands: [] },
    /* sf32x4 */ { canThrow: true, operands: [] },
    /* ifnlt */ { canThrow: true, operands: [{ name: "offset", size: OpcodeSize.s24, type: "" }] },
    /* ifnle */ { canThrow: true, operands: [{ name: "offset", size: OpcodeSize.s24, type: "" }] },
    /* ifngt */ { canThrow: true, operands: [{ name: "offset", size: OpcodeSize.s24, type: "" }] },
    /* ifnge */ { canThrow: true, operands: [{ name: "offset", size: OpcodeSize.s24, type: "" }] },
    /* jump */ { canThrow: false, operands: [{ name: "offset", size: OpcodeSize.s24, type: "" }] },
    /* iftrue */ { canThrow: false, operands: [{ name: "offset", size: OpcodeSize.s24, type: "" }] },
    /* iffalse */ { canThrow: false, operands: [{ name: "offset", size: OpcodeSize.s24, type: "" }] },
    /* ifeq */ { canThrow: true, operands: [{ name: "offset", size: OpcodeSize.s24, type: "" }] },
    /* ifne */ { canThrow: true, operands: [{ name: "offset", size: OpcodeSize.s24, type: "" }] },
    /* iflt */ { canThrow: true, operands: [{ name: "offset", size: OpcodeSize.s24, type: "" }] },
    /* ifle */ { canThrow: true, operands: [{ name: "offset", size: OpcodeSize.s24, type: "" }] },
    /* ifgt */ { canThrow: true, operands: [{ name: "offset", size: OpcodeSize.s24, type: "" }] },
    /* ifge */ { canThrow: true, operands: [{ name: "offset", size: OpcodeSize.s24, type: "" }] },
    /* ifstricteq */ { canThrow: false, operands: [{ name: "offset", size: OpcodeSize.s24, type: "" }] },
    /* ifstrictne */ { canThrow: false, operands: [{ name: "offset", size: OpcodeSize.s24, type: "" }] },
    /* lookupswitch */ { canThrow: false, operands: null },
    /* pushwith */ { canThrow: false, operands: [] },
    /* popscope */ { canThrow: false, operands: [] },
    /* nextname */ { canThrow: true, operands: [] },
    /* hasnext */ { canThrow: true, operands: [] },
    /* pushnull */ { canThrow: false, operands: [] },
    /* pushundefined */ { canThrow: false, operands: [] },
    null,
    /* nextvalue */ { canThrow: true, operands: [] },
    /* pushbyte */ { canThrow: false, operands: [{ name: "value", size: OpcodeSize.s08, type: "" }] },
    /* pushshort */ { canThrow: false, operands: [{ name: "value", size: OpcodeSize.s16, type: "" }] },
    /* pushtrue */ { canThrow: false, operands: [] },
    /* pushfalse */ { canThrow: false, operands: [] },
    /* pushnan */ { canThrow: false, operands: [] },
    /* pop */ { canThrow: false, operands: [] },
    /* dup */ { canThrow: false, operands: [] },
    /* swap */ { canThrow: false, operands: [] },
    /* pushstring */ { canThrow: false, operands: [{ name: "index", size: OpcodeSize.u30, type: "S" }] },
    /* pushint */ { canThrow: false, operands: [{ name: "index", size: OpcodeSize.u30, type: "I" }] },
    /* pushuint */ { canThrow: false, operands: [{ name: "index", size: OpcodeSize.u30, type: "U" }] },
    /* pushdouble */ { canThrow: false, operands: [{ name: "index", size: OpcodeSize.u30, type: "D" }] },
    /* pushscope */ { canThrow: false, operands: [] },
    /* pushnamespace */ { canThrow: false, operands: [{ name: "index", size: OpcodeSize.u30, type: "N" }] },
    /* hasnext2 */ { canThrow: true, operands: [{ name: "object", size: OpcodeSize.u30, type: "" }, { name: "index", size: OpcodeSize.u30, type: "" }] },
    /* lix8 */ { canThrow: true, operands: null },
    /* lix16 */ { canThrow: true, operands: null },
    /* li8 */ { canThrow: true, operands: [] },
    /* li16 */ { canThrow: true, operands: [] },
    /* li32 */ { canThrow: true, operands: [] },
    /* lf32 */ { canThrow: true, operands: [] },
    /* lf64 */ { canThrow: true, operands: [] },
    /* si8 */ { canThrow: true, operands: [] },
    /* si16 */ { canThrow: true, operands: [] },
    /* si32 */ { canThrow: true, operands: [] },
    /* sf32 */ { canThrow: true, operands: [] },
    /* sf64 */ { canThrow: true, operands: [] },
    null,
    /* newfunction */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "MI" }] },
    /* call */ { canThrow: true, operands: [{ name: "argCount", size: OpcodeSize.u30, type: "" }] },
    /* construct */ { canThrow: true, operands: [{ name: "argCount", size: OpcodeSize.u30, type: "" }] },
    /* callmethod */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "" }, { name: "argCount", size: OpcodeSize.u30, type: "" }] },
    /* callstatic */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "MI" }, { name: "argCount", size: OpcodeSize.u30, type: "" }] },
    /* callsuper */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "M" }, { name: "argCount", size: OpcodeSize.u30, type: "" }] },
    /* callproperty */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "M" }, { name: "argCount", size: OpcodeSize.u30, type: "" }] },
    /* returnvoid */ { canThrow: false, operands: [] },
    /* returnvalue */ { canThrow: true, operands: [] },
    /* constructsuper */ { canThrow: true, operands: [{ name: "argCount", size: OpcodeSize.u30, type: "" }] },
    /* constructprop */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "M" }, { name: "argCount", size: OpcodeSize.u30, type: "" }] },
    /* callsuperid */ { canThrow: true, operands: null },
    /* callproplex */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "M" }, { name: "argCount", size: OpcodeSize.u30, type: "" }] },
    /* callinterface */ { canThrow: true, operands: null },
    /* callsupervoid */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "M" }, { name: "argCount", size: OpcodeSize.u30, type: "" }] },
    /* callpropvoid */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "M" }, { name: "argCount", size: OpcodeSize.u30, type: "" }] },
    /* sxi1 */ { canThrow: false, operands: [] },
    /* sxi8 */ { canThrow: false, operands: [] },
    /* sxi16 */ { canThrow: false, operands: [] },
    /* applytype */ { canThrow: true, operands: [{ name: "argCount", size: OpcodeSize.u30, type: "" }] },
    /* pushfloat4 */ { canThrow: false, operands: null },
    /* newobject */ { canThrow: true, operands: [{ name: "argCount", size: OpcodeSize.u30, type: "" }] },
    /* newarray */ { canThrow: true, operands: [{ name: "argCount", size: OpcodeSize.u30, type: "" }] },
    /* newactivation */ { canThrow: true, operands: [] },
    /* newclass */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "CI" }] },
    /* getdescendants */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "M" }] },
    /* newcatch */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "EI" }] },
    /* findpropglobalstrict */ { canThrow: true, operands: null },
    /* findpropglobal */ { canThrow: true, operands: null },
    /* findpropstrict */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "M" }] },
    /* findproperty */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "M" }] },
    /* finddef */ { canThrow: true, operands: null },
    /* getlex */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "M" }] },
    /* setproperty */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "M" }] },
    /* getlocal */ { canThrow: false, operands: [{ name: "index", size: OpcodeSize.u30, type: "" }] },
    /* setlocal */ { canThrow: false, operands: [{ name: "index", size: OpcodeSize.u30, type: "" }] },
    /* getglobalscope */ { canThrow: false, operands: [] },
    /* getscopeobject */ { canThrow: false, operands: [{ name: "index", size: OpcodeSize.u30, type: "" }] },
    /* getproperty */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "M" }] },
    /* getouterscope */ { canThrow: false, operands: null },
    /* initproperty */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "M" }] },
    null,
    /* deleteproperty */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "M" }] },
    null,
    /* getslot */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "" }] },
    /* setslot */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "" }] },
    /* getglobalslot */ { canThrow: false, operands: [{ name: "index", size: OpcodeSize.u30, type: "" }] },
    /* setglobalslot */ { canThrow: false, operands: [{ name: "index", size: OpcodeSize.u30, type: "" }] },
    /* convert_s */ { canThrow: true, operands: [] },
    /* esc_xelem */ { canThrow: true, operands: [] },
    /* esc_xattr */ { canThrow: true, operands: [] },
    /* convert_i */ { canThrow: true, operands: [] },
    /* convert_u */ { canThrow: true, operands: [] },
    /* convert_d */ { canThrow: true, operands: [] },
    /* convert_b */ { canThrow: true, operands: [] },
    /* convert_o */ { canThrow: true, operands: [] },
    /* checkfilter */ { canThrow: true, operands: [] },
    /* convert_f */ { canThrow: true, operands: [] },
    /* unplus */ { canThrow: true, operands: [] },
    /* convert_f4 */ { canThrow: true, operands: [] },
    null,
    null,
    null,
    null,
    /* coerce */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "M" }] },
    /* coerce_b */ { canThrow: true, operands: [] },
    /* coerce_a */ { canThrow: true, operands: [] },
    /* coerce_i */ { canThrow: true, operands: [] },
    /* coerce_d */ { canThrow: true, operands: [] },
    /* coerce_s */ { canThrow: true, operands: [] },
    /* astype */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "M" }] },
    /* astypelate */ { canThrow: true, operands: [] },
    /* coerce_u */ { canThrow: true, operands: [] },
    /* coerce_o */ { canThrow: true, operands: [] },
    null,
    null,
    null,
    null,
    null,
    null,
    /* negate */ { canThrow: true, operands: [] },
    /* increment */ { canThrow: true, operands: [] },
    /* inclocal */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "" }] },
    /* decrement */ { canThrow: true, operands: [] },
    /* declocal */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "" }] },
    /* typeof */ { canThrow: false, operands: [] },
    /* not */ { canThrow: false, operands: [] },
    /* bitnot */ { canThrow: true, operands: [] },
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    /* add */ { canThrow: true, operands: [] },
    /* subtract */ { canThrow: true, operands: [] },
    /* multiply */ { canThrow: true, operands: [] },
    /* divide */ { canThrow: true, operands: [] },
    /* modulo */ { canThrow: true, operands: [] },
    /* lshift */ { canThrow: true, operands: [] },
    /* rshift */ { canThrow: true, operands: [] },
    /* urshift */ { canThrow: true, operands: [] },
    /* bitand */ { canThrow: true, operands: [] },
    /* bitor */ { canThrow: true, operands: [] },
    /* bitxor */ { canThrow: true, operands: [] },
    /* equals */ { canThrow: true, operands: [] },
    /* strictequals */ { canThrow: true, operands: [] },
    /* lessthan */ { canThrow: true, operands: [] },
    /* lessequals */ { canThrow: true, operands: [] },
    /* greaterthan */ { canThrow: true, operands: [] },
    /* greaterequals */ { canThrow: true, operands: [] },
    /* instanceof */ { canThrow: true, operands: [] },
    /* istype */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "M" }] },
    /* istypelate */ { canThrow: true, operands: [] },
    /* in */ { canThrow: true, operands: [] },
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    /* increment_i */ { canThrow: true, operands: [] },
    /* decrement_i */ { canThrow: true, operands: [] },
    /* inclocal_i */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "" }] },
    /* declocal_i */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "" }] },
    /* negate_i */ { canThrow: true, operands: [] },
    /* add_i */ { canThrow: true, operands: [] },
    /* subtract_i */ { canThrow: true, operands: [] },
    /* multiply_i */ { canThrow: true, operands: [] },
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    /* getlocal0 */ { canThrow: false, operands: [] },
    /* getlocal1 */ { canThrow: false, operands: [] },
    /* getlocal2 */ { canThrow: false, operands: [] },
    /* getlocal3 */ { canThrow: false, operands: [] },
    /* setlocal0 */ { canThrow: false, operands: [] },
    /* setlocal1 */ { canThrow: false, operands: [] },
    /* setlocal2 */ { canThrow: false, operands: [] },
    /* setlocal3 */ { canThrow: false, operands: [] },
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    /* invalid */ { canThrow: false, operands: [] },
    null,
    // Debug operands are mapped to commonly used fields so we don't have to keep extra fields
    // on Bytecode which we wouldn't use anyway.
    ///* debug */ { canThrow: true, operands: [{ name: "debugType", size: OpcodeSize.u08, type: "" }, { name: "index", size: OpcodeSize.u30, type: "S" }, { name: "reg", size: OpcodeSize.u08, type: "" }, { name: "extra", size: OpcodeSize.u30, type: "" }] },
    ///* debugline */ { canThrow: true, operands: [{ name: "lineNumber", size: OpcodeSize.u30, type: "" }] },
    /* debug */ { canThrow: true, operands: [{ name: "value", size: OpcodeSize.u08, type: "" }, { name: "index", size: OpcodeSize.u30, type: "S" }, { name: "object", size: OpcodeSize.u08, type: "" }, { name: "argCount", size: OpcodeSize.u30, type: "" }] },
    /* debugline */ { canThrow: true, operands: [{ name: "offset", size: OpcodeSize.u30, type: "" }] },
    /* debugfile */ { canThrow: true, operands: [{ name: "index", size: OpcodeSize.u30, type: "S" }] },
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null
  ];

  export enum OpcodeSize {
    u08,
    s08,
    s16,
    s24,
    u30,
    u32
  }

  export function opcodeName(op) {
    return OP[op];
  }

  /**
   * A normalized AS3 bytecode, or BasicBlock.
   */
  export class Bytecode {
    ti: Verifier.TypeInformation = null;
    op: number; // Initialized in ctor.
    position: number = 0;
    canThrow: boolean; // Initialized in ctor.
    offsets: number [] = null;
    target: Bytecode = null;
    targets: Bytecode [] = null;
    level: number = 0;

    // Block data. Not split out into its own, lazily initialized structure because that slows
    // down the verifier phase by about 15%.
    bid: number;
    succs: Bytecode [] = null;
    preds: Bytecode [] = null;
    dominatees: Bytecode [] = null;

    dominator: Bytecode = null;
    end: Bytecode = null;
    region: Compiler.IR.Region = null;
    spbacks: BlockSet = null;
    bdo: number = 0;
    hasCatches: boolean = false;
    verifierEntryState: Verifier.State = null;

    // Operands
    index: number = 0;
    object: number = 0;
    argCount: number = 0;
    offset: number = 0;
    value: number = 0;

    constructor(code) {
      // If no code is passed, we're creating an invalid opcode for bogus jumps.
      if (!code) {
        this.op = OP.invalid;
        this.canThrow = true;
        return;
      }
      var op = code.readU8();
      this.op = op;

      var opdesc = opcodeTable[op];
      release || opdesc || unexpected("Unknown Op " + op);
      this.canThrow = opdesc.canThrow;

      var i, n;

      if (op === OP.lookupswitch) {
        var defaultOffset = code.readS24();
        this.offsets = [];
        var n = code.readU30() + 1;
        for (i = 0; i < n; i++) {
          this.offsets.push(code.readS24());
        }
        this.offsets.push(defaultOffset);
      } else {
        for (i = 0, n = opdesc.operands.length; i < n; i++) {
          var operand = opdesc.operands[i];

          switch (operand.size) {
           case OpcodeSize.u08:
              this[operand.name] = code.readU8();
              break;
           case OpcodeSize.s08:
              this[operand.name] = code.readS8();
              break;
           case OpcodeSize.s16:
              this[operand.name] = code.readS16();
              break;
           case OpcodeSize.s24:
              this[operand.name] = code.readS24();
              break;
           case OpcodeSize.u30:
              this[operand.name] = code.readU30();
              break;
           case OpcodeSize.u32:
              this[operand.name] = code.readU32();
              break;
            default:
              release || unexpected();
          }
        }
      }
    }

    makeBlockHead(id) {
      if (this.succs) {
        return id;
      }

      this.bid = id;

      // CFG edges.
      this.succs = [];
      this.preds = [];

      // Dominance relation edges.
      this.dominatees = [];

      return id + 1;
    }

    trace(writer) {
      if (!this.succs) {
        return;
      }

      writer.writeLn("#" + this.bid);
    }

    toString(abc) {
      var opDescription = Shumway.AVM2.opcodeTable[this.op];
      var str = opcodeName(this.op).padRight(' ', 20);
      var i, j;

      if (this.op === OP.lookupswitch) {
        str += "targets:";
        for (i = 0, j = this.targets.length; i < j; i++) {
          str += (i > 0 ? "," : "") + this.targets[i].position;
        }
      } else {
        for (i = 0, j = opDescription.operands.length; i < j; i++) {
          var operand = opDescription.operands[i];
          if (operand.name === "offset") {
            str += "target:" + this.target.position;
          } else {
            str += operand.name + ": ";
            var value = this[operand.name];
            if (abc) {
              switch(operand.type) {
                case "":   str += value; break;
                case "I":  str += abc.constantPool.ints[value]; break;
                case "U":  str += abc.constantPool.uints[value]; break;
                case "D":  str += abc.constantPool.doubles[value]; break;
                case "S":  str += abc.constantPool.strings[value]; break;
                case "N":  str += abc.constantPool.namespaces[value]; break;
                case "CI": str += abc.classes[value]; break;
                case "M":  str += abc.constantPool.multinames[value]; break;
                default:   str += "?"; break;
              }
            } else {
              str += value;
            }
          }

          if (i < j - 1) {
            str += ", ";
          }
        }
      }

      return str;
    }
  }

  export interface BytecodeVisitor {
    (bytecode: Bytecode): void;
  }

  import BITS_PER_WORD = Shumway.BitSets.BITS_PER_WORD;
  import ADDRESS_BITS_PER_WORD = Shumway.BitSets.ADDRESS_BITS_PER_WORD;
  import BIT_INDEX_MASK = Shumway.BitSets.BIT_INDEX_MASK;

  export class BlockSet extends Shumway.BitSets.Uint32ArrayBitSet {
    constructor(length: number, public blockById: Shumway.Map<Bytecode>) {
      super(length);
    }

    forEachBlock(fn: BytecodeVisitor) {
      release || assert(fn);
      var byId = this.blockById;
      var bits = this.bits;
      for (var i = 0, j = bits.length; i < j; i++) {
        var word = bits[i];
        if (word) {
          for (var k = 0; k < BITS_PER_WORD; k++) {
            if (word & (1 << k)) {
              fn(byId[i * BITS_PER_WORD + k]);
            }
          }
        }
      }
    }

    choose(): Bytecode {
      var byId = this.blockById;
      var bits = this.bits;
      for (var i = 0, j = bits.length; i < j; i++) {
        var word = bits[i];
        if (word) {
          for (var k = 0; k < BITS_PER_WORD; k++) {
            if (word & (1 << k)) {
              return byId[i * BITS_PER_WORD + k];
            }
          }
        }
      }
    }

    members(): Bytecode [] {
      var byId = this.blockById;
      var set = [];
      var bits = this.bits;
      for (var i = 0, j = bits.length; i < j; i++) {
        var word = bits[i];
        if (word) {
          for (var k = 0; k < BITS_PER_WORD; k++) {
            if (word & (1 << k)) {
              set.push(byId[i * BITS_PER_WORD + k]);
            }
          }
        }
      }
      return set;
    }

    setBlocks(bs: Bytecode []) {
      var bits = this.bits;
      for (var i = 0, j = bs.length; i < j; i++) {
        var id = bs[i].bid;
        bits[id >> ADDRESS_BITS_PER_WORD] |= 1 << (id & BIT_INDEX_MASK);
      }
    }
  }
  
  export class Analysis {
    blocks: Bytecode [];
    bytecodes: Bytecode [];
    boundBlockSet: any;
    markedLoops: boolean;
    analyzedControlFlow: boolean;
    constructor(public methodInfo: MethodInfo) {
      if (this.methodInfo.code) {
        enterTimeline("normalizeBytecode");
        this.normalizeBytecode();
        leaveTimeline();
      }
    }

    makeBlockSetFactory(length: number, blockById: Shumway.Map<Bytecode>) {
      release || assert (!this.boundBlockSet);
      this.boundBlockSet = <any>(function blockSet() {
        return new Shumway.AVM2.BlockSet(length, blockById);
      });
    }

    /**
     * Marks the parameter as used if it's ever accessed via getLocal.
     */
    accessLocal(index: number) {
      if (index-- === 0) return; // First index is |this|.
      if (index < this.methodInfo.parameters.length) {
        this.methodInfo.parameters[index].isUsed = true;
      }
    }

    /**
     * Internal bytecode used for bogus jumps. They should be emitted as throws
     * so that if control flow ever reaches them, we crash.
     */
    getInvalidTarget(cache, offset) {
      if (cache && cache[offset]) {
        return cache[offset];
      }

      var code = new Bytecode(null);
      code.position = offset;
      cache && (cache[offset] = code);
      return code;
    }

    normalizeBytecode() {
      var methodInfo = this.methodInfo;

      // This array is sparse, indexed by offset.
      var bytecodesOffset = [];
      
      // This array is dense.
      var bytecodes = [];
      var codeStream = new AbcStream(this.methodInfo.code);
      var bytecode;

      while (codeStream.remaining() > 0) {
        var pos = codeStream.position;
        bytecode = new Bytecode(codeStream);

        // Get absolute offsets for normalization to new indices below.
        switch (bytecode.op) {
          case OP.nop:
          case OP.label:
            bytecodesOffset[pos] = bytecodes.length;
            continue;

          case OP.lookupswitch:
            this.methodInfo.hasLookupSwitches = true;
            bytecode.targets = [];
            var offsets = bytecode.offsets;
            for (var i = 0, j = offsets.length; i < j; i++) {
              offsets[i] += pos;
            }
            break;

          case OP.jump:
          case OP.iflt:
          case OP.ifnlt:
          case OP.ifle:
          case OP.ifnle:
          case OP.ifgt:
          case OP.ifngt:
          case OP.ifge:
          case OP.ifnge:
          case OP.ifeq:
          case OP.ifne:
          case OP.ifstricteq:
          case OP.ifstrictne:
          case OP.iftrue:
          case OP.iffalse:
            bytecode.offset += codeStream.position;
            break;
          case OP.getlocal0:
          case OP.getlocal1:
          case OP.getlocal2:
          case OP.getlocal3:
            this.accessLocal(bytecode.op - OP.getlocal0);
            break;
          case OP.getlocal:
            this.accessLocal(bytecode.index);
            break;
          default:
            break;
        }

        // Cache the position in the bytecode array.
        bytecode.position = bytecodes.length;
        bytecodesOffset[pos] = bytecodes.length;
        bytecodes.push(bytecode);
      }

      var invalidJumps = {};
      var newOffset;
      for (var pc = 0, end = bytecodes.length; pc < end; pc++) {
        bytecode = bytecodes[pc];
        switch (bytecode.op) {
          case OP.lookupswitch:
            var offsets = bytecode.offsets;
            for (var i = 0, j = offsets.length; i < j; i++) {
              newOffset = bytecodesOffset[offsets[i]];
              bytecode.targets.push(bytecodes[newOffset] || this.getInvalidTarget(invalidJumps, offsets[i]));
              offsets[i] = newOffset;
            }
            break;

          case OP.jump:
          case OP.iflt:
          case OP.ifnlt:
          case OP.ifle:
          case OP.ifnle:
          case OP.ifgt:
          case OP.ifngt:
          case OP.ifge:
          case OP.ifnge:
          case OP.ifeq:
          case OP.ifne:
          case OP.ifstricteq:
          case OP.ifstrictne:
          case OP.iftrue:
          case OP.iffalse:
            newOffset = bytecodesOffset[bytecode.offset];
            bytecode.target = (bytecodes[newOffset] || this.getInvalidTarget(invalidJumps, bytecode.offset));
            bytecode.offset = newOffset;
            break;
          default:
        }
      }

      this.bytecodes = bytecodes;

      // Normalize exceptions table to use new offsets.
      var exceptions = this.methodInfo.exceptions;
      for (var i = 0, j = exceptions.length; i < j; i++) {
        var ex = exceptions[i];
        ex.start = bytecodesOffset[ex.start];
        ex.end = bytecodesOffset[ex.end];
        ex.offset = bytecodesOffset[ex.target];
        ex.target = bytecodes[ex.offset];
        ex.target.exception = ex;
      }
    }

    analyzeControlFlow() {
      release || assert(this.bytecodes);
      enterTimeline("analyzeControlFlow");
      this.detectBasicBlocks();
      this.normalizeReachableBlocks();
      this.computeDominance();
      this.analyzedControlFlow = true;
      leaveTimeline();
      return true;
    }

    detectBasicBlocks() {
      var bytecodes = this.bytecodes;
      var exceptions = this.methodInfo.exceptions;
      var hasExceptions = exceptions.length > 0;
      var blockById: Shumway.Map<Bytecode> = {};
      var code: Bytecode;
      var pc, end;
      var id = 0;
  
      function tryTargets(block): Bytecode [] {
        var targets = [];
        for (var i = 0, j = exceptions.length; i < j; i++) {
          var ex = exceptions[i];
          if (block.position >= ex.start && block.end.position <= ex.end) {
            targets.push(ex.target);
          }
        }
        return targets;
      }
  
      id = bytecodes[0].makeBlockHead(id);
      for (pc = 0, end = bytecodes.length - 1; pc < end; pc++) {
        code = bytecodes[pc];
        switch (code.op) {
          case OP.returnvoid:
          case OP.returnvalue:
          case OP.throw:
            id = bytecodes[pc + 1].makeBlockHead(id);
            break;
  
          case OP.lookupswitch:
            var targets = code.targets;
            for (var i = 0, j = targets.length; i < j; i++) {
              id = targets[i].makeBlockHead(id);
            }
            id = bytecodes[pc + 1].makeBlockHead(id);
            break;
  
          case OP.jump:
          case OP.iflt:
          case OP.ifnlt:
          case OP.ifle:
          case OP.ifnle:
          case OP.ifgt:
          case OP.ifngt:
          case OP.ifge:
          case OP.ifnge:
          case OP.ifeq:
          case OP.ifne:
          case OP.ifstricteq:
          case OP.ifstrictne:
          case OP.iftrue:
          case OP.iffalse:
            id = code.target.makeBlockHead(id);
            id = bytecodes[pc + 1].makeBlockHead(id);
            break;
  
          default:
        }
      }
  
      code = bytecodes[end];
      switch (code.op) {
        case OP.returnvoid:
        case OP.returnvalue:
        case OP.throw:
          break;
  
        case OP.lookupswitch:
          var targets = code.targets;
          for (var i = 0, j = targets.length; i < j; i++) {
            id = targets[i].makeBlockHead(id);
          }
          break;
  
        case OP.jump:
          id = code.target.makeBlockHead(id);
          break;
  
        case OP.iflt:
        case OP.ifnlt:
        case OP.ifle:
        case OP.ifnle:
        case OP.ifgt:
        case OP.ifngt:
        case OP.ifge:
        case OP.ifnge:
        case OP.ifeq:
        case OP.ifne:
        case OP.ifstricteq:
        case OP.ifstrictne:
        case OP.iftrue:
        case OP.iffalse:
          id = code.target.makeBlockHead(id);
          bytecodes[pc + 1] = this.getInvalidTarget(null, pc + 1);
          id = bytecodes[pc + 1].makeBlockHead(id);
          break;
  
        default:
      }
  
      // Mark exceptions.
      if (hasExceptions) {
        for (var i = 0; i < exceptions.length; i++) {
          var ex = exceptions[i];
          var tryStart = bytecodes[ex.start];
          var afterTry = bytecodes[ex.end + 1];
  
          id = tryStart.makeBlockHead(id);
          if (afterTry) {
            id = afterTry.makeBlockHead(id);
          }
          id = ex.target.makeBlockHead(id);
        }
      }
  
      var currentBlock = bytecodes[0];
      for (pc = 1, end = bytecodes.length; pc < end; pc++) {
        if (!bytecodes[pc].succs) {
          continue;
        }
  
        release || assert(currentBlock.succs);
  
        blockById[currentBlock.bid] = currentBlock;
        code = bytecodes[pc - 1];
        currentBlock.end = code;
        var nextBlock = bytecodes[pc];
  
        switch (code.op) {
          case OP.returnvoid:
          case OP.returnvalue:
          case OP.throw:
            break;
  
          case OP.lookupswitch:
            for (var i = 0, j = code.targets.length; i < j; i++) {
              currentBlock.succs.push(code.targets[i]);
            }
            break;
  
          case OP.jump:
            currentBlock.succs.push(code.target);
            break;
  
          case OP.iflt:
          case OP.ifnlt:
          case OP.ifle:
          case OP.ifnle:
          case OP.ifgt:
          case OP.ifngt:
          case OP.ifge:
          case OP.ifnge:
          case OP.ifeq:
          case OP.ifne:
          case OP.ifstricteq:
          case OP.ifstrictne:
          case OP.iftrue:
          case OP.iffalse:
            currentBlock.succs.push(code.target);
            if (code.target !== nextBlock) {
              currentBlock.succs.push(nextBlock);
            }
            break;
  
          default:
            currentBlock.succs.push(nextBlock);
        }
  
        if (hasExceptions) {
          var targets = tryTargets(currentBlock);
          currentBlock.hasCatches = targets.length > 0;
          currentBlock.succs.push.apply(currentBlock.succs, targets);
        }
  
        currentBlock = nextBlock;
      }
      blockById[currentBlock.bid] = currentBlock;
  
      code = bytecodes[end - 1];
      switch (code.op) {
        case OP.lookupswitch:
          for (var i = 0, j = code.targets.length; i < j; i++) {
            currentBlock.succs.push(code.targets[i]);
          }
          break;
  
        case OP.jump:
          currentBlock.succs.push(code.target);
          break;
  
        default:
      }
      currentBlock.end = code;

      this.makeBlockSetFactory(id, blockById);
    }

    normalizeReachableBlocks() {
      var root = this.bytecodes[0];

      // The root must not have preds!
      release || assert(root.preds.length === 0);

      var ONCE = 1;
      var BUNCH_OF_TIMES = 2;


      var blocks = [];
      var visited = {};
      var ancestors = {};
      var worklist = [root];
      var node;

      ancestors[root.bid] = true;
      while ((node = top(worklist))) {
        if (visited[node.bid]) {
          if (visited[node.bid] === ONCE) {
            visited[node.bid] = BUNCH_OF_TIMES;
            blocks.push(node);

            // Doubly link reachable blocks.
            var succs = node.succs;
            for (var i = 0, j = succs.length; i < j; i++) {
              succs[i].preds.push(node);
            }
          }

          ancestors[node.bid] = false;
          worklist.pop();
          continue;
        }

        visited[node.bid] = ONCE;
        ancestors[node.bid] = true;

        var succs = node.succs;
        for (var i = 0, j = succs.length; i < j; i++) {
          var s = succs[i];

          if (ancestors[s.bid]) {
            if (!node.spbacks) {
              node.spbacks = new this.boundBlockSet();
            }
            node.spbacks.set(s.bid);
          }
          !visited[s.bid] && worklist.push(s);
        }
      }

      this.blocks = blocks.reverse();
    }

    /**
     * Calculate the dominance relation iteratively.
     * Algorithm is from [1].
     * [1] Cooper et al. "A Simple, Fast Dominance Algorithm"
     */
    computeDominance() {
      function intersectDominators(doms, b1, b2) {
        var finger1 = b1;
        var finger2 = b2;
        while (finger1 !== finger2) {
          while (finger1 > finger2) {
            finger1 = doms[finger1];
          }
          while (finger2 > finger1) {
            finger2 = doms[finger2];
          }
        }
        return finger1;
      }

      var blocks = this.blocks;
      var n = blocks.length;
      var doms = new Array(n);
      doms[0] =  0;

      // Blocks must be given to us in reverse postorder.
      var rpo = {};
      for (var b = 0; b < n; b++) {
        rpo[blocks[b].bid] = b;
      }

      var changed = true;
      while (changed) {
        changed = false;

        // Iterate all blocks but the starting block.
        for (var b = 1; b < n; b++) {
          var preds = blocks[b].preds;
          var j = preds.length;

          var newIdom = rpo[preds[0].bid];
          // Because 0 is falsy, have to use |in| here.
          if (!(newIdom in doms)) {
            for (var i = 1; i < j; i++) {
              newIdom = rpo[preds[i].bid];
              if (newIdom in doms) {
                break;
              }
            }
          }
          release || assert(newIdom in doms);

          for (var i = 0; i < j; i++) {
            var p = rpo[preds[i].bid];
            if (p === newIdom) {
              continue;
            }

            if (p in doms) {
              newIdom = intersectDominators(doms, p, newIdom);
            }
          }

          if (doms[b] !== newIdom) {
            doms[b] = newIdom;
            changed = true;
          }
        }
      }

      blocks[0].dominator = blocks[0];
      var block;
      for (var b = 1; b < n; b++) {
        block = blocks[b];
        var idom = blocks[doms[b]];

        // Store the immediate dominator.
        block.dominator = idom;
        idom.dominatees.push(block);

        block.npreds = block.preds.length;
      }

      // Assign dominator tree levels.
      var worklist = [blocks[0]];
      blocks[0].level || (blocks[0].level = 0);
      while ((block = worklist.shift())) {
        var dominatees = block.dominatees;
        for (var i = 0; i < dominatees.length; i++) {
          dominatees[i].level = block.level + 1;
        }
        worklist.push.apply(worklist, dominatees);
      }
    }

    markLoops() {
      if (!this.analyzedControlFlow && !this.analyzeControlFlow()) {
        return false;
      }

      var bytecodes = this.bytecodes;

      var BoundBlockSet = this.boundBlockSet;

      //
      // Find all SCCs at or below the level of some root that are not already
      // natural loops.
      //
      function findSCCs(root) {
        var preorderId = 1;
        var preorder = {};
        var assigned = {};
        var unconnectedNodes = [];
        var pendingNodes = [];
        var sccs = [];
        var level = root.level + 1;
        var worklist = [root];
        var node;
        var u, s;

        while ((node = top(worklist))) {
          if (preorder[node.bid]) {
            if (peek(pendingNodes) === node) {
              pendingNodes.pop();

              var scc = [];
              do {
                u = unconnectedNodes.pop();
                assigned[u.bid] = true;
                scc.push(u);
              } while (u !== node);

              if (scc.length > 1 || (u.spbacks && u.spbacks.get(u.bid))) {
                sccs.push(scc);
              }
            }

            worklist.pop();
            continue;
          }

          preorder[node.bid] = preorderId++;
          unconnectedNodes.push(node);
          pendingNodes.push(node);

          var succs = node.succs;
          for (var i = 0, j = succs.length; i < j; i++) {
            s = succs[i];
            if (s.level < level) {
              continue;
            }

            var sid = s.bid;
            if (!preorder[sid]) {
              worklist.push(s);
            } else if (!assigned[sid]) {
              while (preorder[peek(pendingNodes).bid] > preorder[sid]) {
                pendingNodes.pop();
              }
            }
          }
        }

        return sccs;
      }

      function findLoopHeads(blocks) {
        var heads = new BoundBlockSet();

        for (var i = 0, j = blocks.length; i < j; i++) {
          var block = blocks[i];
          var spbacks = block.spbacks;

          if (!spbacks) {
            continue;
          }

          var succs = block.succs;
          for (var k = 0, l = succs.length; k < l; k++) {
            var s = succs[k];
            if (spbacks.get(s.bid)) {
              heads.set(s.dominator.bid);
            }
          }
        }

        return heads.members();
      }

      function LoopInfo(scc, loopId) {
        var body = new BoundBlockSet();
        body.setBlocks(scc);
        body.recount();

        this.id = loopId;
        this.body = body;
        this.exit = new BoundBlockSet();
        this.save = {};
        this.head = new BoundBlockSet();
        this.npreds = 0;
        this._dirtyLocals = null;
      }

      LoopInfo.prototype.getDirtyLocals = function () {
        if (this._dirtyLocals) {
          return this._dirtyLocals;
        }
        var dirtyLocals = this._dirtyLocals = [];
        var blocks = this.body.members();
        blocks.forEach(function (block: Bytecode) {
          for (var bci = block.position, end = block.end.position; bci <= end; bci++) {
            var bc = bytecodes[bci];
            var op = bc.op;
            switch (op) {
              case OP.inclocal:
              case OP.declocal:
              case OP.setlocal:
              case OP.inclocal_i:
              case OP.declocal_i:
                dirtyLocals[bc.index] = true;
                break;
              case OP.hasnext2:
                dirtyLocals[bc.index] = true;
                dirtyLocals[bc.object] = true;
                break;
              case OP.setlocal0:
              case OP.setlocal1:
              case OP.setlocal2:
              case OP.setlocal3:
                dirtyLocals[op - OP.setlocal0] = true;
                break;
            }
          }
        });
        return dirtyLocals;
      };

      var heads = findLoopHeads(this.blocks);
      if (heads.length <= 0) {
        this.markedLoops = true;
        return true;
      }

      var worklist = heads.sort(function (a, b) {
        return a.level - b.level;
      });
      var loopId = 0;

      for (var n = worklist.length - 1; n >= 0; n--) {
        var t = worklist[n];
        var sccs = findSCCs(t);
        if (sccs.length === 0) {
          continue;
        }

        for (var i = 0, j = sccs.length; i < j; i++) {
          var scc = sccs[i];
          var loop = new LoopInfo(scc, loopId++);
          for (var k = 0, l = scc.length; k < l; k++) {
            var h = scc[k];
            if (h.level === t.level + 1 && !h.loop) {
              h.loop = loop;
              loop.head.set(h.bid);

              var preds = h.preds;
              for (var pi = 0, pj = preds.length; pi < pj; pi++) {
                loop.body.get(preds[pi].bid) && h.npreds--;
              }
              loop.npreds += h.npreds;
            }
          }

          for (var k = 0, l = scc.length; k < l; k++) {
            var h = scc[k];
            if (h.level === t.level + 1) {
              h.npreds = loop.npreds;
            }
          }

          loop.head.recount();
        }
      }

      this.markedLoops = true;
      return true;
    }
  }
}

var Bytecode = Shumway.AVM2.Bytecode;
var Analysis = Shumway.AVM2.Analysis;
