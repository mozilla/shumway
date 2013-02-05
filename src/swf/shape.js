var GRAPHICS_FILL_CLIPPED_BITMAP               = 65;
var GRAPHICS_FILL_FOCAL_RADIAL_GRADIENT        = 19;
var GRAPHICS_FILL_LINEAR_GRADIENT              = 16;
var GRAPHICS_FILL_NONSMOOTHED_CLIPPED_BITMAP   = 67;
var GRAPHICS_FILL_NONSMOOTHED_REPEATING_BITMAP = 66;
var GRAPHICS_FILL_RADIAL_GRADIENT              = 18;
var GRAPHICS_FILL_REPEATING_BITMAP             = 64;
var GRAPHICS_FILL_SOLID                        =  0;

var GRAPHICS_PATH_COMMAND_CUBIC_CURVE_TO       =  6;
var GRAPHICS_PATH_COMMAND_CURVE_TO             =  3;
var GRAPHICS_PATH_COMMAND_LINE_TO              =  2;
var GRAPHICS_PATH_COMMAND_MOVE_TO              =  1;
var GRAPHICS_PATH_COMMAND_WIDE_LINE_TO         =  5;
var GRAPHICS_PATH_COMMAND_WIDE_MOVE_TO         =  4;

function morph(start, end) {
  if (!isNaN(end) && end !== start)
    return start + '+' + (end - start) + '*r';

  return start;
}
function morphColor(color, colorMorph) {
  return '(' + morph(color.red, colorMorph.red) + ')<<16|' +
         '(' + morph(color.green, colorMorph.green) + ')<<8|' +
         '(' + morph(color.blue, colorMorph.blue) + ')';
}
function toColorProperties(color, colorMorph) {
  if (colorMorph) {
    return 'color:' + morphColor(color, colorMorph) + ',' +
           'alpha:' + morph(color.alpha / 255, colorMorph.alpha / 255);
  }

  if (color) {
    return 'color:' + (color.red << 16 | color.green << 8 | color.blue) + ',' +
           'alpha:' + (color.alpha / 255);
  }

  return 'color: 0, alpha: 1';
}
function toMatrixInstance(matrix, matrixMorph) {
  if (matrixMorph) {
    return '{' +
      '__class__:"flash.geom.Matrix",' +
      'a:' + morph(matrix.a * 20, matrixMorph.a * 20) + ',' +
      'b:' + morph(matrix.b * 20, matrixMorph.b * 20) + ',' +
      'c:' + morph(matrix.c * 20, matrixMorph.c * 20) + ',' +
      'd:' + morph(matrix.d * 20, matrixMorph.d * 20) + ',' +
      'tx:' + morph(matrix.tx, matrixMorph.tx) + ',' +
      'ty:' + morph(matrix.ty, matrixMorph.ty) +
    '}';
  }

  return '{' +
    '__class__:"flash.geom.Matrix",' +
    'a:' + (matrix.a * 20) + ',' +
    'b:' + (matrix.b * 20) + ',' +
    'c:' + (matrix.c * 20) + ',' +
    'd:' + (matrix.d * 20) + ',' +
    'tx:' + (matrix.tx * 20) + ',' +
    'ty:' + (matrix.ty * 20) +
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
  for (var i = 0, j = 0, record; record = records[i]; ++i) {
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
            var cxm = sxm + ((dxm - sxm) / 2);
            var cym = sym + ((dym - sym) / 2);
          } else {
            var cxm = sxm + recordMorph.controlDeltaX;
            var cym = sym + recordMorph.controlDeltaY;
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
      while (dpt !== spt && (list = map[dpt]) != false) {
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
      switch (fillStyle.type) {
      case GRAPHICS_FILL_SOLID:
        commands.push('{' +
          '__class__:"flash.display.GraphicsSolidFill",' +
          '__isIGraphicsFill__:true,' +
          toColorProperties(fillStyle.color, fillStyle.colorMorph) +
        '}');
        break;
      case GRAPHICS_FILL_LINEAR_GRADIENT:
      case GRAPHICS_FILL_RADIAL_GRADIENT:
      case GRAPHICS_FILL_FOCAL_RADIAL_GRADIENT:
        var records = fillStyle.records;
        var colors = [];
        var alphas = [];
        var ratios = [];
        for (var j = 0, n = records.length; j < n; j++) {
          var record = records[j];
          var color = record.color;
          if (record.colorMorph) {
            var colorMorph = record.colorMorph;
            colors.push(morphColor(color, colorMorph));
            alphas.push(morph(color.alpha / 255, colorMorph.alpha / 255));
            ratios.push(morph(record.ratio / 255, record.ratioMorph / 255));
          } else {
            colors.push(color.red << 16 | color.green << 8 | color.blue);
            alphas.push(color.alpha / 255);
            ratios.push(record.ratio / 255);
          }
        }
        commands.push('{' +
          '__class__:"flash.display.GraphicsGradientFill",' +
          '__isIGraphicsFill__:true,' +
          'type:' + (fillStyle.type == GRAPHICS_FILL_LINEAR_GRADIENT ? '"linear"' : '"radial"') + ',' +
          'colors:[' + colors.join(',') + '],' +
          'alphas:[' + alphas.join(',') + '],' +
          'ratios:[' + ratios.join(',') + '],' +
          'matrix:' + toMatrixInstance(fillStyle.matrix, fillStyle.matrixMorph),
          'spreadMode:"pad",' +
          'interpolationMode:"rgb",' +
          'focalPointRatio:' + morph(fillStyle.focalPoint, fillStyle.focalPointMorph) +
        '}');
        break;
      case GRAPHICS_FILL_REPEATING_BITMAP:
      case GRAPHICS_FILL_CLIPPED_BITMAP:
      case GRAPHICS_FILL_NONSMOOTHED_REPEATING_BITMAP:
      case GRAPHICS_FILL_NONSMOOTHED_CLIPPED_BITMAP:
        var bitmap = dictionary[fillStyle.bitmapId];
        commands.push('{' +
          '__class__:"flash.display.GraphicsBitmapFill",' +
          '__isIGraphicsFill__:true,' +
          'bitmapData: {' +
            '__class__:"flash.display.BitmapData",' +
            '_drawable:d[' + bitmap.id + '].value.props.img' +
          '},' +
          'matrix:' + toMatrixInstance(fillStyle.matrix, fillStyle.matrixMorph),
          'repeat:' + !!fillStyle.repeat +
        '}');
        dependencies.push(bitmap.id);
        break;
      default:
        fail('invalid fill style', 'shape');
      }

      var cmds = [];
      var data = [];
      var j = 0;
      var subpath;
      var prev = { };
      while ((subpath = path[j++])) {
        if (subpath.spt !== prev.dpt) {
          cmds.push(GRAPHICS_PATH_COMMAND_MOVE_TO);
          data.push(subpath.spt);
        }
        var edges = subpath.edges;
        if (subpath.flip) {
          var k = edges.length;
          var edge;
          while ((edge = edges[--k])) {
            if (edge.cpt) {
              cmds.push(GRAPHICS_PATH_COMMAND_CURVE_TO);
              data.push(edge.cpt, edge.spt);
            } else {
              cmds.push(GRAPHICS_PATH_COMMAND_LINE_TO);
              data.push(edge.spt);
            }
          }
        } else {
          var k = 0;
          var edge;
          while ((edge = edges[k++])) {
            if (edge.cpt) {
              cmds.push(GRAPHICS_PATH_COMMAND_CURVE_TO);
              data.push(edge.cpt, edge.dpt);
            } else {
              cmds.push(GRAPHICS_PATH_COMMAND_LINE_TO);
              data.push(edge.dpt);
            }
          }
        }
        prev = subpath;
      }

      commands.push('{' +
        '__class__:"flash.display.GraphicsPath",' +
        '__isIGraphicsPath__:true,' +
        'commands:[' + cmds.join(',') + '],' +
        'data:[' + data.join(',') + ']' +
      '},{' +
        '__class__:"flash.display.GraphicsEndFill",' +
        '__isIGraphicsFill__:true' +
      '}');

      paths.push({ i: path[0].i, commands: commands});
    }
  }

  var i = 0;
  var lineStyle;
  while ((lineStyle = lineStyles[i++])) {
    var segments = lineSegments[i];
    if (segments) {
      var colorProps = toColorProperties(lineStyle.color, lineStyle.colorMorph);
      var lineWidth =
        morph(lineStyle.width || 20, isMorph ? lineStyle.widthMorph || 20 : undefined);
      // ignoring startCapStyle ?
      var capsStyle = lineStyle.endCapStyle === 1 ? 'none' :
                      lineStyle.endCapStyle === 2 ? 'square' : 'round';
      var joinStyle = lineStyle.joinStyle === 1 ? 'bevel' :
                       lineStyle.joinStyle === 2 ? 'miter' : 'round';
      var miterLimitFactor = lineStyle.miterLimitFactor;

      var cmds = [];
      var data = [];
      var j = 0;
      var prev = { };
      while ((segment = segments[j++])) {
        var edges = segment.edges;
        var k = 0;
        var edge;
        while ((edge = edges[k++])) {
          if (edge.spt !== prev.dpt) {
            cmds.push(GRAPHICS_PATH_COMMAND_MOVE_TO);
            data.push(edge.spt);
          }
          if (edge.cpt) {
            cmds.push(GRAPHICS_PATH_COMMAND_CURVE_TO);
            data.push(edge.cpt, edge.dpt);
          } else {
            cmds.push(GRAPHICS_PATH_COMMAND_LINE_TO);
            data.push(edge.dpt);
          }
          prev = edge;
        }
      }

      paths.push({
        i: Number.MAX_VALUE,
        commands: [
          '{' +
            '__class__:"flash.display.GraphicsStroke",' +
            '__isIGraphicsStroke__:true,' +
            'thickness:' + lineWidth + ',' +
            'pixelHinting:false,' +
            'caps:"' + capsStyle + '",' +
            'joins:"' + joinStyle + '",' +
            'miterLimit:' + (miterLimitFactor * 2) + ',' +
            'scaleMode:"normal",' +
            'fill:{' +
              '__class__:"flash.display.GraphicsSolidFill",' +
              '__isIGraphicsFill__:true,' +
              colorProps +
            '}' +
          '},{' +
            '__class__:"flash.display.GraphicsPath",' +
            '__isIGraphicsPath__:true,' +
            'commands:[' + cmds.join(',') + '],' +
            'data:[' + data.join(',') + ']' +
          '},{' +
            '__isIGraphicsStroke__:true,' +
            'fill:null' +
          '}'
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
