/**
 * Copyright 2015 Mozilla Foundation
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

///<reference path='../references.ts' />

module Shumway.AVM1.Lib {
  import flash = Shumway.AVMX.AS.flash;

  function defaultTo(v, defaultValue) {
    return v === undefined ? defaultValue : v;
  }

  export function toAS3ColorTransform(v: any): flash.geom.ColorTransform {
    var context = v.context;
    if (!(v instanceof AVM1Object)) {
      return new context.sec.flash.geom.ColorTransform(1, 1, 1, 1, 0, 0, 0, 0);
    }
    return new context.sec.flash.geom.ColorTransform(
      alCoerceNumber(context, defaultTo(v.alGet('redMultiplier'), 1)),
      alCoerceNumber(context, defaultTo(v.alGet('greenMultiplier'), 1)),
      alCoerceNumber(context, defaultTo(v.alGet('blueMultiplier'), 1)),
      alCoerceNumber(context, defaultTo(v.alGet('alphaMultiplier'), 1)),
      alCoerceNumber(context, defaultTo(v.alGet('redOffset'), 0)),
      alCoerceNumber(context, defaultTo(v.alGet('greenOffset'), 0)),
      alCoerceNumber(context, defaultTo(v.alGet('blueOffset'), 0)),
      alCoerceNumber(context, defaultTo(v.alGet('alphaOffset'), 0)));
  }

  export function copyAS3ColorTransform(t: flash.geom.ColorTransform, v: AVM1Object) {
    v.alPut('redMultiplier', t.redMultiplier);
    v.alPut('greenMultiplier', t.greenMultiplier);
    v.alPut('blueMultiplier', t.blueMultiplier);
    v.alPut('alphaMultiplier', t.alphaMultiplier);
    v.alPut('redOffset', t.redOffset);
    v.alPut('greenOffset', t.greenOffset);
    v.alPut('blueOffset', t.blueOffset);
    v.alPut('alphaOffset', t.alphaOffset);
  }

  export class AVM1ColorTransform extends AVM1Object {
    constructor(context: AVM1Context,
                redMultiplier: number = 1, greenMultiplier: number = 1, blueMultiplier: number = 1, alphaMultiplier: number = 1,
                redOffset: number = 0, greenOffset: number = 0, blueOffset: number = 0, alphaOffset: number = 0) {
      super(context);
      this.alPrototype = context.globals.alGet('flash').alGet('geom').alGet('ColorTransform').alGetPrototypeProperty();
      this.alPut('redMultiplier', redMultiplier);
      this.alPut('greenMultiplier', greenMultiplier);
      this.alPut('blueMultiplier', blueMultiplier);
      this.alPut('alphaMultiplier', alphaMultiplier);
      this.alPut('redOffset', redOffset);
      this.alPut('greenOffset', greenOffset);
      this.alPut('blueOffset', blueOffset);
      this.alPut('alphaOffset', alphaOffset);
    }

    static fromAS3ColorTransform(context: AVM1Context, t: flash.geom.ColorTransform): AVM1ColorTransform  {
      return new AVM1ColorTransform(context,
        t.redMultiplier, t.greenMultiplier, t.blueMultiplier, t.alphaMultiplier,
        t.redOffset, t.greenOffset, t.blueOffset, t.alphaOffset);
    }
  }

  export class AVM1ColorTransformFunction extends AVM1Function {
    constructor(context: AVM1Context) {
      super(context);
      alDefineObjectProperties(this, {
        prototype: {
          value: new AVM1ColorTransformPrototype(context, this)
        }
      });
    }

    alConstruct(args?: any[]): AVM1Object {
      var obj = Object.create(AVM1ColorTransform.prototype);
      args = args || [];
      AVM1ColorTransform.apply(obj, [this.context].concat(args));
      return obj;
    }
  }

  export class AVM1ColorTransformPrototype extends AVM1Object {
    constructor(context: AVM1Context, fn: AVM1Function) {
      super(context);
      this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
      alDefineObjectProperties(this, {
        constructor: {
          value: fn,
          writable: true
        },
        rgb: {
          get: this.getRgb,
          set: this.setRgb
        },
        concat: {
          value: this.concat,
          writable: true
        },
        toString: {
          value: this._toString,
          writable: true
        }
      })
    }

    public getRgb(): number {
      return toAS3ColorTransform(this).color;
    }

    public setRgb(rgb: number) {
      var t = toAS3ColorTransform(this);
      t.color = alToInt32(this.context, rgb);
      copyAS3ColorTransform(t, this);
    }

    public concat(second: AVM1ColorTransform): void {
      var t = toAS3ColorTransform(this);
      t.concat(toAS3ColorTransform(second));
      copyAS3ColorTransform(t, this);
    }

    public _toString(): string {
      return toAS3ColorTransform(this).toString();
    }
  }
}