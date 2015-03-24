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
// Class: SecurityPanel
module Shumway.AVMX.AS.flash.system {
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  import asCoerceString = Shumway.AVMX.asCoerceString;
  export class SecurityPanel extends ASObject {
    
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
      dummyConstructor("public flash.system.SecurityPanel");
    }
    
    // JS -> AS Bindings
    static DEFAULT: string = "default";
    static PRIVACY: string = "privacy";
    static LOCAL_STORAGE: string = "localStorage";
    static MICROPHONE: string = "microphone";
    static CAMERA: string = "camera";
    static DISPLAY: string = "display";
    static SETTINGS_MANAGER: string = "settingsManager";
    
    
    // AS -> JS Bindings
    
  }
}
