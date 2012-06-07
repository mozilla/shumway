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
    };
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
    timer.prototype.trace = function (writer) {
      writer.enter(this.name + ": " + this.total + " ms" +
                   ", count: " + this.count +
                   ", average: " + (this.total / this.count).toFixed(2) + " ms");
      for (var name in this.timers) {
        this.timers[name].trace(writer);
      }
      writer.outdent();
    };
    timer.trace = function (writer) {
      base.trace(writer);
    };
    return timer;
  })();

  exports.Timer = Timer;

})(typeof exports === "undefined" ? (metrics = {}) : exports);
