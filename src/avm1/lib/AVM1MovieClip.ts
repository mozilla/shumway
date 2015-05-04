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
  import flash = Shumway.AVMX.AS.flash;
  import assert = Shumway.Debug.assert;

  class AVM1MovieClipButtonModeEvent extends AVM1EventHandler {
    constructor(public propertyName: string,
                public eventName: string,
                public argsConverter: Function = null) {
      super(propertyName, eventName, argsConverter);
    }

    public onBind(target: IAVM1SymbolBase): void {
      var mc: AVM1MovieClip = <any>target;
      mc.as3Object.buttonMode = true;
    }
  }

  function convertAS3RectangeToBounds(as3Rectange: flash.geom.Rectangle): AVM1Object {
    var result = alNewObject(this.context);
    result.alPut('xMin', as3Rectange.axGetPublicProperty('left'));
    result.alPut('yMin', as3Rectange.axGetPublicProperty('top'));
    result.alPut('xMax', as3Rectange.axGetPublicProperty('right'));
    result.alPut('yMax', as3Rectange.axGetPublicProperty('bottom'));
    return result;
  }

  export class AVM1MovieClip extends AVM1SymbolBase<flash.display.MovieClip> {
    public static createAVM1Class(context: AVM1Context): AVM1Object {
      return wrapAVM1NativeClass(context, true, AVM1MovieClip,
        [],
        ['$version#', '_alpha#', 'attachAudio', 'attachBitmap', 'attachMovie',
          'beginFill', 'beginBitmapFill', 'beginGradientFill', 'blendMode#',
          'cacheAsBitmap#', '_callFrame', 'clear', 'createEmptyMovieClip',
          'createTextField', '_currentframe#', 'curveTo', '_droptarget#',
          'duplicateMovieClip', 'enabled#', 'endFill', 'filters#', '_framesloaded#',
          'focusEnabled#', '_focusrect#', 'forceSmoothing#', 'getBounds',
          'getBytesLoaded', 'getBytesTotal', 'getDepth', 'getInstanceAtDepth',
          'getNextHighestDepth', 'getRect', 'getSWFVersion', 'getTextSnapshot',
          'getURL', 'globalToLocal', 'gotoAndPlay', 'gotoAndStop', '_height#',
          '_highquality#', 'hitArea#', 'hitTest', 'lineGradientStyle', 'lineStyle',
          'lineTo', 'loadMovie', 'loadVariables', 'localToGlobal', '_lockroot#',
          'menu#', 'moveTo', '_name#', 'nextFrame', 'opaqueBackground#', '_parent#',
          'play', 'prevFrame', '_quality#', 'removeMovieClip', '_rotation#',
          'scale9Grid#', 'scrollRect#', 'setMask', '_soundbuftime#', 'startDrag',
          'stop', 'stopDrag', 'swapDepths', 'tabChildren#', 'tabEnabled#', 'tabIndex#',
          '_target#', '_totalframes#', 'trackAsMenu#', 'transform#', 'toString',
          'unloadMovie', '_url#', 'useHandCursor#', '_visible#', '_width#',
          '_x#', '_xmouse#', '_xscale#', '_y#', '_ymouse#', '_yscale#']);
    }

    private _boundExecuteFrameScripts: () => void;
    private _frameScripts: AVM1.AVM1ActionsData[][];
    private _hitArea: any;
    private _lockroot: boolean;

    private get graphics() : flash.display.Graphics {
      return this.as3Object.graphics;
    }

    public initAVM1SymbolInstance(context: AVM1Context, as3Object: flash.display.MovieClip) {
      super.initAVM1SymbolInstance(context, as3Object);

      this._frameScripts = null;
      this._boundExecuteFrameScripts = null;

      this._initEventsHandlers();
    }

    _lookupChildByName(name: string): AVM1Object {
      name = alCoerceString(this.context, name);
      var lookupOptions = flash.display.LookupChildOptions.INCLUDE_NON_INITIALIZED;
      if (!this.context.isPropertyCaseSensitive) {
        lookupOptions |= flash.display.LookupChildOptions.IGNORE_CASE;
      }
      var as3Child = this.as3Object._lookupChildByName(name, lookupOptions);
      return getAVM1Object(as3Child, this.context);
    }

    public get __targetPath() {
      var target = this.get_target();
      var prefix = '_level0'; // TODO use needed level number here
      return target != '/' ? prefix + target.replace(/\//g, '.') : prefix;
    }

    public attachAudio(id) {
      Debug.notImplemented('AVM1MovieClip.attachAudio');
    }

    public attachBitmap(bmp:AVM1BitmapData, depth:number, pixelSnapping:String = 'auto', smoothing:Boolean = false): void {
      pixelSnapping = alCoerceString(this.context, pixelSnapping);
      smoothing = alToBoolean(this.context, smoothing);
      var as3BitmapData = bmp.as3BitmapData;
      var bitmap: flash.display.Bitmap = this.context.sec.flash.display.Bitmap.axClass.axConstruct([as3BitmapData, pixelSnapping, smoothing]);
      this._insertChildAtDepth(bitmap, depth);
    }

    public _constructMovieClipSymbol(symbolId:string, name:string): flash.display.MovieClip {
      symbolId = alCoerceString(this.context, symbolId);
      name = alCoerceString(this.context, name);

      var symbol = this.context.getAsset(symbolId);
      if (!symbol) {
        return undefined;
      }

      var props: flash.display.SpriteSymbol = Object.create(symbol.symbolProps);
      props.avm1Name = name;
      props.avm1SymbolClass = symbol.theClass;

      var mc:flash.display.MovieClip;
      mc = Shumway.AVMX.AS.constructClassFromSymbol(props, this.context.sec.flash.display.MovieClip.axClass);

      return mc;
    }

    public get$version(): string {
      return this.context.sec.flash.system.Capabilities.version;
    }

    public attachMovie(symbolId, name, depth, initObject) {
      var mc = this._constructMovieClipSymbol(symbolId, name);
      if (!mc) {
        return undefined;
      }

      var as2mc = <AVM1MovieClip>this._insertChildAtDepth(mc, depth);
      if (initObject) {
        as2mc._init(initObject);
      }

      return as2mc;
    }

    public beginFill(color, alpha) {
      this.graphics.beginFill(color, alpha);
    }

    public beginBitmapFill(bmp, matrix, repeat, smoothing) {
      if (!(bmp instanceof flash.display.BitmapData))
      {
        return;
      }

      this.graphics.beginBitmapFill(bmp, matrix, repeat, smoothing);
    }

    public beginGradientFill(fillType, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPointRatio) {
      this.graphics.beginGradientFill(fillType, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPointRatio);
    }

    public _callFrame(frame:any):any {
      var nativeAS3Object = <any> this.as3Object;
      nativeAS3Object._callFrame(frame);
    }

    public clear() {
      this.graphics.clear();
    }

    private _insertChildAtDepth<T extends flash.display.DisplayObject>(mc: T, depth:number): AVM1Object {
      var symbolDepth = Math.max(0, alCoerceNumber(this.context, depth)) + DEPTH_OFFSET;
      var nativeAS3Object = this.as3Object;
      nativeAS3Object.addTimelineObjectAtDepth(mc, symbolDepth);
      // Bitmaps aren't reflected in AVM1, so the rest here doesn't apply.
      if (this.context.sec.flash.display.Bitmap.axIsType(mc)) {
        return null;
      }
      return getAVM1Object(mc, this.context);
    }

    public createEmptyMovieClip(name, depth): AVM1MovieClip {
      var mc: flash.display.MovieClip = new this.context.sec.flash.display.MovieClip();
      mc.name = name;
      return <AVM1MovieClip>this._insertChildAtDepth(mc, depth);
    }

    public createTextField(name, depth, x, y, width, height): AVM1TextField {
      var text: flash.text.TextField = new this.context.sec.flash.text.TextField();
      text.name = name;
      text.x = x;
      text.y = y;
      text.width = width;
      text.height = height;
      return <AVM1TextField>this._insertChildAtDepth(text, depth);
    }

    public get_currentframe() {
      return this.as3Object.currentFrame;
    }

    public curveTo(controlX, controlY, anchorX, anchorY) {
      this.graphics.curveTo(controlX, controlY, anchorX, anchorY);
    }

    public get_droptarget() {
      return this.as3Object.dropTarget;
    }

    public duplicateMovieClip(name, depth, initObject): AVM1MovieClip {
      var parent = this.context.resolveTarget(null);
      var nativeAS3Object = <any> this.as3Object;
      var mc: flash.display.MovieClip;
      if (nativeAS3Object._symbol) {
        mc = Shumway.AVMX.AS.constructClassFromSymbol(nativeAS3Object._symbol, nativeAS3Object.axClass);
      } else {
        mc = new this.context.sec.flash.display.MovieClip();
      }
      mc.name = alCoerceString(this.context, name);

      // These are all properties that get copied over when duplicating a movie clip.
      // Examined by testing.
      mc.x = nativeAS3Object.x;
      mc.scaleX = nativeAS3Object.scaleX;
      mc.y = nativeAS3Object.y;
      mc.scaleY = nativeAS3Object.scaleY;
      mc.rotation = nativeAS3Object.rotation;
      mc.alpha = nativeAS3Object.alpha;
      mc.blendMode = nativeAS3Object.blendMode;
      mc.cacheAsBitmap = nativeAS3Object.cacheAsBitmap;
      mc.opaqueBackground = nativeAS3Object.opaqueBackground;
      mc.tabChildren = nativeAS3Object.tabChildren;
      // Not supported yet: _quality, _highquality, _soundbuftime.

      mc.graphics.copyFrom(nativeAS3Object.graphics);

      // TODO: Do event listeners get copied?

      var as2mc = <AVM1MovieClip>parent._insertChildAtDepth(mc, depth);
      if (initObject) {
        as2mc._init(initObject);
      }

      return as2mc;
    }

    public getEnabled() {
      return this.as3Object.enabled;
    }

    public setEnabled(value) {
      this.as3Object.enabled = value;
    }

    public endFill() {
      this.graphics.endFill();
    }

    public getFocusEnabled(): boolean {
      Debug.somewhatImplemented('AVM1MovieClip.getFocusEnabled');
      return true;
    }

    public setFocusEnabled(value: boolean) {
      value = alToBoolean(this.context, value);
      Debug.somewhatImplemented('AVM1MovieClip.setFocusEnabled');
    }

    public getForceSmoothing(): boolean {
      Debug.somewhatImplemented('AVM1MovieClip.getForceSmoothing');
      return false;
    }

    public setForceSmoothing(value: boolean) {
      value = alToBoolean(this.context, value);
      Debug.somewhatImplemented('AVM1MovieClip.setForceSmoothing');
    }

    public get_framesloaded() {
      return this.as3Object.framesLoaded;
    }

    public getBounds(bounds): AVM1Object {
      var obj = bounds.as3Object;
      if (!obj) {
        throw new Error('Unsupported object type for AVM1MovieClip.getBounds');
      }
      return convertAS3RectangeToBounds(this.as3Object.getBounds(obj));
    }

    public getBytesLoaded(): number {
      var loaderInfo = this.as3Object.loaderInfo;
      return loaderInfo.bytesLoaded;
    }

    public getBytesTotal() {
      var loaderInfo = this.as3Object.loaderInfo;
      return loaderInfo.bytesTotal;
    }

    public getInstanceAtDepth(depth: number): AVM1MovieClip {
      var symbolDepth = alCoerceNumber(this.context, depth) + DEPTH_OFFSET;
      var nativeObject = this.as3Object;
      var lookupChildOptions = flash.display.LookupChildOptions.INCLUDE_NON_INITIALIZED;
      for (var i = 0, numChildren = nativeObject.numChildren; i < numChildren; i++) {
        var child = nativeObject._lookupChildByIndex(i, lookupChildOptions);
        // child is null if it hasn't been constructed yet. This can happen in InitActionBlocks.
        if (child && child._depth === symbolDepth) {
          // Somewhat absurdly, this method returns the mc if a bitmap is at the given depth.
          if (this.context.sec.flash.display.Bitmap.axIsType(child)) {
            return this;
          }
          return <AVM1MovieClip>getAVM1Object(child, this.context);
        }
      }
      return null;
    }

    public getNextHighestDepth(): number {
      var nativeObject = this.as3Object;
      var maxDepth = DEPTH_OFFSET;
      var lookupChildOptions = flash.display.LookupChildOptions.INCLUDE_NON_INITIALIZED;
      for (var i = 0, numChildren = nativeObject.numChildren; i < numChildren; i++) {
        var child = nativeObject._lookupChildByIndex(i, lookupChildOptions);
        if (child._depth >= maxDepth) {
          maxDepth = child._depth + 1;
        }
      }
      return maxDepth - DEPTH_OFFSET;
    }

    public getRect(bounds): AVM1Object {
      var obj = bounds.as3Object;
      if (!obj) {
        throw new Error('Unsupported object type for AVM1MovieClip.getRect');
      }
      return convertAS3RectangeToBounds(this.as3Object.getRect(obj));
    }

    public getSWFVersion(): number {
      var loaderInfo = this.as3Object.loaderInfo;
      return loaderInfo.swfVersion;
    }

    public getTextSnapshot() {
      Debug.notImplemented('AVM1MovieClip.getTextSnapshot');
    }

    public getURL(url, window, method) {
      var request = new this.context.sec.flash.net.URLRequest(url);
      if (method) {
        request.method = method;
      }
      Shumway.AVMX.AS.FlashNetScript_navigateToURL(request, window);
    }

    public globalToLocal(pt) {
      var tmp = this.as3Object.globalToLocal(toAS3Point(pt));
      copyAS3PointTo(tmp, pt);
    }

    public gotoAndPlay(frame) {
      return this.as3Object.gotoAndPlay(frame);
    }

    public gotoAndStop(frame) {
      return this.as3Object.gotoAndStop(frame);
    }

    public getHitArea() {
      return this._hitArea;
    }

    public setHitArea(value) {
      // The hitArea getter always returns exactly the value set here, so we have to store that.
      this._hitArea = value;
      var obj = value ? value.as3Object : null;
      // If the passed-in value isn't a MovieClip, reset the hitArea.
      if (!this.context.sec.flash.display.MovieClip.axIsType(obj)) {
        obj = null;
      }
      this.as3Object.hitArea = obj;
    }

    public hitTest(x, y, shapeFlag) {
      if (x.isAVM1Instance) {
        return this.as3Object.hitTestObject((<AVM1MovieClip>x).as3Object);
      } else {
        return this.as3Object.hitTestPoint(x, y, shapeFlag);
      }
    }

    public lineGradientStyle(fillType, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPointRatio) {
      this.graphics.lineGradientStyle(fillType, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPointRatio);
    }

    public lineStyle(thickness, rgb, alpha, pixelHinting, noScale, capsStyle, jointStyle, miterLimit) {
      this.graphics.lineStyle(thickness, rgb, alpha, pixelHinting, noScale, capsStyle, jointStyle, miterLimit);
    }

    public lineTo(x, y) {
      this.graphics.lineTo(x, y);
    }

    public loadMovie(url: string, method: string) {
      var loader: flash.display.Loader = new this.context.sec.flash.display.Loader();
      var request: flash.net.URLRequest = new this.context.sec.flash.net.URLRequest(url);
      if (method) {
        request.method = method;
      }
      loader.load(request);
      function completeHandler(event: flash.events.Event):void {
        loader.removeEventListener(flash.events.Event.COMPLETE, completeHandler);
        var parent: flash.display.MovieClip = this.as3Object.parent;
        var depth = parent.getChildIndex(this.as3Object);
        parent.removeChild(this.as3Object);
        parent.addChildAt(loader.content, depth);
      }

      loader.addEventListener(flash.events.Event.COMPLETE, completeHandler);
    }

    public loadVariables(url: string, method?: string) {
      // REDUX move _loadVariables here?
      (<any>this.context).actions._loadVariables(this, url, method);
    }

    public localToGlobal(pt) {
      var tmp = this.as3Object.localToGlobal(toAS3Point(pt));
      copyAS3PointTo(tmp, pt);
    }

    public get_lockroot(): boolean {
      return this._lockroot;
    }

    public set_lockroot(value: boolean) {
      this._lockroot = alToBoolean(this.context, value);
    }

    public moveTo(x, y) {
      this.graphics.moveTo(x, y);
    }

    public nextFrame() {
      this.as3Object.nextFrame();
    }

    public nextScene() {
      this.as3Object.nextScene();
    }

    public play() {
      this.as3Object.play();
    }

    public prevFrame() {
      this.as3Object.prevFrame();
    }

    public prevScene() {
      this.as3Object.prevScene();
    }

    public removeMovieClip() {
      var parent = this.get_parent().as3Object;
      parent.removeChild(this.as3Object);
    }

    public setMask(mc:Object) {
      var nativeObject = this.as3Object;
      var mask = AVM1Utils.resolveMovieClip(this.context, mc);
      if (mask) {
        nativeObject.mask = mask.as3Object;
      }
    }

    public startDrag(lock?: boolean, left?: number, top?: number, right?: number, bottom?: number): void {
      lock = alToBoolean(this.context, lock);
      var bounds = null;
      if (arguments.length < 3) {
        left = alToNumber(this.context, left);
        top = alToNumber(this.context, top);
        right = alToNumber(this.context, right);
        bottom = alToNumber(this.context, bottom);
        bounds = new this.context.sec.flash.geom.Rectangle(left, top, right - left, bottom - top);
      }
      this.as3Object.startDrag(lock, bounds);
    }

    public stop() {
      return this.as3Object.stop();
    }

    public stopDrag() {
      return this.as3Object.stopDrag();
    }

    public swapDepths(target:Object) {
      var child1 = this.as3Object;
      var child2 = typeof target === 'number' ?
        AVM1Utils.resolveLevel(this.context, Number(target)).as3Object :
        AVM1Utils.resolveTarget(this.context, target).as3Object;
      if (child1.parent !== child2.parent) {
        return; // must be the same parent
      }
      child1.parent.swapChildren(child1, child2);
    }

    public getTabChildren(): boolean {
      return this.as3Object.tabChildren;
    }

    public setTabChildren(value: boolean) {
      this.as3Object.tabChildren = alToBoolean(this.context, value);
    }

    public get_totalframes(): number {
      return this.as3Object.totalFrames;
    }

    public getTrackAsMenu() {
      Debug.notImplemented('AVM1MovieClip.getTrackAsMenu');
    }

    public setTrackAsMenu(value) {
      Debug.notImplemented('AVM1MovieClip.setTrackAsMenu');
    }

    public toString() {
      return this.__targetPath;
    }

    public unloadMovie() {
      var nativeObject = this.as3Object;
      // TODO remove movie clip content
      var loader = nativeObject.loaderInfo.loader;
      if (loader.parent) {
        loader.parent.removeChild(loader);
      }
      nativeObject.stop();
    }

    public getUseHandCursor() {
      return this.as3Object.useHandCursor;
    }

    public setUseHandCursor(value) {
      this.as3Object.useHandCursor = value;
    }

    public setParameters(parameters: any): any {
      for (var paramName in parameters) {
        if (!this.alHasProperty(paramName)) {
          this.alPut(paramName, parameters[paramName]);
        }
      }
    }

    // Special and children names properties resolutions

    private _resolveLevelNProperty(name: string): AVM1MovieClip {
      if (!this.context.isPropertyCaseSensitive) {
        name = name.toLowerCase();
      }
      if (name === '_level0') {
        return this.context.resolveLevel(0);
      } else if (name === '_root') {
        return this.context.resolveRoot();
      } else if (name.indexOf('_level') === 0) {
        var level = name.substring(6);
        var levelNum = <any>level | 0;
        if (levelNum > 0 && <any>level == levelNum) {
          return this.context.resolveLevel(levelNum)
        }
      }
      return null;
    }

    private _cachedPropertyResult;
    private _getCachedPropertyResult(value) {
      if (!this._cachedPropertyResult) {
        this._cachedPropertyResult = {
          flags: AVM1PropertyFlags.DATA | AVM1PropertyFlags.DONT_ENUM,
          value: value
        };
      } else {
        this._cachedPropertyResult.value = value;
      }
      return this._cachedPropertyResult;
    }

    public alGetOwnProperty(p): AVM1PropertyDescriptor {
      var desc = super.alGetOwnProperty(p);
      if (desc) {
        return desc;
      }
      var name = alToString(this.context, p);
      if (name[0] === '_') {
        var level = this._resolveLevelNProperty(name);
        if (level) {
          return this._getCachedPropertyResult(level);
        }
        // For MovieClip's properties that start from '_' case does not matter.
        if (PropertiesIndexMap.indexOf(name.toLowerCase()) >= 0) {
          return super.alGetOwnProperty(name.toLowerCase());
        }
      }
      if (this.isAVM1Instance) {
        var child = this._lookupChildByName(name);
        if (child) {
          return this._getCachedPropertyResult(child);
        }
      }
      return undefined;
    }

    public alGetOwnPropertiesKeys(): any [] {
      var keys = super.alGetOwnPropertiesKeys();
      // if it's a movie listing the children as well
      if (!this.isAVM1Instance) {
        return keys; // not initialized yet
      }

      var as3MovieClip = this.as3Object;
      if (as3MovieClip._children.length === 0) {
        return keys; // no children
      }

      var processed = Object.create(null);
      for (var i = 0; i < keys.length; i++) {
        processed[keys[i]] = true;
      }
      for (var i = 0, length = as3MovieClip._children.length; i < length; i++) {
        var child = as3MovieClip._children[i];
        var name = child.name;
        var normalizedName = name; // TODO something like this._unescapeProperty(this._escapeProperty(name));
        processed[normalizedName] = true;
      }
      return Object.getOwnPropertyNames(processed);
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
        this.as3Object.addFrameScript(frameIndex, this._boundExecuteFrameScripts);
      }
      var actionsData = this.context.actionsDataFactory.createActionsData(
        actionsBlock, 's' + this.as3Object._symbol.id + 'f' + frameIndex + 'i' + scripts.length);
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
      var avm2MovieClip = this.as3Object;
      var self = this;
      function listener (e) {
        if (avm2MovieClip.currentFrame !== frameIndex + 1) {
          return;
        }
        avm2MovieClip.removeEventListener('enterFrame', listener);

        var avm1Context = self.context;
        for (var i = 0; i < actionsBlocks.length; i++) {
          var actionsData = avm1Context.actionsDataFactory.createActionsData(
            actionsBlocks[i].actionsData, 's' + avm2MovieClip._symbol.id + 'f' + frameIndex + 'i' + i);
          avm1Context.executeActions(actionsData, self);
        }
      }
      avm2MovieClip.addEventListener('enterFrame', listener);
    }

    private _executeFrameScripts() {
      var context = this.context;
      var scripts: AVM1.AVM1ActionsData[] = this._frameScripts[this.as3Object.currentFrame];
      release || assert(scripts && scripts.length);
      for (var i = 0; i < scripts.length; i++) {
        var actionsData = scripts[i];
        context.executeActions(actionsData, this);
      }
    }

    private _init(initObject) {
      if (initObject instanceof AVM1Object) {
        alForEachProperty(initObject, (name: string) => {
          this.alPut(name, initObject.alGet(name));
        }, null);
      }
    }

    private _initEventsHandlers() {
      this.bindEvents([
        new AVM1EventHandler('onData', 'data'),
        new AVM1EventHandler('onDragOut', 'dragOut'),
        new AVM1EventHandler('onDragOver', 'dragOver'),
        new AVM1EventHandler('onEnterFrame', 'enterFrame'),
        new AVM1EventHandler('onKeyDown', 'keyDown'),
        new AVM1EventHandler('onKeyUp', 'keyUp'),
        new AVM1EventHandler('onKillFocus', 'focusOut', function (e) {
          return [e.relatedObject];
        }),
        new AVM1EventHandler('onLoad', 'load'),
        new AVM1EventHandler('onMouseDown', 'mouseDown'),
        new AVM1EventHandler('onMouseUp', 'mouseUp'),
        new AVM1MovieClipButtonModeEvent('onPress', 'mouseDown'),
        new AVM1MovieClipButtonModeEvent('onRelease', 'mouseUp'),
        new AVM1MovieClipButtonModeEvent('onReleaseOutside', 'releaseOutside'),
        new AVM1MovieClipButtonModeEvent('onRollOut', 'mouseOut'),
        new AVM1MovieClipButtonModeEvent('onRollOver', 'mouseOver'),
        new AVM1EventHandler('onSetFocus', 'focusIn', function (e) {
          return [e.relatedObject];
        }),
        new AVM1EventHandler( 'onUnload', 'unload')
      ]);
    }
  }
}
