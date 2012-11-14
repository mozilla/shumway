var SoundMixerDefinition = (function () {
  var def = {};

  function stopAll() {
    // TODO stop all sounds
  }

  def.__glue__ = {
    native: {
      static: {
        stopAll: stopAll
      }
    }
  };

  return def;
}).call(this);
