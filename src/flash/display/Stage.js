const StageDefinition = (function () {
  const COLOR_CORRECTION_DEFAULT     = 'default';
  const COLOR_CORRECTION_OFF         = 'on';
  const COLOR_CORRECTION_ON          = 'off';

  const COLOR_CORRECTION_DEFAULT_OFF = 'defaultOff';
  const COLOR_CORRECTION_DEFAULT_ON  = 'defaultOn';
  const COLOR_CORRECTION_UNSUPPORTED = 'unsuported';

  const STAGE_ALIGN_BOTTOM           = 'B';
  const STAGE_ALIGN_BOTTOM_LEFT      = 'BL';
  const STAGE_ALIGN_BOTTOM_RIGHT     = 'BR';
  const STAGE_ALIGN_LEFT             = 'L';
  const STAGE_ALIGN_RIGHT            = 'R';
  const STAGE_ALIGN_TOP              = 'T';
  const STAGE_ALIGN_TOP_LEFT         = 'TL';
  const STAGE_ALIGN_TOP_RIGHT        = 'TR';

  const STAGE_SCALE_MODE_EXACT_FIT   = 'exactFit';
  const STAGE_SCALE_MODE_NO_BORDER   = 'noBorder';
  const STAGE_SCALE_MODE_NO_SCALE    = 'noScale';
  const STAGE_SCALE_MODE_SHOW_ALL    = 'showAll';

  const STAGE_QUALITY_BEST           = 'best';
  const STAGE_QUALITY_HIGH           = 'high';
  const STAGE_QUALITY_LOW            = 'low';
  const STAGE_QUALITY_MEDIUM         = 'medium';

  var def = {
    __class__: 'flash.display.Stage',

    initialize: function () {
      this._color = 0xFFFFFFFF;
      this._focus = null;
      this._clickTarget = null;
      this._stage = this;
      this._stageHeight = 0;
      this._stageWidth = 0;
      this._transform = { };
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
      return STAGE_QUALITY_HIGH;
    },
    set quality(val) {
      notImplemented();
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

  const desc = Object.getOwnPropertyDescriptor;

  // TODO
  def.__glue__  = {
    native: {
      instance: {
        stageHeight: desc(def, "stageHeight"),
        stageWidth: desc(def, "stageWidth"),
        requireOwnerPermissions: function () {
          // private undocumented
        }
      }
    }
  };

  return def;
}).call(this);
