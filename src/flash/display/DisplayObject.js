/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*global createEmptyObject, throwError, Errors, isString */

var DisplayObjectDefinition = (function () {

  var blendModes;

  var nextInstanceId = 1;
  function generateName() {
    return 'instance' + (nextInstanceId++);
  }

  // Dictionary of all broadcasted events with the event type as key and a
  // value specifying if public or internal only.
  var broadcastedEvents = { advanceFrame: false, enterFrame: true,
                            constructChildren: false, frameConstructed: true,
                            executeFrame: false, exitFrame: true,
                            render: true };

  var topLeft = { x: 0, y: 0 };
  var topRight = { x: 0, y: 0 };
  var bottomRight = { x: 0, y: 0 };
  var bottomLeft = { x: 0, y: 0 };

  var point = { x: 0, y: 0 };

  var def = {
    __class__: 'flash.display.DisplayObject',

    initialize: function () {
      var blendModeClass = flash.display.BlendMode.class;

      this._alpha = 1;
      this._animated = false;
      this._bbox = null;
      this._bitmap = null;
      this._blendMode = blendModeClass.NORMAL;
      this._bounds = { xMin: 0, xMax: 0, yMin: 0, yMax: 0, invalid: true };
      this._cacheAsBitmap = false;
      this._children = [];
      this._clipDepth = null;
      this._currentTransform = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
      this._concatenatedTransform = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0, invalid: true };
      this._current3DTransform = null;
      this._cxform = null;
      this._graphics = null;
      this._filters = [];
      this._loader = null;
      this._mouseChildren = true;
      this._mouseOver = false;
      this._mouseX = 0;
      this._mouseY = 0;
      this._name = null;
      this._opaqueBackground = null;
      this._owned = false;
      this._parent = null;
      this._rotation = 0;
      this._rotationCos = 1;
      this._rotationSin = 0;
      this._scale9Grid = null;
      this._scaleX = 1;
      this._scaleY = 1;
      this._stage = null;
      this._visible = true;
      this._hidden = false;
      this._wasCachedAsBitmap = false;
      this._destroyed = false;
      this._maskedObject = null;
      this._scrollRect = null;
      this._invalid = false;
      this._region = null;
      this._level = -1;
      this._index = -1;
      this._depth = -1;
      this._isContainer = false;

      blendModes = [
        blendModeClass.NORMAL,     // 0
        blendModeClass.NORMAL,     // 1
        blendModeClass.LAYER,      // 2
        blendModeClass.MULTIPLY,   // 3
        blendModeClass.SCREEN,     // 4
        blendModeClass.LIGHTEN,    // 5
        blendModeClass.DARKEN,     // 6
        blendModeClass.DIFFERENCE, // 7
        blendModeClass.ADD,        // 8
        blendModeClass.SUBTRACT,   // 9
        blendModeClass.INVERT,     // 10
        blendModeClass.ALPHA,      // 11
        blendModeClass.ERASE,      // 12
        blendModeClass.OVERLAY,    // 13
        blendModeClass.HARDLIGHT,  // 14
        blendModeClass.SHADER
      ];

      var s = this.symbol;
      if (s) {
        this._animated = s.animated || false;
        this._bbox = s.bbox || null;
        this._blendMode = this._resolveBlendMode(s.blendMode);
        this._children = s.children || [];
        this._clipDepth = s.clipDepth || null;
        this._cxform = s.cxform || null;
        this._loader = s.loader || null;
        this._name = s.name || null;
        this._owned = s.owned || false;
        this._parent = s.parent || null;
        this._level = isNaN(s.level) ? -1 : s.level;
        this._index = isNaN(s.index) ? -1 : s.index;
        this._depth = isNaN(s.depth) ? -1 : s.depth;
        this._root = s.root || null;
        this._stage = s.stage || null;

        var scale9Grid = s.scale9Grid;
        if (scale9Grid) {
          this._scale9Grid = new flash.geom.Rectangle(
            scale9Grid.left,
            scale9Grid.top,
            (scale9Grid.right - scale9Grid.left),
            (scale9Grid.bottom - scale9Grid.top)
          );
        }

        var matrix = s.currentTransform;
        if (matrix) {
          this._setTransformMatrix(matrix, false);
        }
      }

      this._accessibilityProperties = null;

      var self = this;
      this._onBroadcastMessage = function (type) {
        var listeners = self._listeners;
        // shortcut: checking if the listeners are exist before dispatching
        if (listeners[type]) {
          self._dispatchEvent(type);
        }
      };
    },

    _addEventListener: function addEventListener(type, listener, useCapture,
                                                 priority)
    {
      if (broadcastedEvents[type] === false) {
        avm2.systemDomain.onMessage.register(type, listener);
        return;
      }

      if (type in broadcastedEvents && !this._listeners[type]) {
        avm2.systemDomain.onMessage.register(type, this._onBroadcastMessage);
      }
      this._addEventListenerImpl(type, listener, useCapture, priority);
    },

    _removeEventListener: function addEventListener(type, listener, useCapture)
    {
      if (broadcastedEvents[type] === false) {
        avm2.systemDomain.onMessage.unregister(type, listener);
        return;
      }

      this._removeEventListenerImpl(type, listener, useCapture);
      if (type in broadcastedEvents && !this._listeners[type]) {
        avm2.systemDomain.onMessage.unregister(type, this._onBroadcastMessage);
      }
    },

    _resolveBlendMode: function (blendModeNumeric) {
      return blendModes[blendModeNumeric] || flash.display.BlendMode.class.NORMAL;
    },

    _getConcatenatedTransform: function (toDeviceSpace) {
      var stage = this._stage;

      if (this === this._stage) {
        return toDeviceSpace ? this._concatenatedTransform :
                               this._currentTransform;
      }

      var invalidNode = null;
      var m, m2;

      var currentNode = this;
      while (currentNode !== stage) {
        if (currentNode._concatenatedTransform.invalid) {
          invalidNode = currentNode;
        }
        currentNode = currentNode._parent;
      }

      if (invalidNode) {
        if (this._parent === stage) {
          m = this._concatenatedTransform;
          m2 = this._currentTransform;
          m.a = m2.a;
          m.b = m2.b;
          m.c = m2.c;
          m.d = m2.d;
          m.tx = m2.tx;
          m.ty = m2.ty;
        } else {
          var stack = [];
          var currentNode = this;
          while (currentNode !== invalidNode) {
            stack.push(currentNode);
            currentNode = currentNode._parent;
          }

          var node = invalidNode;
          do {
            var parent = node._parent;

            m = node._concatenatedTransform;
            m2 = node._currentTransform;

            if (parent) {
              if (parent !== stage) {
                var m3 = parent._concatenatedTransform;
                m.a = m2.a * m3.a + m2.b * m3.c;
                m.b = m2.a * m3.b + m2.b * m3.d;
                m.c = m2.c * m3.a + m2.d * m3.c;
                m.d = m2.d * m3.d + m2.c * m3.b;
                m.tx = m2.tx * m3.a + m3.tx + m2.ty * m3.c;
                m.ty = m2.ty * m3.d + m3.ty + m2.tx * m3.b;
              }
            } else {
              m.a = m2.a;
              m.b = m2.b;
              m.c = m2.c;
              m.d = m2.d;
              m.tx = m2.tx;
              m.ty = m2.ty;
            }

            m.invalid = false;

            var nextNode = stack.pop();

            var children = node._children;
            for (var i = 0; i < children.length; i++) {
              var child = children[i];
              if (child !== nextNode) {
                child._concatenatedTransform.invalid = true;
              }
            }

            node = nextNode;
          } while (node);
        }
      } else {
        m = this._concatenatedTransform;
      }

      if (toDeviceSpace && stage) {
        m2 = stage._concatenatedTransform;
        return { a: m.a * m2.a,
                 b: m.b * m2.d,
                 c: m.c * m2.a,
                 d: m.d * m2.d,
                 tx: m.tx * m2.a + m2.tx,
                 ty: m.ty * m2.d + m2.ty };
      }

      return m;
    },
    _applyCurrentTransform: function (targetCoordSpace, pt1, ptN) {
      if (!targetCoordSpace || targetCoordSpace === this) {
        return;
      }

      var m, a, b, c, d, tx, ty;

      if (targetCoordSpace === this._parent) {
        m = this._currentTransform;
        a = m.a;
        b = m.b;
        c = m.c;
        d = m.d;
        tx = m.tx;
        ty = m.ty;
      } else {
        m = this._getConcatenatedTransform();
        if (targetCoordSpace === this._stage) {
          a = m.a;
          b = m.b;
          c = m.c;
          d = m.d;
          tx = m.tx;
          ty = m.ty;
        } else {
          var m2 = targetCoordSpace._getConcatenatedTransform();
          var a2, b2, c2, d2, tx2, ty2;
          if (m2.b || m2.c) {
            var det = 1 / (m2.a * m2.d - m2.b * m2.c);

            a2 = m2.d * det;
            b2 = -m2.b * det;
            c2 = -m2.c * det;
            d2 = m2.a * det;

            tx2 = -(a2 * m2.tx + c2 * m2.ty);
            ty2 = -(b2 * m2.tx + d2 * m2.ty);
          } else {
            a2 = 1 / m2.a;
            b2 = 0;
            c2 = 0;
            d2 = 1 / m2.d;

            tx2 = m2.tx * -a2;
            ty2 = m2.ty * -d2;
          }

          a = a2 * m.a + c2 * m.b;
          b = b2 * m.a + d2 * m.b;
          c = a2 * m.c + c2 * m.d;
          d = b2 * m.c + d2 * m.d;
          tx = a2 * m.tx + c2 * m.ty + tx2;
          ty = b2 * m.tx + d2 * m.ty + ty2;
        }
      }

      if (a === 1 && !b && !c && d === 1 && !tx && !ty) {
        return;
      }

      for (var i = 1; i < arguments.length; i++) {
        var pt = arguments[i];
        var x = pt.x;
        var y = pt.y;
        pt.x = (a * x + c * y + tx)|0;
        pt.y = (d * y + b * x + ty)|0;
      }
    },
    _applyConcatenatedInverseTransform: function (pt) {
      var m = this._getConcatenatedTransform();
      var det = 1 / (m.a * m.d - m.b * m.c);
      var x = pt.x - m.tx;
      var y = pt.y - m.ty;
      pt.x = ((m.d * x - m.c * y) * det)|0;
      pt.y = ((m.a * y - m.b * x) * det)|0;
    },

    _hitTest: function(use_xy, x, y, useShape, hitTestObject) {
      if (use_xy) {
        point.x = x;
        point.y = y;
        this._applyConcatenatedInverseTransform(point);

        var b = this._getContentBounds();
        if (!(point.x >= b.xMin && point.x < b.xMax &&
              point.y >= b.yMin && point.y < b.yMax))
        {
          return false;
        }
        if (!useShape || !this._graphics) {
          return true;
        }
        // TODO: move into Graphics
        if (this._graphics) {
          var subpaths = this._graphics._paths;
          for (var i = 0, n = subpaths.length; i < n; i++) {
            var path = subpaths[i];

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
        for (var i = 0, n = children.length; i < n; i++) {
          var child = children[i];
          // FIXME first condition avoids crash in second expression. This
          // issue does not occur in Chrome or FF22, but does in FF23.0.1.
          if (child._hitTest && child._hitTest(true, x, y, true)) {
            return true;
          }
        }

        return false;
      }

      var b1 = this.getBounds(this._stage);
      var b2 = hitTestObject.getBounds(hitTestObject._stage);
      x = Math.max(b1.xMin, b2.xMin);
      y = Math.max(b1.yMin, b2.yMin);
      var width = Math.min(b1.xMax, b2.xMax) - x;
      var height = Math.min(b1.yMax, b2.yMax) - y;
      return width > 0 && height > 0;
    },
    _invalidate: function () {
      if (!this._invalid && this._stage) {
        this._stage._invalidateOnStage(this);
      }
    },
    _invalidateBounds: function () {
      var currentNode = this;
      while (currentNode && !currentNode._bounds.invalid) {
        currentNode._bounds.invalid = true;
        currentNode = currentNode._parent;
      }
    },
    _invalidateTransform: function () {
      this._concatenatedTransform.invalid = true;
    },
    _setTransformMatrix: function(matrix, convertToTwips) {
      var a = matrix.a;
      var b = matrix.b;
      var c = matrix.c;
      var d = matrix.d;
      var tx, ty;
      if (convertToTwips) {
        tx = matrix.tx*20|0;
        ty = matrix.ty*20|0;
      } else {
        tx = matrix.tx;
        ty = matrix.ty;
      }

      var angle = a !== 0 ? Math.atan(b / a) :
                  (b > 0 ? Math.PI / 2 : -Math.PI / 2);
      this._rotation = angle * 180 / Math.PI;
      this._rotationCos = Math.cos(angle);
      this._rotationSin = Math.sin(angle);

      var sx = Math.sqrt(a * a + b * b);
      this._scaleX = a > 0 ? sx : -sx;
      var sy = Math.sqrt(d * d + c * c);
      this._scaleY = d > 0 ? sy : -sy;

      var transform = this._currentTransform;
      transform.a = a;
      transform.b = b;
      transform.c = c;
      transform.d = d;
      transform.tx = tx;
      transform.ty = ty;

      this._invalidateTransform();
    },

    get accessibilityProperties() {
      return this._accessibilityProperties;
    },
    set accessibilityProperties(val) {
      this._accessibilityProperties = val;
    },
    get alpha() {
      return this._alpha;
    },
    set alpha(val) {
      if (val === this._alpha) {
        return;
      }

      this._invalidate();

      this._alpha = val;
      this._animated = false;
    },
    get blendMode() {
      return this._blendMode;
    },
    set blendMode(val) {
      if (blendModes.indexOf(val) >= 0) {
        this._blendMode = val;
      } else {
        throwError("ArgumentError", Errors.InvalidEnumError, "blendMode");
      }
      this._animated = false;
    },
    get cacheAsBitmap() {
      return this._cacheAsBitmap;
    },
    set cacheAsBitmap(val) {
      this._cacheAsBitmap = this._filters.length ? true : val;
      this._animated = false;
    },
    get filters() {
      return this._filters;
    },
    set filters(val) {
      if (val.length) {
        if (!this._filters.length)
          this._wasCachedAsBitmap = this._cacheAsBitmap;

        this._cacheAsBitmap = true;
      } else {
        this._cacheAsBitmap = this._wasCachedAsBitmap;
      }

      this._filters = val;
      this._animated = false;
    },
    get height() {
      var bounds = this._getContentBounds();
      var t = this._currentTransform;
      return (Math.abs(t.b) * (bounds.xMax - bounds.xMin) +
             Math.abs(t.d) * (bounds.yMax - bounds.yMin))|0;
    },
    set height(val) {
      if (val < 0) {
        return;
      }

      var u = Math.abs(this._rotationCos);
      var v = Math.abs(this._rotationSin);
      var bounds = this._getContentBounds();
      var baseHeight = v * (bounds.xMax - bounds.xMin) +
                       u * (bounds.yMax - bounds.yMin);
      if (!baseHeight) {
        return;
      }

      var baseWidth = u * (bounds.xMax - bounds.xMin) +
                      v * (bounds.yMax - bounds.yMin);
      this.scaleX = this.width / baseWidth;

      this.scaleY = val / baseHeight;
    },
    get loaderInfo() {
      return (this._loader && this._loader._contentLoaderInfo) || this._parent.loaderInfo;
    },
    get mask() {
      return this._mask;
    },
    set mask(val) {
      if (this._mask === val) {
        return;
      }

      this._invalidate();

      if (val && val._maskedObject) {
        val._maskedObject.mask = null;
      }

      this._mask = val;
      if (val) {
        val._maskedObject = this;
      }

      this._animated = false;
    },
    get name() {
      return this._name || (this._name = generateName());
    },
    set name(val) {
      this._name = val;
    },
    get mouseX() {
      if (!this._stage) {
        return 0;
      }
      point.x = this._stage._mouseX;
      point.y = this._stage._mouseY;
      this._applyConcatenatedInverseTransform(point);
      return point.x;
    },
    get mouseY() {
      if (!this._stage) {
        return 0;
      }
      point.x = this._stage._mouseX;
      point.y = this._stage._mouseY;
      this._applyConcatenatedInverseTransform(point);
      return point.y;
    },
    get opaqueBackground() {
      return this._opaqueBackground;
    },
    set opaqueBackground(val) {
      this._opaqueBackground = val;
      this._animated = false;
    },
    get parent() {
      return this._index > -1 ? this._parent : null;
    },
    get root() {
      return this._stage && this._stage._root;
    },
    get rotation() {
      return this._rotation;
    },
    set rotation(val) {
      val %= 360;
      if (val > 180) {
        val -= 360;
      }
      if (val === this._rotation)
        return;

      this._invalidate();
      this._invalidateBounds();
      this._invalidateTransform();

      this._rotation = val;

      var u, v;
      switch (val) {
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
        var angle = this._rotation / 180 * Math.PI;
        u = Math.cos(angle);
        v = Math.sin(angle);
        break;
      }

      this._rotationCos = u;
      this._rotationSin = v;

      var m = this._currentTransform;
      m.a = u * this._scaleX;
      m.b = v * this._scaleX;
      m.c = -v * this._scaleY;
      m.d = u * this._scaleY;

      this._animated = false;
    },
    get rotationX() {
      return 0;
    },
    set rotationX(val) {
      somewhatImplemented('DisplayObject.rotationX');
    },
    get rotationY() {
      return 0;
    },
    set rotationY(val) {
      somewhatImplemented('DisplayObject.rotationY');
    },
    get rotationZ() {
      return this.rotation;
    },
    set rotationZ(val) {
      this.rotation = val;
      somewhatImplemented('DisplayObject.rotationZ');
    },
    get stage() {
      return this._stage;
    },
    get scaleX() {
      return this._scaleX;
    },
    set scaleX(val) {
      if (val === this._scaleX)
        return;

      this._invalidate();
      this._invalidateBounds();
      this._invalidateTransform();

      this._scaleX = val;

      var m = this._currentTransform;
      m.a = this._rotationCos * val;
      m.b = this._rotationSin * val;

      this._animated = false;
    },
    get scaleY() {
      return this._scaleY;
    },
    set scaleY(val) {
      if (val === this._scaleY)
        return;

      this._invalidate();
      this._invalidateBounds();
      this._invalidateTransform();

      this._scaleY = val;

      var m = this._currentTransform;
      m.c = -this._rotationSin * val;
      m.d = this._rotationCos * val;

      this._animated = false;
    },
    get scaleZ() {
      return 1;
    },
    set scaleZ(val) {
      somewhatImplemented('DisplayObject.scaleZ');
    },
    get scale9Grid() {
      return this._scale9Grid;
    },
    set scale9Grid(val) {
      somewhatImplemented('DisplayObject.scale9Grid');
      this._scale9Grid = val;
      this._animated = false;
    },
    get scrollRect() {
      return this._scrollRect;
    },
    set scrollRect(val) {
      somewhatImplemented('DisplayObject.scrollRect');
      this._scrollRect = val;
    },
    get transform() {
      // TODO: Twips-ify
      return new flash.geom.Transform(this);
    },
    set transform(val) {
      this._invalidateBounds();

      var transform = this.transform;
      transform.colorTransform = val.colorTransform;
      if (val.matrix3D) {
        transform.matrix3D = val.matrix3D;
      } else {
        transform.matrix = val.matrix;
      }
    },
    get visible() {
      return this._visible;
    },
    set visible(val) {
      if (val === this._visible)
        return;

      this._invalidate();

      this._visible = val;
      this._animated = false;
    },
    get width() {
      var bounds = this._getContentBounds();
      var t = this._currentTransform;
      return (Math.abs(t.a) * (bounds.xMax - bounds.xMin) +
             Math.abs(t.c) * (bounds.yMax - bounds.yMin))|0;
    },
    set width(val) {
      if (val < 0) {
        return;
      }

      var u = Math.abs(this._rotationCos);
      var v = Math.abs(this._rotationSin);
      var bounds = this._getContentBounds();
      var baseWidth = u * (bounds.xMax - bounds.xMin) +
                      v * (bounds.yMax - bounds.yMin);
      if (!baseWidth) {
        return;
      }

      var baseHeight = v * (bounds.xMax - bounds.xMin) +
                       u * (bounds.yMax - bounds.yMin);
      this.scaleY = this.height / baseHeight;

      this.scaleX = val / baseWidth;
    },
    get x() {
      return this._currentTransform.tx;
    },
    set x(val) {
      if (val === this._currentTransform.tx) {
        return;
      }

      this._invalidate();
      this._invalidateBounds();
      this._invalidateTransform();

      this._currentTransform.tx = val;
      this._animated = false;
    },
    get y() {
      return this._currentTransform.ty;
    },
    set y(val) {
      if (val === this._currentTransform.ty) {
        return;
      }

      this._invalidate();
      this._invalidateBounds();
      this._invalidateTransform();

      this._currentTransform.ty = val;
      this._animated = false;
    },
    get z() {
      return 0;
    },
    set z(val) {
      somewhatImplemented('DisplayObject.z');
    },
    _getContentBounds: function () {
      var bounds = this._bounds;

      if (bounds.invalid) {
        var bbox = this._bbox;

        var xMin = Number.MAX_VALUE;
        var xMax = Number.MIN_VALUE;
        var yMin = Number.MAX_VALUE;
        var yMax = Number.MIN_VALUE;

        if (bbox) {
          xMin = bbox.xMin;
          xMax = bbox.xMax;
          yMin = bbox.yMin;
          yMax = bbox.yMax;
        } else {
          var children = this._children;
          var numChildren = children.length;
          for (var i = 0; i < numChildren; i++) {
            var child = children[i];

            var b = child.getBounds(this);

            var x1 = b.xMin;
            var y1 = b.yMin;
            var x2 = b.xMax;
            var y2 = b.yMax;

            xMin = Math.min(xMin, x1, x2);
            xMax = Math.max(xMax, x1, x2);
            yMin = Math.min(yMin, y1, y2);
            yMax = Math.max(yMax, y1, y2);
          }

          if (this._graphics) {
            var b = this._graphics._getBounds(true);
            if (b.xMin !== b.xMax && b.yMin !== b.yMax) {
              var x1 = b.xMin;
              var y1 = b.yMin;
              var x2 = b.xMax;
              var y2 = b.yMax;

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

        bounds.xMin = xMin;
        bounds.xMax = xMax;
        bounds.yMin = yMin;
        bounds.yMax = yMax;
        bounds.invalid = false;
      }

      return bounds;
    },
    _getRegion: function getRegion(targetCoordSpace) {
      var b = this._graphics ?
              this._graphics._getBounds(true) :
              this._getContentBounds();
      return this._getTransformedRect(b, targetCoordSpace);
    },

    getBounds: function (targetCoordSpace) {
      return this._getTransformedRect(this._getContentBounds(),
                                      targetCoordSpace);
    },
    _getTransformedRect: function (rect, targetCoordSpace) {
      if (!targetCoordSpace || targetCoordSpace === this) {
        return rect;
      }

      if (rect.xMax - rect.xMin === 0 || rect.yMax - rect.yMin === 0) {
        return { xMin: 0, yMin: 0, xMax: 0, yMax: 0 };
      }

      topLeft.x = rect.xMin;
      topLeft.y = rect.yMin;

      topRight.x = rect.xMax;
      topRight.y = rect.yMin;

      bottomRight.x = rect.xMax;
      bottomRight.y = rect.yMax;

      bottomLeft.x = rect.xMin;
      bottomLeft.y = rect.yMax;

      this._applyCurrentTransform(targetCoordSpace, topLeft,
                                                    topRight,
                                                    bottomRight,
                                                    bottomLeft);

      var xMin = Math.min(topLeft.x, topRight.x, bottomRight.x, bottomLeft.x);
      var xMax = Math.max(topLeft.x, topRight.x, bottomRight.x, bottomLeft.x);
      var yMin = Math.min(topLeft.y, topRight.y, bottomRight.y, bottomLeft.y);
      var yMax = Math.max(topLeft.y, topRight.y, bottomRight.y, bottomLeft.y);

      return { xMin: xMin, yMin: yMin, xMax: xMax, yMax: yMax };
    },
    hitTestObject: function (obj) {
      return this._hitTest(false, 0, 0, false, obj);
    },
    hitTestPoint: function (x, y, shapeFlag) {
      return this._hitTest(true, x, y, shapeFlag, null);
    },
    destroy: function () {
      if (this._destroyed) {
        return;
      }
      this._destroyed = true;
      this.cleanupBroadcastListeners();
    },
    cleanupBroadcastListeners: function() {
      var listenerLists = this._listeners;
      for (var type in listenerLists) {
        avm2.systemDomain.onMessage.unregister(type, this._onBroadcastMessage);
      }
    }
  };

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        root: desc(def, "root"),
        stage: desc(def, "stage"),
        name: desc(def, "name"),
        parent: desc(def, "parent"),
        mask: desc(def, "mask"),
        visible: desc(def, "visible"),
        x: {
          get: function x() {
            return this.x / 20;
          },
          set: function x(value) {
            this.x = (value * 20)|0;
          }
        },
        y: {
          get: function y() {
            return this.y / 20;
          },
          set: function y(value) {
            this.y = (value * 20)|0;
          }
        },
        z: {
          get: function z() {
            return this.z / 20;
          },
          set: function z(value) {
            this.z = (value * 20)|0;
          }
        },
        scaleX: desc(def, "scaleX"),
        scaleY: desc(def, "scaleY"),
        scaleZ: desc(def, "scaleZ"),
        mouseX: {
          get: function mouseX() {
            return this.mouseX / 20;
          },
          set: function mouseX(value) {
            this.mouseX = (value * 20)|0;
          }
        },
        mouseY: {
          get: function mouseY() {
            return this.mouseY / 20;
          },
          set: function mouseY(value) {
            this.mouseY = (value * 20)|0;
          }
        },
        rotation: desc(def, "rotation"),
        rotationX: desc(def, "rotationX"),
        rotationY: desc(def, "rotationY"),
        rotationZ: desc(def, "rotationZ"),
        alpha: desc(def, "alpha"),
        width: {
          get: function width() {
            return this.width / 20;
          },
          set: function width(value) {
            this.width = (value * 20)|0;
          }
        },
        height: {
          get: function height() {
            return this.height / 20;
          },
          set: function height(value) {
            this.height = (value * 20)|0;
          }
        },
        _hitTest: function(use_xy, x, y, useShape, hitTestObject) {
          x = (x * 20)|0;
          y = (y * 20)|0;
          return this._hitTest(use_xy, x, y, useShape, hitTestObject);
        },
        cacheAsBitmap: desc(def, "cacheAsBitmap"),
        opaqueBackground: desc(def, "opaqueBackground"),
        scrollRect: desc(def, "scrollRect"),
        filters: desc(def, "filters"),
        blendMode: desc(def, "blendMode"),
        transform: desc(def, "transform"),
        scale9Grid: desc(def, "scale9Grid"),
        loaderInfo: desc(def, "loaderInfo"),
        accessibilityProperties: desc(def, "accessibilityProperties"),
        globalToLocal: function(pt) {
          point.x = (pt.x * 20)|0;
          point.y = (pt.y * 20)|0;
          this._applyConcatenatedInverseTransform(point);
          return new flash.geom.Point(point.x / 20, point.y / 20);
        },
        localToGlobal: function(pt) {
          point.x = (pt.x * 20)|0;
          point.y = (pt.y * 20)|0;
          this._applyCurrentTransform(this._stage, point);
          return new flash.geom.Point(point.x / 20, point.y / 20);
        },
        getBounds: function(targetCoordSpace) {
          var bounds = this.getBounds(targetCoordSpace);
          return new flash.geom.Rectangle(
              bounds.xMin / 20,
              bounds.yMin / 20,
              (bounds.xMax - bounds.xMin) / 20,
              (bounds.yMax - bounds.yMin) / 20
          );
        },
        getRect: function(targetCoordSpace) {
          somewhatImplemented('DisplayObject.getRect');
          var bounds = this.getBounds(targetCoordSpace);
          return new flash.geom.Rectangle(
              bounds.xMin / 20,
              bounds.yMin / 20,
              (bounds.xMax - bounds.xMin) / 20,
              (bounds.yMax - bounds.yMin) / 20
          );
        },
      }
    }
  };

  return def;
}).call(this);
