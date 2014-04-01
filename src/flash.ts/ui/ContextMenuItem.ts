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
// Class: ContextMenuItem
module Shumway.AVM2.AS.flash.ui {
  import notImplemented = Shumway.Debug.notImplemented;
  export class ContextMenuItem extends flash.display.NativeMenuItem {
    static initializer: any = null;
    constructor (caption: string, separatorBefore: boolean = false, enabled: boolean = true, visible: boolean = true) {
      caption = "" + caption; separatorBefore = !!separatorBefore; enabled = !!enabled; visible = !!visible;
      false && super();
      notImplemented("Dummy Constructor: public flash.ui.ContextMenuItem");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    clone: () => flash.ui.ContextMenuItem;
    // Instance AS -> JS Bindings
    get caption(): string {
      notImplemented("public flash.ui.ContextMenuItem::get caption"); return;
    }
    set caption(value: string) {
      value = "" + value;
      notImplemented("public flash.ui.ContextMenuItem::set caption"); return;
    }
    get separatorBefore(): boolean {
      notImplemented("public flash.ui.ContextMenuItem::get separatorBefore"); return;
    }
    set separatorBefore(value: boolean) {
      value = !!value;
      notImplemented("public flash.ui.ContextMenuItem::set separatorBefore"); return;
    }
    get visible(): boolean {
      notImplemented("public flash.ui.ContextMenuItem::get visible"); return;
    }
    set visible(value: boolean) {
      value = !!value;
      notImplemented("public flash.ui.ContextMenuItem::set visible"); return;
    }
  }
}
