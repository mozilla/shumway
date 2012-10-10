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
        return new Rectangle;

      var rotation = this._rotation;
      var scaleX = this._scaleX;
      var scaleY = this._scaleY;

      var u = Math.cos(rotation / 180 * Math.PI);
      var v = Math.sin(rotation / 180 * Math.PI);
      var a = u * scaleX;
      var b = -v * scaleY;
      var c = v * scaleX;
      var d = u * scaleY;
      var tx = this._x;
      var ty = this._y;

      var x1 = a * bbox.left + c * bbox.top;
      var y1 = d * bbox.top + b * bbox.left;
      var x2 = a * bbox.right + c * bbox.top;
      var y2 = d * bbox.top + b * bbox.right;
      var x3 = a * bbox.right + c * bbox.bottom;
      var y3 = d * bbox.bottom + b * bbox.right;
      var x4 = a * bbox.left + c * bbox.bottom;
      var y4 = d * bbox.bottom + b * bbox.left;

      var xMin = Math.min(x1, x2, x3, x4);
      var xMax = Math.max(x1, x2, x3, x4);
      var yMin = Math.min(y1, y2, y3, y4);
      var yMax = Math.max(y1, y2, y3, y4);

      return new Rectangle(
        xMin + tx,
        yMin + ty,
        (xMax - xMin),
        (yMax - yMin)
      );
    },
    getRect: function (targetCoordSpace) {
      notImplemented();
    },
    globalToLocal: function (pt) {
      notImplemented();
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
    get loaderInfo() {
      return this._loaderInfo || this._parent.loaderInfo;
    },
    localToGlobal: function (pt) {
      notImplemented();
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
      this._slave = false;
    },
    get scaleY() {
      return this._scaleY;
    },
    set scaleY(val) {
      this._scaleY = val;
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
      return this._transform || new Transform(this);
    },
    set transform(val) {
      var transform = this._transform;
      transform.colorTransform = val.colorTransform;
      transform.matrix = val.matrix;
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
      this._slave = false;
    },
    get y() {
      return this._y;
    },
    set y(val) {
      this._y = val;
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
