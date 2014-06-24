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
  import assert = Shumway.Debug.assert;
  import assertUnreachable = Shumway.Debug.assertUnreachable;
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import throwError = Shumway.AVM2.Runtime.throwError;
  import clamp = Shumway.NumberUtilities.clamp;
  import Telemetry = Shumway.Telemetry;
  import events = flash.events;

  export class MovieClip extends flash.display.Sprite {

    private static _movieClipInstances: WeakList<MovieClip>;
    private static _callQueue: MovieClip [];

    // Called whenever the class is initialized.
    static classInitializer: any = function () {
      MovieClip.reset();
    };
    static reset() {
      MovieClip._movieClipInstances = new WeakList<MovieClip>();
      MovieClip._callQueue = [];
    }
    // Called whenever an instance of the class is initialized.
    static initializer: any = function (symbol: Shumway.Timeline.SpriteSymbol) {
      var self: MovieClip = this;
      MovieClip._movieClipInstances.push(self);

      self._currentFrame = 0;
      self._totalFrames = 1;
      self._trackAsMenu = false;
      self._scenes = [];
      self._enabled = true;
      self._isPlaying = false;

      self._frames = [];
      self._frameScripts = [];
      self._nextFrame = 1;
      self._stopped = false;
      self._allowFrameNavigation = true;

      if (symbol) {
        self._totalFrames = symbol.numFrames;
        self._currentFrame = 1;
        if (!symbol.isRoot) {
          this.addScene('', symbol.labels, 0, symbol.numFrames);
        }
        self._frames = symbol.frames;
      } else {
        this.addScene('', [], 0, self._totalFrames);
      }
    };
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["currentLabels"];

    static initFrame(): void {
      var instances = MovieClip._movieClipInstances.values();
      enterTimeline("MovieClip.initFrame", {instances: instances.length});
      for (var i = 0; i < instances.length; i++) {
        var instance = instances[i];
        if (instance._totalFrames > 1 && instance._hasFlags(DisplayObjectFlags.Constructed)) {
          if (!instance._stopped) {
            instance._nextFrame++;
          }
          instance._advanceFrame();
        }
      }
      DisplayObject._broadcastFrameEvent(events.Event.ENTER_FRAME);
      leaveTimeline();
    }

    static constructFrame(ignoreFrameScripts?) {
      enterTimeline("MovieClip.constructFrame");
      DisplayObjectContainer.constructChildren();
      DisplayObject._broadcastFrameEvent(events.Event.FRAME_CONSTRUCTED);
      var queue = MovieClip._callQueue;
      while (queue.length) {
        var instance = queue.shift();
        instance._allowFrameNavigation = false;
        if (!ignoreFrameScripts) {
          instance.callFrame(instance._currentFrame);
        }
        instance._allowFrameNavigation = true;
        if (instance._nextFrame !== instance._currentFrame) {
          instance._advanceFrame();
          instance._constructChildren();
        }
      }
      DisplayObject._broadcastFrameEvent(events.Event.EXIT_FRAME);
      leaveTimeline("constructFrame");
    }

    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.display.MovieClip");
    }

    // JS -> AS Bindings

    
    // AS -> JS Bindings
    
    private _currentFrame: number;
    private _nextFrame: number;
    private _totalFrames: number;
    private _frames: Shumway.Timeline.FrameDelta[];
    private _frameScripts: any;
    private _scenes: Scene[];

    private _enabled: boolean;
    private _isPlaying: boolean;
    private _stopped: boolean;

    private _trackAsMenu: boolean;
    private _allowFrameNavigation: boolean;

    get currentFrame(): number /*int*/ {
      return this._currentFrame - this._sceneForFrameIndex(this._currentFrame).offset;
    }

    get framesLoaded(): number /*int*/ {
      return this._frames.length;
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

    get scenes(): Scene[] {
      return this._scenes.map(function (scene: Scene) {
        return scene.clone();
      });
    }

    get currentScene(): Scene {
      var scene = this._sceneForFrameIndex(this._currentFrame);
      return scene.clone();
    }

    get currentLabel(): string {
      var label: FrameLabel = this._labelForFrame(this.currentFrame);
      return label ? label.name : null;
    }

    get currentFrameLabel(): string {
      var currentFrame = this.currentFrame;
      var label: FrameLabel = this._labelForFrame(currentFrame);
      return label && label.frame === currentFrame ? label.name : null;
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
      this._stopped = true;
    }

    gotoFrame(frame: any, sceneName: string = null): void {
      var scene: Scene;
      if (sceneName !== null) {
        var scenes = this._scenes;
        release || assert (scenes.length, "There should be at least one scene defined.");
        for (var i = 0; i < scenes.length; i++) {
          scene = scenes[i];
          if (scene.name === sceneName) {
            break;
          }
        }
        if (i === scenes.length) {
          throwError('ArgumentError', Errors.SceneNotFoundError, sceneName);
        }
      } else {
        scene = this._sceneForFrameIndex(this._currentFrame);
      }

      var frameNum = 1;
      if (typeof frame === 'string') {
        var labels = scene.labels;
        for (var i = 0; i < labels.length; i++) {
          var label = labels[i];
          if (label.name === frame) {
            frameNum = label.frame;
            break;
          }
        }
        if (i === labels.length) {
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

      var nextFrame = scene.offset + frameNum;
      if (nextFrame === this._nextFrame) {
        return;
      }

      this._nextFrame = nextFrame;

      if (this._allowFrameNavigation) { // TODO: also check if ActionScriptVersion < 3
        // TODO test inter-frame navigation behaviour for SWF versions < 10
        this._advanceFrame();
        MovieClip.constructFrame();
      }
    }

    private _advanceFrame(): void {
      var currentFrame = this._currentFrame;
      var nextFrame = this._nextFrame;

      if (nextFrame > this._totalFrames) {
        nextFrame = 1;
      }

      if (currentFrame === nextFrame) {
        return;
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

      if (nextFrame > this.framesLoaded) {
        // TODO
        return;
      }

      var frames = this._frames;
      var startIndex = currentFrame;
      if (nextFrame < currentFrame) {
        var frame = frames[0];
        release || assert (frame, "FrameDelta is not defined.");
        var stateAtDepth = frame.stateAtDepth;
        var children = this._children.slice();
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          if (child._depth) {
            var state = stateAtDepth[child._depth];
            if (!state || !state.canBeAnimated(child)) {
              this._removeAnimatedChild(child);
            }
          }
        }
        startIndex = 0;
      }
      for (var i = startIndex; i < nextFrame; i++) {
        var frame = frames[i];
        release || assert (frame, "FrameDelta is not defined.");
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
            this._removeAnimatedChild(child);
          }
          if (state && state.symbol) {
            var character = DisplayObject.createAnimatedDisplayObject(state, false);
            this.addChildAtDepth(character, state.depth);
            if (state.symbol.isAS2Object) {
              this._initAvm1Bindings(character, state);
            }
          }
        }
      }

      if (this._frameScripts[nextFrame]) {
        MovieClip._callQueue.push(this);
      }

      this._currentFrame = this._nextFrame = nextFrame;
    }

    /**
     * Because that's how it's mostly used, the current frame is stored as an offset into the
     * entire timeline. Sometimes, we need to know which scene it falls into. This utility
     * function answers that.
     */
    private _sceneForFrameIndex(frameIndex: number) : Scene {
      var scenes = this._scenes;
      for (var i = 0; i < scenes.length; i++) {
        var scene = scenes[i];
        if (scene.offset < frameIndex && scene.offset + scene.numFrames >= frameIndex) {
          return scene;
        }
      }
      release || assertUnreachable("Must have at least one scene covering all frames.");
    }

    /**
     * Frame indices are stored as offsets into the entire timline, whereas labels are stored
     * in their scenes. This utility function iterates over scenes and their labels to find
     * the label clostest to, but not after the target frame.
     */
    private _labelForFrame(frame: number): FrameLabel {
      var scenes = this._scenes;
      var label: FrameLabel = null;
      for (var i = 0; i < scenes.length; i++) {
        var scene = scenes[i];
        if (scene.offset > frame) {
          return label;
        }
        var labels = scene.labels;
        for (var j = 0; j < labels.length; j++) {
          var currentLabel = labels[j];
          if (currentLabel.frame > frame - scene.offset) {
            return label;
          }
          label = currentLabel;
        }
      }
      return label;
    }

    private _removeAnimatedChild(child: flash.display.DisplayObject) {
      this.removeChild(child);
      if (child._name) {
        var mn = Multiname.getPublicQualifiedName(child._name);
        if (this[mn] === child) {
          this[mn] = null;
        }
      }
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
      this.gotoAndStop(this._currentFrame + 1);
    }

    prevFrame(): void {
      this.gotoAndStop(this._currentFrame - 1);
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
      var numArgs = args.length;
      if (numArgs & 1) {
        throwError('ArgumentError', Errors.TooFewArgumentsError, numArgs, numArgs + 1);
      }
      var frameScripts = this._frameScripts;
      for (var i = 0; i < numArgs; i += 2) {
        var frameNum = args[i] + 1;
        release || assert (frameNum > 0 && frameNum <= this._totalFrames, "Invalid frame number.");
        var fn = args[i + 1];
        frameScripts[frameNum] = fn;
        if (frameNum === this._currentFrame) {
          MovieClip._callQueue.push(this);
        }
      }
    }

    addScene(name: string, labels: any [], offset: number, numFrames: number): void {
      this._scenes.push(new Scene(name, labels, offset, numFrames));
    }

    addFrameLabel(name: string, frame: number): void {
      this._sceneForFrameIndex(frame)._labels.push(new flash.display.FrameLabel(name, frame));
    }

    prevScene(): void {
      var currentScene = this._sceneForFrameIndex(this._currentFrame);
      if (currentScene.offset === 0) {
        return;
      }
      // Since scene offsets are 0-based, the current scene's offset, treated as a frame index,
      // is the previous scene's last frame.
      this.gotoFrame(1, this._sceneForFrameIndex(currentScene.offset).name);
    }

    nextScene(): void {
      var currentScene = this._sceneForFrameIndex(this._currentFrame);
      this.gotoFrame(currentScene.numFrames + 1);
    }
  }
}
