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

/**
 * Serialization format for graphics path commands:
 * (canonical, update this instead of anything else!)
 *
 * All entries begin with a byte representing the command:
 * command: byte [1-11] (i.e. one of the PathCommand enum values)
 *
 * All entries always contain all fields, default values aren't omitted.
 *
 * moveTo:
 * byte command:  PathCommand.MoveTo
 * uint x:        target x coordinate, in twips
 * uint y:        target y coordinate, in twips
 *
 * lineTo:
 * byte command:  PathCommand.LineTo
 * uint x:        target x coordinate, in twips
 * uint y:        target y coordinate, in twips
 *
 * curveTo:
 * byte command:  PathCommand.CurveTo
 * uint controlX: control point x coordinate, in twips
 * uint controlY: control point y coordinate, in twips
 * uint anchorX:  target x coordinate, in twips
 * uint anchorY:  target y coordinate, in twips
 *
 * cubicCurveTo:
 * byte command:   PathCommand.CubicCurveTo
 * uint controlX1: control point 1 x coordinate, in twips
 * uint controlY1: control point 1 y coordinate, in twips
 * uint controlX2: control point 2 x coordinate, in twips
 * uint controlY2: control point 2 y coordinate, in twips
 * uint anchorX:   target x coordinate, in twips
 * uint anchorY:   target y coordinate, in twips
 *
 * beginFill:
 * byte command:  PathCommand.BeginSolidFill
 * uint color:    [RGBA color]
 *
 * lineStyle:
 * byte command:      PathCommand.LineStyleSolid
 * byte thickness:    [0-0xff]
 * uint color:        [RGBA color]
 * byte pixelHinting: [0,1] (true,false)
 * byte scaleMode:    [0-3] see LineScaleMode.fromNumber for meaning
 * byte caps:         [0-2] see CapsStyle.fromNumber for meaning
 * byte joints:       [0-2] see JointStyle.fromNumber for meaning
 * byte miterLimit:   [0-0xff]
 *
 */

// Class: Graphics
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import throwError = Shumway.AVM2.Runtime.throwError;
  import clamp = Shumway.NumberUtilities.clamp;
  import Bounds = Shumway.Bounds;

  import DisplayObject = flash.display.DisplayObject;
  import GradientType = flash.display.GradientType;
  import SpreadMethod = flash.display.SpreadMethod;
  import InterpolationMethod = flash.display.InterpolationMethod;
  import LineScaleMode = flash.display.LineScaleMode;
  import CapsStyle = flash.display.CapsStyle;
  import JointStyle = flash.display.JointStyle;
  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
  import geom = flash.geom;
  import utils = flash.utils;

  // TODO duplicate refactor to remove duplication code from GFX geometry.ts
  //import PathCommand = Shumway.GFX.Geometry.PathCommand;
  //import quadraticBezierExtreme = Shumway.GFX.Geometry.quadraticBezierExtreme;
  //import cubicBezierExtremes = Shumway.GFX.Geometry.cubicBezierExtremes;

  export enum PathCommand {
    BeginSolidFill = 1,
    BeginGradientFill,
    BeginBitmapFill,
    EndFill,
    LineStyleSolid,
    LineStyleGradient,
    LineStyleBitmap,
    MoveTo,
    LineTo,
    CurveTo,
    CubicCurveTo,
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
      result.push(cubicBezier(from, cp, cp2, to, t1));
    }
    if (t2 >= 0 && t2 <= 1) {
      result.push(cubicBezier(from, cp, cp2, to, t2));
    }
    return result;
  }
  // end of GFX geometry.ts

  export class Graphics extends ASNative {

    /**
     * Every graphics is assigned an unique integer ID.
     */
    static _syncID = 0;

    static classInitializer: any = null;
    static initializer: any = null;

    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    constructor () {
      false && super();
      this._id = Graphics._syncID++;
      this._graphicsData = new DataBuffer();
      this._fillBounds = new Bounds(0, 0, 0, 0);
      this._lineBounds = new Bounds(0, 0, 0, 0);
      this._lastX = 0;
      this._lastY = 0;
      this._parent = null;

      this._currentStrokeWidth = 0;
    }

    getGraphicsData(): DataBuffer {
      return this._graphicsData;
    }

    // JS -> AS Bindings
    _id: number;

    // AS -> JS Bindings
    private _graphicsData: DataBuffer;
    private _lastX: number;
    private _lastY: number;

    /**
     * Fill and line state variables, in twips.
     */
    private _currentStrokeWidth: number;

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
      assert (!this._parent);
      this._parent = parent;
    }

    _invalidateParent() {
      assert (this._parent, "Graphics instances must have a parent.");
      this._parent._invalidateFillAndLineBounds();
    }

    _getContentBounds(includeStrokes: boolean = true): Bounds {
      return includeStrokes ? this._lineBounds : this._fillBounds;
    }

    clear(): void {
      this._graphicsData.length = 0;
      this._fillBounds.setEmpty();
      this._lineBounds.setEmpty();
      this._setLastCoordinates(0, 0);
      this._invalidateParent();
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
      color = color >>> 0;
      alpha = Math.round(clamp(+alpha, -1, 1) * 0xff);
      this._graphicsData.writeUnsignedByte(PathCommand.BeginSolidFill);
      this._graphicsData.writeUnsignedInt((color << 8) | alpha);
    }

    beginGradientFill(type: string, colors: any [], alphas: any [], ratios: any [],
                      matrix: flash.geom.Matrix = null, spreadMethod: string = "pad",
                      interpolationMethod: string = "rgb", focalPointRatio: number = 0): void
    {
      this._writeGradientStyle(this._graphicsData, PathCommand.BeginGradientFill, type,
                              colors, alphas, ratios, matrix,
                              spreadMethod, interpolationMethod, focalPointRatio);
    }

    beginBitmapFill(bitmap: flash.display.BitmapData, matrix: flash.geom.Matrix = null,
                    repeat: boolean = true, smooth: boolean = false): void
    {
      if (isNullOrUndefined(bitmap)) {
        throwError('TypeError', Errors.NullPointerError, 'bitmap');
      } else if (!(matrix instanceof flash.geom.Matrix)) {
        throwError('TypeError', Errors.CheckTypeFailedError, 'bitmap', 'flash.display.BitmapData');
      }
      if (isNullOrUndefined(matrix)) {
        matrix = flash.geom.Matrix.FROZEN_IDENTITY_MATRIX;
      } else if (!(matrix instanceof flash.geom.Matrix)) {
        throwError('TypeError', Errors.CheckTypeFailedError, 'matrix', 'flash.geom.Matrix');
      }
      var graphicsData = this._graphicsData;
      graphicsData.writeUnsignedByte(PathCommand.BeginBitmapFill);
      // bitmap
      matrix.writeExternal(graphicsData);
      graphicsData.writeUnsignedByte(+repeat);
      graphicsData.writeUnsignedByte(+smooth);
    }

    endFill(): void {
      this._graphicsData.writeUnsignedByte(PathCommand.EndFill);
    }

//    beginShaderFill(shader: flash.display.Shader, matrix: flash.geom.Matrix = null): void {
//      //shader = shader; matrix = matrix;
//      notImplemented("public flash.display.Graphics::beginShaderFill"); return;
//    }

    lineStyle(thickness: number, color: number /*uint*/ = 0, alpha: number = 1,
              pixelHinting: boolean = false, scaleMode: string = "normal", caps: string = null,
              joints: string = null, miterLimit: number = 3): void
    {
      thickness = clamp(thickness|0, 0, 0xff);
      color = color >>> 0;
      alpha = Math.round(clamp(+alpha, -1, 1) * 0xff);
      pixelHinting = !!pixelHinting;
      scaleMode = asCoerceString(scaleMode);
      caps = asCoerceString(caps);
      joints = asCoerceString(joints);
      miterLimit = clamp(+miterLimit|0, 0, 0xff);

      this._currentStrokeWidth = thickness * 20|0;

      var graphicsData = this._graphicsData;
      graphicsData.writeUnsignedByte(PathCommand.LineStyleSolid);
      graphicsData.writeUnsignedByte(thickness);
      graphicsData.writeUnsignedInt((color << 8) | alpha);
      graphicsData.writeBoolean(pixelHinting);

      // If `scaleMode` is invalid, "normal" is used.
      var lineScaleMode = LineScaleMode.toNumber(asCoerceString(scaleMode));
      if (lineScaleMode < 0) {
        lineScaleMode = LineScaleMode.toNumber(LineScaleMode.NORMAL);
      }
      graphicsData.writeUnsignedByte(lineScaleMode);

      // If `caps` is invalid, "normal" is used.
      var capsStyle = CapsStyle.toNumber(asCoerceString(caps));
      if (capsStyle < 0) {
        capsStyle = CapsStyle.toNumber(CapsStyle.ROUND);
      }
      graphicsData.writeUnsignedByte(capsStyle);

      // If `joints` is invalid, "normal" is used.
      var jointStyle = JointStyle.toNumber(asCoerceString(joints));
      if (jointStyle < 0) {
        jointStyle = JointStyle.toNumber(JointStyle.ROUND);
      }
      graphicsData.writeUnsignedByte(jointStyle);

      graphicsData.writeUnsignedByte(miterLimit);
    }

    lineGradientStyle(type: string, colors: any [], alphas: any [], ratios: any [],
                      matrix: flash.geom.Matrix = null, spreadMethod: string = "pad",
                      interpolationMethod: string = "rgb", focalPointRatio: number = 0): void
    {
      this._writeGradientStyle(this._graphicsData, PathCommand.LineStyleGradient, type,
                              colors, alphas, ratios, matrix,
                              spreadMethod, interpolationMethod, focalPointRatio);
    }

    lineBitmapStyle(bitmap: flash.display.BitmapData, matrix: flash.geom.Matrix = null,
                    repeat: boolean = true, smooth: boolean = false): void {
      //bitmap = bitmap; matrix = matrix;
      //this._closePath();
      //var fill = this._graphicsData.push(new GraphicsBitmapFill(bitmap, matrix, !!repeat, !!smooth));
      // TODO
    }

    drawRect(x: number, y: number, width: number, height: number): void {
      x = x * 20|0;
      y = y * 20|0;
      var x2 = x + (width * 20|0);
      var y2 = y + (height * 20|0);

      if (x !== this._lastX || y !== this._lastY) {
        this._graphicsData.writeUnsignedByte(PathCommand.MoveTo);
        this._writeCoordinates(x, y);
      }
      this._graphicsData.writeUnsignedByte(PathCommand.LineTo);
      this._writeCoordinates(x2, y);
      this._graphicsData.writeUnsignedByte(PathCommand.LineTo);
      this._writeCoordinates(x2, y2);
      this._graphicsData.writeUnsignedByte(PathCommand.LineTo);
      this._writeCoordinates(x, y2);
      this._graphicsData.writeUnsignedByte(PathCommand.LineTo);
      this._writeCoordinates(x, y);
      this._setLastCoordinates(x, y);

      this._extendBoundsByPoint(x, y);
      this._extendBoundsByPoint(x2, y2);

      this._invalidateParent();
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
      x = x * 20|0;
      y = y * 20|0;

      this._graphicsData.writeUnsignedByte(PathCommand.MoveTo);
      this._writeCoordinates(x, y);
      this._setLastCoordinates(x, y);

      this._extendBoundsByPoint(x, y);

      this._invalidateParent();
    }

    lineTo(x: number, y: number): void {
      x = x * 20|0;
      y = y * 20|0;

      this._graphicsData.writeUnsignedByte(PathCommand.LineTo);
      this._writeCoordinates(x, y);
      this._setLastCoordinates(x, y);

      this._extendBoundsByPoint(x, y);

      this._invalidateParent();
    }

    curveTo(controlX: number, controlY: number, anchorX: number, anchorY: number): void {
      controlX = controlX * 20|0;
      controlY = controlY * 20|0;
      anchorX = anchorX * 20|0;
      anchorY = anchorY * 20|0;

      this._graphicsData.writeUnsignedByte(PathCommand.CurveTo);
      this._writeCoordinates(controlX, controlY);
      this._writeCoordinates(anchorX, anchorY);
      this._setLastCoordinates(anchorX, anchorY);

      this._extendBoundsByPoint(anchorX, anchorY);
      if (controlX < this._lastX || controlX > anchorX) {
        this._extendBoundsByX(quadraticBezierExtreme(this._lastX, controlX, anchorX)|0);
      }
      if (controlY < this._lastY || controlY > anchorY) {
        this._extendBoundsByY(quadraticBezierExtreme(this._lastY, controlY, anchorY)|0);
      }

      this._invalidateParent();
    }

    cubicCurveTo(controlX1: number, controlY1: number, controlX2: number, controlY2: number,
                 anchorX: number, anchorY: number): void
    {
      controlX1 = controlX1 * 20|0;
      controlY1 = controlY1 * 20|0;
      controlX2 = controlX2 * 20|0;
      controlY2 = controlY2 * 20|0;
      anchorX = anchorX * 20|0;
      anchorY = anchorY * 20|0;



      this._graphicsData.writeUnsignedByte(PathCommand.CubicCurveTo);
      this._writeCoordinates(controlX1, controlY1);
      this._writeCoordinates(controlX2, controlY2);
      this._writeCoordinates(anchorX, anchorY);
      this._setLastCoordinates(anchorX, anchorY);

      this._extendBoundsByPoint(anchorX, anchorY);
      var extremes;
      var i;
      var fromX = this._lastX;
      var fromY = this._lastY;
      if (controlX1 < fromX || controlX2 < fromX || controlX1 > anchorX || controlX2 > anchorX) {
        extremes = cubicBezierExtremes(fromX, controlX1, controlX2, anchorX);
        for (i = extremes.length; i--;) {
          this._extendBoundsByX(extremes[i]|0);
        }
      }
      if (controlY1 < fromY || controlY2 < fromY || controlY1 > anchorY || controlY2 > anchorY) {
        extremes = cubicBezierExtremes(fromY, controlY1, controlY2, anchorY);
        for (i = extremes.length; i--;) {
          this._extendBoundsByY(extremes[i]|0);
        }
      }

      this._invalidateParent();
    }

    copyFrom(sourceGraphics: flash.display.Graphics): void {
      var graphicsData = this._graphicsData;
      graphicsData.position = 0;
      graphicsData.length = sourceGraphics._graphicsData.length;
      graphicsData.writeBytes(sourceGraphics._graphicsData, 0);
      this._invalidateParent();
    }

//    lineShaderStyle(shader: flash.display.Shader, matrix: flash.geom.Matrix = null): void {
//      //shader = shader; matrix = matrix;
//      notImplemented("public flash.display.Graphics::lineShaderStyle"); return;
//    }
    drawPath(commands: ASVector<any>, data: ASVector<any>, winding: string = "evenOdd"): void {
      commands = commands;
      data = data;
      winding = asCoerceString(winding);
      notImplemented("public flash.display.Graphics::drawPath");
      return;
    }

    drawTriangles(vertices: ASVector<any>, indices: ASVector<any> = null,
                  uvtData: ASVector<any> = null, culling: string = "none"): void {
      vertices = vertices;
      indices = indices;
      uvtData = uvtData;
      culling = asCoerceString(culling);
      notImplemented("public flash.display.Graphics::drawTriangles");
      return;
    }

    drawGraphicsData(graphicsData: ASVector<any>): void {
      graphicsData = graphicsData;
      notImplemented("public flash.display.Graphics::drawGraphicsData");
      return;
    }

    /**
     * Tests if the specified point is within this graphics path.
     */
    _containsPoint(point: flash.geom.Point, includeStrokes: boolean = false): boolean {
      // TODO: Implement this in a smart way.
      return this._lineBounds.contains(point.x, point.y);

//      var paths = this._paths;
//      for (var i = 0; i < paths.length; i++) {
//        var path = paths[i];
//        if (path.isPointInPath(point.x, point.y)) {
//          return true;
//        }
//
//        if (path.strokeStyle) {
//          var strokePath = path._strokePath;
//          if (!strokePath) {
//            strokePath = path.strokePath(path.drawingStyles);
//            path._strokePath = strokePath;
//          }
//
//          if (strokePath.isPointInPath(point.x, point.y)) {
//            return true;
//          }
//        }
//      }
    }

    /**
     * Gradients are specified the same for fills and strokes, so we only need to serialize them
     * once. The Parameter `pathCommand` is treated as the actual command to serialize, and must
     * be one of PATH_COMMAND_BEGIN_GRADIENT_FILL and PATH_COMMAND_LINE_STYLE_GRADIENT.
     */
    private _writeGradientStyle(output: DataBuffer, pathCommand: number, type: string,
                               colors: any [], alphas: any [], ratios: any [],
                               matrix: flash.geom.Matrix = null, spreadMethod: string = "pad",
                               interpolationMethod: string = "rgb",
                               focalPointRatio: number = 0): void
    {
      assert(pathCommand === PathCommand.BeginGradientFill ||
             pathCommand === PathCommand.LineStyleGradient);
      if (type === null || type === undefined) {
        throwError('TypeError', Errors.NullPointerError, 'type');
      }
      var gradientType = GradientType.toNumber(asCoerceString(type));
      if (gradientType < 0) {
        throwError("ArgumentError", Errors.InvalidEnumError, "type");
      }

      if (colors === null || colors === undefined) {
        throwError('TypeError', Errors.NullPointerError, 'colors');
      }
      if (typeof colors !== 'array') {
        throwError('TypeError', Errors.CheckTypeFailedError, 'colors', 'Array');
      }

      if (typeof alphas !== 'array') {
        throwError('TypeError', Errors.CheckTypeFailedError, 'alphas', 'Array');
      }
      if (alphas === null || alphas === undefined) {
        throwError('TypeError', Errors.NullPointerError, 'alphas');
      }

      if (typeof ratios !== 'array') {
        throwError('TypeError', Errors.CheckTypeFailedError, 'ratios', 'Array');
      }
      if (ratios === null || ratios === undefined) {
        throwError('TypeError', Errors.NullPointerError, 'ratios');
      }

      if (matrix === null || matrix === undefined) {
        matrix = flash.geom.Matrix.FROZEN_IDENTITY_MATRIX;
      } else if (!(matrix instanceof flash.geom.Matrix)) {
        throwError('TypeError', Errors.CheckTypeFailedError, 'matrix', 'flash.geom.Matrix');
      }

      var colorStops = colors.length;
      var ratiosValid = true;
      for (var i = 0; i < colorStops; i++) {
        if (ratios[i] > 0xff || ratios[i] < 0) {
          ratiosValid = false;
          break;
        }
      }
      // If the colors, alphas and ratios arrays don't all have the same length or if any of the
      // given ratios falls outside [0,0xff], Flash uses a solid white fill.
      if (colorStops !== alphas.length || colorStops !== ratios.length || !ratiosValid) {
        if (pathCommand === PathCommand.BeginGradientFill) {
          this.beginFill(0xffffff, 1);
        } else {
          this.lineStyle(0xffffff, 1);
        }
        return;
      }
      output.writeUnsignedByte(pathCommand);
      output.writeUnsignedByte(gradientType);

      output.writeByte(colorStops);
      for (var i = 0; i < colorStops; i++) {
        // Colors are coerced to uint32, with the highest byte stripped.
        output.writeUnsignedInt(colors[i] >>> 0 & 0xffffff);
        // Alpha is clamped to [0,1] and scaled to 0xff.
        output.writeUnsignedByte(clamp(+alphas[i], 0, 1) * 0xff);
        // Ratio must be valid, otherwise we'd have bailed above.
        output.writeUnsignedByte(ratios[i]);
      }

      matrix.writeExternal(output);

      // If `spreadMethod` is invalid, "pad" is used.
      var spread = SpreadMethod.toNumber(asCoerceString(spreadMethod));
      if (spread < 0) {
        spread = SpreadMethod.toNumber(SpreadMethod.PAD);
      }
      output.writeUnsignedByte(spread);

      // If `interpolationMethod` is invalid, "rgb" is used.
      var interpolation = InterpolationMethod.toNumber(asCoerceString(interpolationMethod));
      if (interpolation < 0) {
        interpolation = InterpolationMethod.toNumber(InterpolationMethod.RGB);
      }
      output.writeUnsignedByte(interpolation);

      output.writeFloat(clamp(+focalPointRatio, -1, 1));
    }

    private _extendBoundsByPoint(x: number, y: number): void {
      var strokeWidth: number = this._currentStrokeWidth;
      var bounds = this._fillBounds;
      bounds.extendByPoint(x, y);

      var halfStrokeWidth = strokeWidth / 2|0;
      bounds = this._lineBounds;
      bounds.xMin = Math.min(x - halfStrokeWidth, bounds.xMin);
      bounds.xMax = Math.max(x + halfStrokeWidth, bounds.xMax);
      bounds.yMin = Math.min(y - halfStrokeWidth, bounds.yMin);
      bounds.yMax = Math.max(y + halfStrokeWidth, bounds.yMax);
    }

    private _extendBoundsByX(x: number): void {
      var strokeWidth: number = 0;
      var bounds = this._fillBounds;
      bounds.extendByX(x);

      var halfStrokeWidth = strokeWidth / 2|0;
      bounds = this._lineBounds;
      bounds.xMin = Math.min(x - halfStrokeWidth, bounds.xMin);
      bounds.xMax = Math.max(x + halfStrokeWidth, bounds.xMax);
    }

    private _extendBoundsByY(y: number): void {
      var strokeWidth: number = 0;
      var bounds = this._fillBounds;
      bounds.extendByY(y);

      var halfStrokeWidth = strokeWidth / 2|0;
      bounds = this._lineBounds;
      bounds.yMin = Math.min(y - halfStrokeWidth, bounds.yMin);
      bounds.yMax = Math.max(y + halfStrokeWidth, bounds.yMax);
    }

    private _setLastCoordinates(x: number, y: number): void {
      this._lastX = x;
      this._lastY = y;
    }

    private _writeCoordinates(x: number, y: number): void {
      var graphicsData = this._graphicsData;
      graphicsData.writeInt(x);
      graphicsData.writeInt(y);
    }
  }
}
