var URLStreamDefinition = (function () {
  var def = {
    initialize: function () {
      this._stream = null;
      this._connected = false;
      this._littleEndian = false;
    },

    close: function close() {
      this._session.close();
    },
    load: function load(request) {
      var session = FileLoadingService.createSession();
      var self = this;
      var initStream = true;
      session.onprogress = function (data, progressState) {
        if (initStream) {
          initStream = false;
          var length = progressState.bytesTotal;
          var buffer = new ArrayBuffer(length);
          self._stream = new Stream(buffer, 0, 0, length);
        }
        self._stream.push(data);
        var ProgressEventClass = avm2.systemDomain.getClass("flash.events.ProgressEvent");
        self.dispatchEvent(ProgressEventClass.createInstance(["progress",
           false, false, progressState.bytesLoaded, progressState.bytesTotal]));
      };
      session.onerror = function (error) {
        throw 'Not implemented: session.onerror';        
      };
      session.onopen = function () {
        self._connected = true;
        self.dispatchEvent(new flash.events.Event("open", false, false))
      };
      session.onclose = function () {
        self._connected = false;
        self.dispatchEvent(new flash.events.Event("complete", false, false))
      };
      session.open(request);
      this._session = session;
    },
    readBoolean: function readBoolean() {
      throw 'Not implemented: URLStream.readBoolean';
    },
    readByte: function readByte() {
      var stream = this._stream;
      stream.ensure(1);
      return stream.bytes[stream.pos++];
    },
    readBytes: function readBytes(bytes, offset, length) {
      if (length < 0)
        throw 'Invalid length argument';
      var stream = this._stream;
      if (!length)
        length = stream.remaining();
      else
        stream.ensure(length);
      bytes.writeRawBytes(stream.bytes.subarray(stream.pos,
                          stream.pos + length), offset, length);
      stream.pos += length;
    },
    readDouble: function readDouble() {
      throw 'Not implemented: URLStream.readDouble';
    },
    readFloat: function readFloat() {
      throw 'Not implemented: URLStream.readFloat';
    },
    readInt: function readInt() {
      throw 'Not implemented: URLStream.readInt';
    },
    readMultiByte: function readMultiByte(length, charSet) {
      throw 'Not implemented: URLStream.readMultiByte';
    },
    readObject: function readObject() {
      throw 'Not implemented: URLStream.readObject';
    },
    readShort: function readShort() {
      throw 'Not implemented: URLStream.readShort';
    },
    readUTF: function readUTF() {
      throw 'Not implemented: URLStream.readUTF';
    },
    readUTFBytes: function readUTFBytes(length) {
      throw 'Not implemented: URLStream.readUTFBytes';
    },
    readUnsignedByte: function readUnsignedByte() {
      throw 'Not implemented: URLStream.readUnsignedByte';
    },
    readUnsignedInt: function readUnsignedInt() {
      throw 'Not implemented: URLStream.readUnsignedInt';
    },
    readUnsignedShort: function readUnsignedShort() {
      var stream = this._stream;
      stream.ensure(2);
      var result = stream.getUint16(stream.pos, this._littleEndian);
      stream.pos += 2;
      return result;
    },

    get bytesAvailable() {
      return this._stream.remaining();
    },
    get connected() {
      return this._connected;
    },
    get endian() {
      return this._littleEndian ? 'littleEndian' : 'bigEndian';
    },
    set endian(val) {
      this._littleEndian = (val == 'littleEndian');
    },
    get objectEncoding() {
      throw 'Not implemented: URLStream.objectEncoding$get';
    },
    set objectEncoding(val) {
      throw 'Not implemented: URLStream.objectEncoding$set';
    }
  };

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        close: def.close,
        load: def.load,
        readBoolean: def.readBoolean,
        readByte: def.readByte,
        readBytes: def.readBytes,
        readDouble: def.readDouble,
        readFloat: def.readFloat,
        readInt: def.readInt,
        readMultiByte: def.readMultiByte,
        readObject: def.readObject,
        readShort: def.readShort,
        readUTF: def.readUTF,
        readUTFBytes: def.readUTFBytes,
        readUnsignedByte: def.readUnsignedByte,
        readUnsignedInt: def.readUnsignedInt,
        readUnsignedShort: def.readUnsignedShort,
        bytesAvailable: desc(def, 'bytesAvailable'),
        connected: desc(def, 'connected'),
        endian: desc(def, 'endian'),
        objectEncoding: desc(def, 'objectEncoding')
      }
    }
  };

  return def;
}).call(this);
