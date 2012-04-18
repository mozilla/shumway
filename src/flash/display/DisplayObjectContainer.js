function DisplayObjectContainer() {
  this.numChildren = 0;
  this.textSnapshot = null;
  this.tabChildren = false;
  this.mouseChildren = false;
}

DisplayObjectContainer.prototype = new InteractiveObject;
DisplayObjectContainer.prototype.addChild = function (child) { notImplemented(); };
DisplayObjectContainer.prototype.addChildAt = function (child, index) { notImplemented(); };
DisplayObjectContainer.prototype.removeChild = function (child) { notImplemented(); };
DisplayObjectContainer.prototype.removeChildAt = function (index) { notImplemented(); };
DisplayObjectContainer.prototype.getChildIndex = function (child) { notImplemented(); };
DisplayObjectContainer.prototype.setChildIndex = function (child, index) { notImplemented(); };
DisplayObjectContainer.prototype.getChildAt = function (index) { notImplemented(); };
DisplayObjectContainer.prototype.getChildByName = function (name) { notImplemented(); };
DisplayObjectContainer.prototype.contains = function (child) { notImplemented(); };
DisplayObjectContainer.prototype.swapChildrenAt = function (index1, index2) { notImplemented(); };
DisplayObjectContainer.prototype.swapChildren = function (child1, child2) { notImplemented(); };
DisplayObjectContainer.prototype.removeChildren = function (beginIndex, endIndex) {
  notImplemented();
};
DisplayObjectContainer.prototype.getObjectsUnderPoint = function (point) { notImplemented(); };
DisplayObjectContainer.prototype.areInaccessibleObjectsUnderPoint = function (point) {
  notImplemented();
};

natives.ContainerClass = function (scope, instance, baseClass) {
  var c = new Class(
    "DisplayObjectContainer",
    DisplayObjectContainer,
    Class.passthroughCallable(DisplayObjectContainer)
  );
  c.baseClass = baseClass;
  c.nativeMethods = DisplayObjectContainer.prototype;
  c.makeSimpleNativeAccessors("get", ["numChildren",
                                      "textSnapshot",
                                      "dropTarget",
                                      "tabChildren",
                                      "mouseChildren"]);
  c.makeSimpleNativeAccessors("set", ["tabChildren", "mouseChildren"]);
  return c;
};
