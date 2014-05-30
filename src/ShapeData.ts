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

///<reference path='dataBuffer.ts' />
module Shumway {
  /**
   * Used for (de-)serializing Graphics path data in defineShape, flash.display.Graphics
   * and the renderer.
   */
  export enum PathCommand {
    BeginSolidFill = 1,
    BeginGradientFill,
    BeginBitmapFill,
    EndFill,
    LineStyleSolid,
    LineStyleGradient,
    LineStyleBitmap,
    LineEnd,
    MoveTo,
    LineTo,
    CurveTo,
    CubicCurveTo,
  }

  export enum GradientType {
    Linear = 0x10,
    Radial = 0x12
  }

  export enum GradientSpreadMethod {
    Pad = 0,
    Reflect = 1,
    Repeat = 2
  }

  export enum GradientInterpolationMethod {
    RGB = 0,
    LinearRGB = 1
  }

  export interface ShapeMatrix {
    a: number;
    b: number;
    c: number;
    d: number;
    tx: number;
    ty: number;
  }

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
   * beginGradientFill:
   * Note: these fields are ordered this way to optimize performance in the rendering backend
   * byte command:        PathCommand.BeginGradientFill
   * byte gradientType:   GradientType.{LINEAR,RADIAL}
   * i8   focalPoint:     [-128,127]
   * matrix matrix:       transform matrix (see Matrix#writeExternal for details)
   * byte colorStops:     Number of color stop records that follow
   * list of byte,uint pairs:
   *      byte ratio:     [0-0xff]
   *      uint color:     [RGBA color]
   * byte spread:         SpreadMethod.{PAD,REFLECT,REPEAT}
   * byte interpolation:  InterpolationMethod.{RGB,LINEAR_RGB}
   *
   * beginBitmapFill:
   * byte command:  PathCommand.BeginBitmapFill
   * uint bitmapId: Id of the bitmapData object being used as the fill's texture
   * matrix matrix: transform matrix (see Matrix#writeExternal for details)
   * bool repeat
   * bool smooth
   *
   *
   * lineStyle:
   * byte command:      PathCommand.LineStyleSolid OR PathCommand.LineEnd
   * The following values are only emitted if the command is PathCommand.LineStyleSolid:
   * byte thickness:    [0-0xff]
   * uint color:        [RGBA color]
   * bool pixelHinting
   * byte scaleMode:    [0-3] see LineScaleMode.fromNumber for meaning
   * byte caps:         [0-2] see CapsStyle.fromNumber for meaning
   * byte joints:       [0-2] see JointStyle.fromNumber for meaning
   * byte miterLimit:   [0-0xff]
   *
   */
  export class ShapeData extends ArrayUtilities.DataBuffer {

    constructor() {
      super();
      this.endian = 'auto';
    }

    moveTo(x: number, y: number): void {
      this.writeUnsignedByte(PathCommand.MoveTo);
      this.writeInt(x);
      this.writeInt(y);
    }

    lineTo(x: number, y: number): void {
      this.writeUnsignedByte(PathCommand.LineTo);
      this.writeInt(x);
      this.writeInt(y);
    }

    curveTo(controlX: number, controlY: number, anchorX: number, anchorY: number): void {
      this.writeUnsignedByte(PathCommand.CurveTo);
      this.writeInt(controlX);
      this.writeInt(controlY);
      this.writeInt(anchorX);
      this.writeInt(anchorY);
    }

    cubicCurveTo(controlX1: number, controlY1: number, controlX2: number, controlY2: number,
                 anchorX: number, anchorY: number): void {
      this.writeUnsignedByte(PathCommand.CubicCurveTo);
      this.writeInt(controlX1);
      this.writeInt(controlY1);
      this.writeInt(controlX2);
      this.writeInt(controlY2);
      this.writeInt(anchorX);
      this.writeInt(anchorY);
    }

    beginFill(color: number): void {
      this.writeUnsignedByte(PathCommand.BeginSolidFill);
      this.writeUnsignedInt(color);
    }

    beginBitmapFill(bitmapId: number,
                    matrix: {a: number; b: number; c: number; d: number; tx: number; ty: number},
                    repeat: boolean, smooth: boolean): void
    {
      this.writeUnsignedByte(PathCommand.BeginBitmapFill);
      this.writeUnsignedInt(bitmapId);
      this._writeMatrix(matrix);
      this.writeBoolean(repeat);
      this.writeBoolean(smooth);
    }

    lineStyle(thickness: number, color: number, pixelHinting: boolean,
              scaleMode: number, caps: number, joints: number, miterLimit: number): void
    {
      this.writeUnsignedByte(PathCommand.LineStyleSolid);
      this.writeUnsignedByte(thickness);
      this.writeUnsignedInt(color);
      this.writeBoolean(pixelHinting);
      this.writeUnsignedByte(scaleMode);
      this.writeUnsignedByte(caps);
      this.writeUnsignedByte(joints);
      this.writeUnsignedByte(miterLimit);
    }

    /**
     * Gradients are specified the same for fills and strokes, so we only need to serialize them
     * once. The Parameter `pathCommand` is treated as the actual command to serialize, and must
     * be one of BeginGradientFill and LineStyleGradient.
     */
    beginGradient(pathCommand: PathCommand, colors: number[], ratios: number[],
                  gradientType: number, matrix: ShapeMatrix,
                  spread: number, interpolation: number, focalPointRatio: number)
    {
      assert(pathCommand === PathCommand.BeginGradientFill ||
             pathCommand === PathCommand.LineStyleGradient);
      this.writeUnsignedByte(pathCommand);
      this.writeUnsignedByte(gradientType);
      this.writeByte(focalPointRatio);

      this._writeMatrix(matrix);

      var colorStops = colors.length;
      this.writeByte(colorStops);
      for (var i = 0; i < colorStops; i++) {
        // Ratio must be valid, otherwise we'd have bailed above.
        this.writeUnsignedByte(ratios[i]);
        // Colors are coerced to uint32, with the highest byte stripped.
        this.writeUnsignedInt(colors[i]);
      }

      this.writeUnsignedByte(spread);
      this.writeUnsignedByte(interpolation);
    }

    private _writeMatrix(matrix: ShapeMatrix)
    {
      this.writeFloat(matrix.a);
      this.writeFloat(matrix.b);
      this.writeFloat(matrix.c);
      this.writeFloat(matrix.d);
      this.writeFloat(matrix.tx);
      this.writeFloat(matrix.ty);
    }
  }
}
