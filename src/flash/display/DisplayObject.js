function DisplayObject() {
  this._alpha = 1;
  this._cacheAsBitmap = false;
  this._control = document.createElement('div');
  this._mouseX = 0;
  this._mouseY = 0;
  this._name = null;
  this._opaqueBackground = null;
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

DisplayObject.prototype = Object.create(new EventDispatcher, {
  accessibilityProperties: descAccessor(
    function () {
      return null;
    },
    function (val) {
      notImplemented();
    }
  ),
  alpha: descAccessor(
    function () {
      return this._alpha;
    },
    function (val) {
      this._alpha = val;
    }
  ),
  blendMode: descAccessor(
    function () {
      return 'normal';
    },
    function (val) {
      notImplemented();
    }
  ),
  cacheAsBitmap: descAccessor(
    function () {
      return this._cacheAsBitmap;
    },
    function (val) {
      this._cacheAsBitmap = val;
    }
  ),
  filters: descAccessor(
    function () {
      return [];
    },
    function (val) {
      notImplemented();
    }
  ),
  getBounds: descMethod(function (targetCoordSpace) {
    notImplemented();
  }),
  getRect: descMethod(function (targetCoordSpace) {
    notImplemented();
  }),
  globalToLocal: descMethod(function (pt) {
    notImplemented();
  }),
  height: descAccessor(function () {
    notImplemented();
  }),
  hitTestObject: descMethod(function (obj) {
    notImplemented();
  }),
  hitTestPoint: descMethod(function (x, y, shapeFlag) {
    notImplemented();
  }),
  loaderInfo: descAccessor(function () {
    notImplemented();
  }),
  localToGlobal: descMethod(function (pt) {
    notImplemented();
  }),
  mask: descAccessor(
    function () {
      return null;
    },
    function (val) {
      notImplemented();
    }
  ),
  name: descAccessor(
    function () {
      return this._name;
    },
    function (val) {
      this._name = val;
    }
  ),
  mouseX: descAccessor(
    function () {
      return this._mouseX;
    }
  ),
  mouseY: descAccessor(
    function () {
      return this._mouseY;
    }
  ),
  opaqueBackground: descAccessor(
    function () {
      return this._opaqueBackground;
    },
    function (val) {
      this._opaqueBackground = val;
    }
  ),
  parent: descAccessor(function () {
    return this._parent;
  }),
  root: descAccessor(function () {
    return this._return;
  }),
  rotation: descAccessor(
    function () {
      return this._rotation;
    },
    function (val) {
      this._rotation = val;
    }
  ),
  stage: descAccessor(function () {
    return this._stage;
  }),
  scaleX: descAccessor(
    function () {
      return this._scaleX;
    },
    function (val) {
      this._scaleX = val;
    }
  ),
  scaleY: descAccessor(
    function () {
      return this._scaleY;
    },
    function (val) {
      this._scaleY = val;
    }
  ),
  scale9Grid: descAccessor(
    function () {
      return null;
    },
    function (val) {
      notImplemented();
    }
  ),
  scrollRect: descAccessor(
    function () {
      return null;
    },
    function (val) {
      notImplemented();
    }
  ),
  transform: descAccessor(
    function () {
      return this._transform;
    },
    function (val) {
      this._transform = val;
    }
  ),
  visible: descAccessor(
    function () {
      return this._visible;
    },
    function (val) {
      this._visible = val;
    }
  ),
  width: descAccessor(function () {
    notImplemented();
  }),
  x: descAccessor(
    function () {
      return this._x;
    },
    function (val) {
      this._x = val;
    }
  ),
  y: descAccessor(
    function () {
      return this._y;
    },
    function (val) {
      this._y = val;
    }
  )
});
