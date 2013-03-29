var ContextMenuDefinition = (function () {
  return {
    // ()
    __class__: "flash.ui.ContextMenu",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
          _checkSupported: function _checkSupported() { // (void) -> Boolean
            notImplemented("ContextMenu._checkSupported");
          }
        },
        instance: {
          cloneLinkAndClipboardProperties: function cloneLinkAndClipboardProperties(c) { // (c:ContextMenu) -> void
            notImplemented("ContextMenu.cloneLinkAndClipboardProperties");
          },
          builtInItems: {
            get: function builtInItems() { // (void) -> ContextMenuBuiltInItems
              notImplemented("ContextMenu.builtInItems");
              return this._builtInItems;
            },
            set: function builtInItems(value) { // (value:ContextMenuBuiltInItems) -> void
              notImplemented("ContextMenu.builtInItems");
              this._builtInItems = value;
            }
          },
          customItems: {
            get: function customItems() { // (void) -> Array
              notImplemented("ContextMenu.customItems");
              return this._customItems;
            },
            set: function customItems(value) { // (value:Array) -> void
              notImplemented("ContextMenu.customItems");
              this._customItems = value;
            }
          },
          link: {
            get: function link() { // (void) -> URLRequest
              notImplemented("ContextMenu.link");
              return this._link;
            },
            set: function link(value) { // (value:URLRequest) -> void
              notImplemented("ContextMenu.link");
              this._link = value;
            }
          },
          clipboardMenu: {
            get: function clipboardMenu() { // (void) -> Boolean
              notImplemented("ContextMenu.clipboardMenu");
              return this._clipboardMenu;
            },
            set: function clipboardMenu(value) { // (value:Boolean) -> void
              notImplemented("ContextMenu.clipboardMenu");
              this._clipboardMenu = value;
            }
          },
          clipboardItems: {
            get: function clipboardItems() { // (void) -> ContextMenuClipboardItems
              notImplemented("ContextMenu.clipboardItems");
              return this._clipboardItems;
            },
            set: function clipboardItems(value) { // (value:ContextMenuClipboardItems) -> void
              notImplemented("ContextMenu.clipboardItems");
              this._clipboardItems = value;
            }
          }
        }
      }
    }
  };
}).call(this);