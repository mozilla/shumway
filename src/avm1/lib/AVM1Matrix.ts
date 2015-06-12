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

  export function toAS3Matrix(v: AVM1Object): flash.geom.Matrix {
    var context = v.context;
    var a, b, c, d, tx, ty;
    if (v instanceof AVM1Object) {
      a = alCoerceNumber(context, v.alGet('a'));
      b = alCoerceNumber(context, v.alGet('b'));
      c = alCoerceNumber(context, v.alGet('c'));
      d = alCoerceNumber(context, v.alGet('d'));
      tx = alCoerceNumber(context, v.alGet('tx'));
      ty = alCoerceNumber(context, v.alGet('ty'));
    }
    return new context.sec.flash.geom.Matrix(a, b, c, d, tx, ty);
  }

  export function copyAS3MatrixTo(m: flash.geom.Matrix, v: AVM1Object) {
    v.alPut('a', m.a);
    v.alPut('b', m.b);
    v.alPut('c', m.c);
    v.alPut('d', m.d);
    v.alPut('tx', m.tx);
    v.alPut('ty', m.ty);
  }

  export class AVM1Matrix extends AVM1Object {
    constructor(context: AVM1Context, a: number = 1, b: number = 0, c: number = 0, d: number = 1, tx: number = 0, ty: number = 0) {
      super(context);
      this.alPrototype = context.globals.Matrix.alGetPrototypeProperty();
      this.alPut('a', a);
      this.alPut('b', b);
      this.alPut('c', c);
      this.alPut('d', d);
      this.alPut('tx', tx);
      this.alPut('ty', ty);
    }

    static fromAS3Matrix(context: AVM1Context, m: flash.geom.Matrix): AVM1Matrix  {
      return new AVM1Matrix(context, m.a, m.b, m.c, m.d, m.tx, m.ty);
    }
  }

  export class AVM1MatrixFunction extends AVM1Function {
    constructor(context: AVM1Context) {
      super(context);
      alDefineObjectProperties(this, {
        prototype: {
          value: new AVM1MatrixPrototype(context, this)
        }
      });
    }

    alConstruct(args?: any[]): AVM1Object {
      if (args && args.length > 0) {
        return new AVM1Matrix(this.context, args[0], args[1], args[2], args[3], args[4], args[5]);
      } else {
        return new AVM1Matrix(this.context);
      }
    }
  }

  export class AVM1MatrixPrototype extends AVM1Object {
    constructor(context: AVM1Context, fn: AVM1Function) {
      super(context);
      this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
      alDefineObjectProperties(this, {
        constructor: {
          value: fn,
          writable: true
        },
        clone: {
          value: this.clone,
          writable: true
        },
        concat: {
          value: this.concat,
          writable: true
        },
        createBox: {
          value: this.createBox,
          writable: true
        },
        createGradientBox: {
          value: this.createGradientBox,
          writable: true
        },
        deltaTransformPoint: {
          value: this.deltaTransformPoint,
          writable: true
        },
        identity: {
          value: this.identity,
          writable: true
        },
        invert: {
          value: this.invert,
          writable: true
        },
        rotate: {
          value: this.rotate,
          writable: true
        },
        scale: {
          value: this.scale,
          writable: true
        },
        toString: {
          value: this._toString,
          writable: true
        },
        transformPoint: {
          value: this.transformPoint,
          writable: true
        },
        translate: {
          value: this.translate,
          writable: true
        }
      })
    }

    public clone(): AVM1Matrix {
      var result = new AVM1Matrix(this.context);
      if (this instanceof AVM1Object) {
        result.alPut('a', this.alGet('a'));
        result.alPut('b', this.alGet('b'));
        result.alPut('c', this.alGet('c'));
        result.alPut('d', this.alGet('d'));
        result.alPut('tx', this.alGet('tx'));
        result.alPut('ty', this.alGet('ty'));
      }
      return result;
    }

    public concat(other: AVM1Matrix): void {
      var m = toAS3Matrix(this), m2 = toAS3Matrix(other);
      m.concat(m2);
      copyAS3MatrixTo(m, this);
    }

    public createBox(scaleX: number, scaleY: number, rotation: number = 0, tx: number = 0, ty: number = 0): void {
      scaleX = alCoerceNumber(this.context, scaleX);
      scaleY = alCoerceNumber(this.context, scaleY);
      rotation = alCoerceNumber(this.context, rotation);
      tx = alCoerceNumber(this.context, tx);
      ty = alCoerceNumber(this.context, ty);
      var m = toAS3Matrix(this);
      m.createBox(scaleX, scaleY, rotation, tx, ty);
      copyAS3MatrixTo(m, this);
    }

    public createGradientBox(width: number, height: number, rotation: number = 0, tx: number = 0, ty: number = 0): void {
      width = alCoerceNumber(this.context, width);
      height = alCoerceNumber(this.context, height);
      rotation = alCoerceNumber(this.context, rotation);
      tx = alCoerceNumber(this.context, tx);
      ty = alCoerceNumber(this.context, ty);
      var m = toAS3Matrix(this);
      m.createGradientBox(width, height, rotation, tx, ty);
      copyAS3MatrixTo(m, this);
    }

    public deltaTransformPoint(pt: AVM1Point): AVM1Point {
      var p = toAS3Point(pt);
      var m = toAS3Matrix(this);
      return AVM1Point.fromAS3Point(this.context, m.deltaTransformPoint(p));
    }

    public identity(): void {
      this.alPut('a', 1);
      this.alPut('b', 0);
      this.alPut('c', 0);
      this.alPut('d', 1);
      this.alPut('tx', 0);
      this.alPut('ty', 0);
    }

    public invert(): void {
      var m = toAS3Matrix(this);
      m.invert();
      copyAS3MatrixTo(m, this);
    }

    public rotate(angle: number): void {
      angle = alCoerceNumber(this.context, angle);
      var m = toAS3Matrix(this);
      m.rotate(angle);
      copyAS3MatrixTo(m, this);
    }

    public scale(sx: number, sy: number): void {
      sx = alCoerceNumber(this.context, sx);
      sy = alCoerceNumber(this.context, sy);
      var m = toAS3Matrix(this);
      m.scale(sx, sy);
      copyAS3MatrixTo(m, this);
    }

    public _toString(): string {
      return toAS3Matrix(this).toString();
    }

    public transformPoint(pt: AVM1Point): AVM1Point {
      var p = toAS3Point(pt);
      var m = toAS3Matrix(this);
      return AVM1Point.fromAS3Point(this.context, m.transformPoint(p));
    }

    public translate(tx: number, ty: number): void {
      tx = alCoerceNumber(this.context, tx);
      ty = alCoerceNumber(this.context, ty);
      var m = toAS3Matrix(this);
      m.translate(tx, ty);
      copyAS3MatrixTo(m, this);
    }
  }
}
