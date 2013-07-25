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
/*global utf8decode, utf8encode, Multiname, forEachPublicProperty, setProperty,
         isNumeric, createEmptyObject */

var AMFUtils = (function AMFUtilsClosure() {
  var AMF0_NUMBER_MARKER = 0x00;
  var AMF0_BOOLEAN_MARKER = 0x01;
  var AMF0_STRING_MARKER = 0x02;
  var AMF0_OBJECT_MARKER = 0x03;
  var AMF0_NULL_MARKER = 0x05;
  var AMF0_UNDEFINED_MARKER = 0x06;
  var AMF0_REFERENCE_MARKER = 0x07;
  var AMF0_ECMA_ARRAY_MARKER = 0x08;
  var AMF0_OBJECT_END_MARKER = 0x09;
  var AMF0_STRICT_ARRAY_MARKER = 0x0A;
  var AMF0_DATE_MARKER = 0x0B;
  var AMF0_LONG_STRING_MARKER = 0x0C;
  var AMF0_XML_MARKER = 0x0F;
  var AMF0_TYPED_OBJECT_MARKER = 0x10;
  var AMF0_AVMPLUS_MARKER = 0x11;

  function writeString(ba, s) {
    if (s.length > 0xFFFF) {
      throw 'AMF short string exceeded';
    }
    if (!s.length) {
      ba.writeByte(0x00);
      ba.writeByte(0x00);
      return;
    }
    var bytes = utf8decode(s);
    ba.writeByte((bytes.length >> 8) & 255);
    ba.writeByte(bytes.length & 255);
    for (var i = 0; i < bytes.length; i++) {
      ba.writeByte(bytes[i]);
    }
  }

  function readString(ba) {
    var byteLength = (ba.readByte() << 8) | ba.readByte();
    if (!byteLength) {
      return '';
    }

    var buffer = new Uint8Array(byteLength);
    for (var i = 0; i < byteLength; i++) {
      buffer[i] = ba.readByte();
    }

    return utf8encode(buffer);
  }

  function writeDouble(ba, value) {
    var buffer = new ArrayBuffer(8);
    var view = new DataView(buffer);
    view.setFloat64(0, value, false);
    for (var i = 0; i < buffer.byteLength; i++) {
      ba.writeByte(view.getUint8(i));
    }
  }

  function readDouble(ba) {
    var buffer = new ArrayBuffer(8);
    var view = new DataView(buffer);
    for (var i = 0; i < buffer.byteLength; i++) {
      view.setUint8(i, ba.readByte());
    }
    return view.getFloat64(0, false);
  }

  function setAvmProperty(obj, propertyName, value) {
    obj.setMultinameProperty(undefined, propertyName, 0, value);
  }

  var amf0 = {
    write: function (ba, obj) {
      switch (typeof obj) {
      case 'boolean':
        ba.writeByte(AMF0_BOOLEAN_MARKER);
        ba.writeByte(obj ? 0x01: 0x00);
        break;
      case 'number':
        ba.writeByte(AMF0_NUMBER_MARKER);
        writeDouble(ba, obj);
        break;
      case 'undefined':
        ba.writeByte(AMF0_UNDEFINED_MARKER);
        break;
      case 'string':
        ba.writeByte(AMF0_STRING_MARKER);
        writeString(ba, obj);
        break;
      case 'object':
        if (obj === null) {
          ba.writeByte(AMF0_NULL_MARKER);
        } else if (Array.isArray(obj)) {
          ba.writeByte(AMF0_ECMA_ARRAY_MARKER);
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
          ba.writeByte(AMF0_OBJECT_END_MARKER);
        } else {
          ba.writeByte(AMF0_OBJECT_MARKER);
          forEachPublicProperty(obj, function (key, value) {
            writeString(ba, key);
            this.write(ba, value);
          }, this);
          ba.writeByte(0x00);
          ba.writeByte(0x00);
          ba.writeByte(AMF0_OBJECT_END_MARKER);
        }
        return;
      }
    },
    read: function (ba) {
      var marker = ba.readByte();
      switch (marker) {
      case AMF0_NUMBER_MARKER:
        return readDouble(ba);
      case AMF0_BOOLEAN_MARKER:
        return !!ba.readByte();
      case AMF0_STRING_MARKER:
        return readString(ba);
      case AMF0_OBJECT_MARKER:
        var obj = {};
        while (true) {
          var key = readString(ba);
          if (!key.length) break;
          setAvmProperty(obj, key, this.read(ba));
        }
        if (ba.readByte() !== AMF0_OBJECT_END_MARKER) {
          throw 'AMF0 End marker is not found';
        }
        return obj;
      case AMF0_NULL_MARKER:
        return null;
      case AMF0_UNDEFINED_MARKER:
        return undefined;
      case AMF0_ECMA_ARRAY_MARKER:
        var obj = [];
        obj.length = (ba.readByte() << 24) | (ba.readByte() << 16) |
                     (ba.readByte() << 8) | ba.readByte();
        while (true) {
          var key = readString(ba);
          if (!key.length) break;
          setAvmProperty(obj, key, this.read(ba));
        }
        if (ba.readByte() !== AMF0_OBJECT_END_MARKER) {
          throw 'AMF0 End marker is not found';
        }
        return obj;
      case AMF0_STRICT_ARRAY_MARKER:
        var obj = [];
        obj.length = (ba.readByte() << 24) | (ba.readByte() << 16) |
                     (ba.readByte() << 8) | ba.readByte();
        for (var i = 0; i < obj.length; i++) {
          obj[i] = this.read(ba);
        }
        return obj;
      case AMF0_AVMPLUS_MARKER:
        return readAmf3Data(ba, {});
      default:
        throw 'AMF0 Unknown marker ' + marker;
      }
    }
  };

  var AMF3_UNDEFINED_MARKER = 0x00;
  var AMF3_NULL_MARKER = 0x01;
  var AMF3_FALSE_MARKER = 0x02;
  var AMF3_TRUE_MARKER = 0x03;
  var AMF3_INTEGER_MARKER = 0x04;
  var AMF3_DOUBLE_MARKER = 0x05;
  var AMF3_STRING_MARKER = 0x06;
  var AMF3_XML_DOC_MARKER = 0x07;
  var AMF3_DATE_MARKER = 0x08;
  var AMF3_ARRAY_MARKER = 0x09;
  var AMF3_OBJECT_MARKER = 0x0A;
  var AMF3_XML_MARKER = 0x0B;
  var AMF3_BYTEARRAY_MARKER = 0x0C;
  var AMF3_VECTOR_INT_MARKER = 0x0D;
  var AMF3_VECTOR_UINT_MARKER = 0x0E;
  var AMF3_VECTOR_DOUBLE_MARKER = 0x0F;
  var AMF3_VECTOR_OBJECT_MARKER = 0x10;
  var AMF3_DICTIONARY_MARKER = 0x11;

  function readU29(ba) {
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

  function writeU29(ba, value) {
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

  function readUTF8vr(ba, caches) {
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
    var value = utf8encode(buffer);
    stringsCache.push(value);
    return value;
  }

  function writeUTF8vr(ba, value, caches) {
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

    var bytes = utf8decode(value);
    writeU29(ba, 1 | (bytes.length << 1));
    for (var i = 0; i < bytes.length; i++) {
      ba.writeByte(bytes[i]);
    }
  }

  function readAmf3Data(ba, caches) {
    var marker = ba.readByte();
    switch (marker) {
    case AMF3_NULL_MARKER:
      return null;
    case AMF3_UNDEFINED_MARKER:
      return undefined;
    case AMF3_FALSE_MARKER:
      return false;
    case AMF3_TRUE_MARKER:
      return true;
    case AMF3_INTEGER_MARKER:
      return readU29(ba);
    case AMF3_DOUBLE_MARKER:
      return readDouble(ba);
    case AMF3_STRING_MARKER:
      return readUTF8vr(ba, caches);
    case AMF3_DATE_MARKER:
      return new Date(readDouble(ba));
    case AMF3_OBJECT_MARKER:
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
    case AMF3_ARRAY_MARKER:
      var u29o = readU29(ba);
      if ((u29o & 1) === 0) {
        return caches.objectsCache[u29o >> 1];
      }
      var obj = [];
      (caches.objectsCache || (caches.objectsCache = [])).push(obj);
      var densePortionLength = u29o >> 1;
      while (true) {
        var key = readUTF8vr(ba, caches);
        if (!key.length) break;
        var value = readAmf3Data(ba, caches);
        setAvmProperty(obj, key, value);
      }
      for (var i = 0; i < densePortionLength; i++) {
        var value = readAmf3Data(ba, caches);
        setAvmProperty(obj, i, value);
      }
      return obj;
    default:
      throw 'AMF3 Unknown marker ' + marker;
    }
  }

  function writeCachedReference(ba, obj, caches) {
    var objectsCache = caches.objectsCache || (caches.objectsCache = []);
    var index = objectsCache.indexOf(obj);
    if (index < 0) {
      objectsCache.push(obj);
      return false;
    }
    writeU29(ba, index << 1);
    return true;
  }

  function writeAmf3Data(ba, obj, caches) {
    switch (typeof obj) {
    case 'boolean':
      ba.writeByte(obj ? AMF3_TRUE_MARKER : AMF3_FALSE_MARKER);
      break;
    case 'number':
      if (obj === (obj | 0)) {
        ba.writeByte(AMF3_INTEGER_MARKER);
        writeU29(ba, obj);
      } else {
        ba.writeByte(AMF3_DOUBLE_MARKER);
        writeDouble(ba, obj);
      }
      break;
    case 'undefined':
      ba.writeByte(AMF3_UNDEFINED_MARKER);
      break;
    case 'string':
      ba.writeByte(AMF3_STRING_MARKER);
      writeUTF8vr(ba, obj, caches);
      break;
    case 'object':
      if (obj === null) {
        ba.writeByte(AMF3_NULL_MARKER);
      } else if (Array.isArray(obj)) {
        ba.writeByte(AMF3_ARRAY_MARKER);
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
        ba.writeByte(AMF3_DATE_MARKER);
        if (writeCachedReference(ba, obj, caches))
          break;
        writeU29(ba, 1);
        writeDouble(ba, obj.valueOf());
      } else {
        // TODO Vector, Dictionary, ByteArray and XML support
        ba.writeByte(AMF3_OBJECT_MARKER);
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

  var amf3 = {
    write: function (ba, obj) {
      writeAmf3Data(ba, obj, {});
    },
    read: function (ba) {
      return readAmf3Data(ba, {});
    }
  };

  return {
    encodings: [amf0, null, null, amf3],
    aliasesCache: aliasesCache
  };
})();
