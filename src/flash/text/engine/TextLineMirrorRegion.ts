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
// Class: TextLineMirrorRegion
module Shumway.AVMX.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class TextLineMirrorRegion extends ASObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      super();
      dummyConstructor("public flash.text.engine.TextLineMirrorRegion");
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    
    // _textLine: flash.text.engine.TextLine;
    // _nextRegion: flash.text.engine.TextLineMirrorRegion;
    // _previousRegion: flash.text.engine.TextLineMirrorRegion;
    // _mirror: flash.events.EventDispatcher;
    // _element: flash.text.engine.ContentElement;
    // _bounds: flash.geom.Rectangle;
    get textLine(): flash.text.engine.TextLine {
      release || notImplemented("public flash.text.engine.TextLineMirrorRegion::get textLine"); return;
      // return this._textLine;
    }
    get nextRegion(): flash.text.engine.TextLineMirrorRegion {
      release || notImplemented("public flash.text.engine.TextLineMirrorRegion::get nextRegion"); return;
      // return this._nextRegion;
    }
    get previousRegion(): flash.text.engine.TextLineMirrorRegion {
      release || notImplemented("public flash.text.engine.TextLineMirrorRegion::get previousRegion"); return;
      // return this._previousRegion;
    }
    get mirror(): flash.events.EventDispatcher {
      release || notImplemented("public flash.text.engine.TextLineMirrorRegion::get mirror"); return;
      // return this._mirror;
    }
    get element(): flash.text.engine.ContentElement {
      release || notImplemented("public flash.text.engine.TextLineMirrorRegion::get element"); return;
      // return this._element;
    }
    get bounds(): flash.geom.Rectangle {
      release || notImplemented("public flash.text.engine.TextLineMirrorRegion::get bounds"); return;
      // return this._bounds;
    }
  }
}
