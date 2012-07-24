/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

// TODO: implement filled and non-scaling strokes

/** @const */ var FILL_SOLID                        = 0;
/** @const */ var FILL_LINEAR_GRADIENT              = 16;
/** @const */ var FILL_RADIAL_GRADIENT              = 18;
/** @const */ var FILL_FOCAL_RADIAL_GRADIENT        = 19;
/** @const */ var FILL_REPEATING_BITMAP             = 64;
/** @const */ var FILL_CLIPPED_BITMAP               = 65;
/** @const */ var FILL_NONSMOOTHED_REPEATING_BITMAP = 66;
/** @const */ var FILL_NONSMOOTHED_CLIPPED_BITMAP   = 67;

function morph(start, end) {
  if (end !== undefined && end !== start)
    return start + '+' + (end - start) + '*r';
  return start;
}
function colorToStyle(color, colorMorph) {
  if (colorMorph) {
    return '"rgba("+~~(' + [
      morph(color.red, colorMorph.red),
      morph(color.green, colorMorph.green),
      morph(color.blue, colorMorph.blue),
      morph(color.alpha / 255, colorMorph.alpha / 255)
    ].join(')+","+~~(') + ')+")"';
  }
  return '"' + toStringRgba(color) + '"';
}
function matrixToTransform(matrix, matrixMorph) {
  if (matrixMorph) {
    return 'c.transform(' + [
      morph(matrix.scaleX * 20, matrixMorph.scaleX * 20),
      morph(matrix.scaleY * 20, matrixMorph.scaleY * 20),
      morph(matrix.skew0 * 20, matrixMorph.skew0 * 20),
      morph(matrix.skew1 * 20, matrixMorph.skew1 * 20),
      morph(matrix.translateX, matrixMorph.translateX),
      morph(matrix.translateY, matrixMorph.translateY)
    ].join(',') + ')';
  }
  return 'c.transform(' + [
    matrix.scaleX * 20,
    matrix.skew0 * 20,
    matrix.skew1 * 20,
    matrix.scaleY * 20,
    matrix.translateX,
    matrix.translateY
  ].join(',') + ')';
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
    while (segment = segments[j++]) {
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
      var cmds = [];
      cmds.push('c.beginPath()');
      var j = 0;
      var subpath;
      var prev = { };
      while (subpath = path[j++]) {
        if (subpath.spt !== prev.dpt)
          cmds.push('c.moveTo(' + subpath.spt + ')');
        var edges = subpath.edges;
        if (subpath.flip) {
          var k = edges.length;
          var edge;
          while (edge = edges[--k]) {
            if (edge.cpt)
              cmds.push('c.quadraticCurveTo(' + edge.cpt + ',' + edge.spt + ')');
            else
              cmds.push('c.lineTo(' + edge.spt + ')');
          }
        } else {
          var k = 0;
          var edge;
          while (edge = edges[k++]) {
            if (edge.cpt)
              cmds.push('c.quadraticCurveTo(' + edge.cpt + ',' + edge.dpt + ')');
            else
              cmds.push('c.lineTo(' + edge.dpt + ')');
          }
        }
        prev = subpath;
      }

      var fillStyle = fillStyles[i - 1];
      switch (fillStyle.type) {
      case FILL_SOLID:
        cmds.push('c.fillStyle=' + colorToStyle(fillStyle.color, fillStyle.colorMorph));
        cmds.push('c.fill()');
        break;
      case FILL_LINEAR_GRADIENT:
      case FILL_RADIAL_GRADIENT:
      case FILL_FOCAL_RADIAL_GRADIENT:
        if (fillStyle.type === FILL_LINEAR_GRADIENT) {
          cmds.push('var g=c.createLinearGradient(-819.2,0,819.2,0)');
        } else {
          var x1 = fillStyle.type === FILL_FOCAL_RADIAL_GRADIENT ?
            '819.2*' + morph(fillStyle.focalPoint, fillStyle.focalPointMorph) :
            '0'
          ;
          cmds.push('var g=c.createRadialGradient(' + x1 + ',0,0,0,0,819.2)');
        }
        var records = fillStyle.records;
        var j = 0;
        var record;
        while (record = records[j++]) {
          cmds.push('g.addColorStop(' +
                    morph(record.ratio / 255, isMorph ? record.ratioMorph / 255 : undefined) +
                    ',' + colorToStyle(record.color, record.colorMorph) + ')');
        }
        cmds.push('c.save()');
        cmds.push(matrixToTransform(fillStyle.matrix, fillStyle.matrixMorph));
        cmds.push('c.fillStyle=g');
        cmds.push('c.fill()');
        cmds.push('c.restore()');
        break;
      case FILL_REPEATING_BITMAP:
      case FILL_CLIPPED_BITMAP:
      case FILL_NONSMOOTHED_REPEATING_BITMAP:
      case FILL_NONSMOOTHED_CLIPPED_BITMAP:
        var repetition = fillStyle.repeat ? 'repeat' : 'no-repeat';
        var bitmap = dictionary[fillStyle.bitmapId];
        assert(bitmap, 'undefined bitmap', 'shape');
        cmds.push('var p=c.createPattern(d[' + bitmap.id + '].img,"' + repetition + '")');
        cmds.push('c.save()');
        cmds.push(matrixToTransform(fillStyle.matrix, fillStyle.matrixMorph));
        cmds.push('c.scale(0.05,0.05)');
        cmds.push('c.fillStyle=p');
        cmds.push('c.fill()');
        cmds.push('c.restore()');
        dependencies.push(bitmap.id);
        break;
      default:
        fail('invalid fill style', 'shape');
      }

      paths.push({ i: path[0].i, cmds: cmds });
    }
  }

  var i = 0;
  var lineStyle;
  while (lineStyle = lineStyles[i++]) {
    var segments = lineSegments[i];
    if (segments) {
      var strokeStyle = colorToStyle(lineStyle.color, lineStyle.colorMorph);
      var lineWidth =
        morph(lineStyle.width || 20, isMorph ? lineStyle.widthMorph || 20 : undefined);
      var j = 0;
      var segment;
      while (segment = segments[j++]) {
        var edges = segment.edges;
        var cmds = ['c.beginPath()'];
        var k = 0;
        var edge;
        var prev = { };
        while (edge = edges[k++]) {
          if (edge.spt !== prev.dpt)
            cmds.push('c.moveTo(' + edge.spt + ')');
          if (edge.cpt)
            cmds.push('c.quadraticCurveTo(' + edge.cpt + ',' + edge.dpt + ')');
          else
            cmds.push('c.lineTo(' + edge.dpt + ')');
          prev = edge;
        }
        cmds.push('c.strokeStyle=' + strokeStyle);
        cmds.push('c.lineWidth=' + lineWidth);
        cmds.push('c.lineCap="round"');
        cmds.push('c.lineJoin="round"');
        cmds.push('c.stroke()');
        paths.push({ i: segment.i, cmds: cmds });
      }
    }
  }

  paths.sort(function (a, b) {
    return a.i - b.i;
  });
  var cmds = [];
  var i = 0;
  var path;
  while (path = paths[i++])
    push.apply(cmds, path.cmds);
  var shape = {
    type: 'shape',
    id: tag.id,
    bounds: tag.bounds,
    data: cmds.join('\n')
  };
  if (dependencies.length)
    shape.require = dependencies;
  return shape;
}
