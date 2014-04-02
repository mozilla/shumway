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
// Class: FileFilter
module Shumway.AVM2.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  export class FileFilter extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // [];
    
    constructor (description: string, extension: string, macType: string = null) {
      description = "" + description; extension = "" + extension; macType = "" + macType;
      false && super();
      notImplemented("Dummy Constructor: public flash.net.FileFilter");
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    
    // _description: string;
    // _extension: string;
    // _macType: string;
    get description(): string {
      notImplemented("public flash.net.FileFilter::get description"); return;
      // return this._description;
    }
    set description(value: string) {
      value = "" + value;
      notImplemented("public flash.net.FileFilter::set description"); return;
      // this._description = value;
    }
    get extension(): string {
      notImplemented("public flash.net.FileFilter::get extension"); return;
      // return this._extension;
    }
    set extension(value: string) {
      value = "" + value;
      notImplemented("public flash.net.FileFilter::set extension"); return;
      // this._extension = value;
    }
    get macType(): string {
      notImplemented("public flash.net.FileFilter::get macType"); return;
      // return this._macType;
    }
    set macType(value: string) {
      value = "" + value;
      notImplemented("public flash.net.FileFilter::set macType"); return;
      // this._macType = value;
    }
  }
}
