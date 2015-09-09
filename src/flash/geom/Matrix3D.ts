/**
 * Copyright 2014 Mozilla Foundation
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
module Shumway.AVMX.AS.flash.geom {
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;

  /*
   * _matrix stores data by columns
   *  | 0  4  8  12 |
   *  | 1  5  9  13 |
   *  | 2  6 10  14 |
   *  | 3  7 11  15 |
   */

  var precision = 1e-7;

  var transposeTransform = new Uint32Array([
    0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15
  ]);

  function getRotationMatrix(theta, u, v, w, a, b, c, sec: ISecurityDomain) {
    // http://inside.mines.edu/~gmurray/ArbitraryAxisRotation/
    var u2 = u * u, v2 = v * v, w2 = w * w;
    var L2 = u2 + v2 + w2, L = Math.sqrt(L2);
    u /= L; v /= L; w /= L;
    u2 /= L2; v2 /= L2; w2 /= L2;
    var cos = Math.cos(theta), sin = Math.sin(theta);

    return sec.flash.geom.Matrix3D.axClass.FromArray([
      u2 + (v2 + w2) * cos,
      u * v * (1 - cos) + w * sin,
      u * w * (1 - cos) - v * sin,
      0,
      u * v * (1 - cos) - w * sin,
      v2 + (u2 + w2) * cos,
      v * w * (1 - cos) + u * sin,
      0,
      u * w * (1 - cos) + v * sin,
      v * w * (1 - cos) - u * sin,
      w2 + (u2 + v2) * cos,
      0,
      (a * (v2 + w2) - u * (b * v + c * w)) * (1 - cos) + (b * w - c * v) * sin,
      (b * (u2 + w2) - v * (a * u + c * w)) * (1 - cos) + (c * u - a * w) * sin,
      (c * (u2 + v2) - w * (a * u + b * v)) * (1 - cos) + (a * v - b * u) * sin,
      1
    ]);
  }

  export class Matrix3D extends ASObject {

    static classInitializer = null;

    static axClass: typeof Matrix3D;

    static FromArray(matrix: any) {
      var result = Object.create(this.tPrototype);
      result._matrix = new Float32Array(matrix);
      return result;
    }

    private _matrix: Float32Array;
    private _displayObject: flash.display.DisplayObject;

    constructor (v: any = null) {
      super();
      this._matrix = new Float32Array(16);
      if (v && v.length >= 16) {
        this.copyRawDataFrom(v, 0, false);
      } else {
        this.identity();
      }
    }
    
    static interpolate(thisMat: flash.geom.Matrix3D, toMat: flash.geom.Matrix3D, percent: number): flash.geom.Matrix3D {
      thisMat = thisMat; toMat = toMat; percent = +percent;
      release || notImplemented("public flash.geom.Matrix3D::static interpolate"); return;
    }

    setTargetDisplayObject(object: flash.display.DisplayObject): void {
      if (this._displayObject) {
        this.sec.throwError('ArgumentError', Errors.Matrix3DRefCannontBeShared);
      }
      this._displayObject = object;
    }

    resetTargetDisplayObject(): void {
      release || Debug.assert(this._displayObject);
      this._displayObject = null;
    }

    get rawData(): any {
      var result = new this.sec.Float64Vector();
      this.copyRawDataTo(result, 0, false);
      return result;
    }
    set rawData(v: any) {
      this.copyRawDataFrom(v, 0, false);
    }
    get position(): flash.geom.Vector3D {
      var m = this._matrix;
      return new this.sec.flash.geom.Vector3D(m[12], m[13], m[14]);
    }
    set position(pos: flash.geom.Vector3D) {
      var m = this._matrix;
      m[12] = pos.x;
      m[13] = pos.y;
      m[14] = pos.z;
    }
    get determinant(): number {
      var m = this._matrix;
      var m11 = m[0], m12 = m[4], m13 = m[8 ], m14 = m[12],
          m21 = m[1], m22 = m[5], m23 = m[9 ], m24 = m[13],
          m31 = m[2], m32 = m[6], m33 = m[10], m34 = m[14],
          m41 = m[3], m42 = m[7], m43 = m[11], m44 = m[15];
      var d;
      d = m11 * (m22 * (m33 * m44 - m43 * m34) - m32 * (m23 * m44 - m43 * m24) + m42 * (m23 * m34 - m33 * m24)) -
          m21 * (m12 * (m33 * m44 - m43 * m34) - m32 * (m13 * m44 - m43 * m14) + m42 * (m13 * m34 - m33 * m14)) +
          m31 * (m12 * (m23 * m44 - m43 * m24) - m22 * (m13 * m44 - m43 * m14) + m42 * (m13 * m24 - m23 * m14)) -
          m41 * (m12 * (m23 * m34 - m33 * m24) - m22 * (m13 * m34 - m33 * m14) + m32 * (m13 * m24 - m23 * m14));
      return d;
    }
    clone(): flash.geom.Matrix3D {
      return this.sec.flash.geom.Matrix3D.axClass.FromArray(this._matrix);
    }
    copyToMatrix3D(dest: flash.geom.Matrix3D): void {
      dest = dest;
      dest._matrix.set(this._matrix);
    }
    append(lhs: flash.geom.Matrix3D): void {
      var ma = lhs._matrix, mb = this._matrix, m = this._matrix;
      var ma11 = ma[0], ma12 = ma[4], ma13 = ma[8 ], ma14 = ma[12],
          ma21 = ma[1], ma22 = ma[5], ma23 = ma[9 ], ma24 = ma[13],
          ma31 = ma[2], ma32 = ma[6], ma33 = ma[10], ma34 = ma[14],
          ma41 = ma[3], ma42 = ma[7], ma43 = ma[11], ma44 = ma[15];

      var mb11 = mb[0], mb12 = mb[4], mb13 = mb[8 ], mb14 = mb[12],
          mb21 = mb[1], mb22 = mb[5], mb23 = mb[9 ], mb24 = mb[13],
          mb31 = mb[2], mb32 = mb[6], mb33 = mb[10], mb34 = mb[14],
          mb41 = mb[3], mb42 = mb[7], mb43 = mb[11], mb44 = mb[15];

      m[0 ] = ma11 * mb11 + ma12 * mb21 + ma13 * mb31 + ma14 * mb41;
      m[1 ] = ma21 * mb11 + ma22 * mb21 + ma23 * mb31 + ma24 * mb41;
      m[2 ] = ma31 * mb11 + ma32 * mb21 + ma33 * mb31 + ma34 * mb41;
      m[3 ] = ma41 * mb11 + ma42 * mb21 + ma43 * mb31 + ma44 * mb41;

      m[4 ] = ma11 * mb12 + ma12 * mb22 + ma13 * mb32 + ma14 * mb42;
      m[5 ] = ma21 * mb12 + ma22 * mb22 + ma23 * mb32 + ma24 * mb42;
      m[6 ] = ma31 * mb12 + ma32 * mb22 + ma33 * mb32 + ma34 * mb42;
      m[7 ] = ma41 * mb12 + ma42 * mb22 + ma43 * mb32 + ma44 * mb42;

      m[8 ] = ma11 * mb13 + ma12 * mb23 + ma13 * mb33 + ma14 * mb43;
      m[9 ] = ma21 * mb13 + ma22 * mb23 + ma23 * mb33 + ma24 * mb43;
      m[10] = ma31 * mb13 + ma32 * mb23 + ma33 * mb33 + ma34 * mb43;
      m[11] = ma41 * mb13 + ma42 * mb23 + ma43 * mb33 + ma44 * mb43;

      m[12] = ma11 * mb14 + ma12 * mb24 + ma13 * mb34 + ma14 * mb44;
      m[13] = ma21 * mb14 + ma22 * mb24 + ma23 * mb34 + ma24 * mb44;
      m[14] = ma31 * mb14 + ma32 * mb24 + ma33 * mb34 + ma34 * mb44;
      m[15] = ma41 * mb14 + ma42 * mb24 + ma43 * mb34 + ma44 * mb44;
    }
    prepend(rhs: flash.geom.Matrix3D): void {
      var ma = this._matrix, mb = rhs._matrix, m = this._matrix;
      var ma11 = ma[0], ma12 = ma[4], ma13 = ma[8 ], ma14 = ma[12],
          ma21 = ma[1], ma22 = ma[5], ma23 = ma[9 ], ma24 = ma[13],
          ma31 = ma[2], ma32 = ma[6], ma33 = ma[10], ma34 = ma[14],
          ma41 = ma[3], ma42 = ma[7], ma43 = ma[11], ma44 = ma[15];
      var mb11 = mb[0], mb12 = mb[4], mb13 = mb[8 ], mb14 = mb[12],
          mb21 = mb[1], mb22 = mb[5], mb23 = mb[9 ], mb24 = mb[13],
          mb31 = mb[2], mb32 = mb[6], mb33 = mb[10], mb34 = mb[14],
          mb41 = mb[3], mb42 = mb[7], mb43 = mb[11], mb44 = mb[15];

      m[0 ] = ma11 * mb11 + ma12 * mb21 + ma13 * mb31 + ma14 * mb41;
      m[1 ] = ma21 * mb11 + ma22 * mb21 + ma23 * mb31 + ma24 * mb41;
      m[2 ] = ma31 * mb11 + ma32 * mb21 + ma33 * mb31 + ma34 * mb41;
      m[3 ] = ma41 * mb11 + ma42 * mb21 + ma43 * mb31 + ma44 * mb41;

      m[4 ] = ma11 * mb12 + ma12 * mb22 + ma13 * mb32 + ma14 * mb42;
      m[5 ] = ma21 * mb12 + ma22 * mb22 + ma23 * mb32 + ma24 * mb42;
      m[6 ] = ma31 * mb12 + ma32 * mb22 + ma33 * mb32 + ma34 * mb42;
      m[7 ] = ma41 * mb12 + ma42 * mb22 + ma43 * mb32 + ma44 * mb42;

      m[8 ] = ma11 * mb13 + ma12 * mb23 + ma13 * mb33 + ma14 * mb43;
      m[9 ] = ma21 * mb13 + ma22 * mb23 + ma23 * mb33 + ma24 * mb43;
      m[10] = ma31 * mb13 + ma32 * mb23 + ma33 * mb33 + ma34 * mb43;
      m[11] = ma41 * mb13 + ma42 * mb23 + ma43 * mb33 + ma44 * mb43;

      m[12] = ma11 * mb14 + ma12 * mb24 + ma13 * mb34 + ma14 * mb44;
      m[13] = ma21 * mb14 + ma22 * mb24 + ma23 * mb34 + ma24 * mb44;
      m[14] = ma31 * mb14 + ma32 * mb24 + ma33 * mb34 + ma34 * mb44;
      m[15] = ma41 * mb14 + ma42 * mb24 + ma43 * mb34 + ma44 * mb44;
    }
    invert(): boolean {
      var d = this.determinant;
      if (Math.abs(d) < precision) {
        return false;
      }

      d = 1 / d;
      var m = this._matrix;
      // operating on transposed matrix
      var m11 = m[0 ], m12 = m[1 ], m13 = m[2 ], m14 = m[3 ],
          m21 = m[4 ], m22 = m[5 ], m23 = m[6 ], m24 = m[7 ],
          m31 = m[8 ], m32 = m[9 ], m33 = m[10], m34 = m[11],
          m41 = m[12], m42 = m[13], m43 = m[14], m44 = m[15];

      m[0 ] =  d * (m22 * (m33 * m44 - m43 * m34) - m32 * (m23 * m44 - m43 * m24) + m42 * (m23 * m34 - m33 * m24));
      m[1 ] = -d * (m12 * (m33 * m44 - m43 * m34) - m32 * (m13 * m44 - m43 * m14) + m42 * (m13 * m34 - m33 * m14));
      m[2 ] =  d * (m12 * (m23 * m44 - m43 * m24) - m22 * (m13 * m44 - m43 * m14) + m42 * (m13 * m24 - m23 * m14));
      m[3 ] = -d * (m12 * (m23 * m34 - m33 * m24) - m22 * (m13 * m34 - m33 * m14) + m32 * (m13 * m24 - m23 * m14));

      m[4 ] = -d * (m21 * (m33 * m44 - m43 * m34) - m31 * (m23 * m44 - m43 * m24) + m41 * (m23 * m34 - m33 * m24));
      m[5 ] =  d * (m11 * (m33 * m44 - m43 * m34) - m31 * (m13 * m44 - m43 * m14) + m41 * (m13 * m34 - m33 * m14));
      m[6 ] = -d * (m11 * (m23 * m44 - m43 * m24) - m21 * (m13 * m44 - m43 * m14) + m41 * (m13 * m24 - m23 * m14));
      m[7 ] =  d * (m11 * (m23 * m34 - m33 * m24) - m21 * (m13 * m34 - m33 * m14) + m31 * (m13 * m24 - m23 * m14));

      m[8 ] =  d * (m21 * (m32 * m44 - m42 * m34) - m31 * (m22 * m44 - m42 * m24) + m41 * (m22 * m34 - m32 * m24));
      m[9 ] = -d * (m11 * (m32 * m44 - m42 * m34) - m31 * (m12 * m44 - m42 * m14) + m41 * (m12 * m34 - m32 * m14));
      m[10] =  d * (m11 * (m22 * m44 - m42 * m24) - m21 * (m12 * m44 - m42 * m14) + m41 * (m12 * m24 - m22 * m14));
      m[11] = -d * (m11 * (m22 * m34 - m32 * m24) - m21 * (m12 * m34 - m32 * m14) + m31 * (m12 * m24 - m22 * m14));

      m[12] = -d * (m21 * (m32 * m43 - m42 * m33) - m31 * (m22 * m43 - m42 * m23) + m41 * (m22 * m33 - m32 * m23));
      m[13] =  d * (m11 * (m32 * m43 - m42 * m33) - m31 * (m12 * m43 - m42 * m13) + m41 * (m12 * m33 - m32 * m13));
      m[14] = -d * (m11 * (m22 * m43 - m42 * m23) - m21 * (m12 * m43 - m42 * m13) + m41 * (m12 * m23 - m22 * m13));
      m[15] =  d * (m11 * (m22 * m33 - m32 * m23) - m21 * (m12 * m33 - m32 * m13) + m31 * (m12 * m23 - m22 * m13));

      return true;
    }
    identity(): void {
      var m = this._matrix;
      m[0] = m[5] = m[10] = m[15] = 1;
      m[1] = m[2] = m[3] = m[4] = m[6] = m[7] = m[8] = m[9] = m[11] = m[12] = m[13] = m[14] = 0;
    }
    decompose(orientationStyle: string = "eulerAngles"): Float64Vector {
      orientationStyle = axCoerceString(orientationStyle);
      release || notImplemented("public flash.geom.Matrix3D::decompose"); return;
    }
    recompose(components: Float64Vector, orientationStyle: string = "eulerAngles"): boolean {
      orientationStyle = axCoerceString(orientationStyle);
      release || notImplemented("public flash.geom.Matrix3D::recompose"); return;
    }
    appendTranslation(x: number, y: number, z: number): void {
      x = +x; y = +y; z = +z;
      var m = this._matrix;
      var m41 = m[3], m42 = m[7], m43 = m[11], m44 = m[15];

      m[0 ] += x * m41;
      m[1 ] += y * m41;
      m[2 ] += z * m41;

      m[4 ] += x * m42;
      m[5 ] += y * m42;
      m[6 ] += z * m42;

      m[8 ] += x * m43;
      m[9 ] += y * m43;
      m[10] += z * m43;

      m[12] += x * m44;
      m[13] += y * m44;
      m[14] += z * m44;
    }
    appendRotation(degrees: number, axis: flash.geom.Vector3D, pivotPoint: flash.geom.Vector3D = null): void {
      degrees = +degrees; axis = axis; pivotPoint = pivotPoint;
      this.append(getRotationMatrix(degrees / 180 * Math.PI, axis.x, axis.y, axis.z,
        pivotPoint ? pivotPoint.x : 0, pivotPoint ? pivotPoint.y : 0, pivotPoint ? pivotPoint.z : 0,
        this.sec));
    }
    appendScale(xScale: number, yScale: number, zScale: number): void {
      xScale = +xScale; yScale = +yScale; zScale = +zScale;
      var m = this._matrix;

      m[0 ] *= xScale;
      m[1 ] *= yScale;
      m[2 ] *= zScale;

      m[4 ] *= xScale;
      m[5 ] *= yScale;
      m[6 ] *= zScale;

      m[8 ] *= xScale;
      m[9 ] *= yScale;
      m[10] *= zScale;

      m[12] *= xScale;
      m[13] *= yScale;
      m[14] *= zScale;
    }
    prependTranslation(x: number, y: number, z: number): void {
      x = +x; y = +y; z = +z;
      var m = this._matrix;
      var m11 = m[0], m12 = m[4], m13 = m[8 ], m14 = m[12],
          m21 = m[1], m22 = m[5], m23 = m[9 ], m24 = m[13],
          m31 = m[2], m32 = m[6], m33 = m[10], m34 = m[14],
          m41 = m[3], m42 = m[7], m43 = m[11], m44 = m[15];
      m[12] += m11 * x + m12 * y + m13 * z;
      m[13] += m21 * x + m22 * y + m23 * z;
      m[14] += m31 * x + m32 * y + m33 * z;
      m[15] += m41 * x + m42 * y + m43 * z;
    }
    prependRotation(degrees: number, axis: flash.geom.Vector3D, pivotPoint: flash.geom.Vector3D = null): void {
      degrees = +degrees; axis = axis; pivotPoint = pivotPoint;
      this.prepend(getRotationMatrix(degrees / 180 * Math.PI, axis.x, axis.y, axis.z,
        pivotPoint ? pivotPoint.x : 0, pivotPoint ? pivotPoint.y : 0, pivotPoint ? pivotPoint.z : 0,
        this.sec));
    }
    prependScale(xScale: number, yScale: number, zScale: number): void {
      xScale = +xScale; yScale = +yScale; zScale = +zScale;
      var m = this._matrix;

      m[0 ] *= xScale;
      m[1 ] *= xScale;
      m[2 ] *= xScale;
      m[3 ] *= xScale;

      m[4 ] *= yScale;
      m[5 ] *= yScale;
      m[6 ] *= yScale;
      m[7 ] *= yScale;

      m[8 ] *= zScale;
      m[9 ] *= zScale;
      m[10] *= zScale;
      m[11] *= zScale;
    }
    transformVector(v: flash.geom.Vector3D): flash.geom.Vector3D {
      var m = this._matrix;
      var x = v.x, y = v.y, z = v.z;
      return new this.sec.flash.geom.Vector3D(
        m[0] * x + m[4] * y + m[8 ] * z + m[12],
        m[1] * x + m[5] * y + m[9 ] * z + m[13],
        m[2] * x + m[6] * y + m[10] * z + m[14]
      );
    }
    deltaTransformVector(v: flash.geom.Vector3D): flash.geom.Vector3D {
      var m = this._matrix;
      var x = v.x, y = v.y, z = v.z;
      return new this.sec.flash.geom.Vector3D(
        m[0] * x + m[4] * y + m[8 ] * z,
        m[1] * x + m[5] * y + m[9 ] * z,
        m[2] * x + m[6] * y + m[10] * z
      );
    }
    transformVectors(vin: any, vout: any): void {
      var m = this._matrix;
      var m11 = m[0], m12 = m[4], m13 = m[8 ], m14 = m[12],
          m21 = m[1], m22 = m[5], m23 = m[9 ], m24 = m[13],
          m31 = m[2], m32 = m[6], m33 = m[10], m34 = m[14],
          m41 = m[3], m42 = m[7], m43 = m[11], m44 = m[15];
      for (var i = 0; i < vin.length - 2; i += 3) {
        var x = vin.axGetNumericProperty(i),
            y = vin.axGetNumericProperty(i + 1),
            z = vin.axGetNumericProperty(i + 2);
        vout.push(m11 * x + m12 * y + m13 * z + m14);
        vout.push(m21 * x + m22 * y + m23 * z + m24);
        vout.push(m31 * x + m32 * y + m33 * z + m34);
      }
    }
    transpose(): void {
      var m = this._matrix;
      var tmp;
      tmp = m[1]; m[1] = m[4]; m[4] = tmp;
      tmp = m[2]; m[2] = m[8]; m[5] = tmp;
      tmp = m[3]; m[3] = m[12]; m[12] = tmp;
      tmp = m[6]; m[6] = m[9]; m[9] = tmp;
      tmp = m[7]; m[7] = m[13]; m[13] = tmp;
      tmp = m[11]; m[11] = m[14]; m[14] = tmp;
    }
    pointAt(pos: flash.geom.Vector3D, at: flash.geom.Vector3D = null, up: flash.geom.Vector3D = null): void {
      pos = pos; at = at; up = up;
      release || notImplemented("public flash.geom.Matrix3D::pointAt"); return;
    }
    interpolateTo(toMat: flash.geom.Matrix3D, percent: number): void {
      toMat = toMat; percent = +percent;
      release || notImplemented("public flash.geom.Matrix3D::interpolateTo"); return;
    }
    copyFrom(sourceMatrix3D: flash.geom.Matrix3D): void {
      sourceMatrix3D = sourceMatrix3D;
      this._matrix.set(sourceMatrix3D._matrix);
    }
    copyRawDataTo(vector: any, index: number /*uint*/ = 0, transpose: boolean = false): void {
      vector = vector; index = index >>> 0; transpose = !!transpose;
      var m = this._matrix;
      if (transpose) {
        for (var i = 0, j = index | 0; i < 16; i++, j++) {
          vector.axSetNumericProperty(j, m[transposeTransform[i]]);
        }
      } else {
        for (var i = 0, j = index | 0; i < 16; i++, j++) {
          vector.axSetNumericProperty(j, m[i]);
        }
      }
    }
    copyRawDataFrom(vector: Float64Vector, index: number /*uint*/ = 0, transpose: boolean = false): void {
      vector = vector; index = index >>> 0; transpose = !!transpose;
      var m = this._matrix;
      if (transpose) {
        for (var i = 0, j = index | 0; i < 16; i++, j++) {
          m[transposeTransform[i]] = vector.axGetNumericProperty(j) || 0; // removing NaN
        }
      } else {
        for (var i = 0, j = index | 0; i < 16; i++, j++) {
          m[i] = vector.axGetNumericProperty(j) || 0; // removing NaN
        }
      }
    }
    copyRowTo(row: number /*uint*/, vector3D: flash.geom.Vector3D): void {
      row = row >>> 0; vector3D = vector3D;
      var offset = row | 0;
      var m = this._matrix;
      vector3D.x = m[offset];
      vector3D.y = m[offset + 4];
      vector3D.z = m[offset + 8];
      vector3D.w = m[offset + 12];
    }
    copyColumnTo(column: number /*uint*/, vector3D: flash.geom.Vector3D): void {
      column = column >>> 0; vector3D = vector3D;
      var offset = column << 2;
      var m = this._matrix;
      vector3D.x = m[offset];
      vector3D.y = m[offset + 1];
      vector3D.z = m[offset + 2];
      vector3D.w = m[offset + 3];
    }
    copyRowFrom(row: number /*uint*/, vector3D: flash.geom.Vector3D): void {
      row = row >>> 0; vector3D = vector3D;
      var offset = row | 0;
      var m = this._matrix;
      m[offset] = vector3D.x;
      m[offset + 4] = vector3D.y;
      m[offset + 8] = vector3D.z;
      m[offset + 12] = vector3D.w;
    }
    copyColumnFrom(column: number /*uint*/, vector3D: flash.geom.Vector3D): void {
      column = column >>> 0; vector3D = vector3D;
      var offset = column << 2;
      var m = this._matrix;
      m[offset] = vector3D.x;
      m[offset + 1] = vector3D.y;
      m[offset + 2] = vector3D.z;
      m[offset + 3] = vector3D.w;
    }
  }
}
