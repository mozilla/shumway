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
// Class: Utils3D
module Shumway.AVM2.AS.flash.geom {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Utils3D extends ASNative {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.geom.Utils3D");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    static projectVector(m: flash.geom.Matrix3D, v: flash.geom.Vector3D): flash.geom.Vector3D {
      m = m; v = v;
      notImplemented("public flash.geom.Utils3D::static projectVector"); return;
    }
    static projectVectors(m: flash.geom.Matrix3D, verts: ASVector<number>, projectedVerts: ASVector<number>, uvts: ASVector<number>): void {
      m = m; verts = verts; projectedVerts = projectedVerts; uvts = uvts;
      notImplemented("public flash.geom.Utils3D::static projectVectors"); return;
    }
    static pointTowards(percent: number, mat: flash.geom.Matrix3D, pos: flash.geom.Vector3D, at: flash.geom.Vector3D = null, up: flash.geom.Vector3D = null): flash.geom.Matrix3D {
      percent = +percent; mat = mat; pos = pos; at = at; up = up;
      notImplemented("public flash.geom.Utils3D::static pointTowards"); return;
    }
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
  }
}
