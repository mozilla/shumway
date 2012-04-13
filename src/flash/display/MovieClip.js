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

natives.MovieClipClass = function (scope, instance, baseClass) {
  var c = new Class("MovieClip", MovieClip, Class.passthroughCallable(MovieClip));
  c.extend(baseClass);

  var p = MovieClip.prototype;
  p.play = function () { notImplemented(); };
  p.stop = function () { notImplemented(); };
  p.nextFrame = function () { notImplemented(); };
  p.prevFrame = function () { notImplemented(); };
  p.gotoAndPlay = function (frame, scene) { notImplemented(); };
  p.gotoAndStop = function (frame, scene) { notImplemented(); };
  p.addFrameScript = function () { notImplemented(); };
  p.prevScene = function () { notImplemented(); };
  p.nextScene = function () { notImplemented(); };

  c.nativeMethods = p;
  c.makeSimpleNativeAccessors("get", [ "currentFrame",
                                       "framesLoaded",
                                       "totalFrames",
                                       "trackAsMenu",
                                       "scenes",
                                       "currentScene",
                                       "currentLabel",
                                       "currentFrameLabel",
                                       "enabled",
                                       "isPlaying" ]);
  c.makeSimpleNativeAccessors("set", [ "trackAsMenu",
                                       "enabled" ]);

  return c;
};
