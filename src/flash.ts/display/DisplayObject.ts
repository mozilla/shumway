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
// Class: DisplayObject
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  export class DisplayObject extends flash.events.EventDispatcher implements IBitmapDrawable {
    static initializer: any = null;
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.display.DisplayObject");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    hitTestObject: (obj: flash.display.DisplayObject) => boolean;
    hitTestPoint: (x: number, y: number, shapeFlag: boolean = false) => boolean;
    // Instance AS -> JS Bindings
    get root(): flash.display.DisplayObject {
      notImplemented("public flash.display.DisplayObject::get root"); return;
    }
    get stage(): flash.display.Stage {
      notImplemented("public flash.display.DisplayObject::get stage"); return;
    }
    get name(): string {
      notImplemented("public flash.display.DisplayObject::get name"); return;
    }
    set name(value: string) {
      value = "" + value;
      notImplemented("public flash.display.DisplayObject::set name"); return;
    }
    get parent(): flash.display.DisplayObjectContainer {
      notImplemented("public flash.display.DisplayObject::get parent"); return;
    }
    get mask(): flash.display.DisplayObject {
      notImplemented("public flash.display.DisplayObject::get mask"); return;
    }
    set mask(value: flash.display.DisplayObject) {
      value = value;
      notImplemented("public flash.display.DisplayObject::set mask"); return;
    }
    get visible(): boolean {
      notImplemented("public flash.display.DisplayObject::get visible"); return;
    }
    set visible(value: boolean) {
      value = !!value;
      notImplemented("public flash.display.DisplayObject::set visible"); return;
    }
    get x(): number {
      notImplemented("public flash.display.DisplayObject::get x"); return;
    }
    set x(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set x"); return;
    }
    get y(): number {
      notImplemented("public flash.display.DisplayObject::get y"); return;
    }
    set y(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set y"); return;
    }
    get z(): number {
      notImplemented("public flash.display.DisplayObject::get z"); return;
    }
    set z(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set z"); return;
    }
    get scaleX(): number {
      notImplemented("public flash.display.DisplayObject::get scaleX"); return;
    }
    set scaleX(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set scaleX"); return;
    }
    get scaleY(): number {
      notImplemented("public flash.display.DisplayObject::get scaleY"); return;
    }
    set scaleY(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set scaleY"); return;
    }
    get scaleZ(): number {
      notImplemented("public flash.display.DisplayObject::get scaleZ"); return;
    }
    set scaleZ(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set scaleZ"); return;
    }
    get mouseX(): number {
      notImplemented("public flash.display.DisplayObject::get mouseX"); return;
    }
    get mouseY(): number {
      notImplemented("public flash.display.DisplayObject::get mouseY"); return;
    }
    get rotation(): number {
      notImplemented("public flash.display.DisplayObject::get rotation"); return;
    }
    set rotation(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set rotation"); return;
    }
    get rotationX(): number {
      notImplemented("public flash.display.DisplayObject::get rotationX"); return;
    }
    set rotationX(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set rotationX"); return;
    }
    get rotationY(): number {
      notImplemented("public flash.display.DisplayObject::get rotationY"); return;
    }
    set rotationY(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set rotationY"); return;
    }
    get rotationZ(): number {
      notImplemented("public flash.display.DisplayObject::get rotationZ"); return;
    }
    set rotationZ(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set rotationZ"); return;
    }
    get alpha(): number {
      notImplemented("public flash.display.DisplayObject::get alpha"); return;
    }
    set alpha(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set alpha"); return;
    }
    get width(): number {
      notImplemented("public flash.display.DisplayObject::get width"); return;
    }
    set width(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set width"); return;
    }
    get height(): number {
      notImplemented("public flash.display.DisplayObject::get height"); return;
    }
    set height(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set height"); return;
    }
    get cacheAsBitmap(): boolean {
      notImplemented("public flash.display.DisplayObject::get cacheAsBitmap"); return;
    }
    set cacheAsBitmap(value: boolean) {
      value = !!value;
      notImplemented("public flash.display.DisplayObject::set cacheAsBitmap"); return;
    }
    get opaqueBackground(): ASObject {
      notImplemented("public flash.display.DisplayObject::get opaqueBackground"); return;
    }
    set opaqueBackground(value: ASObject) {
      value = value;
      notImplemented("public flash.display.DisplayObject::set opaqueBackground"); return;
    }
    get scrollRect(): flash.geom.Rectangle {
      notImplemented("public flash.display.DisplayObject::get scrollRect"); return;
    }
    set scrollRect(value: flash.geom.Rectangle) {
      value = value;
      notImplemented("public flash.display.DisplayObject::set scrollRect"); return;
    }
    get filters(): any [] {
      notImplemented("public flash.display.DisplayObject::get filters"); return;
    }
    set filters(value: any []) {
      value = value;
      notImplemented("public flash.display.DisplayObject::set filters"); return;
    }
    get blendMode(): string {
      notImplemented("public flash.display.DisplayObject::get blendMode"); return;
    }
    set blendMode(value: string) {
      value = "" + value;
      notImplemented("public flash.display.DisplayObject::set blendMode"); return;
    }
    get transform(): flash.geom.Transform {
      notImplemented("public flash.display.DisplayObject::get transform"); return;
    }
    set transform(value: flash.geom.Transform) {
      value = value;
      notImplemented("public flash.display.DisplayObject::set transform"); return;
    }
    get scale9Grid(): flash.geom.Rectangle {
      notImplemented("public flash.display.DisplayObject::get scale9Grid"); return;
    }
    set scale9Grid(innerRectangle: flash.geom.Rectangle) {
      innerRectangle = innerRectangle;
      notImplemented("public flash.display.DisplayObject::set scale9Grid"); return;
    }
    globalToLocal(point: flash.geom.Point): flash.geom.Point {
      point = point;
      notImplemented("public flash.display.DisplayObject::globalToLocal"); return;
    }
    localToGlobal(point: flash.geom.Point): flash.geom.Point {
      point = point;
      notImplemented("public flash.display.DisplayObject::localToGlobal"); return;
    }
    getBounds(targetCoordinateSpace: flash.display.DisplayObject): flash.geom.Rectangle {
      targetCoordinateSpace = targetCoordinateSpace;
      notImplemented("public flash.display.DisplayObject::getBounds"); return;
    }
    getRect(targetCoordinateSpace: flash.display.DisplayObject): flash.geom.Rectangle {
      targetCoordinateSpace = targetCoordinateSpace;
      notImplemented("public flash.display.DisplayObject::getRect"); return;
    }
    get loaderInfo(): flash.display.LoaderInfo {
      notImplemented("public flash.display.DisplayObject::get loaderInfo"); return;
    }
    _hitTest(use_xy: boolean, x: number, y: number, useShape: boolean, hitTestObject: flash.display.DisplayObject): boolean {
      use_xy = !!use_xy; x = +x; y = +y; useShape = !!useShape; hitTestObject = hitTestObject;
      notImplemented("public flash.display.DisplayObject::_hitTest"); return;
    }
    get accessibilityProperties(): flash.accessibility.AccessibilityProperties {
      notImplemented("public flash.display.DisplayObject::get accessibilityProperties"); return;
    }
    set accessibilityProperties(value: flash.accessibility.AccessibilityProperties) {
      value = value;
      notImplemented("public flash.display.DisplayObject::set accessibilityProperties"); return;
    }
    globalToLocal3D(point: flash.geom.Point): flash.geom.Vector3D {
      point = point;
      notImplemented("public flash.display.DisplayObject::globalToLocal3D"); return;
    }
    local3DToGlobal(point3d: flash.geom.Vector3D): flash.geom.Point {
      point3d = point3d;
      notImplemented("public flash.display.DisplayObject::local3DToGlobal"); return;
    }
    set blendShader(value: flash.display.Shader) {
      value = value;
      notImplemented("public flash.display.DisplayObject::set blendShader"); return;
    }
  }
}
