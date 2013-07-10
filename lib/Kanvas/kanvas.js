// Kanvas v0.0.0 (c) 2013 Tobias Schneider
// Released under MIT license.

// Kanvas adds support for not (yet) implemented HTML Canvas APIs.

;var Kanvas = Kanvas || (function (doc, undefined) {

  'use strict';

  /** @const */ var PATH_OP_CLOSE     = 0;
  /** @const */ var PATH_OP_MOVE      = 1;
  /** @const */ var PATH_OP_LINE      = 2;
  /** @const */ var PATH_OP_CURVE     = 3;
  /** @const */ var PATH_OP_BEZIER    = 4;
  /** @const */ var PATH_OP_ARCTO     = 5;
  /** @const */ var PATH_OP_RECT      = 6;
  /** @const */ var PATH_OP_ARC       = 7;
  /** @const */ var PATH_OP_ELLIPSE   = 8;
  /** @const */ var PATH_OP_TRANSFORM = 9;

  /** @const */ var PI                = Math.PI;
  /** @const */ var PI_DOUBLE         = PI * 2;
  /** @const */ var PI_HALF           = PI / 2;

  /** @const */ var SVG_NAMESPACE     = 'http://www.w3.org/2000/svg';

  var Kanvas = { VERSION: '0.0.0' };

  var nativeCanvas = doc.createElement('canvas');
  var nativeCanvasClass = nativeCanvas.constructor;

  var native2dCtx = nativeCanvas.getContext('2d');
  var native2dCtxClass = native2dCtx.constructor;

  var nativeCanvasProto = nativeCanvasClass.prototype;
  var native2dCtxProto = native2dCtxClass.prototype;
  var kanvas2dCtxProto = Object.create(null);

  var nativePathClass = typeof Path === 'undefined' ? undefined : Path;
  var nativePathProto = nativePathClass && nativePathClass.prototype;
  var kanvasPathProto = Object.create(null);

  var shimCurrentTransform = !('currentTransform' in native2dCtx);
  var shimResetTransform = !('resetTransform' in native2dCtxProto);

  var shimEllipticalArcTo = false;
  try {
    native2dCtx.arcTo(0, 0, 1, 1, 1, -1);
  } catch (e) {
    shimEllipticalArcTo = true;
  }

  var shimEllipse = !('ellipse' in native2dCtxProto);

  var shimPath = !nativePathClass;
  var shimBounds = shimPath;
  var shimStrokePath = shimPath;

  if (!shimPath) {
    shimBounds = !('getBounds' in nativePathProto);
    shimStrokePath = !('StrokePath' in nativePathProto);
    shimPath = shimBounds || shimStrokePath;
  }

  var shimHitRegions = !('addHitRegions' in native2dCtxProto);

  var defineProp = Object.defineProperty;
  var getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var getOwnPropNames = Object.getOwnPropertyNames;

  var transformClass, idTransform, pathClass;

  function defineLazyProp(obj, prop, desc) {
    defineProp(obj, prop, {
      get: function () {
        if (this === obj)
          return;

        var val;
        if (desc.get) {
          val = desc.get.call(this);
          defineProp(this, prop, {
            value: val,
            writable: desc.writable,
            configurable: desc.configurable,
            enumerable: desc.enumerable
          });
        } else {
          val = desc.value;
        }
        return val;
      },
      configurable: true
    });
  }

  function mixinProps(dest, source) {
    var props = getOwnPropNames(source);
    for (var i = 0; i < props.length; i++) {
      var key = props[i];
      var desc = getOwnPropDesc(source, key);
      safeReplaceProp(dest, key, desc);
    }
  }
  function safeReplaceProp(obj, prop, desc) {
    if (prop in obj) {
      defineProp(obj, '_' +  prop, {
        value: obj[prop],
        configurable: true
      });
    }
    defineProp(obj, prop, desc);
  }

  function tmplf(format) {
    if (arguments.length === 1)
      return tmplf.bind(null, format);

    var params = ['_'];
    var args = [mapf];

    for (var i = 1; i < arguments.length; i++) {
      params[i] = '$' + i;
      args[i] = arguments[i];
    }

    return Function(params.join(','),
      'return "' + format.replace(

        /\$(\$|[1-9]\d*|\(((?:(['"]).*?\3|.)*?);\))|"/g,

        function sub(match, p1,p2) {
          if (p1) {
            if (p1 === '$')
              return p1;

            if (p2)
              return '"+(' + p2 + ')+"';

            return '"+' + match + '+"';
          }

          return '\\"';
        }
      ) + '"'
    ).apply(null, args);
  }
  function mapf(array, format, separator) {
    if (+array == array)
      array = Array(array);
    else if (typeof array === 'string')
      array = array.split(',');

    if (format)
      array = array.map(tmplf(format));

    if (separator !== undefined)
      return array.join(separator);

    return array;
  }
  function evalf(format) {
    return (1, eval)('1,' + tmplf.apply(null, arguments));
  }

  function parseSvgDataStr(sink, d) {
    var chunks = (d + '').match(/[a-z][^a-z]*/gi);

    var x0 = 0;
    var y0 = 0;
    var cpx = 0;
    var cpy = 0;

    var x = 0;
    var y = 0;

    for (var i = 0; i < chunks.length; i++) {
      var seg = chunks[i];
      var cmd = seg[0].toUpperCase();

      if (cmd === 'Z') {
        sink.closePath();
        continue;
      }

      var abs = cmd === seg[0];
      var args = seg.slice(1)
                    .trim()
                    .replace(/(\d)-/g, '$1 -')
                    .split(/,|\s/)
                    .map(parseFloat);
      var narg = args.length;

      var j = 0;
      while (j < narg) {
        x0 = x;
        y0 = y;

        if (abs)
          x = y = 0;

        switch (cmd) {
        case 'A':
          var rx = args[j++];
          var ry = args[j++];
          var rotation = args[j++] * PI / 180;
          var large = args[j++];
          var sweep = args[j++];

          x += args[j++];
          y += args[j++];

          var u = Math.cos(rotation);
          var v = Math.sin(rotation);

          var h1x = (x0 - x) / 2;
          var h1y = (y0 - y) / 2;
          var x1 = u * h1x + v * h1y;
          var y1 = -v * h1x + u * h1y;

          var prx = rx * rx;
          var pry = ry * ry;
          var plx = x1 * x1;
          var ply = y1 * y1;

          var pl = plx / prx + ply / pry;
          if (pl > 1) {
            rx *= Math.sqrt(pl);
            ry *= Math.sqrt(pl);
            prx = rx * rx;
            pry = ry * ry;
          }

          var sq = (prx * pry - prx * ply - pry * plx) / (prx * ply + pry * plx);
          var coef = (large === sweep ? -1 : 1) * (sq < 0 ? 0 : Math.sqrt(sq));
          var ox = coef * rx * y1 / ry;
          var oy = coef * -ry * x1 / rx;

          var h2x = (x0 + x) / 2;
          var h2y = (y0 + y) / 2;
          var cx = u * ox - v * oy + h2x;
          var cy = v * ox + u * oy + h2y;

          var ux = (x1 - ox) / rx;
          var uy = (y1 - oy) / ry;
          var vx = (-x1 - ox) / rx;
          var vy = (-y1 - oy) / ry;

          var n0 = Math.sqrt(ux * ux + uy * uy);
          var a0 = (uy < 0 ? -1 : 1) * Math.acos(ux / n0);

          var n1 = Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy));
          var p = ux * vx + uy * vy;
          var aext = (ux * vy - uy * vx < 0 ? -1 : 1) * Math.acos(p / n1);
          if (sweep) {
            if (aext < 0)
              aext += PI_DOUBLE;
          } else if (aext > 0) {
            aext += PI_DOUBLE;
          }
          var a1 = a0 + aext;

          sink.ellipse(cx,cy, rx,ry, rotation, a0,a1, !sweep);
          break;
        case 'C':
          var x1 = x + args[j++];
          var y1 = y + args[j++];

          cpx = x + args[j++];
          cpy = y + args[j++];

          x += args[j++];
          y += args[j++];

          sink.bezierCurveTo(x1,y1, cpx,cpy, x,y);
          break;
        case 'H':
          x += args[j++];
          sink.lineTo(x, y);
          break;
        case 'L':
          x += args[j++];
          y += args[j++];
          sink.lineTo(x, y);
          break;
        case 'M':
          x += args[j++];
          y += args[j++];
          sink.moveTo(x, y);
          break;
        case 'Q':
          cpx = x + args[j++];
          cpy = y + args[j++];

          x += args[j++];
          y += args[j++];

          sink.quadraticCurveTo(cpx,cpy, x,y);
          break;
        case 'S':
          var x1 = x0 * 2 - cpx;
          var y1 = y0 * 2 - cpy;

          cpx = x + args[j++];
          cpy = y + args[j++];

          x += args[j++];
          y += args[j++];

          sink.bezierCurveTo(x1,y1, cpx,cpy, x,y);
          break;
        case 'T':
          cpx = x0 * 2 - cpx;
          cpy = y0 * 2 - cpy;

          x += args[j++];
          y += args[j++];

          sink.quadraticCurveTo(cpx,cpy, x,y);
          break;
        case 'V':
          y += args[j++];
          sink.lineTo(x, y);
          break;
        default:
          return;
        }
      }
    }
  }

  function arcToCurveSegs(sink, cx,cy, r, a0,a1, ccw, m11,m12, m21,m22, tx,ty) {
    var x = cx + Math.cos(a0) * r;
    var y = cy + Math.sin(a0) * r;

    var x1 = x * m11 + y * m12 + tx;
    var y1 = x * m21 + y * m22 + ty;

    //sink._lineSeg(sink._state[4],sink._state[5], x1,y1);

    if (ccw) {
      if (a0 < a1)
        a0 += Math.ceil((a1 - a0) / PI_DOUBLE + 0.1) * PI_DOUBLE;
      if (a0 - a1 > PI_DOUBLE)
        a1 = a0 - PI_DOUBLE;
    } else {
      if (a1 < a0)
        a1 += Math.ceil((a0 - a1) / PI_DOUBLE + 0.1) * PI_DOUBLE;
      if (a1 - a0 > PI_DOUBLE)
        a1 = a0 + PI_DOUBLE;
    }

    var sweep = Math.abs(a1 - a0);
    var dir = ccw ? -1 : 1;

    while (sweep > 0) {
      a1 = a0 + (sweep > PI_HALF ? PI_HALF : sweep) * dir;

      var kappa = (4 / 3) * Math.tan((a1 - a0) / 4) * r;

      var cos0 = Math.cos(a0);
      var sin0 = Math.sin(a0);
      var cp1x = cx + cos0 * r + -sin0 * kappa;
      var cp1y = cy + sin0 * r + cos0 * kappa;

      var cos1 = Math.cos(a1);
      var sin1 = Math.sin(a1);

      x = cx + cos1 * r;
      y = cy + sin1 * r;

      var cp2x = x + sin1 * kappa;
      var cp2y = y + -cos1 * kappa;

      var x2 = x * m11 + y * m12 + tx;
      var y2 = x * m21 + y * m22 + ty;

      sink._curveSeg(
        x1,
        y1,
        cp1x * m11 + cp1y * m12 + tx,
        cp1x * m21 + cp1y * m22 + ty,
        cp2x * m11 + cp2y * m12 + tx,
        cp2x * m21 + cp2y * m22 + ty,
        x2,
        y2
      );

      x1 = x2;
      y1 = y2;

      a0 = a1;
      sweep -= PI_HALF;
    }
  }

  function getDerivativeRoots(x0,y0, cp1x,cp1y, cp2x,cp2y, x,y) {
    var res = [];

    var dn1x = -x0 + 3 * cp1x - 3 * cp2x + x;
    if (dn1x) {
      var txl = -x0 + 2 * cp1x - cp2x;
      var txr = -Math.sqrt(-x0 * (cp2x + x) + cp1x * cp1x -
                           cp1x * (cp2x + x) + cp2x * cp2x);

      var r1 = (txl + txr) / dn1x;
      if (r1 > 0 && r1 < 1)
        res.push(r1);

      var r2 = (txl - txr) / dn1x;
      if (r2 > 0 && r2 < 1)
        res.push(r2);
    }

    var dn2x = x0 - 3 * cp1x + 3 * cp2x - x;
    if (dn2x) {
      var r3 = (x0 - 2 * cp1x + cp2x) / dn2x;
      if (r3 > 0 && r3 < 1)
        res.push(r3);
    }

    var dn1y = -y0 + 3 * cp1x - 3 * cp2x + y;
    if (dn1y) {
      var tyl = -y0 + 2 * cp1y - cp2y;
      var tyr = -Math.sqrt(-y0 * (cp2y + y) + cp1y * cp1y -
                           cp1y * (cp2y + y) + cp2y * cp2y);

      var r4 = (tyl + tyr) / dn1y;
      if (r4 > 0 && r4 < 1)
        res.push(r4);

      var r5 = (tyl - tyr) / dn1y;
      if (r5 > 0 && r5 < 1)
        res.push(r5);
    }

    var dn2y = y0 - 3 * cp1y + 3 * cp2y - y;
    if (dn2y) {
      var r6 = (y0 - 2 * cp1y + cp2y) / dn2y;
      if (r6 > 0 && r6 < 1)
        res.push(r6);
    }

    return res;
  }

  function computeCubicBaseValue(t, a,b,c,d) {
    var mt = 1 - t;
    return mt * mt * mt * a + 3 * mt * mt * t * b +
           3 * mt * t * t * c + t * t * t * d;
  }

  function findCubicRoot(a,b,c,d, offset) {
    var t = 1;
    do {
      var r = t;
      var depth = 1;

      do {
        var tt = r;

        var f = computeCubicBaseValue(tt, a,b,c,d) - offset;

        var t2 = tt * tt;
        var t6 = 6 * tt;
        var t12 = 2 * t6;
        var t92 = t2 * 9;
        var mt2 = (tt - 1) * (tt - 1);
        var df = 3 * d * t2 + c * (t6 - t92) +
                 b * (t92 - t12 + 3) - 3 * a * mt2;

        r = tt - (f / df);

        if (!df)
          return -1;

        if (depth > 12) {
          if (Math.abs(tt - r) < 0.001)
            break;

          return -1;
        }
      } while (Math.abs(tt - r) > 0.0001);

      if (r < 0 || r > 1)
        continue;

      var y = computeCubicBaseValue(r, a,b,c,d);

      var dy = offset - y;
      if (dy * dy > 1)
        continue;

      return r;
    } while (t--);

    return -1;
  }

  function scaleCurve(x0,y0, cp1x,cp1y, cp2x,cp2y, x,y, distance) {
    var pas = getAngularDir(cp1x - x0, cp1y - y0) + PI_HALF;
    var pdxs = Math.cos(pas);
    var pdys = Math.sin(pas);

    var pae = getAngularDir(x - cp2x, y - cp2y) + PI_HALF;
    var pdxe = Math.cos(pae);
    var pdye = Math.sin(pae);

    if (pdxs == pdxe && pdys == pdye)
      return null;

    var sx, sy;

    if (pdxs == pdxe || pdys == pdye) {
      sx = (x0 + x) / 2;
      sy = (y0 + y) / 2;
    } else {
      var s = getLineIntersect(
        x0, y0, x0 + pdxs, y0 + pdys,
        x + pdxe, y + pdye, x, y
      );
      sx = s[0];
      sy = s[1];
    }

    var a1 = getAngularDir(x0 - sx, y0 - sy);
    var a2 = getAngularDir(cp1x - sx, cp1y - sy);
    var a3 = getAngularDir(cp2x - sx, cp2y - sy);
    var a4 = getAngularDir(x - sx, y - sy);

    if (a1 === a2 || a2 > a3)
      distance = -distance;

    var nax = x0 - distance * Math.cos(a1);
    var nay = y0 - distance * Math.sin(a1);
    var ndx = x - distance * Math.cos(a4);
    var ndy = y - distance * Math.sin(a4);
    var nbx, nby, ncx, ncy;

    var nb = getLineIntersect(
      nax, nay,
      nax + (cp1x - x0), nay + (cp1y - y0),
      sx, sy,
      cp1x, cp1y
    );
    if (nb) {
      nbx = nb[0];
      nby = nb[1];
    } else {
      nbx = nax;
      nby = nay;
    }

    var nc = getLineIntersect(
      ndx, ndy,
      ndx + (cp2x - x), ndy + (cp2y - y),
      sx, sy,
      cp2x, cp2y
    );
    if (nc) {
      ncx = nc[0];
      ncy = nc[1];
    } else {
      ncx = ndx;
      ncy = ndy;
    }

    return [nax,nay, nbx,nby, ncx,ncy, ndx,ndy];
  }
  function getAngularDir(x, y) {
    var d1 = 0;
    var d2 = PI_HALF;
    var d3 = PI;
    var d4 = 3 * PI_HALF;

    var angle = 0;
    var ax = Math.abs(x);
    var ay = Math.abs(y);

    if (!x)
      angle = y >= 0 ? d2 : d4;
    else if (!y)
      angle = x >= 0 ? d1 : d3;
    else if (x > 0 && y > 0)
      angle = d1 + Math.atan(ay / ax);
    else if (x < 0 && y < 0)
      angle = d3 + Math.atan(ay / ax);
    else if (x < 0 && y > 0)
      angle = d2 + Math.atan(ax / ay);
    else if (x > 0 && y < 0)
      angle = d4 + Math.atan(ax / ay);

    return (angle + PI_DOUBLE) % PI_DOUBLE;
  }
  function getLineIntersect(ax1,ay1, ax2,ay2, bx1,by1, bx2,by2) {
    var nx = (ax1 * ay2 - ay1 * ax2) * (bx1 - bx2) -
             (ax1 - ax2) * (bx1 * by2 - by1 * bx2);
    var ny = (ax1 * ay2 - ay1 * ax2) * (by1 - by2) -
             (ay1 - ay2) * (bx1 * by2 - by1 * bx2);
    var dn = (ax1 - ax2) * (by1 - by2) - (ay1 - ay2) * (bx1 - bx2);

    if (!dn)
      return null;

    var px = nx / dn;
    var py = ny / dn;

    return [px, py];
  }

  function buildOutline(sink, data, styles) {
    sink.moveTo(data[1], data[2]);

    for (var i = 0; i < data.length;) {
      var npoint = data[i];

      var x0 = data[i + 1];
      var y0 = data[i + 2];

      var a1x, a1y, a2x, a2y;

      if (npoint === 2) {
        var x = data[i + 3];
        var y = data[i + 4];

        sink.lineTo(x, y);

        a1x = x0;
        a1y = y0;
        a2x = x;
        a2y = y;

        i += 5;
      } else {
        //for (var j = 1; j < npoint; j += 3, i += 6) {
          var cp1x = data[i + 3];
          var cp1y = data[i + 4];

          var cp2x = data[i + 5];
          var cp2y = data[i + 6];
          var x = data[i + 7];
          var y = data[i + 8];

          sink.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);

          a1x = cp2x;
          a1y = cp2y;
          a2x = x;
          a2y = y;
        //}

        i += 9;
      }

      var lineJoin = styles.lineJoin || 'bevel';

      var p = i % data.length;
      var b1x = data[p + 1];
      var b1y = data[p + 2];

      if (~~(a2x + 0.5) === ~~(b1x + 0.5) && ~~(a2y + 0.5) === ~~(b1y + 0.5))
        continue;

      var b2x = data[p + 3];
      var b2y = data[p + 4];

      var a1 = a2y - a1y;
      var b1 = -(a2x - a1x);
      var c1 = a1x * a2y - a2x * a1y;
      var a2 = b2y - b1y;
      var b2 = -(b2x - b1x);
      var c2 = b1x * b2y - b2x * b1y;
      var d = a1 * b2 - b1 * a2;

      if (!d) {
        sink.lineTo(b1x, b1y);
      } else {
        var x = (c1 * b2 - b1 * c2) / d;
        var y = (a1 * c2 - c1 * a2) / d;

        var ona = !((x < a1x && x < a2x) || (x > a1x && x > a2x) ||
                    (y < a1y && y < a2y) || (y > a1y && y > a2y));
        var onb = !((x < b1x && x < b2x) || (x > b1x && x > b2x) ||
                    (y < b1y && y < b2y) || (y > b1y && y > b2y));

        if (!ona && !onb) {
          switch (lineJoin) {
          case 'bevel':
            sink.lineTo(b1x, b1y);
            break;
          case 'round':
            sink.quadraticCurveTo(x, y, b1x, b1y);
            break;
          case 'miter':
          default:
            var a = -a2y - b1y;
            var b = a2x - b1x;
            var d = Math.sqrt(a * a + b * b);
            var miterLen = (a * (x - b1x) + b * (y - b1y)) / d;
            var maxLen = styles.miterLimit * styles.lineWidth / 2;
            if (miterLen > maxLen) {
              var p2 = maxLen / miterLen;
              var p1 = 1 - p2;
              sink.lineTo(
                a2x * p1 + x * p2,
                a2y * p1 + y * p2
              );
              sink.lineTo(
                b1x * p1 + x * p2,
                b1y * p1 + y * p2
              );
            } else {
              sink.lineTo(x, y);
            }

            sink.lineTo(b1x, b1y);
            break;
          }
        } else {
          if (ona)
            sink.lineTo(x, y);

          sink.lineTo(b1x, b1y);
        }
      }
    }

    sink.closePath();
  }
  function addLineCap(data, x,y, styles) {
    var p = data.length;

    var x1 = data[p - 4];
    var y1 = data[p - 3];

    var x2 = data[p - 2];
    var y2 = data[p - 1];

    switch (styles.lineCap) {
    case 'round':
      var cx = (x2 + x) / 2;
      var cy = (y2 + y) / 2;

      var a0 = Math.atan2(y2 - cy, x2 - cx);
      var a1 = Math.atan2(y - cy, x - cx);

      var sweep = Math.abs(a1 - a0);

      var r = styles.lineWidth / 2;

      while (sweep > 0) {
        a1 = a0 + (sweep > PI_HALF ? PI_HALF : sweep);

        var kappa = (4 / 3) * Math.tan((a1 - a0) / 4) * r;

        var cos0 = Math.cos(a0);
        var sin0 = Math.sin(a0);
        var cp1x = cx + cos0 * r + -sin0 * kappa;
        var cp1y = cy + sin0 * r + cos0 * kappa;

        var cos1 = Math.cos(a1);
        var sin1 = Math.sin(a1);

        var x = cx + cos1 * r;
        var y = cy + sin1 * r;

        var cp2x = x + sin1 * kappa;
        var cp2y = y + -cos1 * kappa;

        data[p] = 4;
        data[p + 1] = x2;
        data[p + 2] = y2;
        data[p + 3] = cp1x;
        data[p + 4] = cp1y;
        data[p + 5] = cp2x;
        data[p + 6] = cp2y;
        data[p + 7] = x;
        data[p + 8] = y;
        p += 9;

        x2 = x;
        y2 = y;

        a0 = a1;
        sweep -= PI_HALF;
      }
      break;
    case 'square':
      var distance = styles.lineWidth / 2;
      var dx = x2 - x1;
      var dy = y2 - y1;
      var d = Math.sqrt(dx * dx + dy * dy);

      var x3 = x2 + dx * distance / d;
      var y3 = y2 + dy * distance / d;

      var x4 = x + dx * distance / d;
      var y4 = y + dy * distance / d;

      data[p] = 2;
      data[p + 1] = x2;
      data[p + 2] = y2;
      data[p + 3] = x3;
      data[p + 4] = y3;

      data[p + 5] = 2;
      data[p + 6] = x3;
      data[p + 7] = y3;
      data[p + 8] = x4;
      data[p + 9] = y4;

      x2 = x4;
      y2 = y4;

      p += 10;
    case 'none':
    default:
      data[p] = 2;
      data[p + 1] = x2;
      data[p + 2] = y2;
      data[p + 3] = x;
      data[p + 4] = y;
      break;
    }
  }

  // Assuming if currentTransform is not present in context 2d prototype,
  // the SVGMatrix does not implement constructor either
  var borrowSVGMatrix = !('currentTransform' in native2dCtxProto);
  if (!borrowSVGMatrix) {
    // ... to avoid unnecessary triggering of the exception
    try {
      idTransform = new SVGMatrix;
      transformClass = idTransform.constructor;
    } catch (e) {
      borrowSVGMatrix = true;
    }
  }

  if (borrowSVGMatrix) {
    var svgElement = doc.createElementNS(SVG_NAMESPACE, 'svg');

    transformClass = function SVGMatrix() {
      return svgElement.createSVGMatrix();
    }
    transformClass.prototype = SVGMatrix.prototype;

    idTransform = new transformClass;
  }

  if (shimCurrentTransform) {
    defineLazyProp(kanvas2dCtxProto, '_ct', {
      get: function () {
        return new transformClass;
      }
    });
    defineLazyProp(kanvas2dCtxProto, '_ctm', {
      get: function () {
        return new Float32Array([1, 0, 0, 1, 0, 0]);
      }
    });
    defineLazyProp(kanvas2dCtxProto, '_stack', { get: Array });

    defineProp(kanvas2dCtxProto, 'currentTransform', {
      get: function () {
        return this._ct;
      },
      set: function(val) {
        if (!(val instanceof transformClass))
          throw new TypeError;

        if (this._ct === val)
          return;

        this.setTransform(val.a, val.b, val.c, val.d, val.e, val.f);
      }
    });

    kanvas2dCtxProto.save = function () {
      this._save();

      var ctm = this._ctm;
      this._stack.push([ctm[0], ctm[1], ctm[2], ctm[3], ctm[4], ctm[5]]);
    };
    kanvas2dCtxProto.restore = function () {
      this._restore();

      var stack = this._stack;
      if (stack.length) {
        var m = stack.pop();
        this.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
      }
    };

    kanvas2dCtxProto.scale = function (x, y) {
      var ctm = this._ctm;
      this.setTransform(
        ctm[0] * x, ctm[1] * x,
        ctm[2] * y, ctm[3] * y,
        ctm[4], ctm[5]
      );
    };
    kanvas2dCtxProto.rotate = function (angle) {
      var ctm = this._ctm;
      var u = Math.cos(angle);
      var v = Math.sin(angle);
      this.setTransform(
        ctm[0] * u + ctm[2] * v,
        ctm[1] * u + ctm[3] * v,
        ctm[0] * -v + ctm[2] * u,
        ctm[1] * -v + ctm[3] * u,
        ctm[4], ctm[5]
      );
    };
    kanvas2dCtxProto.translate = function (x, y) {
      var ctm = this._ctm;
      this.setTransform(
        ctm[0], ctm[1],
        ctm[2], ctm[3],
        ctm[0] * x + ctm[2] * y + ctm[4],
        ctm[1] * x + ctm[3] * y + ctm[5]
      );
    };
    kanvas2dCtxProto.transform = function (a, b, c, d, e, f) {
      var ctm = this._ctm;
      this.setTransform(
        ctm[0] * a + ctm[2] * b,
        ctm[1] * a + ctm[3] * b,
        ctm[0] * c + ctm[2] * d,
        ctm[1] * c + ctm[3] * d,
        ctm[0] * e + ctm[2] * f + ctm[4],
        ctm[1] * e + ctm[3] * f + ctm[5]
      );
    };
    kanvas2dCtxProto.setTransform = function (a, b, c, d, e, f) {
      this._setTransform(a, b, c, d, e, f);

      var ct = this._ct;
      var ctm = this._ctm;
      ct.a = ctm[0] = a;
      ct.b = ctm[1] = b;
      ct.c = ctm[2] = c;
      ct.d = ctm[3] = d;
      ct.e = ctm[4] = e;
      ct.f = ctm[5] = f;
    };

    shimResetTransform = true;
  }

  if (shimResetTransform) {
    kanvas2dCtxProto.resetTransform = function () {
      this.setTransform(1, 0, 0, 1, 0, 0);
    };
  }

  if (shimEllipticalArcTo) {
    kanvas2dCtxProto.arcTo = function (x1,y1, x2,y2, rx,ry, rotation) {
      if (rx < 0 || ry < 0)
        throw new RangeError;

      var x0 = x1;
      var y0 = y1;

      var m11 = 1;
      var m12 = 0;
      var m21 = 0;
      var m22 = 1;
      var tx = 0;
      var ty = 0;

      var ops = this._ops;
      var p = ops.length;
      while (p) {
        switch (ops[p - 1]) {
        case PATH_OP_CLOSE:
          p = ops[p - 2];
          if (p) {
            x0 = ops[p];
            y0 = ops[p + 1];
          }
          break;
        case PATH_OP_RECT:
          x0 = ops[p - 5];
          y0 = ops[p - 4];
          break;
        case PATH_OP_ARC:
          var r = ops[p - 5];
          var a = ops[p - 3];
          x0 = ops[p - 7] + Math.cos(a) * r;
          y0 = ops[p - 6] + Math.sin(a) * r;
          break;
        case PATH_OP_ELLIPSE:
          var sx = ops[p - 7];
          var sy = ops[p - 6];
          var rot = ops[p - 5];
          var a = ops[p - 3];
          var u = Math.cos(rot)
          var v = Math.sin(rot);
          var x = Math.cos(a);
          var y = Math.sin(a);
          x0 = x * u * sx + y * v * sy + ops[p - 9];
          y0 = x * -v * sx + y * u * sy + ops[p - 8];
          break;
        case PATH_OP_TRANSFORM:
          var a = ops[p - 7];
          var b = ops[p - 6];
          var c = ops[p - 5];
          var d = ops[p - 4];
          var e = ops[p - 3];
          var f = ops[p - 2];
          p -= 8;
          continue;
        default:
          x0 = ops[p - 3];
          y0 = ops[p - 2];
        }
        break;
      }

      if (x1 === x0 && y1 === y0) {
        this.moveTo(x1, y1);
        return;
      }

      var dir = (x2 - x1) * (y0 - y1) + (y2 - y1) * (x1 - x0);

      if (x1 === x0 && y1 === y0 ||
          x1 === x2 && y1 === y2 ||
          !rx || !ry ||
          !dir) {
        this.lineTo(x1, y1);
        return;
      }

      if (rx !== ry) {
        var scale = ry / rx;
        m22 = Math.cos(-rotation);
        m12 = Math.sin(-rotation);
        m11 = m22 / scale;
        m21 = -m12 / scale;

        var ox1 = x0;
        x0 = (ox1 * m22 - y0 * m12) * scale;
        y0 = ox1 * m12 + y0 * m22;

        var ox2 = x1;
        x1 = (ox2 * m22 - y1 * m12) * scale;
        y1 = ox2 * m12 + y1 * m22;

        var ox3 = x2;
        x2 = (ox3 * m22 - y2 * m12) * scale;
        y2 = ox3 * m12 + y2 * m22;
      }

      var pa = (x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1);
      var pb = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
      var pc = (x0 - x2) * (x0 - x2) + (y0 - y2) * (y0 - y2);

      var cosx = (pa + pb - pc) / (2 * Math.sqrt(pa * pb));
      var sinx = Math.sqrt(1 - cosx * cosx);
      var d = ry / ((1 - cosx) / sinx);

      var sqa = Math.sqrt(pa);
      var anx = (x1 - x0) / sqa;
      var any = (y1 - y0) / sqa;

      var sqb = Math.sqrt(pb);
      var bnx = (x1 - x2) / sqb;
      var bny = (y1 - y2) / sqb;

      var x3 = x1 - anx * d;
      var y3 = y1 - any * d;

      var x4 = x1 - bnx * d;
      var y4 = y1 - bny * d;

      var ccw = dir < 0;

      var cx = x3 + any * ry * (ccw ? 1 : -1);
      var cy = y3 - anx * ry * (ccw ? 1 : -1);

      var a0 = Math.atan2(y3 - cy, x3 - cx);
      var a1 = Math.atan2(y4 - cy, x4 - cx);

      this.save();
      this.transform(m11, m12, m21, m22, 0, 0);
      this.lineTo(x3, y3);
      this.arc(cx,cy, ry, a0,a1, ccw);
      this.restore();
    };
  }

  if (shimEllipse) {
    kanvas2dCtxProto.ellipse = function (cx,cy, rx,ry, rotation, a0,a1, ccw) {
      if (rx < 0 || ry < 0)
        throw new RangeError;

      if (rx === ry) {
        this.arc(cx,cy, rx, a0,a1, ccw);
        return;
      }

      var u = Math.cos(rotation);
      var v = Math.sin(rotation);
      this.save();
      this.transform(u * rx, v * rx, -v * ry, u * ry, cx, cy);
      this.arc(0,0, 1, a0,a1, ccw);
      this.restore();
    };
  }

  if (shimPath) {
    pathClass = function Path(d) {
      if (!(this instanceof Path))
        return new Path(d);

      var obj = this;

      if (nativePathClass) {
        obj = new nativePathClass;
        mixinProps(obj, kanvasPathProto);
      }

      if (arguments.length) {
        if (d instanceof Path)
          obj.addPath(d);
        else {
          Timer.start("parseSvgDataStr");
          parseSvgDataStr(obj, d);
          Timer.stop();
        }
      }

      return obj;
    };
    pathClass.prototype = nativePathProto || kanvasPathProto;

    defineLazyProp(kanvasPathProto, '_state', {
      get: function () {
        return new Float32Array([0xffff, 0xffff, -0xffff, -0xffff, 0, 0]);
      }
    });
    defineLazyProp(kanvasPathProto, '_segs', { get: Array });

    kanvasPathProto._lineSeg = function (x0,y0, x,y, close) {
      var state = this._state;

      if (x0 < state[0])
        state[0] = x0;
      if (y0 < state[1])
        state[1] = y0;
      if (x0 > state[2])
        state[2] = x0;
      if (y0 > state[3])
        state[3] = y0;

      if (x < state[0])
        state[0] = x;
      if (y < state[1])
        state[1] = y;
      if (x > state[2])
        state[2] = x;
      if (y > state[3])
        state[3] = y;

      var segs = this._segs;
      var p = segs.length;
      segs[p] = 2;
      segs[p + 1] = x0;
      segs[p + 2] = y0;
      segs[p + 3] = x;
      segs[p + 4] = y;

      if (close)
        segs[p + 5] = 0;

      state[4] = x;
      state[5] = y;
    };
    kanvasPathProto._curveSeg = function (x0,y0, cp1x,cp1y, cp2x,cp2y, x,y) {
      var state = this._state;
      var segs = this._segs;
      var p = segs.length;

      if (x0 < state[0])
        state[0] = x0;
      if (y0 < state[1])
        state[1] = y0;
      if (x0 > state[2])
        state[2] = x0;
      if (y0 > state[3])
        state[3] = y0;

      var roots = getDerivativeRoots(x0,y0, cp1x,cp1y, cp2x,cp2y, x,y);

      for (var i = 0; i <= roots.length; i++) {
        var t = roots[i] || 1;

        if (t > 0 && t <= 1) {
          segs[p] = 4;
          segs[p + 1] = x0;
          segs[p + 2] = y0;

          var mt = 1 - t;

          var mx1 = mt * x0 + t * cp1x;
          var my1 = mt * y0 + t * cp1y;

          var mx2 = mt * cp1x + t * cp2x;
          var my2 = mt * cp1y + t * cp2y;

          cp2x = mt * cp2x + t * x
          cp2y = mt * cp2y + t * y;

          var pcx = mt * mx1 + t * mx2;
          var pcy = mt * my1 + t * my2;

          cp1x = mt * mx2 + t * cp2x;
          cp1y = mt * my2 + t * cp2y;

          x0 = mt * pcx + t * cp1x;
          y0 = mt * pcy + t * cp1y;

          if (x0 < state[0])
            state[0] = x0;
          if (y0 < state[1])
            state[1] = y0;
          if (x0 > state[2])
            state[2] = x0;
          if (y0 > state[3])
            state[3] = y0;

          segs[p + 3] = mx1;
          segs[p + 4] = my1;
          segs[p + 5] = pcx;
          segs[p + 6] = pcy;
          segs[p + 7] = x0;
          segs[p + 8] = y0;

          p += 9;
        }
      }

      state[4] = x;
      state[5] = y;
    };

    kanvasPathProto.closePath = function () {
      if (this._sp) {
        this._lineSeg(
          this._state[4], this._state[5],
          this._ops[this._sp], this._ops[this._sp + 1],
          true
        );
      }
    };
    kanvasPathProto.moveTo = function (x, y) {
      this._state[4] = x;
      this._state[5] = y;
    };
    kanvasPathProto.lineTo = function (x, y) {
      if (this._sp) {
        this._lineSeg(this._state[4],this._state[5], x,y);
      } else {
        this._state[4] = x;
        this._state[5] = y;
      }
    };
    kanvasPathProto.quadraticCurveTo = function (cpx,cpy, x,y) {
      var x0, y0;
      if (this._sp) {
        x0 = this._state[4];
        y0 = this._state[5];
      } else {
        x0 = cpx;
        y0 = cpy;
      }

      var cp1x = x0 + 2 / 3 * (cpx - x0);
      var cp1y = y0 + 2 / 3 * (cpy - y0);

      var cp2x = cp1x + (x - x0) / 3;
      var cp2y = cp1y + (y - y0) / 3;

      this._curveSeg(x0,y0, cp1x,cp1y, cp2x,cp2y, x,y);
    };
    kanvasPathProto.bezierCurveTo = function (cp1x,cp1y, cp2x,cp2y, x,y) {
      var x0, y0;
      if (this._sp) {
        x0 = this._state[4];
        y0 = this._state[5];
      } else {
        x0 = cp1x;
        y0 = cp1y;
      }

      this._curveSeg(x0,y0, cp1x,cp1y, cp2x,cp2y, x,y);
    };
    kanvasPathProto.arcTo = function (x1,y1, x2,y2, rx,ry, rotation) {
      if (arguments.length < 7) {
        ry = rx;
        rotation = 0;
      }

      if (rx < 0 || ry < 0)
        throw new RangeError;

      var x0, y0;
      if (this._sp) {
        x0 = this._state[4];
        y0 = this._state[5];
      } else {
        x0 = x1;
        y0 = y1;
      }

      if (x1 === x0 && y1 === y0)
        return;

      var dir = (x2 - x1) * (y0 - y1) + (y2 - y1) * (x1 - x0);

      if (x1 === x0 && y1 === y0 || x1 === x2 && y1 === y2 || !rx || !ry || !dir) {
        this.lineTo(x1, y1);
        return;
      }

      if (rx !== ry) {
        var scale = ry / rx;
        var u = Math.cos(-rotation);
        var v = Math.sin(-rotation);

        var ox1 = x0;
        x0 = (ox1 * u - y0 * v) * scale;
        y0 = ox1 * v + y0 * u;

        var ox2 = x1;
        x1 = (ox2 * u - y1 * v) * scale;
        y1 = ox2 * v + y1 * u;

        var ox3 = x2;
        x2 = (ox3 * u - y2 * v) * scale;
        y2 = ox3 * v + y2 * u;
      } else {
        var scale = 1;
        var u = 1;
        var v = 0;
      }

      var pa = (x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1);
      var pb = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
      var pc = (x0 - x2) * (x0 - x2) + (y0 - y2) * (y0 - y2);

      var cosx = (pa + pb - pc) / (2 * Math.sqrt(pa * pb));
      var sinx = Math.sqrt(1 - cosx * cosx);
      var d = ry / ((1 - cosx) / sinx);

      var anx = (x1 - x0) / Math.sqrt(pa);
      var any = (y1 - y0) / Math.sqrt(pa);
      var bnx = (x1 - x2) / Math.sqrt(pb);
      var bny = (y1 - y2) / Math.sqrt(pb);

      var x3 = x1 - anx * d;
      var y3 = y1 - any * d;

      var x4 = x1 - bnx * d;
      var y4 = y1 - bny * d;

      var ccw = dir < 0;

      var cx = x3 + any * ry * (ccw ? 1 : -1);
      var cy = y3 - anx * ry * (ccw ? 1 : -1);

      var a0 = Math.atan2(y3 - cy, x3 - cx);
      var a1 = Math.atan2(y4 - cy, x4 - cx);

      var m11 = u / scale;
      var m21 = -v / scale;

      this._lineSeg(
        x0 * m11 + y0 * v,
        x0 * m21 + y0 * u,
        x3 * m11 + y3 * v,
        x3 * m21 + y3 * u
      );

      arcToCurveSegs(this, cx,cy, ry, a0,a1, ccw, m11,v, m21,u, 0,0);
    };
    kanvasPathProto.rect = function (x,y, w,h) {
      var tr = x + w;
      var br = y + h;
      this._lineSeg(x,y, tr,y);
      this._lineSeg(tr,y, tr,br);
      this._lineSeg(tr,br, x,br);
      this._lineSeg(x,br, x,y, true);
    };
    kanvasPathProto.arc = function (cx,cy, r, a0,a1, ccw) {
      arcToCurveSegs(this, cx,cy, r, a0,a1, ccw, 1,0, 0,1, 0,0);

      if (a1 - a0 === PI_DOUBLE)
        this._segs.push(0);
    };
    kanvasPathProto.ellipse = function (x,y, rx,ry, rotation, a0,a1, ccw) {
      var u = Math.cos(rotation)
      var v = Math.sin(rotation);
      var m11 = u * rx;
      var m12 = v * ry;
      var m21 = -v * rx;
      var m22 = u * ry;
      arcToCurveSegs(this, 0,0, 1, a0,a1, ccw, m11,m12, m21,m22, x,y);
    };

    kanvasPathProto.isPointInPath = function (x,y, winding) {
      var state = this._state;

      if (x < state[0] || y < state[1] || x > state[2] || y > state[3])
        return false;

      var wn = 0;

      var segs = this._segs;
      for (var i = 0; i < segs.length; i++) {
        var npoint = segs[i];

        if (!npoint)
          continue;

        var x0 = segs[i + 1];
        var y0 = segs[i + 2];

        if (npoint === 2) {
          var x1 = segs[i + 3];
          var y1 = segs[i + 4];

          if (y0 <= y) {
            if (y1 > y) {
              if ((x1 - x0) * (y - y0) - (x - x0) * (y1 - y0) > 0)
                ++wn;
            }
          } else {
            if (y1 <= y) {
              if ((x1 - x0) * (y - y0) - (x - x0) * (y1 - y0) < 0)
                --wn;
            }
          }

          i += 4;
        } else {
          //for (var j = 1; j < npoint; j += 3, i += 6) {
            var cp1x = segs[i + 3];
            var cp1y = segs[i + 4];

            var cp2x = segs[i + 5];
            var cp2y = segs[i + 6];

            var x1 = segs[i + 7];
            var y1 = segs[i + 8];

            if (y0 <= y) {
              if (y1 > y) {
                //if ((x1 - x0) * (y - y0) - (x - x0) * (y1 - y0) > 0) {
                //  ++wn;
                //} else if ((cp2x - cp1x) * (y - cp1y) - (x - cp1x) * (cp2y - cp1y) > 0) {
                  var t = findCubicRoot(y0, cp1y, cp2y, y1, y);
                  if (t > -1 && computeCubicBaseValue(t, x0,cp1x,cp1x,x1) > x)
                    ++wn;
                //}
              }
            } else {
              if (y1 <= y) {
                //if ((x1 - x0) * (y - y0) - (x - x0) * (y1 - y0) < 0) {
                //  --wn;
                //} else if ((cp2x - cp1x) * (y - cp1y) - (x - cp1x) * (cp2y - cp1y) < 0) {
                  var t = findCubicRoot(y0, cp1y, cp2y, y1, y);
                  if (t > -1 && computeCubicBaseValue(t, x0,cp1x,cp1x,x1) > x)
                    --wn;
                //}
              }
            }

            x0 = x1;
            y0 = y1;
          //}

          i += 8;
        }
      }

      return !!wn;
    };

    if (shimBounds) {
      kanvasPathProto.getBounds = function () {
        var state = this._state;
        return {
          x: state[0],
          y: state[1],
          width: state[2] - state[0],
          height: state[3] - state[1]
        };
      };
    }

    if (shimStrokePath) {
      kanvasPathProto.strokePath = function (styles, transformation) {
        if (!styles || !styles.lineWidth)
          return;

        if (arguments.length > 2) {
          if (!(transform instanceof transformClass))
            throw new TypeError;
        }

        var path = new pathClass;

        var distance = styles.lineWidth / 2;

        var segs = this._segs;

        var outer = [];
        var inner = [];
        var p = 0;

        var x, y;

        for (var i = 0; i < segs.length;) {
          var npoint = segs[i];

          if (!npoint) {
            if (outer.length) {
              buildOutline(path, outer, styles);

              inner.reverse();

              buildOutline(path, inner, styles);

              outer = [];
              inner = [];
              p = 0;
            }

            i++;
            continue;
          }

          var x0 = segs[i + 1];
          var y0 = segs[i + 2];

          if (x !== x0 || y !== y0) {
            if (outer.length) {
              inner.reverse();

              addLineCap(inner, outer[1], outer[2], styles);
              addLineCap(outer, inner[1], inner[2], styles);

              [].push.apply(outer, inner);

              buildOutline(path, outer, styles);

              outer = [];
              inner = [];
              p = 0;
            }
          }

          if (npoint === 2) {
            x = segs[i + 3];
            y = segs[i + 4];

            var dx = x - x0;
            var dy = y - y0;

            if (dx || dy) {
              var k = distance / Math.sqrt(dx * dx + dy * dy);
              dx *= k;
              dy *= k;

              outer[p] = 2;
              outer[p + 1] = x0 + dy;
              outer[p + 2] = y0 - dx;
              outer[p + 3] = x + dy;
              outer[p + 4] = y - dx;

              inner[p] = y0 + dx;
              inner[p + 1] = x0 - dy;
              inner[p + 2] = y + dx;
              inner[p + 3] = x - dy;
              inner[p + 4] = 2;
            }

            p += 5;
            i += 5;
          } else {
            //for (var j = 1; j < npoint; j += 3, i += 6, p += 9) {
              var cp1x = segs[i + 3];
              var cp1y = segs[i + 4];

              var cp2x = segs[i + 5];
              var cp2y = segs[i + 6];

              x = segs[i + 7];
              y = segs[i + 8];

              var sc1 = scaleCurve(x0,y0, cp1x,cp1y, cp2x,cp2y, x,y, distance);
              var sc2 = scaleCurve(x0,y0, cp1x,cp1y, cp2x,cp2y, x,y, -distance);

              if (sc1 && sc2) {
                outer[p] = 4;
                outer[p + 1] = sc1[0];
                outer[p + 2] = sc1[1];

                outer[p + 3] = sc1[2];
                outer[p + 4] = sc1[3];
                outer[p + 5] = sc1[4];
                outer[p + 6] = sc1[5];
                outer[p + 7] = sc1[6];
                outer[p + 8] = sc1[7];

                inner[p] = sc2[1];
                inner[p + 1] = sc2[0];
                inner[p + 2] = sc2[3];
                inner[p + 3] = sc2[2];
                inner[p + 4] = sc2[5];
                inner[p + 5] = sc2[4];
                inner[p + 6] = sc2[7];
                inner[p + 7] = sc2[6];
                inner[p + 8] = 4;

                //x0 = x;
                //y0 = y;
              }
            //}

            p += 9;
            i += 9;
          }
        }

        if (outer.length) {
          inner.reverse();

          addLineCap(inner, outer[1], outer[2], styles);
          addLineCap(outer, inner[1], inner[2], styles);

          [].push.apply(outer, inner);

          buildOutline(path, outer, styles);
        }

        return path;
      };
    }

    defineProp(kanvas2dCtxProto, 'currentPath', {
      get: function () {
        var path = new pathClass;
        path._copyFrom(this);
        return path;
      },
      set: function (val) {
        if (!(val instanceof pathClass))
          throw new TypeError;

        this.beginPath();
        this._copyFrom(val);
      }
    });

    kanvas2dCtxProto.beginPath = function () {
      this._beginPath();

      this._ops = this._ops.slice(this._tp - 1, this._tp + 1);
      this._sp = this._tp = 0;
    };
    kanvas2dCtxProto.addPath = function (path) {
      if(!(path instanceof pathClass))
        throw new TypeError;

      this.closePath();
      this._addFrom(path);
    };
  }

  if (shimEllipticalArcTo || shimPath) {
    var recorderProto = Object.create(null);

    defineLazyProp(recorderProto, '_ops', { get: Array, writable: true });

    defineProp(recorderProto, '_sp', { value: 0, writable: true });

    var pathMethods = [
      [PATH_OP_CLOSE, 'closePath', '', true],
      [PATH_OP_MOVE, 'moveTo', 'x,y', true],
      [PATH_OP_LINE, 'lineTo', 'x,y'],
      [PATH_OP_CURVE, 'quadraticCurveTo', 'cpx,cpy,x,y'],
      [PATH_OP_BEZIER, 'bezierCurveTo', 'cp1x,cp1y,cp2x,cp2y,x,y'],
      [PATH_OP_ARCTO, 'arcTo', 'x1,y1,x2,y2,rx,ry,rotation'],
      [PATH_OP_RECT, 'rect', 'x,y,w,h'],
      [PATH_OP_ARC, 'arc', 'cx,cy,r,a0,a1,ccw'],
      [PATH_OP_ELLIPSE, 'ellipse', 'cx,cy,rx,ry,rotation,a0,a1,ccw']
    ];

    var opArgPartial = 'o[p+$($2+1;)]';

    pathMethods.forEach(function (tuple) {
      var code = tuple[0];
      var name = tuple[1];
      var params = tuple[2];
      var move = tuple[3];

      var tmpl = tmplf(
        'function($2){' +
          'this._$1($2);' +

          '$$1;' +

          'var o=this._ops,' +
              'p=o.length;' +

          'o[p]=$3,' +
          '$(_($4,$6+"=+$1");),' +
          'o[p+$(_($4).length+1;)]=$3;' +

          '$($2&&!$5?"if(!this._sp)":"";)' +
            'this._sp=p+1' +
        '}',

        name, params,
        code,
        params || 'this._sp',
        move,

        opArgPartial
      );

      var fn = evalf(tmpl, '');

      kanvas2dCtxProto[name] = fn;

      if (nativePathClass && /{([\s\S]*)}/.test(kanvasPathProto[name]))
        kanvasPathProto[name] = evalf(tmpl, RegExp.$1);
      else
        safeReplaceProp(kanvasPathProto, name, { value: fn });
    });

    defineProp(recorderProto, '_tp', { value: 0, writable: true });

    var transformProps = 'a,b,c,d,e,f';

    var transformTmpl = tmplf(
      'function($$2){'+
        'this._$$1($$2);'+

        'var t=this.currentTransform,' +
            'o=this._ops,' +
            'p=o.length' +
            '$3;' +

        'if(o[p-1]===$1)' +
          '$(_($2,$4+$6););' +
        'else ' +
          'o[p]=$1,' +
          '$(_($2,$5+$6);),' +
          'o[p+7]=$1,' +

          'this._tp=p+1' +
      '}',

      PATH_OP_TRANSFORM,
      transformProps,

      shimCurrentTransform ? ',m=this._ctm' : '',
      'o[p-$(7-$2;)]',
      opArgPartial,
      '=$1=t.$1' + (shimCurrentTransform ? '=m[$2]=$1' : '')
    );

    if (!shimCurrentTransform) {
      [
        ['scale', 'x,y'],
        ['rotate', 'angle'],
        ['translate', 'x,y'],
        ['transform', transformProps],
        ['resetTransform', '']
      ].forEach(function (tuple) {
        var name = tuple[0];
        var params = tuple[1];
        if (!(name in kanvas2dCtxProto))
          kanvas2dCtxProto[name] = evalf(transformTmpl, name, params);
      });
    }

    kanvas2dCtxProto.setTransform =
      evalf(transformTmpl, 'setTransform', transformProps);

    var concatPathTmpl = tmplf(
      'function(path){' +
        'this.beginPath();' +

        'var o=path._ops,' +
            'p=0;' +

        'while(p<o.length)' +
          'switch(o[p]){' +
          '$(_($1,"'+
            'case $($1[0];):'+
              'this._$($1[1];)(' +
                '$(_($1[2],\'"+$3+"\');)' +
              ');' +
              'p+=$(_($1[2]).length+2;);' +
              'break;' +
          '","");)' +
          'default:' +
            'this._$$1($(_($2,$3);));' +
            'p+=8' +
          '}' +
      '}',

      pathMethods,
      transformProps,

      opArgPartial
    );

    defineProp(recorderProto, '_copyFrom', {
      value: evalf(concatPathTmpl, 'setTransform')
    });
    defineProp(recorderProto, '_addFrom', {
      value: evalf(concatPathTmpl, 'transform')
    });

    mixinProps(kanvas2dCtxProto, recorderProto);
    mixinProps(kanvasPathProto, recorderProto);
  }

  if (shimHitRegions) {
    defineLazyProp(kanvas2dCtxProto, '_map', {
      get: function () {
        var c = this.canvas;
        var hrlist = this._hrlist;

        c.addEventListener('mousemove', function (e) {
          var x = e.clientX - c.offsetLeft;
          var y = e.clientY - c.offsetTop;

          var px = map.getImageData(x, y, 1, 1).data;
          var p = (px[0] << 16 | px[1] << 8 | px[2]) / 255;

          var region = hrlist[p - 1];

          if (region) {
            e.region = region.id;

            //if (e.cursor)

            if (region.control) {
              var evt = doc.createEvent('MouseEvents');
              evt.initMouseEvent(
                'mousemove',
                e.bubbles,
                e.cancelable,
                e.view,
                e.detail,
                e.screenX, e.screenY,
                e.clientX, e.clientY,
                e.ctrlKey,
                e.altKey,
                e.shiftKey,
                e.metaKey,
                e.button,
                c
              );
              region.control.dispatchEvent(evt);
            }
          } else {
            e.region = '';
          }
        }, true);

        var c2 = this.canvas.cloneNode();
        var map = c2.getContext('kanvas-2d');

        return map;
      }
    });
    defineLazyProp(kanvas2dCtxProto, '_hrlist', { get: Array });

    kanvas2dCtxProto.addHitRegion = function (options) {
      if (typeof options !== 'object')
        return;

      var path = options.path || this.currentPath;

      var color = (this._hrlist.length + 1) * 255;

      var map = this._map;
      var ct = this.currentTransform;
      map.beginPath();
      map.setTransform(ct.a, ct.b, ct.c, ct.d, ct.e, ct.f);
      map.addPath(path);
      map.fillStyle = '#' + ('000000' + color.toString(16)).substr(-6);
      map.fill();

      this._hrlist.push({
        color: color,
        bounding: path.getBounds(),
        id: options.id || '',
        parent: options.parent || null,
        cursor: options.cursor || 'inherit',
        control: options.control || null
      });
    };
    kanvas2dCtxProto.removeHitRegion = function (options) {
      if (options.id)
        delete this._hrlist[options.id];
    };

    kanvas2dCtxProto.clearRect = function (x,y, w,h) {
      this._clearRect(x,y, w,h);
      this._map._clearRect(x,y, w,h);
    };
  }

  defineProp(nativeCanvasProto, '_pctx', { value: null });

  nativeCanvasProto._getContext = nativeCanvasProto.getContext;
  nativeCanvasProto.getContext = function (ctxId) {
    var pctx = this._pctx;
    var ctx;

    if (ctxId === 'kanvas-2d') {
      ctx = this._getContext('2d');

      if (pctx)
        return pctx === ctx ? ctx : null;

      mixinProps(ctx, kanvas2dCtxProto);
    } else {
      ctx = this._getContext.apply(this, arguments);
    }

    if (!pctx && ctx !== null)
      defineProp(ctx, '_pctx', { value: ctx });

    return ctx;
  };

  Kanvas.SVGMatrix = transformClass;
  Kanvas.Path = pathClass;

  return Kanvas;

}(document));
