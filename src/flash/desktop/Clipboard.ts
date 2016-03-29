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
// Class: Clipboard
module Shumway.AVMX.AS.flash.desktop {
  import axCoerceString = Shumway.AVMX.axCoerceString;
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class Clipboard extends ASObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["setData", "setDataHandler", "getData", "hasFormat"];
    
    constructor () {
      super();
    }
    
    // JS -> AS Bindings
    
    setData: (format: string, data: ASObject, serializable: boolean = true) => boolean;
    setDataHandler: (format: string, handler: ASFunction, serializable: boolean = true) => boolean;
    getData: (format: string, transferMode: string = "originalPreferred") => ASObject;
    hasFormat: (format: string) => boolean;
    
    // AS -> JS Bindings
    // static _generalClipboard: flash.desktop.Clipboard;
    get generalClipboard(): flash.desktop.Clipboard {
      release || notImplemented("public flash.desktop.Clipboard::get generalClipboard"); return;
      // return this._generalClipboard;
    }
    
    // _formats: any [];
    get formats(): any [] {
      release || notImplemented("public flash.desktop.Clipboard::get formats"); return;
      // return this._formats;
    }
    clear(): void {
      release || notImplemented("public flash.desktop.Clipboard::clear"); return;
    }
    clearData(format: string): void {
      format = axCoerceString(format);
      release || notImplemented("public flash.desktop.Clipboard::clearData"); return;
    }
  }
}
