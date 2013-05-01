var ProgressEventDefinition = (function () {
  var def = {
    __class__: 'flash.events.ProgressEvent'
  };

  def.__glue__ = {
    script: {
      instance: {
      },

      static: {
        PROGRESS: 'public PROGRESS'
      }
    },

    native: {
      instance: {
        text: {
        }
      }
    }
  };

  return def;
}).call(this);
