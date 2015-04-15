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

  export function toAS3Point(v: AVM1Object): flash.geom.Point {
    var context = v.context;
    var x, y;
    if (v instanceof AVM1Object) {
      x = alCoerceNumber(context, v.alGet('x'));
      y = alCoerceNumber(context, v.alGet('y'));
    }
    return new context.sec.flash.geom.Point(x, y);
  }

  export function copyAS3PointTo(p: flash.geom.Point, v: AVM1Object) {
    v.alPut('x', p.x);
    v.alPut('y', p.y);
  }

  export class AVM1Point extends AVM1Object {
    constructor(context: AVM1Context, x?: number, y?: number) {
      super(context);
      this.alPrototype = context.globals.alGet('flash').alGet('geom').alGet('Point').alGetPrototypeProperty();
      this.alPut('x', x);
      this.alPut('y', y);
    }

    static fromAS3Point(context: AVM1Context, p: flash.geom.Point): AVM1Point  {
      return new AVM1Point(context, p.x, p.y);
    }
  }

  export class AVM1PointFunction extends AVM1Function {
    constructor(context: AVM1Context) {
      super(context);
      alDefineObjectProperties(this, {
        prototype: {
          value: new AVM1PointPrototype(context, this)
        },
        distance: {
          value: this.distance,
          writable: true
        },
        interpolate: {
          value: this.interpolate,
          writable: true
        }
      });
    }

    alConstruct(args?: any[]): AVM1Object {
      if (args && args.length > 0) {
        return new AVM1Point(this.context, args[0], args[1]);
      } else {
        return new AVM1Point(this.context, 0, 0);
      }
    }

    public distance(pt1: AVM1Point, pt2: AVM1Point): number {
      return this.context.sec.flash.geom.Point.axClass.distance(toAS3Point(pt1), toAS3Point(pt2));
    }

    public interpolate(pt1: AVM1Point, pt2: AVM1Point, f: number): AVM1Point {
      f = alToNumber(this.context, f);
      var p = this.context.sec.flash.geom.Point.axClass.interpolate(toAS3Point(pt1), toAS3Point(pt2), f);
      return AVM1Point.fromAS3Point(this.context, p);
    }

    public polar(len: number, angle: number): AVM1Point  {
      len = alToNumber(this.context, len);
      angle = alToNumber(this.context, angle);
      return AVM1Point.fromAS3Point(this.context,
        this.context.sec.flash.geom.Point.axClass.polar(len, angle));
    }
  }

  export class AVM1PointPrototype extends AVM1Object {
    constructor(context: AVM1Context, fn: AVM1Function) {
      super(context);
      this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
      alDefineObjectProperties(this, {
        constructor: {
          value: fn,
          writable: true
        },
        length: {
          get: this.getLength
        },
        add: {
          value: this.add,
          writable: true
        },
        clone: {
          value: this.clone,
          writable: true
        },
        equals: {
          value: this.equals,
          writable: true
        },
        normalize: {
          value: this.normalize,
          writable: true
        },
        offset: {
          value: this.offset,
          writable: true
        },
        subtract: {
          value: this.subtract,
          writable: true
        },
        toString: {
          value: this._toString,
          writable: true
        }
      })
    }

    public getLength(): number {
      return toAS3Point(this).length;
    }

    public add(v: AVM1Point): AVM1Point {
      return AVM1Point.fromAS3Point(this.context, toAS3Point(this).add(toAS3Point(v)));
    }

    public clone(): AVM1Point {
      var result = new AVM1Point(this.context);
      if (this instanceof AVM1Object) {
        result.alPut('x', this.alGet('x'));
        result.alPut('y', this.alGet('y'));
      }
      return result;
    }

    public equals(toCompare: AVM1Point): boolean {
      return toAS3Point(this).equals(toAS3Point(toCompare));
    }

    public normalize(length: number): void {
      length = alToNumber(this.context, length);
      var p = toAS3Point(this);
      p.normalize(length);
      copyAS3PointTo(p, this);
    }

    public offset(dx: number, dy: number): void {
      dx = alToNumber(this.context, dx);
      dy = alToNumber(this.context, dy);
      var p = toAS3Point(this);
      p.offset(dx, dy);
      copyAS3PointTo(p, this);
    }

    public subtract(v: AVM1Point): AVM1Point {
      return AVM1Point.fromAS3Point(this.context, toAS3Point(this).subtract(toAS3Point(v)));
    }

    public _toString(): string {
      return '(x=' + this.alGet('x') + ', y=' + this.alGet('y') + ')';
    }
  }
}