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
// Class: ProgressEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class ProgressEvent extends flash.events.Event {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["_bytesLoaded", "_bytesTotal", "bytesLoaded", "bytesLoaded", "bytesTotal", "bytesTotal", "clone", "toString"];
    
    constructor (type: string, bubbles: boolean = false, cancelable: boolean = false, bytesLoaded: number = 0, bytesTotal: number = 0) {
      type = asCoerceString(type); bubbles = !!bubbles; cancelable = !!cancelable; bytesLoaded = +bytesLoaded; bytesTotal = +bytesTotal;
      false && super(undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.ProgressEvent");
    }
    
    // JS -> AS Bindings
    static PROGRESS: string = "progress";
    static SOCKET_DATA: string = "socketData";
    
    // _bytesLoaded: any;
    // _bytesTotal: any;
    // bytesLoaded: number;
    // bytesTotal: number;
    clone: () => flash.events.Event;
    
    // AS -> JS Bindings
    
    // _bytesLoaded: number;
    // _bytesTotal: number;
  }
}
