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
// Class: PerspectiveProjection
module Shumway.AVM2.AS.flash.geom {
  import notImplemented = Shumway.Debug.notImplemented;
  export class PerspectiveProjection extends ASNative {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.geom.PerspectiveProjection");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    ctor(): void {
      notImplemented("public flash.geom.PerspectiveProjection::ctor"); return;
    }
    get fieldOfView(): number {
      notImplemented("public flash.geom.PerspectiveProjection::get fieldOfView"); return;
    }
    set fieldOfView(fieldOfViewAngleInDegrees: number) {
      fieldOfViewAngleInDegrees = +fieldOfViewAngleInDegrees;
      notImplemented("public flash.geom.PerspectiveProjection::set fieldOfView"); return;
    }
    get projectionCenter(): flash.geom.Point {
      notImplemented("public flash.geom.PerspectiveProjection::get projectionCenter"); return;
    }
    set projectionCenter(p: flash.geom.Point) {
      p = p;
      notImplemented("public flash.geom.PerspectiveProjection::set projectionCenter"); return;
    }
    get focalLength(): number {
      notImplemented("public flash.geom.PerspectiveProjection::get focalLength"); return;
    }
    set focalLength(value: number) {
      value = +value;
      notImplemented("public flash.geom.PerspectiveProjection::set focalLength"); return;
    }
    toMatrix3D(): flash.geom.Matrix3D {
      notImplemented("public flash.geom.PerspectiveProjection::toMatrix3D"); return;
    }
  }
}
