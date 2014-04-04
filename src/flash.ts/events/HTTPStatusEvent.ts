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
 * limitations under the License.
 */
// Class: HTTPStatusEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  export class HTTPStatusEvent extends flash.events.Event {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["_status", "_responseURL", "_responseHeaders", "status", "responseURL", "responseURL", "responseHeaders", "responseHeaders", "clone", "toString"];
    
    constructor (type: string, bubbles: boolean = false, cancelable: boolean = false, status: number /*int*/ = 0) {
      type = "" + type; bubbles = !!bubbles; cancelable = !!cancelable; status = status | 0;
      false && super(undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.HTTPStatusEvent");
    }
    
    // JS -> AS Bindings
    static HTTP_STATUS: string = "httpStatus";
    static HTTP_RESPONSE_STATUS: string = "httpResponseStatus";
    
    _status: number /*int*/;
    _responseURL: string;
    _responseHeaders: any [];
    status: number /*int*/;
    responseURL: string;
    responseHeaders: any [];
    clone: () => flash.events.Event;
    
    // AS -> JS Bindings
    
    // _status: number /*int*/;
    // _responseURL: string;
    // _responseHeaders: any [];
  }
}
