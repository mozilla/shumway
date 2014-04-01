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
// Class: Mouse
module Shumway.AVM2.AS.flash.ui {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Mouse extends ASNative {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.ui.Mouse");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    static hide(): void {
      notImplemented("public flash.ui.Mouse::static hide"); return;
    }
    static show(): void {
      notImplemented("public flash.ui.Mouse::static show"); return;
    }
    get supportsCursor(): boolean {
      notImplemented("public flash.ui.Mouse::get supportsCursor"); return;
    }
    get cursor(): string {
      notImplemented("public flash.ui.Mouse::get cursor"); return;
    }
    set cursor(value: string) {
      value = "" + value;
      notImplemented("public flash.ui.Mouse::set cursor"); return;
    }
    static registerCursor(name: string, cursor: flash.ui.MouseCursorData): void {
      name = "" + name; cursor = cursor;
      notImplemented("public flash.ui.Mouse::static registerCursor"); return;
    }
    static unregisterCursor(name: string): void {
      name = "" + name;
      notImplemented("public flash.ui.Mouse::static unregisterCursor"); return;
    }
    get supportsNativeCursor(): boolean {
      notImplemented("public flash.ui.Mouse::get supportsNativeCursor"); return;
    }
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
  }
}
