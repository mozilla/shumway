/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var identityMatrix = {
  scaleX: 1,
  scaleY: 1,
  skew0: 0,
  skew1: 0,
  translateX: 0,
  translateY: 0
};

var MovieClipPrototype = function(obj, dictionary) {
  var totalFrames = obj.frameCount || 1;
  var pframes = obj.pframes || [];
  var currentPframe = 0;
  var timeline = [];
  var frameLabels = {};
  var framesLoaded = 0;
  var frameScripts = [];
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

  function addFrameScript() {
    for (var i = 0, n = arguments.length; i < n; i += 2) {
      var frameNum = arguments[i];
      if (!frameScripts[frameNum])
        frameScripts[frameNum] = [];
      frameScripts[frameNum].push(arguments[i + 1]);
    }
  }

  function prefetchFrame(parent) {
    var prefetchPortion = 20, prefetchInterval = 100;
    setTimeout(function() {
      ensureFrame(Math.min(framesLoaded + prefetchPortion, totalFrames), parent);
    }, prefetchInterval);
  }

  function ensureFrame(frameNum, parent) { // HACK parent shall not be here
    var n = timeline.length;
    while (n < frameNum) {
      var frame = create(n > 0 ? timeline[n - 1] : null);
      frame.incomplete = true;
      var pframe = pframes[currentPframe++];
      if (!pframe)
        return;
      var currentFrame = n + 1;
      if (pframe.name)
        frameLabels[pframe.name] = currentFrame;
      var i = pframe.repeat || 1;
      while (i--) {
        timeline.push(frame);
        ++n;
      }
      var depths = keys(pframe);

      defer((function(frame, pframe, depths, currentFrame) {
        var depth;
        while (depth = depths[0]) {
          if (+depth) {
            var entry = pframe[depth];
            depth -= 0x4001;
            if (entry) {
              if (entry.move && dictionary[entry.id] === null)
                return true;
              var initObj = (entry.move ? frame[depth] : null) || {};
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
              character.matrix = entry.matrix || initObj.matrix || identityMatrix;
              character.cxform = entry.cxform || initObj.cxform;
              if (character.draw)
                character.ratio = entry.ratio || 0;
              if (entry.events)
                character.events = entry.events;
              if (entry.name) {
                character.name = entry.name;
                parent.$addChild(entry.name, character); // HACK parent assignment
              }
              character.parent = parent;
              character.root = parent.root || parent;
              if (character.variableName)
                parent.$bindVariable(character);
              frame[depth] = character;
            } else {
              frame[depth] = null;
            }
          }
          depths.shift();
        }
        if (pframe.actionsData && pframe.actionsData.length > 0) {
          for (var i = 0; i < pframe.actionsData.length; i++)
            addFrameScript(currentFrame, createAS2Script(pframe.actionsData[i]));
        }
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
          parent.$dispatchEvent('onLoad');
          ++framesLoaded;
        }
        if (framesLoaded < totalFrames)
          prefetchFrame(parent);
      }).bind(null, frame, pframe, depths, currentFrame));
    }
  }

  this.constructor = function MovieClip() {
    if (this instanceof MovieClip)
      return;

    var currentFrame = 0;
    var paused = false;
    var rotation = 0;
    var width, height;

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
      ensureFrame(frameNum, instance);
      if (frameNum > framesLoaded)
        frameNum = framesLoaded;
      currentFrame = frameNum;

      // execute scripts
      dispatchEvent('onEnterFrame');
      if (currentFrame in frameScripts) {
        var scripts = frameScripts[currentFrame];
        for (var i = 0, n = scripts.length; i < n; ++i)
          scripts[i].call(instance);
      }
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

    var lastMouseCoordinates = null;
    function getMouseCoordinates() {
      if (lastMouseCoordinates)
        return lastMouseCoordinates;

      lastMouseCoordinates = { x: AS2Mouse.$lastX, y: AS2Mouse.$lastY };
      instance.globalToLocal(lastMouseCoordinates);
      return lastMouseCoordinates;
    }

    proto.gotoAndPlay = function(frame) {
      if (this !== instance)
        return;
      paused = false;
      if (!+frame)
        return this.gotoLabel(frame);
      gotoFrame.call(instance, frame);
    };
    proto.gotoAndStop = function(frame, scene) {
      if (this !== instance)
        return;
      paused = true;
      if (!+frame)
        return this.gotoLabel(frame);
      gotoFrame.call(instance, frame);
    };
    proto.gotoLabel = function(label) {
      if (this !== instance)
        return;
      if (!(label in frameLabels))
        return; // label is not found, skipping ?
      gotoFrame.call(instance, frameLabels[label]);
    };
    proto.renderNextFrame = function(context) {
      if (!paused)
        gotoFrame.call(instance, (currentFrame % totalFrames) + 1);

      var frameIndex = currentFrame - 1;
      var displayList = timeline[frameIndex];
      if (!displayList || displayList.incomplete)
        return; // skiping non-prepared frame

      render(displayList, context);
    }
    proto.nextFrame = function() {
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
    proto.$dispatchEvent = dispatchEvent;
    proto.$addFrameScript = addFrameScript;
    proto.$createAS2Script = createAS2Script;
    proto.$addChild = function(name, child) {
      children[name] = child;
    };
    proto.$getDisplayList = function(frameNum) {
      var displayList = timeline[frameNum - 1];
      if (!displayList || displayList.incomplete)
        return; // non-prepared frame
      return displayList;
    };
    defineObjectProperties(proto, {
      $as2Object: {
        get: function() {
          if (!as2Object) {
            var nativeObjectContructor = this.nativeObjectContructor || AS2MovieClip;
            as2Object = new nativeObjectContructor();
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
              while (mc.parent)
                mc = mc.parent;
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
      $bindVariable: {
        value: function bindVariable(character) {
          var clip;
          var variableName = character.variableName;
          var i = variableName.lastIndexOf('.');
          if (i >= 0) {
            var targetPath = variableName.substring(0, i);
            targetPath = targetPath == '_root' ? '/' :
              targetPath.replace('_root', '').replace('.', '/');
            clip = this.$lookupChild(targetPath);
            variableName = variableName.substring(i + 1);
          } else
            clip = instance.$as2Object;
          if (!(variableName in clip))
            clip[variableName] = character.value;
          delete character.value;
          Object.defineProperty(character, 'value', {
            get: function () {
              return clip[variableName];
            },
            enumerable: true
          });
        },
        enumerable: false
      },
      getBounds: {
        value: function getBounds(bounds) {
          // TODO move the getBounds into utility/core classes
          var frame = timeline[currentFrame - 1];
          var xMin = 0, yMin = 0, xMax = 0, yMax = 0;
          for (var i in frame) {
            if (!+i) continue;
            var character = frame[i];
            var b = character.bounds || character.getBounds(this);
            xMin = Math.min(xMin, b.xMin);
            yMin = Math.min(yMin, b.yMin);
            xMax = Math.max(xMax, b.xMax);
            yMax = Math.max(yMax, b.yMax);
          }
          if (!bounds || bounds === this)
            return {xMin: xMin, yMin: yMin, xMax: xMax, yMax: yMax};

          var pt1 = bounds.globalToLocal(
            this.localToGlobal({x: xMin, y: yMin}));
          var pt2 = bounds.globalToLocal(
            this.localToGlobal({x: xMax, y: yMin}));
          var pt3 = bounds.globalToLocal(
            this.localToGlobal({x: xMax, y: yMax}));
          var pt4 = bounds.globalToLocal(
            this.localToGlobal({x: xMin, y: yMax}));

          return {
            xMin: Math.min(pt1.x, pt2.x, pt3.x, pt4.x),
            yMin: Math.min(pt1.y, pt2.y, pt3.y, pt4.y),
            xMax: Math.max(pt1.x, pt2.x, pt3.x, pt4.x),
            yMax: Math.max(pt1.y, pt2.y, pt3.y, pt4.y)
          };
        },
        enumerable: false
      },
      localToGlobal: {
        value: function localToGlobal(pt) {
          var m = this.matrix;
          if (rotation) {
            var rotationCos = Math.cos(rotation * Math.PI / 180);
            var rotationSin = Math.sin(rotation * Math.PI / 180);
            pt = {
              x: rotationCos * pt.x - rotationSin * pt.y,
              y: rotationSin * pt.x + rotationCos * pt.y
            };
          }
          var result = !m ? pt : {
            x: m.scaleX * pt.x + m.skew0 * pt.y + m.translateX / 20,
            y: m.skew1 * pt.x + m.scaleY * pt.y + m.translateY / 20
          };
          return this.parent ? this.parent.localToGlobal(result) : result;
        },
        enumerable: false
      },
      globalToLocal: {
        value: function globalToLocal(pt) {
          var result = this.parent ? this.parent.globalToLocal(pt) : pt;
          var m = this.matrix;
          var k = m ? 1 / (m.scaleX * m.scaleY - m.skew0 * m.skew1) : 0;
          var result = !m ? result : {
            x: m.scaleY * k * result.x - m.skew0 * k * result.y +
               (m.translateY * m.skew0 - m.translateX * m.scaleY) * k / 20,
            y: -m.skew1 * k * result.x + m.scaleX * k * result.y +
               (m.translateX * m.skew1 - m.translateY * m.scaleX) * k / 20
          };
          if (rotation) {
            var rotationCos = Math.cos(rotation * Math.PI / 180);
            var rotationSin = Math.sin(rotation * Math.PI / 180);
            result = {
              x: rotationCos * result.x + rotationSin * result.y,
              y: -rotationSin * result.x + rotationCos * result.y
            };
          }
          return result;
        },
        enumerable: false
      },
      hitTest: {
        value: function hitTest() {
          var bounds = this.getBounds(this.root);
          if (typeof arguments[0] === 'object') {
            var target = arguments[0];
            var targetBounds = target.getBounds(this.root);
            var x1 = this.x;
            var y1 = this.y;
            var x2 = target.x;
            var y2 = target.y;
            var x3 = Math.max(x1, x2);
            var y3 = Math.max(y1, y2);
            var width = Math.min(
              x1 + (bounds.xMax - bounds.xMin) / 20,
              x2 + (targetBounds.xMax - targetBounds.xMin) / 20
            ) - x3;
            var height = Math.min(
              y1 + (bounds.yMax - bounds.yMin) / 20,
              y2 + (targetBounds.yMax - targetBounds.yMin) / 20
            ) - y3;
            return width > 0 && height > 0;
          } else {
            var x = arguments[0];
            var y = arguments[1];
            var shapeFlag = arguments[2];
            if (shapeFlag) {
              // HACK shadow canvas hit testing
              if (!this.hitTestCache) {
                this.hitTestCache = {};
                renderShadowCanvas(this);
              }
              var pt = this.globalToLocal({x: x, y: y});
              return this.hitTestCache.isPixelPainted(pt.x, pt.y);
            } else {
              return x > bounds.xMin / 20 && x < bounds.xMax / 20 &&
                     y > bounds.yMin / 20 && y < bounds.yMax / 20;
            }
          }
        },
        enumerable: false
      },
      x: {
        get: function get$x() {
          return this.matrix.translateX / 20;
        },
        set: function set$x(value) {
          this.matrix.translateX = ~~(value * 20);
        },
        enumerable: true
      },
      y: {
        get: function get$y() {
          return this.matrix.translateY / 20;
        },
        set: function set$y(value) {
          this.matrix.translateY = ~~(value * 20);
        },
        enumerable: true
      },
      width: {
        get: function get$width() {
          if (typeof width !== 'undefined')
            return width;
          var bounds = this.getBounds();
          return bounds.xMax / 20;
        },
        set: function set$width(value) {
          width = value;
        },
        enumerable: true
      },
      height: {
        get: function get$height() {
          if (typeof height !== 'undefined')
            return height;
          var bounds = this.getBounds();
          return bounds.yMax / 20;
        },
        set: function set$height(value) {
          height = value;
        },
        enumerable: true
      },
      mouseX: {
        get: function get$mouseY() {
          return getMouseCoordinates().x;
        },
        enumerable: true
      },
      mouseY: {
        get: function get$mouseY() {
          return getMouseCoordinates().y;
        },
        enumerable: true
      },
      rotation: {
        get: function get$rotation() {
          return rotation || 0;
        },
        set: function set$rotation(value) {
          rotation = value;
        },
        enumerable: true
      }
    });

    var events = {
      onMouseDown: function() {
        lastMouseCoordinates = null;
        dispatchEvent('onMouseDown');
      },
      onMouseMove: function() {
        lastMouseCoordinates = null;
        dispatchEvent('onMouseMove');
      },
      onMouseUp: function () {
        lastMouseCoordinates = null;
        dispatchEvent('onMouseUp');
      },
      onMouseWheel: function () {
        dispatchEvent('onMouseWheel', arguments);
      },
      onKeyDown: function() {
        dispatchEvent('onKeyDown');
      },
      onKeyUp: function() {
        dispatchEvent('onKeyUp');
      },
    };
    AS2Mouse.addListener(events);
    AS2Key.addListener(events);

    return instance;
  }
};

// HACK button as movieclip
var ButtonPrototype = function(obj, dictionary) {
  obj.frameCount = 4;
  obj.pframes = [obj.states.up,obj.states.over,obj.states.down,obj.states.hitTest];
  var instance;

  var AS2ButtonConditions = [
    [null, 'idleToOverUp', 'idleToOverDown', null],
    ['overUpToIdle', null, 'overUpToOverDown', null],
    ['overDownToIdle', 'overDownToOverUp', null, 'overDownToOutDown'],
    ['outDownToIdle', null, 'outDownToOverDown', null]
  ];

  function ButtonEvents(instance) {
    this.instance = instance;
    this.buttonPressed = false;
    this.inBounds = false;
    this.lastState = 0;
  }
  ButtonEvents.prototype = {
    onMouseDown: function() {
      this.buttonPressed = true;
      this.updateButtonState();
    },
    onMouseMove: function() {
      this.inBounds = this.instance.hitTest(this.instance.mouseX, this.instance.mouseY, true);
      this.updateButtonState();
    },
    onMouseUp: function () {
      this.buttonPressed = false;
      this.updateButtonState();
    },
    updateButtonState: function() {
      var state = 0, lastState = this.lastState;
      if (!this.inBounds)
        state = 0;
      else if (!this.buttonPressed)
        state = 1;
      else
        state = 2;

      switch (state) {
        case 0:
          this.instance.gotoAndStop(1);
          break;
        case 1:
          this.instance.gotoAndStop(2);
          break;
        case 2:
          this.instance.gotoAndStop(3);
          break;
      }

      if (lastState == 0 && state != 0)
        this.instance.$dispatchEvent('onRollOver');
      else if (lastState != 0 && state == 0)
        this.instance.$dispatchEvent('onRollOut');
      else if (lastState != 2 && state == 2)
        this.instance.$dispatchEvent('onPress');
      else if (lastState == 2 && state != 2)
        this.instance.$dispatchEvent('onRelease');

      this.dispatchAS2Events(lastState, state);
      this.lastState = state;
    },
    dispatchAS2Events: function(lastState, state) {
      var buttonActions = this.instance.buttonActions;
      if (!buttonActions)
        return;
      var buttonCondition = AS2ButtonConditions[lastState][state];
      if (!buttonCondition)
        return;
      if (!this.as2ActionsCache)
        this.as2ActionsCache = {};
      var buttonActionsCache = this.as2ActionsCache[buttonCondition];
      if (!buttonActionsCache) {
        buttonActionsCache = [];
        for (var i = 0; i < buttonActions.length; i++) {
          if (!buttonActions[i][buttonCondition])
            continue;
          var actionsData = buttonActions[i].actionsData;
          buttonActionsCache.push(this.instance.$createAS2Script(actionsData));
        }
        this.as2ActionsCache[buttonCondition] = buttonActionsCache;
      }
      for (var i = 0; i < buttonActionsCache.length; i++)
        buttonActionsCache[i].call(this.instance);
    },
    onMouseWheel: function () {}
  };

  var proto = MovieClipPrototype.apply(this, arguments) || this;
  proto.nativeObjectContructor = AS2Button;
  proto.buttonActions = obj.buttonActions;
  proto.constructor = (function(oldContructor) {
    return (function() {
      var result = oldContructor.apply(this, arguments);
      result.gotoAndStop(4); // invoke hitTest layer
      result.gotoAndStop(1); // then return to the normal

      result.renderNextFrame = (function(oldRenderNextFrame) {
        return (function(context) {
          if (!context.isHitTestRendering)
            return oldRenderNextFrame.apply(this, arguments);

          var displayList = this.$getDisplayList(4);
          if (!displayList)
            return; // skiping non-prepared frame

          render(displayList, context);
        });
      })(result.renderNextFrame);

      AS2Mouse.addListener(new ButtonEvents(result));
      return result;
    });
  })(proto.constructor);
  return proto;
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
