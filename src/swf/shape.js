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
var GRAPHICS_PATH_COMMAND_WIDE_MOVE_TO   = 4;
var GRAPHICS_PATH_COMMAND_WIDE_LINE_TO   = 5;
var GRAPHICS_PATH_COMMAND_CUBIC_CURVE_TO = 6;

/*
 * Applies commands to the paths of all styles specified in the last
 * style-change record.
 *
 * For fill0, we have to apply commands and their data in reverse order, to turn
 * left fills into right ones.
 *
 * If we have more than one style, we only recorded commands for the first one
 * and have to duplicate them for the other styles. The order is: fill1, line,
 * fill0.
 */
function applyCommandsForStyles(styles, commands, data, commandsStart,
                                dataStart, linePaths, fillPaths)
{
  if (!commands) {
    return;
  }
  assert(data);
  var path;
  var targetCommands;
  var targetData;
  var command;
  var i;
  if (styles.line && styles.fill1)
  {
    path = linePaths[styles.line - 1];
    targetCommands = path.commands;
    targetData = path.data;
    for (i = commandsStart; i < commands.length; i++) {
      targetCommands.push(commands[i]);
    }
    for (i = dataStart; i < data.length; i++) {
      targetData.push(data[i]);
    }
  }
  if (styles.fill0) {
    path = fillPaths[styles.fill0 - 1];
    targetCommands = path.commands;
    targetData = path.data;
    var j = data.length;
    for (i = commands.length; i-- > commandsStart;) {
      command = commands[i];
      targetCommands.push(command);
      if (command === GRAPHICS_PATH_COMMAND_CURVE_TO) {
        targetData.push(data[j - 4], data[j - 3], data[j - 2], data[j - 1]);
        j -= 4;
      } else {
        targetData.push(data[j - 2], data[j - 1]);
        j -= 2;
      }
    }
    assert(j === dataStart);
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
  var commands = null;
  var data = null;
  var commandsStart = 0;
  var dataStart = 0;

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
      // Annoyingly, moves don't have their own shape record type, so there are
      // move-only style change records. Before applying style changes, we have
      // to check for those.
      if (record.hasFillStyle1 || record.hasFillStyle1 || record.hasLineStyle) {
        if (commands) {
          applyCommandsForStyles(styles, commands, data, commandsStart,
                                 dataStart, linePaths, fillPaths);
          commands = null;
          data = null;
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
      }
      var path;
      //TODO: make the `has*` fields bitflags
      if (styles.fill1) {
        path = fillPaths[styles.fill1 - 1];
        commands = path.commands;
        data = path.data;
        // fill1 commands have to be reversed, and line commands can just be
        // copied over if we're creating fill styles anyway. For both to work,
        // we have to know where to start the copying.
        commandsStart = commands.length;
        dataStart = data.length;
      } else if (styles.line) {
        path = linePaths[styles.line - 1];
        commands = path.commands;
        data = path.data;
      } else if (styles.fill0) {
        commands = [];
        data = [];
        commandsStart = 0;
        dataStart = 0;
      }
      if (record.move) {
        x = record.moveX;
        y = record.moveY;
      }
      commands.push(GRAPHICS_PATH_COMMAND_MOVE_TO);
      data.push(x, y);
    }
    // type 1 is a StraightEdge or CurvedEdge record
    else {
      assert(record.type === 1);
      assert(commands);
      assert(data);
      if (record.isStraight) {
        x += record.deltaX | 0;
        y += record.deltaY | 0;
        commands.push(GRAPHICS_PATH_COMMAND_LINE_TO);
        data.push(x, y);
      } else {
        commands.push(GRAPHICS_PATH_COMMAND_CURVE_TO);
        x += record.controlDeltaX | 0;
        y += record.controlDeltaY | 0;
        data.push(x, y);
        x += record.anchorDeltaX | 0;
        y += record.anchorDeltaY | 0;
        data.push(x, y);
      }
    }
  }
  applyCommandsForStyles(styles, commands, data, commandsStart, dataStart,
                         linePaths, fillPaths);
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
      paths[i] = new ShapePath(style, null);
    } else {
      paths[i] = new ShapePath(null, style);
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
  convertRecordsToStyledPaths(tag.records, linePaths, fillPaths,
                              dictionary, dependencies);

  // After all is said and done, we can finally treat line paths just as we do
  // fills. The important thing is for them to come last.
  push.apply(fillPaths, linePaths);

  return {
    type: 'shape',
    id: tag.id,
    bbox: tag.bbox,
    strokeBbox: tag.strokeBbox,
    paths: fillPaths,
    dependencies: dependencies.length ? dependencies : null
  };
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
          out += '\tmoveTo(' + data[dataIndex++]/20 + ', ' + data[dataIndex++]/20 + ');\n';
          break;
        case GRAPHICS_PATH_COMMAND_LINE_TO:
          out += '\tlineTo(' + data[dataIndex++]/20 + ', ' + data[dataIndex++]/20 + ');\n';
          break;
        case GRAPHICS_PATH_COMMAND_CURVE_TO:
          out += 'quadraticCurveTo(' + data[dataIndex++]/20 + ', ' +
                 data[dataIndex++]/20 + ', ' + data[dataIndex++]/20 + ', ' +
                 data[dataIndex++]/20 + ');\n';
          break;
      }
    });

    if (this.fillStyle && this.fillStyle.color) {
      out += prefix + 'fillStyle = ' + toStringRgba(this.fillStyle.color) + ';\n';
    }
    if (this.lineStyle && this.lineStyle.color) {
      out += prefix + 'strokeStyle = ' + toStringRgba(this.lineStyle.color) + ';\n';
    }

    return out + ']';
  }
}
