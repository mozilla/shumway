/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Matrix3DDefinition = (function () {

/*
 * _matrix stores data by columns
 *  | 0  4  8  12 |
 *  | 1  5  9  13 |
 *  | 2  6 10  14 |
 *  | 3  7 11  15 |
 */

  var precision = 1e-7;
  var transposeTransform = new Uint32Array([0, 4, 8, 12, 1, 5, 9, 13,
    2, 6, 10, 14, 3, 7, 11, 15]);

  function createVectorOfNumbers() {
    var VectorOfNumbersClass = avm2.applicationDomain.
      getClass("packageInternal __AS3__.vec.Vector$object");
    return new VectorOfNumbersClass.instanceConstructor();
  }

  return {
    // (v:Vector = null)
    __class__: "flash.geom.Matrix3D",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
          interpolate: function interpolate(thisMat, toMat, percent) { // (thisMat:Matrix3D, toMat:Matrix3D, percent:Number) -> Matrix3D
            notImplemented("Matrix3D.interpolate");
          }
        },
        instance: {
          ctor: function ctor(v) { // (v:Vector) -> void
            this._matrix = new Float32Array(16);
            if (v && v.length >= 16) {
              this.copyRawDataFrom(v, 0, false);
            } else {
              this.identity();
            }
          },
          clone: function clone() { // (void) -> Matrix3D
            return new flash.geom.Matrix3D(this._matrix);
          },
          copyToMatrix3D: function copyToMatrix3D(dest) { // (dest:Matrix3D) -> void
            dest._matrix.set(this._matrix);
          },
          append: function append(lhs) { // (lhs:Matrix3D) -> void
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
          },
          prepend: function prepend(rhs) { // (rhs:Matrix3D) -> void
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
          },
          invert: function invert() { // (void) -> Boolean
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
          },
          identity: function identity() { // (void) -> void
            var m = this._matrix;
            m[0] = m[5] = m[10] = m[15] = 1;
            m[1] = m[2] = m[3] = m[4] = m[6] = m[7] = m[8] = m[9] = m[11] =
            m[12] = m[13] = m[14] = 0;
          },
          decompose: function decompose(orientationStyle) { // (orientationStyle:String = "eulerAngles") -> Vector
            notImplemented("Matrix3D.decompose");
          },
          recompose: function recompose(components, orientationStyle) { // (components:Vector, orientationStyle:String = "eulerAngles") -> Boolean
            notImplemented("Matrix3D.recompose");
          },
          appendTranslation: function appendTranslation(x, y, z) { // (x:Number, y:Number, z:Number) -> void
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
          },
          appendRotation: function appendRotation(degrees, axis, pivotPoint) { // (degrees:Number, axis:Vector3D, pivotPoint:Vector3D = null) -> void
            notImplemented("Matrix3D.appendRotation");
          },
          appendScale: function appendScale(xScale, yScale, zScale) { // (xScale:Number, yScale:Number, zScale:Number) -> void
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
          },
          prependTranslation: function prependTranslation(x, y, z) { // (x:Number, y:Number, z:Number) -> void
            var m = this._matrix;
            var m11 = m[0], m12 = m[4], m13 = m[8 ], m14 = m[12],
                m21 = m[1], m22 = m[5], m23 = m[9 ], m24 = m[13],
                m31 = m[2], m32 = m[6], m33 = m[10], m34 = m[14],
                m41 = m[3], m42 = m[7], m43 = m[11], m44 = m[15];

            m[12] += m11 * x + m12 * y + m13 * z;
            m[13] += m21 * x + m22 * y + m23 * z;
            m[14] += m31 * x + m32 * y + m33 * z;
            m[15] += m41 * x + m42 * y + m43 * z;
          },
          prependRotation: function prependRotation(degrees, axis, pivotPoint) { // (degrees:Number, axis:Vector3D, pivotPoint:Vector3D = null) -> void
            notImplemented("Matrix3D.prependRotation");
          },
          prependScale: function prependScale(xScale, yScale, zScale) { // (xScale:Number, yScale:Number, zScale:Number) -> void
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
          },
          transformVector: function transformVector(v) { // (v:Vector3D) -> Vector3D
            var m = this._matrix;
            var x = v.x, y = v.y, z = v.z;

            return new flash.geom.Vector3D(
              m[0] * x + m[4] * y + m[8 ] * z + m[12],
              m[1] * x + m[5] * y + m[9 ] * z + m[13],
              m[2] * x + m[6] * y + m[10] * z + m[14]);
          },
          deltaTransformVector: function deltaTransformVector(v) { // (v:Vector3D) -> Vector3D
            var m = this._matrix;
            var x = v.x, y = v.y, z = v.z;

            return new flash.geom.Vector3D(
              m[0] * x + m[4] * y + m[8 ] * z,
              m[1] * x + m[5] * y + m[9 ] * z,
              m[2] * x + m[6] * y + m[10] * z);
          },
          transformVectors: function transformVectors(vin, vout) { // (vin:Vector, vout:Vector) -> void
            var m = this._matrix;
            var m11 = m[0], m12 = m[4], m13 = m[8 ], m14 = m[12],
                m21 = m[1], m22 = m[5], m23 = m[9 ], m24 = m[13],
                m31 = m[2], m32 = m[6], m33 = m[10], m34 = m[14],
                m41 = m[3], m42 = m[7], m43 = m[11], m44 = m[15];
            for (var i = 0; i < vin.length - 2; i += 3) {
              var x = vin[i], y = vin[i + 1], z = vin[i + 2];

              vout.push(m11 * x + m12 * y + m13 * z + m14);
              vout.push(m21 * x + m22 * y + m23 * z + m24);
              vout.push(m31 * x + m32 * y + m33 * z + m34);
            }
          },
          transpose: function transpose() { // (void) -> void
            var m = this._matrix;
            var tmp;
            tmp = m[1]; m[1] = m[4]; m[4] = tmp;
            tmp = m[2]; m[2] = m[8]; m[5] = tmp;
            tmp = m[3]; m[3] = m[12]; m[12] = tmp;
            tmp = m[6]; m[6] = m[9]; m[9] = tmp;
            tmp = m[7]; m[7] = m[13]; m[13] = tmp;
            tmp = m[11]; m[11] = m[14]; m[14] = tmp;
          },
          pointAt: function pointAt(pos, at, up) { // (pos:Vector3D, at:Vector3D = null, up:Vector3D = null) -> void
            notImplemented("Matrix3D.pointAt");
          },
          interpolateTo: function interpolateTo(toMat, percent) { // (toMat:Matrix3D, percent:Number) -> void
            notImplemented("Matrix3D.interpolateTo");
          },
          copyFrom: function copyFrom(sourceMatrix3D) { // (sourceMatrix3D:Matrix3D) -> void
            this._matrix.set(sourceMatrix3D._matrix);
          },
          copyRawDataTo: function copyRawDataTo(vector, index, transpose) { // (vector:Vector, index:uint = 0, transpose:Boolean = false) -> void
            var m = this._matrix;
            if (transpose) {
              for (var i = 0, j = index | 0; i < 16; i++, j++) {
                vector[j] = m[transposeTransform[i]];
              }
            } else {
              for (var i = 0, j = index | 0; i < 16; i++, j++) {
                vector[j] = m[i];
              }
            }
          },
          copyRawDataFrom: function copyRawDataFrom(vector, index, transpose) { // (vector:Vector, index:uint = 0, transpose:Boolean = false) -> void
            var m = this._matrix;
            if (transpose) {
              for (var i = 0, j = index | 0; i < 16; i++, j++) {
                m[transposeTransform[i]] = vector[j] || 0; // removing NaN
              }
            } else {
              for (var i = 0, j = index | 0; i < 16; i++, j++) {
                m[i] = vector[j] || 0; // removing NaN
              }
            }
          },
          copyRowTo: function copyRowTo(row, vector3D) { // (row:uint, vector3D:Vector3D) -> void
            var offset = row | 0;
            var m = this._matrix;
            vector3D.x = m[offset];
            vector3D.y = m[offset + 4];
            vector3D.z = m[offset + 8];
            vector3D.w = m[offset + 12];
          },
          copyColumnTo: function copyColumnTo(column, vector3D) { // (column:uint, vector3D:Vector3D) -> void
            var offset = column << 2;
            var m = this._matrix;
            vector3D.x = m[offset];
            vector3D.y = m[offset + 1];
            vector3D.z = m[offset + 2];
            vector3D.w = m[offset + 3];
          },
          copyRowFrom: function copyRowFrom(row, vector3D) { // (row:uint, vector3D:Vector3D) -> void
            var offset = row | 0;
            var m = this._matrix;
            m[offset] = vector3D.x;
            m[offset + 4] = vector3D.y;
            m[offset + 8] = vector3D.z;
            m[offset + 12] = vector3D.w;
          },
          copyColumnFrom: function copyColumnFrom(column, vector3D) { // (column:uint, vector3D:Vector3D) -> void
            var offset = column << 2;
            var m = this._matrix;
            m[offset] = vector3D.x;
            m[offset + 1] = vector3D.y;
            m[offset + 2] = vector3D.z;
            m[offset + 3] = vector3D.w;
          },
          rawData: {
            get: function rawData() { // (void) -> Vector
              var result = createVectorOfNumbers();
              this.copyRawDataTo(result, 0, false);
              return result;
            },
            set: function rawData(v) { // (v:Vector) -> void
              this.copyRawDataFrom(v, 0, false);
            }
          },
          position: {
            get: function position() { // (void) -> Vector3D
              var m = this._matrix;
              return new flash.geom.Vector3D(m[12], m[13], m[14]);
            },
            set: function position(pos) { // (pos:Vector3D) -> void
              var m = this._matrix;
              m[12] = pos.x;
              m[13] = pos.y;
              m[14] = pos.z;
            }
          },
          determinant: {
            get: function determinant() { // (void) -> Number
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
          }
        }
      },
      script: { instance: Glue.ALL }
    }
  };
}).call(this);
