const StaticTextDefinition = (function () {
  var def = {
    __class__: 'flash.text.StaticText',

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
