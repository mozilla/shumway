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
// Class: Graphics
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import throwError = Shumway.AVM2.Runtime.throwError;

  export class Graphics extends ASNative implements flash.utils.IExternalizable {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = function () {
      var self: Graphics = this;
      self._currentPath = null;
      self._graphicsData = [];
      self._invalid = false;
    };
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // [];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.display.Graphics");
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings

    _currentPath: GraphicsPath;
    _graphicsData: IGraphicsData [];
    _invalid: boolean;

    private _ensurePath(): void {
      if (this._currentPath) {
        return;
      }
      this._currentPath = new GraphicsPath();
    }

    private _closePath(): void {
      if (!this._currentPath) {
        return;
      }
      this._graphicsData.push(this._currentPath);
      this._currentPath = null;
    }

    clear(): void {
      this._currentPath = null;
      this._graphicsData.length = 0;
      this._invalid = true;
    }

    beginFill(color: number /*uint*/, alpha: number = 1): void {
      this._closePath();
      this._graphicsData.push(new GraphicsSolidFill(color >>> 0, alpha = +alpha));
    }

    beginGradientFill(type: string, colors: any [], alphas: any [], ratios: any [], matrix: flash.geom.Matrix = null, spreadMethod: string = "pad", interpolationMethod: string = "rgb", focalPointRatio: number = 0): void {
      // colors = colors; alphas = alphas; ratios = ratios; matrix = matrix;
      this._closePath();
      this._graphicsData.push(new GraphicsGradientFill("" + type, colors, alphas, ratios, matrix, "" + spreadMethod, "" + interpolationMethod, +focalPointRatio));
    }

    beginBitmapFill(bitmap: flash.display.BitmapData, matrix: flash.geom.Matrix = null, repeat: boolean = true, smooth: boolean = false): void {
      //bitmap = bitmap; matrix = matrix;
      this._closePath();
      this._graphicsData.push(new GraphicsBitmapFill(bitmap, matrix, !!repeat, !!smooth));
    }

    beginShaderFill(shader: flash.display.Shader, matrix: flash.geom.Matrix = null): void {
      //shader = shader; matrix = matrix;
      notImplemented("public flash.display.Graphics::beginShaderFill"); return;
    }

    lineGradientStyle(type: string, colors: any [], alphas: any [], ratios: any [], matrix: flash.geom.Matrix = null, spreadMethod: string = "pad", interpolationMethod: string = "rgb", focalPointRatio: number = 0): void {
      // colors = colors; alphas = alphas; ratios = ratios; matrix = matrix;
      this._closePath();
      var fill = new GraphicsGradientFill("" + type, colors, alphas, ratios, matrix, "" + spreadMethod, "" + interpolationMethod, +focalPointRatio);
      // TODO
    }

    lineStyle(thickness: number, color: number /*uint*/ = 0, alpha: number = 1, pixelHinting: boolean = false, scaleMode: string = "normal", caps: string = null, joints: string = null, miterLimit: number = 3): void {
      this._closePath();
      var fill = new GraphicsSolidFill(color >>> 0, +alpha);
      this._graphicsData.push(new GraphicsStroke(+thickness, !!pixelHinting, "" + scaleMode, "" + caps, "" + joints, +miterLimit, fill));
    }

    drawRect(x: number, y: number, width: number, height: number): void {
      x = +x; y = +y; width = +width; height = +height;
      this._ensurePath();
      this._currentPath.moveTo(x, y);
      this._currentPath.lineTo(x + width, y);
      this._currentPath.lineTo(x + width, y + height);
      this._currentPath.lineTo(x, y + height);
      this._currentPath.lineTo(x, y);
      this._invalid = true;
    }

    drawRoundRect(x: number, y: number, width: number, height: number, ellipseWidth: number, ellipseHeight: number): void {
      x = +x; y = +y; width = +width; height = +height; ellipseWidth = +ellipseWidth; ellipseHeight = +ellipseHeight;
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

      this._ensurePath();
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
      this._currentPath.moveTo(right, ybw);
      this._currentPath.curveTo(right, bottom, xrw, bottom);
      this._currentPath.lineTo(xlw, bottom);
      this._currentPath.curveTo(x, bottom, x, ybw);
      this._currentPath.lineTo(x, ytw);
      this._currentPath.curveTo(x, y, xlw, y);
      this._currentPath.lineTo(xrw, y);
      this._currentPath.curveTo(right, y, right, ytw);
      this._currentPath.lineTo(right, ybw);
      this._invalid = true;
    }

    drawRoundRectComplex(x: number, y: number, width: number, height: number, topLeftRadius: number, topRightRadius: number, bottomLeftRadius: number, bottomRightRadius: number): void {
      x = +x; y = +y; width = +width; height = +height; topLeftRadius = +topLeftRadius; topRightRadius = +topRightRadius; bottomLeftRadius = +bottomLeftRadius; bottomRightRadius = +bottomRightRadius;
      if (!topLeftRadius && !topRightRadius && !bottomLeftRadius && !bottomRightRadius) {
        this.drawRect(x, y, width, height);
        return;
      }

      this._ensurePath();
      var right = x + width;
      var bottom = y + height;
      var xtl = x + topLeftRadius;
      this._currentPath.moveTo(right, bottom - bottomRightRadius);
      this._currentPath.curveTo(right, bottom, right - bottomRightRadius, bottom);
      this._currentPath.lineTo(x + bottomLeftRadius, bottom);
      this._currentPath.curveTo(x, bottom, x, bottom - bottomLeftRadius);
      this._currentPath.lineTo(x, y + topLeftRadius);
      this._currentPath.curveTo(x, y, xtl, y);
      this._currentPath.lineTo(right - topRightRadius, y);
      this._currentPath.curveTo(right, y, right, y + topRightRadius);
      this._currentPath.lineTo(right, bottom - bottomRightRadius);
      this._invalid = true;
    }

    drawCircle(x: number, y: number, radius: number): void {
      this.drawEllipse(+x, +y, +radius, +radius);
    }

    drawEllipse(x: number, y: number, width: number, height: number): void {
      x = +x; y = +y; width = +width; height = +height;
      this._ensurePath();
      var rx = width / 2;
      var ry = height / 2;
      var currentX = x + rx;
      var currentY = y;
      this._currentPath.lineTo(currentX * width, currentY * height);
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
        this._currentPath.cubicCurveTo(
          cp1x * rx,
          cp1y * ry,
          cp2x * rx,
          cp2y * ry,
          currentX * rx,
          currentY * ry
        );
        startAngle = endAngle;
      }
      this._invalid = true;
    }

    moveTo(x: number, y: number): void {
      x = +x; y = +y;
      this._ensurePath();
      this._currentPath.moveTo(x, y);
      this._invalid = true;
    }

    lineTo(x: number, y: number): void {
      x = +x; y = +y;
      this._ensurePath();
      this._currentPath.lineTo(x, y);
      this._invalid = true;
    }

    curveTo(controlX: number, controlY: number, anchorX: number, anchorY: number): void {
      this._ensurePath();
      this._currentPath.curveTo(+controlX, +controlY, +anchorX, +anchorY);
      this._invalid = true;
    }

    cubicCurveTo(controlX1: number, controlY1: number, controlX2: number, controlY2: number, anchorX: number, anchorY: number): void {
      this._ensurePath();
      this._currentPath.cubicCurveTo(+controlX1, +controlY1, +controlX2, +controlY2, +anchorX, +anchorY);
      this._invalid = true;
    }

    endFill(): void {
      this._closePath();
      this._graphicsData.push(new GraphicsEndFill());
    }

    copyFrom(sourceGraphics: flash.display.Graphics): void {
      //sourceGraphics = sourceGraphics;
      this._currentPath = null;
      this._graphicsData = sourceGraphics._graphicsData.slice();
      this._invalid = true;
    }

    lineBitmapStyle(bitmap: flash.display.BitmapData, matrix: flash.geom.Matrix = null, repeat: boolean = true, smooth: boolean = false): void {
      //bitmap = bitmap; matrix = matrix;
      this._closePath();
      var fill = this._graphicsData.push(new GraphicsBitmapFill(bitmap, matrix, !!repeat, !!smooth));
      // TODO
    }

    lineShaderStyle(shader: flash.display.Shader, matrix: flash.geom.Matrix = null): void {
      //shader = shader; matrix = matrix;
      notImplemented("public flash.display.Graphics::lineShaderStyle"); return;
    }
    drawPath(commands: ASVector<any>, data: ASVector<any>, winding: string = "evenOdd"): void {
      commands = commands; data = data, winding = "" + winding;
      notImplemented("public flash.display.Graphics::drawPath"); return;
    }
    drawTriangles(vertices: ASVector<any>, indices: ASVector<any> = null, uvtData: ASVector<any> = null, culling: string = "none"): void {
      vertices = vertices; indices = indices; uvtData = uvtData, culling = "" + culling;
      notImplemented("public flash.display.Graphics::drawTriangles"); return;
    }
    drawGraphicsData(graphicsData: ASVector<any>): void {
      graphicsData = graphicsData;
      notImplemented("public flash.display.Graphics::drawGraphicsData"); return;
    }

    writeExternal(output: flash.utils.IDataOutput): void {

    }
    readExternal(input: flash.utils.IDataInput): void {

    }
  }
}
