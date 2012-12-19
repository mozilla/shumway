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
    }
  };

  function playChannel(buffer, channel, startTime, soundTransform) {
    channel._element.src = "data:audio/mpeg;base64," + base64ArrayBuffer(buffer);
    channel._element.play();
    channel._element.addEventListener("playing", function () {
      channel._element.currentTime = startTime / 1000;
    });
  }

  def.__glue__ = {
    native: {
      instance: {
        // (stream:URLRequest, checkPolicyFile:Boolean, bufferTime:Number) -> void
        _load: function _load(request, checkPolicyFile, bufferTime) {
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
        // (startTime:Number = 0, loops:int = 0, soundTransform:SoundTransform = null) -> SoundChannel
        play: function play(startTime, loops, soundTransform) {
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
        length: {
          get: function () {
            return this._length;
          }
        }
      }
    }
  };

  return def;
}).call(this);