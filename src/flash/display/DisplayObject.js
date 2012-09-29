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
      this._bounds = { };
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
      return this._bounds;
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
    loaderInfo: function () {
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
      return this._root;
    },
    get rotation() {
      return this._rotation;
    },
    set rotation(val) {
      this._rotation = val;
      this._slave = false;
    },
    get stage() {
      return this._stage || this._parent.stage;
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
    set width() {
      notImplemented();
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

  return def;
}).call(this);
