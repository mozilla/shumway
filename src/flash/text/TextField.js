const TextFieldDefinition = (function () {
  var def = {
    __class__: 'flash.text.TextField'
  };

  def.__glue__ = {
    text: {
      get: function () { return this.text; },
      set: function (v) { this.text = v; }
    }
  };

  return def;
}).call(this);
