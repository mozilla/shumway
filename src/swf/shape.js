/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
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
/*global fail, push, cloneObject, rgbaObjToStr */

var GRAPHICS_FILL_CLIPPED_BITMAP               = 65;
var GRAPHICS_FILL_FOCAL_RADIAL_GRADIENT        = 19;
var GRAPHICS_FILL_LINEAR_GRADIENT              = 16;
var GRAPHICS_FILL_NONSMOOTHED_CLIPPED_BITMAP   = 67;
var GRAPHICS_FILL_NONSMOOTHED_REPEATING_BITMAP = 66;
var GRAPHICS_FILL_RADIAL_GRADIENT              = 18;
var GRAPHICS_FILL_REPEATING_BITMAP             = 64;
var GRAPHICS_FILL_SOLID                        =  0;

/*
 * Applies the current segment to the paths of all styles specified in the last
 * style-change record.
 *
 * For fill0, we have to apply commands and their data in reverse order, to turn
 * left fills into right ones.
 *
 * If we have more than one style, we only recorded commands for the first one
 * and have to duplicate them for the other styles. The order is: fill1, line,
 * fill0.
 */
function applySegmentToStyles(segment, styles, linePaths, fillPaths, isMorph)
{
  if (!segment) {
    return;
  }
  var commands = segment.commands;
  var data = segment.data;
  var morphData = segment.morphData;
  if (morphData) {
    assert(morphData.length === data.length);
  }
  assert(commands);
  assert(data);
  assert(isMorph === (morphData !== null));
  var path;
  var targetSegment;
  var command;
  var i;
  if (styles.fill0) {
    path = fillPaths[styles.fill0 - 1];
    // If fill0 is the only style, we have pushed the segment to its stack. In
    // that case, we have to replace its commands and data in place.
    if (!(styles.fill1 || styles.line)) {
      targetSegment = path.head();
      targetSegment.commands = [];
      targetSegment.data = [];
      targetSegment.morphData = isMorph ? [] : null;
    } else {
      targetSegment = path.addSegment([], [], isMorph ? [] : null);
    }

    // For reversing the fill0 segments, we rely on the fact that each segment
    // starts with a moveTo. We push a new moveTo on the reversed stack, with
    // the final drawing command's target coordinates. For each of the following
    // commands, we take the coordinates of the command originally *preceding*
    // it as the new target coordinates. The final coordinates we target will be
    // the ones from the original first moveTo.
    var targetCommands = targetSegment.commands;
    var targetData = targetSegment.data;
    var targetMorphData = targetSegment.morphData;
    targetCommands.push(SHAPE_MOVE_TO);
    var j = data.length - 2;
    targetData.push(data[j], data[j + 1]);
    if (isMorph) {
      targetMorphData.push(morphData[j], morphData[j + 1]);
    }
    for (i = commands.length; i-- > 1; j -= 2) {
      command = commands[i];
      targetCommands.push(command);
      targetData.push(data[j - 2], data[j - 1]);
      if (isMorph) {
        targetMorphData.push(morphData[j - 2], morphData[j - 1]);
      }
      if (command === SHAPE_CURVE_TO) {
        targetData.push(data[j - 4], data[j - 3]);
        if (isMorph) {
            targetMorphData.push(morphData[j - 4], morphData[j - 3]);
        }
        j -= 2;
      }
    }
    assert(j === 0);
    if (isMorph) {
      assert(targetMorphData.length === targetData.length);
    }
  }
  if (styles.line && styles.fill1)
  {
    path = linePaths[styles.line - 1];
    path.addSegment(commands, data, morphData);
  }
}

/*
 * Converts records from the space-optimized format they're stored in to a
 * format that's more amenable to fast rendering.
 *
 * See http://blogs.msdn.com/b/mswanson/archive/2006/02/27/539749.aspx and
 * http://wahlers.com.br/claus/blog/hacking-swf-1-shapes-in-flash/ for details.
 */
function convertRecordsToStyledPaths(records, fillPaths, linePaths, dictionary,
                                     dependencies, recordsMorph, transferables)
{
  var isMorph = recordsMorph !== null;
  var styles = {fill0: 0, fill1: 0, line: 0};
  var segment = null;

  // Fill- and line styles can be added by style change records in the middle of
  // a shape records list. This also causes the previous paths to be treated as
  // a group, so the lines don't get moved on top of any following fills.
  // To support this, we just append all current fill and line paths to a list
  // when new styles are introduced.
  var allPaths;
  // If no style is set for a segment of a path, a 1px black line is used.
  var defaultPath;

  //TODO: remove the `- 1` once we stop even parsing the EOS record
  var numRecords = records.length - 1;
  var x = 0;
  var y = 0;
  var morphX = 0;
  var morphY = 0;
  var path;
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
        applySegmentToStyles(segment, styles, linePaths, fillPaths, isMorph);
      }

      if (record.hasNewStyles) {
        if (!allPaths) {
          allPaths = [];
        }
        push.apply(allPaths, fillPaths);
        fillPaths = createPathsList(record.fillStyles, false,
                                    dictionary, dependencies);
        push.apply(allPaths, linePaths);
        linePaths = createPathsList(record.lineStyles, true,
                                    dictionary, dependencies);
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
        x = record.moveX|0;
        y = record.moveY|0;
        // When morphed, StyleChangeRecords/MoveTo might not have a
        // corresponding record in the start or end shape --
        // processing morphRecord below before converting type 1 records.
      }

      // Very first record can be just fill/line-style definition record.
      if (path) {
        segment = path.addSegment([], [], isMorph ? [] : null);

        // Move or not, we want this path segment to start where the last one
        // left off. Even if the last one belonged to a different style.
        // "Huh," you say? Yup.
        segment.commands.push(SHAPE_MOVE_TO);
        segment.data.push(x, y);
        if (isMorph) {
          if (morphRecord.type === 0) {
            morphX = morphRecord.moveX|0;
            morphY = morphRecord.moveY|0;
          } else {
            morphX = x;
            morphY = y;
            // Not all moveTos are reflected in morph data.
            // In that case, decrease morph data index.
            j--;
          }
          segment.morphData.push(morphX, morphY);
        }
      }
    }
    // type 1 is a StraightEdge or CurvedEdge record
    else {
      assert(record.type === 1);
      if (!segment) {
        if (!defaultPath) {
          var style = {color:{red:0, green: 0, blue: 0, alpha: 255}, width: 20};
          defaultPath = new SegmentedPath(null, processStyle(style, true));
        }
        segment = defaultPath.addSegment([], [], isMorph ? [] : null);
        segment.commands.push(SHAPE_MOVE_TO);
        segment.data.push(x, y);
        if (isMorph) {
          segment.morphData.push(morphX, morphY);
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
        x += record.deltaX|0;
        y += record.deltaY|0;
        segment.commands.push(SHAPE_LINE_TO);
        segment.data.push(x, y);

        if (isMorph) {
          morphX += morphRecord.deltaX|0;
          morphY += morphRecord.deltaY|0;
          segment.morphData.push(morphX, morphY);
        }
      } else {
        var cx, cy;
        var deltaX, deltaY;
        if (!record.isStraight) {
          cx = x + record.controlDeltaX|0;
          cy = y + record.controlDeltaY|0;
          x = cx + record.anchorDeltaX|0;
          y = cy + record.anchorDeltaY|0;
        } else {
          deltaX = record.deltaX|0;
          deltaY = record.deltaY|0;
          cx = x + (deltaX >> 1);
          cy = y + (deltaY >> 1);
          x += deltaX;
          y += deltaY;
        }
        segment.commands.push(SHAPE_CURVE_TO);
        segment.data.push(cx, cy, x, y);
        if (isMorph) {
          if (!morphRecord.isStraight) {
            cx = morphX + morphRecord.controlDeltaX|0;
            cy = morphY + morphRecord.controlDeltaY|0;
            morphX = cx + morphRecord.anchorDeltaX|0;
            morphY = cy + morphRecord.anchorDeltaY|0;
          } else {
            deltaX = morphRecord.deltaX|0;
            deltaY = morphRecord.deltaY|0;
            cx = morphX + (deltaX >> 1);
            cy = morphY + (deltaY >> 1);
            morphX += deltaX;
            morphY += deltaY;
          }
          segment.morphData.push(cx, cy, morphX, morphY);
        }
      }
    }
  }
  applySegmentToStyles(segment, styles, linePaths, fillPaths, isMorph);

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

  var removeCount = 0;
  for (i = 0; i < allPaths.length; i++) {
    path = allPaths[i];
    if (!path.head()) {
      removeCount++;
      continue;
    }
    allPaths[i - removeCount] = segmentedPathToShapePath(path, isMorph,
                                                         transferables);
  }
  allPaths.length -= removeCount;
  return allPaths;
}

function segmentedPathToShapePath(path, isMorph, transferables) {
  var start = path.head();
  var end = start;

  var finalRoot = null;
  var finalHead = null;

  var skippedMoves = 0;

  // Path segments for one style can appear in whatever order in the tag's list
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
      if (path.segmentsConnect(current, start)) {
        if (current.next !== start) {
          path.removeSegment(current);
          path.insertSegment(current, start);
        }
        start = current;
        current = start.prev;
        skippedMoves++;
        continue;
      }
      if (path.segmentsConnect(end, current)) {
        path.removeSegment(current);
        end.next = current;
        current = current.prev;
        end.next.prev = end;
        end.next.next = null;
        end = end.next;
        skippedMoves++;
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

  var totalCommandsLength = -skippedMoves;
  var totalDataLength = -skippedMoves << 1;
  current = finalRoot;
  while (current) {
    totalCommandsLength += current.commands.length;
    totalDataLength += current.data.length;
    current = current.next;
  }

  var shape = new ShapePath(path.fillStyle, path.lineStyle, totalCommandsLength,
                            totalDataLength, isMorph, transferables);
  var allCommands = shape.commands;
  var allData = shape.data;
  var allMorphData = shape.morphData;

  var commandsIndex = 0;
  var dataIndex = 0;


  current = finalRoot;
  while (current) {
    var commands = current.commands;
    var data = current.data;
    var morphData = current.morphData;

    // If the segment's first moveTo goes to the current coordinates,
    // we have to skip it. Removing those in the previous loop would be too
    // costly, and we might share the arrays with another style's path.
    var offset = +(data[0] === allData[dataIndex - 2] &&
                   data[1] === allData[dataIndex - 1]);

    for (var i = offset; i < commands.length; i++, commandsIndex++) {
      allCommands[commandsIndex] = commands[i];
    }
    for (i = offset << 1; i < data.length; i++, dataIndex++) {
      allData[dataIndex] = data[i];
      if (isMorph) {
        allMorphData[dataIndex] = morphData[i];
      }
    }
    current = current.next;
  }
  return shape;
}

var CAPS_STYLE_TYPES = ['round', 'none', 'square'];
var JOIN_STYLE_TYPES = ['round', 'bevel', 'miter'];
function processStyle(style, isLineStyle, dictionary, dependencies) {
  if (isLineStyle) {
    // TODO: Figure out how to handle startCapStyle
    style.lineCap = CAPS_STYLE_TYPES[style.endCapStyle|0];
    style.lineJoin = JOIN_STYLE_TYPES[style.joinStyle|0];
    style.miterLimit = (style.miterLimitFactor || 1.5) * 2;
    if (!style.color && style.hasFill) {
      var fillStyle = processStyle(style.fillStyle, false, dictionary,
                                   dependencies);
      style.style = fillStyle.style;
      style.type = fillStyle.type;
      style.transform = fillStyle.transform;
      style.records = fillStyle.records;
      style.focalPoint = fillStyle.focalPoint;
      style.bitmapId = fillStyle.bitmapId;
      style.repeat = fillStyle.repeat;
      style.fillStyle = null;
      return style;
    }
  }
  var color;
  if (style.type === undefined || style.type === GRAPHICS_FILL_SOLID) {
    color = style.color;
    style.style = 'rgba(' + color.red + ',' + color.green + ',' +
                  color.blue + ',' + color.alpha / 255 + ')';
    style.color = null; // No need to keep data around we won't use anymore.
    return style;
  }
  var scale;
  switch (style.type) {
    case GRAPHICS_FILL_LINEAR_GRADIENT:
    case GRAPHICS_FILL_RADIAL_GRADIENT:
    case GRAPHICS_FILL_FOCAL_RADIAL_GRADIENT:
      scale = 819.2;
      break;
    case GRAPHICS_FILL_REPEATING_BITMAP:
    case GRAPHICS_FILL_CLIPPED_BITMAP:
    case GRAPHICS_FILL_NONSMOOTHED_REPEATING_BITMAP:
    case GRAPHICS_FILL_NONSMOOTHED_CLIPPED_BITMAP:
      if (dictionary[style.bitmapId]) {
        dependencies.push(dictionary[style.bitmapId].id);
        scale = 0.05;
      }
      break;
    default:
      fail('invalid fill style', 'shape');
  }
  if (!style.matrix) {
    return style;
  }
  var matrix = style.matrix;
  style.transform = {
    a: (matrix.a * scale),
    b: (matrix.b * scale),
    c: (matrix.c * scale),
    d: (matrix.d * scale),
    e: matrix.tx,
    f: matrix.ty
  };
  // null data that's unused from here on out
  style.matrix = null;
  return style;
}

/*
 * Paths are stored in 2-dimensional arrays. Each of the inner arrays contains
 * all the paths for a certain fill or line style.
 */
function createPathsList(styles, isLineStyle, dictionary, dependencies) {
  var paths = [];
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
function defineShape(tag, dictionary) {
  var dependencies = [];
  var transferables = [];
  var fillPaths = createPathsList(tag.fillStyles, false,
                                  dictionary, dependencies);
  var linePaths = createPathsList(tag.lineStyles, true,
                                  dictionary, dependencies);
  var paths = convertRecordsToStyledPaths(tag.records, fillPaths, linePaths,
                                          dictionary, dependencies,
                                          tag.recordsMorph || null,
                                          transferables);

  if (tag.bboxMorph) {
    var mbox = tag.bboxMorph;
    extendBoundsByPoint(tag.bbox, mbox.xMin, mbox.yMin);
    extendBoundsByPoint(tag.bbox, mbox.xMax, mbox.yMax);
    mbox = tag.strokeBboxMorph;
    if (mbox) {
      extendBoundsByPoint(tag.strokeBbox, mbox.xMin, mbox.yMin);
      extendBoundsByPoint(tag.strokeBbox, mbox.xMax, mbox.yMax);
    }
  }
  return {
    type: 'shape',
    id: tag.id,
    strokeBbox: tag.strokeBbox,
    strokeBboxMorph: tag.strokeBboxMorph,
    bbox: tag.bbox,
    bboxMorph: tag.bboxMorph,
    isMorph: tag.isMorph,
    paths: paths,
    require: dependencies.length ? dependencies : null,
    transferables: transferables
  };
}

function logShape(paths, bbox) {
  var output = '{"bounds":' + JSON.stringify(bbox) + ',"paths":[' +
               paths.map(function(path) {
                 return path.serialize();
               }).join() + ']}';
  console.log(output);
}

function SegmentedPath(fillStyle, lineStyle) {
  this.fillStyle = fillStyle;
  this.lineStyle = lineStyle;
  this._head = null;
}
SegmentedPath.prototype = {
  addSegment: function (commands, data, morphData)
  {
    assert(commands);
    assert(data);
    var segment = {commands: commands, data: data, morphData: morphData,
                   prev: this._head, next: null};
    if (this._head) {
      this._head.next = segment;
    }
    this._head = segment;
    return segment;
  },
  // Does *not* reset the segment's prev and next pointers!
  removeSegment: function(segment) {
    if (segment.prev) {
      segment.prev.next = segment.next;
    }
    if (segment.next) {
      segment.next.prev = segment.prev;
    }
  },
  insertSegment: function(segment, next) {
    var prev = next.prev;
    segment.prev = prev;
    segment.next = next;
    if (prev) {
      prev.next = segment;
    }
    next.prev = segment;
  },
  head: function() {
    return this._head;
  },
  segmentsConnect: function(first, second) {
    assert(second.commands[0] === SHAPE_MOVE_TO);

    var firstLength = first.data.length;
    return first.data[firstLength - 2] === second.data[0] &&
           first.data[firstLength - 1] === second.data[1];
  }
};

var SHAPE_MOVE_TO        = 1;
var SHAPE_LINE_TO        = 2;
var SHAPE_CURVE_TO       = 3;
var SHAPE_WIDE_MOVE_TO   = 4;
var SHAPE_WIDE_LINE_TO   = 5;
var SHAPE_CUBIC_CURVE_TO = 6;
// The following commands aren't available in the Flash Player. We use them as
// shortcuts for complex operations that exist natively on Canvas.
var SHAPE_CIRCLE         = 7;
var SHAPE_ELLIPSE        = 8;

function ShapePath(fillStyle, lineStyle, commandsCount, dataLength, isMorph,
                   transferables)
{
  this.fillStyle = fillStyle;
  this.lineStyle = lineStyle;

  if (commandsCount) {
    this.commands = new Uint8Array(commandsCount);
    this.data = new Int32Array(dataLength);
    this.morphData = isMorph ? new Int32Array(dataLength) : null;
  } else {
    // For non-defineShape paths, we don't know their length, so can't use
    // typed arrays for their commands and data.
    this.commands = [];
    this.data = [];
  }

  this.bounds = null;
  this.strokeBounds = null;

  this.isMorph = !!isMorph;
  this.fullyInitialized = false;
  // SpiderMonkey bug 841904 causes typed arrays to lose their buffers during
  // worker#postMessage under some conditions. To work around this while still
  // being able to move buffers instead of copying them, we have to store the
  // buffers themselves, too, and restore the typed arrays after postMessage.
  if (inWorker) {
    assert(transferables);
    this.buffers = [this.commands.buffer, this.data.buffer];
    transferables.push(this.commands.buffer, this.data.buffer);
    if (isMorph) {
      this.buffers.push(this.morphData.buffer);
      transferables.push(this.morphData.buffer);
    }
  }
  else {
    this.buffers = null;
  }
}

ShapePath.prototype = {
  moveTo: function(x, y) {
    if (this.commands[this.commands.length -1] === SHAPE_MOVE_TO) {
      this.data[this.data.length - 2] = x;
      this.data[this.data.length - 1] = y;
      return;
    }
    this.commands.push(SHAPE_MOVE_TO);
    this.data.push(x, y);
  },
  lineTo: function(x, y) {
    this.commands.push(SHAPE_LINE_TO);
    this.data.push(x, y);
  },
  curveTo: function(controlX, controlY, anchorX, anchorY) {
    this.commands.push(SHAPE_CURVE_TO);
    this.data.push(controlX, controlY, anchorX, anchorY);
  },
  cubicCurveTo: function(control1X, control1Y, control2X, control2Y,
                         anchorX, anchorY)
  {
    this.commands.push(SHAPE_CUBIC_CURVE_TO);
    this.data.push(control1X, control1Y, control2X, control2Y,
                   anchorX, anchorY);
  },
  rect: function(x, y, w, h) {
    var x2 = x + w;
    var y2 = y + h;
    this.commands.push(SHAPE_MOVE_TO, SHAPE_LINE_TO, SHAPE_LINE_TO,
                       SHAPE_LINE_TO, SHAPE_LINE_TO);
    this.data.push(x, y, x2, y, x2, y2, x, y2, x, y);
  },
  circle: function(x, y, radius) {
    this.commands.push(SHAPE_CIRCLE);
    this.data.push(x, y, radius);
  },
  ellipse: function(x, y, radiusX, radiusY) {
    this.commands.push(SHAPE_ELLIPSE);
    this.data.push(x, y, radiusX, radiusY);
  },
  draw: function(ctx, clip, ratio, colorTransform) {
    if (clip && !this.fillStyle) {
      return;
    }
    ctx.beginPath();
    var commands = this.commands;
    var data = this.data;
    var morphData = this.morphData;
    var formOpen = false;
    var formOpenX = 0;
    var formOpenY = 0;
    if (!this.isMorph) {
      for (var j = 0, k = 0; j < commands.length; j++) {
        switch (commands[j]) {
          case SHAPE_MOVE_TO:
            formOpen = true;
            formOpenX = data[k++]/20;
            formOpenY = data[k++]/20;
            ctx.moveTo(formOpenX, formOpenY);
            break;
          case SHAPE_WIDE_MOVE_TO:
            ctx.moveTo(data[k++]/20, data[k++]/20);
            k += 2;
            break;
          case SHAPE_LINE_TO:
            ctx.lineTo(data[k++]/20, data[k++]/20);
            break;
          case SHAPE_WIDE_LINE_TO:
            ctx.lineTo(data[k++]/20, data[k++]/20);
            k += 2;
            break;
          case SHAPE_CURVE_TO:
            ctx.quadraticCurveTo(data[k++]/20, data[k++]/20,
                                 data[k++]/20, data[k++]/20);
            break;
          case SHAPE_CUBIC_CURVE_TO:
            ctx.bezierCurveTo(data[k++]/20, data[k++]/20,
                              data[k++]/20, data[k++]/20,
                              data[k++]/20, data[k++]/20);
            break;
          case SHAPE_CIRCLE:
            if (formOpen) {
              ctx.lineTo(formOpenX, formOpenY);
              formOpen = false;
            }
            ctx.moveTo((data[k] + data[k+2])/20, data[k+1]/20);
            ctx.arc(data[k++]/20, data[k++]/20, data[k++]/20, 0, Math.PI * 2,
                    false);
            break;
          case SHAPE_ELLIPSE:
            if (formOpen) {
              ctx.lineTo(formOpenX, formOpenY);
              formOpen = false;
            }
            var x = data[k++];
            var y = data[k++];
            var rX = data[k++];
            var rY = data[k++];
            var radius;
            if (rX !== rY) {
              ctx.save();
              var ellipseScale;
              if (rX > rY) {
                ellipseScale = rX / rY;
                radius = rY;
                x /= ellipseScale;
                ctx.scale(ellipseScale, 1);
              } else {
                ellipseScale = rY / rX;
                radius = rX;
                y /= ellipseScale;
                ctx.scale(1, ellipseScale);
              }
            }
            ctx.moveTo((x + radius)/20, y/20);
            ctx.arc(x/20, y/20, radius/20, 0, Math.PI * 2, false);
            if (rX !== rY) {
              ctx.restore();
            }
            break;
          default:
            // Sometimes, the very last command isn't properly set. Ignore it.
            if (commands[j] === 0 && j === commands.length -1) {
              break;
            }
            console.warn("Unknown drawing command encountered: " +
                         commands[j]);
        }
      }
    } else {
      for (var j = 0, k = 0; j < commands.length; j++) {
        switch (commands[j]) {
          case SHAPE_MOVE_TO:
            ctx.moveTo(morph(data[k]/20, morphData[k++]/20, ratio),
                       morph(data[k]/20, morphData[k++]/20, ratio));
            break;
          case SHAPE_LINE_TO:
            ctx.lineTo(morph(data[k]/20, morphData[k++]/20, ratio),
                       morph(data[k]/20, morphData[k++]/20, ratio));
            break;
          case SHAPE_CURVE_TO:
            ctx.quadraticCurveTo(morph(data[k]/20, morphData[k++]/20, ratio),
                                 morph(data[k]/20, morphData[k++]/20, ratio),
                                 morph(data[k]/20, morphData[k++]/20, ratio),
                                 morph(data[k]/20, morphData[k++]/20, ratio));
            break;
          default:
            console.warn("Drawing command not supported for morph " +
                         "shapes: " + commands[j]);
        }
      }
    }
    // TODO: enable in-path line-style changes
//        if (formOpen) {
//          ctx.lineTo(formOpenX, formOpenY);
//        }
    if (!clip) {
      var fillStyle = this.fillStyle;
      if (fillStyle) {
        colorTransform.setFillStyle(ctx, fillStyle.style);
        ctx.imageSmoothingEnabled = ctx.mozImageSmoothingEnabled =
                                    fillStyle.smooth;
        var m = fillStyle.transform;
        ctx.save();
        colorTransform.setAlpha(ctx);
        if (m) {
          ctx.transform(m.a, m.b, m.c, m.d, m.e/20, m.f/20);
        }
        ctx.fill();
        ctx.restore();
      }
      var lineStyle = this.lineStyle;
      // TODO: All widths except for `undefined` and `NaN` draw something
      if (lineStyle) {
        colorTransform.setStrokeStyle(ctx, lineStyle.style);
        ctx.save();
        colorTransform.setAlpha(ctx);
        // Flash's lines are always at least 1px/20twips
        ctx.lineWidth = Math.max(lineStyle.width/20, 1);
        ctx.lineCap = lineStyle.lineCap;
        ctx.lineJoin = lineStyle.lineJoin;
        ctx.miterLimit = lineStyle.miterLimit;
        ctx.stroke();
        ctx.restore();
      }
    }
    ctx.closePath();
  },
  isPointInPath: function(x, y) {
    if (!(this.fillStyle || this.lineStyle)) {
      return false;
    }
    var bounds = this.strokeBounds || this.bounds || this._calculateBounds();
    if (x < bounds.xMin || x > bounds.xMax ||
        y < bounds.yMin || y > bounds.yMax)
    {
      return false;
    }

    if (this.fillStyle && this.isPointInFill(x, y)) {
      return true;
    }

    return this.lineStyle && this.lineStyle.width !== undefined &&
           this.isPointInStroke(x, y);

  },
  isPointInFill: function(x, y) {
    var commands = this.commands;
    var data = this.data;
    var length = commands.length;

    var inside = false;

    var fromX = 0;
    var fromY = 0;
    var toX = 0;
    var toY = 0;
    var localX;
    var localY;
    var cpX;
    var cpY;
    var rX;
    var rY;

    var formOpen = false;
    var formOpenX = 0;
    var formOpenY = 0;

    // Rough outline of the algorithm's mode of operation:
    // from x,y an infinite ray to the right is "cast". All operations are then
    // tested for intersections with this ray, where each intersection means
    // switching between being outside and inside the shape.
    for (var commandIndex = 0, dataIndex = 0; commandIndex < length;
         commandIndex++)
    {
      switch (commands[commandIndex]) {
        case SHAPE_WIDE_MOVE_TO:
          dataIndex += 2;
          /* falls through */
        case SHAPE_MOVE_TO:
          toX = data[dataIndex++];
          toY = data[dataIndex++];
          if (formOpen &&
              intersectsLine(x, y, fromX, fromY, formOpenX, formOpenY))
          {
            inside = !inside;
          }
          formOpen = true;
          formOpenX = toX;
          formOpenY = toY;
          break;
        case SHAPE_WIDE_LINE_TO:
          dataIndex += 2;
          /* falls through */
        case SHAPE_LINE_TO:
          toX = data[dataIndex++];
          toY = data[dataIndex++];
          if (intersectsLine(x, y, fromX, fromY, toX, toY))
          {
            inside = !inside;
          }
          break;
        case SHAPE_CURVE_TO:
          cpX = data[dataIndex++];
          cpY = data[dataIndex++];
          toX = data[dataIndex++];
          toY = data[dataIndex++];
          if ((cpY > y) === (fromY > y) && (toY > y) === (fromY > y)) {
            break;
          }
          if (fromX >= x && cpX >= x && toX >= x) {
            inside = !inside;
            break;
          }

          // Finding the intersections with our ray means solving a quadratic
          // equation of the form y = ax^2 + bx + c for y.
          // See http://en.wikipedia.org/wiki/Quadratic_equation and
          // http://code.google.com/p/degrafa/source/browse/trunk/Degrafa/com/degrafa/geometry/AdvancedQuadraticBezier.as?r=613#394
          var a = fromY - 2 * cpY + toY;
          var c = fromY - y;
          var b = 2 * (cpY - fromY);

          var d = b * b - 4 * a * c;
          if (d < 0) {
            break;
          }

          d = Math.sqrt(d);
          a = 1 / (a + a);
          var t1 = (d - b) * a;
          var t2 = (-b - d) * a;

          if (t1 >= 0 && t1 <= 1 && quadraticBezier(fromX, cpX, toX, t1) > x) {
            inside = !inside;
          }

          if (t2 >= 0 && t2 <= 1 && quadraticBezier(fromX, cpX, toX, t2) > x) {
            inside = !inside;
          }
          break;
        case SHAPE_CUBIC_CURVE_TO:
          cpX = data[dataIndex++];
          cpY = data[dataIndex++];
          var cp2X = data[dataIndex++];
          var cp2Y = data[dataIndex++];
          toX = data[dataIndex++];
          toY = data[dataIndex++];
          if ((cpY > y) === (fromY > y) && (cp2Y > y) === (fromY > y) &&
              (toY > y) === (fromY > y))
          {
            break;
          }
          if (fromX >= x && cpX >= x && cp2X >= x && toX >= x) {
            inside = !inside;
            break;
          }
          var roots = cubicXAtY(fromX, fromY, cpX, cpY, cp2X, cp2Y,
                                toX, toY, y);
          for (var i = roots.length; i--;) {
            if (roots[i] >= x) {
              inside = !inside;
            }
          }
          break;
        case SHAPE_CIRCLE:
          toX = data[dataIndex++];
          toY = data[dataIndex++];
          var r = data[dataIndex++];
          localX = x - toX;
          localY = y - toY;
          if (localX * localX + localY * localY < r * r) {
            inside = !inside;
          }
          toX += r;
          break;
        case SHAPE_ELLIPSE:
          cpX = data[dataIndex++];
          cpY = data[dataIndex++];
          rX = data[dataIndex++];
          rY = data[dataIndex++];
          localX = x - cpX;
          localY = y - cpY;
          if (localX * localX / (rX * rX) + localY * localY / (rY * rY) <= 1) {
            inside = !inside;
          }
          toX = cpX + rX;
          toY = cpY;
          break;
        default:
          if (!inWorker) {
            console.warn("Drawing command not handled in isPointInPath: " +
                         commands[commandIndex]);
          }
      }
      fromX = toX;
      fromY = toY;
    }

    if (formOpen &&
        intersectsLine(x, y, fromX, fromY, formOpenX, formOpenY))
    {
      inside = !inside;
    }

    return inside;
  },
  isPointInStroke: function(x, y) {
    var commands = this.commands;
    var data = this.data;
    var length = commands.length;

    var width = this.lineStyle.width;
    var halfWidth = width / 2;
    var halfWidthSq = halfWidth * halfWidth;
    var minX = x - halfWidth;
    var maxX = x + halfWidth;
    var minY = y - halfWidth;
    var maxY = y + halfWidth;

    var fromX = 0;
    var fromY = 0;
    var toX = 0;
    var toY = 0;
    var localX;
    var localY;
    var cpX;
    var cpY;
    var rX;
    var rY;
    var curveX;
    var curveY;
    var t;

    for (var commandIndex = 0, dataIndex = 0; commandIndex < length;
         commandIndex++)
    {
      switch (commands[commandIndex]) {
        case SHAPE_WIDE_MOVE_TO:
          dataIndex += 2;
        /* falls through */
        case SHAPE_MOVE_TO:
          toX = data[dataIndex++];
          toY = data[dataIndex++];
          break;
        case SHAPE_WIDE_LINE_TO:
          dataIndex += 2;
        /* falls through */
        case SHAPE_LINE_TO:
          toX = data[dataIndex++];
          toY = data[dataIndex++];
          // Lines with length == 0 aren't rendered
          // TODO: make sure we get this right in the actual rendering
          if (fromX === toX && fromY === toY) {
            break;
          }
          // Eliminate based on bounds
          if (maxX < fromX && maxX < toX || minX > fromX && minX > toX ||
              maxY < fromY && maxY < toY || minY > fromY && minY > toY)
          {
            break;
          }
          // Vertical and horizontal lines are a certain hit at this point
          if (toX === fromX || toY === fromY) {
            return true;
          }
          // http://stackoverflow.com/a/1501725/517791
          t = ((x - fromX) * (toX - fromX) + (y - fromY) * (toY - fromY)) /
              distanceSq(fromX, fromY, toX, toY);
          if (t < 0) {
            if (distanceSq(x, y, fromX, fromY) <= halfWidthSq) {
              return true;
            }
            break;
          }
          if (t > 1) {
            if (distanceSq(x, y, toX, toY) <= halfWidthSq) {
              return true;
            }
            break;
          }
          if (distanceSq(x, y, fromX + t * (toX - fromX),
                         fromY + t * (toY - fromY)) <= halfWidthSq)
          {
            return true;
          }
          break;
        case SHAPE_CURVE_TO:
          cpX = data[dataIndex++];
          cpY = data[dataIndex++];
          toX = data[dataIndex++];
          toY = data[dataIndex++];
          // Eliminate based on bounds
          var extremeX = quadraticBezierExtreme(fromX, cpX, toX);
          if (maxX < fromX && maxX < extremeX && maxX < toX ||
              minX > fromX && minX > extremeX && minX > toX)
          {
            break;
          }
          var extremeY = quadraticBezierExtreme(fromY, cpY, toY);
          if (maxY < fromY && maxY < extremeY && maxY < toY ||
              minY > fromY && minY > extremeY && minY > toY)
          {
            break;
          }
          // So, this is very much not ideal, but I'll punt on proper curve
          // hit-testing for now and just sample an amount of points that seems
          // sufficient.
          for (t = 0; t < 1; t += 0.02) {
            curveX = quadraticBezier(fromX, cpX, toX, t);
            if (curveX < minX  || curveX > maxX) {
              continue;
            }
            curveY = quadraticBezier(fromY, cpY, toY, t);
            if (curveY < minY  || curveY > maxY) {
              continue;
            }
            if ((x - curveX) * (x - curveX) + (y - curveY) * (y - curveY) <
                halfWidthSq)
            {
              return true;
            }
          }
          break;
        case SHAPE_CUBIC_CURVE_TO:
          cpX = data[dataIndex++];
          cpY = data[dataIndex++];
          var cp2X = data[dataIndex++];
          var cp2Y = data[dataIndex++];
          toX = data[dataIndex++];
          toY = data[dataIndex++];
          // Eliminate based on bounds
          var extremesX = cubicBezierExtremes(fromX, cpX, cp2X, toX);
          while(extremesX.length < 2) {
            extremesX.push(toX);
          }
          if (maxX < fromX && maxX < toX && maxX < extremesX[0] &&
              maxX < extremesX[1]  ||
              minX > fromX && minX > toX && minX > extremesX[0] &&
              minX > extremesX[1])
          {
            break;
          }
          var extremesY = cubicBezierExtremes(fromY, cpY, cp2Y, toY);
          while(extremesY.length < 2) {
            extremesY.push(toY);
          }
          if (maxY < fromY && maxY < toY && maxY < extremesY[0] &&
              maxY < extremesY[1] ||
              minY > fromY && minY > toY && minY > extremesY[0] &&
              minY > extremesY[1])
          {
            break;
          }
          // So, this is very much not ideal, but I'll punt on proper curve
          // hit-testing for now and just sample an amount of points that seems
          // sufficient.
          for (t = 0; t < 1; t += 0.02) {
            curveX = cubicBezier(fromX, cpX, cp2X, toX, t);
            if (curveX < minX  || curveX > maxX) {
              continue;
            }
            curveY = cubicBezier(fromY, cpY, cp2Y, toY, t);
            if (curveY < minY  || curveY > maxY) {
              continue;
            }
            if ((x - curveX) * (x - curveX) + (y - curveY) * (y - curveY) <
                halfWidthSq)
            {
              return true;
            }
          }
          break;
        case SHAPE_CIRCLE:
          cpX = data[dataIndex++];
          cpY = data[dataIndex++];
          var r = data[dataIndex++];
          toX = cpX + r;
          toY = cpY;
          // Eliminate based on bounds
          if (maxX < cpX - r || minX > cpX + r ||
              maxY < cpY - r || minY > cpY + r)
          {
            break;
          }
          localX = x - cpX;
          localY = y - cpY;
          var rMin = r - halfWidth;
          var rMax = r + halfWidth;
          var distSq = localX * localX + localY * localY;
          if (distSq >= rMin * rMin && distSq <= rMax * rMax) {
            return true;
          }
          break;
        case SHAPE_ELLIPSE:
          cpX = data[dataIndex++];
          cpY = data[dataIndex++];
          rX = data[dataIndex++];
          rY = data[dataIndex++];
          toX = cpX + rX;
          toY = cpY;
          localX = Math.abs(x - cpX);
          localY = Math.abs(y - cpY);
          localX -= halfWidth;
          localY -= halfWidth;
          if (localX * localX / (rX * rX) + localY * localY / (rY * rY) > 1) {
            break;
          }
          localX += width;
          localY += width;
          if (localX * localX / (rX * rX) + localY * localY / (rY * rY) > 1) {
            return true;
          }
          break;
        default:
          if (!inWorker) {
            console.warn("Drawing command not handled in isPointInPath: " +
                         commands[commandIndex]);
          }
      }
      fromX = toX;
      fromY = toY;
    }
    return false;
  },
  getBounds: function(includeStroke) {
    var bounds = includeStroke ? this.strokeBounds : this.bounds;
    if (!bounds) {
      this._calculateBounds();
      bounds = includeStroke ? this.strokeBounds : this.bounds;
    }
    return bounds;
  },
  _calculateBounds: function() {
    var commands = this.commands;
    var data = this.data;
    var length = commands.length;
    var bounds;
    if (commands[0] === SHAPE_MOVE_TO || commands[0] > SHAPE_CUBIC_CURVE_TO) {
      bounds = {xMin: data[0], yMin: data[1]};
    } else {
      // only the various single-line-drawing commands start out at zero
      // they're the first command.
      bounds = {xMin: 0, yMin: 0};
    }
    bounds.xMax = bounds.xMin;
    bounds.yMax = bounds.yMin;

    var fromX = bounds.xMin;
    var fromY = bounds.yMin;

    for (var commandIndex = 0, dataIndex = 0; commandIndex < length;
         commandIndex++)
    {
      var toX;
      var toY;
      var cpX;
      var cpY;
      switch (commands[commandIndex]) {
        case SHAPE_WIDE_MOVE_TO:
          dataIndex += 2;
          /* falls through */
        case SHAPE_MOVE_TO:
          toX = data[dataIndex++];
          toY = data[dataIndex++];
          extendBoundsByPoint(bounds, toX, toY);
          break;
        case SHAPE_WIDE_LINE_TO:
          dataIndex += 2;
          /* falls through */
        case SHAPE_LINE_TO:
          toX = data[dataIndex++];
          toY = data[dataIndex++];
          extendBoundsByPoint(bounds, toX, toY);
          break;
        //TODO: calculate tighter bounds for control points
        case SHAPE_CURVE_TO:
          cpX = data[dataIndex++];
          cpY = data[dataIndex++];
          toX = data[dataIndex++];
          toY = data[dataIndex++];
          extendBoundsByPoint(bounds, toX, toY);
          if (cpX < fromX || cpX > toX) {
            extendBoundsByX(bounds, quadraticBezierExtreme(fromX, cpX, toX));
          }
          if (cpY < fromY || cpY > toY) {
            extendBoundsByY(bounds, quadraticBezierExtreme(fromY, cpY, toY));
          }
          break;
        case SHAPE_CUBIC_CURVE_TO:
          cpX = data[dataIndex++];
          cpY = data[dataIndex++];
          var cp2X = data[dataIndex++];
          var cp2Y = data[dataIndex++];
          toX = data[dataIndex++];
          toY = data[dataIndex++];
          extendBoundsByPoint(bounds, toX, toY);
          var extremes;
          var i;
          if (cpX < fromX || cp2X < fromX || cpX > toX || cp2X > toX) {
            extremes = cubicBezierExtremes(fromX, cpX, cp2X, toX);
            for (i = extremes.length; i--;) {
              extendBoundsByX(bounds, extremes[i]);
            }
          }
          if (cpY < fromY || cp2Y < fromY || cpY > toY || cp2Y > toY) {
            extremes = cubicBezierExtremes(fromY, cpY, cp2Y, toY);
            for (i = extremes.length; i--;) {
              extendBoundsByY(bounds, extremes[i]);
            }
          }
          break;
        case SHAPE_CIRCLE:
          toX = data[dataIndex++];
          toY = data[dataIndex++];
          var radius = data[dataIndex++];
          extendBoundsByPoint(bounds, toX - radius, toY - radius);
          extendBoundsByPoint(bounds, toX + radius, toY + radius);
          toX += radius;
          break;
        case SHAPE_ELLIPSE:
          toX = data[dataIndex++];
          toY = data[dataIndex++];
          var radiusX = data[dataIndex++];
          var radiusY = data[dataIndex++];
          extendBoundsByPoint(bounds, toX - radiusX, toY - radiusY);
          extendBoundsByPoint(bounds, toX + radiusX, toY + radiusY);
          toX += radiusX;
          break;
        default:
          if (!inWorker) {
            console.warn("Drawing command not handled in bounds calculation: " +
                         commands[commandIndex]);
          }
      }
      fromX = toX;
      fromY = toY;
    }
    this.bounds = bounds;
    if (this.lineStyle) {
      var halfLineWidth = this.lineStyle.width / 2;
      this.strokeBounds = {
        xMin: bounds.xMin - halfLineWidth,
        yMin: bounds.yMin - halfLineWidth,
        xMax: bounds.xMax + halfLineWidth,
        yMax: bounds.yMax + halfLineWidth
      };
      return this.strokeBounds;
    } else {
      this.strokeBounds = bounds;
    }
    return bounds;
  },
  serialize: function() {
    var output = '{';
    if (this.fillStyle) {
      output += '"fill":' + JSON.stringify(this.fillStyle) + ',';
    }
    if (this.lineStyle) {
      output += '"stroke":' + JSON.stringify(this.lineStyle) + ',';
    }

    output += '"commands":[' + Array.apply([], this.commands).join() + '],';
    output += '"data":[' + Array.apply([], this.data).join() + ']';

    return output + '}';
  }
};

ShapePath.fromPlainObject = function(obj) {
  var path = new ShapePath(obj.fill || null, obj.stroke || null);
  path.commands = new Uint8Array(obj.commands);
  path.data = new Int32Array(obj.data);
  if (!inWorker) {
    finishShapePath(path);
  }
  return path;
};

function distanceSq(x1, y1, x2, y2) {
  var dX = x2 - x1;
  var dY = y2 - y1;
  return dX * dX + dY * dY;
}

// See http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
function intersectsLine(x, y, x1, y1, x2, y2) {
  return (y2 > y) !== (y1 > y) &&
         x < (x1 - x2) * (y - y2) / (y1 - y2) + x2;
}

function quadraticBezier(from, cp, to, t) {
  var inverseT = 1 - t;
  return from * inverseT * inverseT + 2 * cp * inverseT * t + to * t * t;
}

function quadraticBezierExtreme(from, cp, to) {
  var t = (from - cp) / (from - 2 * cp + to);
  if (t < 0) {
    return from;
  }
  if (t > 1) {
    return to;
  }
  return quadraticBezier(from, cp, to, t);
}

function cubicBezier(from, cp, cp2, to, t) {
  var tSq = t * t;
  var inverseT = 1 - t;
  var inverseTSq = inverseT * inverseT;
  return from * inverseT * inverseTSq + 3 * cp * t * inverseTSq +
         3 * cp2 * inverseT * tSq + to * t * tSq;
}

function cubicBezierExtremes(from, cp, cp2, to) {
  var d1 = cp - from;
  var d2 = cp2 - cp;
  // We only ever need d2 * 2
  d2 *= 2;
  var d3 = to - cp2;
  // Prevent division by zero by very slightly changing d3 if that would happen
  if (d1 + d3 === d2) {
    d3 *= 1.0001;
  }
  var fHead = 2 * d1 - d2;
  var part1 = d2 - 2 * d1;
  var fCenter = Math.sqrt(part1 * part1 - 4 * d1 * (d1 - d2 + d3));
  var fTail = 2 * (d1 - d2 + d3);
  var t1 = (fHead + fCenter) / fTail;
  var t2 = (fHead - fCenter ) / fTail;
  var result = [];
  if (t1 >= 0 && t1 <= 1) {
    result.push(cubicBezier(from, cp, cp2, to, t1));
  }
  if (t2 >= 0 && t2 <= 1) {
    result.push(cubicBezier(from, cp, cp2, to, t2));
  }
  return result;
}

function cubicXAtY(x0, y0, cx, cy, cx1, cy1, x1, y1, y) {
  var dX = 3.0 * (cx - x0);
  var dY = 3.0 * (cy - y0);

  var bX = 3.0 * (cx1 - cx) - dX;
  var bY = 3.0 * (cy1 - cy) - dY;

  var c3X = x1 - x0 - dX - bX;
  var c3Y = y1 - y0 - dY - bY;
  // Find one root - any root - then factor out (t-r) to get a quadratic poly.
  function f(t) {
    return t * (dY + t * (bY + t * c3Y)) + y0 - y;
  }
  function pointAt(t)
  {
    if (t < 0) {
      t = 0;
    } else if (t > 1) {
      t = 1;
    }

    return x0 + t * (dX + t * (bX + t * c3X));
  }
  // Bisect the specified range to isolate an interval with a root.
  function bisectCubicBezierRange(f, l, r, limit) {
    if (Math.abs(r - l) <= limit) {
      return;
    }

    var middle = 0.5 * (l + r);
    if (f(l) * f(r) <= 0) {
      left = l;
      right = r;
      return;
    }
    bisectCubicBezierRange(f, l, middle, limit);
    bisectCubicBezierRange(f, middle, r, limit);
  }

  // some curves that loop around on themselves may require bisection
  var left = 0;
  var right = 1;
  bisectCubicBezierRange(f, 0, 1, 0.05);

  // experiment with tolerance - but not too tight :)
  var t0 = findRoot(left, right, f, 50, 0.000001);
  var evalResult = Math.abs(f(t0));
  if (evalResult > 0.00001) {
    return [];
  }

  var result = [];
  if (t0 <= 1) {
    result.push(pointAt(t0));
  }

  // Factor theorem: t-r is a factor of the cubic polynomial if r is a root.
  // Use this to reduce to a quadratic poly. using synthetic division
  var a = c3Y;
  var b = t0 * a + bY;
  var c = t0 * b + dY;

  // Process the quadratic for the remaining two possible roots
  var d = b * b - 4 * a * c;
  if (d < 0) {
    return result;
  }

  d = Math.sqrt(d);
  a = 1 / (a + a);
  var t1 = (d - b) * a;
  var t2 = (-b - d) * a;

  if (t1 >= 0 && t1 <= 1) {
    result.push(pointAt(t1));
  }

  if (t2 >= 0 && t2 <= 1) {
    result.push(pointAt(t2));
  }

  return result;
}
function findRoot(x0, x2, f, maxIterations, epsilon) {
  var x1;
  var y0;
  var y1;
  var y2;
  var b;
  var c;
  var y10;
  var y20;
  var y21;
  var xm;
  var ym;
  var temp;

  var xmlast = x0;
  y0 = f(x0);

  if (y0 === 0) {
    return x0;
  }

  y2 = f(x2);
  if (y2 === 0) {
    return x2;
  }

  if (y2 * y0 > 0) {
//    dispatchEvent( new Event(ERROR) );
    return x0;
  }

  var __iter = 0;
  for (var i = 0; i < maxIterations; ++i) {
    __iter++;

    x1 = 0.5 * (x2 + x0);
    y1 = f(x1);
    if (y1 === 0) {
      return x1;
    }

    if (Math.abs(x1 - x0) < epsilon) {
      return x1;
    }

    if (y1 * y0 > 0) {
      temp = x0;
      x0 = x2;
      x2 = temp;
      temp = y0;
      y0 = y2;
      y2 = temp;
    }

    y10 = y1 - y0;
    y21 = y2 - y1;
    y20 = y2 - y0;
    if (y2 * y20 < 2 * y1 * y10) {
      x2 = x1;
      y2 = y1;
    }
    else {
      b = (x1 - x0 ) / y10;
      c = (y10 - y21) / (y21 * y20);
      xm = x0 - b * y0 * (1 - c * y1);
      ym = f(xm);
      if (ym === 0) {
        return xm;
      }

      if (Math.abs(xm - xmlast) < epsilon) {
        return xm;
      }

      xmlast = xm;
      if (ym * y0 < 0) {
        x2 = xm;
        y2 = ym;
      }
      else {
        x0 = xm;
        y0 = ym;
        x2 = x1;
        y2 = y1;
      }
    }
  }
  return x1;
}

function extendBoundsByPoint(bounds, x, y) {
  if (x < bounds.xMin) {
    bounds.xMin = x;
  } else if (x > bounds.xMax) {
    bounds.xMax = x;
  }
  if (y < bounds.yMin) {
    bounds.yMin = y;
  } else if (y > bounds.yMax) {
    bounds.yMax = y;
  }
}

function extendBoundsByX(bounds, x) {
  if (x < bounds.xMin) {
    bounds.xMin = x;
  } else if (x > bounds.xMax) {
    bounds.xMax = x;
  }
}

function extendBoundsByY(bounds, y) {
  if (y < bounds.yMin) {
    bounds.yMin = y;
  } else if (y > bounds.yMax) {
    bounds.yMax = y;
  }
}

function morph(start, end, ratio) {
  return start + (end - start) * ratio;
}

/**
 * For shapes parsed in a worker thread, we have to finish their
 * paths after receiving the data in the main thread.
 *
 * This entails creating proper instances for all the contained data types.
 */
function finishShapePath(path, dictionary) {
  assert(!inWorker);

  if (path.fullyInitialized) {
    return path;
  }
  if (!(path instanceof ShapePath)) {
    var untypedPath = path;
    path = new ShapePath(path.fillStyle, path.lineStyle, 0, 0, path.isMorph);
    // See the comment in the ShapePath ctor for why we're recreating the
    // typed arrays here.
    path.commands = new Uint8Array(untypedPath.buffers[0]);
    path.data = new Int32Array(untypedPath.buffers[1]);
    if (untypedPath.isMorph) {
      path.morphData = new Int32Array(untypedPath.buffers[2]);
    }
    path.buffers = null;
  }
  path.fillStyle && initStyle(path.fillStyle, dictionary);
  path.lineStyle && initStyle(path.lineStyle, dictionary);
  path.fullyInitialized = true;
  return path;
}

var inWorker = (typeof window) === 'undefined';
// Used for creating gradients and patterns
var factoryCtx = !inWorker ?
                 document.createElement('canvas').getContext('2d') :
                 null;

/**
 * @param {Array} colorStops
 * @returns {Function}
 */
function buildLinearGradientFactory(colorStops) {
  var defaultGradient = factoryCtx.createLinearGradient(-1, 0, 1, 0);
  for (var i = 0; i < colorStops.length; i++) {
    defaultGradient.addColorStop(colorStops[i].ratio, colorStops[i].color);
  }

  var fn = function createLinearGradient(ctx, colorTransform) {
    var gradient = ctx.createLinearGradient(-1, 0, 1, 0);
    for (var i = 0; i < colorStops.length; i++) {
      colorTransform.addGradientColorStop(gradient, colorStops[i].ratio, colorStops[i].color);
    }
    return gradient;
  };
  fn.defaultFillStyle = defaultGradient;

  return fn;
}

/**
 * @param {number} focalPoint
 * @param {Array} colorStops
 * @returns {Function}
 */
function buildRadialGradientFactory(focalPoint, colorStops) {
  var defaultGradient = factoryCtx.createRadialGradient(focalPoint, 0, 0, 0, 0, 1);
  for (var i = 0; i < colorStops.length; i++) {
    defaultGradient.addColorStop(colorStops[i].ratio, colorStops[i].color);
  }

  var fn = function createRadialGradient(ctx, colorTransform) {
    var gradient = ctx.createRadialGradient(focalPoint, 0, 0, 0, 0, 1);
    for (var i = 0; i < colorStops.length; i++) {
      colorTransform.addGradientColorStop(gradient, colorStops[i].ratio, colorStops[i].color);
    }
    return gradient;
  };
  fn.defaultFillStyle = defaultGradient;

  return fn;
}

/**
 * @param {Object} img
 * @param {String} repeat
 */
function buildBitmapPatternFactory(img, repeat) {
  var defaultPattern = factoryCtx.createPattern(img, repeat);

  var cachedTransform, cachedTransformKey;
  var fn = function createBitmapPattern(ctx, colorTransform) {
    if (!colorTransform.mode) {
      return defaultPattern;
    }
    var key = colorTransform.getTransformFingerprint();
    if (key === cachedTransformKey) {
      return cachedTransform;
    }
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext('2d');
    colorTransform.setAlpha(ctx, true);
    ctx.drawImage(img, 0, 0);
    cachedTransform = ctx.createPattern(canvas, repeat);
    cachedTransformKey = key;
    return cachedTransform;
  };
  fn.defaultFillStyle = defaultPattern;

  return fn;
}

function initStyle(style, dictionary) {
  if (style.type === undefined) {
    return;
  }
  switch (style.type) {
    case GRAPHICS_FILL_SOLID:
      // Solid fill styles are fully processed in shape.js's processStyle
      break;
    case GRAPHICS_FILL_LINEAR_GRADIENT:
    case GRAPHICS_FILL_RADIAL_GRADIENT:
    case GRAPHICS_FILL_FOCAL_RADIAL_GRADIENT:
      var records = style.records, colorStops = [];
      for (var j = 0, n = records.length; j < n; j++) {
        var record = records[j];
        var colorStr = rgbaObjToStr(record.color);
        colorStops.push({ratio: record.ratio / 255, color: colorStr});
      }

      var gradientConstructor;
      var isLinear = style.type === GRAPHICS_FILL_LINEAR_GRADIENT;
      if (isLinear) {
        gradientConstructor = buildLinearGradientFactory(colorStops);
      } else {
        gradientConstructor = buildRadialGradientFactory((style.focalPoint|0)/20, colorStops);
      }
      style.style = gradientConstructor;
      break;
    case GRAPHICS_FILL_REPEATING_BITMAP:
    case GRAPHICS_FILL_CLIPPED_BITMAP:
    case GRAPHICS_FILL_NONSMOOTHED_REPEATING_BITMAP:
    case GRAPHICS_FILL_NONSMOOTHED_CLIPPED_BITMAP:
      var bitmap = dictionary[style.bitmapId];
      var repeat = (style.type === GRAPHICS_FILL_REPEATING_BITMAP) ||
                   (style.type === GRAPHICS_FILL_NONSMOOTHED_REPEATING_BITMAP);
      style.style = buildBitmapPatternFactory(bitmap.value.props.img,
                                              repeat ? "repeat" : "no-repeat");
      break;
    default:
      fail('invalid fill style', 'shape');
  }
}
