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
 * limitations undxr the License.
 */
// Class: Stage
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Stage extends flash.display.DisplayObjectContainer {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["name", "mask", "visible", "x", "y", "z", "scaleX", "scaleY", "scaleZ", "rotation", "rotationX", "rotationY", "rotationZ", "alpha", "cacheAsBitmap", "opaqueBackground", "scrollRect", "filters", "blendMode", "transform", "accessibilityProperties", "scale9Grid", "tabEnabled", "tabIndex", "focusRect", "mouseEnabled", "accessibilityImplementation", "width", "width", "height", "height", "textSnapshot", "mouseChildren", "mouseChildren", "numChildren", "tabChildren", "tabChildren", "contextMenu", "constructor", "constructor", "addChild", "addChildAt", "setChildIndex", "addEventListener", "hasEventListener", "willTrigger", "dispatchEvent"];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.display.Stage");
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
    // _frameRate: number;
    // _scaleMode: string;
    // _align: string;
    // _stageWidth: number /*int*/;
    // _stageHeight: number /*int*/;
    // _showDefaultContextMenu: boolean;
    // _focus: flash.display.InteractiveObject;
    // _colorCorrection: string;
    // _colorCorrectionSupport: string;
    // _stageFocusRect: boolean;
    // _quality: string;
    // _displayState: string;
    // _fullScreenSourceRect: flash.geom.Rectangle;
    // _mouseLock: boolean;
    // _stageVideos: ASVector<any>;
    // _stage3Ds: ASVector<any>;
    // _color: number /*uint*/;
    // _fullScreenWidth: number /*uint*/;
    // _fullScreenHeight: number /*uint*/;
    // _wmodeGPU: boolean;
    // _softKeyboardRect: flash.geom.Rectangle;
    // _allowsFullScreen: boolean;
    // _allowsFullScreenInteractive: boolean;
    // _contentsScaleFactor: number;
    // _displayContextInfo: string;
    get frameRate(): number {
      notImplemented("public flash.display.Stage::get frameRate"); return;
      // return this._frameRate;
    }
    set frameRate(value: number) {
      value = +value;
      notImplemented("public flash.display.Stage::set frameRate"); return;
      // this._frameRate = value;
    }
    get scaleMode(): string {
      notImplemented("public flash.display.Stage::get scaleMode"); return;
      // return this._scaleMode;
    }
    set scaleMode(value: string) {
      value = "" + value;
      notImplemented("public flash.display.Stage::set scaleMode"); return;
      // this._scaleMode = value;
    }
    get align(): string {
      notImplemented("public flash.display.Stage::get align"); return;
      // return this._align;
    }
    set align(value: string) {
      value = "" + value;
      notImplemented("public flash.display.Stage::set align"); return;
      // this._align = value;
    }
    get stageWidth(): number /*int*/ {
      notImplemented("public flash.display.Stage::get stageWidth"); return;
      // return this._stageWidth;
    }
    set stageWidth(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.display.Stage::set stageWidth"); return;
      // this._stageWidth = value;
    }
    get stageHeight(): number /*int*/ {
      notImplemented("public flash.display.Stage::get stageHeight"); return;
      // return this._stageHeight;
    }
    set stageHeight(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.display.Stage::set stageHeight"); return;
      // this._stageHeight = value;
    }
    get showDefaultContextMenu(): boolean {
      notImplemented("public flash.display.Stage::get showDefaultContextMenu"); return;
      // return this._showDefaultContextMenu;
    }
    set showDefaultContextMenu(value: boolean) {
      value = !!value;
      notImplemented("public flash.display.Stage::set showDefaultContextMenu"); return;
      // this._showDefaultContextMenu = value;
    }
    get focus(): flash.display.InteractiveObject {
      notImplemented("public flash.display.Stage::get focus"); return;
      // return this._focus;
    }
    set focus(newFocus: flash.display.InteractiveObject) {
      newFocus = newFocus;
      notImplemented("public flash.display.Stage::set focus"); return;
      // this._focus = newFocus;
    }
    get colorCorrection(): string {
      notImplemented("public flash.display.Stage::get colorCorrection"); return;
      // return this._colorCorrection;
    }
    set colorCorrection(value: string) {
      value = "" + value;
      notImplemented("public flash.display.Stage::set colorCorrection"); return;
      // this._colorCorrection = value;
    }
    get colorCorrectionSupport(): string {
      notImplemented("public flash.display.Stage::get colorCorrectionSupport"); return;
      // return this._colorCorrectionSupport;
    }
    get stageFocusRect(): boolean {
      notImplemented("public flash.display.Stage::get stageFocusRect"); return;
      // return this._stageFocusRect;
    }
    set stageFocusRect(on: boolean) {
      on = !!on;
      notImplemented("public flash.display.Stage::set stageFocusRect"); return;
      // this._stageFocusRect = on;
    }
    get quality(): string {
      notImplemented("public flash.display.Stage::get quality"); return;
      // return this._quality;
    }
    set quality(value: string) {
      value = "" + value;
      notImplemented("public flash.display.Stage::set quality"); return;
      // this._quality = value;
    }
    get displayState(): string {
      notImplemented("public flash.display.Stage::get displayState"); return;
      // return this._displayState;
    }
    set displayState(value: string) {
      value = "" + value;
      notImplemented("public flash.display.Stage::set displayState"); return;
      // this._displayState = value;
    }
    get fullScreenSourceRect(): flash.geom.Rectangle {
      notImplemented("public flash.display.Stage::get fullScreenSourceRect"); return;
      // return this._fullScreenSourceRect;
    }
    set fullScreenSourceRect(value: flash.geom.Rectangle) {
      value = value;
      notImplemented("public flash.display.Stage::set fullScreenSourceRect"); return;
      // this._fullScreenSourceRect = value;
    }
    get mouseLock(): boolean {
      notImplemented("public flash.display.Stage::get mouseLock"); return;
      // return this._mouseLock;
    }
    set mouseLock(value: boolean) {
      value = !!value;
      notImplemented("public flash.display.Stage::set mouseLock"); return;
      // this._mouseLock = value;
    }
    get stageVideos(): ASVector<any> {
      notImplemented("public flash.display.Stage::get stageVideos"); return;
      // return this._stageVideos;
    }
    get stage3Ds(): ASVector<any> {
      notImplemented("public flash.display.Stage::get stage3Ds"); return;
      // return this._stage3Ds;
    }
    get color(): number /*uint*/ {
      notImplemented("public flash.display.Stage::get color"); return;
      // return this._color;
    }
    set color(color: number /*uint*/) {
      color = color >>> 0;
      notImplemented("public flash.display.Stage::set color"); return;
      // this._color = color;
    }
    get fullScreenWidth(): number /*uint*/ {
      notImplemented("public flash.display.Stage::get fullScreenWidth"); return;
      // return this._fullScreenWidth;
    }
    get fullScreenHeight(): number /*uint*/ {
      notImplemented("public flash.display.Stage::get fullScreenHeight"); return;
      // return this._fullScreenHeight;
    }
    get wmodeGPU(): boolean {
      notImplemented("public flash.display.Stage::get wmodeGPU"); return;
      // return this._wmodeGPU;
    }
    get softKeyboardRect(): flash.geom.Rectangle {
      notImplemented("public flash.display.Stage::get softKeyboardRect"); return;
      // return this._softKeyboardRect;
    }
    get allowsFullScreen(): boolean {
      notImplemented("public flash.display.Stage::get allowsFullScreen"); return;
      // return this._allowsFullScreen;
    }
    get allowsFullScreenInteractive(): boolean {
      notImplemented("public flash.display.Stage::get allowsFullScreenInteractive"); return;
      // return this._allowsFullScreenInteractive;
    }
    get contentsScaleFactor(): number {
      notImplemented("public flash.display.Stage::get contentsScaleFactor"); return;
      // return this._contentsScaleFactor;
    }
    get displayContextInfo(): string {
      notImplemented("public flash.display.Stage::get displayContextInfo"); return;
      // return this._displayContextInfo;
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
