function InteractiveObject() {
  this.tabEnabled = false;
  this.tabIndex = 0;
  this.focusRect = null;
  this.mouseEnabled = false;
  this.doubleClickEnabled = false;
  this.accessibilityImplementation = null;
  this.needsSoftKeyboard = false;
  this.contextMenu = null;
}

var p = InteractiveObject.prototype = new DisplayObject;
p.requestSoftKeyboard = function () { notImplemented(); };

natives.InteractiveObjectClass = function (scope, instance, baseClass) {
  var c = new Class(
    "InteractiveObject",
    InteractiveObject,
    Class.passthroughCallable(InteractiveObject)
  );
  c.baseClass = baseClass;

  c.nativeMethods = p;
  c.makeSimpleNativeAccessors("get", ["tabEnabled",
                                      "tabIndex",
                                      "focusRect",
                                      "mouseEnabled",
                                      "doubleClickEnabled",
                                      "accessibilityImplementation",
                                      "needsSoftKeyboard",
                                      "contextMenu"]);
  c.makeSimpleNativeAccessors("set", ["tabEnabled",
                                      "tabIndex",
                                      "focusRect",
                                      "mouseEnabled",
                                      "doubleClickEnabled",
                                      "accessibilityImplementation",
                                      "needsSoftKeyboard",
                                      "contextMenu"]);
  return c;
};
