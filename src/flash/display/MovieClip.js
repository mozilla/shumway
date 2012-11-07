const MovieClipDefinition = (function () {
  var def = {
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

      var s = this.symbol;
      if (s) {
        this._timeline = s.timeline || null;
        this._framesLoaded = s.framesLoaded || 1;
        this._frameLabels = s.frameLabels || {};
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
      if (frameNum > this._totalFrames)
        frameNum = 1;

      if (frameNum > this.framesLoaded)
        frameNum = this.framesLoaded;

      if (frameNum === this._currentFrame)
        return;

      var children = this._children;
      var depthMap = this._depthMap;
      var framePromise = this._timeline[frameNum - 1];
      var highestDepth = depthMap.length;
      var displayList = framePromise.value;
      var loader = this.loaderInfo._loader;

      for (var depth in displayList) {
        var cmd = displayList[depth];
        var current = depthMap[depth];
        if (cmd === null) {
          if (current && current._owned) {
            var index = children.indexOf(current);
            children.splice(index, 1);
            this._control.removeChild(current._control);

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
            var symbolPromise = loader._dictionary[cmd.symbolId];
            var symbolInfo = symbolPromise.value;
            // HACK application domain may have the symbol class --
            // checking which domain has a symbol class
            var symbolClass = avm2.systemDomain.findClass(symbolInfo.className) ?
              avm2.systemDomain.getClass(symbolInfo.className) :
              avm2.applicationDomain.getClass(symbolInfo.className);
            var instance = symbolClass.createAsSymbol(symbolInfo.props);
            var replace = 0;

            if (current && current._owned) {
              if (!cxform)
                cxform = current._cxform;
              index = children.indexOf(current);
              if (!matrix) {
                var m = current._currentTransform;
                matrix = {
                  a: m.a,
                  b: m.b,
                  c: m.c,
                  d: m.d,
                  tx: m.tx * 20,
                  ty: m.ty * 20
                };
              }
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

            children.splice(index, replace, instance);
            depthMap[depth] = instance;

            target = instance;

            // If we bound the instance to a name, set it.
            //
            // XXX: I think this always has to be a trait.
            if (cmd.name)
              this[Multiname.getPublicQualifiedName(cmd.name)] = instance;

            // Call the constructor now that we've made the symbol instance,
            // instantiated all its children, and set the display list-specific
            // properties.
            //
            // XXX: I think we're supposed to throw if the symbol class
            // constructor is not nullary.
            symbolClass.instance.call(instance);

            if (!loader._isAvm2Enabled) {
              this._initAvm1Bindings(cmd, symbolInfo.props, instance);
            }

            instance._animated = true;
            instance._owned = true;
            instance._parent = this;

            if (replace)
              this._control.replaceChild(instance._control, current._control);
            else
              this._control.appendChild(instance._control);

            instance.dispatchEvent(new flash.events.Event("load"));
          } else if (current && current._animated) {
            target = current;
          }

          if (cxform)
            target._cxform = cxform;
          if (matrix) {
            var a = matrix.a;
            var b = matrix.b;
            var c = matrix.c;
            var d = matrix.d;

            target._rotation = Math.atan2(b, a) * 180 / Math.PI;
            var sx = Math.sqrt(a * a + b * b);
            target._scaleX = a > 0 ? sx : -sx;
            var sy = Math.sqrt(d * d + c * c);
            target._scaleY = d > 0 ? sy : -sy;
            var x = target._x = matrix.tx / 20;
            var y = target._y = matrix.ty / 20;

            target._currentTransform = {
              a: a,
              b: b,
              c: c,
              d: d,
              tx: x,
              ty: y
            };
          }
        }
      }

      this._currentFrame = frameNum;
    },
    _initAvm1Bindings: function (cmd, symbolProps, instance) {
      var loader = this.loaderInfo._loader;
      var avm1Context = loader._avm1Context;
      if (symbolProps.frameScripts) {
        var frameScripts = symbolProps.frameScripts;
        for (var i = 0; i < frameScripts.length; i += 2) {
            var frameIndex = frameScripts[i];
            var actionBlock = frameScripts[i + 1];
            instance.addFrameScript(frameIndex, function(actionBlock) {
              return executeActions(actionBlock, avm1Context, this._getAS2Object());
            }.bind(instance, actionBlock));
        }
      }
      if (symbolProps.variableName) {
        var variableName = symbolProps.variableName;
        var i = variableName.lastIndexOf('.');
        var clip;
        if (i >= 0) {
          var targetPath = variableName.substring(0, i).split('.');
          if (targetPath[0] == '_root') {
            clip = this.root._getAS2Object();
            targetPath.shift();
          } else {
            clip = instance._getAS2Object();
          }
          while (targetPath.length > 0) {
            if (!(targetPath[0] in clip))
              throw 'Cannot find ' + variableName + ' variable';
            clip = clip[targetPath.shift()];
          }
          variableName = variableName.substring(i + 1);
        } else
          clip = instance._getAS2Object();
        if (!(variableName in clip))
          clip[variableName] = instance.text;
        delete instance.text;
        Object.defineProperty(instance, 'text', {
          get: function (variableName) {
            return this[variableName];
          }.bind(clip, variableName),
          enumerable: true
        });
      }

      if (cmd.hasEvents) {
        for (var i = 0; i < cmd.events.length; i++) {
          var event = cmd.events[i];
          if (event.eoe) {
            break;
          }
          var fn = function(actionBlock) {
            return executeActions(actionBlock, avm1Context, this._getAS2Object());
          }.bind(instance, event.actionsData);
          for (var eventName in event) {
            if (eventName.indexOf("on") !== 0 || !event[eventName])
              continue;
            var avm2EventName = eventName[2].toLowerCase() + eventName.substring(3);
            this.addEventListener(avm2EventName, fn, false);
          }
        }
      }
      if (cmd.name) {
        this._getAS2Object()[cmd.name] = instance._getAS2Object();
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

  const desc = Object.getOwnPropertyDescriptor;

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
