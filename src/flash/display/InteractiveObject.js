function InteractiveObject() {
  this.tabEnabled = false;
  this.tabIndex = -1;
  this.focusRect = null;
  this.mouseEnabled = true;
  this.doubleClickEnabled = false;
  this.contextMenu = null;
  this.accessibilityImplementation = null;
  this.softKeyboardInputAreaOfInterest = null;
  this.needsSoftKeyboard = false;
}

InteractiveObject.prototype = Object.create(new DisplayObject, {
  requestSoftKeyboard: descMethod(function () {
    notImplemented();
  })
});
