function Stage() {
  this._transform = [];
  this._color = 0xFFFFFFFF;
}

Stage.prototype = Object.create(new DisplayObjectContainer, {
  accessibilityProperties: descAccessor(function () {
    return null; // read-only/default
  }),
  align: descAccessor(
    function () {
      return ''; // TODO
    },
    function (val) {
      notImplemented();
    }
  ),
  allowsFullScreen: descAccessor(function () {
    return false; // TODO
  }),
  alpha: descAccessor(function () {
    return 1; // read-only/default
  }),
  blendMode: descAccessor(function () {
    // TODO BlendMode.NORMAL
    return 'normal'; // read-only/default
  }),
  cacheAsBitmap: descAccessor(function () {
    return false; // read-only/default
  }),
  color: descAccessor(
    function () {
      return this._color;
    },
    function (val) {
      this._color = val;
    }
  ),
  colorCorrection: descAccessor(
    function () {
      return 'default'; // TODO
    },
    function (val) {
      notImplemented();
    }
  ),
  colorCorrectionSupport: descAccessor(function () {
    return 'unsupported'; // TODO
  }),
  contextMenu: descAccessor(function () {
    return null; // read-only/default
  }),
  displayState: descAccessor(
    function () {
      return null; // TODO
    },
    function (val) {
      notImplemented();
    }
  ),
  filters: descAccessor(function () {
    return []; // read-only/default
  }),
  focus: descAccessor(
    function () {
      return null; // TODO
    },
    function (val) {
      notImplemented();
    }
  ),
  focusRect: descAccessor(function () {
    return null; // read-only/default
  }),
  frameRate: descAccessor(
    function () {
      return this._frameRate;
    },
    function (val) {
      if (val < 0.01 || val > 1000)
        throw 'Invalid frame rate';
      this._frameRate = val;
    }
  ),
  fullScreenHeight: descAccessor(function () {
    notImplemented();
  }),
  fullScreenSourceRect: descAccessor(
    function () {
      return null; // TODO
    },
    function (val) {
      notImplemented();
    }
  ),
  fullScreenWidth: descAccessor(function () {
    notImplemented();
  }),
  loaderInfo: descAccessor(function () {
    return this._loaderInfo; // read-only/default
  }),
  mask: descAccessor(function () {
    return null; // read-only/default
  }),
  mouseEnabled: descAccessor(function () {
    return true; // read-only/default
  }),
  name: descAccessor(function () {
    return null; // read-only/default
  }),
  nativeWindow: descAccessor(function () {
    return null; // TODO
  }),
  opaqueBackground: descAccessor(function () {
    return null; // read-only/default
  }),
  quality: descAccessor(
    function () {
      return 'HIGH'; // TODO
    },
    function (val) {
      notImplemented();
    }
  ),
  rotation: descAccessor(function () {
    return 0; // read-only/default
  }),
  scale9Grid: descAccessor(function () {
    return null; // read-only/default
  }),
  scaleMode: descAccessor(
    function () {
      return 'noScale'; // TODO
    },
    function (val) {
      notImplemented();
    }
  ),
  scaleX: descAccessor(function () {
    return 1; // read-only/default
  }),
  scaleY: descAccessor(function () {
    return 1; // read-only/default
  }),
  scrollRect: descAccessor(function () {
    return null; // read-only/default
  }),
  showDefaultContextMenu: descAccessor(
    function () {
      return true; // TODO
    },
    function (val) {
      notImplemented();
    }
  ),
  softKeyboardRect: descAccessor(function () {
    notImplemented();
  }),
  stageFocusRect: descAccessor(
    function () {
      return false; // TODO
    },
    function (val) {
      notImplemented();
    }
  ),
  stageHeight: descAccessor(
    function () {
      return this._stageHeight;
    },
    function (val) {
      notImplemented();
    }
  ),
  stageWidth: descAccessor(
    function () {
      return this._stageWidth;
    },
    function (val) {
      notImplemented();
    }
  ),
  tabEnabled: descAccessor(function () {
    return false; // read-only/default
  }),
  tabIndex: descAccessor(function () {
    return 1; // read-only/default
  }),
  transform: descAccessor(function () {
    return this._transform; // read-only/default
  }),
  visible: descAccessor(function () {
    return true; // read-only/default
  }),
  x: descAccessor(function () {
    return 0; // read-only/default
  }),
  y: descAccessor(function () {
    return 0; // read-only/default
  }),
  wmodeGPU: descAccessor(function () {
    return false; // TODO
  }),

  invalidate: descMethod(function() {
    notImplemented();
  }),
  isFocusInaccessible: descMethod(function() {
    notImplemented();
  }),
  _attachToCanvas: descMethod(function(parameters) {
    var canvas = parameters.canvas;
    var ctx = canvas.getContext('2d');
    var plays;
    var loader = new Loader();
    var stage = this;
    loader._onStart = function(root, loaderInfo, as2Context) {
      stage._loaderInfo = loaderInfo;
      stage._stageWidth = loaderInfo.width;
      stage._stageHeight = loaderInfo.height;
      stage._frameRate = loaderInfo.frameRate;

      as2Context.stage = stage; // TODO make it better
      parameters.onstart(root, stage);
    };
    loader._onProgress = function(root, obj) {
      if (obj.bgcolor) {
        stage._color = obj.bgcolor; // TODO convert to numeric
        canvas.style.background = obj.bgcolor;
      }
      if (!plays) {
        renderMovieClip(root, stage, ctx);
        plays = true;
      }
    };
    loader._onComplete = function(root, result) {
      parameters.oncomplete(root, result);
    };
    loader.load(parameters.file);
  })
});
