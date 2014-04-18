/**
 * Copyright 2013 Mozilla Foundation
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
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class Stage extends flash.display.DisplayObjectContainer {
    static classInitializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null; // ["name", "mask", "visible", "x", "y", "z", "scaleX", "scaleY", "scaleZ", "rotation", "rotationX", "rotationY", "rotationZ", "alpha", "cacheAsBitmap", "opaqueBackground", "scrollRect", "filters", "blendMode", "transform", "accessibilityProperties", "scale9Grid", "tabEnabled", "tabIndex", "focusRect", "mouseEnabled", "accessibilityImplementation", "width", "width", "height", "height", "textSnapshot", "mouseChildren", "mouseChildren", "numChildren", "tabChildren", "tabChildren", "contextMenu", "constructor", "constructor", "addChild", "addChildAt", "setChildIndex", "addEventListener", "hasEventListener", "willTrigger", "dispatchEvent"];
    static initializer: any = null;

    constructor () {
      false && super();
      this._frameRate = 24;
      this._scaleMode = flash.display.StageScaleMode.SHOW_ALL;
      this._align = "";
      this._stageWidth = this._stageHeight = 0;
      this._quality = flash.display.StageQuality.HIGH;
      this._color = 0xFFFFFFFF;
      this._stage = this;
      this._focus = null;
      this._colorCorrection = flash.display.ColorCorrection.DEFAULT;
      this._stageFocusRect = true;
      this._fullScreenSourceRect = null;
      this._wmodeGPU = false;

      // TOOD Add all the other defaults.
    }
    
    // JS -> AS Bindings
    
    name: string;
    mask: flash.display.DisplayObject;
    visible: boolean;
    x: number;
    y: number;
    z: number;
    scaleX: number;
    scaleY: number;
    scaleZ: number;
    rotation: number;
    rotationX: number;
    rotationY: number;
    rotationZ: number;
    alpha: number;
    cacheAsBitmap: boolean;
    opaqueBackground: ASObject;
    scrollRect: flash.geom.Rectangle;
    filters: any [];
    blendMode: string;
    transform: flash.geom.Transform;
    accessibilityProperties: flash.accessibility.AccessibilityProperties;
    scale9Grid: flash.geom.Rectangle;
    tabEnabled: boolean;
    tabIndex: number /*int*/;
    focusRect: ASObject;
    mouseEnabled: boolean;
    accessibilityImplementation: flash.accessibility.AccessibilityImplementation;
    width: number;
    height: number;
    textSnapshot: flash.text.TextSnapshot;
    mouseChildren: boolean;
    numChildren: number /*int*/;
    tabChildren: boolean;
    contextMenu: flash.ui.ContextMenu;
    // addChild: (child: flash.display.DisplayObject) => flash.display.DisplayObject;
    // addChildAt: (child: flash.display.DisplayObject, index: number /*int*/) => flash.display.DisplayObject;
    // setChildIndex: (child: flash.display.DisplayObject, index: number /*int*/) => void;
    // addEventListener: (type: string, listener: ASFunction, useCapture: boolean = false, priority: number /*int*/ = 0, useWeakReference: boolean = false) => void;
    // hasEventListener: (type: string) => boolean;
    // willTrigger: (type: string) => boolean;
    // dispatchEvent: (event: flash.events.Event) => boolean;
    
    // AS -> JS Bindings
    
    // _name: string;
    // _mask: flash.display.DisplayObject;
    // _visible: boolean;
    // _x: number;
    // _y: number;
    // _z: number;
    // _scaleX: number;
    // _scaleY: number;
    // _scaleZ: number;
    // _rotation: number;
    // _rotationX: number;
    // _rotationY: number;
    // _rotationZ: number;
    // _alpha: number;
    // _cacheAsBitmap: boolean;
    // _opaqueBackground: ASObject;
    // _scrollRect: flash.geom.Rectangle;
    // _filters: any [];
    // _blendMode: string;
    // _transform: flash.geom.Transform;
    // _accessibilityProperties: flash.accessibility.AccessibilityProperties;
    // _scale9Grid: flash.geom.Rectangle;
    // _tabEnabled: boolean;
    // _tabIndex: number /*int*/;
    // _focusRect: ASObject;
    // _mouseEnabled: boolean;
    // _accessibilityImplementation: flash.accessibility.AccessibilityImplementation;
    // _width: number;
    // _height: number;
    // _textSnapshot: flash.text.TextSnapshot;
    // _mouseChildren: boolean;
    // _numChildren: number /*int*/;
    // _tabChildren: boolean;
    // _contextMenu: flash.ui.ContextMenu;

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
      this._scaleMode = value;
      notImplemented("public flash.display.Stage::set scaleMode"); return;
    }
    get align(): string {
      notImplemented("public flash.display.Stage::get align"); return;
      return this._align;
    }
    set align(value: string) {
      this._align = asCoerceString(value);
      notImplemented("public flash.display.Stage::set align"); return;
    }
    get stageWidth(): number /*int*/ {
      return this._stageWidth;
    }
    set stageWidth(value: number /*int*/) {
      this._stageWidth = value | 0;
      notImplemented("public flash.display.Stage::set stageWidth"); return;
    }
    get stageHeight(): number /*int*/ {
      return this._stageHeight;
    }
    set stageHeight(value: number /*int*/) {
      this._stageHeight = value | 0;
      notImplemented("public flash.display.Stage::set stageHeight"); return;
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
      this._focus = newFocus;
      notImplemented("public flash.display.Stage::set focus"); return;
    }
    get colorCorrection(): string {
      return this._colorCorrection;
    }
    set colorCorrection(value: string) {
      this._colorCorrection = asCoerceString(value);
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
      notImplemented("public flash.display.Stage::set stageFocusRect"); return;
    }
    get quality(): string {
      return this._quality;
    }
    set quality(value: string) {
      this._quality = asCoerceString(value);
      notImplemented("public flash.display.Stage::set quality"); return;
    }
    get displayState(): string {
      return this._displayState;
    }
    set displayState(value: string) {
      this._displayState = asCoerceString(value);
      notImplemented("public flash.display.Stage::set displayState"); return;
    }
    get fullScreenSourceRect(): flash.geom.Rectangle {
      return this._fullScreenSourceRect;
    }
    set fullScreenSourceRect(value: flash.geom.Rectangle) {
      this._fullScreenSourceRect = value;
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
      return this._stageVideos;
    }
    get stage3Ds(): ASVector<any> {
      notImplemented("public flash.display.Stage::get stage3Ds"); return;
      // return this._stage3Ds;
    }
    get color(): number /*uint*/ {
      return this._color;
    }
    set color(color: number /*uint*/) {
      notImplemented("public flash.display.Stage::set color"); return;
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
      notImplemented("public flash.display.Stage::invalidate"); return;
    }
    isFocusInaccessible(): boolean {
      notImplemented("public flash.display.Stage::isFocusInaccessible"); return;
    }
    requireOwnerPermissions(): void {
      notImplemented("public flash.display.Stage::requireOwnerPermissions"); return;
    }
  }
}
