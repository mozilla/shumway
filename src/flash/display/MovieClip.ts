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
  import isNullOrUndefined = Shumway.isNullOrUndefined;
  import throwError = Shumway.AVM2.Runtime.throwError;
  import clamp = Shumway.NumberUtilities.clamp;
  import Telemetry = Shumway.Telemetry;
  import events = flash.events;
  import Multiname = Shumway.AVM2.ABC.Multiname;

  /**
   * Controls how to behave on inter-frame navigation.
   */
  export enum FrameNavigationModel {
    SWF1 = 1,
    SWF9,
    SWF10
  }

  interface SoundClip {
    channel?;
    object: flash.media.Sound;
  }

  class MovieClipSoundsManager {
    private _mc: MovieClip;
    private _startSoundRegistrations: Map<any>;
    private _soundStream: MovieClipSoundStream;
    private _soundClips: Map<SoundClip>;

    constructor(mc: MovieClip) {
      this._mc = mc;
      this._startSoundRegistrations = null;
      this._soundStream = null;
    }

    registerStartSounds(frameNum: number, soundStartInfo) {
      if (this._startSoundRegistrations === null) {
        this._startSoundRegistrations = {};
      }
      this._startSoundRegistrations[frameNum] = soundStartInfo;
    }

    initSoundStream(streamInfo: any) {
      this._soundStream = new MovieClipSoundStream(streamInfo, this._mc);
    }

    addSoundStreamBlock(frameNum: number, streamBlock: Uint8Array) {
      if (this._soundStream) {
        this._soundStream.appendBlock(frameNum, streamBlock);
      }
    }

    private _startSounds(frameNum) {
      var starts = this._startSoundRegistrations[frameNum];
      if (starts) {
        var sounds = this._soundClips || (this._soundClips = {});
        var loaderInfo = this._mc.loaderInfo;
        for (var i = 0; i < starts.length; i++) {
          var start = starts[i];
          var symbolId = start.soundId;
          var info = start.soundInfo;
          var sound: SoundClip = sounds[symbolId];
          if (!sound) {
            var symbolInfo: Timeline.SoundSymbol = <Timeline.SoundSymbol>loaderInfo.getSymbolById(symbolId);
            if (!symbolInfo) {
              continue;
            }

            var symbolClass = symbolInfo.symbolClass;
            var soundObj = symbolClass.initializeFrom(symbolInfo);
            symbolClass.instanceConstructorNoInitialize.call(soundObj);
            sounds[symbolId] = sound = { object: soundObj };
          }
          if (sound.channel) {
            sound.channel.stop();
            sound.channel = null;
          }
          if (!info.stop) {
            // TODO envelope, in/out point
            var loops = info.hasLoops ? info.loopCount : 0;
            sound.channel = sound.object.play(0, loops);
          }
        }
      }
    }

    syncSounds(frameNum: number) {
      if (this._startSoundRegistrations !== null) {
        this._startSounds(frameNum);
      }
      if (this._soundStream) {
        this._soundStream.playFrame(frameNum);
      }
    }
  }

  export class MovieClip extends flash.display.Sprite implements IAdvancable {

    static frameNavigationModel: FrameNavigationModel;

    private static _callQueue: MovieClip [];

    // Called whenever the class is initialized.
    static classInitializer: any = function () {
      MovieClip.reset();

    };

    static reset() {
      MovieClip.frameNavigationModel = FrameNavigationModel.SWF10;
      MovieClip._callQueue = [];
    }

    // Called whenever an instance of the class is initialized.
    static initializer: any = function (symbol: Shumway.Timeline.SpriteSymbol) {
      var self: MovieClip = this;

      DisplayObject._advancableInstances.push(self);

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

      self._sounds = null;

      self._buttonFrames = Object.create(null);
      self._currentButtonState = null;

      if (symbol) {
        self._totalFrames = symbol.numFrames;
        self._currentFrame = 1;
        if (!symbol.isRoot) {
          self.addScene('', symbol.labels, 0, symbol.numFrames);
        }
        self._frames = symbol.frames;
        if (symbol.isAVM1Object) {
          if (symbol.frameScripts) {
            var avm1MovieClip = avm1lib.getAVM1Object(this);
            avm1MovieClip.context = symbol.avm1Context;
            var data = symbol.frameScripts;
            for (var i = 0; i < data.length; i += 2) {
              avm1MovieClip.addFrameScript(data[i], data[i + 1]);
            }
          }
          if (symbol.avm1Name) {
            self.name = symbol.avm1Name;
          }
        }
      } else {
        self.addScene('', [], 0, self._totalFrames);
      }
    };
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["currentLabels"];

    static runFrameScripts() {
      enterTimeline("MovieClip.executeFrame");
      var queue: MovieClip[] = MovieClip._callQueue;
      MovieClip._callQueue = [];
      for (var i = 0; i < queue.length; i++) {
        var instance = queue[i];

        if (instance._hasFlags(DisplayObjectFlags.NeedsLoadEvent)) {
          instance._removeFlags(DisplayObjectFlags.NeedsLoadEvent);
          instance.dispatchEvent(events.Event.getInstance(events.Event.AVM1_LOAD));
          continue;
        }

        instance._allowFrameNavigation = MovieClip.frameNavigationModel === FrameNavigationModel.SWF1;
        instance.callFrame(instance._currentFrame);
        instance._allowFrameNavigation = true;

        // If the destination frame isn't the same as before the `callFrame` operation, a frame
        // navigation has happened inside the frame script. In that case, we didn't immediately
        // run frame navigation as described in `_gotoFrameAbs`. Instead, we have to do it here.
        if (instance._nextFrame !== instance._currentFrame) {
          if (MovieClip.frameNavigationModel === FrameNavigationModel.SWF9) {
            instance._advanceFrame();
            instance._constructFrame();
            instance._removeFlags(DisplayObjectFlags.HasFrameScriptPending);
            instance.callFrame(instance._currentFrame);
          } else {
            DisplayObject.performFrameNavigation(false, true);
          }
        }
      }
      leaveTimeline();
    }

    constructor () {
      false && super();
      Sprite.instanceConstructorNoInitialize.call(this);
    }

    _addFrame(frameInfo: any) {
      var spriteSymbol = <Timeline.SpriteSymbol><any>this._symbol;
      var frames = spriteSymbol.frames;
      frames.push(frameInfo.frameDelta);
      if (frameInfo.labelName) {
        // Frame indices are 1-based, so use frames.length after pushing the frame.
        this.addFrameLabel(frameInfo.labelName, frames.length);
      }
      if (frameInfo.soundStreamHead) {
        this._initSoundStream(frameInfo.soundStreamHead);
      }
      if (frameInfo.soundStreamBlock) {
        // Frame indices are 1-based, so use frames.length after pushing the frame.
        this._addSoundStreamBlock(frames.length, frameInfo.soundStreamBlock);
      }
      if (spriteSymbol.isAVM1Object) {
        avm1lib.getAVM1Object(this).addFrameActionBlocks(frames.length - 1, frameInfo);
        if (frameInfo.exports) {
          var exports = frameInfo.exports;
          for (var i = 0; i < exports.length; i++) {
            var asset = exports[i];
            spriteSymbol.avm1Context.addAsset(asset.className, asset.symbolId, null);
          }
        }
      }
      if (frames.length === 1) {
        this._initializeChildren(frames[0]);
      }
    }

    _initFrame(advance: boolean) {
      if (advance) {
        if (this.buttonMode) {
          var state: string = null;
          if (this._mouseOver) {
            state = this._mouseDown ? '_down' : '_over';
          } else if (this._currentButtonState !== null) {
            state = '_up';
          }
          if (state !== this._currentButtonState && this._buttonFrames[state]) {
            this.stop();
            this._gotoFrame(state, null);
            this._currentButtonState = state;
            this._advanceFrame();
            return;
          }
        }
        if (this._totalFrames > 1 && !this._stopped &&
            this._hasFlags(DisplayObjectFlags.Constructed)) {
          this._nextFrame++;
        }
      }
      this._advanceFrame();
    }

    _constructFrame() {
      this._constructChildren();
    }

    _enqueueFrameScripts() {
      if (this._hasFlags(DisplayObjectFlags.NeedsLoadEvent)) {
        MovieClip._callQueue.push(this);
      }
      if (this._hasFlags(DisplayObjectFlags.HasFrameScriptPending)) {
        this._removeFlags(DisplayObjectFlags.HasFrameScriptPending);
        MovieClip._callQueue.push(this);
      }
      super._enqueueFrameScripts();
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

    private _sounds: MovieClipSoundsManager;

    private _buttonFrames: Shumway.Map<number>;
    private _currentButtonState: string;

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
      var label: FrameLabel = this._labelForFrame(this._currentFrame);
      return label ? label.name : null;
    }

    get currentFrameLabel(): string {
      var scene = this._sceneForFrameIndex(this._currentFrame);
      var label = scene.getLabelByFrame(this._currentFrame - scene.offset);
      return label && label.name;
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

    /**
     * Implementation for both gotoAndPlay and gotoAndStop.
     *
     * Technically, we should throw all errors from those functions directly so the stack is
     * correct.
     * We might at some point do that by explicitly inlining this function using some build step.
     */
    private _gotoFrame(frame: string, sceneName: string): void {
      var scene: Scene;
      if (sceneName !== null) {
        sceneName = asCoerceString(sceneName);
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

      // Amazingly, the `frame` argument, while first coerced to string, is then interpreted as a
      // frame index even if a label with the same name exists.
      /* tslint:disable */
      var frameNum = parseInt(frame, 10);
      if (<any>frameNum != frame) { // TypeScript doesn't like using `==` for number,string vars.
        var legacyMode = MovieClip.frameNavigationModel === FrameNavigationModel.SWF1 ||
                         MovieClip.frameNavigationModel === FrameNavigationModel.SWF9;
        var label = scene.getLabelByName(frame, legacyMode);
        if (!label) {
          if (legacyMode) {
            return; // noop for SWF9 and below
          }
          throwError('ArgumentError', Errors.FrameLabelNotFoundError, frame, sceneName);
        }
        frameNum = label.frame;
      }
      /* tslint:enable */
      this._gotoFrameAbs(scene.offset + frameNum);
    }

    private _gotoFrameAbs(frame: number): void {
      if (frame < 1) {
        frame = 1;
      } else if (frame > this._totalFrames) {
        frame = this._totalFrames;
      }
      if (frame === this._nextFrame) {
        return;
      }

      this._nextFrame = frame;

      // Frame navigation only happens immediately if not triggered from under a frame script.
      if (this._allowFrameNavigation) {
        if (MovieClip.frameNavigationModel === FrameNavigationModel.SWF9) {
          // In FP 9, the only thing that happens on inter-frame navigation is advancing the frame
          // and constructing new timeline objects.
          this._advanceFrame();
          this._constructFrame();
        } else {
          // Frame navigation in an individual timeline triggers an iteration of the whole
          // frame navigation cycle in FP 10+. This includes broadcasting frame events to *all*
          // display objects.
          DisplayObject.performFrameNavigation(false, true);
        }
      }
    }

    private _advanceFrame(): void {
      var currentFrame = this._currentFrame;
      var nextFrame = this._nextFrame;

      if (nextFrame > this._totalFrames) {
        nextFrame = 1;
      }

      if (currentFrame === nextFrame) {
        // If nextFrame was > this._totalFrames, it has to be written back here, otherwise it'll
        // just be incremented ever further.
        this._nextFrame = nextFrame;
        return;
      }

      if (nextFrame > this.framesLoaded) {
        // If nextFrame was > this._totalFrames, it has to be written back here, otherwise it'll
        // just be incremented ever further.
        this._nextFrame = nextFrame;
        // TODO
        return;
      }

      var frames = this._frames;
      var startIndex = currentFrame;
      var currentFrameDelta = frames[currentFrame - 1];

      if (nextFrame < currentFrame) {
        var frame = frames[0];
        release || assert (frame, "FrameDelta is not defined.");
        if (frame !== currentFrameDelta) {
          var stateAtDepth = frame.stateAtDepth;
          var children = this._children.slice();
          for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var childDepth = child._depth;
            if (childDepth) {
              // We need to scan all past states to check if we can keep the child.
              var state: Timeline.AnimationState;
              for (var j = nextFrame - 1; j >= 0 && !state; j--) {
                state = frames[j].stateAtDepth[childDepth];
              }
              if (!state ||
                  !(state.canBeReused(child) || state.canBeAnimated(child))) {
                this._removeAnimatedChild(child);
              }
            }
          }
        }
        startIndex = 0;
      }

      for (var i = startIndex; i < nextFrame; i++) {
        var frame = frames[i];
        release || assert (frame, "FrameDelta is not defined.");
        if (frame === currentFrameDelta) {
          continue;
        }
        currentFrameDelta = frame;
        var stateAtDepth = frame.stateAtDepth;
        for (var depth in stateAtDepth) {
          var child = this.getTimelineObjectAtDepth(depth | 0);
          var state = stateAtDepth[depth];
          // Eagerly create the symbol here, because it's needed in the canBeAnimated check below.
          if (state && state.symbolId > -1 && !state.symbol) {
            var ownSymbol = <Timeline.SpriteSymbol>this._symbol;
            state.symbol = <Timeline.DisplaySymbol>ownSymbol.loaderInfo.getSymbolById(state.symbolId);
          }
          if (child) {
            if (state && state.canBeAnimated(child)) {
              if (state.symbol && !state.symbol.dynamic) {
                // TODO: Handle http://wahlers.com.br/claus/blog/hacking-swf-2-placeobject-and-ratio/.
                child._setStaticContentFromSymbol(state.symbol);
              }
              child._animate(state);
              continue;
            }
            if (state && state.canBeReused(child)) {
              continue;
            }
            this._removeAnimatedChild(child);
          }
          if (state && state.symbolId > -1) {
            var character = this.createAnimatedDisplayObject(state, false);
            this.addTimelineObjectAtDepth(character, state.depth);
            if (state.symbol.isAVM1Object) {
              avm1lib.initializeAVM1Object(character, state);
            }
          }
        }
        var soundStarts = frame.soundStarts;
        if (soundStarts) {
          this._registerStartSounds(i + 1, soundStarts);
        }
      }

      if (this._frameScripts[nextFrame]) {
        this._setFlags(DisplayObjectFlags.HasFrameScriptPending);
        this._parent && this._propagateFlagsUp(DisplayObjectFlags.ContainsFrameScriptPendingChildren);
      }

      this._currentFrame = this._nextFrame = nextFrame;

      this._syncSounds(nextFrame);
    }

    /**
     * Because that's how it's mostly used, the current frame is stored as an offset into the
     * entire timeline. Sometimes, we need to know which scene it falls into. This utility
     * function answers that.
     */
    private _sceneForFrameIndex(frameIndex: number) : Scene {
      var scenes = this._scenes;
      // A gotoAnd* might be invoked by script before the first advanceFrame call. In that case,
      // _currentFrame is 0, which means this function is called with frameIndex being 0.
      // We just return the first scene in that case.
      if (frameIndex === 0) {
        return scenes[0];
      }
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
        //child._removeReference();
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
      // Argument handling for gotoAnd* is a bit peculiar:
      // - too many arguments throw just as too few do
      // - the `sceneName` argument is coerced first
      // - the `frame` argument is coerced to string, but `undefined` results in `"null"`
      if (arguments.length === 0 || arguments.length > 2) {
        throwError('ArgumentError', Errors.WrongArgumentCountError,
                   'flash.display::MovieClip/gotoAndPlay()', 1, arguments.length);
      }
      scene = asCoerceString(scene);
      frame = asCoerceString(frame) + ''; // The asCoerceString returns `null` for `undefined`.
      this.play();
      this._gotoFrame(frame, scene);
    }

    gotoAndStop(frame: any, scene: string = null): void {
      // See comment in gotoAndPlay for an explanation of the arguments handling stuff.
      if (arguments.length === 0 || arguments.length > 2) {
        throwError('ArgumentError', Errors.WrongArgumentCountError,
                   'flash.display::MovieClip/gotoAndPlay()', 1, arguments.length);
      }
      scene = asCoerceString(scene);
      frame = asCoerceString(frame) + ''; // The asCoerceString returns `null` for `undefined`.
      this.stop();
      this._gotoFrame(frame, scene);
    }

    /**
     * Takes pairs of `frameIndex`, `script` arguments and adds the `script`s to the `_frameScripts`
     * Array.
     *
     * Undocumented method used to implement the old timeline concept in AS3.
     */
    addFrameScript(frameIndex: number, script: (any?) => any /*, ...*/): void {
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
      var totalFrames = this._totalFrames;
      for (var i = 0; i < numArgs; i += 2) {
        var frameNum = (arguments[i] | 0) + 1;
        if (frameNum < 1 || frameNum > totalFrames) {
          continue;
        }
        frameScripts[frameNum] = arguments[i + 1];
        if (frameNum === this._currentFrame) {
          this._setFlags(DisplayObjectFlags.HasFrameScriptPending);
          this._parent && this._propagateFlagsUp(DisplayObjectFlags.ContainsFrameScriptPendingChildren);
        }
      }
    }

    get _avm1SymbolClass(): any {
      return (this._symbol &&
              (<Timeline.SpriteSymbol>this._symbol).avm1SymbolClass) || null;
    }

    get _isFullyLoaded(): boolean {
      return this.framesLoaded >= this.totalFrames;
    }

    _registerStartSounds(frameNum: number, soundStartInfo) {
      if (this._sounds === null) {
        this._sounds = new MovieClipSoundsManager(this);
      }
      this._sounds.registerStartSounds(frameNum, soundStartInfo);
    }

    _initSoundStream(streamInfo: any) {
      if (this._sounds === null) {
        this._sounds = new MovieClipSoundsManager(this);
      }
      this._sounds.initSoundStream(streamInfo);
    }

    _addSoundStreamBlock(frameNum: number, streamBlock: any) {
      this._sounds.addSoundStreamBlock(frameNum, streamBlock);
    }

    private _syncSounds(frameNum: number) {
      if (this._sounds !== null) {
        this._sounds.syncSounds(frameNum);
      }
    }

    addScene(name: string, labels: any [], offset: number, numFrames: number): void {
      this._scenes.push(new Scene(name, labels, offset, numFrames));
    }

    addFrameLabel(name: string, frame: number): void {
      var scene = this._sceneForFrameIndex(frame);
      if (!scene.getLabelByName(name, false)) {
        scene.labels.push(new flash.display.FrameLabel(name, frame - scene.offset));
      }
    }

    prevScene(): void {
      var currentScene = this._sceneForFrameIndex(this._currentFrame);
      if (currentScene.offset === 0) {
        return;
      }
      // Since scene offsets are 0-based, the current scene's offset, treated as a frame index,
      // is the previous scene's last frame.
      this._gotoFrameAbs(this._sceneForFrameIndex(currentScene.offset).offset + 1);
    }

    nextScene(): void {
      var currentScene = this._sceneForFrameIndex(this._currentFrame);
      if (currentScene.offset + currentScene.numFrames === this._totalFrames) {
        return;
      }
      this._gotoFrameAbs(currentScene.offset + currentScene.numFrames + 1);
    }
  }
}
