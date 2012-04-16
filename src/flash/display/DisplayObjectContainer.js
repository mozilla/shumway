function DisplayObjectContainer() {
  this.numChildren = 0;
  this.textSnapshot = null;
  this.tabChildren = false;
  this.mouseChildren = false;
}

var p = DisplayObjectContainer.prototype = new InteractiveObject;
p.addChild = function (child) { notImplemented(); };
p.addChildAt = function (child, index) { notImplemented(); };
p.removeChild = function (child) { notImplemented(); };
p.removeChildAt = function (index) { notImplemented(); };
p.getChildIndex = function (child) { notImplemented(); };
p.setChildIndex = function (child, index) { notImplemented(); };
p.getChildAt = function (index) { notImplemented(); };
p.getChildByName = function (name) { notImplemented(); };
p.contains = function (child) { notImplemented(); };
p.swapChildrenAt = function (index1, index2) { notImplemented(); };
p.swapChildren = function (child1, child2) { notImplemented(); };
p.removeChildren = function (beginIndex, endIndex) { notImplemented(); };
p.getObjectsUnderPoint = function (point) { notImplemented(); };
p.areInaccessibleObjectsUnderPoint = function (point) { notImplemented(); };

natives.ContainerClass = function (scope, instance, baseClass) {
  var c = new Class(
    "DisplayObjectContainer",
    DisplayObjectContainer,
    Class.passthroughCallable(DisplayObjectContainer)
  );
  c.baseClass = baseClass;
  c.nativeMethods = p;
  c.makeSimpleNativeAccessors("get", ["numChildren",
                                      "textSnapshot",
                                      "dropTarget",
                                      "tabChildren",
                                      "mouseChildren"]);
  c.makeSimpleNativeAccessors("set", ["tabChildren", "mouseChildren"]);
  return c;
};
