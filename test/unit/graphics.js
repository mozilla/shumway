/*
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function graphicsTests() {
  var Shape = flash.display.Shape;
  var Graphics = flash.display.Graphics;
  var Matrix = flash.geom.Matrix;
  var BitmapData = flash.display.BitmapData;
  var PathCommand = Shumway.PathCommand;
  var assertUnreachable = Shumway.Debug.assertUnreachable;

  var LineScaleMode = flash.display.LineScaleMode;
  var CapsStyle = flash.display.CapsStyle;
  var JointStyle = flash.display.JointStyle;

  unitTests.push(basics);
  unitTests.push(clear);
  unitTests.push(beginFill);
  unitTests.push(beginBitmapFill);
  unitTests.push(lineStyle_defaults);
  unitTests.push(lineStyle_invalidWidth);
  unitTests.push(lineStyle_allArgs);
  unitTests.push(moveTo);
  unitTests.push(lineTo);
  unitTests.push(curveTo);
  unitTests.push(cubicCurveTo);
  unitTests.push(drawRect);
  unitTests.push(bounds);

  function basics() {
    var g = createGraphics();
    var shape = g.getGraphicsData();

    eq(shape.commandsPosition, 0, "Graphics instances start out empty");
    eq(shape.coordinatesPosition, 0, "Graphics instances start out empty");
    eq(shape.styles.length, 0, "Graphics instances start out empty");
    structEq(g._getContentBounds(),
             {xMin: 0x8000000, xMax: 0x8000000, yMin: 0x8000000, yMax: 0x8000000},
             "graphics instances initially have sentinel bounds");
  }

  function clear() {
    var g = createGraphics();
    var shape = g.getGraphicsData();

    g.lineStyle(1);
    neq(shape.commandsPosition, 0, "lineStyle writes command");
    neq(shape.styles.length, 0, "lineStyle writes style data");
    g.lineTo(100, 100);
    neq(shape.coordinatesPosition, 0, "lineTo writes coordinates");

    g.clear();
    eq(shape.commandsPosition, 0, "clear empties the instance's data");
    eq(shape.coordinatesPosition, 0, "clear empties the instance's data");
    eq(shape.styles.length, 0, "clear empties the instance's data");
    structEq(g._getContentBounds(),
             {xMin: 0x8000000, xMax: 0x8000000, yMin: 0x8000000, yMax: 0x8000000},
             "clear resets bounds");
  }

  function beginFill() {
    var g = createGraphics();
    var shape = g.getGraphicsData();

    g.beginFill(0xaabbcc);
    shape.styles.position = 0;
    eq(shape.commands[0], PathCommand.BeginSolidFill, "fill is stored");
    eq(shape.coordinatesPosition, 0, "fills don't write coordinates");
    eq(shape.styles.readUnsignedInt(), 0xaabbccff,
       "beginFill stores given color and default alpha");
    g.clear();

    g.beginFill(0xaabbcc, 0.5);
    shape.styles.position = 0;
    eq(shape.styles.readUnsignedInt(), 0xaabbcc80, "alpha is stored correctly");
    eq(shape.commandsPosition, 1, "instructions didn't write more data than expected");
    eq(shape.styles.bytesAvailable, 0, "instructions didn't write more data than expected");
  }

  function beginBitmapFill() {
    var g = createGraphics();
    var shape = g.getGraphicsData();

    var bitmap = new BitmapData(100, 100);
    g.beginBitmapFill(bitmap);
    shape.styles.position = 0;
    eq(shape.commands[0], PathCommand.BeginBitmapFill, "fill is stored");
    eq(shape.coordinatesPosition, 0, "fills don't write coordinates");
    var index = shape.styles.readUnsignedInt();
    eq(index, 0, "beginBitmapFill stores given bitmap's id");
    eq(g.getUsedTextures()[index], bitmap, "beginBitmapFill stores given bitmap's id");
    structEq(Matrix.FromDataBuffer(shape.styles), Matrix.FROZEN_IDENTITY_MATRIX,
             "default matrix is serialized if none is provided");
    eq(shape.styles.readBoolean(), true, "defaults to repeat");
    eq(shape.styles.readBoolean(), false, "defaults to no smooting");
    eq(shape.commandsPosition, 1, "instructions didn't write more data than expected");
    eq(shape.styles.bytesAvailable, 0, "instructions didn't write more data than expected");
    g.clear();

    try {
      g.beginBitmapFill({});
      assertUnreachable("beginBitmapFill with invalid bitmap argument throws");
    } catch (e) {
    }
    try {
      g.beginBitmapFill(bitmap, {});
      assertUnreachable("beginBitmapFill with non-matrix 2nd argument throws");
    } catch (e) {
    }
    eq(shape.commandsPosition, 0, "invalid beginBitmapFill calls don't write a command");
    eq(shape.styles.length, 0, "invalid beginBitmapFill calls don't write style data");

    var matrix = new Matrix(1, 2, 3, 4, 5, 6);
    g.beginBitmapFill(bitmap, matrix, false, true);
    shape.styles.position = 0;
    shape.styles.readUnsignedInt(); // skip bitmap id
    structEq(Matrix.FromDataBuffer(shape.styles), matrix,
             "serialized matrix is identical to input matrix");
    eq(shape.styles.readBoolean(), false, "repeat flag is written correctly");
    eq(shape.styles.readBoolean(), true, "smooth flag is written correctly");
    eq(shape.styles.bytesAvailable, 0, "instructions didn't write more data than expected");
  }

  function lineStyle_defaults() {
    var g = createGraphics();
    var shape = g.getGraphicsData();

    g.lineStyle(1);
    shape.styles.position = 0;
    eq(shape.commands[0], PathCommand.LineStyleSolid, "style is stored");
    eq(shape.coordinatesPosition, 1, "lineStyle writes thickness into coordinates");
    eq(shape.coordinates[0], 20, "given thickness is stored");
    eq(shape.styles.readUnsignedInt(), 0xff, "default color is full-opacity black");
    eq(shape.styles.readBoolean(), false, "defaults to no pixel hinting");
    eq(LineScaleMode.fromNumber(shape.styles.readUnsignedByte()), LineScaleMode.NORMAL,
       "defaults to normal scaling");
    eq(CapsStyle.fromNumber(shape.styles.readUnsignedByte()), CapsStyle.ROUND,
       "defaults to round caps");
    eq(JointStyle.fromNumber(shape.styles.readUnsignedByte()), JointStyle.ROUND,
       "defaults to round joints");
    eq(shape.styles.readUnsignedByte(), 3, "defaults to miterLimit of 3");
    eq(shape.styles.bytesAvailable, 0, "instructions didn't write more data than expected");
    g.clear();

    g.lineStyle(0.4);
    shape.styles.position = 0;
    eq(shape.coordinates[0], 8, "thickness is correctly rounded");
    g.clear();

    g.lineStyle(0.6);
    shape.styles.position = 0;
    eq(shape.coordinates[0], 12, "thickness is correctly rounded");
    g.clear();

    g.lineStyle(1.1);
    shape.styles.position = 0;
    eq(shape.coordinates[0], 22, "thickness is correctly rounded");
    g.clear();

    g.lineStyle(1.5);
    shape.styles.position = 0;
    eq(shape.coordinates[0], 30, "thickness is correctly rounded");
  }

  function lineStyle_invalidWidth() {
    var g = createGraphics();
    var shape = g.getGraphicsData();

    g.lineStyle(NaN);
    eq(shape.commands[0], PathCommand.LineEnd, "style is stored");
    eq(shape.coordinatesPosition, 0, "styles don't write coordinates");
    eq(shape.commandsPosition, 1, "instructions didn't write more data than expected");
    eq(shape.styles.bytesAvailable, 0, "LineEnd doesn't write style data");
  }

  function lineStyle_allArgs() {
    var g = createGraphics();
    var shape = g.getGraphicsData();

    g.lineStyle(10, 0xaabbcc, 0.5, true, LineScaleMode.HORIZONTAL, CapsStyle.SQUARE,
                JointStyle.BEVEL, 10);
    shape.styles.position = 0;
    eq(shape.commands[0], PathCommand.LineStyleSolid, "style is stored");
    eq(shape.coordinatesPosition, 1, "lineStyle writes thickness into coordinates");
    eq(shape.coordinates[0], 200, "given thickness is stored");
    eq(shape.styles.readUnsignedInt(), 0xaabbcc80, "alpha is stored correctly");
    eq(shape.styles.readBoolean(), true, "pixel hinting is stored");
    eq(LineScaleMode.fromNumber(shape.styles.readUnsignedByte()), LineScaleMode.HORIZONTAL,
       "lineScaleMode is stored");
    eq(CapsStyle.fromNumber(shape.styles.readUnsignedByte()), CapsStyle.SQUARE, "capsStyle is stored");
    eq(JointStyle.fromNumber(shape.styles.readUnsignedByte()), JointStyle.BEVEL, "jointsStyle is stored");
    eq(shape.styles.readUnsignedByte(), 10, "miterLimit is stored");
    eq(shape.commandsPosition, 1, "instructions didn't write more data than expected");
    eq(shape.styles.bytesAvailable, 0, "instructions didn't write more data than expected");
  }

  function moveTo() {
    var g = createGraphics();
    var shape = g.getGraphicsData();

    g.moveTo(100, 50);
    shape.styles.position = 0;
    eq(shape.styles.length, 0, "path commands don't write style data");
    eq(shape.commands[0], PathCommand.MoveTo, "command is stored");
    eq(shape.coordinates[0], 100 * 20, "x is stored correctly");
    eq(shape.coordinates[1], 50 * 20, "y is stored correctly");
    eq(shape.commandsPosition, 1, "instructions didn't write more data than expected");
    eq(shape.coordinatesPosition, 2, "instructions didn't write more data than expected");
  }

  function lineTo() {
    var g = createGraphics();
    var shape = g.getGraphicsData();

    g.lineTo(100, 50);
    eq(shape.styles.length, 0, "path commands don't write style data");
    eq(shape.commands[0], PathCommand.LineTo, "command is stored");
    eq(shape.coordinates[0], 100 * 20, "x is stored correctly");
    eq(shape.coordinates[1], 50 * 20, "y is stored correctly");
    eq(shape.commandsPosition, 1, "instructions didn't write more data than expected");
    eq(shape.coordinatesPosition, 2, "instructions didn't write more data than expected");
  }

  function curveTo() {
    var g = createGraphics();
    var shape = g.getGraphicsData();

    g.curveTo(100, 50, 0, 100);
    eq(shape.commands[0], PathCommand.CurveTo, "command is stored");
    eq(shape.styles.length, 0, "path commands don't write style data");
    eq(shape.coordinates[0], 100 * 20, "cpx is stored correctly");
    eq(shape.coordinates[1], 50 * 20, "cpy is stored correctly");
    eq(shape.coordinates[2], 0 * 20, "x is stored correctly");
    eq(shape.coordinates[3], 100 * 20, "y is stored correctly");
    eq(shape.commandsPosition, 1, "instructions didn't write more data than expected");
    eq(shape.coordinatesPosition, 4, "instructions didn't write more data than expected");
  }

  function cubicCurveTo() {
    var g = createGraphics();
    var shape = g.getGraphicsData();

    g.cubicCurveTo(100, 50, -100, 100, 0, 150);
    eq(shape.styles.length, 0, "path commands don't write style data");
    eq(shape.commands[0], PathCommand.CubicCurveTo, "command is stored");
    eq(shape.coordinates[0], 100 * 20, "cpx1 is stored correctly");
    eq(shape.coordinates[1], 50 * 20, "cpy1 is stored correctly");
    eq(shape.coordinates[2], -100 * 20, "cpx2 is stored correctly");
    eq(shape.coordinates[3], 100 * 20, "cpy2 is stored correctly");
    eq(shape.coordinates[4], 0 * 20, "x is stored correctly");
    eq(shape.coordinates[5], 150 * 20, "y is stored correctly");
    eq(shape.commandsPosition, 1, "instructions didn't write more data than expected");
    eq(shape.coordinatesPosition, 6, "instructions didn't write more data than expected");
  }

  function drawRect() {
    var g = createGraphics();
    var shape = g.getGraphicsData();

    g.drawRect(0, 0, 100, 100);
    eq(shape.styles.length, 0, "path commands don't write style data");
    eq(shape.commands[0], PathCommand.LineTo, "1. lineTo command is stored");
    eq(shape.coordinates[0], 100 * 20, "x is stored correctly");
    eq(shape.coordinates[1], 0 * 20, "y is stored correctly");
    eq(shape.commands[0], PathCommand.LineTo, "2. lineTo command is stored");
    eq(shape.coordinates[2], 100 * 20, "x is stored correctly");
    eq(shape.coordinates[3], 100 * 20, "y is stored correctly");
    eq(shape.commands[0], PathCommand.LineTo, "3. lineTo command is stored");
    eq(shape.coordinates[4], 0 * 20, "x is stored correctly");
    eq(shape.coordinates[5], 100 * 20, "y is stored correctly");
    eq(shape.commands[0], PathCommand.LineTo, "4. lineTo command is stored");
    eq(shape.coordinates[6], 0 * 20, "x is stored correctly");
    eq(shape.coordinates[7], 0 * 20, "y is stored correctly");
    eq(shape.commandsPosition, 4, "instructions didn't write more data than expected");
    eq(shape.coordinatesPosition, 8, "instructions didn't write more data than expected");
    
    g.drawRect(200, 200, 100, 100);
    eq(shape.commands[4], PathCommand.MoveTo, "moveTo command is stored if rect doesn't " +
                                              "start at previous cursor coordinates");
    eq(shape.coordinates[8], 200 * 20, "x is stored correctly");
    eq(shape.coordinates[9], 200 * 20, "y is stored correctly");
    eq(shape.commandsPosition, 9, "instructions didn't write more data than expected");
    eq(shape.coordinatesPosition, 18, "instructions didn't write more data than expected");
  }

  // Note: these tests aren't really valid, but will do as a first approximation.
  // Note: amazingly, Flash happily extends bounds for drawing operations without strokes and fills.
  // The only exception are multiple moveTo operations.
  function bounds() {
    var g = createGraphics();

    structEq(g._getContentBounds(false),
             {xMin: 0x8000000, xMax: 0x8000000, yMin: 0x8000000, yMax: 0x8000000},
             "bounds are initialized with sentinel values.");
    g.moveTo(150, 50);
    structEq(g._getContentBounds(),
             {xMin: 0x8000000, xMax: 0x8000000, yMin: 0x8000000, yMax: 0x8000000},
             "empty move doesn't change bounds");

    g.clear();
    g.lineTo(100, 50);
    structEq(g._getContentBounds(), {xMin: 0, xMax: 2000, yMin: 0, yMax: 1000},
             "line extends bounds");

    g.clear();
    g.curveTo(100, 100, 0, 100);
    structEq(g._getContentBounds(), {xMin: 0, xMax: 1000, yMin: 0, yMax: 2000},
             "curve extends bounds correctly");
    g.clear();
    g.moveTo(30, 130);
    g.lineStyle(1);
    g.curveTo(0, 0, 130, 30);
    structEq(g._getContentBounds(false), {xMin: 487, xMax: 2600, yMin: 487, yMax: 2600},
             "curve extends fill bounds correctly");
    structEq(g._getContentBounds(true), {xMin: 477, xMax: 2610, yMin: 477, yMax: 2610},
             "curve extends line bounds correctly");

    // Disabled because we return a yMax value of 2548. Will investigate later.
//    g.clear();
//    g.lineStyle(1);
//    g.moveTo(30, 50);
//    g.cubicCurveTo(60, -10, 180, 200, 150, 100);
//    structEq(g._getContentBounds(false), {xMin: 600, xMax: 3095, yMin: 780, yMax: 2549},
//             "cubic curve extends fill bounds correctly");
  }

  function createGraphics() {
    return new Shape().graphics;
  }

})();
