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

natives.InteractiveObjectClass = function (scope, instance, baseClass) {
  var c = new Class("InteractiveObject", InteractiveObject, Class.passthroughCallable(InteractiveObject));
  c.extend(baseClass);

  var p = InteractiveObject.prototype;
  p.requestSoftKeyboard = function () { notImplemented(); };

  c.nativeMethods = p;
  c.makeSimpleNativeAccessors("get", [ "tabEnabled",
                                       "tabIndex",
                                       "focusRect",
                                       "mouseEnabled",
                                       "doubleClickEnabled",
                                       "accessibilityImplementation",
                                       "needsSoftKeyboard",
                                       "contextMenu" ]);
  c.makeSimpleNativeAccessors("set", [ "tabEnabled",
                                       "tabIndex",
                                       "focusRect",
                                       "mouseEnabled",
                                       "doubleClickEnabled",
                                       "accessibilityImplementation",
                                       "needsSoftKeyboard",
                                       "contextMenu" ]);

  return c;
};
