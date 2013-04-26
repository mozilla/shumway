var IOErrorEventDefinition = (function () {
  var def = {
    __class__: 'flash.events.IOErrorEvent'
  };

  def.__glue__ = {
    script: {
      instance: {
        text: 'private m_text'
      },

      static: {
        IO_ERROR:        'public IO_ERROR'
      }
    },

    native: {
      instance: {
        text: {
          get: function () { return this.text; }
        }
      }
    }
  };

  return def;
}).call(this);
