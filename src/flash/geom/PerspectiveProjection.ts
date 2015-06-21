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
// Class: PerspectiveProjection
module Shumway.AVMX.AS.flash.geom {
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;

  export class PerspectiveProjection extends ASObject {
    
    static classInitializer: any = null;
    
    constructor () {
      super();
      this._fieldOfView = 55;
      this._focalLength = 480.24554443359375;
      this._projectionCenter = new this.sec.flash.geom.Point(250, 250);
    }

    private _fieldOfView: number;
    private _focalLength: number;
    private _projectionCenter: flash.geom.Point;

    get fieldOfView(): number {
      somewhatImplemented("public flash.geom.PerspectiveProjection::get fieldOfView");
      return this._fieldOfView;
    }
    set fieldOfView(fieldOfViewAngleInDegrees: number) {
      fieldOfViewAngleInDegrees = +fieldOfViewAngleInDegrees;
      somewhatImplemented("public flash.geom.PerspectiveProjection::set fieldOfView");
      this._fieldOfView = fieldOfViewAngleInDegrees;
    }
    get projectionCenter(): flash.geom.Point {
      somewhatImplemented("public flash.geom.PerspectiveProjection::get projectionCenter");
      return this._projectionCenter;
    }
    set projectionCenter(p: flash.geom.Point) {
      somewhatImplemented("public flash.geom.PerspectiveProjection::set projectionCenter");
      this._setProjectionCenterNoWarn(p);
    }
    // The Loader sets an initial projectionCenter, and we don't want to warn about that.
    _setProjectionCenterNoWarn(p: flash.geom.Point) {
      this._projectionCenter = p;
    }
    get focalLength(): number {
      somewhatImplemented("public flash.geom.PerspectiveProjection::get focalLength");
      return this._focalLength;
    }
    set focalLength(value: number) {
      value = +value;
      somewhatImplemented("public flash.geom.PerspectiveProjection::set focalLength");
      this._focalLength = value;
    }
    toMatrix3D(): flash.geom.Matrix3D {
      somewhatImplemented("public flash.geom.PerspectiveProjection::toMatrix3D");
      return new this.sec.flash.geom.Matrix3D();
    }
    
    clone(): PerspectiveProjection {
      var clone = new this.sec.flash.geom.PerspectiveProjection();
      clone._fieldOfView = this._fieldOfView;
      clone._focalLength = this._focalLength;
      clone._projectionCenter = this._projectionCenter;
      return clone;
    }
  }
}
