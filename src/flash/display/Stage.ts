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
  import assert = Shumway.Debug.assert;
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
      this._stageVideos = new GenericVector(0, true, ASObject);
      this._stage3Ds = null; // TODO
      this._colorARGB = 0xFFFFFFFF;
      this._fullScreenWidth = 0;
      this._fullScreenHeight = 0;
      this._wmodeGPU = false;
      this._softKeyboardRect = new flash.geom.Rectangle();
      this._allowsFullScreen = false;
      this._allowsFullScreenInteractive = false;
      this._contentsScaleFactor = 1;
      this._displayContextInfo = null;

      this._timeout = -1;
      this._stageContainerWidth = -1;
      this._stageContainerHeight = -1;

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
    private _colorARGB: number /*uint*/;
    private _fullScreenWidth: number /*uint*/;
    private _fullScreenHeight: number /*uint*/;
    private _wmodeGPU: boolean;
    private _softKeyboardRect: flash.geom.Rectangle;
    private _allowsFullScreen: boolean;
    private _allowsFullScreenInteractive: boolean;
    private _contentsScaleFactor: number;
    private _displayContextInfo: string;

    private _timeout: number;

    private _stageContainerWidth: number;
    private _stageContainerHeight: number;

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
      if (flash.display.StageScaleMode.toNumber(value) < 0) {
        throwError("ArgumentError", Errors.InvalidEnumError, "scaleMode");
      }
      this._scaleMode = value;
    }

    get align(): string {
      return this._align;
    }

    set align(value: string) {
      value = asCoerceString(value);
      var n = flash.display.StageAlign.toNumber(value);
      release || assert (n >= 0);
      this._align = flash.display.StageAlign.fromNumber(n);
    }

    get stageWidth(): number /*int*/ {
      if (this.scaleMode !== StageScaleMode.NO_SCALE) {
        return this._stageWidth / 20 | 0;
      }
      release || assert (this._stageContainerWidth >= 0);
      return this._stageContainerWidth;
    }

    set stageWidth(value: number /*int*/) {
      // While the setter doesn't change the stored value, it still coerces the `value` parameter.
      // This is script-visible if the value is something like `{valueOf: function(){throw 1}}`.
      value = value | 0;
    }

    _setInitialName() {
      this._name = null;
    }

    /**
     * Non-AS3-available setter. In AS3, the `stageWidth` setter is silently ignored.
     */
    setStageWidth(value: number) {
      release || assert ((value | 0) === value);
      this._stageWidth = (value * 20) | 0;
    }

    get stageHeight(): number /*int*/ {
      if (this.scaleMode !== StageScaleMode.NO_SCALE) {
        return this._stageHeight / 20 | 0;
      }
      release || assert (this._stageContainerHeight >= 0);
      return this._stageContainerHeight;
    }

    set stageHeight(value: number /*int*/) {
      // While the setter doesn't change the stored value, it still coerces the `value` parameter.
      // This is script-visible if the value is something like `{valueOf: function(){throw 1}}`.
      value = value | 0;
    }

    /**
     * Non-AS3-available setter. In AS3, the `stageHeight` setter is silently ignored.
     */
    setStageHeight(value: number) {
      release || assert ((value | 0) === value);
      this._stageHeight = (value * 20) | 0;
    }

    /**
     * Almost the same as color setter, except it preserves alpha channel.
     * @param value
     */
    setStageColor(value: number) {
      this._colorARGB = value;
    }

    /**
     * Non-AS3-available setter. Notifies the stage that the dimensions of the stage container have changed.
     */
    setStageContainerSize(width: number, height: number, pixelRatio: number) {
      // Flash doesn't fire a resize event if the pixel ratio has changed, but it needs to be set if
      // a resize event gets dispatched as a result of a size change.
      this._contentsScaleFactor = pixelRatio;
      var sizeHasChanged = this._stageContainerWidth !== width || this._stageContainerHeight !== height;
      if (sizeHasChanged) {
        this._stageContainerWidth = width;
        this._stageContainerHeight = height;
        if (this.scaleMode === StageScaleMode.NO_SCALE) {
          this.dispatchEvent(flash.events.Event.getInstance(flash.events.Event.RESIZE));
        }
      }
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
      return this._quality.toUpperCase(); // Return value is always uppercase
    }

    set quality(value: string)  {
      // TODO: The *linear versions return just *, stripping the "linear" part
      // Value is compared case-insensitively, and has default handling, so '' is ok.
      value = (asCoerceString(value) || '').toLowerCase();
      if (flash.display.StageQuality.toNumber(value) < 0) {
        value = flash.display.StageQuality.HIGH;
      }
      this._quality = value;
    }

    get displayState(): string {
      return this._displayState;
    }

    set displayState(value: string) {
      value = asCoerceString(value);
      // TODO: This should only be allowed if the embedding page allows full screen mode.
      if (flash.display.StageDisplayState.toNumber(value) < 0) {
        value = flash.display.StageDisplayState.NORMAL;
      }
      this._displayState = value;
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
      somewhatImplemented("public flash.display.Stage::get stageVideos");
      return this._stageVideos;
    }
    get stage3Ds(): ASVector<any> {
      notImplemented("public flash.display.Stage::get stage3Ds"); return;
      // return this._stage3Ds;
    }

    get color(): number /*uint*/ {
      return this._colorARGB;
    }

    set color(rgb: number /*uint*/) {
      // Flash player forces the alpha channel to 0xff.
      this._colorARGB = rgb | 0xff000000;
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

    removeChildAt(index: number): flash.display.DisplayObject {
      this.requireOwnerPermissions();
      return super.removeChildAt(index);
    }

    swapChildrenAt(index1: number /*int*/, index2: number /*int*/): void {
      this.requireOwnerPermissions();
      super.swapChildrenAt(index1, index2);
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
      // TODO: implement requireOwnerPermissions
    }

    render(): void {
      if (!this._invalidated) {
        return;
      }
      DisplayObject._broadcastFrameEvent(flash.events.Event.RENDER);
      this._invalidated = false;
    }
  }
}
