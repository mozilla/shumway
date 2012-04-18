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

MovieClip.prototype = new Sprite;
MovieClip.prototype.play = function () { notImplemented(); };
MovieClip.prototype.stop = function () { notImplemented(); };
MovieClip.prototype.nextFrame = function () { notImplemented(); };
MovieClip.prototype.prevFrame = function () { notImplemented(); };
MovieClip.prototype.gotoAndPlay = function (frame, scene) { notImplemented(); };
MovieClip.prototype.gotoAndStop = function (frame, scene) { notImplemented(); };

MovieClip.prototype.addFrameScript = function () {
  arguments[1].call(this);
};

MovieClip.prototype.prevScene = function () { notImplemented(); };
MovieClip.prototype.nextScene = function () { notImplemented(); };

natives.MovieClipClass = function (scope, instance, baseClass) {
  var c = new Class("MovieClip", MovieClip, Class.passthroughCallable(MovieClip));
  c.baseClass = baseClass;
  c.nativeMethods = MovieClip.prototype;
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
