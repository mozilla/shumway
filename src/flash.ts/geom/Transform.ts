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
  export class Transform extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // [];
    
    constructor (displayObject: flash.display.DisplayObject) {
      displayObject = displayObject;
      false && super();
      notImplemented("Dummy Constructor: public flash.geom.Transform");
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    
    // _matrix: flash.geom.Matrix;
    // _colorTransform: flash.geom.ColorTransform;
    // _concatenatedMatrix: flash.geom.Matrix;
    // _concatenatedColorTransform: flash.geom.ColorTransform;
    // _pixelBounds: flash.geom.Rectangle;
    // _matrix3D: flash.geom.Matrix3D;
    // _perspectiveProjection: flash.geom.PerspectiveProjection;
    get matrix(): flash.geom.Matrix {
      notImplemented("public flash.geom.Transform::get matrix"); return;
      // return this._matrix;
    }
    set matrix(value: flash.geom.Matrix) {
      value = value;
      notImplemented("public flash.geom.Transform::set matrix"); return;
      // this._matrix = value;
    }
    get colorTransform(): flash.geom.ColorTransform {
      notImplemented("public flash.geom.Transform::get colorTransform"); return;
      // return this._colorTransform;
    }
    set colorTransform(value: flash.geom.ColorTransform) {
      value = value;
      notImplemented("public flash.geom.Transform::set colorTransform"); return;
      // this._colorTransform = value;
    }
    get concatenatedMatrix(): flash.geom.Matrix {
      notImplemented("public flash.geom.Transform::get concatenatedMatrix"); return;
      // return this._concatenatedMatrix;
    }
    get concatenatedColorTransform(): flash.geom.ColorTransform {
      notImplemented("public flash.geom.Transform::get concatenatedColorTransform"); return;
      // return this._concatenatedColorTransform;
    }
    get pixelBounds(): flash.geom.Rectangle {
      notImplemented("public flash.geom.Transform::get pixelBounds"); return;
      // return this._pixelBounds;
    }
    get matrix3D(): flash.geom.Matrix3D {
      notImplemented("public flash.geom.Transform::get matrix3D"); return;
      // return this._matrix3D;
    }
    set matrix3D(m: flash.geom.Matrix3D) {
      m = m;
      notImplemented("public flash.geom.Transform::set matrix3D"); return;
      // this._matrix3D = m;
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
      target = target;
      notImplemented("public flash.geom.Transform::ctor"); return;
    }
  }
}
