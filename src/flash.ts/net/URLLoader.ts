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
// Class: URLLoader
module Shumway.AVM2.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  export class URLLoader extends flash.events.EventDispatcher {
    static initializer: any = null;
    constructor (request: flash.net.URLRequest = null) {
      request = request;
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.net.URLLoader");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    data: any;
    dataFormat: string;
    stream: flash.net.URLStream;
    bytesLoaded: number /*uint*/;
    bytesTotal: number /*uint*/;
    // addEventListener: (type: string, listener: ASFunction, useCapture: boolean = false, priority: number /*int*/ = 0, useWeakReference: boolean = false) => void;
    load: (request: flash.net.URLRequest) => void;
    close: () => void;
    redirectEvent: (event: flash.events.Event) => void;
    onComplete: (event: flash.events.Event) => void;
    onProgress: (event: flash.events.ProgressEvent) => void;
    // Instance AS -> JS Bindings
  }
}
