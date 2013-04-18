/* -*- mode: javascript; tab-width: 4; indent-tabs-mode: nil -*- */

var create = Object.create;
var defineProperty = Object.defineProperty;
var keys = Object.keys;
var isArray = Array.isArray;
var fromCharCode = String.fromCharCode;
var log = Math.log;
var max = Math.max;
var min = Math.min;
var pow = Math.pow;
var push = [].push;
var slice = [].slice;
var splice = [].splice;

function fail(msg, context) {
  throw new Error((context ? context + ': ' : '') + msg);
}
function assert(cond, msg, context) {
  if (!cond)
    fail(msg, context);
}

function toStringRgba(color) {
  return 'rgba(' + [
    color.red,
    color.green,
    color.blue,
    color.alpha / 255
  ].join(',') + ')';
}

// Some browser feature testing
(function functionNameSupport() {
  if (eval("function t() {} t.name === 't'")) {
    return; // function name feature is supported
  }
  Object.defineProperty(Function.prototype, 'name', {
    get: function () {
      if (this.__name) return this.__name;
      var m = /function\s([^\(]+)/.exec(this.toString());
      var name = m && m[1] !== 'anonymous' ? m[1] : null;
      return (this.__name = name);
    },
    configurable: true,
    enumerable: false
  });
})();
