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
// Class: XMLTag
module Shumway.AVMX.AS.flash.xml {
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class XMLTag extends ASObject {
    constructor () {
      super();
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    get type(): number /*uint*/ {
      notImplemented("packageInternal flash.xml.XMLTag::get type"); return;
    }
    set type(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("packageInternal flash.xml.XMLTag::set type"); return;
    }
    get empty(): boolean {
      notImplemented("packageInternal flash.xml.XMLTag::get empty"); return;
    }
    set empty(value: boolean) {
      value = !!value;
      notImplemented("packageInternal flash.xml.XMLTag::set empty"); return;
    }
    get value(): string {
      notImplemented("packageInternal flash.xml.XMLTag::get value"); return;
    }
    set value(v: string) {
      v = axCoerceString(v);
      notImplemented("packageInternal flash.xml.XMLTag::set value"); return;
    }
    get attrs(): ASObject {
      notImplemented("packageInternal flash.xml.XMLTag::get attrs"); return;
    }
    set attrs(value: ASObject) {
      value = value;
      notImplemented("packageInternal flash.xml.XMLTag::set attrs"); return;
    }
  }
}
