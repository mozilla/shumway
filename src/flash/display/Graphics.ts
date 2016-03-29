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

// Class: Graphics
module Shumway.AVMX.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  import clamp = Shumway.NumberUtilities.clamp;
  import Bounds = Shumway.Bounds;
  import assert = Shumway.Debug.assert;
  import assertUnreachable = Shumway.Debug.assertUnreachable;
//  import enterTimeline = Shumway.Player.enterTimeline;
//  import leaveTimeline = Shumway.Player.leaveTimeline;

  import DisplayObject = flash.display.DisplayObject;
  import GradientType = flash.display.GradientType;
  import SpreadMethod = flash.display.SpreadMethod;
  import InterpolationMethod = flash.display.InterpolationMethod;
  import LineScaleMode = flash.display.LineScaleMode;
  import CapsStyle = flash.display.CapsStyle;
  import JointStyle = flash.display.JointStyle;
  import PathCommand = Shumway.PathCommand;
  import ShapeData = Shumway.ShapeData;
  import geom = flash.geom;
  import utils = flash.utils;

  function distanceSq(x1, y1, x2, y2) {
    var dX = x2 - x1;
    var dY = y2 - y1;
    return dX * dX + dY * dY;
  }

  function quadraticBezier(from: number, cp: number, to: number, t: number): number {
    var inverseT = 1 - t;
    return from * inverseT * inverseT + 2 * cp * inverseT * t + to * t * t;
  }
  function quadraticBezierExtreme(from: number, cp: number, to: number): number {
    var t = (from - cp) / (from - 2 * cp + to);
    if (t < 0) {
      return from;
    }
    if (t > 1) {
      return to;
    }
    return quadraticBezier(from, cp, to, t);
  }
  function cubicBezier(from: number, cp: number, cp2: number, to: number, t): number {
    var tSq = t * t;
    var inverseT = 1 - t;
    var inverseTSq = inverseT * inverseT;
    return from * inverseT * inverseTSq + 3 * cp * t * inverseTSq +
           3 * cp2 * inverseT * tSq + to * t * tSq;
  }

  function cubicBezierExtremes(from: number, cp: number, cp2: number, to): number[] {
    var d1 = cp - from;
    var d2 = cp2 - cp;
    // We only ever need d2 * 2
    d2 *= 2;
    var d3 = to - cp2;
    // Prevent division by zero by very slightly changing d3 if that would happen
    if (d1 + d3 === d2) {
      d3 *= 1.0001;
    }
    var fHead = 2 * d1 - d2;
    var part1 = d2 - 2 * d1;
    var fCenter = Math.sqrt(part1 * part1 - 4 * d1 * (d1 - d2 + d3));
    var fTail = 2 * (d1 - d2 + d3);
    var t1 = (fHead + fCenter) / fTail;
    var t2 = (fHead - fCenter ) / fTail;
    var result = [];
    if (t1 >= 0 && t1 <= 1) {
      result.push(Math.round(cubicBezier(from, cp, cp2, to, t1)));
    }
    if (t2 >= 0 && t2 <= 1) {
      result.push(Math.round(cubicBezier(from, cp, cp2, to, t2)));
    }
    return result;
  }

  function cubicXAtY(x0, y0, cx, cy, cx1, cy1, x1, y1, y) {
    var dX = 3.0 * (cx - x0);
    var dY = 3.0 * (cy - y0);

    var bX = 3.0 * (cx1 - cx) - dX;
    var bY = 3.0 * (cy1 - cy) - dY;

    var c3X = x1 - x0 - dX - bX;
    var c3Y = y1 - y0 - dY - bY;
    // Find one root - any root - then factor out (t-r) to get a quadratic poly.
    function f(t) {
      return t * (dY + t * (bY + t * c3Y)) + y0 - y;
    }
    function pointAt(t) {
      if (t < 0) {
        t = 0;
      } else if (t > 1) {
        t = 1;
      }

      return x0 + t * (dX + t * (bX + t * c3X));
    }
    // Bisect the specified range to isolate an interval with a root.
    function bisectCubicBezierRange(f, l, r, limit) {
      if (Math.abs(r - l) <= limit) {
        return;
      }

      var middle = 0.5 * (l + r);
      if (f(l) * f(r) <= 0) {
        left = l;
        right = r;
        return;
      }
      bisectCubicBezierRange(f, l, middle, limit);
      bisectCubicBezierRange(f, middle, r, limit);
    }

    // some curves that loop around on themselves may require bisection
    var left = 0;
    var right = 1;
    bisectCubicBezierRange(f, 0, 1, 0.05);

    // experiment with tolerance - but not too tight :)
    var t0 = findRoot(left, right, f, 50, 0.000001);
    var evalResult = Math.abs(f(t0));
    if (evalResult > 0.00001) {
      return [];
    }

    var result = [];
    if (t0 <= 1) {
      result.push(pointAt(t0));
    }

    // Factor theorem: t-r is a factor of the cubic polynomial if r is a root.
    // Use this to reduce to a quadratic poly. using synthetic division
    var a = c3Y;
    var b = t0 * a + bY;
    var c = t0 * b + dY;

    // Process the quadratic for the remaining two possible roots
    var d = b * b - 4 * a * c;
    if (d < 0) {
      return result;
    }

    d = Math.sqrt(d);
    a = 1 / (a + a);
    var t1 = (d - b) * a;
    var t2 = (-b - d) * a;

    if (t1 >= 0 && t1 <= 1) {
      result.push(pointAt(t1));
    }

    if (t2 >= 0 && t2 <= 1) {
      result.push(pointAt(t2));
    }

    return result;
  }

  function findRoot(x0, x2, f, maxIterations, epsilon) {
    var x1;
    var y0;
    var y1;
    var y2;
    var b;
    var c;
    var y10;
    var y20;
    var y21;
    var xm;
    var ym;
    var temp;

    var xmlast = x0;
    y0 = f(x0);

    if (y0 === 0) {
      return x0;
    }

    y2 = f(x2);
    if (y2 === 0) {
      return x2;
    }

    if (y2 * y0 > 0) {
// dispatchEvent( new Event(ERROR) );
      return x0;
    }

    var __iter = 0;
    for (var i = 0; i < maxIterations; ++i) {
      __iter++;

      x1 = 0.5 * (x2 + x0);
      y1 = f(x1);
      if (y1 === 0) {
        return x1;
      }

      if (Math.abs(x1 - x0) < epsilon) {
        return x1;
      }

      if (y1 * y0 > 0) {
        temp = x0;
        x0 = x2;
        x2 = temp;
        temp = y0;
        y0 = y2;
        y2 = temp;
      }

      y10 = y1 - y0;
      y21 = y2 - y1;
      y20 = y2 - y0;
      if (y2 * y20 < 2 * y1 * y10) {
        x2 = x1;
        y2 = y1;
      } else {
        b = (x1 - x0 ) / y10;
        c = (y10 - y21) / (y21 * y20);
        xm = x0 - b * y0 * (1 - c * y1);
        ym = f(xm);
        if (ym === 0) {
          return xm;
        }

        if (Math.abs(xm - xmlast) < epsilon) {
          return xm;
        }

        xmlast = xm;
        if (ym * y0 < 0) {
          x2 = xm;
          y2 = ym;
        } else {
          x0 = xm;
          y0 = ym;
          x2 = x1;
          y2 = y1;
        }
      }
    }
    return x1;
  }

  // See http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
  function rayIntersectsLine(x: number, y: number, x1: number, y1: number, x2: number,
                             y2: number): boolean
  {
    return (y2 > y) !== (y1 > y) && x < (x1 - x2) * (y - y2) / (y1 - y2) + x2;
  }

  function rayFullyCrossesCurve(x: number, y: number, fromX: number, fromY: number, cpX: number,
                               cpY: number, toX: number, toY: number): boolean
  {
    if ((cpY > y) === (fromY > y) && (toY > y) === (fromY > y)) {
      return false;
    }
    if (fromX >= x && cpX >= x && toX >= x) {
      return true;
    }

    // Finding the intersections with our ray means solving a quadratic
    // equation of the form y = ax^2 + bx + c for y.
    // See http://en.wikipedia.org/wiki/Quadratic_equation and
    // http://code.google.com/p/degrafa/source/browse/trunk/Degrafa/com/degrafa/geometry/AdvancedQuadraticBezier.as?r=613#394
    var a = fromY - 2 * cpY + toY;
    var c = fromY - y;
    var b = 2 * (cpY - fromY);

    var d = b * b - 4 * a * c;
    if (d < 0) {
      return false;
    }

    d = Math.sqrt(d);
    a = 1 / (a + a);
    var t1 = (d - b) * a;
    var t2 = (-b - d) * a;

    var crosses = false;
    if (t1 >= 0 && t1 <= 1 && quadraticBezier(fromX, cpX, toX, t1) > x) {
      crosses = !crosses;
    }

    if (t2 >= 0 && t2 <= 1 && quadraticBezier(fromX, cpX, toX, t2) > x) {
      crosses = !crosses;
    }
    return crosses;
  }

  function rayFullyCrossesCubicCurve(x: number, y: number, fromX: number, fromY: number,
                                     cpX: number, cpY: number, cp2X: number, cp2Y: number,
                                     toX: number, toY: number): boolean
  {
    var curveStartsAfterY = fromY > y;
    if ((cpY > y) === curveStartsAfterY && (cp2Y > y) === curveStartsAfterY &&
        (toY > y) === curveStartsAfterY) {
      return false;
    }
    if (fromX < x && cpX < x && cp2X < x && toX < x) {
      return false;
    }
    var crosses = false;
    var roots = cubicXAtY(fromX, fromY, cpX, cpY, cp2X, cp2Y, toX, toY, y);
    for (var i = roots.length; i; i--) {
      if (roots[i] >= x) {
        crosses = !crosses;
      }
    }
    return crosses;
  }
  // end of GFX geometry.ts

  export class Graphics extends ASObject implements Shumway.Remoting.IRemotable {

    static classInitializer: any = null;

    constructor () {
      super();
      this._id = flash.display.DisplayObject.getNextSyncID();
      this._graphicsData = new ShapeData();
      this._textures = [];
      this._fillBounds = new Bounds(0x8000000, 0x8000000, 0x8000000, 0x8000000);
      this._lineBounds = new Bounds(0x8000000, 0x8000000, 0x8000000, 0x8000000);
      this._lastX = this._lastY = 0;
      this._boundsIncludeLastCoordinates = true;
      this._parent = null;

      this._topLeftStrokeWidth = this._bottomRightStrokeWidth = 0;
      this._isDirty = true;
    }

    static FromData(data: any, loaderInfo: LoaderInfo): Graphics {
      var graphics: Graphics = new loaderInfo.sec.flash.display.Graphics();
      graphics._graphicsData = ShapeData.FromPlainObject(data.shape);
      if (data.lineBounds) {
        graphics._lineBounds.copyFrom(data.lineBounds);
        graphics._fillBounds.copyFrom(data.fillBounds || data.lineBounds);
      }
      return graphics;
    }

    getGraphicsData(): ShapeData {
      return this._graphicsData;
    }

    getUsedTextures(): BitmapData[] {
      return this._textures;
    }

    // JS -> AS Bindings
    _id: number;

    // AS -> JS Bindings
    private _graphicsData: ShapeData;
    private _textures: BitmapData[];
    private _lastX: number;
    private _lastY: number;
    private _boundsIncludeLastCoordinates: boolean;

    /**
     * Determine by how much the lineBounds are larger than the fillBounds.
     */
    private _topLeftStrokeWidth: number;
    private _bottomRightStrokeWidth: number;

    /**
     * Indicates whether this graphics object has changed since the last time it was synchronized.
     */
    _isDirty: boolean;

    /**
     * Flash special-cases lines that are 1px and 3px wide.
     * They're offset by 0.5px to the bottom-right.
     */
    private _setStrokeWidth(width: number) {
      switch (width) {
        case 1:
          this._topLeftStrokeWidth = 0;
          this._bottomRightStrokeWidth = 1;
          break;
        case 3:
          this._topLeftStrokeWidth = 1;
          this._bottomRightStrokeWidth = 2;
          break;
        default:
          var half = Math.ceil(width * 0.5) | 0;
          this._topLeftStrokeWidth = half;
          this._bottomRightStrokeWidth = half;
          break;
      }
    }

    /**
     * Bounding box excluding strokes.
     */
    private _fillBounds: Bounds;

    /**
     * Bounding box including strokes.
     */
    private _lineBounds: Bounds;

    /**
     * Back reference to the display object that references this graphics object. This is
     * needed so that we can propagate invalid / dirty bits whenever the graphics object
     * changes.
     */
    _parent: DisplayObject;

    _setParent(parent: DisplayObject) {
      release || assert (!this._parent);
      this._parent = parent;
    }

    _invalidate() {
      release || assert (this._parent, "Graphics instances must have a parent.");
      this._parent._invalidateFillAndLineBounds(true, true);
      this._parent._propagateFlagsUp(DisplayObjectFlags.DirtyDescendents);
      this._isDirty = true;
    }

    _getContentBounds(includeStrokes: boolean = true): Bounds {
      return includeStrokes ? this._lineBounds : this._fillBounds;
    }

    clear(): void {
      if (this._graphicsData.isEmpty()) {
        return;
      }
      this._graphicsData.clear();
      this._textures.length = 0;
      this._fillBounds.setToSentinels();
      this._lineBounds.setToSentinels();
      this._lastX = this._lastY = 0;
      this._boundsIncludeLastCoordinates = false;
      this._invalidate();
    }

    /**
     * Sets a solid color and opacity as the fill for subsequent drawing commands.
     *
     * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/display/Graphics.html#beginFill%28%29
     * @param color
     * @param alpha While any Number is a valid input, the value is clamped to [0,1] and then scaled
     * to an integer in the interval [0,0xff].
     */
    beginFill(color: number /*uint*/, alpha: number = 1): void {
      color = color >>> 0 & 0xffffff;
      alpha = Math.round(clamp(+alpha, -1, 1) * 0xff) | 0;
      this._graphicsData.beginFill((color << 8) | alpha);
    }

    beginGradientFill(type: string, colors: ASArray, alphas: ASArray, ratios: ASArray,
                      matrix: flash.geom.Matrix = null, spreadMethod: string = "pad",
                      interpolationMethod: string = "rgb", focalPointRatio: number = 0): void
    {
      this._writeGradientStyle(PathCommand.BeginGradientFill, type, colors, alphas, ratios, matrix,
                              spreadMethod, interpolationMethod, focalPointRatio, false);
    }

    beginBitmapFill(bitmap: flash.display.BitmapData, matrix: flash.geom.Matrix = null,
                    repeat: boolean = true, smooth: boolean = false): void
    {
      this._writeBitmapStyle(PathCommand.BeginBitmapFill, bitmap, matrix, repeat, smooth, false);
    }

    endFill(): void {
      this._graphicsData.endFill();
    }

//    beginShaderFill(shader: flash.display.Shader, matrix: flash.geom.Matrix = null): void {
//      //shader = shader; matrix = matrix;
//      release || notImplemented("public flash.display.Graphics::beginShaderFill"); return;
//    }

    lineStyle(thickness: number, color: number /*uint*/ = 0, alpha: number = 1,
              pixelHinting: boolean = false, scaleMode: string = "normal", caps: string = null,
              joints: string = null, miterLimit: number = 3): void
    {
      thickness = +thickness;
      color = color >>> 0 & 0xffffff;
      alpha = Math.round(clamp(+alpha, -1, 1) * 0xff);
      pixelHinting = !!pixelHinting;
      scaleMode = axCoerceString(scaleMode);
      caps = axCoerceString(caps);
      joints = axCoerceString(joints);
      miterLimit = clamp(+miterLimit | 0, 0, 0xff);

      // Flash stops drawing strokes whenever a thickness is supplied that can't be coerced to a
      // number.
      if (isNaN(thickness)) {
        this._setStrokeWidth(0);
        this._graphicsData.endLine();
        return;
      }
      thickness = clamp(+thickness, 0, 0xff) * 20 | 0;
      this._setStrokeWidth(thickness);

      // If `scaleMode` is invalid, "normal" is used.
      var lineScaleMode = LineScaleMode.toNumber(axCoerceString(scaleMode));
      if (lineScaleMode < 0) {
        lineScaleMode = LineScaleMode.toNumber(LineScaleMode.NORMAL);
      }

      // If `caps` is invalid, "normal" is used.
      var capsStyle = CapsStyle.toNumber(axCoerceString(caps));
      if (capsStyle < 0) {
        capsStyle = CapsStyle.toNumber(CapsStyle.ROUND);
      }

      // If `joints` is invalid, "normal" is used.
      var jointStyle = JointStyle.toNumber(axCoerceString(joints));
      if (jointStyle < 0) {
        jointStyle = JointStyle.toNumber(JointStyle.ROUND);
      }

      this._graphicsData.lineStyle(thickness, (color << 8) | alpha, pixelHinting,
                                   lineScaleMode, capsStyle, jointStyle, miterLimit);
    }

    lineGradientStyle(type: string, colors: ASArray, alphas: ASArray, ratios: ASArray,
                      matrix: flash.geom.Matrix = null, spreadMethod: string = "pad",
                      interpolationMethod: string = "rgb", focalPointRatio: number = 0): void
    {
      this._writeGradientStyle(PathCommand.LineStyleGradient, type, colors, alphas, ratios, matrix,
                              spreadMethod, interpolationMethod, focalPointRatio,
                              !this._graphicsData.hasLines);
    }

    lineBitmapStyle(bitmap: flash.display.BitmapData, matrix: flash.geom.Matrix = null,
                    repeat: boolean = true, smooth: boolean = false): void
    {
      this._writeBitmapStyle(PathCommand.LineStyleBitmap, bitmap, matrix, repeat, smooth,
                             !this._graphicsData.hasLines);
    }

    drawRect(x: number, y: number, width: number, height: number): void {
      x = x * 20 | 0;
      y = y * 20 | 0;
      var x2 = x + (width * 20 | 0);
      var y2 = y + (height * 20 | 0);

      if (x !== this._lastX || y !== this._lastY) {
        this._graphicsData.moveTo(x, y);
      }
      this._graphicsData.lineTo(x2, y);
      this._graphicsData.lineTo(x2, y2);
      this._graphicsData.lineTo(x, y2);
      this._graphicsData.lineTo(x, y);

      this._extendBoundsByPoint(x2, y2);
      this._applyLastCoordinates(x, y);

      this._invalidate();
    }

    drawRoundRect(x: number, y: number, width: number, height: number, ellipseWidth: number,
                  ellipseHeight: number): void
    {
      x = +x;
      y = +y;
      width = +width;
      height = +height;
      ellipseWidth = +ellipseWidth;
      ellipseHeight = +ellipseHeight;

      if (!ellipseHeight || !ellipseWidth) {
        this.drawRect(x, y, width, height);
        return;
      }

      var radiusX = (ellipseWidth / 2) | 0;
      var radiusY = (ellipseHeight / 2) | 0;
      var hw = width / 2;
      var hh = height / 2;
      if (radiusX > hw) {
        radiusX = hw;
      }
      if (radiusY > hh) {
        radiusY = hh;
      }
      if (hw === radiusX && hh === radiusY) {
        if (radiusX === radiusY) {
          this.drawCircle(x + radiusX, y + radiusY, radiusX);
        } else {
          this.drawEllipse(x, y, radiusX * 2, radiusY * 2);
        }
        return;
      }

      //    A-----B
      //  H         C
      //  G         D
      //    F-----E
      //
      // Drawing starts and stops at `D`. This is visible when the drawn shape forms part of a
      // larger shape, with which it is then connected at `D`.
      var right = x + width;
      var bottom = y + height;
      var xlw = x + radiusX;
      var xrw = right - radiusX;
      var ytw = y + radiusY;
      var ybw = bottom - radiusY;
      this.moveTo(right, ybw);
      this.curveTo(right, bottom, xrw, bottom);
      this.lineTo(xlw, bottom);
      this.curveTo(x, bottom, x, ybw);
      this.lineTo(x, ytw);
      this.curveTo(x, y, xlw, y);
      this.lineTo(xrw, y);
      this.curveTo(right, y, right, ytw);
      this.lineTo(right, ybw);
    }

    drawRoundRectComplex(x: number, y: number, width: number, height: number,
                         topLeftRadius: number, topRightRadius: number,
                         bottomLeftRadius: number,
                         bottomRightRadius: number): void
    {
      x = +x;
      y = +y;
      width = +width;
      height = +height;
      topLeftRadius = +topLeftRadius;
      topRightRadius = +topRightRadius;
      bottomLeftRadius = +bottomLeftRadius;
      bottomRightRadius = +bottomRightRadius;

      if (!(topLeftRadius | topRightRadius | bottomLeftRadius | bottomRightRadius)) {
        this.drawRect(x, y, width, height);
        return;
      }

      var right = x + width;
      var bottom = y + height;
      var xtl = x + topLeftRadius;
      this.moveTo(right, bottom - bottomRightRadius);
      this.curveTo(right, bottom, right - bottomRightRadius, bottom);
      this.lineTo(x + bottomLeftRadius, bottom);
      this.curveTo(x, bottom, x, bottom - bottomLeftRadius);
      this.lineTo(x, y + topLeftRadius);
      this.curveTo(x, y, xtl, y);
      this.lineTo(right - topRightRadius, y);
      this.curveTo(right, y, right, y + topRightRadius);
      this.lineTo(right, bottom - bottomRightRadius);
    }

    drawCircle(x: number, y: number, radius: number): void {
      // TODO: Implement these using arcs not ellipses. The latter is not
      // visually correct when the stroke is very thick and the circle is
      // very small.
      radius = +radius;
      this.drawEllipse(+x - radius, +y - radius, radius * 2, radius * 2);
    }

    /**
     * Here x and y are the top-left coordinates of the bounding box of the
     * ellipse not the center as is the case for circles.
     */
    drawEllipse(x: number, y: number, width: number, height: number): void {
      x = +x;
      y = +y;
      width = +width;
      height = +height;

      /*
       *          , - ~ 3 ~ - ,
       *      , '               ' ,
       *    ,                       ,
       *   ,                         ,
       *  ,                           ,
       *  2             o             0
       *  ,                           ,
       *   ,                         ,
       *    ,                       ,
       *      ,                  , '
       *        ' - , _ 1 _ ,  '
       */

      var rx = width / 2;
      var ry = height / 2;
      // Move x, y to the middle of the ellipse.
      x += rx;
      y += ry;
      var currentX = x + rx;
      var currentY = y;
      this.moveTo(currentX, currentY); // 0
      var startAngle = 0;
      var u = 1;
      var v = 0;
      for (var i = 0; i < 4; i++) {
        var endAngle = startAngle + Math.PI / 2;
        var kappa = (4 / 3) * Math.tan((endAngle - startAngle) / 4);
        var cp1x = currentX - v * kappa * rx;
        var cp1y = currentY + u * kappa * ry;
        u = Math.cos(endAngle);
        v = Math.sin(endAngle);
        currentX = x + u * rx;
        currentY = y + v * ry;
        var cp2x = currentX + v * kappa * rx;
        var cp2y = currentY - u * kappa * ry;
        this.cubicCurveTo(
          cp1x,
          cp1y,
          cp2x,
          cp2y,
          currentX,
          currentY
        );
        startAngle = endAngle;
      }
    }

    moveTo(x: number, y: number): void {
      x = x * 20 | 0;
      y = y * 20 | 0;

      this._graphicsData.moveTo(x, y);
      // Don't use _applyLastCoordinates because that extends the bounds objects, too.
      this._lastX = x;
      this._lastY = y;
      this._boundsIncludeLastCoordinates = false;
    }

    lineTo(x: number, y: number): void {
      x = x * 20 | 0;
      y = y * 20 | 0;

      this._graphicsData.lineTo(x, y);
      this._applyLastCoordinates(x, y);
      this._invalidate();
    }

    curveTo(controlX: number, controlY: number, anchorX: number, anchorY: number): void {
      controlX = controlX * 20 | 0;
      controlY = controlY * 20 | 0;
      anchorX = anchorX * 20 | 0;
      anchorY = anchorY * 20 | 0;

      this._graphicsData.curveTo(controlX, controlY, anchorX, anchorY);

      if (controlX < this._lastX || controlX > anchorX) {
        this._extendBoundsByX(quadraticBezierExtreme(this._lastX, controlX, anchorX) | 0);
      }
      if (controlY < this._lastY || controlY > anchorY) {
        this._extendBoundsByY(quadraticBezierExtreme(this._lastY, controlY, anchorY) | 0);
      }
      this._applyLastCoordinates(anchorX, anchorY);

      this._invalidate();
    }

    cubicCurveTo(controlX1: number, controlY1: number, controlX2: number, controlY2: number,
                 anchorX: number, anchorY: number): void
    {
      controlX1 = controlX1 * 20 | 0;
      controlY1 = controlY1 * 20 | 0;
      controlX2 = controlX2 * 20 | 0;
      controlY2 = controlY2 * 20 | 0;
      anchorX = anchorX * 20 | 0;
      anchorY = anchorY * 20 | 0;

      this._graphicsData.cubicCurveTo(controlX1, controlY1, controlX2, controlY2, anchorX, anchorY);

      var extremes;
      var i;
      var fromX = this._lastX;
      var fromY = this._lastY;
      if (controlX1 < fromX || controlX2 < fromX || controlX1 > anchorX || controlX2 > anchorX) {
        extremes = cubicBezierExtremes(fromX, controlX1, controlX2, anchorX);
        for (i = extremes.length; i--; ) {
          this._extendBoundsByX(extremes[i] | 0);
        }
      }
      if (controlY1 < fromY || controlY2 < fromY || controlY1 > anchorY || controlY2 > anchorY) {
        extremes = cubicBezierExtremes(fromY, controlY1, controlY2, anchorY);
        for (i = extremes.length; i--; ) {
          this._extendBoundsByY(extremes[i] | 0);
        }
      }
      this._applyLastCoordinates(anchorX, anchorY);

      this._invalidate();
    }

    copyFrom(sourceGraphics: flash.display.Graphics): void {
      this._graphicsData = sourceGraphics._graphicsData.clone();
      this._fillBounds = sourceGraphics._fillBounds.clone();
      this._lineBounds = sourceGraphics._lineBounds.clone();
      this._textures = sourceGraphics._textures.concat();
      this._lastX = sourceGraphics._lastX;
      this._lastY = sourceGraphics._lastY;
      this._boundsIncludeLastCoordinates = sourceGraphics._boundsIncludeLastCoordinates;
      this._invalidate();
    }

//    lineShaderStyle(shader: flash.display.Shader, matrix: flash.geom.Matrix = null): void {
//      //shader = shader; matrix = matrix;
//      release || notImplemented("public flash.display.Graphics::lineShaderStyle"); return;
//    }
    drawPath(commands: GenericVector, data: GenericVector, winding: string = "evenOdd"): void {
      commands = commands;
      data = data;
      winding = axCoerceString(winding);
      release || notImplemented("public flash.display.Graphics::drawPath");
      return;
    }

    drawTriangles(vertices: GenericVector, indices: GenericVector = null,
                  uvtData: GenericVector = null, culling: string = "none"): void {
      vertices = vertices;
      indices = indices;
      uvtData = uvtData;
      culling = axCoerceString(culling);
      release || notImplemented("public flash.display.Graphics::drawTriangles");
      return;
    }

    drawGraphicsData(graphicsData: GenericVector): void {
      graphicsData = graphicsData;
      release || notImplemented("public flash.display.Graphics::drawGraphicsData");
      return;
    }

    /**
     * Tests if the specified point is within this graphics path.
     */
    _containsPoint(x: number, y: number, includeLines: boolean, ratio: number): boolean {
      var hasLines = this._graphicsData.hasLines;
      if (!ratio && !(includeLines && hasLines ? this._lineBounds : this._fillBounds).contains(x, y)) {
        return false;
      }

//      enterTimeline("Graphics._containsPoint");
      var containsPoint = false;

      // If we have any fills at all, tt's vastly more likely that the point is in a fill,
      // so test that first.
      if (this._graphicsData.hasFills) {
        containsPoint = this._fillContainsPoint(x, y, ratio);
      } else {
        release || assert(hasLines, "Can't have non-empty bounds without line or fill set.");
      }
      if (!containsPoint && includeLines) {
        containsPoint = this._linesContainsPoint(x, y, ratio);
      }
//      leaveTimeline();
      return containsPoint;
    }

    private _fillContainsPoint(x: number, y: number, ratio: number): boolean {
//      enterTimeline("Graphics._fillContainsPoint");

      var data = this._graphicsData;
      var commands = data.commands;
      var commandsCount = data.commandsPosition;
      var coordinates = data.coordinates;
      var morphCoordinates = data.morphCoordinates;
      var coordinatesIndex = 0;
      var fromX = 0;
      var fromY = 0;
      var toX = 0;
      var toY = 0;
      var cpX: number;
      var cpY: number;
      var formOpen = false;
      var fillActive = false;
      var formOpenX = 0;
      var formOpenY = 0;
      var inside = false;
      // Description of serialization format can be found in ShapeData.
      // Rough outline of the algorithm's mode of operation:
      // from x,y an infinite ray to the right is "cast". All operations are then
      // tested for intersections with this ray, where each intersection means
      // switching between being outside and inside the shape.
      for (var commandIndex = 0; commandIndex < commandsCount; commandIndex++) {
        var command = commands[commandIndex];
        switch (command) {
          case PathCommand.MoveTo:
            release || assert(coordinatesIndex <= data.coordinatesPosition - 2);
            if (formOpen && fillActive &&
                rayIntersectsLine(x, y, fromX, fromY, formOpenX, formOpenY)) {
              inside = !inside;
            }
            formOpen = true;
            fromX = formOpenX = coordinates[coordinatesIndex++];
            fromY = formOpenY = coordinates[coordinatesIndex++];
            if (ratio) {
              fromX = formOpenX += (morphCoordinates[coordinatesIndex - 2] - formOpenX) * ratio;
              fromY = formOpenY += (morphCoordinates[coordinatesIndex - 2] - formOpenY) * ratio;
            }
            // Continue outer loop.
            continue;
          case PathCommand.LineTo:
            release || assert(coordinatesIndex <= data.coordinatesPosition - 2);
            toX = coordinates[coordinatesIndex++];
            toY = coordinates[coordinatesIndex++];
            if (ratio) {
              toX += (morphCoordinates[coordinatesIndex - 2] - toX) * ratio;
              toY += (morphCoordinates[coordinatesIndex - 1] - toY) * ratio;
            }
            if (fillActive && rayIntersectsLine(x, y, fromX, fromY, toX, toY)) {
              inside = !inside;
            }
            break;
          case PathCommand.CurveTo:
            release || assert(coordinatesIndex <= data.coordinatesPosition - 4);
            cpX = coordinates[coordinatesIndex++];
            cpY = coordinates[coordinatesIndex++];
            toX = coordinates[coordinatesIndex++];
            toY = coordinates[coordinatesIndex++];
            if (ratio) {
              cpX += (morphCoordinates[coordinatesIndex - 4] - cpX) * ratio;
              cpY += (morphCoordinates[coordinatesIndex - 3] - cpY) * ratio;
              toX += (morphCoordinates[coordinatesIndex - 2] - toX) * ratio;
              toY += (morphCoordinates[coordinatesIndex - 1] - toY) * ratio;
            }
            if (fillActive && rayFullyCrossesCurve(x, y, fromX, fromY, cpX, cpY, toX, toY)) {
              inside = !inside;
            }
            break;
          case PathCommand.CubicCurveTo:
            release || assert(coordinatesIndex <= data.coordinatesPosition - 6);
            cpX = coordinates[coordinatesIndex++];
            cpY = coordinates[coordinatesIndex++];
            var cp2X = coordinates[coordinatesIndex++];
            var cp2Y = coordinates[coordinatesIndex++];
            toX = coordinates[coordinatesIndex++];
            toY = coordinates[coordinatesIndex++];
            if (ratio) {
              cpX += (morphCoordinates[coordinatesIndex - 6] - cpX) * ratio;
              cpY += (morphCoordinates[coordinatesIndex - 5] - cpY) * ratio;
              cp2X += (morphCoordinates[coordinatesIndex - 4] - cp2X) * ratio;
              cp2Y += (morphCoordinates[coordinatesIndex - 3] - cp2Y) * ratio;
              toX += (morphCoordinates[coordinatesIndex - 2] - toX) * ratio;
              toY += (morphCoordinates[coordinatesIndex - 1] - toY) * ratio;
            }
            if (fillActive &&
                rayFullyCrossesCubicCurve(x, y, fromX, fromY, cpX, cpY, cp2X, cp2Y, toX, toY)) {
              inside = !inside;
            }
            break;
          case PathCommand.BeginSolidFill:
          case PathCommand.BeginGradientFill:
          case PathCommand.BeginBitmapFill:
          case PathCommand.EndFill:
            if (formOpen && fillActive &&
                rayIntersectsLine(x, y, fromX, fromY, formOpenX, formOpenY)) {
              inside = !inside;
            }
            // If we close a sub-shape, we can return earlier if our point was inside of its path.
            if (inside) {
              return true;
            }
            formOpen = false;
            fillActive = command !== PathCommand.EndFill;
            break;
          case PathCommand.LineStyleSolid:
            coordinatesIndex++; // Skip thickness
            break;
          case PathCommand.LineStyleGradient:
          case PathCommand.LineStyleBitmap:
          case PathCommand.LineEnd:
            break;
          default:
            release || assertUnreachable('Invalid command ' + command + ' encountered at index' +
                              (commandIndex - 1) + ' of ' + commandsCount);
        }
        fromX = toX;
        fromY = toY;
      }
      release || assert(commandIndex === commandsCount);
      release || assert(coordinatesIndex === data.coordinatesPosition);
      if (formOpen && fillActive &&
          rayIntersectsLine(x, y, fromX, fromY, formOpenX, formOpenY)) {
        inside = !inside;
      }
//      leaveTimeline();
      return inside;
    }

    private _linesContainsPoint(x: number, y: number, ratio: number): boolean {
//      enterTimeline("Graphics._lineContainsPoint");

      var data = this._graphicsData;
      var commands = data.commands;
      var commandsCount = data.commandsPosition;
      var coordinates = data.coordinates;
      var morphCoordinates = data.morphCoordinates;
      var coordinatesIndex = 0;
      var fromX = 0;
      var fromY = 0;
      var toX = 0;
      var toY = 0;
      var cpX: number;
      var cpY: number;
      var curveX: number;
      var curveY: number;
      var t: number;

      var width = 0;
      var halfWidth = 0;
      var halfWidthSq = 0;
      var minX = 0;
      var maxX = 0;
      var minY = 0;
      var maxY = 0;

      // Description of serialization format can be found in ShapeData.
      for (var commandIndex = 0; commandIndex < commandsCount; commandIndex++) {
        var command = commands[commandIndex];
        switch (command) {
          case PathCommand.MoveTo:
            release || assert(coordinatesIndex <= data.coordinatesPosition - 2);
            fromX = coordinates[coordinatesIndex++];
            fromY = coordinates[coordinatesIndex++];
            if (ratio) {
              fromX += (morphCoordinates[coordinatesIndex - 2] - fromX) * ratio;
              fromY += (morphCoordinates[coordinatesIndex - 1] - fromY) * ratio;
            }
            // Continue outer loop.
            continue;
          case PathCommand.LineTo:
            release || assert(coordinatesIndex <= data.coordinatesPosition - 2);
            if (width === 0) {
              fromX = coordinates[coordinatesIndex++];
              fromY = coordinates[coordinatesIndex++];
              if (ratio) {
                fromX += (morphCoordinates[coordinatesIndex - 2] - fromX) * ratio;
                fromY += (morphCoordinates[coordinatesIndex - 1] - fromY) * ratio;
              }
              continue;
            }
            toX = coordinates[coordinatesIndex++];
            toY = coordinates[coordinatesIndex++];
            if (ratio) {
              toX += (morphCoordinates[coordinatesIndex - 2] - toX) * ratio;
              toY += (morphCoordinates[coordinatesIndex - 1] - toY) * ratio;
            }
            // Lines with length == 0 aren't rendered.
            if (fromX === toX && fromY === toY) {
              break;
            }
            // Eliminate based on bounds.
            if (maxX < fromX && maxX < toX || minX > fromX && minX > toX ||
                maxY < fromY && maxY < toY || minY > fromY && minY > toY) {
              break;
            }
            // Vertical and horizontal lines are a certain hit at this point
            if (toX === fromX || toY === fromY) {
              return true;
            }
            // http://stackoverflow.com/a/1501725/517791
            t = ((x - fromX) * (toX - fromX) + (y - fromY) * (toY - fromY)) /
                distanceSq(fromX, fromY, toX, toY);
            if (t < 0) {
              if (distanceSq(x, y, fromX, fromY) <= halfWidthSq) {
                return true;
              }
              break;
            }
            if (t > 1) {
              if (distanceSq(x, y, toX, toY) <= halfWidthSq) {
                return true;
              }
              break;
            }
            if (distanceSq(x, y, fromX + t * (toX - fromX),
                           fromY + t * (toY - fromY)) <= halfWidthSq) {
              return true;
            }
            break;
          case PathCommand.CurveTo:
            release || assert(coordinatesIndex <= data.coordinatesPosition - 4);
            if (width === 0) {
              coordinatesIndex += 2;
              fromX = coordinates[coordinatesIndex++];
              fromY = coordinates[coordinatesIndex++];
              if (ratio) {
                fromX += (morphCoordinates[coordinatesIndex - 2] - fromX) * ratio;
                fromY += (morphCoordinates[coordinatesIndex - 1] - fromY) * ratio;
              }
              continue;
            }
            cpX = coordinates[coordinatesIndex++];
            cpY = coordinates[coordinatesIndex++];
            toX = coordinates[coordinatesIndex++];
            toY = coordinates[coordinatesIndex++];
            if (ratio) {
              cpX += (morphCoordinates[coordinatesIndex - 4] - cpX) * ratio;
              cpY += (morphCoordinates[coordinatesIndex - 3] - cpY) * ratio;
              toX += (morphCoordinates[coordinatesIndex - 2] - toX) * ratio;
              toY += (morphCoordinates[coordinatesIndex - 1] - toY) * ratio;
            }
            // Eliminate based on bounds
            var extremeX = quadraticBezierExtreme(fromX, cpX, toX);
            if (maxX < fromX && maxX < extremeX && maxX < toX ||
                minX > fromX && minX > extremeX && minX > toX) {
              break;
            }
            var extremeY = quadraticBezierExtreme(fromY, cpY, toY);
            if (maxY < fromY && maxY < extremeY && maxY < toY ||
                minY > fromY && minY > extremeY && minY > toY) {
              break;
            }
            // So, this is very much not ideal, but I'll punt on proper curve
            // hit-testing for now and just sample an amount of points that seems
            // sufficient.
            for (t = 0; t < 1; t += 0.02) {
              curveX = quadraticBezier(fromX, cpX, toX, t);
              if (curveX < minX || curveX > maxX) {
                continue;
              }
              curveY = quadraticBezier(fromY, cpY, toY, t);
              if (curveY < minY || curveY > maxY) {
                continue;
              }
              if ((x - curveX) * (x - curveX) + (y - curveY) * (y - curveY) < halfWidthSq) {
                return true;
              }
            }
            break;
          case PathCommand.CubicCurveTo:
            release || assert(coordinatesIndex <= data.coordinatesPosition - 6);
            if (width === 0) {
              coordinatesIndex += 4;
              fromX = coordinates[coordinatesIndex++];
              fromX = coordinates[coordinatesIndex++];
              if (ratio) {
                fromX += (morphCoordinates[coordinatesIndex - 2] - fromX) * ratio;
                fromY += (morphCoordinates[coordinatesIndex - 1] - fromY) * ratio;
              }
              continue;
            }
            cpX = coordinates[coordinatesIndex++];
            cpY = coordinates[coordinatesIndex++];
            var cp2X = coordinates[coordinatesIndex++];
            var cp2Y = coordinates[coordinatesIndex++];
            toX = coordinates[coordinatesIndex++];
            toY = coordinates[coordinatesIndex++];
            if (ratio) {
              cpX += (morphCoordinates[coordinatesIndex - 6] - cpX) * ratio;
              cpY += (morphCoordinates[coordinatesIndex - 5] - cpY) * ratio;
              cp2X += (morphCoordinates[coordinatesIndex - 4] - cp2X) * ratio;
              cp2Y += (morphCoordinates[coordinatesIndex - 3] - cp2Y) * ratio;
              toX += (morphCoordinates[coordinatesIndex - 2] - toX) * ratio;
              toY += (morphCoordinates[coordinatesIndex - 1] - toY) * ratio;
            }
            // Eliminate based on bounds
            var extremesX = cubicBezierExtremes(fromX, cpX, cp2X, toX);
            while (extremesX.length < 2) {
              extremesX.push(toX);
            }
            if (maxX < fromX && maxX < toX && maxX < extremesX[0] &&
                maxX < extremesX[1] ||
                minX > fromX && minX > toX && minX > extremesX[0] &&
                minX > extremesX[1]) {
              break;
            }
            var extremesY = cubicBezierExtremes(fromY, cpY, cp2Y, toY);
            while (extremesY.length < 2) {
              extremesY.push(toY);
            }
            if (maxY < fromY && maxY < toY && maxY < extremesY[0] &&
                maxY < extremesY[1] ||
                minY > fromY && minY > toY && minY > extremesY[0] &&
                minY > extremesY[1]) {
              break;
            }
            // So, this is very much not ideal, but I'll punt on proper curve
            // hit-testing for now and just sample an amount of points that seems
            // sufficient.
            for (t = 0; t < 1; t += 0.02) {
              curveX = cubicBezier(fromX, cpX, cp2X, toX, t);
              if (curveX < minX || curveX > maxX) {
                continue;
              }
              curveY = cubicBezier(fromY, cpY, cp2Y, toY, t);
              if (curveY < minY || curveY > maxY) {
                continue;
              }
              if ((x - curveX) * (x - curveX) + (y - curveY) * (y - curveY) < halfWidthSq) {
                return true;
              }
            }
            break;
          case PathCommand.LineStyleSolid:
            width = coordinates[coordinatesIndex++];
            if (ratio) {
              width += (morphCoordinates[coordinatesIndex - 1] - width) * ratio;
            }
            halfWidth = width >> 2;
            halfWidthSq = halfWidth * halfWidth;
            minX = x - halfWidth;
            maxX = x + halfWidth;
            minY = y - halfWidth;
            maxY = y + halfWidth;
            break;
          case PathCommand.BeginSolidFill:
          case PathCommand.BeginGradientFill:
          case PathCommand.BeginBitmapFill:
          case PathCommand.EndFill:
          case PathCommand.LineStyleGradient:
          case PathCommand.LineStyleBitmap:
          case PathCommand.LineEnd:
            break;
          default:
            release || assertUnreachable('Invalid command ' + command + ' encountered at index' +
                              (commandIndex - 1) + ' of ' + commandsCount);
        }
        fromX = toX;
        fromY = toY;
      }
      release || assert(commandIndex === commandsCount);
      release || assert(coordinatesIndex === data.coordinatesPosition);
//      leaveTimeline();
      return false;
    }

    /**
     * Bitmaps are specified the same for fills and strokes, so we only need to serialize them
     * once. The Parameter `pathCommand` is treated as the actual command to serialize, and must
     * be one of PathCommand.BeginBitmapFill and PathCommand.LineStyleBitmap.
     *
     * This method doesn't actually write anything if the `skipWrite` argument is true. In that
     * case, it only does arguments checks so the right exceptions are thrown.
     */
    private _writeBitmapStyle(pathCommand: PathCommand, bitmap: flash.display.BitmapData,
                              matrix: flash.geom.Matrix, repeat: boolean, smooth: boolean,
                              skipWrite: boolean): void
    {
      if (isNullOrUndefined(bitmap)) {
        this.sec.throwError('TypeError', Errors.NullPointerError, 'bitmap');
      }
      if (!(this.sec.flash.display.BitmapData.axIsType(bitmap))) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, 'bitmap',
                                       'flash.display.BitmapData');
      }
      if (isNullOrUndefined(matrix)) {
        matrix = this.sec.flash.geom.Matrix.axClass.FROZEN_IDENTITY_MATRIX;
      } else if (!(this.sec.flash.geom.Matrix.axIsType(matrix))) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, 'matrix',
                                       'flash.geom.Matrix');
      }
      repeat = !!repeat;
      smooth = !!smooth;

      if (skipWrite) {
        return;
      }

      var index = this._textures.length;
      this._textures.push(bitmap);
      this._graphicsData.beginBitmap(pathCommand, index, matrix, repeat, smooth);
    }

    /**
     * Gradients are specified the same for fills and strokes, so we only need to serialize them
     * once. The Parameter `pathCommand` is treated as the actual command to serialize, and must
     * be one of PathCommand.BeginGradientFill and PathCommand.LineStyleGradient.
     *
     * This method doesn't actually write anything if the `skipWrite` argument is true. In that
     * case, it only does arguments checks so the right exceptions are thrown.
     */
    private _writeGradientStyle(pathCommand: PathCommand, type: string,
                                colors_: ASArray, alphas_: ASArray, ratios_: ASArray,
                                matrix: geom.Matrix, spreadMethod: string,
                                interpolationMethod: string, focalPointRatio: number,
                                skipWrite: boolean): void
    {
      if (isNullOrUndefined(type)) {
        this.sec.throwError('TypeError', Errors.NullPointerError, 'type');
      }
      var gradientType = GradientType.toNumber(axCoerceString(type));
      if (gradientType < 0) {
        this.sec.throwError("ArgumentError", Errors.InvalidEnumError, "type");
      }

      if (isNullOrUndefined(colors_)) {
        this.sec.throwError('TypeError', Errors.NullPointerError, 'colors');
      }
      var arrayClass = this.sec.AXArray;
      if (!arrayClass.axIsInstanceOf(colors_)) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, 'colors', 'Array');
      }
      var colors: number[] = colors_.value;

      if (isNullOrUndefined(alphas_)) {
        this.sec.throwError('TypeError', Errors.NullPointerError, 'alphas');
      }
      if (!arrayClass.axIsInstanceOf(alphas_)) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, 'alphas', 'Array');
      }
      var alphas: number[] = alphas_.value;

      if (isNullOrUndefined(ratios_)) {
        this.sec.throwError('TypeError', Errors.NullPointerError, 'ratios');
      }
      if (!arrayClass.axIsInstanceOf(ratios_)) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, 'ratios', 'Array');
      }
      var ratios: number[] = ratios_.value;

      var colorsRGBA: number[] = [];
      var coercedRatios: number[] = [];
      var colorStops = colors.length;
      var recordsValid = colorStops === alphas.length && colorStops === ratios.length;
      if (recordsValid) {
        for (var i = 0; i < colorStops; i++) {
          var ratio: number = +ratios[i];
          if (ratio > 0xff || ratio < 0) {
            recordsValid = false;
            break;
          }
          colorsRGBA[i] = (colors[i] << 8 & 0xffffff00) | clamp(+alphas[i], 0, 1) * 0xff;
          coercedRatios[i] = ratio;
        }
      }
      // If the colors, alphas and ratios arrays don't all have the same length or if any of the
      // given ratios falls outside [0,0xff], Flash just ignores the gradient style.
      if (!recordsValid) {
        return;
      }

      if (isNullOrUndefined(matrix)) {
        matrix = this.sec.flash.geom.Matrix.axClass.FROZEN_IDENTITY_MATRIX;
      } else if (!(this.sec.flash.geom.Matrix.axIsType(matrix))) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, 'matrix',
                                       'flash.geom.Matrix');
      }

      if (skipWrite) {
        return;
      }

      // If `spreadMethod` is invalid, "pad" is used.
      var spread = SpreadMethod.toNumber(axCoerceString(spreadMethod));
      if (spread < 0) {
        spread = SpreadMethod.toNumber(SpreadMethod.PAD);
      }

      // If `interpolationMethod` is invalid, "rgb" is used.
      var interpolation = InterpolationMethod.toNumber(axCoerceString(interpolationMethod));
      if (interpolation < 0) {
        interpolation = InterpolationMethod.toNumber(InterpolationMethod.RGB);
      }

      // Matrix has to be transformed to ShapeMatrix because the scaling is totally different.
      var scaledMatrix = {
        a: matrix.a * 819.2, b: matrix.b * 819.2, c: matrix.c * 819.2,
        d: matrix.d * 819.2, tx: matrix.tx, ty: matrix.ty
      };
      // Focal point is scaled by 0xff, divided by 2, rounded and stored as a signed short.
      focalPointRatio = clamp(+focalPointRatio, -1, 1) / 2 * 0xff | 0;
      this._graphicsData.beginGradient(pathCommand, colorsRGBA, coercedRatios, gradientType,
                                       scaledMatrix, spread, interpolation, focalPointRatio);
    }

    private _extendBoundsByPoint(x: number, y: number): void {
      this._extendBoundsByX(x);
      this._extendBoundsByY(y);
    }

    private _extendBoundsByX(x: number): void {
      this._fillBounds.extendByX(x);

      var bounds = this._lineBounds;
      if (bounds.xMin === 0x8000000) {
        bounds.xMin = x - this._topLeftStrokeWidth;
        bounds.xMax = x + this._bottomRightStrokeWidth;
      } else {
        bounds.xMin = Math.min(x - this._topLeftStrokeWidth, bounds.xMin);
        bounds.xMax = Math.max(x + this._bottomRightStrokeWidth, bounds.xMax);
      }
    }

    private _extendBoundsByY(y: number): void {
      this._fillBounds.extendByY(y);

      var bounds = this._lineBounds;
      if (bounds.yMin === 0x8000000) {
        bounds.yMin = y - this._topLeftStrokeWidth;
        bounds.yMax = y + this._bottomRightStrokeWidth;
      } else {
        bounds.yMin = Math.min(y - this._topLeftStrokeWidth, bounds.yMin);
        bounds.yMax = Math.max(y + this._bottomRightStrokeWidth, bounds.yMax);
      }
    }

    private _applyLastCoordinates(x: number, y: number): void {
      if (!this._boundsIncludeLastCoordinates) {
        this._extendBoundsByPoint(this._lastX, this._lastY);
      }
      this._boundsIncludeLastCoordinates = true;
      this._lastX = x;
      this._lastY = y;
      this._extendBoundsByPoint(x, y);
    }
  }
}
