/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var slice = [].slice;
var pow = Math.pow;
var fromCharCode = String.fromCharCode;
var max = Math.max;
var splice = [].splice;
var isArray = Array.isArray;
var keys = Object.keys;
var push = [].push;

function fail(msg, context) {
  throw new Error((context ? context + ': ' : '') + msg);
}
function assert(cond, msg, context) {
  if (!cond)
    fail(msg, context);
}

function colorToString(color) {
  return 'rgba(' + [
    color.red,
    color.green,
    color.blue,
    color.alpha / 255
  ].join(',') + ')';
}
