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
// Class: Telemetry
module Shumway.AVM2.AS.flash.profiler {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Telemetry extends ASNative {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.profiler.Telemetry");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    get spanMarker(): number {
      notImplemented("public flash.profiler.Telemetry::get spanMarker"); return;
    }
    get connected(): boolean {
      notImplemented("public flash.profiler.Telemetry::get connected"); return;
    }
    static sendMetric(metric: string, value: any): void {
      metric = "" + metric;
      notImplemented("public flash.profiler.Telemetry::static sendMetric"); return;
    }
    static sendSpanMetric(metric: string, startSpanMarker: number, value: any = null): void {
      metric = "" + metric; startSpanMarker = +startSpanMarker;
      notImplemented("public flash.profiler.Telemetry::static sendSpanMetric"); return;
    }
    static registerCommandHandler(commandName: string, handler: ASFunction): boolean {
      commandName = "" + commandName; handler = handler;
      notImplemented("public flash.profiler.Telemetry::static registerCommandHandler"); return;
    }
    static unregisterCommandHandler(commandName: string): boolean {
      commandName = "" + commandName;
      notImplemented("public flash.profiler.Telemetry::static unregisterCommandHandler"); return;
    }
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
  }
}
