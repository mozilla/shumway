function MovieClip() {
  this.frameScripts = {};
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

MovieClip.prototype.play = function () {
  this.isPlaying = true;
};

MovieClip.prototype.stop = function () {
  this.isPlaying = false;
};

MovieClip.prototype.nextFrame = function () {
  this.gotoFrame(this.currentFrame + 1);
};

MovieClip.prototype.prevFrame = function () {
  this.gotoFrame(this.currentFrame - 1);
};

MovieClip.prototype.gotoFrame = function (frame, scene) {
  if (frame > this.framesLoaded) {
    frame = this.framesLoaded;
  } else if (frame < 1) {
    frame = 1;
  }
  this.currentFrame = frame;
  if (this.frameScripts[frame - 1])
    this.frameScripts[frame].call(this);
};

MovieClip.prototype.gotoAndPlay = function (frame, scene) {
  this.isPlaying = true;
  this.gotoFrame(frame, scene);
};

MovieClip.prototype.gotoAndStop = function (frame, scene) {
  this.isPlaying = false;
  this.gotoFrame(frame, scene);
};

MovieClip.prototype.addFrameScript = function () {
  for (var i = 0, n = arguments.length; i < n; i += 2) {
    this.frameScripts[arguments[i]] = arguments[i + 1];
  }
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
