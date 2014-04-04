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
// Class: Matrix3D
module Shumway.AVM2.AS.flash.geom {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Matrix3D extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // [];
    
    constructor (v: ASVector<any> = null) {
      v = v;
      false && super();
      notImplemented("Dummy Constructor: public flash.geom.Matrix3D");
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    static interpolate(thisMat: flash.geom.Matrix3D, toMat: flash.geom.Matrix3D, percent: number): flash.geom.Matrix3D {
      thisMat = thisMat; toMat = toMat; percent = +percent;
      notImplemented("public flash.geom.Matrix3D::static interpolate"); return;
    }
    
    // _rawData: ASVector<any>;
    // _position: flash.geom.Vector3D;
    // _determinant: number;
    get rawData(): ASVector<any> {
      notImplemented("public flash.geom.Matrix3D::get rawData"); return;
      // return this._rawData;
    }
    set rawData(v: ASVector<any>) {
      v = v;
      notImplemented("public flash.geom.Matrix3D::set rawData"); return;
      // this._rawData = v;
    }
    get position(): flash.geom.Vector3D {
      notImplemented("public flash.geom.Matrix3D::get position"); return;
      // return this._position;
    }
    set position(pos: flash.geom.Vector3D) {
      pos = pos;
      notImplemented("public flash.geom.Matrix3D::set position"); return;
      // this._position = pos;
    }
    get determinant(): number {
      notImplemented("public flash.geom.Matrix3D::get determinant"); return;
      // return this._determinant;
    }
    clone(): flash.geom.Matrix3D {
      notImplemented("public flash.geom.Matrix3D::clone"); return;
    }
    copyToMatrix3D(dest: flash.geom.Matrix3D): void {
      dest = dest;
      notImplemented("public flash.geom.Matrix3D::copyToMatrix3D"); return;
    }
    append(lhs: flash.geom.Matrix3D): void {
      lhs = lhs;
      notImplemented("public flash.geom.Matrix3D::append"); return;
    }
    prepend(rhs: flash.geom.Matrix3D): void {
      rhs = rhs;
      notImplemented("public flash.geom.Matrix3D::prepend"); return;
    }
    invert(): boolean {
      notImplemented("public flash.geom.Matrix3D::invert"); return;
    }
    identity(): void {
      notImplemented("public flash.geom.Matrix3D::identity"); return;
    }
    decompose(orientationStyle: string = "eulerAngles"): ASVector<any> {
      orientationStyle = "" + orientationStyle;
      notImplemented("public flash.geom.Matrix3D::decompose"); return;
    }
    recompose(components: ASVector<any>, orientationStyle: string = "eulerAngles"): boolean {
      components = components; orientationStyle = "" + orientationStyle;
      notImplemented("public flash.geom.Matrix3D::recompose"); return;
    }
    appendTranslation(x: number, y: number, z: number): void {
      x = +x; y = +y; z = +z;
      notImplemented("public flash.geom.Matrix3D::appendTranslation"); return;
    }
    appendRotation(degrees: number, axis: flash.geom.Vector3D, pivotPoint: flash.geom.Vector3D = null): void {
      degrees = +degrees; axis = axis; pivotPoint = pivotPoint;
      notImplemented("public flash.geom.Matrix3D::appendRotation"); return;
    }
    appendScale(xScale: number, yScale: number, zScale: number): void {
      xScale = +xScale; yScale = +yScale; zScale = +zScale;
      notImplemented("public flash.geom.Matrix3D::appendScale"); return;
    }
    prependTranslation(x: number, y: number, z: number): void {
      x = +x; y = +y; z = +z;
      notImplemented("public flash.geom.Matrix3D::prependTranslation"); return;
    }
    prependRotation(degrees: number, axis: flash.geom.Vector3D, pivotPoint: flash.geom.Vector3D = null): void {
      degrees = +degrees; axis = axis; pivotPoint = pivotPoint;
      notImplemented("public flash.geom.Matrix3D::prependRotation"); return;
    }
    prependScale(xScale: number, yScale: number, zScale: number): void {
      xScale = +xScale; yScale = +yScale; zScale = +zScale;
      notImplemented("public flash.geom.Matrix3D::prependScale"); return;
    }
    transformVector(v: flash.geom.Vector3D): flash.geom.Vector3D {
      v = v;
      notImplemented("public flash.geom.Matrix3D::transformVector"); return;
    }
    deltaTransformVector(v: flash.geom.Vector3D): flash.geom.Vector3D {
      v = v;
      notImplemented("public flash.geom.Matrix3D::deltaTransformVector"); return;
    }
    transformVectors(vin: ASVector<any>, vout: ASVector<any>): void {
      vin = vin; vout = vout;
      notImplemented("public flash.geom.Matrix3D::transformVectors"); return;
    }
    transpose(): void {
      notImplemented("public flash.geom.Matrix3D::transpose"); return;
    }
    pointAt(pos: flash.geom.Vector3D, at: flash.geom.Vector3D = null, up: flash.geom.Vector3D = null): void {
      pos = pos; at = at; up = up;
      notImplemented("public flash.geom.Matrix3D::pointAt"); return;
    }
    interpolateTo(toMat: flash.geom.Matrix3D, percent: number): void {
      toMat = toMat; percent = +percent;
      notImplemented("public flash.geom.Matrix3D::interpolateTo"); return;
    }
    copyFrom(sourceMatrix3D: flash.geom.Matrix3D): void {
      sourceMatrix3D = sourceMatrix3D;
      notImplemented("public flash.geom.Matrix3D::copyFrom"); return;
    }
    copyRawDataTo(vector: ASVector<any>, index: number /*uint*/ = 0, transpose: boolean = false): void {
      vector = vector; index = index >>> 0; transpose = !!transpose;
      notImplemented("public flash.geom.Matrix3D::copyRawDataTo"); return;
    }
    copyRawDataFrom(vector: ASVector<any>, index: number /*uint*/ = 0, transpose: boolean = false): void {
      vector = vector; index = index >>> 0; transpose = !!transpose;
      notImplemented("public flash.geom.Matrix3D::copyRawDataFrom"); return;
    }
    copyRowTo(row: number /*uint*/, vector3D: flash.geom.Vector3D): void {
      row = row >>> 0; vector3D = vector3D;
      notImplemented("public flash.geom.Matrix3D::copyRowTo"); return;
    }
    copyColumnTo(column: number /*uint*/, vector3D: flash.geom.Vector3D): void {
      column = column >>> 0; vector3D = vector3D;
      notImplemented("public flash.geom.Matrix3D::copyColumnTo"); return;
    }
    copyRowFrom(row: number /*uint*/, vector3D: flash.geom.Vector3D): void {
      row = row >>> 0; vector3D = vector3D;
      notImplemented("public flash.geom.Matrix3D::copyRowFrom"); return;
    }
    copyColumnFrom(column: number /*uint*/, vector3D: flash.geom.Vector3D): void {
      column = column >>> 0; vector3D = vector3D;
      notImplemented("public flash.geom.Matrix3D::copyColumnFrom"); return;
    }
    ctor(v: ASVector<any> = null): void {
      v = v;
      notImplemented("public flash.geom.Matrix3D::ctor"); return;
    }
  }
}
