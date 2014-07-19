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
///<reference path='references.ts' />

module Shumway.AVM2 {
  import Multiname = Shumway.AVM2.ABC.Multiname;
  import ByteArray = Shumway.AVM2.AS.flash.utils.ByteArray;
  import forEachPublicProperty = Shumway.AVM2.Runtime.forEachPublicProperty;

  export enum AMF0Marker {
    NUMBER = 0x00,
    BOOLEAN = 0x01,
    STRING = 0x02,
    OBJECT = 0x03,
    NULL = 0x05,
    UNDEFINED = 0x06,
    REFERENCE = 0x07,
    ECMA_ARRAY = 0x0,
    OBJECT_END = 0x09,
    STRICT_ARRAY = 0x0A,
    DATE = 0x0B,
    LONG_STRING = 0x0C,
    XML = 0x0F,
    TYPED_OBJECT = 0x10,
    AVMPLUS = 0x11
  }

  function writeString(ba: ByteArray, s) {
    if (s.length > 0xFFFF) {
      throw 'AMF short string exceeded';
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

  function readString(ba: ByteArray) {
    var byteLength = (ba.readByte() << 8) | ba.readByte();
    if (!byteLength) {
      return '';
    }

    var buffer = new Uint8Array(byteLength);
    for (var i = 0; i < byteLength; i++) {
      buffer[i] = ba.readByte();
    }

    return Shumway.StringUtilities.utf8encode(buffer);
  }

  function writeDouble(ba: ByteArray, value) {
    var buffer = new ArrayBuffer(8);
    var view = new DataView(buffer);
    view.setFloat64(0, value, false);
    for (var i = 0; i < buffer.byteLength; i++) {
      ba.writeByte(view.getUint8(i));
    }
  }

  function readDouble(ba: ByteArray) {
    var buffer = new ArrayBuffer(8);
    var view = new DataView(buffer);
    for (var i = 0; i < buffer.byteLength; i++) {
      view.setUint8(i, ba.readByte());
    }
    return view.getFloat64(0, false);
  }

  function setAvmProperty(obj, propertyName, value) {
    obj.asSetPublicProperty(propertyName, value);
  }

  export class AMF0 {
    public static write(ba: ByteArray, obj) {
      switch (typeof obj) {
        case 'boolean':
          ba.writeByte(AMF0Marker.BOOLEAN);
          ba.writeByte(obj ? 0x01: 0x00);
          break;
        case 'number':
          ba.writeByte(AMF0Marker.NUMBER);
          writeDouble(ba, obj);
          break;
        case 'undefined':
          ba.writeByte(AMF0Marker.UNDEFINED);
          break;
        case 'string':
          ba.writeByte(AMF0Marker.STRING);
          writeString(ba, obj);
          break;
        case 'object':
          if (obj === null) {
            ba.writeByte(AMF0Marker.NULL);
          } else if (Array.isArray(obj)) {
            ba.writeByte(AMF0Marker.ECMA_ARRAY);
            ba.writeByte((obj.length >>> 24) & 255);
            ba.writeByte((obj.length >> 16) & 255);
            ba.writeByte((obj.length >> 8) & 255);
            ba.writeByte(obj.length & 255);
            forEachPublicProperty(obj, function (key, value) {
              writeString(ba, key);
              this.write(ba, value);
            }, this);
            ba.writeByte(0x00);
            ba.writeByte(0x00);
            ba.writeByte(AMF0Marker.OBJECT_END);
          } else {
            ba.writeByte(AMF0Marker.OBJECT);
            forEachPublicProperty(obj, function (key, value) {
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

    public static read(ba: ByteArray) {
      var marker = ba.readByte();
      switch (marker) {
        case AMF0Marker.NUMBER:
          return readDouble(ba);
        case AMF0Marker.BOOLEAN:
          return !!ba.readByte();
        case AMF0Marker.STRING:
          return readString(ba);
        case AMF0Marker.OBJECT:
          var obj = {};
          while (true) {
            var key = readString(ba);
            if (!key.length) break;
            setAvmProperty(obj, key, this.read(ba));
          }
          if (ba.readByte() !== AMF0Marker.OBJECT_END) {
            throw 'AMF0 End marker is not found';
          }
          return obj;
        case AMF0Marker.NULL:
          return null;
        case AMF0Marker.UNDEFINED:
          return undefined;
        case AMF0Marker.ECMA_ARRAY:
          var arr = [];
          arr.length = (ba.readByte() << 24) | (ba.readByte() << 16) |
            (ba.readByte() << 8) | ba.readByte();
          while (true) {
            var key = readString(ba);
            if (!key.length) break;
            setAvmProperty(arr, key, this.read(ba));
          }
          if (ba.readByte() !== AMF0Marker.OBJECT_END) {
            throw 'AMF0 End marker is not found';
          }
          return arr;
        case AMF0Marker.STRICT_ARRAY:
          var arr = [];
          arr.length = (ba.readByte() << 24) | (ba.readByte() << 16) |
            (ba.readByte() << 8) | ba.readByte();
          for (var i = 0; i < arr.length; i++) {
            arr[i] = this.read(ba);
          }
          return arr;
        case AMF0Marker.AVMPLUS:
          return readAmf3Data(ba, {});
        default:
          throw 'AMF0 Unknown marker ' + marker;
      }
    }
  }

  export enum AMF3Marker {
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

  function readU29(ba: ByteArray) {
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

  function writeU29(ba: ByteArray, value) {
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
      throw 'AMF3 U29 range';
    }
  }

  function readUTF8vr(ba: ByteArray, caches) {
    var u29s = readU29(ba);
    if (u29s === 0x01) {
      return '';
    }
    var stringsCache = caches.stringsCache || (caches.stringsCache = []);
    if ((u29s & 1) === 0) {
      return stringsCache[u29s >> 1];
    }

    var byteLength = u29s >> 1;
    var buffer = new Uint8Array(byteLength);
    for (var i = 0; i < byteLength; i++) {
      buffer[i] = ba.readByte();
    }
    var value = Shumway.StringUtilities.utf8encode(buffer);
    stringsCache.push(value);
    return value;
  }

  function writeUTF8vr(ba: ByteArray, value, caches) {
    if (value === '') {
      ba.writeByte(0x01); // empty string
      return;
    }

    var stringsCache = caches.stringsCache || (caches.stringsCache = []);
    var index = stringsCache.indexOf(value);
    if (index >= 0) {
      writeU29(ba, index << 1);
      return;
    }
    stringsCache.push(value);

    var bytes = Shumway.StringUtilities.utf8decode(value);
    writeU29(ba, 1 | (bytes.length << 1));
    for (var i = 0; i < bytes.length; i++) {
      ba.writeByte(bytes[i]);
    }
  }

  function readAmf3Data(ba: ByteArray, caches) {
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
        return readUTF8vr(ba, caches);
      case AMF3Marker.DATE:
        return new Date(readDouble(ba));
      case AMF3Marker.OBJECT:
        var u29o = readU29(ba);
        if ((u29o & 1) === 0) {
          return caches.objectsCache[u29o >> 1];
        }
        if ((u29o & 4) !== 0) {
          throw 'AMF3 Traits-Ext is not supported';
        }
        var traits, objectClass;
        if ((u29o & 2) === 0) {
          traits = caches.traitsCache[u29o >> 2];
          objectClass = traits.class;
        } else {
          traits = {};
          var aliasName = readUTF8vr(ba, caches);
          traits.className = aliasName;
          objectClass = aliasName && aliasesCache.names[aliasName];
          traits.class = objectClass;
          traits.isDynamic = (u29o & 8) !== 0;
          traits.members = [];
          var slots = objectClass && objectClass.instanceBindings.slots;
          for (var i = 0, j = u29o >> 4; i < j; i++) {
            var traitName = readUTF8vr(ba, caches);
            var slot = null;
            for (var j = 1; slots && j < slots.length; j++) {
              if (slots[j].name.name === traitName) {
                slot = slots[j];
                break;
              }
            }
            traits.members.push(slot ? Multiname.getQualifiedName(slot.name) :
              Multiname.getPublicQualifiedName(traitName));
          }
          (caches.traitsCache || (caches.traitsCache = [])).push(traits);
        }

        var obj = objectClass ? objectClass.createInstance() : {};
        (caches.objectsCache || (caches.objectsCache = [])).push(obj);
        for (var i = 0; i < traits.members.length; i++) {
          var value = readAmf3Data(ba, caches);
          obj[traits.members[i]] = value;
        }
        if (traits.isDynamic) {
          while (true) {
            var key = readUTF8vr(ba, caches);
            if (!key.length) break;
            var value = readAmf3Data(ba, caches);
            setAvmProperty(obj, key, value);
          }
        }
        return obj;
      case AMF3Marker.ARRAY:
        var u29o = readU29(ba);
        if ((u29o & 1) === 0) {
          return caches.objectsCache[u29o >> 1];
        }
        var arr = [];
        (caches.objectsCache || (caches.objectsCache = [])).push(arr);
        var densePortionLength = u29o >> 1;
        while (true) {
          var key = readUTF8vr(ba, caches);
          if (!key.length) break;
          var value = readAmf3Data(ba, caches);
          setAvmProperty(arr, key, value);
        }
        for (var i = 0; i < densePortionLength; i++) {
          var value = readAmf3Data(ba, caches);
          setAvmProperty(arr, i, value);
        }
        return arr;
      default:
        throw 'AMF3 Unknown marker ' + marker;
    }
  }

  function writeCachedReference(ba: ByteArray, obj, caches) {
    var objectsCache = caches.objectsCache || (caches.objectsCache = []);
    var index = objectsCache.indexOf(obj);
    if (index < 0) {
      objectsCache.push(obj);
      return false;
    }
    writeU29(ba, index << 1);
    return true;
  }

  function writeAmf3Data(ba: ByteArray, obj, caches) {
    switch (typeof obj) {
      case 'boolean':
        ba.writeByte(obj ? AMF3Marker.TRUE : AMF3Marker.FALSE);
        break;
      case 'number':
        if (obj === (obj | 0)) {
          ba.writeByte(AMF3Marker.INTEGER);
          writeU29(ba, obj);
        } else {
          ba.writeByte(AMF3Marker.DOUBLE);
          writeDouble(ba, obj);
        }
        break;
      case 'undefined':
        ba.writeByte(AMF3Marker.UNDEFINED);
        break;
      case 'string':
        ba.writeByte(AMF3Marker.STRING);
        writeUTF8vr(ba, obj, caches);
        break;
      case 'object':
        if (obj === null) {
          ba.writeByte(AMF3Marker.NULL);
        } else if (Array.isArray(obj)) {
          ba.writeByte(AMF3Marker.ARRAY);
          if (writeCachedReference(ba, obj, caches))
            break;
          var densePortionLength = 0;
          while (densePortionLength in obj) {
            ++densePortionLength;
          }
          writeU29(ba, (densePortionLength << 1) | 1);
          forEachPublicProperty(obj, function (i, value) {
            if (isNumeric(i) && i >= 0 && i < densePortionLength) {
              return;
            }
            writeUTF8vr(ba, i, caches);
            writeAmf3Data(ba, value, caches);
          });
          writeUTF8vr(ba, '', caches);
          for (var j = 0; j < densePortionLength; j++) {
            writeAmf3Data(ba, obj[j], caches);
          }
        } else if (obj instanceof Date) {
          ba.writeByte(AMF3Marker.DATE);
          if (writeCachedReference(ba, obj, caches))
            break;
          writeU29(ba, 1);
          writeDouble(ba, obj.valueOf());
        } else {
          // TODO Vector, Dictionary, ByteArray and XML support
          ba.writeByte(AMF3Marker.OBJECT);
          if (writeCachedReference(ba, obj, caches))
            break;

          var isDynamic = true;

          var objectClass = obj.class;
          if (objectClass) {
            isDynamic = !objectClass.classInfo.instanceInfo.isSealed();

            var aliasName = aliasesCache.classes.get(objectClass) || '';

            var traits, traitsCount;
            var traitsCache = caches.traitsCache || (caches.traitsCache = []);
            var traitsInfos = caches.traitsInfos || (caches.traitsInfos = []);
            var traitsRef = traitsCache.indexOf(objectClass);
            if (traitsRef < 0) {
              var slots = objectClass.instanceBindings.slots;
              traits = [];
              var traitsNames = [];
              for (var i = 1; i < slots.length; i++) {
                var slot = slots[i];
                if (!slot.name.getNamespace().isPublic()) {
                  continue;
                }
                traits.push(Multiname.getQualifiedName(slot.name));
                traitsNames.push(slot.name.name);
              }
              traitsCache.push(objectClass);
              traitsInfos.push(traits);
              traitsCount = traitsNames.length;
              writeU29(ba, (isDynamic ? 0x0B : 0x03) + (traitsCount << 4));
              writeUTF8vr(ba, aliasName, caches);
              for (var i = 0; i < traitsCount; i++) {
                writeUTF8vr(ba, traitsNames[i], caches);
              }
            } else {
              traits = traitsInfos[traitsRef];
              traitsCount = traits.length;
              writeU29(ba, 0x01 + (traitsRef << 2));
            }

            for (var i = 0; i < traitsCount; i++) {
              writeAmf3Data(ba, obj[traits[i]], caches);
            }
          } else {
            // object with no class definition
            writeU29(ba, 0x0B);
            writeUTF8vr(ba, '', caches); // empty alias name
          }

          if (isDynamic) {
            forEachPublicProperty(obj, function (i, value) {
              writeUTF8vr(ba, i, caches);
              writeAmf3Data(ba, value, caches);
            });
            writeUTF8vr(ba, '', caches);
          }
        }
        return;
    }
  }

  var aliasesCache = {
    classes: new WeakMap(),
    names: Object.create(null)
  };

  export class AMF3 {
    public static write(ba: ByteArray, object) {
      writeAmf3Data(ba, object, {});
    }
    public static read(ba: ByteArray) {
      return readAmf3Data(ba, {});
    }
  }
}