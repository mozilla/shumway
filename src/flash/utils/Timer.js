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

var TimerDefinition = (function () {
  var def = {
    __class__: 'flash.utils.Timer',
    initialize: function () {
      this._running = false;
    }
  };

  def.__glue__ = {
    native: {
      instance: {
        running: {
          get: function () {
            return this._running;
          }
        },
        _start: function (delay, closure) {
          this._running = true;
          this.interval = setInterval(closure, delay);
        },
        stop: function () {
          this._running = false;
          clearInterval(this.interval);
        },
        _tick: function () {
          if (!this._running) {
            return;
          }
          this._dispatchEvent(new flash.events.TimerEvent("timer", true, false));
        }
      }
    }
  };

  return def;
}).call(this);
