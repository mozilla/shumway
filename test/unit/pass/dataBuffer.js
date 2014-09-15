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

(function dataBufferTests() {
  var DataBuffer = Shumway.ArrayUtilities.DataBuffer;

  function readWrite(position, dataBuffer, name, values, results) {
    for (var i = 0; i < values.length; i++) {
      dataBuffer.position = position;
      dataBuffer["write" + name](values[i]);
      dataBuffer.position = position;
      eq(dataBuffer["read" + name](), results[i], name);
    }
  }

  /**
   * Checks endianness and alignment.
   */
  unitTests.push(function readWriteTests() {
    var a = new DataBuffer();
    for (var j = 0; j < 2; j++) {
      a.endian = j === 0 ? "littleEndian" : "bigEndian";
      for (var i = 0; i < 8; i++) {
        var values = [-5, 5, 255, 256, 65536, 65536 + 1, -65536, -1, 0xAABBCCDD, 0.1, 0.12312312];
        readWrite(i, a, "Byte", values, values.map(function (x) {
          return (x & 0xff) << 24 >> 24;
        }));
        readWrite(i, a, "UnsignedByte", values, values.map(function (x) {
          return x & 0xff;
        }));
        readWrite(i, a, "Short", values, values.map(function (x) {
          return (x & 0xffff) << 16 >> 16;
        }));
        readWrite(i, a, "UnsignedShort", values, values.map(function (x) {
          return x & 0xffff;
        }));
        readWrite(i, a, "Int", values, values.map(function (x) {
          return x | 0;
        }));
        readWrite(i, a, "UnsignedInt", values, values.map(function (x) {
          return x >>> 0;
        }));
        readWrite(i, a, "Float", values, values.map(function (x) {
          var f = new Float32Array(1);
          f[0] = x;
          return f[0];
        }));
        readWrite(i, a, "Double", values, values.map(function (x) {
          return x;
        }));
      }
    }
  });
})();
