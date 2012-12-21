function readBinaryFile(path, complete) {
  new BinaryFileReader(path).readAll(null, complete);
}

function getDirectory(path) {
  var elements = path.split("/");
  return elements.slice(0, elements.length - 1).join("/");
}

var SoundDefinition = (function () {
  var def = {
    initialize: function initialize() {
      this._playQueue = [];
      this._url = null;
      this._length = 0;
      this._bytesLoaded = 0;
      this._bytesTotal = 0;
    },

    close: function close() {
      throw 'Not implemented: close';
    },
    extract: function extract(target, length, startPosition) {
      //extract(target:ByteArray, length:Number, startPosition:Number = -1):Number
      throw 'Not implemented: extract';
    },
    _load: function _load(request, checkPolicyFile, bufferTime) {
      if (!request) {
        return;
      }
      // (stream:URLRequest, checkPolicyFile:Boolean, bufferTime:Number) -> void
      var path = getDirectory(remoteFile) + "/" + request.url;
      var _this = this;
      readBinaryFile(path, function (buffer) {
        _this.buffer = buffer;
        _this.dispatchEvent(new flash.events.Event("complete"));

        var element = document.createElement('audio');
        element.src = "data:audio/mpeg;base64," + base64ArrayBuffer(buffer);
        element.load();
        element.addEventListener("loadedmetadata", function () {
          _this._length = this.duration * 1000;
        });
        _this._playQueue.forEach(function (queueItem) {
          playChannel(buffer, queueItem.channel, queueItem.startTime, queueItem.soundTransform);
        });
      });
    },
    loadCompressedDataFromByteArray: function loadCompressedDataFromByteArray(bytes, bytesLength) {
      throw 'Not implemented: loadCompressedDataFromByteArray';
    },
    loadPCMFromByteArray: function loadPCMFromByteArray(bytes, samples, format, stereo, sampleRate) {
      //loadPCMFromByteArray(bytes:ByteArray, samples:uint, format:String = "float", stereo:Boolean = true, sampleRate:Number = 44100.0):void
      throw 'Not implemented: loadPCMFromByteArray';
    },
    play: function play(startTime, loops, soundTransform) {
      // (startTime:Number = 0, loops:int = 0, soundTransform:SoundTransform = null) -> SoundChannel
      var channel = new flash.media.SoundChannel();
      channel._sound = this;
      this._playQueue.push({
        channel: channel,
        startTime: startTime,
        soundTransform: soundTransform
      });
      if (this.buffer) {
        playChannel(this.buffer, channel, startTime, soundTransform);
      }
      return channel;
    },

    get bytesLoaded() {
      return this._bytesLoaded;
    },
    get bytesTotal() {
      return this._bytesTotal;
    },
    get id3() {
      throw 'Not implemented: id3';
    },
    get isBuffering() {
      throw 'Not implemented: isBuffering';
    },
    get isURLInaccessible() {
      throw 'Not implemented: isURLInaccessible';
    },
    get length() {
      return this._length;
    },
    get url() {
      return this._url;
    }
  };

  function playChannel(buffer, channel, startTime, soundTransform) {
    channel._element.src = "data:audio/mpeg;base64," + base64ArrayBuffer(buffer);
    channel._element.play();
    channel._element.addEventListener("playing", function () {
      channel._element.currentTime = startTime / 1000;
    });
  }

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        close: def.close,
        extract: def.extract,
        _load: def._load,
        loadCompressedDataFromByteArray: def.loadCompressedDataFromByteArray,
        loadPCMFromByteArray: def.loadPCMFromByteArray,
        play: def.play,
        bytesLoaded: desc(def, "bytesLoaded"),
        bytesTotal: desc(def, "bytesTotal"),
        id3: desc(def, "id3"),
        isBuffering: desc(def, "isBuffering"),
        isURLInaccessible: desc(def, "isURLInaccessible"),
        length: desc(def, "length"),
        url: desc(def, "url"),
      }
    }
  };

  return def;
}).call(this);