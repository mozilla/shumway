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
package avm1lib {
import flash.display.Loader;
import flash.external.ExternalInterface;
import flash.geom.ColorTransform;
import flash.geom.Rectangle;
import flash.media.Sound;
import flash.media.SoundMixer;
import flash.net.SharedObject;
import flash.net.URLRequest;
import flash.net.navigateToURL;
import flash.system.Capabilities;
import flash.system.fscommand;
import flash.text.TextFormat;
import flash.ui.ContextMenu;
import flash.ui.ContextMenuItem;
import flash.utils.clearInterval;
import flash.utils.clearTimeout;
import flash.utils.getTimer;

[native(cls="AS2Globals")]
public dynamic class AS2Globals {
  public var _global;

  public var flash:Object;

  public function AS2Globals() {
    this._global = this;
    this.flash = createFlashObject();
  }

  private function createFlashObject():Object {
    return {
      _MovieClip: AS2MovieClip,
      display: {},
      external: {
        ExternalInterface: ExternalInterface
      },
      filters: {},
      geom: {},
      text: {}
    };
  }

  public function $asfunction(link) {
    notImplemented('AS2Globals.$asfunction');
  }

  public native function ASSetPropFlags(obj, children, flags, allowFalse);

  public function call(frame) {
    var nativeTarget = AS2Utils.resolveTarget();
    nativeTarget._callFrame(frame);
  }
  public function chr(number) {
    return String.fromCharCode(number);
  }
  public var clearInterval:Function = clearInterval;
  public var clearTimeout:Function = clearTimeout;

  public function duplicateMovieClip(target, newname, depth) {
    var nativeTarget = AS2Utils.resolveTarget(target);
    nativeTarget.duplicateMovieClip(newname, depth);
  }

  public var fscommand:Function = fscommand;

  public function getAS2Property(target, index) {
    var nativeTarget = AS2Utils.resolveTarget(target);
    return nativeTarget[PropertiesIndexMap[index]];
  }

  public var getTimer:Function = getTimer;

  public function getURL(url, target, method) {
    var request = new URLRequest(url);
    if (method) {
      request.method = method;
    }
    if (typeof target === 'string' && target.indexOf('_level') === 0) {
      loadMovieNum(url, +target.substr(6), method);
      return;
    }
    navigateToURL(request, target);
  }

  public function getVersion() {
    return Capabilities.version;
  }

  private native function _addToPendingScripts(subject:Object, fn:Function, args:Array = null);

  public function gotoAndPlay(scene, frame) {
    var nativeTarget = AS2Utils.resolveTarget();
    if (arguments.length < 2) {
      _addToPendingScripts(nativeTarget, nativeTarget.gotoAndPlay, [arguments[0]]);
    } else {
      _addToPendingScripts(nativeTarget, nativeTarget.gotoAndPlay, [arguments[1], arguments[0]]); // scene and frame are swapped for AS3
    }
  }

  public function gotoAndStop(scene, frame) {
    var nativeTarget = AS2Utils.resolveTarget();
    if (arguments.length < 2) {
      _addToPendingScripts(nativeTarget, nativeTarget.gotoAndStop, [arguments[0]]);
    } else {
      _addToPendingScripts(nativeTarget, nativeTarget.gotoAndStop, [arguments[1], arguments[0]]); // scene and frame are swapped for AS3
    }
  }

  public function gotoLabel(label) {
    var nativeTarget = AS2Utils.resolveTarget();
    _addToPendingScripts(nativeTarget, function (subject, label) {
      subject._gotoLabel(label);
    }, [nativeTarget, label]);
  }

  public function ifFrameLoaded(scene, frame) {
    // ignoring scene parameter ?
    var nativeTarget = AS2Utils.resolveTarget();
    var frameNum = arguments.length < 2 ? arguments[0] : arguments[1];
    var framesLoaded = nativeTarget._framesloaded;
    return frameNum < framesLoaded;
  }

  public function int(value) {
    return 0 | value;
  }

  public function length(expression) {
    return ('' + expression).length; // ASCII Only?
  }

  public function loadMovie(url, target, method) {
    // some swfs are using loadMovie to call fscommmand
    if (/^fscommand:/i.test(url)) {
      return this.fscommand(url.substring('fscommand:'.length), target);
    }
    var nativeTarget = AS2Utils.resolveTarget(target);
    nativeTarget.loadMovie(url, method);
  }

  private native function _setLevel(level:uint, loader:Loader);

  public function loadMovieNum(url, level, method) {
    // some swfs are using loadMovieNum to call fscommmand
    if (/^fscommand:/i.test(url)) {
      return this.fscommand(url.substring('fscommand:'.length));
    }

    var loader:Loader = new Loader();
    _setLevel(level, loader);
    var request = new URLRequest(url);
    if (method) {
      request.method = method;
    }
    loader.load(request);
  }
  public function loadVariables(url, target, method) {
    var nativeTarget = AS2Utils.resolveTarget(target);
    // flash.display.Loader, flash.net.URLLoader
    notImplemented('AS2Globals.loadVariables');
  }
  public function loadVariablesNum(url, level, method) {
    var nativeTarget = AS2Utils.resolveLevel(level);
    // flash.display.Loader, flash.net.URLLoader
    notImplemented('AS2Globals.loadVariablesNum');
  }
  public function mbchr(number) {
    return String.fromCharCode(number);
  }
  public function mblength(expression) {
    return ('' + expression).length;
  }
  public function mbord(character) {
    return ('' + character).charCodeAt(0);
  }
  public function mbsubstring(value, index, count) {
    if (index !== (0 | index) || count !== (0 | count)) {
      // index or count are not integers, the result is the empty string.
      return '';
    }
    return ('' + value).substr(index, count);
  }
  public function nextFrame() {
    var nativeTarget = AS2Utils.resolveTarget();
    _addToPendingScripts(nativeTarget, nativeTarget.nextFrame);
  }
  public function nextScene() {
    var nativeTarget = AS2Utils.resolveTarget();
    nativeTarget.nextScene();
  }
  public function ord(character) {
    return ('' + character).charCodeAt(0); // ASCII only?
  }
  public function play() {
    var nativeTarget = AS2Utils.resolveTarget();
    nativeTarget.play();
  }
  public function prevFrame() {
    var nativeTarget = AS2Utils.resolveTarget();
    _addToPendingScripts(nativeTarget, nativeTarget.prevFrame);
  }
  public function prevScene() {
    var nativeTarget = AS2Utils.resolveTarget();
    nativeTarget.prevScene();
  }
  public function print(target, boundingBox) {
    // flash.printing.PrintJob
    notImplemented('AS2Globals.print');
  }
  public function printAsBitmap(target, boundingBox) {
    notImplemented('AS2Globals.printAsBitmap');
  }
  public function printAsBitmapNum(level, boundingBox) {
    notImplemented('AS2Globals.printAsBitmapNum');
  }
  public function printNum(level, bondingBox) {
    notImplemented('AS2Globals.printNum');
  }
  public function random(value) {
    return 0 | (Math.random() * (0 | value));
  }
  public function removeMovieClip(target) {
    var nativeTarget = AS2Utils.resolveTarget(target);
    nativeTarget.removeMovieClip();
  }
  public function setInterval() {
    var setInterval = flash.utils.setInterval;
    var args = Array.prototype.slice.call(arguments);
    if (typeof args[0] !== 'function') {
      var obj = args.shift();
      var name = args.shift();
      args.unshift(function () {
        obj[name].apply(obj, arguments);
      });
    }
    return setInterval.apply(null, args);
  }
  public function setAS2Property(target, index, value) {
    var nativeTarget = AS2Utils.resolveTarget(target);
    nativeTarget[PropertiesIndexMap[index]] = value;
  }
  public function setTimeout() {
    var setTimeout = flash.utils.setTimeout;
    var args = Array.prototype.slice.call(arguments);
    if (typeof args[0] !== 'function') {
      var obj = args.shift();
      var name = args.shift();
      args.unshift(function () {
        obj[name].apply(obj, arguments);
      });
    }
    return setTimeout.apply(null, args);
  }
  public function showRedrawRegions(enable, color) {
    // flash.profiler.showRedrawRegions.apply(null, arguments);
    notImplemented('AS2Globals.showRedrawRegions');
  }
  public function startDrag(target, lock, left, top, right, bottom) {
    var nativeTarget = AS2Utils.resolveTarget(target);
    nativeTarget.startDrag(lock, arguments.length < 3 ? null :
      new flash.geom.Rectangle(left, top, right - left, bottom - top));
  }
  public function stop() {
    var nativeTarget = AS2Utils.resolveTarget();
    nativeTarget.stop();
  }
  public function stopAllSounds() {
    SoundMixer.stopAll();
  }
  public function stopDrag(target) {
    var nativeTarget = AS2Utils.resolveTarget(target);
    nativeTarget.stopDrag();
  }
  public function substring(value, index, count) {
    return mbsubstring(value, index, count); // ASCII Only?
  }
  public function targetPath(target) {
    var nativeTarget = AS2Utils.resolveTarget(target);
    return nativeTarget._target;
  }
  public function toggleHighQuality() {
    // flash.display.Stage.quality
    notImplemented('AS2Globals.toggleHighQuality');
  }
  public native function trace(expression);

  public function unloadMovie(target) {
    var nativeTarget = AS2Utils.resolveTarget(target);
    nativeTarget.unloadMovie();
  }
  public function unloadMovieNum(level) {
    var nativeTarget = AS2Utils.resolveLevel(level);
    nativeTarget.unloadMovie();
  }
  public function updateAfterEvent() {
    // flash.events.TimerEvent.updateAfterEvent
    notImplemented('AS2Globals.updateAfterEvent');
  }

  // built-ins
  public var NaN:Number = NaN;
  public var Infinity:Number = Infinity;
  public var isFinite:Function = isFinite;
  public var isNaN:Function = isNaN;
  public var parseFloat:Function = parseFloat;
  public var parseInt:Function = parseInt;
  public var undefined:* = undefined;
  public var MovieClip:Class = AS2MovieClip;
  public var AsBroadcaster:Class = AS2Broadcaster;
  public var System:Class = AS2System;
  public var Stage:Class = AS2Stage;
  public var Button:Class = AS2Button;
  public var TextField:Class = AS2TextField;
  public var Color:Class = AS2Color;
  public var Key:Class = AS2Key;
  public var Mouse:Class = AS2Mouse;
  public var MovieClipLoader:Class = AS2MovieClipLoader;

  public var Sound:Class = Sound;
  public var SharedObject:Class = SharedObject;
  public var ContextMenu:Class = ContextMenu;
  public var ContextMenuItem:Class = ContextMenuItem;
  public var ColorTransform:Class = ColorTransform;
  public var Point:Class = flash.geom.Point;
  public var Rectangle:Class = Rectangle;
  public var TextFormat:Class = TextFormat;

  private static native function _addInternalClasses(proto:Object):void;

  {
    _addInternalClasses(prototype);
  }
}
}

var PropertiesIndexMap:Array = [
  '_x', '_y', '_xscale', '_yscale', '_currentframe', '_totalframes', '_alpha',
  '_visible', '_width', '_height', '_rotation', '_target', '_framesloaded',
  '_name', '_droptarget', '_url', '_highquality', '_focusrect',
  '_soundbuftime', '_quality', '_xmouse', '_ymouse'
];
