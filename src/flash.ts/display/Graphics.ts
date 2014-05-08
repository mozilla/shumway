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
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import throwError = Shumway.AVM2.Runtime.throwError;
  import clamp = Shumway.NumberUtilities.clamp;

  import GradientType = flash.display.GradientType;
  import SpreadMethod = flash.display.SpreadMethod;
  import InterpolationMethod = flash.display.InterpolationMethod;
  import LineScaleMode = flash.display.LineScaleMode;
  import CapsStyle = flash.display.CapsStyle;
  import JointStyle = flash.display.JointStyle;

  var ByteArray: typeof flash.utils.ByteArray;
  var Rectangle: typeof flash.geom.Rectangle;
  var Point: typeof flash.geom.Point;

  export class Graphics extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = function () {
      ByteArray = flash.utils.ByteArray;
      Rectangle = flash.geom.Rectangle;
      Point = flash.geom.Point; assert (Point);
    };
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = function () {
      var self: Graphics = this;
      self._graphicsData = new ByteArray();
      self._invalid = false;
    };
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];

    static PATH_COMMAND_BEGIN_FILL = 1;
    static PATH_COMMAND_BEGIN_GRADIENT_FILL = 2;
    static PATH_COMMAND_BEGIN_BITMAP_FILL = 3;
    static PATH_COMMAND_END_FILL = 4;
    static PATH_COMMAND_LINE_STYLE = 5;
    static PATH_COMMAND_MOVE_TO = 6;
    static PATH_COMMAND_LINE_TO = 7;
    static PATH_COMMAND_CURVE_TO = 8;
    static PATH_COMMAND_CUBIC_CURVE_TO = 9;

    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.display.Graphics");
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings

    _graphicsData: flash.utils.ByteArray;
    _invalid: boolean;

    _getContentBounds(includeStrokes: boolean = true): flash.geom.Rectangle {
      notImplemented("public flash.display.Graphics::_getContentBounds");
      return new Rectangle();
    }

    clear(): void {
      //this._currentPath = null;
      this._graphicsData.length = 0;
      this._invalid = true;
    }

    beginFill(color: number /*uint*/, alpha: number = 1): void {
      color = color >>> 0; alpha = +alpha;
      this._graphicsData.writeUnsignedByte(Graphics.PATH_COMMAND_BEGIN_FILL);
      this._graphicsData.writeUnsignedInt((color << 8) | (alpha * 255));
    }

    beginGradientFill(type: string, colors: any [], alphas: any [], ratios: any [], matrix: flash.geom.Matrix = null, spreadMethod: string = "pad", interpolationMethod: string = "rgb", focalPointRatio: number = 0): void {
      // colors = colors; alphas = alphas; ratios = ratios; matrix = matrix;
      var graphicsData = this._graphicsData;
      graphicsData.writeUnsignedByte(Graphics.PATH_COMMAND_BEGIN_GRADIENT_FILL);
      var gradientType = GradientType.toNumber(asCoerceString(type));
      if (gradientType >= 0) {
        graphicsData.writeUnsignedByte(gradientType);
      } else {
        throwError("ArgumentError", Errors.InvalidEnumError, "type");
      }
      var spread = SpreadMethod.toNumber(asCoerceString(spreadMethod));
      if (spread >= 0) {
        graphicsData.writeUnsignedByte(spread);
      } else {
        throwError("ArgumentError", Errors.InvalidEnumError, "spreadMethod");
      }
      var interpolation = InterpolationMethod.toNumber(asCoerceString(interpolationMethod));
      if (interpolation >= 0) {
        graphicsData.writeUnsignedByte(interpolation);
      } else {
        throwError("ArgumentError", Errors.InvalidEnumError, "interpolationMethod");
      }
      graphicsData.writeFloat(clamp(focalPointRatio, -1, 1));
    }

    beginBitmapFill(bitmap: flash.display.BitmapData, matrix: flash.geom.Matrix = null, repeat: boolean = true, smooth: boolean = false): void {
      //bitmap = bitmap; matrix = matrix;
      var graphicsData = this._graphicsData;
      graphicsData.writeUnsignedByte(Graphics.PATH_COMMAND_BEGIN_BITMAP_FILL);
      // bitmap
      // matrix
      graphicsData.writeUnsignedByte(repeat ? 1 : 0);
      graphicsData.writeUnsignedByte(smooth ? 1 : 0);
    }

    beginShaderFill(shader: flash.display.Shader, matrix: flash.geom.Matrix = null): void {
      //shader = shader; matrix = matrix;
      notImplemented("public flash.display.Graphics::beginShaderFill"); return;
    }

    lineGradientStyle(type: string, colors: any [], alphas: any [], ratios: any [], matrix: flash.geom.Matrix = null, spreadMethod: string = "pad", interpolationMethod: string = "rgb", focalPointRatio: number = 0): void {
      // colors = colors; alphas = alphas; ratios = ratios; matrix = matrix;
      //this._closePath();
      //var fill = new GraphicsGradientFill(asCoerceString(type), colors, alphas, ratios, matrix, asCoerceString(spreadMethod), asCoerceString(interpolationMethod), +focalPointRatio);
      // TODO
    }

    lineStyle(thickness: number, color: number /*uint*/ = 0, alpha: number = 1, pixelHinting: boolean = false, scaleMode: string = "normal", caps: string = null, joints: string = null, miterLimit: number = 3): void {
      //this._closePath();
      //var fill = new GraphicsSolidFill(color >>> 0, +alpha);
      //this._graphicsData.push(new GraphicsStroke(+thickness, !!pixelHinting, asCoerceString(scaleMode), asCoerceString(caps), asCoerceString(joints), +miterLimit, fill));
      color = color >>> 0; alpha = +alpha;
      var graphicsData = this._graphicsData;
      graphicsData.writeUnsignedByte(Graphics.PATH_COMMAND_LINE_STYLE);
      graphicsData.writeUnsignedInt((color << 8) | (alpha * 255));
      graphicsData.writeUnsignedByte(pixelHinting ? 1 : 0);
      var lineScaleMode = LineScaleMode.toNumber(asCoerceString(scaleMode));
      if (lineScaleMode >= 0) {
        graphicsData.writeUnsignedByte(lineScaleMode);
      } else {
        throwError("ArgumentError", Errors.InvalidEnumError, "type");
      }
      var capsStyle = CapsStyle.toNumber(asCoerceString(caps));
      if (capsStyle >= 0) {
        graphicsData.writeUnsignedByte(capsStyle);
      } else {
        throwError("ArgumentError", Errors.InvalidEnumError, "caps");
      }
      var jointStyle = JointStyle.toNumber(asCoerceString(joints));
      if (jointStyle >= 0) {
        graphicsData.writeUnsignedByte(jointStyle);
      } else {
        throwError("ArgumentError", Errors.InvalidEnumError, "joints");
      }
      graphicsData.writeUnsignedByte(clamp(+miterLimit, 1, 255));
    }

    drawRect(x: number, y: number, width: number, height: number): void {
      //x = +x; y = +y; width = +width; height = +height;

      this.moveTo(x, y);
      this.lineTo(x + width, y);
      this.lineTo(x + width, y + height);
      this.lineTo(x, y + height);
      this.lineTo(x, y);
    }

    drawRoundRect(x: number, y: number, width: number, height: number, ellipseWidth: number, ellipseHeight: number): void {
      //x = +x; y = +y; width = +width; height = +height; ellipseWidth = +ellipseWidth; ellipseHeight = +ellipseHeight;

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
      // Through some testing, it has been discovered
      // tha the Flash player starts and stops the pen
      // at 'D', so we will, too.
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

    drawRoundRectComplex(x: number, y: number, width: number, height: number, topLeftRadius: number, topRightRadius: number, bottomLeftRadius: number, bottomRightRadius: number): void {
      //x = +x; y = +y; width = +width; height = +height; topLeftRadius = +topLeftRadius; topRightRadius = +topRightRadius; bottomLeftRadius = +bottomLeftRadius; bottomRightRadius = +bottomRightRadius;

      if (!topLeftRadius && !topRightRadius && !bottomLeftRadius && !bottomRightRadius) {
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
      x = +x; y = +y; width = +width; height = +height;

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
      //x = +x; y = +y;

      var graphicsData = this._graphicsData;
      graphicsData.writeUnsignedByte(Graphics.PATH_COMMAND_MOVE_TO);
      graphicsData.writeUnsignedInt(x * 20);
      graphicsData.writeUnsignedInt(y * 20);
      this._invalid = true;
    }

    lineTo(x: number, y: number): void {
      //x = +x; y = +y;

      var graphicsData = this._graphicsData;
      graphicsData.writeUnsignedByte(Graphics.PATH_COMMAND_LINE_TO);
      graphicsData.writeUnsignedInt(x * 20);
      graphicsData.writeUnsignedInt(y * 20);
      this._invalid = true;
    }

    curveTo(controlX: number, controlY: number, anchorX: number, anchorY: number): void {
      //controlX = +controlX; controlY = +controlY; anchorX = +anchorX; anchorY = +anchorY;

      var graphicsData = this._graphicsData;
      graphicsData.writeUnsignedByte(Graphics.PATH_COMMAND_CURVE_TO);
      graphicsData.writeUnsignedInt(controlX * 20);
      graphicsData.writeUnsignedInt(controlY * 20);
      graphicsData.writeUnsignedInt(anchorX * 20);
      graphicsData.writeUnsignedInt(anchorY * 20);
      this._invalid = true;
    }

    cubicCurveTo(controlX1: number, controlY1: number, controlX2: number, controlY2: number, anchorX: number, anchorY: number): void {
      //controlX1 = +controlX1; controlY1 = +controlY1; controlX2 = +controlX2; controlY2 = +controlY2; anchorX = +anchorX; anchorY = +anchorY;

      var graphicsData = this._graphicsData;
      graphicsData.writeUnsignedByte(Graphics.PATH_COMMAND_CUBIC_CURVE_TO);
      graphicsData.writeUnsignedInt(controlX1 * 20);
      graphicsData.writeUnsignedInt(controlY1 * 20);
      graphicsData.writeUnsignedInt(controlX2 * 20);
      graphicsData.writeUnsignedInt(controlY2 * 20);
      graphicsData.writeUnsignedInt(anchorX * 20);
      graphicsData.writeUnsignedInt(anchorY * 20);
      this._invalid = true;
    }

    endFill(): void {
      this._graphicsData.writeUnsignedByte(Graphics.PATH_COMMAND_END_FILL);
    }

    copyFrom(sourceGraphics: flash.display.Graphics): void {
      this._graphicsData.position = 0;
      this._graphicsData.length = sourceGraphics._graphicsData.length;
      this._graphicsData.writeBytes(sourceGraphics._graphicsData, 0);
      this._invalid = true;
    }

    lineBitmapStyle(bitmap: flash.display.BitmapData, matrix: flash.geom.Matrix = null, repeat: boolean = true, smooth: boolean = false): void {
      //bitmap = bitmap; matrix = matrix;
      //this._closePath();
      //var fill = this._graphicsData.push(new GraphicsBitmapFill(bitmap, matrix, !!repeat, !!smooth));
      // TODO
    }

    lineShaderStyle(shader: flash.display.Shader, matrix: flash.geom.Matrix = null): void {
      //shader = shader; matrix = matrix;
      notImplemented("public flash.display.Graphics::lineShaderStyle"); return;
    }
    drawPath(commands: ASVector<any>, data: ASVector<any>, winding: string = "evenOdd"): void {
      commands = commands; data = data, winding = asCoerceString(winding);
      notImplemented("public flash.display.Graphics::drawPath"); return;
    }
    drawTriangles(vertices: ASVector<any>, indices: ASVector<any> = null, uvtData: ASVector<any> = null, culling: string = "none"): void {
      vertices = vertices; indices = indices; uvtData = uvtData, culling = asCoerceString(culling);
      notImplemented("public flash.display.Graphics::drawTriangles"); return;
    }
    drawGraphicsData(graphicsData: ASVector<any>): void {
      graphicsData = graphicsData;
      notImplemented("public flash.display.Graphics::drawGraphicsData"); return;
    }

    /**
     * Tests if the specified point is within this graphics path.
     */
    _containsPoint(point: flash.geom.Point, includeStrokes: boolean = false): boolean {
      // TODO: Implement this in a smart way.
      return false;
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
//      }2
    }
  }
}
