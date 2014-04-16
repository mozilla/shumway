/**
 * Copyright 2013 Mozilla Foundation
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
// Class: Sound
module Shumway.AVM2.AS.flash.media {
  import notImplemented = Shumway.Debug.notImplemented;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import Telemetry = Shumway.Telemetry;
  import ID3Info = Shumway.AVM2.AS.flash.media.ID3Info;

  var PLAY_USING_AUDIO_TAG = true;

  declare var Blob;
  declare var URL;
  declare var decodeMP3;

  function getAudioDescription(soundData, onComplete) {
    var audioElement = document.createElement('audio');
    if (!audioElement.canPlayType(soundData.mimeType)) {
      onComplete({
        duration: 0
      });
      return;
    }
    audioElement.preload = 'metadata'; // for mobile devices
    var blob = new Blob([soundData.data], {type: soundData.mimeType});
    audioElement.src = URL.createObjectURL(blob);
    audioElement.load();
    audioElement.addEventListener("loadedmetadata", function () {
      onComplete({
        duration: this.duration * 1000
      });
    });
  }

  class SoundData {
    sampleRate: number;
    channels: number;
    pcm: any;
    end: number;
    completed: boolean;
    data: any;
    mimeType: string;
  }

  export class Sound extends flash.events.EventDispatcher {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = function (symbol1: Sound) {
      notImplemented("public flash.media.Sound::initializer");
      var symbol: any = symbol1;
      var soundData = new SoundData();
      if (symbol.pcm) {
        soundData.sampleRate = symbol.sampleRate;
        soundData.channels = symbol.channels;
        soundData.pcm = symbol.pcm;
        soundData.end = symbol.pcm.length;
      }
      soundData.completed = true;
      if (symbol.packaged) {
        soundData.data = symbol.packaged.data.buffer;
        soundData.mimeType = symbol.packaged.mimeType;
      }
      var _this = this;
      getAudioDescription(soundData, function (description) {
        _this._length = description.duration;
      });
      this._soundData = soundData;
    };
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["load"];
    
    constructor (stream: flash.net.URLRequest = null, context: flash.media.SoundLoaderContext = null) {
      false && super(undefined);
      this._playQueue = [];
      this._url = null;
      this._length = 0;
      this._bytesTotal = 0;
      this._bytesLoaded = 0;
      this._id3 = new ID3Info();

      Telemetry.reportTelemetry({topic: 'feature', feature: Telemetry.Feature.SOUND_FEATURE});
    }

    private _playQueue: any[];
    private _soundData: SoundData;
    private _stream: flash.net.URLStream;

    // JS -> AS Bindings
    
    load: (stream: flash.net.URLRequest, context: flash.media.SoundLoaderContext = null) => void;
    
    // AS -> JS Bindings
    
    private _url: string;
    // _isURLInaccessible: boolean;
    private _length: number;
    // _isBuffering: boolean;
    private _bytesLoaded: number /*uint*/;
    private _bytesTotal: number /*int*/;
    private _id3: ID3Info;
    get url(): string {
      return this._url;
    }
    get isURLInaccessible(): boolean {
      notImplemented("public flash.media.Sound::get isURLInaccessible"); return;
      // return this._isURLInaccessible;
    }
    get length(): number {
      return this._length;
    }
    get isBuffering(): boolean {
      notImplemented("public flash.media.Sound::get isBuffering"); return;
      // return this._isBuffering;
    }
    get bytesLoaded(): number /*uint*/ {
      return this._bytesLoaded;
    }
    get bytesTotal(): number /*int*/ {
      return this._bytesTotal;
    }
    get id3(): flash.media.ID3Info {
      return this._id3;
    }
    loadCompressedDataFromByteArray(bytes: flash.utils.ByteArray, bytesLength: number /*uint*/): void {
      bytes = bytes; bytesLength = bytesLength >>> 0;
      notImplemented("public flash.media.Sound::loadCompressedDataFromByteArray"); return;
    }
    loadPCMFromByteArray(bytes: flash.utils.ByteArray, samples: number /*uint*/, format: string = "float", stereo: boolean = true, sampleRate: number = 44100): void {
      bytes = bytes; samples = samples >>> 0; format = "" + format; stereo = !!stereo; sampleRate = +sampleRate;
      notImplemented("public flash.media.Sound::loadPCMFromByteArray"); return;
    }
    play(startTime: number = 0, loops: number /*int*/ = 0, sndTransform: flash.media.SoundTransform = null): flash.media.SoundChannel {
      startTime = +startTime; loops = loops | 0;
      var channel = new flash.media.SoundChannel();
      channel._sound = this;
      channel._soundTransform = isNullOrUndefined(sndTransform) ?
        new flash.media.SoundTransform() : sndTransform;
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
    }
    close(): void {
      somewhatImplemented("public flash.media.Sound::close");
    }
    extract(target: flash.utils.ByteArray, length: number, startPosition: number = -1): number {
      target = target; length = +length; startPosition = +startPosition;
      notImplemented("public flash.media.Sound::extract"); return;
    }
    _load(request: flash.net.URLRequest, checkPolicyFile: boolean, bufferTime: number): void {
      checkPolicyFile = !!checkPolicyFile; bufferTime = +bufferTime;
      if (!request) {
        return;
      }

      var _this = this;
      var stream = this._stream = new flash.net.URLStream();
      var data = new flash.utils.ByteArray();
      var dataPosition = 0;
      var mp3DecodingSession = null;
      var soundData = new SoundData();
      soundData.completed = false;

      stream.addEventListener("progress", function (event) {
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
          mp3DecodingSession.pushData(new Uint8Array((<any> data)._buffer, dataPosition, bytesAvailable));
        }
        dataPosition += bytesAvailable;

        _this.dispatchEvent(event);
      });

      stream.addEventListener("complete", function (event) {
        _this.dispatchEvent(event);
        soundData.data = (<any> data)._buffer;
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
    }
  }
}
