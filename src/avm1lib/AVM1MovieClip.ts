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

///<reference path='references.ts' />
module Shumway.AVM2.AS.avm1lib {
  import assert = Shumway.Debug.assert;
  import notImplemented = Shumway.Debug.notImplemented;

  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import construct = Shumway.AVM2.Runtime.construct;
  import Multiname = Shumway.AVM2.ABC.Multiname;
  import Namespace = Shumway.AVM2.ABC.Namespace;
  import resolveMultinameProperty = Shumway.AVM2.Runtime.resolveMultinameProperty;

  import AVM1Context = Shumway.AVM1.AVM1Context;
  import Bitmap = flash.display.Bitmap;

  var _asGetProperty = Object.prototype.asGetProperty;
  var _asSetProperty = Object.prototype.asSetProperty;
  var _asCallProperty = Object.prototype.asCallProperty;
  var _asHasProperty = Object.prototype.asHasProperty;
  var _asHasOwnProperty = Object.prototype.asHasOwnProperty;
  var _asHasTraitProperty = Object.prototype.asHasTraitProperty;
  var _asDeleteProperty = Object.prototype.asDeleteProperty;
  var _asGetEnumerableKeys = Object.prototype.asGetEnumerableKeys;

  export class AVM1MovieClip extends ASNative {

    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // Called whenever an instance of the class is initialized.
    static initializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null;

    // List of instance symbols to link.
    static instanceSymbols: string [] = ["__lookupChild!", "__targetPath!"];

    constructor (nativeMovieClip: flash.display.MovieClip) {
      false && super();
      this._nativeAS3Object = nativeMovieClip;
      this._frameScripts = null;
      this._boundExecuteFrameScripts = null;
    }

    _nativeAS3Object: flash.display.MovieClip;

    private _context: AVM1Context;

    private _boundExecuteFrameScripts: () => void;
    private _frameScripts: AVM1.AVM1ActionsData[][];

    // JS -> AS Bindings

    __lookupChild: (id: string) => any;
    __targetPath: any;

    // AS -> JS Bindings

    _init(nativeMovieClip: flash.display.MovieClip): any {
      if (this._nativeAS3Object) {
        return; // MovieClip is already initialized.
      }
      if (!nativeMovieClip) {
        return; // delaying initialization, see also _constructSymbol
      }
      this._nativeAS3Object = nativeMovieClip;
      (<any> nativeMovieClip)._as2Object = this;
      initDefaultListeners(this);
    }

    _lookupChildByName(name: string): flash.display.DisplayObject {
      name = asCoerceString(name);
      return (<flash.display.DisplayObjectContainer>this._nativeAS3Object)._lookupChildByName(name);
    }

    set context(value: AVM1Context) {
      release || assert(!this._context);
      this._context = value;
    }

    private _resolveLevelNProperty(name): AVM1MovieClip {
      if (name === '_root' || name === '_level0') {
        return AVM1Context.instance.resolveLevel(0);
      } else if (name.indexOf('_level') === 0) {
        var level = name.substring(6), levelNum = level | 0;
        if (levelNum > 0 && level == levelNum) {
          return AVM1Context.instance.resolveLevel(levelNum)
        }
      }
      return null;
    }

    public asGetProperty(namespaces: Namespace [], name: any, flags: number) {
      if (_asHasProperty.call(this, namespaces, name, flags)) {
        return _asGetProperty.call(this, namespaces, name, flags);
      }
      if (typeof name === 'string' && name[0] === '_') {
        var level = this._resolveLevelNProperty(name);
        if (level) {
          return level;
        }
      }
      var resolved = resolveMultinameProperty(namespaces, name, flags);
      if (Multiname.isPublicQualifiedName(resolved) && this._nativeAS3Object) {
        return this.__lookupChild(Multiname.getNameFromPublicQualifiedName(resolved));
      }
      return undefined;
    }

    public asHasProperty(namespaces: Namespace [], name: any, flags: number) {
      if (_asHasProperty.call(this, namespaces, name, flags)) {
        return true;
      }
      if (typeof name === 'string' && name[0] === '_') {
        var level = this._resolveLevelNProperty(name);
        if (level) {
          return true;
        }
      }
      var resolved = resolveMultinameProperty(namespaces, name, flags);
      if (Multiname.isPublicQualifiedName(resolved) && this._nativeAS3Object) {
        return !!this.__lookupChild(Multiname.getNameFromPublicQualifiedName(resolved));
      }
      return false;
    }

    public asGetEnumerableKeys() {
      var keys = _asGetEnumerableKeys.call(this);
      // if it's a movie listing the children as well
      var as3MovieClip = this._nativeAS3Object;
      if (!as3MovieClip) {
        return keys; // not initialized yet
      }

      for (var i = 0, length = as3MovieClip._children.length; i < length; i++) {
        var child = as3MovieClip._children[i];
        var name = child.name;
        if (!_asHasProperty.call(this, undefined, name, 0)) {
          keys.push(Multiname.getPublicQualifiedName(name));
        }
      }
      return keys;
    }

    static _initFromConstructor(ctor, nativeMovieClip: flash.display.MovieClip): flash.display.MovieClip {
      var mc: any = {
        _nativeAS3Object: nativeMovieClip
      };
      mc.asSetPublicProperty('__proto__', ctor.asGetPublicProperty('prototype'));
      mc.asDefinePublicProperty('__constructor__', {
        value: ctor,
        writable: true,
        enumerable: false,
        configurable: false
      });
      (<any>nativeMovieClip)._as2Object = mc;
      initDefaultListeners(mc);
      ctor.call(mc);
      return mc;
    }

    get _as3Object(): flash.display.MovieClip {
      return this._nativeAS3Object;
    }

    attachBitmap(bmp: AVM1BitmapData, depth: number,
                 pixelSnapping: String = 'auto',
                 smoothing: Boolean = false): void
    {
      var bitmap: Bitmap = construct(flash.display.Bitmap, [bmp, pixelSnapping, smoothing]);
      this._insertChildAtDepth(bitmap, depth);
    }

    _constructMovieClipSymbol(symbolId: string, name: string): flash.display.MovieClip {
      var symbol = AVM1Context.instance.getAsset(symbolId);
      if (!symbol) {
        return undefined;
      }

      var props: flash.display.SpriteSymbol = Object.create(symbol.symbolProps);
      props.avm1Name = name;
      props.avm1SymbolClass = symbol.theClass;

      var mc: flash.display.MovieClip = flash.display.MovieClip.initializeFrom(props);
      flash.display.MovieClip.instanceConstructorNoInitialize.call(mc);

      return mc;
    }

    addFrameActionBlocks(frameIndex: number, frameData: any) {
      var initActionBlocks: any[] = frameData.initActionBlocks;
      var actionBlocks: any[] = frameData.actionBlocks;

      if (initActionBlocks) {
        this._addInitActionBlocks(frameIndex, initActionBlocks);
      }

      if (actionBlocks) {
        for (var i = 0; i < actionBlocks.length; i++) {
          this.addFrameScript(frameIndex, actionBlocks[i]);
        }
      }
    }

    addFrameScript(frameIndex: number, actionsBlock: Uint8Array): void {
      var frameScripts = this._frameScripts;
      if (!frameScripts) {
        release || assert(!this._boundExecuteFrameScripts);
        this._boundExecuteFrameScripts = this._executeFrameScripts.bind(this);
        frameScripts = this._frameScripts = [];
      }
      var scripts: AVM1.AVM1ActionsData[] = frameScripts[frameIndex + 1];
      if (!scripts) {
        scripts = frameScripts[frameIndex + 1] = [];
        this._nativeAS3Object.addFrameScript(frameIndex, this._boundExecuteFrameScripts);
      }
      var actionsData = new AVM1.AVM1ActionsData(actionsBlock,
                                                 'f' + frameIndex + 'i' + scripts.length);
      scripts.push(actionsData);
    }

    /**
     * AVM1 InitActionBlocks are executed once, before the children are initialized for a frame.
     * That matches AS3's enterFrame event, so we can add an event listener that just bails
     * as long as the target frame isn't reached, and executes the InitActionBlock once it is.
     *
     * After that, the listener removes itself.
     */
    private _addInitActionBlocks(frameIndex: number,
                                 actionsBlocks: {actionsData: Uint8Array} []): void
    {
      var avm2MovieClip = this._nativeAS3Object;
      var self = this;
      function listener (e) {
        if (avm2MovieClip.currentFrame !== frameIndex + 1) {
          return;
        }
        avm2MovieClip.removeEventListener('enterFrame', listener);

        var avm1Context = self._context;
        for (var i = 0; i < actionsBlocks.length; i++) {
          var actionsData = new AVM1.AVM1ActionsData(actionsBlocks[i].actionsData,
                                                     'f' + frameIndex + 'i' + i);
          avm1Context.executeActions(actionsData, self);
        }
      }
      avm2MovieClip.addEventListener('enterFrame', listener);
    }

    private _executeFrameScripts() {
      var context = this._context;
      var scripts: AVM1.AVM1ActionsData[] = this._frameScripts[this._nativeAS3Object.currentFrame];
      release || assert(scripts && scripts.length);
      for (var i = 0; i < scripts.length; i++) {
        var actionsData = scripts[i];
        context.executeActions(actionsData, this);
      }
    }

    _callFrame(frame: any): any {
      var nativeAS3Object = <any> this._nativeAS3Object;
      nativeAS3Object._callFrame(frame);
    }
    _insertChildAtDepth(mc: any, depth: number): AVM1MovieClip {
      var nativeAS3Object = <flash.display.MovieClip> this._nativeAS3Object;
      nativeAS3Object.addTimelineObjectAtDepth(mc, Math.min(nativeAS3Object.numChildren, depth));
      // Bitmaps aren't reflected in AVM1, so the rest here doesn't apply.
      if (flash.display.Bitmap.isType(mc)) {
        return null;
      }
      var as2mc = getAVM1Object(mc);
      return as2mc;
    }

    getInstanceAtDepth(depth: number): AVM1MovieClip {
      var nativeObject = this._nativeAS3Object;
      for (var i = 0, numChildren = nativeObject.numChildren; i < numChildren; i++) {
        var child = nativeObject._lookupChildByIndex(i);
        // child is null if it hasn't been constructed yet. This can happen in InitActionBlocks.
        if (child && child._depth === depth) {
          // Somewhat absurdly, this method returns the mc if a bitmap is at the given depth.
          if (flash.display.Bitmap.isType(child)) {
            return this;
          }
          return getAVM1Object(child);
        }
      }
      return null;
    }
    getNextHighestDepth() {
      var nativeObject = this._nativeAS3Object;
      var maxDepth = 0;
      for (var i = 0, numChildren = nativeObject.numChildren; i < numChildren; i++) {
        var child = nativeObject._lookupChildByIndex(i);
        if (child._depth > maxDepth) {
          maxDepth = child._depth;
        }
      }
      return maxDepth + 1;
    }

    _duplicate(name: any, depth: any, initObject: any): any {
      var nativeAS3Object = <any> this._nativeAS3Object;
      nativeAS3Object._duplicate(name, depth, initObject);
    }
  }
}
