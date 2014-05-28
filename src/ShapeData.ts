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
  import clamp = NumberUtilities.clamp;
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

    beginFill(color: number, alpha: number): void {
      this.writeUnsignedByte(PathCommand.BeginSolidFill);
      this.writeUnsignedInt((color << 8) | alpha);
    }

    beginBitmapFill(bitmapId: number, matrix: {writeExternal: (DataBuffer) => void},
                    repeat: boolean, smooth: boolean): void
    {
      this.writeUnsignedByte(PathCommand.BeginBitmapFill);
      this.writeUnsignedInt(bitmapId);
      matrix.writeExternal(this);
      this.writeBoolean(repeat);
      this.writeBoolean(smooth);
    }

    lineStyle(thickness: number, color: number, alpha: number, pixelHinting: boolean,
              scaleMode: number, caps: number, joints: number, miterLimit: number): void
    {
      this.writeUnsignedByte(PathCommand.LineStyleSolid);
      this.writeUnsignedByte(thickness);
      this.writeUnsignedInt((color << 8) | alpha);
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
    beginGradient(pathCommand: PathCommand, colors, ratios, alphas, gradientType: number,
                  matrix: {writeExternal: (DataBuffer) => void},
                  spread: number, interpolation: number, focalPointRatio: number)
    {
      assert(pathCommand === PathCommand.BeginGradientFill ||
             pathCommand === PathCommand.LineStyleGradient);
      this.writeUnsignedByte(pathCommand);
      this.writeUnsignedByte(gradientType);

      var colorStops = colors.length;
      this.writeByte(colorStops);
      for (var i = 0; i < colorStops; i++) {
        // Colors are coerced to uint32, with the highest byte stripped.
        this.writeUnsignedInt(colors[i] >>> 0 & 0xffffff);
        // Alpha is clamped to [0,1] and scaled to 0xff.
        this.writeUnsignedByte(clamp(+alphas[i], 0, 1) * 0xff);
        // Ratio must be valid, otherwise we'd have bailed above.
        this.writeUnsignedByte(ratios[i]);
      }

      matrix.writeExternal(this);
      this.writeUnsignedByte(spread);
      this.writeUnsignedByte(interpolation);

      this.writeFloat(clamp(+focalPointRatio, -1, 1));
    }
  }
}
