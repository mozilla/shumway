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
// Class: ContextMenuClipboardItems
module Shumway.AVM2.AS.flash.ui {
  import notImplemented = Shumway.Debug.notImplemented;
  export class ContextMenuClipboardItems extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["cut", "cut", "copy", "copy", "paste", "paste", "clear", "clear", "selectAll", "selectAll", "clone"];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.ui.ContextMenuClipboardItems");
    }
    
    // JS -> AS Bindings
    
    cut: boolean;
    copy: boolean;
    paste: boolean;
    clear: boolean;
    selectAll: boolean;
    clone: () => flash.ui.ContextMenuClipboardItems;
    
    // AS -> JS Bindings
    
    // _cut: boolean;
    // _copy: boolean;
    // _paste: boolean;
    // _clear: boolean;
    // _selectAll: boolean;
  }
}
