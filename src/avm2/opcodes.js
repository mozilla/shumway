var opcodes = [
    null,  //0x00
    {name:"bkpt", operands:0, canthrow:false, stackdelta:0},  //0x01
    {name:"nop", operands:0, canthrow:false, stackdelta:0},  //0x02
    {name:"throw", operands:0, canthrow:true, stackdelta:-1},  //0x03
    {name:"getsuper", operands:1, canthrow:true, stackdelta:0},  //0x04
    {name:"setsuper", operands:1, canthrow:true, stackdelta:-2},  //0x05
    {name:"dxns", operands:1, canthrow:true, stackdelta:0},  //0x06
    {name:"dxnslate", operands:0, canthrow:true, stackdelta:-1},  //0x07
    {name:"kill", operands:1, canthrow:false, stackdelta:0},  //0x08
    {name:"label", operands:0, canthrow:false, stackdelta:0},  //0x09
    {name:"lf32x4", operands:0, canthrow:true, stackdelta:0},  //0x0A
    {name:"sf32x4", operands:0, canthrow:true, stackdelta:-2},  //0x0B
    {name:"ifnlt", operands:1, canthrow:true, stackdelta:-2},  //0x0C
    {name:"ifnle", operands:1, canthrow:true, stackdelta:-2},  //0x0D
    {name:"ifngt", operands:1, canthrow:true, stackdelta:-2},  //0x0E
    {name:"ifnge", operands:1, canthrow:true, stackdelta:-2},  //0x0F
    {name:"jump", operands:1, canthrow:false, stackdelta:0},  //0x10
    {name:"iftrue", operands:1, canthrow:false, stackdelta:-1},  //0x11
    {name:"iffalse", operands:1, canthrow:false, stackdelta:-1},  //0x12
    {name:"ifeq", operands:1, canthrow:true, stackdelta:-2},  //0x13
    {name:"ifne", operands:1, canthrow:true, stackdelta:-2},  //0x14
    {name:"iflt", operands:1, canthrow:true, stackdelta:-2},  //0x15
    {name:"ifle", operands:1, canthrow:true, stackdelta:-2},  //0x16
    {name:"ifgt", operands:1, canthrow:true, stackdelta:-2},  //0x17
    {name:"ifge", operands:1, canthrow:true, stackdelta:-2},  //0x18
    {name:"ifstricteq", operands:1, canthrow:false, stackdelta:-2},  //0x19
    {name:"ifstrictne", operands:1, canthrow:false, stackdelta:-2},  //0x1A
    {name:"lookupswitch", operands:2, canthrow:false, stackdelta:-1},  //0x1B
    {name:"pushwith", operands:0, canthrow:false, stackdelta:-1},  //0x1C
    {name:"popscope", operands:0, canthrow:false, stackdelta:0},  //0x1D
    {name:"nextname", operands:0, canthrow:true, stackdelta:-1},  //0x1E
    {name:"hasnext", operands:0, canthrow:true, stackdelta:-1},  //0x1F
    {name:"pushnull", operands:0, canthrow:false, stackdelta:1},  //0x20
    {name:"pushundefined", operands:0, canthrow:false, stackdelta:1},  //0x21
    {name:"pushfloat", opearnds:1, canthrow:false, stackdelta:1},  //0x22
    {name:"nextvalue", operands:0, canthrow:true, stackdelta:-1},  //0x23
    {name:"pushbyte", operands:1, canthrow:false, stackdelta:1},  //0x24
    {name:"pushshort", operands:1, canthrow:false, stackdelta:1},  //0x25
    {name:"pushtrue", operands:0, canthrow:false, stackdelta:1},  //0x26
    {name:"pushfalse", operands:0, canthrow:false, stackdelta:1},  //0x27
    {name:"pushnan", operands:0, canthrow:false, stackdelta:1},  //0x28
    {name:"pop", operands:0, canthrow:false, stackdelta:-1},  //0x29
    {name:"dup", operands:0, canthrow:false, stackdelta:1},  //0x2A
    {name:"swap", operands:0, canthrow:false, stackdelta:0},  //0x2B
    {name:"pushstring", operands:1, canthrow:false, stackdelta:1},  //0x2C
    {name:"pushint", operands:1, canthrow:false, stackdelta:1},  //0x2D
    {name:"pushuint", operands:1, canthrow:false, stackdelta:1},  //0x2E
    {name:"pushdouble", operands:1, canthrow:false, stackdelta:1},  //0x2F
    {name:"pushscope", operands:0, canthrow:false, stackdelta:-1},  //0x30
    {name:"pushnamespace", operands:1, canthrow:false, stackdelta:1},  //0x31
    {name:"hasnext2", operands:2, canthrow:true, stackdelta:1},  //0x32
    {name:"lix8", operands:-1, canthrow:true, stackdelta:0, internal:true},  //0x33
    {name:"lix16", operands:-1, canthrow:true, stackdelta:0, internal:true},  //0x34
    {name:"li8", operands:0, canthrow:true, stackdelta:0},  //0x35
    {name:"li16", operands:0, canthrow:true, stackdelta:0},  //0x36
    {name:"li32", operands:0, canthrow:true, stackdelta:0},  //0x37
    {name:"lf32", operands:0, canthrow:true, stackdelta:0},  //0x38
    {name:"lf64", operands:0, canthrow:true, stackdelta:0},  //0x39
    {name:"si8", operands:0, canthrow:true, stackdelta:-2},  //0x3A
    {name:"si16", operands:0, canthrow:true, stackdelta:-2},  //0x3B
    {name:"si32", operands:0, canthrow:true, stackdelta:-2},  //0x3C
    {name:"sf32", operands:0, canthrow:true, stackdelta:-2},  //0x3D
    {name:"sf64", operands:0, canthrow:true, stackdelta:-2},  //0x3E
    null,  //0x3F
    {name:"newfunction", operands:1, canthrow:true, stackdelta:1},  //0x40
    {name:"call", operands:1, canthrow:true, stackdelta:-1},  //0x41
    {name:"construct", operands:1, canthrow:true, stackdelta:0},  //0x42
    {name:"callmethod", operands:2, canthrow:true, stackdelta:0},  //0x43
    {name:"callstatic", operands:2, canthrow:true, stackdelta:0},  //0x44
    {name:"callsuper", operands:2, canthrow:true, stackdelta:0},  //0x45
    {name:"callproperty", operands:2, canthrow:true, stackdelta:0},  //0x46
    {name:"returnvoid", operands:0, canthrow:false, stackdelta:0},  //0x47
    {name:"returnvalue", operands:0, canthrow:true, stackdelta:-1},  //0x48
    {name:"constructsuper", operands:1, canthrow:true, stackdelta:-1},  //0x49
    {name:"constructprop", operands:2, canthrow:true, stackdelta:0},  //0x4A
    {name:"callsuperid", operands:-1, canthrow:true, stackdelta:0, internal:true},  //0x4B
    {name:"callproplex", operands:2, canthrow:true, stackdelta:0},  //0x4C
    {name:"callinterface", operands:-1, canthrow:true, stackdelta:0, internal:true},  //0x4D
    {name:"callsupervoid", operands:2, canthrow:true, stackdelta:-1},  //0x4E
    {name:"callpropvoid", operands:2, canthrow:true, stackdelta:-1},  //0x4F
    {name:"sxi1", operands:0, canthrow:false, stackdelta:0},  //0x50
    {name:"sxi8", operands:0, canthrow:false, stackdelta:0},  //0x51
    {name:"sxi16", operands:0, canthrow:false, stackdelta:0},  //0x52
    {name:"applytype", operands:1, canthrow:true, stackdelta:0},  //0x53
    {name:"pushfloat4", operands:1, canthrow:false, stackdelta:1},  //0x54
    {name:"newobject", operands:1, canthrow:true, stackdelta:1},  //0x55
    {name:"newarray", operands:1, canthrow:true, stackdelta:1},  //0x56
    {name:"newactivation", operands:0, canthrow:true, stackdelta:1},  //0x57
    {name:"newclass", operands:1, canthrow:true, stackdelta:0},  //0x58
    {name:"getdescendants", operands:1, canthrow:true, stackdelta:0},  //0x59
    {name:"newcatch", operands:1, canthrow:true, stackdelta:1},  //0x5A
    {name:"findpropglobalstrict", operands:-1, canthrow:true, stackdelta:0, internal:true},  //0x5B
    {name:"findpropglobal", operands:-1, canthrow:true, stackdelta:0, internal:true},  //0x5C
    {name:"findpropstrict", operands:1, canthrow:true, stackdelta:1},  //0x5D
    {name:"findproperty", operands:1, canthrow:true, stackdelta:1},  //0x5E
    {name:"finddef", operands:1, canthrow:true, stackdelta:1},  //0x5F
    {name:"getlex", operands:1, canthrow:true, stackdelta:1},  //0x60
    {name:"setproperty", operands:1, canthrow:true, stackdelta:-2},  //0x61
    {name:"getlocal", operands:1, canthrow:false, stackdelta:1},  //0x62
    {name:"setlocal", operands:1, canthrow:false, stackdelta:-1},  //0x63
    {name:"getglobalscope", operands:0, canthrow:false, stackdelta:1},  //0x64
    {name:"getscopeobject", operands:1, canthrow:false, stackdelta:1},  //0x65
    {name:"getproperty", operands:1, canthrow:true, stackdelta:0},  //0x66
    {name:"getouterscope", operands:1, canthrow:false, stackdelta:1},  //0x67
    {name:"initproperty", operands:1, canthrow:true, stackdelta:-2},  //0x68
    null,  //0x69
    {name:"deleteproperty", operands:1, canthrow:true, stackdelta:0},  //0x6A
    null,  //0x6B
    {name:"getslot", operands:1, canthrow:true, stackdelta:0},  //0x6C
    {name:"setslot", operands:1, canthrow:true, stackdelta:-2},  //0x6D
    {name:"getglobalslot", operands:1, canthrow:false, stackdelta:1},  //0x6E
    {name:"setglobalslot", operands:1, canthrow:false, stackdelta:-1},  //0x6F
    {name:"convert_s", operands:0, canthrow:true, stackdelta:0},  //0x70
    {name:"esc_xelem", operands:0, canthrow:true, stackdelta:0},  //0x71
    {name:"esc_xattr", operands:0, canthrow:true, stackdelta:0},  //0x72
    {name:"convert_i", operands:0, canthrow:true, stackdelta:0},  //0x73
    {name:"convert_u", operands:0, canthrow:true, stackdelta:0},  //0x74
    {name:"convert_d", operands:0, canthrow:true, stackdelta:0},  //0x75
    {name:"convert_b", operands:0, canthrow:true, stackdelta:0},  //0x76
    {name:"convert_o", operands:0, canthrow:true, stackdelta:0},  //0x77
    {name:"checkfilter", operands:0, canthrow:true, stackdelta:0},  //0x78
    {name:"convert_f", operands:0, canthrow:true, stackdelta:0},  //0x79
    {name:"unplus", operands:0, canthrow:true, stackdelta:0},  //0x7A
    {name:"convert_f4", operands:0, canthrow:true, stackdelta:0},  //0x7B
    null,  //0x7C
    null,  //0x7D
    null,  //0x7E
    null,  //0x7F
    {name:"coerce", operands:1, canthrow:true, stackdelta:0},  //0x80
    {name:"coerce_b", operands:0, canthrow:true, stackdelta:0},  //0x81
    {name:"coerce_a", operands:0, canthrow:true, stackdelta:0},  //0x82
    {name:"coerce_i", operands:0, canthrow:true, stackdelta:0},  //0x83
    {name:"coerce_d", operands:0, canthrow:true, stackdelta:0},  //0x84
    {name:"coerce_s", operands:0, canthrow:true, stackdelta:0},  //0x85
    {name:"astype", operands:1, canthrow:true, stackdelta:0},  //0x86
    {name:"astypelate", operands:0, canthrow:true, stackdelta:-1},  //0x87
    {name:"coerce_u", operands:0, canthrow:true, stackdelta:0},  //0x88
    {name:"coerce_o", operands:0, canthrow:true, stackdelta:0},  //0x89
    null,  //0x8A
    null,  //0x8B
    null,  //0x8C
    null,  //0x8D
    null,  //0x8E
    null,  //0x8F
    {name:"negate", operands:0, canthrow:true, stackdelta:0},  //0x90
    {name:"increment", operands:0, canthrow:true, stackdelta:0},  //0x91
    {name:"inclocal", operands:1, canthrow:true, stackdelta:0},  //0x92
    {name:"decrement", operands:0, canthrow:true, stackdelta:0},  //0x93
    {name:"declocal", operands:1, canthrow:true, stackdelta:0},  //0x94
    {name:"typeof", operands:0, canthrow:false, stackdelta:0},  //0x95
    {name:"not", operands:0, canthrow:false, stackdelta:0},  //0x96
    {name:"bitnot", operands:0, canthrow:true, stackdelta:0},  //0x97
    null,  //0x98
    null,  //0x99
    null,  //0x9A
    null,  //0x9B
    null,  //0x9C
    null,  //0x9D
    null,  //0x9E
    null,  //0x9F
    {name:"add", operands:0, canthrow:true, stackdelta:-1},  //0xA0
    {name:"subtract", operands:0, canthrow:true, stackdelta:-1},  //0xA1
    {name:"multiply", operands:0, canthrow:true, stackdelta:-1},  //0xA2
    {name:"divide", operands:0, canthrow:true, stackdelta:-1},  //0xA3
    {name:"modulo", operands:0, canthrow:true, stackdelta:-1},  //0xA4
    {name:"lshift", operands:0, canthrow:true, stackdelta:-1},  //0xA5
    {name:"rshift", operands:0, canthrow:true, stackdelta:-1},  //0xA6
    {name:"urshift", operands:0, canthrow:true, stackdelta:-1},  //0xA7
    {name:"bitand", operands:0, canthrow:true, stackdelta:-1},  //0xA8
    {name:"bitor", operands:0, canthrow:true, stackdelta:-1},  //0xA9
    {name:"bitxor", operands:0, canthrow:true, stackdelta:-1},  //0xAA
    {name:"equals", operands:0, canthrow:true, stackdelta:-1},  //0xAB
    {name:"strictequals", operands:0, canthrow:true, stackdelta:-1},  //0xAC
    {name:"lessthan", operands:0, canthrow:true, stackdelta:-1},  //0xAD
    {name:"lessequals", operands:0, canthrow:true, stackdelta:-1},  //0xAE
    {name:"greaterthan", operands:0, canthrow:true, stackdelta:-1},  //0xAF
    {name:"greaterequals", operands:0, canthrow:true, stackdelta:-1},  //0xB0
    {name:"instanceof", operands:0, canthrow:true, stackdelta:-1},  //0xB1
    {name:"istype", operands:1, canthrow:true, stackdelta:0},  //0xB2
    {name:"istypelate", operands:0, canthrow:true, stackdelta:-1},  //0xB3
    {name:"in", operands:0, canthrow:true, stackdelta:-1},  //0xB4
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
    {name:"increment_i", operands:0, canthrow:true, stackdelta:0},  //0xC0
    {name:"decrement_i", operands:0, canthrow:true, stackdelta:0},  //0xC1
    {name:"inclocal_i", operands:1, canthrow:true, stackdelta:0},  //0xC2
    {name:"declocal_i", operands:1, canthrow:true, stackdelta:0},  //0xC3
    {name:"negate_i", operands:0, canthrow:true, stackdelta:0},  //0xC4
    {name:"add_i", operands:0, canthrow:true, stackdelta:-1},  //0xC5
    {name:"subtract_i", operands:0, canthrow:true, stackdelta:-1},  //0xC6
    {name:"multiply_i", operands:0, canthrow:true, stackdelta:-1},  //0xC7
    null,  //0xC8
    null,  //0xC9
    null,  //0xCA
    null,  //0xCB
    null,  //0xCC
    null,  //0xCD
    null,  //0xCE
    null,  //0xCF
    {name:"getlocal0", operands:0, canthrow:false, stackdelta:1},  //0xD0
    {name:"getlocal1", operands:0, canthrow:false, stackdelta:1},  //0xD1
    {name:"getlocal2", operands:0, canthrow:false, stackdelta:1},  //0xD2
    {name:"getlocal3", operands:0, canthrow:false, stackdelta:1},  //0xD3
    {name:"setlocal0", operands:0, canthrow:false, stackdelta:-1},  //0xD4
    {name:"setlocal1", operands:0, canthrow:false, stackdelta:-1},  //0xD5
    {name:"setlocal2", operands:0, canthrow:false, stackdelta:-1},  //0xD6
    {name:"setlocal3", operands:0, canthrow:false, stackdelta:-1},  //0xD7
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
    null,  //0xED
    null,  //0xEE-wasOP_abs_jump
    {name:"debug", operands:4, canthrow:true, stackdelta:0},  //0xEF
    {name:"debugline", operands:1, canthrow:true, stackdelta:0},  //0xF0
    {name:"debugfile", operands:1, canthrow:true, stackdelta:0},  //0xF1
    {name:"bkptline", operands:1, canthrow:false, stackdelta:0},  //0xF2
    {name:"timestamp", operands:0, canthrow:false, stackdelta:0},  //0xF3
    {name:"restargc", operands:-1, canthrow:true, stackdelta:0, internal:true},  //0xF4
    {name:"restarg", operands:-1, canthrow:true, stackdelta:0, internal:true},  //0xF5
    null,  //0xF6
    null,  //0xF7
    null,  //0xF8
    null,  //0xF9
    null,  //0xFA
    null,  //0xFB
    null,  //0xFC
    null,  //0xFD
    null,  //0xFE
    null  //0xFF
];

function getOpcodeName(op) {
    return opcodes[op].name;
}