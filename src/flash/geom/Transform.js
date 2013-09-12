/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
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

var TransformDefinition = (function () {
  var def = {
    __class__: 'flash.geom.Transform',

    get colorTransform() {
      var cxform = this._target._cxform;
      if (cxform) {
        return new flash.geom.ColorTransform(
          cxform.redMultiplier / 256,
          cxform.greenMultiplier / 256,
          cxform.blueMultiplier / 256,
          cxform.alphaMultiplier / 256,
          cxform.redOffset,
          cxform.greenOffset,
          cxform.blueOffset,
          cxform.alphaOffset
        );
      } else {
        return new flash.geom.ColorTransform();
      }
    },
    set colorTransform(val) {
      var CTClass = avm2.systemDomain.getClass("flash.geom.ColorTransform");
      if (!CTClass.isInstanceOf(val))
        throw TypeError();

      this._target._cxform = {
        redMultiplier: val.redMultiplier * 256,
        greenMultiplier: val.greenMultiplier * 256,
        blueMultiplier: val.blueMultiplier * 256,
        alphaMultiplier: val.alphaMultiplier * 256,
        redOffset: val.redOffset,
        greenOffset: val.greenOffset,
        blueOffset: val.blueOffset,
        alphaOffset: val.alphaOffset
      };
      this._target._invalidate();
    },
    get concatenatedColorTransform() {
      var cxform = this.colorTransform;
      cxform.concat(this._target.parent.transform.concatenatedColorTransform);
      return cxform;
    },
    get concatenatedMatrix() {
      var m = this.matrix;
      m.concat(this._target.parent.transform.concatenatedMatrix);
      return m;
    },
    get matrix() {
      if (this._target._current3DTransform) {
        return null;
      }
      var m = this._target._currentTransform;
      return new flash.geom.Matrix(m.a, m.b, m.c, m.d, m.tx/20, m.ty/20);
    },
    set matrix(val) {
      var MatrixClass = avm2.systemDomain.getClass("flash.geom.Matrix");
      if (!MatrixClass.isInstanceOf(val))
        throw TypeError();

      var a = val.a;
      var b = val.b;
      var c = val.c;
      var d = val.d;
      var tx = val.tx;
      var ty = val.ty;

      var target = this._target;
      target._rotation = a !== 0 ? Math.atan(b / a) * 180 / Math.PI :
                                   (b > 0 ? 90 : -90);
      var sx = Math.sqrt(a * a + b * b);
      target._scaleX = a > 0 ? sx : -sx;
      var sy = Math.sqrt(d * d + c * c);
      target._scaleY = d > 0 ? sy : -sy;
      target._x = val.tx*20|0;
      target._y = val.ty*20|0;

      target._currentTransform = {
        a: a,
        b: b,
        c: c,
        d: d,
        tx: tx,
        ty: ty
      };
      target._current3DTransform = null;
      target._invalidate();
    },

    get matrix3D() {
      var m = this._target._current3DTransform;
      return m && m.clone();
    },
    set matrix3D(val) {
      var Matrix3DClass = avm2.systemDomain.getClass("flash.geom.Matrix3D");
      if (!Matrix3DClass.isInstanceOf(val))
        throw TypeError();

      var raw = val.rawData;
      this.matrix = new flash.geom.Matrix(raw.asGetPublicProperty(0),
                                          raw.asGetPublicProperty(1),
                                          raw.asGetPublicProperty(4),
                                          raw.asGetPublicProperty(5),
                                          raw.asGetPublicProperty(12),
                                          raw.asGetPublicProperty(13));
      // this.matrix will reset this._target._current3DTransform
      this._target._current3DTransform = val;
    },

    ctor: function (target) {
      this._target = target;

      target._transform = this;
    }
  };

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        colorTransform: desc(def, "colorTransform"),
        concatenatedColorTransform: desc(def, "concatenatedColorTransform"),
        concatenatedMatrix: desc(def, "concatenatedMatrix"),
        matrix: desc(def, "matrix"),
        matrix3D: desc(def, "matrix3D"),
        ctor: def.ctor
      }
    }
  };

  return def;
}).call(this);
