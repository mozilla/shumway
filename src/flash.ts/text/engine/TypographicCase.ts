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
// Class: TypographicCase
module Shumway.AVM2.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class TypographicCase extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // [];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.text.engine.TypographicCase");
    }
    
    // JS -> AS Bindings
    static DEFAULT: string = "default";
    static TITLE: string = "title";
    static CAPS: string = "caps";
    static SMALL_CAPS: string = "smallCaps";
    static UPPERCASE: string = "uppercase";
    static LOWERCASE: string = "lowercase";
    static CAPS_AND_SMALL_CAPS: string = "capsAndSmallCaps";
    
    
    // AS -> JS Bindings
    
  }
}
