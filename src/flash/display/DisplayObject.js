function DisplayObject() {
  this._root = null;
  this._stage = null;
  this._name = '';
  this._parent = null;
  this._visible = true;
  this._x = 0;
  this._y = 0;
  this._scaleX = 1;
  this._scaleY = 1;
  this._mouseX = 0;
  this._mouseY = 0;
  this._rotation = 0;
  this._alpha = 1;
  this._cacheAsBitmap = false;
  this._opaqueBackground = null;
  this._transform = null;
}

DisplayObject.prototype = Object.create(new EventDispatcher, {
  root: descAccessor(function () {
    return this._return;
  }),
  stage: descAccessor(function () {
    return this._stage;
  }),
  name: descAccessor(
    function () {
      return this._name;
    },
    function (val) {
      this._name = val;
    }
  ),
  parent: descAccessor(function () {
    return this._parent;
  }),
  mask: descAccessor(
    function () {
      return null;
    },
    function (val) {
      notImplemented();
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
  ),
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
  rotation: descAccessor(
    function () {
      return this._rotation;
    },
    function (val) {
      this._rotation = val;
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
  cacheAsBitmap: descAccessor(
    function () {
      return this._cacheAsBitmap;
    },
    function (val) {
      this._cacheAsBitmap = val;
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
  scrollRect: descAccessor(
    function () {
      return null;
    },
    function (val) {
      notImplemented();
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
  blendMode: descAccessor(
    function () {
      return 'normal';
    },
    function (val) {
      notImplemented();
    }
  ),
  width: descAccessor(function () {
    notImplemented();
  }),
  height: descAccessor(function () {
    notImplemented();
  }),
  transform: descAccessor(
    function () {
      return this._transform;
    },
    function (val) {
      this._transform = val;
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
  accessibilityProperties: descAccessor(
    function () {
      return null;
    },
    function (val) {
      notImplemented();
    }
  ),

  globalToLocal: descMethod(function (pt) {
    notImplemented();
  }),
  localToGlobal: descMethod(function (pt) {
    notImplemented();
  }),
  getBounds: descMethod(function (targetCoordSpace) {
    notImplemented();
  }),
  getRect: descMethod(function (targetCoordSpace) {
    notImplemented();
  }),
  loaderInfo: descAccessor(function () {
    notImplemented();
  }),
  hitTestObject: descMethod(function (obj) {
    notImplemented();
  }),
  hitTestPoint: descMethod(function (x, y, shapeFlag) {
    notImplemented();
  })
});
