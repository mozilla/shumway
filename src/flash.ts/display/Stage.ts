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
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.display.Stage");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
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
    addChild: (child: flash.display.DisplayObject) => flash.display.DisplayObject;
    addChildAt: (child: flash.display.DisplayObject, index: number /*int*/) => flash.display.DisplayObject;
    setChildIndex: (child: flash.display.DisplayObject, index: number /*int*/) => void;
    addEventListener: (type: string, listener: ASFunction, useCapture: boolean = false, priority: number /*int*/ = 0, useWeakReference: boolean = false) => void;
    dispatchEvent: (event: flash.events.Event) => boolean;
    hasEventListener: (type: string) => boolean;
    willTrigger: (type: string) => boolean;
    width: number;
    height: number;
    textSnapshot: flash.text.TextSnapshot;
    mouseChildren: boolean;
    numChildren: number /*int*/;
    tabChildren: boolean;
    contextMenu: flash.ui.ContextMenu;
    // Instance AS -> JS Bindings
    get frameRate(): number {
      notImplemented("public flash.display.Stage::get frameRate"); return;
    }
    set frameRate(value: number) {
      value = +value;
      notImplemented("public flash.display.Stage::set frameRate"); return;
    }
    invalidate(): void {
      notImplemented("public flash.display.Stage::invalidate"); return;
    }
    get scaleMode(): string {
      notImplemented("public flash.display.Stage::get scaleMode"); return;
    }
    set scaleMode(value: string) {
      value = "" + value;
      notImplemented("public flash.display.Stage::set scaleMode"); return;
    }
    get align(): string {
      notImplemented("public flash.display.Stage::get align"); return;
    }
    set align(value: string) {
      value = "" + value;
      notImplemented("public flash.display.Stage::set align"); return;
    }
    get stageWidth(): number /*int*/ {
      notImplemented("public flash.display.Stage::get stageWidth"); return;
    }
    set stageWidth(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.display.Stage::set stageWidth"); return;
    }
    get stageHeight(): number /*int*/ {
      notImplemented("public flash.display.Stage::get stageHeight"); return;
    }
    set stageHeight(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.display.Stage::set stageHeight"); return;
    }
    get showDefaultContextMenu(): boolean {
      notImplemented("public flash.display.Stage::get showDefaultContextMenu"); return;
    }
    set showDefaultContextMenu(value: boolean) {
      value = !!value;
      notImplemented("public flash.display.Stage::set showDefaultContextMenu"); return;
    }
    get focus(): flash.display.InteractiveObject {
      notImplemented("public flash.display.Stage::get focus"); return;
    }
    set focus(newFocus: flash.display.InteractiveObject) {
      newFocus = newFocus;
      notImplemented("public flash.display.Stage::set focus"); return;
    }
    get colorCorrection(): string {
      notImplemented("public flash.display.Stage::get colorCorrection"); return;
    }
    set colorCorrection(value: string) {
      value = "" + value;
      notImplemented("public flash.display.Stage::set colorCorrection"); return;
    }
    get colorCorrectionSupport(): string {
      notImplemented("public flash.display.Stage::get colorCorrectionSupport"); return;
    }
    isFocusInaccessible(): boolean {
      notImplemented("public flash.display.Stage::isFocusInaccessible"); return;
    }
    get stageFocusRect(): boolean {
      notImplemented("public flash.display.Stage::get stageFocusRect"); return;
    }
    set stageFocusRect(on: boolean) {
      on = !!on;
      notImplemented("public flash.display.Stage::set stageFocusRect"); return;
    }
    get quality(): string {
      notImplemented("public flash.display.Stage::get quality"); return;
    }
    set quality(value: string) {
      value = "" + value;
      notImplemented("public flash.display.Stage::set quality"); return;
    }
    get displayState(): string {
      notImplemented("public flash.display.Stage::get displayState"); return;
    }
    set displayState(value: string) {
      value = "" + value;
      notImplemented("public flash.display.Stage::set displayState"); return;
    }
    get fullScreenSourceRect(): flash.geom.Rectangle {
      notImplemented("public flash.display.Stage::get fullScreenSourceRect"); return;
    }
    set fullScreenSourceRect(value: flash.geom.Rectangle) {
      value = value;
      notImplemented("public flash.display.Stage::set fullScreenSourceRect"); return;
    }
    get mouseLock(): boolean {
      notImplemented("public flash.display.Stage::get mouseLock"); return;
    }
    set mouseLock(value: boolean) {
      value = !!value;
      notImplemented("public flash.display.Stage::set mouseLock"); return;
    }
    get stageVideos(): ASVector<flash.media.StageVideo> {
      notImplemented("public flash.display.Stage::get stageVideos"); return;
    }
    get stage3Ds(): ASVector<flash.display.Stage3D> {
      notImplemented("public flash.display.Stage::get stage3Ds"); return;
    }
    get color(): number /*uint*/ {
      notImplemented("public flash.display.Stage::get color"); return;
    }
    set color(color: number /*uint*/) {
      color = color >>> 0;
      notImplemented("public flash.display.Stage::set color"); return;
    }
    get fullScreenWidth(): number /*uint*/ {
      notImplemented("public flash.display.Stage::get fullScreenWidth"); return;
    }
    get fullScreenHeight(): number /*uint*/ {
      notImplemented("public flash.display.Stage::get fullScreenHeight"); return;
    }
    get wmodeGPU(): boolean {
      notImplemented("public flash.display.Stage::get wmodeGPU"); return;
    }
    get softKeyboardRect(): flash.geom.Rectangle {
      notImplemented("public flash.display.Stage::get softKeyboardRect"); return;
    }
    get allowsFullScreen(): boolean {
      notImplemented("public flash.display.Stage::get allowsFullScreen"); return;
    }
    get allowsFullScreenInteractive(): boolean {
      notImplemented("public flash.display.Stage::get allowsFullScreenInteractive"); return;
    }
    removeChildAt(index: number /*int*/): flash.display.DisplayObject {
      index = index | 0;
      notImplemented("public flash.display.Stage::removeChildAt"); return;
    }
    swapChildrenAt(index1: number /*int*/, index2: number /*int*/): void {
      index1 = index1 | 0; index2 = index2 | 0;
      notImplemented("public flash.display.Stage::swapChildrenAt"); return;
    }
    get contentsScaleFactor(): number {
      notImplemented("public flash.display.Stage::get contentsScaleFactor"); return;
    }
    requireOwnerPermissions(): void {
      notImplemented("public flash.display.Stage::requireOwnerPermissions"); return;
    }
    get displayContextInfo(): string {
      notImplemented("public flash.display.Stage::get displayContextInfo"); return;
    }
  }
}
