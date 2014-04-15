/// <reference path='references.ts'/>
module Shumway.Geometry {

  import clamp = Shumway.NumberUtilities.clamp;

  export function radianToDegrees(r) {
    return r * 180 / Math.PI;
  }

  export function degreesToRadian(d) {
    return d * Math.PI / 180;
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

    toString () {
      return "{x: " + this.x + ", y: " + this.y + "}";
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

  export class Point3D {
    x: number;
    y: number;
    z: number;

    constructor (x: number, y: number, z: number) {
      this.x = x;
      this.y = y;
      this.z = z;
    }

    setElements (x: number, y: number, z: number): Point3D {
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    }

    set (other: Point3D): Point3D {
      this.x = other.x;
      this.y = other.y;
      this.z = other.z;
      return this;
    }

    dot (other: Point3D): number {
      return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    cross (other: Point3D): Point3D {
      var x = this.y * other.z - this.z * other.y;
      var y = this.z * other.x - this.x * other.z;
      var z = this.x * other.y - this.y * other.x;
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    }

    squaredLength (): number {
      return this.dot(this);
    }

    sub (other: Point3D): Point3D {
      this.x -= other.x;
      this.y -= other.y;
      this.z -= other.z;
      return this;
    }

    mul (value: number): Point3D {
      this.x *= value;
      this.y *= value;
      this.z *= value;
      return this;
    }

    normalize (): Point3D {
      var length = Math.sqrt(this.squaredLength());
      if (length > 0.00001) {
        this.mul(1 / length);
      } else {
        this.setElements(0, 0, 0);
      }
      return this;
    }

    clone (): Point3D {
      return new Point3D(this.x, this.y, this.z);
    }

    toString () {
      return "{x: " + this.x + ", y: " + this.y + ", z: " + this.z + "}";
    }

    static createEmpty(): Point3D {
      return new Point3D(0, 0, 0);
    }

    static createEmptyPoints(count: number): Point3D [] {
      var result = [];
      for (var i = 0; i < count; i++) {
        result.push(new Point3D(0, 0, 0));
      }
      return result;
    }
  }

  export class Rectangle {
    x: number;
    y: number;
    w: number;
    h: number;

    constructor (x: number, y: number, w: number, h: number) {
      this.setElements(x, y, w, h);
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
      return new Rectangle(this.x, this.y, this.w, this.h);
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

    toString(): string {
      return "{" +
        this.x + ", " +
        this.y + ", " +
        this.w + ", " +
        this.h +
      "}";
    }

    static createEmpty(): Rectangle {
      return new Rectangle(0, 0, 0, 0);
    }

    static createSquare(size: number): Rectangle {
      return new Rectangle(-size / 2, -size / 2, size, size);
    }

    /**
     * Creates the maximum rectangle representable by signed 16 bit integers.
     */
    static createMaxI16() {
      return new Rectangle(Numbers.MinI16, Numbers.MinI16, Numbers.MaxU16, Numbers.MaxU16)
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

  export class Matrix {
    a: number;
    b: number;
    c: number;
    d: number;
    tx: number;
    ty: number;

    constructor (a: number, b: number, c: number, d: number, tx: number, ty: number) {
      this.setElements(a, b, c, d, tx, ty);
    }

    setElements (a: number, b: number, c: number, d: number, tx: number, ty: number) {
      this.a = a;
      this.b = b;
      this.c = c;
      this.d = d;
      this.tx = tx;
      this.ty = ty;
    }

    set (other: Matrix) {
      this.a = other.a;
      this.b = other.b;
      this.c = other.c;
      this.d = other.d;
      this.tx = other.tx;
      this.ty = other.ty;
    }

    isEqual (other: Matrix) {
      return this.a  === other.a  &&
             this.b  === other.b  &&
             this.c  === other.c  &&
             this.d  === other.d  &&
             this.tx === other.tx &&
             this.ty === other.ty;
    }

    clone (): Matrix {
      return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
    }

    transform (a: number, b: number, c: number, d: number, tx: number, ty: number): Matrix  {
      var _a = this.a, _b = this.b, _c = this.c, _d = this.d, _tx = this.tx, _ty = this.ty;
      this.a =  _a * a + _c * b;
      this.b =  _b * a + _d * b;
      this.c =  _a * c + _c * d;
      this.d =  _b * c + _d * d;
      this.tx = _a * tx + _c * ty + _tx;
      this.ty = _b * tx + _d * ty + _ty;
      return this;
    }

    transformRectangle (rectangle: Rectangle, points: Point[]) {
      var a = this.a;
      var b = this.b;
      var c = this.c;
      var d = this.d;
      var tx = this.tx;
      var ty = this.ty;

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
      return this.a === 1 && this.b === 0 && this.c === 0 && this.d === 1;
    }

    transformRectangleAABB (rectangle: Rectangle) {
      var a = this.a;
      var b = this.b;
      var c = this.c;
      var d = this.d;
      var tx = this.tx;
      var ty = this.ty;

      var x = rectangle.x;
      var y = rectangle.y;
      var w = rectangle.w;
      var h = rectangle.h;

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
      this.a *= x;
      this.b *= y;
      this.c *= x;
      this.d *= y;
      this.tx *= x;
      this.ty *= y;
      return this;
    }

    scaleClone (x: number, y: number): Matrix {
      if (x === 1 && y === 1) {
        return this;
      }
      return this.clone().scale(x, y);
    }

    rotate (angle: number): Matrix {
      var a = this.a, b = this.b, c = this.c, d = this.d, tx = this.tx, ty = this.ty;
      var cos = Math.cos(angle);
      var sin = Math.sin(angle);
      this.a  = cos * a  - sin * b;
      this.b  = sin * a  + cos * b;
      this.c  = cos * c  - sin * d;
      this.d  = sin * c  + cos * d;
      this.tx = cos * tx - sin * ty;
      this.ty * sin * tx + cos * ty;
      return this;
    }

    concat (other: Matrix) {
      var a = this.a * other.a;
      var b = 0.0;
      var c = 0.0;
      var d = this.d * other.d;
      var tx = this.tx * other.a + other.tx;
      var ty = this.ty * other.d + other.ty;

      if (this.b !== 0.0 || this.c !== 0.0 || other.b !== 0.0 || other.c !== 0.0) {
        a  += this.b * other.c;
        d  += this.c * other.b;
        b  += this.a * other.b + this.b * other.d;
        c  += this.c * other.a + this.d * other.c;
        tx += this.ty * other.c;
        ty += this.tx * other.b;
      }

      this.a  = a;
      this.b  = b;
      this.c  = c;
      this.d  = d;
      this.tx = tx;
      this.ty = ty;
    }

    translate (x: number, y: number): Matrix {
      this.tx += x;
      this.ty += y;
      return this;
    }

    setIdentity () {
      this.a = 1;
      this.b = 0;
      this.c = 0;
      this.d = 1;
      this.tx = 0;
      this.ty = 0;
    }

    transformPoint (point: Point) {
      var x = point.x;
      var y = point.y;
      point.x = this.a * x + this.c * y + this.tx;
      point.y = this.b * x + this.d * y + this.ty;
    }

    transformPoints (points: Point[]) {
      for (var i = 0; i < points.length; i++) {
        this.transformPoint(points[i]);
      }
    }

    deltaTransformPoint (point: Point) {
      var x = point.x;
      var y = point.y;
      point.x = this.a * x + this.c * y;
      point.y = this.b * x + this.d * y;
    }

    inverse (result: Matrix) {
      var m11 = this.a;
      var m12 = this.b;
      var m21 = this.c;
      var m22 = this.d;
      var dx  = this.tx;
      var dy  = this.ty;
      if (m12 === 0.0 && m21 === 0.0) {
        m11 = 1.0 / m11;
        m22 = 1.0 / m22;
        m12 = m21 = 0.0;
        dx = -m11 * dx;
        dy = -m22 * dy;
      } else {
        var a = m11, b = m12, c = m21, d = m22;
        var determinant = a * d - b * c;
        if (determinant === 0.0) {
          return;
        }
        determinant = 1.0 / determinant;
        m11 =  d * determinant;
        m12 = -b * determinant;
        m21 = -c * determinant;
        m22 =  a * determinant;
        var ty = -(m12 * dx + m22 * dy);
        dx = -(m11 * dx + m21 * dy);
        dy = ty;
      }
      result.a = m11;
      result.b = m12;
      result.c = m21;
      result.d = m22;
      result.tx = dx;
      result.ty = dy;
    }

    getTranslateX(): number {
      return this.tx;
    }

    getTranslateY(): number {
      return this.tx;
    }

    getScaleX(): number {
      if (this.a === 1 && this.b === 0) {
        return 1;
      }
      var result = Math.sqrt(this.a * this.a + this.b * this.b);
      return this.a > 0 ? result : -result;
    }

    getScaleY(): number {
      if (this.c === 0 && this.d === 1) {
        return 1;
      }
      var result = Math.sqrt(this.c * this.c + this.d * this.d);
      return this.d > 0 ? result : -result;
    }

    getAbsoluteScaleX(): number {
      return Math.abs(this.getScaleX());
    }

    getAbsoluteScaleY(): number {
      return Math.abs(this.getScaleY());
    }

    getRotation(): number {
      return Math.atan(this.b / this.a) * 180 / Math.PI;
    }

    toString (): string {
      return "{" +
        this.a + ", " +
        this.b + ", " +
        this.c + ", " +
        this.d + ", " +
        this.tx + ", " +
        this.ty + "}";
    }

    public toWebGLMatrix(): Float32Array {
      return new Float32Array([
        this.a, this.b, 0, this.c, this.d, 0, this.tx, this.ty, 1
      ]);
    }

    public toCSSTransform(): String {
      return "matrix(" + this.a + ", " + this.b + ", " + this.c + ", " + this.d + ", " + this.tx + ", " + this.ty + ")";
    }

    public static createIdentity() {
      return new Matrix(1, 0, 0, 1, 0, 0);
    }

    static multiply = function (dst, src) {
      dst.transform(src.a, src.b, src.c, src.d, src.tx, src.ty);
    };
  }

  /**
   * Some of the math from: http://games.greggman.com/game/webgl-3d-cameras/
   */
  export class Matrix3D {
    private _m: Float32Array;
    constructor (m: number []) {
      this._m = new Float32Array(m);
    }

    public asWebGLMatrix(): Float32Array {
      return this._m;
    }

    public static createCameraLookAt(cameraPosition: Point3D, target: Point3D, up: Point3D): Matrix3D {
      var zAxis = cameraPosition.clone().sub(target).normalize();
      var xAxis = up.clone().cross(zAxis).normalize();
      var yAxis = zAxis.clone().cross(xAxis);
      return new Matrix3D ([
        xAxis.x, xAxis.y, xAxis.z, 0,
        yAxis.x, yAxis.y, yAxis.z, 0,
        zAxis.x, zAxis.y, zAxis.z, 0,
        cameraPosition.x,
        cameraPosition.y,
        cameraPosition.z,
        1
      ]);
    }

    public static createLookAt(cameraPosition: Point3D, target: Point3D, up: Point3D): Matrix3D {
      var zAxis = cameraPosition.clone().sub(target).normalize();
      var xAxis = up.clone().cross(zAxis).normalize();
      var yAxis = zAxis.clone().cross(xAxis);
      return new Matrix3D ([
        xAxis.x, yAxis.x, zAxis.x, 0,
        yAxis.x, yAxis.y, zAxis.y, 0,
        zAxis.x, yAxis.z, zAxis.z, 0,
        -xAxis.dot(cameraPosition),
        -yAxis.dot(cameraPosition),
        -zAxis.dot(cameraPosition),
        1
      ]);
    }

    public mul(point: Point3D) {
      var v = [point.x, point.y, point.z, 0];
      var m = this._m;
      var d = [];
      for (var i = 0; i < 4; i++) {
        d[i] = 0.0;
        var row = i * 4;
        for (var j = 0; j < 4; j++) {
          d[i] += m[row + j] * v[j];
        }
      }
      return new Point3D(d[0], d[1], d[2]);
    }

    public static create2DProjection(width, height, depth): Matrix3D {
      // Note: This matrix flips the Y axis so 0 is at the top.
      return new Matrix3D ([
        2 / width, 0, 0, 0,
        0, -2 / height, 0, 0,
        0, 0, 2 / depth, 0,
        -1, 1, 0, 1,
      ]);
    }

    public static createPerspective(fieldOfViewInRadians, aspectRatio, near, far): Matrix3D {
      var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
      var rangeInverse = 1.0 / (near - far);
      return new Matrix3D([
        f / aspectRatio, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near + far) * rangeInverse, -1,
        0, 0, near * far * rangeInverse * 2, 0
      ]);
    }

    public static createIdentity(): Matrix3D {
      return Matrix3D.createTranslation(0, 0, 0);
    }

    public static createTranslation(tx: number, ty: number, tz: number): Matrix3D {
      return new Matrix3D ([
        1,  0,  0,  0,
        0,  1,  0,  0,
        0,  0,  1,  0,
        tx, ty, tz,  1
      ]);
    }

    public static createXRotation(angleInRadians: number) {
      var c = Math.cos(angleInRadians);
      var s = Math.sin(angleInRadians);
      return new Matrix3D ([
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1
      ]);
    }

    public static createYRotation(angleInRadians: number) {
      var c = Math.cos(angleInRadians);
      var s = Math.sin(angleInRadians);
      return new Matrix3D ([
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1
      ]);
    }

    public static createZRotation(angleInRadians: number) {
      var c = Math.cos(angleInRadians);
      var s = Math.sin(angleInRadians);
      return new Matrix3D ([
        c, s, 0, 0,
        -s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ]);
    }

    public static createScale(sx: number, sy: number, sz: number) {
      return new Matrix3D ([
        sx, 0,  0,  0,
        0, sy,  0,  0,
        0,  0, sz,  0,
        0,  0,  0,  1,
      ]);
    }

    public static createMultiply(a: Matrix3D, b: Matrix3D): Matrix3D {
      var am = a._m;
      var bm = b._m;
      var a00 = am[0 * 4 + 0];
      var a01 = am[0 * 4 + 1];
      var a02 = am[0 * 4 + 2];
      var a03 = am[0 * 4 + 3];
      var a10 = am[1 * 4 + 0];
      var a11 = am[1 * 4 + 1];
      var a12 = am[1 * 4 + 2];
      var a13 = am[1 * 4 + 3];
      var a20 = am[2 * 4 + 0];
      var a21 = am[2 * 4 + 1];
      var a22 = am[2 * 4 + 2];
      var a23 = am[2 * 4 + 3];
      var a30 = am[3 * 4 + 0];
      var a31 = am[3 * 4 + 1];
      var a32 = am[3 * 4 + 2];
      var a33 = am[3 * 4 + 3];
      var b00 = bm[0 * 4 + 0];
      var b01 = bm[0 * 4 + 1];
      var b02 = bm[0 * 4 + 2];
      var b03 = bm[0 * 4 + 3];
      var b10 = bm[1 * 4 + 0];
      var b11 = bm[1 * 4 + 1];
      var b12 = bm[1 * 4 + 2];
      var b13 = bm[1 * 4 + 3];
      var b20 = bm[2 * 4 + 0];
      var b21 = bm[2 * 4 + 1];
      var b22 = bm[2 * 4 + 2];
      var b23 = bm[2 * 4 + 3];
      var b30 = bm[3 * 4 + 0];
      var b31 = bm[3 * 4 + 1];
      var b32 = bm[3 * 4 + 2];
      var b33 = bm[3 * 4 + 3];
      return new Matrix3D([
        a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30,
        a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31,
        a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32,
        a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33,
        a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30,
        a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31,
        a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32,
        a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33,
        a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30,
        a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31,
        a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32,
        a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33,
        a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30,
        a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31,
        a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32,
        a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33
      ]);
    }

    public static createInverse(a: Matrix3D): Matrix3D {
      var m = a._m;
      var m00 = m[0 * 4 + 0];
      var m01 = m[0 * 4 + 1];
      var m02 = m[0 * 4 + 2];
      var m03 = m[0 * 4 + 3];
      var m10 = m[1 * 4 + 0];
      var m11 = m[1 * 4 + 1];
      var m12 = m[1 * 4 + 2];
      var m13 = m[1 * 4 + 3];
      var m20 = m[2 * 4 + 0];
      var m21 = m[2 * 4 + 1];
      var m22 = m[2 * 4 + 2];
      var m23 = m[2 * 4 + 3];
      var m30 = m[3 * 4 + 0];
      var m31 = m[3 * 4 + 1];
      var m32 = m[3 * 4 + 2];
      var m33 = m[3 * 4 + 3];
      var tmp_0  = m22 * m33;
      var tmp_1  = m32 * m23;
      var tmp_2  = m12 * m33;
      var tmp_3  = m32 * m13;
      var tmp_4  = m12 * m23;
      var tmp_5  = m22 * m13;
      var tmp_6  = m02 * m33;
      var tmp_7  = m32 * m03;
      var tmp_8  = m02 * m23;
      var tmp_9  = m22 * m03;
      var tmp_10 = m02 * m13;
      var tmp_11 = m12 * m03;
      var tmp_12 = m20 * m31;
      var tmp_13 = m30 * m21;
      var tmp_14 = m10 * m31;
      var tmp_15 = m30 * m11;
      var tmp_16 = m10 * m21;
      var tmp_17 = m20 * m11;
      var tmp_18 = m00 * m31;
      var tmp_19 = m30 * m01;
      var tmp_20 = m00 * m21;
      var tmp_21 = m20 * m01;
      var tmp_22 = m00 * m11;
      var tmp_23 = m10 * m01;

      var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) - (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
      var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) - (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
      var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) - (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
      var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) - (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

      var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

      return new Matrix3D ([
        d * t0,
        d * t1,
        d * t2,
        d * t3,
        d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) - (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
        d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) - (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
        d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) - (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
        d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) - (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
        d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) - (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
        d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) - (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
        d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) - (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
        d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) - (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
        d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) - (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
        d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) - (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
        d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) - (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
        d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) - (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
      ]);
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

  export module RegionAllocator {
    export class Region extends Rectangle {
      allocator: IRegionAllocator;
    }

    export interface IRegionAllocator {
      allocate(w: number, h: number): Region;
      free(region: Region);
    }

    /**
     * Simple 2D bin-packing algorithm that recursively partitions space along the x and y axis. The binary tree
     * can get quite deep so watch out of deep recursive calls. This algorithm works best when inserting items
     * that are sorted by width and height, from largest to smallest.
     */
    export class Compact implements IRegionAllocator {
      /**
       * Try out randomizing the orientation of each subdivision, sometimes this can lead to better results.
       */
      static RANDOM_ORIENTATION: boolean = true;
      static MAX_DEPTH: number = 256;
      private _root: Compact.Cell;
      private _allocations: Compact.Cell [] = [];
      constructor(w: number, h: number) {
        this._root = new Compact.Cell(0, 0, w, h, false);
      }

      allocate(w: number, h: number): Region {
        var result = this._root.insert(w, h);
        if (result) {
          result.allocator = this;
        }
        return result;
      }

      free(region: Region) {
        var cell = <Compact.Cell>region;
        assert (cell.allocator === this);
        cell.clear();
      }
    }

    export module Compact {
      export class Cell extends RegionAllocator.Region {
        private _children: Cell [];
        private _horizontal: boolean;
        private _empty: boolean;
        constructor(x: number, y: number, w: number, h: number, horizontal: boolean) {
          super(x, y, w, h);
          this._children = null;
          this._horizontal = horizontal;
          this._empty = true;
        }
        clear() {
          this._children = null;
          this._empty = true;
        }
        insert(w: number, h: number): Cell {
          return this._insert(w, h, 0);
        }
        private _insert(w: number, h: number, depth: number): Cell {
          if (depth > Compact.MAX_DEPTH) {
            return;
          }
          if (!this._empty) {
            return;
          }
          if (this.w < w || this.h < h) {
            return;
          }
          if (!this._children) {
            var orientation = !this._horizontal;
            if (Compact.RANDOM_ORIENTATION) {
              orientation = Math.random() >= 0.5;
            }
            if (this._horizontal) {
              this._children = [
                new Cell(this.x, this.y, this.w, h, false),
                new Cell(this.x, this.y + h, this.w, this.h - h, orientation),
              ];
            } else {
              this._children = [
                new Cell(this.x, this.y, w, this.h, true),
                new Cell(this.x + w, this.y, this.w - w, this.h, orientation),
              ];
            }
            var first = this._children[0];
            if (first.w === w && first.h === h) {
              first._empty = false;
              return first;
            }
            return this._insert(w, h, depth + 1);
          } else {
            var result;
            result = this._children[0]._insert(w, h, depth + 1);
            if (result) {
              return result;
            }
            result = this._children[1]._insert(w, h, depth + 1);
            if (result) {
              return result;
            }
          }
        }
      }
    }

    export class Grid implements IRegionAllocator {
      private _size: number;
      private _rows: number;
      private _columns: number;
      private _cells: Grid.Cell [];
      constructor(w: number, h: number, size: number) {
        this._columns = w / size | 0;
        this._rows = h / size | 0;
        this._size = size;
        this._cells = [];
        for (var y = 0; y < this._rows; y++) {
          for (var x = 0; x < this._columns; x++) {
            this._cells.push(null);
          }
        }
      }

      allocate(w: number, h: number): Region {
        var size = this._size;
        if (w > size || h > size) {
          return null;
        }
        for (var y = 0; y < this._rows; y++) {
          for (var x = 0; x < this._columns; x++) {
            var index = y * this._columns + x;
            if (!this._cells[index]) {
              var cell = new Grid.Cell(x * size, y * size, w, h);
              cell.index = index;
              cell.allocator = this;
              this._cells[index] = cell;
              return cell;
            }
          }
        }
        return null;
      }

      free(region: Region) {
        var cell = <Grid.Cell>region;
        assert (cell.allocator === this);
        assert (this._cells[cell.index] === region);
        this._cells[cell.index] = null;
      }
    }

    export module Grid {
      export class Cell extends RegionAllocator.Region {
        index: number = -1;
        constructor(x: number, y: number, w: number, h: number) {
          super(x, y, w, h);
        }
      }
    }
  }

  export module Path {
    var CURVE_RECURSION_LIMIT = 32;
    var CURVE_COLLINEARITY_EPSILON = 1e-30;
    var CURVE_DISTANCE_EPSILON = 1e-30;
    var CURVE_ANGLE_TOLERANCE_EPSILON = 0.01;
    var ANGLE_TOLERANCE = 0;
    var DISTANCE_TOLERANCE_SQUARE = 0.5 * 0.5;

    /**
     * De Casteljau Algorithm for Quadratic Curve Subdivision (Anti-Grain Geometry Implementation)
     */
    export function createQuadraticCurveVertices(vertices, index, x0, y0, x1, y1, x2, y2, level) {
      if (level > CURVE_RECURSION_LIMIT) {
        return 0;
      }
      // Find Mid-Points
      var x01 = (x0 + x1) / 2;
      var y01 = (y0 + y1) / 2;
      var x12 = (x1 + x2) / 2;
      var y12 = (y1 + y2) / 2;
      var x012 = (x01 + x12) / 2;
      var y012 = (y01 + y12) / 2;

      var dx = x2 - x0;
      var dy = y2 - y0;
      var d = Math.abs((x1 - x2) * dy - (y1 - y2) * dx);

      if (d > CURVE_COLLINEARITY_EPSILON) {
        // Regular Case
        if (d * d <= DISTANCE_TOLERANCE_SQUARE * (dx * dx + dy * dy)) {
          if (ANGLE_TOLERANCE < CURVE_ANGLE_TOLERANCE_EPSILON) {
            vertices[index + 0] = x012;
            vertices[index + 1] = y012;
            return index + 2;
          }
          // Angle & Cusp Condition
          var da = Math.abs(Math.atan2(y2 - y1, x2 - x1) - Math.atan2(y1 - y0, x1 - x0));
          if (da >= Math.PI) {
            da = 2 * Math.PI - da;
          }
          if (da < ANGLE_TOLERANCE) {
            vertices[index + 0] = x012;
            vertices[index + 1] = y012;
            return index + 2;
          }
        }
      } else {
        notImplemented("Collinear Case");
      }
      // Recursively Subdivide Curve
      index = createQuadraticCurveVertices(vertices, index, x0, y0, x01, y01, x012, y012, level + 1);
      index = createQuadraticCurveVertices(vertices, index, x012, y012, x12, y12, x2, y2, level + 1);
      return index;
    }

    /*
    var Path = (function () {
      var MOVE_TO             = 0x01;
      var LINE_TO             = 0x02;
      var QUADRATIC_CURVE_TO  = 0x03;
      var ARC_TO              = 0x04;
      var RECT                = 0x05;
      var ARC                 = 0x06;
      var ELLIPSE             = 0x07;
      function path() {
        this._buffer = new Shumway.Util.ByteArray(1024);
        this._x = 0;
        this._y = 0;
      }
      path.prototype.hash = function () {
        return this._buffer.hashWords(0, 0, this._buffer.offset >> 2);
      };
      path.prototype.clone = function () {
        var path = new Path();
        this.visit(path);
        return path;
      };
      path.prototype.reset = function () {
        this._x = 0;
        this._y = 0;
        this._buffer.reset();
      };
      path.prototype._bufferCommand = function (command, a, b, c, d, e, f, g, h) {
        var buffer = this._buffer;
        var offset = this._buffer.offset;
        var bytesToWrite = arguments.length * 4;
        buffer.ensureCapacity(offset + bytesToWrite);
        buffer.writeIntUnsafe(command);
        switch (command) {
          case MOVE_TO:
          case LINE_TO:
            buffer.writeVertexUnsafe(a, b);
            break;
          case RECT:
            buffer.writeVertexUnsafe(a, b);
            buffer.writeFloatUnsafe(c);
            buffer.writeFloatUnsafe(d);
            break;
          case QUADRATIC_CURVE_TO:
            buffer.writeVertexUnsafe(a, b);
            buffer.writeVertexUnsafe(c, d);
            break;
          default:
            notImplemented(command);
        }
      };
      path.prototype.closePath = function () {
        notImplemented("closePath");
      };
      path.prototype.moveTo = function (x, y) {
        this._bufferCommand(MOVE_TO, x, y);
        this._x = x;
        this._y = y;
      };
      path.prototype.lineTo = function (x, y) {
        this._bufferCommand(LINE_TO, x, y);
        this._x = x;
        this._y = y;
      };
      path.prototype.quadraticCurveTo = function (cpx, cpy, x, y) {
        this._bufferCommand(QUADRATIC_CURVE_TO, cpx, cpy, x, y);
        this._x = x;
        this._y = y;
      };
      path.prototype.bezierCurveTo = function (cbx, cp1y, ccx, ccy, x, y) {
        notImplemented("bezierCurveTo");
      };
      path.prototype.arcTo = function (x1, y1, x2, y2, radius) {
        notImplemented("arcTo");
      };
      path.prototype.rect = function (x, y, w, h) {
        this._bufferCommand(RECT, x, y, w, h);
      };
      path.prototype.arc = function (x, y, radius, startAngle, endAngle, anticlockwise) {
        notImplemented("arc");
      };
      path.prototype.ellipse = function (x, y, radiusX, radiusY,  rotation, startAngle, endAngle, anticlockwise) {
        notImplemented("ellipse");
      };
      path.prototype.trace = function (writer) {
        this.visit({
          moveTo: function (x, y) {
            writer.writeLn("MOVE_TO: x: " + x + ", y: " + y);
          },
          lineTo: function (x, y) {
            writer.writeLn("LINE_TO: x: " + x + ", y: " + y);
          },
          rect: function (x, y, w, h) {
            writer.writeLn("RECT: x: " + x + ", y: " + y + ", w: " + w + ", h: " + h);
          },
          quadraticCurveTo: function (cpx, cpy, x, y) {
            writer.writeLn("QUADRATIC_CURVE_TO: cpx: " + cpx + ", cpy: " + cpy + ", x: " + x + ", y: " + y);
          }
        });
      };
      path.prototype.visit = function (visitor) {
        var i32 = this._buffer.i32;
        var f32 = this._buffer.f32;
        var i = 0;
        var j = this._buffer.offset >> 2;
        while (i < j) {
          switch (i32[i++]) {
            case MOVE_TO:
              visitor.moveTo(f32[i++], f32[i++]);
              break;
            case LINE_TO:
              visitor.lineTo(f32[i++], f32[i++]);
              break;
            case RECT:
              visitor.rect(f32[i++], f32[i++], f32[i++], f32[i++]);
              break;
            case QUADRATIC_CURVE_TO:
              visitor.quadraticCurveTo(f32[i++], f32[i++], f32[i++], f32[i++]);
              break;
            default:
              notImplemented("");
              break;
          }
        }
      };
      return path;
    })();
    */

    /**
     * A path made up of only MOVE_TO, LINE_TO commands.
     */
    /*
    var SimplePath = (function () {
      // TODO: Hope this is large enough.
      var tmp = new Float32Array(1024);
      function simplePath() {
        Path.call(this);
      }
      simplePath.prototype = Object.create(Path.prototype);
      simplePath.prototype.quadraticCurveTo = function (cpx, cpy, x, y) {
        var index = createQuadraticCurveVertices(tmp, 0, this._x, this._y, cpx, cpy, x, y, 0);
        for (var i = 0; i < index; i += 2) {
          this.lineTo(tmp[i], tmp[i + 1]);
        }
        this.lineTo(x, y);
      };
      return simplePath;
    })();
    */
  }

  export class Tile {
    x: number;
    y: number;
    index: number;
    scale: number;
    bounds: Rectangle;
    cachedTextureRegion: Shumway.GFX.Layers.ITextureRegion;
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

  export class TileCache {
    w: number;
    h: number;
    tileW: number;
    tileH: number;
    rows: number;
    scale: number;
    columns: number;
    tiles: Tile [];
    private static points = Point.createEmptyPoints(4);
    constructor(w: number, h: number, tileW: number, tileH: number, scale: number) {
      this.tileW = tileW;
      this.tileH = tileH;
      this.scale = scale;
      this.w = w;
      this.h = h;
      this.rows = Math.ceil(h / tileH);
      this.columns = Math.ceil(w / tileW);
      assert (this.rows < 2048 && this.columns < 2048);
      this.tiles = [];
      var index = 0;
      for (var y = 0; y < this.rows; y++) {
        for (var x = 0; x < this.columns; x++) {
          this.tiles.push(new Tile(index++, x, y, tileW, tileH, scale));
        }
      }
    }

    getTiles(query: Rectangle, transform: Matrix): Tile [] {
      var tileCount = this.columns * this.rows;
      if (true || tileCount < 40) {
        // If we have only a few tiles we're better off using the dumber algorithm.
        // TODO: Fine-tune these heuristics.
        return this.getFewTiles(query, transform, tileCount > 10);
      } else {
        // return this.getManyTiles(query, transform);
      }
    }

    private getFewTiles(query: Rectangle, transform: Matrix, precise: boolean = true): Tile [] {
      if (transform.isTranslationOnly() && this.tiles.length === 1) {
        if (this.tiles[0].bounds.intersectsTranslated(query, transform.tx, transform.ty)) {
          return [this.tiles[0]];
        }
        return [];
      }
      transform.transformRectangle(query, TileCache.points);
      var queryOBB;
      var queryBounds = new Rectangle(0, 0, this.w, this.h);
      if (precise) {
        // Precise indicates that we want to do an exact OBB intersection.
        queryOBB = new OBB(TileCache.points);
      }
      queryBounds.intersect(OBB.getBounds(TileCache.points));

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

    /*
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

      var rectPoints: Point[] = TileCache.points;
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
      var i = Math.floor(lines[0].x / this.size);
      var nextX = (i + 1) * this.size;
      if (lines[2].x < nextX) {
        // edge case: all fits into one column
        lastY1 = Math.min(lines[0].y, lines[1].y, lines[2].y, lines[3].y);
        lastY2 = Math.max(lines[0].y, lines[1].y, lines[2].y, lines[3].y);
        var j1 = Math.floor(lastY1 / this.size);
        var j2 = Math.floor(lastY2 / this.size);
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

        var j1 = Math.floor(lines[line1].y / this.size);
        var j2 = Math.floor(lines[line2].y / this.size);
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

        var j1 = Math.floor((lines[line1].y < lines[line1 + 1].y ? lastY1 : nextY1) / this.size);
        var j2 = Math.floor((lines[line2].y > lines[line2 - 1].y ? lastY2 : nextY2) / this.size);
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
        nextX = (i + 1) * this.size;
      } while (line1 < line2);
      return tiles;
    }
    */
  }
}