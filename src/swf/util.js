/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var create = Object.create;
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
function defer(func, startTime) {
  if (!startTime)
    startTime = +new Date;
  assert(+new Date - startTime < 1000, 'timeout', 'defer');
  if (func())
    setTimeout(defer, 0, func, startTime);
}

function toStringRgba(color) {
  return 'rgba(' + [color.red, color.green, color.blue, color.alpha / 255].join(',') + ')';
}
function toString16(val) {
  return fromCharCode((val >> 8) & 0xff, val & 0xff);
}
function toString32(val) {
  return toString16(val >> 16) + toString16(val);
}
