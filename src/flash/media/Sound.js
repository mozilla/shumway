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
/*global Multiname, MP3DecoderSession, base64ArrayBuffer */

var PLAY_USING_AUDIO_TAG = true;

var SoundDefinition = (function () {

  var audioElement = null;

  function getAudioDescription(soundData, onComplete) {
    audioElement = audioElement || document.createElement('audio');
    if (!audioElement.canPlayType(soundData.mimeType)) {
      onComplete({
        duration: 0
      });
      return;
    }
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
      if (s) {
        var soundData = {};
        if (s.pcm) {
          soundData.sampleRate = s.sampleRate;
          soundData.channels = s.channels;
          soundData.pcm = s.pcm;
          soundData.end = s.pcm.length;
        }
        soundData.completed = true;
        if (s.packaged) {
          soundData.data = s.packaged.data.buffer;
          soundData.mimeType = s.packaged.mimeType;
        }
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
      var stream = this._stream = new flash.net.URLStream();
      var ByteArrayClass = avm2.systemDomain.getClass("flash.utils.ByteArray");
      var data = ByteArrayClass.createInstance();
      var dataPosition = 0;
      var mp3DecodingSession = null;
      var soundData = { completed: false };

      stream._addEventListener("progress", function (event) {
        _this._bytesLoaded = event[Multiname.getPublicQualifiedName("bytesLoaded")];
        _this._bytesTotal = event[Multiname.getPublicQualifiedName("bytesTotal")];

        if (!PLAY_USING_AUDIO_TAG && !mp3DecodingSession) {
          // initialize MP3 decoding
          mp3DecodingSession = decodeMP3(soundData, function (duration, final) {
            if (_this._length === 0) {
              // once we have some data, trying to play it
              _this._soundData = soundData;

              _this._playQueue.forEach(function (item) {
                item.channel._playSoundDataViaChannel(soundData, item.startTime);
              });
            }
            // estimate duration based on bytesTotal and current loaded data time
            _this._length = final ? duration * 1000 : Math.max(duration,
              mp3DecodingSession.estimateDuration(_this._bytesTotal)) * 1000;
          });
        }

        var bytesAvailable = stream.bytesAvailable;
        stream.readBytes(data, dataPosition, bytesAvailable);
        if (mp3DecodingSession) {
          mp3DecodingSession.pushData(new Uint8Array(data.a, dataPosition, bytesAvailable));
        }
        dataPosition += bytesAvailable;

        _this._dispatchEvent(event);
      });

      stream._addEventListener("complete", function (event) {
        _this._dispatchEvent(event);
        soundData.data = data.a;
        soundData.mimeType = 'audio/mpeg';
        soundData.completed = true;

        if (PLAY_USING_AUDIO_TAG) {
          _this._soundData = soundData;

          getAudioDescription(soundData, function (description) {
            _this._length = description.duration;
          });

          _this._playQueue.forEach(function (item) {
            item.channel._playSoundDataViaAudio(soundData, item.startTime);
          });
        }

        if (mp3DecodingSession) {
          mp3DecodingSession.close();
        }
      });

      stream.load(request);
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
      loops = loops || 0;
      var channel = new flash.media.SoundChannel();
      channel._sound = this;
      channel._soundTransform = soundTransform;
      this._playQueue.push({
        channel: channel,
        startTime: startTime
      });
      if (this._soundData) {
        if (PLAY_USING_AUDIO_TAG)
          channel._playSoundDataViaAudio(this._soundData, startTime, loops);
        else
          channel._playSoundDataViaChannel(this._soundData, startTime, loops);
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

  // TODO send to MP3 decoding worker
  function decodeMP3(soundData, ondurationchanged) {
    var currentSize = 8000;
    var pcm = new Float32Array(currentSize);
    var position = 0;
    var lastTimeRatio = 0;
    var durationEstimationData = {
      estimateBitRate: true,
      bitRateSum: 0,
      bitRateCount: 0,
      metadataSize: 0,
      averageBitRate: 0
    };

    var mp3DecoderSession = new MP3DecoderSession();
    mp3DecoderSession.onframedata = function (frame, channels, sampleRate, bitRate) {
      if (durationEstimationData.estimateBitRate) {
        var FramesToEstimate = 200;
        if (durationEstimationData.bitRateCount < FramesToEstimate) {
          durationEstimationData.bitRateSum += bitRate;
          durationEstimationData.bitRateCount++;
        } else {
          durationEstimationData.estimateBitRate = false;
        }
        this.averageBitRate = durationEstimationData.bitRateSum /
                              durationEstimationData.bitRateCount;
      }

      if (frame.length === 0)
        return;
      if (!position) {
        // first data: initializes pcm data fields
        soundData.sampleRate = sampleRate,
        soundData.channels = channels;
        soundData.pcm = pcm;
      }
      if (position + frame.length >= currentSize) {
        do {
          currentSize *= 2;
        } while (position + frame.length >= currentSize);
        var newPcm = new Float32Array(currentSize);
        newPcm.set(pcm);
        pcm = soundData.pcm = newPcm;
      }
      pcm.set(frame, position);
      soundData.end = position += frame.length;

      lastTimeRatio = 1 / soundData.sampleRate / soundData.channels;
      ondurationchanged(position * lastTimeRatio, false);
    };
    mp3DecoderSession.onid3tag = function (data) {
      durationEstimationData.metadataSize += data.length;
    },
    mp3DecoderSession.onclosed = function () {
      ondurationchanged(position * lastTimeRatio, true);
    };
    var completed = false;
    return  {
      pushData: function (data) {
        mp3DecoderSession.pushAsync(data);
      },
      estimateDuration: function (fileSize) {
        return Math.max(0, (fileSize - durationEstimationData.metadataSize) * 8 /
                           durationEstimationData.averageBitRate);
      },
      close: function () {
        mp3DecoderSession.close();
      }
    };
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
