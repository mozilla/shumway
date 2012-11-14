var ResponderDefinition = (function () {
  var def = {
    ctor: function(result, status) {
      // notImplemented();
    }
  };

  def.__glue__ = {
    native: {
      instance: {
        ctor: def.ctor
      }
    }
  };

  return def;
}).call(this);
