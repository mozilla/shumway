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
          cxform.redMultiplier,
          cxform.greenMultiplier,
          cxform.blueMultiplier,
          cxform.alphaMultiplier,
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
        redMultiplier: val.redMultiplier,
        greenMultiplier: val.greenMultiplier,
        blueMultiplier: val.blueMultiplier,
        alphaMultiplier: val.alphaMultiplier,
        redOffset: val.redOffset,
        greenOffset: val.greenOffset,
        blueOffset: val.blueOffset,
        alphaOffset: val.alphaOffset
      };
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
      var m = this._target._currentTransform;
      return new flash.geom.Matrix(m.a, m.b, m.c, m.d, m.tx, m.ty);
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
      target._x = val.tx;
      target._y = val.ty;

      target._currentTransform = {
        a: a,
        b: b,
        c: c,
        d: d,
        tx: tx,
        ty: ty
      };
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
        ctor: def.ctor
      }
    }
  };

  return def;
}).call(this);
