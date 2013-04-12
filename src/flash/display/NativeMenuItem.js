var NativeMenuItemDefinition = (function () {
  return {
    // ()
    __class__: "flash.display.NativeMenuItem",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
          enabled: {
            get: function enabled() { // (void) -> Boolean
              somewhatImplemented("NativeMenuItem.enabled");
              return this._enabled;
            },
            set: function enabled(isSeparator) { // (isSeparator:Boolean) -> void
              somewhatImplemented("NativeMenuItem.enabled");
              this._enabled = isSeparator;
            }
          }
        }
      }
    }
  };
}).call(this);