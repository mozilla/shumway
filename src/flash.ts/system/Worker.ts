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
// Class: Worker
module Shumway.AVM2.AS.flash.system {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Worker extends flash.events.EventDispatcher {
    static initializer: any = null;
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.system.Worker");
    }
    // Static   JS -> AS Bindings
    static current: flash.system.Worker;
    static _current: flash.system.Worker;
    // Static   AS -> JS Bindings
    get isSupported(): boolean {
      notImplemented("public flash.system.Worker::get isSupported"); return;
    }
    // Instance JS -> AS Bindings
    start: () => void;
    setSharedProperty: (key: string, value: any) => void;
    getSharedProperty: (key: string) => any;
    state: string;
    // addEventListener: (type: string, listener: ASFunction, useCapture: boolean = false, priority: number /*int*/ = 0, useWeakReference: boolean = false) => void;
    removeEventListener: (type: string, listener: ASFunction, useCapture: boolean = false) => void;
    _byteCode: flash.utils.ByteArray;
    // Instance AS -> JS Bindings
    createMessageChannel(receiver: flash.system.Worker): flash.system.MessageChannel {
      receiver = receiver;
      notImplemented("public flash.system.Worker::createMessageChannel"); return;
    }
    internalSetSharedProperty(key: string, value: any): void {
      key = "" + key;
      notImplemented("public flash.system.Worker::internalSetSharedProperty"); return;
    }
    internalGetSharedProperty(key: string): any {
      key = "" + key;
      notImplemented("public flash.system.Worker::internalGetSharedProperty"); return;
    }
    get isPrimordial(): boolean {
      notImplemented("public flash.system.Worker::get isPrimordial"); return;
    }
    internalGetState(): string {
      notImplemented("public flash.system.Worker::internalGetState"); return;
    }
    listenerAdded(): void {
      notImplemented("public flash.system.Worker::listenerAdded"); return;
    }
    listenerRemoved(): void {
      notImplemented("public flash.system.Worker::listenerRemoved"); return;
    }
    terminate(): boolean {
      notImplemented("public flash.system.Worker::terminate"); return;
    }
    internalStart(): void {
      notImplemented("public flash.system.Worker::internalStart"); return;
    }
  }
}
