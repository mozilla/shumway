var ContextMenuItemDefinition = (function () {
  return {
    // (caption:String, separatorBefore:Boolean = false, enabled:Boolean = true, visible:Boolean = true)
    __class__: "flash.ui.ContextMenuItem",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
          caption: {
            get: function caption() { // (void) -> String
              somewhatImplemented("ContextMenuItem.caption");
              return this._caption;
            },
            set: function caption(value) { // (value:String) -> void
              somewhatImplemented("ContextMenuItem.caption");
              this._caption = value;
            }
          },
          separatorBefore: {
            get: function separatorBefore() { // (void) -> Boolean
              somewhatImplemented("ContextMenuItem.separatorBefore");
              return this._separatorBefore;
            },
            set: function separatorBefore(value) { // (value:Boolean) -> void
              somewhatImplemented("ContextMenuItem.separatorBefore");
              this._separatorBefore = value;
            }
          },
          visible: {
            get: function visible() { // (void) -> Boolean
              somewhatImplemented("ContextMenuItem.visible");
              return this._visible;
            },
            set: function visible(value) { // (value:Boolean) -> void
              somewhatImplemented("ContextMenuItem.visible");
              this._visible = value;
            }
          }
        }
      }
    }
  };
}).call(this);