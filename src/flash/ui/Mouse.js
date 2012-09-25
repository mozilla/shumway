var Mouse = describePrototype({
  cursor: describeAccessor(
    function () {
      return 'auto'; // TODO
    },
    function (val) {
      notImplemented();
    }
  ),
  supportsCursor: describeAccessor(function () {
    return true; // TODO
  }),
  supportsNativeCursor: describeAccessor(function () {
    return true; // TODO
  }),

  hide: describeMethod(function () {
    notImplemented();
  }),
  registerCursor: describeMethod(function (name, cursor) {
    notImplemented();
  }),
  show: describeMethod(function () {
    notImplemented();
  }),
  unregisterCursor: describeMethod(function (name) {
    notImplemented();
  })
});
