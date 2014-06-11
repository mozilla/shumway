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

/// <reference path='references.ts'/>
module Shumway.SWF.Parser {
  import PathCommand = Shumway.PathCommand;
  import GradientType = Shumway.GradientType;
  import GradientSpreadMethod = Shumway.GradientSpreadMethod;
  import GradientInterpolationMethod = Shumway.GradientInterpolationMethod;
  import Bounds = Shumway.Bounds;
  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
  import ShapeData = Shumway.ShapeData;
  import clamp = Shumway.NumberUtilities.clamp;
  import assert = Shumway.Debug.assert;
  import assertUnreachable = Shumway.Debug.assertUnreachable;
  var push = Array.prototype.push;

  enum FillType {
    Solid = 0,
    LinearGradient = 0x10,
    RadialGradient = 0x12,
    FocalRadialGradient = 0x13,
    RepeatingBitmap = 0x40,
    ClippedBitmap = 0x41,
    NonsmoothedRepeatingBitmap = 0x42,
    NonsmoothedClippedBitmap = 0x43,
  }

  /*
   * Applies the current segment to the paths of all styles specified in the last
   * style-change record.
   *
   * For fill0, we have to apply commands and their data in reverse order, to turn
   * left fills into right ones.
   *
   * If we have more than one style, we only recorded commands for the first one
   * and have to duplicate them for the other styles. The order is: fill1, line,
   * fill0. (That means we only ever recorded into fill0 if that's the only style.)
   */
  function applySegmentToStyles(segment: PathSegment, styles,
                                linePaths: SegmentedPath[], fillPaths: SegmentedPath[])
  {
    if (!segment) {
      return;
    }
    var path: SegmentedPath;
    if (styles.fill0) {
      path = fillPaths[styles.fill0 - 1];
      // If fill0 is the only style, we have pushed the segment to its stack. In
      // that case, just mark it as reversed and move on.
      if (!(styles.fill1 || styles.line)) {
        segment.isReversed = true;
        return;
      } else {
        path.addSegment(segment.toReversed());
      }
    }
    if (styles.line && styles.fill1) {
      path = linePaths[styles.line - 1];
      path.addSegment(segment.clone());
    }
  }

  /*
   * Converts records from the space-optimized format they're stored in to a
   * format that's more amenable to fast rendering.
   *
   * See http://blogs.msdn.com/b/mswanson/archive/2006/02/27/539749.aspx and
   * http://wahlers.com.br/claus/blog/hacking-swf-1-shapes-in-flash/ for details.
   */
  function convertRecordsToShapeData(records, fillPaths: SegmentedPath[],
                                     linePaths: SegmentedPath[], dictionary, dependencies,
                                     recordsMorph): ShapeData
  {
    var isMorph = recordsMorph !== null;
    isMorph = false;
    var styles = {fill0: 0, fill1: 0, line: 0};
    var segment: PathSegment = null;

    // Fill- and line styles can be added by style change records in the middle of
    // a shape records list. This also causes the previous paths to be treated as
    // a group, so the lines don't get moved on top of any following fills.
    // To support this, we just append all current fill and line paths to a list
    // when new styles are introduced.
    var allPaths: SegmentedPath[];
    // If no style is set for a segment of a path, a 1px transparent line is used.
    var defaultPath: SegmentedPath;

    //TODO: remove the `- 1` once we stop even parsing the EOS record
    var numRecords = records.length - 1;
    var x: number = 0;
    var y: number = 0;
    var morphX: number = 0;
    var morphY: number = 0;
    var path: SegmentedPath;
    for (var i = 0, j = 0; i < numRecords; i++) {
      var record = records[i];
      var morphRecord;
      if (isMorph) {
        morphRecord = recordsMorph[j++];
      }
      // type 0 is a StyleChange record
      if (record.type === 0) {
        //TODO: make the `has*` fields bitflags
        if (segment) {
          applySegmentToStyles(segment, styles, linePaths, fillPaths);
        }

        if (record.hasNewStyles) {
          if (!allPaths) {
            allPaths = [];
          }
          push.apply(allPaths, fillPaths);
          fillPaths = createPathsList(record.fillStyles, false, dictionary, dependencies);
          push.apply(allPaths, linePaths);
          linePaths = createPathsList(record.lineStyles, true, dictionary, dependencies);
          if (defaultPath) {
            allPaths.push(defaultPath);
            defaultPath = null;
          }
          styles = {fill0: 0, fill1: 0, line: 0};
        }

        if (record.hasFillStyle0) {
          styles.fill0 = record.fillStyle0;
        }
        if (record.hasFillStyle1) {
          styles.fill1 = record.fillStyle1;
        }
        if (record.hasLineStyle) {
          styles.line = record.lineStyle;
        }
        if (styles.fill1) {
          path = fillPaths[styles.fill1 - 1];
        } else if (styles.line) {
          path = linePaths[styles.line - 1];
        } else if (styles.fill0) {
          path = fillPaths[styles.fill0 - 1];
        }

        if (record.move) {
          x = record.moveX | 0;
          y = record.moveY | 0;
          // When morphed, StyleChangeRecords/MoveTo might not have a
          // corresponding record in the start or end shape --
          // processing morphRecord below before converting type 1 records.
        }

        // Very first record can be just fill/line-style definition record.
        if (path) {
          segment = PathSegment.FromDefaults(isMorph);
          path.addSegment(segment);

          // Move or not, we want this path segment to start where the last one
          // left off. Even if the last one belonged to a different style.
          // "Huh," you say? Yup.
          if (!isMorph) {
            segment.moveTo(x, y);
          } else {
            if (morphRecord.type === 0) {
              morphX = morphRecord.moveX | 0;
              morphY = morphRecord.moveY | 0;
            } else {
              morphX = x;
              morphY = y;
              // Not all moveTos are reflected in morph data.
              // In that case, decrease morph data index.
              j--;
            }
            segment.morphMoveTo(x, y, morphX, morphY);
          }
        }
      }
      // type 1 is a StraightEdge or CurvedEdge record
      else {
        assert(record.type === 1);
        if (!segment) {
          if (!defaultPath) {
            var style = {color: {red: 0, green: 0, blue: 0, alpha: 0}, width: 20};
            defaultPath = new SegmentedPath(null, processStyle(style, true, dictionary,
                                                               dependencies));
          }
          segment = PathSegment.FromDefaults(isMorph);
          defaultPath.addSegment(segment);
          if (!isMorph) {
            segment.moveTo(x, y);
          } else {
            segment.morphMoveTo(x, y, morphX, morphY);
          }
        }
        if (isMorph) {
          // An invalid SWF might contain a move in the EndEdges list where the
          // StartEdges list contains an edge. The Flash Player seems to skip it,
          // so we do, too.
          while (morphRecord && morphRecord.type === 0) {
            morphRecord = recordsMorph[j++];
          }
          // The EndEdges list might be shorter than the StartEdges list. Reuse
          // start edges as end edges in that case.
          if (!morphRecord) {
            morphRecord = record;
          }
        }

        if (record.isStraight && (!isMorph || morphRecord.isStraight)) {
          x += record.deltaX | 0;
          y += record.deltaY | 0;
          if (!isMorph) {
            segment.lineTo(x, y);
          } else {
            morphX += morphRecord.deltaX | 0;
            morphY += morphRecord.deltaY | 0;
            segment.morphLineTo(x, y, morphX, morphY);
          }
        } else {
          var cx, cy;
          var deltaX, deltaY;
          if (!record.isStraight) {
            cx = x + record.controlDeltaX | 0;
            cy = y + record.controlDeltaY | 0;
            x = cx + record.anchorDeltaX | 0;
            y = cy + record.anchorDeltaY | 0;
          } else {
            deltaX = record.deltaX | 0;
            deltaY = record.deltaY | 0;
            cx = x + (deltaX >> 1);
            cy = y + (deltaY >> 1);
            x += deltaX;
            y += deltaY;
          }
          segment.curveTo(cx, cy, x, y);
          if (!isMorph) {
          } else {
            if (!morphRecord.isStraight) {
              var morphCX = morphX + morphRecord.controlDeltaX | 0;
              var morphCY = morphY + morphRecord.controlDeltaY | 0;
              morphX = morphCX + morphRecord.anchorDeltaX | 0;
              morphY = morphCY + morphRecord.anchorDeltaY | 0;
            } else {
              deltaX = morphRecord.deltaX | 0;
              deltaY = morphRecord.deltaY | 0;
              var morphCX = morphX + (deltaX >> 1);
              var morphCY = morphY + (deltaY >> 1);
              morphX += deltaX;
              morphY += deltaY;
            }
            segment.morphCurveTo(cx, cy, x, y, morphCX, morphCY, morphX, morphY);
          }
        }
      }
    }
    applySegmentToStyles(segment, styles, linePaths, fillPaths);

    // All current paths get appended to the allPaths list at the end. First fill,
    // then line paths.
    if (allPaths) {
      push.apply(allPaths, fillPaths);
    } else {
      allPaths = fillPaths;
    }
    push.apply(allPaths, linePaths);
    if (defaultPath) {
      allPaths.push(defaultPath);
    }

    var shape: ShapeData = new ShapeData();
    for (i = 0; i < allPaths.length; i++) {
      allPaths[i].serialize(shape);
    }
    return shape;
  }

  var IDENTITY_MATRIX = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
  function processStyle(style, isLineStyle: boolean, dictionary, dependencies) {
    if (isLineStyle) {
      style.miterLimit = (style.miterLimitFactor || 1.5) * 2;
      if (!style.color && style.hasFill) {
        var fillStyle = processStyle(style.fillStyle, false, dictionary, dependencies);
        style.type = fillStyle.type;
        style.transform = fillStyle.transform;
        style.records = fillStyle.records;
        style.colors = fillStyle.colors;
        style.ratios = fillStyle.ratios;
        style.focalPoint = fillStyle.focalPoint;
        style.bitmapId = fillStyle.bitmapId;
        style.bitmapIndex = fillStyle.bitmapIndex;
        style.repeat = fillStyle.repeat;
        style.fillStyle = null;
        return style;
      } else {
        style.type = FillType.Solid;
      }
    }
    var color;
    if (style.type === undefined || style.type === FillType.Solid) {
      color = style.color;
      style.color = (color.red << 24) | (color.green << 16) | (color.blue << 8) | color.alpha;
      return style;
    }
    var scale;
    switch (style.type) {
      case FillType.LinearGradient:
      case FillType.RadialGradient:
      case FillType.FocalRadialGradient:
        var records = style.records;
        var colors = style.colors = [];
        var ratios = style.ratios = [];
        for (var i = 0; i < records.length; i++) {
          var record = records[i];
          var color = record.color;
          colors.push((color.red << 24) | (color.green << 16) | (color.blue << 8) | color.alpha);
          ratios.push(record.ratio);
        }
        scale = 819.2;
        break;
      case FillType.RepeatingBitmap:
      case FillType.ClippedBitmap:
      case FillType.NonsmoothedRepeatingBitmap:
      case FillType.NonsmoothedClippedBitmap:
        style.smooth = style.type !== FillType.NonsmoothedRepeatingBitmap &&
                       style.type !== FillType.NonsmoothedClippedBitmap;
        style.repeat = style.type !== FillType.ClippedBitmap &&
                       style.type !== FillType.NonsmoothedClippedBitmap;
        if (dictionary[style.bitmapId]) {
          style.bitmapIndex = dependencies.length;
          dependencies.push(style.bitmapId);
          scale = 0.05;
        } else {
          style.bitmapIndex = -1;
        }
        break;
      default:
        assertUnreachable('shape parser encountered invalid fill style');
    }
    if (!style.matrix) {
      style.transform = IDENTITY_MATRIX;
      return style;
    }
    var matrix = style.matrix;
    style.transform = {
      a: (matrix.a * scale),
      b: (matrix.b * scale),
      c: (matrix.c * scale),
      d: (matrix.d * scale),
      tx: matrix.tx/20,
      ty: matrix.ty/20
    };
    // null data that's unused from here on out
    style.matrix = null;
    return style;
  }

  /*
   * Paths are stored in 2-dimensional arrays. Each of the inner arrays contains
   * all the paths for a certain fill or line style.
   */
  function createPathsList(styles: any[], isLineStyle: boolean, dictionary: any,
                           dependencies: any): SegmentedPath[]
  {
    var paths: SegmentedPath[] = [];
    for (var i = 0; i < styles.length; i++) {
      var style = processStyle(styles[i], isLineStyle, dictionary, dependencies);
      if (!isLineStyle) {
        paths[i] = new SegmentedPath(style, null);
      } else {
        paths[i] = new SegmentedPath(null, style);
      }
    }
    return paths;
  }

  export function defineShape(tag, dictionary) {
    var dependencies = [];
    var fillPaths = createPathsList(tag.fillStyles, false, dictionary, dependencies);
    var linePaths = createPathsList(tag.lineStyles, true, dictionary, dependencies);
    var shape = convertRecordsToShapeData(tag.records, fillPaths, linePaths,
                                          dictionary, dependencies, tag.recordsMorph || null);

    var fillBounds: Bounds = Bounds.FromUntyped(tag.bbox);
    var lineBounds: Bounds = tag.strokeBbox ? Bounds.FromUntyped(tag.strokeBbox) : null;
    if (false && tag.bboxMorph) {
      var mbox = tag.bboxMorph;
      fillBounds.extendByPoint(mbox.xMin, mbox.yMin);
      fillBounds.extendByPoint(mbox.xMax, mbox.yMax);
      mbox = tag.strokeBboxMorph;
      if (mbox) {
        lineBounds.extendByPoint(mbox.xMin, mbox.yMin);
        lineBounds.extendByPoint(mbox.xMax, mbox.yMax);
      }
    }
    return {
      type: 'shape',
      id: tag.id,
      lineBounds: lineBounds,
      fillBounds: fillBounds,
      lineBoundsMorph: tag.strokeBboxMorph,
      fillBoundsMorph: tag.bboxMorph,
      isMorph: false && tag.isMorph,
      hasFills: fillPaths.length > 0,
      hasLines: linePaths.length > 0,
      shape: shape.toPlainObject(),
      transferables: shape.buffers,
      require: dependencies.length ? dependencies : null
    };
  }

  class PathSegment {

    private static _counter = 0;
    public id;
    private startPoint: string;
    private endPoint: string;

    constructor(public commands: DataBuffer, public data: DataBuffer,
                public prev: PathSegment, public next: PathSegment,
                public isMorph: boolean, public isReversed: boolean)
    {
      this.id = PathSegment._counter++;
    }

    static FromDefaults(isMorph: boolean) {
      var commands = new DataBuffer();
      var data = new DataBuffer();
      commands.endian = data.endian = 'auto';
      return new PathSegment(commands, data, null, null, isMorph, false);
    }

    moveTo(x: number, y: number) {
      this.commands.writeUnsignedByte(PathCommand.MoveTo);
      this.data.writeInt(x);
      this.data.writeInt(y);
    }

    morphMoveTo(x: number, y: number, mx: number, my: number) {
      this.moveTo(x, y);
      this.data.writeInt(mx);
      this.data.writeInt(my);
    }

    lineTo(x: number, y: number) {
      this.commands.writeUnsignedByte(PathCommand.LineTo);
      this.data.writeInt(x);
      this.data.writeInt(y);
    }

    morphLineTo(x: number, y: number, mx: number, my: number) {
      this.lineTo(x, y);
      this.data.writeInt(mx);
      this.data.writeInt(my);
    }

    curveTo(cpx: number, cpy: number, x: number, y: number) {
      this.commands.writeUnsignedByte(PathCommand.CurveTo);
      this.data.writeInt(cpx);
      this.data.writeInt(cpy);
      this.data.writeInt(x);
      this.data.writeInt(y);
    }

    morphCurveTo(cpx: number, cpy: number, x: number, y: number,
            mcpx: number, mcpy: number, mx: number, my: number)
    {
      this.curveTo(cpx, cpy, x, y);
      this.data.writeInt(mcpx);
      this.data.writeInt(mcpy);
      this.data.writeInt(mx);
      this.data.writeInt(my);
    }

    /**
     * Returns a shallow copy of the segment with the "isReversed" flag set.
     * Reversed segments play themselves back in reverse when they're merged into the final
     * non-segmented path.
     * Note: Don't modify the original, or the reversed copy, after this operation!
     */
    toReversed(): PathSegment {
      assert(!this.isReversed);
      return new PathSegment(this.commands, this.data, null, null, this.isMorph, true);
    }

    clone(): PathSegment {
      return new PathSegment(this.commands, this.data, null, null, this.isMorph, this.isReversed);
    }

    storeStartAndEnd() {
      var data = this.data.ints;
      var endPoint1 = data[0] + ',' + data[1];
      var endPoint2Offset = (this.data.length >> 2) - (this.isMorph ? 4 : 2);
      var endPoint2 = data[endPoint2Offset] + ',' + data[endPoint2Offset + 1];
      if (!this.isReversed) {
        this.startPoint = endPoint1;
        this.endPoint = endPoint2;
      } else {
        this.startPoint = endPoint2;
        this.endPoint = endPoint1;
      }
    }

    connectsTo(other: PathSegment): boolean {
      assert(other !== this);
      assert(this.endPoint);
      assert(other.startPoint);
      return this.endPoint === other.startPoint;
    }

    serialize(shape: ShapeData, lastPosition: {x: number; y: number}) {
      if (this.isReversed) {
        this._serializeReversed(shape, lastPosition);
        return;
      }
      var commands = this.commands.bytes;
      // Note: this *must* use `this.data.length`, because buffers will have padding.
      var dataLength = this.data.length >> 2;
      var isMorph = this.isMorph;
      var dataStride = isMorph ? 4 : 2;
      var data = this.data.ints;
      assert(commands[0] === PathCommand.MoveTo);
      // If the segment's first moveTo goes to the current coordinates, we have to skip it.
      var offset = 0;
      if (data[0] === lastPosition.x && data[1] === lastPosition.y) {
        offset++;
      }
      var commandsCount = this.commands.length;
      var dataPosition = offset * dataStride;
      for (var i = offset; i < commandsCount; i++) {
        dataPosition = this._writeCommand(commands[i], dataPosition, data, isMorph, shape);
      }
      assert(dataPosition === dataLength);
      lastPosition.x = data[dataLength - dataStride];
      lastPosition.y = data[dataLength - dataStride + 1];
    }
    private _serializeReversed(shape: ShapeData, lastPosition: {x: number; y: number}) {
      // For reversing the fill0 segments, we rely on the fact that each segment
      // starts with a moveTo. We first write a new moveTo with the final drawing command's
      // target coordinates (if we don't skip it, see below). For each of the following
      // commands, we take the coordinates of the command originally *preceding*
      // it as the new target coordinates. The final coordinates we target will be
      // the ones from the original first moveTo.
      var isMorph = this.isMorph;
      var dataStride = isMorph ? 4 : 2;
      // Note: these *must* use `this.{data,commands}.length`, because buffers will have padding.
      var commandsCount = this.commands.length;
      var dataPosition = (this.data.length >> 2) - dataStride;
      var commands = this.commands.bytes;
      assert(commands[0] === PathCommand.MoveTo);
      var data = this.data.ints;

      // Only write the first moveTo if it doesn't go to the current coordinates.
      if (data[dataPosition] !== lastPosition.x || data[dataPosition + 1] !== lastPosition.y) {
        this._writeCommand(PathCommand.MoveTo, dataPosition, data, isMorph, shape);
      }
      if (commandsCount === 1) {
        lastPosition.x = data[0];
        lastPosition.y = data[1];
        return;
      }
      for (var i = commandsCount; i-- > 1;) {
        dataPosition -= dataStride;
        var command: PathCommand = commands[i];
        shape.writeCommand(command);
        shape.writeCoordinates(data[dataPosition], data[dataPosition + 1]);
        if (isMorph) {
          shape.writeCoordinates(data[dataPosition] + 2, data[dataPosition + 3]);
        }
        if (command === PathCommand.CurveTo) {
          dataPosition -= dataStride;
          shape.writeCoordinates(data[dataPosition], data[dataPosition + 1]);
          if (isMorph) {
            shape.writeCoordinates(data[dataPosition] + 2, data[dataPosition + 3]);
          }
        } else {
        }
      }
      assert(dataPosition === 0);
      lastPosition.x = data[0];
      lastPosition.y = data[1];
    }
    private _writeCommand(command: PathCommand, position: number, data: Uint32Array,
                          isMorph: boolean, shape: ShapeData): number
    {
      shape.writeCommand(command);
      shape.writeCoordinates(data[position++], data[position++]);
      if (command === PathCommand.CurveTo) {
        shape.writeCoordinates(data[position++], data[position++]);
      }
      if (isMorph) {
        shape.writeCoordinates(data[position++], data[position++]);
        if (command === PathCommand.CurveTo) {
          shape.writeCoordinates(data[position++], data[position++]);
        }
      }
      return position;
    }
  }

  class SegmentedPath {
    private _head: PathSegment;
    constructor(public fillStyle, public lineStyle) {
      this._head = null;
    }

    addSegment(segment: PathSegment) {
      assert(segment);
      assert(segment.next === null);
      assert(segment.prev === null);
      var currentHead = this._head;
      if (currentHead) {
        assert(segment !== currentHead);
        currentHead.next = segment;
        segment.prev = currentHead;
      }
      this._head = segment;
    }

    // Does *not* reset the segment's prev and next pointers!
    removeSegment(segment: PathSegment) {
      if (segment.prev) {
        segment.prev.next = segment.next;
      }
      if (segment.next) {
        segment.next.prev = segment.prev;
      }
    }

    insertSegment(segment: PathSegment, next: PathSegment) {
      var prev = next.prev;
      segment.prev = prev;
      segment.next = next;
      if (prev) {
        prev.next = segment;
      }
      next.prev = segment;
    }

    head(): PathSegment {
      return this._head;
    }

    serialize(shape: ShapeData) {
      var segment = this.head();
      if (!segment) {
        // Path is empty.
        return;
      }

      while (segment) {
        segment.storeStartAndEnd();
        segment = segment.prev;
      }

      var start = this.head();
      var end = start;

      var finalRoot: PathSegment = null;
      var finalHead: PathSegment = null;

      // Path segments for one style can appear in arbitrary order in the tag's list
      // of edge records.
      // Before we linearize them, we have to identify all pairs of segments where
      // one ends at a coordinate the other starts at.
      // The following loop does that, by creating ever-growing runs of matching
      // segments. If no more segments are found that match the current run (either
      // at the beginning, or at the end), the current run is complete, and a new
      // one is started. Rinse, repeat, until no solitary segments remain.
      var current = start.prev;
      while (start) {
        while (current) {
          if (current.connectsTo(start)) {
            if (current.next !== start) {
              this.removeSegment(current);
              this.insertSegment(current, start);
            }
            start = current;
            current = start.prev;
            continue;
          }
          if (end.connectsTo(current)) {
            this.removeSegment(current);
            end.next = current;
            current = current.prev;
            end.next.prev = end;
            end.next.next = null;
            end = end.next;
            continue;
          }
          current = current.prev;
        }
        // This run of segments is finished. Store and forget it (for this loop).
        current = start.prev;
        if (!finalRoot) {
          finalRoot = start;
          finalHead = end;
        } else {
          finalHead.next = start;
          start.prev = finalHead;
          finalHead = end;
          finalHead.next = null;
        }
        if (!current) {
          break;
        }
        start = end = current;
        current = start.prev;
      }

      if (this.fillStyle) {
        var style = this.fillStyle;
        switch (style.type) {
          case FillType.Solid:
            shape.beginFill(style.color);
            break;
          case FillType.LinearGradient:
          case FillType.RadialGradient:
          case FillType.FocalRadialGradient:
            var gradientType = style.type === FillType.LinearGradient ?
                               GradientType.Linear :
                               GradientType.Radial;
            shape.beginGradient(PathCommand.BeginGradientFill, style.colors, style.ratios,
                                gradientType, style.transform, style.spreadMethod,
                                style.interpolationMode, style.focalPoint|0);
            break;
          case FillType.ClippedBitmap:
          case FillType.RepeatingBitmap:
          case FillType.NonsmoothedClippedBitmap:
          case FillType.NonsmoothedRepeatingBitmap:
            assert(style.bitmapIndex > -1);
            shape.beginBitmap(PathCommand.BeginBitmapFill, style.bitmapIndex, style.transform,
                              style.repeat, style.smooth);
            break;
          default:
            assertUnreachable('Invalid fill style type: ' + style.type);
        }
      } else {
        var style = this.lineStyle;
        assert(style);
        switch (style.type) {
          case FillType.Solid:
            writeLineStyle(style, shape);
            break;
          case FillType.LinearGradient:
          case FillType.RadialGradient:
          case FillType.FocalRadialGradient:
            var gradientType = style.type === FillType.LinearGradient ?
                               GradientType.Linear :
                               GradientType.Radial;
            writeLineStyle(style, shape);
            shape.beginGradient(PathCommand.LineStyleGradient, style.colors, style.ratios,
                                gradientType, style.transform, style.spreadMethod,
                                style.interpolationMode, style.focalPoint|0);
            break;
          case FillType.ClippedBitmap:
          case FillType.RepeatingBitmap:
          case FillType.NonsmoothedClippedBitmap:
          case FillType.NonsmoothedRepeatingBitmap:
            assert(style.bitmapIndex > -1);
            writeLineStyle(style, shape);
            shape.beginBitmap(PathCommand.LineStyleBitmap, style.bitmapIndex, style.transform,
                              style.repeat, style.smooth);
            break;
          default:
            console.error('Line style type not yet supported: ' + style.type);
        }
      }

      var lastPosition = {x: 0, y: 0};
      current = finalRoot;
      while (current) {
        current.serialize(shape, lastPosition);
        current = current.next;
      }
      if (this.fillStyle) {
        shape.endFill();
      } else {
        shape.endLine();
      }
      return shape;
    }
  }

  function writeLineStyle(style: any, shape: ShapeData): void {
    // No scaling == 0, normal == 1, vertical only == 2, horizontal only == 3.
    var scaleMode = style.noHscale ?
                    (style.noVscale ? 0 : 2) :
                    style.noVscale ? 3 : 1;
    // TODO: Figure out how to handle startCapsStyle
    var thickness = clamp(style.width, 0, 0xff * 20)|0;
    shape.lineStyle(thickness, style.color,
                    style.pixelHinting, scaleMode, style.endCapsStyle,
                    style.jointStyle, style.miterLimit);
  }
}
