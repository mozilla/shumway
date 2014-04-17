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
// Class: OutputProgressEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class OutputProgressEvent extends flash.events.Event {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["_bytesPending", "_bytesTotal", "bytesPending", "bytesPending", "bytesTotal", "bytesTotal", "clone", "toString"];
    
    constructor (type: string, bubbles: boolean = false, cancelable: boolean = false, bytesPending: number = 0, bytesTotal: number = 0) {
      type = asCoerceString(type); bubbles = !!bubbles; cancelable = !!cancelable; bytesPending = +bytesPending; bytesTotal = +bytesTotal;
      false && super(undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.OutputProgressEvent");
    }
    
    // JS -> AS Bindings
    static OUTPUT_PROGRESS: string = "outputProgress";
    
    _bytesPending: number;
    _bytesTotal: number;
    bytesPending: number;
    bytesTotal: number;
    clone: () => flash.events.Event;
    
    // AS -> JS Bindings
    
    // _bytesPending: number;
    // _bytesTotal: number;
  }
}
