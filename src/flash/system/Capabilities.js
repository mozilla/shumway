var CapabilitiesDefinition = (function () {
  var def = {};

  def.__glue__ = {
    native: {
      static: {
        version: {
          get: function version() {
            return 'SHUMWAY 10,0,0,0';
          },
          enumerable: true
        }
      }
    }
  };

  return def;
}).call(this);
