var TimerDefinition = (function () {
  var def = {
    __class__: 'flash.utils.Timer',
    initialize: function () {
      this.running = false;
      this.private$flash$utils$Timer$m_iteration = 0;
    }
  };

  def.__glue__ = {
    native: {
      instance: {
        running: {
          get: function () {
            return this.running;
          }
        },
        _start: function (delay, closure) {
          this.running = true;
          this.interval = setInterval(closure, delay);
        },
        stop: function () {
          this.running = false;
          clearInterval(this.interval);
        },
        _timerDispatch: function () {
          this.dispatchEvent(new flash.events.TimerEvent("timer", true, false));
        }
      }
    }
  };

  return def;
}).call(this);
