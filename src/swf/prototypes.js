/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var MovieClipPrototype = function(obj, dictionary, ctx) {
  var totalFrames = obj.frameCount || 1;
  var pframes = obj.pframes || [];
  var frame = null;
  var currentPframe = 0;
  var timeline = [];
  var framesLoaded = 0;
  var currentFrame = 0;

  function ensure(frameNum) {
    if (frameNum > totalFrames)
      frameNum = totalFrames;
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
      complete(frame, pframe, depths);
    }
  }

  function complete(frame, pframe, depths) {
    var depth;
    while (depth = depths[0]) {
      if (+depth) {
        var entry = pframe[depth];
        depth -= 0x4001;
        if (entry) {
          if (entry.move) {
            var character = create(frame[depth]);
          } else if (entry.id in dictionary) {
            if (dictionary[entry.id] === null) {
              setTimeout(complete, frame, pframe, depths);
              return;
            }
            var character = create(dictionary[entry.id]);
          } else {
            fail('unknown object id ' + entry.id, 'movieclip');
          }
          character.transform = { matrix: entry.matrix };
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
    while (frm = timeline[++i]) {
      if (frm.incomplete)
        break;
      ++framesLoaded;
    }
  }

  var paused = false;

  function play() {
    paused = false;
  }
  function stop() {
    paused = true;
  }
  function gotoFrame(frame) {
    var frameNum = frame;
    if (frameNum > totalFrames)
      frameNum = totalFrames;
    ensure(frameNum);
    if (frameNum > framesLoaded)
      frameNum = framesLoaded;
    currentFrame = frameNum;
  }
  function gotoAndPlay(frame) {
    play();
    gotoFrame(frame);
  }
  function gotoAndStop(frame) {
    stop();
    gotoFrame(frame);
  }

  this.gotoAndPlay = gotoAndPlay;
  this.gotoAndStop = gotoAndStop;
  this.nextFrame = function() {
    if (this === render) {
      var frameNum = currentFrame;
      if (!paused) {
        ++frameNum;
        if (frameNum > totalFrames)
          frameNum = 1;
        gotoAndPlay(frameNum);
      }
      var ctx = arguments[0];
      render(timeline[frameNum - 1], ctx);
      return;
    }
    gotoAndStop(currentFrame + 1);
  };
  this.play = play;
  this.prevFrame = function() {
    var frameNum = currentFrame - 1;
    if (frameNum < 1)
      frameNum = 1;
    gotoAndStop(frameNum);
  };
  this.stop = stop;
};
