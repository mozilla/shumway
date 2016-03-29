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
// Class: Accessibility
module Shumway.AVMX.AS.flash.accessibility {
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;

  export class Accessibility extends ASObject {
    
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
    
    
    // AS -> JS Bindings
    private static _active: boolean = false;
    static get active(): boolean {
      release || somewhatImplemented("public flash.accessibility.Accessibility::get active");
      return Accessibility._active;
    }
    static sendEvent(source: flash.display.DisplayObject, childID: number /*uint*/, eventType: number /*uint*/, nonHTML: boolean = false): void {
      source = source; childID = childID >>> 0; eventType = eventType >>> 0; nonHTML = !!nonHTML;
      release || release || notImplemented("public flash.accessibility.Accessibility::static sendEvent"); return;
    }
    static updateProperties(): void {
      release || release || notImplemented("public flash.accessibility.Accessibility::static updateProperties"); return;
    }
    
  }
}
