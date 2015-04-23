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
// Class: Transform
module Shumway.AVMX.AS.flash.geom {
  import notImplemented = Shumway.Debug.notImplemented;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;

  export class Transform extends ASObject {
    static classInitializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null; // [];

    private _displayObject: flash.display.DisplayObject;

    constructor (displayObject: flash.display.DisplayObject) {
      super();
      if (!displayObject) {
        this.sec.throwError("ArgumentError", Errors.NullPointerError, "displayObject");
      }
      this._displayObject = displayObject;
    }

    get matrix(): flash.geom.Matrix {
      return this._displayObject._getMatrix().clone().toPixelsInPlace();
    }

    set matrix(value: flash.geom.Matrix) {
      this._displayObject._setMatrix(value, true);
    }

    get colorTransform(): flash.geom.ColorTransform {
      return this._displayObject._colorTransform.clone();
    }

    set colorTransform(value: flash.geom.ColorTransform) {
      this._displayObject._setColorTransform(value);
    }

    get concatenatedMatrix(): flash.geom.Matrix {
      var matrix = this._displayObject._getConcatenatedMatrix().clone().toPixelsInPlace();
      if (!this._displayObject._stage) {
        matrix.scale(5, 5);
      }
      return matrix;
    }

    get concatenatedColorTransform(): flash.geom.ColorTransform {
      return this._displayObject._getConcatenatedColorTransform();
    }

    get pixelBounds(): flash.geom.Rectangle {
      notImplemented("public flash.geom.Transform::get pixelBounds"); return;
      // return this._pixelBounds;
    }

    get matrix3D(): flash.geom.Matrix3D {
      var m = this._displayObject._matrix3D;
      return m && m.clone();
    }

    set matrix3D(m: flash.geom.Matrix3D) {
      if (!(this.sec.flash.geom.Matrix3D.axIsType(m))) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, m,
                                       'flash.geom.Matrix3D');
      }

      var raw = m.rawData;
      // TODO why is this not a 3D matrix?
      this.matrix = new this.sec.flash.geom.Matrix (
        raw.axGetPublicProperty(0),
        raw.axGetPublicProperty(1),
        raw.axGetPublicProperty(4),
        raw.axGetPublicProperty(5),
        raw.axGetPublicProperty(12),
        raw.axGetPublicProperty(13)
      );
      // this.matrix will reset this._target._matrix3D
      // TODO: Must make sure to also deal with the _rotateXYZ properties.
      somewhatImplemented("public flash.geom.Transform::set matrix3D");
      // this._displayObject._matrix3D = m;
    }

    getRelativeMatrix3D(relativeTo: flash.display.DisplayObject): flash.geom.Matrix3D {
      relativeTo = relativeTo;
      notImplemented("public flash.geom.Transform::getRelativeMatrix3D"); return;
    }

    get perspectiveProjection(): flash.geom.PerspectiveProjection {
      notImplemented("public flash.geom.Transform::get perspectiveProjection"); return;
      // return this._perspectiveProjection;
    }

    set perspectiveProjection(pm: flash.geom.PerspectiveProjection) {
      pm = pm;
      notImplemented("public flash.geom.Transform::set perspectiveProjection"); return;
      // this._perspectiveProjection = pm;
    }
  }
}
