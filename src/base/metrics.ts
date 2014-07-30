/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2014 Mozilla Foundation
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

///<reference path='references.ts' />
module Shumway.Metrics {
  export class Timer {
    private static _base: Timer = new Timer(null, "Total");
    private static _top = Timer._base;
    private static _flat = new Timer(null, "Flat");
    private static _flatStack = [];
    private _parent: Timer;
    private _name: string;
    private _begin: number;
    private _last: number;
    private _total: number;
    private _count: number;
    private _timers: Map<Timer>;
    constructor(parent: Timer, name: string) {
      this._parent = parent;
      this._timers = ObjectUtilities.createMap<Timer>();
      this._name = name;
      this._begin = 0;
      this._last = 0;
      this._total = 0;
      this._count = 0;
    }
    public static time(name, fn: Function) {
      Timer.start(name);
      fn();
      Timer.stop();
    }
    public static start(name) {
      Timer._top = Timer._top._timers[name] || (Timer._top._timers[name] = new Timer(Timer._top, name));
      Timer._top.start();
      var tmp = Timer._flat._timers[name] || (Timer._flat._timers[name] = new Timer(Timer._flat, name));
      tmp.start();
      Timer._flatStack.push(tmp);
    }
    public static stop() {
      Timer._top.stop();
      Timer._top = Timer._top._parent;
      Timer._flatStack.pop().stop();
    }
    public static stopStart(name) {
      Timer.stop();
      Timer.start(name);
    }
    public start() {
      this._begin = getTicks();
    }
    public stop() {
      this._last = getTicks() - this._begin;
      this._total += this._last;
      this._count += 1;
    }
    public toJSON() {
      return {name: this._name, total: this._total, timers: this._timers};
    }
    public trace(writer: IndentingWriter) {
      writer.enter (
        this._name + ": " + this._total.toFixed(2) + " ms" +
        ", count: " + this._count +
        ", average: " + (this._total / this._count).toFixed(2) + " ms"
      );
      for (var name in this._timers) {
        this._timers[name].trace(writer);
      }
      writer.outdent();
    }
    public static trace(writer: IndentingWriter) {
      Timer._base.trace(writer);
      Timer._flat.trace(writer);
    }
  }

  /**
   * Quick way to count named events.
   */
  export class Counter {
    public static instance: Counter = new Counter(true);

    private _enabled: boolean;
    private _counts: Map<number>;
    private _times: Map<number>;
    get counts(): Map<number> {
      return this._counts;
    }
    constructor(enabled: boolean) {
      this._enabled = enabled;
      this.clear();
    }
    public setEnabled(enabled:boolean) {
      this._enabled = enabled;
    }
    public clear() {
      this._counts = ObjectUtilities.createMap<number>();
      this._times = ObjectUtilities.createMap<number>();
    }
    public toJSON() {
      return {
        counts: this._counts,
        times: this._times
      };
    }
    public count(name: string, increment: number = 1, time: number = 0) {
      if (!this._enabled) {
        return;
      }
      if (this._counts[name] === undefined) {
        this._counts[name] = 0;
        this._times[name] = 0;
      }
      this._counts[name] += increment;
      this._times[name] += time;
      return this._counts[name];
    }
    public trace(writer: IndentingWriter) {
      for (var name in this._counts) {
        writer.writeLn(name + ": " + this._counts[name]);
      }
    }
    public toStringSorted(): string {
      var times = this._times;
      var pairs = [];
      for (var name in this._counts) {
        pairs.push([name, this._counts[name]]);
      }
      pairs.sort(function (a, b) {
        return b[1] - a[1];
      });
      return (pairs.map(function (pair) {
        var name = pair[0];
        var count = pair[1];
        var time = times[name];
        var line = name + ": " + count;
        if (time) {
          line += ", " + time.toFixed(4);
          if (count > 1) {
            line += " (" + (time / count).toFixed(4) + ")";
          }
        }
        return line;
      }).join(", "));
    }
    public traceSorted(writer: IndentingWriter, inline = false) {
      var times = this._times;
      var pairs = [];
      for (var name in this._counts) {
        pairs.push([name, this._counts[name]]);
      }
      pairs.sort(function (a, b) {
        return b[1] - a[1];
      });
      if (inline) {
        writer.writeLn(pairs.map(function (pair) {
          return (pair[0] + ": " + pair[1]);
        }).join(", "));
      } else {
        pairs.forEach(function (pair) {
          var name = pair[0];
          var count = pair[1];
          var time = times[name];
          var line = name + ": " + count;
          if (time) {
            line += ", " + time.toFixed(4);
            if (count > 1) {
              line += " (" + (time / count).toFixed(4) + ")";
            }
          }
          writer.writeLn(line);
        });
      }
    }
  }

  export class Average {
    private _samples: Float64Array;
    private _count: number;
    private _index: number;
    constructor(max) {
      this._samples = new Float64Array(max);
      this._count = 0;
      this._index = 0;
    }
    public push(sample: number) {
      if (this._count < this._samples.length) {
        this._count ++;
      }
      this._index ++;
      this._samples[this._index % this._samples.length] = sample;
    }
    public average(): number {
      var sum = 0;
      for (var i = 0; i < this._count; i++) {
        sum += this._samples[i];
      }
      return sum / this._count;
    }
  }
}

