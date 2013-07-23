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

/*
  SWF Parser

  We investigate the efficacy of rewriting the SWF parser in C using Emscripten
  to generate efficient JS. Before we can rewrite the SWF parser in C we need
  to define the interface between the existing code and the parts to be
  rewritten in C, which can accept numeric values and typed arrays of numeric
  values.

  That interface currently consists of a table of tag handlers (functions that
  parse individual SWF tags), and a Stream class that manages reading source
  bytes down the the bit level. (The SWF file format encodes values at the sub-
  byte level to conserve space.) The tag handlers parse a SWF tags to object
  values, which are then interpreted by the Shumway runtime. Since C code cannot
  produce JS object values, it will produce a byte array that encodes the
  resulting syntax tree in binary form. It will be left to the runtime to decode
  that blob when needed during rendering.

  -- Binary object encoding for parse trees
  -- Stream class for reading bytes (and bits) from the input stream

  Work list

  1. Rewrite the Stream class to read bytes directly from the source byte array,
     without the use of non-numeric values.
  2. Define a binary format for encoding parse trees as binary encoded object
     values (e.g. Universal Binary JSON, UBJSON).
  3. Rewrite the tag handlers in C (or hand optimized asm.js) to read SWF bits
     and write syntax trees as UBJSON.
  4. Decode binary objects as needed during rendering.

  Goals and Risks

  We are aiming for a 10x improvement in parsing time (not including the lazy
  decoding time.) This will provide very quick startup times for large files and
  hopefully faster overall SWF rendering times. We hope to use form flexible
  construction of decoded syntax trees to avoid blocking startup and mimimizing
  memory use by allocating tag object values incrementally.
  
  Risks include falling short of the 10x improvement, and not being able to
  efficiently decode binary syntax trees to the object values used by the
  renderer.

  NEXT STEPS

  Our next steps focus on proving that the proposed design will likely result in
  the performance gains we aim for. This consists of two sub-proofs: 1/that a
  SWF to binary syntax tree parser can be much (10x) faster than the existing
  parser; and 2/that lazy decoding of binary syntax trees is not inttrude in the
  process of rendering the binary tags.

  We intend to initially write SWF tag handlers using asm.js. This will allow us
  to avoid the overhead of writing rewriting and integrating a C based parser.
  Writing  code in asm.js allows us to patch existing tag handlers incrementally,
  sometimes depending on non-asmjs code in non-critical paths.
  
  STATUS

  [2013-07-13] Items 1 and 2 above are approaching completeness. 3 is prototyped
  in ASM.JS and is showing promising but still inconclusive results. 4 is not
  started.
  

  [2013-07-10] This version of 'handlers.js' is 10x smaller and loads 4x faster
  (6ms vs 24ms) and parses 10% faster (515ms vs 445ms for the mining truck game
  2.5Mb) than the automatically generated version. This by itself is not very
  impressive, but this version lays the foundation for further work (see TODO
  below) that should yield signficant improvements.

  TODO

  -- Read bytes directly from $bytes, rather than through ffi helpers
  -- Build outgoing objects during decoding rather that a separate copy path
  -- In line asmjs functions like crazy
  -- Explore the use of hybrid functions that defeat the AOT compiler but
     directly manipulate outgoing objects and take advantage of the jit

  EXPERIMENTS

  -- Generate C from tags.js/struct.js spec and compile using Emscripten
  -- Emit JSON as C-strings and call JSON.parse() to decode
  -- Emit object values directly using ffi imports

*/

function trace (str) {
  if (this.print) {
    print(str);
  }
}

function dumpBytes(bytes, start, length, offset) {  
  var s = "";
  var end = start + length;
  for (var i = start; i < end; i++) {
    if (((i - start) % 16) === 0) {
      s += "\n" + (i - offset) + ": ";
    }
    s += bytes[i] + " ";
  }
  print("dumping " + length + " bytes: " + s);
}      

var tagHandler = (function (global) {

  var Asm = function Asm(stdlib, imports, heap) {
    "use asm";

    var inputStreamOffset = 8388608; // 2^23
    var inputStreamPos = 8388608;
    var maskOffset = 8387584; // 2^23 - 2^10
    var scratchOffset = 8387520; // 2^23 - 2^10 - 2^3
    var pos = 0;
    var RED = 1;
    var GREEN = 2;
    var BLUE = 3;
    var ALPHA = 4;
    var WIDTH = 5;
    var WIDTH_MORPH = 6;
    var START_CAP_STYLE = 7;
    var JOIN_STYLE = 8;
    var HAS_FILL = 9;
    var NO_HSCALE = 10;
    var NO_VSCALE = 11;
    var PIXEL_HINTING = 12;
    var NO_CLOSE = 13;
    var END_CAP_STYLE = 14;
    var MITER_LIMIT_FACTOR = 15;
    var COLOR = 16;
    var COLOR_MORPH = 17;
    var MATRIX = 18;
    var SYMBOL_ID = 19;
    var DEPTH = 20;
    var FLAGS = 21;
    var NAME = 22;
    var DATA = 23;
    var IS_STRAIGHT = 24;
    var IS_GENERAL = 25;
    var DELTA_X = 26;
    var DELTA_Y = 27;
    var IS_VERTICAL = 28;
    var CONTROL_DELTA_X = 29;
    var CONTROL_DELTA_Y = 30;
    var ANCHOR_DELTA_X = 31;
    var ANCHOR_DELTA_Y = 32;
    var A = 33;
    var B = 34;
    var C = 35;
    var D = 36;
    var TX = 37;
    var TY = 38;
    var HAS_EVENTS = 39;
    var CLIP = 40;
    var HAS_NAME = 41;
    var HAS_RATIO = 42;
    var HAS_CXFORM = 43;
    var HAS_MATRIX = 44;
    var PLACE = 45;
    var MOVE = 46;
    var HAS_BACKGROUND_COLOR = 47;
    var HAS_VISIBILITY = 48;
    var HAS_IMAGE = 49;
    var HAS_CLASS_NAME = 50;
    var HAS_CACHE = 51;
    var BLEND = 52;
    var HAS_FILTERS = 53;
    var CLASS_NAME = 54;
    var RATIO = 55;
    var CLIP_DEPTH = 56;
    var FILTERS = 57;
    var BLEND_MODE = 58;
    var BMP_CACHE = 59;
    var BACKGROUND_COLOR = 60;
    var VISIBILITY = 61;
    var CACHE = 62;
    var CXFORM = 63;
    var RED_MULTIPLIER = 64;
    var GREEN_MULTIPLIER = 65;
    var BLUE_MULTIPLIER = 66
    var ALPHA_MULTIPLIER = 67;
    var RED_OFFSET = 68;
    var GREEN_OFFSET = 69;
    var BLUE_OFFSET = 70;
    var ALPHA_OFFSET = 71;
    var EVENTS = 72;
    var ID = 73;
    var BBOX = 74;
    var IS_MORPH = 75;
    var BBOX_MORPH = 76;
    var HAS_STROKES = 77
    var STROKE_BBOX = 78;
    var STROKE_BBOX_MORPH = 79;
    var FILL_WINDING = 80;
    var NONSCALING_STROKES = 81;
    var SCALING_STROKES = 82;
    var OFFSET_MORPH = 83;
    var LEFT = 84;
    var RIGHT = 85;
    var TOP = 86;
    var BOTTOM = 87;
    var RECORDS = 88;
    var TYPE = 89;
    var HAS_NEW_STYLES = 90;
    var HAS_LINE_STYLE = 91;
    var HAS_FILL_STYLE_1 = 92;
    var HAS_FILL_STYLE_0 = 93;
    var MOVE_X = 94;
    var MOVE_Y = 95;
    var FILL_STYLE_0 = 96;
    var FILL_STYLE_1 = 97;
    var MATRIX_MORPH = 98;
    var SPREAD_MODE = 99;
    var INTERPOLATION_MODE = 100;
    var COUNT = 101;
    var FOCAL_POINT = 102;
    var FOCAL_POINT_MORPH = 102;
    var RATIO_MORPH = 103;
    var BITMAP_ID = 104;
    var CONDITION = 105;
    var FILL_STYLE = 106;
    var MORPH_COLOR = 107;
    var RECORDS_MORPH = 108;
    var COLORS = 109;
    var HIGHLIGHT_COLOR = 110;
    var RATIOS = 111;
    var BLUR_X = 112;
    var BLUR_Y = 113;
    var ANGLE = 114;
    var DISTANCE = 115;
    var STRENGTH = 116;
    var INNER_SHADOW = 117;
    var KNOCKOUT = 118;
    var COMPOSITE_SOURCE = 119;
    var ON_TOP = 120;
    var PASSES = 121;
    var COLUMNS = 122;
    var ROWS = 123;
    var DIVISOR = 124;
    var BIAS = 125;
    var WEIGHTS = 126;
    var DEFAULT_COLOR = 127;
    var CLAMP = 128;
    var PRESERVE_ALPHA = 129;
    var ON_KEY_UP = 130;
    var ON_KEY_DOWN = 131;
    var ON_MOUSE_UP = 132;
    var ON_MOUSE_DOWN = 133;
    var ON_MOUSE_MOVE = 134;
    var ON_UNLOAD = 135;
    var ON_ENTER_FRAME = 136;
    var ON_LOAD = 137;
    var ON_DRAG_OVER = 138;
    var ON_ROLL_OUT = 139;
    var ON_ROLL_OVER = 140;
    var ON_RELEASE_OUTSIDE = 141;
    var ON_RELEASE = 142;
    var ON_PRESS = 143;
    var ON_INITIALIZE = 144;
    var ON_DATA = 145;
    var ON_CONSTRUCT = 146;
    var KEY_PRESS = 147;
    var ON_DRAG_OUT = 148;
    var LENGTH = 149;
    var KEY_CODE = 150;
    var ACTION_DATA = 151;

    var bytesU8 = new stdlib.Uint8Array(heap);
    var bytesU32 = new stdlib.Uint32Array(heap);
    var bytesD32 = new stdlib.Float32Array(heap);
    var bytesD64 = new stdlib.Float64Array(heap);

    var imul = stdlib.Math.imul;
    var trace = imports.trace;

    // Markers for UBJSON types
    var $o = 111;
    var $O = 79;
    var $a = 97;
    var $A = 65;
    var $B = 66;
    var $i = 105;
    var $I = 73;
    var $L = 76;
    var $d = 100;
    var $D = 68;
    var $s = 115;
    var $S = 83;
    var $Z = 90;
    var $T = 84;
    var $F = 70;
    var $$ = 36; // binary

    var $_ = 95;   // place holder byte

    // Flag bits
    var BIG = 0x00000001;

    // Bitbuffer

    var bitBuffer = 0;
    var bitLength = 0;

    // Return the current position in the ArrayBuffer.
    function getPos() {
      return pos | 0;
    }

    function setPos(p) {
      p = p | 0;
      pos = p;
    }

    function getInputStreamPos() {
      return inputStreamPos - inputStreamOffset | 0;
    }

    function setInputStreamPos(p) {
      p = p | 0;
      inputStreamPos = inputStreamOffset + p | 0;
    }

    function readStreamU8() {
      var val = 0;
      val = bytesU8[inputStreamPos] | 0;
      inputStreamPos = inputStreamPos + 1 | 0;
      return val | 0;
    }

    function readStreamU16() {
      var val = 0;
      val = (bytesU8[inputStreamPos] << 8 | 0) | 0;
      val = (val + (bytesU8[inputStreamPos + 1 | 0] | 0)) | 0;
      inputStreamPos = inputStreamPos + 2 | 0;
      return val | 0;
    }

    function readStreamU32() {
      var val = 0;
      val = bytesU8[inputStreamPos] << 24 | 0;
      val = (val + (bytesU8[inputStreamPos + 1 | 0] << 16 | 0)) | 0;
      val = (val + (bytesU8[inputStreamPos + 2 | 0] << 8 | 0)) | 0;
      val = (val + (bytesU8[inputStreamPos + 3 | 0] << 0 | 0)) | 0;
      inputStreamPos = inputStreamPos + 4 | 0;
      return val | 0;
    }

    function readStreamFixed() {
      var val = 0;
      val = bytesU8[inputStreamPos] | 0;
      val = (val + (bytesU8[inputStreamPos + 1 | 0] << 8 | 0)) | 0;
      val = (val + (bytesU8[inputStreamPos + 2 | 0] << 16 | 0)) | 0;
      val = (val + (bytesU8[inputStreamPos + 3 | 0] << 24 | 0)) | 0;
      inputStreamPos = inputStreamPos + 4 | 0;
      return +((val | 0) / 65536 | 0);
    }

    function readStreamFixed8() {
      var val = 0;
      val = bytesU8[inputStreamPos] | 0;
      val = (val + (bytesU8[inputStreamPos + 1 | 0] << 8 | 0)) | 0;
      inputStreamPos = inputStreamPos + 2 | 0;
      return +((val | 0) / 256 | 0);
    }

    function readStreamD32() {
      var val = 0.0;
      // FIXME
      inputStreamPos = inputStreamPos + 4 | 0;
      return +val;
    }

    function readStreamD64() {
      var val = 0.0;
      // FIXME
      inputStreamPos = inputStreamPos + 8 | 0;
      return +val;
    }

    // Compute bit masks for values of size 1 through 32.
    function initMasks() {
      var i = 0, mask = 0;
      for (i = 1, mask = 0; ~~i <= 32; i = i + 1 | 0) {
        bytesU32[maskOffset+(4*i | 0) >> 2] = mask = (mask << 1) | 1;
      }
    }

    function readStreamSb(size) {
      size = size | 0;
      return ((readStreamUb(size) | 0) << (32 - size)) >> (32 - size) | 0;
    }

    function readStreamFb(size) {
      size = size | 0;
      return +((readStreamSb(size | 0) | 0) / 65536 | 0);
    }
    
    function alignStream() {
      bitBuffer = 0;
      bitLength = 0;
    }

    function readStreamUb(size) {
      size = size | 0;
      // Get the last bits and bit length in case they are needed for the
      // current value
      var val = 0;
      var mask = 0;
      mask = bytesU32[maskOffset + (4 * size | 0) >> 2] | 0;
      // Shift the old bits left and OR with the new bits, then increment the
      // relevant counters.
      while (~~size > ~~bitLength) {
        bitBuffer = bitBuffer << 8 | (readStreamU8() | 0) | 0;
        bitLength = bitLength + 8 | 0;
      }
      // Shift off the unused new bits on the right and mask off the unused old
      // bits on the left.
      bitLength = bitLength - size | 0;
      val = (bitBuffer >>> bitLength) & mask;
      // Save the new bits so that the unused bits can be used to compute the
      // next value.
      return val | 0;
    }

    // Copy the string bytes to the current position in the output buffer.
    function readStreamString(length) {
      length = length | 0;
      var code = 0, i = 0;
      if (length) {
        for (i = 0; ~~i < ~~length; i = i + 1 | 0) {
          writeU8(readStreamU8() | 0);
        }
      } else {
        for (length = 0; (code = readStreamU8() | 0); length = length + 1 | 0) {
          writeU8(code);
        }
      }
      pos = pos + length | 0;
      inputStreamPos = inputStreamPos + length | 0;
/*
      var numChunks = length / 65536;
      var str = '';
      for (var i = 0; i < numChunks; ++i) {
        var begin = i * 65536;
        var end = begin + 65536;
        var chunk = codes.slice(begin, end);
        str += fromCharCode.apply(null, chunk);
      }
      return decodeURIComponent(escape(str.replace('\0', '', 'g')));
*/
      return length | 0;
    }


    function readStreamBinary(length) {
      length = length | 0;
      var code = 0, i = 0;
      for (i = 0; ~~i < ~~length; i = i + 1 | 0) {
        writeU8(readStreamU8() | 0);
      }
      pos = pos + length | 0;
      inputStreamPos = inputStreamPos + length | 0;
      return length | 0;
    }

    // BEGIN Builder

    function readU8() {
      var val = 0;
      val = bytesU8[pos] | 0;
      pos = pos + 1 | 0;
      return val | 0;
    }

    // Read an int16 value.
    function readU16() {
      var val = 0;
      val = bytesU8[pos] | 0;
      val = (val + (bytesU8[pos + 1 | 0] << 8 | 0)) | 0;
      pos = pos + 2 | 0;
      return val | 0;
    }

    // Read an uint32 value.
    function readU32() {
      var val = 0;
      val = bytesU8[pos] | 0;
      val = (val + (bytesU8[pos + 1 | 0] << 8 | 0)) | 0;
      val = (val + (bytesU8[pos + 2 | 0] << 16 | 0)) | 0;
      val = (val + (bytesU8[pos + 3 | 0] << 24 | 0)) | 0;
      pos = pos + 4 | 0;
      return val | 0;
    }

    // Write a int8 value.
    function writeU8(val) {
      val = val | 0;
      bytesU8[pos | 0] = val;
      pos = pos + 1 | 0;
    }

    // Write a uint16 value.
    function writeU16(val) {
      val = val | 0;
      bytesU8[pos | 0] = val;
      bytesU8[pos + 1 | 0] = val >> 8;
      pos = pos + 2 | 0;
    }

    // Write an int32 value.
    function writeU32(val) {
      val = val | 0;
      bytesU8[pos | 0] = val;
      bytesU8[pos + 1 | 0] = val >> 8;
      bytesU8[pos + 2 | 0] = val >> 16;
      bytesU8[pos + 3 | 0] = val >> 24;
      pos = pos + 4 | 0;
    }

    // Write a null value.
    function writeUBJNull() {
      writeU8($Z);
    }

    // Write a true value.
    function writeUBJTrue() {
      writeU8($T);
    }

    // Write a false value.
    function writeUBJFalse() {
      writeU8($F);
    }

    // Write a byte (int8) value.
    function writeUBJU8(val) {
      val = val | 0;
      bytesU8[pos | 0] = $B;
      bytesU8[pos + 1 | 0] = val;
      pos = pos + 2 | 0;
    }

    // Write a uint16 value.
    function writeUBJU16(val) {
      val = val | 0;
      bytesU8[pos | 0] = $i;
      bytesU8[pos + 1 | 0] = val >> 8;
      bytesU8[pos + 2 | 0] = val;
      pos = pos + 3 | 0;
    }

    // Write an int32 value.
    function writeUBJU32(val) {
      val = val | 0;
      bytesU8[pos | 0] = $I;
      bytesU8[pos + 1 | 0] = val >> 24 & 0xFF;
      bytesU8[pos + 2 | 0] = val >> 16 & 0xFF;
      bytesU8[pos + 3 | 0] = val >> 8 & 0xFF;
      bytesU8[pos + 4 | 0] = val & 0xFF;
      pos = pos + 5 | 0;
    }

    // WARNING writeUBJD32() and writeUBJD64() write bytes out with the reverse
    // endian-ness of the host computer. The order is reversed because UBJSON
    // demands big endian-ness and most computers use litte endian as their
    // native encoding. Either way the dependency of this implementation on the
    // native endian-ness of the host computer creates an incompatibility with
    // the UBJSON spec. This bug will only manifest itself when reading and
    // writing UBJSON values from a computer or UBJSON implementation with a
    // different endian-ness. However, these are not use cases that are in scope
    // for the current implementation.

    // Write an float32 value.
    function writeUBJD32(val) {
      val = +val;
      bytesD32[scratchOffset >> 2] = val;  // Write out float32 to get bytes.
      bytesU8[pos] = $d;
      // Copy bytes in reverse order to produce big endian on Intel hardward.
      bytesU8[pos + 1 | 0] = bytesU8[scratchOffset + 3 | 0];
      bytesU8[pos + 2 | 0] = bytesU8[scratchOffset + 2 | 0];
      bytesU8[pos + 3 | 0] = bytesU8[scratchOffset + 1 | 0];
      bytesU8[pos + 4 | 0] = bytesU8[scratchOffset | 0];
      pos = pos + 5 | 0;
    }

    // Write an float64 value.
    function writeUBJD64(val) {
      val = +val;
      var scratchOffset = 0;
      scratchOffset = imul(pos + 1, 8) | 0;
      bytesD64[scratchOffset >> 3] = val;  // Write out float64 to get bytes.
      bytesU8[pos] = $D;
      // Copy bytes in reverse order to produce big endian on Intel hardward.
      bytesU8[pos + 1 | 0] = bytesU8[scratchOffset + 7 | 0];
      bytesU8[pos + 2 | 0] = bytesU8[scratchOffset + 6 | 0];
      bytesU8[pos + 3 | 0] = bytesU8[scratchOffset + 5 | 0];
      bytesU8[pos + 4 | 0] = bytesU8[scratchOffset + 4 | 0];
      bytesU8[pos + 5 | 0] = bytesU8[scratchOffset + 3 | 0];
      bytesU8[pos + 6 | 0] = bytesU8[scratchOffset + 2 | 0];
      bytesU8[pos + 7 | 0] = bytesU8[scratchOffset + 1 | 0];
      bytesU8[pos + 8 | 0] = bytesU8[scratchOffset | 0];
      pos = pos + 9 | 0;
    }

    // Start an object. Allocate space for a new object. (flags & BIG) means
    // more than 255 properties.
    function startObject(flags) {
      flags = flags | 0;
      var startPos = 0;
      startPos = pos;
      if ((flags & BIG | 0) == 0) {
        bytesU8[pos] = $o;
        bytesU8[pos + 1 | 0] = $_;
        pos = pos + 2 | 0;
      } else {
        bytesU8[pos] = $O;
        bytesU8[pos + 1 | 0] = $_;
        bytesU8[pos + 2 | 0] = $_;
        bytesU8[pos + 3 | 0] = $_;
        bytesU8[pos + 4 | 0] = $_;
        pos = pos + 5 | 0;
      }
      return startPos | 0;
    }

    // Finish an object. Offset is position before calling startObject().
    function finishObject(offset, count, flags) {
      offset = offset | 0;
      count = count | 0;
      flags = flags | 0;
      if ((flags & BIG | 0) == 0) {
        bytesU8[offset + 1 | 0] = count;
      } else {
        bytesU8[offset + 4 | 0] = count;
        bytesU8[offset + 3 | 0] = count >> 8;
        bytesU8[offset + 2 | 0] = count >> 16;
        bytesU8[offset + 1 | 0] = count >> 24;
      }
    }

    // Start an array. Allocate space for a new array. (flags & BIG) means
    // more than 255 elements.
    function startArray(flags) {
      flags = flags | 0;
      var startPos = 0;
      startPos = pos;
      if ((flags & BIG | 0) == 0) {
        bytesU8[pos] = $a;
        bytesU8[pos + 1 | 0] = $_;
        pos = pos + 2 | 0;
      } else {
        bytesU8[pos] = $A;
        bytesU8[pos + 1 | 0] = $_;
        bytesU8[pos + 2 | 0] = $_;
        bytesU8[pos + 3 | 0] = $_;
        bytesU8[pos + 4 | 0] = $_;
        pos = pos + 5 | 0;
      }
      return startPos | 0;
    }

    // Finish an array. Offset is position before calling startArray().
    function finishArray(offset, count, flags) {
      offset = offset | 0;
      count = count | 0;
      flags = flags | 0;
      if ((flags & BIG | 0) == 0) {
        bytesU8[offset + 1 | 0] = count;
      } else {
        bytesU8[offset + 4 | 0] = count;
        bytesU8[offset + 3 | 0] = count >> 8;
        bytesU8[offset + 2 | 0] = count >> 16;
        bytesU8[offset + 1 | 0] = count >> 24;
      }
    }

    // Start a string value. Allocate space for a new string. (flags & BIG)
    // means contains more 255 bytes. Call writeStringChar() to add characters,
    // and finishString() to patch the byte count. Notice that characters are
    // encoded as UTF8 so they may consist of more than one byte.
    function startString(flags) {
      flags = flags | 0;
      var startPos = 0;
      startPos = pos;
      if ((flags & BIG | 0) == 0) {
        bytesU8[pos] = $s;
        bytesU8[pos + 1 | 0] = $_;
        pos = pos + 2 | 0;
      } else {
        bytesU8[pos] = $S;
        bytesU8[pos + 1 | 0] = $_;
        bytesU8[pos + 2 | 0] = $_;
        bytesU8[pos + 3 | 0] = $_;
        bytesU8[pos + 4 | 0] = $_;
        pos = pos + 5 | 0;
      }
      return startPos | 0;
    }

    // Finish a string value. Patch its byte count.
    function finishString(offset, count, flags) {
      offset = offset | 0;
      count = count | 0;
      flags = flags | 0;
      if ((flags & BIG | 0) == 0) {
        bytesU8[offset + 1 | 0] = count;
      } else {
        bytesU8[offset + 4 | 0] = count;
        bytesU8[offset + 3 | 0] = count >> 8;
        bytesU8[offset + 2 | 0] = count >> 16;
        bytesU8[offset + 1 | 0] = count >> 24;
      }
    }

    function startBinary() {
      var startPos = 0;
      startPos = pos;
      bytesU8[pos] = $$;
      bytesU8[pos + 1 | 0] = $_;
      bytesU8[pos + 2 | 0] = $_;
      bytesU8[pos + 3 | 0] = $_;
      bytesU8[pos + 4 | 0] = $_;
      pos = pos + 5 | 0;
      return startPos | 0;
    }

    // Finish a binary value. Patch its byte count.
    function finishBinary(offset, count) {
      offset = offset | 0;
      count = count | 0;
      bytesU8[offset + 4 | 0] = count;
      bytesU8[offset + 3 | 0] = count >> 8;
      bytesU8[offset + 2 | 0] = count >> 16;
      bytesU8[offset + 1 | 0] = count >> 24;
    }

    // Write a UTF8 character into a string value.
    function writeStringChar(val) {
      val = val | 0;
      // FIXME decode multibyte characters.
      bytesU8[pos] = val;
      pos = pos + 1 | 0;
    }
    // END Builder

    // END

    function writePropU8(id, val) {
      id = id | 0;
      val = val | 0;
      bytesU8[pos | 0] = $B;
      bytesU8[pos + 1 | 0] = id;
      bytesU8[pos + 2 | 0] = $B;
      bytesU8[pos + 3 | 0] = val;
      pos = pos + 4 | 0;
    }

    function writePropU16(id, val) {
      id = id | 0;
      val = val | 0;
      bytesU8[pos | 0] = $B;
      bytesU8[pos + 1 | 0] = id;
      bytesU8[pos + 2 | 0] = $i;
      bytesU8[pos + 3 | 0] = val >> 8;
      bytesU8[pos + 4 | 0] = val;
      pos = pos + 5 | 0;
    }

    function writePropU32(id, val) {
      id = id | 0;
      val = val | 0;
      writeUBJU8(id);
      writeUBJU32(val);
//      bytesU8[pos | 0] = $B;
//      bytesU8[pos + 1 | 0] = id;
//      bytesU8[pos + 2 | 0] = $I;
//      bytesU8[pos + 3 | 0] = val >> 24;
//      bytesU8[pos + 4 | 0] = val >> 16;
//      bytesU8[pos + 5 | 0] = val >> 8;
//      bytesU8[pos + 6 | 0] = val;
//      pos = pos + 7 | 0;
    }

    function writePropD32(id, val) {
      id = id | 0;
      val = +val;
      writeUBJU8(id);
      writeUBJD32(val);
    }

    function writeString(id) {
      // FIXME
      id = id | 0;   // string pool id
    }

    function writeBinary(id) {
      // FIXME
      id = id | 0;   // blob pool id
    }

    // BEGIN handlers

    function defineShape(swfVersion, tagCode) {
      swfVersion = swfVersion | 0;
      tagCode = tagCode | 0;
      var count = 0, childPos = 0, childLen = 0, childCount = 0;
      var reserved = 0, isMorph = 0, hasStrokes = 0;
      writePropU32(ID, readStreamU16() | 0);
      count = count + 2 | 0;
      writeUBJU8(BBOX);
      childPos = startObject(0) | 0;
      childLen = bbox(swfVersion, tagCode) | 0;
      finishObject(childPos, childLen, 0);
      count = count + 2 | 0;
      if (~~tagCode == 46) {
        isMorph = 1;
      } else if (~~tagCode == 84) {
        isMorph = 1;
      };
      writePropU8(IS_MORPH, isMorph);
      count = count + 2 | 0;
      if (isMorph) {
        writeUBJU8(BBOX_MORPH);
        childPos = startObject(0) | 0;
        childLen = bbox(swfVersion, tagCode) | 0;
        finishObject(childPos, childLen, 0);
        count = count + 2 | 0;
      }
      if (~~tagCode == 83) {
        hasStrokes = 1;
      } else if (~~tagCode == 84) {
        hasStrokes = 1;
      };
      writePropU8(HAS_STROKES, hasStrokes);
      count = count + 2 | 0;
      if (hasStrokes) {
        writeUBJU8(STROKE_BBOX);
        childPos = startObject(0) | 0;
        childLen = bbox(swfVersion, tagCode) | 0;
        finishObject(childPos, childLen, 0);
        count = count + 2 | 0;
        if (isMorph) {
          writeUBJU8(STROKE_BBOX_MORPH);
          childPos = startObject(0) | 0;
          childLen = bbox(swfVersion, tagCode) | 0;
          finishObject(childPos, childLen, 0);
          count = count + 2 | 0;
        }
        reserved = readStreamUb(5) | 0;
        writePropU32(FILL_WINDING, readStreamUb(1) | 0);
        writePropU32(NONSCALING_STROKES, readStreamUb(1) | 0);
        writePropU32(SCALING_STROKES, readStreamUb(1) | 0);
        count = count + 6 | 0;
      }
      if (isMorph) {
        writePropU32(OFFSET_MORPH, readStreamU32() | 0);
        count = count + 2 | 0;
        childCount = morphShapeWithStyle(swfVersion, tagCode, isMorph, hasStrokes) | 0;
        count = count + childCount | 0;
      } else {
        childCount = shapeWithStyle(swfVersion, tagCode, isMorph, hasStrokes) | 0;
        count = count + childCount | 0;
      }
      return count | 0;
    }

    function placeObject(swfVersion, tagCode) {
      swfVersion = swfVersion | 0;
      tagCode = tagCode | 0;
      var flags = 0, hasEvents = 0, clip = 0, hasName = 0, hasRatio = 0;
      var hasCxform = 0, hasMatrix = 0, place = 0, move = 0, hasCache = 0;
      var hasBackgroundColor = 0, hasVisibility = 0, hasImage = 0;
      var hasClassName = 0, cache = 0, blend = 0, hasFilters = 0;
      var stringPos = 0, stringLen = 0, objectPos = 0, objectLen = 0;
      var arrayPos = 0, arrayLen = 0, i = 0;
      var filterCount = 0, reserved = 0, allFlags = 0, eoe = 0;
      var count = 0;
      if (~~tagCode > 4) {
        if (~~tagCode > 26) {
          flags = readStreamU16() | 0;
        } else {
          flags = readStreamU8() | 0;
        }
        writePropU8(HAS_EVENTS, (hasEvents = flags >> 7 & 1));
        writePropU8(CLIP, (clip = flags >> 6 & 1));
        writePropU8(HAS_NAME, (hasName = flags >> 5 & 1));
        writePropU8(HAS_RATIO, (hasRatio = flags >> 4 & 1));
        writePropU8(HAS_CXFORM, (hasCxform = flags >> 3 & 1));
        writePropU8(HAS_MATRIX, (hasMatrix = flags >> 2 & 1));
        writePropU8(PLACE, (place = flags >> 1 & 1));
        writePropU8(MOVE, (move = flags & 1));
        if (~~tagCode == 70) {
          writePropU8(HAS_BACKGROUND_COLOR, (hasBackgroundColor = flags >> 15 & 1));
          writePropU8(HAS_VISIBILITY, (hasVisibility = flags >> 14 & 1));
          writePropU8(HAS_IMAGE, (hasImage = flags >> 12 & 1));
          writePropU8(HAS_CLASS_NAME, (hasClassName = flags >> 11 & 1));
          writePropU8(HAS_CACHE, (hasCache = flags >> 10 & 1));
          writePropU8(BLEND, (blend = flags >> 9 & 1));
          writePropU8(HAS_FILTERS, (hasFilters = flags >> 8 & 1));
          count = count + 14 | 0;
        } else {
          writePropU8(CACHE, (cache = 0));
          writePropU8(BLEND, (blend = 0));
          writePropU8(HAS_FILTERS, (hasFilters = 0));
          count = count + 6 | 0;
        }
        writePropU32(DEPTH, readStreamU16() | 0);
        if (hasClassName) {
          writeUBJU8(CLASS_NAME);
          stringPos = startString(0) | 0;
          stringLen = readStreamString(0) | 0;
          finishString(stringPos, stringLen, 0);
        }
        if (place) {
          writePropU32(PLACE, readStreamU16() | 0);
        }
        count = count + 20 | 0;
        if (hasMatrix) {
          writeUBJU8(MATRIX);
          objectPos = startObject(0) | 0;
          objectLen = matrix(swfVersion, tagCode) | 0;
          finishObject(objectPos, objectLen, 0);
          count = count + 2 | 0;
        }
        if (hasCxform) {
          writeUBJU8(CXFORM);
          objectPos = startObject(0) | 0;
          objectLen = cxform(swfVersion, tagCode) | 0;
          finishObject(objectPos, objectLen, 0);
          count = count + 2 | 0;
        }
        if (hasRatio) {
          writePropU32(RATIO, readStreamU16() | 0);
          count = count + 2 | 0;
        }
        if (hasName) {
          writeUBJU8(NAME);
          stringPos = startString(0) | 0;
          stringLen = readStreamString(0) | 0;
          finishString(stringPos, stringLen, 0);
          count = count + 2 | 0;
        }
        if (clip) {
          writePropU32(CLIP_DEPTH, readStreamU16() | 0);
          count = count + 2 | 0;
        }
        if (hasFilters) {
          filterCount = readStreamU8() | 0;
          writeUBJU8(FILTERS);
          arrayPos = startArray(0) | 0;
          for (i = 0; ~~i < ~~filterCount; i = i + 1 | 0) {
            objectPos = startObject(0) | 0;
            objectLen = anyFilter(swfVersion, tagCode) | 0;
            finishObject(objectPos, objectLen, 0);
          }
          finishArray(arrayPos, filterCount, 0);
          count = count + 2 | 0;
        }
        if (blend) {
          writePropU16(BLEND_MODE, readStreamU8() | 0);
          count = count + 2 | 0;
        }
        if (cache) {
          writePropU16(BMP_CACHE, readStreamU8() | 0);
          count = count + 2 | 0;
        }
        if (hasEvents) {
          reserved = readStreamU16() | 0;
          if (~~swfVersion >= 6) {
            allFlags = readStreamU32() | 0;
          } else {
            allFlags = readStreamU16() | 0;
          }
          writeUBJU8(EVENTS);
          arrayPos = startArray(0) | 0;
          arrayLen = 0;
          do {
            objectPos = startObject(0) | 0;
            objectLen = events(swfVersion, tagCode) | 0;
            finishObject(objectPos, objectLen, 0);
            // Read return values
            pos = pos - 1 | 0;
            eoe = readU8() | 0;
            pos = pos - 1 | 0;
            arrayLen = arrayLen + 1 | 0 | 0;
          } while (!eoe)
          finishArray(arrayPos, arrayLen, 0);
          count = count + 2 | 0;
        }
        if (hasBackgroundColor) {
          // FIXME is this right? tags.js has "ARGB" in quotes.
          writeUBJU8(BACKGROUND_COLOR);
          objectPos = startObject(0) | 0;
          objectLen = argb() | 0;
          finishObject(objectPos, objectLen, 0);
          count = count + 2 | 0;
        }
        if (hasVisibility) {
          writePropU16(VISIBILITY, readStreamU8() | 0);
          count = count + 2 | 0;
        }
      } else {
        writePropU8(PLACE, 1);
        writePropU32(SYMBOL_ID, readStreamU16() | 0);
        writePropU32(DEPTH, readStreamU16() | 0);
        writePropU8(HAS_MATRIX, 1);
        objectPos = startObject(0) | 0;
        objectLen = matrix(swfVersion, tagCode) | 0;
        finishObject(objectPos, objectLen, 0);
        count = count + 8 | 0;
        if (1 /*remaining()*/ | 0) {
          writePropU8(HAS_CXFORM, 1);
          writeUBJU8(CXFORM);
          objectPos = startObject(0) | 0;
          objectLen = cxform(swfVersion, tagCode) | 0;
          finishObject(objectPos, objectLen, 0);
          count = count + 4 | 0;
        }
      }
      return count | 0;
    }

    function removeObject(swfVersion, tagCode) {
      swfVersion = swfVersion | 0;
      tagCode = tagCode | 0;
      var childCount = 2;
      if (~~tagCode == 5) {
        writePropU32(SYMBOL_ID, readStreamU16() | 0);
        childCount = childCount + 2 | 0;
      }
      writePropU32(DEPTH, readStreamU16() | 0);
      return childCount | 0;
    }

    function shapeWithStyle(swfVersion, tagCode, isMorph, hasStrokes) {
      swfVersion = swfVersion | 0;
      tagCode = tagCode | 0;
      isMorph = isMorph | 0;
      hasStrokes = hasStrokes | 0;
      var count = 0, childCount = 0, objectPos = 0, objectLen = 0, arrayPos = 0, arrayLen = 0;
      var eos = 0, flags = 0, type = 0, fillBits = 0, lineBits = 0, bits = 0;
      childCount = styles(swfVersion, tagCode, isMorph, hasStrokes) | 0;
      count = count + childCount | 0;
      // Read return values
      pos = pos - 2 | 0;
      fillBits = readU8() | 0;
      lineBits = readU8() | 0;
      pos = pos - 2 | 0;
      writeUBJU8(RECORDS);
      arrayPos = startArray(0) | 0;
      do {
        objectPos = startObject(0) | 0;
        objectLen = shapeRecord(swfVersion, tagCode, isMorph,
                               fillBits, lineBits, hasStrokes, bits) | 0;
        finishObject(objectPos, objectLen, 0);
        // Read return values
        pos = pos - 6 | 0;
        bits = readU8() | 0;
        eos = readU8() | 0;
        fillBits = readU8() | 0;
        flags = readU8() | 0;
        lineBits = readU8() | 0;
        type = readU8() | 0;
        pos = pos - 6 | 0;
        arrayLen = arrayLen + 1 | 0;
      } while(!eos)
      finishArray(arrayPos, arrayLen, 0);
      count = count + 2 | 0;
      return count | 0;
    }

    function morphShapeWithStyle(swfVersion, tagCode, isMorph, hasStrokes) {
      swfVersion = swfVersion | 0;
      tagCode = tagCode | 0;
      isMorph = isMorph | 0;
      hasStrokes = hasStrokes | 0;
      var count = 0, childCount = 0, objectPos = 0, objectLen = 0, arrayPos = 0, arrayLen = 0;
      var eos = 0, flags = 0, type = 0, fillBits = 0, lineBits = 0, bits = 0;
      childCount = styles(swfVersion, tagCode, isMorph, hasStrokes) | 0;
      count = count + childCount | 0;
      // Read return values
      pos = pos - 2 | 0;
      fillBits = readU8() | 0;
      lineBits = readU8() | 0;
      pos = pos - 2 | 0;
      writeUBJU8(RECORDS);
      arrayPos = startArray(0) | 0;
      do {
        objectPos = startObject(0) | 0;
        objectLen = shapeRecord(swfVersion, tagCode, isMorph,
                               fillBits, lineBits, hasStrokes, bits) | 0;
        finishObject(objectPos, objectLen, 0);
        // Read return values
        pos = pos - 6 | 0;
        bits = readU8() | 0;
        eos = readU8() | 0;
        fillBits = readU8() | 0;
        flags = readU8() | 0;
        lineBits = readU8() | 0;
        type = readU8() | 0;
        pos = pos - 6 | 0;
        arrayLen = arrayLen + 1 | 0;
      } while(!eos)
      finishArray(arrayPos, arrayLen, 0);
      count = count + 2 | 0;
      // begin styleBits()
      alignStream();
      fillBits = readStreamUb(4) | 0;
      lineBits = readStreamUb(4) | 0;
      // end styleBits()
      writeUBJU8(RECORDS_MORPH);
      arrayPos = startArray(0) | 0;
      do {
        objectPos = startObject(0) | 0;
        objectLen = shapeRecord(swfVersion, tagCode, isMorph,
                               fillBits, lineBits, hasStrokes, bits) | 0;
        finishObject(objectPos, objectLen, 0);
        // Read return values
        pos = pos - 6 | 0;
        bits = readU8() | 0;
        eos = readU8() | 0;
        fillBits = readU8() | 0;
        flags = readU8() | 0;
        lineBits = readU8() | 0;
        type = readU8() | 0;
        pos = pos - 6 | 0;
        arrayLen = arrayLen + 1 | 0;
      } while(!eos)
      finishArray(arrayPos, arrayLen, 0);
      count = count + 2 | 0;
      return count | 0;
    }

    function styles(swfVersion, tagCode, isMorph, hasStrokes) {
      swfVersion = swfVersion | 0;
      tagCode = tagCode | 0;
      isMorph = isMorph | 0;
      hasStrokes = hasStrokes | 0;
      var count = 0, fillBits = 0, lineBits = 0, childCount = 0;
      childCount = fillStyleArray(swfVersion, tagCode, isMorph) | 0;
      childCount = lineStyleArray(swfVersion, tagCode, isMorph, hasStrokes) | 0;
      // begin styleBits()
      alignStream();
      fillBits = readStreamUb(4) | 0;
      lineBits = readStreamUb(4) | 0;
      // end styleBits()
      writeU8(fillBits);
      writeU8(lineBits);
      return 2 | 0;
    }

    function fillStyleArray(swfVersion, tagCode, isMorph) {
      swfVersion = swfVersion | 0;
      tagCode = tagCode | 0;
      isMorph = isMorph | 0;
      var tmp = 0, count = 0, arrayLen = 0, arrayPos = 0, objectLen = 0, objectPos = 0;
      tmp = readStreamU8() | 0;
      if (~~tagCode > 2 ? ~~tmp == 255 ? 1 : 0 : 0) {
          count = readStreamU16() | 0;
      } else{
        count = tmp;
      }
      arrayLen = count;
      arrayPos = startArray(0) | 0;
//      trace("fillStyleArray() arrayPos=" + arrayPos + " arrayLen=" + arrayLen);
      while (count) {
        objectPos = startObject(0) | 0;
        objectLen = fillStyle(swfVersion, tagCode, isMorph) | 0;
        finishObject(objectPos, objectLen, 0);
        count = count - 1 | 0;
      }
      finishArray(arrayPos, arrayLen, 0);
      return 1 | 0;
    }

    function lineStyleArray(swfVersion, tagCode, isMorph, hasStrokes) {
      swfVersion = swfVersion | 0;
      tagCode = tagCode | 0;
      isMorph = isMorph | 0;
      hasStrokes = hasStrokes | 0;
      var tmp = 0, count = 0, arrayLen = 0, arrayPos = 0, objectLen = 0, objectPos = 0;
      tmp = readStreamU8() | 0;
      if (~~tagCode > 2 ? ~~tmp == 255 ? 1 : 0 : 0) {
        count = readStreamU16() | 0;
      } else{
        count = tmp;
      }
      arrayLen = count;
      arrayPos = startArray(0) | 0;
      while (count) {
        objectPos = startObject(0) | 0;
        objectLen = lineStyle(swfVersion, tagCode, isMorph, hasStrokes) | 0;
        finishObject(objectPos, objectLen, 0);
        count = count - 1 | 0;
      }
      finishArray(arrayPos, arrayLen, 0);
      return 1 | 0;
    }

    function shapeRecord(swfVersion, tagCode, isMorph,
                         fillBits, lineBits, hasStrokes, bits) {
      swfVersion = swfVersion | 0;
      tagCode = tagCode | 0;
      isMorph = isMorph | 0;
      fillBits = fillBits | 0;
      lineBits = lineBits | 0;
      hasStrokes = hasStrokes | 0;
      bits = bits | 0;
      var count = 0, childCount = 0, type = 0, flags = 0, eos = 0;
      writePropU8(TYPE, (type = readStreamUb(1) | 0));
      count = count + 2 | 0;
      flags = readStreamUb(5) | 0;
      eos = !(type ? 1 : flags ? 1 : 0);
      if (type) {
        childCount = shapeRecordEdge(swfVersion, tagCode, flags, bits) | 0;
        // Read return values
        pos = pos - 1 | 0;
        bits = readU8() | 0;
        pos = pos - 1 | 0;
        count = count + childCount | 0;
      } else {
        childCount = shapeRecordSetup(swfVersion, tagCode, flags, isMorph,
                                      fillBits, lineBits, hasStrokes, bits) | 0;
        // Read return values
        pos = pos - 3 | 0;
        bits = readU8() | 0;
        fillBits = readU8() | 0;
        lineBits = readU8() | 0;
        pos = pos - 3 | 0;
        count = count + childCount | 0;
      }
      // Write return values
      writeU8(bits);
      writeU8(eos);
      writeU8(fillBits);
      writeU8(flags);
      writeU8(lineBits);
      writeU8(type);
      return count | 0;
    }

    function shapeRecordEdge(swfVersion, tagCode, flags, bits) {
      swfVersion = swfVersion | 0;
      tagCode = tagCode | 0;
      flags = flags | 0;
      bits = bits | 0;
      var isStraight = 0, tmp = 0, isGeneral = 0, isVertical = 0, val = 0;
      var childCount = 0, count = 0;
      writePropU8(IS_STRAIGHT, isStraight = flags >> 4 | 0);
//      bytesU8[pos | 0] = $B;
//      bytesU8[pos + 1 | 0] = IS_STRAIGHT;
//      bytesU8[pos + 2 | 0] = $B;
//      bytesU8[pos + 3 | 0] = isStraight = flags >> 4 | 0;
//      pos = pos + 4 | 0;
      count = count + 2 | 0;
      tmp = flags & 0x0f | 0;
      bits = tmp + 2 | 0;
      if (isStraight) {
        writePropU8(IS_GENERAL, isGeneral = readStreamUb(1) | 0);
//        bytesU8[pos | 0] = $B;
//        bytesU8[pos + 1 | 0] = IS_GENERAL;
//        bytesU8[pos + 2 | 0] = $B;
//        bytesU8[pos + 3 | 0] = isGeneral = readStreamUb(1) | 0;
//        pos = pos + 4 | 0;
        count = count + 2 | 0;
        if (isGeneral) {
          val = readStreamSb(bits | 0) | 0;
          writePropU32(DELTA_X, val);
//          bytesU8[pos | 0] = $B;
//          bytesU8[pos + 1 | 0] = DELTA_X;
//          bytesU8[pos + 2 | 0] = $I;
//          bytesU8[pos + 6 | 0] = val;
//          bytesU8[pos + 5 | 0] = val >> 8;
//          bytesU8[pos + 4 | 0] = val >> 16;
//          bytesU8[pos + 3 | 0] = val >> 24;
//          pos = pos + 7 | 0;
          val = readStreamSb(bits | 0) | 0;
          writePropU32(DELTA_Y, val);
//          bytesU8[pos | 0] = $B;
//          bytesU8[pos + 1 | 0] = DELTA_Y;
//          bytesU8[pos + 2 | 0] = $I;
//          bytesU8[pos + 6 | 0] = val;
//          bytesU8[pos + 5 | 0] = val >> 8;
//          bytesU8[pos + 4 | 0] = val >> 16;
//          bytesU8[pos + 3 | 0] = val >> 24;
//          pos = pos + 7 | 0;
          count = count + 4 | 0;
        } else {
          writePropU8(IS_VERTICAL, isVertical = readStreamUb(1) | 0);
//          bytesU8[pos | 0] = $B;
//          bytesU8[pos + 1 | 0] = IS_VERTICAL;
//          bytesU8[pos + 2 | 0] = $B;
//          bytesU8[pos + 3 | 0] = isVertical = readStreamUb(1) | 0;
//          pos = pos + 4 | 0;
          count = count + 2 | 0;
          if (isVertical) {
            val = readStreamSb(bits | 0) | 0;
            writePropU32(DELTA_Y, val);
//            bytesU8[pos | 0] = $B;
//            bytesU8[pos + 1 | 0] = DELTA_Y;
//            bytesU8[pos + 2 | 0] = $I;
//            bytesU8[pos + 6 | 0] = val;
//            bytesU8[pos + 5 | 0] = val >> 8;
//            bytesU8[pos + 4 | 0] = val >> 16;
//            bytesU8[pos + 3 | 0] = val >> 24;
//            pos = pos + 7 | 0;
            count = count + 2 | 0;
          } else {
            val = readStreamSb(bits | 0) | 0;
            writePropU32(DELTA_X, val);
//            bytesU8[pos | 0] = $B;
//            bytesU8[pos + 1 | 0] = DELTA_X;
//            bytesU8[pos + 2 | 0] = $I;
//            bytesU8[pos + 6 | 0] = val;
//            bytesU8[pos + 5 | 0] = val >> 8;
//            bytesU8[pos + 4 | 0] = val >> 16;
//            bytesU8[pos + 3 | 0] = val >> 24;
//            pos = pos + 7 | 0;
            count = count + 2 | 0;
          }
        }
      } else {
        val = readStreamSb(bits | 0) | 0;
        writePropU32(CONTROL_DELTA_X, val);
//        bytesU8[pos | 0] = $B;
//        bytesU8[pos + 1 | 0] = CONTROL_DELTA_X;
//        bytesU8[pos + 2 | 0] = $I;
//        bytesU8[pos + 6 | 0] = val;
//        bytesU8[pos + 5 | 0] = val >> 8;
//        bytesU8[pos + 4 | 0] = val >> 16;
//        bytesU8[pos + 3 | 0] = val >> 24;
//        pos = pos + 7 | 0;
        val = readStreamSb(bits | 0) | 0;
        writePropU32(CONTROL_DELTA_Y, val);
//        bytesU8[pos | 0] = $B;
//        bytesU8[pos + 1 | 0] = CONTROL_DELTA_Y;
//        bytesU8[pos + 2 | 0] = $I;
//        bytesU8[pos + 6 | 0] = val;
//        bytesU8[pos + 5 | 0] = val >> 8;
//        bytesU8[pos + 4 | 0] = val >> 16;
//        bytesU8[pos + 3 | 0] = val >> 24;
//        pos = pos + 7 | 0;
        val = readStreamSb(bits | 0) | 0;
        writePropU32(ANCHOR_DELTA_X, val);
//        bytesU8[pos | 0] = $B;
//        bytesU8[pos + 1 | 0] = ANCHOR_DELTA_X;
//        bytesU8[pos + 2 | 0] = $I;
//        bytesU8[pos + 6 | 0] = val;
//        bytesU8[pos + 5 | 0] = val >> 8;
//        bytesU8[pos + 4 | 0] = val >> 16;
//        bytesU8[pos + 3 | 0] = val >> 24;
//        pos = pos + 7 | 0;
        val = readStreamSb(bits | 0) | 0;
        writePropU32(ANCHOR_DELTA_Y, val);
//        bytesU8[pos | 0] = $B;
//        bytesU8[pos + 1 | 0] = ANCHOR_DELTA_Y;
//        bytesU8[pos + 2 | 0] = $I;
//        bytesU8[pos + 6 | 0] = val;
//        bytesU8[pos + 5 | 0] = val >> 8;
//        bytesU8[pos + 4 | 0] = val >> 16;
//        bytesU8[pos + 3 | 0] = val >> 24;
//        pos = pos + 7 | 0;
        count = count + 8 | 0;
      }
      bytesU8[pos | 0] = bits;
      pos = pos + 1 | 0;
      return count | 0;
    }

    function shapeRecordSetup(swfVersion, tagCode, flags, isMorph,
                              fillBits, lineBits, hasStrokes, bits) {
      swfVersion = swfVersion | 0;
      tagCode = tagCode | 0;
      flags = flags | 0;
      isMorph = isMorph | 0;
      fillBits = fillBits | 0;
      lineBits = lineBits | 0;
      hasStrokes = hasStrokes | 0;
      bits = bits | 0;
      var hasNewStyles = 0, hasLineStyle = 0, hasFillStyle1 = 0;
      var hasFillStyle0 = 0, move = 0;
      var count = 0, childCount = 0;
      if (~~tagCode > 2) {
        writePropU8(HAS_NEW_STYLES, (hasNewStyles = flags >> 4));
      } else {
        writePropU8(HAS_NEW_STYLES, (hasNewStyles = 0));
      }
      count = count + 2 | 0;
      writePropU8(HAS_LINE_STYLE, (hasLineStyle = flags >> 3 & 1));
      writePropU8(HAS_FILL_STYLE_1, (hasFillStyle1 = flags >> 2 & 1));
      writePropU8(HAS_FILL_STYLE_0, (hasFillStyle0 = flags >> 1 & 1));
      writePropU8(MOVE, (move = flags & 1));
      count = count + 8 | 0;
      if (move) {
        bits = readStreamUb(5) | 0;
        writePropU32(MOVE_X, readStreamSb(bits) | 0);
        writePropU32(MOVE_Y, readStreamSb(bits) | 0);
        count = count + 4 | 0;
      }
      if (hasFillStyle0) {
        writePropU32(FILL_STYLE_0, readStreamUb(fillBits) | 0);
        count = count + 2 | 0;
      }
      if (hasFillStyle1) {
        writePropU32(FILL_STYLE_1, readStreamUb(fillBits) | 0);
        count = count + 2 | 0;
      }
      if (hasLineStyle) {
        writePropU32(HAS_LINE_STYLE, readStreamUb(lineBits) | 0);
        count = count + 2 | 0;
      }
      if (hasNewStyles) {
        childCount = styles(swfVersion, tagCode, isMorph, hasStrokes) | 0;
        // Read return values
        pos = pos - 2 | 0;
        fillBits = readU8() | 0;
        lineBits = readU8() | 0;
        pos = pos - 2 | 0;
        count = count + childCount | 0;
      }
      // Write return values
      writeU8(bits);
      writeU8(fillBits);
      writeU8(lineBits);
      return count | 0;
    }

    function doABC(swfVersion, tagCode) {
      swfVersion = swfVersion | 0;
      tagCode = tagCode | 0;
      var stringPos = 0, ch = 0, childCount = 0, count = 0, binaryPos = 0, binaryLen = 0;
      if (~~tagCode == 82) {
        writePropU32(FLAGS, readStreamU16() | 0);
      }
      else{
        writePropU32(FLAGS, 0);
      }
      if (~~tagCode == 82) {
        writeUBJU8(NAME);
        writeString(readStreamString(0) | 0);  // push string takes
      }
      else{
        writeUBJU8(NAME);
        stringPos = startString(0) | 0;
        finishString(stringPos, 0, 0);
      }
      writeUBJU8(DATA);
      binaryPos = startBinary() | 0;
      binaryLen = readStreamBinary(0) | 0;
      finishBinary(binaryPos, binaryLen);
      return 6;
    }

    function bbox(swfVersion, tagCode) {
      swfVersion = swfVersion | 0;
      tagCode = tagCode | 0;
      var bits = 0;
      alignStream();
      bits = readStreamUb(5) | 0;
      writePropD32(LEFT, +((readStreamSb(bits | 0) | 0) / 20 | 0));
      writePropD32(RIGHT, +((readStreamSb(bits | 0) | 0) / 20 | 0));
      writePropD32(TOP, +((readStreamSb(bits | 0) | 0) / 20 | 0));
      writePropD32(BOTTOM, +((readStreamSb(bits | 0) | 0) / 20 | 0));
      alignStream();
      return 8 | 0;
    }

    function rgb() {
      writePropU16(RED, readStreamU8() | 0);
      writePropU16(GREEN, readStreamU8() | 0);
      writePropU16(BLUE, readStreamU8() | 0);
      writePropU16(ALPHA, 255);
      return 8;
    }

    function rgba() {
      writePropU16(RED, readStreamU8() | 0);
      writePropU16(GREEN, readStreamU8() | 0);
      writePropU16(BLUE, readStreamU8() | 0);
      writePropU16(ALPHA, readStreamU8() | 0);
      return 8;
    }

    function argb() {
      writePropU16(ALPHA, readStreamU8() | 0);
      writePropU16(RED, readStreamU8() | 0);
      writePropU16(GREEN, readStreamU8() | 0);
      writePropU16(BLUE, readStreamU8() | 0);
      return 8;
    }

    function matrix(swfVersion, tagCode) {
      swfVersion = swfVersion | 0;
      tagCode = tagCode | 0;
      var bits = 0, a = 1.0, b = 0.0, c = 0.0, d = 1.0, tx = 0.0, ty = 0.0;
      alignStream();
      if (readStreamUb(1) | 0) {
        bits = readStreamUb(5) | 0;
        a = +readStreamFb(bits | 0);
        d = +readStreamFb(bits | 0);
      }
      if (readStreamUb(1) | 0) {
        bits = readStreamUb(5) | 0;
        b = +readStreamFb(bits | 0);
        d = +readStreamFb(bits | 0);
      }
      bits = readStreamUb(5) | 0;
      tx = +((readStreamSb(bits | 0) | 0) / 20 | 0);
      ty = +((readStreamSb(bits | 0) | 0) / 20 | 0);
      alignStream();
      writePropD32(A, a);
      writePropD32(B, b);
      writePropD32(C, c);
      writePropD32(D, d);
      writePropD32(TX, tx);
      writePropD32(TY, ty);
      return 12 | 0;
    }

    function cxform(swfVersion, tagCode) {
      swfVersion = swfVersion | 0;
      tagCode = tagCode | 0;
      var hasOffsets = 0, hasMultipliers = 0, bits = 0;
      var redMultiplier = 256, greenMultiplier = 256;
      var blueMultiplier = 256, alphaMultiplier = 256;
      var redOffset = 0, greenOffset = 0, blueOffset = 0, alphaOffset = 0;
      alignStream();
      hasOffsets = readStreamUb(1) | 0;
      hasMultipliers = readStreamUb(1) | 0;
      bits = readStreamUb(4) | 0;
      if (hasMultipliers) {
        redMultiplier = readStreamSb(bits) | 0;
        greenMultiplier = readStreamSb(bits) | 0;
        blueMultiplier = readStreamSb(bits) | 0;
        if (~~tagCode > 4) {
          alphaMultiplier = readStreamSb(bits) | 0;
        } else {
          alphaMultiplier = 256;
        }
      }
      if (hasOffsets) {
        redOffset = readStreamSb(bits) | 0;
        greenOffset = readStreamSb(bits) | 0;
        blueOffset = readStreamSb(bits) | 0;
        if (~~tagCode > 4) {
          alphaOffset = readStreamSb(bits) | 0;
        } else {
          alphaOffset = 0;
        }
      }
      alignStream();
      writePropU32(RED_MULTIPLIER, redMultiplier);
      writePropU32(GREEN_MULTIPLIER, greenMultiplier);
      writePropU32(BLUE_MULTIPLIER, blueMultiplier);
      writePropU32(ALPHA_MULTIPLIER, alphaMultiplier);
      writePropU32(RED_OFFSET, redOffset);
      writePropU32(GREEN_OFFSET, greenOffset);
      writePropU32(BLUE_OFFSET, blueOffset);
      writePropU32(ALPHA_OFFSET, alphaOffset);
      return 16 | 0;
    }

    function fillSolid(swfVersion, tagCode, isMorph) {
      swfVersion = swfVersion | 0;
      tagCode = tagCode | 0;
      isMorph = isMorph | 0;
      var count = 0, childCount = 0;
      var objectPos = 0, objectLen = 0;
      if (~~tagCode > 22 | 0) {
        writeUBJU8(COLOR);
        objectPos = startObject(0) | 0;
        objectLen = rgba() | 0;
        finishObject(objectPos, objectLen, 0);
        count = count + 2 | 0;
      } else if (isMorph) {
        writeUBJU8(COLOR);
        objectPos = startObject(0) | 0;
        objectLen = rgba() | 0;
        finishObject(objectPos, objectLen, 0);
        count = count + 2 | 0;
      } else {
        writeUBJU8(COLOR);
        objectPos = startObject(0) | 0;
        objectLen = rgb() | 0;
        finishObject(objectPos, objectLen, 0);
        count = count + 2 | 0;
      }
      if (isMorph) {
        writeUBJU8(COLOR_MORPH);
        objectPos = startObject(0) | 0;
        objectLen = rgba() | 0;
        finishObject(objectPos, objectLen, 0);
        count = count + 2 | 0;
      }
      return count | 0;
    }

    function fillGradient(swfVersion, tagCode, isMorph, type) {
      swfVersion = swfVersion | 0;
      tagCode = tagCode | 0;
      isMorph = isMorph | 0;
      type = type | 0;
      var objectPos = 0, objectLen;
      var count = 0;
      writeUBJU8(MATRIX);  // write name
      objectPos = startObject(0) | 0; // begin write value
      objectLen = matrix(swfVersion, tagCode) | 0;
      finishObject(objectPos, objectLen, 0);
      count = count + 2 | 0;
      if (isMorph) {
        writeUBJU8(MATRIX_MORPH);  // write name
        objectPos = startObject(0) | 0; // begin write value
        objectLen = matrix(swfVersion, tagCode) | 0;
        finishObject(objectPos, objectLen, 0);
        count = count + 2 | 0;
      }
      childCount = gradient(swfVersion, tagCode, isMorph, type) | 0;
      count = count + childCount | 0;
      return count | 0;
    }

    function gradient(swfVersion, tagCode, isMorph, type) {
      swfVersion = swfVersion | 0;
      tagCode = tagCode | 0;
      isMorph = isMorph | 0;
      type = type | 0;
      var count = 0, n = 0, pad = 0, arrayPos = 0, arrayLen = 0;
      var objectPos = 0, objectLen = 0;
      if (~~tagCode == 83) {
        writePropU8(SPREAD_MODE, readStreamUb(2) | 0);
        writePropU8(INTERPOLATION_MODE, readStreamUb(2) | 0);
        count = count + 4 | 0;
      }
      else{
        pad = readStreamUb(4) | 0;
      }
      writePropU8(COUNT, (n = readStreamUb(4) | 0) | 0);
      writeUBJU8(RECORDS);
      arrayPos = startArray(0) | 0;
      arrayLen = n;
      while (n) {
        objectPos = startObject(0) | 0;
        objectLen = gradientRecord(swfVersion, tagCode, isMorph) | 0;
        finishObject(objectPos, objectLen, 0);
        n = n - 1 | 0;
      }
      finishArray(arrayPos, arrayLen, 0);
      count = count + 2 | 0;
      if (~~type == 19) {
        writePropD32(FOCAL_POINT, +readStreamFixed8());
        count = count + 2 | 0;
        if (isMorph) {
          writePropD32(FOCAL_POINT_MORPH, +readStreamFixed8());
          count = count + 2 | 0;
        }
      }
      return count | 0;
    }

    function gradientRecord(swfVersion, tagCode, isMorph) {
      swfVersion = swfVersion | 0;
      tagCode = tagCode | 0;
      isMorph = isMorph | 0;
      var objectPos = 0, objectLen = 0, count = 0;
      writePropU16(RATIO, readStreamU8() | 0);
      if (~~tagCode > 22) {
        writeUBJU8(COLOR);
        objectPos = startObject(0) | 0;
        objectLen = rgba() | 0;
        finishObject(objectPos, objectLen, 0);
        count = count + 2 | 0;
      } else {
        writeUBJU8(COLOR);
        objectPos = startObject(0) | 0;
        objectLen = rgb() | 0;
        finishObject(objectPos, objectLen, 0);
        count = count + 2 | 0;
      }
      if (isMorph) {
        writePropU16(RATIO_MORPH, readStreamU8() | 0);
        writeUBJU8(COLOR_MORPH);
        objectPos = startObject(0) | 0;
        objectLen = rgba() | 0;
        finishObject(objectPos, objectLen, 0);
        count = count + 4 | 0;
      }
      return count | 0;
    }

    function fillStyle(swfVersion, tagCode, isMorph) {
      swfVersion = swfVersion | 0;
      tagCode = tagCode | 0;
      isMorph = isMorph | 0;
      var type = 0;
      var count = 0, childCount = 0;
      writePropU8(TYPE, (type = readStreamU8() | 0) | 0); 
      count = count + 2 | 0;
      switch (type | 0) {
      case 0:
        childCount = fillSolid(swfVersion, tagCode, isMorph) | 0;
        count = count + childCount | 0;
        break
      case 16:
      case 18:
      case 19:
        childCount = fillGradient(swfVersion, tagCode, isMorph, type) | 0;
        count = count + childCount | 0;
        break
      case 64:
      case 65:
      case 66:
      case 67:
        childCount = fillBitmap(swfVersion, tagCode, isMorph, type) | 0;
        count = count + childCount | 0;
        break
      default:
      }
      return count | 0;
    }

    function fillBitmap(swfVersion, tagCode, isMorph, type) {
      swfVersion = swfVersion | 0;
      tagCode = tagCode | 0;
      isMorph = isMorph | 0;
      type = type | 0;
      var count = 0;
      var objectPos = 0, objectLen = 0;
      var childCount = 0;
      writeUBJU8(BITMAP_ID);
      writeUBJU16(readStreamU16() | 0);
      writeUBJU8(MATRIX);
      objectPos = startObject(0) | 0;
      objectLen = matrix(swfVersion, tagCode) | 0;
      finishObject(objectPos, objectLen, 0);
      count = count + 4 | 0;
      if (isMorph) {
        writeUBJU8(MATRIX_MORPH);
        objectPos = startObject(0) | 0;
        objectLen = matrix(swfVersion, tagCode) | 0;
        finishObject(objectPos, objectLen, 0);
        count = count + 2 | 0;
      }
      writeUBJU8(CONDITION);
      writeUBJU8(~~type == 64 ? 1 : ~~type == 67 ? 1 : 0);
      count = count + 2 | 0;
      return count | 0;
    }

    function filterGlow(swfVersion, tagCode, type) {
      swfVersion = swfVersion | 0;
      tagCode = tagCode | 0;
      type = type | 0;
      var count = 0, arrayLen = 0, arrayPos = 0, objectLen = 0, objectPos = 0;
      var reserved = 0, n = 0;
      //if (type == 4 || type == 7) {
      if (~~type == 4 ? 1 : ~~type == 7 ? 1 : 0) {
        arrayLen = readStreamU8() | 0;
      } else {
        arrayLen = 1;
      }
      n = arrayLen;
      writeUBJU8(COLORS);
      arrayPos = startArray(0) | 0;
      while (n) {
        objectPos = startObject(0) | 0;
        objectLen = rgba() | 0;
        finishObject(objectPos, objectLen, 0);
      }
      finishArray(arrayPos, arrayLen, 0);
      count = count + 2 | 0;

      if (~~type == 3) {
        writeUBJU8(HIGHLIGHT_COLOR);
        objectPos = startObject(0) | 0;
        objectLen = rgba() | 0;
        finishObject(objectPos, objectLen, 0);
        count = count + 2 | 0;
      }
      if (~~type == 4 ? 1 : ~~type == 7 ? 1 : 0) {
        n = arrayLen;
        writeUBJU8(RATIOS);
        arrayPos = startArray(0) | 0;
        while (n) {
          writeUBJU16(readStreamU8() | 0);
        }
        finishArray(arrayPos, arrayLen, 0);
        count = count + 2 | 0;
      }
      writePropD32(BLUR_X, +readStreamFixed());
      writePropD32(BLUR_Y, +readStreamFixed());
      count = count + 4 | 0;
      if (~~type != 2) {
        writePropD32(ANGLE, +readStreamFixed());
        writePropD32(DISTANCE, +readStreamFixed());
        count = count + 4 | 0;
      }
      writePropD32(STRENGTH, +readStreamFixed8());
      writePropU32(INNER_SHADOW, readStreamUb(1) | 0);
      writePropU32(KNOCKOUT, readStreamUb(1) | 0);
      writePropU32(COMPOSITE_SOURCE, readStreamUb(1) | 0);
      count = count + 8 | 0;
      if(~~type == 3) {
        writePropU32(ON_TOP, readStreamUb(1) | 0);
        count = count + 2 | 0;
      } else {
        reserved = readStreamUb(1) | 0;
      }
      if (~~type == 4 ? 1 : ~~type == 7 ? 1 : 0) {
        writePropU32(PASSES, readStreamUb(4) | 0);
        count = count + 2 | 0;
      } else {
        reserved = readStreamUb(4) | 0;
      }
      return count | 0;
    }

    function filterBlur(swfVersion, tagCode) {
      swfVersion = swfVersion | 0;
      tagCode = tagCode | 0;
      var reserved = 0;
      writePropD32(BLUR_X, +readStreamFixed());
      writePropD32(BLUR_Y, +readStreamFixed());
      writePropU32(PASSES, readStreamUb(5) | 0);
      reserved = readStreamUb(3) | 0;
      return 6 | 0;
    }

    function filterConvolution(swfVersion, tagCode) {
      swfVersion = swfVersion | 0;
      tagCode = tagCode | 0;
      var reserved = 0, columns = 0, rows = 0, n = 0;
      var arrayPos = 0, arrayLen = 0, objectPos = 0, objectLen = 0;;
      writePropU16(COLUMNS, (columns = readStreamU8() | 0));
      writePropU16(ROWS, (rows = readStreamU8() | 0));
      writePropD32(DIVISOR, +readStreamD32());
      writePropD32(BIAS, +readStreamD32());
      writeUBJU8(WEIGHTS);
      n = arrayLen = imul(columns, rows) | 0;
      arrayPos = startArray(0) | 0;
      while (n) {
        writeUBJD32(+readStreamD32());
        n = n - 1 | 0;
      }
      finishArray(arrayPos, arrayLen, 0);
      writeUBJU8(DEFAULT_COLOR);
      objectPos = startObject(0) | 0;
      objectLen = rgba() | 0;
      finishObject(objectPos, objectLen, 0);
      reserved = readStreamUb(6) | 0;
      writePropU8(CLAMP, readStreamUb(1) | 0);
      writePropU8(PRESERVE_ALPHA, readStreamUb(1) | 0);
      return 16 | 0;
    }

    function filterColorMatrix(swfVersion, tagCode) {
      swfVersion = swfVersion | 0;
      tagCode = tagCode | 0;
      var n = 0, arrayLen = 0, arrayPos = 0;
      n = arrayLen = 20;
      writeUBJU8(MATRIX);
      arrayPos = startArray(0) | 0;
      while (n) {
        writeUBJD32(+readStreamD32());
        n = n - 1 | 0;
      }
      finishArray(arrayPos, arrayLen, 0);
      return 2 | 0;
    }

    function anyFilter(swfVersion, tagCode) {
      swfVersion = swfVersion | 0;
      tagCode = tagCode | 0;
      var type = 0, count = 2, childCount = 0;
      writePropU8(TYPE, (type = readStreamU8() | 0));
      switch (type | 0) {
      case 0:
      case 2:
      case 3:
      case 4:
      case 7:
        childCount = filterGlow(swfVersion, tagCode, type) | 0;
        break
      case 1:
        childCount = filterBlur(swfVersion, tagCode) | 0;
        break
      case 5:
        childCount = filterConvolution(swfVersion, tagCode) | 0;
        break
      case 6:
        childCount = filterColorMatrix(swfVersion, tagCode) | 0;
        break
      default:
      }
      count = count + childCount | 0;
      return count | 0;
    }

    function events(swfVersion, tagCode) {
      swfVersion = swfVersion | 0;
      tagCode = tagCode | 0;
      var type = 0, count = 0, childCount = 0, flags = 0, eoe = 0;
      var keyPress = 0, length = 0, binaryPos = 0, binaryLen = 0;
      if (~~swfVersion >= 6) {
        flags = readStreamU32() | 0;
      } else {
        flags = readStreamU16() | 0;
      }
      eoe = !flags | 0;
      writePropU8(ON_KEY_UP, (flags >> 7 & 1));
      writePropU8(ON_KEY_DOWN, (flags >> 6 & 1));
      writePropU8(ON_MOUSE_UP, (flags >> 5 & 1));
      writePropU8(ON_MOUSE_DOWN, (flags >> 4 & 1));
      writePropU8(ON_MOUSE_MOVE, (flags >> 3 & 1));
      writePropU8(ON_UNLOAD, (flags >> 2 & 1));
      writePropU8(ON_ENTER_FRAME, (flags >> 1 & 1));
      writePropU8(ON_LOAD, (flags & 1));
      count = count + 16 | 0;
      if (~~swfVersion >= 6) {
        writePropU8(ON_DRAG_OVER, (flags >> 15 & 1 | 0));
        writePropU8(ON_ROLL_OUT, (flags >> 14 & 1 | 0));
        writePropU8(ON_ROLL_OVER, (flags >> 13 & 1 | 0));
        writePropU8(ON_RELEASE_OUTSIDE, (flags >> 12 & 1 | 0));
        writePropU8(ON_RELEASE, (flags >> 11 & 1 | 0));
        writePropU8(ON_PRESS, (flags >> 10 & 1 | 0));
        writePropU8(ON_INITIALIZE, (flags >> 9 & 1 | 0));
        writePropU8(ON_DATA, (flags >> 8 & 1 | 0));
        if (~~swfVersion >= 7) {
          writePropU8(ON_CONSTRUCT, (flags >> 18 & 1 | 0));
        } else {
          writePropU8(ON_CONSTRUCT, 0);
        }
        writePropU8(KEY_PRESS, (keyPress = flags >> 17 & 1 | 0));
        writePropU8(ON_DRAG_OUT, flags >> 16 & 1 | 0);
        count = count + 22 | 0;
      }
      if (!eoe) {
        writePropU8(LENGTH, (length = readStreamU32() | 0));
        if (keyPress) {
          writePropU8(KEY_CODE, readStreamU8() | 0);
          count = count + 2 | 0;
        }
        writeUBJU8(ACTION_DATA);
        binaryPos = startBinary() | 0;
        binaryLen = readStreamBinary(length - (keyPress ? 1 : 0) | 0) | 0;
        finishBinary(binaryPos, binaryLen);
        count = count + 4 | 0;
      }
      // Write return value
      writeU8(eoe);
      return count | 0;
    }

    function lineStyle(swfVersion, tagCode, isMorph, hasStrokes) {
      swfVersion = swfVersion | 0;
      tagCode = tagCode | 0;
      isMorph = isMorph | 0;
      hasStrokes = hasStrokes | 0;
      var joinStyle = 0, hasFill = 0, reserved = 0, color = 0;
      var count = 0, objectPos = 0, objectLen = 0;
      writePropU32(WIDTH, readStreamU16() | 0);
      if (isMorph) {
        writePropU32(WIDTH_MORPH, readStreamU16() | 0);
      }
      if (hasStrokes) {
        alignStream();
        writePropU8(START_CAP_STYLE, readStreamUb(2) | 0);
        writePropU8(JOIN_STYLE, (joinStyle = readStreamUb(2) | 0));
        writePropU8(HAS_FILL, (hasFill = readStreamUb(1) | 0));
        writePropU8(NO_HSCALE, readStreamUb(1) | 0);
        writePropU8(NO_VSCALE, readStreamUb(1) | 0);
        writePropU8(PIXEL_HINTING, readStreamUb(1) | 0);
        reserved = readStreamUb(5) | 0;
        writePropU8(NO_CLOSE, readStreamUb(1) | 0);
        writePropU8(END_CAP_STYLE, readStreamUb(2) | 0);
        if (joinStyle | 0 == 2) {
          writePropD32(MITER_LIMIT_FACTOR, +readStreamFixed8());
        }
        if (hasFill | 0 != 0) {
          writeUBJU8(FILL_STYLE);
          objectPos = startObject(0) | 0;
          objectLen = fillStyle(swfVersion, tagCode, isMorph) | 0;
          finishObject(objectPos, objectLen, 0);
        } else {
          writeUBJU8(COLOR);
          objectPos = startObject(0) | 0;
          objectLen = rgba() | 0;
          finishObject(objectPos, objectLen, 0);
          if (isMorph) {
            writeUBJU8(MORPH_COLOR);
            objectPos = startObject(0) | 0;          
            objectLen = rgba() | 0;
            finishObject(objectPos, objectLen, 0);
          }
        }
      } else {
        // ASM BUG tagCode should already be type int
        if (tagCode | 0 > 22) {
          writeUBJU8(COLOR);
          objectPos = startObject(0) | 0;
          objectLen = rgba() | 0;
          finishObject(objectPos, objectLen, 0);
        } else {
          writeUBJU8(COLOR);
          objectPos = startObject(0) | 0;
          objectLen = rgba() | 0;
          finishObject(objectPos, objectLen, 0);
        }
        if (isMorph) {
          writeUBJU8(COLOR_MORPH);
          objectPos = startObject(0) | 0;
          objectLen = rgba() | 0;
          finishObject(objectPos, objectLen, 0);
        }
      }
      return count | 0;
    }

    return {
      defineShape: defineShape,
//      removeObject: removeObject,
//      placeObject: placeObject,
      // Utils
      initMasks: initMasks,
      setInputStreamPos: setInputStreamPos,
      getInputStreamPos: getInputStreamPos,
      getPos: getPos,
      setPos: setPos,
    };
  }

  var bytes;
  var stream;
  var inputStreamOffset = 8388608; // 2^23
  var inputStreamLength;

  function setStream(s) {
    bytes = s.bytes;
    stream = s;
    byteView.set(bytes, inputStreamOffset);
    asm.setInputStreamPos(0);
    inputStreamLength = s.bytes.length;
  }

  var imports = {
    red: 1,
    green: 2,
    blue: 3,
    alpha: 4,
    width: 5,
    widthMorph: 6,
    startCapStyle: 7,
    joinStyle: 8,
    hasFill: 9,
    noHscale: 10,
    noVscale: 11,
    pixelHinting: 12,
    noClose: 13,
    endCapStyle: 14,
    miterLimitFactor: 15,
    color: 16,
    colorMorph: 17,
    matrix: 18,
    symbolId: 19,
    depth: 20,
    flags: 21,
    name: 22,
    data: 23,
    isStraight: 24,
    isGeneral: 25,
    deltaX: 26,
    deltaY: 27,
    isVertical: 28,
    controlDeltaX: 29,
    controlDeltaY: 30,
    anchorDeltaX: 31,
    anchorDeltaY: 32,
    a: 33,
    b: 34,
    c: 35,
    d: 36,
    tx: 37,
    ty: 38,
    hasEvents: 39,
    clip: 40,
    hasName: 41,
    hasRatio: 42,
    hasCxform: 43,
    hasMatrix: 44,
    place: 45,
    move: 46,
    hasBackgroundColor: 47,
    hasVisibility: 48,
    hasImage: 49,
    hasClassName: 50,
    hasCache: 51,
    blend: 52,
    hasFilters: 53,
    className: 54,
    ratio: 55,
    clipDepth: 56,
    filters: 57,
    blendMode: 58,
    bmpCache: 59,
    backgroundColor: 60,
    visibility: 61,
    cache: 62,
    cxform: 63,
    redMultiplier: 64,
    greenMultiplier: 65,
    blueMultiplier: 66,
    alphaMultiplier: 67,
    redOffset: 68,
    greenOffset: 69,
    blueOffset: 70,
    alphaOffset: 71,
    events: 72,
    id: 73,
    bbox: 74,
    isMorph: 75,
    bboxMorph: 76,
    hasStrokes: 77,
    strokeBbox: 78,
    strokeBboxMorph: 79,
    fillWinding: 80,
    nonScalingStrokes: 81,
    scalingStrokes: 82,
    offsetMorph: 83,
    left: 84,
    right: 85,
    top: 86,
    bottom: 87,
    records: 88,
    type: 89,
    hasNewStyles: 90,
    hasLineStyle: 91,
    hasFillStyle1: 92,
    hasfillStyle0: 93,
    moveX: 94,
    moveY: 95,
    fillStyle0: 96,
    fillStyle1: 97,
    matrixMorph: 98,
    spreadMode: 99,
    interpolationMode: 100,
    count: 101,
    focalPoint: 102,
    focalPointMorph: 102,
    ratioMorph: 103,
    bitmapId: 104,
    condition: 105,
    fillStyle: 106,
    morphColor: 107,
    recordsMorph: 108,
    colors: 109,
    highlightColor: 110,
    ratios: 111,
    blurX: 112,
    blueY: 113,
    angle: 114,
    distance: 115,
    strength: 116,
    innerShadow: 117,
    knockout: 118,
    compositeSource: 119,
    onTop: 120,
    passes: 121,
    columns: 122,
    rows: 123,
    divisor: 124,
    bias: 125,
    weights: 126,
    defaultColor: 127,
    clamp: 128,
    preserveAlpha: 129,
    onKeyUp: 130,
    onKeyDown: 131,
    onMouseUp: 132,
    onMouseDown: 133,
    onMouseMove: 134,
    onUnload: 135,
    onEnterFrame: 136,
    onLoad: 137,
    onDragOver: 138,
    onRollOut: 139,
    onRollOver: 140,
    onReleaseOutside: 141,
    onRelease: 142,
    onPress: 143,
    onInitialize: 144,
    onData: 145,
    onConstruct: 146,
    keyPress: 147,
    onDragOut: 148,
    length: 149,
    keyCode: 150,
    actionData: 151,
    
    trace: trace,
  };

  var names = {}
  Object.keys(imports).forEach(function (v, i) {
    names[imports[v]] = v;
  });

  var buffer = new ArrayBuffer(Math.pow(2, 24));  // 16,777,216 bytes
  var dataView = new DataView(buffer);
  var byteView = new Uint8Array(buffer);
  var asm = Asm(global, imports, buffer);
  asm.initMasks();

  function defineShape($bytes, $stream, $, swfVersion, tagCode) {
    if (asm.defineShape) {
      var begin = 0; //asm.getPos();
      asm.setPos(begin);
      asm.setInputStreamPos($stream.pos);
      var count = asm.defineShape(swfVersion, tagCode);
//      trace("defineShape() pos=" + asm.getPos());
      decode(dataView, begin, count);
      for (i = count - 1 | 0; i >= 0; i--) {
        var v = values.pop();
        var n = values.pop();
        $[n] = v;
      }
      $stream.pos = asm.getInputStreamPos();
      trace(JSON.stringify($, null, 2));
      return $;
    }
    $ || ($ = {});
    $.id = readUi16($bytes, $stream);
    var $0 = $.bbox = {};
    bbox($bytes, $stream, $0, swfVersion, tagCode);
    var isMorph = $.isMorph = tagCode === 46 || tagCode === 84;
    if (isMorph) {
      var $1 = $.bboxMorph = {};
      bbox($bytes, $stream, $1, swfVersion, tagCode);
    }
    var hasStrokes = $.hasStrokes = tagCode === 83 || tagCode === 84;
    if (hasStrokes) {
      var $2 = $.strokeBbox = {};
      bbox($bytes, $stream, $2, swfVersion, tagCode);
      if (isMorph) {
        var $3 = $.strokeBboxMorph = {};
        bbox($bytes, $stream, $3, swfVersion, tagCode);
      }
      var reserved = readUb($bytes, $stream, 5);
      $.fillWinding = readUb($bytes, $stream, 1);
      $.nonScalingStrokes = readUb($bytes, $stream, 1);
      $.scalingStrokes = readUb($bytes, $stream, 1);
    }
    if (isMorph) {
      $.offsetMorph = readUi32($bytes, $stream);
      morphShapeWithStyle($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes);
    } else {
      shapeWithStyle($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes);
    }
    return $
  }

  function placeObject($bytes, $stream, $, swfVersion, tagCode){
    if (asm.placeObject) {
      asm.setInputStreamPos($stream.pos);
      var begin = asm.getPos();
      $.count = asm.placeObject(swfVersion, tagCode);
      $.binary = byteView.subarray(begin, asm.getPos());
      $stream.pos = asm.getInputStreamPos();
      return $;
    }
    $||($={})
    if(tagCode>4){
      if(tagCode>26){
        var flags=
          readUi16($bytes, $stream)
      }
      else{
        var flags=
          readUi8($bytes, $stream)
      }
      var hasEvents=
        $.hasEvents=
        flags>>7&1
      var clip=
        $.clip=
        flags>>6&1
      var hasName=
        $.hasName=
        flags>>5&1
      var hasRatio=
        $.hasRatio=
        flags>>4&1
      var hasCxform=
        $.hasCxform=
        flags>>3&1
      var hasMatrix=
        $.hasMatrix=
        flags>>2&1
      var place=
        $.place=
        flags>>1&1
      var move=
        $.move=
        flags&1
      if(tagCode===70){

        var hasBackgroundColor=
          $.hasBackgroundColor=
          flags>>15&1
        var hasVisibility=
          $.hasVisibility=
          flags>>14&1
        var hasImage=
          $.hasImage=
          flags>>12&1
        var hasClassName=
          $.hasClassName=
          flags>>11&1
        var cache=
          $.cache=
          flags>>10&1
        var blend=
          $.blend=
          flags>>9&1
        var hasFilters=
          $.hasFilters=
          flags>>8&1
      }
      else{
        var cache=
          $.cache=
          0
        var blend=
          $.blend=
          0
        var hasFilters=
          $.hasFilters=
          0
      }
      $.depth=
        readUi16($bytes, $stream)
      if(hasClassName){
        $.className=
          readString($bytes, $stream, 0)
      }
      if(place){
        $.symbolId=
          readUi16($bytes, $stream)
      }
      if(hasMatrix){
        var $0=$.matrix={}
        matrix($bytes, $stream, $0, swfVersion, tagCode);
      }
      if(hasCxform){
        var $1=$.cxform={}
        cxform($bytes, $stream, $1, swfVersion, tagCode);
      }
      if(hasRatio){
        $.ratio=
          readUi16($bytes, $stream)
      }
      if(hasName){
        $.name=
          readString($bytes, $stream, 0)
      }
      if(clip){
        $.clipDepth=
          readUi16($bytes, $stream)
      }
      if(hasFilters){

        var count=
          readUi8($bytes, $stream)
        var $2=
          $.filters=
          []
        var $3=count
        while ($3--) {
          var $4={}
          anyFilter($bytes, $stream, $4, swfVersion, tagCode);
          $2.push($4)}
      }
      if(blend){
        $.blendMode=
          readUi8($bytes, $stream)
      }
      if(cache){
        $.bmpCache=
          readUi8($bytes, $stream)
      }
      if(hasEvents){

        var reserved=
          readUi16($bytes, $stream)
        if(swfVersion>=6){
          var allFlags=
            readUi32($bytes, $stream)
        }
        else{
          var allFlags=
            readUi16($bytes, $stream)
        }
        var $28=
          $.events=
          []
        do{
          var $29={}
          var temp = events($bytes, $stream, $29, swfVersion, tagCode);
          var eoe = temp.eoe;
          $28.push($29)}
        while(!eoe)
      }
      if(hasBackgroundColor){
        $.backgroundColor=
          // FIXME is this right? tags.js has "ARGB" in quotes.
          argb($bytes, $stream, $126, swfVersion, tagCode);
      }
      if(hasVisibility){
        $.visibility=
          readUi8($bytes, $stream)
      }
    } else {

      $.place=
        1
      $.symbolId=
        readUi16($bytes, $stream)
      $.depth=
        readUi16($bytes, $stream)
      $.hasMatrix=
        1
      var $30=$.matrix={}
      matrix($bytes, $stream, $30, swfVersion, tagCode);
      if($stream.remaining()){
        $.hasCxform=
          1
        var $31=$.cxform={}
        cxform($bytes, $stream, $31, swfVersion, tagCode);
      }
    }
    return $
  }

  function removeObject($bytes, $stream, $, swfVersion, tagCode){
    if (asm.removeObject) {
      asm.setInputStreamPos($stream.pos);
      var begin = asm.getPos();
      var count = asm.removeObject(swfVersion, tagCode);
      $.binary = byteView.subarray(begin, asm.getPos());
      $stream.pos = asm.getInputStreamPos();
      return $;
    }
	  $||($={})
	  if(tagCode===5){
	    $.symbolId=
		    readUi16($bytes,$stream)
	  }
	  $.depth=
	    readUi16($bytes,$stream)
	  return $
  }

  function defineImage($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    $.id=
      readUi16($bytes, $stream)
    if(tagCode>21){

      var alphaDataOffset=
        readUi32($bytes, $stream)
      if(tagCode===90){
        $.deblock=
          readFixed8($bytes, $stream)
      }
      var imgData=
        $.imgData=
        readBinary($bytes, $stream, alphaDataOffset)
      $.alphaData=
        readBinary($bytes, $stream, 0)
    }
    else{

      var imgData=
        $.imgData=
        readBinary($bytes, $stream, 0)
    }
    switch(imgData[0]<<8|imgData[1]){
    case 65496:
    case 65497:
      $.mimeType=
        "image/jpeg"
      break
    case 35152:
      $.mimeType=
        "image/png"
      break
    case 18249:
      $.mimeType=
        "image/gif"
      break
    default:
      $.mimeType=
        "application/octet-stream"
    }
    if(tagCode===6){
      $.incomplete=
        1
    }
    return $
  }

  function defineButton($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    $.id=
      readUi16($bytes, $stream)
    if(tagCode==7){

      var $0=
        $.characters=
        []
      do{
        var $1={}
        var temp = button($bytes, $stream, $1, swfVersion, tagCode);
        var eob = temp.eob;
        $0.push($1)}
      while(!eob)
      $.actionsData=
        readBinary($bytes, $stream, 0)
    }
    else{

      var trackFlags=
        readUi8($bytes, $stream)
      $.trackAsMenu=
        trackFlags>>7&1
      var actionOffset=
        readUi16($bytes, $stream)
      var $28=
        $.characters=
        []
      do{
        var $29={}
        var flags=
          readUi8($bytes, $stream)
        var eob=
          $29.eob=
          !flags
        if(swfVersion>=8){

          var blend=
            $29.blend=
            flags>>5&1
          var hasFilters=
            $29.hasFilters=
            flags>>4&1
        }
        else{

          var blend=
            $29.blend=
            0
          var hasFilters=
            $29.hasFilters=
            0
        }
        $29.stateHitTest=
          flags>>3&1
        $29.stateDown=
          flags>>2&1
        $29.stateOver=
          flags>>1&1
        $29.stateUp=
          flags&1
        if(!eob){

          $29.symbolId=
            readUi16($bytes, $stream)
          $29.depth=
            readUi16($bytes, $stream)
          var $30=$29.matrix={}
          matrix($bytes, $stream, $30, swfVersion, tagCode);
          if(tagCode===34){
            var $31=$29.cxform={}
            cxform($bytes, $stream, $31, swfVersion, tagCode);
          }
          if(hasFilters){

            $29.filterCount=
              readUi8($bytes, $stream)
            var $32=$29.filters={}
            var type=
              $32.type=
              readUi8($bytes, $stream)
            switch(type){
            case 0:

              if(type===4||type===7){
                var count=
                  readUi8($bytes, $stream)
              }
              else{
                var count=
                  1
              }
              var $33=
                $32.colors=
                []
              var $34=count
              while($34--){
                var $35={}
                $35.red=
                  readUi8($bytes, $stream)
                $35.green=
                  readUi8($bytes, $stream)
                $35.blue=
                  readUi8($bytes, $stream)
                $35.alpha=
                  readUi8($bytes, $stream)
                $33.push($35)}
              if(type===3){
                var $36=$32.higlightColor={}
                $36.red=
                  readUi8($bytes, $stream)
                $36.green=
                  readUi8($bytes, $stream)
                $36.blue=
                  readUi8($bytes, $stream)
                $36.alpha=
                  readUi8($bytes, $stream)
              }
              if(type===4||type===7){

                var $37=
                  $32.ratios=
                  []
                var $38=count
                while($38--){
                  $37.push(
                    readUi8($bytes, $stream)
                  )}
              }
              $32.blurX=
                readFixed($bytes, $stream)
              $32.blurY=
                readFixed($bytes, $stream)
              if(type!==2){

                $32.angle=
                  readFixed($bytes, $stream)
                $32.distance=
                  readFixed($bytes, $stream)
              }
              $32.strength=
                readFixed8($bytes, $stream)
              $32.innerShadow=
                readUb($bytes, $stream, 1)
              $32.knockout=
                readUb($bytes, $stream, 1)
              $32.compositeSource=
                readUb($bytes, $stream, 1)
              if(type===3){

                $32.onTop=
                  readUb($bytes, $stream, 1)
              }
              else{

                var reserved=
                  readUb($bytes, $stream, 1)
              }
              if(type===4||type===7){

                $32.passes=
                  readUb($bytes, $stream, 4)
              }
              else{

                var reserved=
                  readUb($bytes, $stream, 4)
              }
              break
            case 1:

              $32.blurX=
                readFixed($bytes, $stream)
              $32.blurY=
                readFixed($bytes, $stream)
              $32.passes=
                readUb($bytes, $stream, 5)
              var reserved=
                readUb($bytes, $stream, 3)
              break
            case 2:
            case 3:
            case 4:

              if(type===4||type===7){
                var count=
                  readUi8($bytes, $stream)
              }
              else{
                var count=
                  1
              }
              var $39=
                $32.colors=
                []
              var $40=count
              while($40--){
                var $41={}
                $41.red=
                  readUi8($bytes, $stream)
                $41.green=
                  readUi8($bytes, $stream)
                $41.blue=
                  readUi8($bytes, $stream)
                $41.alpha=
                  readUi8($bytes, $stream)
                $39.push($41)}
              if(type===3){
                var $42=$32.higlightColor={}
                $42.red=
                  readUi8($bytes, $stream)
                $42.green=
                  readUi8($bytes, $stream)
                $42.blue=
                  readUi8($bytes, $stream)
                $42.alpha=
                  readUi8($bytes, $stream)
              }
              if(type===4||type===7){

                var $43=
                  $32.ratios=
                  []
                var $44=count
                while($44--){
                  $43.push(
                    readUi8($bytes, $stream)
                  )}
              }
              $32.blurX=
                readFixed($bytes, $stream)
              $32.blurY=
                readFixed($bytes, $stream)
              if(type!==2){

                $32.angle=
                  readFixed($bytes, $stream)
                $32.distance=
                  readFixed($bytes, $stream)
              }
              $32.strength=
                readFixed8($bytes, $stream)
              $32.innerShadow=
                readUb($bytes, $stream, 1)
              $32.knockout=
                readUb($bytes, $stream, 1)
              $32.compositeSource=
                readUb($bytes, $stream, 1)
              if(type===3){

                $32.onTop=
                  readUb($bytes, $stream, 1)
              }
              else{

                var reserved=
                  readUb($bytes, $stream, 1)
              }
              if(type===4||type===7){

                $32.passes=
                  readUb($bytes, $stream, 4)
              }
              else{

                var reserved=
                  readUb($bytes, $stream, 4)
              }
              break
            case 5:

              $32.columns=
                readUi8($bytes, $stream)
              $32.rows=
                readUi8($bytes, $stream)
              $32.divisor=
                readFloat($bytes, $stream)
              $32.bias=
                readFloat($bytes, $stream)
              var $45=
                $32.weights=
                []
              var $46=columns*rows
              while($46--){
                $45.push(
                  readFloat($bytes, $stream)
                )}
              var $47=$32.defaultColor={}
              $47.red=
                readUi8($bytes, $stream)
              $47.green=
                readUi8($bytes, $stream)
              $47.blue=
                readUi8($bytes, $stream)
              $47.alpha=
                readUi8($bytes, $stream)
              var reserved=
                readUb($bytes, $stream, 6)
              $32.clamp=
                readUb($bytes, $stream, 1)
              $32.preserveAlpha=
                readUb($bytes, $stream, 1)
              break
            case 6:

              var $48=
                $32.matrix=
                []
              var $49=20
              while($49--){
                $48.push(
                  readFloat($bytes, $stream)
                )}
              break
            case 7:

              if(type===4||type===7){
                var count=
                  readUi8($bytes, $stream)
              }
              else{
                var count=
                  1
              }
              var $50=
                $32.colors=
                []
              var $51=count
              while($51--){
                var $52={}
                $52.red=
                  readUi8($bytes, $stream)
                $52.green=
                  readUi8($bytes, $stream)
                $52.blue=
                  readUi8($bytes, $stream)
                $52.alpha=
                  readUi8($bytes, $stream)
                $50.push($52)}
              if(type===3){
                var $53=$32.higlightColor={}
                $53.red=
                  readUi8($bytes, $stream)
                $53.green=
                  readUi8($bytes, $stream)
                $53.blue=
                  readUi8($bytes, $stream)
                $53.alpha=
                  readUi8($bytes, $stream)
              }
              if(type===4||type===7){

                var $54=
                  $32.ratios=
                  []
                var $55=count
                while($55--){
                  $54.push(
                    readUi8($bytes, $stream)
                  )}
              }
              $32.blurX=
                readFixed($bytes, $stream)
              $32.blurY=
                readFixed($bytes, $stream)
              if(type!==2){

                $32.angle=
                  readFixed($bytes, $stream)
                $32.distance=
                  readFixed($bytes, $stream)
              }
              $32.strength=
                readFixed8($bytes, $stream)
              $32.innerShadow=
                readUb($bytes, $stream, 1)
              $32.knockout=
                readUb($bytes, $stream, 1)
              $32.compositeSource=
                readUb($bytes, $stream, 1)
              if(type===3){

                $32.onTop=
                  readUb($bytes, $stream, 1)
              }
              else{

                var reserved=
                  readUb($bytes, $stream, 1)
              }
              if(type===4||type===7){

                $32.passes=
                  readUb($bytes, $stream, 4)
              }
              else{

                var reserved=
                  readUb($bytes, $stream, 4)
              }
              break
            default:
            }
          }
          if(blend){
            $29.blendMode=
              readUi8($bytes, $stream)
          }
        }
        $28.push($29)}
      while(!eob)
      if(!!actionOffset){

        var $56=
          $.buttonActions=
          []
        do{
          var $57={}
          buttonCondAction($bytes, $stream, $57, swfVersion, tagCode);
          $56.push($57)}
        while($stream.remaining() > 0)
      }
    }
    return $
  }

  function defineJPEGTables($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    $.id=
      0
    $.imgData=
      readBinary($bytes, $stream, 0)
    $.mimeType=
      "application/octet-stream"
    return $
  }

  function setBackgroundColor($bytes, $stream, $, swfVersion, tagCode) {
    $||($={})
    rgb($bytes, $stream, $, swfVersion, tagCode);
    return $
  }

  function defineFont($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    $.id=
      readUi16($bytes, $stream)
    var firstOffset=
      readUi16($bytes, $stream)
    var glyphCount=
      $.glyphCount=
      firstOffset/2
    var restOffsets=
      []
    var $0=glyphCount-1
    while($0--){
      restOffsets.push(
        readUi16($bytes, $stream)
      )}
    $.offsets=
      [firstOffset].concat(restOffsets)
    var $1=
      $.glyphs=
      []
    var $2=glyphCount
    while($2--){
      var $3={}
      shape($bytes, $stream, $3, swfVersion, tagCode);
      $1.push($3)
    }
    return $
  }

  function defineLabel($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    $.id=
      readUi16($bytes, $stream)
    var $0=$.bbox={}
    bbox($bytes, $stream, $0, swfVersion, tagCode);
    var $1=$.matrix={}
    matrix($bytes, $stream, $1, swfVersion, tagCode);
    var glyphBits=
      $.glyphBits=
      readUi8($bytes, $stream)
    var advanceBits=
      $.advanceBits=
      readUi8($bytes, $stream)
    var $2=
      $.records=
      []
    do{
      var $3={}
      var temp = textRecord($bytes, $stream, $3, swfVersion, tagCode, glyphBits, advanceBits);
      var eot = temp.eot;
      $2.push($3)}
    while(!eot)
    return $
  }

  function doAction($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    if(tagCode===59){
      $.spriteId=
        readUi16($bytes, $stream)
    }
    $.actionsData=
      readBinary($bytes, $stream, 0)
    return $
  }

  function defineSound($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    $.id=
      readUi16($bytes, $stream)
    var soundFlags=
      readUi8($bytes, $stream)
    $.soundFormat=
      soundFlags>>4&15
    $.soundRate=
      soundFlags>>2&3
    $.soundSize=
      soundFlags>>1&1
    $.soundType=
      soundFlags&1
    $.samplesCount=
      readUi32($bytes, $stream)
    $.soundData=
      readBinary($bytes, $stream, 0)
    return $
  }

  function startSound($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    if(tagCode == 15){
      $.soundId=
        readUi16($bytes, $stream)
    }
    if(tagCode == 89){
      $.soundClassName=
        readString($bytes, $stream, 0)
    }
    var $0=$.soundInfo={}
    soundInfo($bytes, $stream, $0, swfVersion, tagCode);
    return $
  }

  function soundStreamHead($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    var playbackFlags=
      readUi8($bytes, $stream)
    $.playbackRate=
      playbackFlags>>2&3
    $.playbackSize=
      playbackFlags>>1&1
    $.playbackType=
      playbackFlags&1
    var streamFlags=
      readUi8($bytes, $stream)
    var streamCompression=
      $.streamCompression=
      streamFlags>>4&15
    $.streamRate=
      streamFlags>>2&3
    $.streamSize=
      streamFlags>>1&1
    $.streamType=
      streamFlags&1
    $.samplesCount=
      readUi32($bytes, $stream)
    if(streamCompression == 2){
      $.latencySeek=
        readSi16($bytes, $stream)
    }
    return $
  }

  function soundStreamBlock($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    $.data=
      readBinary($bytes, $stream, 0)
    return $
  }

  function defineBitmap($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    $.id=
      readUi16($bytes, $stream)
    var format=
      $.format=
      readUi8($bytes, $stream)
    $.width=
      readUi16($bytes, $stream)
    $.height=
      readUi16($bytes, $stream)
    $.hasAlpha=
      tagCode===36
    if(format===3){
      $.colorTableSize=
        readUi8($bytes, $stream)
    }
    $.bmpData=
      readBinary($bytes, $stream, 0)
    return $
  }

  function defineText($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    $.id=
      readUi16($bytes, $stream)
    var $0=$.bbox={}
    bbox($bytes, $stream, $0, swfVersion, tagCode)
    var flags=
      readUi16($bytes, $stream)
    var hasText=
      $.hasText=
      flags>>7&1
    $.wordWrap=
      flags>>6&1
    $.multiline=
      flags>>5&1
    $.password=
      flags>>4&1
    $.readonly=
      flags>>3&1
    var hasColor=
      $.hasColor=
      flags>>2&1
    var hasMaxLength=
      $.hasMaxLength=
      flags>>1&1
    var hasFont=
      $.hasFont=
      flags&1
    var hasFontClass=
      $.hasFontClass=
      flags>>15&1
    $.autoSize=
      flags>>14&1
    var hasLayout=
      $.hasLayout=
      flags>>13&1
    $.noSelect=
      flags>>12&1
    $.border=
      flags>>11&1
    $.wasStatic=
      flags>>10&1
    $.html=
      flags>>9&1
    $.useOutlines=
      flags>>8&1
    if(hasFont){
      $.fontId=
        readUi16($bytes, $stream)
    }
    if(hasFontClass){
      $.fontClass=
        readString($bytes, $stream, 0)
    }
    if(hasFont){
      $.fontHeight=
        readUi16($bytes, $stream)
    }
    if(hasColor){
      var $1=$.color={}
      $1.red=
        readUi8($bytes, $stream)
      $1.green=
        readUi8($bytes, $stream)
      $1.blue=
        readUi8($bytes, $stream)
      $1.alpha=
        readUi8($bytes, $stream)
    }
    if(hasMaxLength){
      $.maxLength=
        readUi16($bytes, $stream)
    }
    if(hasLayout){

      $.align=
        readUi8($bytes, $stream)
      $.leftMargin=
        readUi16($bytes, $stream)
      $.rightMargin=
        readUi16($bytes, $stream)
      $.indent=
        readSi16($bytes, $stream)
      $.leading=
        readSi16($bytes, $stream)
    }
    $.variableName=
      readString($bytes, $stream, 0)
    if(hasText){
      $.initialText=
        readString($bytes, $stream, 0)
    }
    return $
  }

  function frameLabel($bytes, $stream, $, swfVersion, tagCode) {
    $||($={})
    $.name=
      readString($bytes, $stream, 0)
    return $
  }

  function defineFont2($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    $.id=
      readUi16($bytes, $stream)
    var hasLayout=
      $.hasLayout=
      readUb($bytes, $stream, 1)
    if(swfVersion>5){

      $.shiftJis=
        readUb($bytes, $stream, 1)
    }
    else{

      var reserved=
        readUb($bytes, $stream, 1)
    }
    $.smallText=
      readUb($bytes, $stream, 1)
    $.ansi=
      readUb($bytes, $stream, 1)
    var wideOffset=
      $.wideOffset=
      readUb($bytes, $stream, 1)
    var wide=
      $.wide=
      readUb($bytes, $stream, 1)
    $.italic=
      readUb($bytes, $stream, 1)
    $.bold=
      readUb($bytes, $stream, 1)
    if(swfVersion>5){

      $.language=
        readUi8($bytes, $stream)
    }
    else{

      var reserved=
        readUi8($bytes, $stream)
      $.language=
        0
    }
    var nameLength=
      readUi8($bytes, $stream)
    $.name=
      readString($bytes, $stream, nameLength)
    if(tagCode===75){
      $.resolution=
        20
    }
    var glyphCount=
      $.glyphCount=
      readUi16($bytes, $stream)
    if(wideOffset){

      var $0=
        $.offsets=
        []
      var $1=glyphCount
      while($1--){
        $0.push(
          readUi32($bytes, $stream)
        )}
      $.mapOffset=
        readUi32($bytes, $stream)
    }
    else{

      var $2=
        $.offsets=
        []
      var $3=glyphCount
      while($3--){
        $2.push(
          readUi16($bytes, $stream)
        )}
      $.mapOffset=
        readUi16($bytes, $stream)
    }
    var $4=
      $.glyphs=
      []
    var $5=glyphCount
    while($5--){
      var $6={}
      shape($bytes, $stream, $6, swfVersion, tagCode);
      $4.push($6)
    }
    if(wide){

      var $47=
        $.codes=
        []
      var $48=glyphCount
      while($48--){
        $47.push(
          readUi16($bytes, $stream)
        )}
    }
    else{

      var $49=
        $.codes=
        []
      var $50=glyphCount
      while($50--){
        $49.push(
          readUi8($bytes, $stream)
        )}
    }
    if(hasLayout){

      $.ascent=
        readUi16($bytes, $stream)
      $.descent=
        readUi16($bytes, $stream)
      $.leading=
        readSi16($bytes, $stream)
      var $51=
        $.advance=
        []
      var $52=glyphCount
      while($52--){
        $51.push(
          readSi16($bytes, $stream)
        )}
      var $53=
        $.bbox=
        []
      var $54=glyphCount
      while($54--){
        var $55={}
        bbox($bytes, $stream, $55, swfVersion, tagCode);
        $53.push($55)}
      var kerningCount=
        readUi16($bytes, $stream)
      var $56=
        $.kerning=
        []
      var $57=kerningCount
      while($57--){
        var $58={}
        kerning($bytes, $stream, $58, swfVersion, tagCode);
        $56.push($58)}
    }
    return $
  }

  function fileAttributes($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    var reserved=
      readUb($bytes, $stream, 1)
    $.useDirectBlit=
      readUb($bytes, $stream, 1)
    $.useGpu=
      readUb($bytes, $stream, 1)
    $.hasMetadata=
      readUb($bytes, $stream, 1)
    $.doAbc=
      readUb($bytes, $stream, 1)
    $.noCrossDomainCaching=
      readUb($bytes, $stream, 1)
    $.relativeUrls=
      readUb($bytes, $stream, 1)
    $.network=
      readUb($bytes, $stream, 1)
    var pad=
      readUb($bytes, $stream, 24)
    return $
  }

  function doABC($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    if(tagCode===82){
      $.flags=
        readUi32($bytes, $stream)
    }
    else{
      $.flags=
        0
    }
    if(tagCode===82){
      $.name=
        readString($bytes, $stream, 0)
    }
    else{
      $.name=
        ""
    }
    $.data=
      readBinary($bytes, $stream, 0)
    return $
  }

  function symbolClass($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    var symbolCount=
      readUi16($bytes, $stream)
    var $0=
      $.exports=
      []
    var $1=symbolCount
    while($1--){
      var $2={}
      $2.symbolId=
        readUi16($bytes, $stream)
      $2.className=
        readString($bytes, $stream, 0)
      $0.push($2)}
    return $
  }

  function defineScalingGrid($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    $.symbolId=
      readUi16($bytes, $stream)
    var $0=$.splitter={}
    bbox($bytes, $stream, $0, swfVersion, tagCode)
    return $
  }

  function defineScene($bytes, $stream, $, swfVersion, tagCode){
    $||($={})
    var sceneCount=
      readEncodedU32($bytes, $stream)
    var $0=
      $.scenes=
      []
    var $1=sceneCount
    while($1--){
      var $2={}
      $2.offset=
        readEncodedU32($bytes, $stream)
      $2.name=
        readString($bytes, $stream, 0)
      $0.push($2)}
    var labelCount=
      readEncodedU32($bytes, $stream)
    var $3=
      $.labels=
      []
    var $4=labelCount
    while($4--){
      var $5={}
      $5.frame=
        readEncodedU32($bytes, $stream)
      $5.name=
        readString($bytes, $stream, 0)
      $3.push($5)}
    return $
  }

  function bbox($bytes, $stream, $, swfVersion, tagCode) {
    align($bytes, $stream)
    var bits=
      readUb($bytes, $stream, 5)
    var xMin=
      readSb($bytes, $stream, bits)
    var xMax=
      readSb($bytes, $stream, bits)
    var yMin=
      readSb($bytes, $stream, bits)
    var yMax=
      readSb($bytes, $stream, bits)
    $.left=
      xMin/20
    $.right=
      xMax/20
    $.top=
      yMin/20
    $.bottom=
      yMax/20
    align($bytes, $stream)
  }

  // TODO
  // -- return count
  // -- caller updates count

  function rgb($bytes, $stream, $, swfVersion, tagCode) {
    $.red=
      readUi8($bytes, $stream)
    $.green=
      readUi8($bytes, $stream)
    $.blue=
      readUi8($bytes, $stream)
    $.alpha=
      255;
    return;
  }

  function rgba($bytes, $stream, $, swfVersion, tagCode) {
    $.red=
      readUi8($bytes, $stream)
    $.green=
      readUi8($bytes, $stream)
    $.blue=
      readUi8($bytes, $stream)
    $.alpha=
      readUi8($bytes, $stream)
    return;
  }

  function argb($bytes, $stream, $, swfVersion, tagCode) {
    $.alpha=
      readUi8($bytes, $stream)
    $.red=
      readUi8($bytes, $stream)
    $.green=
      readUi8($bytes, $stream)
    $.blue=
      readUi8($bytes, $stream)
  }

  function fillSolid($bytes, $stream, $, swfVersion, tagCode, isMorph) {
    if(tagCode>22||isMorph){
      var $125=$.color={}
      rgba($bytes, $stream, $125, swfVersion, tagCode);
    }
    else{
      var $126=$.color={}
      rgb($bytes, $stream, $126, swfVersion, tagCode);
    }
    if(isMorph){
      var $127=$.colorMorph={}
      rgba($bytes, $stream, $127, swfVersion, tagCode);
    }
    return;
  }

  function matrix($bytes, $stream, $, swfVersion, tagCode) {
    var bits = 0, a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0;
    align($bytes, $stream)
    if (readUb($bytes, $stream, 1) | 0) {
      bits = readUb($bytes, $stream, 5) | 0;
      a = readFb($bytes, $stream, bits) | 0;
      d = readFb($bytes, $stream, bits) | 0;
    }
    if (readUb($bytes, $stream, 1)) {
      bits = readUb($bytes, $stream, 5);
      b = readFb($bytes, $stream, bits);
      d = readFb($bytes, $stream, bits);
    }
    bits = readUb($bytes, $stream, 5);
    tx = readSb($bytes, $stream, bits) / 20;
    ty = readFb($bytes, $stream, bits) / 20;
    align($bytes, $stream)
    $.a = a;
    $.b = b;
    $.c = c;
    $.d = d;
    $.tx = tx;
    $.ty = ty;
  }

  function cxform($bytes, $stream, $, swfVersion, tagCode) {
    align($bytes, $stream)
    var hasOffsets=
      readUb($bytes, $stream, 1)
    var hasMultipliers=
      readUb($bytes, $stream, 1)
    var bits=
      readUb($bytes, $stream, 4)
    if(hasMultipliers){

      $.redMultiplier=
        readSb($bytes, $stream, bits)
      $.greenMultiplier=
        readSb($bytes, $stream, bits)
      $.blueMultiplier=
        readSb($bytes, $stream, bits)
      if(tagCode>4){
        $.alphaMultiplier=
          readSb($bytes, $stream, bits)
      }
      else{
        $.alphaMultiplier=
          256
      }
    }
    else{

      $.redMultiplier=
        256
      $.greenMultiplier=
        256
      $.blueMultiplier=
        256
      $.alphaMultiplier=
        256
    }
    if(hasOffsets){

      $.redOffset=
        readSb($bytes, $stream, bits)
      $.greenOffset=
        readSb($bytes, $stream, bits)
      $.blueOffset=
        readSb($bytes, $stream, bits)
      if(tagCode>4){
        $.alphaOffset=
          readSb($bytes, $stream, bits)
      }
      else{
        $.alphaOffset=
          0
      }
    }
    else{

      $.redOffset=
        0
      $.greenOffset=
        0
      $.blueOffset=
        0
      $.alphaOffset=
        0
    }
    align($bytes, $stream)
  }

  function fillGradient($bytes, $stream, $, swfVersion, tagCode, isMorph, type) {
    var $128=$.matrix={}
    matrix($bytes, $stream, $128, swfVersion, tagCode);
    if(isMorph){
      var $129=$.matrixMorph={}
      matrix($bytes, $stream, $129, swfVersion, tagCode);
    }
    gradient($bytes, $stream, $, swfVersion, tagCode, isMorph, type);
  }

  function gradient($bytes, $stream, $, swfVersion, tagCode, isMorph, type) {
    if(tagCode===83){
      $.spreadMode=
        readUb($bytes, $stream, 2)
      $.interpolationMode=
        readUb($bytes, $stream, 2)
    }
    else{
      var pad=
        readUb($bytes, $stream, 4)
    }
    var count=
      $.count=
      readUb($bytes, $stream, 4)
    var $130=
      $.records=
      []
    var $131=count
    while($131--){
      var $132={}
      gradientRecord($bytes, $stream, $132, swfVersion, tagCode, isMorph);
      $130.push($132)
    }
    if(type===19){
      $.focalPoint=
        readFixed8($bytes, $stream)
      if(isMorph){
        $.focalPointMorph=
          readFixed8($bytes, $stream)
      }
    }
  }

  function gradientRecord($bytes, $stream, $, swfVersion, tagCode, isMorph) {
//    var isMorph = $.isMorph;
    $.ratio=
      readUi8($bytes, $stream)
    if(tagCode>22){
      var $133=$.color={}
      $133.red=
        readUi8($bytes, $stream)
      $133.green=
        readUi8($bytes, $stream)
      $133.blue=
        readUi8($bytes, $stream)
      $133.alpha=
        readUi8($bytes, $stream)
    }
    else{
      var $134=$.color={}
      $134.red=
        readUi8($bytes, $stream)
      $134.green=
        readUi8($bytes, $stream)
      $134.blue=
        readUi8($bytes, $stream)
      $134.alpha=
        255
    }
    if(isMorph){
      $.ratioMorph=
        readUi8($bytes, $stream)
      var $135=$.colorMorph={}
      $135.red=
        readUi8($bytes, $stream)
      $135.green=
        readUi8($bytes, $stream)
      $135.blue=
        readUi8($bytes, $stream)
      $135.alpha=
        readUi8($bytes, $stream)
    }
  }

  function morphShapeWithStyle($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes) {
    var temp = styles($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes);
    var lineBits = temp.lineBits;
    var fillBits = temp.fillBits;
    var $160=
      $.records=
      []
    do{
      var $161={}
      var temp = shapeRecord($bytes, $stream, $161, swfVersion, tagCode, isMorph,
                             fillBits, lineBits, hasStrokes, bits);
      var eos = temp.eos;
      var flags = temp.flags;
      var type = temp.type;
      var fillBits = temp.fillBits;
      var lineBits = temp.lineBits;
      var bits = temp.bits;
      $160.push($161)
    } while(!eos)
    var temp = styleBits($bytes, $stream, $, swfVersion, tagCode);
    var fillBits = temp.fillBits;
    var lineBits = temp.lineBits;
    var $162 = $.recordsMorph = [];
    do{
      var $163 = {};
      var temp = shapeRecord($bytes, $stream, $163, swfVersion, tagCode, isMorph,
                             fillBits, lineBits, hasStrokes, bits);
      var eos = temp.eos;
      var flags = temp.flags;
      var type = temp.type;
      var fillBits = temp.fillBits;
      var lineBits = temp.lineBits;
      var bits = temp.bits;
      $162.push($163)
    } while(!eos)
  }

  function shapeWithStyle($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes) {
    var temp = styles($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes);
    var fillBits = temp.fillBits;
    var lineBits = temp.lineBits;
    var $160 = $.records = [];
    do {
      var $161 = {};
      var temp = shapeRecord($bytes, $stream, $161, swfVersion, tagCode, isMorph,
                             fillBits, lineBits, hasStrokes, bits);
      var eos = temp.eos;
      var flags = temp.flags;
      var type = temp.type;
      var fillBits = temp.fillBits;
      var lineBits = temp.lineBits;
      var bits = temp.bits;
      $160.push($161)
    } while(!eos)
  }

  function shapeRecord($bytes, $stream, $, swfVersion, tagCode, isMorph,
                       fillBits, lineBits, hasStrokes, bits) {
    var type = $.type = readUb($bytes, $stream, 1);
    var flags = readUb($bytes, $stream, 5);
    var eos = $.eos = !(type || flags);
    if (type) {
      var temp = shapeRecordEdge($bytes, $stream, $, swfVersion, tagCode, flags, bits);
      var bits = temp.bits;
    } else {
      var temp = shapeRecordSetup($bytes, $stream, $, swfVersion, tagCode, flags, isMorph,
                                  fillBits, lineBits, hasStrokes, bits);
      var fillBits = temp.fillBits;
      var lineBits = temp.lineBits;
      var bits = temp.bits;
    }
    return {
      type: type,
      flags: flags,
      eos: eos,
      fillBits: fillBits,
      lineBits: lineBits,
      bits: bits
    };
  }

  function shapeRecordEdge($bytes, $stream, $, swfVersion, tagCode, flags, bits) {
    var isStraight = 0, tmp = 0, bits = 0, isGeneral = 0, isVertical = 0;
    isStraight = $.isStraight = flags >> 4;
    tmp = flags & 0x0f;
    bits = tmp + 2;
    if (isStraight) {
      isGeneral = $.isGeneral = readUb($bytes, $stream, 1);
      if (isGeneral) {
        $.deltaX = readSb($bytes, $stream, bits);
        $.deltaY = readSb($bytes, $stream, bits);
      } else {
        isVertical = $.isVertical = readUb($bytes, $stream, 1);
        if (isVertical) {
          $.deltaY = readSb($bytes, $stream, bits);
        } else {
          $.deltaX = readSb($bytes, $stream, bits);
        }
      }
    } else {
      $.controlDeltaX = readSb($bytes, $stream, bits);
      $.controlDeltaY = readSb($bytes, $stream, bits);
      $.anchorDeltaX = readSb($bytes, $stream, bits);
      $.anchorDeltaY = readSb($bytes, $stream, bits);
    }
    return {bits: bits};
  }

  function shapeRecordSetup($bytes, $stream, $, swfVersion, tagCode, flags, isMorph,
                            fillBits, lineBits, hasStrokes, bits) {
    var hasNewStyles = 0, hasLineStyle = 0, hasFillStyle1 = 0;
    var hasFillStyle0 = 0, move = 0;
    if (tagCode > 2) {
      hasNewStyles = $.hasNewStyles = flags >> 4;
    } else {
      hasNewStyles = $.hasNewStyles = 0;
    }
    hasLineStyle = $.hasLineStyle = flags >> 3 & 1;
    hasFillStyle1 = $.hasFillStyle1 = flags >> 2 & 1;
    hasFillStyle0 = $.hasFillStyle0 = flags >> 1 & 1;
    move = $.move = flags & 1;
    if (move) {
      bits = readUb($bytes, $stream, 5);
      $.moveX = readSb($bytes, $stream, bits);
      $.moveY = readSb($bytes, $stream, bits);
    }
    if (hasFillStyle0) {
      $.fillStyle0 = readUb($bytes, $stream, fillBits);
    }
    if (hasFillStyle1) {
      $.fillStyle1 = readUb($bytes, $stream, fillBits);
    }
    if (hasLineStyle) {
      $.lineStyle = readUb($bytes, $stream, lineBits);
    }
    if (hasNewStyles) {
      var temp = styles($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes);
      var lineBits = temp.lineBits;
      var fillBits = temp.fillBits;
    }
    return {
      lineBits: lineBits,
      fillBits: fillBits,
      bits: bits
    };
  }

  function styles($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes) {
    fillStyleArray($bytes, $stream, $, swfVersion, tagCode, isMorph);
    lineStyleArray($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes);
    var temp = styleBits($bytes, $stream, $, swfVersion, tagCode);
    var fillBits = temp.fillBits;
    var lineBits = temp.lineBits;
    return {fillBits: fillBits, lineBits: lineBits};
  }

  function fillStyleArray($bytes, $stream, $, swfVersion, tagCode, isMorph) {
    var tmp = readUi8($bytes, $stream)
    if (tagCode > 2 && tmp === 255) {
      var count = readUi16($bytes, $stream);
    }
    else{
      var count = tmp;
    }
    var $4 = $.fillStyles = [];
    var $5 = count;
    while ($5--) {
      var $6 = {};
      fillStyle($bytes, $stream, $6, swfVersion, tagCode, isMorph);
      $4.push($6);
    }
  }

  function lineStyleArray($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes) {
    var tmp = readUi8($bytes, $stream);
    if (tagCode > 2 && tmp === 255) {
      var count = readUi16($bytes, $stream);
    } else {
      var count = tmp;
    }
    var $138 = $.lineStyles = [];
    var $139 = count;
    while ($139--) {
      var $140 = {};
      lineStyle($bytes, $stream, $140, swfVersion, tagCode, isMorph, hasStrokes);
      $138.push($140)
    }
  }

  function styleBits($bytes, $stream, $, swfVersion, tagCode) {
    align($bytes, $stream);
    var fillBits = readUb($bytes, $stream, 4);
    var lineBits = readUb($bytes, $stream, 4);
    return {
      fillBits: fillBits,
      lineBits: lineBits
    };
  }

  function fillStyle($bytes, $stream, $, swfVersion, tagCode, isMorph) {
    var type = $.type = readUi8($bytes, $stream);
    switch (type) {
    case 0:
      fillSolid($bytes, $stream, $, swfVersion, tagCode, isMorph);
      break
    case 16:
    case 18:
    case 19:
      fillGradient($bytes, $stream, $, swfVersion, tagCode, isMorph, type);
      break
    case 64:
    case 65:
    case 66:
    case 67:
      fillBitmap($bytes, $stream, $, swfVersion, tagCode, isMorph, type);
      break
    default:
    }
  };

  function lineStyle($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes) {
    $.width=
      readUi16($bytes, $stream)
    if(isMorph){
      $.widthMorph=
        readUi16($bytes, $stream)
    }
    if(hasStrokes){
      align($bytes, $stream)
      $.startCapStyle=
        readUb($bytes, $stream, 2)
      var joinStyle=
        $.joinStyle=
        readUb($bytes, $stream, 2)
      var hasFill=
        $.hasFill=
        readUb($bytes, $stream, 1)
      $.noHscale=
        readUb($bytes, $stream, 1)
      $.noVscale=
        readUb($bytes, $stream, 1)
      $.pixelHinting=
        readUb($bytes, $stream, 1)
      var reserved=
        readUb($bytes, $stream, 5)
      $.noClose=
        readUb($bytes, $stream, 1)
      $.endCapStyle=
        readUb($bytes, $stream, 2)
      if(joinStyle===2){
        $.miterLimitFactor=
          readFixed8($bytes, $stream)
      }
      if(hasFill){
        var $141=$.fillStyle={}
        fillStyle($bytes, $stream, $141, swfVersion, tagCode, isMorph);
      }
      else{
        var $155=$.color={}
        rgba($bytes, $stream, $155, swfVersion, tagCode);
        if(isMorph){
          var $156=$.colorMorph={}
          rgba($bytes, $stream, $156, swfVersion, tagCode);
        }
      }
    }
    else{
      if(tagCode>22){
        var $157=$.color={}
        rgba($bytes, $stream, $157, swfVersion, tagCode);
      }
      else{
        var $158=$.color={}
        rgb($bytes, $stream, $158, swfVersion, tagCode);
      }
      if(isMorph){
        var $159=$.colorMorph={}
        rgba($bytes, $stream, $159, swfVersion, tagCode);
      }
    }
  }


  function fillBitmap($bytes, $stream, $, swfVersion, tagCode, isMorph, type) {
    $.bitmapId=
      readUi16($bytes, $stream)
    var $18=$.matrix={}
    matrix($bytes, $stream, $18, swfVersion, tagCode);
    if(isMorph){
      var $19=$.matrixMorph={}
      matrix($bytes, $stream, $19, swfVersion, tagCode);
    }
    $.condition=
      type===64||type===67
  }

  function filterGlow($bytes, $stream, $, swfVersion, tagCode, type) {
    if(type===4||type===7){
      var count=
        readUi8($bytes, $stream)
    }
    else{
      var count=
        1
    }
    var $5=
      $.colors=
      []
    var $6=count
    while($6--){
      var $7={}
      rgba($bytes, $stream, $7, swfVersion, tagCode);
      $5.push($7)}
    if(type===3){
      var $8=$.higlightColor={}
      rgba($bytes, $stream, $8, swfVersion, tagCode);
    }
    if(type===4||type===7){
      var $9=
        $.ratios=
        []
      var $10=count
      while($10--){
        $9.push(
          readUi8($bytes, $stream)
        )}
    }
    $.blurX=
      readFixed($bytes, $stream)
    $.blurY=
      readFixed($bytes, $stream)
    if(type!==2){

      $.angle=
        readFixed($bytes, $stream)
      $.distance=
        readFixed($bytes, $stream)
    }
    $.strength=
      readFixed8($bytes, $stream)
    $.innerShadow=
      readUb($bytes, $stream, 1)
    $.knockout=
      readUb($bytes, $stream, 1)
    $.compositeSource=
      readUb($bytes, $stream, 1)
    if(type===3){

      $.onTop=
        readUb($bytes, $stream, 1)
    }
    else{

      var reserved=
        readUb($bytes, $stream, 1)
    }
    if(type===4||type===7){

      $.passes=
        readUb($bytes, $stream, 4)
    }
    else{

      var reserved=
        readUb($bytes, $stream, 4)
    }
  }

  function filterBlur($bytes, $stream, $, swfVersion, tagCode) {
    $.blurX=
      readFixed($bytes, $stream)
    $.blurY=
      readFixed($bytes, $stream)
    $.passes=
      readUb($bytes, $stream, 5)
    var reserved=
      readUb($bytes, $stream, 3)
  }

  function filterConvolution($bytes, $stream, $, swfVersion, tagCode) {
    $.columns=
      readUi8($bytes, $stream)
    $.rows=
      readUi8($bytes, $stream)
    $.divisor=
      readFloat($bytes, $stream)
    $.bias=
      readFloat($bytes, $stream)
    var $17=
      $.weights=
      []

    // BUG columns, rows not defined
    var $18=columns*rows
    while($18--){
      $17.push(
        readFloat($bytes, $stream)
      )}
    var $19=$.defaultColor={}
    rgba($bytes, $stream, $19, swfVersion, tagCode);
    var reserved=
      readUb($bytes, $stream, 6)
    $.clamp=
      readUb($bytes, $stream, 1)
    $.preserveAlpha=
      readUb($bytes, $stream, 1)
  }

  function filterColorMatrix($bytes, $stream, $, swfVersion, tagCode) {
    var $20=
      $.matrix=
      []
    var $21=20
    while($21--){
      $20.push(
        readFloat($bytes, $stream)
      )}
  }

  function anyFilter($bytes, $stream, $, swfVersion, tagCode) {
    var type=
      $.type=
      readUi8($bytes, $stream)
    switch(type){
    case 0:
    case 2:
    case 3:
    case 4:
    case 7:
      filterGlow($bytes, $stream, $, swfVersion, tagCode, type);
      break
    case 1:
      filterBlur($bytes, $stream, $, swfVersion, tagCode);
      break
    case 5:
      filterConvolution($bytes, $stream, $, swfVersion, tagCode);
      break
    case 6:
      filterColorMatrix($bytes, $stream, $, swfVersion, tagCode);
      break
    default:
    }
  }

  function events($bytes, $stream, $, swfVersion, tagCode) {
    if(swfVersion>=6){
      var flags=
        readUi32($bytes, $stream)
    }
    else{
      var flags=
        readUi16($bytes, $stream)
    }
    var eoe=
      $.eoe=
      !flags
    $.onKeyUp=
      flags>>7&1
    $.onKeyDown=
      flags>>6&1
    $.onMouseUp=
      flags>>5&1
    $.onMouseDown=
      flags>>4&1
    $.onMouseMove=
      flags>>3&1
    $.onUnload=
      flags>>2&1
    $.onEnterFrame=
      flags>>1&1
    $.onLoad=
      flags&1
    if(swfVersion>=6){

      $.onDragOver=
        flags>>15&1
      $.onRollOut=
        flags>>14&1
      $.onRollOver=
        flags>>13&1
      $.onReleaseOutside=
        flags>>12&1
      $.onRelease=
        flags>>11&1
      $.onPress=
        flags>>10&1
      $.onInitialize=
        flags>>9&1
      $.onData=
        flags>>8&1
      if(swfVersion>=7){
        $.onConstruct=
          flags>>18&1
      }
      else{
        $.onConstruct=
          0
      }
      var keyPress=
        $.keyPress=
        flags>>17&1
      $.onDragOut=
        flags>>16&1
    }
    if(!eoe){

      var length=
        $.length=
        readUi32($bytes, $stream)
      if(keyPress){
        $.keyCode=
          readUi8($bytes, $stream)
      }
      $.actionsData=
        readBinary($bytes, $stream, length - (keyPress ? 1 : 0))
    }
    return {eoe: eoe};
  }

  function kerning($bytes, $stream, $, swfVersion, tagCode) {
    if(wide){

      $58.code1=
        readUi16($bytes, $stream)
      $58.code2=
        readUi16($bytes, $stream)
    }
    else{

      $58.code1=
        readUi8($bytes, $stream)
      $58.code2=
        readUi8($bytes, $stream)
    }
    $58.adjustment=
      readUi16($bytes, $stream)
  }

  function textEntry($bytes, $stream, $, swfVersion, tagCode, glyphBits, advanceBits) {
    $.glyphIndex=
      readUb($bytes, $stream, glyphBits)
    $.advance=
      readSb($bytes, $stream, advanceBits)
  }

  function textRecordSetup($bytes, $stream, $, swfVersion, tagCode, flags) {
    var hasFont=
      $.hasFont=
      flags>>3&1
    var hasColor=
      $.hasColor=
      flags>>2&1
    var hasMoveY=
      $.hasMoveY=
      flags>>1&1
    var hasMoveX=
      $.hasMoveX=
      flags&1
    if(hasFont){
      $.fontId=
        readUi16($bytes, $stream)
    }
    if(hasColor){
      if(tagCode===33){
        var $4=$.color={}
        $4.red=
          readUi8($bytes, $stream)
        $4.green=
          readUi8($bytes, $stream)
        $4.blue=
          readUi8($bytes, $stream)
        $4.alpha=
          readUi8($bytes, $stream)
      }
      else{
        var $5=$.color={}
        $5.red=
          readUi8($bytes, $stream)
        $5.green=
          readUi8($bytes, $stream)
        $5.blue=
          readUi8($bytes, $stream)
        $5.alpha=
          255
      }
    }
    if(hasMoveX){
      $.moveX=
        readSi16($bytes, $stream)
    }
    if(hasMoveY){
      $.moveY=
        readSi16($bytes, $stream)
    }
    if(hasFont){
      $.fontHeight=
        readUi16($bytes, $stream)
    }
  }

  function textRecord($bytes, $stream, $, swfVersion, tagCode, glyphBits, advanceBits) {
    align($bytes, $stream)
    var flags=
      readUb($bytes, $stream, 8)
    var eot=
      $.eot=
      !flags
    textRecordSetup($bytes, $stream, $, swfVersion, tagCode, flags);
    if(!eot){

      var tmp=
        readUi8($bytes, $stream)
      if(swfVersion>6){
        var glyphCount=$.glyphCount=
          tmp
      }
      else{
        var glyphCount=$.glyphCount=
          tmp&0x7f
      }
      var $6=
        $.entries=
        []
      var $7=glyphCount
      while($7--){
        var $8={}
        textEntry($bytes, $stream, $8, swfVersion, tagCode, glyphBits, advanceBits);
        $6.push($8)}
    }
    return {eot: eot};
  }

  function soundEnvelope($bytes, $stream, $, swfVersion, tagCode) {
    $.pos44=
      readUi32($bytes, $stream)
    $.volumeLeft=
      readUi16($bytes, $stream)
    $.volumeRight=
      readUi16($bytes, $stream)
  }

  function soundInfo($bytes, $stream, $, swfVersion, tagCode) {
    var reserved=
      readUb($bytes, $stream, 2)
    $.stop=
      readUb($bytes, $stream, 1)
    $.noMultiple=
      readUb($bytes, $stream, 1)
    var hasEnvelope=
      $.hasEnvelope=
      readUb($bytes, $stream, 1)
    var hasLoops=
      $.hasLoops=
      readUb($bytes, $stream, 1)
    var hasOutPoint=
      $.hasOutPoint=
      readUb($bytes, $stream, 1)
    var hasInPoint=
      $.hasInPoint=
      readUb($bytes, $stream, 1)
    if(hasInPoint){
      $.inPoint=
        readUi32($bytes, $stream)
    }
    if(hasOutPoint){
      $.outPoint=
        readUi32($bytes, $stream)
    }
    if(hasLoops){
      $.loopCount=
        readUi16($bytes, $stream)
    }
    if(hasEnvelope){

      var envelopeCount=
        $.envelopeCount=
        readUi8($bytes, $stream)
      var $1=
        $.envelopes=
        []
      var $2=envelopeCount
      while($2--){
        var $3={}
        soundEnvelope($bytes, $stream, $3, swfVersion, tagCode);
        $1.push($3)}
    }
  }

  function button($bytes, $stream, $, swfVersion, tagCode) {
    var flags=
      readUi8($bytes, $stream)
    var eob=
      $.eob=
      !flags
    if(swfVersion>=8){

      var blend=
        $.blend=
        flags>>5&1
      var hasFilters=
        $.hasFilters=
        flags>>4&1
    }
    else{

      var blend=
        $.blend=
        0
      var hasFilters=
        $.hasFilters=
        0
    }
    $.stateHitTest=
      flags>>3&1
    $.stateDown=
      flags>>2&1
    $.stateOver=
      flags>>1&1
    $.stateUp=
      flags&1
    if(!eob){

      $.symbolId=
        readUi16($bytes, $stream)
      $.depth=
        readUi16($bytes, $stream)
      var $2=$.matrix={}
      matrix($bytes, $stream, $2, swfVersion, tagCode);
      if(tagCode===34){
        var $3=$.cxform={}
        cxform($bytes, $stream, $3, swfVersion, tagCode);
      }
      if(hasFilters){
        $.filterCount=
          readUi8($bytes, $stream)
        var $4=$.filters={}
        anyFilter($bytes, $stream, $4, swfVersion, tagCode);
      }
      if(blend){
        $.blendMode=
          readUi8($bytes, $stream)
      }
    }
    return {eob: eob}
  }

  function buttonCondAction($bytes, $stream, $, swfVersion, tagCode) {
    var buttonCondSize = readUi16($bytes, $stream);
    var buttonConditions = readUi16($bytes, $stream);
    $.idleToOverDown = buttonConditions >> 7 & 1;
    $.outDownToIdle = buttonConditions >> 6 & 1;
    $.outDownToOverDown = buttonConditions >> 5 & 1;
    $.overDownToOutDown = buttonConditions >> 4 & 1;
    $.overDownToOverUp = buttonConditions >> 3 & 1;
    $.overUpToOverDown = buttonConditions >> 2 & 1;
    $.overUpToIdle = buttonConditions >> 1 & 1;
    $.idleToOverUp = buttonConditions & 1;
    $.mouseEventFlags = buttonConditions & 511;
    $.keyPress = buttonConditions >> 9 & 127;
    $.overDownToIdle = buttonConditions >> 8& 1;
    if (! buttonCondSize) {
      $.actionsData = readBinary($bytes, $stream, 0);
    } else {
      $.actionsData = readBinary($bytes, $stream, buttonCondSize - 4);
    }
  }

  function shape($bytes, $stream, $, swfVersion, tagCode) {
    var temp = styleBits($bytes, $stream, $, swfVersion, tagCode);
    var fillBits = temp.fillBits;
    var lineBits = temp.lineBits;
    var $4=
      $.records=
      []
    do{
      var $5={}
      var isMorph = false; // FIXME Is this right?
      var hasStrokes = false;  // FIXME Is this right?
      var temp = shapeRecord($bytes, $stream, $5, swfVersion, tagCode, isMorph,
                             fillBits, lineBits, hasStrokes, bits);
      var eos = temp.eos;
      var fillBits = temp.fillBits;
      var lineBits = temp.lineBits;
      var bits = bits;
      $4.push($5)
    }
    while(!eos)
  }

  var values = [];

  var nesting = 0;
  function decode(dataView, pos, count) {
    nesting = nesting + 1;
//    dumpBytes(byteView, pos, 32, 0);
//    trace(nesting + ">> decode() pos=" + pos + " originalCount=" + count);
    pos = pos | 0;
    var marker = 0;
    var size = 0;
    var i = 0;
    var originalCount = count;
    while (count) {
      marker = dataView.getUint8(pos) | 0;
//      trace("decode() count=" + count + " marker=" + marker);
      pos = pos + 1 | 0;
      switch (marker | 0) {
      case 90:  // $Z
        values.push(null);
        break;
      case 84:  // $T
        values.push(true);
        break;
      case 70:  // $F
        values.push(false);
        break;
      case 66:  // $B
        values.push(dataView.getUint8(pos));
        pos = pos + 1 | 0;
        break;
      case 105: // $i
        values.push(dataView.getUint16(pos));
        pos = pos + 2 | 0;
        break;
      case 73:  // $I
        values.push(dataView.getUint32(pos));
        pos = pos + 4 | 0;
        break;
      case 100: // $d
        values.push(dataView.getFloat32(pos));
        pos = pos + 4 | 0;
        break;
      case 68:  // $D
        values.push(dataView.getFloat64(pos));
        pos = pos + 8 | 0;
        break;
      case 115: // $s
        var size = dataView.getUint8(pos);
        pos = pos + 1 | 0;
        var start = pos | 0;
        var stop = start + size | 0;
        var val = "";
        for (i = start | 0; i < stop; i = i + 1 | 0) {
          val += String.fromCharCode(view.getUint8(i));
        }
        values.push(val);
        pos = pos + size | 0;
        break;
      case 83:  // $S
        var size = dataView.getUint32(pos) | 0;
        pos = pos + 4 | 0;
        var start = pos | 0;
        var stop = start + size | 0;
        var val = "";
        for (i = start | 0; i < stop; i = i + 1 | 0) {
          val += String.fromCharCode(view.getUint8(i));
        }
        values.push(val);
        pos = pos + size | 0;
        break;
      case 111: // $o
        var size = dataView.getUint8(pos);
//        trace(">> decode() $o size=" + size);
        pos = pos + 1 | 0;
        for (i = 0; ~~i < ~~size; i = i + 2 | 0) {
          pos = decode(dataView, pos, 2) | 0;
        }
        var val = {};
        for (i = size - 1 | 0; i >= 0; i = i - 2 | 0) {
          var v = values.pop();
          var n = names[values.pop()];
//          trace("decode() $o " + n + ": " + v);
          val[n] = v;
        }
        values.push(val);
//        trace("<< decode() $o");
        break;
      case 79:  // $O
        size = dataView.getUint32(pos) | 0;
        pos = pos + 4 | 0;
        for (i = 0; ~~i < ~~size; i = i + 2 | 0) {
          pos = decode(dataView, pos, 2) | 0;
        }
        var val = {};
        for (i = size - 1 | 0; i >= 0; i = i - 2 | 0) {
          var v = values.pop();
          var n = names[values.pop()];
          val[n] = v;
        }
        values.push(val);
        break;
      case 97:  // $a
        size = dataView.getUint8(pos) | 0;
        pos = pos + 1 | 0;
        for (i = 0; ~~i < ~~size; i = i + 1 | 0) {
          pos = decode(dataView, pos, 1) | 0;
        }
        var val = [];
        for (i = size - 1 | 0; i >= 0; i = i - 1 | 0) {
          var v = values.pop();
          val[i] = v;
        }
        values.push(val);
        break;
      case 65:  // $A
        size = dataView.getUint32(pos) | 0;
        pos = pos + 4 | 0;
        for (i = 0; ~~i < ~~size; i = i + 1 | 0) {
          pos = decode(dataView, pos, 1);
        }
        var val = [];
        for (i = size - 1 | 0; i >= 0; i = i - 1 | 0) {
          var v = values.pop();
          val[i] = v;
        }
        values.push(val);
        break;
      default:
        assert(false, "Internal error: decoding UBJSON");
        break;
      }
      count = count - 1 | 0;
    }
//    trace(nesting + "<< decode() values=" + values.slice(values.length - originalCount));
    nesting = nesting - 1;
    return pos;
  }

  return {
    /* End */                            0: undefined,
    /* ShowFrame */                      1: undefined,
    /* DefineShape */                    2: defineShape,
    /* PlaceObject */                    4: placeObject,
    /* RemoveObject */                   5: removeObject,
    /* DefineBits */                     6: defineImage,
    /* DefineButton */                   7: defineButton,
    /* JPEGTables */                     8: defineJPEGTables,
    /* SetBackgroundColor */             9: setBackgroundColor,
    /* DefineFont */                    10: defineFont,
    /* DefineText */                    11: defineLabel,
    /* DoAction */                      12: doAction,
    /* DefineFontInfo */                13: undefined,
    /* DefineSound */                   14: defineSound,
    /* StartSound */                    15: startSound,
    /* DefineButtonSound */             17: undefined,
    /* SoundStreamHead */               18: soundStreamHead,
    /* SoundStreamBlock */              19: soundStreamBlock,
    /* DefineBitsLossless */            20: defineBitmap,
    /* DefineBitsJPEG2 */               21: defineImage,
    /* DefineShape2 */                  22: defineShape,
    /* DefineButtonCxform */            23: undefined,
    /* Protect */                       24: undefined,
    /* PlaceObject2 */                  26: placeObject,
    /* RemoveObject2 */                 28: removeObject,
    /* DefineShape3 */                  32: defineShape,
    /* DefineText2 */                   33: defineLabel,
    /* DefineButton2 */                 34: defineButton,
    /* DefineBitsJPEG3 */               35: defineImage,
    /* DefineBitsLossless2 */           36: defineBitmap,
    /* DefineEditText */                37: defineText,
    /* DefineSprite */                  39: undefined,
    /* FrameLabel */                    43: frameLabel,
    /* SoundStreamHead2 */              45: soundStreamHead,
    /* DefineMorphShape */              46: defineShape,
    /* DefineFont2 */                   48: defineFont2,
    /* ExportAssets */                  56: undefined,
    /* ImportAssets */                  57: undefined,
    /* EnableDebugger */                58: undefined,
    /* DoInitAction */                  59: doAction,
    /* DefineVideoStream */             60: undefined,
    /* VideoFrame */                    61: undefined,
    /* DefineFontInfo2 */               62: undefined,
    /* EnableDebugger2 */               64: undefined,
    /* ScriptLimits */                  65: undefined,
    /* SetTabIndex */                   66: undefined,
    /* FileAttributes */                69: fileAttributes,
    /* PlaceObject3 */                  70: placeObject,
    /* ImportAssets2 */                 71: undefined,
    /* DoABC (undoc) */                 72: doABC,
    /* DefineFontAlignZones */          73: undefined,
    /* CSMTextSettings */               74: undefined,
    /* DefineFont3 */                   75: defineFont2,
    /* SymbolClass */                   76: symbolClass,
    /* Metadata */                      77: undefined,
    /* DefineScalingGrid */             78: defineScalingGrid,
    /* DoABC */                         82: doABC,
    /* DefineShape4 */                  83: defineShape,
    /* DefineMorphShape2 */             84: defineShape,
    /* DefineSceneAndFrameLabelData */  86: defineScene,
    /* DefineBinaryData */              87: undefined,
    /* DefineFontName */                88: undefined,
    /* StartSound2 */                   89: startSound,
    /* DefineBitsJPEG4 */               90: defineImage,
    /* DefineFont4 */                   91: undefined,

    setStream: setStream,
  };

})(this);

var readHeader = function readHeader($bytes, $stream, $, swfVersion, tagCode){
  $ || ($ = {});
  var $0=$.bbox={}
  align($bytes, $stream)
  var bits=
    readUb($bytes, $stream, 5)
  var xMin=
    readSb($bytes, $stream, bits)
  var xMax=
    readSb($bytes, $stream, bits)
  var yMin=
    readSb($bytes, $stream, bits)
  var yMax=
    readSb($bytes, $stream, bits)
  $0.left=
    xMin/20
  $0.right=
    xMax/20
  $0.top=
    yMin/20
  $0.bottom=
    yMax/20
  align($bytes, $stream)
  var reserved=
    readUi8($bytes, $stream)
  $.frameRate=
    readUi8($bytes, $stream)
  $.frameCount=
    readUi16($bytes, $stream)
  return $
}
