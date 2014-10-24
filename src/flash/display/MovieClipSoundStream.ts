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
module Shumway.AVM2.AS.flash.display {
  var MP3_MIME_TYPE = 'audio/mpeg';

  function openMediaSource(soundStream, mediaSource) {
    var sourceBuffer;
    try {
      sourceBuffer = mediaSource.addSourceBuffer(MP3_MIME_TYPE);
      soundStream.mediaSource = mediaSource;
      soundStream.sourceBuffer = sourceBuffer;
      // cannot issue multiple appendBuffer in a row, flattening frames into
      // one array
      var rawFramesLength = 0;
      soundStream.rawFrames.forEach(function (frameData) {
        rawFramesLength += frameData.length;
      });
      if (rawFramesLength !== 0) {
        var data = new Uint8Array(rawFramesLength), offset = 0;
        soundStream.rawFrames.forEach(function (frameData) {
          data.set(frameData, offset);
          offset += frameData.length;
        });
        sourceBuffer.appendBuffer(data);
      }
      soundStream.rawFrames = null;
    } catch (e) {
      console.error('MediaSource mp3 playback is not supported: ' + e);
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

  var PLAY_USING_AUDIO_TAG = true;

  declare class MP3DecoderSession {
    public pushAsync(data): void;
    public onframedata: (frameData) => void;
    public onerror: (error) => void;
  }

  export class MovieClipSoundStream {
    private movieClip: MovieClip;
    private data;
    private seekIndex: Array<number>;
    private position: number;
    private element;
    private mediaSource;
    private sourceBuffer;
    private rawFrames: Array<any>;

    private decode: (block: Uint8Array) => SWF.Parser.DecodedSound;
    private decoderPosition: number;
    private decoderSession: MP3DecoderSession;

    private channel: media.SoundChannel;
    private sound: media.Sound;
    private expectedFrame: number;
    private waitFor: number;

    public constructor(streamInfo: SWF.Parser.SoundStream, movieClip: MovieClip) {
      this.movieClip = movieClip;
      this.decode = streamInfo.decode;
      this.data = {
        sampleRate: streamInfo.sampleRate,
        channels: streamInfo.channels
      };
      this.seekIndex = [];
      this.position = 0;
      var isMP3 = streamInfo.format === 'mp3';
      if (isMP3 && PLAY_USING_AUDIO_TAG) {
        var element = document.createElement('audio');
        element.preload = 'metadata'; // for mobile devices
        element.loop = false;
        syncTime(element, movieClip);
        if (element.canPlayType(MP3_MIME_TYPE)) {
          this.element = element;
          if (typeof MediaSource !== 'undefined' &&
              (<any>MediaSource).isTypeSupported(MP3_MIME_TYPE)) {
            var mediaSource = new MediaSource();
            mediaSource.addEventListener('sourceopen',
              openMediaSource.bind(null, this, mediaSource));
            element.src = URL.createObjectURL(mediaSource);
          } else {
            console.warn('MediaSource is not supported');
          }
          this.rawFrames = [];
          return;
        }
      }
      var totalSamples = streamInfo.samplesCount * streamInfo.channels;
      this.data.pcm = new Float32Array(totalSamples);
      if (isMP3) {
        var soundStream = this;
        soundStream.decoderPosition = 0;
        soundStream.decoderSession = new MP3DecoderSession();
        soundStream.decoderSession.onframedata = function (frameData) {
          var position = soundStream.decoderPosition;
          soundStream.data.pcm.set(frameData, position);
          soundStream.decoderPosition = position + frameData.length;
        }.bind(this);
        soundStream.decoderSession.onerror = function (error) {
          console.error('ERROR: MP3DecoderSession: ' + error);
        };
        // TODO close the session somewhere
      }
    }

    public appendBlock(frameNum: number, streamBlock: Uint8Array) {
      var decodedBlock = this.decode(streamBlock);
      var streamPosition = this.position;
      this.seekIndex[frameNum] = streamPosition + decodedBlock.seek * this.data.channels;
      this.position = streamPosition + decodedBlock.samplesCount * this.data.channels;

      if (this.sourceBuffer) {
        this.sourceBuffer.appendBuffer(decodedBlock.data);
        return;
      }
      if (this.rawFrames) {
        this.rawFrames.push(decodedBlock.data);
        return;
      }

      var decoderSession = this.decoderSession;
      if (decoderSession) {
        decoderSession.pushAsync(decodedBlock.data);
      } else {
        this.data.pcm.set(decodedBlock.pcm, streamPosition);
      }
    }

    public playFrame(frameNum: number) {
      if (isNaN(this.seekIndex[frameNum])) {
        return;
      }

      var PAUSE_WHEN_OF_SYNC_GREATER = 1.0;
      var PLAYBACK_ADJUSTMENT = 0.25;
      var element = this.element;
      if (element) {
        var soundStreamData = this.data;
        var time = this.seekIndex[frameNum] /
          soundStreamData.sampleRate / soundStreamData.channels;
        if (!this.channel && (this.movieClip._isFullyLoaded || this.sourceBuffer)) {
          if (!this.sourceBuffer) {
            var blob = new Blob(this.rawFrames);
            element.src = URL.createObjectURL(blob);
          }

          var channel = <flash.media.SoundChannel>flash.media.SoundChannel.initializeFrom({element: element});
          this.channel = channel;
          this.expectedFrame = 0;
          this.waitFor = 0;
        } else if (this.sourceBuffer || !isNaN(element.duration)) {
          if (this.mediaSource && this.movieClip._isFullyLoaded) {
            this.mediaSource.endOfStream();
            this.mediaSource = null;
          }
          var elementTime = element.currentTime;
          if (this.expectedFrame !== frameNum) {
            if (element.paused) {
              element.play();
              element.addEventListener('playing', function setTime(e) {
                element.removeEventListener('playing', setTime);
                element.currentTime = time;
              });
            } else {
              element.currentTime = time;
            }
          } else if (this.waitFor > 0) {
            if (this.waitFor <= time) {
              if (element.paused) {
                element.play();
              }
              this.waitFor = 0;
            }
          } else if (elementTime - time > PAUSE_WHEN_OF_SYNC_GREATER) {
            console.warn('Sound is faster than frames by ' + (elementTime - time));
            this.waitFor = elementTime - PLAYBACK_ADJUSTMENT;
            element.pause();
          } else if (time - elementTime > PAUSE_WHEN_OF_SYNC_GREATER) {
            console.warn('Sound is slower than frames by ' + (time - elementTime));
            element.currentTime = time + PLAYBACK_ADJUSTMENT;
          }
          this.expectedFrame = frameNum + 1;
        }
      } else if (!this.sound) {
        // Start from some seek offset, stopping
        var sound = <flash.media.Sound>flash.media.Sound.initializeFrom(this.data);
        var channel = sound.play();
        this.sound = sound;
        this.channel = channel;
      }
    }
  }
}
