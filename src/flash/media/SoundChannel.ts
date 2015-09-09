/**
 * Copyright 2014 Mozilla Foundation
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// Class: SoundChannel
module Shumway.AVMX.AS.flash.media {
  import assert = Shumway.Debug.assert;
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import error = Shumway.Debug.error;

  declare var URL;
  declare var Blob;
  declare class AudioContext {
    constructor();
    sampleRate: number;
    destination: any;
    createScriptProcessor(a, b, c);
  }

  function createAudioChannel(sampleRate, channels) {
    if (WebAudioChannel.isSupported) {
      return new WebAudioChannel(sampleRate, channels);
    } else {
      error('PCM data playback is not supported by the browser');
    }
  }

  // Resample sound using linear interpolation for Web Audio due to
  // http://code.google.com/p/chromium/issues/detail?id=73062
  interface AudioResamplerData {
    data: any[];
    count: number;
  }
  class AudioResampler {
    ondatarequested: (e: AudioResamplerData) => void;
    private _sourceRate: number;
    private _targetRate: number;
    private _tail: any[];
    private _sourceOffset: number;
    constructor(sourceRate: number, targetRate: number) {
      this._sourceRate = sourceRate;
      this._targetRate = targetRate;
      this._tail = [];
      this._sourceOffset = 0;
    }
    getData(channelsData, count: number) {
      var k = this._sourceRate / this._targetRate;

      var offset = this._sourceOffset;
      var needed = Math.ceil((count - 1) * k + offset) + 1;
      var sourceData = [];
      for (var channel = 0; channel < channelsData.length; channel++) {
        sourceData.push(new Float32Array(needed));
      }
      var e = { data: sourceData, count: needed };
      this.ondatarequested(e);
      for (var channel = 0; channel < channelsData.length; channel++) {
        var data = channelsData[channel];
        var source = sourceData[channel];
        for (var j = 0; j < count; j++) {
          var i = j * k + offset;
          var i1 = i | 0, i2 = Math.ceil(i) | 0;
          var source_i1 = i1 < 0 ? this._tail[channel] : source[i1];
          if (i1 === i2) {
            data[j] = source_i1;
          } else {
            var alpha = i - i1;
            data[j] = source_i1 * (1 - alpha) + source[i2] * alpha;
          }
        }
        this._tail[channel] = source[needed - 1];
      }
      this._sourceOffset = ((count - 1) * k + offset) - (needed - 1);
    }
  }

  class WebAudioChannel {
    private static _cachedContext: AudioContext;
    private _contextSampleRate: number;
    private _context: AudioContext;
    private _resampler: AudioResampler;
    private _channels: number;
    private _sampleRate: number;
    private _source;
    ondatarequested: (e) => void;

    constructor(sampleRate, channels) {
      var context = WebAudioChannel._cachedContext;
      if (!context) {
        context = new AudioContext();
        WebAudioChannel._cachedContext = context;
      }
      this._context = context;
      this._contextSampleRate = context.sampleRate || 44100;

      this._channels = channels;
      this._sampleRate = sampleRate;
      if (this._contextSampleRate !== sampleRate) {
        this._resampler = new AudioResampler(sampleRate, this._contextSampleRate);
        this._resampler.ondatarequested = function (e: AudioResamplerData) {
          this.requestData(e.data, e.count);
        }.bind(this);
      }
    }

    setVolume(value: number) {
      // TODO set volume on this._source via gain node
    }

    start() {
      var source = this._context.createScriptProcessor(2048, 0, this._channels);
      var self = this;
      source.onaudioprocess = function(e) {
        var channelsData = [];
        for (var i = 0; i < self._channels; i++) {
          channelsData.push(e.outputBuffer.getChannelData(i));
        }
        var count = channelsData[0].length;
        if (self._resampler) {
          self._resampler.getData(channelsData, count);
        } else {
          self.requestData(channelsData, count);
        }
      };

      source.connect(this._context.destination);
      this._source = source;
    }
    stop() {
      this._source.disconnect(this._context.destination);
    }
    requestData(channelsData: any[], count: number) {
      var channels = this._channels;
      var buffer = new Float32Array(count * channels);
      var e = { data: buffer, count: buffer.length };
      this.ondatarequested(e);

      for (var j = 0, p = 0; j < count; j++) {
        for (var i = 0; i < channels; i++) {
          channelsData[i][j] = buffer[p++];
        }
      }
    }
    static isSupported() {
      return typeof AudioContext !== 'undefined';
    }
  }

  export class SoundChannel extends flash.events.EventDispatcher implements ISoundSource {
    
    static classInitializer: any = null;

    _symbol: SoundChannel;
    
    constructor () {
      super();

      this._element = null;
      this._position = 0;
      this._leftPeak = 0;
      this._rightPeak = 0;
      this._pcmData = null;
      this._soundTransform = new this.sec.flash.media.SoundTransform();
      this._playing = false;
      this._element = null;
    }

    static initializeFromAudioElement(sec: ISecurityDomain, element: HTMLAudioElement): SoundChannel {
      var channel = new sec.flash.media.SoundChannel();
      channel._element = element;
      SoundMixer._registerSoundSource(channel);
      return channel;
    }

    _element;
    _sound: flash.media.Sound;
    private _audioChannel;
    private _pcmData;
    private _playing: boolean;

    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    
    private _position: number;
    _soundTransform: flash.media.SoundTransform;
    private _leftPeak: number;
    private _rightPeak: number;
    get position(): number {
      return this._position;
    }
    get soundTransform(): flash.media.SoundTransform {
      return this._soundTransform;
    }
    set soundTransform(sndTransform: flash.media.SoundTransform) {
      release || somewhatImplemented("public flash.media.SoundChannel::set soundTransform");
      this._soundTransform = isNullOrUndefined(sndTransform) ?
                             new this.sec.flash.media.SoundTransform() :
                             sndTransform;
      SoundMixer._updateSoundSource(this);
    }
    get leftPeak(): number {
      return this._leftPeak;
    }
    get rightPeak(): number {
      return this._rightPeak;
    }
    get playing(): boolean {
      return this._playing;
    }
    stop(): void {
      if (this._element) {
        SoundMixer._unregisterSoundSource(this);

        this._element.loop = false;
        this._element.pause();
        this._element.removeAttribute('src');
        this._playing = false;
      }
      if (this._audioChannel) {
        SoundMixer._unregisterSoundSource(this);

        this._audioChannel.stop();
        this._playing = false;
      }
    }
    _playSoundDataViaAudio(soundData, startTime, loops) {
      if (!soundData.mimeType) {
        return;
      }

      SoundMixer._registerSoundSource(this);

      this._position = startTime;
      var self = this;
      var lastCurrentTime = 0;
      var element = document.createElement('audio');
      if (!element.canPlayType(soundData.mimeType)) {
        console.error('ERROR: \"' + soundData.mimeType + '\" ' +
          'type playback is not supported by the browser');
        return;
      }
      element.preload = 'metadata'; // for mobile devices
      element.loop = loops > 0; // starts loop played if at least one is specified
      var blob = new Blob([soundData.data], {type: soundData.mimeType});
      element.src = URL.createObjectURL(blob);
      element.addEventListener("loadeddata", function loaded() {
        element.currentTime = startTime / 1000;
        element.play();
      });
      element.addEventListener("timeupdate", function timeupdate() {
        var currentTime = element.currentTime;
        if (loops && lastCurrentTime > currentTime) {
          --loops;
          if (!loops) { // checks if we need to stop looping
            element.loop = false;
          }
          if (currentTime < startTime / 1000) {
            element.currentTime = startTime / 1000;
          }
        }
        self._position = (lastCurrentTime = currentTime) * 1000;
      });
      element.addEventListener("ended", function ended() {
        SoundMixer._unregisterSoundSource(self);

        self._element = null;
        self._playing = false;
        self.dispatchEvent(new self.sec.flash.events.Event("soundComplete", false,
                                                                      false));
      });
      this._element = element;
      this._playing = true;

      SoundMixer._updateSoundSource(this);
    }
    _playSoundDataViaChannel(soundData, startTime, loops) {
      release || assert(soundData.pcm, 'no pcm data found');

      SoundMixer._registerSoundSource(this);

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
          SoundMixer._unregisterSoundSource(this);

          self._audioChannel.stop();
          self._playing = false;
          self.dispatchEvent(new self.sec.flash.events.Event("soundComplete", false,
                                                                        false));
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
            if (!loops) {
              break;
            }
            loops--;
            position = startPosition;
          }
        } while (left > 0);

        self._position = position / soundData.sampleRate / soundData.channels * 1000;
      };
      this._audioChannel.start();
      this._playing = true;

      SoundMixer._updateSoundSource(this);
    }
    stopSound() {
      this.stop();
    }
    updateSoundLevels(volume: number) {
      if (this._element) {
        this._element.volume = volume <= 0 ? 0 : volume >= 1.0 ? 1.0 : volume;
      }
      if (this._audioChannel) {
        this._audioChannel.setVolume(volume);
      }
    }
  }
}
