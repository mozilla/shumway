function MovieClip() {
  Sprite.call(this);

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

    if (frameNum === this._currentFrame) {
      return;
    }

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
          var symbolClass = loader.getSymbolClassById(cmd.symbolId);
          var initObj = Object.create(symbolClass.prototype);
          var replace = 0;

          if (current && current._owned) {
            if (!cxform)
              cxform = current._cxform;
            index = children.indexOf(current);
            if (!matrix)
              matrix = current.transform.matrix;
            replace = 1;
          } else {
            var top = null;
            for (var i = +depth + 1; i < highestDepth; i++) {
              var info = depthMap[i];
              if (info && info._animated)
                top = info;
            }

            index = top ? children.indexOf(top) : children.length;
          }

          initObj._animated = true;
          initObj._name = cmd.name || null;
          initObj._owned = true;
          initObj._parent = this;

          target = initObj;

          newInstances.push({
            depth: depth,
            index: index,
            initObj: initObj,
            symbolClass: symbolClass
          });

          children.splice(index, replace, null);
        } else if (current && current._animated) {
          target = current;
        }

        if (cxform)
          target._cxform = cxform;
        if (matrix) {
          target._rotation = Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
          var sx = Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b);
          target._scaleX = matrix.a > 0 ? sx : -sx;
          var sy = Math.sqrt(matrix.d * matrix.d + matrix.c * matrix.c);
          target._scaleY = matrix.d > 0 ? sy : -sy;
          target._x = matrix.tx / 20;
          target._y = matrix.ty / 20;
          target._currentTransformMatrix = {
            a: matrix.a,
            b: matrix.b,
            c: matrix.c,
            d: matrix.d,
            tx: target._x,
            ty: target._y
          };
        }
      }
    }

    for (var i = 0, n = newInstances.length; i < n; i++) {
      var entry = newInstances[i];
      var initObj = entry.initObj;

      var instance = new entry.symbolClass(entry.initObj);
      children.splice(entry.index, 1, instance);
      depthMap[entry.depth] = instance;

      if (initObj.name)
        this._bindChildToProperty(instance);
    }

    this._currentFrame = frameNum;
    this._scriptExecutionPending = true;
  }),
  _executeScripts: describeMethod(function () {
    this._scriptExecutionPending = false;
    var frameNum = this._currentFrame;
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
