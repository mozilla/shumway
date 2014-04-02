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
// Class: ExternalInterface
module Shumway.AVM2.AS.flash.external {
  import notImplemented = Shumway.Debug.notImplemented;
  export class ExternalInterface extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // ["marshallExceptions", "ensureInitialized", "addCallback", "convertToXML", "convertToXMLString", "convertFromXML", "convertToJSString", "call"];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // [];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.external.ExternalInterface");
    }
    
    // JS -> AS Bindings
    static marshallExceptions: boolean;
    static ensureInitialized: () => void;
    static addCallback: (functionName: string, closure: ASFunction) => void;
    static convertToXML: (s: string) => ASXML;
    static convertToXMLString: (obj: any) => string;
    static convertFromXML: (xml: ASXML) => ASObject;
    static convertToJSString: (obj: any) => string;
    // static call: (functionName: string) => any;
    
    
    // AS -> JS Bindings
    // static _available: boolean;
    // static _objectID: string;
    get available(): boolean {
      notImplemented("public flash.external.ExternalInterface::get available"); return;
      // return this._available;
    }
    get objectID(): string {
      notImplemented("public flash.external.ExternalInterface::get objectID"); return;
      // return this._objectID;
    }
    static _addCallback(functionName: string, closure: ASFunction, hasNullCallback: boolean): void {
      functionName = "" + functionName; closure = closure; hasNullCallback = !!hasNullCallback;
      notImplemented("public flash.external.ExternalInterface::static _addCallback"); return;
    }
    static _evalJS(expression: string): string {
      expression = "" + expression;
      notImplemented("public flash.external.ExternalInterface::static _evalJS"); return;
    }
    static _getPropNames(obj: ASObject): any [] {
      obj = obj;
      notImplemented("public flash.external.ExternalInterface::static _getPropNames"); return;
    }
    static _initJS(): void {
      notImplemented("public flash.external.ExternalInterface::static _initJS"); return;
    }
    
  }
}
