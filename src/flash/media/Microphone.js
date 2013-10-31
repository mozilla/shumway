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

var MicrophoneDefinition = (function () {
  return {
    // ()
    __class__: "flash.media.Microphone",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
          getMicrophone: function getMicrophone(index) { // (index:int = -1) -> Microphone
            notImplemented("Microphone.getMicrophone");
          },
          getEnhancedMicrophone: function getEnhancedMicrophone(index) { // (index:int = -1) -> Microphone
            notImplemented("Microphone.getEnhancedMicrophone");
          },
          names: {
            get: function names() { // (void) -> Array
              notImplemented("Microphone.names");
            }
          },
          isSupported: {
            get: function isSupported() { // (void) -> Boolean
              notImplemented("Microphone.isSupported");
            }
          }
        },
        instance: {
          setSilenceLevel: function setSilenceLevel(silenceLevel, timeout) { // (silenceLevel:Number, timeout:int = -1) -> void
            notImplemented("Microphone.setSilenceLevel");
          },
          setUseEchoSuppression: function setUseEchoSuppression(useEchoSuppression) { // (useEchoSuppression:Boolean) -> void
            notImplemented("Microphone.setUseEchoSuppression");
          },
          setLoopBack: function setLoopBack(state) { // (state:Boolean = true) -> void
            notImplemented("Microphone.setLoopBack");
          },
          gain: {
            set: function gain(gain) { // (gain:Number) -> void
              notImplemented("Microphone.gain");
              this._gain = gain;
            },
            get: function gain() { // (void) -> Number
              notImplemented("Microphone.gain");
              return this._gain;
            }
          },
          rate: {
            set: function rate(rate) { // (rate:int) -> void
              notImplemented("Microphone.rate");
              this._rate = rate;
            },
            get: function rate() { // (void) -> int
              notImplemented("Microphone.rate");
              return this._rate;
            }
          },
          codec: {
            set: function codec(codec) { // (codec:String) -> void
              notImplemented("Microphone.codec");
              this._codec = codec;
            },
            get: function codec() { // (void) -> String
              notImplemented("Microphone.codec");
              return this._codec;
            }
          },
          framesPerPacket: {
            get: function framesPerPacket() { // (void) -> int
              notImplemented("Microphone.framesPerPacket");
              return this._framesPerPacket;
            },
            set: function framesPerPacket(frames) { // (frames:int) -> void
              notImplemented("Microphone.framesPerPacket");
              this._framesPerPacket = frames;
            }
          },
          encodeQuality: {
            get: function encodeQuality() { // (void) -> int
              notImplemented("Microphone.encodeQuality");
              return this._encodeQuality;
            },
            set: function encodeQuality(quality) { // (quality:int) -> void
              notImplemented("Microphone.encodeQuality");
              this._encodeQuality = quality;
            }
          },
          noiseSuppressionLevel: {
            get: function noiseSuppressionLevel() { // (void) -> int
              notImplemented("Microphone.noiseSuppressionLevel");
              return this._noiseSuppressionLevel;
            },
            set: function noiseSuppressionLevel(level) { // (level:int) -> void
              notImplemented("Microphone.noiseSuppressionLevel");
              this._noiseSuppressionLevel = level;
            }
          },
          enableVAD: {
            get: function enableVAD() { // (void) -> Boolean
              notImplemented("Microphone.enableVAD");
              return this._enableVAD;
            },
            set: function enableVAD(enable) { // (enable:Boolean) -> void
              notImplemented("Microphone.enableVAD");
              this._enableVAD = enable;
            }
          },
          activityLevel: {
            get: function activityLevel() { // (void) -> Number
              notImplemented("Microphone.activityLevel");
              return this._activityLevel;
            }
          },
          index: {
            get: function index() { // (void) -> int
              notImplemented("Microphone.index");
              return this._index;
            }
          },
          muted: {
            get: function muted() { // (void) -> Boolean
              notImplemented("Microphone.muted");
              return this._muted;
            }
          },
          name: {
            get: function name() { // (void) -> String
              notImplemented("Microphone.name");
              return this._name;
            }
          },
          silenceLevel: {
            get: function silenceLevel() { // (void) -> Number
              notImplemented("Microphone.silenceLevel");
              return this._silenceLevel;
            }
          },
          silenceTimeout: {
            get: function silenceTimeout() { // (void) -> int
              notImplemented("Microphone.silenceTimeout");
              return this._silenceTimeout;
            }
          },
          useEchoSuppression: {
            get: function useEchoSuppression() { // (void) -> Boolean
              notImplemented("Microphone.useEchoSuppression");
              return this._useEchoSuppression;
            }
          },
          soundTransform: {
            get: function soundTransform() { // (void) -> SoundTransform
              notImplemented("Microphone.soundTransform");
              return this._soundTransform;
            },
            set: function soundTransform(sndTransform) { // (sndTransform:SoundTransform) -> void
              notImplemented("Microphone.soundTransform");
              this._soundTransform = sndTransform;
            }
          },
          enhancedOptions: {
            get: function enhancedOptions() { // (void) -> MicrophoneEnhancedOptions
              notImplemented("Microphone.enhancedOptions");
              return this._enhancedOptions;
            },
            set: function enhancedOptions(options) { // (options:MicrophoneEnhancedOptions) -> void
              notImplemented("Microphone.enhancedOptions");
              this._enhancedOptions = options;
            }
          }
        }
      },
      script: {
        instance: Glue.ALL
      }
    }
  };
}).call(this);
