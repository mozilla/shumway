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
// Class: Sound
module Shumway.AVMX.AS.flash.media {
  import axCoerceString = Shumway.AVMX.axCoerceString;
  import notImplemented = Shumway.Debug.notImplemented;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import assert = Debug.assert;
  import Telemetry = Shumway.Telemetry;

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

    _symbol: SoundSymbol;
    applySymbol() {
      release || assert(this._symbol);
      this._playQueue = [];
      this._url = null;
      this._length = 0;
      this._bytesTotal = 0;
      this._bytesLoaded = 0;
      this._id3 = new this.sec.flash.media.ID3Info();

      this._isURLInaccessible = false;
      this._isBuffering = false;

      var symbol = this._symbol;
      if (symbol) {
        var soundData = new SoundData();
        soundData.sampleRate = symbol.sampleRate;
        soundData.channels = symbol.channels;
        soundData.completed = true;
        if (symbol.pcm) {
          soundData.pcm = symbol.pcm;
          soundData.end = symbol.pcm.length;
        }
        if (symbol.packaged) {
          soundData.data = symbol.packaged.data.buffer;
          soundData.mimeType = symbol.packaged.mimeType;
        }
        var self = this;
        getAudioDescription(soundData, function (description) {
          self._length = description.duration;
        });
        this._soundData = soundData;
      }
    }

    static initializeFromPCMData(sec: ISecurityDomain, data: any): Sound {
      var sound = new sec.flash.media.Sound();
      sound._symbol = data;
      sound.applySymbol();
      return sound;
    }

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["load"];
    
    constructor (stream?: flash.net.URLRequest, context?: flash.media.SoundLoaderContext) {
      if (this._symbol) {
        this.applySymbol();
      }

      super();

      Telemetry.instance.reportTelemetry({topic: 'feature', feature: Telemetry.Feature.SOUND_FEATURE});

      this._playQueue = [];
      this._url = null;
      this._length = 0;
      this._bytesTotal = 0;
      this._bytesLoaded = 0;
      this._id3 = new this.sec.flash.media.ID3Info();

      this._isURLInaccessible = false;
      this._isBuffering = false;
      this.load(stream, context);
    }

    private _playQueue: any[];
    private _soundData: SoundData;
    private _stream: flash.net.URLStream;
    private _url: string;
    _isURLInaccessible: boolean;
    private _length: number;
    _isBuffering: boolean;
    private _bytesLoaded: number /*uint*/;
    private _bytesTotal: number /*int*/;
    private _id3: ID3Info;

    get url(): string {
      return this._url;
    }
    get isURLInaccessible(): boolean {
      release || somewhatImplemented("public flash.media.Sound::get isURLInaccessible");
      return this._isURLInaccessible;
    }
    get length(): number {
      return this._length;
    }
    get isBuffering(): boolean {
      release || somewhatImplemented("public flash.media.Sound::get isBuffering");
      return this._isBuffering;
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
      release || notImplemented("public flash.media.Sound::loadCompressedDataFromByteArray"); return;
    }
    loadPCMFromByteArray(bytes: flash.utils.ByteArray, samples: number /*uint*/, format: string = "float", stereo: boolean = true, sampleRate: number = 44100): void {
      bytes = bytes; samples = samples >>> 0; format = axCoerceString(format); stereo = !!stereo; sampleRate = +sampleRate;
      release || notImplemented("public flash.media.Sound::loadPCMFromByteArray"); return;
    }
    play(startTime: number = 0, loops: number /*int*/ = 0, sndTransform: flash.media.SoundTransform = null): flash.media.SoundChannel {
      startTime = +startTime; loops = loops | 0;
      var channel = new this.sec.flash.media.SoundChannel();
      channel._sound = this;
      channel._soundTransform = isNullOrUndefined(sndTransform) ?
                                new this.sec.flash.media.SoundTransform() :
                                sndTransform;
      this._playQueue.push({
        channel: channel,
        startTime: startTime
      });
      if (disableAudioOption.value) {
        return channel;
      }
      if (this._soundData) {
        if (!webAudioOption.value && !webAudioMP3Option.value) {
          channel._playSoundDataViaAudio(this._soundData, startTime, loops);
        } else if (!this._soundData.pcm) {
          if (this._soundData.mimeType === 'audio/mpeg' && webAudioMP3Option.value) {
            SWF.MP3DecoderSession.processAll(new Uint8Array(this._soundData.data)).then(function (result) {
              this._soundData.pcm = result.data;
              this._soundData.end = result.data.length;
              channel._playSoundDataViaChannel(this._soundData, startTime, loops);
            }.bind(this), function (reason) {
              Debug.warning('Unable to decode MP3 data: ' + reason);
            });
          } else {
            Debug.warning('Unable to decode packaged sound data of type: ' + this._soundData.mimeType);
          }
        } else {
          channel._playSoundDataViaChannel(this._soundData, startTime, loops);
        }
      }
      return channel;
    }
    close(): void {
      release || somewhatImplemented("public flash.media.Sound::close");
    }
    extract(target: flash.utils.ByteArray, length: number, startPosition: number = -1): number {
      target = target; length = +length; startPosition = +startPosition;
      release || notImplemented("public flash.media.Sound::extract"); return;
    }
    load(request: flash.net.URLRequest, context?: SoundLoaderContext): void {
      if (!request) {
        return;
      }

      var checkPolicyFile: boolean = context ? context.checkPolicyFile : false;
      var bufferTime: number = context ? context.bufferTime : 1000;

      var _this = this;
      var stream = this._stream = new this.sec.flash.net.URLStream();
      var data = new this.sec.flash.utils.ByteArray();
      var dataPosition = 0;
      var playUsingWebAudio = webAudioOption.value;
      var mp3DecodingSession = null;
      var soundData = new SoundData();
      soundData.completed = false;

      stream.addEventListener("progress", function (event) {
        _this._bytesLoaded = event.axGetPublicProperty("bytesLoaded");
        _this._bytesTotal = event.axGetPublicProperty("bytesTotal");

        if (playUsingWebAudio && !mp3DecodingSession) {
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

        if (!playUsingWebAudio) {
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

  export class SoundSymbol extends Timeline.Symbol {
    channels: number;
    sampleRate: number;
    pcm: Float32Array;
    packaged;

    constructor(data: Timeline.SymbolData, sec: ISecurityDomain) {
      super(data, sec.flash.media.Sound.axClass);
    }

    static FromData(data: any, loaderInfo: display.LoaderInfo): SoundSymbol {
      var symbol = new SoundSymbol(data, loaderInfo.sec);
      symbol.channels = data.channels;
      symbol.sampleRate = data.sampleRate;
      symbol.pcm = data.pcm;
      symbol.packaged = data.packaged;
      return symbol;
    }
  }
}
