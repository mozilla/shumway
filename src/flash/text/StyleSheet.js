var StyleSheetDefinition = (function () {
  return {
    // ()
    __class__: "flash.text.StyleSheet",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
          _update: function _update() { // (void) -> void
            somewhatImplemented("StyleSheet._update");
          },
          _parseCSSInternal: function _parseCSSInternal(cssText) { // (cssText:String) -> Object
            somewhatImplemented("StyleSheet._parseCSSInternal");
            return null;
          },
          _parseCSSFontFamily: function _parseCSSFontFamily(fontFamily) { // (fontFamily:String) -> String
            notImplemented("StyleSheet._parseCSSFontFamily");
          },
          _parseColor: function _parseColor(color) { // (color:String) -> uint
            notImplemented("StyleSheet._parseColor");
          },
          _styles: {
            get: function _styles() { // (void) -> Object
              return this.__styles;
            },
            set: function _styles(styles) { // (styles:Object) -> void
              somewhatImplemented("StyleSheet._styles");
              this.__styles = styles;
            }
          }
        }
      }
    }
  };
}).call(this);
