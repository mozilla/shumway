var FSCommandDefinition = (function () {
  var def = {};

  function fscommand(command, parameters) {
    // TODO ignoring all fscommand
    console.log('FSCommand: ' + command + '; ' + parameters);
  }

  def.__glue__ = {
    native: {
      static: {
        _fscommand: fscommand
      }
    }
  };

  return def;
}).call(this);
