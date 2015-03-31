/**
 * Copyright 2014 Mozilla Foundation
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
module Shumway.AVMX.AS.flash.external {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVMX.asCoerceString;
  import Telemetry = Shumway.Telemetry;
  import ExternalInterfaceService = Shumway.ExternalInterfaceService;

  export class ExternalInterface extends ASObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // ["marshallExceptions", "ensureInitialized", "addCallback", "convertToXML", "convertToXMLString", "convertFromXML", "convertToJSString", "call"];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      super();
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
    private static registeredCallbacks: Shumway.Map<(request: string, args: any []) => any> = Object.create(null);

    private static _getAvailable(): boolean {
      return ExternalInterfaceService.instance.enabled;
    }

    static _initJS(): void {
      if (ExternalInterface.initialized) {
        return;
      }
      Telemetry.instance.reportTelemetry({topic: 'feature', feature: Telemetry.Feature.EXTERNAL_INTERFACE_FEATURE});
      ExternalInterface.initialized = true;
      ExternalInterfaceService.instance.initJS(ExternalInterface._callIn);
    }

    private static _callIn(functionName: string, args: any[]) {
      var callback = ExternalInterface.registeredCallbacks[functionName];
      if (!callback) {
        return;
      }
      // REDUX:
      // return callback(functionName, ASJSON.transformJSValueToAS(args, true));
    }

    static _getPropNames(obj: ASObject): any [] {
      var keys = [];
      // REDUX:
      // forEachPublicProperty(obj, function (key) { keys.push(key); }, null);
      return keys;
    }

    static _addCallback(functionName: string, closure: (request: string, args: any []) => any, hasNullCallback: boolean): void {
      if (hasNullCallback) {
        ExternalInterfaceService.instance.unregisterCallback(functionName);
        delete ExternalInterface.registeredCallbacks[functionName];
      } else {
        ExternalInterfaceService.instance.registerCallback(functionName);
        ExternalInterface.registeredCallbacks[functionName] = closure;
      }
    }

    static _evalJS(expression: string): string {
      expression = asCoerceString(expression);
      return ExternalInterfaceService.instance.eval(expression);
    }

    static _callOut(request: string): string {
      request = asCoerceString(request);
      return ExternalInterfaceService.instance.call(request);
    }

    static get available(): boolean {
      return ExternalInterface._getAvailable();
    }

    static get objectID(): string {
      return ExternalInterfaceService.instance.getId();
    }

    static get activeX(): boolean {
      return false;
    }
  }
}
