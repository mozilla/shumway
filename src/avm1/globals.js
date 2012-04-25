/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

function isMovieClip(obj) {
  return obj instanceof MovieClip;
}

function AS2ScopeListItem(scope, next) {
  this.scope = scope;
  this.next = next;
}
AS2ScopeListItem.prototype = {
  create: function (scope) {
    return new AS2ScopeListItem(scope, this);
  }
};

function AS2Context(swfVersion) {
  this.swfVersion = swfVersion;
  this.globals = new AS2Globals(this);
  var windowScope = new AS2ScopeListItem(window, null);
  this.initialScope = new AS2ScopeListItem(this.globals, windowScope);
}
AS2Context.prototype = {};

function AS2Globals(context) {
  this.$context = context;
  this._global = this;
}
AS2Globals.prototype = {
  $asfunction: function(link) {
   throw 'Not implemented';
  },
  call: function(frame) {
    throw 'Not implemented';
  },
  ASSetPropFlags: function (obj, children, n, allowFalse) {
    // TODO
  },
  chr: function(number) {
    return String.fromCharCode(number);
  },
  duplicateMovieClip: function(target, newname, depth) {
    throw 'Not implemented';
  },
  eval: function(expression) {
    throw 'Not implemented';
  },
  fscommand: function (command, parameters) {
    throw 'Not implemented'; // flash.system.fscommand
  },
  getProperty: function(target, index) {
    throw 'Not implemented';
  },
  getTimer: function() {
    return 0; // flash.utils.getTimer()
  },
  getURL: function(url, target, method) {
    // flash.net.navigateToURL()
  },
  getVersion: function() {
    return 'SHUMWAY ' + this.$context.swfVersion + ',0,0,0';
  },
  gotoAndPlay: function(scene, frame) {
    throw 'Not implemented';
  },
  gotoAndStop: function(scene, frame) {
    throw 'Not implemented';
  },
  ifFrameLoaded: function(scene, frame) {
    throw 'Not implemented';
  },
  int: function(value) {
    return 0 | value;
  },
  length: function(expression) {
    return ('' + expression).length; // ASCII Only?
  },
  loadMovie: function(url, target, method) {
    throw 'Not implemented';
  },
  loadMovieNum: function(url, level, method) {
    throw 'Not implemented';
  },
  loadVariables: function(url, target, method) {
    throw 'Not implemented';
  },
  loadVariablesNum: function(url, level, method) {
    throw 'Not implemented';
  },
  mbchr: function(number) {
    return String.fromCharCode.charCodeAt(number);
  },
  mblength: function() {
    return ('' + expression).length;
  },
  mbord: function(character) {
    return ('' + character).charCodeAt(0);
  },
  mbsubstring: function(value, index, count) {
    if (index !== (0 | index) || count !== (0 | count)) {
      // index or count are not integers, the result is the empty string.
      return '';
    }
    return ('' + value).substr(index, count);
  },
  MMExecute: function(command) {
    throw 'Not implemented';
  },
  nextFrame: function() {
    throw 'Not implemented';
  },
  nextScene: function() {
    throw 'Not implemented';
  },
  ord: function(charachar) {
    return ('' + character).charCodeAt(0); // ASCII only?
  },
  play: function() {
    throw 'Not implemented';
  },
  prevFrame: function() {
    throw 'Not implemented';
  },
  prevScene: function() {
    throw 'Not implemented';
  },
  print: function(target, boundingBox) {
    throw 'Not implemented';
  },
  printAsBitmap: function(target, boundingBox) {
    throw 'Not implemented';
  },
  printAsBitmapNum: function(level, boundingBox) {
    throw 'Not implemented';
  },
  printNum: function(level, bondingBox) {
    throw 'Not implemented';
  },
  random: function(value) {
    return 0 | (Math.random() * (0 | value));
  },
  removeMovieClip: function(target) {
    throw 'Not implemented';
  },
  setProperty: function(target, index, value) {
    throw 'Not implemented';
  },
  showRedrawRegions: function(enable, color) {
    throw 'Not implemented';
  },
  startDrag: function(target, lock, left, top, right, bottom) {
    throw 'Not implemented';
  },
  stop: function() {
    throw 'Not implemented';
  },
  stopAllSounds: function() {
    throw 'Not implemented';
  },
  stopDrag: function() {
    throw 'Not implemented';
  },
  String: String,
  substring: function(value, index, count) {
    return this.mbsubstring(value, index, count); // ASCII Only?
  },
  targetPath: function(targetObject) {
    throw 'Not implemented';
  },
  toggleHighQuality: function() {
    throw 'Not implemented';
  },
  trace: function(expression) {
    console.log(expression);
  },
  unloadMovie: function(target) {
    throw 'Not implemented';
  },
  unloadMovieNum: function(level) {
    throw 'Not implemented';
  },
  updateAfterEvent: function() {
    throw 'Not implemented';
  }
};

function createBuiltinType(obj, args) {
  if (obj === Array) {
    // special case of array
    var result = args;
    if (args.length == 1 && typeof args[0] === 'number') {
      result = [];
      result.length = args[0];
    }
    return result;
  }
  if (obj === Boolean || obj === Number || obj === Date ||
      obj === String || obj === Function)
    return obj.apply(null, args);
  if (obj === Object)
    return {};
}
