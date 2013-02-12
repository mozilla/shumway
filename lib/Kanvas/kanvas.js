// Kanvas v0.0.0 (c) 2013 Tobias Schneider
// Released under MIT license.

// Kanvas adds support for not (yet) implemented HTML Canvas APIs.

;var Kanvas = Kanvas || (function (document, undefined) {

  'use strict';

  var Kanvas = { version: '0.0.0' };

  var nativeCanvas = document.createElement('canvas');
  var nativeCanvasClass = nativeCanvas.constructor;

  var native2dContext = nativeCanvas.getContext('2d');
  var native2dContextClass = native2dContext.constructor;

  var nativeCanvasProto = nativeCanvasClass.prototype;
  var native2dContextProto = native2dContextClass.prototype;
  var kanvas2dContextProto = Object.create(native2dContextProto);

  var nativeGetContext = nativeCanvas.getContext;

  var defineProperty = Object.defineProperty;
  var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  var getOwnPropertyNames = Object.getOwnPropertyNames;

  var matrixClass;
  var pathClass;

  /** @const */ var PATH_CMD_CLOSE = 0;
  /** @const */ var PATH_CMD_MOVE  = 1;
  /** @const */ var PATH_CMD_LINE  = 2
  /** @const */ var PATH_CMD_CURVE = 3;

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

  function arcToBezier(sink, cx, cy, radius, angle0, angle1, acw) {
    var x = cx + Math.cos(angle0) * radius;
    var y = cy + Math.sin(angle0) * radius;

    sink.__cmds__.push(PATH_CMD_LINE);
    sink.__data__.push(x, y);

    if (acw) {
      if (angle0 < angle1)
        angle0 += Math.ceil((angle1 - angle0) / (2 * Math.PI)) * 2 * Math.PI;
      if (angle0 - angle1 > 2 * Math.PI)
        angle1 = angle0 - 2 * Math.PI;
    } else {
      if (angle1 < angle0)
        angle1 += Math.ceil((angle0 - angle1) / (2 * Math.PI)) * 2 * Math.PI;
      if (angle1 - angle0 > 2 * Math.PI)
        angle1 = angle0 + 2 * Math.PI;
    }

    var sweep = Math.abs(angle1 - angle0);
    var dir = acw ? -1 : 1;

    while (sweep > 0) {
      if (sweep > Math.PI / 2)
        angle1 = angle0 + Math.PI / 2 * dir;
      else
        angle1 = angle0 + sweep * dir;

      var kappa = (4 / 3) * Math.tan((angle1 - angle0) / 4) * radius;

      x = cx + Math.cos(angle1) * radius;
      y = cy + Math.sin(angle1) * radius;

      var cp1x = cx + Math.cos(angle0) * radius + -Math.sin(angle0) * kappa;
      var cp1y = cy + Math.sin(angle0) * radius + Math.cos(angle0) * kappa;

      var cp2x = x + Math.sin(angle1) * kappa;
      var cp2y = y + -Math.cos(angle1) * kappa;

      sink.__cmds__.push(PATH_CMD_CURVE);
      sink.__data__.push(cp1x, cp1y, cp2x, cp2y, x, y);

      sweep -= Math.PI / 2;
      angle0 = angle1;
    }
  }

  try {
    var matrix = new SVGMatrix;
    matrixClass = matrix.constructor;
  } catch (e) {
    var svgNamespace = 'http://www.w3.org/2000/svg';
    var svgElement = document.createElementNS(svgNamespace, 'svg');

    matrixClass = function SVGMatrix() {
      return svgElement.createSVGMatrix();
    }
    matrixClass.prototype = SVGMatrix.prototype;
  }

  if (!('currentTransform' in native2dContext)) {
    defineLazyProperty(kanvas2dContextProto, '__ct__', {
      get: function () {
        return new matrixClass;
      }
    });
    defineLazyProperty(kanvas2dContextProto, '__ctm__', {
      get: function () {
        return [1, 0, 0, 1, 0, 0];
      }
    });

    defineProperty(kanvas2dContextProto, 'currentTransform', {
      get: function () {
        return this.__ct__;
      },
      set: function(val) {
        if (!(val instanceof matrixClass))
          throw new TypeError;

        defineProperty(this, '__ct__', { value: val });
      }
    });

    defineLazyProperty(kanvas2dContextProto, '__stack__', {
      get: function () {
        return [];
      }
    });

    kanvas2dContextProto.save = function () {
      this.__save__();
      this.__stack__.push(this.__ctm__.slice());
    };
    kanvas2dContextProto.restore = function () {
      this.__restore__();

      if (this.__stack__.length) {
        var ct = this.__ct__;
        var ctm = this.__ctm__;
        var m = this.__stack__.pop();

        ct.a = ctm[0] = m[0];
        ct.b = ctm[1] = m[1];
        ct.c = ctm[2] = m[2];
        ct.d = ctm[3] = m[3];
        ct.e = ctm[4] = m[4];
        ct.f = ctm[5] = m[5];
      }
    };

    kanvas2dContextProto.scale = function (x, y) {
      if (+x != x || +y != y)
        return;

      this.__scale__(x, y);

      var ct = this.__ct__;
      var ctm = this.__ctm__;

      ct.a = ctm[0] *= x;
      ct.b = ctm[1] *= x;
      ct.c = ctm[2] *= y;
      ct.d = ctm[3] *= y;
    };
    kanvas2dContextProto.rotate = function (angle) {
      if (+angle != angle)
        return;

      this.__rotate__(angle);

      var ct = this.__ct__;
      var ctm = this.__ctm__;
      var u = Math.cos(angle);
      var v = Math.sin(angle);

      ct.a = ctm[0] = ctm[0] * u + ctm[2] * v;
      ct.b = ctm[1] = ctm[1] * u + ctm[3] * v;
      ct.c = ctm[2] = ctm[0] * -v + ctm[2] * u;
      ct.d = ctm[3] = ctm[1] * -v + ctm[3] * u;
    };
    kanvas2dContextProto.translate = function (x, y) {
      if (+x != x || +y != y)
        return;

      this.__translate__(x, y);

      var ct = this.__ct__;
      var ctm = this.__ctm__;

      ct.e = ctm[4] += ctm[0] * x + ctm[2] * y;
      ct.f = ctm[5] += ctm[1] * x + ctm[3] * y;
    };
    kanvas2dContextProto.transform = function (a, b, c, d, e, f) {
      if (+a != a || +b != b || +c != c || +d != d || +e != e || +f != f)
        return;

      this.__transform__(a, b, c, d, e, f);

      var ct = this.__ct__;
      var ctm = this.__ctm__;
      var g = ctm[0];
      var h = ctm[1];
      var i = ctm[2];
      var j = ctm[3];

      ct.a = ctm[0] = g * a + i * b;
      ct.b = ctm[1] = h * a + j * b;
      ct.c = ctm[2] = g * c + i * d;
      ct.d = ctm[3] = h * c + j * d;
      ct.e = ctm[4] += ctm[0] * e + i * e;
      ct.f = ctm[5] += ctm[1] * f + j * f;
    };
    kanvas2dContextProto.setTransform = function (a, b, c, d, e, f) {
      if (+a != a || +b != b || +c != c || +d != d || +e != e || +f != f)
        return;

      this.__setTransform__(a, b, c, d, e, f);

      var ct = this.__ct__;
      var ctm = this.__ctm__;

      ct.a = ctm[0] = a;
      ct.b = ctm[1] = b;
      ct.c = ctm[2] = c;
      ct.d = ctm[3] = d;
      ct.e = ctm[4] = e;
      ct.f = ctm[5] = f;
    };
    kanvas2dContextProto.resetTransform = function (a, b, c, d, e, f) {
      this.setTransform(1, 0, 0, 1, 0, 0);
    };
  }

  if (!('ellipse' in native2dContext)) {
    kanvas2dContextProto.ellipse = function (
      x, y, rx, ry, rotation, angle0, angle1, acw
    ) {
      if (+x != x || +y != y ||
          +rx != rx || +ry != ry ||
          +angle0 != angle0 || +angle1 != angle1)
        return;

      if (rx < 0 || ry < 0)
        throw new IndexSizeError;

      var u = Math.cos(rotation)
      var v = Math.sin(rotation);

      this.save();
      this.transform(u * rx, v * ry, -v * rx, u * ry, x, y);
      this.arc(0, 0, 1, angle0, angle1, acw);
      this.restore();
    };
  }

  if (typeof Path === 'undefined') {
    pathClass = function Path(d) {
      if (!(this instanceof Path))
        return new Path(d);
    };

    var pathProto = Object.create(null);

    defineLazyProperty(pathProto, '__cmds__', {
      get: function () {
        return [];
      }
    });
    defineLazyProperty(pathProto, '__data__', {
      get: function () {
        return [];
      }
    });

    pathProto.closePath = function () {
      this.__cmds__.push(PATH_CMD_CLOSE);
    };
    pathProto.moveTo = function (x, y) {
      if (+x != x || +y != y)
        return;

      this.__cmds__.push(PATH_CMD_MOVE);
      this.__data__.push(x, y);
    };
    pathProto.lineTo = function (x, y) {
      if (+x != x || +y != y)
        return;

      this.__cmds__.push(PATH_CMD_LINE);
      this.__data__.push(x, y);
    };
    pathProto.quadraticCurveTo = function (cpx, cpy, x, y) {
      if (+cpx != cpx || +cpy != cpy || +x != x || +y != y)
        return;

      var p = this.__data__.length - 2;
      var ox = this.__data__[p];
      var oy = this.__data__[p + 1];

      var cp1x = ox + 2 / 3 * (cpx - ox);
      var cp1y = oy + 2 / 3 * (cpy - oy);
      var cp2x = cp1x + (x - ox) / 3;
      var cp2y = cp1y + (y - oy) / 3;

      this.__cmds__.push(PATH_CMD_CURVE);
      this.__data__.push(cp1x, cp1y, cp2x, cp2y, x, y);
    };
    pathProto.bezierCurveTo = function (cp1x, cp1y, cp2x, cp2y, x, y) {
      if (+cp1x != cp1x || +cp1y != cp1y ||
          +cp2x != cp2x || +cp2y != cp2y ||
          +x != x || +y != y)
        return;

      this.__cmds__.push(PATH_CMD_CURVE);
      this.__data__.push(cp1x, cp1y, cp2x, cp2y, x, y);
    };
    pathProto.arcTo = function (x1, y1, x2, y2, rx, ry, rotation) {
      if (arguments.length > 5)
        throw Error('Elliptical arcTo not supported');

      if (+x1 != x1 || +y1 != y1 || +x2 != x2 || +y2 != y2 || +rx != rx)
        return;

      if (rx < 0) {
        throw new IndexSizeError;
        return;
      }

      var p = this.__data__.length - 2;
      var ox = this.__data__[p];
      var oy = this.__data__[p + 1];

      var dir = (x2 - x1) * (oy - y1) + (y2 - y1) * (x1 - ox);

      if (!dir ||
          (ox === x1 && oy === y1) ||
          (x1 === x2 && y1 === y2) ||
          rx === 0) {
        this.__cmds__.push(PATH_CMD_LINE);
        this.__data__.push(x1, y1);
        return;
      }

      var aa = (ox - x1) * (ox - x1) + (oy - y1) * (oy - y1);
      var bb = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
      var cc = (ox - x2) * (ox - x2) + (oy - y2) * (oy - y2);
      var cosx = (aa + bb - cc) / (2 * Math.sqrt(aa * bb));

      var sinx = Math.sqrt(1 - cosx * cosx);
      var d = rx / ((1 - cosx) / sinx);

      var anx = (x1 - ox) / Math.sqrt(aa);
      var any = (y1 - oy) / Math.sqrt(aa);
      var bnx = (x1 - x2) / Math.sqrt(bb);
      var bny = (y1 - y2) / Math.sqrt(bb);
      var x3 = x1 - anx * d;
      var y3 = y1 - any * d;
      var x4 = x1 - bnx * d;
      var y4 = y1 - bny * d;
      var acw = dir < 0;
      var cx = x3 + any * rx * (acw ? 1 : -1);
      var cy = y3 - anx * rx * (acw ? 1 : -1);
      var angle0 = Math.atan2(y3 - cy, x3 - cx);
      var angle1 = Math.atan2(y4 - cy, x4 - cx);

      this.__cmds__.push(PATH_CMD_LINE);
      this.__data__.push(x3, y3);

      arcToBezier(this, cx, cy, rx, angle0, angle1, acw);
    };
    pathProto.rect = function (x, y, w, h) {
      if (+x != x || +y != y || +w != w || +h != h)
        return;

      this.__cmds__.push(
        PATH_CMD_MOVE,
        PATH_CMD_LINE,
        PATH_CMD_LINE,
        PATH_CMD_LINE,
        PATH_CMD_CLOSE
      );
      this.__data__.push(x, y, x + w, y, x + w, y + h, x, y + h);
    };
    pathProto.arc = function (x, y, radius, angle0, angle1, acw) {
      if (+x != x || +y != y ||
          +radius != radius ||
          +angle0 != angle0 || +angle1 != angle1)
        return;

      if (radius < 0) {
        throw new IndexSizeError;
        return;
      }

      arcToBezier(this, x, y, radius, angle0, angle1, acw);
    };
    pathProto.ellipse = function (x, y, rx, ry, rotation, angle0, angle1, acw) {
      if (+x != x || +y != y ||
          +rx != rx || +ry != ry ||
          +angle0 != angle0 || +angle1 != angle1)
        return;

      if (rx < 0 || ry < 0)
        throw new IndexSizeError;

      var u = Math.cos(rotation)
      var v = Math.sin(rotation);
      //var matrix = [u * rx, v * ry, -v * rx, u * ry, x, y];

      arcToBezier(this, 0, 0, 1, angle0, angle1, acw);
    };

    pathClass.prototype = pathProto;

    defineProperty(kanvas2dContextProto, '__draw__', {
      value: function (sink) {
        var cmds = sink.__cmds__;
        var data = sink.__data__;
        for (var i = 0, j = 0; i < cmds.length; i++) {
          var cmd = cmds[i];
          switch (cmd) {
          case PATH_CMD_CLOSE:
            this.closePath();
            break;
          case PATH_CMD_MOVE:
            this.moveTo(data[j++], data[j++]);
            break;
          case PATH_CMD_LINE:
            this.lineTo(data[j++], data[j++]);
            break;
          case PATH_CMD_CURVE:
            this.bezierCurveTo(
              data[j++], data[j++],
              data[j++], data[j++],
              data[j++], data[j++]
            );
            break;
          }
        }
      }
    });

    kanvas2dContextProto.fill = function (path) {
      if (path instanceof pathClass) {
        this.beginPath();
        this.__draw__(path);
      }

      this.__fill__();
    };
    kanvas2dContextProto.stroke = function (path) {
      if (path instanceof pathClass) {
        this.beginPath();
        this.__draw__(path);
      }

      this.__stroke__();
    };
    kanvas2dContextProto.clip = function (path) {
      if (path instanceof pathClass) {
        this.beginPath();
        this.__draw__(path);
      }

      this.__clip__();
    };
    kanvas2dContextProto.isPointInPath = function (x, y, path) {
      if (path instanceof pathClass) {
        this.beginPath();
        this.__draw__(path);
      }

      this.__isPointInPath__(x, y);
    };
  } else {
    pathClass = Path;
  }

  defineProperty(nativeCanvasProto, '__pctx__', { value: null });

  nativeCanvasProto.getContext = function (ctxId) {
    var primaryCtx = this.__pctx__;

    if (primaryCtx && primaryCtx !== ctxId)
      return null;

    var ctx;

    if (ctxId === 'kanvas-2d') {
      ctx = nativeGetContext.call(this, '2d');

      var props = getOwnPropertyNames(kanvas2dContextProto);
      for (var i = 0; i < props.length; i++) {
        var key = props[i];
        var val = kanvas2dContextProto[key];
        if (ctx[key] !== val) {
          if (key in ctx)
            ctx['__' + key + '__'] = ctx[key];

          var desc = getOwnPropertyDescriptor(kanvas2dContextProto, key);
          defineProperty(ctx, key, desc);
        }
      }
    } else {
      ctx = nativeGetContext.apply(this, arguments);
    }

    if (!primaryCtx && ctx !== null)
      defineProperty(ctx, '__pctx__', { value: ctx });

    return ctx;
  };

  Kanvas.SVGMatrix = matrixClass;
  Kanvas.Path = pathClass;

  return Kanvas;

}(document));
