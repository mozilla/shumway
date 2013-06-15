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
/*global base64ArrayBuffer, AudioContext, webkitAudioContext, Audio */

var SoundChannelDefinition = (function () {
  return {
    // ()
    initialize: function () {
      this._element = null;
      this._position = 0;
      this._leftPeak = 0;
      this._rightPeak = 0;
      this._pcmData = null;
      this._soundTransform = null;
    },
    _registerWithSoundMixer: function () {
      var soundMixerClass = avm2.systemDomain.getClass("flash.media.SoundMixer");
      soundMixerClass.native.static._registerChannel(this);
    },
    _unregisterWithSoundMixer: function () {
      var soundMixerClass = avm2.systemDomain.getClass("flash.media.SoundMixer");
      soundMixerClass.native.static._unregisterChannel(this);
    },
    _playSoundDataViaChannel: function (soundData, startTime, loops) {
      assert(soundData.pcm, 'no pcm data found');

      this._registerWithSoundMixer();
      var self = this;
      var startPosition = Math.round(startTime / 1000 * soundData.sampleRate) *
                          soundData.channels;
      var position = startPosition;
      this._position = startTime;
      this._audioChannel = createAudioChannel(soundData.sampleRate, soundData.channels);
      this._audioChannel.ondatarequested = function (e) {
        var end = soundData.end;
        if (position >= end && soundData.completed) {
          // end of buffer
          self._unregisterWithSoundMixer();
          self._audioChannel.stop();
          self._dispatchEvent(new flash.events.Event("soundComplete", false, false));
          return;
        }

        var left = e.count;
        var data = e.data;
        var source = soundData.pcm;
        do {
          var count = Math.min(end - position, left);
          for (var j = 0; j < count; j++) {
            data[j] = source[position++];
          }
          left -= count;
          if (position >= end) {
            if (!loops) break;
            loops--;
            position = startPosition;
          }
        } while (left > 0);

        self._position = position / soundData.sampleRate / soundData.channels * 1000;
      };
      this._audioChannel.start();
    },
    _playSoundDataViaAudio: function (soundData, startTime, loops) {
      if (!soundData.mimeType)
        return;

      this._registerWithSoundMixer();
      this._position = startTime;
      var self = this;
      var lastCurrentTime = 0;
      var element = document.createElement('audio');
      if (!element.canPlayType(soundData.mimeType)) {
        console.error('ERROR: \"' + soundData.mimeType +'\" ' +
                    'type playback is not supported by the browser');
        return;
      }
      element.preload = 'metadata'; // for mobile devices
      element.loop = loops > 0; // starts loop played if at least one is specified
      element.src = "data:" + soundData.mimeType + ";base64," + base64ArrayBuffer(soundData.data);
      element.addEventListener("loadeddata", function loaded() {
        element.currentTime = startTime / 1000;
        element.play();
      });
      element.addEventListener("timeupdate", function timeupdate() {
        var currentTime = element.currentTime;
        if (loops && lastCurrentTime > currentTime) {
          --loops;
          if (!loops) // checks if we need to stop looping
            element.loop = false;
          if (currentTime < startTime / 1000)
            element.currentTime = startTime / 1000;
        }
        self._position = (lastCurrentTime = currentTime) * 1000;
      });
      element.addEventListener("ended", function ended() {
        self._unregisterWithSoundMixer();
        self._dispatchEvent(new flash.events.Event("soundComplete", false, false));
      });
      this._element = element;
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
          // (void) -> void
          stop: function stop() {
            if (this._element) {
              this._unregisterWithSoundMixer();
              this._element.pause();
            }
            if (this._audioChannel) {
              this._unregisterWithSoundMixer();
              this._audioChannel.stop();
            }
          },
          "position": {
            // (void) -> Number
            get: function position() {
              return this._position;
            }
          },
          "leftPeak": {
            // (void) -> Number
            get: function leftPeak() {
              return this._leftPeak;
            }
          },
          "rightPeak": {
            // (void) -> Number
            get: function rightPeak() {
              return this.rightPeak;
            }
          },
          "soundTransform": {
            get: function soundTransform() {
              return this._soundTransform;
            },
            set: function soundTransform(val) {
              this._soundTransform = val;
            }
          }
        }
      },
      script: {
        instance: scriptProperties("public", [
          "stop"
        ])
      }
    }
  };
}).call(this);

function createAudioChannel(sampleRate, channels) {
  if (WebAudioChannel.isSupported)
    return new WebAudioChannel(sampleRate, channels);
  else if (AudioDataChannel.isSupported)
    return new AudioDataChannel(sampleRate, channels);
  else
    error('PCM data playback is not supported by the browser');
}

// Resample sound using linear interpolation for Web Audio due to
// http://code.google.com/p/chromium/issues/detail?id=73062
function AudioResampler(sourceRate, targetRate) {
  this.sourceRate = sourceRate;
  this.targetRate = targetRate;
  this.tail = [];
  this.sourceOffset = 0;
}
AudioResampler.prototype = {
  ondatarequested: function (e) { },
  getData: function (channelsData, count) {
    var k = this.sourceRate / this.targetRate;

    var offset = this.sourceOffset;
    var needed = Math.ceil((count - 1) * k + offset) + 1;
    var sourceData = [];
    for (var channel = 0; channel < channelsData.length; channel++)
      sourceData.push(new Float32Array(needed));
    var e = { data: sourceData, count: needed };
    this.ondatarequested(e);
    for (var channel = 0; channel < channelsData.length; channel++) {
      var data = channelsData[channel];
      var source = sourceData[channel];
      for (var j = 0; j < count; j++) {
        var i = j * k + offset;
        var i1 = Math.floor(i), i2 = Math.ceil(i);
        var source_i1 = i1 < 0 ? this.tail[channel] : source[i1];
        if (i1 === i2) {
          data[j] = source_i1;
        } else {
          var alpha = i - i1;
          data[j] = source_i1 * (1 - alpha) + source[i2] * alpha;
        }
      }
      this.tail[channel] = source[needed - 1];
    }
    this.sourceOffset = ((count - 1) * k + offset) - (needed - 1);
  }
};

function WebAudioChannel(sampleRate, channels) {
  var context = WebAudioChannel.context;
  if (!context) {
    if (typeof AudioContext !== 'undefined')
      context = new AudioContext();
    else
      context = new webkitAudioContext();
    WebAudioChannel.context = context;
  }
  this.context = context;
  this.contextSampleRate = context.sampleRate || 44100;

  this.channels = channels;
  this.sampleRate = sampleRate;
  if (this.contextSampleRate != sampleRate) {
    this.resampler = new AudioResampler(sampleRate, this.contextSampleRate);
    this.resampler.ondatarequested = function (e) {
      this.requestData(e.data, e.count);
    }.bind(this);
  }
}
WebAudioChannel.prototype = {
  start: function () {
    var source = this.context.createScriptProcessor ?
      this.context.createScriptProcessor(2048, 0, this.channels) :
      this.context.createJavaScriptNode(2048, 0, this.channels);
    var self = this;
    source.onaudioprocess = function(e) {
      var channelsData = [];
      for (var i = 0; i < self.channels; i++)
        channelsData.push(e.outputBuffer.getChannelData(i));
      var count = channelsData[0].length;
      if (self.resampler) {
        self.resampler.getData(channelsData, count);
      } else {
        var e = { data: channelsData, count: count };
        self.requestData(channelsData, count);
      }
    };

    source.connect(this.context.destination);
    this.source = source;
  },
  stop: function () {
    this.source.disconnect(this.context.destination);
  },
  requestData: function (channelsData, count) {
    var channels = this.channels;
    var buffer = new Float32Array(count * channels);
    var e = { data: buffer, count: buffer.length };
    this.ondatarequested(e);

    for (var j = 0, p = 0; j < count; j++) {
      for (var i = 0; i < channels; i++)
        channelsData[i][j] = buffer[p++];
    }
  }
};
WebAudioChannel.isSupported = (function() {
  return typeof AudioContext !== 'undefined' ||
         typeof webkitAudioContext != 'undefined';
})();

// from https://wiki.mozilla.org/Audio_Data_API
function AudioDataChannel(sampleRate, channels) {
  this.sampleRate = sampleRate;
  this.channels = channels;
}
AudioDataChannel.prototype = {
  start: function () {
    var sampleRate = this.sampleRate;
    var channels = this.channels;
    var self = this;

    // Initialize the audio output.
    var audio = new Audio();
    audio.mozSetup(channels, sampleRate);

    var currentWritePosition = 0;
    var prebufferSize = sampleRate * channels / 2; // buffer 500ms
    var tail = null, tailPosition;

    // The function called with regular interval to populate
    // the audio output buffer.
    this.interval = setInterval(function() {
      var written;
      // Check if some data was not written in previous attempts.
      if(tail) {
        written = audio.mozWriteAudio(tail.subarray(tailPosition));
        currentWritePosition += written;
        tailPosition += written;
        if(tailPosition < tail.length) {
          // Not all the data was written, saving the tail...
          return; // ... and exit the function.
        }
        tail = null;
      }

      // Check if we need add some data to the audio output.
      var currentPosition = audio.mozCurrentSampleOffset();
      var available = currentPosition + prebufferSize - currentWritePosition;
      available -= available % channels; // align to channels count
      if(available > 0) {
        // Request some sound data from the callback function.
        var soundData = new Float32Array(available);
        self.requestData(soundData, available);

        // Writting the data.
        written = audio.mozWriteAudio(soundData);
        if(written < soundData.length) {
          // Not all the data was written, saving the tail.
          tail = soundData;
          tailPosition = written;
        }
        currentWritePosition += written;
      }
    }, 100);
  },
  stop: function () {
    clearInterval(this.interval);
  },
  requestData: function (data, count) {
    this.ondatarequested({data: data, count: count});
  }
};
AudioDataChannel.isSupported = (function () {
  return 'mozSetup' in (new Audio());
})();
