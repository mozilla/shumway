const TimerEventDefinition = (function () {
  var def = {
    __class__: 'flash.events.TimerEvent',

    updateAfterEvent: function () {
      notImplemented();
    }
  };

  def.__glue__ = {
    scriptStatics: {
      TIMER: "public TIMER",
      TIMER_COMPLETE: "public TIMER_COMPLETE"
    },

    nativeMethods: {
      updateAfterEvent: def.updateAfterEvent
    }
  };

  return def;
}).call(this);
