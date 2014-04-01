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
// Class: AVM1Movie
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  export class AVM1Movie extends flash.display.DisplayObject {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.display.AVM1Movie");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    call: (functionName: string) => any;
    _callAS3: (functionName: string, data: flash.utils.ByteArray) => void;
    addCallback: (functionName: string, closure: ASFunction) => void;
    callbackTable: ASObject;
    // Instance AS -> JS Bindings
    get _interopAvailable(): boolean {
      notImplemented("public flash.display.AVM1Movie::get _interopAvailable"); return;
    }
    _callAS2(functionName: string, arguments: flash.utils.ByteArray): void {
      functionName = "" + functionName; arguments = arguments;
      notImplemented("public flash.display.AVM1Movie::_callAS2"); return;
    }
    _setCallAS3(closure: ASFunction): void {
      closure = closure;
      notImplemented("public flash.display.AVM1Movie::_setCallAS3"); return;
    }
  }
}
