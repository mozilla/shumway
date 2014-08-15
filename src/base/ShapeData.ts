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
 * Serialization format for shape data:
 * (canonical, update this instead of anything else!)
 *
 * Shape data is serialized into a set of three buffers:
 * - `commands`: a Uint8Array for commands
 *  - valid values: [1-11] (i.e. one of the PathCommand enum values)
 * - `coordinates`: an Int32Array for path coordinates*
 *                  OR uint8 thickness iff the current command is PathCommand.LineStyleSolid
 *  - valid values: the full range of 32bit numbers, representing x,y coordinates in twips
 * - `styles`: a DataBuffer for style definitions
 *  - valid values: structs for the various style definitions as described below
 *
 * (*: with one exception: to make various things faster, stroke widths are stored in the
 * coordinates buffer, too.)
 *
 * All entries always contain all fields, default values aren't omitted.
 *
 * the various commands write the following sets of values into the various buffers:
 *
 * moveTo:
 * commands:      PathCommand.MoveTo
 * coordinates:   target x coordinate, in twips
 *                target y coordinate, in twips
 * styles:        n/a
 *
 * lineTo:
 * commands:      PathCommand.LineTo
 * coordinates:   target x coordinate, in twips
 *                target y coordinate, in twips
 * styles:        n/a
 *
 * curveTo:
 * commands:      PathCommand.CurveTo
 * coordinates:   control point x coordinate, in twips
 *                control point y coordinate, in twips
 *                target x coordinate, in twips
 *                target y coordinate, in twips
 * styles:        n/a
 *
 * cubicCurveTo:
 * commands:      PathCommand.CubicCurveTo
 * coordinates:   control point 1 x coordinate, in twips
 *                control point 1 y coordinate, in twips
 *                control point 2 x coordinate, in twips
 *                control point 2 y coordinate, in twips
 *                target x coordinate, in twips
 *                target y coordinate, in twips
 * styles:        n/a
 *
 * beginFill:
 * commands:      PathCommand.BeginSolidFill
 * coordinates:   n/a
 * styles:        uint32 - RGBA color
 *
 * beginGradientFill:
 * commands:      PathCommand.BeginGradientFill
 * coordinates:   n/a
 * Note: the style fields are ordered this way to optimize performance in the rendering backend
 * Note: the style record has a variable length depending on the number of color stops
 * styles:        uint8  - GradientType.{LINEAR,RADIAL}
 *                fix8   - focalPoint [-128.0xff,127.0xff]
 *                matrix - transform (see Matrix#writeExternal for details)
 *                uint8  - colorStops (Number of color stop records that follow)
 *                list of uint8,uint32 pairs:
 *                    uint8  - ratio [0-0xff]
 *                    uint32 - RGBA color
 *                uint8  - SpreadMethod.{PAD,REFLECT,REPEAT}
 *                uint8  - InterpolationMethod.{RGB,LINEAR_RGB}
 *
 * beginBitmapFill:
 * commands:      PathCommand.BeginBitmapFill
 * coordinates:   n/a
 * styles:        uint32 - Index of the bitmapData object in the Graphics object's `textures`
 *                         array
 *                matrix - transform (see Matrix#writeExternal for details)
 *                bool   - repeat
 *                bool   - smooth
 *
 * lineStyle:
 * commands:      PathCommand.LineStyleSolid
 * coordinates:   uint32 - thickness (!)
 * style:         uint32 - RGBA color
 *                bool   - pixelHinting
 *                uint8  - LineScaleMode, [0-3] see LineScaleMode.fromNumber for meaning
 *                uint8  - CapsStyle, [0-2] see CapsStyle.fromNumber for meaning
 *                uint8  - JointStyle, [0-2] see JointStyle.fromNumber for meaning
 *                uint8  - miterLimit
 *
 * lineGradientStyle:
 * commands:      PathCommand.LineStyleGradient
 * coordinates:   n/a
 * Note: the style fields are ordered this way to optimize performance in the rendering backend
 * Note: the style record has a variable length depending on the number of color stops
 * styles:        uint8  - GradientType.{LINEAR,RADIAL}
 *                int8   - focalPoint [-128,127]
 *                matrix - transform (see Matrix#writeExternal for details)
 *                uint8  - colorStops (Number of color stop records that follow)
 *                list of uint8,uint32 pairs:
 *                    uint8  - ratio [0-0xff]
 *                    uint32 - RGBA color
 *                uint8  - SpreadMethod.{PAD,REFLECT,REPEAT}
 *                uint8  - InterpolationMethod.{RGB,LINEAR_RGB}
 *
 * lineBitmapStyle:
 * commands:      PathCommand.LineBitmapStyle
 * coordinates:   n/a
 * styles:        uint32 - Index of the bitmapData object in the Graphics object's `textures`
 *                         array
 *                matrix - transform (see Matrix#writeExternal for details)
 *                bool   - repeat
 *                bool   - smooth
 *
 * lineEnd:
 * Note: emitted for invalid `lineStyle` calls
 * commands:      PathCommand.LineEnd
 * coordinates:   n/a
 * styles:        n/a
 *
 */

///<reference path='references.ts' />
module Shumway {
  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
  import ensureTypedArrayCapacity = Shumway.ArrayUtilities.ensureTypedArrayCapacity;

  import assert = Shumway.Debug.assert;
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
                public morphCoordinates: Int32Array,
                public styles: ArrayBuffer, public stylesLength: number) {
    }
  }

  enum DefaultSize {
    Commands = 32,
    Coordinates = 128,
    Styles = 16
  }

  export class ShapeData {

    commands: Uint8Array;
    commandsPosition: number;
    coordinates: Int32Array;
    // Note: creation and capacity-ensurance have to happen from the outside for this field.
    morphCoordinates: Int32Array;
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
      data.morphCoordinates = source.morphCoordinates;
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
      release || assert(thickness === (thickness | 0), thickness >= 0 && thickness <= 0xff * 20);
      this.ensurePathCapacities(2, 0);
      this.commands[this.commandsPosition++] = PathCommand.LineStyleSolid;
      this.coordinates[this.coordinatesPosition++] = thickness;
      var styles: DataBuffer = this.styles;
      styles.writeUnsignedInt(color);
      styles.writeBoolean(pixelHinting);
      styles.writeUnsignedByte(scaleMode);
      styles.writeUnsignedByte(caps);
      styles.writeUnsignedByte(joints);
      styles.writeUnsignedByte(miterLimit);
    }

    /**
     * Bitmaps are specified the same for fills and strokes, so we only need to serialize them
     * once. The Parameter `pathCommand` is treated as the actual command to serialize, and must
     * be one of BeginBitmapFill and LineStyleBitmap.
     */
    beginBitmap(pathCommand: PathCommand, bitmapId: number, matrix: ShapeMatrix,
                repeat: boolean, smooth: boolean): void
    {
      release || assert(pathCommand === PathCommand.BeginBitmapFill ||
             pathCommand === PathCommand.LineStyleBitmap);

      this.ensurePathCapacities(1, 0);
      this.commands[this.commandsPosition++] = pathCommand;
      var styles: DataBuffer = this.styles;
      styles.writeUnsignedInt(bitmapId);
      this._writeStyleMatrix(matrix);
      styles.writeBoolean(repeat);
      styles.writeBoolean(smooth);
    }

    /**
     * Gradients are specified the same for fills and strokes, so we only need to serialize them
     * once. The Parameter `pathCommand` is treated as the actual command to serialize, and must
     * be one of BeginGradientFill and LineStyleGradient.
     */
    beginGradient(pathCommand: PathCommand, colors: number[], ratios: number[],
                  gradientType: number, matrix: ShapeMatrix,
                  spread: number, interpolation: number, focalPointRatio: number) {

      release || assert(pathCommand === PathCommand.BeginGradientFill ||
             pathCommand === PathCommand.LineStyleGradient);

      this.ensurePathCapacities(1, 0);
      this.commands[this.commandsPosition++] = pathCommand;
      var styles: DataBuffer = this.styles;
      styles.writeUnsignedByte(gradientType);
      release || assert(focalPointRatio === (focalPointRatio | 0));
      styles.writeShort(focalPointRatio);

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

    writeCommandAndCoordinates(command: PathCommand, x: number, y: number) {
      this.ensurePathCapacities(1, 2);
      this.commands[this.commandsPosition++] = command;
      this.coordinates[this.coordinatesPosition++] = x;
      this.coordinates[this.coordinatesPosition++] = y;
    }

    writeCoordinates(x: number, y: number) {
      this.ensurePathCapacities(0, 2);
      this.coordinates[this.coordinatesPosition++] = x;
      this.coordinates[this.coordinatesPosition++] = y;
    }

    writeMorphCoordinates(x: number, y: number) {
      this.morphCoordinates = ensureTypedArrayCapacity(this.morphCoordinates,
                                                       this.coordinatesPosition);
      this.morphCoordinates[this.coordinatesPosition - 2] = x;
      this.morphCoordinates[this.coordinatesPosition - 1] = y;
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
      return new PlainObjectShapeData(this.commands, this.commandsPosition,
                                      this.coordinates, this.coordinatesPosition,
                                      this.morphCoordinates,
                                      this.styles.buffer, this.styles.length);
    }

    public get buffers(): ArrayBuffer[] {
      var buffers = [this.commands.buffer, this.coordinates.buffer, this.styles.buffer];
      if (this.morphCoordinates) {
        buffers.push(this.morphCoordinates.buffer);
      }
      return buffers;
    }

    private _writeStyleMatrix(matrix: ShapeMatrix) {
      var styles: DataBuffer = this.styles;
      styles.writeFloat(matrix.a);
      styles.writeFloat(matrix.b);
      styles.writeFloat(matrix.c);
      styles.writeFloat(matrix.d);
      styles.writeFloat(matrix.tx);
      styles.writeFloat(matrix.ty);
    }

    private ensurePathCapacities(numCommands: number, numCoordinates: number) {

      // ensureTypedArrayCapacity will hopefully be inlined, in which case the field writes
      // will be optimized out.
      this.commands = ensureTypedArrayCapacity(this.commands, this.commandsPosition + numCommands);
      this.coordinates = ensureTypedArrayCapacity(this.coordinates,
                                                  this.coordinatesPosition + numCoordinates);
    }
  }
}
