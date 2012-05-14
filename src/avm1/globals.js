/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

function ASSetPropFlags(obj, children, flags, allowFalse) {
  // flags (from bit 0): dontenum, dontdelete, readonly, ....
  // TODO
}

function AS2Globals(context) {
  this._global = this;
}
AS2Globals.prototype = {
  $asfunction: function(link) {
    throw 'Not implemented: $asfunction';
  },
  ASSetPropFlags: ASSetPropFlags,
  call: function(frame) {
    throw 'Not implemented: call';
  },
  chr: function(number) {
    return String.fromCharCode(number);
  },
  duplicateMovieClip: function(target, newname, depth) {
    var nativeTarget = AS2Context.instance.resolveTarget(target);
    nativeTarget.duplicateMovieClip(newname, depth);
  },
  fscommand: function (command, parameters) {
    flash.system.fscommand.apply(null, arguments);
  },
  getProperty: function(target, index) {
    var nativeTarget = AS2Context.instance.resolveTarget(target);
    throw 'Not implemented: getProperty';
  },
  getTimer: function() {
    return flash.utils.getTimer();
  },
  getURL: function(url, target, method) {
    var request = new AS2URLRequest(url);
    if (method)
      request.method = method;
    flash.net.navigateToURL(request, target);
  },
  getVersion: function() {
    return flash.system.Capalilities.version;
  },
  gotoAndPlay: function() {
    var nativeTarget = AS2Context.instance.resolveTarget();
    if (arguments.length < 2)
      nativeTarget.gotoAndPlay(arguments[0]);
    else
      nativeTarget.gotoAndPlay(arguments[1], arguments[0]); // scene and frame are swapped for AS3
  },
  gotoAndStop: function(scene, frame) {
    var nativeTarget = AS2Context.instance.resolveTarget();
    if (arguments.length < 2)
      nativeTarget.gotoAndStop(arguments[0]);
    else
      nativeTarget.gotoAndStop(arguments[1], arguments[0]); // scene and frame are swapped for AS3
  },
  int: function(value) {
    return 0 | value;
  },
  length: function(expression) {
    return ('' + expression).length; // ASCII Only?
  },
  loadMovie: function(url, target, method) {
    var nativeTarget = AS2Context.instance.resolveTarget(target);
    // flash.display.Loader, flash.net.URLLoader
    throw 'Not implemented: loadMovie';
  },
  loadMovieNum: function(url, level, method) {
    var nativeTarget = AS2Context.instance.resolveLevel(level);
    // flash.display.Loader, flash.net.URLLoader
    throw 'Not implemented: loadMovieNum';
  },
  loadVariables: function(url, target, method) {
    var nativeTarget = AS2Context.instance.resolveTarget(target);
    // flash.display.Loader, flash.net.URLLoader
    throw 'Not implemented: loadVariables';
  },
  loadVariablesNum: function(url, level, method) {
    var nativeTarget = AS2Context.instance.resolveLevel(level);
    // flash.display.Loader, flash.net.URLLoader
    throw 'Not implemented: loadVariablesNum';
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
  nextFrame: function() {
    var nativeTarget = AS2Context.instance.resolveTarget();
    nativeTarget.nextFrame();
  },
  nextScene: function() {
    var nativeTarget = AS2Context.instance.resolveTarget();
    nativeTarget.nextScene();
  },
  ord: function(charachar) {
    return ('' + character).charCodeAt(0); // ASCII only?
  },
  play: function() {
    var nativeTarget = AS2Context.instance.resolveTarget();
    nativeTarget.play();
  },
  prevFrame: function() {
    var nativeTarget = AS2Context.instance.resolveTarget();
    prevFrame.nextFrame();
  },
  prevScene: function() {
    var nativeTarget = AS2Context.instance.resolveTarget();
    nativeTarget.prevScene();
  },
  print: function(target, boundingBox) {
    // flash.printing.PrintJob
    throw 'Not implemented: print';
  },
  printAsBitmap: function(target, boundingBox) {
    throw 'Not implemented: printAsBitmap';
  },
  printAsBitmapNum: function(level, boundingBox) {
    throw 'Not implemented: printAsBitmapNum';
  },
  printNum: function(level, bondingBox) {
    throw 'Not implemented: printNum';
  },
  random: function(value) {
    return 0 | (Math.random() * (0 | value));
  },
  removeMovieClip: function(target) {
    var nativeTarget = AS2Context.instance.resolveTarget();
    var nativeTarget2 = AS2Context.instance.resolveTarget(target);
    nativeTarget.removeChild(nativeTarget2);
  },
  setProperty: function(target, index, value) {
    var nativeTarget = AS2Context.instance.resolveTarget(target);
    throw 'Not implemented: setProperty';
  },
  showRedrawRegions: function(enable, color) {
    // flash.profiler.showRedrawRegions.apply(null, arguments);
    throw 'Not implemented: showRedrawRegions';
  },
  startDrag: function(target, lock, left, top, right, bottom) {
    var nativeTarget = AS2Context.instance.resolveTarget(target);
    nativeTarget.startDrag(lock, arguments.length < 3 ? null :
      new AS2Rectangle(left, top, right - left, bottom - top));
  },
  stop: function() {
    var nativeTarget = AS2Context.instance.resolveTarget();
    nativeTarget.stop();
  },
  stopAllSounds: function() {
    // flash.media.SoundMixer.stopAll();
    throw 'Not implemented: stopAllSounds';
  },
  stopDrag: function() {
    var nativeTarget = AS2Context.instance.resolveTarget(target);
    nativeTarget.stopDrag();
  },
  String: String,
  substring: function(value, index, count) {
    return this.mbsubstring(value, index, count); // ASCII Only?
  },
  targetPath: function(targetObject) {
    var nativeTarget = AS2Context.instance.resolveTarget(target);
    // nativeTarget.getPath() ?
    throw 'Not implemented: targetPath';
  },
  toggleHighQuality: function() {
    // flash.display.Stage.quality
    throw 'Not implemented: toggleHighQuality';
  },
  trace: function(expression) {
    console.log(expression);
  },
  unloadMovie: function(target) {
    var nativeTarget = AS2Context.instance.resolveTarget(target);
    // nativeTarget.unload(); ?
    throw 'Not implemented: unloadMovie';
  },
  unloadMovieNum: function(level) {
    var nativeTarget = AS2Context.instance.resolveLevel(level);
    // nativeTarget.unload(); ?
    throw 'Not implemented: unloadMovieNum';
  },
  updateAfterEvent: function() {
    // flash.events.TimerEvent.updateAfterEvent
    throw 'Not implemented';
  },
  // built-ins
  Boolean: Boolean,
  Date: Date,
  Function: Function,
  Math: Math,
  Number: Number,
  NaN: NaN,
  Infinity: Infinity,
  Object: Object,
  RegExp: RegExp,
  String: String,
  isFinite: isFinite,
  isNaN: isNaN,
  parseFloat: parseFloat,
  parseInt: parseInt,
  undefined: void(0),
  MovieClip: AS2MovieClip,
  Stage: AS2Stage,
  Button: AS2Button,
  Rectangle: AS2Rectangle,
  Mouse: AS2Mouse
};
