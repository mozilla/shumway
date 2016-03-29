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
// Class: Telemetry
module Shumway.AVMX.AS.flash.profiler {
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class Telemetry extends ASObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      super();
    }

    // static _spanMarker: number;
    // static _connected: boolean;
    get spanMarker(): number {
      release || notImplemented("public flash.profiler.Telemetry::get spanMarker"); return;
      // return this._spanMarker;
    }
    get connected(): boolean {
      release || notImplemented("public flash.profiler.Telemetry::get connected"); return;
      // return this._connected;
    }
    static sendMetric(metric: string, value: any): void {
      metric = axCoerceString(metric);
      release || notImplemented("public flash.profiler.Telemetry::static sendMetric"); return;
    }
    static sendSpanMetric(metric: string, startSpanMarker: number, value: any = null): void {
      metric = axCoerceString(metric); startSpanMarker = +startSpanMarker;
      release || notImplemented("public flash.profiler.Telemetry::static sendSpanMetric"); return;
    }
    static registerCommandHandler(commandName: string, handler: ASFunction): boolean {
      commandName = axCoerceString(commandName); handler = handler;
      release || notImplemented("public flash.profiler.Telemetry::static registerCommandHandler"); return;
    }
    static unregisterCommandHandler(commandName: string): boolean {
      commandName = axCoerceString(commandName);
      release || notImplemented("public flash.profiler.Telemetry::static unregisterCommandHandler"); return;
    }
    
  }
}
