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

  function log(message) {
    console.info(message);
  }

  var Graphics = flash.display.Graphics;
  var PathCommand = flash.display.PathCommand;

  var ByteArray = flash.utils.ByteArray;

  var LineScaleMode = flash.display.LineScaleMode;
  var CapsStyle = flash.display.CapsStyle;
  var JointStyle = flash.display.JointStyle;

  unitTests.push(basics);
  unitTests.push(clear);
  unitTests.push(beginFill);
  unitTests.push(lineStyle_defaults);
  unitTests.push(lineStyle_allArgs);
  unitTests.push(moveTo);
  unitTests.push(lineTo);
  unitTests.push(curveTo);
  unitTests.push(cubicCurveTo);
  unitTests.push(bounds);

  function basics() {
    var g = new Graphics();
    eq(g.getGraphicsData().length, 0, "Graphics instances start out empty");
  }

  function clear() {
    var g = new Graphics();
    g.lineStyle(1);
    g.lineTo(100, 100);
    neq(g.getGraphicsData().length, 0, "Graphics#lineStyle modifies instance's data");
    g.clear();
    eq(g.getGraphicsData().length, 0, "Graphics#clear empties the instance's data");
    structEq(g._getContentBounds(), {x: 0, width: 0, y: 0, height: 0}, "clear resets bounds");
  }

  function beginFill() {
    var g = new Graphics();
    g.beginFill(0xaabbcc);
    var bytes = cloneData(g.getGraphicsData());
    eq(bytes.readUnsignedByte(), PathCommand.BeginSolidFill, "fill is stored");
    eq(bytes.readUnsignedInt(), 0xaabbccff, "beginFill stores given color and default alpha");
    var g = new Graphics();
    g.beginFill(0xaabbcc, 0.5);
    var bytes = cloneData(g.getGraphicsData());
    bytes.readUnsignedByte();
    eq(bytes.readUnsignedInt(), 0xaabbcc80, "alpha is stored correctly");
    eq(bytes.bytesAvailable, 0, "instructions didn't write more bytes than expected");
  }

  function lineStyle_defaults() {
    var g = new Graphics();
    g.lineStyle(1);
    var bytes = cloneData(g.getGraphicsData());
    eq(bytes.readUnsignedByte(), PathCommand.LineStyleSolid, "style is stored");
    eq(bytes.readUnsignedByte(), 1, "given thickness is stored");
    eq(bytes.readUnsignedInt(), 0xff, "default color is full-opacity black");
    eq(bytes.readBoolean(), false, "defaults to no pixel hinting");
    eq(LineScaleMode.fromNumber(bytes.readUnsignedByte()), LineScaleMode.NORMAL,
       "defaults to normal scaling");
    eq(CapsStyle.fromNumber(bytes.readUnsignedByte()), CapsStyle.ROUND, "defaults to round caps");
    eq(JointStyle.fromNumber(bytes.readUnsignedByte()), JointStyle.ROUND,
       "defaults to round joints");
    eq(bytes.readUnsignedByte(), 3, "defaults to miterLimit of 3");
    eq(bytes.bytesAvailable, 0, "instructions didn't write more bytes than expected");
  }

  function lineStyle_allArgs() {
    var g = new Graphics();
    g.lineStyle(10, 0xaabbcc, 0.5, true, LineScaleMode.HORIZONTAL, CapsStyle.SQUARE,
                JointStyle.BEVEL, 10);
    var bytes = cloneData(g.getGraphicsData());
    eq(bytes.readUnsignedByte(), PathCommand.LineStyleSolid, "style is stored");
    eq(bytes.readUnsignedByte(), 10, "given thickness is stored");
    eq(bytes.readUnsignedInt(), 0xaabbcc80, "alpha is stored correctly");
    eq(bytes.readBoolean(), true, "pixel hinting is stored");
    eq(LineScaleMode.fromNumber(bytes.readUnsignedByte()), LineScaleMode.HORIZONTAL,
       "lineScaleMode is stored");
    eq(CapsStyle.fromNumber(bytes.readUnsignedByte()), CapsStyle.SQUARE, "capsStyle is stored");
    eq(JointStyle.fromNumber(bytes.readUnsignedByte()), JointStyle.BEVEL, "jointsStyle is stored");
    eq(bytes.readUnsignedByte(), 10, "miterLimit is stored");
    eq(bytes.bytesAvailable, 0, "instructions didn't write more bytes than expected");
  }

  function moveTo() {
    var g = new Graphics();
    g.moveTo(100, 50);
    var bytes = cloneData(g.getGraphicsData());
    eq(bytes.readUnsignedByte(), PathCommand.MoveTo, "command is stored");
    eq(bytes.readInt(), 100 * 20, "x is stored correctly");
    eq(bytes.readInt(), 50 * 20, "y is stored correctly");
    eq(bytes.bytesAvailable, 0, "instructions didn't write more bytes than expected");
  }

  function lineTo() {
    var g = new Graphics();
    g.lineTo(100, 50);
    var bytes = cloneData(g.getGraphicsData());
    eq(bytes.readUnsignedByte(), PathCommand.LineTo, "command is stored");
    eq(bytes.readInt(), 100 * 20, "x is stored correctly");
    eq(bytes.readInt(), 50 * 20, "y is stored correctly");
    eq(bytes.bytesAvailable, 0, "instructions didn't write more bytes than expected");
  }

  function curveTo() {
    var g = new Graphics();
    g.curveTo(100, 50, 0, 100);
    var bytes = cloneData(g.getGraphicsData());
    eq(bytes.readUnsignedByte(), PathCommand.CurveTo, "command is stored");
    eq(bytes.readInt(), 100 * 20, "x is stored correctly");
    eq(bytes.readInt(), 50 * 20, "y is stored correctly");
    eq(bytes.readInt(), 0 * 20, "x is stored correctly");
    eq(bytes.readInt(), 100 * 20, "y is stored correctly");
    eq(bytes.bytesAvailable, 0, "instructions didn't write more bytes than expected");
  }

  function cubicCurveTo() {
    var g = new Graphics();
    g.cubicCurveTo(100, 50, -100, 100, 0, 150);
    var bytes = cloneData(g.getGraphicsData());
    eq(bytes.readUnsignedByte(), PathCommand.CurveTo, "command is stored");
    eq(bytes.readInt(), 100 * 20, "x is stored correctly");
    eq(bytes.readInt(), 50 * 20, "y is stored correctly");
    eq(bytes.readInt(), -100 * 20, "x is stored correctly");
    eq(bytes.readInt(), 100 * 20, "y is stored correctly");
    eq(bytes.readInt(), 0 * 20, "x is stored correctly");
    eq(bytes.readInt(), 150 * 20, "y is stored correctly");
    eq(bytes.bytesAvailable, 0, "instructions didn't write more bytes than expected");
  }

  // Note: these tests aren't really valid, but will do as a first approximation.
  // (empty moves and stroke- and fill-less lines mustn't extend bounds.)
  function bounds() {
    var g = new Graphics();
    g.moveTo(150, 50);
    structEq(g._getContentBounds(), {x: 0, y: 0, width: 3000, height: 1000}, "move extends bounds");
    g.clear();
    g.lineTo(100, 50);
    structEq(g._getContentBounds(), {x: 0, y: 0, width: 2000, height: 1000}, "line extends bounds");
    g.clear();
    g.curveTo(100, 50, 0, 100);
    structEq(g._getContentBounds(), {x: 0, y: 0, width: 2000, height: 2000}, "curve extends bounds");
  }

  function cloneData(data) {
    var position = data.position;
    data.position = 0;
    var clone = new ByteArray();
    data.readBytes(clone);
    data.position = position;
    return clone;
  }

})();
