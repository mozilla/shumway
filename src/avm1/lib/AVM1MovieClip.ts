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
      mc._as3Object.buttonMode = true;
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
          '_focusrect#', 'forceSmoothing#', 'getBounds',
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

    private _hitArea: any;
    private _lockroot: boolean;

    private get graphics() : flash.display.Graphics {
      return this._as3Object.graphics;
    }

    public initAVM1SymbolInstance(context: AVM1Context, as3Object: flash.display.MovieClip) {
      this._childrenByName = Object.create(null);
      super.initAVM1SymbolInstance(context, as3Object);
      this._initEventsHandlers();
    }

    _lookupChildByName(name: string): AVM1Object {
      release || assert(alIsName(this.context, name));
      return this._childrenByName[name];
    }

    private _lookupChildInAS3Object(name: string): AVM1Object {
      var lookupOptions = flash.display.LookupChildOptions.INCLUDE_NON_INITIALIZED;
      if (!this.context.isPropertyCaseSensitive) {
        lookupOptions |= flash.display.LookupChildOptions.IGNORE_CASE;
      }
      var as3Child = this._as3Object._lookupChildByName(name, lookupOptions);
      return getAVM1Object(as3Child, this.context);
    }

    public get __targetPath() {
      var target = this.get_target();
      var prefix = '_level0'; // TODO use needed level number here
      return target != '/' ? prefix + target.replace(/\//g, '.') : prefix;
    }

    public attachAudio(id: any): void {
      if (Shumway.isNullOrUndefined(id)) {
        return; // ignoring all undefined objects, probably nothing to attach
      }
      if (id === false) {
        return; // TODO stop playing all attached audio source (when implemented).
      }
      // TODO implement NetStream and Microphone objects to make this work.
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
      symbolId = alToString(this.context, symbolId);
      name = alToString(this.context, name);

      var symbol = this.context.getAsset(symbolId);
      if (!symbol) {
        return undefined;
      }

      var props: flash.display.SpriteSymbol = Object.create(symbol.symbolProps);
      props.avm1Name = name;

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

    public beginFill(color: number, alpha: number = 100): void {
      color = alToInt32(this.context, color);
      alpha = alToNumber(this.context, alpha);
      this.graphics.beginFill(color, alpha / 100.0);
    }

    public beginBitmapFill(bmp: AVM1BitmapData, matrix: AVM1Object = null,
                           repeat: boolean = false, smoothing: boolean = false): void {
      if (!alInstanceOf(this.context, bmp, this.context.globals.BitmapData)) {
        return; // skipping operation if first parameter is not a BitmapData.
      }
      var bmpNative = toAS3BitmapData(bmp);
      var matrixNative = Shumway.isNullOrUndefined(matrix) ? null : toAS3Matrix(matrix);
      repeat = alToBoolean(this.context, repeat);
      smoothing = alToBoolean(this.context, smoothing);

      this.graphics.beginBitmapFill(bmpNative, matrixNative, repeat, smoothing);
    }

    public beginGradientFill(fillType: string, colors: AVM1Object, alphas: AVM1Object,
                             ratios: AVM1Object, matrix: AVM1Object,
                             spreadMethod: string = 'pad', interpolationMethod: string = 'rgb',
                             focalPointRatio: number = 0.0): void {
      var context = this.context, sec = context.sec;
      fillType = alToString(this.context, fillType);
      var colorsNative = sec.createArray(
        Natives.AVM1ArrayNative.mapToJSArray(colors, (item) => alToInt32(this.context, item)));
      var alphasNative = sec.createArray(
        Natives.AVM1ArrayNative.mapToJSArray(alphas, (item) => alToNumber(this.context, item) / 100.0));
      var ratiosNative = sec.createArray(
        Natives.AVM1ArrayNative.mapToJSArray(ratios, (item) => alToNumber(this.context, item)));
      var matrixNative = null;
      if (Shumway.isNullOrUndefined(matrix)) {
        Debug.somewhatImplemented('AVM1MovieClip.beginGradientFill');
      }
      spreadMethod = alToString(this.context, spreadMethod);
      interpolationMethod = alToString(this.context, interpolationMethod);
      focalPointRatio = alToNumber(this.context, focalPointRatio);
      this.graphics.beginGradientFill(fillType, colorsNative, alphasNative, ratiosNative, matrixNative,
                                      spreadMethod, interpolationMethod, focalPointRatio);
    }

    public _callFrame(frame:any):any {
      var nativeAS3Object = this._as3Object;
      nativeAS3Object._callFrame(frame);
    }

    public clear(): void {
      this.graphics.clear();
    }

    /**
     * This map stores the AVM1MovieClip's children keyed by their names. It's updated by all
     * operations that can cause different results for name-based lookups. these are
     * addition/removal of children and swapDepths.
     *
     * Using this map instead of always relaying lookups to the AVM2 MovieClip substantially
     * reduces the time spent in looking up children. In some cases by two orders of magnitude.
     */
    private _childrenByName: Map<string, AVM1MovieClip>;

    private _insertChildAtDepth<T extends flash.display.DisplayObject>(mc: T, depth:number): AVM1Object {
      var oldChild = this.getInstanceAtDepth(depth);
      if (oldChild) {
        var oldAS3Object = oldChild._as3Object;
        oldAS3Object.parent.removeChild(oldAS3Object);
      }
      var symbolDepth = alCoerceNumber(this.context, depth) + DEPTH_OFFSET;
      var nativeAS3Object = this._as3Object;
      nativeAS3Object.addTimelineObjectAtDepth(mc, symbolDepth);
      // Bitmaps aren't reflected in AVM1, so the rest here doesn't apply.
      if (this.context.sec.flash.display.Bitmap.axIsType(mc)) {
        return null;
      }
      return getAVM1Object(mc, this.context);
    }

    public _updateChildName(child: AVM1MovieClip, oldName: string, newName: string) {
      oldName && this._removeChildName(child, oldName);
      newName && this._addChildName(child, newName);
    }
    _removeChildName(child: IAVM1SymbolBase, name: string) {
      release || assert(name);
      if (!this.context.isPropertyCaseSensitive) {
        name = name.toLowerCase();
      }
      release || assert(this._childrenByName[name]);
      if (this._childrenByName[name] !== child) {
        return;
      }
      var newChildForName = this._lookupChildInAS3Object(name);
      if (newChildForName) {
        this._childrenByName[name] = newChildForName;
      } else {
        delete this._childrenByName[name];
      }
    }

    _addChildName(child: IAVM1SymbolBase, name: string) {
      release || assert(name);
      if (!this.context.isPropertyCaseSensitive) {
        name = name.toLowerCase();
      }
      release || assert(this._childrenByName[name] !== child);
      var currentChild = this._childrenByName[name];
      if (!currentChild || currentChild.getDepth() > child.getDepth()) {
        this._childrenByName[name] = child;
      }
    }

    public createEmptyMovieClip(name, depth): AVM1MovieClip {
      name = alToString(this.context, name);
      var mc: flash.display.MovieClip = new this.context.sec.flash.display.MovieClip();
      mc.name = name;
      return <AVM1MovieClip>this._insertChildAtDepth(mc, depth);
    }

    public createTextField(name, depth, x, y, width, height): AVM1TextField {
      name = alToString(this.context, name);
      var text: flash.text.TextField = new this.context.sec.flash.text.TextField();
      text.name = name;
      text.x = x;
      text.y = y;
      text.width = width;
      text.height = height;
      return <AVM1TextField>this._insertChildAtDepth(text, depth);
    }

    public get_currentframe() {
      return this._as3Object.currentFrame;
    }

    public curveTo(controlX: number, controlY: number, anchorX: number, anchorY: number): void {
      controlX = alToNumber(this.context, controlX);
      controlY = alToNumber(this.context, controlY);
      anchorX = alToNumber(this.context, anchorX);
      anchorY = alToNumber(this.context, anchorY);
      this.graphics.curveTo(controlX, controlY, anchorX, anchorY);
    }

    public get_droptarget() {
      return this._as3Object.dropTarget;
    }

    public duplicateMovieClip(name, depth, initObject): AVM1MovieClip {
      name = alToString(this.context, name);
      var parent = this.context.resolveTarget(null);
      var nativeAS3Object = this._as3Object;
      var mc: flash.display.MovieClip;
      if (nativeAS3Object._symbol) {
        mc = Shumway.AVMX.AS.constructClassFromSymbol(nativeAS3Object._symbol, nativeAS3Object.axClass);
      } else {
        mc = new this.context.sec.flash.display.MovieClip();
      }
      mc.name = name;

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
      return getAS3ObjectOrTemplate(this).enabled;
    }

    public setEnabled(value) {
      getAS3ObjectOrTemplate(this).enabled = value;
    }

    public endFill(): void {
      this.graphics.endFill();
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
      return this._as3Object.framesLoaded;
    }

    public getBounds(bounds): AVM1Object {
      var obj = <flash.display.InteractiveObject>getAS3Object(bounds);
      if (!obj) {
        return undefined;
      }
      return convertAS3RectangeToBounds(this._as3Object.getBounds(obj));
    }

    public getBytesLoaded(): number {
      var loaderInfo = this._as3Object.loaderInfo;
      return loaderInfo.bytesLoaded;
    }

    public getBytesTotal() {
      var loaderInfo = this._as3Object.loaderInfo;
      return loaderInfo.bytesTotal;
    }

    public getInstanceAtDepth(depth: number): AVM1MovieClip {
      var symbolDepth = alCoerceNumber(this.context, depth) + DEPTH_OFFSET;
      var nativeObject = this._as3Object;
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
      return undefined;
    }

    public getNextHighestDepth(): number {
      var nativeObject = this._as3Object;
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
      var obj = <flash.display.InteractiveObject>getAS3Object(bounds);
      if (!obj) {
        return undefined;
      }
      return convertAS3RectangeToBounds(this._as3Object.getRect(obj));
    }

    public getSWFVersion(): number {
      var loaderInfo = this._as3Object.loaderInfo;
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
      var tmp = this._as3Object.globalToLocal(toAS3Point(pt));
      copyAS3PointTo(tmp, pt);
    }

    public gotoAndPlay(frame) {
      this._as3Object.gotoAndPlay(frame);
    }

    public gotoAndStop(frame) {
      this._as3Object.gotoAndStop(frame);
    }

    public getHitArea() {
      return this._hitArea;
    }

    public setHitArea(value) {
      // The hitArea getter always returns exactly the value set here, so we have to store that.
      this._hitArea = value;
      var obj = value ? <flash.display.InteractiveObject>getAS3Object(value) : null;
      // If the passed-in value isn't a MovieClip, reset the hitArea.
      if (!this.context.sec.flash.display.MovieClip.axIsType(obj)) {
        obj = null;
      }
      this._as3Object.hitArea = obj;
    }

    public hitTest(x: number, y: number, shapeFlag: boolean): boolean {
      if (arguments.length <= 1) {
        // Alternative method signature: hitTest(target: AVM1Object): boolean
        var target = arguments[0];
        if (Shumway.isNullOrUndefined(target) || !hasAS3ObjectReference(target)) {
          return false; // target is undefined or not a AVM1 display object, returning false.
        }
        return this._as3Object.hitTestObject(<flash.display.InteractiveObject>getAS3Object(target));
      }
      x = alToNumber(this.context, x);
      y = alToNumber(this.context, y);
      shapeFlag = alToBoolean(this.context, shapeFlag);
      return this._as3Object.hitTestPoint(x, y, shapeFlag);
    }

    public lineGradientStyle(fillType: string, colors: AVM1Object, alphas: AVM1Object,
                             ratios: AVM1Object, matrix: AVM1Object,
                             spreadMethod: string = 'pad', interpolationMethod: string = 'rgb',
                             focalPointRatio: number = 0.0): void {
      var context = this.context, sec = context.sec;
      fillType = alToString(this.context, fillType);
      var colorsNative = sec.createArray(
        Natives.AVM1ArrayNative.mapToJSArray(colors, (item) => alToInt32(this.context, item)));
      var alphasNative = sec.createArray(
        Natives.AVM1ArrayNative.mapToJSArray(alphas, (item) => alToNumber(this.context, item) / 100.0));
      var ratiosNative = sec.createArray(
        Natives.AVM1ArrayNative.mapToJSArray(ratios, (item) => alToNumber(this.context, item)));
      var matrixNative = null;
      if (Shumway.isNullOrUndefined(matrix)) {
        Debug.somewhatImplemented('AVM1MovieClip.lineGradientStyle');
      }
      spreadMethod = alToString(this.context, spreadMethod);
      interpolationMethod = alToString(this.context, interpolationMethod);
      focalPointRatio = alToNumber(this.context, focalPointRatio);
      this.graphics.lineGradientStyle(fillType, colorsNative, alphasNative, ratiosNative, matrixNative,
                                      spreadMethod, interpolationMethod, focalPointRatio);
    }

    public lineStyle(thickness: number = NaN, rgb: number = 0x000000,
                     alpha: number = 100, pixelHinting: boolean = false,
                     noScale: string = 'normal', capsStyle: string = 'round',
                     jointStyle: string = 'round', miterLimit: number = 3): void {
      thickness = alToNumber(this.context, thickness);
      rgb = alToInt32(this.context, rgb);
      pixelHinting = alToBoolean(this.context, pixelHinting);
      noScale = alToString(this.context, noScale);
      capsStyle = alToString(this.context, capsStyle);
      jointStyle = alToString(this.context, jointStyle);
      miterLimit = alToNumber(this.context, miterLimit);
      this.graphics.lineStyle(thickness, rgb, alpha / 100.0, pixelHinting,
                              noScale, capsStyle, jointStyle, miterLimit);
    }

    public lineTo(x: number, y: number): void {
      x = alToNumber(this.context, x);
      y = alToNumber(this.context, y);
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
        var parent: flash.display.MovieClip = this._as3Object.parent;
        var depth = parent.getChildIndex(this._as3Object);
        parent.removeChild(this._as3Object);
        parent.addChildAt(loader.content, depth);
      }

      loader.addEventListener(flash.events.Event.COMPLETE, completeHandler);
    }

    public loadVariables(url: string, method?: string) {
      // REDUX move _loadVariables here?
      (<any>this.context).actions._loadVariables(this, url, method);
    }

    public localToGlobal(pt) {
      var tmp = this._as3Object.localToGlobal(toAS3Point(pt));
      copyAS3PointTo(tmp, pt);
    }

    public get_lockroot(): boolean {
      return this._lockroot;
    }

    public set_lockroot(value: boolean) {
      Debug.somewhatImplemented('AVM1MovieClip._lockroot');
      this._lockroot = alToBoolean(this.context, value);
    }

    public moveTo(x: number, y: number): void {
      x = alToNumber(this.context, x);
      y = alToNumber(this.context, y);
      this.graphics.moveTo(x, y);
    }

    public nextFrame() {
      this._as3Object.nextFrame();
    }

    public nextScene() {
      this._as3Object.nextScene();
    }

    public play() {
      this._as3Object.play();
    }

    public prevFrame() {
      this._as3Object.prevFrame();
    }

    public prevScene() {
      this._as3Object.prevScene();
    }

    public removeMovieClip() {
      var as2Parent = this.get_parent();
      if (!as2Parent) {
        return; // let's not remove root symbol
      }
      as2Parent._removeChildName(this, this._as3Object.name);
      as2Parent._as3Object.removeChild(this._as3Object);
    }

    public setMask(mc:Object) {
      var nativeObject = this._as3Object;
      var mask = AVM1Utils.resolveMovieClip(this.context, mc);
      if (mask) {
        nativeObject.mask = <flash.display.InteractiveObject>getAS3Object(mask);
      }
    }

    public startDrag(lock?: boolean, left?: number, top?: number, right?: number, bottom?: number): void {
      lock = alToBoolean(this.context, lock);
      var bounds = null;
      if (arguments.length > 1) {
        left = alToNumber(this.context, left);
        top = alToNumber(this.context, top);
        right = alToNumber(this.context, right);
        bottom = alToNumber(this.context, bottom);
        bounds = new this.context.sec.flash.geom.Rectangle(left, top, right - left, bottom - top);
      }
      this._as3Object.startDrag(lock, bounds);
    }

    public stop() {
      return this._as3Object.stop();
    }

    public stopDrag() {
      return this._as3Object.stopDrag();
    }

    public swapDepths(target:Object) {
      var target_mc = AVM1Utils.resolveLevelOrTarget(this.context, target);
      if (!target_mc) {
        // Don't swap with non-existent target.
        return;
      }
      var child1 = this._as3Object;
      var child2 = target_mc._as3Object;
      if (child1.parent !== child2.parent) {
        return; // must be the same parent
      }
      child1.parent.swapChildren(child1, child2);
      var lower;
      var higher;
      if (this.getDepth() < target_mc.getDepth()) {
        lower = this;
        higher = target_mc;
      } else {
        lower = target_mc;
        higher = this;
      }
      var lowerName = (<flash.display.InteractiveObject>getAS3Object(lower)).name;
      var higherName = (<flash.display.InteractiveObject>getAS3Object(higher)).name;
      if (this._lookupChildInAS3Object(lowerName) !== lower) {
        this._removeChildName(lower, lowerName);
      }
      if (this._lookupChildInAS3Object(higherName) !== higher) {
        this._addChildName(higher, higherName);
      }
    }

    public getTabChildren(): boolean {
      return getAS3ObjectOrTemplate(this).tabChildren;
    }

    public setTabChildren(value: boolean) {
      getAS3ObjectOrTemplate(this).tabChildren = alToBoolean(this.context, value);
    }

    public get_totalframes(): number {
      return this._as3Object.totalFrames;
    }

    public getTrackAsMenu(): boolean {
      return getAS3ObjectOrTemplate(this).trackAsMenu;
    }

    public setTrackAsMenu(value: boolean) {
      getAS3ObjectOrTemplate(this).trackAsMenu = alToBoolean(this.context, value);
    }

    public toString() {
      return this.__targetPath;
    }

    public unloadMovie() {
      var nativeObject = this._as3Object;
      // TODO remove movie clip content
      var loader = nativeObject.loaderInfo.loader;
      if (loader.parent) {
        loader.parent.removeChild(loader);
      }
      nativeObject.stop();
    }

    public getUseHandCursor() {
      getAS3ObjectOrTemplate(this).useHandCursor;
    }

    public setUseHandCursor(value) {
      getAS3ObjectOrTemplate(this).useHandCursor = value;
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
      release || assert(alIsName(this.context, name));
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

    public alGetOwnProperty(name): AVM1PropertyDescriptor {
      var desc = super.alGetOwnProperty(name);
      if (desc) {
        return desc;
      }
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
      if (hasAS3ObjectReference(this)) {
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
      if (!hasAS3ObjectReference(this)) {
        return keys; // not initialized yet
      }

      var as3MovieClip = this._as3Object;
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
        new AVM1EventHandler('onMouseMove', 'mouseMove'),
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
