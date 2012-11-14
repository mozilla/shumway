var NetConnectionDefinition = (function () {
  var def = {
    connect: function(command /*, ...arguments */) {
      // notImplemented();
    },
    invokeWithArgsArray: function() {
      // notImplemented();
    }
  };

  def.__glue__ = {
    native: {
      instance: {
        connect: def.connect,
        invokeWithArgsArray: def.invokeWithArgsArray
      }
    }
  };

  return def;
}).call(this);
