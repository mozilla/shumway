var COLOR_CORRECTION_DEFAULT     = 'default';
var COLOR_CORRECTION_OFF         = 'on';
var COLOR_CORRECTION_ON          = 'off';

var COLOR_CORRECTION_DEFAULT_OFF = 'defaultOff';
var COLOR_CORRECTION_DEFAULT_ON  = 'defaultOn';
var COLOR_CORRECTION_UNSUPPORTED = 'unsuported';

var STAGE_ALIGN_BOTTOM           = 'B';
var STAGE_ALIGN_BOTTOM_LEFT      = 'BL';
var STAGE_ALIGN_BOTTOM_RIGHT     = 'BR';
var STAGE_ALIGN_LEFT             = 'L';
var STAGE_ALIGN_RIGHT            = 'R';
var STAGE_ALIGN_TOP              = 'T';
var STAGE_ALIGN_TOP_LEFT         = 'TL';
var STAGE_ALIGN_TOP_RIGHT        = 'TR';

var STAGE_SCALE_MODE_EXACT_FIT   = 'exactFit';
var STAGE_SCALE_MODE_NO_BORDER   = 'noBorder';
var STAGE_SCALE_MODE_NO_SCALE    = 'noScale';
var STAGE_SCALE_MODE_SHOW_ALL    = 'showAll';

var STAGE_QUALITY_BEST           = 'best';
var STAGE_QUALITY_HIGH           = 'high';
var STAGE_QUALITY_LOW            = 'low';
var STAGE_QUALITY_MEDIUM         = 'medium';

function Stage() {
  this._color = 0xFFFFFFFF;
  this._transform = { };
}

Stage.prototype = Object.create(new DisplayObjectContainer, {
  __class__: describeInternalProperty('flash.display.Stage'),

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
      return '';
    },
    function (val) {
      notImplemented();
    }
  ),
  allowsFullScreen: describeAccessor(function () {
    return false;
  }),
  alpha: describeAccessor(function () {
    return 1;
  }),
  blendMode: describeAccessor(
    function () {
      return BLEND_MODE_NORMAL;
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
      return COLOR_CORRECTION_DEFAULT;
    },
    function (val) {
      notImplemented();
    }
  ),
  colorCorrectionSupport: describeAccessor(function () {
    return COLOR_CORRECTION_UNSUPPORTED;
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
      return null;
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
      return null;
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
      this._frameRate = val;
    }
  ),
  fullScreenHeight: describeAccessor(function () {
    notImplemented();
  }),
  fullScreenSourceRect: describeAccessor(
    function () {
      return null;
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
    return null;
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
      return STAGE_QUALITY_HIGH;
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
      return STAGE_SCALE_MODE_NO_SCALE;
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
      return true;
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
      return false;
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
    return false;
  }),

  invalidate: describeMethod(function() {
    notImplemented();
  }),
  isFocusInaccessible: describeMethod(function() {
    notImplemented();
  })
});
