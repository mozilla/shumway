const DisplayObjectDefinition = (function () {
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
      this._cacheAsBitmap = false;
      this._control = document.createElement('div');
      this._bbox = null;
      this._cxform = null;
      this._graphics = null;
      this._loaderInfo = null;
      this._mouseX = 0;
      this._mouseY = 0;
      this._name = null;
      this._opaqueBackground = null;
      this._owned = false;
      this._parent = null;
      this._root = null;
      this._rotation = 0;
      this._scaleX = 1;
      this._scaleY = 1;
      this._stage = null;
      this._transform = null;
      this._visible = true;
      this._x = 0;
      this._y = 0;
      this._updateTransformMatrix();

      var s = this.symbol;
      if (s) {
        this._bbox = s.bbox || null;
      }
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
      this._cacheAsBitmap = val;
    },
    get filters() {
      return [];
    },
    set filters(val) {
      notImplemented();
    },
    getBounds: function (targetCoordSpace) {
      var bbox = this._bbox;

      if (!bbox)
        return new flash.geom.Rectangle;

    var m = this._currentTransformMatrix;

    var x1 = m.a * bbox.left + m.c * bbox.top;
    var y1 = m.d * bbox.top + m.b * bbox.left;
    var x2 = m.a * bbox.right + m.c * bbox.top;
    var y2 = m.d * bbox.top + m.b * bbox.right;
    var x3 = m.a * bbox.right + m.c * bbox.bottom;
    var y3 = m.d * bbox.bottom + m.b * bbox.right;
    var x4 = m.a * bbox.left + m.c * bbox.bottom;
    var y4 = m.d * bbox.bottom + m.b * bbox.left;

      var xMin = Math.min(x1, x2, x3, x4);
      var xMax = Math.max(x1, x2, x3, x4);
      var yMin = Math.min(y1, y2, y3, y4);
      var yMax = Math.max(y1, y2, y3, y4);

      return new flash.geom.Rectangle(
        xMin + m.tx,
        yMin + m.ty,
        (xMax - xMin),
        (yMax - yMin)
      );
    },
    _updateTransformMatrix: function () {
      var rotation = this._rotation / 180 * Math.PI;
      var scaleX = this._scaleX;
      var scaleY = this._scaleY;
      var u = Math.cos(rotation);
      var v = Math.sin(rotation);

      this._currentTransformMatrix = {
        a: u * scaleX,
        b: v * scaleX,
        c: -v * scaleY,
        d: u * scaleY,
        tx: this._x,
        ty: this._y
      };
    },
  _applyCurrentTransform: function (point) {
    var m = this._currentTransformMatrix;
    var x = point.x;
    var y = point.y;

    point.x = m.a * x + m.c * y + m.tx;
    point.y = m.d * y + m.b * x + m.ty;

    if (this._parent !== this._stage) {
      this._parent._applyCurrentTransform(point);
    }
  },
  _applyCurrentInverseTransform: function (point) {
    if (this._parent !== this._stage) {
      this._parent._applyCurrentInverseTransform(point);
    }

    var m = this._currentTransformMatrix;

    var x = point.x - m.tx;
    var y = point.y - m.ty;
    var d = 1 / (m.a * m.d - m.b * m.c);

    point.x = (m.d * x - m.c * y) * d;
    point.y = (m.a * y - m.b * x) * d;
  },
    getRect: function (targetCoordSpace) {
      notImplemented();
    },
    globalToLocal: function (pt) {
      var result = new flash.geom.Point(pt.x, pt.y);
      this._applyCurrentInverseTransform(result);
      return result;
    },
    get height() {
      var bounds = this.getBounds();
      return bounds.height;
    },
    set height(val) {
      notImplemented();
    },
    hitTestObject: function (obj) {
      notImplemented();
    },
    hitTestPoint: function (x, y, shapeFlag) {
      notImplemented();
    },
    _hitTest: function _hitTest(use_xy, x, y, useShape, hitTestObject) {
      return false; //notImplemented();
    },
    get loaderInfo() {
      return this._loaderInfo || (this._parent ? this._parent.loaderInfo : null);
    },
    localToGlobal: function (pt) {
      var result = new flash.geom.Point(pt.x, pt.y);
      this._applyCurrentTransform(result);
      return result;
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
      return this._root || (this._parent ? this._parent._root : null);
    },
    get rotation() {
      return this._rotation;
    },
    set rotation(val) {
      this._rotation = val;
      this._updateTransformMatrix();
      this._slave = false;
    },
    get stage() {
      return this._stage || (this._parent ? this._parent.stage : null);
    },
    get scaleX() {
      return this._scaleX;
    },
    set scaleX(val) {
      this._scaleX = val;
      this._updateTransformMatrix();
      this._slave = false;
    },
    get scaleY() {
      return this._scaleY;
    },
    set scaleY(val) {
      this._scaleY = val;
      this._updateTransformMatrix();
      this._slave = false;
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
      var transform = this._transform;
      transform.colorTransform = val.colorTransform;
      transform.matrix = val.matrix;
      this._currentTransformMatrix = val.matrix;
      this._slave = false;
    },
    get visible() {
      return this._visible;
    },
    set visible(val) {
      this._visible = val;
      this._slave = false;
    },
    get width() {
      var bounds = this.getBounds();
      return bounds.width;
    },
    set width(val) {
      //notImplemented();
    },
    get x() {
      return this._x;
    },
    set x(val) {
      this._x = val;
      this._updateTransformMatrix();
      this._slave = false;
    },
    get y() {
      return this._y;
    },
    set y(val) {
      this._y = val;
      this._updateTransformMatrix();
      this._slave = false;
    }
  };

  const desc = Object.getOwnPropertyDescriptor;

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
