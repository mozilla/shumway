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
// Class: Matrix
module Shumway.AVM2.AS.flash.geom {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
  import Bounds = Shumway.Bounds;

  export class Matrix extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["a", "b", "c", "d", "tx", "ty", "concat", "invert", "identity", "createBox", "createGradientBox", "rotate", "translate", "scale", "deltaTransformPoint", "transformPoint", "copyFrom", "setTo", "copyRowTo", "copyColumnTo", "copyRowFrom", "copyColumnFrom", "clone", "toString"];

    constructor (a: number = 1, b: number = 0, c: number = 0, d: number = 1, tx: number = 0, ty: number = 0) {
      false && super();
      this.a  = +a;
      this.b  = +b;
      this.c  = +c;
      this.d  = +d;
      this.tx = +tx;
      this.ty = +ty;
    }

    public static FromUntyped(obj: any): Matrix {
      return new flash.geom.Matrix(obj.a, obj.b, obj.c, obj.d, obj.tx, obj.ty);
    }

    // Keep in sync with writeExternal below!
    public static FromDataBuffer(input: DataBuffer) {
      return new flash.geom.Matrix(input.readFloat(), input.readFloat(), input.readFloat(),
                                   input.readFloat(), input.readFloat(), input.readFloat());
    }

    public static FROZEN_IDENTITY_MATRIX: Matrix = Object.freeze(new Matrix());
    // Must only be used in cases where the members are fully initialized and then directly used.
    public static TEMP_MATRIX: Matrix = new Matrix();

    public a: number;
    public b: number;
    public c: number;
    public d: number;
    public tx: number;
    public ty: number;

    public set native_a(a: number) {
      this.a = +a;
    }

    public get native_a(): number {
      return this.a;
    }

    public set native_b(b: number) {
      this.b = +b;
    }

    public get native_b(): number {
      return this.b;
    }

    public set native_c(c: number) {
      this.c = +c;
    }

    public get native_c(): number {
      return this.c;
    }

    public set native_d(d: number) {
      this.d = +d;
    }

    public get native_d(): number {
      return this.d;
    }

    public set native_tx(tx: number) {
      this.tx = +tx;
    }

    public get native_tx(): number {
      return this.tx;
    }

    public set native_ty(ty: number) {
      this.ty = +ty;
    }

    public get native_ty(): number {
      return this.ty;
    }

    public Matrix(a: number = 1, b: number = 0, c: number = 0, d: number = 1, tx: number = 0, ty: number = 0) {
      this.a  = a;
      this.b  = b;
      this.c  = c;
      this.d  = d;
      this.tx = tx;
      this.ty = ty;
    }

    /**
     * this = this * m
     */
    public concat(m: Matrix): void {
      var a =  this.a * m.a;
      var b =  0.0;
      var c =  0.0;
      var d =  this.d * m.d;
      var tx = this.tx * m.a + m.tx;
      var ty = this.ty * m.d + m.ty;

      if (this.b !== 0.0 || this.c !== 0.0 || m.b !== 0.0 || m.c !== 0.0) {
        a  += this.b  * m.c;
        d  += this.c  * m.b;
        b  += this.a  * m.b + this.b * m.d;
        c  += this.c  * m.a + this.d * m.c;
        tx += this.ty * m.c;
        ty += this.tx * m.b;
      }

      this.a  = a;
      this.b  = b;
      this.c  = c;
      this.d  = d;
      this.tx = tx;
      this.ty = ty;
    }

    /**
     * this = m * this
     */
    public preMultiply(m: Matrix): void {
      this.preMultiplyInto(m, this);
    }

    /**
     * target = m * this
     */
    public preMultiplyInto(m: Matrix, target: Matrix): void {
      var a =  m.a * this.a;
      var b =  0.0;
      var c =  0.0;
      var d =  m.d * this.d;
      var tx = m.tx * this.a + this.tx;
      var ty = m.ty * this.d + this.ty;

      if (m.b !== 0.0 || m.c !== 0.0 || this.b !== 0.0 || this.c !== 0.0) {
        a  += m.b  * this.c;
        d  += m.c  * this.b;
        b  += m.a  * this.b + m.b * this.d;
        c  += m.c  * this.a + m.d * this.c;
        tx += m.ty * this.c;
        ty += m.tx * this.b;
      }

      target.a  = a;
      target.b  = b;
      target.c  = c;
      target.d  = d;
      target.tx = tx;
      target.ty = ty;
    }

    public invert(): void {
      this.invertInto(this);
    }

    public invertInto(target: Matrix): void {
      var b  = this.b;
      var c  = this.c;
      var tx = this.tx;
      var ty = this.ty;
      if (b === 0 && c === 0) {
        var a = target.a = 1 / this.a;
        var d = target.d = 1 / this.d;
        target.b = target.c = 0;
        target.tx = -a * tx;
        target.ty = -d * ty;
        return;
      }
      var a = this.a;
      var d = this.d;
      var determinant = a * d - b * c;
      if (determinant === 0) {
        target.identity();
        return;
      }
      /**
       * Multiplying by reciprocal of the |determinant| is only accurate if the reciprocal is
       * representable without loss of precision. This is usually only the case for powers of
       * two: 1/2, 1/4 ...
       */
      determinant = 1 / determinant;
      var t = 0;
      t = target.a =  d * determinant;
      b = target.b = -b * determinant;
      c = target.c = -c * determinant;
      d = target.d =  a * determinant;
      target.tx = -(t * tx + c * ty);
      target.ty = -(b * tx + d * ty);
    }

    public identity(): void {
      this.a = this.d = 1;
      this.b = this.c = this.tx = this.ty = 0;
    }

    public createBox(scaleX: number, scaleY: number, rotation: number = 0, tx: number = 0, ty: number = 0): void {
      if (rotation !== 0) {
        var u: number = Math.cos(rotation);
        var v: number = Math.sin(rotation);
        this.a =  u * scaleX;
        this.b =  v * scaleY;
        this.c = -v * scaleX;
        this.d =  u * scaleY;
      } else {
        this.a = scaleX;
        this.b = 0;
        this.c = 0;
        this.d = scaleY;
      }
      this.tx = tx;
      this.ty = ty;
    }

    public createGradientBox(width: number, height: number, rotation: number = 0, tx: number = 0, ty: number = 0): void {
      this.createBox(width / 1638.4, height / 1638.4, rotation, tx + width / 2, ty + height / 2);
    }

    public rotate(angle: number): void {
      angle = +angle;
      if (angle !== 0) {
        var u: number   = Math.cos(angle);
        var v: number   = Math.sin(angle);
        var ta: number  = this.a;
        var tb: number  = this.b;
        var tc: number  = this.c;
        var td: number  = this.d;
        var ttx: number = this.tx;
        var tty: number = this.ty;
        this.a =  ta  * u - tb  * v;
        this.b =  ta  * v + tb  * u;
        this.c =  tc  * u - td  * v;
        this.d =  tc  * v + td  * u;
        this.tx = ttx * u - tty * v;
        this.ty = ttx * v + tty * u;
      }
    }

    public translate(dx: number, dy: number): void {
      this.tx += dx;
      this.ty += dy;
    }

    public scale(sx: number, sy: number): void {
      if (sx !== 1) {
        this.a  *= sx;
        this.c  *= sx;
        this.tx *= sx;
      }
      if (sy !== 1) {
        this.b  *= sy;
        this.d  *= sy;
        this.ty *= sy;
      }
    }

    public deltaTransformPoint(point: Point): Point {
      return new Point(this.a * point.x + this.c * point.y, this.b * point.x + this.d * point.y);
    }

    public transformX(x: number, y: number): number {
      return this.a * x + this.c * y + this.tx;
    }

    public transformY(x: number, y: number): number {
      return this.b * x + this.d * y + this.ty;
    }

    public transformPoint(point: Point): Point {
      return new Point(this.a * point.x + this.c * point.y + this.tx, this.b * point.x + this.d * point.y + this.ty);
    }

    public transformPointInPlace(point): Point {
      point.setTo(this.a * point.x + this.c * point.y + this.tx,
                  this.b * point.x + this.d * point.y + this.ty);
      return point;
    }

    transformBounds(bounds: Bounds): void {
      var a  = this.a;
      var b  = this.b;
      var c  = this.c;
      var d  = this.d;
      var tx = this.tx;
      var ty = this.ty;

      var x = bounds.xMin;
      var y = bounds.yMin;
      var w = bounds.width;
      var h = bounds.height;

      var x0 = Math.round(a * x + c * y + tx);
      var y0 = Math.round(b * x + d * y + ty);
      var x1 = Math.round(a * (x + w) + c * y + tx);
      var y1 = Math.round(b * (x + w) + d * y + ty);
      var x2 = Math.round(a * (x + w) + c * (y + h) + tx);
      var y2 = Math.round(b * (x + w) + d * (y + h) + ty);
      var x3 = Math.round(a * x + c * (y + h) + tx);
      var y3 = Math.round(b * x + d * (y + h) + ty);

      var tmp = 0;

      // Manual Min/Max is a lot faster than calling Math.min/max
      // X Min-Max
      if (x0 > x1) { tmp = x0; x0 = x1; x1 = tmp; }
      if (x2 > x3) { tmp = x2; x2 = x3; x3 = tmp; }

      bounds.xMin = x0 < x2 ? x0 : x2;
      bounds.xMax = x1 > x3 ? x1 : x3;

      // Y Min-Max
      if (y0 > y1) { tmp = y0; y0 = y1; y1 = tmp; }
      if (y2 > y3) { tmp = y2; y2 = y3; y3 = tmp; }

      bounds.yMin = y0 < y2 ? y0 : y2;
      bounds.yMax = y1 > y3 ? y1 : y3;
    }

    getScaleX(): number {
      if (this.a === 1 && this.b === 0) {
        return 1;
      }
      return Math.sqrt(this.a * this.a + this.b * this.b);
    }

    getScaleY(): number {
      if (this.c === 0 && this.d === 1) {
        return 1;
      }
      var result = Math.sqrt(this.c * this.c + this.d * this.d);
      var det = this.a * this.d - this.b * this.c;
      return det < 0 ? -result : result;
    }

    getAbsoluteScaleX(): number {
      return Math.abs(this.getScaleX());
    }

    getAbsoluteScaleY(): number {
      return Math.abs(this.getScaleY());
    }

    public getRotation(): number {
      return Math.atan2(this.b, this.a);
    }

    public copyFrom(sourceMatrix: Matrix): void {
      this.a  = sourceMatrix.a;
      this.b  = sourceMatrix.b;
      this.c  = sourceMatrix.c;
      this.d  = sourceMatrix.d;
      this.tx = sourceMatrix.tx;
      this.ty = sourceMatrix.ty;
    }

    public setTo(a: number, b: number, c: number, d: number, tx: number, ty: number): void {
      this.a  = +a;
      this.b  = +b;
      this.c  = +c;
      this.d  = +d;
      this.tx = +tx;
      this.ty = +ty;
    }

    public toTwipsInPlace(): Matrix {
      this.tx = (this.tx * 20) | 0;
      this.ty = (this.ty * 20) | 0;
      return this;
    }

    public toPixelsInPlace(): Matrix {
      this.tx /= 20;
      this.ty /= 20;
      return this;
    }

    public copyRowTo(row: number, vector3D: Vector3D): void {
      row = row >>> 0;
      if (row === 0) {
        vector3D.x = this.a;
        vector3D.y = this.c;
        vector3D.z = this.tx;
      } else if (row === 1) {
        vector3D.x = this.b;
        vector3D.y = this.d;
        vector3D.z = this.ty;
      } else if (row === 2) {
        vector3D.x = 0;
        vector3D.y = 0;
        vector3D.z = 1;
      }
    }

    public copyColumnTo(column: number, vector3D: Vector3D): void {
      column = column >>> 0;
      if (column === 0) {
        vector3D.x = this.a;
        vector3D.y = this.b;
        vector3D.z = 0;
      } else if (column === 1) {
        vector3D.x = this.c;
        vector3D.y = this.d;
        vector3D.z = 0;
      } else if (column === 2) {
        vector3D.x = this.tx;
        vector3D.y = this.ty;
        vector3D.z = 1;
      }
    }

    public copyRowFrom(row: number, vector3D: Vector3D): void {
      row = row >>> 0;
      if (row === 0) {
        this.a  = vector3D.x;
        this.c  = vector3D.y;
        this.tx = vector3D.z;
      } else if (row === 1) {
        this.b  = vector3D.x;
        this.d  = vector3D.y;
        this.ty = vector3D.z;
      }
    }

    public copyColumnFrom(column: number, vector3D: Vector3D): void {
      column = column >>> 0;
      if (column === 0) {
        this.a  = vector3D.x;
        this.c  = vector3D.y;
        this.tx = vector3D.z;
      } else if (column === 1) {
        this.b  = vector3D.x;
        this.d  = vector3D.y;
        this.ty = vector3D.z;
      }
    }

    /**
     * Updates the scale and skew componenets of the matrix.
     */
    public updateScaleAndRotation(scaleX: number, scaleY: number, rotation: number) {
      // The common case.
      if (rotation === 0 || rotation === 360) {
        this.a = scaleX;
        this.b = this.c = 0;
        this.d = scaleY;
        return;
      }
      var u = 0, v = 0;
      switch (rotation) {
        case  90: case -270: u =  0, v =  1; break;
        case 180: case -180: u = -1, v =  0; break;
        case 270: case  -90: u =  0, v = -1; break;
        default:
          var angle = rotation / 180 * Math.PI;
          u = Math.cos(angle);
          v = Math.sin(angle);
      }
      this.a =  u * scaleX;
      this.b =  v * scaleX;
      this.c = -v * scaleY;
      this.d =  u * scaleY;
    }

    public clone(): Matrix {
      return new flash.geom.Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
    }

    public equals(other: Matrix): boolean {
      return this.a  === other.a  && this.b  === other.b &&
             this.c  === other.c  && this.d  === other.d &&
             this.tx === other.tx && this.ty === other.ty;
    }

    public toString(): string {
      return "(a=" + this.a + ", b=" + this.b + ", c=" + this.c + ", d=" + this.d +
             ", tx=" + this.tx + ", ty=" + this.ty + ")";
    }

    // Keep in sync with static FromDataBuffer above!
    public writeExternal(output: DataBuffer) {
      output.writeFloat(this.a);
      output.writeFloat(this.b);
      output.writeFloat(this.c);
      output.writeFloat(this.d);
      output.writeFloat(this.tx);
      output.writeFloat(this.ty);
    }
  }
}
