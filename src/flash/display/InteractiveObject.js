function InteractiveObject() {
}

InteractiveObject.prototype = Object.create(new DisplayObject, {
  accessibilityImplementation: describeAccessor(
    function () {
      return -1;
    },
    function (val) {
      notImplemented();
    }
  ),
  contextMenu: describeAccessor(
    function () {
      return null;
    },
    function (val) {
      notImplemented();
    }
  ),
  doubleClickEnabled: describeAccessor(
    function () {
      return false;
    },
    function (val) {
      notImplemented();
    }
  ),
  focusRect: describeAccessor(
    function () {
      return null;
    },
    function (val) {
      notImplemented();
    }
  ),
  mouseEnabled: describeAccessor(
    function () {
      return true;
    },
    function (val) {
      notImplemented();
    }
  ),
  needsSoftKeyboard: describeAccessor(
    function () {
      return false;
    },
    function (val) {
      notImplemented();
    }
  ),
  requestSoftKeyboard: describeMethod(function () {
    notImplemented();
  }),
  softKeyboardInputAreaOfInterest: describeAccessor(
    function () {
      return null;
    },
    function (val) {
      notImplemented();
    }
  ),
  tabEnabled: describeAccessor(
    function () {
      return false;
    },
    function (val) {
      notImplemented();
    }
  ),
  tabIndex: describeAccessor(
    function () {
      return -1;
    },
    function (val) {
      notImplemented();
    }
  )
});
