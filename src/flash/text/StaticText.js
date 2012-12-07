var StaticTextDefinition = (function () {
  var def = {
    __class__: 'flash.text.StaticText',

    initialize: function () {
      var s = this.symbol;
      if (s) {
        this.draw = s.draw || null;
      }
    },

    get text() {
      return this._text;
    },
    set text(val) {
      this._text = val;
    }
  };

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        text: desc(def, "text")
      }
    }
  };

  return def;
}).call(this);
