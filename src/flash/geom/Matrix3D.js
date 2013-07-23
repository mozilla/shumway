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
    // (pA:Vector = null)
    __class__: "flash.geom.Matrix3D",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
          interpolate: function interpolate(pA, pB, pC) { // (pA:Matrix3D, pB:Matrix3D, pC:Number) -> Matrix3D
            notImplemented("Matrix3D.interpolate");
          }
        },
        instance: {
          ctor: function ctor(pA) { // (pA:Vector) -> void
            notImplemented("Matrix3D.ctor");
          },
          clone: function clone() { // (void) -> Matrix3D
            notImplemented("Matrix3D.clone");
          },
          copyToMatrix3D: function copyToMatrix3D(pA) { // (pA:Matrix3D) -> void
            notImplemented("Matrix3D.copyToMatrix3D");
          },
          append: function append(pA) { // (pA:Matrix3D) -> void
            notImplemented("Matrix3D.append");
          },
          prepend: function prepend(pA) { // (pA:Matrix3D) -> void
            notImplemented("Matrix3D.prepend");
          },
          invert: function invert() { // (void) -> Boolean
            notImplemented("Matrix3D.invert");
          },
          identity: function identity() { // (void) -> void
            notImplemented("Matrix3D.identity");
          },
          decompose: function decompose(pA) { // (pA:String = "eulerAngles") -> Vector
            notImplemented("Matrix3D.decompose");
          },
          recompose: function recompose(pA, pB) { // (pA:Vector, pB:String = "eulerAngles") -> Boolean
            notImplemented("Matrix3D.recompose");
          },
          appendTranslation: function appendTranslation(pA, pB, pC) { // (pA:Number, pB:Number, pC:Number) -> void
            notImplemented("Matrix3D.appendTranslation");
          },
          appendRotation: function appendRotation(pA, pB, pC) { // (pA:Number, pB:Vector3D, pC:Vector3D = null) -> void
            notImplemented("Matrix3D.appendRotation");
          },
          appendScale: function appendScale(pA, pB, pC) { // (pA:Number, pB:Number, pC:Number) -> void
            notImplemented("Matrix3D.appendScale");
          },
          prependTranslation: function prependTranslation(pA, pB, pC) { // (pA:Number, pB:Number, pC:Number) -> void
            notImplemented("Matrix3D.prependTranslation");
          },
          prependRotation: function prependRotation(pA, pB, pC) { // (pA:Number, pB:Vector3D, pC:Vector3D = null) -> void
            notImplemented("Matrix3D.prependRotation");
          },
          prependScale: function prependScale(pA, pB, pC) { // (pA:Number, pB:Number, pC:Number) -> void
            notImplemented("Matrix3D.prependScale");
          },
          transformVector: function transformVector(pA) { // (pA:Vector3D) -> Vector3D
            notImplemented("Matrix3D.transformVector");
          },
          deltaTransformVector: function deltaTransformVector(pA) { // (pA:Vector3D) -> Vector3D
            notImplemented("Matrix3D.deltaTransformVector");
          },
          transformVectors: function transformVectors(pA, pB) { // (pA:Vector, pB:Vector) -> void
            notImplemented("Matrix3D.transformVectors");
          },
          transpose: function transpose() { // (void) -> void
            notImplemented("Matrix3D.transpose");
          },
          pointAt: function pointAt(pA, pB, pC) { // (pA:Vector3D, pB:Vector3D = null, pC:Vector3D = null) -> void
            notImplemented("Matrix3D.pointAt");
          },
          interpolateTo: function interpolateTo(pA, pB) { // (pA:Matrix3D, pB:Number) -> void
            notImplemented("Matrix3D.interpolateTo");
          },
          copyFrom: function copyFrom(pA) { // (pA:Matrix3D) -> void
            notImplemented("Matrix3D.copyFrom");
          },
          copyRawDataTo: function copyRawDataTo(pA, pB, pC) { // (pA:Vector, pB:uint = 0, pC:Boolean = false) -> void
            notImplemented("Matrix3D.copyRawDataTo");
          },
          copyRawDataFrom: function copyRawDataFrom(pA, pB, pC) { // (pA:Vector, pB:uint = 0, pC:Boolean = false) -> void
            notImplemented("Matrix3D.copyRawDataFrom");
          },
          copyRowTo: function copyRowTo(pA, pB) { // (pA:uint, pB:Vector3D) -> void
            notImplemented("Matrix3D.copyRowTo");
          },
          copyColumnTo: function copyColumnTo(pA, pB) { // (pA:uint, pB:Vector3D) -> void
            notImplemented("Matrix3D.copyColumnTo");
          },
          copyRowFrom: function copyRowFrom(pA, pB) { // (pA:uint, pB:Vector3D) -> void
            notImplemented("Matrix3D.copyRowFrom");
          },
          copyColumnFrom: function copyColumnFrom(pA, pB) { // (pA:uint, pB:Vector3D) -> void
            notImplemented("Matrix3D.copyColumnFrom");
          },
          rawData: {
            get: function rawData() { // (void) -> Vector
              notImplemented("Matrix3D.rawData");
              return this._rawData;
            },
            set: function rawData(pA) { // (pA:Vector) -> void
              notImplemented("Matrix3D.rawData");
              this._rawData = pA;
            }
          },
          position: {
            get: function position() { // (void) -> Vector3D
              notImplemented("Matrix3D.position");
              return this._position;
            },
            set: function position(pA) { // (pA:Vector3D) -> void
              notImplemented("Matrix3D.position");
              this._position = pA;
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
