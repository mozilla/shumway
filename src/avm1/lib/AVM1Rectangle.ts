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

  export function toAS3Rectangle(v: AVM1Object): flash.geom.Rectangle {
    var context = v.context;
    var x, y, width, height;
    if (v instanceof AVM1Object) {
      x = alCoerceNumber(context, v.alGet('x'));
      y = alCoerceNumber(context, v.alGet('y'));
      width = alCoerceNumber(context, v.alGet('width'));
      height = alCoerceNumber(context, v.alGet('height'));
    }
    return new context.sec.flash.geom.Rectangle(x, y, width, height);
  }

  export function copyAS3RectangleTo(r: flash.geom.Rectangle, v: AVM1Object) {
    v.alPut('x', r.x);
    v.alPut('y', r.y);
    v.alPut('width', r.width);
    v.alPut('height', r.height);
  }

  export class AVM1Rectangle extends AVM1Object {
    constructor(context: AVM1Context, x?: number, y?: number, width?: number, height?: number) {
      super(context);
      this.alPrototype = context.globals.alGet('flash').alGet('geom').alGet('Rectangle').alGetPrototypeProperty();
      this.alPut('x', x);
      this.alPut('y', y);
      this.alPut('width', x);
      this.alPut('height', y);
    }

    static fromAS3Rectangle(context: AVM1Context, r: flash.geom.Rectangle): AVM1Point  {
      return new AVM1Rectangle(context, r.x, r.y, r.width, r.height);
    }
  }

  export class AVM1RectangleFunction extends AVM1Function {
    constructor(context: AVM1Context) {
      super(context);
      alDefineObjectProperties(this, {
        prototype: {
          value: new AVM1RectanglePrototype(context, this)
        }
      });
    }

    alConstruct(args?: any[]): AVM1Object {
      if (args && args.length > 0) {
        return new AVM1Rectangle(this.context, args[0], args[1], args[2], args[3]);
      } else {
        return new AVM1Rectangle(this.context, 0, 0, 0, 0);
      }
    }
  }

  export class AVM1RectanglePrototype extends AVM1Object {
    constructor(context: AVM1Context, fn: AVM1Function) {
      super(context);
      this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
      alDefineObjectProperties(this, {
        constructor: {
          value: fn,
          writable: true
        },
        bottom: {
          get: this.getBottom,
          set: this.setBottom
        },
        bottomRight: {
          get: this.getBottomRight,
          set: this.setBottomRight
        },
        left: {
          get: this.getLeft,
          set: this.setLeft
        },
        right: {
          get: this.getRight,
          set: this.setRight
        },
        size: {
          get: this.getSize,
          set: this.setSize
        },
        top: {
          get: this.getTop,
          set: this.setTop
        },
        topLeft: {
          get: this.getTopLeft,
          set: this.setTopLeft
        },
        clone: {
          value: this.clone,
          writable: true
        },
        contains: {
          value: this.contains,
          writable: true
        },
        containsPoint: {
          value: this.containsPoint,
          writable: true
        },
        containsRectangle: {
          value: this.containsRectangle,
          writable: true
        },
        equals: {
          value: this.equals,
          writable: true
        },
        inflate: {
          value: this.inflate,
          writable: true
        },
        inflatePoint: {
          value: this.inflatePoint,
          writable: true
        },
        intersection: {
          value: this.intersection,
          writable: true
        },
        intersects: {
          value: this.intersects,
          writable: true
        },
        isEmpty: {
          value: this.isEmpty,
          writable: true
        },
        offset: {
          value: this.offset,
          writable: true
        },
        offsetPoint: {
          value: this.offsetPoint,
          writable: true
        },
        setEmpty: {
          value: this.setEmpty,
          writable: true
        },
        toString: {
          value: this._toString,
          writable: true
        },
        union: {
          value: this.union,
          writable: true
        }
      })
    }

    public getBottom(): number {
      return alToNumber(this.context, this.alGet('y')) + alToNumber(this.context, this.alGet('height'));
    }

    public setBottom(value: number) {
      this.alPut('height', alToNumber(this.context, value) - alToNumber(this.context, this.alGet('y')));
    }

    public getBottomRight(): AVM1Point {
      return new AVM1Point(this.context,
        AVM1RectanglePrototype.prototype.getRight.call(this),
        AVM1RectanglePrototype.prototype.getBottom.call(this));
    }

    public setBottomRight(pt: AVM1Point) {
      AVM1RectanglePrototype.prototype.setRight.call(this, pt.alGet('x'));
      AVM1RectanglePrototype.prototype.setBottom.call(this, pt.alGet('y'));
    }

    public getLeft(): number {
      return alToNumber(this.context, this.alGet('x'));
    }

    public setLeft(value: number) {
      this.alPut('x', alToNumber(this.context, value));
    }

    public getSize(): AVM1Point {
      return new AVM1Point(this.context, this.alGet('width'), this.alGet('height'));
    }

    public setSize(pt: AVM1Point) {
      this.alPut('width', pt.alGet('x'));
      this.alPut('height', pt.alGet('y'));
    }

    public getRight(): number {
      return alToNumber(this.context, this.alGet('x')) + alToNumber(this.context, this.alGet('width'));
    }

    public setRight(value: number) {
      this.alPut('width', alToNumber(this.context, value) - alToNumber(this.context, this.alGet('x')));
    }

    public getTop(): number {
      return alToNumber(this.context, this.alGet('y'));
    }

    public setTop(value: number) {
      this.alPut('y', alToNumber(this.context, value));
    }

    public getTopLeft(): AVM1Point {
      return new AVM1Point(this.context,
        AVM1RectanglePrototype.prototype.getLeft.call(this),
        AVM1RectanglePrototype.prototype.getTop.call(this));
    }

    public setTopLeft(pt: AVM1Point) {
      AVM1RectanglePrototype.prototype.setLeft.call(this, pt.alGet('x'));
      AVM1RectanglePrototype.prototype.setTop.call(this, pt.alGet('y'));
    }

    public clone(): AVM1Rectangle {
      var result = new AVM1Rectangle(this.context);
      if (this instanceof AVM1Object) {
        result.alPut('x', this.alGet('x'));
        result.alPut('y', this.alGet('y'));
        result.alPut('width', this.alGet('width'));
        result.alPut('height', this.alGet('height'));
      }
      return result;
    }

    public contains(x: number, y: number): boolean {
      x = alToNumber(this.context, x);
      y = alToNumber(this.context, y);
      var r = toAS3Rectangle(this);
      return r.contains(x, y);
    }

    public containsPoint(pt: AVM1Point): boolean {
      var r = toAS3Rectangle(this), p = toAS3Point(pt);
      return r.containsPoint(p);
    }

    public containsRectangle(rect: AVM1Rectangle): boolean {
      var r = toAS3Rectangle(this), other = toAS3Rectangle(rect);
      return r.containsRect(other);
    }

    public equals(toCompare: AVM1Rectangle): boolean {
      var r = toAS3Rectangle(this), other = toAS3Rectangle(toCompare);
      return r.equals(other);
    }

    public inflate(dx: number, dy: number): void {
      dx = alToNumber(this.context, dx);
      dy = alToNumber(this.context, dy);
      var r = toAS3Rectangle(this);
      r.inflate(dx, dy);
      copyAS3RectangleTo(r, this);
    }

    public inflatePoint(pt: AVM1Point): void {
      var r = toAS3Rectangle(this), p = toAS3Point(pt);
      r.inflatePoint(p);
      copyAS3RectangleTo(r, this);
    }

    public intersection(toIntersect: AVM1Rectangle): AVM1Rectangle {
      var r = toAS3Rectangle(this), other = toAS3Rectangle(toIntersect);
      return AVM1Rectangle.fromAS3Rectangle(this.context, r.intersection(other));
    }

    public intersects(toIntersect: AVM1Rectangle): boolean {
      var r = toAS3Rectangle(this), other = toAS3Rectangle(toIntersect);
      return r.intersects(other);
    }

    public isEmpty(): boolean {
      return toAS3Rectangle(this).isEmpty();
    }

    public offset(dx: number, dy: number): void {
      dx = alToNumber(this.context, dx);
      dy = alToNumber(this.context, dy);
      var r = toAS3Rectangle(this);
      r.offset(dx, dy);
      copyAS3RectangleTo(r, this);
    }

    public offsetPoint(pt: AVM1Point): void {
      var r = toAS3Rectangle(this), p = toAS3Point(pt);
      r.offsetPoint(p);
      copyAS3RectangleTo(r, this);
    }

    public setEmpty(): void {
      this.alPut('x', 0);
      this.alPut('y', 0);
      this.alPut('width', 0);
      this.alPut('height', 0);
    }

    public _toString(): string {
      return '(x=' + this.alGet('x') + ', y=' + this.alGet('y') +
             ', width=' + this.alGet('width') + ', height=' + this.alGet('height') + ')';
    }

    public union(toUnion: AVM1Rectangle): AVM1Rectangle {
      var r = toAS3Rectangle(this), other = toAS3Rectangle(toUnion);
      return AVM1Rectangle.fromAS3Rectangle(this.context, r.union(other));
    }
  }
}