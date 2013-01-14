var MovieClipDefinition = (function () {
  var def = {
    __class__: 'flash.display.MovieClip',

    initialize: function () {
      this._currentFrame = 0;
      this._currentFrameLabel = null;
      this._currentLabel = false;
      this._currentScene = { };
      this._enabled = null;
      this._frameScripts = { };
      this._frameLabels = { };
      this._framesLoaded = 1;
      this._isPlaying = true;
      this._scenes = { };
      this._timeline = null;
      this._totalFrames = 1;
      this._startSoundRegistrations = [];

      var s = this.symbol;
      if (s) {
        this._timeline = s.timeline || null;
        this._framesLoaded = s.framesLoaded || 1;
        this._frameLabels = Object.create(s.frameLabels || null);
        this._frameScripts = Object.create(s.frameScripts || null);
        this._totalFrames = s.totalFrames || 1;
      }
    },

    _callFrame: function (frameNum) {
      if (frameNum in this._frameScripts) {
        var scripts = this._frameScripts[frameNum];
        for (var i = 0, n = scripts.length; i < n; i++)
          scripts[i].call(this);
      }
    },
    _getAS2Object: function () {
      if (!this.$as2Object) {
        new AS2MovieClip().$attachNativeObject(this);
      }
      return this.$as2Object;
    },

    _gotoFrame: function (frameNum, scene) {
      if (frameNum < 1 || frameNum > this._totalFrames)
        frameNum = 1;

      if (frameNum > this.framesLoaded)
        frameNum = this.framesLoaded;

      if (frameNum === this._currentFrame)
        return;

      var currentFrame = this._currentFrame;

      this._markAsDirty();

      if (currentFrame > 0) {
        while (currentFrame++ < frameNum) {
          var children = this._children;
          var depthMap = this._depthMap;
          var framePromise = this._timeline[currentFrame - 1];
          var highestDepth = depthMap.length;
          var displayList = framePromise.value;

          for (var depth in displayList) {
            var cmd = displayList[depth];
            var current = depthMap[depth];
            if (cmd === null) {
              if (current && current._owned) {
                var index = children.indexOf(current);
                children.splice(index, 1);

                this._control.removeChild(current._control);
                current.dispatchEvent(new flash.events.Event("removed"));

                if (depth < highestDepth)
                  depthMap[depth] = undefined;
                else
                  depthMap.splice(-1);
              }
            } else {
              var clipDepth = cmd.clipDepth;
              var cxform = cmd.cxform;
              var matrix = cmd.matrix;
              var target;

              if (cmd.promise) {
                var replace = false;
                var index;
                if (current && current._owned) {
                  replace = true;
                  index = children.indexOf(current);

                  this._control.removeChild(current._control);
                  current.dispatchEvent(new flash.events.Event("removed"));

                } else {
                  var top = null;
                  for (var i = +depth + 1; i < highestDepth; i++) {
                    var info = depthMap[i];
                    if (info && info._animated) {
                      top = info;
                      break;
                    }
                  }
                  index = top ? children.indexOf(top) : children.length;
                }

                if (current && current._owned) {
                  if (!clipDepth)
                    clipDepth = current._clipDepth;
                  if (!cxform)
                    cxform = current._cxform;
                  if (!matrix)
                    matrix = current._currentTransform;
                }

                var symbolPromise = cmd.promise;
                var symbolInfo = symbolPromise.value;
                var props = Object.create(symbolInfo.props);

                if (clipDepth)
                  props.clipDepth = clipDepth;
                if (cxform)
                  props.cxform = cxform;
                if (matrix)
                  props.currentTransform = matrix;

                children.splice(index, replace, {
                  className: symbolInfo.className,
                  events: cmd.events,
                  depth: depth,
                  name: cmd.name,
                  props: props
                });
              } else if (current && current._animated) {
                if (clipDepth)
                  current._clipDepth = clipDepth;
                if (cxform)
                  current._cxform = cxform;

                if (matrix) {
                  var a = matrix.a;
                  var b = matrix.b;
                  var c = matrix.c;
                  var d = matrix.d;

                  current._rotation = Math.atan2(b, a) * 180 / Math.PI;
                  var sx = Math.sqrt(a * a + b * b);
                  current._scaleX = a > 0 ? sx : -sx;
                  var sy = Math.sqrt(d * d + c * c);
                  current._scaleY = d > 0 ? sy : -sy;
                  var x = current._x = matrix.tx;
                  var y = current._y = matrix.ty;

                  current._currentTransform = matrix;
                }
              }
            }
          }
        }

        this._constructChildren();
      }

      this._currentFrame = frameNum;

      if (frameNum) {
        this._requestCallFrame();
        this._startSounds(frameNum);
      }
    },
    _registerStartSounds: function (frameNum, starts) {
      this._startSoundRegistrations[frameNum] = starts;
    },
    _requestCallFrame: function () {
       this._scriptExecutionPending = true;
       this.stage._callFrameRequested = true;
    },
    _startSounds: function (frameNum) {
      var starts = this._startSoundRegistrations[frameNum];
      if (!starts)
        return;

      var sounds = this._sounds || (this._sounds = {});
      var loader = this.loaderInfo._loader;
      for (var i = 0; i < starts.length; i++) {
        var start = starts[i];
        var symbolId = start.soundId;
        var sound = sounds[symbolId];
        if (!sound) {
          var symbolPromise = loader._dictionary[symbolId];
          var symbolInfo = symbolPromise.value;

          var symbolClass = avm2.systemDomain.findClass(symbolInfo.className) ?
            avm2.systemDomain.getClass(symbolInfo.className) :
            avm2.applicationDomain.getClass(symbolInfo.className);

          var sound = symbolClass.createAsSymbol(symbolInfo.props);
          symbolClass.instance.call(sound);
          sounds[symbolId] = sound;
        }
        sound.play();
      }
    },

    get currentFrame() {
      return this._currentFrame || 1;
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
    get totalFrames() {
      return this._totalFrames;
    },
    get trackAsMenu() {
      return false;
    },
    set trackAsMenu(val) {
      notImplemented();
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
    gotoAndPlay: function (frame, scene) {
      this.play();
      if (isNaN(frame))
        this.gotoLabel(frame);
      else
        this._gotoFrame(frame);
    },
    gotoAndStop: function (frame, scene) {
      this.stop();
      if (isNaN(frame))
        this.gotoLabel(frame);
      else
        this._gotoFrame(frame);
    },
    gotoLabel: function (labelName) {
      var frameLabel = this._frameLabels[labelName];
      if (frameLabel)
        this._gotoFrame(frameLabel.frame);
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
    }
  };

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        currentFrame: desc(def, "currentFrame"),
        framesLoaded: desc(def, "framesLoaded"),
        totalFrames: desc(def, "totalFrames"),
        trackAsMenu: desc(def, "trackAsMenu"),
        scenes: desc(def, "scenes"),
        currentScene: desc(def, "currentScene"),
        currentLabel: desc(def, "currentLabel"),
        currentFrameLabel: desc(def, "currentFrameLabel"),
        enabled: desc(def, "enabled"),
        isPlaying: desc(def, "isPlaying"),
        play: def.play,
        stop: def.stop,
        nextFrame: def.nextFrame,
        prevFrame: def.prevFrame,
        gotoAndPlay: def.gotoAndPlay,
        gotoAndStop: def.gotoAndStop,
        addFrameScript: def.addFrameScript,
        prevScene: def.prevScene,
        nextScene: def.nextScene
      }
    }
  };

  return def;
}).call(this);
