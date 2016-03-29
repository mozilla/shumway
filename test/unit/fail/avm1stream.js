/*
 * Copyright 2015 Mozilla Foundation
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

(function avm1StreamTests() {

  var ActionsDataStream = Shumway.AVM1.ActionsDataStream;

  var DefaultSwfVersion = 11;

  unitTests.push(function () {
    // readUI8() -- should return bytes in right order
    var stream = new ActionsDataStream(new Uint8Array([1,2,3]), DefaultSwfVersion);
    eq(stream.readUI8(), 1);
    eq(stream.readUI8(), 2);
    eq(stream.readUI8(), 3);
  });

  unitTests.push(function () {
    // readUI16() -- should return unsigned 16-bit ints
    var stream = new ActionsDataStream(new Uint8Array([1,0,255,255]), DefaultSwfVersion);
    eq(stream.readUI16(), 1);
    eq(stream.readUI16(), 65535);
  });

  unitTests.push(function () {
    // readSI16() -- should return signed 16-bit ints
    var stream = new ActionsDataStream(new Uint8Array([1,0,255,255]), DefaultSwfVersion);
    eq(stream.readSI16(), 1);
    eq(stream.readSI16(), -1);
  });

  unitTests.push(function () {
    // readInteger() -- should return signed 32-bit ints
    var stream = new ActionsDataStream(new Uint8Array([1,0,255,255]), DefaultSwfVersion);
    eq(stream.readInteger(), -65535);
  });

  unitTests.push(function () {
    // readFloat() -- should return 32-bit number
    // 3F23D70A = 0.64
    var stream = new ActionsDataStream(new Uint8Array([0x0A,0xD7,0x23,0x3F]), DefaultSwfVersion);
    var n = stream.readFloat();
    check(Math.abs(n - 0.63999) < 0.00001);
  });

  unitTests.push(function () {
    // readDouble() -- should return 64-bit number
    // C0256B851EB851EC = -10.71
    // the two halfs of the double number are swapped in ActionScript presentation
    var stream = new ActionsDataStream(new Uint8Array([0x85,0x6B,0x25,0xC0,0xEC,0x51,0xB8,0x1E]), DefaultSwfVersion);
    eq(stream.readDouble(), -10.71);
  });

  unitTests.push(function () {
    // readBoolean() -- should return boolean values
    var stream = new ActionsDataStream(new Uint8Array([0,1]), DefaultSwfVersion);
    eq(stream.readBoolean(), false);
    eq(stream.readBoolean(), true);
  });

  unitTests.push(function () {
    // readString() -- should returns UTF8 decoded string for SWF 6+
    var stream = new ActionsDataStream(new Uint8Array([0x41, 0xD0, 0x90, 0xF0, 0xA0, 0x8A, 0xA4, 0, 64, 0]), 6);
    eq(stream.readString(), 'A\u0410\uD840\uDEA4');
    eq(stream.readString(), '@');
  });

  unitTests.push(function () {
    // readString() -- should returns ANSI decoded string for SWF 5
    var stream = new ActionsDataStream(new Uint8Array([0x41, 0xD0, 0x90, 0xF0, 0xA0, 0x8A, 0xA4, 0, 64, 0]), 5);
    eq(stream.readString(), 'A\xD0\x90\xF0\xA0\x8A\xA4');
    eq(stream.readString(), '@');
  });

  unitTests.push(function () {
    // readBytes() -- should returns byte array with specified size
    var stream = new ActionsDataStream(new Uint8Array([1, 2, 3, 4]), DefaultSwfVersion);
    var ar1 = stream.readBytes(2);
    eq(ar1.length, 2);
    eq(ar1[0], 1);
    eq(ar1[1], 2);
    var ar2 = stream.readBytes(1);
    eq(ar2.length, 1);
    eq(ar2[0], 3);
  });

  unitTests.push(function () {
    // readBytes() -- should returns byte array with truncated size'
    var stream = new ActionsDataStream(new Uint8Array([1, 2]), DefaultSwfVersion);
    var ar1 = stream.readBytes(5);
    eq(ar1.length, 2);
    eq(ar1[0], 1);
    eq(ar1[1], 2);
  });

})();
