var TextEventDefinition = (function () {
  var def = {
    __class__: 'flash.events.TextEvent'
  };

  def.__glue__ = {
    script: {
      static: {
        LINK: "public LINK",
        TEXT_INPUT: "public TEXT_INPUT"
      }
    },

    native: {
      instance: {
      }
    }
  };

  return def;
}).call(this);
