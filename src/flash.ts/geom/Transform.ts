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
// Class: Transform
module Shumway.AVM2.AS.flash.geom {
  import notImplemented = Shumway.Debug.notImplemented;
  import throwError = Shumway.AVM2.Runtime.throwError;

  export class Transform extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // [];

    private _target: flash.display.DisplayObject;

    constructor (displayObject: flash.display.DisplayObject) {
      false && super();
      notImplemented("Dummy Constructor: public flash.geom.ColorTransform");
    }

    get matrix(): flash.geom.Matrix {
      return this._target._currentTransform.clone();
    }
    set matrix(value: flash.geom.Matrix) {
      //value = value;
      this._target._setTransformMatrix(value, true);
    }
    get colorTransform(): flash.geom.ColorTransform {
      return this._target._colorTransform.clone();
    }
    set colorTransform(value: flash.geom.ColorTransform) {
      //value = value;
      this._target._setColorTransform(value);
    }
    get concatenatedMatrix(): flash.geom.Matrix {
      return this._target._getConcatenatedTransform(null).clone();
    }
    get concatenatedColorTransform(): flash.geom.ColorTransform {
      var colorTransform = new ColorTransform();
      var currentNode = this._target;
      do {
        colorTransform.concat(currentNode._colorTransform);
        currentNode = currentNode._parent;
      } while (currentNode);
      return colorTransform;
    }
    get pixelBounds(): flash.geom.Rectangle {
      notImplemented("public flash.geom.Transform::get pixelBounds"); return;
      // return this._pixelBounds;
    }
    get matrix3D(): flash.geom.Matrix3D {
      var m = this._target._current3dTransform;
      return m && m.clone();
    }
    set matrix3D(m: flash.geom.Matrix3D) {
      //m = m;

      if (!(m instanceof Matrix3D)) {
        throwError('TypeError', Errors.CheckTypeFailedError, m, 'flash.geom.Matrix3D');
      }

      var raw = m.rawData;
      // TODO why is this not a 3D matrix?
      this.matrix = new flash.geom.Matrix(
        raw.asGetPublicProperty(0),
        raw.asGetPublicProperty(1),
        raw.asGetPublicProperty(4),
        raw.asGetPublicProperty(5),
        raw.asGetPublicProperty(12),
        raw.asGetPublicProperty(13)
      );
      // this.matrix will reset this._target._current3DTransform
      this._target._current3DTransform = m;
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
    ctor(target: flash.display.DisplayObject): void {
      assert(target);
      this._target = target;
    }
  }
}
