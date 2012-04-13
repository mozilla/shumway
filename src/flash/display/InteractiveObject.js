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
  var c = new Class("InteractiveObject", InteractiveObject, C(InteractiveObject));
  c.extend(baseClass);

  c.getters = [
    "tabEnabled",
    "tabIndex",
    "focusRect",
    "mouseEnabled",
    "doubleClickEnabled",
    "accessibilityImplementation",
    "needsSoftKeyboard",
    "contextMenu"
  ].reduce(function (getters, prop) {
    getters[prop] = function () {
      return this[prop];
    };
    return getters;
  }, {});

  c.setters = [
    "tabEnabled",
    "tabIndex",
    "focusRect",
    "mouseEnabled",
    "doubleClickEnabled",
    "accessibilityImplementation",
    "needsSoftKeyboard",
    "contextMenu"
  ].reduce(function (setters, prop) {
    setters[prop] = function (v) {
      return this[prop] = v;
    };
    return setters;
  }, {});

  return c;
};
