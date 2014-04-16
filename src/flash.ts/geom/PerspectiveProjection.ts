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
// Class: PerspectiveProjection
module Shumway.AVM2.AS.flash.geom {
  import notImplemented = Shumway.Debug.notImplemented;
  export class PerspectiveProjection extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // [];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.geom.PerspectiveProjection");
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    
    // _fieldOfView: number;
    // _projectionCenter: flash.geom.Point;
    // _focalLength: number;
    get fieldOfView(): number {
      notImplemented("public flash.geom.PerspectiveProjection::get fieldOfView"); return;
      // return this._fieldOfView;
    }
    set fieldOfView(fieldOfViewAngleInDegrees: number) {
      fieldOfViewAngleInDegrees = +fieldOfViewAngleInDegrees;
      notImplemented("public flash.geom.PerspectiveProjection::set fieldOfView"); return;
      // this._fieldOfView = fieldOfViewAngleInDegrees;
    }
    get projectionCenter(): flash.geom.Point {
      notImplemented("public flash.geom.PerspectiveProjection::get projectionCenter"); return;
      // return this._projectionCenter;
    }
    set projectionCenter(p: flash.geom.Point) {
      p = p;
      notImplemented("public flash.geom.PerspectiveProjection::set projectionCenter"); return;
      // this._projectionCenter = p;
    }
    get focalLength(): number {
      notImplemented("public flash.geom.PerspectiveProjection::get focalLength"); return;
      // return this._focalLength;
    }
    set focalLength(value: number) {
      value = +value;
      notImplemented("public flash.geom.PerspectiveProjection::set focalLength"); return;
      // this._focalLength = value;
    }
    toMatrix3D(): flash.geom.Matrix3D {
      notImplemented("public flash.geom.PerspectiveProjection::toMatrix3D"); return;
    }
  }
}
