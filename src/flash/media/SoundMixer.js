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

var SoundMixerDefinition = (function () {
  var registeredChannels = [];
  return {
    // ()
    __class__: "flash.media.SoundMixer",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
          _registerChannel: function _registerChannel(channel) {
            registeredChannels.push(channel);
          },
          _unregisterChannel: function _unregisterChannel(channel) {
            var index = registeredChannels.indexOf(channel);
            if (index >= 0)
              registeredChannels.splice(index, 1);
          },
          stopAll: function stopAll() {
            registeredChannels.forEach(function (channel) {
              channel.stop();
            });
            registeredChannels = [];
          },
          computeSpectrum: function computeSpectrum(outputArray, FFTMode, stretchFactor) { // (outputArray:ByteArray, FFTMode:Boolean = false, stretchFactor:int = 0) -> void
            somewhatImplemented("SoundMixer.computeSpectrum");
            var data = new Float32Array(1024);
            for (var i = 0; i < 1024; i++) {
              data[i] = Math.random();
            }
            outputArray.writeRawBytes(data);
            outputArray.position = 0;
          },
          areSoundsInaccessible: function areSoundsInaccessible() { // (void) -> Boolean
            notImplemented("SoundMixer.areSoundsInaccessible");
          },
          bufferTime: {
            get: function bufferTime() { // (void) -> int
              notImplemented("SoundMixer.bufferTime");
            },
            set: function bufferTime(pA) { // (pA:int) -> void
              notImplemented("SoundMixer.bufferTime");
            }
          },
          soundTransform: {
            get: function soundTransform() { // (void) -> SoundTransform
              notImplemented("SoundMixer.soundTransform");
            },
            set: function soundTransform(pA) { // (pA:SoundTransform) -> void
              notImplemented("SoundMixer.soundTransform");
            }
          },
          audioPlaybackMode: {
            get: function audioPlaybackMode() { // (void) -> String
              notImplemented("SoundMixer.audioPlaybackMode");
            },
            set: function audioPlaybackMode(pA) { // (pA:String) -> void
              notImplemented("SoundMixer.audioPlaybackMode");
            }
          },
          useSpeakerphoneForVoice: {
            get: function useSpeakerphoneForVoice() { // (void) -> Boolean
              notImplemented("SoundMixer.useSpeakerphoneForVoice");
            },
            set: function useSpeakerphoneForVoice(pA) { // (pA:Boolean) -> void
              notImplemented("SoundMixer.useSpeakerphoneForVoice");
            }
          }
        },
        instance: {
        }
      }
    }
  };
}).call(this);