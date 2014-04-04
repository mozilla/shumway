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
// Class: FileReference
module Shumway.AVM2.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  export class FileReference extends flash.events.EventDispatcher {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["load", "save"];
    
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.net.FileReference");
    }
    
    // JS -> AS Bindings
    
    load: () => void;
    save: (data: any, defaultFileName: string = null) => void;
    
    // AS -> JS Bindings
    
    // _creationDate: ASDate;
    // _creator: string;
    // _modificationDate: ASDate;
    // _name: string;
    // _size: number;
    // _type: string;
    // _data: flash.utils.ByteArray;
    get creationDate(): ASDate {
      notImplemented("public flash.net.FileReference::get creationDate"); return;
      // return this._creationDate;
    }
    get creator(): string {
      notImplemented("public flash.net.FileReference::get creator"); return;
      // return this._creator;
    }
    get modificationDate(): ASDate {
      notImplemented("public flash.net.FileReference::get modificationDate"); return;
      // return this._modificationDate;
    }
    get name(): string {
      notImplemented("public flash.net.FileReference::get name"); return;
      // return this._name;
    }
    get size(): number {
      notImplemented("public flash.net.FileReference::get size"); return;
      // return this._size;
    }
    get type(): string {
      notImplemented("public flash.net.FileReference::get type"); return;
      // return this._type;
    }
    cancel(): void {
      notImplemented("public flash.net.FileReference::cancel"); return;
    }
    download(request: flash.net.URLRequest, defaultFileName: string = null): void {
      request = request; defaultFileName = "" + defaultFileName;
      notImplemented("public flash.net.FileReference::download"); return;
    }
    upload(request: flash.net.URLRequest, uploadDataFieldName: string = "Filedata", testUpload: boolean = false): void {
      request = request; uploadDataFieldName = "" + uploadDataFieldName; testUpload = !!testUpload;
      notImplemented("public flash.net.FileReference::upload"); return;
    }
    get data(): flash.utils.ByteArray {
      notImplemented("public flash.net.FileReference::get data"); return;
      // return this._data;
    }
    browse(typeFilter: any [] = null): boolean {
      typeFilter = typeFilter;
      notImplemented("public flash.net.FileReference::browse"); return;
    }
  }
}
