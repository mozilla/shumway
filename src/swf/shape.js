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
/*global fail, push */

var GRAPHICS_FILL_CLIPPED_BITMAP               = 65;
var GRAPHICS_FILL_FOCAL_RADIAL_GRADIENT        = 19;
var GRAPHICS_FILL_LINEAR_GRADIENT              = 16;
var GRAPHICS_FILL_NONSMOOTHED_CLIPPED_BITMAP   = 67;
var GRAPHICS_FILL_NONSMOOTHED_REPEATING_BITMAP = 66;
var GRAPHICS_FILL_RADIAL_GRADIENT              = 18;
var GRAPHICS_FILL_REPEATING_BITMAP             = 64;
var GRAPHICS_FILL_SOLID                        =  0;

var GRAPHICS_PATH_COMMAND_MOVE_TO        = 1;
var GRAPHICS_PATH_COMMAND_LINE_TO        = 2;
var GRAPHICS_PATH_COMMAND_CURVE_TO       = 3;

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
function applySegmentToStyles(segment, styles, linePaths, fillPaths)
{
  if (!segment) {
    return;
  }
  var commands = segment.commands;
  var data = segment.data;
  assert(commands);
  assert(data);
  var path;
  var targetSegment;
  var command;
  var i;
  if (styles.fill0) {
    path = fillPaths[styles.fill0 - 1];
    // If fill0 is the only style, we have pushed the segment to it's stack. In
    // that case, we have to replace its commands and data in place.
    if (!(styles.fill1 || styles.line)) {
      targetSegment = path.head();
      targetSegment.commands = [];
      targetSegment.data = [];
    } else {
      targetSegment = path.addSegment();
    }

    // For reversing the fill0 segments, we rely on the fact that each segment
    // starts with a moveTo. We push a new moveTo on the reversed stack, with
    // the final drawing command's target coordinates. For each of the following
    // commands, we take the coordinates of the command originally *preceding*
    // it as the new target coordinates. The final coordinates we target will be
    // the ones from the original first moveTo.
    var targetCommands = targetSegment.commands;
    var targetData = targetSegment.data;
    targetCommands.push(GRAPHICS_PATH_COMMAND_MOVE_TO);
    var j = data.length - 2;
    targetData.push(data[j], data[j + 1]);
    for (i = commands.length; i-- > 1; j -= 2) {
      command = commands[i];
      targetCommands.push(command);
      targetData.push(data[j - 2], data[j - 1]);
      if (command === GRAPHICS_PATH_COMMAND_CURVE_TO) {
        targetData.push(data[j - 4], data[j - 3]);
        j -= 2;
      }
    }
    assert(j === 0);
  }
  if (styles.line && styles.fill1)
  {
    path = linePaths[styles.line - 1];
    path.addSegment(commands, data);
  }
}

/*
 * Converts records from the space-optimized format they're stored in to a
 * format that's more amenable to fast rendering.
 *
 * See http://blogs.msdn.com/b/mswanson/archive/2006/02/27/539749.aspx and
 * http://wahlers.com.br/claus/blog/hacking-swf-1-shapes-in-flash/ for details.
 */
function convertRecordsToStyledPaths(records, linePaths, fillPaths,
                                     dictionary, dependencies)
{
  var styles = {fill0: 0, fill1: 0, line: 0};
  var segment = null;

  // fill- and lineStyles can be added by style change records in the middle of
  // a shape records list. All records refer to those new styles with a starting
  // offset of 1 again, so we just replace the current lists, but append all new
  // list entries to the original list which are stored in the generated symbol.
  var allFillPaths = fillPaths;
  var allLinePaths = linePaths;

  //TODO: remove the `- 1` once we stop even parsing the EOS record
  var numRecords = records.length - 1;
  var x = 0;
  var y = 0;
  for (var i = 0; i < numRecords; i++) {
    var record = records[i];
    // type 0 is a StyleChange record
    if (record.type === 0) {
      if (record.hasNewStyles) {
        fillPaths = createPathsList(record.fillStyles, false,
                                    dictionary, dependencies);
        push.apply(allFillPaths, fillPaths);
        linePaths = createPathsList(record.lineStyles, true,
                                    dictionary, dependencies);
        push.apply(allLinePaths, linePaths);
        styles = {fill0: 0, fill1: 0, line: 0};
      }

      //TODO: make the `has*` fields bitflags
      if (segment) {
        applySegmentToStyles(segment, styles, linePaths, fillPaths);
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
      var path;
      if (styles.fill1) {
        path = fillPaths[styles.fill1 - 1];
      } else if (styles.line) {
        path = linePaths[styles.line - 1];
      } else if (styles.fill0) {
        path = fillPaths[styles.fill0 - 1];
      }
      segment = path.addSegment();

      if (record.move) {
        x = record.moveX;
        y = record.moveY;
      }

      // Move or not, we want this path segment to start where the last one left
      // off. Even if the last one belonged to a different style.
      // "Huh," you say? Yup.
      segment.commands.push(GRAPHICS_PATH_COMMAND_MOVE_TO);
      segment.data.push(x, y);
    }
    // type 1 is a StraightEdge or CurvedEdge record
    else {
      assert(record.type === 1);
      assert(segment);
      if (record.isStraight) {
        x += record.deltaX | 0;
        y += record.deltaY | 0;
        segment.commands.push(GRAPHICS_PATH_COMMAND_LINE_TO);
        segment.data.push(x, y);
      } else {
        segment.commands.push(GRAPHICS_PATH_COMMAND_CURVE_TO);
        x += record.controlDeltaX | 0;
        y += record.controlDeltaY | 0;
        segment.data.push(x, y);
        x += record.anchorDeltaX | 0;
        y += record.anchorDeltaY | 0;
        segment.data.push(x, y);
      }
    }
  }
  applySegmentToStyles(segment, styles, linePaths, fillPaths);

  // After records processing completed, we can treat line paths just as we do
  // fill paths. The important thing is for them to come last.
  push.apply(fillPaths, linePaths);

  var removeCount = 0;
  for (i = 0; i < fillPaths.length; i++) {
    var path = fillPaths[i];
    if (!path.head()) {
      removeCount++;
      continue;
    }
    fillPaths[i - removeCount] = segmentedPathToShapePath(path);
  }
  fillPaths.length -= removeCount;
  return fillPaths;
}

function segmentedPathToShapePath(path) {
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

  var shape = new ShapePath(path.fillStyle, path.lineStyle);
  var allCommands = shape.commands;
  var allData = shape.data;

  current = finalRoot;
  while (current) {
    var offset = 0;
    var commands = current.commands;
    var data = current.data;

    // If the segment's first command is a moveTo to the current coordinates,
    // we have to skip it. Removing those in the previous loop would be too
    // costly.
    if (commands[0] === GRAPHICS_PATH_COMMAND_MOVE_TO && commands.length &&
        data[0] === allData[allData.length - 2] &&
        data[1] === allData[allData.length - 1])
    {
      offset = 1;
    }
    for (var i = offset; i < commands.length; i++) {
      allCommands.push(commands[i]);
    }
    for (i = offset * 2; i < data.length; i += 2) {
      allData.push(data[i], data[i+1]);
    }
    current = current.next;
  }
  return shape;
}

function processStyle(style, dictionary, dependencies) {
  // TODO: fully support line styles
  if (!style.hasFill) {
    return style;
  }
  var styleStr;
  var color;
  switch (style.type) {
    case GRAPHICS_FILL_SOLID:
      color = style.color;
      styleStr = 'rgba(' + color.red + ',' + color.green + ',' + color.blue +
                 ',' + color.alpha / 255 + ')';
      break;
    case GRAPHICS_FILL_LINEAR_GRADIENT:
    case GRAPHICS_FILL_RADIAL_GRADIENT:
    case GRAPHICS_FILL_FOCAL_RADIAL_GRADIENT:
      // TODO: support gradients
//      var records = fillStyle.records;
//      var stops = [];
//      for (var j = 0, n = records.length; j < n; j++) {
//        var record = records[j];
//        color = record.color;
//        if (record.colorMorph) {
//          stops.push('f.addColorStop(' +
//                     morph(record.ratio / 255, record.ratioMorph / 255) + ',' +
//                     morphColor(color, record.colorMorph) +
//                     ')');
//        } else {
//          stops.push('f.addColorStop(' +
//                     (record.ratio / 255) + ',' +
//                     '"rgba(' + [color.red, color.green, color.blue, color.alpha / 255].join(',') + ')"' +
//                     ')');
//        }
//      }
//      var isLinear = fillStyle.type === GRAPHICS_FILL_LINEAR_GRADIENT;
//      fill = '(' +
//             'f=ctx._create' + (isLinear ? 'Linear' : 'Radial') + 'Gradient(' +
//             (isLinear ?
//              '-1, 0, 1, 0' :
//              '(' + morph(fillStyle.focalPoint, fillStyle.focalPointMorph) + ' || 0), 0, 0, 0, 0, 1'
//                 ) +
//             '),' +
//             stops.join(',') + ',' +
//             'f.currentTransform=' +
//             toMatrixInstance(fillStyle.matrix, fillStyle.matrixMorph, 20 * 819.2) + ',' +
//             'f)';
      break;
    case GRAPHICS_FILL_REPEATING_BITMAP:
    case GRAPHICS_FILL_CLIPPED_BITMAP:
    case GRAPHICS_FILL_NONSMOOTHED_REPEATING_BITMAP:
    case GRAPHICS_FILL_NONSMOOTHED_CLIPPED_BITMAP:
      var bitmap = dictionary[style.bitmapId];
      dependencies.push(bitmap.id);
//
//      fill = '(' +
//             'f=ctx._createPattern(' +
//             'd[' + bitmap.id + '].value.props.img,' +
//             (fillStyle.repeat ? '"repeat"' : '"no-repeat"') +
//             '),' +
//             'f.currentTransform=' +
//             toMatrixInstance(fillStyle.matrix, fillStyle.matrixMorph, 1) + ',' +
//             'f)';
      break;
    default:
      fail('invalid fill style', 'shape');
  }
  return style;
}

/*
 * Paths are stored in 2-dimensional arrays. Each of the inner arrays contains
 * all the paths for a certain fill or line style.
 */
function createPathsList(styles, isLineStyle, dictionary, dependencies) {
  var paths = [];
  for (var i = 0; i < styles.length; i++) {
    var style = processStyle(styles[i], dictionary, dependencies);
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
  var fillPaths = createPathsList(tag.fillStyles, false,
                                  dictionary, dependencies);
  var linePaths = createPathsList(tag.lineStyles, true,
                                  dictionary, dependencies);
  var paths = convertRecordsToStyledPaths(tag.records, linePaths, fillPaths,
                                          dictionary, dependencies);

  return {
    type: 'shape',
    id: tag.id,
    bbox: tag.bbox,
    strokeBbox: tag.strokeBbox,
    paths: paths,
    dependencies: dependencies.length ? dependencies : null
  };
}

function SegmentedPath(fillStyle, lineStyle) {
  this.fillStyle = fillStyle;
  this.lineStyle = lineStyle;
  this._head = null;
}
SegmentedPath.prototype = {
  addSegment: function(commands /* = null */, data /* = null */) {
    var segment = {commands: commands || [], data: data || [],
                   prev: this._head, next: null};
    if (this._head) {
      this._head.next = segment;
    }
    this._head = segment;
    return segment;
  },
  // Does *not* reset the segments prev and next pointers!
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
    if (second.commands[0] !== GRAPHICS_PATH_COMMAND_MOVE_TO) {
      return false;
    }
    var firstLength = first.data.length;
    return first.data[firstLength - 2] === second.data[0] &&
           first.data[firstLength - 1] === second.data[1];
  }
}

function ShapePath(fillStyle, lineStyle) {
  this.fillStyle = fillStyle;
  this.lineStyle = lineStyle;

  // TODO: turn into typed arrays
  this.commands = [];
  this.data = [];
  this.isShapePath = true;
}

ShapePath.prototype = {
  moveTo: function(x, y) {
    this.commands.push(GRAPHICS_PATH_COMMAND_MOVE_TO);
    this.data.push(x, y);
  },
  lineTo: function(x, y) {
    this.commands.push(GRAPHICS_PATH_COMMAND_LINE_TO);
    this.data.push(x, y);
  },
  curveTo: function(controlX, controlY, anchorX, anchorY) {
    this.commands.push(GRAPHICS_PATH_COMMAND_CURVE_TO);
    this.data.push(controlX, controlY, anchorX, anchorY);
  },
  toString: function() {
    var out = 'ShapePath [\n';

    var data = this.data;
    var dataIndex = 0;
    this.commands.forEach(function(command) {
      switch (command) {
        case GRAPHICS_PATH_COMMAND_MOVE_TO:
          out += '\tmoveTo(' + data[dataIndex++] + ', ' + data[dataIndex++] + ');\n';
          break;
        case GRAPHICS_PATH_COMMAND_LINE_TO:
          out += '\tlineTo(' + data[dataIndex++] + ', ' + data[dataIndex++] + ');\n';
          break;
        case GRAPHICS_PATH_COMMAND_CURVE_TO:
          out += '\tquadraticCurveTo(' + data[dataIndex++] + ', ' +
                 data[dataIndex++] + ', ' + data[dataIndex++] + ', ' +
                 data[dataIndex++] + ');\n';
          break;
      }
    });

    if (this.fillStyle && this.fillStyle.color) {
      out += '\tfillStyle = ' + toStringRgba(this.fillStyle.color) + ';\n';
    }
    if (this.lineStyle && this.lineStyle.color) {
      out += '\tstrokeStyle = ' + toStringRgba(this.lineStyle.color) + ';\n';
    }

    return out + ']';
  }
}
