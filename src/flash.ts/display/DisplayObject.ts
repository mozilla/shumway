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
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["hitTestObject", "hitTestPoint"];
    
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.display.DisplayObject");
    }
    
    // JS -> AS Bindings
    
    hitTestObject: (obj: flash.display.DisplayObject) => boolean;
    hitTestPoint: (x: number, y: number, shapeFlag: boolean = false) => boolean;
    
    // AS -> JS Bindings
    
    // _root: flash.display.DisplayObject;
    // _stage: flash.display.Stage;
    // _name: string;
    _parent: flash.display.DisplayObjectContainer;
    // _mask: flash.display.DisplayObject;
    // _visible: boolean;
    // _x: number;
    // _y: number;
    // _z: number;
    // _scaleX: number;
    // _scaleY: number;
    // _scaleZ: number;
    // _mouseX: number;
    // _mouseY: number;
    // _rotation: number;
    // _rotationX: number;
    // _rotationY: number;
    // _rotationZ: number;
    // _alpha: number;
    // _width: number;
    // _height: number;
    // _cacheAsBitmap: boolean;
    // _opaqueBackground: ASObject;
    // _scrollRect: flash.geom.Rectangle;
    // _filters: any [];
    // _blendMode: string;
    // _transform: flash.geom.Transform;
    // _scale9Grid: flash.geom.Rectangle;
    // _loaderInfo: flash.display.LoaderInfo;
    // _accessibilityProperties: flash.accessibility.AccessibilityProperties;
    // _blendShader: flash.display.Shader;
    get root(): flash.display.DisplayObject {
      notImplemented("public flash.display.DisplayObject::get root"); return;
      // return this._root;
    }
    get stage(): flash.display.Stage {
      notImplemented("public flash.display.DisplayObject::get stage"); return;
      // return this._stage;
    }
    get name(): string {
      notImplemented("public flash.display.DisplayObject::get name"); return;
      // return this._name;
    }
    set name(value: string) {
      value = "" + value;
      notImplemented("public flash.display.DisplayObject::set name"); return;
      // this._name = value;
    }
    get parent(): flash.display.DisplayObjectContainer {
      notImplemented("public flash.display.DisplayObject::get parent"); return;
      // return this._parent;
    }
    get mask(): flash.display.DisplayObject {
      notImplemented("public flash.display.DisplayObject::get mask"); return;
      // return this._mask;
    }
    set mask(value: flash.display.DisplayObject) {
      value = value;
      notImplemented("public flash.display.DisplayObject::set mask"); return;
      // this._mask = value;
    }
    get visible(): boolean {
      notImplemented("public flash.display.DisplayObject::get visible"); return;
      // return this._visible;
    }
    set visible(value: boolean) {
      value = !!value;
      notImplemented("public flash.display.DisplayObject::set visible"); return;
      // this._visible = value;
    }
    get x(): number {
      notImplemented("public flash.display.DisplayObject::get x"); return;
      // return this._x;
    }
    set x(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set x"); return;
      // this._x = value;
    }
    get y(): number {
      notImplemented("public flash.display.DisplayObject::get y"); return;
      // return this._y;
    }
    set y(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set y"); return;
      // this._y = value;
    }
    get z(): number {
      notImplemented("public flash.display.DisplayObject::get z"); return;
      // return this._z;
    }
    set z(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set z"); return;
      // this._z = value;
    }
    get scaleX(): number {
      notImplemented("public flash.display.DisplayObject::get scaleX"); return;
      // return this._scaleX;
    }
    set scaleX(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set scaleX"); return;
      // this._scaleX = value;
    }
    get scaleY(): number {
      notImplemented("public flash.display.DisplayObject::get scaleY"); return;
      // return this._scaleY;
    }
    set scaleY(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set scaleY"); return;
      // this._scaleY = value;
    }
    get scaleZ(): number {
      notImplemented("public flash.display.DisplayObject::get scaleZ"); return;
      // return this._scaleZ;
    }
    set scaleZ(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set scaleZ"); return;
      // this._scaleZ = value;
    }
    get mouseX(): number {
      notImplemented("public flash.display.DisplayObject::get mouseX"); return;
      // return this._mouseX;
    }
    get mouseY(): number {
      notImplemented("public flash.display.DisplayObject::get mouseY"); return;
      // return this._mouseY;
    }
    get rotation(): number {
      notImplemented("public flash.display.DisplayObject::get rotation"); return;
      // return this._rotation;
    }
    set rotation(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set rotation"); return;
      // this._rotation = value;
    }
    get rotationX(): number {
      notImplemented("public flash.display.DisplayObject::get rotationX"); return;
      // return this._rotationX;
    }
    set rotationX(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set rotationX"); return;
      // this._rotationX = value;
    }
    get rotationY(): number {
      notImplemented("public flash.display.DisplayObject::get rotationY"); return;
      // return this._rotationY;
    }
    set rotationY(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set rotationY"); return;
      // this._rotationY = value;
    }
    get rotationZ(): number {
      notImplemented("public flash.display.DisplayObject::get rotationZ"); return;
      // return this._rotationZ;
    }
    set rotationZ(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set rotationZ"); return;
      // this._rotationZ = value;
    }
    get alpha(): number {
      notImplemented("public flash.display.DisplayObject::get alpha"); return;
      // return this._alpha;
    }
    set alpha(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set alpha"); return;
      // this._alpha = value;
    }
    get width(): number {
      notImplemented("public flash.display.DisplayObject::get width"); return;
      // return this._width;
    }
    set width(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set width"); return;
      // this._width = value;
    }
    get height(): number {
      notImplemented("public flash.display.DisplayObject::get height"); return;
      // return this._height;
    }
    set height(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set height"); return;
      // this._height = value;
    }
    get cacheAsBitmap(): boolean {
      notImplemented("public flash.display.DisplayObject::get cacheAsBitmap"); return;
      // return this._cacheAsBitmap;
    }
    set cacheAsBitmap(value: boolean) {
      value = !!value;
      notImplemented("public flash.display.DisplayObject::set cacheAsBitmap"); return;
      // this._cacheAsBitmap = value;
    }
    get opaqueBackground(): ASObject {
      notImplemented("public flash.display.DisplayObject::get opaqueBackground"); return;
      // return this._opaqueBackground;
    }
    set opaqueBackground(value: ASObject) {
      value = value;
      notImplemented("public flash.display.DisplayObject::set opaqueBackground"); return;
      // this._opaqueBackground = value;
    }
    get scrollRect(): flash.geom.Rectangle {
      notImplemented("public flash.display.DisplayObject::get scrollRect"); return;
      // return this._scrollRect;
    }
    set scrollRect(value: flash.geom.Rectangle) {
      value = value;
      notImplemented("public flash.display.DisplayObject::set scrollRect"); return;
      // this._scrollRect = value;
    }
    get filters(): any [] {
      notImplemented("public flash.display.DisplayObject::get filters"); return;
      // return this._filters;
    }
    set filters(value: any []) {
      value = value;
      notImplemented("public flash.display.DisplayObject::set filters"); return;
      // this._filters = value;
    }
    get blendMode(): string {
      notImplemented("public flash.display.DisplayObject::get blendMode"); return;
      // return this._blendMode;
    }
    set blendMode(value: string) {
      value = "" + value;
      notImplemented("public flash.display.DisplayObject::set blendMode"); return;
      // this._blendMode = value;
    }
    get transform(): flash.geom.Transform {
      notImplemented("public flash.display.DisplayObject::get transform"); return;
      // return this._transform;
    }
    set transform(value: flash.geom.Transform) {
      value = value;
      notImplemented("public flash.display.DisplayObject::set transform"); return;
      // this._transform = value;
    }
    get scale9Grid(): flash.geom.Rectangle {
      notImplemented("public flash.display.DisplayObject::get scale9Grid"); return;
      // return this._scale9Grid;
    }
    set scale9Grid(innerRectangle: flash.geom.Rectangle) {
      innerRectangle = innerRectangle;
      notImplemented("public flash.display.DisplayObject::set scale9Grid"); return;
      // this._scale9Grid = innerRectangle;
    }
    get loaderInfo(): flash.display.LoaderInfo {
      notImplemented("public flash.display.DisplayObject::get loaderInfo"); return;
      // return this._loaderInfo;
    }
    get accessibilityProperties(): flash.accessibility.AccessibilityProperties {
      notImplemented("public flash.display.DisplayObject::get accessibilityProperties"); return;
      // return this._accessibilityProperties;
    }
    set accessibilityProperties(value: flash.accessibility.AccessibilityProperties) {
      value = value;
      notImplemented("public flash.display.DisplayObject::set accessibilityProperties"); return;
      // this._accessibilityProperties = value;
    }
    set blendShader(value: flash.display.Shader) {
      value = value;
      notImplemented("public flash.display.DisplayObject::set blendShader"); return;
      // this._blendShader = value;
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
    globalToLocal3D(point: flash.geom.Point): flash.geom.Vector3D {
      point = point;
      notImplemented("public flash.display.DisplayObject::globalToLocal3D"); return;
    }
    local3DToGlobal(point3d: flash.geom.Vector3D): flash.geom.Point {
      point3d = point3d;
      notImplemented("public flash.display.DisplayObject::local3DToGlobal"); return;
    }
    _hitTest(use_xy: boolean, x: number, y: number, useShape: boolean, hitTestObject: flash.display.DisplayObject): boolean {
      use_xy = !!use_xy; x = +x; y = +y; useShape = !!useShape; hitTestObject = hitTestObject;
      notImplemented("public flash.display.DisplayObject::_hitTest"); return;
    }
  }
}
