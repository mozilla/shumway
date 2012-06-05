if (typeof Path === 'undefined') {
(Path = function (undefined) {

'use strict';

var nativeClass = CanvasRenderingContext2D;
var nativeProto = nativeClass.prototype;

function Path(d) {
  if (!(this instanceof Path))
    return new Path(d);

  var segList;

  if (d === undefined)
    segList = [];
  else if (d instanceof Path)
    segList = d._segList.slice();
  else
    segList = parsePathData(d);

  Object.defineProperty(this, '_segList', { value: segList });
}

function parsePathData(d) {
  var data = (d + '').match(/[a-z][^a-z]*/gi);
  var result = [];

  var sx = 0;
  var sy = 0;
  var x = 0;
  var y = 0;
  var cpx = 0;
  var cpy = 0;

  for (var i = 0, n = data.length; i < n; ++i) {
    var chunk = data[i];
    var cmd = chunk[0].toUpperCase();

    if (cmd === 'Z') {
      result.push({
        func: nativeProto.lineTo,
        args: [sx, sy]
      });
      x = sx;
      y = sy;
      continue;
    }

    var args = chunk.slice(1)
                    .trim()
                    .replace(/(\d)-/g, '$1 -')
                    .split(/,|\s/)
                    .map(parseFloat);
    var argc = args.length;

    var abs = cmd === chunk[0];
    var j = 0;
    var dx = x;
    var dy = y;

    while (j < argc) {
      if (abs) {
        dx = dy = 0;
      }
      switch (cmd) {
      case 'A':
        var rx = args[j++];
        var ry = args[j++];
        var rotation = args[j++] * Math.PI / 180;
        var large = args[j++];
        var sweep = args[j++];
        dx += args[j++];
        dy += args[j++];
        var u = Math.cos(rotation);
        var v = Math.sin(rotation);

        var hx1 = (x - dx) / 2;
        var hy1 = (y - dy) / 2;
        var x1 = u * hx1 + v * hy1;
        var y1 = -v * hx1 + u * hy1;
        var prx = rx * rx;
        var pry = ry * ry;
        var px1 = x1 * x1;
        var py1 = y1 * y1;
        var pl = px1 / prx + py1 / pry;

        if (pl > 1) {
          rx = Math.sqrt(pl) * rx;
          ry = Math.sqrt(pl) * ry;
          prx = rx * rx;
          pry = ry * ry;
        }

        var sq = (prx * pry - prx * py1 - pry * px1) / (prx * py1 + pry * px1);
        sq = sq < 0 ? 0 : sq;
        var coef = (large === sweep ? -1 : 1) * Math.sqrt(sq);
        var cx1 = coef * rx * y1 / ry;
        var cy1 = coef * -ry * x1 / rx;

        var hx2 = (x + dx) / 2;
        var hy2 = (y + dy) / 2;
        var cx = hx2 + (u * cx1 - v * cy1);
        var cy = hy2 + (v * cx1 + u * cy1);

        var ux = (x1 - cx1) / rx;
        var uy = (y1 - cy1) / ry;
        var vx = (-x1 - cx1) / rx;
        var vy = (-y1 - cy1) / ry;

        var n1 = Math.sqrt(ux * ux + uy * uy);
        var startAngle = (uy < 0 ? -1 : 1) * Math.acos(ux / n1);

        var n2 = Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy));
        var p = ux * vx + uy * vy;
        var angleExtent = (ux * vy - uy * vx < 0 ? -1 : 1) * Math.acos(p / n2);

        if (sweep) {
          if (angleExtent < 0) {
            angleExtent += 2 * Math.PI;
          }
        } else if (angleExtent > 0) {
          angleExtent += 2 * Math.PI;
        }

        var endAngle = startAngle + angleExtent;

        result.push({
          func: nativeProto.ellipse || ellipse,
          args: [cx, cy, rx, ry, rotation, startAngle, endAngle, !sweep]
        });
        break;
      case 'C':
        var x1 = dx + args[j++];
        var y1 = dy + args[j++];
        cpx = dx + args[j++];
        cpy = dy + args[j++];
        dx += args[j++];
        dy += args[j++];
        result.push({
          func: nativeProto.bezierCurveTo,
          args: [x1, y1, cpx, cpy, dx, dy]
        });
        break;
      case 'H':
        dx += args[j++];
        result.push({
          func: nativeProto.lineTo,
          args: [dx, dy]
        });
        break;
      case 'L':
        dx += args[j++];
        dy += args[j++];
        result.push({
          func: nativeProto.lineTo,
          args: [dx, dy]
        });
        break;
      case 'M':
        dx += args[j++];
        dy += args[j++];
        sx = dx;
        sy = dy;
        result.push({
          func: nativeProto.moveTo,
          args: [dx, dy]
        });
        break;
      case 'Q':
        cpx = dx + args[j++];
        cpy = dy + args[j++];
        dx += args[j++];
        dy += args[j++];
        result.push({
          func: nativeProto.quadraticCurveTo,
          args: [cpx, cpy, dx, dy]
        });
        break;
      case 'S':
        var x1 = x * 2 - cpx;
        var y1 = y * 2 - cpy;
        cpx = dx + args[j++];
        cpy = dy + args[j++];
        dx += args[j++];
        dy += args[j++];
        result.push({
          func: nativeProto.bezierCurveTo,
          args: [x1, y1, cpx, cpy, dx, dy]
        });
        break;
      case 'T':
        cpx = x * 2 - cpx;
        cpy = y * 2 - cpy;
        dx += args[j++];
        dy += args[j++];
        result.push({
          func: nativeProto.quadraticCurveTo,
          args: [cpx, cpy, dx, dy]
        });
        break;
      case 'V':
        dy += args[j++];
        result.push({
          func: natives.lineTo,
          args: [dx, dy]
        });
        break;
      default:
        return result;
      }

      x = dx;
      y = dy;
    }
  }

  return result;
}

var pathMethods = Path.prototype;

[

  ['moveTo', 'x,y'],
  ['lineTo', 'x,y'],
  ['quadraticCurveTo', 'cpx,cpy,x,y'],
  ['bezierCurveTo', 'cp1x,cp1y,cp2x,cp2y,x,y'],
  ['arcTo', 'x1,y1,x2,y2,radius'],
  ['rect', 'x,y,w,h'],
  ['arc', 'x,y,radius,startAngle,endAngle,anticlockwise'],
  ['ellipse', 'x,y,radiusX,radiusY,rotation,startAngle,endAngle,anticlockwise']

].forEach(function (item) {
  var name = item[0];
  var params = item[1];

  Object.defineProperty(pathMethods, '_' + name, { value: nativeProto[name] || eval(name) });

  pathMethods[name] = eval('(' +

    'function ' + name + '(' + params + '){' +
      'this._segList.push({' +
        'func:this._' + name + ',' +
        'args:[' + params + ']' +
      '})' +
    '}' +

  ')');
});

function ellipse(x, y, rx, ry, rotation, startAngle, endAngle, anticlockwise) {
  var u = Math.cos(rotation);
  var v = Math.sin(rotation);
  this.save();
  this.transform(u * rx, v * ry, -v * rx, u * ry, x, y);
  this.arc(0, 0, 1, startAngle, endAngle, anticlockwise);
  this.restore();
}

[

  ['addPath', 'path,transformation'],
  ['addPathByStroking', 'path,styles,transformation'],
  ['addText', 'text,styles,transformation,x,y,maxWidth'],
  ['addPathByStrokingText', 'text,styles,transformation,x,y,maxWidth']

].forEach(function (item) {
  var name = item[0];
  var params = item[1];

  Object.defineProperty(pathMethods, '_' + name, { value: eval(name) });

  pathMethods[name] = eval('(' +

    'function ' + name + '(' + params + '){' +
      'this._segList.push({' +
        'func:func,' +
        'args:[' + params.replace(/^path/, 'Path(path)') + ']' +
      '})' +
    '}' +

  ')');
});

function addPath(path, transformation) {
  if (transformation) {
    var m = transformation;
    this.save();
    this.transform(m.a, m.b, m.c, m.d, m.e, m.f);
    this._drawPath(path);
    this.restore();
  } else {
    this._drawPath(path);
  }
}

function addPathByStroking(path, styles, transformation) {
  this.save();
  this._setDrawStyles(styles);

  if (transformation) {
    var m = transformation;
    this.transform(m.a, m.b, m.c, m.d, m.e, m.f);
  }

  this._drawPath(path);
  this.stroke();
  this.restore();
}

function addText(text, styles, transformation, x, y, maxWidth) {
  this.save();
  this._setDrawStyles(styles);

  if (transformation) {
    var m = transformation;
    this.transform(m.a, m.b, m.c, m.d, m.e, m.f);
  }

  this.fillText(text, x, y, maxWidth);
  this.restore();
}

function addPathByStrokingText(text, styles, transformation, x, y, maxWidth) {
  this.save();
  this._setDrawStyles(styles);

  if (transformation) {
    var m = transformation;
    this.transform(m.a, m.b, m.c, m.d, m.e, m.f);
  }

  this.strokeText(text, x, y, maxWidth);
  this.restore();
}

Path.initialize = function (obj) {
  ['fill', 'stroke', 'clip'].forEach(function (name) {
    if (obj[name] === nativeProto[name]) {
      Object.defineProperty(obj, '_' + name, { value: nativeProto[name] });

      obj[name] = eval('(' +

        'function ' + name + '(path){' +
          'if(path instanceof Path)' +
            'this._drawPath(path);' +

          'this._' + name + '(this)' +
        '}' +

      ')');
    }
  });
  this._drawPath = drawPath;
  this._setDrawStyles = setDrawStyles;
};

function drawPath(path) {
  var segList = path._segList;

  for (var i = 0, n = segList.length; i < n; ++i) {
    var seg = segList[i];
    seg.func.apply(this, seg.args);
  }
}

function setDrawStyles(styles) {
  this.lineWidth = styles.lineWidth;
  this.lineCap = styles.lineCap;
  this.lineJoin = styles.lineJoin;
  this.miterLimit = styles.miterLimit;
  this.font = styles.font;
  this.textAlign = styles.textAlign;
  this.textBaseline = styles.textBaseline;
}

return Path;

}());
