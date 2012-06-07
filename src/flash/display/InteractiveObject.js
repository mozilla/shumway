function InteractiveObject() {
}

InteractiveObject.prototype = Object.create(new DisplayObject, {
  accessibilityImplementation: descAccessor(
    function () {
      return -1;
    },
    function (val) {
      notImplemented();
    }
  ),
  contextMenu: descAccessor(
    function () {
      return null;
    },
    function (val) {
      notImplemented();
    }
  ),
  doubleClickEnabled: descAccessor(
    function () {
      return false;
    },
    function (val) {
      notImplemented();
    }
  ),
  focusRect: descAccessor(
    function () {
      return null;
    },
    function (val) {
      notImplemented();
    }
  ),
  mouseEnabled: descAccessor(
    function () {
      return true;
    },
    function (val) {
      notImplemented();
    }
  ),
  needsSoftKeyboard: descAccessor(
    function () {
      return false;
    },
    function (val) {
      notImplemented();
    }
  ),
  requestSoftKeyboard: descMethod(function () {
    notImplemented();
  }),
  softKeyboardInputAreaOfInterest: descAccessor(
    function () {
      return null;
    },
    function (val) {
      notImplemented();
    }
  ),
  tabEnabled: descAccessor(
    function () {
      return false;
    },
    function (val) {
      notImplemented();
    }
  ),
  tabIndex: descAccessor(
    function () {
      return -1;
    },
    function (val) {
      notImplemented();
    }
  )
});
