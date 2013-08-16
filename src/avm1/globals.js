/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*global AS2Context, avm2, flash, Stubs, Multiname, AS2MovieClip, AS2Object,
         AS2Broadcaster, AS2System, AS2Stage, AS2Button, AS2TextField, AS2Color,
         AS2Key, AS2Mouse, notImplemented */

function ASSetPropFlags(obj, children, flags, allowFalse) {
  // flags (from bit 0): dontenum, dontdelete, readonly, ....
  // TODO
}

function wrapAS2Class(container, className, fn) {
  function proxyForProperty(obj, name, target) {
    Object.defineProperty(obj, name, {
      get: function () { return this.asGetProperty(undefined, name, 0); },
      set: function (value) { this.asSetProperty(undefined, name, 0, value); },
      enumerable: true,
      configurable: true
    });
  }

  var internalAS2Properties, c, proto, i, j, desc;
  c = function () {
    return fn.apply(this, arguments);
  };
  c.name = className;
  c.debugName = 'avm1 ' + className;
  for (i in fn) {
    desc = Object.getOwnPropertyDescriptor(fn, i);
    if (!desc) {
      continue;
    }
    c.asDefineProperty(undefined, i, 0, desc);
    proxyForProperty(c, i);
  }
  internalAS2Properties = fn.$$internalAS2Properties;
  if (internalAS2Properties) {
    for (j = 0; j < internalAS2Properties.length; j++) {
      desc = Object.getOwnPropertyDescriptor(fn, internalAS2Properties[j]);
      Object.defineProperty(c, internalAS2Properties[j], desc);
    }
  }
  proto = c.asGetProperty(undefined, 'prototype', 0);
  for (i in fn.prototype) {
    desc = Object.getOwnPropertyDescriptor(fn.prototype, i);
    if (!desc) {
      continue;
    }
    proto.asDefineProperty(undefined, i, 0, desc);
    proxyForProperty(c.prototype, i);
  }
  internalAS2Properties = fn.prototype.$$internalAS2Properties;
  if (internalAS2Properties) {
    for (j = 0; j < internalAS2Properties.length; j++) {
      desc = Object.getOwnPropertyDescriptor(fn.prototype, internalAS2Properties[j]);
      Object.defineProperty(c.prototype, internalAS2Properties[j], desc);
    }
  }
  delete container[className];
  container[className] = c;
  return c;
}

function shadowAVM2Class(container, propertyName, avm2Class) {
  if (typeof avm2Class === 'string') {
    avm2Class = avm2.systemDomain.getClass(avm2Class);
  }
  delete container[propertyName];
  container[propertyName] = avm2Class;
  return avm2Class;
}


var PropertiesIndexMap = [
  '_x', '_y', '_xscale', '_yscale', '_currentframe', '_totalframes', '_alpha',
  '_visible', '_width', '_height', '_rotation', '_target', '_framesloaded',
  '_name', '_droptarget', '_url', '_highquality', '_focusrect',
  '_soundbuftime', '_quality', '_xmouse', '_ymouse'
];

function AS2Globals(context) {
}
AS2Globals.create = function (context) {
  var container = {};
  wrapAS2Class(container, 'AS2Globals', AS2Globals);
  AS2Globals.create = function (context) {
    var globals = new container.AS2Globals();
    globals.asSetProperty(undefined, '_global', 0, globals);
    return globals;
  };
  return AS2Globals.create(context);
};
AS2Globals.prototype = {
  $asfunction: function(link) {
    notImplemented('AS2Globals.$asfunction');
  },
  ASSetPropFlags: ASSetPropFlags,
  call: function(frame) {
    var nativeTarget = AS2Context.instance.resolveTarget();
    nativeTarget.$nativeObject._as2CallFrame(frame);
  },
  chr: function(number) {
    return String.fromCharCode(number);
  },
  clearInterval: function () {
    var clearTimeout = avm2.applicationDomain.getProperty(
      Multiname.fromSimpleName('flash.utils.clearInterval'), true, true);
    clearInterval.apply(null, arguments);
  },
  clearTimeout: function () {
    var clearTimeout = avm2.applicationDomain.getProperty(
      Multiname.fromSimpleName('flash.utils.clearTimeout'), true, true);
    clearTimeout.apply(null, arguments);
  },
  duplicateMovieClip: function(target, newname, depth) {
    var nativeTarget = AS2Context.instance.resolveTarget(target);
    nativeTarget.duplicateMovieClip(newname, depth);
  },
  fscommand: function (command, parameters) {
    var fscommand = avm2.applicationDomain.getProperty(
      Multiname.fromSimpleName('flash.system.fscommand'), true, true);
    fscommand.apply(null, arguments);
  },
  getAS2Property: function(target, index) {
    var nativeTarget = AS2Context.instance.resolveTarget(target);
    return nativeTarget.asGetProperty(undefined, PropertiesIndexMap[index], 0);
  },
  getTimer: function() {
    var getTimer = avm2.applicationDomain.getProperty(
      Multiname.fromSimpleName('flash.utils.getTimer'), true, true);
    return getTimer();
  },
  getURL: function(url, target, method) {
    var request = new flash.net.URLRequest(url);
    if (method) {
      request.method = method;
    }
    var navigateToURL = avm2.applicationDomain.getProperty(
      Multiname.fromSimpleName('flash.net.navigateToURL'), true, true);
    navigateToURL(request, target);
  },
  getVersion: function() {
    return flash.system.Capabilities.version;
  },
  gotoAndPlay: function() {
    var nativeTarget = AS2Context.instance.resolveTarget();
    if (arguments.length < 2) {
      nativeTarget.gotoAndPlay(arguments[0]);
      AS2Context.instance.addToPendingScripts(nativeTarget.gotoAndPlay.bind(nativeTarget, arguments[0]));
    } else {
      AS2Context.instance.addToPendingScripts(nativeTarget.gotoAndPlay.bind(nativeTarget, arguments[1], arguments[0])); // scene and frame are swapped for AS3
    }
  },
  gotoAndStop: function(scene, frame) {
    var nativeTarget = AS2Context.instance.resolveTarget();
    if (arguments.length < 2) {
      AS2Context.instance.addToPendingScripts(nativeTarget.gotoAndStop.bind(nativeTarget, arguments[0]));
    } else {
      AS2Context.instance.addToPendingScripts(nativeTarget.gotoAndStop.bind(nativeTarget, arguments[1], arguments[0])); // scene and frame are swapped for AS3
    }
  },
  gotoLabel: function(label) {
    var nativeObject = AS2Context.instance.resolveTarget().$nativeObject;
    AS2Context.instance.addToPendingScripts(nativeObject.gotoLabel.bind(nativeObject, label));
  },
  ifFrameLoaded: function(scene, frame) {
    // ignoring scene parameter ?
    var nativeTarget = AS2Context.instance.resolveTarget();
    var frameNum = arguments.length < 2 ? arguments[0] : arguments[1];
    var framesLoaded = nativeTarget._framesloaded;
    return frameNum < framesLoaded;
  },
  int: function(value) {
    return 0 | value;
  },
  length: function(expression) {
    return ('' + expression).length; // ASCII Only?
  },
  loadMovie: function(url, target, method) {
    var nativeTarget = AS2Context.instance.resolveTarget(target);
    // some swfs are using loadMovie to call fscommmand
    if (/^fscommand:/i.test(url)) {
      return this.fscommand(url.substring('fscommand:'.length), target);
    }
    // flash.display.Loader, flash.net.URLLoader
    notImplemented('AS2Globals.loadMovie');
  },
  loadMovieNum: function(url, level, method) {
    var nativeTarget = AS2Context.instance.resolveLevel(level);
    // some swfs are using loadMovieNum to call fscommmand
    if (/^fscommand:/i.test(url)) {
      return this.fscommand(url.substring('fscommand:'.length));
    }
    // flash.display.Loader, flash.net.URLLoader
    notImplemented('AS2Globals.loadMovieNum');
  },
  loadVariables: function(url, target, method) {
    var nativeTarget = AS2Context.instance.resolveTarget(target);
    // flash.display.Loader, flash.net.URLLoader
    notImplemented('AS2Globals.loadVariables');
  },
  loadVariablesNum: function(url, level, method) {
    var nativeTarget = AS2Context.instance.resolveLevel(level);
    // flash.display.Loader, flash.net.URLLoader
    notImplemented('AS2Globals.loadVariablesNum');
  },
  mbchr: function(number) {
    return String.fromCharCode.charCodeAt(number);
  },
  mblength: function(expression) {
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
    AS2Context.instance.addToPendingScripts(nativeTarget.nextFrame.bind(nativeTarget));
  },
  nextScene: function() {
    var nativeTarget = AS2Context.instance.resolveTarget();
    nativeTarget.nextScene();
  },
  ord: function(character) {
    return ('' + character).charCodeAt(0); // ASCII only?
  },
  play: function() {
    var nativeTarget = AS2Context.instance.resolveTarget();
    nativeTarget.play();
  },
  prevFrame: function() {
    var nativeTarget = AS2Context.instance.resolveTarget();
    AS2Context.instance.addToPendingScripts(nativeTarget.prevFrame.bind(nativeTarget));
  },
  prevScene: function() {
    var nativeTarget = AS2Context.instance.resolveTarget();
    nativeTarget.prevScene();
  },
  print: function(target, boundingBox) {
    // flash.printing.PrintJob
    notImplemented('AS2Globals.print');
  },
  printAsBitmap: function(target, boundingBox) {
    notImplemented('AS2Globals.printAsBitmap');
  },
  printAsBitmapNum: function(level, boundingBox) {
    notImplemented('AS2Globals.printAsBitmapNum');
  },
  printNum: function(level, bondingBox) {
    notImplemented('AS2Globals.printNum');
  },
  random: function(value) {
    return 0 | (Math.random() * (0 | value));
  },
  removeMovieClip: function(target) {
    var nativeTarget = AS2Context.instance.resolveTarget();
    var nativeTarget2 = AS2Context.instance.resolveTarget(target);
    nativeTarget.removeChild(nativeTarget2);
  },
  setInterval: function () {
    var setInterval = avm2.applicationDomain.getProperty(
      Multiname.fromSimpleName('flash.utils.setInterval'), true, true);
    var args = Array.prototype.slice.call(arguments);
    if (typeof args[0] !== 'function') {
      var obj = args.shift();
      var name = args.shift();
      args.unshift(function () {
        obj[name].apply(obj, arguments);
      });
    }
    return setInterval.apply(null, args);
  },
  setAS2Property: function(target, index, value) {
    var nativeTarget = AS2Context.instance.resolveTarget(target);
    nativeTarget.asSetProperty(undefined, PropertiesIndexMap[index], 0, value);
  },
  setTimeout: function () {
    var setTimeout = avm2.applicationDomain.getProperty(
      Multiname.fromSimpleName('flash.utils.setTimeout'), true, true);
    var args = Array.prototype.slice.call(arguments);
    if (typeof args[0] !== 'function') {
      var obj = args.shift();
      var name = args.shift();
      args.unshift(function () {
        obj[name].apply(obj, arguments);
      });
    }
    return setTimeout.apply(null, args);
  },
  showRedrawRegions: function(enable, color) {
    // flash.profiler.showRedrawRegions.apply(null, arguments);
    notImplemented('AS2Globals.showRedrawRegions');
  },
  startDrag: function(target, lock, left, top, right, bottom) {
    var nativeTarget = AS2Context.instance.resolveTarget(target);
    nativeTarget.startDrag(lock, arguments.length < 3 ? null :
      new flash.geom.Rectangle(left, top, right - left, bottom - top));
  },
  stop: function() {
    var nativeTarget = AS2Context.instance.resolveTarget();
    nativeTarget.stop();
  },
  stopAllSounds: function() {
    var soundMixerClass = avm2.systemDomain.getClass("flash.media.SoundMixer");
    soundMixerClass.native.static.stopAll();
  },
  stopDrag: function(target) {
    var nativeTarget = AS2Context.instance.resolveTarget(target);
    nativeTarget.stopDrag();
  },
  substring: function(value, index, count) {
    return this.mbsubstring(value, index, count); // ASCII Only?
  },
  targetPath: function(target) {
    var nativeTarget = AS2Context.instance.resolveTarget(target);
    return nativeTarget._target;
  },
  toggleHighQuality: function() {
    // flash.display.Stage.quality
    notImplemented('AS2Globals.toggleHighQuality');
  },
  trace: function(expression) {
    var trace = avm2.applicationDomain.getProperty(
      Multiname.fromSimpleName('trace'), true, true);
    trace(expression);
  },
  unloadMovie: function(target) {
    var nativeTarget = AS2Context.instance.resolveTarget(target);
    nativeTarget.unloadMovie();
  },
  unloadMovieNum: function(level) {
    var nativeTarget = AS2Context.instance.resolveLevel(level);
    nativeTarget.unloadMovie();
  },
  updateAfterEvent: function() {
    // flash.events.TimerEvent.updateAfterEvent
    notImplemented('AS2Globals.updateAfterEvent');
  },
  // built-ins
  get Boolean() { return shadowAVM2Class(AS2Globals.prototype, 'Boolean', Stubs.Boolean); },
  get Date() { return shadowAVM2Class(AS2Globals.prototype, 'Date', Stubs.Date); },
  get Function() { return shadowAVM2Class(AS2Globals.prototype, 'Function', Stubs.Function); },
  get Math() { return shadowAVM2Class(AS2Globals.prototype, 'Math', 'Math'); },
  get Number() { return shadowAVM2Class(AS2Globals.prototype, 'Number', Stubs.Number); },
  NaN: NaN,
  'Infinity': Infinity,
  get Object() {
    var c = shadowAVM2Class(AS2Globals.prototype, 'Object', Stubs.Object);
    AS2Object.$install(c);
    return c;
  },
  get Array() { return shadowAVM2Class(AS2Globals.prototype, 'Array', Stubs.Array); },
  get RegExp() { return shadowAVM2Class(AS2Globals.prototype, 'RegExp', Stubs.RegExp); },
  get String() { return shadowAVM2Class(AS2Globals.prototype, 'String', Stubs.String); },
  isFinite: isFinite,
  isNaN: isNaN,
  parseFloat: parseFloat,
  parseInt: parseInt,
  undefined: void(0),
  get MovieClip() { return wrapAS2Class(AS2Globals.prototype, 'MovieClip', AS2MovieClip); },
  get AsBroadcaster() { return wrapAS2Class(AS2Globals.prototype, 'AsBroadcaster', AS2Broadcaster); },
  get System() { return wrapAS2Class(AS2Globals.prototype, 'System', AS2System); },
  get Stage() { return wrapAS2Class(AS2Globals.prototype, 'Stage', AS2Stage); },
  get Button() { return wrapAS2Class(AS2Globals.prototype, 'Button', AS2Button); },
  get TextField() { return wrapAS2Class(AS2Globals.prototype, 'TextField', AS2TextField); },
  get Color() { return wrapAS2Class(AS2Globals.prototype, 'Color', AS2Color); },
  get Key() { return wrapAS2Class(AS2Globals.prototype, 'Key', AS2Key); },
  get Mouse() { return wrapAS2Class(AS2Globals.prototype, 'Mouse', AS2Mouse); },
  // lazy initialized built-ins
  get Sound() { return shadowAVM2Class(AS2Globals.prototype, 'Sound', flash.media.Sound); },
  get SharedObject() { return shadowAVM2Class(AS2Globals.prototype, 'SharedObject', 'flash.net.SharedObject'); },
  get ContextMenu() { return shadowAVM2Class(AS2Globals.prototype, 'ContextMenu', flash.ui.ContextMenu); },
  get ContextMenuItem() { return shadowAVM2Class(AS2Globals.prototype, 'ContextMenuItem', flash.ui.ContextMenuItem); },
  get ColorTransform() { return shadowAVM2Class(AS2Globals.prototype, 'ColorTransform', flash.geom.ColorTransform); },
  get Point() { return shadowAVM2Class(AS2Globals.prototype, 'Point', flash.geom.Point); },
  get Rectange() { return shadowAVM2Class(AS2Globals.prototype, 'Rectangle', flash.geom.Rectangle); },
  get TextFormat() { return shadowAVM2Class(AS2Globals.prototype, 'TextFormat', flash.text.TextFormat); }
};

// exports for testing
if (typeof GLOBAL !== 'undefined') {
  GLOBAL.AS2Globals = AS2Globals;
}
