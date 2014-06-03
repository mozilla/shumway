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
  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
  import nearestPowerOfTwo = Shumway.IntegerUtilities.nearestPowerOfTwo;
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

  export class PlainObjectShapeData {
    constructor(public commands: Uint8Array, public commandsPosition: number,
                public coordinates: Int32Array, public coordinatesPosition: number,
                public styles: ArrayBuffer, public stylesLength: number)
    {}
  }

  enum DefaultSize {
    Commands = 32,
    Coordinates = 128,
    Styles = 16
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
   * int x:         target x coordinate, in twips
   * int y:         target y coordinate, in twips
   *
   * lineTo:
   * byte command:  PathCommand.LineTo
   * int x:         target x coordinate, in twips
   * int y:         target y coordinate, in twips
   *
   * curveTo:
   * byte command:  PathCommand.CurveTo
   * int  controlX: control point x coordinate, in twips
   * int  controlY: control point y coordinate, in twips
   * int  anchorX:  target x coordinate, in twips
   * int  anchorY:  target y coordinate, in twips
   *
   * cubicCurveTo:
   * byte command:   PathCommand.CubicCurveTo
   * int controlX1:  control point 1 x coordinate, in twips
   * int controlY1:  control point 1 y coordinate, in twips
   * int controlX2:  control point 2 x coordinate, in twips
   * int controlY2:  control point 2 y coordinate, in twips
   * int anchorX:    target x coordinate, in twips
   * int anchorY:    target y coordinate, in twips
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
  export class ShapeData {

    commands: Uint8Array;
    commandsPosition: number;
    coordinates: Int32Array;
    coordinatesPosition: number;
    styles: DataBuffer;

    constructor(initialize: boolean = true) {
      if (initialize) {
        this.clear();
      }
    }

    static FromPlainObject(source: PlainObjectShapeData): ShapeData {
      var data = new ShapeData(false);
      data.commands = source.commands;
      data.coordinates = source.coordinates;
      data.commandsPosition = source.commandsPosition;
      data.coordinatesPosition = source.coordinatesPosition;
      data.styles = DataBuffer.FromArrayBuffer(source.styles, source.stylesLength);
      data.styles.endian = 'auto';
      return data;
    }

    moveTo(x: number, y: number): void {
      this.ensurePathCapacities(1, 2);
      this.commands[this.commandsPosition++] = PathCommand.MoveTo;
      this.coordinates[this.coordinatesPosition++] = x;
      this.coordinates[this.coordinatesPosition++] = y;
    }

    lineTo(x: number, y: number): void {
      this.ensurePathCapacities(1, 2);
      this.commands[this.commandsPosition++] = PathCommand.LineTo;
      this.coordinates[this.coordinatesPosition++] = x;
      this.coordinates[this.coordinatesPosition++] = y;
    }

    curveTo(controlX: number, controlY: number, anchorX: number, anchorY: number): void {
      this.ensurePathCapacities(1, 4);
      this.commands[this.commandsPosition++] = PathCommand.CurveTo;
      this.coordinates[this.coordinatesPosition++] = controlX;
      this.coordinates[this.coordinatesPosition++] = controlY;
      this.coordinates[this.coordinatesPosition++] = anchorX;
      this.coordinates[this.coordinatesPosition++] = anchorY;
    }

    cubicCurveTo(controlX1: number, controlY1: number, controlX2: number, controlY2: number,
                 anchorX: number, anchorY: number): void
    {
      this.ensurePathCapacities(1, 6);
      this.commands[this.commandsPosition++] = PathCommand.CubicCurveTo;
      this.coordinates[this.coordinatesPosition++] = controlX1;
      this.coordinates[this.coordinatesPosition++] = controlY1;
      this.coordinates[this.coordinatesPosition++] = controlX2;
      this.coordinates[this.coordinatesPosition++] = controlY2;
      this.coordinates[this.coordinatesPosition++] = anchorX;
      this.coordinates[this.coordinatesPosition++] = anchorY;
    }

    beginFill(color: number): void {
      this.ensurePathCapacities(1, 0);
      this.commands[this.commandsPosition++] = PathCommand.BeginSolidFill;
      this.styles.writeUnsignedInt(color);
    }

    beginBitmapFill(bitmapId: number,
                    matrix: {a: number; b: number; c: number; d: number; tx: number; ty: number},
                    repeat: boolean, smooth: boolean): void
    {
      this.ensurePathCapacities(1, 0);
      this.commands[this.commandsPosition++] = PathCommand.BeginBitmapFill;
      var styles: DataBuffer = this.styles;
      styles.writeUnsignedInt(bitmapId);
      this._writeStyleMatrix(matrix);
      styles.writeBoolean(repeat);
      styles.writeBoolean(smooth);
    }

    endFill() {
      this.ensurePathCapacities(1, 0);
      this.commands[this.commandsPosition++] = PathCommand.EndFill;
    }

    endLine() {
      this.ensurePathCapacities(1, 0);
      this.commands[this.commandsPosition++] = PathCommand.LineEnd;
    }

    lineStyle(thickness: number, color: number, pixelHinting: boolean,
              scaleMode: number, caps: number, joints: number, miterLimit: number): void
    {
      this.ensurePathCapacities(1, 0);
      this.commands[this.commandsPosition++] = PathCommand.LineStyleSolid;
      var styles: DataBuffer = this.styles;
      styles.writeUnsignedByte(thickness);
      styles.writeUnsignedInt(color);
      styles.writeBoolean(pixelHinting);
      styles.writeUnsignedByte(scaleMode);
      styles.writeUnsignedByte(caps);
      styles.writeUnsignedByte(joints);
      styles.writeUnsignedByte(miterLimit);
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

      this.ensurePathCapacities(1, 0);
      this.commands[this.commandsPosition++] = pathCommand;
      var styles: DataBuffer = this.styles;
      styles.writeUnsignedByte(gradientType);
      styles.writeByte(focalPointRatio);

      this._writeStyleMatrix(matrix);

      var colorStops = colors.length;
      styles.writeByte(colorStops);
      for (var i = 0; i < colorStops; i++) {
        // Ratio must be valid, otherwise we'd have bailed above.
        styles.writeUnsignedByte(ratios[i]);
        // Colors are coerced to uint32, with the highest byte stripped.
        styles.writeUnsignedInt(colors[i]);
      }

      styles.writeUnsignedByte(spread);
      styles.writeUnsignedByte(interpolation);
    }

    writeCommand(command: PathCommand) {
      this.ensurePathCapacities(1, 0);
      this.commands[this.commandsPosition++] = command;
    }

    writeCoordinates(x: number, y: number) {
      this.ensurePathCapacities(0, 2);
      this.coordinates[this.coordinatesPosition++] = x;
      this.coordinates[this.coordinatesPosition++] = y;
    }

    clear() {
      this.commandsPosition = this.coordinatesPosition = 0;
      this.commands = new Uint8Array(DefaultSize.Commands);
      this.coordinates = new Int32Array(DefaultSize.Coordinates);
      this.styles = new DataBuffer(DefaultSize.Styles);
      this.styles.endian = 'auto';
    }

    isEmpty() {
      return this.commandsPosition === 0;
    }

    clone(): ShapeData {
      var copy = new ShapeData(false);
      copy.commands = new Uint8Array(this.commands);
      copy.commandsPosition = this.commandsPosition;
      copy.coordinates = new Int32Array(this.coordinates);
      copy.coordinatesPosition = this.coordinatesPosition;
      copy.styles = new DataBuffer(this.styles.length);
      copy.styles.writeRawBytes(this.styles.bytes);
      return copy;
    }

    toPlainObject(): PlainObjectShapeData {
      return new PlainObjectShapeData(this.commands, this.commandsPosition, this.coordinates,
                                      this.coordinatesPosition, this.styles.buffer,
                                      this.styles.length);
    }

    public get buffers(): ArrayBuffer[] {
      return [this.commands.buffer, this.coordinates.buffer, this.styles.buffer];
    }

    private _writeStyleMatrix(matrix: ShapeMatrix)
    {
      var styles: DataBuffer = this.styles;
      styles.writeFloat(matrix.a);
      styles.writeFloat(matrix.b);
      styles.writeFloat(matrix.c);
      styles.writeFloat(matrix.d);
      styles.writeFloat(matrix.tx);
      styles.writeFloat(matrix.ty);
    }

    private ensurePathCapacities(numCommands: number, numCoordinates: number)
    {
      if (this.commands.length < this.commandsPosition + numCommands) {
        var oldCommands = this.commands;
        this.commands = new Uint8Array(nearestPowerOfTwo(this.commandsPosition + numCommands));
        this.commands.set(oldCommands, 0);
      }
      if (this.coordinates.length < this.coordinatesPosition + numCoordinates) {
        var oldCoordinates = this.coordinates;
        this.coordinates = new Int32Array(nearestPowerOfTwo(this.coordinatesPosition +
                                                            numCoordinates));
        this.coordinates.set(oldCoordinates, 0);
      }
    }
  }
}
