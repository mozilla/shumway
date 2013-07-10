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
/*global push, fail */

var GRAPHICS_FILL_CLIPPED_BITMAP               = 65;
var GRAPHICS_FILL_FOCAL_RADIAL_GRADIENT        = 19;
var GRAPHICS_FILL_LINEAR_GRADIENT              = 16;
var GRAPHICS_FILL_NONSMOOTHED_CLIPPED_BITMAP   = 67;
var GRAPHICS_FILL_NONSMOOTHED_REPEATING_BITMAP = 66;
var GRAPHICS_FILL_RADIAL_GRADIENT              = 18;
var GRAPHICS_FILL_REPEATING_BITMAP             = 64;
var GRAPHICS_FILL_SOLID                        =  0;

function morph(start, end) {
  if (!isNaN(end) && end !== start)
    return start + '+' + (end - start) + '*r';

  return start;
}
function morphColor(color, colorMorph) {
  return '"rgba(" + (' +
    morph(color.red, colorMorph.red) + '|0) + "," + (' +
    morph(color.green, colorMorph.green) + '|0) + "," + (' +
    morph(color.blue, colorMorph.blue) + '|0) + "," + (' +
    morph(color.alpha / 255, colorMorph.alpha / 255) +
  ') + ")"';
}
function toMatrixInstance(matrix, matrixMorph, scale) {
  if (scale === undefined)
    scale = 20;

  if (matrixMorph) {
    return '{' +
      'a:' + morph(matrix.a * scale, matrixMorph.a * scale) + ',' +
      'b:' + morph(matrix.b * scale, matrixMorph.b * scale) + ',' +
      'c:' + morph(matrix.c * scale, matrixMorph.c * scale) + ',' +
      'd:' + morph(matrix.d * scale, matrixMorph.d * scale) + ',' +
      'e:' + morph(matrix.tx * 20, matrixMorph.ty * 20) + ',' +
      'f:' + morph(matrix.tx * 20, matrixMorph.ty * 20) +
    '}';
  }

  return '{' +
    'a:' + (matrix.a * scale) + ',' +
    'b:' + (matrix.b * scale) + ',' +
    'c:' + (matrix.c * scale) + ',' +
    'd:' + (matrix.d * scale) + ',' +
    'e:' + (matrix.tx * 20) + ',' +
    'f:' + (matrix.ty * 20) +
  '}';
}

function defineShape(tag, dictionary) {
  var records = tag.records;
  var isMorph = tag.isMorph;
  var recordsMorph = isMorph ? tag.recordsMorph : [];
  var fillStyles = tag.fillStyles;
  var lineStyles = tag.lineStyles;
  var fillSegments = { };
  var lineSegments = { };
  var paths = [];
  var dependencies = [];

  var sx = 0;
  var sy = 0;
  var dx = 0;
  var dy = 0;
  var sxm = 0;
  var sym = 0;
  var dxm = 0;
  var dym = 0;
  var dpt = '0,0';
  var edges = [];
  var fillOffset = 0;
  var lineOffset = 0;
  var fill0 = 0;
  var fill1 = 0;
  var line = 0;
  for (var i = 0, j = 0, record; (record = records[i]); ++i) {
    if (record.type) {
      sx = dx;
      sy = dy;
      sxm = dxm;
      sym = dym;
      var edge = { i: i, spt: dpt };
      if (record.isStraight) {
        if (record.isGeneral) {
          dx += record.deltaX;
          dy += record.deltaY;
        } else if (record.isVertical) {
          dy += record.deltaY;
        } else {
          dx += record.deltaX;
        }
        if (isMorph) {
          var recordMorph = recordsMorph[j++];
          if (recordMorph.isStraight) {
            if (recordMorph.isGeneral) {
              dxm += recordMorph.deltaX;
              dym += recordMorph.deltaY;
            } else if (recordMorph.isVertical) {
              dym += recordMorph.deltaY;
            } else {
              dxm += recordMorph.deltaX;
            }
          } else {
            var cxm = sxm + recordMorph.controlDeltaX;
            var cym = sym + recordMorph.controlDeltaY;
            dxm = cxm + recordMorph.anchorDeltaX;
            dym = cym + recordMorph.anchorDeltaY;
            edge.cpt = morph(sx + ((dx - sx) / 2), cxm) + ',' + morph(sy + ((dy - sy) / 2), cym);
          }
        }
      } else {
        var cx = sx + record.controlDeltaX;
        var cy = sy + record.controlDeltaY;
        var cxm, cym;
        dx = cx + record.anchorDeltaX;
        dy = cy + record.anchorDeltaY;
        if (isMorph) {
          var recordMorph = recordsMorph[j++];
          if (recordMorph.isStraight) {
            if (recordMorph.isGeneral) {
              dxm += recordMorph.deltaX;
              dym += recordMorph.deltaY;
            } else if (recordMorph.isVertical) {
              dym += recordMorph.deltaY;
            } else {
              dxm += recordMorph.deltaX;
            }
            cxm = sxm + ((dxm - sxm) / 2);
            cym = sym + ((dym - sym) / 2);
          } else {
            cxm = sxm + recordMorph.controlDeltaX;
            cym = sym + recordMorph.controlDeltaY;
            dxm = cxm + recordMorph.anchorDeltaX;
            dym = cym + recordMorph.anchorDeltaY;
          }
          edge.cpt = morph(cx, cxm) + ',' + morph(cy, cym);
        } else {
          edge.cpt = cx + ',' + cy;
        }
      }
      if (isMorph)
        dpt = morph(dx, dxm) + ',' + morph(dy, dym);
      else
        dpt = dx + ',' + dy;
      edge.dpt = dpt;
      edges.push(edge);
    } else {
      if (edges.length) {
        if (fill0) {
          var list = fillSegments[fillOffset + fill0];
          if (!list)
            list = fillSegments[fillOffset + fill0] = [];
          list.push({
            i: i,
            spt: edges[0].spt,
            dpt: dpt,
            edges: edges
          });
        }
        if (fill1) {
          var list = fillSegments[fillOffset + fill1];
          if (!list)
            list = fillSegments[fillOffset + fill1] = [];
          list.push({
            i: i,
            spt: edges[edges.length - 1].dpt,
            dpt: edges[0].spt,
            edges: edges,
            flip: true
          });
        }
        if (line) {
          var list = lineSegments[lineOffset + line];
          if (!list)
            list = lineSegments[lineOffset + line] = [];
          list.push({
            i: i,
            spt: edges[0].spt,
            dpt: dpt,
            edges: edges
          });
        }
        edges = [];
      }
      if (record.eos)
        break;
      if (record.hasNewStyles) {
        fillOffset = fillStyles.length;
        lineOffset = lineStyles.length;
        push.apply(fillStyles, record.fillStyles);
        push.apply(lineStyles, record.lineStyles);
      }
      if (record.hasFillStyle0)
        fill0 = record.fillStyle0;
      if (record.hasFillStyle1)
        fill1 = record.fillStyle1;
      if (record.hasLineStyle)
        line = record.lineStyle;
      if (record.move) {
        dx = record.moveX;
        dy = record.moveY;
        if (isMorph) {
          var recordMorph = recordsMorph[j++];
          dxm = recordMorph.moveX;
          dym = recordMorph.moveY;
          dpt = morph(dx, dxm) + ',' + morph(dy, dym);
        } else {
          dpt = dx + ',' + dy;
        }
      }
    }
  }

  var i = 0;
  while (fillStyles[i++]) {
    var path = [];
    var segments = fillSegments[i];
    if (!segments)
      continue;
    var map = { };
    var j = 0;
    var segment;
    while ((segment = segments[j++])) {
      var list = map[segment.spt];
      if (!list)
        list = map[segment.spt] = [];
      list.push(segment);
    }
    var numSegments = segments.length;
    var j = 0;
    var count = 0;
    while ((segment = segments[j++]) && count < numSegments) {
      if (segment.skip)
        continue;
      var subpath = [segment];
      segment.skip = true;
      ++count;
      var spt = segment.spt;
      var list = map[spt];
      var k = list.length;
      while (k--) {
        if (list[k] === segment) {
          list.splice(k, 1);
          break;
        }
      }
      var dpt = segment.dpt;
      while (dpt !== spt && (list = map[dpt]) && list.length !== 0) {
        segment = list.shift();
        subpath.push(segment);
        segment.skip = true;
        ++count;
        dpt = segment.dpt;
      }
      push.apply(path, subpath);
    }
    if (path.length) {
      var commands = [];

      var fillStyle = fillStyles[i - 1];
      var fill;
      switch (fillStyle.type) {
      case GRAPHICS_FILL_SOLID:
        if (fillStyle.colorMorph) {
          fill = morphColor(fillStyle.color, fillStyle.colorMorph);
        } else {
          var color = fillStyle.color;
          fill = '"rgba(' + [color.red, color.green, color.blue, color.alpha / 255].join(',') + ')"';
        }
        break;
      case GRAPHICS_FILL_LINEAR_GRADIENT:
      case GRAPHICS_FILL_RADIAL_GRADIENT:
      case GRAPHICS_FILL_FOCAL_RADIAL_GRADIENT:
        var records = fillStyle.records;
        var stops = [];
        for (var j = 0, n = records.length; j < n; j++) {
          var record = records[j];
          var color = record.color;
          if (record.colorMorph) {
            stops.push('f.addColorStop(' +
              morph(record.ratio / 255, record.ratioMorph / 255) + ',' +
              morphColor(color, record.colorMorph) +
            ')');
          } else {
            stops.push('f.addColorStop(' +
              (record.ratio / 255) + ',' +
              '"rgba(' + [color.red, color.green, color.blue, color.alpha / 255].join(',') + ')"' +
            ')');
          }
        }
        var isLinear = fillStyle.type === GRAPHICS_FILL_LINEAR_GRADIENT;
        fill = '(' +
          'f=c._create' + (isLinear ? 'Linear' : 'Radial') + 'Gradient(' +
            (isLinear ?
              '-1, 0, 1, 0' :
              '(' + morph(fillStyle.focalPoint, fillStyle.focalPointMorph) + ' || 0), 0, 0, 0, 0, 1'
            ) +
          '),' +
          stops.join(',') + ',' +
          'f.currentTransform=' +
            toMatrixInstance(fillStyle.matrix, fillStyle.matrixMorph, 20 * 819.2) + ',' +
        'f)';
        break;
      case GRAPHICS_FILL_REPEATING_BITMAP:
      case GRAPHICS_FILL_CLIPPED_BITMAP:
      case GRAPHICS_FILL_NONSMOOTHED_REPEATING_BITMAP:
      case GRAPHICS_FILL_NONSMOOTHED_CLIPPED_BITMAP:
        var bitmap = dictionary[fillStyle.bitmapId];
        dependencies.push(bitmap.id);
        fill = '(' +
          'f=c._createPattern(' +
            'd[' + bitmap.id + '].value.props.img,' +
            (fillStyle.repeat ? '"repeat"' : '"no-repeat"') +
          '),' +
          'f.currentTransform=' +
            toMatrixInstance(fillStyle.matrix, fillStyle.matrixMorph, 1) + ',' +
        'f)';
        break;
      default:
        fail('invalid fill style', 'shape');
      }

      var cmds = [];
      var j = 0;
      var subpath;
      var prev = { };
      while ((subpath = path[j++])) {
        if (subpath.spt !== prev.dpt)
          cmds.push('M' + subpath.spt);
        var edges = subpath.edges;
        if (subpath.flip) {
          var k = edges.length;
          var edge;
          while ((edge = edges[--k])) {
            if (edge.cpt)
              cmds.push('Q' + edge.cpt + ',' + edge.spt);
            else
              cmds.push('L' + edge.spt);
          }
        } else {
          var k = 0;
          var edge;
          while ((edge = edges[k++])) {
            if (edge.cpt)
              cmds.push('Q' + edge.cpt + ',' + edge.dpt);
            else
              cmds.push('L' + edge.dpt);
          }
        }
        prev = subpath;
      }

      commands.push(
        '(' +
          'p=Kanvas.Path("' + cmds.join('') + '"),' +
          'p.fillStyle=' + fill + ',' +
        'p)'
      );

      paths.push({ i: path[0].i, commands: commands});
    }
  }

  var i = 0;
  var lineStyle;
  while ((lineStyle = lineStyles[i++])) {
    var segments = lineSegments[i], segment;
    if (segments) {
      var color = lineStyle.color;
      if (!color) {
        // TODO stroke defined by FILL_STYLE
        color = { red: 255, green: 0, blue: 128, alpha: 255 };
      }
      var stroke = lineStyle.colorMorph ?
        morphColor(color, lineStyle.colorMorph) :
        '"rgba(' + [color.red, color.green, color.blue, color.alpha / 255].join(',') + ')"'
      ;
      var lineWidth =
        morph(lineStyle.width || 20, isMorph ? lineStyle.widthMorph || 20 : undefined);
      // ignoring startCapStyle ?
      var capsStyle = lineStyle.endCapStyle === 1 ? 'none' :
                      lineStyle.endCapStyle === 2 ? 'square' : 'round';
      var joinStyle = lineStyle.joinStyle === 1 ? 'bevel' :
                       lineStyle.joinStyle === 2 ? 'miter' : 'round';
      var miterLimitFactor = lineStyle.miterLimitFactor;

      var cmds = [];
      var j = 0;
      var prev = { };
      while ((segment = segments[j++])) {
        var edges = segment.edges;
        var k = 0;
        var edge;
        while ((edge = edges[k++])) {
          if (edge.spt !== prev.dpt)
            cmds.push('M' + edge.spt);
          if (edge.cpt)
            cmds.push('Q' + edge.cpt + ',' + edge.dpt);
          else
            cmds.push('L' + edge.dpt);
          prev = edge;
        }
      }

      paths.push({
        i: Number.MAX_VALUE,
        commands: [
          '(' +
            'p=Kanvas.Path("' + cmds.join('') + '"),' +
            'p.strokeStyle=' + stroke + ',' +
            'p.drawingStyles={' +
              'lineWidth:' + lineWidth + ',' +
              'lineCap:"' + capsStyle + '",' +
              'lineJoin:"' + joinStyle + '",' +
              'miterLimit:' + (miterLimitFactor * 2) +
            '},' +
          'p)'
        ]
      });
    }
  }

  paths.sort(function (a, b) {
    return a.i - b.i;
  });
  var commands = [];
  var i = 0;
  var path;
  while ((path = paths[i++]))
    push.apply(commands, path.commands);
  var shape = {
    type: 'shape',
    id: tag.id,
    morph: isMorph,
    bbox: tag.strokeBbox || tag.bbox,
    data: '[' + commands.join(',') + ']'
  };
  if (dependencies.length)
    shape.require = dependencies;
  return shape;
}
