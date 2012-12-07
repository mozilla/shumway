var FontDefinition = (function () {
  var def = {
    __class__: 'flash.text.Font',

    initialize: function () {
      var s = this.symbol;
      if (s) {
        this._fontName = s.name || null;
      }
    },

    get fontName() {
      return this._fontName;
    },
    get fontStyle() {
      return this._fontStyle;
    },
    get fontType() {
      return this._fontType;
    },
    hasGlyphs: function hasGlyphs(str) {
      return true; // TODO
    },
  };

  function enumerateFonts() {
    return []; // TODO
  }

  function registerFont(font) {
    throw 'Not implemented: registerFont';
  }

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        fontName: desc(def, "fontName"),
        fontStyle: desc(def, "fontStyle"),
        fontType: desc(def, "fontType"),
        hasGlyphs: def.hasGlyphs
      },
      static: {
        enumerateFonts: enumerateFonts,
        registerFont: registerFont
      }
    }
  };

  return def;
}).call(this);
