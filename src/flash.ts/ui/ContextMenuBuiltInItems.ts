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
// Class: ContextMenuBuiltInItems
module Shumway.AVM2.AS.flash.ui {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class ContextMenuBuiltInItems extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["_save", "_zoom", "_quality", "_play", "_loop", "_rewind", "_forwardAndBack", "_print", "save", "save", "zoom", "zoom", "quality", "quality", "play", "play", "loop", "loop", "rewind", "rewind", "forwardAndBack", "forwardAndBack", "print", "print", "clone"];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.ui.ContextMenuBuiltInItems");
    }
    
    // JS -> AS Bindings
    
    _save: boolean;
    _zoom: boolean;
    _quality: boolean;
    _play: boolean;
    _loop: boolean;
    _rewind: boolean;
    _forwardAndBack: boolean;
    _print: boolean;
    save: boolean;
    zoom: boolean;
    quality: boolean;
    play: boolean;
    loop: boolean;
    rewind: boolean;
    forwardAndBack: boolean;
    print: boolean;
    clone: () => flash.ui.ContextMenuBuiltInItems;
    
    // AS -> JS Bindings
    
    // _save: boolean;
    // _zoom: boolean;
    // _quality: boolean;
    // _play: boolean;
    // _loop: boolean;
    // _rewind: boolean;
    // _forwardAndBack: boolean;
    // _print: boolean;
  }
}
