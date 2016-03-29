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
// Class: MovieClip
module Shumway.AVMX.AS.flash.display {
  import MP3DecoderSession = SWF.MP3DecoderSession;
  import DecodedSound = SWF.Parser.DecodedSound;

  var MP3_MIME_TYPE = 'audio/mpeg';

  interface ISoundStreamAdapter {
    currentTime: number;
    paused: boolean;
    isReady: boolean;

    playFrom(time: number);
    queueData(frame: DecodedSound);
    finish();
  }

  class HTMLAudioElementAdapter implements ISoundStreamAdapter {
    private _sec: ISecurityDomain;
    private _element: HTMLAudioElement;
    private _channel: media.SoundChannel;

    get isReady(): boolean {
      return !!this._channel;
    }

    get element(): HTMLAudioElement {
      return this._element;
    }

    get currentTime(): number {
      return this._element.currentTime;
    }

    playFrom(time: number) {
      var element = this._element;
      if (element.paused) {
        element.play();
        element.addEventListener('playing', function setTime(e) {
          element.removeEventListener('playing', setTime);
          element.currentTime = time;
        });
      } else {
        element.currentTime = time;
      }
    }

    get paused(): boolean {
      return this._element.paused;
    }

    set paused(value: boolean) {
      var element = this._element;
      if (value) {
        if (!element.paused) {
          element.pause();
        }
      } else {
        if (element.paused) {
          element.play();
        }
      }
    }

    constructor(sec: ISecurityDomain, element: HTMLAudioElement) {
      this._sec = sec;
      this._element = element;
    }

    createChannel() {
      this._channel = flash.media.SoundChannel.initializeFromAudioElement(this._sec, this._element);
    }

    queueData(frame: DecodedSound) {
      Debug.abstractMethod('HTMLAudioElementAdapter::queueData');
    }

    finish() {
      Debug.abstractMethod('HTMLAudioElementAdapter::finish');
    }
  }

  class MediaSourceStreamAdapter extends HTMLAudioElementAdapter {
    private _mediaSource: MediaSource;
    private _sourceBuffer: SourceBuffer;
    private _updating: boolean;
    private _loading: boolean;
    private _rawFrames: any[];
    private _isReady: boolean;

    constructor(sec: ISecurityDomain, element: HTMLAudioElement) {
      super(sec, element);
      this._mediaSource = new MediaSource();
      this._sourceBuffer = null;
      this._updating = false;
      this._loading = true;
      this._rawFrames = [];
      this._isReady = false;

      this._mediaSource.addEventListener('sourceopen', this._openMediaSource.bind(this));
      this.element.src = URL.createObjectURL(this._mediaSource);
    }

    private _appendSoundData() {
      if (this._rawFrames.length === 0 || this._updating || !this._sourceBuffer) {
        return;
      }
      if (!this._loading) {
        this._mediaSource.endOfStream();
        return;
      }

      this._updating = true;
      // There is an issue when multiple appendBuffers are added in a sequence,
      // pushing frames one-by-one.
      this._sourceBuffer.appendBuffer(this._rawFrames.shift());

      // Making MediaSourceStreamAdapter be ready on first packet.
      if (!this._isReady) {
        this._isReady = true;
        this.createChannel();
      }
    }

    private _openMediaSource() {
      var sourceBuffer = this._mediaSource.addSourceBuffer(MP3_MIME_TYPE);
      sourceBuffer.addEventListener('update', function () {
        this._updating = false;
        this._appendSoundData();
      }.bind(this));
      this._sourceBuffer = sourceBuffer;
      this._appendSoundData();
    }

    queueData(frame: DecodedSound) {
      this._rawFrames.push(frame.data);
      this._appendSoundData();
    }

    finish() {
      this._loading = false;
      this._appendSoundData();
    }
  }

  class BlobStreamAdapter extends HTMLAudioElementAdapter {
    private  _rawFrames: any[];

    constructor(sec: ISecurityDomain, element: HTMLAudioElement) {
      super(sec, element);
      this._rawFrames = [];
    }

    queueData(frame: DecodedSound) {
      this._rawFrames.push(frame.data);
    }

    finish() {
      var blob = new Blob(this._rawFrames);
      this.element.src = URL.createObjectURL(blob);
      this.createChannel();
    }
  }

  function syncTime(element, movieClip) {
    var initialized = false;
    var startMediaTime, startRealTime;
    element.addEventListener('timeupdate', function (e) {
      if (!initialized) {
        startMediaTime = element.currentTime;
        startRealTime = performance.now();
        initialized = true;
        //movieClip._stage._frameScheduler.startTrackDelta();
        return;
      }
      var mediaDelta = element.currentTime - startMediaTime;
      var realDelta = performance.now() - startRealTime;
      //movieClip._stage._frameScheduler.setDelta(realDelta - mediaDelta * 1000);
    });
    element.addEventListener('pause', function (e) {
      //movieClip._stage._frameScheduler.endTrackDelta();
      initialized = false;
    });
    element.addEventListener('seeking', function (e) {
      //movieClip._stage._frameScheduler.endTrackDelta();
      initialized = false;
    });
  }

  class WebAudioAdapter implements ISoundStreamAdapter {
    private _sec: ISecurityDomain;
    private _channel: media.SoundChannel;
    private _sound: media.Sound;
    private _data;
    private _position: number;

    get currentTime(): number {
      return NaN;
    }

    playFrom(time: number) {
      // tslint, noop
    }

    get paused(): boolean {
      return false;
    }

    set paused(value: boolean) {
      // tslint, noop
    }

    get isReady(): boolean {
      return !!this._channel;
    }

    constructor(sec: ISecurityDomain, data: any) {
      this._sec = sec;
      this._channel = null;
      this._sound = null;
      this._data = data;
      this._position = 0;
    }

    queueData(frame: DecodedSound) {
      this._data.pcm.set(frame.pcm, this._position);
      this._position += frame.pcm.length;
    }

    finish() {
      // TODO Start from some seek offset, stopping
      var sound = flash.media.Sound.initializeFromPCMData(this._sec, this._data);
      var channel = sound.play();
      this._sound = sound;
      this._channel = channel;
    }
  }

  class WebAudioMP3Adapter extends WebAudioAdapter {
    private _decoderPosition: number;
    private _decoderSession: MP3DecoderSession;

    constructor(sec: ISecurityDomain, data: any) {
      super(sec, data);

      this._decoderPosition = 0;
      this._decoderSession = new MP3DecoderSession();
      this._decoderSession.onframedata = function (frameData) {
        var position = this._decoderPosition;
        data.pcm.set(frameData, position);
        this._decoderPosition = position + frameData.length;
      }.bind(this);
      this._decoderSession.onclosed = function () {
        WebAudioAdapter.prototype.finish.call(this);
      }.bind(this);
      this._decoderSession.onerror = function (error) {
        Debug.warning('MP3DecoderSession error: ' + error);
      };
    }

    queueData(frame: DecodedSound) {
      this._decoderSession.pushAsync(frame.data);
    }

    finish() {
      this._decoderSession.close();
    }
  }

  export class MovieClipSoundStream {
    private movieClip: MovieClip;
    private data;
    private seekIndex: Array<number>;
    private position: number;
    private element;
    private soundStreamAdapter: ISoundStreamAdapter;
    private wasFullyLoaded: boolean;

    private decode: (block: Uint8Array) => SWF.Parser.DecodedSound;

    private expectedFrame: number;
    private waitFor: number;

    public constructor(streamInfo: SWF.Parser.SoundStream, movieClip: MovieClip) {
      this.movieClip = movieClip;
      this.decode = streamInfo.decode.bind(streamInfo);
      this.data = {
        sampleRate: streamInfo.sampleRate,
        channels: streamInfo.channels
      };
      this.seekIndex = [];
      this.position = 0;
      this.wasFullyLoaded = false;
      this.expectedFrame = 0;
      this.waitFor = 0;

      var sec = movieClip.sec;
      var isMP3 = streamInfo.format === 'mp3';
      if (isMP3 && !webAudioMP3Option.value) {
        var element = document.createElement('audio');
        element.preload = 'metadata'; // for mobile devices
        element.loop = false;
        syncTime(element, movieClip);
        if (element.canPlayType(MP3_MIME_TYPE)) {
          this.element = element;
          if (!mediaSourceMP3Option.value) {
            this.soundStreamAdapter = new BlobStreamAdapter(sec, element);
          } else if (typeof MediaSource !== 'undefined' &&
                     (<any>MediaSource).isTypeSupported(MP3_MIME_TYPE)) {
            this.soundStreamAdapter = new MediaSourceStreamAdapter(sec, element);
          } else {
            // Falls back to blob playback.
            Debug.warning('MediaSource is not supported');
            this.soundStreamAdapter = new BlobStreamAdapter(sec, element);
          }
          return;
        }
        // Falls through to WebAudio if element cannot play MP3.
      }

      // TODO fix streamInfo.samplesCount name -- its actually average value
      var totalSamples = (streamInfo.samplesCount + 1) * this.movieClip.totalFrames * streamInfo.channels;
      this.data.pcm = new Float32Array(totalSamples);
      this.soundStreamAdapter = !isMP3 ? new WebAudioAdapter(sec, this.data) :
                                         new WebAudioMP3Adapter(sec, this.data);
    }

    public appendBlock(frameNum: number, streamBlock: Uint8Array) {
      var decodedBlock = this.decode(streamBlock);
      var streamPosition = this.position;
      this.seekIndex[frameNum] = streamPosition + decodedBlock.seek * this.data.channels;
      this.position = streamPosition + decodedBlock.samplesCount * this.data.channels;
      this.soundStreamAdapter.queueData(decodedBlock);
    }

    public playFrame(frameNum: number) {
      if (isNaN(this.seekIndex[frameNum])) {
        return;
      }

      var PAUSE_WHEN_OF_SYNC_GREATER = 1.0;
      var PLAYBACK_ADJUSTMENT = 0.25;

      if (!this.wasFullyLoaded && this.movieClip._isFullyLoaded) {
        this.wasFullyLoaded = true;
        this.soundStreamAdapter.finish();
      }

      if (this.soundStreamAdapter.isReady &&
          !isNaN(this.soundStreamAdapter.currentTime)) {
        var soundStreamData = this.data;
        var time = this.seekIndex[frameNum] /
          soundStreamData.sampleRate / soundStreamData.channels;
        var elementTime = this.soundStreamAdapter.currentTime;
        if (this.expectedFrame !== frameNum) {
          this.soundStreamAdapter.playFrom(time);
        } else if (this.waitFor > 0) {
          if (this.waitFor <= time) {
            this.soundStreamAdapter.paused = false;
            this.waitFor = 0;
          }
        } else if (elementTime - time > PAUSE_WHEN_OF_SYNC_GREATER) {
          Debug.warning('Sound is faster than frames by ' + (elementTime - time));
          this.waitFor = elementTime - PLAYBACK_ADJUSTMENT;
          this.soundStreamAdapter.paused = true;
        } else if (time - elementTime > PAUSE_WHEN_OF_SYNC_GREATER) {
          Debug.warning('Sound is slower than frames by ' + (time - elementTime));
          this.soundStreamAdapter.playFrom(time + PLAYBACK_ADJUSTMENT);
        }
        this.expectedFrame = frameNum + 1;
      }
    }
  }
}
