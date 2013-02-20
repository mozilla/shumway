var StageDefinition = (function () {
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

  var def = {
    __class__: 'flash.display.Stage',

    initialize: function () {
      this._color = 0xFFFFFFFF;
      this._focus = null;
      this._clickTarget = null;
      this._showRedrawRegions = false;
      this._stage = this;
      this._stageHeight = 0;
      this._stageWidth = 0;
      this._transform = { };
      this._mouseJustLeft = false;
      this._quality = STAGE_QUALITY_HIGH;
    },

    get allowsFullScreen() {
      return false;
    },
    get colorCorrection() {
      return COLOR_CORRECTION_DEFAULT;
    },
    set colorCorrection(val) {
      notImplemented();
    },
    get colorCorrectionSupport() {
      return COLOR_CORRECTION_UNSUPPORTED;
    },
    get displayState() {
      return null;
    },
    get focus() {
      return Keyboard._focus;
    },
    set focus(val) {
      Keyboard._focus = val;
    },
    get frameRate() {
      return this._frameRate;
    },
    set frameRate(val) {
      this._frameRate = val;
    },
    get fullScreenHeight() {
      notImplemented();
    },
    get fullScreenSourceRect() {
        return null;
    },
    set fullScreenSourceRect(val) {
      notImplemented();
    },
    get fullScreenWidth() {
      notImplemented();
    },
    get quality() {
      return this._quality;
    },
    set quality(val) {
      this._quality = val;
    },
    get scaleMode() {
      return STAGE_SCALE_MODE_NO_SCALE;
    },
    set scaleMode(val) {
      notImplemented();
    },
    get showDefaultContextMenu() {
      return true;
    },
    set showDefaultContextMenu(val) {
      notImplemented();
    },
    get stageFocusRect() {
      return false;
    },
    set stageFocusRect(val) {
      notImplemented();
    },
    get stageHeight() {
      return this._stageHeight;
    },
    set stageHeight(val) {
      notImplemented();
    },
    get stageWidth() {
      return this._stageWidth;
    },
    set stageWidth(val) {
      notImplemented();
    },
    get stageVideos() {
      notImplemented();
    },
    get wmodeGPU() {
      return false;
    },

    invalidate: function () {
      notImplemented();
    },
    isFocusInaccessible: function() {
      notImplemented();
    }
  };

  var desc = Object.getOwnPropertyDescriptor;

  // TODO
  def.__glue__  = {
    native: {
      instance: {
        stageHeight: desc(def, "stageHeight"),
        stageWidth: desc(def, "stageWidth"),
        frameRate: desc(def, "frameRate"),
        requireOwnerPermissions: function () {
          // private undocumented
        }
      }
    }
  };

  return def;
}).call(this);
