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
// Class: TextLineCreationResult
module Shumway.AVMX.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class TextLineCreationResult extends ASObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      super();
      dummyConstructor("public flash.text.engine.TextLineCreationResult");
    }
    
    // JS -> AS Bindings
    static SUCCESS: string = "success";
    static EMERGENCY: string = "emergency";
    static COMPLETE: string = "complete";
    static INSUFFICIENT_WIDTH: string = "insufficientWidth";
    
    
    // AS -> JS Bindings
    
  }
}
