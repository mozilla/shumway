/* -*- mode: javascript; tab-width: 4; indent-tabs-mode: nil -*- */

/** @const */ var SI8         = 0;
/** @const */ var SI16        = 1;
/** @const */ var SI32        = 2;
/** @const */ var UI8         = 3;
/** @const */ var UI16        = 4;
/** @const */ var UI32        = 5;
/** @const */ var FIXED       = 6;
/** @const */ var FIXED8      = 7;
/** @const */ var FLOAT16     = 8;
/** @const */ var FLOAT       = 9;
/** @const */ var DOUBLE      = 10;
/** @const */ var EncodedU32  = 11;

/** @const */ var BOOL        = 12;
/** @const */ var ALIGN       = 13;

function createFlexibleType(id) {
  var factory = function() {
    return { $: id, args: slice.call(arguments) };
  };
  factory.valueOf = function() {
    return id;
  };
  return factory;
}

var SB      = createFlexibleType(14);
var UB      = createFlexibleType(15);
var FB      = createFlexibleType(16);
var STRING  = createFlexibleType(17);
var BINARY  = createFlexibleType(18);
