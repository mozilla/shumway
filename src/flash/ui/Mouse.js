function Mouse() {
}

Object.defineProperties(Mouse, {
  cursor: descAccessor(
    function () {
      return 'auto'; // TODO
    },
    function (val) {
      notImplemented();
    }
  ),
  hide: descMethod(function () {
    notImplemented();
  }),
  registerCursor: descMethod(function (name, cursor) {
    notImplemented();
  }),
  show: descMethod(function () {
    notImplemented();
  }),
  supportsCursor: descAccessor(function () {
    return true; // TODO
  }),
  supportsNativeCursor: descAccessor(function () {
    return true; // TODO
  }),
  unregisterCursor: descMethod(function (name) {
    notImplemented();
  })
});
