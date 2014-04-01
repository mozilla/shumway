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
    static initializer: any = null;
    constructor (description: string, extension: string, macType: string = null) {
      description = "" + description; extension = "" + extension; macType = "" + macType;
      false && super();
      notImplemented("Dummy Constructor: public flash.net.FileFilter");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    get description(): string {
      notImplemented("public flash.net.FileFilter::get description"); return;
    }
    set description(value: string) {
      value = "" + value;
      notImplemented("public flash.net.FileFilter::set description"); return;
    }
    get extension(): string {
      notImplemented("public flash.net.FileFilter::get extension"); return;
    }
    set extension(value: string) {
      value = "" + value;
      notImplemented("public flash.net.FileFilter::set extension"); return;
    }
    get macType(): string {
      notImplemented("public flash.net.FileFilter::get macType"); return;
    }
    set macType(value: string) {
      value = "" + value;
      notImplemented("public flash.net.FileFilter::set macType"); return;
    }
  }
}
