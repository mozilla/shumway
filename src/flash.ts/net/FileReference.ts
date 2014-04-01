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
// Class: FileReference
module Shumway.AVM2.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  export class FileReference extends flash.events.EventDispatcher {
    static initializer: any = null;
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.net.FileReference");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    static _ensureIsRootPlayer(): void {
      notImplemented("public flash.net.FileReference::static _ensureIsRootPlayer"); return;
    }
    // Instance JS -> AS Bindings
    load: () => void;
    save: (data: any, defaultFileName: string = null) => void;
    // Instance AS -> JS Bindings
    get creationDate(): ASDate {
      notImplemented("public flash.net.FileReference::get creationDate"); return;
    }
    get creator(): string {
      notImplemented("public flash.net.FileReference::get creator"); return;
    }
    get modificationDate(): ASDate {
      notImplemented("public flash.net.FileReference::get modificationDate"); return;
    }
    get name(): string {
      notImplemented("public flash.net.FileReference::get name"); return;
    }
    get size(): number {
      notImplemented("public flash.net.FileReference::get size"); return;
    }
    get type(): string {
      notImplemented("public flash.net.FileReference::get type"); return;
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
    }
    _load(dest: flash.utils.ByteArray): void {
      dest = dest;
      notImplemented("public flash.net.FileReference::_load"); return;
    }
    _save(data: flash.utils.ByteArray, defaultFileName: string): void {
      data = data; defaultFileName = "" + defaultFileName;
      notImplemented("public flash.net.FileReference::_save"); return;
    }
    browse(typeFilter: any [] = null): boolean {
      typeFilter = typeFilter;
      notImplemented("public flash.net.FileReference::browse"); return;
    }
  }
}
