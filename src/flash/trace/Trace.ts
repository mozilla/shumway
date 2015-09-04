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
// Class: Trace
module Shumway.AVMX.AS.flash.trace {
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class Trace extends ASObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      super();
    }
    
    // JS -> AS Bindings
    static OFF: number /*int*/ = undefined;
    static METHODS: number /*int*/ = 1;
    static METHODS_WITH_ARGS: number /*int*/ = 2;
    static METHODS_AND_LINES: number /*int*/ = 3;
    static METHODS_AND_LINES_WITH_ARGS: number /*int*/ = 4;
    static FILE: any = 1;
    static LISTENER: any = 2;
    
    
    // AS -> JS Bindings
    static setLevel(l: number /*int*/, target: number /*int*/ = 2): any {
      l = l | 0; target = target | 0;
      release || notImplemented("public flash.trace.Trace::static setLevel"); return;
    }
    static getLevel(target: number /*int*/ = 2): number /*int*/ {
      target = target | 0;
      release || notImplemented("public flash.trace.Trace::static getLevel"); return;
    }
    static setListener(f: ASFunction): any {
      f = f;
      release || notImplemented("public flash.trace.Trace::static setListener"); return;
    }
    static getListener(): ASFunction {
      release || notImplemented("public flash.trace.Trace::static getListener"); return;
    }
    
  }
}
