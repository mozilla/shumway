function Stage() {
  this._color = 0xFFFFFFFF;
  this._transform = { };
}

Stage.prototype = Object.create(new DisplayObjectContainer, {
  __class__: describeProperty('flash.display.Stage'),

  accessibilityImplementation: describeAccessor(
    function () {
      return null;
    }, function (val) {
      illegalOperation();
    }
  ),
  accessibilityProperties: describeAccessor(
    function () {
      return null;
    }, function (val) {
      illegalOperation();
    }
  ),
  alpha: describeAccessor(
    function () {
      return 1;
    }, function (val) {
      illegalOperation();
    }
  ),
  align: describeAccessor(
    function () {
      return ''; // TODO
    },
    function (val) {
      notImplemented();
    }
  ),
  allowsFullScreen: describeAccessor(function () {
    return false; // TODO
  }),
  alpha: describeAccessor(function () {
    return 1; // read-only/default
  }),
  blendMode: describeAccessor(
    function () {
      // TODO BlendMode.NORMAL
      return 'normal';
    }, function (val) {
      illegalOperation();
    }
  ),
  cacheAsBitmap: describeAccessor(
    function () {
      return false;
    }, function (val) {
      illegalOperation();
    }
  ),
  color: describeAccessor(
    function () {
      return this._color;
    },
    function (val) {
      this._color = val;
    }
  ),
  colorCorrection: describeAccessor(
    function () {
      return 'default'; // TODO
    },
    function (val) {
      notImplemented();
    }
  ),
  colorCorrectionSupport: describeAccessor(function () {
    return 'unsupported'; // TODO
  }),
  contextMenu: describeAccessor(
    function () {
      return null;
    }, function (val) {
      illegalOperation();
    }
  ),
  displayState: describeAccessor(
    function () {
      return null; // TODO
    },
    function (val) {
      notImplemented();
    }
  ),
  filters: describeAccessor(
    function () {
      return [];
    }, function (val) {
      illegalOperation();
    }
  ),
  focus: describeAccessor(
    function () {
      return null; // TODO
    },
    function (val) {
      notImplemented();
    }
  ),
  focusRect: describeAccessor(
    function () {
      return null;
    }, function (val) {
      illegalOperation();
    }
  ),
  frameRate: describeAccessor(
    function () {
      return this._frameRate;
    },
    function (val) {
      if (val < 0.01 || val > 1000)
        throw 'Invalid frame rate';
      this._frameRate = val;
    }
  ),
  fullScreenHeight: describeAccessor(function () {
    notImplemented();
  }),
  fullScreenSourceRect: describeAccessor(
    function () {
      return null; // TODO
    },
    function (val) {
      notImplemented();
    }
  ),
  fullScreenWidth: describeAccessor(function () {
    notImplemented();
  }),
  loaderInfo: describeAccessor(
    function () {
      return this._loaderInfo;
    }, function (val) {
      illegalOperation();
    }
  ),
  mask: describeAccessor(
    function () {
      return null;
    }, function (val) {
      illegalOperation();
    }
  ),
  mouseEnabled: describeAccessor(
    function () {
      return true;
    }, function (val) {
      illegalOperation();
    }
  ),
  name: describeAccessor(
    function () {
      return null;
    }, function (val) {
      illegalOperation();
    }
  ),
  nativeWindow: describeAccessor(function () {
    return null; // TODO
  }),
  opaqueBackground: describeAccessor(
    function () {
      return null;
    }, function (val) {
      illegalOperation();
    }
  ),
  quality: describeAccessor(
    function () {
      return 'HIGH'; // TODO
    },
    function (val) {
      notImplemented();
    }
  ),
  rotation: describeAccessor(
    function () {
      return 0;
    }, function (val) {
      illegalOperation();
    }
  ),
  scale9Grid: describeAccessor(
    function () {
      return null;
    }, function (val) {
      illegalOperation();
    }
  ),
  scaleMode: describeAccessor(
    function () {
      return 'noScale'; // TODO
    },
    function (val) {
      notImplemented();
    }
  ),
  scaleX: describeAccessor(
    function () {
      return 1;
    }, function (val) {
      illegalOperation();
    }
  ),
  scaleY: describeAccessor(
    function () {
      return 1;
    }, function (val) {
      illegalOperation();
    }
  ),
  scrollRect: describeAccessor(
    function () {
      return null;
    }, function (val) {
      illegalOperation();
    }
  ),
  showDefaultContextMenu: describeAccessor(
    function () {
      return true; // TODO
    },
    function (val) {
      notImplemented();
    }
  ),
  softKeyboardRect: describeAccessor(function () {
    notImplemented();
  }),
  stageFocusRect: describeAccessor(
    function () {
      return false; // TODO
    },
    function (val) {
      notImplemented();
    }
  ),
  stageHeight: describeAccessor(
    function () {
      return this._stageHeight;
    },
    function (val) {
      notImplemented();
    }
  ),
  stageWidth: describeAccessor(
    function () {
      return this._stageWidth;
    },
    function (val) {
      notImplemented();
    }
  ),
  stageVideos: describeAccessor(function () {
    notImplemented();
  }),
  tabEnabled: describeAccessor(
    function () {
      return false;
    }, function (val) {
      illegalOperation();
    }
  ),
  tabIndex: describeAccessor(
    function () {
      return -1;
    }, function (val) {
      illegalOperation();
    }
  ),
  transform: describeAccessor(
    function () {
      return this._transform;
    }, function (val) {
      illegalOperation();
    }
  ),
  visible: describeAccessor(
    function () {
      return true;
    }, function (val) {
      illegalOperation();
    }
  ),
  x: describeAccessor(
    function () {
      return 0;
    }, function (val) {
      illegalOperation();
    }
  ),
  y: describeAccessor(
    function () {
      return 0;
    }, function (val) {
      illegalOperation();
    }
  ),
  wmodeGPU: describeAccessor(function () {
    return false; // TODO
  }),

  invalidate: describeMethod(function() {
    notImplemented();
  }),
  isFocusInaccessible: describeMethod(function() {
    notImplemented();
  })
});
