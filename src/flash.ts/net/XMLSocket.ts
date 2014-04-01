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
// Class: XMLSocket
module Shumway.AVM2.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  export class XMLSocket extends flash.events.EventDispatcher {
    static initializer: any = null;
    constructor (host: string = null, port: number /*int*/ = 0) {
      host = "" + host; port = port | 0;
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.net.XMLSocket");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    _internalSocket: flash.net.Socket;
    _rcvBuffer: flash.utils.ByteArray;
    _bytesInPacket: number /*uint*/;
    reflectEvent: (e: flash.events.Event) => void;
    scanAndSendEvent: (e: flash.events.ProgressEvent) => void;
    connect: (host: string, port: number /*int*/) => void;
    send: (object: any) => void;
    timeout: number /*int*/;
    close: () => void;
    connected: boolean;
    // Instance AS -> JS Bindings
  }
}
