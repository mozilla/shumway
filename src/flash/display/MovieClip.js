function MovieClip() {
  Sprite.call(this);

  this._currentFrame = 0;
  this._currentFrameLabel = null;
  this._currentLabel = false;
  this._currentScene = { };
  this._displayList = null;
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

MovieClip.prototype = Object.create(Sprite.prototype, {
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

  gotoFrame: describeMethod(function (frameNum, scene) {
    if (frameNum > this._totalFrames)
      frameNum = 1;

    if (frameNum > this.framesLoaded)
      frameNum = this.framesLoaded;

    this._currentFrame = frameNum;

    var currentDisplayList = this._displayList || { };
    var framePromise = this._timeline[frameNum - 1];
    var displayList = framePromise.value;

    //this.$dispatchEvent('onEnterFrame');

    if (displayList === currentDisplayList)
      return;

    var loader = this.loaderInfo._loader;
    for (var depth in displayList) {
      var cmd = displayList[depth];
      var timelineInfo = currentDisplayList[depth];
      if (cmd === null) {
        // REMOVE
        if (timelineInfo) {
          this.removeChild(timelineInfo.instance);
        }
        var instance = currentDisplayList[depth].instance;
      } else if (cmd.symbolId) {
        var symbolClass = loader.getSymbolClassById(cmd.symbolId);
        var instance = new symbolClass;
        if (timelineInfo) {
          // REPLACE
          var oldInstance = timelineInfo.instance;
          var index = this.getChildIndex(oldInstance);
          this.removeChildAt(index);
          instance._matrix = cmd.matrix || oldInstance._matrix;
          instance._cxform = cmd.cxform || oldInstance._cxform;
          this.addChildAt(instance, index);
        } else {
          // PLACE
          instance._matrix = cmd.matrix;
          instance._cxform = cmd.cxform;
          this.addChild(instance);
        }
        cmd.instance = instance;
      }
    }

    this._displayList = displayList;

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
    this.gotoAndPlay(this._currentFrame % this._totalFrames + 1);
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
