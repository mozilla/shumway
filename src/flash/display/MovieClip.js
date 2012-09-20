function MovieClip() {
  Sprite.call(this);

  this._currentFrame = 0;
  this._currentFrameLabel = null;
  this._currentLabel = false;
  this._currentScene = { };
  this._depth = null;
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
    // arguments are pairs of frameIndex and script/function
    // frameIndex is in range 0..totalFrames-1
    var frameScripts = this._frameScripts;
    for (var i = 0, n = arguments.length; i < n; i += 2) {
      var frameNum = arguments[i] + 1;
      var fn = arguments[i + 1];
      var scripts = frameScripts[frameNum];
      if (scripts)
        scripts.push(fn);
      else
        frameScripts[frameNum] = [fn];
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

  _bindChildToProperty: describeMethod(function (child) {
    if (this.scriptObject) {
      // HACK for AVM2
      var name = Multiname.getPublicQualifiedName(child.name);
      setProperty(this.scriptObject, name, child.scriptObject);
    }
  }),

  gotoFrame: describeMethod(function (frameNum, scene) {
    if (frameNum > this._totalFrames)
      frameNum = 1;

    if (frameNum > this.framesLoaded)
      frameNum = this.framesLoaded;

    if (frameNum === this._currentFrame)
      return;

    var framePromise = this._timeline[frameNum - 1];
    var displayList = framePromise.value;
    var loader = this.loaderInfo._loader;
    var timelineInfo = this._timelineInfo;

    for (var depth in displayList) {
      var cmd = displayList[depth];
      var info = timelineInfo[depth];
      if (cmd === null) {
        if (info) {
          this.removeChild(info.instance);
          delete timelineInfo[depth];
        }
      } else if (cmd.symbolId) {
        var symbolClass = loader.getSymbolClassById(cmd.symbolId);
        var instance = new symbolClass;
        if (info) {
          var index = this.getChildIndex(info.instance);
          this.removeChildAt(index);
          info.instance = instance;
          if (cmd.cxform)
            info.cxform = cmd.cxform;
          if (cmd.matrix)
            info.matrix = cmd.matrix;
          this.addChildAt(instance, index);
        } else {
          info = {
            cxform: cmd.cxform,
            instance: instance,
            matrix: cmd.matrix
          };
          timelineInfo[depth] = info;
          this.addChild(instance);
          if (cmd.name) {
            instance.name = cmd.name;
            this._bindChildToProperty(instance);
          }
        }
        instance._timelineInfo[0] = info;
      } else if (info) {
        if (cmd.cxform)
          info.cxform = cmd.cxform;
        if (cmd.matrix)
          info.matrix = cmd.matrix;
      }
    }

    this._currentFrame = frameNum;

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
