/**
 * Copyright 2014 Mozilla Foundation
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
import flash.display.MovieClip;
import flash.events.Event;
import flash.geom.Rectangle;
import flash.geom.Transform;
import flash.media.Sound;
import flash.media.SoundMixer;
import flash.net.SharedObject;
import flash.net.URLLoader;
import flash.net.URLLoaderDataFormat;
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

[native(cls="AVM1Globals")]
public dynamic class AVM1Globals {
  // TODO: change this when entering a domain.
  public static var instance;
  public var _global;

  public var flash:Object;

  public function AVM1Globals() {
    AVM1Globals.instance = this;
    this._global = this;
  }

  public function $asfunction(link) {
    notImplemented('AVM1Globals.$asfunction');
  }

  public native function ASSetPropFlags(obj, children, flags, allowFalse);

  public function call(frame) {
    var nativeTarget = AVM1Utils.resolveTarget();
    nativeTarget._callFrame(frame);
  }
  public function chr(number) {
    return String.fromCharCode(number);
  }
  public var clearInterval:Function = flash.utils.clearInterval;
  public var clearTimeout:Function = flash.utils.clearTimeout;

  public function duplicateMovieClip(target, newname, depth) {
    var nativeTarget = AVM1Utils.resolveTarget(target);
    nativeTarget.duplicateMovieClip(newname, depth);
  }

  public var fscommand:Function = flash.system.fscommand;

  public native function escape(str: String): String;
  public native function unescape(str: String): String;

  public function getAS2Property(target, index) {
    var nativeTarget = AVM1Utils.resolveTarget(target);
    return nativeTarget[PropertiesIndexMap[index]];
  }

  public var getTimer:Function = flash.utils.getTimer;

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
    var nativeTarget = AVM1Utils.resolveTarget();
    if (arguments.length < 2) {
      _addToPendingScripts(nativeTarget, nativeTarget.gotoAndPlay, [arguments[0]]);
    } else {
      _addToPendingScripts(nativeTarget, nativeTarget.gotoAndPlay, [arguments[1], arguments[0]]); // scene and frame are swapped for AS3
    }
  }

  public function gotoAndStop(scene, frame) {
    var nativeTarget = AVM1Utils.resolveTarget();
    if (arguments.length < 2) {
      _addToPendingScripts(nativeTarget, nativeTarget.gotoAndStop, [arguments[0]]);
    } else {
      _addToPendingScripts(nativeTarget, nativeTarget.gotoAndStop, [arguments[1], arguments[0]]); // scene and frame are swapped for AS3
    }
  }

  public function gotoLabel(label) {
    var nativeTarget = AVM1Utils.resolveTarget();
    _addToPendingScripts(nativeTarget, function (subject, label) {
      subject._gotoLabel(label);
    }, [nativeTarget, label]);
  }

  public function ifFrameLoaded(scene, frame) {
    // ignoring scene parameter ?
    var nativeTarget = AVM1Utils.resolveTarget();
    var frameNum = arguments.length < 2 ? arguments[0] : arguments[1];
    var framesLoaded = nativeTarget._framesloaded;
    var totalFrames = nativeTarget._totalframes;
    // The (0-based) requested frame index is clamped to (the 1-based) totalFrames value.
    // I.e., asking if frame 20 is loaded in a timline with only 10 frames returns true if all
    // frames have been loaded.
    return Math.min(frameNum + 1, totalFrames) <= framesLoaded;
  }

  public function int(value: *): * {
    return value | 0;
  }

  public function length(expression: Object): Number {
    return ('' + expression).length; // ASCII Only?
  }

  public function loadMovie(url: String, target: Object, method: String): void {
    // some swfs are using loadMovie to call fscommmand
    if (url && url.toLowerCase().indexOf('fscommand:') === 0) {
      this.fscommand(url.substring('fscommand:'.length), target);
      return;
    }
    var levelStr: String;
    var loadLevel: Boolean = typeof target === 'string' && target.indexOf('_level') === 0 &&
                             int(levelStr = target.charAt(6)) == levelStr;
    var loader:Loader = new Loader();
    if (loadLevel) {
      _setLevel(int(levelStr), loader);
      var request: URLRequest = new URLRequest(url);
      if (method) {
        request.method = method;
      }
      loader.load(request);
    } else {
      var nativeTarget: flash.display.MovieClip = AVM1Utils.resolveTarget(target);
      nativeTarget.loadMovie(url, method);
    }
  }

  private native function _setLevel(level:uint, loader:Loader);

  public function loadMovieNum(url, level, method) {
    // some swfs are using loadMovieNum to call fscommmand
    if (url && url.toLowerCase().indexOf('fscommand:') === 0) {
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
  public function loadVariables(url: String, target: Object, method: String = ''): void {
    var nativeTarget = AVM1Utils.resolveTarget(target);
    var request = new URLRequest(url);
    if (method) {
      request.method = method;
    }
    var loader: URLLoader = new URLLoader(request);
    loader.dataFormat = URLLoaderDataFormat.VARIABLES;
    function completeHandler(event: Event): void {
      loader.removeEventListener(Event.COMPLETE, completeHandler);
      for (var key: String in loader.data) {
        nativeTarget[key] = loader.data[key];
      }
    }
    loader.addEventListener(Event.COMPLETE, completeHandler);
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
    var nativeTarget = AVM1Utils.resolveTarget();
    _addToPendingScripts(nativeTarget, nativeTarget.nextFrame);
  }
  public function nextScene() {
    var nativeTarget = AVM1Utils.resolveTarget();
    _addToPendingScripts(nativeTarget, nativeTarget.nextScene);
  }
  public function ord(character) {
    return ('' + character).charCodeAt(0); // ASCII only?
  }
  public function play() {
    var nativeTarget = AVM1Utils.resolveTarget();
    nativeTarget.play();
  }
  public function prevFrame() {
    var nativeTarget = AVM1Utils.resolveTarget();
    _addToPendingScripts(nativeTarget, nativeTarget.prevFrame);
  }
  public function prevScene() {
    var nativeTarget = AVM1Utils.resolveTarget();
    _addToPendingScripts(nativeTarget, nativeTarget.prevScene);
  }
  public function print(target, boundingBox) {
    // flash.printing.PrintJob
    notImplemented('AVM1Globals.print');
  }
  public function printAsBitmap(target, boundingBox) {
    notImplemented('AVM1Globals.printAsBitmap');
  }
  public function printAsBitmapNum(level, boundingBox) {
    notImplemented('AVM1Globals.printAsBitmapNum');
  }
  public function printNum(level, bondingBox) {
    notImplemented('AVM1Globals.printNum');
  }
  public function random(value) {
    return 0 | (Math.random() * (0 | value));
  }
  public function removeMovieClip(target) {
    var nativeTarget = AVM1Utils.resolveTarget(target);
    nativeTarget.removeMovieClip();
  }
  public function setInterval(): * {
    // AVM1 setInterval silently swallows everything that vaguely looks like an error.
    if (arguments.length < 2) {
      return undefined;
    }
    var args: Array = [];
    if (typeof arguments[0] === 'function') {
      args = arguments;
    } else {
      if (arguments.length < 3) {
        return undefined;
      }
      var obj: Object = arguments[0];
      var funName: * = arguments[1];
      if (!(obj && typeof obj === 'object' && typeof funName === 'string')) {
        return undefined;
      }
      args[0] = function (): void {
        obj[funName].apply(obj, arguments);
      };
      for (var i: uint = 2; i < arguments.length; i++) {
        args.push(arguments[i]);
      }
    }
    // Unconditionally coerce interval to int, as one would do.
    args[1] |= 0;
    return flash.utils.setInterval.apply(null, args);
  }
  public function setAS2Property(target, index, value) {
    var nativeTarget = AVM1Utils.resolveTarget(target);
    nativeTarget[PropertiesIndexMap[index]] = value;
  }
  public function setTimeout() {
    // AVM1 setTimeout silently swallows most things that vaguely look like errors.
    if (arguments.length < 2 || typeof arguments[0] !== 'function')
    {
      return undefined;
    }
    // Unconditionally coerce interval to int, as one would do.
    arguments[1] |= 0;
    return flash.utils.setTimeout.apply(null, arguments);
  }
  public function showRedrawRegions(enable, color) {
    // flash.profiler.showRedrawRegions.apply(null, arguments);
    notImplemented('AVM1Globals.showRedrawRegions');
  }
  public function startDrag(target, lock, left, top, right, bottom) {
    var nativeTarget = AVM1Utils.resolveTarget(target);
    nativeTarget.startDrag(lock, arguments.length < 3 ? null :
      new Rectangle(left, top, right - left, bottom - top));
  }
  public function stop() {
    var nativeTarget = AVM1Utils.resolveTarget();
    nativeTarget.stop();
  }
  public function stopAllSounds() {
    SoundMixer.stopAll();
  }
  public function stopDrag(target) {
    var nativeTarget = AVM1Utils.resolveTarget(target);
    nativeTarget.stopDrag();
  }
  public function substring(value, index, count) {
    return mbsubstring(value, index, count); // ASCII Only?
  }
  public function targetPath(target) {
    var nativeTarget = AVM1Utils.resolveTarget(target);
    return nativeTarget._target;
  }
  public function toggleHighQuality() {
    // flash.display.Stage.quality
    notImplemented('AVM1Globals.toggleHighQuality');
  }
  public native function trace(expression);

  public function unloadMovie(target) {
    var nativeTarget = AVM1Utils.resolveTarget(target);
    nativeTarget.unloadMovie();
  }
  public function unloadMovieNum(level) {
    var nativeTarget = AVM1Utils.resolveLevel(level);
    nativeTarget.unloadMovie();
  }
  public function updateAfterEvent() {
    // flash.events.TimerEvent.updateAfterEvent
    notImplemented('AVM1Globals.updateAfterEvent');
  }

  // built-ins
  public var NaN:Number = Number.NaN;
  public var Infinity:Number = Number.POSITIVE_INFINITY;

  [native("isFinite")]
  public native function isFinite(n:Number = void 0):Boolean;

  [native("isNaN")]
  public native function isNaN(n:Number = void 0):Boolean;

  [native("parseFloat")]
  public native function parseFloat(str:String = "NaN"):Number;

  [native("parseInt")]
  public native function parseInt(s:String = "NaN", radix = 0):Number;

  public var undefined:* = undefined;
  public var MovieClip:Class = AVM1MovieClip;
  public var AsBroadcaster:Class = AVM1Broadcaster;
  public var System:Class = AS2System;
  public var Stage:Class = AVM1Stage;
  public var Button:Class = AVM1Button;
  public var TextField:Class = AS2TextField;
  public var Color:Class = AVM1Color;
  public var Key:Class = AVM1Key;
  public var Mouse:Class = AVM1Mouse;
  public var MovieClipLoader:Class = AVM1MovieClipLoader;

  public var Sound:Class = AVM1Sound;
  public var SharedObject:Class = SharedObject;
  public var ContextMenu:Class = ContextMenu;
  public var ContextMenuItem:Class = ContextMenuItem;
  public var TextFormat:Class = TextFormat;

  private static native function _addInternalClasses(proto:Object):void;

  {
    // Initializing all global objects/classes
    var classes = [Object, Function, Array, Number, Math, Boolean, Date, RegExp, String];
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
