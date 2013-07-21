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
/*global MP3DecoderSession, AS2MovieClip, $DEBUG */

var MovieClipDefinition = (function () {
  var def = {
    __class__: 'flash.display.MovieClip',

    initialize: function () {
      this._currentFrame = 0;
      this._actualFrame = 0;
      this._currentFrameLabel = null;
      this._currentLabel = false;
      this._currentScene = 0;
      this._deferScriptExecution = false;
      this._enabled = null;
      this._frameScripts = { };
      this._framesLoaded = 1;
      this._isPlaying = true;
      this._labelMap = { };
      this._sceneFrameMap = { };
      this._sceneMap = { };
      this._scenes = [];
      this._timeline = null;
      this._totalFrames = 1;
      this._startSoundRegistrations = [];

      var s = this.symbol;
      if (s) {
        this._timeline = s.timeline || null;
        this._framesLoaded = s.framesLoaded || 1;
        this._labelMap = Object.create(s.labelMap || null);
        this._frameScripts = Object.create(s.frameScripts || null);
        this._totalFrames = s.totalFrames || 1;
        this._startSoundRegistrations = s.startSoundRegistrations || [];

        if (s.scenes) {
          this._scenes = s.scenes;
        } else {
          var map = this._labelMap;
          var labels = [];
          for (var name in map) {
            var frame = map[name];
            labels.push(new flash.display.FrameLabel(name, frame));
          }
          var scene = new flash.display.Scene('Scene 1', labels, this._totalFrames);
          this._scenes = [scene];
        }
      }

      this._needAdvance = true;
      this._onConstructFrame = function () {
        this._gotoFrame(this._currentFrame + 1);
        this._needAdvance = false;
        if (!this._isPlaying) {
          this._removeEventListener('constructFrame', this._onConstructFrame);
        }
      }.bind(this);
      this._addEventListener('constructFrame', this._onConstructFrame);
    },

    _callFrame: function (frameNum) {
      this._deferScriptExecution = true;
      if (frameNum in this._frameScripts) {
        var scripts = this._frameScripts[frameNum];
        for (var i = 0, n = scripts.length; i < n; i++) {
          if ($DEBUG) {
            try {
              scripts[i].call(this);
            } catch (e) {
              console.error('error ' + e + ', stack: \n' + e.stack);
            }
          } else {
            scripts[i].call(this);
          }
        }
      }
      this._deferScriptExecution = false;
      if (this._actualFrame !== this._currentFrame) {
        this._gotoFrame(this._actualFrame);
      }
    },
    _as2CallFrame: function (frame) {
      if (isNaN(frame)) {
        var frameNum = this._labelMap[frame];
        if (frameNum !== undefined) {
          this._callFrame(frameNum);
        }
      } else {
        this._callFrame(frame);
      }
    },

    _getAS2Object: function () {
      if (!this.$as2Object) {
        new AS2MovieClip().$attachNativeObject(this);
      }
      return this.$as2Object;
    },
    _gotoFrame: function (frameNum, scene) {
      if (frameNum < 1 || frameNum > this._totalFrames)
        frameNum = 1;

      if (frameNum > this.framesLoaded)
        frameNum = this.framesLoaded;

      var currentFrame = this._currentFrame;

      if (frameNum === currentFrame)
        return;

      this._actualFrame = frameNum;

      if (this._deferScriptExecution) {
        return;
      }

      if (currentFrame > 0) {
        var children = this._children;
        var timeline = this._timeline;
        var currentDisplayList = timeline[currentFrame - 1];
        var displayList = timeline[frameNum - 1];

        if (displayList !== currentDisplayList) {
          this._markAsDirty();
          var walkList = frameNum > currentFrame ? displayList : currentDisplayList;

          for (var depth in walkList) {
            var cmd = displayList[depth];
            var currentListCmd = currentDisplayList[depth];
            var currentChild = null;
            var currentIndex = -1;
            var highestIndex = children.length;

            var i = highestIndex;
            while (i--) {
              var child = children[i];
              if (child._depth > depth) {
                if (child._animated)
                  highestIndex = i;
              } else if (child._depth == depth) {
                currentChild = child;
                currentIndex = i;
                break;
              }
            }

            if (!cmd) {
              if (currentChild && currentChild._owned) {
                children.splice(currentIndex, 1);

                this._control.removeChild(currentChild._control);
                currentChild._dispatchEvent(new flash.events.Event("removed"));
                if (this.stage)
                    currentChild._removedFromStage(new flash.events.Event("removedFromStage"));
                currentChild.destroy();
              }
            } else if (cmd !== currentListCmd) {
              if (currentChild &&
                  cmd.symbolId === currentListCmd.symbolId &&
                  cmd.ratio === currentListCmd.ratio) {
                if (currentChild._animated) {
                  if (cmd.hasClipDepth)
                    currentChild._clipDepth = cmd.clipDepth;

                  if (cmd.hasMatrix) {
                    var m = cmd.matrix;
                    var a = m.a;
                    var b = m.b;
                    var c = m.c;
                    var d = m.d;

                    currentChild._rotation = Math.atan2(b, a) * 180 / Math.PI;
                    var sx = Math.sqrt(a * a + b * b);
                    currentChild._scaleX = a > 0 ? sx : -sx;
                    var sy = Math.sqrt(d * d + c * c);
                    currentChild._scaleY = d > 0 ? sy : -sy;
                    var x = currentChild._x = m.tx;
                    var y = currentChild._y = m.ty;

                    currentChild._currentTransform = m;
                  }

                  if (cmd.hasCxform)
                    currentChild._cxform = cmd.cxform;
                }
              } else {
                var index = highestIndex;
                var replace = false;

                if (currentChild) {
                  index = currentIndex;
                  replace = true;

                  this._control.removeChild(currentChild._control);
                  currentChild._dispatchEvent(new flash.events.Event("removed"));
                  if (this.stage)
                    currentChild._removedFromStage(new flash.events.Event("removedFromStage"));
                  currentChild.destroy();
                }

                this._addTimelineChild(cmd, index, replace);
              }
            }
          }

          this._constructChildren();
        }
      }

      this._currentFrame = frameNum;

      if (frameNum) {
        this._callFrame(frameNum);
        this._startSounds(frameNum);
      }
    },
    _registerStartSounds: function (frameNum, starts) {
      this._startSoundRegistrations[frameNum] = starts;
    },
    _initSoundStream: function (streamInfo) {
      var soundStream = this._soundStream = {
        data: {
          pcm: new Float32Array(streamInfo.samplesCount * streamInfo.channels),
          sampleRate: streamInfo.sampleRate,
          channels: streamInfo.channels
        },
        seekIndex: [],
        position: 0
      };
      if (streamInfo.format === 'mp3') {
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
    },
    _addSoundStreamBlock: function (frameNum, streamBlock) {
      var soundStream = this._soundStream;
      var streamPosition = soundStream.position;
      soundStream.seekIndex[frameNum] = streamPosition +
        streamBlock.seek * soundStream.data.channels;
      soundStream.position = streamPosition +
        streamBlock.samplesCount * soundStream.data.channels;

      var decoderSession = soundStream.decoderSession;
      if (decoderSession) {
        decoderSession.pushAsync(streamBlock.data);
      } else {
        soundStream.data.pcm.set(streamBlock.pcm, streamPosition);
      }
    },
    _startSounds: function (frameNum) {
      var starts = this._startSoundRegistrations[frameNum];
      if (starts) {
        var sounds = this._sounds || (this._sounds = {});
        var loader = this.loaderInfo._loader;
        for (var i = 0; i < starts.length; i++) {
          var start = starts[i];
          var symbolId = start.soundId;
          var info = start.soundInfo;
          var sound = sounds[symbolId];
          if (!sound) {
            var symbolPromise = loader._dictionary[symbolId];
            var symbolInfo = symbolPromise.value;
            if (!symbolInfo)
              continue;

            var symbolClass = avm2.systemDomain.findClass(symbolInfo.className) ?
              avm2.systemDomain.getClass(symbolInfo.className) :
              avm2.applicationDomain.getClass(symbolInfo.className);

            var soundObj = symbolClass.createAsSymbol(symbolInfo.props);
            symbolClass.instanceConstructor.call(soundObj);
            sounds[symbolId] = sound = { object: soundObj };
          }

          if (sound.channel) {
            sound.channel.stop();
            delete sound.channel;
          }
          if (!info.stop) {
            // TODO envelope, in/out point
            var loops = info.hasLoops ? info.loopCount : 0;
            sound.channel = sound.object.play(0, loops);
          }
        }
      }
      if (this._soundStream) {
        // Start from some seek offset, stopping
        if (!this._soundStream.sound && this._soundStream.seekIndex[frameNum]) {
          var className = 'flash.media.Sound';
          var symbolClass = avm2.systemDomain.findClass(className) ?
            avm2.systemDomain.getClass(className) :
            avm2.applicationDomain.getClass(className);

          var sound = symbolClass.createAsSymbol(this._soundStream.data);
          symbolClass.instanceConstructor.call(sound);
          var channel = sound.play();
          this._soundStream.sound = sound;
          this._soundStream.channel = channel;
        }
      }
    },

    get currentFrame() {
      return this._currentFrame || 1;
    },
    get currentFrameLabel() {
      return this._currentFrameLabel;
    },
    get currentLabel() {
      return this._currentLabel;
    },
    get currentLabels() {
      return this._scenes[this._currentScene].labels;
    },
    get currentScene() {
      return this._scenes[this._currentScene];
    },
    get enabled() {
      return this._enabled;
    },
    set enabled(val) {
      this._enabled = val;
    },
    get framesLoaded() {
      return this._framesLoaded;
    },
    get totalFrames() {
      return this._totalFrames;
    },
    get scenes() {
      return this._scenes;
    },
    get trackAsMenu() {
      return false;
    },
    set trackAsMenu(val) {
      notImplemented();
    },

    addFrameScript: function () {
      // arguments are pairs of frameIndex and script/function
      // frameIndex is in range 0..totalFrames-1
      var frameScripts = this._frameScripts;
      for (var i = 0, n = arguments.length; i < n; i += 2) {
        var frameNum = arguments[i] + 1;
        var fn = arguments[i + 1];
        var scripts = frameScripts[frameNum];
        if (scripts)
          scripts.push(fn);
        else
          frameScripts[frameNum] = [fn];
      }
    },
    gotoAndPlay: function (frame, scene) {
      this.play();
      if (isNaN(frame)) {
        this.gotoLabel(frame);
      } else {
        this._gotoFrame(frame);
      }
    },
    gotoAndStop: function (frame, scene) {
      this.stop();
      if (isNaN(frame)) {
        this.gotoLabel(frame);
      } else {
        this._gotoFrame(frame);
      }
    },
    gotoLabel: function (labelName) {
      var frameNum = this._labelMap[labelName];
      if (frameNum !== undefined && this._stage) {
        this._gotoFrame(frameNum);
      }
    },
    isPlaying: function () {
      return this._isPlaying;
    },
    nextFrame: function () {
      this.stop();
      this._gotoFrame(this._currentFrame % this._totalFrames + 1);
    },
    nextScene: function () {
      notImplemented();
    },
    play: function () {
      if (!this._isPlaying) {
        this._isPlaying = true;
        if (!this._needAdvance && this._totalFrames > 1) {
          this._addEventListener('constructFrame', this._onConstructFrame);
        }
      }
    },
    prevFrame: function () {
      this.stop();
      this._gotoFrame(this._currentFrame > 1 ? this._currentFrame - 1 : this._totalFrames);
    },
    prevScene: function () {
      notImplemented();
    },
    stop: function () {
      if (this._isPlaying) {
        this._isPlaying = false;
        if (!this._needAdvance) {
          this._removeEventListener('constructFrame', this._onConstructFrame);
        }
      }
    }
  };

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        currentFrame: desc(def, "currentFrame"),
        framesLoaded: desc(def, "framesLoaded"),
        totalFrames: desc(def, "totalFrames"),
        trackAsMenu: desc(def, "trackAsMenu"),
        scenes: desc(def, "scenes"),
        currentScene: desc(def, "currentScene"),
        currentLabel: desc(def, "currentLabel"),
        currentFrameLabel: desc(def, "currentFrameLabel"),
        enabled: desc(def, "enabled"),
        isPlaying: desc(def, "isPlaying"),
        play: def.play,
        stop: def.stop,
        nextFrame: def.nextFrame,
        prevFrame: def.prevFrame,
        gotoAndPlay: def.gotoAndPlay,
        gotoAndStop: def.gotoAndStop,
        addFrameScript: def.addFrameScript,
        prevScene: def.prevScene,
        nextScene: def.nextScene
      }
    }
  };

  return def;
}).call(this);
