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
// Class: Vector3D
module Shumway.AVM2.AS.flash.geom {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Vector3D extends ASNative {
    static initializer: any = null;
    constructor (x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
      x = +x; y = +y; z = +z; w = +w;
      false && super();
      notImplemented("Dummy Constructor: public flash.geom.Vector3D");
    }
    // Static   JS -> AS Bindings
    static angleBetween: (a: flash.geom.Vector3D, b: flash.geom.Vector3D) => number;
    static distance: (pt1: flash.geom.Vector3D, pt2: flash.geom.Vector3D) => number;
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    x: number;
    y: number;
    z: number;
    w: number;
    clone: () => flash.geom.Vector3D;
    dotProduct: (a: flash.geom.Vector3D) => number;
    crossProduct: (a: flash.geom.Vector3D) => flash.geom.Vector3D;
    length: number;
    lengthSquared: number;
    normalize: () => number;
    scaleBy: (s: number) => void;
    incrementBy: (a: flash.geom.Vector3D) => void;
    decrementBy: (a: flash.geom.Vector3D) => void;
    add: (a: flash.geom.Vector3D) => flash.geom.Vector3D;
    subtract: (a: flash.geom.Vector3D) => flash.geom.Vector3D;
    negate: () => void;
    equals: (toCompare: flash.geom.Vector3D, allFour: boolean = false) => boolean;
    nearEquals: (toCompare: flash.geom.Vector3D, tolerance: number, allFour: boolean = false) => boolean;
    project: () => void;
    copyFrom: (sourceVector3D: flash.geom.Vector3D) => void;
    setTo: (xa: number, ya: number, za: number) => void;
    // Instance AS -> JS Bindings
  }
}
