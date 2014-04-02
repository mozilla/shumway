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
// Class: TextLineMetrics
module Shumway.AVM2.AS.flash.text {
  import notImplemented = Shumway.Debug.notImplemented;
  export class TextLineMetrics extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["x", "width", "height", "ascent", "descent", "leading"];
    
    constructor (x: number, width: number, height: number, ascent: number, descent: number, leading: number) {
      x = +x; width = +width; height = +height; ascent = +ascent; descent = +descent; leading = +leading;
      false && super();
      notImplemented("Dummy Constructor: public flash.text.TextLineMetrics");
    }
    
    // JS -> AS Bindings
    
    x: number;
    width: number;
    height: number;
    ascent: number;
    descent: number;
    leading: number;
    
    // AS -> JS Bindings
    
  }
}
