var ExternalInterfaceDefinition = (function () {
  var def = {};

  function getAvailable() {
    return false;
  }

  def.__glue__ = {
    native: {
      static: {
        available: { get: getAvailable }
      }
    }
  };

  return def;
}).call(this);
