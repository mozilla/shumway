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

  export class AVM1MovieClip extends AVM1SymbolBase<flash.display.MovieClip> {
    public static createAVM1Class(context: AVM1Context): AVM1Object {
      return wrapAVM1NativeClass(context, true, AVM1MovieClip,
        [],
        ['_alpha#', 'attachAudio', 'attachBitmap', 'attachMovie',
          'beginFill', 'beginBitmapFill', 'beginGradientFill', 'blendMode#',
          'cacheAsBitmap#', '_callFrame', 'clear', 'createEmptyMovieClip',
          'createTextField', '_currentframe#', 'curveTo', '_droptarget#',
          'duplicateMovieClip', 'enabled#', 'endFill', 'filters#', '_framesloaded#',
          'focusEnabled#', '_focusrect#', 'forceSmoothing#', 'getBounds',
          'getBytesLoaded', 'getBytesTotal', 'getDepth', 'getInstanceAtDepth',
          'getNextHighestDepth', 'getRect', 'getSWFVersion', 'getTextSnapshot',
          'getURL', 'globalToLocal', 'gotoAndPlay', 'gotoAndStop', '_height#',
          '_highquality#', 'hitArea#', 'hitTest', 'lineGradientStyle', 'listStyle',
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
      var lookupOptions = flash.display.LookupChildOptions.INCLUDE_NOT_INITIALIZED;
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

    public get_alpha() {
      return this.as3Object.alpha;
    }

    public set_alpha(value) {
      this.as3Object.alpha = value;
    }

    public attachAudio(id) {
      throw 'Not implemented: attachAudio';
    }

//    public attachBitmap(bmp:AVM1BitmapData, depth:number, pixelSnapping:String = 'auto', smoothing:Boolean = false):void {
//      var bitmap:flash.display.Bitmap = construct(flash.display.Bitmap, [bmp, pixelSnapping, smoothing]);
//      this._insertChildAtDepth(bitmap, depth);
//    }

    public _constructMovieClipSymbol(symbolId:string, name:string):flash.display.MovieClip {
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

    public attachMovie(symbolId, name, depth, initObject) {
      var mc = this._constructMovieClipSymbol(symbolId, name);
      if (!mc) {
        return undefined;
      }

      var as2mc = this._insertChildAtDepth(mc, depth);
      if (initObject instanceof AVM1Object) {
        alForEachProperty(initObject, (name: string) => {
          as2mc.alPut(name, initObject.alGet(name));
        }, null);
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

    public getBlendMode() {
      return this.as3Object.blendMode;
    }

    public setBlendMode(value) {
      this.as3Object.blendMode = value;
    }

    public getCacheAsBitmap() {
      return this.as3Object.cacheAsBitmap;
    }

    public setCacheAsBitmap(value) {
      this.as3Object.cacheAsBitmap = value;
    }

    public _callFrame(frame:any):any {
      var nativeAS3Object = <any> this.as3Object;
      nativeAS3Object._callFrame(frame);
    }

    public clear() {
      this.graphics.clear();
    }

    private _insertChildAtDepth<T extends flash.display.DisplayObject>(mc: T, depth:number): AVM1SymbolBase<T> {
      var nativeAS3Object = this.as3Object;
      nativeAS3Object.addTimelineObjectAtDepth(mc, Math.min(nativeAS3Object.numChildren, depth));
      // Bitmaps aren't reflected in AVM1, so the rest here doesn't apply.
      if (this.context.sec.flash.display.Bitmap.axIsType(mc)) {
        return null;
      }
      var as2mc = <AVM1SymbolBase<T>>getAVM1Object(mc, this.context);
      return as2mc;
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

    private  _duplicate(name:any, depth:any, initObject:any):any {
      var nativeAS3Object = <any> this.as3Object;
      nativeAS3Object._duplicate(name, depth, initObject);
    }

    public duplicateMovieClip(name, depth, initObject): AVM1MovieClip {
      var mc = this._duplicate(name, +depth, initObject);
      return <AVM1MovieClip>getAVM1Object(mc, this.context);
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

    public getFilters() {
      throw 'Not implemented: get$filters';
    }

    public setFilters(value) {
      throw 'Not implemented: set$filters';
    }

    public getFocusEnabled() {
      throw 'Not implemented: get$focusEnabled';
    }

    public setFocusEnabled(value) {
      throw 'Not implemented: set$focusEnabled';
    }

    public get_focusrect() {
      throw 'Not implemented: get$_focusrect';
    }

    public set_focusrect(value) {
      throw 'Not implemented: set$_focusrect';
    }

    public getForceSmoothing() {
      throw 'Not implemented: get$forceSmoothing';
    }

    public setForceSmoothing(value) {
      throw 'Not implemented: set$forceSmoothing';
    }

    public get_framesloaded() {
      return this.as3Object.framesLoaded;
    }

    public getBounds(bounds) {
      var obj = bounds.as3Object;
      if (!obj) {
        throw 'Unsupported bounds type';
      }
      return this.as3Object.getBounds(obj);
    }

    public getBytesLoaded(): number {
      var loaderInfo = this.as3Object.loaderInfo;
      return loaderInfo.bytesLoaded;
    }

    public getBytesTotal() {
      var loaderInfo = this.as3Object.loaderInfo;
      return loaderInfo.bytesTotal;
    }

    public getDepth() {
      return this.as3Object._depth;
    }

    public getInstanceAtDepth(depth: number): AVM1MovieClip {
      var nativeObject = this.as3Object;
      for (var i = 0, numChildren = nativeObject.numChildren; i < numChildren; i++) {
        var child = nativeObject._lookupChildByIndex(i);
        // child is null if it hasn't been constructed yet. This can happen in InitActionBlocks.
        if (child && child._depth === depth) {
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
      var maxDepth = 0;
      for (var i = 0, numChildren = nativeObject.numChildren; i < numChildren; i++) {
        var child = nativeObject._lookupChildByIndex(i);
        if (child._depth > maxDepth) {
          maxDepth = child._depth;
        }
      }
      return maxDepth + 1;
    }

    public getRect(bounds) {
      throw 'Not implemented: getRect';
    }

    public getSWFVersion() {
      var loaderInfo = this.as3Object.loaderInfo;
      return loaderInfo.swfVersion;
    }

    public getTextSnapshot() {
      throw 'Not implemented: getTextSnapshot';
    }

    public getURL(url, window, method) {
      var request = new this.context.sec.flash.net.URLRequest(url);
      if (method) {
        request.method = method;
      }
      Shumway.AVMX.AS.FlashNetScript_navigateToURL(request, window);
    }

    public globalToLocal(pt) {
      var sec = this.context.sec;
      var tmp: flash.geom.Point = this.as3Object.globalToLocal(
        new sec.flash.geom.Point(pt.alGet('x'), pt.alGet('y')));
      pt.alPut('x', tmp.x);
      pt.alPut('y', tmp.y);
    }

    public gotoAndPlay(frame) {
      return this.as3Object.gotoAndPlay(frame);
    }

    public gotoAndStop(frame) {
      return this.as3Object.gotoAndStop(frame);
    }

    public get_height() {
      return this.as3Object.height;
    }

    public set_height(value) {
      if (isNaN(value)) {
        return;
      }
      this.as3Object.height = value;
    }

    public get_highquality() {
      return 1;
    }

    public set_highquality(value) {
    }

    public getHitArea() {
      throw 'Not implemented: get$hitArea';
    }

    public setHitArea(value) {
      throw 'Not implemented: set$hitArea';
    }

    public hitTest(x, y, shapeFlag) {
      if (x instanceof AVM1MovieClip) {
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
      var sec = this.context.sec;
      var tmp: flash.geom.Point = this.as3Object.localToGlobal(
        new sec.flash.geom.Point(pt.alGet('x'), pt.alGet('y')));
      pt.alPut('x', tmp.x);
      pt.alPut('y', tmp.y);
    }

    public get_lockroot() {
      throw 'Not implemented: get$_lockroot';
    }

    public set_lockroot(value) {
      throw 'Not implemented: set$_lockroot';
    }

    public getMenu() {
      return this.as3Object.contextMenu;
    }

    public setMenu(value) {
      this.as3Object.contextMenu = value;
    }

    public moveTo(x, y) {
      this.graphics.moveTo(x, y);
    }

    public get_name() {
      return this.as3Object.name;
    }

    public set_name(value) {
      this.as3Object.name = value;
    }

    public nextFrame() {
      this.as3Object.nextFrame();
    }

    public nextScene() {
      this.as3Object.nextScene();
    }

    public getOpaqueBackground() {
      return this.as3Object.opaqueBackground;
    }

    public setOpaqueBackground(value) {
      this.as3Object.opaqueBackground = value;
    }

    public get_parent(): AVM1MovieClip {
      var parent = getAVM1Object(this.as3Object.parent, this.context);
      // In AVM1, the _parent property is `undefined`, not `null` if the element has no parent.
      return <AVM1MovieClip>parent || undefined;
    }

    public set_parent(value) {
      throw 'Not implemented: set$_parent';
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

    public get_quality() {
      return 'HIGH';
    }

    public set_quality(value) {
    }

    public removeMovieClip() {
      var parent = this.get_parent().as3Object;
      parent.removeChild(this.as3Object);
    }

    public get_rotation() {
      return this.as3Object.rotation;
    }

    public set_rotation(value) {
      this.as3Object.rotation = value;
    }

    public getScale9Grid() {
      throw 'Not implemented: get$scale9Grid';
    }

    public setScale9Grid(value) {
      throw 'Not implemented: set$scale9Grid';
    }

    public getScrollRect() {
      throw 'Not implemented: get$scrollRect';
    }

    public setScrollRect(value) {
      throw 'Not implemented: set$scrollRect';
    }

    public setMask(mc:Object) {
      var nativeObject = this.as3Object;
      var mask = AVM1Utils.resolveMovieClip(this.context, mc);
      if (mask) {
        nativeObject.mask = mask.as3Object;
      }
    }

    public get_soundbuftime() {
      throw 'Not implemented: get$_soundbuftime';
    }

    public set_soundbuftime(value) {
      throw 'Not implemented: set$_soundbuftime';
    }

    public startDrag(lock, left, top?, right?, bottom?) {
      this.as3Object.startDrag(lock, arguments.length < 3 ?
                                     null :
                                     new this.context.sec.flash.geom.Rectangle(left, top,
                                                                               right - left,
                                                                               bottom - top));
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

    public getTabChildren() {
      return this.as3Object.tabChildren;
    }

    public setTabChildren(value) {
      this.as3Object.tabChildren = value;
    }

    public getTabEnabled() {
      return this.as3Object.tabEnabled;
    }

    public setTabEnabled(value) {
      this.as3Object.tabEnabled = value;
    }

    public getTabIndex() {
      return this.as3Object.tabIndex;
    }

    public setTabIndex(value) {
      this.as3Object.tabIndex = value;
    }

    public get_target() {
      var nativeObject: flash.display.DisplayObject = this.as3Object;
      if (nativeObject === nativeObject.root) {
        return '/';
      }
      var path = '';
      do {
        path = '/' + nativeObject.name + path;
        nativeObject = nativeObject.parent;
      } while (nativeObject !== nativeObject.root);
      return path;
    }

    public get_totalframes() {
      return this.as3Object.totalFrames;
    }

    public getTrackAsMenu() {
      throw 'Not implemented: get$trackAsMenu';
    }

    public setTrackAsMenu(value) {
      throw 'Not implemented: set$trackAsMenu';
    }

    public getTransform() {
      throw 'Not implemented: get$transform';
    }

    public setTransform(value) {
      throw 'Not implemented: set$transform';
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

    public get_url() {
      return this.as3Object.loaderInfo.url;
    }

    public getUseHandCursor() {
      return this.as3Object.useHandCursor;
    }

    public setUseHandCursor(value) {
      this.as3Object.useHandCursor = value;
    }

    public get_visible() {
      return this.as3Object.visible;
    }

    public set_visible(value) {
      this.as3Object.visible = +value !== 0;
    }

    public get_width() {
      return this.as3Object.width;
    }

    public set_width(value) {
      if (isNaN(value)) {
        return;
      }
      this.as3Object.width = value;
    }

    public get_x() {
      return this.as3Object.x;
    }

    public set_x(value) {
      if (isNaN(value)) {
        return;
      }
      this.as3Object.x = value;
    }

    public get_xmouse() {
      return this.as3Object.mouseX;
    }

    public get_xscale() {
      return this.as3Object.scaleX * 100;
    }

    public set_xscale(value) {
      if (isNaN(value)) {
        return;
      }
      this.as3Object.scaleX = value / 100;
    }

    public get_y() {
      return this.as3Object.y;
    }

    public set_y(value) {
      if (isNaN(value)) {
        return;
      }
      this.as3Object.y = value;
    }

    public get_ymouse() {
      return this.as3Object.mouseY;
    }

    public get_yscale() {
      return this.as3Object.scaleY * 100;
    }

    public set_yscale(value) {
      if (isNaN(value)) {
        return;
      }
      this.as3Object.scaleY = value / 100;
    }

    // Special and children names properties resolutions

    private _resolveLevelNProperty(name: string): AVM1MovieClip {
      if (!this.context.isPropertyCaseSensitive) {
        name = name.toLowerCase();
      }
      if (name === '_root' || name === '_level0') {
        return this.context.resolveLevel(0);
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
          flags: AVM1PropertyFlags.DATA | AVM1PropertyFlags.DONT_DELETE | AVM1PropertyFlags.DONT_ENUM,
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
