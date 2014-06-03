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
/*global pow, slice, fromCharCode */

function readSi8($bytes, $stream) {
  return $stream.getInt8($stream.pos++);
}
function readSi16($bytes, $stream) {
  return $stream.getInt16($stream.pos, $stream.pos += 2);
}
function readSi32($bytes, $stream) {
  return $stream.getInt32($stream.pos, $stream.pos += 4);
}
function readUi8($bytes, $stream) {
  return $bytes[$stream.pos++];
}
function readUi16($bytes, $stream) {
  return $stream.getUint16($stream.pos, $stream.pos += 2);
}
function readUi32($bytes, $stream) {
  return $stream.getUint32($stream.pos, $stream.pos += 4);
}
function readFixed($bytes, $stream) {
  return $stream.getInt32($stream.pos, $stream.pos += 4) / 65536;
}
function readFixed8($bytes, $stream) {
  return $stream.getInt16($stream.pos, $stream.pos += 2) / 256;
}
function readFloat16($bytes, $stream) {
  var ui16 = $stream.getUint16($stream.pos);
  $stream.pos += 2;
  var sign = ui16 >> 15 ? -1 : 1;
  var exponent = (ui16 & 0x7c00) >> 10;
  var fraction = ui16 & 0x03ff;
  if (!exponent)
    return sign * pow(2, -14) * (fraction / 1024);
  if (exponent === 0x1f)
    return fraction ? NaN : sign * Infinity;
  return sign * pow(2, exponent - 15) * (1 + (fraction / 1024));
}
function readFloat($bytes, $stream) {
  return $stream.getFloat32($stream.pos, $stream.pos += 4);
}
function readDouble($bytes, $stream) {
  return $stream.getFloat64($stream.pos, $stream.pos += 8);
}
function readEncodedU32($bytes, $stream) {
  var val = $bytes[$stream.pos++];
  if (!(val & 0x080))
    return val;
  val |= $bytes[$stream.pos++] << 7;
  if (!(val & 0x4000))
    return val;
  val |= $bytes[$stream.pos++] << 14;
  if (!(val & 0x200000))
    return val;
  val |= $bytes[$stream.pos++] << 21;
  if (!(val & 0x10000000))
    return val;
  return val | ($bytes[$stream.pos++] << 28);
}
function readBool($bytes, $stream) {
  return !!$bytes[$stream.pos++];
}
function align($bytes, $stream) {
  $stream.align();
}
function readSb($bytes, $stream, size) {
  return (readUb($bytes, $stream, size) << (32 - size)) >> (32 - size);
}
var masks = new Uint32Array(33);
for (var i = 1, mask = 0; i <= 32; ++i)
  masks[i] = mask = (mask << 1) | 1;
function readUb($bytes, $stream, size) {
  var buffer = $stream.bitBuffer;
  var bitlen = $stream.bitLength;
  while (size > bitlen) {
    buffer = (buffer << 8) | $bytes[$stream.pos++];
    bitlen += 8;
  }
  bitlen -= size;
  var val = (buffer >>> bitlen) & masks[size];
  $stream.bitBuffer = buffer;
  $stream.bitLength = bitlen;
  return val;
}
function readFb($bytes, $stream, size) {
  return readSb($bytes, $stream, size) / 65536;
}
function readString($bytes, $stream, length) {
  var codes = [];
  var pos = $stream.pos;
  if (length) {
    codes = slice.call($bytes, pos, pos += length);
  } else {
    length = 0;
    for (var code; (code = $bytes[pos++]); length++)
      codes[length] = code;
  }
  $stream.pos = pos;
  var numChunks = length / 65536;
  var str = '';
  for (var i = 0; i < numChunks; ++i) {
    var begin = i * 65536;
    var end = begin + 65536;
    var chunk = codes.slice(begin, end);
    str += fromCharCode.apply(null, chunk);
  }
  return decodeURIComponent(escape(str.replace('\0', '', 'g')));
}
function readBinary($bytes, $stream, size) {
  return $bytes.subarray(
    $stream.pos,
    $stream.pos = (size ? $stream.pos + size : $stream.end)
  );
}
