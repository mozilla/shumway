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
module Shumway.AVMX.AS.flash.geom {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVMX.asCoerceString;
  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
  import Bounds = Shumway.Bounds;

  var PI = Math.PI;
  var HalfPI = PI / 2;
  var PacPI = PI + HalfPI;
  var TwoPI = PI * 2;

  function cos(angle: number): number {
    switch (angle) {
      case HalfPI: case -PacPI: return 0;
      case PI: case -PI: return -1;
      case PacPI: case -HalfPI: return 0;
      default:
        return Math.cos(angle);
    }
  }

  function sin(angle: number): number {
    switch (angle) {
      case HalfPI: case -PacPI: return 1;
      case PI: case -PI: return 0;
      case PacPI: case -HalfPI: return -1;
      default:
        return Math.sin(angle);
    }
  }

  export class Matrix extends ASObject {

    static axClass: typeof Matrix;

    static classInitializer() {
      this.FROZEN_IDENTITY_MATRIX = Object.freeze(this.axConstruct([]));
      this.TEMP_MATRIX = this.axConstruct([]);
    }
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null; // ["a", "b", "c", "d", "tx", "ty", "concat",
                                              // "invert", "identity", "createBox",
                                              // "createGradientBox", "rotate", "translate",
                                              // "scale", "deltaTransformPoint", "transformPoint",
                                              // "copyFrom", "setTo", "copyRowTo", "copyColumnTo",
                                              // "copyRowFrom", "copyColumnFrom", "clone",
                                              // "toString"];

    constructor(a: number = 1, b: number = 0, c: number = 0, d: number = 1, tx: number = 0,
                ty: number = 0)
    {
      super();
      var m = this._data = new Float64Array(6);
      m[0] = a;
      m[1] = b;
      m[2] = c;
      m[3] = d;
      m[4] = tx;
      m[5] = ty;
    }

    public static FromUntyped(object: any): Matrix {
      return new this.securityDomain.flash.geom.Matrix(object.a, object.b, object.c, object.d,
                                                       object.tx, object.ty);
    }

    // Keep in sync with writeExternal below!
    public static FromDataBuffer(input: DataBuffer) {
      return new this.securityDomain.flash.geom.Matrix(input.readFloat(), input.readFloat(),
                                                       input.readFloat(), input.readFloat(),
                                                       input.readFloat(), input.readFloat());
    }

    public static FROZEN_IDENTITY_MATRIX: Matrix;

    // Must only be used in cases where the members are fully initialized and then directly used.
    public static TEMP_MATRIX: Matrix;

    // Matrix data is stored in a typed array, this has proven to be about 60% faster in Firefox
    // and
    // about the same speed in Chrome. At some point we may want to pool all these matrix objects,
    // or share one large array buffer for matrix data.
    _data: Float64Array;
    
    public set a(a: number) {
      this._data[0] = a;
    }

    public get a(): number {
      return this._data[0];
    }

    public set b(b: number) {
      this._data[1] = b;
    }

    public get b(): number {
      return this._data[1];
    }

    public set c(c: number) {
      this._data[2] = c;
    }

    public get c(): number {
      return this._data[2];
    }

    public set d(d: number) {
      this._data[3] = d;
    }

    public get d(): number {
      return this._data[3];
    }

    public set tx(tx: number) {
      this._data[4] = tx;
    }

    public get tx(): number {
      return this._data[4];
    }

    public set ty(ty: number) {
      this._data[5] = ty;
    }

    public get ty(): number {
      return this._data[5];
    }

    /**
     * this = this * other
     */
    public concat(other: Matrix): void {
      var m = this._data, n = other._data;
      var a =  m[0] * n[0];
      var b =  0.0;
      var c =  0.0;
      var d =  m[3] * n[3];
      var tx = m[4] * n[0] + n[4];
      var ty = m[5] * n[3] + n[5];

      if (m[1] !== 0.0 || m[2] !== 0.0 || n[1] !== 0.0 || n[2] !== 0.0) {
        a  += m[1] * n[2];
        d  += m[2] * n[1];
        b  += m[0] * n[1] + m[1] * n[3];
        c  += m[2] * n[0] + m[3] * n[2];
        tx += m[5] * n[2];
        ty += m[4] * n[1];
      }

      m[0] = a;
      m[1] = b;
      m[2] = c;
      m[3] = d;
      m[4] = tx;
      m[5] = ty;
    }

    /**
     * this = other * this
     */
    public preMultiply(other: Matrix): void {
      this.preMultiplyInto(other, this);
    }

    /**
     * target = other * this
     */
    public preMultiplyInto(other: Matrix, target: Matrix): void {
      var m = this._data, n = other._data, t = target._data;
      var a =  n[0] * m[0];
      var b =  0.0;
      var c =  0.0;
      var d =  n[3] * m[3];
      var tx = n[4] * m[0] + m[4];
      var ty = n[5] * m[3] + m[5];

      if (n[1] !== 0.0 || n[2] !== 0.0 || m[1] !== 0.0 || m[2] !== 0.0) {
        a  += n[1] * m[2];
        d  += n[2] * m[1];
        b  += n[0] * m[1] + n[1] * m[3];
        c  += n[2] * m[0] + n[3] * m[2];
        tx += n[5] * m[2];
        ty += n[4] * m[1];
      }

      t[0] = a;
      t[1] = b;
      t[2] = c;
      t[3] = d;
      t[4] = tx;
      t[5] = ty;
    }

    public invert(): void {
      this.invertInto(this);
    }

    public invertInto(target: Matrix): void {
      var m = this._data, t = target._data;
      var b  = m[1];
      var c  = m[2];
      var tx = m[4];
      var ty = m[5];
      if (b === 0 && c === 0) {
        var a = t[0] = 1 / m[0];
        var d = t[3] = 1 / m[3];
        t[1] = t[2] = 0;
        t[4] = -a * tx;
        t[5] = -d * ty;
        return;
      }
      var a = m[0];
      var d = m[3];
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
      var k = 0;
      k = t[0] =  d * determinant;
      b = t[1] = -b * determinant;
      c = t[2] = -c * determinant;
      d = t[3] =  a * determinant;
      t[4] = -(k * tx + c * ty);
      t[5] = -(b * tx + d * ty);
    }

    public identity(): void {
      var m = this._data;
      m[0] = m[3] = 1;
      m[1] = m[2] = m[4] = m[5] = 0;
    }

    public createBox(scaleX: number, scaleY: number, rotation: number = 0, tx: number = 0, ty: number = 0): void {
      var m = this._data;
      if (rotation !== 0) {
        var u = cos(rotation);
        var v = sin(rotation);
        m[0] =  u * scaleX;
        m[1] =  v * scaleY;
        m[2] = -v * scaleX;
        m[3] =  u * scaleY;
      } else {
        m[0] = scaleX;
        m[1] = 0;
        m[2] = 0;
        m[3] = scaleY;
      }
      m[4] = tx;
      m[5] = ty;
    }

    public createGradientBox(width: number, height: number, rotation: number = 0, tx: number = 0, ty: number = 0): void {
      this.createBox(width / 1638.4, height / 1638.4, rotation, tx + width / 2, ty + height / 2);
    }

    public rotate(angle: number): void {
      angle = +angle;
      if (angle !== 0) {
        var m = this._data;
        var u = cos(angle);
        var v = sin(angle);
        var ta = m[0];
        var tb = m[1];
        var tc = m[2];
        var td = m[3];
        var ttx = m[4];
        var tty = m[5];
        m[0] = ta  * u - tb  * v;
        m[1] = ta  * v + tb  * u;
        m[2] = tc  * u - td  * v;
        m[3] = tc  * v + td  * u;
        m[4] = ttx * u - tty * v;
        m[5] = ttx * v + tty * u;
      }
    }

    public translate(dx: number, dy: number): void {
      var m = this._data;
      m[4] += dx;
      m[5] += dy;
    }

    public scale(sx: number, sy: number): void {
      var m = this._data;
      if (sx !== 1) {
        m[0] *= sx;
        m[2] *= sx;
        m[4] *= sx;
      }
      if (sy !== 1) {
        m[1] *= sy;
        m[3] *= sy;
        m[5] *= sy;
      }
    }

    public deltaTransformPoint(point: Point): Point {
      var x = this._data[0] * point.x + this._data[2] * point.y;
      var y = this._data[1] * point.x + this._data[3] * point.y;
      return new this.securityDomain.flash.geom.Point(x, y);
    }

    public transformX(x: number, y: number): number {
      var m = this._data;
      return m[0] * x + m[2] * y + m[4];
    }

    public transformY(x: number, y: number): number {
      var m = this._data;
      return m[1] * x + m[3] * y + m[5];
    }

    public transformPoint(point: Point): Point {
      var m = this._data;
      return new this.securityDomain.flash.geom.Point(m[0] * point.x + m[2] * point.y + m[4],
                                                      m[1] * point.x + m[3] * point.y + m[5]);
    }

    public transformPointInPlace(point): Point {
      var m = this._data;
      point.setTo(m[0] * point.x + m[2] * point.y + m[4],
                  m[1] * point.x + m[3] * point.y + m[5]);
      return point;
    }

    transformBounds(bounds: Bounds): void {
      var m = this._data;
      var a  = m[0];
      var b  = m[1];
      var c  = m[2];
      var d  = m[3];
      var tx = m[4];
      var ty = m[5];

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

    getDeterminant() {
      var m = this._data;
      return m[0] * m[3] - m[1] * m[2];
    }

    getScaleX(): number {
      var m = this._data;
      if (m[0] === 1 && m[1] === 0) {
        return 1;
      }
      var result = Math.sqrt(m[0] * m[0] + m[1] * m[1]);
      return this.getDeterminant() < 0 ? -result : result;
    }

    getScaleY(): number {
      var m = this._data;
      if (m[2] === 0 && m[3] === 1) {
        return 1;
      }
      var result = Math.sqrt(m[2] * m[2] + m[3] * m[3]);
      return this.getDeterminant() < 0 ? -result : result;
    }

    getAbsoluteScaleX(): number {
      return Math.abs(this.getScaleX());
    }

    getAbsoluteScaleY(): number {
      return Math.abs(this.getScaleY());
    }

    public getSkewX(): number {
      return Math.atan2(this._data[3], this._data[2]) - (Math.PI / 2);
    }

    public getSkewY(): number {
      return Math.atan2(this._data[1], this._data[0]);
    }

    public copyFrom(other: Matrix): void {
      var m = this._data, n = other._data;
      m[0] = n[0];
      m[1] = n[1];
      m[2] = n[2];
      m[3] = n[3];
      m[4] = n[4];
      m[5] = n[5];
    }

    public copyFromUntyped(object: any) {
      var m = this._data;
      m[0] = object.a;
      m[1] = object.b;
      m[2] = object.c;
      m[3] = object.d;
      m[4] = object.tx;
      m[5] = object.ty;
    }

    public setTo(a: number, b: number, c: number, d: number, tx: number, ty: number): void {
      var m = this._data;
      m[0] = a;
      m[1] = b;
      m[2] = c;
      m[3] = d;
      m[4] = tx;
      m[5] = ty;
    }

    public toTwipsInPlace(): Matrix {
      var m = this._data;
      m[4] = (m[4] * 20) | 0;
      m[5] = (m[5] * 20) | 0;
      return this;
    }

    public toPixelsInPlace(): Matrix {
      var m = this._data;
      m[4] /= 20;
      m[5] /= 20;
      return this;
    }

    public copyRowTo(row: number, vector3D: Vector3D): void {
      var m = this._data;
      row = row >>> 0;
      if (row === 0) {
        vector3D.x = m[0];
        vector3D.y = m[2];
        vector3D.z = m[4];
      } else if (row === 1) {
        vector3D.x = m[1];
        vector3D.y = m[3];
        vector3D.z = m[5];
      } else if (row === 2) {
        vector3D.x = 0;
        vector3D.y = 0;
        vector3D.z = 1;
      }
    }

    public copyColumnTo(column: number, vector3D: Vector3D): void {
      var m = this._data;
      column = column >>> 0;
      if (column === 0) {
        vector3D.x = m[0];
        vector3D.y = m[1];
        vector3D.z = 0;
      } else if (column === 1) {
        vector3D.x = m[2];
        vector3D.y = m[3];
        vector3D.z = 0;
      } else if (column === 2) {
        vector3D.x = m[4];
        vector3D.y = m[5];
        vector3D.z = 1;
      }
    }

    public copyRowFrom(row: number, vector3D: Vector3D): void {
      var m = this._data;
      row = row >>> 0;
      if (row === 0) {
        m[0] = vector3D.x;
        m[2] = vector3D.y;
        m[4] = vector3D.z;
      } else if (row === 1) {
        m[1] = vector3D.x;
        m[3] = vector3D.y;
        m[5] = vector3D.z;
      }
    }

    public copyColumnFrom(column: number, vector3D: Vector3D): void {
      var m = this._data;
      column = column >>> 0;
      if (column === 0) {
        m[0] = vector3D.x;
        m[2] = vector3D.y;
        m[4] = vector3D.z;
      } else if (column === 1) {
        m[1] = vector3D.x;
        m[3] = vector3D.y;
        m[5] = vector3D.z;
      }
    }

    /**
     * Updates the scale and skew componenets of the matrix.
     */
    public updateScaleAndRotation(scaleX: number, scaleY: number, skewX: number, skewY: number) {
      var m = this._data;

      // The common case.
      if ((skewX === 0 || skewX === TwoPI) && (skewY === 0 || skewY === TwoPI)) {
        m[0] = scaleX;
        m[1] = m[2] = 0;
        m[3] = scaleY;
        return;
      }

      var u = cos(skewX);
      var v = sin(skewX);
      if (skewX === skewY) {
        m[0] = u * scaleX;
        m[1] = v * scaleX;
      } else {
        m[0] = cos(skewY) * scaleX;
        m[1] = sin(skewY) * scaleX;
      }
      m[2] = -v * scaleY;
      m[3] = u * scaleY;
    }

    public clone(): Matrix {
      var m = this._data;
      return new this.securityDomain.flash.geom.Matrix(m[0], m[1], m[2], m[3], m[4], m[5]);
    }

    public equals(other: Matrix): boolean {
      var m = this._data, n = other._data;
      return m[0] === n[0] && m[1] === n[1] &&
             m[2] === n[2] && m[3] === n[3] &&
             m[4] === n[4] && m[5] === n[5];
    }

    public toString(): string {
      var m = this._data;
      return "(a=" + m[0] + ", b=" + m[1] + ", c=" + m[2] + ", d=" + m[3] + ", tx=" + m[4] + ", ty=" + m[5] + ")";
    }

    // Keep in sync with static FromDataBuffer above!
    public writeExternal(output: DataBuffer) {
      var m = this._data;
      output.writeFloat(m[0]);
      output.writeFloat(m[1]);
      output.writeFloat(m[2]);
      output.writeFloat(m[3]);
      output.writeFloat(m[4]);
      output.writeFloat(m[5]);
    }
  }
}
