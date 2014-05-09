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
  var FrameLabel: typeof flash.display.FrameLabel;
  var Event: typeof flash.events.Event;

  export class MovieClip extends flash.display.Sprite {

    private static _instances: MovieClip [];
    private static _executables: MovieClip [];

    // Called whenever the class is initialized.
    static classInitializer: any = function () {
      Scene = flash.display.Scene;
      FrameLabel = flash.display.FrameLabel;
      Event = flash.events.Event;

      MovieClip._instances = [];
      MovieClip._executables = [];
    };
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = function (symbol: Shumway.Timeline.SpriteSymbol) {
      var self: MovieClip = this;
      MovieClip._instances.push(self);

      self._currentFrame = 0;
      self._framesLoaded = 1;
      self._totalFrames = 1;
      self._trackAsMenu = false;
      self._scenes = [];
      self._currentLabel = null;
      self._currentFrameLabel = null;
      self._enabled = true;
      self._isPlaying = false;

      self._frames = [];
      self._sceneIndex = 0;
      self._frameScripts = [];
      self._currentFrameAbs = 1;
      self._nextFrameAbs = 1;
      self._hasNewFrame = false;
      self._stopped = false;
      self._allowFrameNavigation = true;

      if (symbol) {
        self._framesLoaded = symbol.frames.length;
        self._totalFrames = symbol.numFrames;
        self._currentFrame = 1;
        if (!symbol.isRoot) {
          this.addScene('', symbol.labels, symbol.numFrames);
        }
        self._frames = symbol.frames;
      } else {
        this.addScene('', [], self._totalFrames);
      }
    };
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["currentLabels"];

    static initFrame(): void {
      var instances = MovieClip._instances;
      for (var i = 0; i < instances.length; i++) {
        var instance = instances[i];
        if (instance._hasFlags(DisplayObjectFlags.Constructed)) {
          instance._advanceFrame();
        }
      }
      DisplayObject._broadcastFrameEvent(Event.ENTER_FRAME);
    }

    static constructFrame() {
      DisplayObjectContainer.constructChildren();
      DisplayObject._broadcastFrameEvent(Event.FRAME_CONSTRUCTED);
      var queue = MovieClip._executables;
      while (queue.length) {
        var instance = queue.shift();
        instance._allowFrameNavigation = false;
        instance.callFrame(instance._currentFrameAbs);
        instance._allowFrameNavigation = true;
        if (instance._hasNewFrame) {
          instance._advanceFrame();
          instance._constructChildren();
        }
      }
      DisplayObject._broadcastFrameEvent(Event.EXIT_FRAME);
    }

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

    _frames: Shumway.Timeline.Frame [];
    _sceneIndex: number;
    _frameScripts: any;
    _currentFrameAbs: number;
    _nextFrameAbs: number;
    _hasNewFrame: boolean;
    _stopped: boolean;
    _allowFrameNavigation: boolean;

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
      assert (result.length, "There are no scenes defined.");
      for (var i = 0; i < result.length; i++) {
        result[i] = result[i].clone();
      }
      return result;
    }

    get currentScene(): flash.display.Scene {
      var scene = this._scenes[this._sceneIndex];
      assert (scene, "Scene is not defined.");
      return scene.clone();
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
      if (this._totalFrames > 1) {
        this._isPlaying = true;
      }
      this._stopped = false;
    }

    stop(): void {
      this._isPlaying = false;
      if (!this._hasNewFrame) {
        this._nextFrameAbs = this._currentFrameAbs;
      }
      this._stopped = true;
    }

    gotoFrame(frame: any, sceneName: string = null): void {
      var scenes = this._scenes;
      assert (scenes.length, "There should be at least one scene defined.");
      var sceneIndex = -1;
      var sceneOffset = 0;
      var frameNum = 1;

      if (sceneName !== null) {
        for (var i = 0; i < scenes.length; i++) {
          var scene = scenes[i];
          if (scene.name === sceneName) {
            sceneIndex = i;
            break;
          }
          sceneOffset += scene.numFrames;
        }
        if (sceneIndex < 0) {
          throwError('ArgumentError', Errors.SceneNotFoundError, sceneName);
        }
      } else {
        sceneIndex = this._sceneIndex;
      }

      var scene = scenes[sceneIndex];

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
      } else {
        if (!frame) {
          // TODO
        }
        frameNum = frame;
        if (frameNum < 1) {
          frameNum = 1;
        }
      }

      var frameNumAbs = sceneOffset + frameNum;
      if (frameNumAbs === this._nextFrameAbs) {
        return;
      }

      this._nextFrameAbs = frameNumAbs;
      this._hasNewFrame = true;
      if (this._allowFrameNavigation) { // TODO: also check if ActionScriptVersion < 3
        // TODO test inter-frame navigation behaviour for SWF versions < 10
        this._advanceFrame();
        MovieClip.constructFrame();
      }
    }

    private _advanceFrame(): void {
      if (this._totalFrames === 1) {
        return;
      }

      var scenes = this._scenes;
      assert (scenes.length, "There should be at least one scene defined.");
      var currentFrameAbs = this._currentFrameAbs;
      var nextFrameAbs = this._nextFrameAbs;

      if (currentFrameAbs === nextFrameAbs) {
        if (this._stopped) {
          return;
        }
        nextFrameAbs++;
      }

      if (nextFrameAbs > this._totalFrames) {
        nextFrameAbs = 1;
      }

      //if (this._buttonMode && this._enabled) {
      //  var buttonState = '_up';
      //  if (this._mouseOver) {
      //    buttonState = this._mouseDown ? '_down' : '_over';
      //  }
      //  var currentScene = scenes[this._sceneIndex];
      //  var labels = currentScene.labels;
      //  for (var j = 0; j < labels.length; j++) {
      //    var label = labels[j];
      //    if (label.name === buttonState) {
      //      // this.stop();
      //      nextFrame = offset + label.frame;
      //      break;
      //    }
      //  }
      //}

      if (nextFrameAbs > this._framesLoaded) {
        // TODO
        return;
      }

      // TODO fast path if navigated within current scene

      var frames = this._frames;
      var startIndex = currentFrameAbs;
      if (nextFrameAbs < currentFrameAbs) {
        var frame = frames[0];
        assert (frame, "Frame is not defined.");
        var stateAtDepth = frame.stateAtDepth;
        var children = this._children.slice();
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          if (child._depth) {
            var state = stateAtDepth[child._depth];
            if (!state || !state.canBeAnimated(child)) {
              this.removeChildAt(i);
            }
          }
        }
        startIndex = 0;
      }
      for (var i = startIndex; i < nextFrameAbs; i++) {
        var frame = frames[i];
        assert (frame, "Frame is not defined.");
        var stateAtDepth = frame.stateAtDepth;
        for (var depth in stateAtDepth) {
          var child = this.getChildAtDepth(depth);
          var state = stateAtDepth[depth];
          if (child) {
            // TODO handle replacing graphics
            if (state && state.canBeAnimated(child)) {
              child._animate(state);
              continue;
            }
            this.removeChild(child);
          }
          if (state) {
            var character = DisplayObject.createAnimatedDisplayObject(state, false);
            this.addChildAtDepth(character, state.depth);
          }
        }
      }

      var currentFrame = nextFrameAbs;
      var sceneIndex = 0;
      while (sceneIndex < scenes.length) {
        var scene = scenes[sceneIndex];
        if (currentFrame <= scene.numFrames) {
          // TODO set currentLabel
          break;
        }
        currentFrame -= scene.numFrames;
        sceneIndex++;
      }

      this._currentFrame = currentFrame;
      this._sceneIndex = sceneIndex;

      if (this._frameScripts[nextFrameAbs]) {
        MovieClip._executables.push(this);
      }

      this._currentFrameAbs = nextFrameAbs;
      this._nextFrameAbs = nextFrameAbs;
      this._hasNewFrame = false;
    }

    callFrame(frame: number): void {
      frame = frame | 0;
      var frameScript = this._frameScripts[frame];
      if (!frameScript) {
        return;
      }
      try {
        frameScript.call(this);
      } catch (e) {
        Telemetry.instance.reportTelemetry({ topic: 'error', error: Telemetry.ErrorTypes.AVM2_ERROR });

        //if ($DEBUG) {
        //  console.error('error ' + e + ', stack: \n' + e.stack);
        //}

        this.stop();
        throw e;
      }
    }

    nextFrame(): void {
      this.gotoAndStop(this._currentFrameAbs + 1);
    }

    prevFrame(): void {
      this.gotoAndStop(this._currentFrameAbs - 1);
    }

    gotoAndPlay(frame: any, scene: string = null): void {
      this.play();
      this.gotoFrame(frame, asCoerceString(scene));
    }

    gotoAndStop(frame: any, scene: string = null): void {
      this.stop();
      this.gotoFrame(frame, asCoerceString(scene));
    }

    addFrameScript(...args): void {
      if (!this._currentFrame) {
        return;
      }
      // arguments are pairs of frameIndex and script/function
      // frameIndex is in range 0..totalFrames-1
      var numArgs = arguments.length;
      if (numArgs & 1) {
        throwError('ArgumentError', Errors.TooFewArgumentsError, numArgs, numArgs + 1);
      }
      var frameScripts = this._frameScripts;
      for (var i = 0; i < numArgs; i += 2) {
        var frameNum = arguments[i] + 1;
        assert (frameNum > 0 && frameNum <= this._totalFrames, "Invalid frame number.");
        var fn = arguments[i + 1];
        frameScripts[frameNum] = fn;
        if (frameNum === this._currentFrameAbs) {
          MovieClip._executables.push(this);
        }
      }
    }

    addScene(name: string, labels: any [], numFrames: number): void {
      this._scenes.push(new Scene(name, labels, numFrames));
    }

    addFrameLabel(...args): void {
      for (var i = 0; i < arguments.length; i += 2) {
        var frameNum = arguments[i] + 1;
        var labelName = arguments[i + 1];
        var scenes = this._scenes;
        assert (scenes.length, "There should be at least one scene defined.");
        var offset = 0;
        findScene: for (var i = 0; i < scenes.length; i++) {
          var scene = scenes[i];
          var labels = scene.labels;
          for (var j = 0; j < labels.length; j++) {
            var label = labels[j];
            if (label.name === labelName) {
              return;
            }
          }
          if (frameNum > offset && frameNum <= offset + scene.numFrames) {
            labels.push(new FrameLabel(labelName, frameNum - offset));
          }
          offset += scene.numFrames;
        }
        assert (false, "This point should never be reached.");
      }
    }

    prevScene(): void {
      var index = this._sceneIndex;
      if (index <= 0) {
        return;
      }
      var prevScene = this._scenes[index - 1];
      assert (prevScene, "Scene is not defined.");
      this.gotoFrame(1, prevScene.name);
    }

    nextScene(): void {
      var currentScene = this._scenes[this._sceneIndex];
      assert (currentScene, "Scene is not defined.");
      this.gotoFrame(currentScene.numFrames + 1);
    }
  }
}
