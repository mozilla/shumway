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

(function graphicsTests() {
  var ByteArray = flash.utils.ByteArray;
  var AXObject = ByteArray.axClass.sec.AXObject;

  unitTests.push(basics);
  unitTests.push(readBytes);
  unitTests.push(objectEnAndDecoding);

  function basics() {
    var ba = new ByteArray();

    ba.writeByte(0xff);
    ba.writeByte(0x00);
    ba.writeByte(0xff);
    eq(ba.length, 3);
    eq(ba.axGetPublicProperty(0), 0xff);
    eq(ba.axGetPublicProperty(1), 0x00);
    eq(ba.axGetPublicProperty(2), 0xff);

    ba.writeUnsignedInt(0xffffffff);
    eq(ba.length, 7);
    eq(ba.axGetPublicProperty(0), 0xff);
    eq(ba.axGetPublicProperty(1), 0x00);
    eq(ba.axGetPublicProperty(2), 0xff);
    eq(ba.axGetPublicProperty(3), 0xff);
    eq(ba.axGetPublicProperty(4), 0xff);
    eq(ba.axGetPublicProperty(5), 0xff);
    eq(ba.axGetPublicProperty(6), 0xff);

    ba.position = 0;

    eq(ba.readByte(), -1);
    eq(ba.readByte(), 0);
    eq(ba.readByte(), -1);
    eq(ba.readUnsignedInt(), 0xffffffff);

    ba.length = 20;
    eq(ba.length, 20);
    eq(ba.readByte(), 0);
    // Storing the comparison string directly would make the unit test file binary.
    var comparisonString = String.fromCharCode(255, 0, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0,
                                               0, 0, 0, 0, 0, 0, 0);
    eq(ba.toString(), comparisonString);
  }

  function readBytes() {
    var ba = new ByteArray();
    ba.writeByte(1);
    ba.writeByte(2);
    ba.writeByte(3);
    ba.writeByte(4);
    ba.writeByte(5);
    ba.writeByte(6);
    ba.position = 0;
    eq(ba.bytesAvailable, 6);
    var destination = new ByteArray();
    ba.readBytes(destination);
    eq(destination.length, 6);
    eq(ba.bytesAvailable, 0);
  }

  function objectEnAndDecoding() {
    var ba = new ByteArray();
    var sourceObj = AXObject.axConstruct([]);
    sourceObj.axSetPublicProperty('a', 10);
    sourceObj.axSetPublicProperty('b', 20);
    sourceObj.axSetPublicProperty('c', 30);
    ba.writeObject(sourceObj);
    eq(ba.length, 16);
    ba.position = 0;
    var obj = ba.readObject();
    eq(obj.axGetPublicProperty('a'), 10);
    eq(obj.axGetPublicProperty('b'), 20);
    eq(obj.axGetPublicProperty('c'), 30);
  }

})();
