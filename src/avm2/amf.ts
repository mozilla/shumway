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

/**
 * This file implements the AMF0 and AMF3 serialization protocols secified in:
 * http://wwwimages.adobe.com/www.adobe.com/content/dam/Adobe/en/devnet/amf/pdf/amf-file-format-spec.pdf
 */
module Shumway.AVMX {
  import ByteArray = Shumway.AVMX.AS.flash.utils.ByteArray;
  import assert = Shumway.Debug.assert;

  class AMF3ReferenceTables {
    strings: any [] = [];
    objects: any [] = [];
    traits: ITraits [] = [];
    /**
     * Trait names are kept in sync with |traits| and are used to optimize fetching public trait names.
     */
    traitNames: string [] [] = [];
  }

  export class ClassAliases {
    private _classMap: WeakMap<AXClass, string> = new WeakMap<AXClass, string>();
    private _nameMap: any = Object.create(null);
    getAliasByClass(axClass: AXClass): string {
      return this._classMap.get(axClass);
    }
    getClassByAlias(alias: string): AXClass {
      return this._nameMap[alias];
    }
    registerClassAlias(alias: string, axClass: AXClass) {
      this._classMap.set(axClass, alias);
      release || assert (!this._nameMap[alias] || (this._nameMap[alias] === axClass));
      this._nameMap[alias] = axClass;
    }
  }

  export const enum AMF0Marker {
    NUMBER = 0x00,
    BOOLEAN = 0x01,
    STRING = 0x02,
    OBJECT = 0x03,
    NULL = 0x05,
    UNDEFINED = 0x06,
    REFERENCE = 0x07,
    ECMA_ARRAY = 0x08,
    OBJECT_END = 0x09,
    STRICT_ARRAY = 0x0A,
    DATE = 0x0B,
    LONG_STRING = 0x0C,
    XML = 0x0F,
    TYPED_OBJECT = 0x10,
    AVMPLUS = 0x11
  }

  function writeString(ba: ByteArray, s: string) {
    if (s.length > 0xFFFF) {
      throw "AMF short string exceeded";
    }
    if (!s.length) {
      ba.writeByte(0x00);
      ba.writeByte(0x00);
      return;
    }
    var bytes = Shumway.StringUtilities.utf8decode(s);
    ba.writeByte((bytes.length >> 8) & 255);
    ba.writeByte(bytes.length & 255);
    for (var i = 0; i < bytes.length; i++) {
      ba.writeByte(bytes[i]);
    }
  }

  function readString(ba: ByteArray): string {
    var byteLength = (ba.readByte() << 8) | ba.readByte();
    if (!byteLength) {
      return "";
    }

    var buffer = new Uint8Array(byteLength);
    for (var i = 0; i < byteLength; i++) {
      buffer[i] = ba.readByte();
    }

    return Shumway.StringUtilities.utf8encode(buffer);
  }

  function writeDouble(ba: ByteArray, value: number) {
    var buffer = new ArrayBuffer(8);
    var view = new DataView(buffer);
    view.setFloat64(0, value, false);
    for (var i = 0; i < buffer.byteLength; i++) {
      ba.writeByte(view.getUint8(i));
    }
  }

  function readDouble(ba: ByteArray): number {
    var buffer = new ArrayBuffer(8);
    var view = new DataView(buffer);
    for (var i = 0; i < buffer.byteLength; i++) {
      view.setUint8(i, ba.readByte());
    }
    return view.getFloat64(0, false);
  }

  export class AMF0 {
    public static write(ba: ByteArray, value: any) {
      switch (typeof value) {
        case "boolean":
          ba.writeByte(AMF0Marker.BOOLEAN);
          ba.writeByte(value ? 0x01: 0x00);
          break;
        case "number":
          ba.writeByte(AMF0Marker.NUMBER);
          writeDouble(ba, value);
          break;
        case "undefined":
          ba.writeByte(AMF0Marker.UNDEFINED);
          break;
        case "string":
          ba.writeByte(AMF0Marker.STRING);
          writeString(ba, value);
          break;
        case "object":
          var object = (<AS.ASObject>value);
          release || assert(object === null || AXBasePrototype.isPrototypeOf(object));
          if (object === null) {
            ba.writeByte(AMF0Marker.NULL);
          } else if (ba.sec.AXArray.axIsType(object)) {
            var array = (<AS.ASArray>object).value;
            ba.writeByte(AMF0Marker.ECMA_ARRAY);
            ba.writeByte((array.length >>> 24) & 255);
            ba.writeByte((array.length >> 16) & 255);
            ba.writeByte((array.length >> 8) & 255);
            ba.writeByte(array.length & 255);
            // REDUX: What about sparse arrays?
            forEachPublicProperty(object, function (key: string, value: any) {
              writeString(ba, key);
              this.write(ba, value);
            }, this);
            ba.writeByte(0x00);
            ba.writeByte(0x00);
            ba.writeByte(AMF0Marker.OBJECT_END);
          } else {
            ba.writeByte(AMF0Marker.OBJECT);
            forEachPublicProperty(object, function (key: string, value: any) {
              writeString(ba, key);
              this.write(ba, value);
            }, this);
            ba.writeByte(0x00);
            ba.writeByte(0x00);
            ba.writeByte(AMF0Marker.OBJECT_END);
          }
          return;
      }
    }

    public static read(ba: ByteArray): any {
      var marker = ba.readByte();
      switch (marker) {
        case AMF0Marker.NUMBER:
          return readDouble(ba);
        case AMF0Marker.BOOLEAN:
          return !!ba.readByte();
        case AMF0Marker.STRING:
          return readString(ba);
        case AMF0Marker.OBJECT:
          var object = ba.sec.createObject();
          while (true) {
            var key = readString(ba);
            if (!key.length) break;
            object.axSetPublicProperty(key, this.read(ba));
          }
          if (ba.readByte() !== AMF0Marker.OBJECT_END) {
            throw "AMF0 End marker is not found";
          }
          return object;
        case AMF0Marker.NULL:
          return null;
        case AMF0Marker.UNDEFINED:
          return undefined;
        case AMF0Marker.ECMA_ARRAY:
          var array = ba.sec.createArray([]);
          array.length = (ba.readByte() << 24) | (ba.readByte() << 16) |
            (ba.readByte() << 8) | ba.readByte();
          while (true) {
            var key = readString(ba);
            if (!key.length) break;
            array.axSetPublicProperty(key, this.read(ba));
          }
          if (ba.readByte() !== AMF0Marker.OBJECT_END) {
            throw "AMF0 End marker is not found";
          }
          return array;
        case AMF0Marker.STRICT_ARRAY:
          var array = ba.sec.createArray([]);
          var length = array.length = (ba.readByte() << 24) | (ba.readByte() << 16) |
            (ba.readByte() << 8) | ba.readByte();
          for (var i = 0; i < length; i++) {
            array.axSetPublicProperty(i, this.read(ba));
          }
          return array;
        case AMF0Marker.AVMPLUS:
          return readAMF3Value(ba, new AMF3ReferenceTables());
        default:
          throw "AMF0 Unknown marker " + marker;
      }
    }
  }

  export const enum AMF3Marker {
    UNDEFINED = 0x00,
    NULL = 0x01,
    FALSE = 0x02,
    TRUE = 0x03,
    INTEGER = 0x04,
    DOUBLE = 0x05,
    STRING = 0x06,
    XML_DOC = 0x07,
    DATE = 0x08,
    ARRAY = 0x09,
    OBJECT = 0x0A,
    XML = 0x0B,
    BYTEARRAY = 0x0C,
    VECTOR_INT = 0x0D,
    VECTOR_UINT = 0x0E,
    VECTOR_DOUBLE = 0x0F,
    VECTOR_OBJECT = 0x10,
    DICTIONARY = 0x11
  }

  function readU29(ba: ByteArray): number {
    var b1 = ba.readByte();
    if ((b1 & 0x80) === 0) {
      return b1;
    }
    var b2 = ba.readByte();
    if ((b2 & 0x80) === 0) {
      return ((b1 & 0x7F) << 7) | b2;
    }
    var b3 = ba.readByte();
    if ((b3 & 0x80) === 0) {
      return ((b1 & 0x7F) << 14) | ((b2 & 0x7F) << 7) | b3;
    }
    var b4 = ba.readByte();
    return ((b1 & 0x7F) << 22) | ((b2 & 0x7F) << 15) | ((b3 & 0x7F) << 8) | b4;
  }

  function writeU29(ba: ByteArray, value: number) {
    if ((value & 0xFFFFFF80) === 0) {
      ba.writeByte(value & 0x7F);
    } else if ((value & 0xFFFFC000) === 0) {
      ba.writeByte(0x80 | ((value >> 7) & 0x7F));
      ba.writeByte(value & 0x7F);
    } else if ((value & 0xFFE00000) === 0) {
      ba.writeByte(0x80 | ((value >> 14) & 0x7F));
      ba.writeByte(0x80 | ((value >> 7) & 0x7F));
      ba.writeByte(value & 0x7F);
    } else if ((value & 0xC0000000) === 0) {
      ba.writeByte(0x80 | ((value >> 22) & 0x7F));
      ba.writeByte(0x80 | ((value >> 15) & 0x7F));
      ba.writeByte(0x80 | ((value >> 8) & 0x7F));
      ba.writeByte(value & 0xFF);
    } else {
      throw "AMF3 U29 range";
    }
  }

  function readUTF8(ba: ByteArray, references: AMF3ReferenceTables) {
    var u29s = readU29(ba);
    if (u29s === 0x01) {
      return "";
    }
    var strings = references.strings;
    if ((u29s & 1) === 0) {
      return strings[u29s >> 1];
    }

    var byteLength = u29s >> 1;
    var buffer = new Uint8Array(byteLength);
    for (var i = 0; i < byteLength; i++) {
      buffer[i] = ba.readByte();
    }
    var value = Shumway.StringUtilities.utf8encode(buffer);
    strings.push(value);
    return value;
  }

  function writeUTF8(ba: ByteArray, s: string, references: AMF3ReferenceTables) {
    if (s === "") {
      ba.writeByte(0x01); // empty string
      return;
    }

    var strings = references.strings;
    var index = strings.indexOf(s);
    if (index >= 0) {
      writeU29(ba, index << 1);
      return;
    }
    strings.push(s);

    var bytes = Shumway.StringUtilities.utf8decode(s);
    writeU29(ba, 1 | (bytes.length << 1));
    for (var i = 0; i < bytes.length; i++) {
      ba.writeByte(bytes[i]);
    }
  }

  function readAMF3Value(ba: ByteArray, references: AMF3ReferenceTables) {
    var marker = ba.readByte();
    switch (marker) {
      case AMF3Marker.NULL:
        return null;
      case AMF3Marker.UNDEFINED:
        return undefined;
      case AMF3Marker.FALSE:
        return false;
      case AMF3Marker.TRUE:
        return true;
      case AMF3Marker.INTEGER:
        return readU29(ba);
      case AMF3Marker.DOUBLE:
        return readDouble(ba);
      case AMF3Marker.STRING:
        return readUTF8(ba, references);
      case AMF3Marker.DATE:
        var u29o = readU29(ba);
        release || assert((u29o & 1) === 1);
        return ba.sec.AXDate.axConstruct([readDouble(ba)]);
      case AMF3Marker.OBJECT:
        var u29o = readU29(ba);
        if ((u29o & 1) === 0) {
          return references.objects[u29o >> 1];
        }
        if ((u29o & 4) !== 0) {
          throw "AMF3 Traits-Ext is not supported";
        }
        var axClass: AXClass;
        var traits: ITraits;
        var isDynamic = true;
        var traitNames;
        if ((u29o & 2) === 0) {
          traits = references.traits[u29o >> 2];
          traitNames = references.traitNames[u29o >> 2];
        } else {
          var alias = readUTF8(ba, references);
          if (alias) {
            traits = axClass = ba.sec.classAliases.getClassByAlias(alias);
          }
          isDynamic = (u29o & 8) !== 0;
          traitNames = [];
          for (var i = 0, j = u29o >> 4; i < j; i++) {
            traitNames.push(readUTF8(ba, references));
          }
          references.traits.push(traits);
          references.traitNames.push(traitNames);
        }

        var object = axClass ? axClass.axConstruct([]) : ba.sec.createObject();
        references.objects.push(object);
        // Read trait properties.
        for (var i = 0; i < traitNames.length; i++) {
          var value = readAMF3Value(ba, references);
          object.axSetPublicProperty(traitNames[i], value);
        }
        // Read dynamic properties.
        if (isDynamic) {
          while (true) {
            var key = readUTF8(ba, references);
            if (key === "") break;
            var value = readAMF3Value(ba, references);
            object.axSetPublicProperty(key, value);
          }
        }
        return object;
      case AMF3Marker.ARRAY:
        var u29o = readU29(ba);
        if ((u29o & 1) === 0) {
          return references.objects[u29o >> 1];
        }
        var array = ba.sec.createArray([]);
        references.objects.push(array);
        var densePortionLength = u29o >> 1;
        while (true) {
          var key = readUTF8(ba, references);
          if (!key.length) break;
          var value = readAMF3Value(ba, references);
          array.axSetPublicProperty(key, value);
        }
        for (var i = 0; i < densePortionLength; i++) {
          var value = readAMF3Value(ba, references);
          array.axSetPublicProperty(i, value);
        }
        return array;
      default:
        throw "AMF3 Unknown marker " + marker;
    }
  }

  /**
   * Tries to write a reference to a previously written object.
   */
  function tryWriteAndStartTrackingReference(ba: ByteArray, object: AS.ASObject, references: AMF3ReferenceTables) {
    var objects = references.objects;
    var index = objects.indexOf(object);
    if (index < 0) {
      objects.push(object);
      return false;
    }
    writeU29(ba, index << 1);
    return true;
  }

  var MAX_INT =  268435456 - 1; // 2^28 - 1
  var MIN_INT = -268435456; // -2^28

  function writeAMF3Value(ba: ByteArray, value: any, references: AMF3ReferenceTables) {
    switch (typeof value) {
      case "boolean":
        ba.writeByte(value ? AMF3Marker.TRUE : AMF3Marker.FALSE);
        break;
      case "number":
        var useInteger = value === (value | 0);
        if (useInteger) {
          if (value > MAX_INT || value < MIN_INT) {
            useInteger = false;
          }
        }
        if (useInteger) {
          ba.writeByte(AMF3Marker.INTEGER);
          writeU29(ba, value);
        } else {
          ba.writeByte(AMF3Marker.DOUBLE);
          writeDouble(ba, value);
        }
        break;
      case "undefined":
        ba.writeByte(AMF3Marker.UNDEFINED);
        break;
      case "string":
        ba.writeByte(AMF3Marker.STRING);
        writeUTF8(ba, value, references);
        break;
      case "object":
        if (value === null) {
          ba.writeByte(AMF3Marker.NULL);
        } else if (ba.sec.AXArray.axIsType(value)) {
          var array = (<AS.ASArray>value);
          ba.writeByte(AMF3Marker.ARRAY);
          if (tryWriteAndStartTrackingReference(ba, array, references)) {
            break;
          }
          var densePortionLength = 0;
          while (array.axHasPublicProperty(densePortionLength)) {
            ++densePortionLength;
          }
          writeU29(ba, (densePortionLength << 1) | 1);
          forEachPublicProperty(array, function (i: any, value: any) {
            if (isNumeric(i) && i >= 0 && i < densePortionLength) {
              return;
            }
            writeUTF8(ba, i, references);
            writeAMF3Value(ba, value, references);
          });
          writeUTF8(ba, "", references);
          for (var j = 0; j < densePortionLength; j++) {
            writeAMF3Value(ba, array.axGetPublicProperty(j), references);
          }
        } else if (ba.sec.AXDate.axIsType(value)) {
          ba.writeByte(AMF3Marker.DATE);
          if (tryWriteAndStartTrackingReference(ba, value, references))
            break;
          writeU29(ba, 1);
          writeDouble(ba, value.valueOf());
        } else {
          var object = <AS.ASObject>value;

          // TODO Vector, Dictionary, ByteArray and XML support
          ba.writeByte(AMF3Marker.OBJECT);
          if (tryWriteAndStartTrackingReference(ba, object, references)) {
            break;
          }

          var isDynamic = true;

          var axClass: AXClass = object.axClass;
          if (axClass) {
            var classInfo = axClass.classInfo;
            isDynamic = !classInfo.instanceInfo.isSealed();
            var alias = ba.sec.classAliases.getAliasByClass(axClass) || "";
            var traitsRef = references.traits.indexOf(axClass);
            var traitNames: string [] = null;
            if (traitsRef < 0) {
              // Write traits since we haven't done so yet.
              traitNames = classInfo.instanceInfo.runtimeTraits.getSlotPublicTraitNames();
              references.traits.push(axClass);
              references.traitNames.push(traitNames);
              writeU29(ba, (isDynamic ? 0x0B : 0x03) + (traitNames.length << 4));
              writeUTF8(ba, alias, references);
              // Write trait names.
              for (var i = 0; i < traitNames.length; i++) {
                writeUTF8(ba, traitNames[i], references);
              }
            } else {
              // Write a reference to the previously written traits.
              traitNames = references.traitNames[traitsRef];
              writeU29(ba, 0x01 + (traitsRef << 2));
            }
            // Write the actual trait values.
            for (var i = 0; i < traitNames.length; i++) {
              writeAMF3Value(ba, object.axGetPublicProperty(traitNames[i]), references);
            }
          } else {
            // REDUX: I don't understand in what situations we wouldn't have a class definition, ask Yury.
            // object with no class definition
            writeU29(ba, 0x0B);
            writeUTF8(ba, "", references); // empty alias name
          }

          // Write dynamic properties.
          if (isDynamic) {
            forEachPublicProperty(object, function (i, value) {
              writeUTF8(ba, i, references);
              writeAMF3Value(ba, value, references);
            });
            writeUTF8(ba, "", references);
          }
        }
        return;
    }
  }

  export class AMF3 {
    public static write(ba: ByteArray, object: AS.ASObject) {
      writeAMF3Value(ba, object, new AMF3ReferenceTables());
    }
    public static read(ba: ByteArray) {
      return readAMF3Value(ba, new AMF3ReferenceTables());
    }
  }
}
