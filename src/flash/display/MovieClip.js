const MovieClipDefinition = {
  __class__: 'flash.display.MovieClip',

  initialize: function () {
    this._currentFrame = 0;
    this._currentFrameLabel = null;
    this._currentLabel = false;
    this._currentScene = { };
    this._depthMap = [];
    this._enabled = null;
    this._frameScripts = { };
    this._frameLabels = { };
    this._framesLoaded = 1;
    this._isPlaying = true;
    this._scenes = { };
    this._timeline = null;
    this._totalFrames = 1;
    this._scenes = { };
  },

  addFrameScript: function () {
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
  },
  get currentFrame() {
    return this._currentFrame;
  },
  get currentFrameLabel() {
    return this._currentFrameLabel;
  },
  get currentLabel() {
    return this._currentLabel;
  },
  get currentLabels() {
    return this._currentScene.labels;
  },
  get currentScene() {
    return this._currentScene;
  },
  get enabled() {
    return this._enabled;
  },
  set enabled(val) {
    this._enabled = val;
  },
  get framesLoaded() {
    return this._framesLoaded;
  },
  _bindChildToProperty: function (child) {
    // REMOVEME?
    if (this.scriptObject) {
      // HACK for AVM2
      var name = Multiname.getPublicQualifiedName(child.name);
      setProperty(this.scriptObject, name, child.scriptObject);
    }
  },
  gotoFrame: function (frameNum, scene) {
    if (frameNum > this._totalFrames)
      frameNum = 1;

    if (frameNum > this.framesLoaded)
      frameNum = this.framesLoaded;

    this.dispatchEvent(new Event(Event.ENTER_FRAME));

    if (frameNum === this._currentFrame)
      return;

    var children = this._children;
    var depthMap = this._depthMap;
    var framePromise = this._timeline[frameNum - 1];
    var highestDepth = depthMap.length;
    var displayList = framePromise.value;
    var loader = this.loaderInfo._loader;
    var newInstances = [];

    for (var depth in displayList) {
      var cmd = displayList[depth];
      var current = depthMap[depth];
      if (cmd === null) {
        if (current && current._owned) {
          var index = children.indexOf(current);
          children.splice(index, 1);

          if (depth <= highestDepth)
            depthMap[depth] = undefined;
          else
            depthMap.splice(-1);
        }
      } else {
        var cxform = cmd.cxform;
        var matrix = cmd.matrix;
        var target;

        if (cmd.symbolId) {
          var index = 0;
          var symbolInfo = loader.getSymbolInfoById(cmd.symbolId);
          var symbolClass = avm2.systemDomain.getClass(symbolInfo.className);
          var instance = symbolClass.createAsSymbol(symbolInfo.props);
          var replace = 0;

          if (current && current._owned) {
            if (!cxform)
              cxform = current._cxform;
            index = children.indexOf(current);
            if (!matrix)
              matrix = current.transform.matrix;
            replace = 1;
          } else {
            instance._name = cmd.name;

            var top = null;
            for (var i = +depth + 1; i < highestDepth; i++) {
              var info = depthMap[i];
              if (info && info._animated)
                top = info;
            }

            index = top ? children.indexOf(top) : children.length;
          }

          instance._animated = true;
          instance._owned = true;
          instance._parent = this;

          children.splice(index, replace, instance);
          depthMap[depth] = instance;

          target = instance;
        } else if (current && current._animated) {
          target = current;
        }

        if (cxform)
          target._cxform = cxform;
        if (matrix) {
          target._rotation = Math.atan2(matrix.b, matrix.c) * 180 / Math.PI;
          var sx = Math.sqrt(matrix.d * matrix.d + matrix.c * matrix.c);
          target._scaleX = matrix.a > 0 ? sx : -sx;
          var sy = Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b);
          target._scaleY = matrix.d > 0 ? sy : -sy;
          target._x = matrix.tx / 20;
          target._y = matrix.ty / 20;
        }
      }
    }

    this._currentFrame = frameNum;

    if (frameNum in this._frameScripts) {
      var scripts = this._frameScripts[frameNum];
      for (var i = 0, n = scripts.length; i < n; i++)
        scripts[i].call(this);
    }
  },
  gotoAndPlay: function (frame, scene) {
    this.play();
    if (isNaN(frame))
      this.gotoLabel(frame);
    else
      this.gotoFrame(frame);
  },
  gotoAndStop: function (frame, scene) {
    this.stop();
    if (isNaN(frame))
      this.gotoLabel(frame);
    else
      this.gotoFrame(frame);
  },
  gotoLabel: function (labelName) {
    var frameLabel = this._frameLabels[labelName];
    if (frameLabel)
      this.gotoFrame(frameLabel.frame);
  },
  isPlaying: function () {
    return this._isPlaying;
  },
  nextFrame: function () {
    this.gotoAndPlay(this._currentFrame % this._totalFrames + 1);
  },
  nextScene: function () {
    notImplemented();
  },
  play: function () {
    this._isPlaying = true;
  },
  prevFrame: function () {
    this.gotoAndStop(this._currentFrame > 1 ? this._currentFrame - 1 : this._totalFrames);
  },
  prevScene: function () {
    notImplemented();
  },
  stop: function () {
    this._isPlaying = false;
  },
  get totalFrames() {
    return this._totalFrames;
  },
  get trackAsMenu() {
    return false;
  },
  set trackAsMenu(val) {
    notImplemented();
  }
};
