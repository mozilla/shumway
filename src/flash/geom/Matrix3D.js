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
            notImplemented("Matrix3D.ctor");
          },
          clone: function clone() { // (void) -> Matrix3D
            notImplemented("Matrix3D.clone");
          },
          copyToMatrix3D: function copyToMatrix3D(dest) { // (dest:Matrix3D) -> void
            notImplemented("Matrix3D.copyToMatrix3D");
          },
          append: function append(lhs) { // (lhs:Matrix3D) -> void
            notImplemented("Matrix3D.append");
          },
          prepend: function prepend(rhs) { // (rhs:Matrix3D) -> void
            notImplemented("Matrix3D.prepend");
          },
          invert: function invert() { // (void) -> Boolean
            notImplemented("Matrix3D.invert");
          },
          identity: function identity() { // (void) -> void
            notImplemented("Matrix3D.identity");
          },
          decompose: function decompose(orientationStyle) { // (orientationStyle:String = "eulerAngles") -> Vector
            notImplemented("Matrix3D.decompose");
          },
          recompose: function recompose(components, orientationStyle) { // (components:Vector, orientationStyle:String = "eulerAngles") -> Boolean
            notImplemented("Matrix3D.recompose");
          },
          appendTranslation: function appendTranslation(x, y, z) { // (x:Number, y:Number, z:Number) -> void
            notImplemented("Matrix3D.appendTranslation");
          },
          appendRotation: function appendRotation(degrees, axis, pivotPoint) { // (degrees:Number, axis:Vector3D, pivotPoint:Vector3D = null) -> void
            notImplemented("Matrix3D.appendRotation");
          },
          appendScale: function appendScale(xScale, yScale, zScale) { // (xScale:Number, yScale:Number, zScale:Number) -> void
            notImplemented("Matrix3D.appendScale");
          },
          prependTranslation: function prependTranslation(x, y, z) { // (x:Number, y:Number, z:Number) -> void
            notImplemented("Matrix3D.prependTranslation");
          },
          prependRotation: function prependRotation(degrees, axis, pivotPoint) { // (degrees:Number, axis:Vector3D, pivotPoint:Vector3D = null) -> void
            notImplemented("Matrix3D.prependRotation");
          },
          prependScale: function prependScale(xScale, yScale, zScale) { // (xScale:Number, yScale:Number, zScale:Number) -> void
            notImplemented("Matrix3D.prependScale");
          },
          transformVector: function transformVector(v) { // (v:Vector3D) -> Vector3D
            notImplemented("Matrix3D.transformVector");
          },
          deltaTransformVector: function deltaTransformVector(v) { // (v:Vector3D) -> Vector3D
            notImplemented("Matrix3D.deltaTransformVector");
          },
          transformVectors: function transformVectors(vin, vout) { // (vin:Vector, vout:Vector) -> void
            notImplemented("Matrix3D.transformVectors");
          },
          transpose: function transpose() { // (void) -> void
            notImplemented("Matrix3D.transpose");
          },
          pointAt: function pointAt(pos, at, up) { // (pos:Vector3D, at:Vector3D = null, up:Vector3D = null) -> void
            notImplemented("Matrix3D.pointAt");
          },
          interpolateTo: function interpolateTo(toMat, percent) { // (toMat:Matrix3D, percent:Number) -> void
            notImplemented("Matrix3D.interpolateTo");
          },
          copyFrom: function copyFrom(sourceMatrix3D) { // (sourceMatrix3D:Matrix3D) -> void
            notImplemented("Matrix3D.copyFrom");
          },
          copyRawDataTo: function copyRawDataTo(vector, index, transpose) { // (vector:Vector, index:uint = 0, transpose:Boolean = false) -> void
            notImplemented("Matrix3D.copyRawDataTo");
          },
          copyRawDataFrom: function copyRawDataFrom(vector, index, transpose) { // (vector:Vector, index:uint = 0, transpose:Boolean = false) -> void
            notImplemented("Matrix3D.copyRawDataFrom");
          },
          copyRowTo: function copyRowTo(row, vector3D) { // (row:uint, vector3D:Vector3D) -> void
            notImplemented("Matrix3D.copyRowTo");
          },
          copyColumnTo: function copyColumnTo(column, vector3D) { // (column:uint, vector3D:Vector3D) -> void
            notImplemented("Matrix3D.copyColumnTo");
          },
          copyRowFrom: function copyRowFrom(row, vector3D) { // (row:uint, vector3D:Vector3D) -> void
            notImplemented("Matrix3D.copyRowFrom");
          },
          copyColumnFrom: function copyColumnFrom(column, vector3D) { // (column:uint, vector3D:Vector3D) -> void
            notImplemented("Matrix3D.copyColumnFrom");
          },
          rawData: {
            get: function rawData() { // (void) -> Vector
              notImplemented("Matrix3D.rawData");
              return this._rawData;
            },
            set: function rawData(v) { // (v:Vector) -> void
              notImplemented("Matrix3D.rawData");
              this._rawData = v;
            }
          },
          position: {
            get: function position() { // (void) -> Vector3D
              notImplemented("Matrix3D.position");
              return this._position;
            },
            set: function position(pos) { // (pos:Vector3D) -> void
              notImplemented("Matrix3D.position");
              this._position = pos;
            }
          },
          determinant: {
            get: function determinant() { // (void) -> Number
              notImplemented("Matrix3D.determinant");
              return this._determinant;
            }
          }
        }
      },
      script: { instance: Glue.ALL }
    }
  };
}).call(this);
