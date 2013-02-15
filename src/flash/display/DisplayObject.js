var DisplayObjectDefinition = (function () {
  var BLEND_MODE_ADD        = 'add';
  var BLEND_MODE_ALPHA      = 'alpha';
  var BLEND_MODE_DARKEN     = 'darken';
  var BLEND_MODE_DIFFERENCE = 'difference';
  var BLEND_MODE_ERASE      = 'erase';
  var BLEND_MODE_HARDLIGHT  = 'hardlight';
  var BLEND_MODE_INVERT     = 'invert';
  var BLEND_MODE_LAYER      = 'layer';
  var BLEND_MODE_LIGHTEN    = 'lighten';
  var BLEND_MODE_MULTIPLY   = 'multiply';
  var BLEND_MODE_NORMAL     = 'normal';
  var BLEND_MODE_OVERLAY    = 'overlay';
  var BLEND_MODE_SCREEN     = 'screen';
  var BLEND_MODE_SHADER     = 'shader';
  var BLEND_MODE_SUBTRACT   = 'subtract';

  var def = {
    __class__: 'flash.display.DisplayObject',

    initialize: function () {
      this._alpha = 1;
      this._animated = false;
      this._bbox = null;
      this._bitmap = null;
      this._bounds = null;
      this._cacheAsBitmap = false;
      this._children = [];
      this._control = document.createElement('div');
      this._clipDepth = null;
      this._currentTransform = null;
      this._cxform = null;
      this._depth = null;
      this._dirtyArea = null;
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
      this._revision = 0;
      this._root = null;
      this._rotation = 0;
      this._scaleX = 1;
      this._scaleY = 1;
      this._stage = null;
      this._transform = null;
      this._visible = true;
      this._wasCachedAsBitmap = false;
      this._x = 0;
      this._y = 0;

      var s = this.symbol;
      if (s) {
        this._animated = s.animated || false;
        this._bbox = s.bbox || null;
        this._children = s.children || [];
        this._clipDepth = s.clipDepth || null;
        this._cxform = s.cxform || null;
        this._depth = s.depth || null;
        this._loader = s.loader || null;
        this._name = s.name || null;
        this._owned = s.owned || false;
        this._parent = s.parent || null;
        this._root = s.root || null;
        this._stage = s.stage || null;

        var matrix = s.currentTransform;
        if (matrix) {
          var a = matrix.a;
          var b = matrix.b;
          var c = matrix.c;
          var d = matrix.d;

          this._rotation = Math.atan2(b, a) * 180 / Math.PI;
          var sx = Math.sqrt(a * a + b * b);
          this._scaleX = a > 0 ? sx : -sx;
          var sy = Math.sqrt(d * d + c * c);
          this._scaleY = d > 0 ? sy : -sy;
          var x = this._x = matrix.tx;
          var y = this._y = matrix.ty;

          this._currentTransform = matrix;
        }
      }

      this._updateCurrentTransform();
    },

    _applyCurrentInverseTransform: function (point, targetCoordSpace) {
      if (this._parent !== this._stage && this._parent !== targetCoordSpace)
        this._parent._applyCurrentInverseTransform(point);

      var m = this._currentTransform;
      var x = point.x - m.tx;
      var y = point.y - m.ty;
      var d = 1 / (m.a * m.d - m.b * m.c);
      point.x = (m.d * x - m.c * y) * d;
      point.y = (m.a * y - m.b * x) * d;
    },
    _applyCurrentTransform: function (point, targetCoordSpace) {
      var m = this._currentTransform;
      var x = point.x;
      var y = point.y;

      point.x = m.a * x + m.c * y + m.tx;
      point.y = m.d * y + m.b * x + m.ty;

      if (this._parent !== this._stage && this._parent !== targetCoordSpace)
        this._parent._applyCurrentTransform(point, targetCoordSpace);
    },
    _hitTest: function (use_xy, x, y, useShape, hitTestObject, ignoreChildren) {
      if (use_xy) {
        var pt = { x: x, y: y };
        this._applyCurrentInverseTransform(pt);

        if (useShape) {
          if (this._graphics) {
            var scale = this._graphics._scale;
            if (scale !== 1) {
              pt.x /= scale;
              pt.y /= scale;
            }

            var hitCtx = this._graphics._hitCtx;

            if (hitCtx.isPointInPath(pt.x, pt.y))
              return true;

            var subpaths = this._graphics._subpaths;
            for (var i = 0, n = subpaths.length; i < n; i++) {
              var pathTracker = subpaths[i];
              var path = pathTracker.target;

              if (!path.strokeStyle)
                continue;

              var drawingStyles = pathTracker.drawingStyles;
              if (hitCtx.mozIsPointInStroke) {
                hitCtx.strokeStyle = path.strokeStyle;
                for (var prop in drawingStyles)
                  hitCtx[prop] = drawingStyles[prop];

                if (hitCtx.mozIsPointInStroke(pt.x, pt.y))
                  return true;
              } else {
                var strokeHitCtx = path._strokeHitContext;
                if (!strokeHitCtx) {
                  var strokeHitCanvas = hitCtx.canvas.cloneNode();
                  strokeHitCtx = strokeHitCanvas.getContext('2d');
                  path._strokeHitContext = strokeHitCtx;
                  pathTracker.strokeToPath(strokeHitCtx, {
                    strokeWidth: drawingStyles.lineWidth,
                    startCap: drawingStyles.lineCap,
                    endCap: drawingStyles.lineCap,
                    join: drawingStyles.lineJoin,
                    miterLimit: drawingStyles.miterLimit
                  });
                }
                if (strokeHitCtx.isPointInPath(pt.x, pt.y))
                  return true;
              }
            }
          }

          if (!ignoreChildren) {
            var children = this._children;
            for (var i = 0, n = children.length; i < n; i++) {
              var child = children[i];
              if (child._hitTest(true, x, y, true))
                return true;
            }
          }

          return false;
        } else {
          var b = this.getBounds();
          return pt.x >= b.x && pt.x < b.x + b.width &&
                 pt.y >= b.y && pt.y < b.y + b.height;
        }
      }

      var b1 = this.getBounds();
      var b2 = hitTestObject.getBounds();
      var x = Math.max(b1.x, b2.x);
      var y = Math.max(b1.y, b2.y);
      var width = Math.min(b1.x + b1.width, b2.x + b2.width) - x;
      var height = Math.min(b1.y + b1.height, b2.y + b2.height) - y;
      return width > 0 && height > 0;
    },
    _markAsDirty: function() {
      if (!this._dirtyArea)
        this._dirtyArea = this.getBounds();
      this._bounds = null;
    },
    _updateCurrentTransform: function () {
      var scaleX = this._scaleX;
      var scaleY = this._scaleY;
      var rotation, u, v;
      // there is no need for cos/sin when the rotation is parallel to axes
      switch (this._rotation) {
      case 0:
      case 360:
        u = 1; v = 0;
        break;
      case 90:
      case -270:
        u = 0; v = 1;
        break;
      case 180:
      case -180:
        u = -1; v = 0;
        break;
      case 270:
      case -90:
        u = 0; v = -1;
        break;
      default:
        rotation = this._rotation / 180 * Math.PI;
        u = Math.cos(rotation);
        v = Math.sin(rotation);
        break;
      }

      this._currentTransform = {
        a: u * scaleX,
        b: v * scaleX,
        c: -v * scaleY,
        d: u * scaleY,
        tx: this._x,
        ty: this._y
      };
    },

    get accessibilityProperties() {
      return null;
    },
    set accessibilityProperties(val) {
      notImplemented();
    },
    get alpha() {
      return this._alpha;
    },
    set alpha(val) {
      this._alpha = val;
      this._slave = false;
    },
    get blendMode() {
      return BLEND_MODE_NORMAL;
    },
    set blendMode(val) {
      notImplemented();
    },
    get cacheAsBitmap() {
      return this._cacheAsBitmap;
    },
    set cacheAsBitmap(val) {
      this._cacheAsBitmap = this._filters.length ? true : val;
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
    },
    get height() {
      var bounds = this.getBounds();
      return bounds.height;
    },
    set height(val) {
      notImplemented();
    },
    get loaderInfo() {
      return (this._loader && this._loader._contentLoaderInfo) || this._parent.loaderInfo;
    },
    get mask() {
      return null;
    },
    set mask(val) {
      notImplemented();
    },
    get name() {
      return this._name;
    },
    set name(val) {
      this._name = val;
    },
    get mouseX() {
      return this._mouseX;
    },
    get mouseY() {
      return this._mouseY;
    },
    get opaqueBackground() {
      return this._opaqueBackground;
    },
    set opaqueBackground(val) {
      this._opaqueBackground = val;
    },
    get parent() {
      return this._parent;
    },
    get root() {
      return this._root || (this._parent ? this._parent.root : null);
    },
    get rotation() {
      return this._rotation;
    },
    set rotation(val) {
      this._slave = false;

      if (val === this._rotation)
        return;

      this._markAsDirty();

      this._rotation = val;

      this._updateCurrentTransform();
    },
    get stage() {
      return this._stage || (this._parent ? this._parent.stage : null);
    },
    get scaleX() {
      return this._scaleX;
    },
    set scaleX(val) {
      this._slave = false;

      if (val === this._scaleX)
        return;

      this._markAsDirty();

      this._scaleX = val;

      this._updateCurrentTransform();
    },
    get scaleY() {
      return this._scaleY;
    },
    set scaleY(val) {
      this._slave = false;

      if (val === this._scaleY)
        return;

      this._markAsDirty();

      this._scaleY = val;

      this._updateCurrentTransform();
    },
    get scale9Grid() {
      return null;
    },
    set scale9Grid(val) {
      notImplemented();
    },
    get scrollRect() {
      return null;
    },
    set scrollRect(val) {
      notImplemented();
    },
    get transform() {
      return this._transform || new flash.geom.Transform(this);
    },
    set transform(val) {
      this._currentTransform = val.matrix;
      this._slave = false;

      var transform = this._transform;
      transform.colorTransform = val.colorTransform;
      transform.matrix = val.matrix;

      this._markAsDirty();
    },
    get visible() {
      return this._visible;
    },
    set visible(val) {
      this._slave = false;

      if (val === this._visible)
        return;

      this._visible = val;

      this._markAsDirty();
    },
    get width() {
      var bounds = this.getBounds();
      return bounds.width;
    },
    set width(val) {
      notImplemented();
    },
    get x() {
      return this._x;
    },
    set x(val) {
      this._slave = false;

      if (val === this._x)
        return;

      this._markAsDirty();

      this._x = val;

      this._updateCurrentTransform();
    },
    get y() {
      return this._y;
    },
    set y(val) {
      this._slave = false;

      if (val === this._y)
        return;

      this._markAsDirty();

      this._y = val;

      this._updateCurrentTransform();
    },

    getBounds: function (targetCoordSpace) {
      if (!this._bounds) {
        var bbox = this._bbox;

        var xMin = Number.MAX_VALUE;
        var xMax = Number.MIN_VALUE;
        var yMin = Number.MAX_VALUE;
        var yMax = Number.MIN_VALUE;

        if (!bbox) {
          var children = this._children;
          var numChildren = children.length;
          var b;
          for (var i = 0; i < numChildren; i++) {
            var child = children[i];

            if (!child._visible)
              continue;

            var b = child.getBounds(this);

            var x1 = b.x;
            var y1 = b.y;
            var x2 = b.x + b.width;
            var y2 = b.y + b.height;

            xMin = Math.min(xMin, x1, x2);
            xMax = Math.max(xMax, x1, x2);
            yMin = Math.min(yMin, y1, y2);
            yMax = Math.max(yMax, y1, y2);
          }
        } else {
          xMin = bbox.left;
          xMax = bbox.right;
          yMin = bbox.top;
          yMax = bbox.bottom;
        }

        if (this._graphics) {
          var b = this._graphics._getBounds(true);
          if (b) {
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

        if (xMin === Number.MAX_VALUE)
          xMin = xMax = yMin = yMax = 0;

        this._bounds = {
          xMin: xMin,
          xMax: xMax,
          yMin: yMin,
          yMax: yMax
        };
      }

      var b = this._bounds;
      var p1 = { x: b.xMin, y: b.yMin };
      this._applyCurrentTransform(p1, targetCoordSpace);
      var p2 = { x: b.xMax, y: b.yMin };
      this._applyCurrentTransform(p2, targetCoordSpace);
      var p3 = { x: b.xMax, y: b.yMax };
      this._applyCurrentTransform(p3, targetCoordSpace);
      var p4 = { x: b.xMin, y: b.yMax };
      this._applyCurrentTransform(p4, targetCoordSpace);

      xMin = Math.min(p1.x, p2.x, p3.x, p4.x);
      xMax = Math.max(p1.x, p2.x, p3.x, p4.x);
      yMin = Math.min(p1.y, p2.y, p3.y, p4.y);
      yMax = Math.max(p1.y, p2.y, p3.y, p4.y);

      return new flash.geom.Rectangle(
        xMin,
        yMin,
        (xMax - xMin),
        (yMax - yMin)
      );
    },
    getRect: function (targetCoordSpace) {
      notImplemented();
    },
    globalToLocal: function (pt) {
      var result = new flash.geom.Point(pt.x, pt.y);
      this._applyCurrentInverseTransform(result);
      return result;
    },
    hitTestObject: function (obj) {
      return this._hitTest(false, 0, 0, false, obj);
    },
    hitTestPoint: function (x, y, shapeFlag) {
      return this._hitTest(true, x, y, shapeFlag, null);
    },
    localToGlobal: function (pt) {
      var result = new flash.geom.Point(pt.x, pt.y);
      this._applyCurrentTransform(result);
      return result;
    }
  };

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        root: desc(def, "root"),
        stage: desc(def, "stage"),
        name: desc(def, "name"),
        mask: desc(def, "mask"),
        visible: desc(def, "visible"),
        x: desc(def, "x"),
        y: desc(def, "y"),
        z: desc(def, "z"),
        scaleX: desc(def, "scaleX"),
        scaleY: desc(def, "scaleY"),
        scaleZ: desc(def, "scaleZ"),
        mouseX: desc(def, "mouseX"),
        mouseY: desc(def, "mouseY"),
        rotation: desc(def, "rotation"),
        rotationX: desc(def, "rotationX"),
        rotationY: desc(def, "rotationY"),
        rotationZ: desc(def, "rotationZ"),
        alpha: desc(def, "alpha"),
        width: desc(def, "width"),
        height: desc(def, "height"),
        _hitTest: def._hitTest,
        cacheAsBitmap: desc(def, "cacheAsBitmap"),
        opaqueBackground: desc(def, "opaqueBackground"),
        scrollRect: desc(def, "scrollRect"),
        filters: desc(def, "filters"),
        blendMode: desc(def, "blendMode"),
        transform: desc(def, "transform"),
        scale9Grid: desc(def, "scale9Grid"),
        loaderInfo: desc(def, "loaderInfo"),
        accessibilityProperties: desc(def, "accessibilityProperties"),
        globalToLocal: def.globalToLocal,
        localToGlobal: def.localToGlobal,
        getBounds: def.getBounds,
        getRect: def.getRect
      }
    }
  };

  return def;
}).call(this);
