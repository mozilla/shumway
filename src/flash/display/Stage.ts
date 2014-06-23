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
  import assert = Shumway.Debug.assert;
  import notImplemented = Shumway.Debug.notImplemented;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import throwError = Shumway.AVM2.Runtime.throwError;

  export class Stage extends flash.display.DisplayObjectContainer {

    static classInitializer: any = null;

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
      release || assert (this._scaleMode);
      this._align = "";
      this._stageWidth = 0;
      this._stageHeight = 0;
      this._showDefaultContextMenu = true;
      this._focus = null;
      this._colorCorrection = ColorCorrection.DEFAULT;
      release || assert (this._colorCorrection);
      this._colorCorrectionSupport = ColorCorrectionSupport.DEFAULT_OFF;
      release || assert (this._colorCorrectionSupport);
      this._stageFocusRect = true;
      this._quality = StageQuality.HIGH;
      release || assert (this._quality);
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

      this._timeout = -1;

      /**
       * Indicates if a Render event was requested by calling the |invalid| function.
       */
      this._invalidated = false;
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

    private _timeout: number;

    /**
     * The |invalidate| function was called on the stage. This flag indicates that
     * the |RENDER| event gets fired right before the stage is rendered.
     */
    private _invalidated: boolean;

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
      release || assert (flash.display.StageScaleMode.toNumber(value) >= 0);
      this._scaleMode = value;
    }

    get align(): string {
      return this._align;
    }

    set align(value: string) {
      value = asCoerceString(value);
      release || assert (flash.display.StageAlign.toNumber(value) >= 0);
      this._align = value;
    }

    get stageWidth(): number /*int*/ {
      return (this._stageWidth / 20) | 0;
    }

    set stageWidth(value: number /*int*/) {
      this._stageWidth = (value * 20) | 0;
    }

    get stageHeight(): number /*int*/ {
      return (this._stageHeight / 20) | 0;
    }

    set stageHeight(value: number /*int*/) {
      this._stageHeight = (value * 20) | 0;
    }

    get showDefaultContextMenu(): boolean {
      return this._showDefaultContextMenu;
    }

    set showDefaultContextMenu(value: boolean) {
      this._showDefaultContextMenu = !!value;
    }

    get focus(): flash.display.InteractiveObject {
      return this._focus;
    }

    set focus(newFocus: flash.display.InteractiveObject) {
      this._focus = newFocus;
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
      this._stageFocusRect = !!on;
    }

    get quality(): string {
      return this._quality;
    }

    set quality(value: string) {
      release || assert (flash.display.StageQuality.toNumber(value) >= 0);
      this._quality = asCoerceString(value);
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
      somewhatImplemented("public flash.display.Stage::set mouseLock");
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

    set alpha(alpha: number) {
      throwError("Error", Errors.InvalidStageMethodError);
    }

    get alpha(): number {
      return this._colorTransform.alphaMultiplier;
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

    /*
    removeChildAt(index: number): flash.display.DisplayObject {
      index = index | 0;
      notImplemented("public flash.display.Stage::removeChildAt"); return;
    }
    */

    swapChildrenAt(index1: number /*int*/, index2: number /*int*/): void {
      index1 = index1 | 0; index2 = index2 | 0;
      notImplemented("public flash.display.Stage::swapChildrenAt"); return;
    }

    invalidate(): void {
      this._invalidated = true;
    }

    isInvalidated(): boolean {
      return this._invalidated;
    }

    isFocusInaccessible(): boolean {
      notImplemented("public flash.display.Stage::isFocusInaccessible"); return;
    }
    requireOwnerPermissions(): void {
      somewhatImplemented("public flash.display.Stage::requireOwnerPermissions"); return;
    }

    render(): void {
      if (!this._invalidated) {
        return;
      }
      DisplayObject._broadcastFrameEvent(flash.events.Event.RENDER);
      this._invalidated = false;
    }

    /**
     * Gets the objects under the current mouse position. The main difference to DisplayObjectObjectContainer's
     * getObjectsUnderPoint is that it reroutes the hit test to a Button's hitTestState or a Sprite's
     * hitArea, if specified.
     */
    getObjectsUnderMouse(globalPoint: flash.geom.Point): flash.display.DisplayObject [] {
      var objectsUnderPoint: flash.display.DisplayObject [] = [];
      this.visit(function (displayObject: flash.display.DisplayObject): VisitorFlags {
        var isUnderMouse = false;
        if (SimpleButton.isType(displayObject)) {
          var simpleButton = <SimpleButton>displayObject;
          if (simpleButton.hitTestState) {
            var point = simpleButton.globalToLocal(globalPoint).toTwips();
            isUnderMouse = simpleButton.hitTestState._containsPoint(point, true, true);
          }
        } else if (!Sprite.isType(displayObject) || !(<Sprite>displayObject).hitArea) {
          isUnderMouse = displayObject.hitTestPoint(globalPoint.x, globalPoint.y, true, true);
        }
        if (isUnderMouse) {
          objectsUnderPoint.push(displayObject);
        }
        return VisitorFlags.Continue;
      }, VisitorFlags.None);
      return objectsUnderPoint;
    }
  }
}
