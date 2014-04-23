/**
 * Copyright 2014 Mozilla Foundation
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
 * limitations under the License.
 */
// Class: EventDispatcher
module Shumway.AVM2.AS.flash.events {
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;
  import isFunction = Shumway.isFunction;

  import throwError = Shumway.AVM2.Runtime.throwError;

  class EventListenerEntry {
    constructor(public listener: EventHandler, public useCapture: boolean, public priority: number)
    {
    }
  }

  /**
   * Implements Copy-On-Write for event listener lists. Event handlers can add and/or remove
   * event handlers while the events are processed. The easiest way to implement this is to
   * clone the event listener list before executing the event listeners. This however can be
   * wasteful, since most of the time, event handlers don't mutate the event list. Here we
   * implement a simple copy-on-write strategy that clones the entry list if it's been
   * snapshotted and it's about to be mutated.
   */

  class EventListenerList {
    private _entries: EventListenerEntry [];

    /**
     * Indicates whether the current entry list has been aliased (or snapshotted).
     */
    private _aliased = false;

    constructor() {
      this._entries = [];
    }

    isEmpty(): boolean {
      return this._entries.length === 0;
    }

    insert(listener: EventHandler, useCapture: boolean, priority: number) {
      var entries = this._entries;
      var index = entries.length;
      for (var i = index - 1; i >= 0; i--) {
        var entry = entries[i];
        if (entry.listener === listener) {
          return;
        }
        if (priority > entry.priority) {
          index = i;
        } else {
          break;
        }
      }
      this.ensureNonAliasedEntries().splice(index, 0,
                                            new EventListenerEntry(listener, useCapture, priority));
    }

    /**
     * Make sure we get a fresh list if it's been aliased.
     */
    private ensureNonAliasedEntries(): EventListenerEntry [] {
      var entries = this._entries;
      if (this._aliased) {
        entries = this._entries = entries.slice();
        this._aliased = false;
      }
      return entries;
    }

    remove(listener: EventHandler) {
      var entries = this._entries;
      for (var i = 0; i < entries.length; i++) {
        var item = entries[i];
        if (item.listener === listener) {
          this.ensureNonAliasedEntries().splice(i, 1);
          return;
        }
      }
    }

    /**
     * Get a snapshot of the current entry list.
     */
    snapshot(): EventListenerEntry [] {
      this._aliased = true;
      return this._entries;
    }

    /**
     * Release the snapshot, hopefully no other mutations occured so we can reuse the entry list.
     */
    releaseSnapshot(snapshot) {
      if (this._aliased && this._entries === snapshot) {
        this._aliased = false;
      }
    }
  }

  /**
   * The EventDispatcher class is the base class for all classes that dispatch events.
   * The EventDispatcher class implements the IEventDispatcher interface and is the base class for
   * the DisplayObject class. The EventDispatcher class allows any object on the display list to be
   * an event target and as such, to use the methods of the IEventDispatcher interface.
   */
  export class EventDispatcher extends ASNative implements IEventDispatcher {

    /**
     * Dictionary of all mouse events with the event type as key and value specifying if bubbling
     * is enabled.
     */
    private static _mouseEvents: any;

    // Called whenever the class is initialized.
    static classInitializer: any = function () {
      EventDispatcher._mouseEvents = {
        click: true,
        contextMenu: true,
        doubleClick: true,
        middleClick: true,
        middleMouseDown: true,
        middleMouseUp: true,
        mouseDown: true,
        mouseMove: true,
        mouseOut: true,
        mouseOver: true,
        mouseUp: true,
        mouseWheel: true,
        releaseOutside: true,
        rightClick: true,
        rightMouseDown: true,
        rightMouseUp: true,
        rollOut: false,
        rollOver: false
      };
    };

    private _target: flash.events.IEventDispatcher;

    /*
     * Keep two lists of listeners, one for capture events and one for all others.
     */
    private _captureListeners: Shumway.Map<EventListenerList>;
    private _targetOrBubblingListeners: Shumway.Map<EventListenerList>;

    // Called whenever an instance of the class is initialized.
    static initializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];

    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["toString", "dispatchEvent"];

    constructor(target: flash.events.IEventDispatcher = null) {
      false && super();
      this._target = target || this;
      this._captureListeners = null;
      this._targetOrBubblingListeners = null;
    }

    /**
     * Lazily construct listeners lists to avoid object allocation.
     */
    private getListeners(useCapture: boolean): Shumway.Map<EventListenerList> {
      if (useCapture) {
        return this._captureListeners || (this._captureListeners = createEmptyObject());
      }
      return this._targetOrBubblingListeners ||
             (this._targetOrBubblingListeners = createEmptyObject());
    }

    addEventListener(type: string, listener: EventHandler, useCapture: boolean = false,
                     priority: number /*int*/ = 0, useWeakReference: boolean = false): void
    {
      // The error message always says "2", even though up to five arguments are valid.
      if (arguments.length < 2 || arguments.length > 5) {
        throwError("ArgumentError", Errors.WrongArgumentCountError,
                   "flash.events::EventDispatcher/addEventListener()", 2, arguments.length);
      }
      // The type of `listener` is checked before that of `type`.
      if (!isFunction(listener)) {
        // TODO: The Player unevals the `listener`. To some extend, we could, too.
        throwError("TypeError", Errors.CheckTypeFailedError, listener, "Function");
      }
      if (type === undefined || type === null) {
        throwError("TypeError", Errors.NullPointerError, "type");
      }
      type = asCoerceString(type);
      useCapture = !!useCapture;
      priority |= 0;
      useWeakReference = !!useWeakReference;
      var listeners = this.getListeners(useCapture);
      var list = listeners[type] || (listeners[type] = new EventListenerList());
      list.insert(listener, useCapture, priority);
    }

    removeEventListener(type: string, listener: EventHandler, useCapture: boolean = false): void {
      // The error message always says "2", even though 3 arguments are valid.
      if (arguments.length < 2 || arguments.length > 3) {
        throwError("ArgumentError", Errors.WrongArgumentCountError,
                   "flash.events::EventDispatcher/removeEventListener()", 2, arguments.length);
      }
      // The type of `listener` is checked before that of `type`.
      if (!isFunction(listener)) {
        // TODO: The Player unevals the `listener`. To some extend, we could, too.
        throwError("TypeError", Errors.CheckTypeFailedError, listener, "Function");
      }
      if (type === undefined || type === null) {
        throwError("TypeError", Errors.NullPointerError, "type");
      }
      type = asCoerceString(type);
      var listeners = this.getListeners(!!useCapture);
      var list = listeners[type];
      if (list) {
        list.remove(listener);
        if (list.isEmpty()) {
          listeners[type] = null;
        }
      }
    }

    hasEventListener(type: string): boolean {
      if (arguments.length !== 1) {
        throwError("ArgumentError", Errors.WrongArgumentCountError,
                   "flash.events::EventDispatcher/hasEventListener()", 1, arguments.length);
      }
      if (type === undefined || type === null) {
        throwError("TypeError", Errors.NullPointerError, "type");
      }
      type = asCoerceString(type);
      return !!(this._targetOrBubblingListeners[type] || this._captureListeners[type]);
    }

    willTrigger(type: string): boolean {
      if (arguments.length !== 1) {
        throwError("ArgumentError", Errors.WrongArgumentCountError,
                   "flash.events::EventDispatcher/hasEventListener()", 1, arguments.length);
      }
      if (type === undefined || type === null) {
        throwError("TypeError", Errors.NullPointerError, "type");
      }
      type = asCoerceString(type);
      if (this.hasEventListener(type)) {
        return true;
      }
      if (flash.display.DisplayObject.class.isType(this)) {
        var node: flash.display.DisplayObject = (<flash.display.DisplayObject>this)._parent;
        do {
          if (node.hasEventListener(type)) {
            return true;
          }
        } while ((node = node._parent));
      }
      return false;
    }

    public dispatchEvent(event: Event): boolean {
      if (arguments.length !== 1) {
        throwError("ArgumentError", Errors.WrongArgumentCountError,
                   "flash.events::EventDispatcher/hasEventListener()", 1, arguments.length);
      }
      if (event._target) {
        event = event.clone();
      }

      var type = event._type;
      var target = this._target;

      /**
       * 1. Capturing Phase
       */

      var keepPropagating = true;
      var ancestors: flash.display.DisplayObject [] = [];

      if (event.bubbles && flash.display.DisplayObject.class.isType(this)) {
        var node: flash.display.DisplayObject = (<flash.display.DisplayObject>this)._parent;

        // Gather all parent display objects that have event listeners for this event type.
        while (node) {
          if (node.hasEventListener(type)) {
            ancestors.push(node)
          }
          node = node._parent;
        }

        for (var i = ancestors.length - 1; i >= 0 && keepPropagating; i--) {
          var ancestor = ancestors[i];
          var list = ancestor.getListeners(true)[type];
          assert(list);
          keepPropagating = EventDispatcher.callListeners(list, event, target, ancestor,
                                                          EventPhase.CAPTURING_PHASE);
        }
      }

      /**
       * 2. At Target
       */

      if (keepPropagating) {
        var list = this.getListeners(false)[type];
        if (list) {
          keepPropagating = EventDispatcher.callListeners(this.getListeners(false)[type], event,
                                                          target, target, EventPhase.AT_TARGET);
        }
      }

      /**
       * 3. Bubbling Phase
       */
      if (keepPropagating && event.bubbles) {
        for (var i = 0; i < ancestors.length && keepPropagating; i++) {
          var ancestor = ancestors[i];
          var list = ancestor.getListeners(false)[type];
          keepPropagating = EventDispatcher.callListeners(list, event, target, ancestor,
                                                          EventPhase.BUBBLING_PHASE);
        }
      }

      return !event._isDefaultPrevented;
    }

    private static callListeners(list: EventListenerList, event: Event, target: IEventDispatcher,
                                 currentTarget: IEventDispatcher, eventPhase: number)
    {
      var snapshot = list.snapshot();
      for (var i = 0; i < snapshot.length; i++) {
        var entry = snapshot[i];
        event._target = target;
        event._currentTarget = currentTarget;
        event._eventPhase = eventPhase;
        entry.listener(event);
        if (event._stopImmediatePropagation) {
          break;
        }
      }
      list.releaseSnapshot(snapshot);
      return !event._stopPropagation;
    }
  }
}
