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
// Class: Matrix
module Shumway.AVM2.AS.flash.geom {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Matrix extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["a", "b", "c", "d", "tx", "ty", "concat", "invert", "identity", "createBox", "createGradientBox", "rotate", "translate", "scale", "deltaTransformPoint", "transformPoint", "copyFrom", "setTo", "copyRowTo", "copyColumnTo", "copyRowFrom", "copyColumnFrom", "clone", "toString"];
    
    constructor (a: number = 1, b: number = 0, c: number = 0, d: number = 1, tx: number = 0, ty: number = 0) {
      a = +a; b = +b; c = +c; d = +d; tx = +tx; ty = +ty;
      false && super();
      notImplemented("Dummy Constructor: public flash.geom.Matrix");
    }
    
    // JS -> AS Bindings
    
    a: number;
    b: number;
    c: number;
    d: number;
    tx: number;
    ty: number;
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
    clone: () => flash.geom.Matrix;
    
    // AS -> JS Bindings
    
  }
}
