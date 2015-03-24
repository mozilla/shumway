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
// Class: IMEConversionMode
module Shumway.AVMX.AS.flash.system {
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  import asCoerceString = Shumway.AVMX.asCoerceString;
  export class IMEConversionMode extends ASObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      false && super();
      dummyConstructor("public flash.system.IMEConversionMode");
    }
    
    // JS -> AS Bindings
    static ALPHANUMERIC_FULL: string = "ALPHANUMERIC_FULL";
    static ALPHANUMERIC_HALF: string = "ALPHANUMERIC_HALF";
    static CHINESE: string = "CHINESE";
    static JAPANESE_HIRAGANA: string = "JAPANESE_HIRAGANA";
    static JAPANESE_KATAKANA_FULL: string = "JAPANESE_KATAKANA_FULL";
    static JAPANESE_KATAKANA_HALF: string = "JAPANESE_KATAKANA_HALF";
    static KOREAN: string = "KOREAN";
    static UNKNOWN: string = "UNKNOWN";
    
    
    // AS -> JS Bindings
    
  }
}
