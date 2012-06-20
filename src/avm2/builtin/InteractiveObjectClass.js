natives.InteractiveObjectClass = function InteractiveObjectClass(scope, instance, baseClass) {
  function InteractiveObject() {};
  var c = new Class("InteractiveObject", InteractiveObject, Class.passthroughCallable(InteractiveObject));
  //
  // WARNING! This sets:
  //   InteractiveObject.prototype = Object.create(baseClass.instance.prototype)
  //
  // If you want to manage prototypes manually, do this instead:
  //   c.baseClass = baseClass
  //
  c.extend(baseClass);
  var m = InteractiveObject.prototype;
  var s = {};
  m["get tabEnabled"] = function tabEnabled() { notImplemented("InteractiveObject.tabEnabled"); };
  // Signature: enabled:Boolean -> void
  m["set tabEnabled"] = function tabEnabled(enabled) { notImplemented("InteractiveObject.tabEnabled"); };
  m["get tabIndex"] = function tabIndex() { notImplemented("InteractiveObject.tabIndex"); };
  // Signature: index:int -> void
  m["set tabIndex"] = function tabIndex(index) { notImplemented("InteractiveObject.tabIndex"); };
  m["get focusRect"] = function focusRect() { notImplemented("InteractiveObject.focusRect"); };
  // Signature: focusRect:Object -> void
  m["set focusRect"] = function focusRect(focusRect) { notImplemented("InteractiveObject.focusRect"); };
  m["get mouseEnabled"] = function mouseEnabled() { notImplemented("InteractiveObject.mouseEnabled"); };
  // Signature: enabled:Boolean -> void
  m["set mouseEnabled"] = function mouseEnabled(enabled) { notImplemented("InteractiveObject.mouseEnabled"); };
  m["get doubleClickEnabled"] = function doubleClickEnabled() { notImplemented("InteractiveObject.doubleClickEnabled"); };
  // Signature: enabled:Boolean -> void
  m["set doubleClickEnabled"] = function doubleClickEnabled(enabled) { notImplemented("InteractiveObject.doubleClickEnabled"); };
  m["get accessibilityImplementation"] = function accessibilityImplementation() { notImplemented("InteractiveObject.accessibilityImplementation"); };
  // Signature: value:AccessibilityImplementation -> void
  m["set accessibilityImplementation"] = function accessibilityImplementation(value) { notImplemented("InteractiveObject.accessibilityImplementation"); };
  m["get softKeyboardInputAreaOfInterest"] = function softKeyboardInputAreaOfInterest() { notImplemented("InteractiveObject.softKeyboardInputAreaOfInterest"); };
  // Signature: value:Rectangle -> void
  m["set softKeyboardInputAreaOfInterest"] = function softKeyboardInputAreaOfInterest(value) { notImplemented("InteractiveObject.softKeyboardInputAreaOfInterest"); };
  m["get needsSoftKeyboard"] = function needsSoftKeyboard() { notImplemented("InteractiveObject.needsSoftKeyboard"); };
  // Signature: value:Boolean -> void
  m["set needsSoftKeyboard"] = function needsSoftKeyboard(value) { notImplemented("InteractiveObject.needsSoftKeyboard"); };
  m.requestSoftKeyboard = function requestSoftKeyboard() { notImplemented("InteractiveObject.requestSoftKeyboard"); };
  m["get contextMenu"] = function contextMenu() { notImplemented("InteractiveObject.contextMenu"); };
  // Signature: cm:ContextMenu -> void
  m["set contextMenu"] = function contextMenu(cm) { notImplemented("InteractiveObject.contextMenu"); };
  c.nativeMethods = m;
  c.nativeStatics = s;
  return c;
};