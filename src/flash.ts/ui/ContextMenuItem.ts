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
// Class: ContextMenuItem
module Shumway.AVM2.AS.flash.ui {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class ContextMenuItem extends flash.display.NativeMenuItem {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["clone"];
    
    constructor (caption: string, separatorBefore: boolean = false, enabled: boolean = true, visible: boolean = true) {
      caption = asCoerceString(caption); separatorBefore = !!separatorBefore; enabled = !!enabled; visible = !!visible;
      false && super();
      notImplemented("Dummy Constructor: public flash.ui.ContextMenuItem");
    }
    
    // JS -> AS Bindings
    
    clone: () => flash.ui.ContextMenuItem;
    
    // AS -> JS Bindings
    
    // _caption: string;
    // _separatorBefore: boolean;
    // _visible: boolean;
    get caption(): string {
      notImplemented("public flash.ui.ContextMenuItem::get caption"); return;
      // return this._caption;
    }
    set caption(value: string) {
      value = asCoerceString(value);
      notImplemented("public flash.ui.ContextMenuItem::set caption"); return;
      // this._caption = value;
    }
    get separatorBefore(): boolean {
      notImplemented("public flash.ui.ContextMenuItem::get separatorBefore"); return;
      // return this._separatorBefore;
    }
    set separatorBefore(value: boolean) {
      value = !!value;
      notImplemented("public flash.ui.ContextMenuItem::set separatorBefore"); return;
      // this._separatorBefore = value;
    }
    get visible(): boolean {
      notImplemented("public flash.ui.ContextMenuItem::get visible"); return;
      // return this._visible;
    }
    set visible(value: boolean) {
      value = !!value;
      notImplemented("public flash.ui.ContextMenuItem::set visible"); return;
      // this._visible = value;
    }
  }
}
