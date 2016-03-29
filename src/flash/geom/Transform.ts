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
  import checkNullParameter = Shumway.AVMX.checkNullParameter;

  export class Transform extends ASObject {
    static classInitializer: any = null;

    private _displayObject: flash.display.DisplayObject;

    constructor (displayObject: flash.display.DisplayObject) {
      super();
      if (!displayObject) {
        this.sec.throwError("ArgumentError", Errors.NullPointerError, "displayObject");
      }
      this._displayObject = displayObject;
    }

    get matrix(): flash.geom.Matrix {
      if (this._displayObject._matrix3D) {
        return null;
      }
      return this._displayObject._getMatrix().clone().toPixelsInPlace();
    }

    set matrix(value: flash.geom.Matrix) {
      if (this._displayObject._matrix3D) {
        this._displayObject._matrix3D.resetTargetDisplayObject();
        this._displayObject._matrix3D = null;
      }
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
      // For some reason, all dimensions are scale 5x for off-stage objects.
      if (!this._displayObject._stage) {
        matrix.scale(5, 5);
      }
      return matrix;
    }

    get concatenatedColorTransform(): flash.geom.ColorTransform {
      return this._displayObject._getConcatenatedColorTransform();
    }

    get pixelBounds(): flash.geom.Rectangle {
      // Only somewhat implemented because this is largely untested.
      release || somewhatImplemented("public flash.geom.Transform::get pixelBounds");
      var stage = this._displayObject.stage;
      var targetCoordinateSpace = stage || this._displayObject;
      var rect = this._displayObject.getRect(targetCoordinateSpace);
      // For some reason, all dimensions are scale 5x for off-stage objects.
      if (!stage) {
        rect.width *= 5;
        rect.height *= 5;
      }
      return rect;
    }

    get matrix3D(): flash.geom.Matrix3D {
      release || somewhatImplemented("public flash.geom.Transform::get matrix3D");
      // Note: matrix3D returns the original object, *not* a clone.
      return this._displayObject._matrix3D;
    }

    set matrix3D(m: flash.geom.Matrix3D) {
      if (!(this.sec.flash.geom.Matrix3D.axIsType(m))) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, m, 'flash.geom.Matrix3D');
      }

      release || somewhatImplemented("public flash.geom.Transform::set matrix3D");
      // Setting the displayObject on the matrix can throw an error, so do that first.
      m.setTargetDisplayObject(this._displayObject);
      // Note: matrix3D stores the original object, *not* a clone.
      this._displayObject._matrix3D = m;
    }

    getRelativeMatrix3D(relativeTo: flash.display.DisplayObject): flash.geom.Matrix3D {
      checkNullParameter(relativeTo, "relativeTo", this.sec);
      release || somewhatImplemented("public flash.geom.Transform::getRelativeMatrix3D");
      var matrix3D = this._displayObject._matrix3D;
      // TODO: actually calculate the relative matrix.
      return matrix3D ? matrix3D.clone() : null;
    }

    get perspectiveProjection(): flash.geom.PerspectiveProjection {
      release || somewhatImplemented("public flash.geom.Transform::get perspectiveProjection");
      if (!this._displayObject._hasFlags(display.DisplayObjectFlags.HasPerspectiveProjection)) {
        return null;
      }
      var PerspectiveProjectionClass = this.sec.flash.geom.PerspectiveProjection.axClass;
      return PerspectiveProjectionClass.FromDisplayObject(this._displayObject);
    }

    set perspectiveProjection(projection: flash.geom.PerspectiveProjection) {
      release || somewhatImplemented("public flash.geom.Transform::set perspectiveProjection");
      if (!projection) {
        this._displayObject._removeFlags(display.DisplayObjectFlags.HasPerspectiveProjection);
        return;
      }
      this._displayObject._setFlags(display.DisplayObjectFlags.HasPerspectiveProjection);
      this._displayObject._perspectiveProjectionCenterX = +projection._centerX;
      this._displayObject._perspectiveProjectionCenterY = +projection._centerY;
      this._displayObject._perspectiveProjectionFOV = +projection._fieldOfView;
    }
  }
}
