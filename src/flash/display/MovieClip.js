function MovieClip() {
  this._currentDisplayList = null;
  this._currentFrame = 0;
  this._currentFrameLabel = null;
  this._currentLabel = false;
  this._currentScene = { };
  this._enabled = true;
  this._frameScripts = { };
  this._frameLabels = { };
  this._framesLoaded = 1;
  this._isPlaying = true;
  this._scenes = { };
  this._timeline = null;
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
    return this._timeline.length;
  }),

  gotoFrame: describeMethod(function (frameNum, scene) {
    if (frameNum > this._totalFrames)
      frameNum = 1;

    if (frameNum > this.framesLoaded)
      frameNum = this.framesLoaded;

    this._currentFrame = frameNum;

    var currentDisplayList = this._currentDisplayList;
    var displayList = this._timeline[frameNum - 1];

    console.log(displayList);

    this._currentDisplayList = displayList;

    this.$dispatchEvent('onEnterFrame');

    if (frameNum in this._frameScripts) {
      var scripts = this._frameScripts[frameNum];
      for (var i = 0, n = scripts.length; i < n; i++)
        scripts[i].call(this);
    }
  }),
  gotoAndPlay: describeMethod(function (frame, scene) {
    this.play();
    if (isNaN(frame))
      this.gotoLabel(frame);
    else
      this.gotoFrame(frame);
  }),
  gotoAndStop: describeMethod(function (frame, scene) {
    this.stop();
    if (isNaN(frame))
      this.gotoLabel(frame);
    else
      this.gotoFrame(frame);
  }),
  gotoLabel: describeMethod(function (labelName) {
    var frameLabel = this._frameLabels[labelName];
    if (frameLabel)
      this.gotoFrame(frameLabel.frame);
  }),
  isPlaying: describeMethod(function () {
    return this._isPlaying;
  }),
  nextFrame: describeMethod(function () {
    this.gotoAndPlay((this._currentFrame % this._totalFrames) + 1);
  }),
  nextScene: describeMethod(function () {
    notImplemented();
  }),
  play: describeMethod(function () {
    this._isPlaying = true;
  }),
  prevFrame: describeMethod(function () {
    this.gotoAndStop(this._currentFrame > 1 ? this._currentFrame - 1 : this._totalFrames);
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
