var TimerEventDefinition = (function () {
  var def = {
    __class__: 'flash.events.TimerEvent',

    updateAfterEvent: function () {
      notImplemented();
    }
  };

  def.__glue__ = {
    script: {
      static: {
        TIMER: "public TIMER",
        TIMER_COMPLETE: "public TIMER_COMPLETE"
      }
    },

    native: {
      instance: {
        updateAfterEvent: def.updateAfterEvent
      }
    }
  };

  return def;
}).call(this);
