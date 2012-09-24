(function (exports) {
  var Timer = (function () {
    var base = new timer(null, "Total"), top = base;
    function timer(parent, name) {
      this.parent = parent;
      this.timers = {};
      this.name = name;
      this.begin = 0;
      this.last = 0;
      this.total = 0;
      this.count = 0;
    }
    function getTicks() {
      return new Date().getTime();
    }
    timer.prototype.start = function() {
      this.begin = getTicks();
    };
    timer.prototype.stop = function() {
      this.last = getTicks() - this.begin;
      this.total += this.last;
      this.count += 1;
    };
    timer.time = function (name, fn) {
      timer.start(name);
      fn();
      timer.stop();
    };
    timer.start = function (name) {
      top = name in top.timers ? top.timers[name] : top.timers[name] = new timer(top, name);
      top.start();
    };
    timer.stop = function () {
      top.stop();
      top = top.parent;
    };
    timer.prototype.toJSON = function () {
      return {name: this.name, total: this.total, timers: this.timers};
    };
    timer.prototype.trace = function (writer, json) {
      if (json) {
        writer.writeLn("SHUMWAY$JSON " + JSON.stringify({timer: this}));
        return;
      }
      writer.enter(this.name + ": " + this.total + " ms" +
                   ", count: " + this.count +
                   ", average: " + (this.total / this.count).toFixed(2) + " ms");
      for (var name in this.timers) {
        this.timers[name].trace(writer);
      }
      writer.outdent();
    };
    timer.trace = function (writer, json) {
      base.trace(writer, json);
    };
    return timer;
  })();

  /**
   * Quick way to count named events.
   */
  var Counter = (function () {
    function counter(enabled) {
      this.enabled = !!enabled;
      this.counts = {};
    }
    counter.prototype.setEnabled = function (enabled) {
      this.enabled = enabled;
    };
    counter.prototype.toJSON = function () {
      return {counts: this.counts};
    };
    counter.prototype.count = function (name, increment) {
      if (!this.enabled) {
        return;
      }
      increment = increment !== undefined ? increment : 1;
      if (this.counts[name] === undefined) {
        this.counts[name] = 0;
      }
      this.counts[name] += increment;
    };
    counter.prototype.trace = function (writer, json) {
      if (json) {
        writer.writeLn("SHUMWAY$JSON " + JSON.stringify({counter: this}));
        return;
      }
      for (var name in this.counts) {
        writer.writeLn(name + ": " + this.counts[name]);
      }
    };
    return counter;
  })();

  exports.Timer = Timer;
  exports.Counter = Counter;

})(typeof exports === "undefined" ? (metrics = {}) : exports);
