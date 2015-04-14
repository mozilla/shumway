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

///<reference path='../references.ts' />

module Shumway.AVM1.Lib {
  import flash = Shumway.AVMX.AS.flash;

  export class AVM1Transform extends AVM1Object {
    static createAVM1Class(context: AVM1Context): AVM1Object {
      return wrapAVM1NativeClass(context, true, AVM1Transform,
        [],
        ['matrix#', 'concatenatedMatrix#', 'colorTransform#', 'pixelBounds#'],
        AVM1Transform.prototype.avm1Constructor);
    }

    private _target:IAVM1SymbolBase;

    public avm1Constructor(target_mc) {
      this._target = AVM1Utils.resolveTarget(this.context, target_mc);
    }

    public getMatrix(): AVM1Object {
      return undefined; // REDUX this._target.as3Object.transform.matrix;
    }

    public setMatrix(value: AVM1Object) {
      if (value instanceof flash.geom.Matrix) {
        // REDUX this._target.as3Object.transform.matrix = value;
        return;
      }
      if (isNullOrUndefined(value)) {
        return;
      }
      // It accepts random objects with a,b,c,d,tx,ty properties
      var m: any = this.getMatrix();  // REDUX
      if (value.alHasProperty('a')) {
        m.a = value.alGet('a');
      }
      if (value.alHasProperty('b')) {
        m.b = value.alGet('b');
      }
      if (value.alHasProperty('c')) {
        m.c = value.alGet('c');
      }
      if (value.alHasProperty('d')) {
        m.d = value.alGet('d');
      }
      if (value.alHasProperty('tx')) {
        m.tx = value.alGet('tx');
      }
      if (value.alHasProperty('ty')) {
        m.ty = value.alGet('ty');
      }
      this._target.as3Object.transform.matrix = m;
    }

    public getConcatenatedMatrix(): flash.geom.Matrix {
      return this._target.as3Object.transform.concatenatedMatrix;
    }

    public getColorTransform(): flash.geom.ColorTransform {
      return this._target.as3Object.transform.colorTransform;
    }

    public setColorTransform(value: flash.geom.ColorTransform) {
      this._target.as3Object.transform.colorTransform = value;
    }

    public getPixelBounds(): flash.geom.Rectangle {
      return this._target.as3Object.pixelBounds;
    }
  }
}
