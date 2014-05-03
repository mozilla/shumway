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
// Class: Stage
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

  import StageScaleMode = flash.display.StageScaleMode;
  import ColorCorrection = flash.display.ColorCorrection;
  import ColorCorrectionSupport = flash.display.ColorCorrectionSupport;
  import StageQuality = flash.display.StageQuality;

  var Event: typeof flash.events.Event;
  var DisplayObject: typeof flash.display.DisplayObject;
  var Sprite: typeof flash.display.Sprite;
  var MovieClip: typeof flash.display.MovieClip;

  var enterFrameEvent: flash.events.Event;
  var frameConstructedEvent: flash.events.Event;
  var exitFrameEvent: flash.events.Event;
  var renderEvent: flash.events.Event;

  export class Stage extends flash.display.DisplayObjectContainer {

    static classInitializer: any = function () {
      Event = flash.events.Event;
      DisplayObject = flash.display.DisplayObject;
      Sprite = flash.display.Sprite;
      MovieClip = flash.display.MovieClip;

      enterFrameEvent = new flash.events.Event(Event.ENTER_FRAME);
      frameConstructedEvent = new flash.events.Event(Event.FRAME_CONSTRUCTED);
      exitFrameEvent = new flash.events.Event(Event.EXIT_FRAME);
      renderEvent = new flash.events.Event(Event.RENDER);
    };

    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null; // ["name", "mask", "visible", "x", "y", "z", "scaleX", "scaleY", "scaleZ", "rotation", "rotationX", "rotationY", "rotationZ", "alpha", "cacheAsBitmap", "opaqueBackground", "scrollRect", "filters", "blendMode", "transform", "accessibilityProperties", "scale9Grid", "tabEnabled", "tabIndex", "focusRect", "mouseEnabled", "accessibilityImplementation", "width", "width", "height", "height", "textSnapshot", "mouseChildren", "mouseChildren", "numChildren", "tabChildren", "tabChildren", "contextMenu", "constructor", "constructor", "addChild", "addChildAt", "setChildIndex", "addEventListener", "hasEventListener", "willTrigger", "dispatchEvent"];
    static initializer: any = null;

    constructor () {
      false && super();
      DisplayObjectContainer.instanceConstructorNoInitialize.call(this);
      this._root = this;
      this._stage = this;

      this._frameRate = 24;
      this._scaleMode = StageScaleMode.SHOW_ALL;
      this._align = "";
      this._stageWidth = 0;
      this._stageHeight = 0;
      this._showDefaultContextMenu = true;
      this._focus = null;
      this._colorCorrection = ColorCorrection.DEFAULT;
      this._colorCorrectionSupport = ColorCorrectionSupport.DEFAULT_OFF;
      this._stageFocusRect = true;
      this._quality = StageQuality.HIGH;
      this._displayState = null;
      this._fullScreenSourceRect = null;
      this._mouseLock = false;
      this._stageVideos = null; // TODO
      this._stage3Ds = null; // TODO
      this._color = 0xFFFFFFFF;
      this._fullScreenWidth = 0;
      this._fullScreenHeight = 0;
      this._wmodeGPU = false;
      this._softKeyboardRect = new flash.geom.Rectangle();
      this._allowsFullScreen = false;
      this._allowsFullScreenInteractive = false;
      this._contentsScaleFactor = 1;
      this._displayContextInfo = null;

      this._timeoutID = -1;
      this._invalid = false;
    }
    
    // JS -> AS Bindings

    
    // AS -> JS Bindings

    private _frameRate: number;
    private _scaleMode: string;
    private _align: string;
    private _stageWidth: number /*int*/;
    private _stageHeight: number /*int*/;
    private _showDefaultContextMenu: boolean;
    private _focus: flash.display.InteractiveObject;
    private _colorCorrection: string;
    private _colorCorrectionSupport: string;
    private _stageFocusRect: boolean;
    private _quality: string;
    private _displayState: string;
    private _fullScreenSourceRect: flash.geom.Rectangle;
    private _mouseLock: boolean;
    private _stageVideos: ASVector<any>;
    private _stage3Ds: ASVector<any>;
    private _color: number /*uint*/;
    private _fullScreenWidth: number /*uint*/;
    private _fullScreenHeight: number /*uint*/;
    private _wmodeGPU: boolean;
    private _softKeyboardRect: flash.geom.Rectangle;
    private _allowsFullScreen: boolean;
    private _allowsFullScreenInteractive: boolean;
    private _contentsScaleFactor: number;
    private _displayContextInfo: string;

    private _timeoutID: number;
    private _invalid: boolean;

    get frameRate(): number {
      return this._frameRate;
    }

    set frameRate(value: number) {
      this._frameRate = +value;
    }

    get scaleMode(): string {
      return this._scaleMode;
    }

    set scaleMode(value: string) {
      value = asCoerceString(value);
      // this._scaleMode = value;
      notImplemented("public flash.display.Stage::set scaleMode"); return;
    }
    get align(): string {
      return this._align;
    }
    set align(value: string) {
      // this._align = asCoerceString(value);
      notImplemented("public flash.display.Stage::set align"); return;
    }

    get stageWidth(): number /*int*/ {
      return (this._stageWidth * 0.05) | 0;
    }

    set stageWidth(value: number /*int*/) {
      this._stageWidth = (value * 20) | 0;
    }

    get stageHeight(): number /*int*/ {
      return (this._stageHeight * 0.05) | 0;
    }

    set stageHeight(value: number /*int*/) {
      this._stageHeight = (value * 20) | 0;
    }

    get showDefaultContextMenu(): boolean {
      return this._showDefaultContextMenu;
    }

    set showDefaultContextMenu(value: boolean) {
      // this._showDefaultContextMenu = !!value;
      notImplemented("public flash.display.Stage::set showDefaultContextMenu"); return;
    }

    get focus(): flash.display.InteractiveObject {
      return this._focus;
    }

    set focus(newFocus: flash.display.InteractiveObject) {
      //this._focus = newFocus;
      notImplemented("public flash.display.Stage::set focus"); return;
    }

    get colorCorrection(): string {
      return this._colorCorrection;
    }

    set colorCorrection(value: string) {
      //this._colorCorrection = asCoerceString(value);
      notImplemented("public flash.display.Stage::set colorCorrection"); return;
    }

    get colorCorrectionSupport(): string {
      return this._colorCorrectionSupport;
    }

    get stageFocusRect(): boolean {
      return this._stageFocusRect;
    }

    set stageFocusRect(on: boolean) {
      //this._stageFocusRect = !!on;
      notImplemented("public flash.display.Stage::set stageFocusRect"); return;
    }

    get quality(): string {
      return this._quality;
    }

    set quality(value: string) {
      //this._quality = asCoerceString(value);
      notImplemented("public flash.display.Stage::set quality"); return;
    }

    get displayState(): string {
      return this._displayState;
    }

    set displayState(value: string) {
      //this._displayState = asCoerceString(value);
      notImplemented("public flash.display.Stage::set displayState"); return;
    }

    get fullScreenSourceRect(): flash.geom.Rectangle {
      return this._fullScreenSourceRect;
    }

    set fullScreenSourceRect(value: flash.geom.Rectangle) {
      //this._fullScreenSourceRect = value;
      notImplemented("public flash.display.Stage::set fullScreenSourceRect"); return;
    }

    get mouseLock(): boolean {
      return this._mouseLock;
    }

    set mouseLock(value: boolean) {
      this._mouseLock = !!value;
    }

    get stageVideos(): any {
      notImplemented("public flash.display.Stage::get stageVideos"); return;
      // return this._stageVideos;
    }
    get stage3Ds(): ASVector<any> {
      notImplemented("public flash.display.Stage::get stage3Ds"); return;
      // return this._stage3Ds;
    }

    get color(): number /*uint*/ {
      return this._color;
    }

    set color(color: number /*uint*/) {
      this._color = color >>> 0;
    }

    get fullScreenWidth(): number /*uint*/ {
      return this._fullScreenWidth;
    }

    get fullScreenHeight(): number /*uint*/ {
      return this._fullScreenHeight;
    }

    get wmodeGPU(): boolean {
      return this._wmodeGPU;
    }

    get softKeyboardRect(): flash.geom.Rectangle {
      return this._softKeyboardRect;
    }

    get allowsFullScreen(): boolean {
      return this._allowsFullScreen;
    }

    get allowsFullScreenInteractive(): boolean {
      return this._allowsFullScreenInteractive;
    }

    get contentsScaleFactor(): number {
      return this._contentsScaleFactor;
    }

    get displayContextInfo(): string {
      return this._displayContextInfo;
    }

    removeChildAt(index: number /*int*/): flash.display.DisplayObject {
      index = index | 0;
      notImplemented("public flash.display.Stage::removeChildAt"); return;
    }
    swapChildrenAt(index1: number /*int*/, index2: number /*int*/): void {
      index1 = index1 | 0; index2 = index2 | 0;
      notImplemented("public flash.display.Stage::swapChildrenAt"); return;
    }
    invalidate(): void {
      this._invalid = true;
    }
    isFocusInaccessible(): boolean {
      notImplemented("public flash.display.Stage::isFocusInaccessible"); return;
    }
    requireOwnerPermissions(): void {
      somewhatImplemented("public flash.display.Stage::requireOwnerPermissions"); return;
    }

    enterEventLoop(): void {
      var stage = this;
      var firstRun = true;

      (function tick() {
        stage._timeoutID = setTimeout(tick, 1000 / stage._frameRate);

        if (!firstRun) {
          MovieClip.initFrame();
          DisplayObject.broadcastEvent(enterFrameEvent);
          Sprite.constructFrame();
        }

        DisplayObject.broadcastEvent(frameConstructedEvent);
        MovieClip.executeFrame();
        DisplayObject.broadcastEvent(exitFrameEvent);

        if (stage._invalid && !firstRun) {
          stage._propagateEvent(renderEvent);
          stage._invalid = false;
        }

        // handle input

        firstRun = false;
      })();
    }

    leaveEventLoop(): void {
      assert (this._timeoutID > -1);
      clearInterval(this._timeoutID);
    }
  }
}
