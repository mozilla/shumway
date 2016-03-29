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
  import assert = Shumway.Debug.assert;
  import assertUnreachable = Shumway.Debug.assertUnreachable;
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  import isNullOrUndefined = Shumway.isNullOrUndefined;
  import clamp = Shumway.NumberUtilities.clamp;
  import Telemetry = Shumway.Telemetry;
  import events = flash.events;
  import Multiname = Shumway.AVMX.Multiname;

  import SwfTagCode = Shumway.SWF.Parser.SwfTagCode;
  import SoundInfoFlags = Shumway.SWF.Parser.SoundInfoFlags;

  /**
   * Controls how to behave on inter-frame navigation.
   */
  export const enum FrameNavigationModel {
    SWF1  =  1,
    SWF9  =  9,
    SWF10 = 10
  }

  interface SoundClip {
    channel?;
    object: flash.media.Sound;
  }

  class MovieClipSoundsManager {
    private _mc: MovieClip;
    private _startSoundRegistrations: MapObject<any>;
    private _soundStream: MovieClipSoundStream;
    private _soundClips: MapObject<SoundClip>;

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
            var symbolInfo = <flash.media.SoundSymbol>loaderInfo.getSymbolById(symbolId);
            if (!symbolInfo) {
              continue;
            }

            var symbolClass = symbolInfo.symbolClass;
            var soundObj = constructClassFromSymbol(symbolInfo, symbolClass);
            sounds[symbolId] = sound = { object: soundObj };
          }
          var stop = info.flags & SoundInfoFlags.Stop;
          if (sound.channel && stop) {
            sound.channel.stop();
            sound.channel = null;
          }
          if (!stop && (!sound.channel || !sound.channel.playing)) {
            // TODO envelope, in/out point
            var loops = info.flags & SoundInfoFlags.HasLoops ? info.loopCount : 0;
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

  export interface FrameScript {
    (any?): any;
    precedence?: number[];
    context?: MovieClip;
  }

  function compareFrameScripts(a: FrameScript, b: FrameScript): number {
    if (!a.precedence) {
      return !b.precedence ? 0 : -1;
    } else if (!b.precedence) {
      return 1;
    }
    var i = 0;
    while (i < a.precedence.length && i < b.precedence.length &&
    a.precedence[i] === b.precedence[i]) {
      i++;
    }
    if (i >= a.precedence.length) {
      return a.precedence.length === b.precedence.length ? 0 : -1;
    } else {
      return i >= b.precedence.length ? 1 : a.precedence[i] - b.precedence[i];
    }
  }
  
  export class MovieClip extends flash.display.Sprite implements IAdvancable {

    static frameNavigationModel: FrameNavigationModel;

    static axClass: typeof MovieClip;

    private static _callQueue: MovieClip [];

    // Called whenever the class is initialized.
    static classInitializer() {
      this.reset();
    }

    static reset() {
      this.frameNavigationModel = FrameNavigationModel.SWF10;
      this._callQueue = [];
    }

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["currentLabels"];

    static runFrameScripts() {
      enterTimeline("MovieClip.executeFrame");
      var movieClipClass = this.sec.flash.display.MovieClip.axClass;
      var displayObjectClass = this.sec.flash.display.DisplayObject.axClass;
      var queue: MovieClip[] = movieClipClass._callQueue;
      movieClipClass._callQueue = [];

      for (var i = 0; i < queue.length; i++) {
        var instance = queue[i];

        instance._allowFrameNavigation = false;
        instance.callFrame(instance._currentFrame);
        instance._allowFrameNavigation = true;

        // If the destination frame isn't the same as before the `callFrame` operation, a frame
        // navigation has happened inside the frame script. In that case, we didn't immediately
        // run frame navigation as described in `_gotoFrameAbs`. Instead, we have to do it here.
        if (instance._nextFrame !== instance._currentFrame) {
          if (movieClipClass.frameNavigationModel === FrameNavigationModel.SWF9) {
            instance._advanceFrame();
            instance._constructFrame();
            instance._removeFlags(DisplayObjectFlags.HasFrameScriptPending);
            instance.callFrame(instance._currentFrame);
          } else {
            displayObjectClass.performFrameNavigation(false, true);
          }
        }
      }

      leaveTimeline();
    }

    static runAvm1FrameScripts() {
      enterTimeline("MovieClip.runAvm1FrameScripts");
      var movieClipClass = this.sec.flash.display.MovieClip.axClass;
      var displayObjectClass = this.sec.flash.display.DisplayObject.axClass;
      var queue: MovieClip[] = movieClipClass._callQueue;
      movieClipClass._callQueue = [];
      var unsortedScripts: FrameScript [] = [];

      for (var i = 0; i < queue.length; i++) {
        var instance = queue[i];
        instance.queueAvm1FrameScripts(instance._currentFrame, unsortedScripts);
      }

      if (unsortedScripts.length) {
        unsortedScripts.sort(compareFrameScripts);

        for (var i = 0; i < queue.length; i++) {
          var instance = queue[i];
          instance._allowFrameNavigation = false;
        }

        var frameScripts = unsortedScripts;
        for (var i = 0; i < frameScripts.length; i++) {
          var script = frameScripts[i];
          var mc = script.context;
          release || assert(mc);
          script.call(mc);
        }

        for (var i = 0; i < queue.length; i++) {
          var instance = queue[i];
          instance._allowFrameNavigation = true;
          if (instance._nextFrame !== instance._currentFrame) {
            displayObjectClass.performFrameNavigation(false, true);
          }
        }
      }

      leaveTimeline();
    }

    applySymbol() {
      super.applySymbol();
      this.sec.flash.display.DisplayObject.axClass._advancableInstances.push(this);
      var symbol = this._symbol;
      this._totalFrames = symbol.numFrames;
      this._currentFrame = 1;
      if (!symbol.isRoot) {
        this.addScene('', symbol.labels, 0, symbol.numFrames);
      }
      this._frames = symbol.frames;
      if (symbol.isAVM1Object) {
        if (symbol.avm1Name) {
          this.name = symbol.avm1Name;
        }
      }
    }

    // This method is called when children are being constructed and AVM1 scripts
    // is about to be run.
    private _initAvm1Data() {
      var symbol = this._symbol;
      var frames = symbol.frames;
      if (frames) {
        for (var i = 0; i < frames.length; i++) {
          var frameInfo = frames[i];
          this._initAvm1FrameData(i, frameInfo);
        }
      }
    }

    // Adds missing AVM1 scripts data to the AS3 object frameScripts and events.
    private _initAvm1FrameData(frameIndex: number, frameInfo: any): void  {
      var symbol = this._symbol;
      var avm1Context = symbol.avm1Context;
      if (frameInfo.exports) {
        var exports = frameInfo.exports;
        for (var i = 0; i < exports.length; i++) {
          var asset = exports[i];
          avm1Context.addAsset(asset.className, asset.symbolId, null);
        }
      }

      var initActionBlocks = frameInfo.initActionBlocks;
      if (initActionBlocks) {
        this._addAvm1InitActionBlocks(frameIndex, initActionBlocks);
      }

      var actionBlocks = frameInfo.actionBlocks;
      if (actionBlocks) {
        this._addAvm1FrameScripts(frameIndex, actionBlocks);
      }
    }

    private _addAvm1FrameScripts(frameIndex: number,
                                 actionsBlocks: SWF.ActionBlock[]): void {
      for (var i = 0; i < actionsBlocks.length; i++) {
        var actionsBlock = actionsBlocks[i];
        var symbol = this._symbol;
        var avm1Context = symbol.avm1Context;
        var actionsData = avm1Context.actionsDataFactory.createActionsData(
          actionsBlock.actionsData, 's' + symbol.id + 'f' + frameIndex + 'i' + i);
        var script: FrameScript = function (actionsData) {
          var as2MovieClip = AVM1.Lib.getAVM1Object(this, avm1Context);
          avm1Context.executeActions(actionsData, as2MovieClip);
        }.bind(this, actionsData);
        script.precedence = this._getScriptPrecedence().concat(actionsBlock.precedence);
        this.addFrameScript(frameIndex, script);
      }
    }

    /**
     * AVM1 InitActionBlocks are executed once, before the children are initialized for a frame.
     * That matches AS3's enterFrame event, so we can add an event listener that just bails
     * as long as the target frame isn't reached, and executes the InitActionBlock once it is.
     *
     * After that, the listener removes itself.
     */
    private _addAvm1InitActionBlocks(frameIndex: number,
                                     actionsBlocks: SWF.InitActionBlock[]): void
    {
      function executeInitActions() {
        var symbol = self._symbol;
        var avm1Context = symbol.avm1Context;
        var as2MovieClip = AVM1.Lib.getAVM1Object(self, avm1Context);
        for (var i = 0; i < actionsBlocks.length; i++) {
          var actionsData = avm1Context.actionsDataFactory.createActionsData(
            actionsBlocks[i].actionsData, 's' + symbol.id + 'f' + frameIndex + 'i' + i);
          avm1Context.executeActions(actionsData, as2MovieClip);
        }
      }

      var self = this;
      if (this.currentFrame === frameIndex + 1) {
        executeInitActions();
        return;
      }
      var enterFrameListener = function () {
        if (self.currentFrame !== frameIndex + 1) {
          return;
        }
        self.removeEventListener('enterFrame', enterFrameListener);
        executeInitActions();
      };
      this.addEventListener('enterFrame', enterFrameListener);
    }

    /**
     * Field holding the as2 object associated with this MovieClip instance.
     *
     * This field is only ever populated by the AVM1 runtime, so can only be used for MovieClips
     * used in the implementation of an AVM1 display list.
     */
    private _as2Object: AVM1.Lib.AVM1MovieClip;

    removeChildAt(index: number): DisplayObject {
      var child = super.removeChildAt(index);
      if (this._as2Object && child._name) {
        var avm1Child = AVM1.Lib.getAVM1Object(child, this._as2Object.context);
        // Not all display objects are reflected in AVM1, so not all need to be removed.
        avm1Child && this._as2Object._removeChildName(avm1Child, child._name);
      }
      return child;
    }

    constructor () {
      super();
      if (!this._fieldsInitialized) {
        this._initializeFields();
      }
    }

    protected _initializeFields() {
      super._initializeFields();
      this._currentFrame = 0;
      this._totalFrames = 1;
      this._trackAsMenu = false;
      this._scenes = [];
      if (!this._symbol) {
        this.addScene('', [], 0, 1);
      }
      this._enabled = true;
      this._isPlaying = false;

      this._frames = [];
      this._frameScripts = [];
      this._nextFrame = 1;
      this._stopped = false;
      this._allowFrameNavigation = true;

      this._sounds = null;

      this._buttonFrames = Object.create(null);
      this._currentButtonState = null;
    }

    _addFrame(frameInfo: any) {
      var spriteSymbol = <flash.display.SpriteSymbol><any>this._symbol;
      var frames = spriteSymbol.frames;
      frames.push(frameInfo);
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
      if (spriteSymbol.isAVM1Object && this._hasFlags(DisplayObjectFlags.Constructed)) {
        var avm1Context = spriteSymbol.avm1Context;
        this._initAvm1FrameData(frames.length - 1, frameInfo);
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

      if (this._symbol && this._symbol.isAVM1Object &&
          !this._hasFlags(DisplayObjectFlags.Constructed)) {
        this._initAvm1Data();
      }
    }

    _constructFrame() {
      this._constructChildren();
    }

    _enqueueFrameScripts() {
      var addToCallQueue = false;
      if (this._hasFlags(DisplayObjectFlags.NeedsLoadEvent)) {
        addToCallQueue = true;
      }
      if (this._hasFlags(DisplayObjectFlags.HasFrameScriptPending)) {
        this._removeFlags(DisplayObjectFlags.HasFrameScriptPending);
        addToCallQueue = true;
      }
      if (addToCallQueue) {
        this.sec.flash.display.MovieClip.axClass._callQueue.push(this);
      }
      super._enqueueFrameScripts();
    }

    // JS -> AS Bindings

    
    // AS -> JS Bindings
    
    private _currentFrame: number;
    private _nextFrame: number;
    private _totalFrames: number;
    private _frames: Shumway.SWF.SWFFrame[];
    private _frameScripts: any;
    private _scenes: Scene[];

    private _enabled: boolean;
    private _isPlaying: boolean;
    private _stopped: boolean;

    private _trackAsMenu: boolean;
    private _allowFrameNavigation: boolean;

    private _sounds: MovieClipSoundsManager;

    private _buttonFrames: Shumway.MapObject<number>;
    private _currentButtonState: string;

    get currentFrame(): number /*int*/ {
      var frame = this._currentFrame;
      if (!this._allowFrameNavigation &&
          this.sec.flash.display.MovieClip.axClass.frameNavigationModel === FrameNavigationModel.SWF1) {
        // AVM1 needs to return a frame we already navigated during scripts execution.
        frame = this._nextFrame;
      }
      return frame - this._sceneForFrameIndex(frame).offset;
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

    get scenes(): ASArray /* flash.display [] */ {
      var scenes = this._scenes ? this._scenes.map(function (x: flash.display.Scene) {
        return x.clone();
      }) : [];
      return this.sec.createArrayUnsafe(scenes);
    }

    get currentScene(): Scene {
      var scene = this._sceneForFrameIndex(this._currentFrame);
      return scene.clone();
    }

    get currentLabel(): string {
      var label: FrameLabel = this._labelForFrame(this._currentFrame);
      return label ? label.name : null;
    }

    get currentLabels(): {value: FrameLabel[]} {
      return this._sceneForFrameIndex(this._currentFrame).labels;
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
     * Resolves frame and scene into absolute frame number. If scene is not specified,
     * the current scene is used. In legacy mode, it might return `undefined` if frame/scene
     * was not found.
     */
    _getAbsFrameNumber(frame: string, sceneName: string): number {
      var navigationModel = this.sec.flash.display.MovieClip.axClass.frameNavigationModel;
      var legacyMode = navigationModel !== FrameNavigationModel.SWF10;
      var scene: Scene;
      if (sceneName !== null) {
        sceneName = axCoerceString(sceneName);
        var scenes = this._scenes;
        release || assert (scenes.length, "There should be at least one scene defined.");
        for (var i = 0; i < scenes.length; i++) {
          scene = scenes[i];
          if (scene.name === sceneName) {
            break;
          }
        }
        if (i === scenes.length) {
          if (legacyMode) {
            return undefined; // noop for SWF9 and below
          }
          this.sec.throwError('ArgumentError', Errors.SceneNotFoundError, sceneName);
        }
      } else {
        scene = this._sceneForFrameIndex(this._currentFrame);
      }

      // Amazingly, the `frame` argument, while first coerced to string, is then interpreted as a
      // frame index even if a label with the same name exists.
      /* tslint:disable */
      var frameNum = parseInt(frame, 10);
      if (<any>frameNum != frame) { // TypeScript doesn't like using `==` for number,string vars.
        var label = scene.getLabelByName(frame, legacyMode);
        if (!label) {
          if (legacyMode) {
            return undefined; // noop for SWF9 and below
          }
          this.sec.throwError('ArgumentError', Errors.FrameLabelNotFoundError, frame,
                                         sceneName);
        }
        frameNum = label.frame;
      }
      /* tslint:enable */
      return scene.offset + frameNum;
    }

    /**
     * Implementation for both gotoAndPlay and gotoAndStop.
     *
     * Technically, we should throw all errors from those functions directly so the stack is
     * correct.
     * We might at some point do that by explicitly inlining this function using some build step.
     */
    private _gotoFrame(frame: string, sceneName: string): void {
      var frameNum = this._getAbsFrameNumber(frame, sceneName);
      if (frameNum === undefined) {
        return;
      }
      this._gotoFrameAbs(frameNum);
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
        if (this.sec.flash.display.MovieClip.axClass.frameNavigationModel === FrameNavigationModel.SWF9) {
          // In FP 9, the only thing that happens on inter-frame navigation is advancing the frame
          // and constructing new timeline objects.
          this._advanceFrame();
          this._constructFrame();
        } else {
          // Frame navigation in an individual timeline triggers an iteration of the whole
          // frame navigation cycle in FP 10+. This includes broadcasting frame events to *all*
          // display objects.
          this.sec.flash.display.DisplayObject.axClass.performFrameNavigation(false, true);
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

      var currentSwfFrame = this._frames[currentFrame - 1];
      var nextSwfFrame = this._frames[nextFrame - 1];

      if (nextSwfFrame !== currentSwfFrame) {
        this._seekToFrame(nextFrame);

        if (nextSwfFrame.controlTags) {
          var tags = nextSwfFrame.controlTags;
          var soundStarts: Shumway.Timeline.SoundStart[];
          for (var i = 0; i < tags.length; i++) {
            var tag: any = tags[i];
            // controlTags might contain parsed and unparsed tags.
            if (tag.tagCode === SwfTagCode.CODE_START_SOUND ||
                tag.tagCode === SwfTagCode.CODE_VIDEO_FRAME) {
              var loaderInfo = (<SpriteSymbol>this._symbol).loaderInfo;
              tag = <any>loaderInfo._file.getParsedTag(tag);
            }
            if (tag.code === SwfTagCode.CODE_START_SOUND) {
              if (!soundStarts) {
                soundStarts = [];
              }
              soundStarts.push(new Shumway.Timeline.SoundStart(tag.soundId, tag.soundInfo));
            } else if (tag.tagCode === SwfTagCode.CODE_VIDEO_FRAME) {
              // tag.videoData contains a video frame for the video stream symbol with id == tag.streamId.
              // TODO: Do something useful with that information :).
            }
          }
          if (soundStarts) {
            this._registerStartSounds(nextFrame, soundStarts);
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

    private _seekToFrame(frame: number) {
      var currentFrame = this._currentFrame;
      var frames = this._frames;

      if (frame === currentFrame + 1) {
        var nextSwfFrame = frames[frame - 1];
        if (nextSwfFrame.controlTags) {
          this._processControlTags(nextSwfFrame.controlTags, false);
        }
        return;
      }

      var currentSwfFrame = frames[currentFrame - 1];
      var loaderInfo = (<SpriteSymbol>this._symbol).loaderInfo;
      var backwards = frame < currentFrame;
      var controlTags = [];
      var removedObjects: { [key: string]: boolean; };

      // We scan all control tags in reverse order and make sure we only apply those related to
      // objects that exist in the new frame.
      var i = frame;
      var n = backwards ? 0 : currentFrame;
      while (i-- > n) {
        var swfFrame = frames[i];
        if (swfFrame === currentSwfFrame) {
          continue;
        }
        currentSwfFrame = swfFrame;
        var tags = swfFrame.controlTags;
        if (!tags) {
          continue;
        }
        var j = tags.length;
        while (j--) {
          // We may have a mix of the parsed and unparsed tags.
          var parsedOrUnparsedTag = tags[j];
          var tag = parsedOrUnparsedTag.tagCode === undefined ?
                    parsedOrUnparsedTag : <any>loaderInfo._file.getParsedTag(parsedOrUnparsedTag);
          switch (tag.code) {
            case SwfTagCode.CODE_REMOVE_OBJECT:
            case SwfTagCode.CODE_REMOVE_OBJECT2:
              if (!removedObjects) {
                removedObjects = Object.create(null);
              }
              removedObjects[tag.depth] = true;
              if (!backwards) {
                controlTags.push(tag);
              }
              break;
            case SwfTagCode.CODE_PLACE_OBJECT:
            case SwfTagCode.CODE_PLACE_OBJECT2:
            case SwfTagCode.CODE_PLACE_OBJECT3:
              if (!(removedObjects && removedObjects[tag.depth])) {
                controlTags.push(tag);
              }
              break;
            default:
              controlTags.push(tag);
          }
        }
      }
      // Bring the order back to normal.
      controlTags.reverse();

      this._processControlTags(controlTags, backwards);
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
        var labels = scene.labels.value;
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

    callFrame(frame: number): void {
      frame = frame | 0;
      var frameScripts = this._frameScripts[frame];
      if (!frameScripts) {
        return;
      }

      for (var i = 0; i < frameScripts.length; i++) {
        var script = frameScripts[i];
        try {
          script.call(this); // REDUX ? why it was frameScript.$Bgcall(thisArg);
        } catch (e) {
          Telemetry.instance.reportTelemetry({ topic: 'error', error: Telemetry.ErrorTypes.AVM2_ERROR });

          //if ($DEBUG) {
          //  console.error('error ' + e + ', stack: \n' + e.stack);
          //}

          this.stop();
          throw e;
        }
      }
    }

    queueAvm1FrameScripts(frame: number, queue: Array<FrameScript>): void {
      // AVM1 action blocks must be executed exactly in the same order they appear in the SWF
      // file. We keep track of the position for each action block at parsing time and carry that
      // information on to their wrapping functions (via the precedence property). Here we queue
      // up all such functions so we can sort and execute them after this loop.
      if (this._hasFlags(DisplayObjectFlags.NeedsLoadEvent)) {
        this._removeFlags(DisplayObjectFlags.NeedsLoadEvent);
        release || assert(this._symbol);
        var handler = function () {
          var eventClass = this.sec.flash.events.Event.axClass;
          this.dispatchEvent(eventClass.getInstance(events.Event.AVM1_LOAD));
        }.bind(this);
        handler.precedence = this._getScriptPrecedence();
        handler.context = this;
        queue.push(handler);
      }
      var frameScripts = this._frameScripts[frame];
      if (frameScripts) {
        for (var j = 0; j < frameScripts.length; j++) {
          var script = frameScripts[j];
          script.context = this;
          queue.push(script);
        }
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
        this.sec.throwError('ArgumentError', Errors.WrongArgumentCountError,
                                       'flash.display::MovieClip/gotoAndPlay()', 1,
                                       arguments.length);
      }
      scene = axCoerceString(scene);
      frame = axCoerceString(frame) + ''; // The axCoerceString returns `null` for `undefined`.
      this.play();
      this._gotoFrame(frame, scene);
    }

    gotoAndStop(frame: any, scene: string = null): void {
      // See comment in gotoAndPlay for an explanation of the arguments handling stuff.
      if (arguments.length === 0 || arguments.length > 2) {
        this.sec.throwError('ArgumentError', Errors.WrongArgumentCountError,
                                       'flash.display::MovieClip/gotoAndPlay()', 1,
                                       arguments.length);
      }
      scene = axCoerceString(scene);
      frame = axCoerceString(frame) + ''; // The axCoerceString returns `null` for `undefined`.
      this.stop();
      this._gotoFrame(frame, scene);
    }

    /**
     * Takes pairs of `frameIndex`, `script` arguments and adds the `script`s to the `_frameScripts`
     * Array.
     *
     * Undocumented method used to implement the old timeline concept in AS3.
     */
    addFrameScript(frameIndex: number, script: FrameScript /*, ...*/): void {
      if (!this._currentFrame) {
        return;
      }
      // arguments are pairs of frameIndex and script/function
      // frameIndex is in range 0..totalFrames-1
      var numArgs = arguments.length;
      if (numArgs & 1) {
        this.sec.throwError('ArgumentError', Errors.TooFewArgumentsError, numArgs,
                                       numArgs + 1);
      }
      var frameScripts = this._frameScripts;
      var totalFrames = this._totalFrames;
      for (var i = 0; i < numArgs; i += 2) {
        var frameNum = (arguments[i] | 0) + 1;
        if (frameNum < 1 || frameNum > totalFrames) {
          continue;
        }
        var fn = arguments[i + 1];
        var list = frameScripts[frameNum];
        if (list) {
          if (fn.precedence) {
            list.push(fn);
          } else {
            list[0] = fn;
          }
        } else {
          frameScripts[frameNum] = [fn];
        }
        if (frameNum === this._currentFrame) {
          this._setFlags(DisplayObjectFlags.HasFrameScriptPending);
          this._parent && this._propagateFlagsUp(DisplayObjectFlags.ContainsFrameScriptPendingChildren);
        }
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

    _addSoundStreamBlock(frameNum: number, streamBlock: any) {
      if (this._sounds === null) {
        this._sounds = new MovieClipSoundsManager(this);
      }
      this._sounds.addSoundStreamBlock(frameNum, streamBlock);
    }

    private _syncSounds(frameNum: number) {
      if (this._sounds !== null) {
        this._sounds.syncSounds(frameNum);
      }
    }

    addScene(name: string, labels_: FrameLabel[], offset: number, numFrames: number): void {
      var labels = this.sec.createArrayUnsafe(labels_);
      this._scenes.push(new this.sec.flash.display.Scene(name, labels, offset, numFrames));
    }

    addFrameLabel(name: string, frame: number): void {
      var scene = this._sceneForFrameIndex(frame);
      if (!scene.getLabelByName(name, false)) {
        scene.labels.value.push(new this.sec.flash.display.FrameLabel(name, frame - scene.offset));
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

    _containsPointImpl(globalX: number, globalY: number, localX: number, localY: number,
                       testingType: HitTestingType, objects: DisplayObject[],
                       skipBoundsCheck: boolean): HitTestingResult {
      var result = super._containsPointImpl(globalX, globalY, localX, localY, testingType, objects,
                                            true);
      // In AVM1 SWFs, MovieClips are transparent to the mouse as long as they don't have a handler
      // attached to them for any of the button-related events.
      if (result === HitTestingResult.Shape && testingType === HitTestingType.Mouse &&
          '_as2Object' in this && !this.buttonMode && objects[0] === this) {
        objects.length = 0;
      }
      return result;
    }
  }
}
