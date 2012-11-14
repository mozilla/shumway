var TextFieldDefinition = (function () {
  var def = {
    __class__: 'flash.text.TextField',

    initialize: function () {
      var s = this.symbol;
      if (s) {
        this.draw = s.draw || null;
        this.text = s.text || '';
      }
    },

    _getAS2Object: function () {
      if (!this.$as2Object) {
        new AS2TextField().$attachNativeObject(this);
      }
      return this.$as2Object;
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
