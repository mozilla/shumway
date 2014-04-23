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
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import throwError = Shumway.AVM2.Runtime.throwError;
  import clamp = Shumway.NumberUtilities.clamp;
  import Telemetry = Shumway.Telemetry;

  var Scene: typeof flash.display.Scene;

  export class MovieClip extends flash.display.Sprite {
    
    // Called whenever the class is initialized.
    static classInitializer: any = function () {
      Scene = flash.display.Scene;
    };
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = function (symbol: MovieClip) {
      var self: MovieClip = this;

      self._currentFrame = 0;
      self._framesLoaded = 1;
      self._totalFrames = 1;
      self._trackAsMenu = false;
      self._scenes = [new Scene("Scene 1", [], self._totalFrames)];
      self._currentLabel = null;
      self._currentFrameLabel = null;
      self._enabled = true;
      self._isPlaying = false;

      self._sceneIndex = 0;
      self._frameScripts = [];
      self._lastFrameAbs = 0;
      self._nextFrame = 1;
      self._nextFrameAbs = 1;
      self._nextSceneIndex = 0;
    };
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["currentLabels"];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.display.MovieClip");
    }
    
    // JS -> AS Bindings
    
    currentLabels: any [];
    
    // AS -> JS Bindings
    
    _currentFrame: number;
    _framesLoaded: number;
    _totalFrames: number;
    _trackAsMenu: boolean;
    _scenes: any [];
    _currentLabel: string;
    _currentFrameLabel: string;
    _enabled: boolean;
    _isPlaying: boolean;

    _sceneIndex: number;
    _frameScripts: any;
    _lastFrameAbs: number;
    _nextFrame: number;
    _nextFrameAbs: number;
    _nextSceneIndex: number;

    get currentFrame(): number /*int*/ {
      return this._currentFrame;
    }

    get framesLoaded(): number /*int*/ {
      return this._framesLoaded;
    }

    get totalFrames(): number /*int*/ {
      return this._totalFrames;
    }

    get trackAsMenu(): boolean {
      return this._trackAsMenu;
    }

    set trackAsMenu(value: boolean) {
      this._trackAsMenu = !!value;
    }

    get scenes(): any [] {
      var result = this._scenes.slice();
      for (var i = 0; i < result.length; i++) {
        result[i] = result[i].clone();
      }
      return result;
    }

    get currentScene(): flash.display.Scene {
      return this._scenes[this._sceneIndex].clone();
    }

    get currentLabel(): string {
      return this._currentLabel;
    }

    get currentFrameLabel(): string {
      return this._currentFrameLabel;
    }

    get enabled(): boolean {
      return this._enabled;
    }

    set enabled(value: boolean) {
      this._enabled = !!value;
    }

    get isPlaying(): boolean {
      return this._isPlaying;
    }

    play(): void {
      this._isPlaying = true;
    }

    stop(): void {
      this._isPlaying = false;
    }

    gotoFrame(frame: any, sceneName: string = null) {
      //frame = frame;
      sceneName = asCoerceString(sceneName);

      var scenes = this._scenes;
      var realSceneIndex = -1;
      var frameOffset = 0;
      var frameNum = 1;

      if (sceneName) {
        for (var i = 0; i < scenes.length; i++) {
          var scene = scenes[i];
          if (scene.name === sceneName) {
            realSceneIndex = i;
            break;
          }
          frameOffset += scene.numFrames;
        }
      } else {
        realSceneIndex = this._sceneIndex;
      }
      if (realSceneIndex < 0) {
        throwError('ArgumentError', Errors.SceneNotFoundError, sceneName);
      }

      var scene = this._scenes[realSceneIndex];
      if (typeof frame === 'string') {
        var labels = scene.labels;
        var labelFound = null;
        for (var i = 0; i < labels.length; i++) {
          var label = labels[i];
          if (label.name === frame) {
            labelFound = label;
            frameNum = label.frame;
            break;
          }
        }
        if (!labelFound) {
          throwError('ArgumentError', Errors.FrameLabelNotFoundError, frame, sceneName);
        }
      } else if (frame > 1) {
        frameNum = frame;
        while (frameNum > scene.totalFrames) {
          frameOffset += scene.totalFrames;
          frameNum -= scene.totalFrames;
          realSceneIndex++;
          if (realSceneIndex >= scenes.length) {
            frameNum = scene.totalFrames;
            break;
          }
          scene = scenes[realSceneIndex];
        }
      }

      this._nextFrame = frameNum;
      this._nextFrameAbs = frameOffset + frameNum;
      this._nextSceneIndex = realSceneIndex;
    }

    callFrame(frame: number) {
      frame = frame | 0;
      if (frame in this._frameScripts) {
        var scripts = this._frameScripts[frame];
        try {
          for (var i = 0; i < scripts.length; i++) {
            scripts[i].call(this);
          }
        } catch (e) {
          Telemetry.instance.reportTelemetry({topic: 'error', error: Telemetry.ErrorTypes.AVM2_ERROR});

          //if ($DEBUG) {
          //  console.error('error ' + e + ', stack: \n' + e.stack);
          //}

          this.stop();
          throw e;
        }
      }
    }

    advanceFrame() {
      var lastFrame = this._lastFrameAbs;
      var nextFrame = this._nextFrameAbs;

      if (this._buttonMode && this._enabled) {
        // TODO
      }

      var lastSnapshot = this._snapshots[lastFrame];
      var nextSnapshot = this._snapshots[nextFrame];
      var diff = lastSnapshot.diff(nextSnapshot);

      this._currentFrame = this._nextFrame;

      this._lastFrameAbs = nextFrame;
      this._nextFrameAbs = nextFrame < this._totalFrames ? nextFrame + 1 : 0;
    }

    nextFrame(): void {
      this.gotoAndStop(this._currentFrame + 1);
    }

    prevFrame(): void {
      this.gotoAndStop(this._currentFrame - 1);
    }

    gotoAndPlay(frame: any, scene: string = null): void {
      this.play();
      this.gotoFrame(frame, "" + scene);
    }

    gotoAndStop(frame: any, scene: string = null): void {
      this.stop();
      this.gotoFrame(frame, "" + scene);
    }

    addFrameScript(): void {
      // arguments are pairs of frameIndex and script/function
      // frameIndex is in range 0..totalFrames-1
      var frameScripts = this._frameScripts;
      for (var i = 0; i < arguments.length; i += 2) {
        var frameNum = arguments[i] + 1;
        var fn = arguments[i + 1];
        if (!fn) {
          throwError('ArgumentError', Errors.TooFewArgumentsError, i, i + 1);
        }
        var scripts = frameScripts[frameNum];
        if (scripts) {
          scripts.push(fn);
        } else {
          frameScripts[frameNum] = [fn];
        }
      }
    }

    prevScene(): void {
      var index = this._sceneIndex;
      if (index <= 0) {
        return;
      }
      var prevScene = this._scenes[index - 1];
      this.gotoFrame(1, prevScene.name);
    }

    nextScene(): void {
      var currentScene = this._scenes[this._sceneIndex];
      this.gotoFrame(currentScene.numFrames + 1);
    }
  }
}
