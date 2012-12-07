var InteractiveObjectDefinition = (function () {
  var def = {
    initialize: function () {
      this._control = document.createElement('div');
      this._doubleClickEnabled = false;
      this._hitArea = null;
      this._mouseEnabled = true;
    },

    get accessibilityImplementation() {
      return null;
    },
    set accessibilityImplementation(val) {
      notImplemented();
    },
    get contextMenu() {
      return null;
    },
    set contextMenu(val) {
      notImplemented();
    },
    get doubleClickEnabled() {
      return this._doubleClickEnabled;
    },
    set doubleClickEnabled(val) {
      this._doubleClickEnabled = val;
    },
    get focusRect() {
      return null;
    },
    set focusRect(val) {
      notImplemented();
    },
    get mouseEnabled() {
      return this._mouseEnabled;
    },
    set mouseEnabled(val) {
      this._mouseEnabled = val;
    },
    get needsSoftKeyboard() {
      return false;
    },
    set needsSoftKeyboard(val) {
      notImplemented();
    },
    get softKeyboardInputAreaOfInterest() {
      return null;
    },
    set softKeyboardInputAreaOfInterest(val) {
      notImplemented();
    },
    get tabEnabled() {
      return false;
    },
    set tabEnabled(val) {
      notImplemented();
    },
    get tabIndex() {
      return -1;
    },

    requestSoftKeyboard: function () {
      notImplemented();
    }
  };

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        tabEnabled: desc(def, "tabEnabled"),
        tabIndex: desc(def, "tabIndex"),
        focusRect: desc(def, "focusRect"),
        mouseEnabled: desc(def, "mouseEnabled"),
        doubleClickEnabled: desc(def, "doubleClickEnabled"),
        accessibilityImplementation: desc(def, "accessibilityImplementation"),
        softKeyboardInputAreaOfInterest: desc(def, "softKeyboardInputAreaOfInterest"),
        needsSoftKeyboard: desc(def, "needsSoftKeyboard"),
        contextMenu: desc(def, "contextMenu"),
        requestSoftKeyboard: def.requestSoftKeyboard
      }
    }
  };

  return def;
}).call(this);
