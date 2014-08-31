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

    addSoundStreamBlock(frameNum: number, streamBlock: any) {
      this._soundStream.appendBlock(frameNum, streamBlock);
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

    private static _callQueue: MovieClip [];

    // Called whenever the class is initialized.
    static classInitializer: any = function () {
      MovieClip.reset();

    };

    static reset() {
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
        if (symbol.isAS2Object) {
          this._mouseEnabled = false;
          if (symbol.frameScripts) {
            var data = symbol.frameScripts;
            for (var i = 0; i < data.length; i += 2) {
              self.addAS2FrameScript(data[i], data[i + 1]);
            }
          }
        }
        if (symbol.initActionBlock) {
          this.addAS2InitActionBlock(0, symbol.initActionBlock);
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

        instance._allowFrameNavigation = false;
        instance.callFrame(instance._currentFrame);
        instance._allowFrameNavigation = true;

        // Frame navigation is only triggered if the MovieClip is on stage.
        if (instance._nextFrame !== instance._currentFrame && instance.stage) {
          DisplayObject.performFrameNavigation(instance.stage, false, true);
        }
      }
      leaveTimeline();
    }

    constructor () {
      false && super();
      Sprite.instanceConstructorNoInitialize.call(this);
    }

    _setParent(parent: DisplayObjectContainer, depth: number) {
      super._setParent(parent, depth);
      if (parent && this._hasAnyFlags(DisplayObjectFlags.HasFrameScriptPending |
                                      DisplayObjectFlags.ContainsFrameScriptPendingChildren)) {
        parent._propagateFlagsUp(DisplayObjectFlags.ContainsFrameScriptPendingChildren);
      }
    }

    _initFrame(advance: boolean) {
      if (advance && this.buttonMode) {
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
      if (advance) {
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

    _as2SymbolClass;
    private _boundExecuteAS2FrameScripts: () => void;
    private _as2FrameScripts: AVM1.AS2ActionsData[][];

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
        var label = scene.getLabelByName(frame);
        if (!label) {
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

      // Frame navigation is only triggered if the MovieClip is on stage.
      if (this._allowFrameNavigation && this.stage) { // TODO: also check if ActionScriptVersion < 3
        // TODO test inter-frame navigation behaviour for SWF versions < 10
        DisplayObject.performFrameNavigation(this.stage, false, true);
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
          var child = this.getTimelineObjectAtDepth(depth | 0);
          var state = stateAtDepth[depth];
          if (child) {
            if (state && state.canBeAnimated(child)) {
              if (state.symbol && !state.symbol.dynamic) {
                // TODO: Handle http://wahlers.com.br/claus/blog/hacking-swf-2-placeobject-and-ratio/.
                child._setStaticContentFromSymbol(state.symbol);
              }
              child._animate(state);
              continue;
            }
            this._removeAnimatedChild(child);
          }
          if (state && state.symbol) {
            var character = DisplayObject.createAnimatedDisplayObject(state, false);
            this.addTimelineObjectAtDepth(character, state.depth);
            if (state.symbol.isAS2Object) {
              this._initAvm1Bindings(character, state);
            }
          }
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

    addAS2FrameScript(frameIndex: number, actionsBlock: Uint8Array): void {
      var frameScripts = this._as2FrameScripts;
      if (!frameScripts) {
        release || assert(!this._boundExecuteAS2FrameScripts);
        this._boundExecuteAS2FrameScripts = this._executeAS2FrameScripts.bind(this);
        frameScripts = this._as2FrameScripts = [];
      }
      var scripts: AVM1.AS2ActionsData[] = frameScripts[frameIndex + 1];
      if (!scripts) {
        scripts = frameScripts[frameIndex + 1] = [];
        this.addFrameScript(frameIndex, this._boundExecuteAS2FrameScripts);
      }
      var actionsData = new AVM1.AS2ActionsData(actionsBlock,
                                                'f' + frameIndex + 'i' + scripts.length);
      scripts.push(actionsData);
    }

    /**
     * InitActionBlocks are executed once, before the children are initialized for a frame.
     * That matches AS3's enterFrame event, so we can add an event listener that just bails
     * as long as the target frame isn't reached, and executes the InitActionBlock once it is.
     *
     * After that, the listener removes itself.
     */
    addAS2InitActionBlock(frameIndex: number, actionsBlock: {actionsData: Uint8Array}): void {
      var self: MovieClip = this;
      function listener (e) {
        if (self._currentFrame !== frameIndex + 1) {
          return;
        }
        self.removeEventListener('enterFrame', listener);

        var avm1Context = self.loaderInfo._avm1Context;
        var as2Object = avm1lib.getAS2Object(self);
        var stage = self.stage;
        var actionsData = new AVM1.AS2ActionsData(actionsBlock.actionsData, 'f' + frameIndex);
        avm1Context.executeActions(actionsData, stage, as2Object);
      }
      this.addEventListener('enterFrame', listener);
    }

    private _executeAS2FrameScripts() {
      var avm1Context = this.loaderInfo._avm1Context;
      var as2Object = avm1lib.getAS2Object(this);
      var scripts: AVM1.AS2ActionsData[] = this._as2FrameScripts[this._currentFrame];
      release || assert(scripts && scripts.length);
      for (var i = 0; i < scripts.length; i++) {
        var actionsData = scripts[i];
        avm1Context.executeActions(actionsData, this.stage, as2Object);
      }
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

    _addSoundStreamBlock(frameIndex: number, streamBlock: any) {
      this._sounds.addSoundStreamBlock(frameIndex + 1, streamBlock);
    }

    private _syncSounds(frameNum: number) {
      if (this._sounds !== null) {
        this._sounds.syncSounds(frameNum + 1);
      }
    }

    addScene(name: string, labels: any [], offset: number, numFrames: number): void {
      this._scenes.push(new Scene(name, labels, offset, numFrames));
    }

    addFrameLabel(name: string, frame: number): void {
      var scene = this._sceneForFrameIndex(frame);
      if (!scene.getLabelByName(name)) {
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
