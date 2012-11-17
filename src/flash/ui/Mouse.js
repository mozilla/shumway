var MouseDefinition = (function() {

  var def = {
    __class__: 'flash.ui.Mouse'
  };

  function hide() {
    notImplemented();
  }

  function show() {
    notImplemented();
  }

  function registerCursor() {
    notImplemented();
  }

  function unregisterCursor() {
    notImplemented();
  }

  def.__glue__ = {
    native: {
      static: {
        cursor: {
          get: function () { return 'auto'; }, //TODO
          set: function () { notImplemented(); }
        },

        supportsCursor: {
          get: function () { return true; } // TODO
        },
        supportsNativeCursor: {
          get: function () { return true; } // TODO
        },

        hide: hide,
        show: show,
        registerCursor: registerCursor,
        unregisterCursor: unregisterCursor
      },
    },
  };

  return def;
}).call(this);
