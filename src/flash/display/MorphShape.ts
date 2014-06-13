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
// Class: MorphShape
module Shumway.AVM2.AS.flash.display {
  import Bounds = Shumway.Bounds;
  export class MorphShape extends flash.display.DisplayObject {

    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // Called whenever an instance of the class is initialized.
    static initializer: any = function (symbol: Shumway.Timeline.MorphShapeSymbol) {
      var self: MorphShape = this;
      if (symbol) {
        self._graphics = symbol.graphics;
        self.morphFillBounds = symbol.morphFillBounds;
        self.morphLineBounds = symbol.morphLineBounds;
      } else {
        self._graphics = new flash.display.Graphics();
        self.morphFillBounds = null;
        self.morphLineBounds = null;
      }
    };

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];

    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      false && super();
      DisplayObject.instanceConstructorNoInitialize.call(this);
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings

    _graphics: flash.display.Graphics;
    morphFillBounds: Bounds;
    morphLineBounds: Bounds;

    _canHaveGraphics(): boolean {
      return true;
    }

    _getGraphics(): flash.display.Graphics {
      return this._graphics;
    }

    get graphics(): flash.display.Graphics {
      return this._ensureGraphics();
    }
  }
}
