/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

///<reference path='../references.ts' />

module Shumway.AVM1.Lib {
  import notImplemented = Shumway.Debug.notImplemented;
  import assert = Shumway.Debug.assert;
  import flash = Shumway.AVM2.AS.flash;
  import ASObject = Shumway.AVM2.AS.ASObject;
  import ASFunction = Shumway.AVM2.AS.ASFunction;

  export class AVM1Globals {
    static createAVM1Class(): typeof AVM1Globals {
      return wrapAVM1Class(AVM1Globals,
        [],
        ['_global', 'flash', 'ASSetPropFlags', 'call', 'chr', 'clearInterval', 'clearTimeout',
          'duplicateMovieClip', 'fscommand', 'escape', 'unescape', 'getTimer', 'getURL',
          'getVersion', 'gotoAndPlay', 'gotoAndStop', 'ifFrameLoaded', 'int', 'length=>length_',
          'loadMovie', 'loadMovieNum', 'loadVariables', 'mbchr', 'mblength', 'mbord',
          'mbsubstring', 'nextFrame', 'nextScene', 'ord', 'play', 'prevFrame', 'prevScene',
          'print', 'printAsBitmap', 'printAsBitmapNum', 'printNum', 'random',
          'removeMovieClip', 'setInterval', 'setTimeout', 'showRedrawRegions',
          'startDrag', 'stop', 'stopDrag', 'substring', 'targetPath', 'toggleHighQuality',
          'trace', 'unloadMovie', 'unloadMovieNum', 'updateAfterEvent',
          'NaN', 'Infinity', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'undefined',
          'Object', 'Function','Array', 'Number', 'Math', 'Boolean', 'Date', 'RegExp', 'String',
          'MovieClip', 'AsBroadcaster', 'System', 'Stage', 'Button',
          'TextField', 'Color', 'Key', 'Mouse', 'MovieClipLoader',
          'Sound', 'SharedObject', 'ContextMenu', 'ContextMenuItem', 'TextFormat',
          'toString','$asfunction=>asfunction']);
    }

    // TODO: change this when entering a domain.
    public static instance: AVM1Globals;

    public _global: AVM1Globals;
    public flash;

    constructor(swfVersion: number) {
      AVM1Globals.instance = this;
      this._global = this;

      // Initializing all global objects/classes
      var classes = ['Object', 'Function', 'Array', 'Number', 'Math', 'Boolean', 'Date', 'RegExp', 'String'];
      classes.forEach(function (className) {
        Shumway.AVM2.Runtime.AVM2.instance.systemDomain.getClass(className);
      });

      if (swfVersion >= 8) {
        this._initializeFlashObject();
      }

      this.AsBroadcaster.initialize(this.Stage);
    }

    public asfunction(link) {
      notImplemented('AVM1Globals.$asfunction');
    }

    public ASSetPropFlags(obj: any, children: any, flags: any, allowFalse: any): any {
      // flags (from bit 0): dontenum, dontdelete, readonly, ....
      // TODO
    }

    public call(frame) {
      var nativeTarget = AVM1Utils.resolveTarget<AVM1MovieClip>();
      nativeTarget._callFrame(frame);
    }

    public chr(number) {
      return String.fromCharCode(number);
    }

    public clearInterval(id: number /* uint */): void {
      flash.utils.SetIntervalTimer._clearInterval(id);
    }

    public clearTimeout(id: number /* uint */): void {
      flash.utils.SetIntervalTimer._clearInterval(id);
    }

    public duplicateMovieClip(target, newname, depth) {
      var nativeTarget = AVM1Utils.resolveTarget<AVM1MovieClip>(target);
      nativeTarget.duplicateMovieClip(newname, depth, null);
    }

    public fscommand = flash.system.FSCommand._fscommand;

    public getAVM1Property(target, index) {
      var nativeTarget = AVM1Utils.resolveTarget(target);
      return nativeTarget[PropertiesIndexMap[index]];
    }

    public getTimer(): number {
      return Date.now() - flash.display.Loader.runtimeStartTime;
    }

    public getURL(url, target?, method?) {
      var request = new flash.net.URLRequest(String(url));
      if (method) {
        request.method = method;
      }
      if (typeof target === 'string' && target.indexOf('_level') === 0) {
        this.loadMovieNum(url, +target.substr(6), method);
        return;
      }
      flash.net.navigateToURL(request, target);
    }

    public getVersion() {
      return flash.system.Capabilities.version;
    }

    _addToPendingScripts(subject: any, fn: Function, args: any [] = null): any {
      release || assert(fn, 'invalid function in _addToPendingScripts');
      AVM1Context.instance.addToPendingScripts(function () {
        try {
          (<Function><any> fn).apply(subject, args);
        } catch (ex) {
          console.error('AVM1 pending script error: ' + ex.message);
        }
      });
    }


    /**
     * AVM1 escapes slightly more characters than JS's encodeURIComponent, and even more than
     * the deprecated JS version of escape. That leaves no other option but to do manual post-
     * processing of the encoded result. :/
     *
     * Luckily, unescape isn't thus afflicted - it happily unescapes all the additional things
     * we escape here.
     */
    public escape(str: string): string {
      var result = encodeURIComponent(str);
      return result.replace(/!|'|\(|\)|\*|-|\.|_|~/g, function(char: string): string {
        switch (char) {
          case '*':
            return '%2A';
          case '-':
            return '%2D';
          case '.':
            return '%2E';
          case '_':
            return '%5F';
          default:
            return globalEscape(char);
        }
      });
    }

    public unescape(str: string): string {
      return decodeURIComponent(str);
    }

    public gotoAndPlay(scene, frame?) {
      var nativeTarget = AVM1Utils.resolveTarget<AVM1MovieClip>();
      if (arguments.length < 2) {
        this._addToPendingScripts(nativeTarget, nativeTarget.gotoAndPlay, [arguments[0]]);
      } else {
        this._addToPendingScripts(nativeTarget, nativeTarget.gotoAndPlay, [arguments[1], arguments[0]]); // scene and frame are swapped for AS3
      }
    }

    public gotoAndStop(scene, frame?) {
      var nativeTarget = AVM1Utils.resolveTarget<AVM1MovieClip>();
      if (arguments.length < 2) {
        this._addToPendingScripts(nativeTarget, nativeTarget.gotoAndStop, [arguments[0]]);
      } else {
        this._addToPendingScripts(nativeTarget, nativeTarget.gotoAndStop, [arguments[1], arguments[0]]); // scene and frame are swapped for AS3
      }
    }

    public ifFrameLoaded(scene, frame?) {
      // ignoring scene parameter ?
      var nativeTarget = AVM1Utils.resolveTarget<AVM1MovieClip>();
      var frameNum = arguments.length < 2 ? arguments[0] : arguments[1];
      var framesLoaded = nativeTarget._framesloaded;
      var totalFrames = nativeTarget._totalframes;
      // The (0-based) requested frame index is clamped to (the 1-based) totalFrames value.
      // I.e., asking if frame 20 is loaded in a timline with only 10 frames returns true if all
      // frames have been loaded.
      return Math.min(frameNum + 1, totalFrames) <= framesLoaded;
    }

    public int(value: any): number {
      return value | 0;
    }

    public length_(expression): number {
      return ('' + expression).length; // ASCII Only?
    }

    public loadMovie(url: string, target: any, method: string): void {
      // some swfs are using loadMovie to call fscommmand
      if (url && url.toLowerCase().indexOf('fscommand:') === 0) {
        this.fscommand(url.substring('fscommand:'.length), target);
        return;
      }
      var loadLevel: boolean = typeof target === 'string' &&
                               target.indexOf('_level') === 0;
      var levelNumber: number;
      if (loadLevel) {
        var levelStr: string = target.charAt(6);
        levelNumber = parseInt(levelStr, 10);
        loadLevel = levelNumber.toString() === levelStr;
      }
      var loader: flash.display.Loader = new flash.display.Loader();
      if (loadLevel) {
        this._setLevel(levelNumber, loader);
        var request: flash.net.URLRequest = new flash.net.URLRequest(url);
        if (method) {
          request.method = method;
        }
        loader.load(request);
      } else {
        var nativeTarget = AVM1Utils.resolveTarget<AVM1MovieClip>(target);
        nativeTarget.loadMovie(url, method);
      }
    }

    _setLevel(level: number /*uint*/, loader: flash.display.Loader): any {
      level = level >>> 0;
      // TODO: re-enable support for loading AVM1 content into levels. See bug 1035166.
      //AVM1Context.instance.stage._as2SetLevel(level, loader);
    }

    public loadMovieNum(url, level, method) {
      // some swfs are using loadMovieNum to call fscommmand
      if (url && url.toLowerCase().indexOf('fscommand:') === 0) {
        return this.fscommand(url.substring('fscommand:'.length));
      }

      var loader: flash.display.Loader = new flash.display.Loader();
      this._setLevel(level, loader);
      var request = new flash.net.URLRequest(url);
      if (method) {
        request.method = method;
      }
      loader.load(request);
    }

    public loadVariables(url: string, target: any, method: string = ''): void {
      var nativeTarget = AVM1Utils.resolveTarget(target);
      var request = new flash.net.URLRequest(url);
      if (method) {
        request.method = method;
      }
      var loader: flash.net.URLLoader = new flash.net.URLLoader(request);
      loader.dataFormat = flash.net.URLLoaderDataFormat.VARIABLES;
      function completeHandler(event: flash.events.Event): void {
        loader.removeEventListener(flash.events.Event.COMPLETE, completeHandler);
        for (var key in loader.data) {
          nativeTarget[key] = loader.data[key];
        }
      }
      loader.addEventListener(flash.events.Event.COMPLETE, completeHandler);
    }

    public mbchr(number) {
      return String.fromCharCode(number);
    }

    public mblength(expression) {
      return ('' + expression).length;
    }

    public mbord(character) {
      return ('' + character).charCodeAt(0);
    }

    public mbsubstring(value, index, count) {
      if (index !== (0 | index) || count !== (0 | count)) {
        // index or count are not integers, the result is the empty string.
        return '';
      }
      return ('' + value).substr(index, count);
    }

    public nextFrame() {
      var nativeTarget = AVM1Utils.resolveTarget<AVM1MovieClip>();
      this._addToPendingScripts(nativeTarget, nativeTarget.nextFrame);
    }

    public nextScene() {
      var nativeTarget = AVM1Utils.resolveTarget<AVM1MovieClip>();
      this._addToPendingScripts(nativeTarget, nativeTarget.nextScene);
    }

    public ord(character) {
      return ('' + character).charCodeAt(0); // ASCII only?
    }

    public play() {
      var nativeTarget = AVM1Utils.resolveTarget<AVM1MovieClip>();
      nativeTarget.play();
    }

    public prevFrame() {
      var nativeTarget = AVM1Utils.resolveTarget<AVM1MovieClip>();
      this._addToPendingScripts(nativeTarget, nativeTarget.prevFrame);
    }

    public prevScene() {
      var nativeTarget = AVM1Utils.resolveTarget<AVM1MovieClip>();
      this._addToPendingScripts(nativeTarget, nativeTarget.prevScene);
    }

    public print(target, boundingBox) {
      // flash.printing.PrintJob
      notImplemented('AVM1Globals.print');
    }

    public printAsBitmap(target, boundingBox) {
      notImplemented('AVM1Globals.printAsBitmap');
    }

    public printAsBitmapNum(level, boundingBox) {
      notImplemented('AVM1Globals.printAsBitmapNum');
    }

    public printNum(level, bondingBox) {
      notImplemented('AVM1Globals.printNum');
    }

    public random(value) {
      return 0 | (Math.random() * (0 | value));
    }

    public removeMovieClip(target) {
      var nativeTarget = AVM1Utils.resolveTarget<AVM1MovieClip>(target);
      nativeTarget.removeMovieClip();
    }

    private _setInterval(closure: Function, delay: number, ... args): number /* uint */ {
      return new flash.utils.SetIntervalTimer(closure, delay, true, args).reference;
    }

    public setInterval(): any {
      // AVM1 setInterval silently swallows everything that vaguely looks like an error.
      if (arguments.length < 2) {
        return undefined;
      }
      var args: any[] = [];
      if (typeof arguments[0] === 'function') {
        args = <any>arguments;
      } else {
        if (arguments.length < 3) {
          return undefined;
        }
        var obj: Object = arguments[0];
        var funName: any = arguments[1];
        if (!(obj && typeof obj === 'object' && typeof funName === 'string')) {
          return undefined;
        }
        args[0] = function (): void {
          obj[funName].apply(obj, arguments);
        };
        for (var i = 2; i < arguments.length; i++) {
          args.push(arguments[i]);
        }
      }
      // Unconditionally coerce interval to int, as one would do.
      args[1] |= 0;
      return this._setInterval.apply(null, args);
    }

    public setAVM1Property(target, index, value) {
      var nativeTarget = AVM1Utils.resolveTarget(target);
      nativeTarget[PropertiesIndexMap[index]] = value;
    }

    private _setTimeout(closure: Function, delay: number, ... args): number /* uint */ {
      return new flash.utils.SetIntervalTimer(closure, delay, false, args).reference;
    }

    public setTimeout() {
      // AVM1 setTimeout silently swallows most things that vaguely look like errors.
      if (arguments.length < 2 || typeof arguments[0] !== 'function')
      {
        return undefined;
      }
      // Unconditionally coerce interval to int, as one would do.
      arguments[1] |= 0;
      return this._setTimeout.apply(null, arguments);
    }

    public showRedrawRegions(enable, color) {
      // flash.profiler.showRedrawRegions.apply(null, arguments);
      notImplemented('AVM1Globals.showRedrawRegions');
    }
    public startDrag(target, lock, left, top, right, bottom) {
      var nativeTarget = AVM1Utils.resolveTarget<AVM1MovieClip>(target);
      nativeTarget.startDrag(lock, arguments.length < 3 ? null :
        new flash.geom.Rectangle(left, top, right - left, bottom - top));
    }
    public stop() {
      var nativeTarget = AVM1Utils.resolveTarget<AVM1MovieClip>();
      nativeTarget.stop();
    }
    public stopAllSounds() {
      flash.media.SoundMixer.stopAll();
    }
    public stopDrag(target?) {
      var nativeTarget = AVM1Utils.resolveTarget<AVM1MovieClip>(target);
      nativeTarget.stopDrag();
    }
    public substring(value, index, count) {
      return this.mbsubstring(value, index, count); // ASCII Only?
    }
    public targetPath(target) {
      var nativeTarget = AVM1Utils.resolveTarget<AVM1MovieClip>(target);
      return nativeTarget._target;
    }
    public toggleHighQuality() {
      // flash.display.Stage.quality
      notImplemented('AVM1Globals.toggleHighQuality');
    }

    public trace(expression: any): any {
      Shumway.AVM2.AS.Natives.print(expression);
    }

    public unloadMovie(target) {
      var nativeTarget = AVM1Utils.resolveTarget<AVM1MovieClip>(target);
      nativeTarget.unloadMovie();
    }
    public unloadMovieNum(level) {
      var nativeTarget = AVM1Utils.resolveLevel(level);
      nativeTarget.unloadMovie();
    }
    public updateAfterEvent() {
      // flash.events.TimerEvent.updateAfterEvent
      notImplemented('AVM1Globals.updateAfterEvent');
    }

    // built-ins
    public NaN: number = Number.NaN;
    public Infinity: number = Number.POSITIVE_INFINITY;
    public isFinite: (n: number)=> boolean = isFinite;
    public isNaN: (n: number) => boolean = isNaN;
    public parseFloat: (str: string) => number = parseFloat;
    public parseInt: (s: string, radix?: number) => number = parseInt;

    public Object =  Shumway.AVM2.AS.ASObject;
    public Function = Shumway.AVM2.AS.ASFunction;
    public Array = Shumway.AVM2.AS.ASArray;
    public Number = Shumway.AVM2.AS.ASNumber;
    public Math = Shumway.AVM2.AS.ASMath;
    public Boolean = Shumway.AVM2.AS.ASBoolean;
    public Date = Shumway.AVM2.AS.ASDate;
    public RegExp = Shumway.AVM2.AS.ASRegExp;
    public String = Shumway.AVM2.AS.ASString;

    public undefined: any = undefined;
    public MovieClip = AVM1MovieClip.createAVM1Class();
    public AsBroadcaster = AVM1Broadcaster.createAVM1Class();
    public System = AVM1System.createAVM1Class();
    public Stage = AVM1Stage.createAVM1Class();
    public Button = AVM1Button.createAVM1Class();
    public TextField = AVM1TextField.createAVM1Class();
    public Color = AVM1Color.createAVM1Class();
    public Key = AVM1Key.createAVM1Class();
    public Mouse = AVM1Mouse.createAVM1Class();
    public MovieClipLoader = AVM1MovieClipLoader.createAVM1Class();

    public Sound = AVM1Sound.createAVM1Class();
    public SharedObject = flash.net.SharedObject;
    public ContextMenu = flash.ui.ContextMenu;
    public ContextMenuItem = flash.ui.ContextMenuItem;
    public TextFormat = AVM1TextFormat.createAVM1Class();

    private _initializeFlashObject(): void {
      this.flash = {};
      this.flash.asSetPublicProperty('_MovieClip', this.MovieClip); // ???
      var display = {};
      display.asSetPublicProperty('BitmapData', AVM1BitmapData.createAVM1Class());
      this.flash.asSetPublicProperty('display', display);
      var external = {};
      external.asSetPublicProperty('ExternalInterface', AVM1ExternalInterface.createAVM1Class());
      this.flash.asSetPublicProperty('external', external);
      var filters = {};
      this.flash.asSetPublicProperty('filters', filters);
      var geom = {};
      geom.asSetPublicProperty('ColorTransform', flash.geom.ColorTransform);
      geom.asSetPublicProperty('Matrix', flash.geom.Matrix);
      geom.asSetPublicProperty('Point', flash.geom.Point);
      geom.asSetPublicProperty('Rectangle', flash.geom.Rectangle);
      geom.asSetPublicProperty('Transform', AVM1Transform.createAVM1Class());
      this.flash.asSetPublicProperty('geom', geom);
      var text = {};
      this.flash.asSetPublicProperty('text', text);
    }

    public toString() {
      return '[type Object]';
    }
  }

  var PropertiesIndexMap: string[] = [
    '_x', '_y', '_xscale', '_yscale', '_currentframe', '_totalframes', '_alpha',
    '_visible', '_width', '_height', '_rotation', '_target', '_framesloaded',
    '_name', '_droptarget', '_url', '_highquality', '_focusrect',
    '_soundbuftime', '_quality', '_xmouse', '_ymouse'
  ];
}