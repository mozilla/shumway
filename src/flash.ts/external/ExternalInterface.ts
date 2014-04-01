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
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.external.ExternalInterface");
    }
    // Static   JS -> AS Bindings
    static marshallExceptions: boolean;
    static addCallback: (functionName: string, closure: ASFunction) => void;
    static call: (functionName: string) => any;
    static _callIn: (closure: ASFunction, request: string, args: any []) => string;
    static _arrayToXML: (obj: any []) => string;
    static _argumentsToXML: (obj: any []) => string;
    static _objectToXML: (obj: any) => string;
    static _escapeXML: (s: string) => string;
    static _toXML: (value: any) => string;
    static _objectToAS: (obj: ASObject) => any;
    static _arrayToAS: (obj: ASObject) => any;
    static _toAS: (obj: ASObject) => any;
    static _argumentsToAS: (obj: any) => any [];
    static _arrayToJS: (value: any []) => string;
    static _objectToJS: (value: any) => string;
    static _toJS: (value: any) => string;
    // Static   AS -> JS Bindings
    get available(): boolean {
      notImplemented("public flash.external.ExternalInterface::get available"); return;
    }
    static _initJS(): void {
      notImplemented("public flash.external.ExternalInterface::static _initJS"); return;
    }
    static _getPropNames(obj: ASObject): any [] {
      obj = obj;
      notImplemented("public flash.external.ExternalInterface::static _getPropNames"); return;
    }
    get objectID(): string {
      notImplemented("public flash.external.ExternalInterface::get objectID"); return;
    }
    get activeX(): boolean {
      notImplemented("public flash.external.ExternalInterface::get activeX"); return;
    }
    static _addCallback(functionName: string, closure: ASFunction, hasNullCallback: boolean): void {
      functionName = "" + functionName; closure = closure; hasNullCallback = !!hasNullCallback;
      notImplemented("public flash.external.ExternalInterface::static _addCallback"); return;
    }
    static _evalJS(expression: string): string {
      expression = "" + expression;
      notImplemented("public flash.external.ExternalInterface::static _evalJS"); return;
    }
    static _callOut(request: string): string {
      request = "" + request;
      notImplemented("public flash.external.ExternalInterface::static _callOut"); return;
    }
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
  }
}
