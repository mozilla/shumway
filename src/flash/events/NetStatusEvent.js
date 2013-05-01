var NetStatusEventDefinition = (function () {
  var def = {
    __class__: 'flash.events.NetStatusEvent'
  };

  def.__glue__ = {
    script: {
      instance: {
        info: 'private m_info'
      },

      static: scriptProperties("public", ['NET_STATUS'])
    },

    native: {
      instance: {
        info: {
          get: function () { return this.m_info; }
        }
      }
    }
  };

  return def;
}).call(this);
