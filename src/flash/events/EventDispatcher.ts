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
  import isNullOrUndefined = Shumway.isNullOrUndefined;
  import throwError = Shumway.AVM2.Runtime.throwError;
  import assert = Shumway.Debug.assert;

  class EventListenerEntry {
    constructor(public listener: EventHandler, public useCapture: boolean, public priority: number) {
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
     * The number of times the current entry list has been aliased (or snapshotted).
     */
    private _aliasCount = 0;

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
      entries = this.ensureNonAliasedEntries();
      entries.splice(index, 0, new EventListenerEntry(listener, useCapture, priority));
    }

    /**
     * Make sure we get a fresh list if it's been aliased.
     */
    private ensureNonAliasedEntries(): EventListenerEntry [] {
      var entries = this._entries;
      if (this._aliasCount > 0) {
        entries = this._entries = entries.slice();
        this._aliasCount = 0;
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
      this._aliasCount ++;
      return this._entries;
    }

    /**
     * Release the snapshot, hopefully no other mutations occured so we can reuse the entry list.
     */
    releaseSnapshot(snapshot) {
      // We ignore any non current snapshots.
      if (this._entries !== snapshot) {
        return;
      }
      if (this._aliasCount > 0) {
        this._aliasCount --;
      }
    }
  }

  /**
   * Broadcast Events
   *
   * The logic here is pretty much copied from: http://www.senocular.com/flash/tutorials/orderofoperations/
   */
  export class BroadcastEventDispatchQueue {
    /**
     * The queues start off compact but can have null values if event targets are removed. Periodically we
     * compact them if too many null values exist.
     */
    private _queues: Shumway.Map<EventDispatcher []>;

    constructor() {
      this.reset();
    }

    reset() {
      this._queues = Shumway.ObjectUtilities.createEmptyObject();
    }

    add(type: string, target: EventDispatcher) {
      release || assert (Event.isBroadcastEventType(type), "Can only register broadcast events.");
      var queue = this._queues[type] || (this._queues[type] = []);
      if (queue.indexOf(target) >= 0) {
        return;
      }
      queue.push(target);
    }

    remove(type: string, target: EventDispatcher) {
      release || assert (Event.isBroadcastEventType(type), "Can only unregister broadcast events.");
      var queue = this._queues[type];
      release || assert (queue, "There should already be a queue for this.");
      var index = queue.indexOf(target);
      release || assert (index >= 0, "Target should be somewhere in this queue.");
      queue[index] = null;
      release || assert (queue.indexOf(target) < 0, "Target shouldn't be in this queue anymore.");
    }

    dispatchEvent(event: flash.events.Event) {
      release || assert (event.isBroadcastEvent(), "Cannot dispatch non-broadcast events.");
      var queue = this._queues[event.type];
      if (!queue) {
        return;
      }
      var nullCount = 0;
      for (var i = 0; i < queue.length; i++) {
        var target = queue[i];
        if (target === null) {
          nullCount++;
        } else {
          target.dispatchEvent(event);
        }
      }

      // Compact the queue if there are too many holes in it.
      if (nullCount > 16 && nullCount > (queue.length >> 1)) {
        var compactedQueue = [];
        for (var i = 0; i < queue.length; i++) {
          if (queue[i]) {
            compactedQueue.push(queue[i]);
          }
        }
        this._queues[event.type] = compactedQueue;
      }
    }

    getQueueLength(type: string) {
      return this._queues[type] ? this._queues[type].length : 0;
    }
  }

  /**
   * The EventDispatcher class is the base class for all classes that dispatch events.
   * The EventDispatcher class implements the IEventDispatcher interface and is the base class for
   * the DisplayObject class. The EventDispatcher class allows any object on the display list to be
   * an event target and as such, to use the methods of the IEventDispatcher interface.
   */
  export class EventDispatcher extends ASNative implements IEventDispatcher {

    public static broadcastEventDispatchQueue: BroadcastEventDispatchQueue;

    // Called whenever the class is initialized.
    static classInitializer: any = function () {
      EventDispatcher.broadcastEventDispatchQueue = new BroadcastEventDispatchQueue();
    };

    private _target: flash.events.IEventDispatcher;

    /*
     * Keep two lists of listeners, one for capture events and one for all others.
     */
    private _captureListeners: Shumway.Map<EventListenerList>;
    private _targetOrBubblingListeners: Shumway.Map<EventListenerList>;

    // Called whenever an instance of the class is initialized.
    static initializer: any = function () {
      var self: EventDispatcher = this;

      self._target = this;
      self._captureListeners = null;
      self._targetOrBubblingListeners = null;
    };

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];

    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["toString", "dispatchEvent"];

    constructor(target: flash.events.IEventDispatcher = null) {
      false && super();
      this._target = target || this;
    }

    /**
     * Don't lazily construct listener lists if all we're doing is looking for listener types that
     * don't exist yet.
     */
    private _getListenersForType(useCapture: boolean, type: string) {
      var listeners = useCapture ? this._captureListeners : this._targetOrBubblingListeners;
      if (listeners) {
        return listeners[type];
      }
      return null;
    }

    /**
     * Lazily construct listeners lists to avoid object allocation.
     */
    private _getListeners(useCapture: boolean): Shumway.Map<EventListenerList> {
      if (useCapture) {
        return this._captureListeners || (this._captureListeners = createEmptyObject());
      }
      return this._targetOrBubblingListeners || (this._targetOrBubblingListeners = createEmptyObject());
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
      if (isNullOrUndefined(type)) {
        throwError("TypeError", Errors.NullPointerError, "type");
      }
      type = asCoerceString(type);
      useCapture = !!useCapture;
      priority |= 0;
      useWeakReference = !!useWeakReference;
      var listeners = this._getListeners(useCapture);
      var list = listeners[type] || (listeners[type] = new EventListenerList());
      list.insert(listener, useCapture, priority);

      // Notify the broadcast event queue. If |useCapture| is set then the Flash player
      // doesn't seem to register this target.
      if (!useCapture && Event.isBroadcastEventType(type)) {
        EventDispatcher.broadcastEventDispatchQueue.add(type, this);
      }
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
      if (isNullOrUndefined(type)) {
        throwError("TypeError", Errors.NullPointerError, "type");
      }
      type = asCoerceString(type);
      var listeners = this._getListeners(!!useCapture);
      var list = listeners[type];
      if (list) {
        list.remove(listener);
        if (list.isEmpty()) {
          // Notify the broadcast event queue of the removal.
          if (!useCapture && Event.isBroadcastEventType(type)) {
            EventDispatcher.broadcastEventDispatchQueue.remove(type, this);
          }
          listeners[type] = null;
        }
      }
    }

    private _hasTargetOrBubblingEventListener(type: string): boolean {
      return !!(this._targetOrBubblingListeners && this._targetOrBubblingListeners[type]);
    }

    private _hasCaptureEventListener(type: string): boolean {
      return !!(this._captureListeners && this._captureListeners[type]);
    }

    /**
     * Faster internal version of |hasEventListener| that doesn't do any argument checking.
     */
    private _hasEventListener(type: string): boolean {
      return this._hasTargetOrBubblingEventListener(type) || this._hasCaptureEventListener(type);
    }

    hasEventListener(type: string): boolean {
      if (arguments.length !== 1) {
        throwError("ArgumentError", Errors.WrongArgumentCountError,
                   "flash.events::EventDispatcher/hasEventListener()", 1, arguments.length);
      }
      if (isNullOrUndefined(type)) {
        throwError("TypeError", Errors.NullPointerError, "type");
      }
      type = asCoerceString(type);
      return this._hasEventListener(type);
    }

    willTrigger(type: string): boolean {
      if (arguments.length !== 1) {
        throwError("ArgumentError", Errors.WrongArgumentCountError,
                   "flash.events::EventDispatcher/hasEventListener()", 1, arguments.length);
      }
      if (isNullOrUndefined(type)) {
        throwError("TypeError", Errors.NullPointerError, "type");
      }
      type = asCoerceString(type);
      if (this._hasEventListener(type)) {
        return true;
      }
      if (flash.display.DisplayObject.isType(this)) {
        var node: flash.display.DisplayObject = (<flash.display.DisplayObject>this)._parent;
        do {
          if (node._hasEventListener(type)) {
            return true;
          }
        } while ((node = node._parent));
      }
      return false;
    }

    /**
     * Check to see if we can skip event dispatching in case there are no event listeners
     * for this |event|.
     */
    private _skipDispatchEvent(event: Event): boolean {
      // Broadcast events don't have capturing or bubbling phases so it's a simple check.
      if (event.isBroadcastEvent()) {
        return !this._hasEventListener(event.type);
      } else if (flash.display.DisplayObject.isType(this)) {
        // Check to see if there are any event listeners on the path to the root.
        var node = <flash.display.DisplayObject>this;
        while (node) {
          if (node._hasEventListener(event.type)) {
            return false;
          }
          node = node._parent;
        }
        return true;
      }
      return !this._hasEventListener(event.type);
    }

    public dispatchEvent(event: Event): boolean {
      if (this._skipDispatchEvent(event)) {
        return true;
      }

      if (arguments.length !== 1) {
        throwError("ArgumentError", Errors.WrongArgumentCountError,
                   "flash.events::EventDispatcher/dispatchEvent()", 1, arguments.length);
      }

      release || counter.count("EventDispatcher::dispatchEvent");

      var type = event._type;
      var target = this._target;

      release || counter.count("EventDispatcher::dispatchEvent(" + type + ")");

      /**
       * 1. Capturing Phase
       */
      var keepPropagating = true;
      var ancestors: flash.display.DisplayObject [] = [];

      if (!event.isBroadcastEvent() && flash.display.DisplayObject.isType(this)) {
        var node: flash.display.DisplayObject = (<flash.display.DisplayObject>this)._parent;

        // Gather all parent display objects that have event listeners for this event type.
        while (node) {
          if (node._hasEventListener(type)) {
            ancestors.push(node);
          }
          node = node._parent;
        }

        for (var i = ancestors.length - 1; i >= 0 && keepPropagating; i--) {
          var ancestor = ancestors[i];
          if (!ancestor._hasCaptureEventListener(type)) {
            continue;
          }
          var list = ancestor._getListenersForType(true, type);
          release || assert(list);
          keepPropagating = EventDispatcher.callListeners(list, event, target, ancestor,
                                                          EventPhase.CAPTURING_PHASE);
        }
      }

      /**
       * 2. At Target
       */
      if (keepPropagating) {
        var list = this._getListenersForType(false, type);
        if (list) {
          keepPropagating = EventDispatcher.callListeners(list, event, target, target,
                                                          EventPhase.AT_TARGET);
        }
      }

      /**
       * 3. Bubbling Phase
       */
      if (!event.isBroadcastEvent() && keepPropagating && event.bubbles) {
        for (var i = 0; i < ancestors.length && keepPropagating; i++) {
          var ancestor = ancestors[i];
          if (!ancestor._hasTargetOrBubblingEventListener(type)) {
            continue;
          }
          var list = ancestor._getListenersForType(false, type);
          keepPropagating = EventDispatcher.callListeners(list, event, target, ancestor,
                                                          EventPhase.BUBBLING_PHASE);
        }
      }

      return !event._isDefaultPrevented;
    }

    private static callListeners(list: EventListenerList, event: Event, target: IEventDispatcher,
                                 currentTarget: IEventDispatcher, eventPhase: number): boolean
    {
      if (list.isEmpty()) {
        return true;
      }
      /**
       * If the target is already set then we must clone the event. We can reuse the event object for
       * all listener callbacks but not when bubbling.
       */
      if (event._target) {
        event = event.clone();
      }
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
