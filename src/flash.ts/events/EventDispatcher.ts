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
  import notImplemented = Shumway.Debug.notImplemented;
  export class EventDispatcher extends ASNative implements IEventDispatcher {

    private _target: any;
    private _listeners: any;
    private _captureListeners: any;

    static initializer: any = function () {
      var self: EventDispatcher = this;
      self._target = this;
      self._listeners = {};
      self._captureListeners = {};
    };

    constructor (target: flash.events.IEventDispatcher = null) {
      target = target;
      false && super();
      notImplemented("Dummy Constructor: public flash.events.EventDispatcher");
    }
    // Static   JS -> AS Bindings
    static trimHeaderValue: (headerValue: string) => string;
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    dispatchEvent: (event: flash.events.Event) => boolean;
    dispatchHttpStatusEvent: (status: number /*uint*/, responseLocation: string, headers: string) => void;
    // Instance AS -> JS Bindings
    ctor(target: flash.events.IEventDispatcher): void {
      target = target;
      notImplemented("public flash.events.EventDispatcher::ctor"); return;
    }
    addEventListener(type: string, listener: ASFunction, useCapture: boolean = false, priority: number /*int*/ = 0, useWeakReference: boolean = false): void {
      type = "" + type; listener = listener; useCapture = !!useCapture; priority = priority | 0; useWeakReference = !!useWeakReference;
      notImplemented("public flash.events.EventDispatcher::addEventListener"); return;
    }
    removeEventListener(type: string, listener: ASFunction, useCapture: boolean = false): void {
      type = "" + type; listener = listener; useCapture = !!useCapture;
      notImplemented("public flash.events.EventDispatcher::removeEventListener"); return;
    }
    hasEventListener(type: string): boolean {
      type = "" + type;
      notImplemented("public flash.events.EventDispatcher::hasEventListener"); return;
    }
    willTrigger(type: string): boolean {
      type = "" + type;
      notImplemented("public flash.events.EventDispatcher::willTrigger"); return;
    }
    dispatchEventFunction(event: flash.events.Event): boolean {
      event = event;
      notImplemented("public flash.events.EventDispatcher::dispatchEventFunction"); return;
    }
  }
}
