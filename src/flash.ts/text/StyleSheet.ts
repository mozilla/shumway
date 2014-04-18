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
// Class: StyleSheet
module Shumway.AVM2.AS.flash.text {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class StyleSheet extends flash.events.EventDispatcher {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["_styles", "styleNames", "getStyle", "setStyle", "clear", "transform", "parseCSS"];
    
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.text.StyleSheet");
    }
    
    // JS -> AS Bindings
    
    _styles: ASObject;
    styleNames: any [];
    getStyle: (styleName: string) => ASObject;
    setStyle: (styleName: string, styleObject: ASObject) => void;
    clear: () => void;
    transform: (formatObject: ASObject) => flash.text.TextFormat;
    parseCSS: (CSSText: string) => void;
    
    // AS -> JS Bindings
    
    // _styleNames: any [];
  }
}
