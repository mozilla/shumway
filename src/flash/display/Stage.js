function Stage() { }
Stage.kInvalidParamError = 2004;

Stage.prototype = new DisplayObjectContainer;
Stage.prototype.invalidate = function () { notImplemented(); }
Stage.prototype.isFocusInaccessible = function () { notImplemented(); }
Stage.prototype.set_displayState = function (value) { notImplemented(); }
Stage.prototype.get_simulatedFullScreenWidth = function () { notImplemented(); }
Stage.prototype.get_simulatedFullScreenHeight = function () { notImplemented(); }
Stage.prototype.removeChildAt = function (index) { notImplemented(); }
Stage.prototype.swapChildrenAt = function (index1, index2) { notImplemented(); }
Stage.prototype.requireOwnerPermissions = function () { notImplemented(); }

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
