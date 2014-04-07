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
// Class: DisplayObject
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import throwError = Shumway.AVM2.Runtime.throwError;

  import BlendMode = flash.display.BlendMode;
  import ColorTransform = flash.geom.ColorTransform;
  import Matrix = flash.geom.Matrix;
  import Point = flash.geom.Point;
  import Rectangle = flash.geom.Rectangle;

  export class DisplayObject extends flash.events.EventDispatcher implements IBitmapDrawable {

    private static _instances: DisplayObject [];

    // Called whenever the class is initialized.
    static classInitializer: any = function () {
      DisplayObject._instances = [];
    };
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = function () {
      var self: DisplayObject = this;

      DisplayObject._instances.push(self);

      self._root = null;
      self._stage = null;
      self._name = 'instance' + DisplayObject._instances.length;
      self._parent = null;
      self._mask = null;
      self._visible = true;
      self._z = 0;
      self._scaleX = 1;
      self._scaleY = 1;
      self._scaleZ = 1;
      self._mouseX = 0;
      self._mouseY = 0;
      self._rotation = 0;
      self._rotationX = 0;
      self._rotationY = 0;
      self._rotationZ = 0;
      self._alpha = 1;
      self._width = 0;
      self._height = 0;
      self._cacheAsBitmap = false;
      self._opaqueBackground = null;
      self._scrollRect = null;
      self._filters = [];
      self._blendMode = BlendMode.NORMAL;
      self._scale9Grid = null;
      self._loaderInfo = null;
      self._accessibilityProperties = null;

      self._bbox = null;
      self._bounds = null;
      self._clipDepth = 0;
      self._concatenatedTransform = new Matrix();
      self._currentTransform = new Matrix();
      self._current3dTransform = null;
      self._cxform = new ColorTransform();
      self._depth = 0;
      self._graphics = null;
      self._index = -1;
      self._level = -1;
      self._maskedObject = null;
      self._rotationCos = 0;
      self._rotationSin = 0;

      // TODO get this via loaderInfo
      self._loader = null;

      // TODO make these flags
      self._animated = false;
      self._boundsInvalid = false;
      self._constructed = false;
      self._destroyed = false;
      self._invalid = false;
      self._owned = false;
      self._transformInvalid = false;

      // TODO move to InteractiveObject
      self._mouseOver = false;

      // TODO move to DisplayObjectContainer
      self._children = [];
      self._isContainer = false;
      self._mouseChildren = true;

      // Not sure if needed anymore
      self._invisible = false;

      var s = self.symbol;
      if (s) {
        self._root = s.root || self._root;
        self._stage = s.stage || self._stage;
        self._name = s.name || self._stage;
        self._parent = s.parent || self._parent;
        self._blendMode = s.blendMode ? BlendMode.fromNumber(s.blendMode) : self._blendMode;

        //var scale9Grid = s.scale9Grid;
        //if (scale9Grid) {
        //  this._scale9Grid = new flash.geom.Rectangle(
        //    scale9Grid.left,
        //    scale9Grid.top,
        //    (scale9Grid.right - scale9Grid.left),
        //    (scale9Grid.bottom - scale9Grid.top)
        //  );
        //}

        self._animated = s.animated || self._animated;
        self._bbox = s.bbox || self._bbox;
        self._clipDepth = s.clipDepth || self._clipDepth;

        if (s.currentTransform) {
          this._setTransformMatrix(s.currentTransform, false);
        }
        if (s.cxform) {
          this._setColorTransform(s.cxform);
        }

        self._depth = s.depth || self._depth;
        self._index = isNaN(s.index) ? self._index : s.index;
        self._level = isNaN(s.level) ? self._level : s.level;
        self._loader = s.loader || self._loader;
        self._owned = s.owned || self._owned;
      }
    };
    
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
    
    _root: flash.display.DisplayObject;
    _stage: flash.display.Stage;
    _name: string;
    _parent: flash.display.DisplayObjectContainer;
    _mask: flash.display.DisplayObject;
    _visible: boolean;
    _z: number;
    _scaleX: number;
    _scaleY: number;
    _scaleZ: number;
    _mouseX: number;
    _mouseY: number;
    _rotation: number;
    _rotationX: number;
    _rotationY: number;
    _rotationZ: number;
    _alpha: number;
    _width: number;
    _height: number;
    _cacheAsBitmap: boolean;
    _opaqueBackground: ASObject;
    _scrollRect: flash.geom.Rectangle;
    _filters: any [];
    _blendMode: string;
    _scale9Grid: flash.geom.Rectangle;
    _loaderInfo: flash.display.LoaderInfo;
    _accessibilityProperties: flash.accessibility.AccessibilityProperties;

    _animated: boolean;
    _bbox: any;
    _bounds: flash.geom.Rectangle;
    _boundsInvalid: boolean;
    _children: flash.display.DisplayObject [];
    _clipDepth: number;
    _concatenatedTransform: flash.geom.Matrix;
    _constructed: boolean;
    _currentTransform: flash.geom.Matrix;
    _current3dTransform: flash.geom.Matrix3D;
    _cxform: flash.geom.ColorTransform;
    _depth: number;
    _destroyed: boolean;
    _graphics: flash.display.Graphics;
    _index: number;
    _invalid: boolean;
    _invisible: boolean;
    _isContainer: boolean;
    _level: number;
    _loader: flash.display.Loader;
    _maskedObject: flash.display.DisplayObject;
    _mouseChildren: boolean;
    _mouseOver: boolean;
    _owned: boolean;
    _rotationCos: number;
    _rotationSin: number;
    _transformInvalid: boolean;
    _zindex: number;

    symbol: any;

    private _setTransformMatrix(matrix: Matrix, convertToTwips: boolean): void {
      convertToTwips = !!convertToTwips;

      var a = matrix.a;
      var b = matrix.b;
      var c = matrix.c;
      var d = matrix.d;
      var tx, ty;
      if (convertToTwips) {
        tx = (matrix.tx * 20) | 0;
        ty = (matrix.ty * 20) | 0;
      } else {
        tx = matrix.tx;
        ty = matrix.ty;
      }
      var angle = a ? Math.atan(b / a) : (b > 0 ? Math.PI / 2 : -Math.PI / 2);
      this._rotation = angle * 180 / Math.PI;
      this._rotationCos = Math.cos(angle);
      this._rotationSin = Math.sin(angle);
      this._scaleX = Math.sqrt(a * a + b * b);
      this._scaleY = Math.sqrt(d * d + c * c);
      this._currentTransform.setTo(a, b, c, d, tx, ty);
      this._invalidate();
      this._invalidateTransform();
    }
    private _getConcatenatedTransform(targetCoordSpace: DisplayObject): Matrix {
      var stage = this._stage;

      if (this === stage || targetCoordSpace === this._parent) {
        return this._currentTransform;
      }

      var invalidNode = null;
      var m1, m2;
      var currentNode = this;
      while (currentNode !== stage) {
        if (currentNode._transformInvalid) {
          invalidNode = currentNode;
        }
        if (currentNode === targetCoordSpace) {
          m2 = currentNode._concatenatedTransform.clone();
        }
        currentNode = currentNode._parent;
      }

      if (invalidNode) {
        if (this._parent === stage) {
          m1 = this._concatenatedTransform;
          m1.copyFrom(this._currentTransform);
        } else {
          var stack = [];
          var currentNode = this;
          while (currentNode !== invalidNode) {
            stack.push(currentNode);
            currentNode = currentNode._parent;
          }

          var node = invalidNode;
          do {
            m1 = node._concatenatedTransform;
            if (node._parent) {
              if (node._parent !== stage) {
                m1.copyFrom(node._parent._concatenatedTransform);
                m1.concat(node._currentTransform);
              }
            } else {
              m1.copyFrom(node._currentTransform);
            }
            node._transformInvalid = false;

            var nextNode = stack.pop();
            var children = node._children;
            for (var i = 0; i < children.length; i++) {
              var child = children[i];
              if (child !== nextNode) {
                child._transformInvalid = true;
              }
            }
            node = nextNode;
          } while (node);
        }
      } else {
        m1 = this._concatenatedTransform;
      }

      if (targetCoordSpace && targetCoordSpace !== stage) {
        if (!m2) {
          m2 = targetCoordSpace._getConcatenatedTransform(null).clone();
        }
        m2.invert();
        m2.concat(m1);
        return m2;
      }

      return m1;
    }
    private _setColorTransform(cxform: flash.geom.ColorTransform) {
      this._cxform.copyFrom(cxform);
      this._invalidate();
    }
    private _getContentBounds(): Rectangle {
      var bounds = this._bounds;

      if (this._boundsInvalid) {
        var xMin = Number.MAX_VALUE;
        var xMax = Number.MIN_VALUE;
        var yMin = Number.MAX_VALUE;
        var yMax = Number.MIN_VALUE;

        var bbox = this._bbox;
        if (bbox) {
          xMin = bbox.xMin;
          xMax = bbox.xMax;
          yMin = bbox.yMin;
          yMax = bbox.yMax;
        } else {
          if (this._graphics) {
            var b = this._graphics._getBounds(true);
            if (!b.isEmpty()) {
              xMin = b.x;
              yMin = b.y;
              xMax = b.x + b.width;
              yMax = b.y + b.height;
            }
          }

          var children = this._children;
          for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var b = child.getBounds(this);
            if (!b.isEmpty()) {
              var x1 = b.x;
              var y1 = b.y;
              var x2 = b.x + b.width;
              var y2 = b.y + b.height;
              xMin = Math.min(xMin, x1, x2);
              xMax = Math.max(xMax, x1, x2);
              yMin = Math.min(yMin, y1, y2);
              yMax = Math.max(yMax, y1, y2);
            }
          }
        }

        if (xMin === Number.MAX_VALUE) {
          xMin = xMax = yMin = yMax = 0;
        }
        bounds.setTo(xMin, yMin, xMax - xMin, yMax - yMin);
        this._boundsInvalid = false;
      }

      return bounds;
    }
    private _transformRect(rect: Rectangle, targetCoordSpace: flash.display.DisplayObject): void {
      if (!targetCoordSpace || targetCoordSpace === this || rect.isEmpty()) {
        return;
      }

      var xMin = rect.x;
      var xMax = rect.y;
      var yMin = rect.x + rect.width;
      var yMax = rect.y + rect.height;

      var m = this._getConcatenatedTransform(targetCoordSpace);
      var x0 = (m.a * xMin + m.c * yMin + m.tx) | 0;
      var y0 = (m.b * xMin + m.d * yMin + m.ty) | 0;
      var x1 = (m.a * xMax + m.c * yMin + m.tx) | 0;
      var y1 = (m.b * xMax + m.d * yMin + m.ty) | 0;
      var x2 = (m.a * xMax + m.c * yMax + m.tx) | 0;
      var y2 = (m.b * xMax + m.d * yMax + m.ty) | 0;
      var x3 = (m.a * xMin + m.c * yMax + m.tx) | 0;
      var y3 = (m.b * xMin + m.d * yMax + m.ty) | 0;
      var tmp = 0;

      // Manual Min/Max is a lot faster than calling Math.min/max
      // X Min-Max
      if (x0 > x1) {
        tmp = x0;
        x0 = x1;
        x1 = tmp;
      }
      if (x2 > x3) {
        tmp = x2;
        x2 = x3;
        x3 = tmp;
      }
      xMin = x0 < x2 ? x0 : x2;
      xMax = x1 > x3 ? x1 : x3;

      // Y Min-Max
      if (y0 > y1) {
        tmp = y0;
        y0 = y1;
        y1 = tmp;
      }
      if (y2 > y3) {
        tmp = y2;
        y2 = y3;
        y3 = tmp;
      }
      yMin = y0 < y2 ? y0 : y2;
      yMax = y1 > y3 ? y1 : y3;

      rect.setTo(xMin, yMin, xMax - xMin, yMax - yMin);
    }
    private destroy(): void {
      this._destroyed = true;
    }

    _invalidate(): void {
      this._invalid = true;
    }
    _invalidateBounds(): void {
      var currentNode = this;
      while (currentNode && !currentNode._boundsInvalid) {
        currentNode._boundsInvalid = true;
        currentNode = currentNode._parent;
      }
    }
    _invalidateTransform(): void {
      this._transformInvalid = true;
      if (this._parent) {
        this._parent._invalidateBounds();
      }
    }

    get root(): flash.display.DisplayObject {
      return this._root;
    }
    get stage(): flash.display.Stage {
      return this._stage;
    }
    get name(): string {
      return this._name;
    }
    set name(value: string) {
      this._name = "" + value;
    }
    get parent(): flash.display.DisplayObjectContainer {
      return this._parent;
    }
    get mask(): flash.display.DisplayObject {
      return this._mask;
    }
    set mask(value: flash.display.DisplayObject) {
      //value = value;

      if (this._mask === value || value === this) {
        return;
      }

      if (value && value._maskedObject) {
        value._maskedObject.mask = null;
      }
      this._mask = value;
      if (value) {
        value._maskedObject = this;
      }
      this._animated = false;
      this._invalidate();
    }
    get visible(): boolean {
      return this._visible;
    }
    set visible(value: boolean) {
      value = !!value;

      if (value === this._visible)
        return;

      this._visible = value;
      this._animated = false;
      this._invalidate();
    }
    get x(): number {
      return this._currentTransform.tx;
    }
    set x(value: number) {
      value = +value;

      if (value === this._currentTransform.tx) {
        return;
      }

      this._currentTransform.tx = value;
      this._animated = false;
      this._invalidate();
      this._invalidateTransform();
    }
    get y(): number {
      return this._currentTransform.ty;
    }
    set y(value: number) {
      value = +value;

      if (value === this._currentTransform.ty) {
        return;
      }

      this._currentTransform.ty = value;
      this._animated = false;
      this._invalidate();
      this._invalidateTransform();
    }
    get z(): number {
      return this._z;
    }
    set z(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set z"); return;
      // this._z = value;
    }
    get scaleX(): number {
      return this._scaleX;
    }
    set scaleX(value: number) {
      value = +value;

      if (value === this._scaleX) {
        return;
      }

      this._scaleX = value;
      this._currentTransform.scale(value, this._scaleY);
      this._animated = false;
      this._invalidate();
      this._invalidateTransform();
    }
    get scaleY(): number {
      return this._scaleY;
    }
    set scaleY(value: number) {
      value = +value;

      if (value === this._scaleY) {
        return;
      }

      this._scaleY = value;
      this._currentTransform.scale(this._scaleX, value);
      this._animated = false;
      this._invalidate();
      this._invalidateTransform();
    }
    get scaleZ(): number {
      return this._scaleZ;
    }
    set scaleZ(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set scaleZ"); return;
      // this._scaleZ = value;
    }
    get mouseX(): number {
      return (this._mouseX / 20) | 0;
    }
    get mouseY(): number {
      return (this._mouseY / 20) | 0;
    }
    get rotation(): number {
      return this._rotation;
    }
    set rotation(value: number) {
      value = +value;

      value %= 360;
      if (value > 180) {
        value -= 360;
      }

      if (value === this._rotation) {
        return;
      }

      var angle = value / 180 * Math.PI;
      var u, v;
      switch (value) {
        case 0:
        case 360:
          u = 1, v = 0;
          break;
        case 90:
        case -270:
          u = 0, v = 1;
          break;
        case 180:
        case -180:
          u = -1, v = 0;
          break;
        case 270:
        case -90:
          u = 0, v = -1;
          break;
        default:
          u = Math.cos(angle);
          v = Math.sin(angle);
          break;
      }
      this._rotation = value;
      this._rotationCos = u;
      this._rotationSin = v;
      this._currentTransform.rotate(angle);
      this._animated = false;
      this._invalidate();
      this._invalidateTransform();
    }
    get rotationX(): number {
      return this._rotationX;
    }
    set rotationX(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set rotationX"); return;
      // this._rotationX = value;
    }
    get rotationY(): number {
      return this._rotationY;
    }
    set rotationY(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set rotationY"); return;
      // this._rotationY = value;
    }
    get rotationZ(): number {
      return this._rotationZ;
    }
    set rotationZ(value: number) {
      value = +value;
      notImplemented("public flash.display.DisplayObject::set rotationZ"); return;
      // this._rotationZ = value;
    }
    get alpha(): number {
      return this._alpha;
    }
    set alpha(value: number) {
      value = +value;

      if (value === this._alpha) {
        return;
      }

      this._alpha = value;
      this._animated = false;
      this._invalidate();
    }
    get width(): number {
      var bounds = this._getContentBounds();
      var m = this._currentTransform;
      return (Math.abs(m.a) * bounds.width +
              Math.abs(m.c) * bounds.height) | 0;
    }
    set width(value: number) {
      value = +value;

      if (value < 0) {
        return;
      }

      var u = Math.abs(this._rotationCos);
      var v = Math.abs(this._rotationSin);
      var bounds = this._getContentBounds();
      var baseWidth = u * bounds.width + v * bounds.height;

      if (!baseWidth) {
        return;
      }

      var baseHeight = v * bounds.width + u * bounds.height;
      this.scaleY = this.height / baseHeight;
      this.scaleX = value / baseWidth;
    }
    get height(): number {
      var bounds = this._getContentBounds();
      var m = this._currentTransform;
      return (Math.abs(m.b) * bounds.width +
              Math.abs(m.d) * bounds.height) | 0;
    }
    set height(value: number) {
      value = +value;

      if (value < 0) {
        return;
      }

      var u = Math.abs(this._rotationCos);
      var v = Math.abs(this._rotationSin);
      var bounds = this._getContentBounds();
      var baseHeight = v * bounds.width + u * bounds.height;

      if (!baseHeight) {
        return;
      }

      var baseWidth = u * bounds.width + v * bounds.height;
      this.scaleX = this.width / baseWidth;
      this.scaleY = value / baseHeight;
    }
    get cacheAsBitmap(): boolean {
      return this._filters.length > 0 || this._cacheAsBitmap;
    }
    set cacheAsBitmap(value: boolean) {
      value = !!value;
      if (!this._filters.length) {
        this._cacheAsBitmap = value;
      }
      this._animated = false;
    }
    get opaqueBackground(): ASObject {
      return this._opaqueBackground;
    }
    set opaqueBackground(value: ASObject) {
      value = value;
      notImplemented("public flash.display.DisplayObject::set opaqueBackground"); return;
      // this._opaqueBackground = value;
    }
    get scrollRect(): flash.geom.Rectangle {
      return this._scrollRect;
    }
    set scrollRect(value: flash.geom.Rectangle) {
      value = value;
      notImplemented("public flash.display.DisplayObject::set scrollRect"); return;
      // this._scrollRect = value;
    }
    get filters(): any [] {
      return this._filters;
    }
    set filters(value: any []) {
      //value = value;

      this._invalidate();
      this._filters = value;
      this._animated = false;
    }
    get blendMode(): string {
     return this._blendMode;
    }
    set blendMode(value: string) {
      value = "" + value;

      if (this._blendMode === value) {
        return;
      }

      if (BlendMode.isMember(value)) {
        this._blendMode = value;
      } else {
        throwError("ArgumentError", Errors.InvalidEnumError, "blendMode");
      }

      this._animated = false;
      this._invalidate();
    }
    get transform(): flash.geom.Transform {
      // TODO Twips-ify
      return new flash.geom.Transform(this);
    }
    set transform(value: flash.geom.Transform) {
      //value = value;

      var transform = this.transform;
      transform.colorTransform = value.colorTransform;
      if (value.matrix3D) {
        transform.matrix3D = value.matrix3D;
      } else {
        transform.matrix = value.matrix;
      }
    }
    get scale9Grid(): flash.geom.Rectangle {
      return this._scale9Grid;
    }
    set scale9Grid(innerRectangle: flash.geom.Rectangle) {
      innerRectangle = innerRectangle;
      notImplemented("public flash.display.DisplayObject::set scale9Grid"); return;
      // this._scale9Grid = innerRectangle;
    }
    get loaderInfo(): flash.display.LoaderInfo {
      return (this._loader && this._loader._contentLoaderInfo) ||
             (this._parent && this._parent.loaderInfo);
    }
    get accessibilityProperties(): flash.accessibility.AccessibilityProperties {
      return this._accessibilityProperties;
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
      //point = point;

      var m = this._getConcatenatedTransform(null).clone();
      m.invert();
      var p = m.transformCoords(point.x * 20, point.y * 20);
      p.x = (p.x / 20) | 0;
      p.y = (p.y / 20) | 0;
      return p;
    }
    localToGlobal(point: flash.geom.Point): flash.geom.Point {
      //point = point;

      var m = this._getConcatenatedTransform(null);
      var p = m.transformCoords(point.x * 20, point.y * 20);
      p.x = (p.x / 20) | 0;
      p.y = (p.y / 20) | 0;
      return p;
    }
    getBounds(targetCoordinateSpace: flash.display.DisplayObject): flash.geom.Rectangle {
      //targetCoordinateSpace = targetCoordinateSpace;
      var rect = this._getContentBounds().clone();
      this._transformRect(rect, targetCoordinateSpace);
      rect.x = (rect.x / 20) | 0;
      rect.y = (rect.x / 20) | 0;
      rect.width = (rect.width / 20) | 0;
      rect.height = (rect.height / 20) | 0;
      return rect;
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

      if (use_xy) {
        var m = this._getConcatenatedTransform(null).clone();
        m.invert();
        var point = m.transformCoords(x, y);

        var b = this._getContentBounds();
        if (!b.containsPoint(point)) {
          return false;
        }

        if (!useShape || !this._graphics) {
          return true;
        }

        // TODO move into Graphics
        if (this._graphics) {
          var paths = this._graphics._paths;
          for (var i = 0; i < paths.length; i++) {
            var path = paths[i];

            if (path.isPointInPath(point.x, point.y)) {
              return true;
            }

            if (path.strokeStyle) {
              var strokePath = path._strokePath;
              if (!strokePath) {
                strokePath = path.strokePath(path.drawingStyles);
                path._strokePath = strokePath;
              }

              if (strokePath.isPointInPath(point.x, point.y)) {
                return true;
              }
            }
          }
        }

        var children = this._children;
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          if (child._hitTest(true, x, y, true, null)) {
            return true;
          }
        }

        return false;
      }

      var b1 = this.getBounds(this._stage);
      var b2 = hitTestObject.getBounds(hitTestObject._stage);
      return b1.intersects(b2);
    }
  }
}
