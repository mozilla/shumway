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
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import forEachPublicProperty = Shumway.AVMX.forEachPublicProperty;
  import assert = Shumway.Debug.assert;
  import flash = Shumway.AVMX.AS.flash;
  import ASObject = Shumway.AVMX.AS.ASObject;
  import ASFunction = Shumway.AVMX.AS.ASFunction;
  import AXClass = Shumway.AVMX.AXClass;

  var _escape: (str: string) => string = jsGlobal.escape;

  var _internalTimeouts: number[] = [];

  export class AVM1Globals extends ASObject {
    static createAVM1Class(securityDomain: ISecurityDomain): typeof AVM1Globals {
      return wrapAVM1Class(securityDomain, AVM1Globals,
        [],
        ['_global', 'flash', 'ASSetPropFlags', 'call', 'chr', 'clearInterval', 'clearTimeout',
          'duplicateMovieClip', 'fscommand', 'escape', 'unescape', 'getTimer', 'getURL',
          'getVersion', 'gotoAndPlay', 'gotoAndStop', 'ifFrameLoaded', 'int', 'length=>length_',
          'loadMovie', 'loadMovieNum', 'loadVariables', 'loadVariablesNum', 'mbchr', 'mblength', 'mbord',
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
    public flash: ASObject;
    public securityDomain: ISecurityDomain;

    constructor(context: AVM1Context) {
      super();

      AVM1Globals.instance = this;
      this._global = this;
      this.securityDomain = context.securityDomain;

      this._initBuiltins(context);

      var swfVersion = context.loaderInfo.swfVersion;
      if (swfVersion >= 8) {
        this._initializeFlashObject(context);
      }
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
      var as3Object = nativeTarget.as3Object;
      var frameNum = as3Object._getAbsFrameNumber(<any>frame, null);
      if (frameNum === undefined) {
        return;
      }
      as3Object.callFrame(frameNum);
    }

    public chr(number) {
      return String.fromCharCode(number);
    }

    public clearInterval(id: number /* uint */): void {
      var internalId = _internalTimeouts[id - 1];
      if (internalId) {
        clearInterval(internalId);
        delete _internalTimeouts[id - 1];
      }
    }

    public clearTimeout(id: number /* uint */): void {
      var internalId = _internalTimeouts[id - 1];
      if (internalId) {
        clearTimeout(internalId);
        delete _internalTimeouts[id - 1];
      }
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

    public getTimer = Shumway.AVM2.AS.FlashUtilScript_getTimer;

    public getURL(url, target?, method?) {
      var request = new flash.net.URLRequest(String(url));
      if (method) {
        request.method = method;
      }
      if (typeof target === 'string' && target.indexOf('_level') === 0) {
        this.loadMovieNum(url, +target.substr(6), method);
        return;
      }
      Shumway.AVM2.AS.FlashNetScript_navigateToURL(request, target);
    }

    public getVersion() {
      return flash.system.Capabilities.version;
    }

    _addToPendingScripts(subject: any, fn: Function, args: any [] = null): any {
      release || assert(fn, 'invalid function in _addToPendingScripts');
      var currentContext = AVM1Context.instance;
      var defaultTarget = currentContext.resolveTarget(undefined);
      currentContext.addToPendingScripts(function () {
        currentContext.enterContext(function () {
          try {
            (<Function><any> fn).apply(subject, args);
          } catch (ex) {
            console.error('AVM1 pending script error: ' + ex.message);
          }
        }, defaultTarget);
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
            return _escape(char);
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
      this._loadVariables(nativeTarget, url, method);
    }

    public loadVariablesNum(url: string, level: number, method: string = ''): void {
      var nativeTarget = AVM1Utils.resolveLevel(level);
      this._loadVariables(nativeTarget, url, method);
    }

    _loadVariables(nativeTarget: IAVM1SymbolBase, url: string, method: string): void {
      var request = new flash.net.URLRequest(url);
      if (method) {
        request.method = method;
      }
      var context = AVM1Context.instance;
      var loader = new flash.net.URLLoader(request);
      loader._ignoreDecodeErrors = true;
      loader.dataFormat = 'variables'; // flash.net.URLLoaderDataFormat.VARIABLES;
      function completeHandler(event: flash.events.Event): void {
        loader.removeEventListener(flash.events.Event.COMPLETE, completeHandler);
        release || Debug.assert(typeof loader.data === 'object');
        forEachPublicProperty(loader.data, function (key, value) {
          context.utils.setProperty(nativeTarget, key, value);
        });
        if (nativeTarget instanceof AVM1MovieClip) {
          avm1BroadcastEvent(context, nativeTarget, 'onData');
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
        var obj: any = arguments[0];
        var funName: any = arguments[1];
        if (!(obj && typeof obj === 'object' && typeof funName === 'string')) {
          return undefined;
        }
        args[0] = function (): void {
          // TODO add AVM1 property resolution (and case ignore)
          obj.asCallPublicProperty(funName, arguments);
        };
        for (var i = 2; i < arguments.length; i++) {
          args.push(arguments[i]);
        }
      }
      // Unconditionally coerce interval to int, as one would do.
      args[1] |= 0;
      var internalId = setInterval.apply(null, args);
      return _internalTimeouts.push(internalId);
    }

    public setAVM1Property(target, index, value) {
      var nativeTarget = AVM1Utils.resolveTarget(target);
      nativeTarget[PropertiesIndexMap[index]] = value;
    }

    public setTimeout() {
      // AVM1 setTimeout silently swallows most things that vaguely look like errors.
      if (arguments.length < 2 || typeof arguments[0] !== 'function')
      {
        return undefined;
      }
      // Unconditionally coerce interval to int, as one would do.
      arguments[1] |= 0;
      var internalId = setTimeout.apply(null, arguments);
      return _internalTimeouts.push(internalId);
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
      Shumway.AVMX.AS.Natives.print(this.securityDomain, expression); // REDUX
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
      somewhatImplemented('AVM1Globals.updateAfterEvent');
    }

    // built-ins
    public NaN: number = Number.NaN;
    public Infinity: number = Number.POSITIVE_INFINITY;
    public isFinite: (n: number)=> boolean = isFinite;
    public isNaN: (n: number) => boolean = isNaN;
    public parseFloat: (str: string) => number = parseFloat;
    public parseInt: (s: string, radix?: number) => number = parseInt;

    public Object: ASObject;
    public Function: ASObject;
    public Array: ASObject;
    public Number: ASObject;
    public Math: ASObject;
    public Boolean: ASObject;
    public Date: ASObject;
    public RegExp: ASObject;
    public String: ASObject;

    public undefined: any = undefined;
    public MovieClip: ASObject;
    public AsBroadcaster: ASObject;
    public System: ASObject;
    public Stage: ASObject;
    public Button: ASObject;
    public TextField: ASObject;
    public Color: ASObject;
    public Key: ASObject;
    public Mouse: ASObject;
    public MovieClipLoader: ASObject;

    public Sound: ASObject;
    public SharedObject: typeof flash.net.SharedObject;
    public ContextMenu: typeof flash.ui.ContextMenu;
    public ContextMenuItem: typeof flash.ui.ContextMenuItem;
    public TextFormat: ASObject;

    private _initBuiltins(context: AVM1Context) {
      var securityDomain: ISecurityDomain = context.securityDomain;

      this.Object = securityDomain.AXObject.axConstruct; // REDUX
      this.Function = securityDomain.AXFunction.axConstruct;
      this.Array = securityDomain.AXArray.axConstruct;
      this.Number = securityDomain.AXNumber.axConstruct;
      this.Math = securityDomain.AXMath.axConstruct;
      this.Boolean = securityDomain.AXBoolean.axConstruct;
      this.Date = securityDomain.AXDate.axConstruct;
      this.RegExp = securityDomain.AXRegExp.axConstruct;
      this.String = securityDomain.AXString.axConstruct;

      this.MovieClip = AVM1MovieClip.createAVM1Class(securityDomain);
      this.AsBroadcaster = AVM1Broadcaster.createAVM1Class(securityDomain);
      this.System = AVM1System.createAVM1Class(securityDomain);
      this.Stage = AVM1Stage.createAVM1Class(securityDomain);
      this.Button = AVM1Button.createAVM1Class(securityDomain);
      this.TextField = AVM1TextField.createAVM1Class(securityDomain);
      this.Color = AVM1Color.createAVM1Class(securityDomain);
      this.Key = AVM1Key.createAVM1Class(securityDomain);
      this.Mouse = AVM1Mouse.createAVM1Class(securityDomain);
      this.MovieClipLoader = AVM1MovieClipLoader.createAVM1Class(securityDomain);

      this.Sound = AVM1Sound.createAVM1Class(securityDomain);
      this.SharedObject = securityDomain.flash.net.SharedObject;
      this.ContextMenu = securityDomain.flash.ui.ContextMenu;
      this.ContextMenuItem = securityDomain.flash.ui.ContextMenuItem;
      this.TextFormat = AVM1TextFormat.createAVM1Class(securityDomain);

      AVM1Broadcaster.initializeWithContext(this.Stage, context);
      AVM1Broadcaster.initializeWithContext(this.Key, context);
      AVM1Broadcaster.initializeWithContext(this.Mouse, context);
    }

    private _initializeFlashObject(context: AVM1Context): void {
      var securityDomain = context.securityDomain;
      this.flash = securityDomain.createObject();
      this.flash.axSetPublicProperty('_MovieClip', this.MovieClip); // ???
      var display: ASObject = securityDomain.createObject();
      display.axSetPublicProperty('BitmapData', AVM1BitmapData.createAVM1Class(securityDomain));
      this.flash.axSetPublicProperty('display', display);
      var external: ASObject = securityDomain.createObject();
      external.axSetPublicProperty('ExternalInterface', AVM1ExternalInterface.createAVM1Class(securityDomain));
      this.flash.axSetPublicProperty('external', external);
      var filters: ASObject = securityDomain.createObject();
      this.flash.axSetPublicProperty('filters', filters);
      var geom: ASObject = securityDomain.createObject();
      geom.axSetPublicProperty('ColorTransform', flash.geom.ColorTransform);
      geom.axSetPublicProperty('Matrix', flash.geom.Matrix);
      geom.axSetPublicProperty('Point', flash.geom.Point);
      geom.axSetPublicProperty('Rectangle', flash.geom.Rectangle);
      geom.axSetPublicProperty('Transform', AVM1Transform.createAVM1Class(securityDomain));
      this.flash.axSetPublicProperty('geom', geom);
      var text: ASObject = securityDomain.createObject();
      this.flash.axSetPublicProperty('text', text);
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
