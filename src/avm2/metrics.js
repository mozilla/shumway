/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function (exports) {
  var Timer = (function () {
    var base = new timer(null, "Total"), top = base;
    var flat = new timer(null, "Flat"), flatStack = [];
    function timer(parent, name) {
      this.parent = parent;
      this.timers = {};
      this.name = name;
      this.begin = 0;
      this.last = 0;
      this.total = 0;
      this.count = 0;
    }
    timer.flat = flat;
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

      var tmp = name in flat.timers ? flat.timers[name] : flat.timers[name] = new timer(flat, name);
      tmp.start();
      flatStack.push(tmp);
    };
    timer.stop = function () {
      top.stop();
      top = top.parent;

      flatStack.pop().stop();
    };
    timer.stopStart = function (name) {
      Timer.stop();
      Timer.start(name);
    },
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
      flat.trace(writer, json);
    };
    return timer;
  })();

  /**
   * Quick way to count named events.
   */
  var Counter = (function () {
    function counter(enabled) {
      this.enabled = !!enabled;
      this.counts = createEmptyObject();
    }
    counter.prototype.setEnabled = function (enabled) {
      this.enabled = enabled;
    };
    counter.prototype.clear = function () {
      this.counts = {};
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
      return this.counts[name];
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
    counter.prototype.traceSorted = function (writer) {
      var pairs = [];
      for (var name in this.counts) {
        pairs.push([name, this.counts[name]]);
      }
      pairs.sort(function (a, b) {
        return b[1] - a[1];
      })
      pairs.forEach(function (pair) {
        writer.writeLn(pair[0] + ": " + pair[1]);
      });
    };
    return counter;
  })();

  exports.Timer = Timer;
  exports.Counter = Counter;

})(typeof exports === "undefined" ? (metrics = {}) : exports);
