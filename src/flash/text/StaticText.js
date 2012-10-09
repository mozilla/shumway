const StaticTextDefinition = (function () {
  var def = {
    __class__: 'flash.text.StaticText'
  };

  def.__glue__ = {
    text: {
      get: function () { return this.text; },
      set: function (v) { this.text = v; }
    }
  };

  return def;
}).call(this);
