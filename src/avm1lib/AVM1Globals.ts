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
 * limitations undxr the License.
 */
// Class: AVM1Globals
module Shumway.AVM2.AS.avm1lib {
  import assert = Shumway.Debug.assert;
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import Loader = Shumway.AVM2.AS.flash.display.Loader;
  import TextFormat = Shumway.AVM2.AS.flash.text.TextFormat;
  import AVM1Context = Shumway.AVM1.AVM1Context;
  import Natives = Shumway.AVM2.AS.Natives;

  export class AVM1Globals extends ASNative {

    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // Called whenever an instance of the class is initialized.
    static initializer: any = function () {
      // The AVM1 version of TextFormat has an additional method "getTextExtent".
      // We install that here so we don't need to have a full AVM1 version of
      // TextFormat and take care to return that everywhere when in AVM1 mode.
      TextFormat.prototype.asDefinePublicProperty('getTextExtent', {
        value: AVM1TextFormat.prototype._as2GetTextExtent,
        writable: false,
        enumerable: false,
        configurable: false
      });
    };

    // List of static symbols to link.
    static classSymbols: string [] = null;

    // List of instance symbols to link.
    static instanceSymbols: string [] = ["_global!", "flash", "$asfunction", "call!", "chr!",
                                         "clearInterval!", "clearTimeout!", "duplicateMovieClip!",
                                         "fscommand!", "getAVM1Property!", "getTimer!",
                                         "getURL!", "getVersion!", "gotoAndPlay!", "gotoAndStop!",
                                         "gotoLabel!", "ifFrameLoaded!", "int!", "length!", "loadMovie!",
                                         "loadMovieNum!", "loadVariables!", "mbchr!", "mblength!",
                                         "mbord!", "mbsubstring!", "nextFrame!", "nextScene!", "ord!",
                                         "play!", "prevFrame!", "prevScene!", "print!", "printAsBitmap!",
                                         "printAsBitmapNum!", "printNum!", "random!",
                                         "removeMovieClip!", "setInterval!", "setAVM1Property!",
                                         "setTimeout!", "showRedrawRegions!", "startDrag!", "stop!",
                                         "stopAllSounds!", "stopDrag!", "substring!", "targetPath!",
                                         "toggleHighQuality!", "unloadMovie!",
                                         "unloadMovieNum!", "updateAfterEvent!"];

    constructor () {
      false && super();
      dummyConstructor("public flash.accessibility.Accessibility");
    }

    // JS -> AS Bindings

    _global: any;
    flash: ASObject;
    $asfunction: (link: any) => any;
    call: (frame: any) => any;
    chr: (number: any) => any;
    clearInterval: ASFunction;
    clearTimeout: ASFunction;
    duplicateMovieClip: (target: any, newname: any, depth: any) => any;
    fscommand: (...rest:any[]) => any;
    getAVM1Property: (target: any, index: any) => any;
    getTimer: () => number;
    getURL: (url: any, target: any, method?: any) => any;
    getVersion: () => any;
    gotoAndPlay: (scene: any, frame?: any) => any;
    gotoAndStop: (scene: any, frame?: any) => any;
    ifFrameLoaded: (scene: any, frame?: any) => any;
    int: (value: any) => any;
    length: (expression: any) => number;
    loadMovie: (url: string, target: ASObject, method: string) => void;
    loadMovieNum: (url: any, level: any, method: any) => any;
    loadVariables: (url: string, target: ASObject, method?: string) => void;
    mbchr: (number: any) => any;
    mblength: (expression: any) => any;
    mbord: (character: any) => any;
    mbsubstring: (value: any, index: any, count: any) => any;
    nextFrame: () => any;
    nextScene: () => any;
    ord: (character: any) => any;
    play: () => any;
    prevFrame: () => any;
    prevScene: () => any;
    print: (target: any, boundingBox: any) => any;
    printAsBitmap: (target: any, boundingBox: any) => any;
    printAsBitmapNum: (level: any, boundingBox: any) => any;
    printNum: (level: any, bondingBox: any) => any;
    random: (value: any) => any;
    removeMovieClip: (target: any) => any;
    setInterval: () => any;
    setAVM1Property: (target: any, index: any, value: any) => any;
    setTimeout: () => any;
    showRedrawRegions: (enable: any, color: any) => any;
    startDrag: (target: any, lock: any, left: any, top: any, right: any, bottom: any) => any;
    stop: () => any;
    stopAllSounds: () => any;
    stopDrag: (target?: any) => any;
    substring: (value: any, index: any, count: any) => any;
    targetPath: (target: any) => any;
    toggleHighQuality: () => any;
    unloadMovie: (target: any) => any;
    unloadMovieNum: (level: any) => any;
    updateAfterEvent: () => any;

    // AS -> JS Bindings
    static _addInternalClasses(proto: ASObject): void {
      var obj: Object = proto;
      obj.asSetPublicProperty('Object', ASObject);
      obj.asSetPublicProperty('Function', ASFunction);
      obj.asSetPublicProperty('Array', ASArray);
      obj.asSetPublicProperty('Number', ASNumber);
      obj.asSetPublicProperty('Math', ASMath);
      obj.asSetPublicProperty('Boolean', ASBoolean);
      obj.asSetPublicProperty('Date', ASDate);
      obj.asSetPublicProperty('RegExp', ASRegExp);
      obj.asSetPublicProperty('String', ASString);
    }

    ASSetPropFlags(obj: any, children: any, flags: any, allowFalse: any): any {
      // flags (from bit 0): dontenum, dontdelete, readonly, ....
      // TODO
    }
    _addToPendingScripts(subject: ASObject, fn: ASFunction, args: any [] = null): any {
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
    escape(str: string): string {
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

    unescape(str: string): string {
      return decodeURIComponent(str);
    }

    _setLevel(level: number /*uint*/, loader: Loader): any {
      level = level >>> 0;
      // TODO: re-enable support for loading AVM1 content into levels. See bug 1035166.
      //AVM1Context.instance.stage._as2SetLevel(level, loader);
    }
    trace(expression: any): any {
      Natives.print(expression);
    }
  }
}

var globalEscape = this['escape'];
