
// Kanvas v0.0.1 (c) 2012 Tobias Schneider
// Released under MIT license.

// Kanvas adds support for not (yet) implemented HTML Canvas 2D APIs.

;var Kanvas = Kanvas || (function (doc, undefined) {

  'use strict';

  var Kanvas = { version: '0.0.1', init: init };

  var ctxCls = CanvasRenderingContext2D;
  var ctxProto = ctxCls.prototype;
  var matrixCls;
  var pathCls;

  var addHitRegion = ctxProto.addHitRegion;
  var arc = ctxProto.arc;
  var arcTo = ctxProto.arcTo;
  var beginPath = ctxProto.beginPath;
  var bezierCurveTo = ctxProto.bezierCurveTo;
  var closePath = ctxProto.closePath;
  var ellipse = ctxProto.ellipse;
  var isPointInPath = ctxProto.isPointInPath;
  var lineTo = ctxProto.lineTo;
  var moveTo = ctxProto.moveTo;
  var quadraticCurveTo = ctxProto.quadraticCurveTo;
  var rect = ctxProto.rect;
  var resetClip = ctxProto.resetClip;
  var resetTransform = ctxProto.resetTransform;
  var setLineDash = ctxProto.setLineDash;
  var setTransform = ctxProto.setTransform;
  var transform = ctxProto.transform;

  var shimCurrentTransform = !('currentTransform' in ctxProto);
  var shimDashedLines = !setLineDash;
  var shimEllipse = !ellipse;
  var shimHitRegions = !addHitRegion;
  var shimPath = typeof Path === 'undefined';
  var shimResetClip = !resetClip;
  var shimResetTransform = !resetTransform;

  var shimProto = { };

  var regFunction = /^function\s*(.*)\s*\((.*?)\)\s*{([\s\S]*)}$/;

  var acos = Math.acos;
  var atan2 = Math.atan2;
  var cos = Math.cos;
  var defineProperties = Object.defineProperties;
  var defineProperty = Object.defineProperty;
  var getOwnPropertyNames = Object.getOwnPropertyNames;
  var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  var fromCharCode = String.fromCharCode;
  var PI = Math.PI;
  var push = [].push;
  var sin = Math.sin;
  var sqrt = Math.sqrt;
  var svgns = 'http://www.w3.org/2000/svg';
  var svg = doc.createElementNS(svgns, 'svg');
  var tan = Math.tan;

  function createCtx() {
    var canvas = doc.createElement('canvas');
    canvas.width = canvas.height = 1;
    return canvas.getContext('2d');
  }

  function defineLazyProperty(obj, prop, desc) {
    defineProperty(obj, prop, {
      get: function () {
        var val;
        if (desc.get) {
          val = desc.get.call(this);
          defineProperty(this, prop, {
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

  function init(ctx) {
  	if (ctx === undefined)
      ctx = ctxProto;
    else if (!(ctx instanceof ctxCls))
      throw TypeError();

    var props = getOwnPropertyNames(shimProto);
    for (var i = 0, n = props.length; i < n; i++) {
      var prop = props[i];

      if (prop in ctxProto)
        defineProperty(ctx, '_' + prop, { value: ctxProto[prop] });

      var desc = getOwnPropertyDescriptor(shimProto, prop);
      defineProperty(ctx, prop, desc);
    }
  }

  try {
    new (matrixCls = SVGMatrix);
  } catch (e) {
    matrixCls = function SVGMatrix() {
      return svg.createSVGMatrix();
    };
    matrixCls.prototype = SVGMatrix.prototype;
  }

  if (shimCurrentTransform) {
    defineLazyProperty(shimProto, '_currentTransform', {
      get: function () {
        return new matrixCls();
      },
      writable: true
    });
    defineLazyProperty(shimProto, '_transformStack', {
      get: function () {
        return [];
      }
    });
    defineProperty(shimProto, 'currentTransform', {
      get: function () {
        return this._currentTransform;
      },
      set: function (m) {
        if (!(m instanceof matrixCls))
          throw new TypeError;

        this._transform(m.a, m.b, m.c, m.d, m.e, m.f);
        this._currentTransform = m;
      },
      configurable: true,
      enumerable: true
    });
  }

  if (shimCurrentTransform || shimHitRegions || shimPath || shimResetClip) {
    shimProto.restore = function () {
      var stack = this._transformStack;
      if (stack.length)
        this.setTransform.apply(this, stack.pop());
    };
    shimProto.save = function () {
      var m = this._currentTransform;
      this._transformStack.push([m.a, m.b, m.c, m.d, m.e, m.f]);
    };

  	[

      ['rotate', function (angle) {
        var u = cos(angle);
        var v = sin(angle);
        m.a = a * u - b * v;
        m.b = a * v + b * u;
        m.c = c * u - d * v;
        m.d = c * v + d * u;
        m.e = e * u - f * v;
        m.f = e * v + f * u;
      }],

      ['scale', function (x, y) {
        m.a *= x;
        m.b *= y;
        m.c *= x;
        m.d *= y;
        m.e *= x;
        m.f *= y;
      }],

      ['setTransform', function (a, b, c, d, e, f) {
        m.a = a;
        m.b = b;
        m.c = c;
        m.d = d;
        m.e = e;
        m.f = f;
      }],

      ['translate', function (x, y) {
        m.e += x * m.a + y * m.b;
        m.f += x * m.c + y * m.d;
      }],

      ['transform', function (g, h, i, j, k, l) {
        m.a = a * g + b * i;
        m.b = a * h + b * j;
        m.c = c * g + d * i;
        m.d = c * h + d * j;
        m.e += k * a + l * b;
        m.f += k * c + l * d;
      }]

    ].forEach(function (item) {
      var name = item[0];
      var r = regFunction.exec(item[1]);
      var params = r[2];
      var body = r[3];
      shimProto[name] = eval('(function(' + params + '){' +
        'this._' + name + '(' + params + ');' +
        'var m=this.currentTransform,' +
            'a=m.a,' +
            'b=m.b,' +
            'c=m.c,' +
            'd=m.d,' +
            'e=m.e,' +
            'f=m.f;' +
        (shimCurrentTransform ? body : '') +
        (shimHitRegions || shimPath || shimResetClip ?
          'this._log.push([setTransform,[a,b,c,d,e,f]])' :
          ''
        ) +
      '})');
    });

    shimResetTransform = true;
  }

  if (shimDashedLines) {
    setLineDash = function (segments) {
      throw Error('Dashed lines not supported');
    };
    shimProto.setLineDash = setLineDash;
  }

  if (shimEllipse) {
    var errorCtx = createCtx();
    var IndexSizeError = function () {
      try {
        arc.call(errorCtx, 0, 0, -1, 0, 0);
      } catch (e) {
        return e;
      }
      return RangeError();
    };

    ellipse = function (x, y, rx, ry, rotation, startAngle, endAngle, anticlockwise) {
      if (rx < 0 || ry < 0)
        throw IndexSizeError();

      var u = cos(rotation);
      var v = sin(rotation);
      this.save();
      this.transform(u * rx, v * rx, -v * ry, u * ry, x, y);
      this.arc(0, 0, 1, startAngle, endAngle, anticlockwise);
      this.restore();
    };
    shimProto.ellipse = ellipse;

    arcTo = function (x1, y1, x2, y2, rx, ry, rotation) {
      if (ry !== undefined)
        throw Error('Elliptical arcTo not supported');
      this._arcTo(x1, y1, x2, y2, rx);
    };
    shimProto.arcTo = arcTo;
  }

  if (shimHitRegions) {
    addHitRegion = function (options) {
      var hitRegions = this._hitRegions;
      if (!hitRegions) {
        hitRegions = [];
        this._hitRegions = hitRegions;
      }

      if (!this._wrap) {
        var canvas = this.canvas;
        var wrap = doc.createElement('div');
        canvas.parentNode.replaceChild(wrap, canvas);
        wrap.appendChild(canvas);

        defineProperties(canvas, {
          _width: { value: canvas.width },
          _height: { value: canvas.height },
          width: {
            get: function () {
              return this._width;
            },
            set: function (val) {
              this._width = val;
              this.setAttribute('width', val);
              hitRegions.length = 0;
            },
            configurable: true,
            enumerable: true
          },
          height: {
            get: function () {
              return this._height;
            },
            set: function (val) {
              this._height = val;
              this.setAttribute('height', val);
              hitRegions.length = 0;
            },
            configurable: true,
            enumerable: true
          },
        });

        var offsetX = 0;
        var offsetY = 0;
        var el = wrap;
        if (el.offsetParent) {
          do {
            offsetX += el.offsetLeft;
            offsetY += el.offsetTop;
          } while (el = el.offsetParent);
        }
        var handleEvent = function (e) {
          var px = e.clientX - offsetX;
          var py = e.clientY - offsetY;
          var i = hitRegions.length;
          while (i--) {
            var region = hitRegions[i];
            if (px > region.x && px < region.h &&
                py > region.y && py < region.h &&
                region.path._hitTest(px, py)) {
              e.region = region.id;
              return;
            }
          }
          e.region = null;
        };
        parent.addEventListener('click', handleEvent, true);
        parent.addEventListener('dblclick', handleEvent, true);
        parent.addEventListener('mousedown', handleEvent, true);
        parent.addEventListener('mousemove', handleEvent, true);
        parent.addEventListener('mouseover', handleEvent, true);
        parent.addEventListener('mouseout', handleEvent, true);
        parent.addEventListener('mouseup', handleEvent, true);

        this._wrap = wrap;
      }

      var path = options.path || this;
      var log = path._log;
      var sx = 0;
      var sy = 0;
      var x0 = 0;
      var y0 = 0;
      var m = this.currentTransform;
      var a = m.a;
      var b = m.b;
      var c = m.c;
      var d = m.d;
      var e = m.e;
      var f = m.f;
      //console.log(a, b, c, d, e, f);
      //console.log(this.mozCurrentTransform);
      var xMin = Number.MAX_VALUE;
      var xMax = 0;
      var yMin = Number.MAX_VALUE;
      var yMax = 0;
      for (var i = 0, n = log.length; i < n; i++) {
        var record = log[i];
        var fn = record[0];
        var args = record[1];
        switch (fn) {
        case arc:
        case arcTo:
        case ellipse:
          var x;
          var y;
          var rx;
          var ry;
          var rotation = 0;
          var startAngle;
          var endAngle;
          var anticlockwise;
          var a1;
          var a2;
          if (fn === arc) {
            x = args[0];
            y = args[1];
            rx = args[2];
            ry = rx;
            startAngle = args[3];
            endAngle = args[4];
            anticlockwise = args[5];
          } else if (fn === arcTo) {
            var x1 = args[0];
            var y1 = args[1];
            var x2 = args[2];
            var y2 = args[3];
            var rx = args[4];
            if (args[5] !== undefined) {
              ry = args[4];
              rotation = ~~args[5];
            } else {
              ry = rx;
            }
            var dir = (x2 - x1) * (y0 - y1) + (y2 - y1) * (x1 - x0);
            if (!dir) {
              x0 = x1;
              y0 = y1;
              if (x0 < xMin)
                xMin = x0;
              if (x0 > xMax)
                xMax = x0;
              if (y0 < yMin)
                yMin = y0;
              if (y0 > yMax)
                yMax = y0;
              continue;
            } else {
              var aa = (x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1);
              var bb = (x1 - x2) *(x1 - x2) + (y1 - y2) * (y1 - y2);
              var cc = (x0 - x2) * (x0 - x2) + (y0 - y2) * (y0 - y2);
              var u = (aa + bb - cc) / 2 * sqrt(aa * bb);
              var v = sqrt(1 - u * u);
              var dx = rx / (1 - u) / v;
              var dy = ry / (1 - u) / v;
              var ax = (x1 - x0) / sqrt(aa);
              var ay = (y1 - y0) / sqrt(aa);
              var bx = (x1 - x2) / sqrt(bb);
              var by = (y1 - y2) / sqrt(bb);
              var x3 = x1 - ax * dx;
              var y3 = y1 - ay * dy;
              var x4 = x1 - bx * dx;
              var y4 = y1 - by * dy;
              var anticlockwise = dir < 0;
              x = x3 + ay * rx * (anticlockwise ? 1 : -1);
              y = y3 - ax * ry * (anticlockwise ? 1 : -1);
              startAngle = atan2(y3 - y, x3 - x);
              endAngle = atan2(y4 - y, x4 - x);
              if (x3 < xMin)
                xMin = x3;
              if (x3 > xMax)
                xMax = x3;
              if (y3 < yMin)
                yMin = y3;
              if (y3 > yMax)
                yMax = y3;
            }
          } else {
            x = args[0];
            y = args[1];
            rx = args[2];
            ry = args[3];
            rotation = args[4];
            startAngle = args[5];
            endAngle = args[6];
            anticlockwise = args[7];
          }
          if (anticlockwise) {
            a1 = endAngle * 180 / PI;
            a2 = startAngle * 180 / PI;
          } else {
            a1 = startAngle * 180 / PI;
            a2 = endAngle * 180 / PI;
          }
          if (a1 < 0 || a2 < 0) {
            a1 += 360;
            a2 += 360;
          }
          if (a2 < a1)
            a2 += 360;
          var u = cos(rotation);
          var v = sin(rotation);
          for (var a0 = startAngle; a0 <= endAngle; a0 += 0.01) {
            var ua2 = cos(a0);
            var va2 = sin(a0);
            x0 = u * rx * ua2 + -v * ry * va2 + x;
            y0 = u * ry * va2 + v * rx * ua2 + y;
            if (x0 < xMin)
              xMin = x0;
            if (x0 > xMax)
              xMax = x0;
            if (y0 < yMin)
              yMin = y0;
            if (y0 > yMax)
              yMax = y0;
          }
          continue;
        case closePath:
          x0 = sx;
          y0 = sy;
          continue;
        case bezierCurveTo:
        case quadraticCurveTo:
          var cp1x;
          var cp1y;
          var cp2x;
          var cp2y;
          var x;
          var y;
          if (fn === bezierCurveTo) {
            cp1x = args[0];
            cp1y = args[1];
            cp2x = args[2];
            cp2y = args[3];
            x = args[4];
            y = args[5];
          } else {
            x = args[2];
            y = args[3];
            var ratio = 2 / 3;
            cp1x = x0 + (args[0] - x0) * ratio;
            cp1y = y0 + (args[1] - y0) * ratio;
            cp2x = cp1x + (x - x0) * (1 - ratio);
            cp2y = cp1y + (y - y0) * (1 - ratio);
          }
          var aa = x - 3 * cp2x + 3 * cp1x - x0;
          var bb = 3 * cp2x - 6 * cp1x + 3 * x0;
          var cc = 3 * cp1x - 3 * x0;
          var tx = x0;
          var ee = y - 3 * cp2y + 3 * cp1y - y0;
          var ff = 3 * cp2y - 6 * cp1y + 3 * y0;
          var gg = 3 * cp1y - 3 * y0;
          var ty = y0;
          for (var t = 0; t <= 1; t += 0.01) {
            x0 = aa * t * t * t + bb * t * t + cc * t + tx;
            y0 = ee * t * t * t + ff * t * t + gg * t + ty;
            if (x0 < xMin)
              xMin = x0;
            if (x0 > xMax)
              xMax = x0;
            if (y0 < yMin)
              yMin = y0;
            if (y0 > yMax)
              yMax = y0;
          }
          continue;
        case lineTo:
          x0 = args[0];
          y0 = args[1];

          x0 = x0 * a + y0 * b + e;
          y0 = x0 * c + y0 * d + f;

          break;
        case moveTo:
          x0 = args[0];
          y0 = args[1];

          x0 = x0 * a + y0 * b + e;
          y0 = x0 * c + y0 * d + f;

          sx = x0;
          sy = sy;
          break;
        case rect:
          x0 = args[0];
          y0 = args[1];
          var x1 = x0 + args[2];
          var y1 = y0 + args[3];
          if (x1 < xMin)
            xMin = x1;
          if (x1 > xMax)
            xMax = x1;
          if (y1 < yMin)
            yMin = y1;
          if (y1 > yMax)
            yMax = y1;
          break;
        case setTransform:
          a = args[0];
          b = args[1];
          c = args[2];
          d = args[3];
          e = args[4];
          f = args[5];
          continue;
        }
        if (x0 < xMin)
          xMin = x0;
        if (x0 > xMax)
          xMax = x0;
        if (y0 < yMin)
          yMin = y0;
        if (y0 > yMax)
          yMax = y0;
      }

      this._save();
      this._setTransform(1, 0, 0, 1, 0, 0);
      this._beginPath();
      this.strokeStyle = 'red';
      this._rect(xMin, yMin, xMax - xMin, yMax - yMin);
      this._stroke();
      this._restore();

      path.addPath(options.path || this);
      hitRegions.push({
        id: options.id || '',
        path: path,
        x: xMin,
        y: yMin,
        w: xMax - xMin,
        h: yMax - yMin
      });
    };
    shimProto.addHitRegion = addHitRegion;

    shimProto.clearRect = function (x, y, w, h) {
      this._clearRect(x, y, w, h);
      var hitRegions = this._hitRegions;
      if (hitRegions != false) {
        var i = hitRegions.length;
        while (i--) {
          var region = hitRegions[i];
          if (x <= region.x && w >= region.w && y >= region.y && h >= region.h)
            hitRegion.splice(i, 1);
        }
      }
    };
  }

  if (shimPath) {
    pathCls = function Path(d) {
      if (!(this instanceof Path))
        return new Path(d);

      var ctx = createCtx();
      init(ctx);

      defineProperties(this, {
        '_ctx': { value: ctx },
        '_hitTest': { value: isPointInPath.bind(ctx) },
        '_log': { value: [] }
      });

      if (d !== undefined) {
        if (d instanceof Path)
          this.addPath(d);
        else
          this._path(d);
      }
    }

    var pathProto = pathCls.prototype;

    defineProperty(pathProto, '_path', {
      value: function (d) {
        var data = (d + '').match(/[a-z][^a-z]*/gi);
        var x = 0;
        var y = 0;
        var cpx = 0;
        var cpy = 0;
        for (var i = 0, n = data.length; i < n; i++) {
          var chunk = data[i];
          var cmd = chunk[0].toUpperCase();
          if (cmd === 'Z') {
            this.closePath();
            continue;
          }

          var abs = cmd === chunk[0];
          var args = chunk.slice(1)
                          .trim()
                          .replace(/(\d)-/g, '$1 -')
                          .split(/,|\s/)
                          .map(parseFloat);
          var argc = args.length;

          var dx = x;
          var dy = y;
          var j = 0;
          while (j < argc) {
            if (abs) {
              dx = dy = 0;
            }
            switch (cmd) {
            case 'A':
              var rx = args[j++];
              var ry = args[j++];
              var rotation = args[j++] * PI / 180;
              var large = args[j++];
              var sweep = args[j++];
              dx += args[j++];
              dy += args[j++];
              var u = cos(rotation);
              var v = sin(rotation);

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
                rx *= sqrt(pl);
                ry *= sqrt(pl);
                prx = rx * rx;
                pry = ry * ry;
              }

              var sq = (prx * pry - prx * py1 - pry * px1) / (prx * py1 + pry * px1);
              sq = sq < 0 ? 0 : sq;
              var coef = (large === sweep ? -1 : 1) * sqrt(sq);
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

              var n1 = sqrt(ux * ux + uy * uy);
              var startAngle = (uy < 0 ? -1 : 1) * acos(ux / n1);

              var n2 = sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy));
              var p = ux * vx + uy * vy;
              var angleExtent = (ux * vy - uy * vx < 0 ? -1 : 1) * acos(p / n2);
              if (sweep) {
                if (angleExtent < 0)
                  angleExtent += 2 * PI;
              } else if (angleExtent > 0) {
                angleExtent += 2 * PI;
              }
              var endAngle = startAngle + angleExtent;

              this.ellipse(cx, cy, rx, ry, rotation, startAngle, endAngle, !sweep);
              break;
            case 'C':
              var x1 = dx + args[j++];
              var y1 = dy + args[j++];
              cpx = dx + args[j++];
              cpy = dy + args[j++];
              dx += args[j++];
              dy += args[j++];
              this.bezierCurveTo(x1, y1, cpx, cpy, dx, dy);
              break;
            case 'H':
              dx += args[j++];
              this.lineTo(dx, dy);
              break;
            case 'L':
              dx += args[j++];
              dy += args[j++];
              this.lineTo(dx, dy);
              break;
            case 'M':
              dx += args[j++];
              dy += args[j++];
              this.moveTo(dx, dy);
              break;
            case 'Q':
              cpx = dx + args[j++];
              cpy = dy + args[j++];
              dx += args[j++];
              dy += args[j++];
              this.quadraticCurveTo(cpx, cpy, dx, dy);
              break;
            case 'S':
              var x1 = x * 2 - cpx;
              var y1 = y * 2 - cpy;
              cpx = dx + args[j++];
              cpy = dy + args[j++];
              dx += args[j++];
              dy += args[j++];
              this.bezierCurveTo(x1, y1, cpx, cpy, dx, dy);
              break;
            case 'T':
              cpx = x * 2 - cpx;
              cpy = y * 2 - cpy;
              dx += args[j++];
              dy += args[j++];
              this.quadraticCurveTo(cpx, cpy, dx, dy);
              break;
            case 'V':
              dy += args[j++];
              this.lineTo(dx, dy);
              break;
            default:
              return;
            }
            x = dx;
            y = dy;
          }
        }
      }
    });

    [

      [arc, 6],
      [arcTo, 5],
      [bezierCurveTo, 6],
      [closePath],
      [ellipse, 8],
      [lineTo, 2],
      [moveTo, 2],
      [quadraticCurveTo, 4],
      [rect, 4]

    ].forEach(function (item) {
      var native = item[0];
      var r = regFunction.exec(native);
      var name = r[1];
      var argc = item[1] || 0;
      var args = [];
      for (var i = 0; i < argc; i++)
        args.push(fromCharCode(97 + i));
      args = args + '';

      defineLazyProperty(pathProto, '_' + name, {
        get: function () {
          return native.bind(this._ctx);
        }
      });

      var fn = eval('(function(' + args + '){' +
        'this._' + name + '(' + args + ');' +
        'this._log.push([native' + (args && ',[' + args + ']') + '])' +
      '})');
      pathProto[name] = fn;
      shimProto[name] = fn;
    });

    pathProto.addPath = function (path, transformation) {
      if (path === undefined)
        throw Error('Not enough arguments');
      if (!(path instanceof pathCls) ||
          (transformation && !(transformation instanceof SVGMatrix)))
        throw TypeError();

      this._ctx._drawPath(path, transformation);

      var log = this._log;
      log.push([save]);
      if (transformation) {
        log.push([
          transform,
          [
            transformation.a,
            transformation.b,
            transformation.c,
            transformation.d,
            transformation.e,
            transformation.f
          ]
        ]);
      }
      push.apply(log, path._log);
      log.push([restore]);
    };

    defineProperty(shimProto, '_drawPath', {
      value: function (path) {
        this._save();
        this._beginPath();
        var log = path ? path._log : this._log;
        for (var i = 0, n = log.length; i < n; i++) {
          var record = log[i];
          record[0].apply(this, record[1]);
        }
        this._restore();
      }
    });
    defineLazyProperty(shimProto, '_log', {
      get: function () {
        return [];
      }
    });
    shimProto.beginPath = function () {
      var log = this._log;
      if (log.length) {
        log.length = 0;
        var m = this.currentTransform;
        log.push([setTansform, [m.a, m.b, m.c, m.d, m.e, m.f]]);
      }
      this._beginPath();
    };
    shimProto.isPointInPath = function (x, y) {
      if (x instanceof pathCls) {
        path = x;
        x = y;
        y = arguments[2];

        var m = this._currentTransform.inverse();
        var ptx = x * m.a + y * m.b + m.e;
        var pty = x * m.c + y * m.d + m.f;

        return path._hitTest(ptx, pty);
      }
      return this._isPointInPath(x, y);
    };

    ['clip', 'fill', 'stroke'].forEach(function (name) {
      shimProto[name] = eval('(function(path){' +
        'if(path===undefined)' +
          'this._' + name + '();' +
        'else if(path instanceof pathCls){' +
          'this._drawPath(path);' +
          'this._' + name + '();' +
          'this._drawPath()' +
        '}else{' +
          'throw TypeError()' +
        '}' +
      '})');
    });
  } else {
  	pathCls = Path;
  }

  if (shimResetClip) {
    resetClip = function () {
      var canvas = this.canvas;
      this._beginPath();
      this._setTransform(1, 0, 0, 1, 0, 0);
      this._rect(0, 0, canvas.width, canvas.height);
      this._clip();
      this._drawPath();
    };
    shimProto.resetClip = resetClip;
  }

  if (shimResetTransform) {
    resetTransform = function () {
      this.setTansform(1, 0, 0, 1, 0, 0);
    };
    shimProto.resetTransform = resetTransform;
  }

  Kanvas.SVGMatrix = matrixCls;
  Kanvas.Path = pathCls;

  return Kanvas;

}(document));
