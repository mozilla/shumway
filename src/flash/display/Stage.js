function Stage() { }
Stage.kInvalidParamError = 2004;

var p = Stage.prototype = new DisplayObjectContainer;
p.invalidate = function() { notImplemented(); }
p.isFocusInaccessible = function() { notImplemented(); }
p.set_displayState = function(value) { notImplemented(); }
p.get_simulatedFullScreenWidth = function() { notImplemented(); }
p.get_simulatedFullScreenHeight = function() { notImplemented(); }
p.removeChildAt = function(index) { notImplemented(); }
p.swapChildrenAt = function(index1, index2) { notImplemented(); }
p.requireOwnerPermissions = function() { notImplemented(); }

natives.StageClass = function (scope, instance, baseClass) {
  var c = new Class("Stage", Stage, Class.passthroughCallable(Stage));
  c.baseClass = baseClass;
  c.nativeMethods = Stage.prototype;
  c.makeSimpleNativeAccessors("get", ["frameRate",
                                      "invalidate",
                                      "scaleMode",
                                      "align",
                                      "stageWidth",
                                      "stageHeight",
                                      "showDefaultContextMenu",
                                      "focus",
                                      "colorCorrection",
                                      "colorCorrectionSupport",
                                      "stageFocusRect",
                                      "quality",
                                      "displayState",
                                      "simulatedDisplayState",
                                      "stageVideos",
                                      "stage3Ds",
                                      "color",
                                      "fullScreenWidth",
                                      "fullScreenHeight",
                                      "wmodeGPU",
                                      "softKeyboardRect",
                                      "allowsFullScreen",
                                      "displayContextInfo"]);
  c.makeSimpleNativeAccessors("set", ["frameRate",
                                      "invalidate",
                                      "scaleMode",
                                      "align",
                                      "stageWidth",
                                      "stageHeight",
                                      "showDefaultContextMenu",
                                      "focus",
                                      "colorCorrection",
                                      "stageFocusRect",
                                      "quality",
                                      "displayState",
                                      "simulatedDisplayState",
                                      "color"]);
  c.nativeStatics = Stage;
  return c;
};
