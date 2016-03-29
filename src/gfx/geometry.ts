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

module Shumway.GFX.Geometry {

  import clamp = Shumway.NumberUtilities.clamp;
  import pow2 = Shumway.NumberUtilities.pow2;
  import epsilonEquals = Shumway.NumberUtilities.epsilonEquals;
  import assert = Shumway.Debug.assert;

  export function radianToDegrees(r) {
    return r * 180 / Math.PI;
  }

  export function degreesToRadian(d) {
    return d * Math.PI / 180;
  }

  var E = 0.0001;

  function eqFloat(a, b) {
    return Math.abs(a - b) < E;
  }

  export class Point {
    x: number;
    y: number;

    constructor (x: number, y: number) {
      this.x = x;
      this.y = y;
    }

    setElements (x: number, y: number): Point {
      this.x = x;
      this.y = y;
      return this;
    }

    set (other: Point): Point {
      this.x = other.x;
      this.y = other.y;
      return this;
    }

    dot (other: Point): number {
      return this.x * other.x + this.y * other.y;
    }

    squaredLength (): number {
      return this.dot(this);
    }

    distanceTo (other: Point): number {
      return Math.sqrt(this.dot(other));
    }

    sub (other: Point): Point {
      this.x -= other.x;
      this.y -= other.y;
      return this;
    }

    mul (value: number): Point {
      this.x *= value;
      this.y *= value;
      return this;
    }

    clone (): Point {
      return new Point(this.x, this.y);
    }

    toString (digits: number = 2) {
      return "{x: " + this.x.toFixed(digits) + ", y: " + this.y.toFixed(digits) + "}";
    }

    inTriangle (a: Point, b: Point, c: Point) {
      var s = a.y * c.x - a.x * c.y + (c.y - a.y) * this.x + (a.x - c.x) * this.y;
      var t = a.x * b.y - a.y * b.x + (a.y - b.y) * this.x + (b.x - a.x) * this.y;
      if ((s < 0) != (t < 0)) {
        return false;
      }
      var T = -b.y * c.x + a.y * (c.x - b.x) + a.x * (b.y - c.y) + b.x * c.y;
      if (T < 0.0) {
        s = -s;
        t = -t;
        T = -T;
      }
      return s > 0 && t > 0 && (s + t) < T;
    }

    static createEmpty(): Point {
      return new Point(0, 0);
    }

    static createEmptyPoints(count: number): Point [] {
      var result = [];
      for (var i = 0; i < count; i++) {
        result.push(new Point(0, 0));
      }
      return result;
    }
  }

  export class Rectangle {
    static allocationCount = 0;

    x: number;
    y: number;
    w: number;
    h: number;

    private static _temporary = new Rectangle(0, 0, 0, 0);

    private static _dirtyStack: Rectangle [] = [];

    constructor (x: number, y: number, w: number, h: number) {
      this.setElements(x, y, w, h);
      Rectangle.allocationCount ++;
    }

    setElements (x: number, y: number, w: number, h: number) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
    }

    set (other: Rectangle) {
      this.x = other.x;
      this.y = other.y;
      this.w = other.w;
      this.h = other.h;
    }

    contains (other: Rectangle): boolean {
      var r1 = other.x + other.w;
      var b1 = other.y + other.h;
      var r2 = this.x + this.w;
      var b2 = this.y + this.h;
      return (other.x >= this.x) &&
        (other.x < r2) &&
        (other.y >= this.y) &&
        (other.y < b2) &&
        (r1 > this.x) &&
        (r1 <= r2) &&
        (b1 > this.y) &&
        (b1 <= b2);
    }

    containsPoint (point: Point): boolean {
      return (point.x >= this.x) &&
        (point.x < this.x + this.w) &&
        (point.y >= this.y) &&
        (point.y < this.y + this.h);
    }

    isContained (others: Rectangle []) {
      for (var i = 0; i < others.length; i++) {
        if (others[i].contains(this)) {
          return true;
        }
      }
      return false;
    }

    isSmallerThan (other: Rectangle): boolean {
      return this.w < other.w && this.h < other.h;
    }

    isLargerThan (other: Rectangle): boolean {
      return this.w > other.w && this.h > other.h;
    }

    union (other: Rectangle) {
      if (this.isEmpty()) {
        this.set(other);
        return;
      } else if (other.isEmpty()) {
        return;
      }
      var x = this.x, y = this.y;
      if (this.x > other.x) {
        x = other.x;
      }
      if (this.y > other.y) {
        y = other.y;
      }
      var x0 = this.x + this.w;
      if (x0 < other.x + other.w) {
        x0 = other.x + other.w;
      }
      var y0 = this.y + this.h;
      if (y0 < other.y + other.h) {
        y0 = other.y + other.h;
      }
      this.x = x;
      this.y = y;
      this.w = x0 - x;
      this.h = y0 - y;
    }

    isEmpty (): boolean {
      return this.w <= 0 || this.h <= 0;
    }

    setEmpty () {
      this.x = 0;
      this.y = 0;
      this.w = 0;
      this.h = 0;
    }

    intersect (other: Rectangle) {
      var result = Rectangle.createEmpty();
      if (this.isEmpty() || other.isEmpty()) {
        result.setEmpty();
        return result;
      }
      result.x = Math.max(this.x, other.x);
      result.y = Math.max(this.y, other.y);
      result.w = Math.min(this.x + this.w, other.x + other.w) - result.x;
      result.h = Math.min(this.y + this.h, other.y + other.h) - result.y;
      if (result.isEmpty()) {
        result.setEmpty();
      }
      this.set(result);
    }

    intersects (other: Rectangle): boolean {
      if (this.isEmpty() || other.isEmpty()) {
        return false;
      }
      var x = Math.max(this.x, other.x);
      var y = Math.max(this.y, other.y);
      var w = Math.min(this.x + this.w, other.x + other.w) - x;
      var h = Math.min(this.y + this.h, other.y + other.h) - y;
      return !(w <= 0 || h <= 0);
    }

    /**
     * Tests if this rectangle intersects the AABB of the given rectangle.
     */
    intersectsTransformedAABB (other: Rectangle, matrix: Matrix): boolean {
      var rectangle = Rectangle._temporary;
      rectangle.set(other);
      matrix.transformRectangleAABB(rectangle);
      return this.intersects(rectangle);
    }

    intersectsTranslated (other: Rectangle, tx: number, ty: number): boolean {
      if (this.isEmpty() || other.isEmpty()) {
        return false;
      }
      var x = Math.max(this.x, other.x + tx);
      var y = Math.max(this.y, other.y + ty);
      var w = Math.min(this.x + this.w, other.x + tx + other.w) - x;
      var h = Math.min(this.y + this.h, other.y + ty + other.h) - y;
      return !(w <= 0 || h <= 0);
    }

    area (): number {
      return this.w * this.h;
    }

    clone (): Rectangle {
      var rectangle: Rectangle = Rectangle.allocate();
      rectangle.set(this);
      return rectangle;
    }

    static allocate(): Rectangle {
      var dirtyStack = Rectangle._dirtyStack;
      if (dirtyStack.length) {
        return dirtyStack.pop();
      } else {
        return new Rectangle(12345, 67890, 12345, 67890);
      }
    }

    free() {
      Rectangle._dirtyStack.push(this);
    }

    /**
     * Snaps the rectangle to pixel boundaries. The computed rectangle covers
     * the original rectangle.
     */
    snap (): Rectangle  {
      var x1 = Math.ceil(this.x + this.w);
      var y1 = Math.ceil(this.y + this.h);
      this.x = Math.floor(this.x);
      this.y = Math.floor(this.y);
      this.w = x1 - this.x;
      this.h = y1 - this.y;
      return this;
    }

    scale (x: number, y: number): Rectangle  {
      this.x *= x;
      this.y *= y;
      this.w *= x;
      this.h *= y;
      return this;
    }

    offset (x: number, y: number): Rectangle  {
      this.x += x;
      this.y += y;
      return this;
    }

    resize (w: number, h: number): Rectangle  {
      this.w += w;
      this.h += h;
      return this;
    }

    expand (w: number, h: number): Rectangle  {
      this.offset(-w, -h).resize(2 * w, 2 * h);
      return this;
    }

    getCenter(): Point {
      return new Point(this.x + this.w / 2, this.y + this.h / 2);
    }

    getAbsoluteBounds(): Rectangle {
      return new Rectangle(0, 0, this.w, this.h);
    }

    toString(digits: number = 2): string {
      return "{" +
        this.x.toFixed(digits) + ", " +
        this.y.toFixed(digits) + ", " +
        this.w.toFixed(digits) + ", " +
        this.h.toFixed(digits) +
      "}";
    }

    static createEmpty(): Rectangle {
      var rectangle = Rectangle.allocate();
      rectangle.setEmpty();
      return rectangle;
    }

    static createSquare(size: number): Rectangle {
      return new Rectangle(-size / 2, -size / 2, size, size);
    }

    /**
     * Creates the maximum rectangle representable by signed 16 bit integers.
     */
    static createMaxI16() {
      return new Rectangle(Numbers.MinI16, Numbers.MinI16, Numbers.MaxU16, Numbers.MaxU16);
    }

    setMaxI16() {
      this.setElements(Numbers.MinI16, Numbers.MinI16, Numbers.MaxU16, Numbers.MaxU16)
    }

    getCorners (points: Point[]) {
      points[0].x = this.x;
      points[0].y = this.y;

      points[1].x = this.x + this.w;
      points[1].y = this.y;

      points[2].x = this.x + this.w;
      points[2].y = this.y + this.h;

      points[3].x = this.x;
      points[3].y = this.y + this.h;
    }
  }

  export class OBB {
    axes: Point [];
    corners: Point [];
    origins: number [];
    constructor(corners: Point []) {
      this.corners = corners.map(function (corner) {
        return corner.clone();
      });
      this.axes = [
        corners[1].clone().sub(corners[0]),
        corners[3].clone().sub(corners[0])
      ];
      this.origins = [];
      for (var i = 0; i < 2; i++) {
        this.axes[i].mul(1 / this.axes[i].squaredLength());
        this.origins.push(corners[0].dot(this.axes[i]));
      }
    }
    getBounds(): Rectangle {
      return OBB.getBounds(this.corners);
    }
    public static getBounds(points) {
      var min = new Point(Number.MAX_VALUE, Number.MAX_VALUE);
      var max = new Point(Number.MIN_VALUE, Number.MIN_VALUE);
      for (var i = 0; i < 4; i++) {
        var x = points[i].x, y = points[i].y;
        min.x = Math.min(min.x, x);
        min.y = Math.min(min.y, y);
        max.x = Math.max(max.x, x);
        max.y = Math.max(max.y, y);
      }
      return new Rectangle(min.x, min.y, max.x - min.x, max.y - min.y);
    }
    /**
     * http://www.flipcode.com/archives/2D_OBB_Intersection.shtml
     */
    public intersects(other: OBB): boolean {
      return this.intersectsOneWay(other) && other.intersectsOneWay(this);
    }
    private intersectsOneWay(other: OBB): boolean {
      for (var i = 0; i < 2; i++) {
        for (var j = 0; j < 4; j++) {
          var t = other.corners[j].dot(this.axes[i]);
          var tMin, tMax;
          if (j === 0) {
            tMax = tMin = t;
          } else {
            if (t < tMin) {
              tMin = t;
            } else if (t > tMax) {
              tMax = t;
            }
          }
        }
        if ((tMin > 1 + this.origins[i]) || (tMax < this.origins[i])) {
          return false;
        }
      }
      return true;
    }
  }

  /**
   * Used to write fast paths for common matrix types.
   */
  export const enum MatrixType {
    Unknown           = 0x0000,
    Identity          = 0x0001,
    Translation       = 0x0002
  }

  export class Matrix {
    static allocationCount = 0;

    private _data: Float64Array;
    private _type: MatrixType;

    private static _dirtyStack: Matrix [] = [];

    public set a(a: number) {
      this._data[0] = a;
      this._type = MatrixType.Unknown;
    }

    public get a(): number {
      return this._data[0];
    }

    public set b(b: number) {
      this._data[1] = b;
      this._type = MatrixType.Unknown;
    }

    public get b(): number {
      return this._data[1];
    }

    public set c(c: number) {
      this._data[2] = c;
      this._type = MatrixType.Unknown;
    }

    public get c(): number {
      return this._data[2];
    }

    public set d(d: number) {
      this._data[3] = d;
      this._type = MatrixType.Unknown;
    }

    public get d(): number {
      return this._data[3];
    }

    public set tx(tx: number) {
      this._data[4] = tx;
      if (this._type === MatrixType.Identity) {
        this._type = MatrixType.Translation;
      }
    }

    public get tx(): number {
      return this._data[4];
    }

    public set ty(ty: number) {
      this._data[5] = ty;
      if (this._type === MatrixType.Identity) {
        this._type = MatrixType.Translation;
      }
    }

    public get ty(): number {
      return this._data[5];
    }

    private static _svg: SVGSVGElement;


    constructor (a: number, b: number, c: number, d: number, tx: number, ty: number) {
      this._data = new Float64Array(6);
      this._type = MatrixType.Unknown;
      this.setElements(a, b, c, d, tx, ty);
      Matrix.allocationCount ++;
    }

    private static _createSVGMatrix(): SVGMatrix  {
      if (!Matrix._svg) {
        Matrix._svg = <any>document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      }
      return Matrix._svg.createSVGMatrix();
    }

    setElements (a: number, b: number, c: number, d: number, tx: number, ty: number) {
      var m = this._data;
      m[0] = a;
      m[1] = b;
      m[2] = c;
      m[3] = d;
      m[4] = tx;
      m[5] = ty;
      this._type = MatrixType.Unknown;
    }

    set (other: Matrix) {
      var m = this._data, n = other._data;
      m[0] = n[0];
      m[1] = n[1];
      m[2] = n[2];
      m[3] = n[3];
      m[4] = n[4];
      m[5] = n[5];
      this._type = other._type;
    }

    /**
     * Whether the transformed query rectangle is empty after this transform is applied to it.
     */
    emptyArea(query: Rectangle): boolean {
      var m = this._data;
      // TODO: Work out the details here.
      if (m[0] === 0 || m[3] === 0) {
        return true;
      }
      return false;
    }

    /**
     * Whether the area of transformed query rectangle is infinite after this transform is applied to it.
     */
    infiniteArea(query: Rectangle): boolean {
      var m = this._data;
      // TODO: Work out the details here.
      if (Math.abs(m[0]) === Infinity ||
          Math.abs(m[3]) === Infinity) {
        return true;
      }
      return false;
    }

    isEqual (other: Matrix) {
      if (this._type === MatrixType.Identity && other._type === MatrixType.Identity) {
        return true;
      }
      var m = this._data, n = other._data;
      return m[0] === n[0] &&
             m[1] === n[1] &&
             m[2] === n[2] &&
             m[3] === n[3] &&
             m[4] === n[4] &&
             m[5] === n[5];
    }

    clone (): Matrix {
      var matrix = Matrix.allocate();
      matrix.set(this);
      return matrix;
    }

    static allocate(): Matrix {
      var dirtyStack = Matrix._dirtyStack;
      var matrix = null;
      if (dirtyStack.length) {
        return dirtyStack.pop();
      } else {
        return new Matrix(12345, 12345, 12345, 12345, 12345, 12345);
      }
    }

    free() {
      Matrix._dirtyStack.push(this);
    }

    transform (a: number, b: number, c: number, d: number, tx: number, ty: number): Matrix  {
      var m = this._data;
      var _a = m[0], _b = m[1], _c = m[2], _d = m[3], _tx = m[4], _ty = m[5];
      m[0] = _a * a + _c * b;
      m[1] = _b * a + _d * b;
      m[2] = _a * c + _c * d;
      m[3] = _b * c + _d * d;
      m[4] = _a * tx + _c * ty + _tx;
      m[5] = _b * tx + _d * ty + _ty;
      this._type = MatrixType.Unknown;
      return this;
    }

    transformRectangle (rectangle: Rectangle, points: Point[]) {
      release || assert(points.length === 4);
      var m = this._data, a = m[0], b = m[1], c = m[2], d = m[3], tx = m[4], ty = m[5];

      var x = rectangle.x;
      var y = rectangle.y;
      var w = rectangle.w;
      var h = rectangle.h;

      /*

       0---1
       | / |
       3---2

       */

      points[0].x = a * x + c * y + tx;
      points[0].y = b * x + d * y + ty;
      points[1].x = a * (x + w) + c * y + tx;
      points[1].y = b * (x + w) + d * y + ty;
      points[2].x = a * (x + w) + c * (y + h) + tx;
      points[2].y = b * (x + w) + d * (y + h) + ty;
      points[3].x = a * x + c * (y + h) + tx;
      points[3].y = b * x + d * (y + h) + ty;
    }

    isTranslationOnly(): boolean {
      if (this._type === MatrixType.Translation) {
        return true;
      }
      var m = this._data;
      if (m[0] === 1 &&
          m[1] === 0 &&
          m[2] === 0 &&
          m[3] === 1) {
        this._type = MatrixType.Translation;
        return true;
      } else if (epsilonEquals(m[0], 1) &&
        epsilonEquals(m[1], 0) &&
        epsilonEquals(m[2], 0) &&
        epsilonEquals(m[3], 1)) {
        this._type = MatrixType.Translation;
        return true;
      }
      return false;
    }

    transformRectangleAABB (rectangle: Rectangle) {
      var m = this._data;
      if (this._type === MatrixType.Identity) {
        return;
      } else if (this._type === MatrixType.Translation) {
        rectangle.x += m[4];
        rectangle.y += m[5];
        return;
      }

      var a = m[0], b = m[1], c = m[2], d = m[3], tx = m[4], ty = m[5];
      var x = rectangle.x;
      var y = rectangle.y;
      var w = rectangle.w;
      var h = rectangle.h;

      /*

       0---1
       | / |
       3---2

       */

      var x0 = a * x + c * y + tx;
      var y0 = b * x + d * y + ty;

      var x1 = a * (x + w) + c * y + tx;
      var y1 = b * (x + w) + d * y + ty;

      var x2 = a * (x + w) + c * (y + h) + tx;
      var y2 = b * (x + w) + d * (y + h) + ty;

      var x3 = a * x + c * (y + h) + tx;
      var y3 = b * x + d * (y + h) + ty;

      var tmp = 0;

      // Manual Min/Max is a lot faster than calling Math.min/max
      // X Min-Max
      if (x0 > x1) { tmp = x0; x0 = x1; x1 = tmp; }
      if (x2 > x3) { tmp = x2; x2 = x3; x3 = tmp; }

      rectangle.x = x0 < x2 ? x0 : x2;
      rectangle.w = (x1 > x3 ? x1 : x3) - rectangle.x;

      // Y Min-Max
      if (y0 > y1) { tmp = y0; y0 = y1; y1 = tmp; }
      if (y2 > y3) { tmp = y2; y2 = y3; y3 = tmp; }

      rectangle.y = y0 < y2 ? y0 : y2;
      rectangle.h = (y1 > y3 ? y1 : y3) - rectangle.y;
    }

    scale (x: number, y: number): Matrix  {
      var m = this._data;
      m[0] *= x;
      m[1] *= y;
      m[2] *= x;
      m[3] *= y;
      m[4] *= x;
      m[5] *= y;
      this._type = MatrixType.Unknown;
      return this;
    }

    scaleClone (x: number, y: number): Matrix {
      if (x === 1 && y === 1) {
        return this;
      }
      return this.clone().scale(x, y);
    }

    rotate (angle: number): Matrix {
      var m = this._data, a = m[0], b = m[1], c = m[2], d = m[3], tx = m[4], ty = m[5];
      var cos = Math.cos(angle);
      var sin = Math.sin(angle);
      m[0] = cos * a  - sin * b;
      m[1] = sin * a  + cos * b;
      m[2] = cos * c  - sin * d;
      m[3] = sin * c  + cos * d;
      m[4] = cos * tx - sin * ty;
      m[5] = sin * tx + cos * ty;
      this._type = MatrixType.Unknown;
      return this;
    }

    concat (other: Matrix): Matrix {
      if (other._type === MatrixType.Identity) {
        return this;
      }

      var m = this._data, n = other._data;
      var a  = m[0] * n[0];
      var b  = 0.0;
      var c  = 0.0;
      var d  = m[3] * n[3];
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

      this._type = MatrixType.Unknown;
      return this;
    }

    concatClone (other: Matrix): Matrix {
      return this.clone().concat(other);
    }

    /**
     * this = other * this
     */
    public preMultiply(other: Matrix): void {
      var m = this._data, n = other._data;
      if (other._type === MatrixType.Translation &&
          (this._type & (MatrixType.Identity | MatrixType.Translation))) {
        m[4] += n[4];
        m[5] += n[5];
        this._type = MatrixType.Translation;
        return;
      } else if (other._type === MatrixType.Identity) {
        return;
      }
      var a  = n[0] * m[0];
      var b  = 0.0;
      var c  = 0.0;
      var d  = n[3] * m[3];
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

      m[0] = a;
      m[1] = b;
      m[2] = c;
      m[3] = d;
      m[4] = tx;
      m[5] = ty;
      this._type = MatrixType.Unknown;
    }

    translate (x: number, y: number): Matrix {
      var m = this._data;
      m[4] += x;
      m[5] += y;
      if (this._type === MatrixType.Identity) {
        this._type = MatrixType.Translation;
      }
      return this;
    }

    setIdentity () {
      var m = this._data;
      m[0] = 1;
      m[1] = 0;
      m[2] = 0;
      m[3] = 1;
      m[4] = 0;
      m[5] = 0;
      this._type = MatrixType.Identity;
    }

    isIdentity (): boolean {
      if (this._type === MatrixType.Identity) {
        return true;
      }
      var m = this._data;
      return m[0] === 1 && m[1] === 0 && m[2] === 0 &&
             m[3] === 1 && m[4] === 0 && m[5] === 0;
    }

    transformPoint (point: Point) {
      if (this._type === MatrixType.Identity) {
        return;
      }
      var m = this._data;
      var x = point.x;
      var y = point.y;
      point.x = m[0] * x + m[2] * y + m[4];
      point.y = m[1] * x + m[3] * y + m[5];
    }

    transformPoints (points: Point[]) {
      if (this._type === MatrixType.Identity) {
        return;
      }
      for (var i = 0; i < points.length; i++) {
        this.transformPoint(points[i]);
      }
    }

    deltaTransformPoint (point: Point) {
      if (this._type === MatrixType.Identity) {
        return;
      }
      var m = this._data;
      var x = point.x;
      var y = point.y;
      point.x = m[0] * x + m[2] * y;
      point.y = m[1] * x + m[3] * y;
    }

    inverse (result: Matrix) {
      var m = this._data, r = result._data;
      if (this._type === MatrixType.Identity) {
        result.setIdentity();
        return;
      } else if (this._type === MatrixType.Translation) {
        r[0] = 1;
        r[1] = 0;
        r[2] = 0;
        r[3] = 1;
        r[4] = -m[4];
        r[5] = -m[5];
        result._type = MatrixType.Translation;
        return;
      }
      var b  = m[1];
      var c  = m[2];
      var tx = m[4];
      var ty = m[5];
      if (b === 0 && c === 0) {
        var a = r[0] = 1 / m[0];
        var d = r[3] = 1 / m[3];
        r[1] = 0;
        r[2] = 0;
        r[4] = -a * tx;
        r[5] = -d * ty;
      } else {
        var a = m[0];
        var d = m[3];
        var determinant = a * d - b * c;
        if (determinant === 0) {
          result.setIdentity();
          return;
        }
        determinant  = 1 / determinant;
        r[0] = d * determinant;
        b = r[1] = -b * determinant;
        c = r[2] = -c * determinant;
        d = r[3] =  a * determinant;
        r[4] = -(r[0] * tx + c * ty);
        r[5] = -(b * tx + d * ty);
      }
      result._type = MatrixType.Unknown;
      return;
    }

    getTranslateX(): number {
      return this._data[4];
    }

    getTranslateY(): number {
      return this._data[4];
    }

    getScaleX(): number {
      var m = this._data;
      if (m[0] === 1 && m[1] === 0) {
        return 1;
      }
      var result = Math.sqrt(m[0] * m[0] + m[1] * m[1]);
      return m[0] > 0 ? result : -result;
    }

    getScaleY(): number {
      var m = this._data;
      if (m[2] === 0 && m[3] === 1) {
        return 1;
      }
      var result = Math.sqrt(m[2] * m[2] + m[3] * m[3]);
      return m[3] > 0 ? result : -result;
    }

    getScale(): number {
      return (this.getScaleX() + this.getScaleY()) / 2;
    }

    getAbsoluteScaleX(): number {
      return Math.abs(this.getScaleX());
    }

    getAbsoluteScaleY(): number {
      return Math.abs(this.getScaleY());
    }

    getRotation(): number {
      var m = this._data;
      return Math.atan(m[1] / m[0]) * 180 / Math.PI;
    }

    isScaleOrRotation(): boolean {
      var m = this._data;
      return Math.abs(m[0] * m[2] + m[1] * m[3]) < 0.01;
    }

    toString (digits: number = 2): string {
      var m = this._data;
      return "{" +
        m[0].toFixed(digits) + ", " +
        m[1].toFixed(digits) + ", " +
        m[2].toFixed(digits) + ", " +
        m[3].toFixed(digits) + ", " +
        m[4].toFixed(digits) + ", " +
        m[5].toFixed(digits) + "}";
    }

    public toWebGLMatrix(): Float32Array {
      var m = this._data;
      return new Float32Array([
        m[0], m[1], 0, m[2], m[3], 0, m[4], m[5], 1
      ]);
    }

    public toCSSTransform(): string {
      var m = this._data;
      return "matrix(" +
        m[0] + ", " +
        m[1] + ", " +
        m[2] + ", " +
        m[3] + ", " +
        m[4] + ", " +
        m[5] + ")";
    }

    public static createIdentity(): Matrix {
      var matrix = Matrix.allocate();
      matrix.setIdentity();
      return matrix;
    }

    static multiply = function (dst: Matrix, src: Matrix) {
      var n = src._data;
      dst.transform(n[0], n[1], n[2], n[3], n[4], n[5]);
    };

    public toSVGMatrix(): SVGMatrix {
      var m = this._data;
      var matrix: SVGMatrix = Matrix._createSVGMatrix();
      try {
        matrix.a = m[0];
        matrix.b = m[1];
        matrix.c = m[2];
        matrix.d = m[3];
        matrix.e = m[4];
        matrix.f = m[5];
      } catch (e) {
        // The setters on SVGMatrix throw if the assigned value is `NaN`, which we sometimes
        // produce. In that case, just fall back to an identity matrix for now.
        return Matrix._createSVGMatrix();
      }
      return matrix;
    }

    public snap (): boolean {
      var m = this._data;
      if (this.isTranslationOnly()) {
        m[0] = 1;
        m[1] = 0;
        m[2] = 0;
        m[3] = 1;
        m[4] = Math.round(m[4]);
        m[5] = Math.round(m[5]);
        this._type = MatrixType.Translation;
        return true;
      }
      return false;
    }

    public static createIdentitySVGMatrix(): SVGMatrix {
      return Matrix._createSVGMatrix();
    }

    public static createSVGMatrixFromArray(array: number []): SVGMatrix {
      var matrix: SVGMatrix = Matrix._createSVGMatrix();
      matrix.a = array[0];
      matrix.b = array[1];
      matrix.c = array[2];
      matrix.d = array[3];
      matrix.e = array[4];
      matrix.f = array[5];
      return matrix;
    }
  }

  export class DirtyRegion {
    private static tmpRectangle = Rectangle.createEmpty();
    private grid: DirtyRegion.Cell [][];

    private w: number;
    private h: number;
    private c: number;
    private r: number;
    private size: number;
    private sizeInBits: number;

    constructor (w, h, sizeInBits = 7) {
      var size = this.size = 1 << sizeInBits;
      this.sizeInBits = sizeInBits;
      this.w = w;
      this.h = h;
      this.c = Math.ceil(w / size);
      this.r = Math.ceil(h / size);
      this.grid = [];
      for (var y = 0; y < this.r; y++) {
        this.grid.push([]);
        for (var x = 0; x < this.c; x++) {
          this.grid[y][x] = new DirtyRegion.Cell(new Rectangle(x * size, y * size, size, size));
        }
      }
    }

    clear () {
      for (var y = 0; y < this.r; y++) {
        for (var x = 0; x < this.c; x++) {
          this.grid[y][x].clear();
        }
      }
    }

    getBounds (): Rectangle {
      return new Rectangle(0, 0, this.w, this.h);
    }

    addDirtyRectangle (rectangle: Rectangle) {
      var x = rectangle.x >> this.sizeInBits;
      var y = rectangle.y >> this.sizeInBits;
      if (x >= this.c || y >= this.r) {
        return;
      }
      if (x < 0) {
        x = 0;
      }
      if (y < 0) {
        y = 0;
      }
      var cell = this.grid[y][x];
      rectangle = rectangle.clone();
      rectangle.snap();

      if (cell.region.contains(rectangle)) {
        if (cell.bounds.isEmpty()) {
          cell.bounds.set(rectangle)
        } else if (!cell.bounds.contains(rectangle)) {
          cell.bounds.union(rectangle);
        }
      } else {
        var w = Math.min(this.c, Math.ceil((rectangle.x + rectangle.w) / this.size)) - x;
        var h = Math.min(this.r, Math.ceil((rectangle.y + rectangle.h) / this.size)) - y;
        for (var i = 0; i < w; i++) {
          for (var j = 0; j < h; j++) {
            var cell = this.grid[y + j][x + i];
            var intersection = cell.region.clone();
            intersection.intersect(rectangle);
            if (!intersection.isEmpty()) {
              this.addDirtyRectangle(intersection);
            }
          }
        }
      }
    }

    gatherRegions (regions: Rectangle[]) {
      for (var y = 0; y < this.r; y++) {
        for (var x = 0; x < this.c; x++) {
          var bounds = this.grid[y][x].bounds;
          if (!bounds.isEmpty()) {
            regions.push(this.grid[y][x].bounds);
          }
        }
      }
    }

    gatherOptimizedRegions (regions: Rectangle[]) {
      this.gatherRegions(regions);
    }

    getDirtyRatio (): number {
      var totalArea = this.w * this.h;
      if (totalArea === 0) {
        return 0;
      }
      var dirtyArea = 0;
      for (var y = 0; y < this.r; y++) {
        for (var x = 0; x < this.c; x++) {
          dirtyArea += this.grid[y][x].region.area();
        }
      }
      return dirtyArea / totalArea;
    }

    render (context: CanvasRenderingContext2D, options?: any) {
      function drawRectangle(rectangle: Rectangle) {
        context.rect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
      }

      if (options && options.drawGrid) {
        context.strokeStyle = "white";
        for (var y = 0; y < this.r; y++) {
          for (var x = 0; x < this.c; x++) {
            var cell = this.grid[y][x];
            context.beginPath();
            drawRectangle(cell.region);
            context.closePath();
            context.stroke();
          }
        }
      }

      context.strokeStyle = "#E0F8D8";
      for (var y = 0; y < this.r; y++) {
        for (var x = 0; x < this.c; x++) {
          var cell = this.grid[y][x];
          context.beginPath();
          drawRectangle(cell.bounds);
          context.closePath();
          context.stroke();
        }
      }

//      context.strokeStyle = "#5856d6";
//      var regions = [];
//      this.gatherOptimizedRegions(regions);
//      for (var i = 0; i < regions.length; i++) {
//        context.beginPath();
//        drawRectangle(regions[i]);
//        context.closePath();
//        context.stroke();
//      }
    }
  }

  export module DirtyRegion {
    export class Cell {
      region: Rectangle;
      bounds: Rectangle;
      constructor(region: Rectangle) {
        this.region = region;
        this.bounds = Rectangle.createEmpty();
      }
      clear () {
        this.bounds.setEmpty();
      }
    }
  }

  export class Tile {
    x: number;
    y: number;
    index: number;
    scale: number;
    bounds: Rectangle;
    cachedSurfaceRegion: ISurfaceRegion;
    color: Shumway.Color;
    private _obb: OBB;
    private static corners = Point.createEmptyPoints(4);
    getOBB(): OBB {
      if (this._obb) {
        return this._obb;
      }
      this.bounds.getCorners(Tile.corners);
      return this._obb = new OBB(Tile.corners);
    }
    constructor(index: number, x: number, y: number, w: number, h: number, scale: number) {
      this.index = index;
      this.x = x;
      this.y = y;
      this.scale = scale;
      this.bounds = new Rectangle(x * w, y * h, w, h);
    }
  }

  /**
   * A grid data structure that lets you query tiles that intersect a transformed rectangle.
   */
  export class TileCache {
    w: number;
    h: number;
    tileW: number;
    tileH: number;
    rows: number;
    scale: number;
    columns: number;
    tiles: Tile [];
    private static _points = Point.createEmptyPoints(4);
    constructor(w: number, h: number, tileW: number, tileH: number, scale: number) {
      this.tileW = tileW;
      this.tileH = tileH;
      this.scale = scale;
      this.w = w;
      this.h = h;
      this.rows = Math.ceil(h / tileH);
      this.columns = Math.ceil(w / tileW);
      release || assert (this.rows < 2048 && this.columns < 2048);
      this.tiles = [];
      var index = 0;
      for (var y = 0; y < this.rows; y++) {
        for (var x = 0; x < this.columns; x++) {
          this.tiles.push(new Tile(index++, x, y, tileW, tileH, scale));
        }
      }
    }

    /**
     * Query tiles using a transformed rectangle.
     * TODO: Fine-tune these heuristics.
     */
    getTiles(query: Rectangle, transform: Matrix): Tile [] {
      if (transform.emptyArea(query)) {
        return [];
      } else if (transform.infiniteArea(query)) {
        return this.tiles;
      }
      var tileCount = this.columns * this.rows;
      // The |getFewTiles| algorithm works better for a few tiles but it can't handle skew transforms.
      if (tileCount < 40 && transform.isScaleOrRotation()) {
        var precise = tileCount > 10;
        return this.getFewTiles(query, transform, precise);
      } else {
        return this.getManyTiles(query, transform);
      }
    }

    /**
     * Precise indicates that we want to do an exact OBB intersection.
     */
    private getFewTiles(query: Rectangle, transform: Matrix, precise: boolean = true): Tile [] {
      if (transform.isTranslationOnly() && this.tiles.length === 1) {
        if (this.tiles[0].bounds.intersectsTranslated(query, transform.tx, transform.ty)) {
          return [this.tiles[0]];
        }
        return [];
      }
      transform.transformRectangle(query, TileCache._points);
      var queryOBB;
      var queryBounds = new Rectangle(0, 0, this.w, this.h);
      if (precise) {
        queryOBB = new OBB(TileCache._points);
      }
      queryBounds.intersect(OBB.getBounds(TileCache._points));

      if (queryBounds.isEmpty()) {
        return [];
      }

      var minX = queryBounds.x / this.tileW | 0;
      var minY = queryBounds.y / this.tileH | 0;
      var maxX = Math.ceil((queryBounds.x + queryBounds.w) / this.tileW) | 0;
      var maxY = Math.ceil((queryBounds.y + queryBounds.h) / this.tileH) | 0;

      minX = clamp(minX, 0, this.columns);
      maxX = clamp(maxX, 0, this.columns);
      minY = clamp(minY, 0, this.rows);
      maxY = clamp(maxY, 0, this.rows);

      var tiles = [];
      for (var x = minX; x < maxX; x++) {
        for (var y = minY; y < maxY; y++) {
          var tile = this.tiles[y * this.columns + x];
          if (tile.bounds.intersects(queryBounds) && (precise ? tile.getOBB().intersects(queryOBB) : true)) {
            tiles.push(tile);
          }
        }
      }
      return tiles;
    }

    private getManyTiles(query: Rectangle, transform: Matrix): Tile [] {
      function intersectX(x: number, p1: Point, p2: Point): number {
        // (x - x1) * (y2 - y1) = (y - y1) * (x2 - x1)
        return (x - p1.x) * (p2.y - p1.y) / (p2.x - p1.x) + p1.y;
      }
      function appendTiles(tiles: Tile[], cache: TileCache,
                           column: number, startRow: number, endRow: number) {
        if (column < 0 || column >= cache.columns) {
          return;
        }
        var j1 = clamp(startRow, 0, cache.rows);
        var j2 = clamp(endRow + 1, 0, cache.rows);
        for (var j = j1; j < j2; j++) {
          tiles.push(cache.tiles[j * cache.columns + column]);
        }
      }

      var rectPoints: Point[] = TileCache._points;
      transform.transformRectangle(query, rectPoints);

      // finding minimal-x point, placing at first (and last)
      var i1 = rectPoints[0].x < rectPoints[1].x ? 0 : 1;
      var i2 = rectPoints[2].x < rectPoints[3].x ? 2 : 3;
      var i0 = rectPoints[i1].x < rectPoints[i2].x ? i1 : i2;
      var lines: Point[] = [];
      for (var j = 0; j < 5; j++, i0++) {
        lines.push(rectPoints[i0 % 4]);
      }
      // and keeping points ordered counterclockwise
      if ((lines[1].x - lines[0].x) * (lines[3].y - lines[0].y) <
          (lines[1].y - lines[0].y) * (lines[3].x - lines[0].x)) {
        var tmp: Point = lines[1]; lines[1] = lines[3]; lines[3] = tmp;
      }

      var tiles = [];

      var lastY1, lastY2;
      var i = Math.floor(lines[0].x / this.tileW);
      var nextX = (i + 1) * this.tileW;
      if (lines[2].x < nextX) {
        // edge case: all fits into one column
        lastY1 = Math.min(lines[0].y, lines[1].y, lines[2].y, lines[3].y);
        lastY2 = Math.max(lines[0].y, lines[1].y, lines[2].y, lines[3].y);
        var j1 = Math.floor(lastY1 / this.tileH);
        var j2 = Math.floor(lastY2 / this.tileH);
        appendTiles(tiles, this, i, j1, j2);
        return tiles;
      }

      var line1 = 0, line2 = 4;
      var lastSegment1 = false, lastSegment2 = false;
      if (lines[0].x === lines[1].x || lines[0].x === lines[3].x) {
        // edge case: first rectangle side parallel to columns
        if (lines[0].x === lines[1].x) {
          lastSegment1 = true;
          line1++;
        } else {
          lastSegment2 = true;
          line2--;
        }

        lastY1 = intersectX(nextX, lines[line1], lines[line1 + 1]);
        lastY2 = intersectX(nextX, lines[line2], lines[line2 - 1]);

        var j1 = Math.floor(lines[line1].y / this.tileH);
        var j2 = Math.floor(lines[line2].y / this.tileH);
        appendTiles(tiles, this, i, j1, j2);
        i++;
      }

      do {
        var nextY1, nextY2;
        var nextSegment1, nextSegment2;
        if (lines[line1 + 1].x < nextX) {
          nextY1 = lines[line1 + 1].y;
          nextSegment1 = true;
        } else {
          nextY1 = intersectX(nextX, lines[line1], lines[line1 + 1]);
          nextSegment1 = false;
        }
        if (lines[line2 - 1].x < nextX) {
          nextY2 = lines[line2 - 1].y;
          nextSegment2 = true;
        } else {
          nextY2 = intersectX(nextX, lines[line2], lines[line2 - 1]);
          nextSegment2 = false;
        }

        var j1 = Math.floor((lines[line1].y < lines[line1 + 1].y ? lastY1 : nextY1) / this.tileH);
        var j2 = Math.floor((lines[line2].y > lines[line2 - 1].y ? lastY2 : nextY2) / this.tileH);
        appendTiles(tiles, this, i, j1, j2);

        if (nextSegment1 && lastSegment1) {
          break;
        }

        if (nextSegment1) {
          lastSegment1 = true;
          line1++;
          lastY1 = intersectX(nextX, lines[line1], lines[line1 + 1]);
        } else {
          lastY1 = nextY1;
        }
        if (nextSegment2) {
          lastSegment2 = true;
          line2--;
          lastY2 = intersectX(nextX, lines[line2], lines[line2 - 1]);
        } else {
          lastY2 = nextY2;
        }
        i++;
        nextX = (i + 1) * this.tileW;
      } while (line1 < line2);
      return tiles;
    }
  }

  var MIN_CACHE_LEVELS = 5;
  var MAX_CACHE_LEVELS = 3;

  /**
   * Manages tile caches at different scales.
   */
  export class RenderableTileCache {
    private _source: Renderable;
    private _cacheLevels: TileCache [] = [];
    private _tileSize: number;
    private _minUntiledSize: number;
    constructor(source: Renderable, tileSize: number, minUntiledSize: number) {
      this._source = source;
      this._tileSize = tileSize;
      this._minUntiledSize = minUntiledSize;
    }

    /**
     * Gets the tiles covered by the specified |query| rectangle and transformed by the given |transform| matrix.
     */
    private _getTilesAtScale(query: Rectangle, transform: Matrix, scratchBounds: Rectangle): Tile [] {
      var transformScale = Math.max(transform.getAbsoluteScaleX(), transform.getAbsoluteScaleY());
      // Use log2(1 / transformScale) to figure out the tile level.
      var level = 0;
      if (transformScale !== 1) {
        level = clamp(Math.round(Math.log(1 / transformScale) / Math.LN2), -MIN_CACHE_LEVELS, MAX_CACHE_LEVELS);
      }
      var scale = pow2(level);
      // Since we use a single tile for dynamic sources, we've got to make sure that it fits in our surface caches ...

      if (this._source.hasFlags(NodeFlags.Dynamic)) {
        // .. so try a lower scale level until it fits.
        while (true) {
          scale = pow2(level);
          if (scratchBounds.contains(this._source.getBounds().getAbsoluteBounds().clone().scale(scale, scale))) {
            break;
          }
          level --;
          release || assert (level >= -MIN_CACHE_LEVELS);
        }
      }
      // If the source is not scalable don't cache any tiles at a higher scale factor. However, it may still make
      // sense to cache at a lower scale factor in case we need to evict larger cached images.
      if (!(this._source.hasFlags(NodeFlags.Scalable))) {
        level = clamp(level, -MIN_CACHE_LEVELS, 0);
      }
      var scale = pow2(level);
      var levelIndex = MIN_CACHE_LEVELS + level;
      var cache = this._cacheLevels[levelIndex];
      if (!cache) {
        var bounds = this._source.getBounds().getAbsoluteBounds();
        var scaledBounds = bounds.clone().scale(scale, scale);
        var tileW, tileH;
        if (this._source.hasFlags(NodeFlags.Dynamic) ||
            !this._source.hasFlags(NodeFlags.Tileable) || Math.max(scaledBounds.w, scaledBounds.h) <= this._minUntiledSize) {
          tileW = scaledBounds.w;
          tileH = scaledBounds.h;
        } else {
          tileW = tileH = this._tileSize;
        }
        cache = this._cacheLevels[levelIndex] = new TileCache(scaledBounds.w, scaledBounds.h, tileW, tileH, scale);
      }
      return cache.getTiles(query, transform.scaleClone(scale, scale));
    }

    public fetchTiles (
      query: Rectangle,
      transform: Matrix,
      scratchContext: CanvasRenderingContext2D,
      cacheImageCallback: (old: ISurfaceRegion, src: CanvasRenderingContext2D, srcBounds: Rectangle) => ISurfaceRegion): Tile []  {
      var scratchBounds = new Rectangle(0, 0, scratchContext.canvas.width, scratchContext.canvas.height);
      var tiles = this._getTilesAtScale(query, transform, scratchBounds);
      var uncachedTiles: Tile [];
      var source = this._source;
      for (var i = 0; i < tiles.length; i++) {
        var tile = tiles[i];
        if (!tile.cachedSurfaceRegion || !tile.cachedSurfaceRegion.surface || (source.hasFlags(NodeFlags.Dynamic | NodeFlags.Dirty))) {
          if (!uncachedTiles) {
            uncachedTiles = [];
          }
          uncachedTiles.push(tile);
        }
      }
      if (uncachedTiles) {
        this._cacheTiles(scratchContext, uncachedTiles, cacheImageCallback, scratchBounds);
      }
      source.removeFlags(NodeFlags.Dirty);
      return tiles;
    }

    private _getTileBounds(tiles: Tile []): Rectangle {
      var bounds = Rectangle.createEmpty();
      for (var i = 0; i < tiles.length; i++) {
        bounds.union(tiles[i].bounds);
      }
      return bounds;
    }

    /**
     * This caches raster versions of the specified |uncachedTiles|. The tiles are generated using a scratch
     * canvas2D context (|scratchContext|) and then cached via |cacheImageCallback|. Ideally, we want to render
     * all tiles in one go, but they may not fit in the |scratchContext| in which case we need to render the
     * source shape several times.
     *
     * TODO: Find a good algorithm to do this since it's quite important that we don't repaint too many times.
     * Spending some time trying to figure out the *optimal* solution may pay-off since painting is soo expensive.
     */

    private _cacheTiles (
      scratchContext: CanvasRenderingContext2D,
      uncachedTiles: Tile [],
      cacheImageCallback: (old: ISurfaceRegion, src: CanvasRenderingContext2D, srcBounds: Rectangle) => ISurfaceRegion,
      scratchBounds: Rectangle,
      maxRecursionDepth: number = 4) {
      release || assert (maxRecursionDepth > 0, "Infinite recursion is likely.");
      var uncachedTileBounds = this._getTileBounds(uncachedTiles);
      scratchContext.save();
      scratchContext.setTransform(1, 0, 0, 1, 0, 0);
      scratchContext.clearRect(0, 0, scratchBounds.w, scratchBounds.h);
      scratchContext.translate(-uncachedTileBounds.x, -uncachedTileBounds.y);
      scratchContext.scale(uncachedTiles[0].scale, uncachedTiles[0].scale);
      // Translate so that the source is drawn at the origin.
      var sourceBounds = this._source.getBounds();
      scratchContext.translate(-sourceBounds.x, -sourceBounds.y);
      profile && timelineBuffer && timelineBuffer.enter("renderTiles");
      traceLevel >= TraceLevel.Verbose && writer && writer.writeLn("Rendering Tiles: " + uncachedTileBounds);
      this._source.render(scratchContext, 0);
      scratchContext.restore();
      profile && timelineBuffer && timelineBuffer.leave("renderTiles");

      var remainingUncachedTiles = null;
      for (var i = 0; i < uncachedTiles.length; i++) {
        var tile = uncachedTiles[i];
        var region = tile.bounds.clone();
        region.x -= uncachedTileBounds.x;
        region.y -= uncachedTileBounds.y;
        if (!scratchBounds.contains(region)) {
          if (!remainingUncachedTiles) {
            remainingUncachedTiles = [];
          }
          remainingUncachedTiles.push(tile);
        }
        tile.cachedSurfaceRegion = cacheImageCallback(tile.cachedSurfaceRegion, scratchContext, region);
      }
      if (remainingUncachedTiles) {
        // This is really dumb at the moment; if we have some tiles left over, partition the tile set in half and recurse.
        if (remainingUncachedTiles.length >= 2) {
          var a = remainingUncachedTiles.slice(0, remainingUncachedTiles.length / 2 | 0);
          var b = remainingUncachedTiles.slice(a.length);
          this._cacheTiles(scratchContext, a, cacheImageCallback, scratchBounds, maxRecursionDepth - 1);
          this._cacheTiles(scratchContext, b, cacheImageCallback, scratchBounds, maxRecursionDepth - 1);
        } else {
          this._cacheTiles(scratchContext, remainingUncachedTiles, cacheImageCallback, scratchBounds, maxRecursionDepth - 1);
        }
      }
    }
  }

}
