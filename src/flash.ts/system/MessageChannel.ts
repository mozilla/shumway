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
// Class: MessageChannel
module Shumway.AVM2.AS.flash.system {
  import notImplemented = Shumway.Debug.notImplemented;
  export class MessageChannel extends flash.events.EventDispatcher {
    static initializer: any = null;
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.system.MessageChannel");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    addEventListener: (type: string, listener: ASFunction, useCapture: boolean = false, priority: number /*int*/ = 0, useWeakReference: boolean = false) => void;
    removeEventListener: (type: string, listener: ASFunction, useCapture: boolean = false) => void;
    // Instance AS -> JS Bindings
    send(arg: any, queueLimit: number /*int*/ = -1): void {
      queueLimit = queueLimit | 0;
      notImplemented("public flash.system.MessageChannel::send"); return;
    }
    get messageAvailable(): boolean {
      notImplemented("public flash.system.MessageChannel::get messageAvailable"); return;
    }
    receive(blockUntilReceived: boolean = false): any {
      blockUntilReceived = !!blockUntilReceived;
      notImplemented("public flash.system.MessageChannel::receive"); return;
    }
    close(): void {
      notImplemented("public flash.system.MessageChannel::close"); return;
    }
    get state(): string {
      notImplemented("public flash.system.MessageChannel::get state"); return;
    }
    internalRemoveEventListener(type: string, listener: ASFunction, useCapture: boolean = false): void {
      type = "" + type; listener = listener; useCapture = !!useCapture;
      notImplemented("public flash.system.MessageChannel::internalRemoveEventListener"); return;
    }
    internalAddEventListener(type: string, listener: ASFunction, useCapture: boolean = false, priority: number /*int*/ = 0, useWeakReference: boolean = false): void {
      type = "" + type; listener = listener; useCapture = !!useCapture; priority = priority | 0; useWeakReference = !!useWeakReference;
      notImplemented("public flash.system.MessageChannel::internalAddEventListener"); return;
    }
  }
}
