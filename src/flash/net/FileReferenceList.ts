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
// Class: FileReferenceList
module Shumway.AVMX.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class FileReferenceList extends flash.events.EventDispatcher {
    
    static classInitializer: any = null;

    constructor () {
      super();
    }

    // _fileList: any [];
    get fileList(): ASArray {
      release || notImplemented("public flash.net.FileReferenceList::get fileList"); return;
      // return this._fileList;
    }
    browse(typeFilter: ASArray = null): boolean {
      typeFilter = typeFilter;
      release || notImplemented("public flash.net.FileReferenceList::browse"); return;
    }
  }
}
