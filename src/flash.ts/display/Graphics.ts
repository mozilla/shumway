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
 * limitations undxr the License.
 */
// Class: Graphics
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Graphics extends ASNative {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.display.Graphics");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    drawCircle: (x: number, y: number, radius: number) => void;
    drawEllipse: (x: number, y: number, width: number, height: number) => void;
    drawPathObject: (path: flash.display.IGraphicsPath) => void;
    beginFillObject: (fill: flash.display.IGraphicsFill) => void;
    beginStrokeObject: (istroke: flash.display.IGraphicsStroke) => void;
    drawGraphicsData: (graphicsData: ASVector<flash.display.IGraphicsData>) => void;
    // Instance AS -> JS Bindings
    clear(): void {
      notImplemented("public flash.display.Graphics::clear"); return;
    }
    beginFill(color: number /*uint*/, alpha: number = 1): void {
      color = color >>> 0; alpha = +alpha;
      notImplemented("public flash.display.Graphics::beginFill"); return;
    }
    beginGradientFill(type: string, colors: any [], alphas: any [], ratios: any [], matrix: flash.geom.Matrix = null, spreadMethod: string = "pad", interpolationMethod: string = "rgb", focalPointRatio: number = 0): void {
      type = "" + type; colors = colors; alphas = alphas; ratios = ratios; matrix = matrix; spreadMethod = "" + spreadMethod; interpolationMethod = "" + interpolationMethod; focalPointRatio = +focalPointRatio;
      notImplemented("public flash.display.Graphics::beginGradientFill"); return;
    }
    beginBitmapFill(bitmap: flash.display.BitmapData, matrix: flash.geom.Matrix = null, repeat: boolean = true, smooth: boolean = false): void {
      bitmap = bitmap; matrix = matrix; repeat = !!repeat; smooth = !!smooth;
      notImplemented("public flash.display.Graphics::beginBitmapFill"); return;
    }
    beginShaderFill(shader: flash.display.Shader, matrix: flash.geom.Matrix = null): void {
      shader = shader; matrix = matrix;
      notImplemented("public flash.display.Graphics::beginShaderFill"); return;
    }
    lineGradientStyle(type: string, colors: any [], alphas: any [], ratios: any [], matrix: flash.geom.Matrix = null, spreadMethod: string = "pad", interpolationMethod: string = "rgb", focalPointRatio: number = 0): void {
      type = "" + type; colors = colors; alphas = alphas; ratios = ratios; matrix = matrix; spreadMethod = "" + spreadMethod; interpolationMethod = "" + interpolationMethod; focalPointRatio = +focalPointRatio;
      notImplemented("public flash.display.Graphics::lineGradientStyle"); return;
    }
    lineStyle(thickness: number = undefined, color: number /*uint*/ = 0, alpha: number = 1, pixelHinting: boolean = false, scaleMode: string = "normal", caps: string = null, joints: string = null, miterLimit: number = 3): void {
      thickness = +thickness; color = color >>> 0; alpha = +alpha; pixelHinting = !!pixelHinting; scaleMode = "" + scaleMode; caps = "" + caps; joints = "" + joints; miterLimit = +miterLimit;
      notImplemented("public flash.display.Graphics::lineStyle"); return;
    }
    drawRect(x: number, y: number, width: number, height: number): void {
      x = +x; y = +y; width = +width; height = +height;
      notImplemented("public flash.display.Graphics::drawRect"); return;
    }
    drawRoundRect(x: number, y: number, width: number, height: number, ellipseWidth: number, ellipseHeight: number = undefined): void {
      x = +x; y = +y; width = +width; height = +height; ellipseWidth = +ellipseWidth; ellipseHeight = +ellipseHeight;
      notImplemented("public flash.display.Graphics::drawRoundRect"); return;
    }
    drawRoundRectComplex(x: number, y: number, width: number, height: number, topLeftRadius: number, topRightRadius: number, bottomLeftRadius: number, bottomRightRadius: number): void {
      x = +x; y = +y; width = +width; height = +height; topLeftRadius = +topLeftRadius; topRightRadius = +topRightRadius; bottomLeftRadius = +bottomLeftRadius; bottomRightRadius = +bottomRightRadius;
      notImplemented("public flash.display.Graphics::drawRoundRectComplex"); return;
    }
    moveTo(x: number, y: number): void {
      x = +x; y = +y;
      notImplemented("public flash.display.Graphics::moveTo"); return;
    }
    lineTo(x: number, y: number): void {
      x = +x; y = +y;
      notImplemented("public flash.display.Graphics::lineTo"); return;
    }
    curveTo(controlX: number, controlY: number, anchorX: number, anchorY: number): void {
      controlX = +controlX; controlY = +controlY; anchorX = +anchorX; anchorY = +anchorY;
      notImplemented("public flash.display.Graphics::curveTo"); return;
    }
    cubicCurveTo(controlX1: number, controlY1: number, controlX2: number, controlY2: number, anchorX: number, anchorY: number): void {
      controlX1 = +controlX1; controlY1 = +controlY1; controlX2 = +controlX2; controlY2 = +controlY2; anchorX = +anchorX; anchorY = +anchorY;
      notImplemented("public flash.display.Graphics::cubicCurveTo"); return;
    }
    endFill(): void {
      notImplemented("public flash.display.Graphics::endFill"); return;
    }
    copyFrom(sourceGraphics: flash.display.Graphics): void {
      sourceGraphics = sourceGraphics;
      notImplemented("public flash.display.Graphics::copyFrom"); return;
    }
    lineBitmapStyle(bitmap: flash.display.BitmapData, matrix: flash.geom.Matrix = null, repeat: boolean = true, smooth: boolean = false): void {
      bitmap = bitmap; matrix = matrix; repeat = !!repeat; smooth = !!smooth;
      notImplemented("public flash.display.Graphics::lineBitmapStyle"); return;
    }
    lineShaderStyle(shader: flash.display.Shader, matrix: flash.geom.Matrix = null): void {
      shader = shader; matrix = matrix;
      notImplemented("public flash.display.Graphics::lineShaderStyle"); return;
    }
    drawPath(commands: ASVector<number /*int*/>, data: ASVector<number>, winding: string = "evenOdd"): void {
      commands = commands; data = data; winding = "" + winding;
      notImplemented("public flash.display.Graphics::drawPath"); return;
    }
    drawTriangles(vertices: ASVector<number>, indices: ASVector<number /*int*/> = null, uvtData: ASVector<number> = null, culling: string = "none"): void {
      vertices = vertices; indices = indices; uvtData = uvtData; culling = "" + culling;
      notImplemented("public flash.display.Graphics::drawTriangles"); return;
    }
  }
}
