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

var EventDispatcherDefinition = (function () {
  var CUSTOM_DOM_EVENT_PREFIX = 'shumway.';

  var def = {
    __class__: 'flash.events.EventDispatcher',

    initialize: function () {
      this._captureHandlers = { };
      this._control = null;
      this._handlers = { };
    },

    ctor: function (target) {
      this._target = target;
    },
    addEventListener: function (type, listener, useCapture, prio, useWeakReference) {
      if (typeof listener !== 'function')
      if (typeof listener !== 'function' || !type)
        throw ArgumentError();

      if (prio === undefined)
        prio = 0;

      var handlers = useCapture ? this._captureHandlers : this._handlers;
      var handler = handlers[type];

      if (!handler) {
        var target = this;
        handler = {
          queue: [],

          handleEvent: function (evt) {
            if (evt instanceof CustomEvent) {
              var domEvent = evt;
              evt = domEvent.detail;
              evt._eventPhase = domEvent.eventPhase;
            }

            evt._currentTarget = evt._target;

            var queue = this.queue;
            for (var i = 0, n = queue.length; i < n; i++) {
              var entry = queue[i];
              entry.listener(evt);
            }
          }
        };

        if (this._control)
          this._control.addEventListener(CUSTOM_DOM_EVENT_PREFIX + type, handler, useCapture);

        handlers[type] = handler;
      }

      var queue = handler.queue;
      var index = queue.length;
      while (index > 0) {
        var entry = queue[index - 1];

        if (prio < entry.prio)
          break;

        index--;
      }
      queue.splice(index, 0, { listener: listener, prio: prio });
    },
    ctor: function (target) {

    },
    dispatchEvent: function (evt) {
      evt._target = this;

      if (this._control) {
        var domEvent = document.createEvent('CustomEvent');
        domEvent.initCustomEvent(CUSTOM_DOM_EVENT_PREFIX + evt.type, evt.bubbles, evt.cancelable, evt);
        if ($DEBUG) {
          try {
            this._control.dispatchEvent(domEvent);
          } catch (e) {
            log('error ' + e + ', stack: \n' + e.stack);
          }
        } else {
          this._control.dispatchEvent(domEvent);
        }
      } else {
        var handler = this._handlers[evt.type];
        if (handler) {
          if ($DEBUG) {
            try {
              handler.handleEvent(evt);
            } catch (e) {
              log('error ' + e + ', stack: \n' + e.stack);
            }
          } else {
            handler.handleEvent(evt);
          }
        }
      }

      return !!evt.isDefaultPrevented;
    },
    hasEventListener: function (type) {
      return type in this._captureHandlers || type in this._handlers;
    },
    removeEventListener: function (type, listener, useCapture) {
      var handlers = useCapture ? this._captureHandlers : this._handlers;
      var handler = handlers[type];
      if (handler) {
        var queue = handler.queue;
        for (var i = 0; i < queue.length; i++) {
          if (queue[i].listener === listener) {
            queue.splice(i, 1);
            break;
          }
        }
        if (!queue.length) {
          if (this._control)
            this._control.removeEventListener(CUSTOM_DOM_EVENT_PREFIX + type, handler, useCapture);

          delete handlers[type];
        }
      }
    },
    willTrigger: function (type) {
      var dispatcher = this;
      do {
        if (dispatcher.hasEventListener(type))
          return true;
      } while (dispatcher = dispatcher.parent);

      return false;
    }
  };

  def.__glue__ = {
    native: {
      instance: {
        ctor: def.ctor,
        addEventListener: def.addEventListener,
        removeEventListener: def.removeEventListener,
        hasEventListener: def.hasEventListener,
        willTrigger: def.willTrigger,
        dispatchEventFunction: def.dispatchEvent
      }
    }
  };

  return def;
}).call(this);
