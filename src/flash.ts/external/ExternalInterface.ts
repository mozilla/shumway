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
// Class: ExternalInterface
module Shumway.AVM2.AS.flash.external {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;
  import Telemetry = Shumway.Telemetry;
  import ASObject = Shumway.AVM2.AS.ASObject;
  import ASFunction = Shumway.AVM2.AS.ASFunction;
  import ASNative = Shumway.AVM2.AS.ASNative;
  import ASXML = Shumway.AVM2.AS.ASXML;
  import forEachPublicProperty = Shumway.AVM2.Runtime.forEachPublicProperty;

  declare var FirefoxCom;
  declare var $EXTENSION: boolean;

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

    private static initialized: boolean = false;
    private static registeredCallbacks: Shumway.Map<(request: string, args: any []) => any> = createEmptyObject();

    private static _getAvailable(): boolean {
      return $EXTENSION;
    }

    static _initJS(): void {
      if (ExternalInterface.initialized)
        return;
      Telemetry.reportTelemetry({topic: 'feature', feature: Telemetry.Feature.EXTERNAL_INTERFACE_FEATURE});
      ExternalInterface.initialized = true;
      FirefoxCom.initJS(ExternalInterface._callIn);
    }

    private static _callIn(functionName: string, args: any[]) {
      var callback = ExternalInterface.registeredCallbacks[functionName];
      if (!callback) {
        return;
      }
      return callback(functionName, args);
    }

    static _getPropNames(obj: ASObject): any [] {
      var keys = [];
      forEachPublicProperty(obj, function (key) { keys.push(key); }, null);
      return keys;
    }

    static _addCallback(functionName: string, closure: (request: string, args: any []) => any, hasNullCallback: boolean): void {
      FirefoxCom.request('externalCom',
      {action: 'register', functionName: functionName, remove: hasNullCallback});
      if (hasNullCallback) {
        delete ExternalInterface.registeredCallbacks[functionName];
      } else {
        ExternalInterface.registeredCallbacks[functionName] = closure;
      }
    }

    static _evalJS(expression: string): string {
      expression = asCoerceString(expression);
      return FirefoxCom.requestSync('externalCom', {action: 'eval', expression: expression});
    }

    static _callOut(request: string): string {
      return FirefoxCom.requestSync('externalCom', {action: 'call', request: request});
    }

    static get available(): boolean {
      return ExternalInterface._getAvailable();
    }

    static get objectID(): string {
      return FirefoxCom.requestSync('externalCom', {action: 'getId'});
    }

    static get activeX(): boolean {
      return false;
    }
  }
}
