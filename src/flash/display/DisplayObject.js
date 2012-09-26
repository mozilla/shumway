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

function DisplayObject() {
  EventDispatcher.call(this);

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
}

DisplayObject.prototype = Object.create(EventDispatcher.prototype, {
  accessibilityProperties: describeAccessor(
    function () {
      return null;
    },
    function (val) {
      notImplemented();
    }
  ),
  alpha: describeAccessor(
    function () {
      return this._alpha;
    },
    function (val) {
      this._alpha = val;
      this._slave = false;
    }
  ),
  blendMode: describeAccessor(
    function () {
      return BLEND_MODE_NORMAL;
    },
    function (val) {
      notImplemented();
    }
  ),
  cacheAsBitmap: describeAccessor(
    function () {
      return this._cacheAsBitmap;
    },
    function (val) {
      this._cacheAsBitmap = val;
    }
  ),
  filters: describeAccessor(
    function () {
      return [];
    },
    function (val) {
      notImplemented();
    }
  ),
  getBounds: describeMethod(function (targetCoordSpace) {
    return this._bounds;
  }),
  getRect: describeMethod(function (targetCoordSpace) {
    notImplemented();
  }),
  globalToLocal: describeMethod(function (pt) {
    notImplemented();
  }),
  height: describeAccessor(
    function () {
      var bounds = this.getBounds();
      return bounds.height;
    },
    function () {
      notImplemented();
    }
  ),
  hitTestObject: describeMethod(function (obj) {
    notImplemented();
  }),
  hitTestPoint: describeMethod(function (x, y, shapeFlag) {
    notImplemented();
  }),
  loaderInfo: describeAccessor(function () {
    return this._loaderInfo || this._parent.loaderInfo;
  }),
  localToGlobal: describeMethod(function (pt) {
    notImplemented();
  }),
  mask: describeAccessor(
    function () {
      return null;
    },
    function (val) {
      notImplemented();
    }
  ),
  name: describeAccessor(
    function () {
      return this._name;
    },
    function (val) {
      this._name = val;
    }
  ),
  mouseX: describeAccessor(
    function () {
      return this._mouseX;
    }
  ),
  mouseY: describeAccessor(
    function () {
      return this._mouseY;
    }
  ),
  opaqueBackground: describeAccessor(
    function () {
      return this._opaqueBackground;
    },
    function (val) {
      this._opaqueBackground = val;
    }
  ),
  parent: describeAccessor(function () {
    return this._parent;
  }),
  root: describeAccessor(function () {
    return this._root;
  }),
  rotation: describeAccessor(
    function () {
      return this._rotation;
    },
    function (val) {
      this._rotation = val;
      this._slave = false;
    }
  ),
  stage: describeAccessor(function () {
    return this._stage || this._parent.stage;
  }),
  scaleX: describeAccessor(
    function () {
      return this._scaleX;
    },
    function (val) {
      this._scaleX = val;
      this._slave = false;
    }
  ),
  scaleY: describeAccessor(
    function () {
      return this._scaleY;
    },
    function (val) {
      this._scaleY = val;
      this._slave = false;
    }
  ),
  scale9Grid: describeAccessor(
    function () {
      return null;
    },
    function (val) {
      notImplemented();
    }
  ),
  scrollRect: describeAccessor(
    function () {
      return null;
    },
    function (val) {
      notImplemented();
    }
  ),
  transform: describeAccessor(
    function () {
      return this._transform || new Transform(this);
    },
    function (val) {
      var transform = this._transform;
      transform.colorTransform = val.colorTransform;
      transform.matrix = val.matrix;
      this._slave = false;
    }
  ),
  visible: describeAccessor(
    function () {
      return this._visible;
    },
    function (val) {
      this._visible = val;
      this._slave = false;
    }
  ),
  width: describeAccessor(
    function () {
      var bounds = this.getBounds();
      return bounds.width;
    },
    function () {
      notImplemented();
    }
  ),
  x: describeAccessor(
    function () {
      return this._x;
    },
    function (val) {
      this._x = val;
      this._slave = false;
    }
  ),
  y: describeAccessor(
    function () {
      return this._y;
    },
    function (val) {
      this._y = val;
      this._slave = false;
    }
  )
});
