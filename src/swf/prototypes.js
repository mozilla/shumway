/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var MovieClipPrototype = function(obj, dictionary) {
  var totalFrames = obj.frameCount || 1;
  var pframes = obj.pframes || [];
  var frame = null;
  var currentPframe = 0;
  var timeline = [];
  var framesLoaded = 0;
  var as2Context = AS2Context.instance;

  function createAS2Script(data) {
    return (function() {
      var as2Object = this.$as2Object;
      if (!as2Object) {
        as2Object = new AS2MovieClip();
        as2Object.$attachNativeObject(this);
        as2Object['this'] = as2Object;
      }

      var globals = as2Context.globals;
      globals._root = as2Object;
      globals._level0 = as2Object;

      try {
        executeActions(data, as2Context, as2Object);
      } catch (e) {
        console.log('Error during ActionScript execution: ' + e);
      }
    });
  }

  function ensure(frameNum) {
    var n = timeline.length;
    while (n < frameNum) {
      frame = create(frame);
      frame.incomplete = true;
      var pframe = pframes[currentPframe++];
      if (!pframe)
        return;
      var i = pframe.repeat || 1;
      while (i--) {
        timeline.push(frame);
        ++n;
      }
      var depths = keys(pframe);

      defer(function() {
        var depth;
        while (depth = depths[0]) {
          if (+depth) {
            var entry = pframe[depth];
            depth -= 0x4001;
            if (entry) {
              var initObj = entry.move ? frame[depth] : { };
              var id = entry.id;
              if (id) {
                assert(id in dictionary, 'unknown object', 'place');
                if (dictionary[id] === null)
                  return true;
                var proto = dictionary[id];
                if (proto.constructor !== Object)
                  var character = proto.constructor();
                else
                  var character = create(proto);
              } else {
                var character = create(initObj);
              }
              var initXform = initObj.transform || { };
              character.transform = {
                matrix: entry.matrix || initXform.matrix,
                colorTransform: entry.cxform || initXform.colorTransform
              };
              if (character.draw)
                character.ratio = entry.ratio || 0;
              if (entry.events)
                character.events = entry.events;
              frame[depth] = character;
            } else {
              frame[depth] = entry;
            }
          }
          depths.shift();
        }
        delete frame.incomplete;
        ++framesLoaded;
        var i = framesLoaded;
        var frm;
        while (frm = timeline[i++]) {
          if (frm.incomplete)
            break;
          ++framesLoaded;
        }
      });
    }
  }

  this.constructor = function MovieClip() {
    if (this instanceof MovieClip)
      return;

    var currentFrame = 0;
    var paused = false;
    var frameScripts = [];

    function dispatchEvent(eventName) {
      if (!instance.events)
        return;
      for (var i = 0; i < instance.events.length; ++i) {
        var event = instance.events[i];
        if (!event[eventName])
          continue;
        var actions = event.actionsData;
        if (typeof actions !== 'function')
          event.actionsData = actions = createAS2Script(actions);
        actions.call(instance);
      }
    }

    function gotoFrame(frame) {
      var frameNum = frame;
      if (frameNum > totalFrames)
        frameNum = 1;
      ensure(frameNum);
      if (frameNum > framesLoaded)
        frameNum = framesLoaded;
      currentFrame = frameNum;

      if (frameNum == frame) {
        dispatchEvent('enterFrame');
        if (frameNum in frameScripts) {
          var actionsData = frameScripts[frameNum];
          if (typeof actionsData !== 'function')
            frameScripts[frameNum] = actionsData = createAS2Script(actionsData);
          actionsData.call(instance);
        }
      }

      delete instance.$boundsCache;
    }

    var proto = create(this);
    var instance = create(proto, {
      _currentframe: {
        get: function() {
          return currentFrame;
        }
      },
      _framesloaded: {
        get: function() {
          return framesLoaded;
        }
      },
      _totalframes: {
        get: function() {
          return totalFrames;
        }
      }
    });

    proto.gotoAndPlay = function(frame) {
      if (this !== instance)
        return;
      paused = false;
      gotoFrame(frame);
    };
    proto.gotoAndStop = function(frame) {
      if (this !== instance)
        return;
      paused = true;
      gotoFrame(frame);
    };
    proto.nextFrame = function() {
      if (this !== instance) {
        if (this === render) {
          if (!paused)
            gotoFrame(currentFrame + 1);
          var frameIndex = currentFrame - 1;
          var displayList = timeline[frameIndex];
          if (!displayList)
            return; // skiping non-prepared frame
          render(displayList, arguments[0]);
        }
        return;
      }
      this.gotoAndStop(currentFrame + 1);
    };
    proto.play = function() {
      if (this !== instance)
        return;
      paused = false;
    };
    proto.prevFrame = function() {
      this.gotoAndStop(currentFrame - 1);
    };
    proto.stop = function() {
      if (this !== instance)
        return;
      paused = true;
    };
    proto.addFrameScript = function(frameNum, actionData) {
      frameScripts[frameNum] = actionData;
    };
    proto.addSpriteInitScripts = function(initScripts) {
      for (var spriteId in initScripts) {
        createAS2Script(initScripts[spriteId]).call(this);
      }
    };
    defineObjectProperties(proto, {
      getBounds: {
        value: function getBounds() {
          if (this.$boundsCache)
            return this.$boundsCache;

          // TODO move the getBounds into utility/core classes
          var currentShapes = timeline[currentFrame - 1];
          var xMin = 0, yMin = 0, xMax = 0, yMax = 0;
          for (var i in currentShapes) {
            if (!+i) continue;
            var shape = currentShapes[i];
            var bounds = shape.bounds;
            if (!bounds) {
              bounds = shape.getBounds();
              var transform = this.transform.matrix;
              var x1 = transform.scaleX * bounds.xMin + transform.skew0 * bounds.yMin + transform.translateX;
              var y1 = transform.skew1 * bounds.yMin + transform.scaleY * bounds.yMin + transform.translateY;
              var x2 = transform.scaleX * bounds.xMax + transform.skew0 * bounds.yMax + transform.translateX;
              var y2 = transform.skew1 * bounds.yMax + transform.scaleY * bounds.yMax + transform.translateY;
              bounds.xMin = Math.min(x1, x2); bounds.xMax = Math.max(x1, x2);
              bounds.yMin = Math.min(y1, y2); bounds.yMax = Math.max(y1, y2);
            }
            xMin = Math.min(xMin, bounds.xMin);
            yMin = Math.min(yMin, bounds.yMin);
            xMax = Math.max(xMax, bounds.xMax);
            yMax = Math.max(yMax, bounds.yMax);
          }
          return (this.$boundsCache = {xMin: xMin, yMin: yMin, xMax: xMax, yMax: yMax});
        },
        enumerable: false
      },
      x: {
        get: function get$x() {
          return this.transform.matrix.translateX * 0.05;
        },
        set: function set$x(value) {
          this.transform.matrix.translateX = value * 20;
        },
        enumerable: true
      },
      y: {
        get: function get$y() {
          return this.transform.matrix.translateY * 0.05;
        },
        set: function set$y(value) {
          this.transform.matrix.translateY = value * 20;
        },
        enumerable: true
      },
      width: {
        get: function get$width() {
          var bounds = this.getBounds();
          return (bounds.xMax - bounds.xMin) * 0.05;
        },
        set: function set$width(value) {
          throw 'Not implemented: width';
        },
        enumerable: true
      },
      height: {
        get: function get$height() {
          var bounds = this.getBounds();
          return (bounds.yMax - bounds.yMin) * 0.05;
        },
        set: function set$height(value) {
          throw 'Not implemented: height';
        },
        enumerable: true
      },
      rotation: {
        get: function get$rotation() {
          return this.transform.rotation || 0;
        },
        set: function set$rotation(value) {
          this.transform.rotation = value;
        },
        enumerable: true
      },
    });

    return instance;
  }
};
