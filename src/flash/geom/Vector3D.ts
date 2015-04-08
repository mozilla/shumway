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
// Class: Vector3D
module Shumway.AVMX.AS.flash.geom {
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class Vector3D extends ASObject {
    static classInitializer: any = null;
    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    public static X_AXIS: Vector3D = Object.freeze(new Vector3D(1, 0, 0));
    public static Y_AXIS: Vector3D = Object.freeze(new Vector3D(0, 1, 0));
    public static Z_AXIS: Vector3D = Object.freeze(new Vector3D(0, 0, 1));

    constructor (x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
      super();
      this.x = +x;
      this.y = +y;
      this.z = +z;
      this.w = +w;
    }

    x: number;
    y: number;
    z: number;
    w: number;

    public set native_x(x: number) {
      this.x = x;
    }

    public get native_x(): number {
      return this.x;
    }

    public set native_y(y: number) {
      this.y = y;
    }

    public get native_y(): number {
      return this.y;
    }

    public set native_z(z: number) {
      this.z = z;
    }

    public get native_z(): number {
      return this.z;
    }

    public set native_w(w: number) {
      this.w = w;
    }

    public get native_w(): number {
      return this.w;
    }

    get length(): number {
      return Math.sqrt(this.lengthSquared);
    }

    get lengthSquared(): number {
      return this.x * this.x +
             this.y * this.y +
             this.z * this.z;
    }

    static angleBetween(a: Vector3D, b: Vector3D): number {
      // http://chemistry.about.com/od/workedchemistryproblems/a/scalar-product-vectors-problem.htm
      return Math.acos(a.dotProduct(b) / (a.length * b.length));
    }

    static distance(pt1: Vector3D, pt2: Vector3D): number {
      // http://en.wikipedia.org/wiki/Euclidean_distance#Three_dimensions
      return pt1.subtract(pt2).length;
    }

    dotProduct(a: flash.geom.Vector3D): number {
      return this.x * a.x +
             this.y * a.y +
             this.z * a.z;
    }
    crossProduct(a: flash.geom.Vector3D): flash.geom.Vector3D {
      return new Vector3D(this.y * a.z - this.z * a.y,
                          this.z * a.x - this.x * a.z,
                          this.x * a.y - this.y * a.x,
                          1.0);
    }
    normalize(): number {
      var length = this.length;
      if (length !== 0) {
        this.x /= length;
        this.y /= length;
        this.z /= length;
      } else {
        this.x = this.y = this.z = 0;
      }
      return length;
    }
    scaleBy(s: number) {
      s = +s;
      this.x *= s;
      this.y *= s;
      this.z *= s;
    }
    incrementBy(a: flash.geom.Vector3D) {
      this.x += a.x;
      this.y += a.y;
      this.z += a.z;
    }
    decrementBy(a: flash.geom.Vector3D) {
      this.x -= a.x;
      this.y -= a.y;
      this.z -= a.z;
    }
    add(a: flash.geom.Vector3D): flash.geom.Vector3D {
      return new Vector3D(this.x + a.x, this.y + a.y, this.z + a.z);
    }
    subtract(a: flash.geom.Vector3D): flash.geom.Vector3D {
      return new Vector3D(this.x - a.x, this.y - a.y, this.z - a.z);
    }
    negate() {
      this.x = -this.x;
      this.y = -this.y;
      this.z = -this.z;
    }
    equals(toCompare: flash.geom.Vector3D, allFour?: boolean): boolean {
      return (this.x === toCompare.x)
          && (this.y === toCompare.y)
          && (this.z === toCompare.z)
          && (!allFour || (this.w === toCompare.w));
    }
    nearEquals(toCompare: flash.geom.Vector3D, tolerance: number, allFour?: boolean): boolean {
      return (Math.abs(this.x - toCompare.x) < tolerance)
          && (Math.abs(this.y - toCompare.y) < tolerance)
          && (Math.abs(this.z - toCompare.z) < tolerance)
          && (!allFour || (Math.abs(this.w - toCompare.w) < tolerance));
    }
    project() {
      this.x /= this.w;
      this.y /= this.w;
      this.z /= this.w;
    }
    copyFrom(sourceVector3D: flash.geom.Vector3D) {
      this.x = sourceVector3D.x;
      this.y = sourceVector3D.y;
      this.z = sourceVector3D.z;
    }
    setTo(xa: number, ya: number, za: number) {
      this.x = +xa;
      this.y = +ya;
      this.z = +za;
    }
    clone(): flash.geom.Vector3D {
      return new Vector3D(this.x, this.y, this.z, this.w);
    }
    toString(): string {
      return "Vector3D(" + this.x + ", " + this.y + ", " + this.z + ")";
    }
  }
}
