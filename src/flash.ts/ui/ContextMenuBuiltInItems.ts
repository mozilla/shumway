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
// Class: ContextMenuBuiltInItems
module Shumway.AVM2.AS.flash.ui {
  import notImplemented = Shumway.Debug.notImplemented;
  export class ContextMenuBuiltInItems extends ASNative {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.ui.ContextMenuBuiltInItems");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    save: boolean;
    _save: boolean;
    zoom: boolean;
    _zoom: boolean;
    quality: boolean;
    _quality: boolean;
    play: boolean;
    _play: boolean;
    loop: boolean;
    _loop: boolean;
    rewind: boolean;
    _rewind: boolean;
    forwardAndBack: boolean;
    _forwardAndBack: boolean;
    print: boolean;
    _print: boolean;
    clone: () => flash.ui.ContextMenuBuiltInItems;
    // Instance AS -> JS Bindings
  }
}
