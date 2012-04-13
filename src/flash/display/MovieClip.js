function MovieClip() {
  this.currentFrame = 0;
  this.framesLoaded = 0;
  this.totalFrames = 0;
  this.trackAsMenu = false;
  this.scenes = [];
  this.currentScene = null;
  this.currentLabel = null;
  this.currentFrameLabel = null;
  this.enabled = false;
  this.isPlaying = false;
}

var p = MovieClip.prototype = new Sprite;
p.play = function () { notImplemented(); };
p.stop = function () { notImplemented(); };
p.nextFrame = function () { notImplemented(); };
p.prevFrame = function () { notImplemented(); };
p.gotoAndPlay = function (frame, scene) { notImplemented(); };
p.gotoAndStop = function (frame, scene) { notImplemented(); };
p.addFrameScript = function () { notImplemented(); };
p.prevScene = function () { notImplemented(); };
p.nextScene = function () { notImplemented(); };

natives.MovieClipClass = function (scope, instance, baseClass) {
  var c = new Class("MovieClip", MovieClip, C(MovieClip));
  c.extend(baseClass);

  c.getters = [
    "currentFrame",
    "framesLoaded",
    "totalFrames",
    "trackAsMenu",
    "scenes",
    "currentScene",
    "currentLabel",
    "currentFrameLabel",
    "enabled",
    "isPlaying"
  ].reduce(function (getters, prop) {
    getters[prop] = function () {
      return this[prop];
    };
    return getters;
  }, {});

  c.setters = [
    "trackAsMenu",
    "enabled"
  ].reduce(function (setters, prop) {
    setters[prop] = function (v) {
      return this[prop] = v;
    };
    return setters;
  }, {});

  return c;
};
