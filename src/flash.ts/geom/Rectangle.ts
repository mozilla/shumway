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
// Class: Rectangle
module Shumway.AVM2.AS.flash.geom {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Rectangle extends ASNative {

    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // Called whenever an instance of the class is initialized.
    static initializer: any = null;

    // List of static symbols to link.
    static staticBindings: string [] = null; // [];

    // List of instance symbols to link.
    static bindings: string [] = null; // ["x", "y", "width", "height", "left", "left", "right", "right", "top", "top", "bottom", "bottom", "topLeft", "topLeft", "bottomRight", "bottomRight", "size", "size", "clone", "isEmpty", "setEmpty", "inflate", "inflatePoint", "offset", "offsetPoint", "contains", "containsPoint", "containsRect", "intersection", "intersects", "union", "equals", "copyFrom", "setTo", "toString"];

    public x: number;
    public y: number;
    public width: number;
    public height: number;

    constructor(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
      false && super();
      this.x = +x;
      this.y = +y;
      this.width = +width;
      this.height = +height;
    }

    public get left(): number {
      return this.x;
    }

    public set left(value: number) {
      value = +value;
      this.width += this.x - value;
      this.x = value;
    }

    public get right(): number {
      return this.x + this.width;
    }

    public set right(value: number) {
      value = +value;
      this.width = value - this.x;
    }

    public get top(): number {
      return this.y;
    }

    public set top(value: number) {
      value = +value;
      this.height += this.y - value;
      this.y = value;
    }

    public get bottom(): number {
      return this.y + this.height;
    }

    public set bottom(value: number) {
      value = +value;
      this.height = value - this.y;
    }

    public get topLeft(): Point {
      return new Point(this.left, this.top);
    }

    public set topLeft(value: Point) {
      this.top = value.y;
      this.left = value.x;
    }

    public get bottomRight(): Point {
      return new Point(this.right, this.bottom);
    }

    public set bottomRight(value: Point) {
      this.bottom = value.y;
      this.right = value.x;
    }

    public get size(): Point {
      return new Point(this.width, this.height);
    }

    public set size(value: Point) {
      this.width = value.x;
      this.height = value.y;
    }

    public get area(): number {
      return this.width * this.height;
    }

    public clone(): Rectangle {
      return new Rectangle(this.x, this.y, this.width, this.height);
    }

    public isEmpty(): boolean {
      return this.width <= 0 || this.height <= 0;
    }

    public setEmpty(): void {
      this.x = 0;
      this.y = 0;
      this.width = 0;
      this.height = 0;
    }

    public inflate(dx: number, dy: number): void {
      dx = +dx;
      dy = +dy;
      this.x -= dx;
      this.y -= dy;
      this.width += (dx * 2);
      this.height += (dy * 2);
    }

    public inflatePoint(point: Point): void {
      this.inflate(point.x, point.y);
    }

    public offset(dx: number, dy: number): void {
      this.x += +dx;
      this.y += +dy;
    }

    public offsetPoint(point: Point): void {
      this.offset(point.x, point.y);
    }

    public contains(x: number, y: number): boolean {
      x = +x;
      y = +y;
      return this.x <= x && x <= this.right && this.y <= y && y <= this.bottom;
    }

    public containsPoint(point: Point): boolean {
      return this.contains(point.x, point.y);
    }

    public containsRect(rect: Rectangle): boolean {
      return this.containsPoint(rect.topLeft) && this.containsPoint(rect.bottomRight);
    }

    public intersection(toIntersect: Rectangle): Rectangle {
      var l: number = Math.max(this.x, toIntersect.x);
      var r: number = Math.min(this.right, toIntersect.right);
      if (l <= r) {
        var t: number = Math.max(this.y, toIntersect.y);
        var b: number = Math.min(this.bottom, toIntersect.bottom);
        if (t <= b) {
          return new Rectangle(l, t, r - l, b - t);
        }
      }
      return new Rectangle();
    }

    public intersects(toIntersect: Rectangle): boolean {
      return Math.max(this.x, toIntersect.x) <= Math.min(this.right, toIntersect.right)
        && Math.max(this.y, toIntersect.y) <= Math.min(this.bottom, toIntersect.bottom);
    }

    public clip(clipRect: Rectangle): Rectangle {
      var l: number = Math.max(this.x, clipRect.x);
      var r: number = Math.min(this.right, clipRect.right);
      if (l <= r) {
        var t: number = Math.max(this.y, clipRect.y);
        var b: number = Math.min(this.bottom, clipRect.bottom);
        if (t <= b) {
          this.setTo(l, t, r - l, b - t);
        }
      }
      return this;
    }

    public union(toUnion: Rectangle): Rectangle {
      var rect = this.clone();
      rect.unionWith(toUnion);
      return rect;
    }

    public unionWith(toUnion: Rectangle): Rectangle {
      if (toUnion.isEmpty()) {
        return;
      }
      if (this.isEmpty()) {
        this.copyFrom(toUnion);
        return;
      }
      var l: number = Math.min(this.x, toUnion.x);
      var t: number = Math.min(this.y, toUnion.y);
      this.setTo(l, t,
        Math.max(this.right, toUnion.right) - l,
        Math.max(this.bottom, toUnion.bottom) - t);
      return this;
    }

    public equals(toCompare: Rectangle): boolean {
      return this.x == toCompare.x
        && this.y == toCompare.y
        && this.width == toCompare.width
        && this.height == toCompare.height;
    }

    public copyFrom(sourceRect: Rectangle): void {
      this.x = sourceRect.x;
      this.y = sourceRect.y;
      this.width = sourceRect.width;
      this.height = sourceRect.height;
    }

    public setTo(x: number, y: number, width: number, height: number): void {
      this.x = +x;
      this.y = +y;
      this.width = +width;
      this.height = +height;
    }

    public toTwips(): Rectangle {
      this.x = (this.x * 20) | 0;
      this.y = (this.y * 20) | 0;
      this.width = (this.width * 20) | 0;
      this.height = (this.height * 20) | 0;
      return this;
    }

    /**
     * Snaps the rectangle to pixel boundaries. The computed rectangle covers
     * the original rectangle.
     */
    public snap(): Rectangle {
      var x1 = Math.ceil(this.x + this.width);
      var y1 = Math.ceil(this.y + this.height);
      this.x |= 0;
      this.y |= 0;
      this.width = x1 - this.x;
      this.height = y1 - this.y;
      return this;
    }

    public getBaseWidth(angle: number) {
      var u = Math.abs(Math.cos(angle));
      var v = Math.abs(Math.sin(angle));
      return u * this.width + v * this.height;
    }

    public getBaseHeight(angle: number) {
      var u = Math.abs(Math.cos(angle));
      var v = Math.abs(Math.sin(angle));
      return v * this.width + u * this.height;
    }

    public toPixels(): Rectangle {
      this.x /= 20;
      this.y /= 20;
      this.width /= 20;
      this.height /= 20;
      return this;
    }

    public toString(): String {
      return "(x=" + this.x + ", y=" + this.y + ", w=" + this.width + ", h=" + this.height + ")";
    }
  }
}
