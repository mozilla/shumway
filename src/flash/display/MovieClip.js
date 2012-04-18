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

p.addFrameScript = function () {
  arguments[1].call(this);
};

p.prevScene = function () { notImplemented(); };
p.nextScene = function () { notImplemented(); };

natives.MovieClipClass = function (scope, instance, baseClass) {
  var c = new Class("MovieClip", MovieClip, Class.passthroughCallable(MovieClip));
  c.baseClass = baseClass;
  c.nativeMethods = p;
  c.makeSimpleNativeAccessors("get", ["currentFrame",
                                      "framesLoaded",
                                      "totalFrames",
                                      "trackAsMenu",
                                      "scenes",
                                      "currentScene",
                                      "currentLabel",
                                      "currentFrameLabel",
                                      "enabled",
                                      "isPlaying"]);
  c.makeSimpleNativeAccessors("set", ["trackAsMenu", "enabled"]);
  return c;
};
