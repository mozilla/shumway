const TimerDefinition = (function () {
  var def = {
    __class__: 'flash.utils.Timer',

    initialize: function (delay, repeatCount) {
      this.delay = delay;
      this.repeatCount = repeatCount || 0;
      this.running = false;
    },

    _start: function () {
      if (this.running)
        return;

      var timer = this;
      this.iteration = 0;
      this.running = true;
      this._interval = setInterval(function Timer_tick() {
        timer.iteration++;
        timer._timerDispatch();
        if (timer.repeatCount > 0 && timer.iteration >= timer.repeatCount)
          timer._stop();
      }, this.delay);
    },
    _stop: function () {
      if (!this.running)
        return;

      clearInterval(this._interval);
      this.running = false;

      this.dispatchEvent(new TimerEvent(
        TimerEvent.TIMER_COMPLETE,
        true,
        false));
    },
    _timerDispatch: function () {
      this.dispatchEvent(new TimerEvent(
        TimerEvent.TIMER,
        true,
        false));
    }
  };

  def.__glue__ = {
    instance: {
      running: {
        get: function () { return this.running; }
      },
      _start: def._start,
      _stop: def._stop,
      _timerDispatch: def._timerDispatch
    }
  };

  return def;
}).call(this);
