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
// Class: Accessibility
module Shumway.AVM2.AS.flash.accessibility {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Accessibility extends ASNative {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.accessibility.Accessibility");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    get active(): boolean {
      notImplemented("public flash.accessibility.Accessibility::get active"); return;
    }
    static sendEvent(source: flash.display.DisplayObject, childID: number /*uint*/, eventType: number /*uint*/, nonHTML: boolean = false): void {
      source = source; childID = childID >>> 0; eventType = eventType >>> 0; nonHTML = !!nonHTML;
      notImplemented("public flash.accessibility.Accessibility::static sendEvent"); return;
    }
    static updateProperties(): void {
      notImplemented("public flash.accessibility.Accessibility::static updateProperties"); return;
    }
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
  }
}
