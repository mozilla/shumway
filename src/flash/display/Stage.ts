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
module Shumway.AVMX.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import assert = Shumway.Debug.assert;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;

  export class Stage extends flash.display.DisplayObjectContainer {

    static classInitializer: any = null;

    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null;

    /**
     * Indicates whether the stage object has changed since the last time it was synchronized.
     */
    _isDirty: boolean;

    constructor () {
      super();
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
      var objectVectorClass = this.sec.getVectorClass(this.sec.AXObject);
      this._stageVideos = <any>objectVectorClass.axConstruct([0, true]);
      this._stage3Ds = <any>objectVectorClass.axConstruct([0, true]);
      this._colorARGB = 0xFFFFFFFF;
      this._fullScreenWidth = 0;
      this._fullScreenHeight = 0;
      this._wmodeGPU = false;
      this._softKeyboardRect = new this.sec.flash.geom.Rectangle();
      this._allowsFullScreen = false;
      this._allowsFullScreenInteractive = false;
      this._contentsScaleFactor = 1;
      this._displayContextInfo = null;

      this._timeout = -1;
      this._stageContainerWidth = -1;
      this._stageContainerHeight = -1;

      this._setFlags(DisplayObjectFlags.HasPerspectiveProjection);

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
    private _stageVideos: GenericVector;
    private _stage3Ds: GenericVector;
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

    setRoot(root: MovieClip) {
      this.addTimelineObjectAtDepth(root, 0);
    }

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
      value = axCoerceString(value);
      if (flash.display.StageScaleMode.toNumber(value) < 0) {
        this.sec.throwError("ArgumentError", Errors.InvalidEnumError, "scaleMode");
      }
      if (this._scaleMode !== value) {
        this._isDirty = true;
        this._scaleMode = value;
      }
    }

    get align(): string {
      return this._align;
    }

    set align(value: string) {
      value = axCoerceString(value);
      var n = flash.display.StageAlign.toNumber(value);
      release || assert (n >= 0);
      var newValue = flash.display.StageAlign.fromNumber(n);
      if (this._align !== newValue) {
        this._isDirty = true;
        this._align = newValue;
      }
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
      var newValue = (value * 20) | 0;
      if (this._stageWidth !== newValue) {
        this._isDirty = true;
        this._stageWidth = newValue;
      }
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
      var newValue = (value * 20) | 0;
      if (this._stageHeight !== newValue) {
        this._isDirty = true;
        this._stageHeight = newValue;
      }
    }

    /**
     * Almost the same as color setter, except it preserves alpha channel.
     * @param value
     */
    setStageColor(value: number) {
      if (this._colorARGB !== value) {
        this._isDirty = true;
        this._colorARGB = value;
      }
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
          this.dispatchEvent(this.sec.flash.events.Event.axClass.getInstance(flash.events.Event.RESIZE));
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
      //this._colorCorrection = axCoerceString(value);
      release || notImplemented("public flash.display.Stage::set colorCorrection"); return;
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
      value = (axCoerceString(value) || '').toLowerCase();
      if (flash.display.StageQuality.toNumber(value) < 0) {
        value = flash.display.StageQuality.HIGH;
      }
      this._quality = value;
    }

    get displayState(): string {
      return this._displayState;
    }

    set displayState(value: string) {
      value = axCoerceString(value);
      // TODO: This should only be allowed if the embedding page allows full screen mode.
      if (flash.display.StageDisplayState.toNumber(value) < 0) {
        value = flash.display.StageDisplayState.NORMAL;
      }
      if (this._displayState !== value) {
        this._isDirty = true;
        this._displayState = value;
      }
    }

    get fullScreenSourceRect(): flash.geom.Rectangle {
      return this._fullScreenSourceRect;
    }

    set fullScreenSourceRect(value: flash.geom.Rectangle) {
      //this._fullScreenSourceRect = value;
      release || notImplemented("public flash.display.Stage::set fullScreenSourceRect"); return;
    }

    get mouseLock(): boolean {
      return this._mouseLock;
    }

    set mouseLock(value: boolean) {
      release || somewhatImplemented("public flash.display.Stage::set mouseLock");
      this._mouseLock = !!value;
    }

    get stageVideos(): any {
      release || somewhatImplemented("public flash.display.Stage::get stageVideos");
      return this._stageVideos;
    }
    get stage3Ds(): GenericVector {
      release || somewhatImplemented("public flash.display.Stage::get stage3Ds");
       return this._stage3Ds;
    }

    get color(): number /*uint*/ {
      return this._colorARGB;
    }

    set color(rgb: number /*uint*/) {
      var newValue = rgb | 0xff000000;
      // Flash player forces the alpha channel to 0xff.
      if (this._colorARGB !== newValue) {
        this._isDirty = true;
        this._colorARGB = newValue;
      }
    }

    set alpha(alpha: number) {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
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

    get width(): number {
      this.requireOwnerPermissions();
      return this._getWidth();
    }
    set width(value: number) {
      this.requireOwnerPermissions();
      this._setWidth(value);
    }
    get height(): number {
      this.requireOwnerPermissions();
      return this._getHeight();
    }
    set height(value: number) {
      this.requireOwnerPermissions();
      this._setHeight(value);
    }
    get mouseChildren(): boolean {
      this.requireOwnerPermissions();
      return this._getMouseChildren();
    }
    set mouseChildren(value: boolean) {
      this.requireOwnerPermissions();
      this._setMouseChildren(value);
    }
    get numChildren(): number {
      this.requireOwnerPermissions();
      return this._getNumChildren();
    }
    get tabChildren(): boolean {
      this.requireOwnerPermissions();
      return this._getTabChildren();
    }
    set tabChildren(value: boolean) {
      this.requireOwnerPermissions();
      this._setTabChildren(value);
    }
    addChild(child: DisplayObject): DisplayObject {
      this.requireOwnerPermissions();
      return super.addChild(child);
    }
    addChildAt(child: DisplayObject, index: number): DisplayObject {
      this.requireOwnerPermissions();
      return super.addChildAt(child, index);
    }
    setChildIndex(child: DisplayObject, index: number): void {
      this.requireOwnerPermissions();
      super.setChildIndex(child, index);
    }
    addEventListener(type: string, listener: (event: events.Event) => void,
                     useCapture: boolean, priority: number, useWeakReference: boolean): void
    {
      this.requireOwnerPermissions();
      super.addEventListener(type, listener, useCapture, priority, useWeakReference);
    }
    hasEventListener(type: string): boolean {
      this.requireOwnerPermissions();
      return super.hasEventListener(type);
    }
    willTrigger(type: string): boolean {
      this.requireOwnerPermissions();
      return super.willTrigger(type);
    }

    dispatchEvent(event: events.Event): boolean {
      this.requireOwnerPermissions();
      return super.dispatchEvent(event);
    }

    invalidate(): void {
      this._invalidated = true;
    }

    isFocusInaccessible(): boolean {
      release || notImplemented("public flash.display.Stage::isFocusInaccessible"); return;
    }
    requireOwnerPermissions(): void {
      // TODO: implement requireOwnerPermissions
    }

    render(): void {
      if (!this._invalidated) {
        return;
      }
      this.sec.flash.display.DisplayObject.axClass._broadcastFrameEvent(flash.events.Event.RENDER);
      this._invalidated = false;
    }

    get name(): string {
      return this._name;
    }
    set name(value: string) {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
    }
    get mask(): DisplayObject {
      return this._mask;
    }
    set mask(value: DisplayObject) {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
    }
    get visible(): boolean {
      return this._hasFlags(DisplayObjectFlags.Visible);
    }
    set visible(value: boolean) {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
    }
    get x(): number {
      return this._getX();
    }
    set x(value: number) {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
    }
    get y(): number {
      return this._getY();
    }
    set y(value: number) {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
    }
    get z(): number {
      return this._z;
    }
    set z(value: number) {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
    }
    get scaleX(): number {
      return Math.abs(this._scaleX);
    }
    set scaleX(value: number) {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
    }
    get scaleY(): number {
      return this._scaleY;
    }
    set scaleY(value: number) {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
    }
    get scaleZ(): number {
      return this._scaleZ;
    }
    set scaleZ(value: number) {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
    }
    get rotation(): number {
      return this._rotation;
    }
    set rotation(value: number) {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
    }
    get rotationX(): number {
      return this._rotationX;
    }
    set rotationX(value: number) {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
    }
    get rotationY(): number {
      return this._rotationX;
    }
    set rotationY(value: number) {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
    }
    get rotationZ(): number {
      return this._rotationX;
    }
    set rotationZ(value: number) {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
    }
    get cacheAsBitmap(): boolean {
      return this._getCacheAsBitmap();
    }
    set cacheAsBitmap(value: boolean) {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
    }
    get opaqueBackground(): any {
      return this._opaqueBackground;
    }
    set opaqueBackground(value: any) {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
    }
    get scrollRect(): flash.geom.Rectangle {
      return this._getScrollRect();
    }
    set scrollRect(value: geom.Rectangle) {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
    }
    get filters() {
      return this._getFilters();
    }
    set filters(value: ASArray) {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
    }
    get blendMode(): string {
      return this._blendMode;
    }
    set blendMode(value: string) {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
    }
    get transform(): flash.geom.Transform {
      return this._getTransform();
    }
    set transform(value: geom.Transform) {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
    }
    get accessibilityProperties(): flash.accessibility.AccessibilityProperties {
      return this._accessibilityProperties;
    }
    set accessibilityProperties(value: accessibility.AccessibilityProperties) {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
    }
    get scale9Grid(): flash.geom.Rectangle {
      return this._getScale9Grid();
    }
    set scale9Grid(value: geom.Rectangle) {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
    }
    get tabEnabled(): boolean {
      return this._tabEnabled;
    }
    set tabEnabled(value: boolean) {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
    }
    get tabIndex(): number /*int*/ {
      return this._tabIndex;
    }
    set tabIndex(value: number) {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
    }
    get focusRect(): any {
      return this._focusRect;
    }
    set focusRect(value: any) {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
    }
    get mouseEnabled(): boolean {
      return this._mouseEnabled;
    }
    set mouseEnabled(value: boolean) {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
    }
    get accessibilityImplementation(): flash.accessibility.AccessibilityImplementation {
      return this._accessibilityImplementation;
    }
    set accessibilityImplementation(value: accessibility.AccessibilityImplementation) {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
    }
    get textSnapshot(): text.TextSnapshot {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
      return null;
    }
    get contextMenu(): flash.ui.ContextMenu {
      return this._contextMenu;
    }
    set contextMenu(value: ui.ContextMenu) {
      this.sec.throwError('IllegalOperationError', Errors.InvalidStageMethodError);
    }
  }
}
