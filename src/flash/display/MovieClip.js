function MovieClip() {
  this._currentFrame = 1;
  this._currentFrameLabel = null;
  this._currentLabel = false;
  this._currentScene = { };
  this._enabled = true;
  this._frameScripts = { };
  this._framesLoaded = 1;
  this._isPlaying = true;
  this._scenes = { };
  this._totalFrames = 1;
  this._scenes = { };
}

MovieClip.prototype = Object.create(new Sprite, {
  __class__: describeInternalProperty('flash.display.MovieClip'),

  addFrameScript: describeMethod(function () {
    var frameScripts = this._frameScripts;
    for (var i = 0, n = arguments.length; i < n; i += 2) {
      var frameNum = arguments[i];
      if (!frameScripts[frameNum])
        frameScripts[frameNum] = [];
      frameScripts[frameNum].push(arguments[i + 1]);
    }
  }),
  currentFrame: describeAccessor(function () {
    return this._currentFrame;
  }),
  currentFrameLabel: describeAccessor(function () {
    return this._currentFrameLabel;
  }),
  currentLabel: describeAccessor(function () {
    return this._currentLabel;
  }),
  currentLabels: describeAccessor(function () {
    return this._currentScene.labels;
  }),
  currentScene: describeAccessor(function () {
    return this._currentScene;
  }),
  enabled: describeAccessor(
    function () {
      return this._enabled;
    },
    function (val) {
      this._enabled = val;
    }
  ),
  framesLoaded: describeAccessor(function () {
    return this._framesLoaded;
  }),
  gotoAndPlay: describeMethod(function (frame, scene) {
    notImplemented();
  }),
  gotoAndStop: describeMethod(function (frame, scene) {
    notImplemented();
  }),
  isPlaying: describeMethod(function () {
    return this._isPlaying;
  }),
  nextFrame: describeMethod(function () {
    notImplemented();
  }),
  nextScene: describeMethod(function () {
    notImplemented();
  }),
  play: describeMethod(function () {
    this._isPlaying = true;
  }),
  prevFrame: describeMethod(function () {
    notImplemented();
  }),
  prevScene: describeMethod(function () {
    notImplemented();
  }),
  stop: describeMethod(function () {
    this._isPlaying = false;
  }),
  totalFrames: describeAccessor(function () {
    return this._totalFrames;
  }),
  totalFrames: describeAccessor(function () {
    return this._totalFrames;
  }),
  trackAsMenu: describeAccessor(
    function () {
      return false;
    },
    function (val) {
      notImplemented();
    }
  )
});
