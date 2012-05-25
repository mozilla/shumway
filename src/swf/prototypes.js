/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var MovieClipPrototype = function(obj, dictionary) {
  var totalFrames = obj.frameCount || 1;
  var pframes = obj.pframes || [];
  var currentPframe = 0;
  var timeline = [];
  var frameLabels = {};
  var framesLoaded = 0;
  var framesScripts = [];
  var children = {};
  var as2Context = AS2Context.instance;

  function createAS2Script(data) {
    return (function() {
      var as2Object = this.$as2Object;

      try {
        executeActions(data, as2Context, as2Object);
      } catch (e) {
        console.log('Error during ActionScript execution: ' + e);
      }
    });
  }

  function prefetch(parent) {
    var prefetchPortion = 20, prefetchInterval = 100;
    setTimeout(function() {
      ensure(Math.min(framesLoaded + prefetchPortion, totalFrames), parent);
    }, prefetchInterval);
  }

  function ensure(frameNum, parent) { // HACK parent shall not be here
    var n = timeline.length;
    while (n < frameNum) {
      var frame = create(n > 0 ? timeline[n - 1] : null);
      frame.incomplete = true;
      var pframe = pframes[currentPframe++];
      if (!pframe)
        return;
      if (pframe.name)
        frameLabels[pframe.name] = n + 1;
      var i = pframe.repeat || 1;
      while (i--) {
        timeline.push(frame);
        ++n;
      }
      var depths = keys(pframe);

      defer((function(frame, pframe, depths, n) {
        var depth;
        while (depth = depths[0]) {
          if (+depth) {
            var entry = pframe[depth];
            depth -= 0x4001;
            if (entry) {
              if (entry.move && dictionary[entry.id] === null)
                return true;
              var initObj = entry.move ? frame[depth] : { };
              var id = entry.id;
              if (id) {
                assert(id in dictionary, 'unknown object', 'place');
                if (dictionary[id] === null)
                  return true;
                var proto = dictionary[id];
                if (proto.constructor !== Object)
                  var character = proto.constructor(); // HACK ... so is instance creation
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
              if (entry.name) {
                character.name = entry.name;
                parent.$addChild(entry.name, character); // HACK parent assignment
              }
              frame[depth] = character;
            } else {
              frame[depth] = entry;
            }
          }
          depths.shift();
        }
        if (pframe.actionsData)
          framesScripts[n] = createAS2Script(pframe.actionsData);
        if (pframe.initActionsData) {
          for (var spriteId in pframe.initActionsData) {
            createAS2Script(pframe.initActionsData[spriteId]).call(parent);
          }
        }
        if (pframe.assets) {
          parent.$addChild('soundmc', new SoundMock(pframe.assets));
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
        if (framesLoaded < totalFrames)
          prefetch(parent);
      }).bind(null, frame, pframe, depths, n));
    }
  }

  this.constructor = function MovieClip() {
    if (this instanceof MovieClip)
      return;

    var currentFrame = 0;
    var paused = false;

    function dispatchEvent(eventName, args) {
      var as2Object = instance.$as2Object;
      if (as2Object && as2Object[eventName])
        as2Object[eventName].apply(as2Object, args);

      if (instance.events) {
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
    }

    function gotoFrame(frame) {
      var frameNum = frame;
      if (frameNum > totalFrames)
        frameNum = 1;
      ensure(frameNum, instance);
      if (frameNum > framesLoaded)
        frameNum = framesLoaded;
      currentFrame = frameNum;

      delete instance.$boundsCache;
    }

    var proto = create(this);
    var as2Object;
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
    proto.gotoAndStop = function(frame, scene) {
      if (this !== instance)
        return;
      paused = true;
      gotoFrame(frame);
    };
    proto.gotoLabel = function(label) {
      if (this !== instance)
        return;
      if (!(label in frameLabels))
        return; // label is not found, skipping ?
      gotoFrame(frameLabels[label]);
    };
    proto.nextFrame = function() {
      if (this !== instance) {
        if (this === render) {
          if (!paused)
            gotoFrame((currentFrame % totalFrames) + 1);
          var frameIndex = currentFrame - 1;

          // execute scripts
          dispatchEvent('onEnterFrame');
          if (currentFrame in framesScripts)
            framesScripts[currentFrame].call(instance);

          var displayList = timeline[frameIndex];
          if (!displayList || displayList.incomplete)
            return; // skiping non-prepared frame

          render(displayList, arguments[0]);
        }
        return;
      }
      this.gotoAndStop((currentFrame % totalFrames) + 1);
    };
    proto.play = function() {
      if (this !== instance)
        return;
      paused = false;
    };
    proto.prevFrame = function() {
      this.gotoAndStop(currentFrame > 1 ? currentFrame - 1 : totalFrames);
    };
    proto.stop = function() {
      if (this !== instance)
        return;
      paused = true;
    };
    proto.$addChild = function(name, child) {
      children[name] = child;
      child.parent = this;
    };
    defineObjectProperties(proto, {
      $as2Object: {
        get: function() {
          if (!as2Object) {
            as2Object = new AS2MovieClip();
            as2Object.$attachNativeObject(this);
            as2Object['this'] = as2Object;

            var registerChild = (function(name, obj) {
              Object.defineProperty(as2Object, name, {
                get: function() {
                  return obj.$as2Object;
                },
                configurable: true,
                enumerable: true
              });
            });
            for (var child in children)
              registerChild(child, children[child]);
            var oldAddChild = proto.$addChild;
            proto.$addChild = (function(name, child) {
              oldAddChild.call(this, name, child);
              registerChild(name, child);
            });
          }
          return as2Object;
        },
        enumerable: false
      },
      $parent: {
        get: function get$parent() {
          return this.parent.$as2Object;
        },
        enumerable: false
      },
      $lookupChild: {
        value: function(name) {
          var i = name.indexOf('/');
          if (i == 0) {
            if (this.parent) {
              // moving to _root
              var mc = this;
              while (this.parent)
                mc = mc.parent;
              i++;
              return mc.$lookupChild(name.substring(1));
            }
            // already a root
            name = name.substring(1);
            i = name.indexOf('/');
          }
          var childName = i > 0 ? name.substring(0, i) : name;
          var child = this;
          if (childName == '..') {
            if (!this.parent)
              throw 'mc is _root';
            child = this.parent;
          } else if (childName) {
            if (!(childName in children))
              throw 'Child mc is not found: ' + childName;
            child = children[childName];
          }

          return i < 0 ? child.$as2Object : child.$lookupChild(name.substring(i + 1));
        },
        enumerable: false
      },
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
      name: {
        get: function get$name() {
          return this.name;
        },
        enumerable: true
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
      }
    });

    return instance;
  }
};

// HACK button as movieclip
var ButtonPrototype = function(obj, dictionary) {
  obj.frameCount = 4;
  obj.pframes = [obj.states.up,obj.states.over,obj.states.down,obj.states.hitTest];
  var instance = MovieClipPrototype.apply(this, arguments) || this;
  instance.constructor = (function(oldContructor) {
    return (function() {
      var result = oldContructor.apply(this, arguments);
      result.gotoAndStop(1);
      return result;
    });
  })(instance.constructor);
  return instance;
};

// HACK mocking the sound clips presence
var SoundMock = function(assets) {
  var clip = {
    start: function() {},
    setVolume: function() {}
  };
  var as2Object = {};
  for (var i = 0; i < assets.length; i++)
    as2Object[assets[i].name] = clip;
  this.$as2Object = as2Object;
};
