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
// Class: AccessibilityImplementation
module Shumway.AVM2.AS.flash.accessibility {
  import notImplemented = Shumway.Debug.notImplemented;
  export class AccessibilityImplementation extends ASNative {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.accessibility.AccessibilityImplementation");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    stub: boolean;
    errno: number /*uint*/;
    get_accRole: (childID: number /*uint*/) => number /*uint*/;
    get_accName: (childID: number /*uint*/) => string;
    get_accValue: (childID: number /*uint*/) => string;
    get_accState: (childID: number /*uint*/) => number /*uint*/;
    get_accDefaultAction: (childID: number /*uint*/) => string;
    accDoDefaultAction: (childID: number /*uint*/) => void;
    isLabeledBy: (labelBounds: flash.geom.Rectangle) => boolean;
    getChildIDArray: () => any [];
    accLocation: (childID: number /*uint*/) => any;
    get_accSelection: () => any [];
    get_accFocus: () => number /*uint*/;
    accSelect: (operation: number /*uint*/, childID: number /*uint*/) => void;
    get_selectionAnchorIndex: () => any;
    get_selectionActiveIndex: () => any;
    // Instance AS -> JS Bindings
  }
}
