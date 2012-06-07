function MovieClip() {
  this._currentFrame = 1;
  this._currentFrameLabel = null;
  this._currentLabel = false;
  this._currentScene = {};
  this._enabled = true;
  this._framesLoaded = 1;
  this._scenes = [{}];
  this._totalFrames = 1;
  this._scenes = [{}];
}

MovieClip.prototype = Object.create(new Sprite, {
  addFrameScript: descMethod(function () {
    notImplemented();
  }),
  currentFrame: descAccessor(function () {
    return this._currentFrame;
  }),
  currentFrameLabel: descAccessor(function () {
    return this._currentFrameLabel;
  }),
  currentLabel: descAccessor(function () {
    return this._currentLabel;
  }),
  currentLabels: descAccessor(function () {
    return this._currentScene.labels;
  }),
  currentScene: descAccessor(function () {
    return this._currentScene;
  }),
  enabled: descAccessor(
    function () {
      return this._enabled;
    },
    function (val) {
      this._enabled = val;
    }
  ),
  framesLoaded: descAccessor(function () {
    return this._framesLoaded;
  }),
  gotoAndPlay: descMethod(function (frame, scene) {
    notImplemented();
  }),
  gotoAndStop: descMethod(function (frame, scene) {
    notImplemented();
  }),
  isPlaying: descMethod(function () {
    notImplemented();
  }),
  nextFrame: descMethod(function () {
    notImplemented();
  }),
  nextScene: descMethod(function () {
    notImplemented();
  }),
  play: descMethod(function () {
    notImplemented();
  }),
  prevFrame: descMethod(function () {
    notImplemented();
  }),
  prevScene: descMethod(function () {
    notImplemented();
  }),
  stop: descMethod(function () {
    notImplemented();
  }),
  totalFrames: descAccessor(function () {
    return this._totalFrames;
  }),
  totalFrames: descAccessor(function () {
    return this._totalFrames;
  }),
  trackAsMenu: descAccessor(
    function () {
      return false;
    },
    function (val) {
      notImplemented();
    }
  )
});
