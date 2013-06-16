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
/* global slice */

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
