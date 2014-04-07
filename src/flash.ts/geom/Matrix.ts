/**
 * Copyright 2013 Mozilla Foundation
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
  export class Matrix extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["a", "b", "c", "d", "tx", "ty", "concat", "invert", "identity", "createBox", "createGradientBox", "rotate", "translate", "scale", "deltaTransformPoint", "transformPoint", "copyFrom", "setTo", "copyRowTo", "copyColumnTo", "copyRowFrom", "copyColumnFrom", "clone", "toString"];
    
    constructor (a: number = 1, b: number = 0, c: number = 0, d: number = 1, tx: number = 0, ty: number = 0) {
      a = +a; b = +b; c = +c; d = +d; tx = +tx; ty = +ty;
      false && super();
      notImplemented("Dummy Constructor: public flash.geom.Matrix");
    }

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
      this.a = a;
      this.b = b;
      this.c = c;
      this.d = d;
      this.tx = tx;
      this.ty = ty;
    }

    public concat(m: Matrix): void {
      var ta: number = this.a;
      var tb: number = this.b;
      var tc: number = this.c;
      var td: number = this.d;
      var ttx: number = this.tx;
      var tty: number = this.ty;
      this.a = m.a * ta + m.c * tb;
      this.b = m.b * ta + m.d * tb;
      this.c = m.a * tc + m.c * td;
      this.d = m.b * tc + m.d * td;
      this.tx = m.a * ttx + m.c * tty + m.tx;
      this.ty = m.b * ttx + m.d * tty + m.ty;
    }

    public invert(): void {
      var det: number = this.a * this.d - this.b * this.c;
      if (det == 0) {
        this.identity();
        return;
      }
      this.a = this.d / det;
      this.b = -this.b / det;
      this.c = -this.c / det;
      this.d = this.a / det;
      var ttx: number = this.tx;
      var tty: number = this.ty;
      this.tx = -(this.a * ttx + this.c * tty);
      this.ty = -(this.b * ttx + this.d * tty);
    }

    public identity(): void {
      this.a = this.d = 1;
      this.b = this.c = this.tx = this.ty = 0;
    }

    public createBox(scaleX: number, scaleY: number, rotation: number = 0, tx: number = 0, ty: number = 0): void {
      if (rotation != 0) {
        var u: number = Math.cos(rotation);
        var v: number = Math.sin(rotation);
        this.a = u * scaleX;
        this.b = v * scaleY;
        this.c = -v * scaleX;
        this.d = u * scaleY;
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
      if (angle != 0) {
        var u: number = Math.cos(angle);
        var v: number = Math.sin(angle);
        var ta: number = this.a;
        var tb: number = this.b;
        var tc: number = this.c;
        var td: number = this.d;
        var ttx: number = this.tx;
        var tty: number = this.ty;
        this.a = ta * u - tb * v;
        this. b = ta * v + tb * u;
        this.c = tc * u - td * v;
        this.d = tc * v + td * u;
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
        this.a *= sx;
        this.c *= sx;
        this.tx *= sx;
      }
      if (sy !== 1) {
        this.b *= sy;
        this.d *= sy;
        this.ty *= sy;
      }
    }

    public deltaTransformPoint(point: Point): Point {
      return new Point(this.a * point.x + this.c * point.y, this.b * point.x + this.d * point.y);
    }

    public transformPoint(point: Point): Point {
      return new Point(this.a * point.x + this.c * point.y + this.tx, this.b * point.x + this.d * point.y + this.ty);
    }

    public transformCoords(x: number, y: number): Point {
      x = +x;
      y = +y;
      return new Point(
        this.a * x + this.c * y + this.tx,
        this.b * x + this.d * y + this.ty
      );
    }

    public transformRect(rect: Rectangle): Rectangle {
      var r = rect.clone();
      var xMin = r.x;
      var xMax = r.x + r.width;
      var yMin = r.y;
      var yMax = r.y + r.height;

      var a = this.a;
      var b = this.b;
      var c = this.c;
      var d = this.d;
      var tx = this.tx;
      var ty = this.ty;

      var x0 = (a * xMin + c * yMin + tx) | 0;
      var y0 = (b * xMin + d * yMin + ty) | 0;
      var x1 = (a * xMax + c * yMin + tx) | 0;
      var y1 = (b * xMax + d * yMin + ty) | 0;
      var x2 = (a * xMax + c * yMax + tx) | 0;
      var y2 = (b * xMax + d * yMax + ty) | 0;
      var x3 = (a * xMin + c * yMax + tx) | 0;
      var y3 = (b * xMin + d * yMax + ty) | 0;
      var tmp = 0;

      // Manual Min/Max is a lot faster than calling Math.min/max
      // X Min-Max
      if (x0 > x1) {
        tmp = x0;
        x0 = x1;
        x1 = tmp;
      }
      if (x2 > x3) {
        tmp = x2;
        x2 = x3;
        x3 = tmp;
      }
      xMin = x0 < x2 ? x0 : x2;
      xMax = x1 > x3 ? x1 : x3;

      // Y Min-Max
      if (y0 > y1) {
        tmp = y0;
        y0 = y1;
        y1 = tmp;
      }
      if (y2 > y3) {
        tmp = y2;
        y2 = y3;
        y3 = tmp;
      }
      yMin = y0 < y2 ? y0 : y2;
      yMax = y1 > y3 ? y1 : y3;

      r.setTo(xMin, yMin, xMax - xMin, yMax - yMin);
      return r;
    }

    public getAngle(): number {
      return this.a ? Math.atan(this.b / this.a) :
                      (this.b > 0 ? Math.PI / 2 : -Math.PI / 2);
    }

    public copyFrom(sourceMatrix: Matrix): void {
      this.a = sourceMatrix.a;
      this.b = sourceMatrix.b;
      this.c = sourceMatrix.c;
      this.d = sourceMatrix.d;
      this.tx = sourceMatrix.tx;
      this.ty = sourceMatrix.ty;
    }

    public setTo(aa: number, ba: number, ca: number, da: number, txa: number, tya: number): void {
      this.a = +aa;
      this.b = +ba;
      this.c = +ca;
      this.d = +da;
      this.tx = +txa;
      this.ty = +tya;
    }

    public copyRowTo(row: number, vector3D: Vector3D): void {
      row = row >>> 0;
      if (row == 0) {
        vector3D.x = this.a;
        vector3D.y = this.c;
        vector3D.z = this.tx;
      } else if (row == 1) {
        vector3D.x = this.b;
        vector3D.y = this.d;
        vector3D.z = this.ty;
      } else if (row == 2) {
        vector3D.x = 0;
        vector3D.y = 0;
        vector3D.z = 1;
      }
    }

    public copyColumnTo(column: number, vector3D: Vector3D): void {
      column = column >>> 0;
      if (column == 0) {
        vector3D.x = this.a;
        vector3D.y = this.b;
        vector3D.z = 0;
      } else if (column == 1) {
        vector3D.x = this.c;
        vector3D.y = this.d;
        vector3D.z = 0;
      } else if (column == 2) {
        vector3D.x = this.tx;
        vector3D.y = this.ty;
        vector3D.z = 1;
      }
    }

    public copyRowFrom(row: number, vector3D: Vector3D): void {
      row = row >>> 0;
      if (row == 0) {
        this.a = vector3D.x;
        this.c = vector3D.y;
        this.tx = vector3D.z;
      } else if (row == 1) {
        this.b = vector3D.x;
        this.d = vector3D.y;
        this.ty = vector3D.z;
      }
    }

    public copyColumnFrom(column: number, vector3D: Vector3D): void {
      column = column >>> 0;
      if (column == 0) {
        this.a = vector3D.x;
        this.c = vector3D.y;
        this.tx = vector3D.z;
      } else if (column == 1) {
        this.b = vector3D.x;
        this.d = vector3D.y;
        this.ty = vector3D.z;
      }
    }

    public clone(): Matrix {
      return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
    }

    public toString(): String {
      return "(a=" + this.a + ", b=" + this.b + ", c=" + this.c + ", d=" + this.d + ", tx=" + this.tx + ", ty=" +this.ty + ")";
    }

  }
}
