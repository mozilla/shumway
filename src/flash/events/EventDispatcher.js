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
  function doDispatchEvent(dispatcher, event) {
    var target = dispatcher._target;
    var type = event._type;
    var listeners = dispatcher._listeners[type];

    if (event._bubbles) {
      var ancestors = [];
      var currentNode = target._parent;
      while (currentNode) {
        if (currentNode._hasEventListener(type)) {
          ancestors.push(currentNode);
        }
        currentNode = currentNode._parent;
      }

      if (!listeners && !ancestors.length) {
        return true;
      }

      if (event._target) {
        event = event.clone();
      }

      var keepPropagating = true;

      var i = ancestors.length;
      while (i-- && keepPropagating) {
        var currentTarget = ancestors[i];
        var queue = currentTarget._captureListeners[type];
        keepPropagating =
          processListeners(queue, event, target, currentTarget, 1);
      }

      if (listeners && keepPropagating) {
        keepPropagating = processListeners(listeners, event, target);
      }

      for (var i = 0; i < ancestors.length && keepPropagating; i++) {
        var currentTarget = ancestors[i];
        var queue = currentTarget._listeners[type];
        keepPropagating =
          processListeners(queue, event, target, currentTarget, 3);
      }
    } else if (listeners) {
      if (event._target) {
        event = event.clone();
      }

      processListeners(listeners, event, target);
    }

    return !event._isDefaultPrevented;
  }
  function processListeners(queue, event, target, currentTarget, eventPhase) {
    if (queue) {
      queue = queue.slice();

      event._target = target;
      event._currentTarget = currentTarget || target;
      event._eventPhase = eventPhase || 2;

      for (var i = 0; i < queue.length; i++) {
        var item = queue[i];
        item.handleEvent(event);
        if (event._stopImmediatePropagation) {
          break;
        }
      }
    }

    return !event._stopPropagation;
  }

  return {
    // (target:IEventDispatcher = null)
    __class__: "flash.events.EventDispatcher",
    initialize: function () {
      this._target = this;
      this._listeners = { };
      this._captureListeners = { };
    },
    // We need to be able to cheaply override these in DisplayObject
    _addEventListenerImpl: function addEventListenerImpl(type, listener, useCapture, priority) {
      if (typeof listener !== 'function') {
        throw new ArgumentError();
      }

      var listeners = useCapture ? this._captureListeners : this._listeners;
      var queue = listeners[type];
      var listenerObj = {
        handleEvent: listener,
        priority: priority || 0
      };
      if (queue) {
        var level = queue.length;

        var i = level;
        while (i--) {
          var item = queue[i];

          if (item.handleEvent === listener) {
            return;
          }

          if (priority > item.priority) {
            level = i;
          }
        }

        queue.splice(level, 0, listenerObj);
      } else {
        listeners[type] = [listenerObj];
      }
    },
    _addEventListener: function addEventListener(type, listener, useCapture, priority) {
      this._addEventListenerImpl(type, listener, useCapture, priority);
    },
    _removeEventListenerImpl: function removeEventListenerImpl(type, listener, useCapture) {
      if (typeof listener !== 'function') {
        return;
      }

      var listeners = useCapture ? this._captureListeners : this._listeners;
      var queue = listeners[type];
      if (queue) {
        for (var i = 0; i < queue.length; i++) {
          var item = queue[i];
          if (item.handleEvent === listener) {
            queue.splice(i, 1);
            if (!queue.length) {
              delete listeners[type];
            }
            return;
          }
        }
      }
    },
    _removeEventListener: function removeEventListener(type, listener, useCapture) {
      this._removeEventListenerImpl(type, listener, useCapture);
    },
    _hasEventListener: function hasEventListener(type) { // (type:String) -> Boolean
      return type in this._listeners || type in this._captureListeners;
    },
    _dispatchEvent: function dispatchEvent(event) {
      doDispatchEvent(this, event);
    },

    __glue__: {
      native: {
        instance: {
          ctor: function ctor(target) { // (target:IEventDispatcher) -> void
            this._target = target || this;
          },
          addEventListener: function addEventListener(type, listener, useCapture, priority, useWeakReference) { // (type:String, listener:Function, useCapture:Boolean = false, priority:int = 0, useWeakReference:Boolean = false) -> void
            this._addEventListener(type, listener, useCapture, priority);
          },
          removeEventListener: function removeEventListener(type, listener, useCapture) { // (type:String, listener:Function, useCapture:Boolean = false) -> void
            this._removeEventListener(type, listener, useCapture);
          },
          hasEventListener: function hasEventListener(type) { // (type:String) -> Boolean
            return this._hasEventListener(type);
          },
          willTrigger: function willTrigger(type) { // (type:String) -> Boolean
            var currentNode = this._target;
            do {
              if (currentNode._hasEventListener(type)) {
                return true;
              }
            } while ((currentNode = currentNode._parent));

            return false;
          },
          dispatchEventFunction: function dispatchEventFunction(event) {
            doDispatchEvent(this, event);
          }
        }
      }
    }
  };
}).call(this);
