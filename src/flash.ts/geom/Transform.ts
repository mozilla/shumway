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
 * limitations undxr the License.
 */
// Class: Transform
module Shumway.AVM2.AS.flash.geom {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Transform extends ASNative {
    static initializer: any = null;
    constructor (displayObject: flash.display.DisplayObject) {
      displayObject = displayObject;
      false && super();
      notImplemented("Dummy Constructor: public flash.geom.Transform");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    get matrix(): flash.geom.Matrix {
      notImplemented("public flash.geom.Transform::get matrix"); return;
    }
    set matrix(value: flash.geom.Matrix) {
      value = value;
      notImplemented("public flash.geom.Transform::set matrix"); return;
    }
    get colorTransform(): flash.geom.ColorTransform {
      notImplemented("public flash.geom.Transform::get colorTransform"); return;
    }
    set colorTransform(value: flash.geom.ColorTransform) {
      value = value;
      notImplemented("public flash.geom.Transform::set colorTransform"); return;
    }
    get concatenatedMatrix(): flash.geom.Matrix {
      notImplemented("public flash.geom.Transform::get concatenatedMatrix"); return;
    }
    get concatenatedColorTransform(): flash.geom.ColorTransform {
      notImplemented("public flash.geom.Transform::get concatenatedColorTransform"); return;
    }
    get pixelBounds(): flash.geom.Rectangle {
      notImplemented("public flash.geom.Transform::get pixelBounds"); return;
    }
    ctor(displayObject: flash.display.DisplayObject): void {
      displayObject = displayObject;
      notImplemented("public flash.geom.Transform::ctor"); return;
    }
    get matrix3D(): flash.geom.Matrix3D {
      notImplemented("public flash.geom.Transform::get matrix3D"); return;
    }
    set matrix3D(m: flash.geom.Matrix3D) {
      m = m;
      notImplemented("public flash.geom.Transform::set matrix3D"); return;
    }
    getRelativeMatrix3D(relativeTo: flash.display.DisplayObject): flash.geom.Matrix3D {
      relativeTo = relativeTo;
      notImplemented("public flash.geom.Transform::getRelativeMatrix3D"); return;
    }
    get perspectiveProjection(): flash.geom.PerspectiveProjection {
      notImplemented("public flash.geom.Transform::get perspectiveProjection"); return;
    }
    set perspectiveProjection(pm: flash.geom.PerspectiveProjection) {
      pm = pm;
      notImplemented("public flash.geom.Transform::set perspectiveProjection"); return;
    }
  }
}
