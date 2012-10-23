const TextFieldDefinition = (function () {
  var def = {
    __class__: 'flash.text.TextField',

    initialize: function () {
      var s = this.symbol;
      if (s) {
        this.draw = s.draw || null;
        this.text = s.text || '';
      }
    },

    get text() {
      return this._text;
    },
    set text(val) {
      this._text = val;
    }
  };

  const desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        text: desc(def, "text")
      }
    }
  };

  return def;
}).call(this);
