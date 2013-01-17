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

    replaceText: function(begin, end, str) {
      this._text = this._text.substring(0, begin) + str + this._text.substring(end);
      this._markAsDirty();
    },

    get text() {
      return this._text;
    },
    set text(val) {
      if (this._text !== val) {
        this._text = val;
        this._markAsDirty();
      }
    }
  };

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        text: desc(def, "text"),
        replaceText: def.replaceText,
      }
    }
  };

  return def;
}).call(this);
