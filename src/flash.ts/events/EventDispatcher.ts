/**
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations undxr the License.
 */
// Class: EventDispatcher
module Shumway.AVM2.AS.flash.events {
  import AVM2 = Shumway.AVM2.Runtime.AVM2;
  import notImplemented = Shumway.Debug.notImplemented;
  import createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;
  import isString = Shumway.isString;

  import throwError = Shumway.AVM2.Runtime.throwError;

  export class EventDispatcher extends ASNative implements IEventDispatcher {

    /**
     * Dictionary of all mouse events with the event type as key and value specifying if bubbling is enabled.
     */
    private static _mouseEvents: any;

    // Called whenever the class is initialized.
    static classInitializer: any = function () {
      EventDispatcher._mouseEvents = {
        click:            true,
        contextMenu:      true,
        doubleClick:      true,
        middleClick:      true,
        middleMouseDown:  true,
        middleMouseUp:    true,
        mouseDown:        true,
        mouseMove:        true,
        mouseOut:         true,
        mouseOver:        true,
        mouseUp:          true,
        mouseWheel:       true,
        releaseOutside:   true,
        rightClick:       true,
        rightMouseDown:   true,
        rightMouseUp:     true,
        rollOut:          false,
        rollOver:         false
      };
    };

    private static doDispatchEvent(dispatcher, event, eventClass?, bubbles?): boolean {
      var target = dispatcher._target;
      var type = event._type || event;
      var listeners = dispatcher._listeners[type];

      if (bubbles || (isString(event) && EventDispatcher._mouseEvents[event]) || event._bubbles) {
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
        var keepPropagating = true;
        var i = ancestors.length;
        while (i-- && keepPropagating) {
          var currentTarget = ancestors[i];
          var queue = currentTarget._captureListeners[type];
          keepPropagating = EventDispatcher.processListeners(queue, event, eventClass, bubbles, target, currentTarget, 1);
        }
        if (listeners && keepPropagating) {
          keepPropagating = EventDispatcher.processListeners(listeners, event, eventClass, bubbles, target);
        }

        for (var i = 0; i < ancestors.length && keepPropagating; i++) {
          var currentTarget = ancestors[i];
          var queue = currentTarget._listeners[type];
          keepPropagating = EventDispatcher.processListeners(queue, event, eventClass, bubbles, target, currentTarget, 3);
        }
      } else if (listeners) {
        EventDispatcher.processListeners(listeners, event, eventClass, bubbles, target);
      }

      return !event._isDefaultPrevented;
    }

    private static processListeners(queue, event, eventClass, bubbles, target, currentTarget?, eventPhase?) {
      if (queue) {
        queue = queue.slice();

        var needsInit = true;

        try {
          for (var i = 0; i < queue.length; i++) {
            var item = queue[i];

            var methodInfo = item.handleEvent.methodInfo;
            if (methodInfo) {
              if (methodInfo.parameters.length) {
                if (!methodInfo.parameters[0].isUsed) {
                  item.handleEvent();
                  continue;
                }
              }
            }

            if (needsInit) {
              if (typeof event === 'string') {
                if (eventClass) {
                  event = new eventClass(event);
                } else {
                  if (EventDispatcher._mouseEvents[event]) {
                    event = new flash.events.MouseEvent(event, EventDispatcher._mouseEvents[event]);
                    if (target._stage) {
                      event._localX = target.mouseX;
                      event._localY = target.mouseY;
                    }
                  } else {
                    event = new flash.events.Event(event);
                  }
                }
              } else if (event._target) {
                event = event.clone();
              }

              event._target = target;
              event._currentTarget = currentTarget || target;
              event._eventPhase = eventPhase || 2;

              needsInit = false;
            }

            item.handleEvent(event);
            if (event._stopImmediatePropagation) {
              break;
            }
          }
        } catch (e) {
          AVM2.instance.exceptions.push({
            source: 'avm2',
            message: e.message,
            stack: e.stack
          });
          throw e;
        }
      }

      return !event._stopPropagation;
    }

    private _target: flash.events.IEventDispatcher;
    private _listeners: any;
    private _captureListeners: any;

    // Called whenever an instance of the class is initialized.
    static initializer: any = function () {
      var self: EventDispatcher = this;
      self._target = self;
      self._listeners = createEmptyObject();
      self._captureListeners = createEmptyObject();
    };

    // List of static symbols to link.
    static staticBindings: string [] = null; // [];

    // List of instance symbols to link.
    static bindings: string [] = null; // ["toString", "dispatchEvent"];

    constructor (target: flash.events.IEventDispatcher = null) {
      target = target;
      false && super();
      notImplemented("Dummy Constructor: public flash.events.EventDispatcher");
    }

    // JS -> AS Bindings

    dispatchEvent: (event: flash.events.Event) => boolean;

    // AS -> JS Bindings

    private _addEventListenerImpl(type, listener, useCapture, priority) {
      if (typeof listener !== 'function') {
        // TODO: The Player unevals the `listener`. To some extend, we could, too
        throwError("TypeError", Errors.CheckTypeFailedError, listener, "Function");
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
    }

    _addEventListener(type, listener, useCapture, priority) {
      this._addEventListenerImpl(type, listener, useCapture, priority);
    }

    _removeEventListenerImpl(type, listener, useCapture) {
      if (typeof listener !== 'function') {
        // TODO: The Player unevals the `listener`. To some extend, we could, too
        throwError("TypeError", Errors.CheckTypeFailedError, listener, "Function");
      }

      var listeners = useCapture ? this._captureListeners : this._listeners;
      var queue = listeners[type];
      if (queue) {
        for (var i = 0; i < queue.length; i++) {
          var item = queue[i];
          if (item.handleEvent === listener) {
            queue.splice(i, 1);
            if (!queue.length) {
              listeners[type] = null;
            }
            return;
          }
        }
      }
    }

    _removeEventListener(type, listener, useCapture) {
      this._removeEventListenerImpl(type, listener, useCapture);
    }

    _hasEventListener(type) { // (type:String) -> Boolean
      return this._listeners[type] || this._captureListeners[type];
    }

    _dispatchEvent(event, eventClass, bubbles) {
      EventDispatcher.doDispatchEvent(this, event, eventClass, bubbles);
    }

    private eventDispatcher_ctor(target: flash.events.IEventDispatcher): void {
      target = target;
      notImplemented("public flash.events.EventDispatcher::ctor"); return;
    }

    addEventListener(type: string, listener: ASFunction, useCapture: boolean = false, priority: number /*int*/ = 0, useWeakReference: boolean = false): void {
      type = "" + type; listener = listener; useCapture = !!useCapture; priority = priority | 0; useWeakReference = !!useWeakReference;
      this._addEventListener(type, listener, useCapture, priority);
    }

    removeEventListener(type: string, listener: ASFunction, useCapture: boolean = false): void {
      type = "" + type; listener = listener; useCapture = !!useCapture;
      this._removeEventListener(type, listener, useCapture);
    }

    hasEventListener(type: string): boolean {
      type = "" + type;
      return this._hasEventListener(type);
    }

    willTrigger(type: string): boolean {
      type = "" + type;
      var currentNode = this._target;
      do {
        if (currentNode._hasEventListener(type)) {
          return true;
        }
      } while ((currentNode = currentNode._parent));
      return false;
    }

    dispatchEventFunction(event: flash.events.Event): boolean {
      return EventDispatcher.doDispatchEvent(this, event);
    }
  }
}
