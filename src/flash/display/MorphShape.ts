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
  import assert = Shumway.Debug.assert;

  export class MorphShape extends flash.display.DisplayObject {
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null; // [];

    static classInitializer: any = null;
    static initializer: any = function (symbol: Shumway.Timeline.MorphShapeSymbol) {
      var self: MorphShape = this;
      self._graphics = null;
      if (symbol) {
        this._setStaticContentFromSymbol(symbol);
        // TODO: Check what do do if the computed bounds of the graphics object don't
        // match those given by the symbol.
      }
      this._setFlags(DisplayObjectFlags.ContainsMorph);
    };
    
    constructor () {
      false && super();
      DisplayObject.instanceConstructorNoInitialize.call(this);
    }

    _canHaveGraphics(): boolean {
      return true;
    }

    _getGraphics(): flash.display.Graphics {
      return this._graphics;
    }

    get graphics(): flash.display.Graphics {
      return this._ensureGraphics();
    }

    _containsPointDirectly(localX: number, localY: number,
                           globalX: number, globalY: number): boolean {
      var graphics = this._getGraphics();
      return !!graphics && graphics._containsPoint(localX, localY, true, this._ratio / 0xffff);
    }
  }
}
