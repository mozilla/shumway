// Kanvas v0.0.1 (c) 2012 Tobias Schneider
// Released under MIT license.

// Kanvas adds support for not (yet) implemented HTML Canvas APIs.

;var Kanvas = Kanvas || (function (document, undefined) {

  'use strict';

  var Kanvas = { version: '0.0.1' };

  var nativeCanvas = document.createElement('canvas');
  var nativeCanvasClass = nativeCanvas.constructor;

  if (nativeCanvasClass !== HTMLCanvasElement)
    throw TypeError('Non-native HTMLCanvasElement');

  var native2dContext = nativeCanvas.getContext('2d');
  var native2dContextClass = native2dContext.constructor;

  if (native2dContextClass !== CanvasRenderingContext2D)
    throw TypeError('Non-native CanvasRenderingContext2D');

  var nativeCanvasProto = nativeCanvasClass.prototype;
  var native2dContextProto = native2dContextClass.prototype;
  var kanvas2dContextProto = Object.create(native2dContextProto);

  var matrixClass;
  var pathClass;

  var shimCurrentTransform = !('currentTransform' in native2dContext);
  var shimPath = typeof Path === 'undefined';

  var nativeGetContext = nativeCanvas.getContext;

  var defineProperties = Object.defineProperties;
  var defineProperty = Object.defineProperty;

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

  function safeReplace(obj, prop, val) {
    if (prop in obj)
      defineProperty(obj, '__' + prop + '__', { value: obj[prop] });
    obj[prop] = val;
  }

  defineProperty(nativeCanvasProto, '__primaryContext__', { writable: true });

  nativeCanvasProto.getContext = function (contextId) {
    var primaryContext = this.__primaryContext__;

    if (primaryContext && primaryContext !== contextId)
      return null;

    var context;

    if (contextId === 'kanvas-2d') {
      context = nativeGetContext.call(this, '2d');
      context.__proto__ = kanvas2dContextProto;
    } else {
      context = nativeGetContext.apply(this, arguments);
    }

    if (!primaryContext && context !== null)
      this.__primaryContext__ = context;

    return context;
  };

  try {
    var matrix = new SVGMatrix;
    matrixClass = matrix.constructor;
  } catch (err) {
    var svgNamespace = 'http://www.w3.org/2000/svg';
    var svgElement = document.createElementNS(svgNamespace, 'svg');

    matrixClass = function SVGMatrix() {
      return svgElement.createSVGMatrix();
    }
    matrixClass.prototype = SVGMatrix.prototype;
  }

  if (shimPath) {
    pathClass = function Path(d) {
      if (!(this instanceof Path))
        return new Path(d);

      var displayList = [];
      var hitCanvas = nativeCanvas.cloneNode();
      var hitContext = hitCanvas.getContext('2d');
      var pathState = [Number.MAX_VALUE, 0, Number.MAX_VALUE, 0];

      defineProperties(this, {
        __displayList__: { value: displayList },
        __hitContext__: { value: hitContext },
        __pathState__: { value: pathState }
      });
    };
    var pathMethods = { };
    var pathProto = Object.create(pathMethods);

    pathMethods.closePath = function () {
      this.__closePath__();
      this.__displayList__.push('c.closePath()');

      var state = this.__pathState__;
      state[6] = state[0];
      state[7] = state[1];
    };
    pathMethods.moveTo = function (x, y) {
      if (isNaN(+x + +y))
        return;

      this.__moveTo__(x, y);
      this.__displayList__.push('c.moveTo(' + x + ',' + y + ')');

      var state = this.__pathState__;

      state[0] = x;
      state[1] = y;

      if (x < state[2])
        state[2] = x;
      if (x > state[3])
        state[3] = x;
      if (y < state[4])
        state[4] = y;
      if (y > state[5])
        state[5] = y;

      state[6] = x;
      state[7] = y;
    };
    pathMethods.lineTo = function (x, y) {
      if (isNaN(+x + +y))
        return;

      this.__lineTo__(x, y);
      this.__displayList__.push('c.lineTo(' + x + ',' + y + ')');

      var state = this.__pathState__;

      if (x < state[0])
        state[0] = x;
      if (x > state[1])
        state[1] = x;
      if (y < state[2])
        state[2] = y;
      if (y > state[3])
        state[3] = y;

      state[6] = x;
      state[7] = y;
    };
    pathMethods.quadraticCurveTo = function (cpx, cpy, x, y) {
      if (isNaN(+cpx + +cpy + +x + +y))
        return;

      this.__quadraticCurveTo__(cpx, cpy, x, y);
      this.__displayList__.push('c.quadraticCurveTo(' + cpx + ',' + cpy + ',' + x + ',' + y + ')');

      var state = this.__pathState__;

      var x0 = state[6];
      var y0 = state[7];

      var xMin = x;
      var xMax = x;
      var yMin = y;
      var yMax = y;

      var dx = x0 - 2 * cpx + x;
      var tx = dx ? (x0 - cpx) / dx : -1;
      if (tx >= 0 && tx <= 1) {
        var mtx = 1 - tx;
        var px = mtx * mtx * x0 + 2 * mtx * tx * cpx + tx * tx * x;
        if (px < xMin)
          xMin = px;
        if (px > xMax)
          xMax = px;
      }

      var dy = y0 - 2 * cpy + y;
      var ty = dy ? (y0 - cpy) / dy : -1;
      if (ty >= 0 && ty <= 1) {
        var mty = 1 - ty;
        var py = mty * mty * y0 + 2 * mty * ty * cpy + ty * ty * y;
        if (py < yMin)
          yMin = py;
        if (py > yMax)
          yMax = py;
      }

      if (xMin < state[2])
        state[2] = xMin;
      if (xMax > state[3])
        state[3] = xMax;
      if (yMin < state[4])
        state[4] = yMin;
      if (yMax > state[5])
        state[5] = yMax;

      state[6] = x;
      state[7] = y;
    };

    defineLazyProperty(pathProto, '__draw__', {
      get: function () {
        return Function('c', this.__displayList__.join(';'));
      }
    });

    for (var methodName in pathMethods) {
      var method = pathMethods[methodName];
      var params = 'abcdefghijklmnopqrstuvwxyz'.split('').slice(methodName.length);

      pathProto['__' + methodName + '__'] = Function(params,
        'this.__hitContext__.' + methodName + '(' + params + ')'
      );
    }

    pathClass.prototype = pathProto;

    ['fill', 'stroke', 'clip'].forEach(function (methodName) {
      var nativeMethod = kanvas2dContextProto[methodName];

      kanvas2dContextProto[methodName] = function (path) {
        if (path instanceof pathClass) {
          this.beginPath();
          path.__draw__(this);
        }
        nativeMethod.call(this);
      };
    });
  } else {
    pathClass = Path;
  }

  Kanvas.SVGMatrix = matrixClass;
  Kanvas.Path = pathClass;

  return Kanvas;

}(document));
