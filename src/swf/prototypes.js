/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var MovieClipPrototype = function(obj, dictionary) {
  var totalFrames = obj.frameCount || 1;
  var pframes = obj.pframes || [];
  var frame = null;
  var currentPframe = 0;
  var timeline = [];
  var framesLoaded = 0;

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

    function gotoFrame(frame) {
      var frameNum = frame;
      if (frameNum > totalFrames)
        frameNum = totalFrames;
      ensure(frameNum);
      if (frameNum > framesLoaded)
        frameNum = framesLoaded;
      currentFrame = frameNum;
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
          var ctx = arguments[0];
          render(timeline[currentFrame - 1], ctx);
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

    return instance;
  }
};
