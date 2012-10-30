const InteractiveObjectDefinition = (function () {
  var def = {
    initialize: function () {
      this._control = document.createElement('div');
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
      return false;
    },
    set doubleClickEnabled(val) {
      notImplemented();
    },
    get focusRect() {
      return null;
    },
    set focusRect(val) {
      notImplemented();
    },
    get mouseEnabled() {
      return true;
    },
    set mouseEnabled(val) {
      // notImplemented();
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

  const desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
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
  };

  return def;
}).call(this);
