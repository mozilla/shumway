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
 * command: byte [1-11] (i.e. one of the PATH_COMMAND_* constants)
 *
 * All entries always contain all fields, default values aren't omitted.
 *
 * moveTo:
 * byte command:  PATH_COMMAND_MOVE_TO
 * uint x:        target x coordinate, in twips
 * uint y:        target y coordinate, in twips
 *
 * lineTo:
 * byte command:  PATH_COMMAND_LINE_TO
 * uint x:        target x coordinate, in twips
 * uint y:        target y coordinate, in twips
 *
 * beginFill:
 * byte command:  PATH_COMMAND_BEGIN_SOLID_FILL
 * uint color:    [RGBA color]
 *
 * lineStyle:
 * byte command:      PATH_COMMAND_LINE_STYLE_SOLID
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

  import DisplayObject = flash.display.DisplayObject;
  import GradientType = flash.display.GradientType;
  import SpreadMethod = flash.display.SpreadMethod;
  import InterpolationMethod = flash.display.InterpolationMethod;
  import LineScaleMode = flash.display.LineScaleMode;
  import CapsStyle = flash.display.CapsStyle;
  import JointStyle = flash.display.JointStyle;
  import geom = flash.geom;
  import utils = flash.utils;

  export class Graphics extends ASNative {

    static classInitializer: any = null;
    static initializer: any = null;
    
    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    static PATH_COMMAND_BEGIN_SOLID_FILL = 1;
    static PATH_COMMAND_BEGIN_GRADIENT_FILL = 2;
    static PATH_COMMAND_BEGIN_BITMAP_FILL = 3;
    static PATH_COMMAND_END_FILL = 4;
    static PATH_COMMAND_LINE_STYLE_SOLID = 5;
    static PATH_COMMAND_LINE_STYLE_GRADIENT = 6;
    static PATH_COMMAND_LINE_STYLE_BITMAP = 7;
    static PATH_COMMAND_MOVE_TO = 8;
    static PATH_COMMAND_LINE_TO = 9;
    static PATH_COMMAND_CURVE_TO = 10;
    static PATH_COMMAND_CUBIC_CURVE_TO = 11;

    constructor () {
      false && super();
      this._id = DisplayObject._syncID++;
      this._graphicsData = new utils.ByteArray();
      this._innerBounds = new geom.Rectangle();
      this._outerBounds = new geom.Rectangle();
      this._parent = null;
    }

    getGraphicsData(): flash.utils.ByteArray {
      return this._graphicsData;
    }

    // JS -> AS Bindings
    _id: number;

    // AS -> JS Bindings
    private _graphicsData: flash.utils.ByteArray;

    /**
     * Bounding box excluding strokes.
     */
    _innerBounds: geom.Rectangle;

    /**
     * Bounding box including strokes.
     */
    _outerBounds: geom.Rectangle;

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
      if (this._parent) {
        this._parent._invalidateBoundsAndRect();
      }
    }

    _getContentBounds(includeStrokes: boolean = true): geom.Rectangle {
      if (includeStrokes) {
        return this._outerBounds;
      } else {
        return this._innerBounds;
      }
      notImplemented("public flash.display.Graphics::_getContentBounds");
      return new geom.Rectangle();
    }

    clear(): void {
      this._graphicsData.length = 0;
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
      this._graphicsData.writeUnsignedByte(Graphics.PATH_COMMAND_BEGIN_SOLID_FILL);
      this._graphicsData.writeUnsignedInt((color << 8) | alpha);
    }

    beginGradientFill(type: string, colors: any [], alphas: any [], ratios: any [],
                      matrix: flash.geom.Matrix = null, spreadMethod: string = "pad",
                      interpolationMethod: string = "rgb", focalPointRatio: number = 0): void
    {
      this._writeGradientStyle(this._graphicsData, Graphics.PATH_COMMAND_BEGIN_GRADIENT_FILL, type,
                              colors, alphas, ratios, matrix,
                              spreadMethod, interpolationMethod, focalPointRatio);
    }

    beginBitmapFill(bitmap: flash.display.BitmapData, matrix: flash.geom.Matrix = null,
                    repeat: boolean = true, smooth: boolean = false): void
    {
      if (bitmap === null || bitmap === undefined) {
        throwError('TypeError', Errors.NullPointerError, 'bitmap');
      } else if (!(matrix instanceof flash.geom.Matrix)) {
        throwError('TypeError', Errors.CheckTypeFailedError, 'bitmap', 'flash.display.BitmapData');
      }
      if (matrix === null || matrix === undefined) {
        matrix = flash.geom.Matrix.FROZEN_IDENTITY_MATRIX;
      } else if (!(matrix instanceof flash.geom.Matrix)) {
        throwError('TypeError', Errors.CheckTypeFailedError, 'matrix', 'flash.geom.Matrix');
      }
      var graphicsData = this._graphicsData;
      graphicsData.writeUnsignedByte(Graphics.PATH_COMMAND_BEGIN_BITMAP_FILL);
      // bitmap
      matrix.writeExternal(graphicsData);
      graphicsData.writeUnsignedByte(+repeat);
      graphicsData.writeUnsignedByte(+smooth);
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

      var graphicsData = this._graphicsData;
      graphicsData.writeUnsignedByte(Graphics.PATH_COMMAND_LINE_STYLE_SOLID);
      graphicsData.writeUnsignedByte(thickness);
      graphicsData.writeUnsignedInt((color << 8) | alpha);
      graphicsData.writeUnsignedByte(+pixelHinting);

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
      this._writeGradientStyle(this._graphicsData, Graphics.PATH_COMMAND_LINE_STYLE_GRADIENT, type,
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
      x = +x;
      y = +y;
      width = +width;
      height = +height;

      this.moveTo(x, y);
      this.lineTo(x + width, y);
      this.lineTo(x + width, y + height);
      this.lineTo(x, y + height);
      this.lineTo(x, y);

      this._innerBounds = this._outerBounds = new geom.Rectangle(x * 20 | 0, y * 20 | 0,
                                                     width * 20 | 0, height * 20 | 0);
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
          this.drawEllipse(x + radiusX, y + radiusY, radiusX, radiusY);
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
      this.drawEllipse(+x, +y, +radius, +radius);
    }

    drawEllipse(x: number, y: number, width: number, height: number): void {
      x = +x;
      y = +y;
      width = +width;
      height = +height;

      var rx = width / 2;
      var ry = height / 2;
      var currentX = x + rx;
      var currentY = y;
      this.lineTo(currentX * width, currentY * height);
      var startAngle = 0;
      var u = 1;
      var v = 0;
      for (var i = 0; i < 4; i++) {
        var endAngle = startAngle + Math.PI / 2;
        var kappa = (4 / 3) * Math.tan((endAngle - startAngle) / 4);
        var cp1x = currentX - v * kappa;
        var cp1y = currentY + u * kappa;
        u = Math.cos(endAngle);
        v = Math.sin(endAngle);
        currentX = x + u;
        currentY = y + v;
        var cp2x = currentX + v * kappa;
        var cp2y = currentY - u * kappa;
        this.cubicCurveTo(
          cp1x * rx,
          cp1y * ry,
          cp2x * rx,
          cp2y * ry,
          currentX * rx,
          currentY * ry
        );
        startAngle = endAngle;
      }
    }

    moveTo(x: number, y: number): void {
      x = x * 20|0;
      y = y * 20|0;

      var graphicsData = this._graphicsData;
      graphicsData.writeUnsignedByte(Graphics.PATH_COMMAND_MOVE_TO);
      graphicsData.writeUnsignedInt(x);
      graphicsData.writeUnsignedInt(y);

      this._extendBoundsByPoint(x, y, 0);

      this._invalidateParent();
    }

    lineTo(x: number, y: number): void {
      x = x * 20|0;
      y = y * 20|0;

      var graphicsData = this._graphicsData;
      graphicsData.writeUnsignedByte(Graphics.PATH_COMMAND_LINE_TO);
      graphicsData.writeUnsignedInt(x);
      graphicsData.writeUnsignedInt(y);

      this._extendBoundsByPoint(x, y, 0);

      this._invalidateParent();
    }

    curveTo(controlX: number, controlY: number, anchorX: number, anchorY: number): void {
      //controlX = +controlX; controlY = +controlY; anchorX = +anchorX; anchorY = +anchorY;

      var graphicsData = this._graphicsData;
      graphicsData.writeUnsignedByte(Graphics.PATH_COMMAND_CURVE_TO);
      graphicsData.writeUnsignedInt(controlX * 20|0);
      graphicsData.writeUnsignedInt(controlY * 20|0);
      graphicsData.writeUnsignedInt(anchorX * 20|0);
      graphicsData.writeUnsignedInt(anchorY * 20|0);
      this._invalidateParent();
    }

    cubicCurveTo(controlX1: number, controlY1: number, controlX2: number, controlY2: number,
                 anchorX: number, anchorY: number): void {
      //controlX1 = +controlX1; controlY1 = +controlY1; controlX2 = +controlX2; controlY2 = +controlY2; anchorX = +anchorX; anchorY = +anchorY;

      var graphicsData = this._graphicsData;
      graphicsData.writeUnsignedByte(Graphics.PATH_COMMAND_CUBIC_CURVE_TO);
      graphicsData.writeUnsignedInt(controlX1 * 20|0);
      graphicsData.writeUnsignedInt(controlY1 * 20|0);
      graphicsData.writeUnsignedInt(controlX2 * 20|0);
      graphicsData.writeUnsignedInt(controlY2 * 20|0);
      graphicsData.writeUnsignedInt(anchorX * 20|0);
      graphicsData.writeUnsignedInt(anchorY * 20|0);
      this._invalidateParent();
    }

    endFill(): void {
      this._graphicsData.writeUnsignedByte(Graphics.PATH_COMMAND_END_FILL);
    }

    copyFrom(sourceGraphics: flash.display.Graphics): void {
      this._graphicsData.position = 0;
      this._graphicsData.length = sourceGraphics._graphicsData.length;
      this._graphicsData.writeBytes(sourceGraphics._graphicsData, 0);
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
      return this._outerBounds.containsPoint(point);

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
    private _writeGradientStyle(output: flash.utils.ByteArray, pathCommand: number, type: string,
                               colors: any [], alphas: any [], ratios: any [],
                               matrix: flash.geom.Matrix = null, spreadMethod: string = "pad",
                               interpolationMethod: string = "rgb",
                               focalPointRatio: number = 0): void
    {
      assert(pathCommand === Graphics.PATH_COMMAND_BEGIN_GRADIENT_FILL ||
             pathCommand === Graphics.PATH_COMMAND_LINE_STYLE_GRADIENT);
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
      var ratiosValid: boolean = true;
      for (var i = 0; i < colorStops; i++) {
        if (ratios[i] > 0xff || ratios[i] < 0) {
          ratiosValid = false;
          break;
        }
      }
      // If the colors, alphas and ratios arrays don't all have the same length or if any of the
      // given ratios falls outside [0,0xff], Flash uses a solid white fill.
      if (colorStops !== alphas.length || colorStops !== ratios.length || !ratiosValid) {
        if (pathCommand === Graphics.PATH_COMMAND_BEGIN_GRADIENT_FILL) {
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

    private _extendBoundsByPoint(x: number, y: number, strokeWidth: number): void {
      var bounds = this._innerBounds;
      var xMin = bounds.x = Math.min(x, bounds.x);
      bounds.width = Math.max(x - xMin, bounds.width);
      var yMin = bounds.y = Math.min(y, bounds.y);
      bounds.height = Math.max(y - yMin, bounds.height);

      var halfStrokeWidth = strokeWidth / 2|0;
      bounds = this._outerBounds;
      var xMin = bounds.x = Math.min(x - halfStrokeWidth, bounds.x);
      bounds.width = Math.max(x + halfStrokeWidth - xMin, bounds.width);
      var yMin = bounds.y = Math.min(y - halfStrokeWidth, bounds.y);
      bounds.height = Math.max(y + halfStrokeWidth - yMin, bounds.height);
    }
  }
}
