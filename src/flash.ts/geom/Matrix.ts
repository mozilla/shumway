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
// Class: Matrix
module Shumway.AVM2.AS.flash.geom {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Matrix extends ASNative {
    static initializer: any = null;
    constructor (a: number = 1, b: number = 0, c: number = 0, d: number = 1, tx: number = 0, ty: number = 0) {
      a = +a; b = +b; c = +c; d = +d; tx = +tx; ty = +ty;
      false && super();
      notImplemented("Dummy Constructor: public flash.geom.Matrix");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    a: number;
    b: number;
    c: number;
    d: number;
    tx: number;
    ty: number;
    clone: () => flash.geom.Matrix;
    concat: (m: flash.geom.Matrix) => void;
    invert: () => void;
    identity: () => void;
    createBox: (scaleX: number, scaleY: number, rotation: number = 0, tx: number = 0, ty: number = 0) => void;
    createGradientBox: (width: number, height: number, rotation: number = 0, tx: number = 0, ty: number = 0) => void;
    rotate: (angle: number) => void;
    translate: (dx: number, dy: number) => void;
    scale: (sx: number, sy: number) => void;
    deltaTransformPoint: (point: flash.geom.Point) => flash.geom.Point;
    transformPoint: (point: flash.geom.Point) => flash.geom.Point;
    copyFrom: (sourceMatrix: flash.geom.Matrix) => void;
    setTo: (aa: number, ba: number, ca: number, da: number, txa: number, tya: number) => void;
    copyRowTo: (row: number /*uint*/, vector3D: flash.geom.Vector3D) => void;
    copyColumnTo: (column: number /*uint*/, vector3D: flash.geom.Vector3D) => void;
    copyRowFrom: (row: number /*uint*/, vector3D: flash.geom.Vector3D) => void;
    copyColumnFrom: (column: number /*uint*/, vector3D: flash.geom.Vector3D) => void;
    // Instance AS -> JS Bindings
  }
}
