var SoundDefinition = (function () {

  var audioElement = null;

  function getAudioDescription(soundData, onComplete) {
    audioElement = audioElement || document.createElement('audio');
    audioElement.src = "data:" + soundData.mimeType + ";base64," + base64ArrayBuffer(soundData.data);
    audioElement.load();
    audioElement.addEventListener("loadedmetadata", function () {
      onComplete({
        duration: this.duration * 1000
      });
    });
  }

  var def = {
    initialize: function initialize() {
      this._playQueue = [];
      this._url = null;
      this._length = 0;
      this._bytesTotal = 0;
      this._bytesLoaded = 0;
      this._id3 = new flash.media.ID3Info();

      var s = this.symbol;
      if (s && s.packaged) {
        var soundData = s.packaged;
        var _this = this;
        getAudioDescription(soundData, function (description) {
          _this._length = description.duration;
        });
        this._soundData = soundData;
      }
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

      var _this = this;
      var loader = this._loader = new flash.net.URLLoader(request);
      loader.dataFormat = "binary";

      loader.addEventListener("progress", function (event) {
        console.info("PROGRESS");
        _this.dispatchEvent(event);
      });

      loader.addEventListener("complete", function (event) {
        _this.dispatchEvent(event);
        var soundData = _this._soundData = {
          data: loader.data.a,
          mimeType: 'audio/mpeg'
        };
        getAudioDescription(soundData, function (description) {
          _this._length = description.duration;
        });
        _this._playQueue.forEach(function (item) {
          playChannel(soundData, item.channel, item.startTime, item.soundTransform);
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
      startTime = startTime || 0;
      var channel = new flash.media.SoundChannel();
      channel._sound = this;
      this._playQueue.push({
        channel: channel,
        startTime: startTime,
        soundTransform: soundTransform
      });
      if (this._soundData) {
        playChannel(this._soundData, channel, startTime, soundTransform);
      }
      return channel;
    },

    get bytesLoaded() {
      return this._loader.bytesLoaded;
    },
    get bytesTotal() {
      return this._loader.bytesTotal;
    },
    get id3() {
      return this._id3;
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

  function playChannel(soundData, channel, startTime, soundTransform) {
    var element = channel._element;
    element.src = "data:" + soundData.mimeType + ";base64," + base64ArrayBuffer(soundData.data);
    element.addEventListener("loadeddata", function loaded() {
      element.currentTime = startTime / 1000;
      element.play();
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