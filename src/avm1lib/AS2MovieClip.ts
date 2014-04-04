/**
 * Copyright 2013 Mozilla Foundation
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
// Class: AS2MovieClip
module Shumway.AVM2.AS.avm1lib {
  import notImplemented = Shumway.Debug.notImplemented;
  import MovieClip = Shumway.AVM2.AS.flash.display.MovieClip;
  import AS2Context = Shumway.AVM1.AS2Context;


  export class AS2MovieClip extends ASNative {

    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // Called whenever an instance of the class is initialized.
    static initializer: any = null;

    // List of static symbols to link.
    static staticBindings: string [] = null;

    // List of instance symbols to link.
    static bindings: string [] = ["__lookupChild", "__targetPath", "_alpha", "_alpha", "attachAudio", "attachBitmap", "attachMovie", "beginFill", "beginBitmapFill", "beginGradientFill", "blendMode", "blendMode", "cacheAsBitmap", "cacheAsBitmap", "clear", "createEmptyMovieClip", "createTextField", "_currentframe", "curveTo", "_droptarget", "duplicateMovieClip", "enabled", "enabled", "endFill", "filters", "filters", "focusEnabled", "focusEnabled", "_focusrect", "_focusrect", "forceSmoothing", "forceSmoothing", "_framesloaded", "getBounds", "getBytesLoaded", "getBytesTotal", "getDepth", "getInstanceAtDepth", "getNextHighestDepth", "getRect", "getSWFVersion", "getTextSnapshot", "getURL", "globalToLocal", "gotoAndPlay", "gotoAndStop", "_height", "_height", "_highquality", "_highquality", "hitArea", "hitArea", "hitTest", "lineGradientStyle", "lineStyle", "lineTo", "loadMovie", "loadVariables", "localToGlobal", "_lockroot", "_lockroot", "menu", "menu", "moveTo", "_name", "_name", "nextFrame", "opaqueBackground", "opaqueBackground", "_parent", "_parent", "play", "prevFrame", "_quality", "_quality", "removeMovieClip", "_rotation", "_rotation", "scale9Grid", "scale9Grid", "scrollRect", "scrollRect", "setMask", "_soundbuftime", "_soundbuftime", "startDrag", "stop", "stopDrag", "swapDepths", "tabChildren", "tabChildren", "tabEnabled", "tabEnabled", "tabIndex", "tabIndex", "_target", "_totalframes", "trackAsMenu", "trackAsMenu", "transform", "transform", "toString", "unloadMovie", "_url", "useHandCursor", "useHandCursor", "_visible", "_visible", "_width", "_width", "_x", "_x", "_xmouse", "_xscale", "_xscale", "_y", "_y", "_ymouse", "_yscale", "_yscale"];

    constructor (nativeMovieClip: MovieClip) {
      false && super();
    }

    private _nativeAS3Object: MovieClip;

    // JS -> AS Bindings

    __lookupChild: (id: string) => any;
    __targetPath: any;
    _alpha: any;
    attachAudio: (id: any) => any;
    attachBitmap: (bmp: any, depth: any, pixelSnapping: any, smoothing: any) => any;
    attachMovie: (symbolId: any, name: any, depth: any, initObject: any) => any;
    beginFill: (color: any, alpha: any) => any;
    beginBitmapFill: (bmp: any, matrix: any, repeat: any, smoothing: any) => any;
    beginGradientFill: (fillType: any, colors: any, alphas: any, ratios: any, matrix: any, spreadMethod: any, interpolationMethod: any, focalPointRatio: any) => any;
    blendMode: any;
    cacheAsBitmap: any;
    clear: () => any;
    createEmptyMovieClip: (name: any, depth: any) => any;
    createTextField: (name: any, depth: any, x: any, y: any, width: any, height: any) => any;
    _currentframe: any;
    curveTo: (controlX: any, controlY: any, anchorX: any, anchorY: any) => any;
    _droptarget: any;
    duplicateMovieClip: (name: any, depth: any, initObject: any) => any;
    enabled: any;
    endFill: () => any;
    filters: any;
    focusEnabled: any;
    _focusrect: any;
    forceSmoothing: any;
    _framesloaded: any;
    getBounds: (bounds: any) => any;
    getBytesLoaded: () => any;
    getBytesTotal: () => any;
    getDepth: () => any;
    getInstanceAtDepth: (depth: any) => any;
    getNextHighestDepth: () => any;
    getRect: (bounds: any) => any;
    getSWFVersion: () => any;
    getTextSnapshot: () => any;
    getURL: (url: any, window: any, method: any) => any;
    globalToLocal: (pt: any) => any;
    gotoAndPlay: (frame: any) => any;
    gotoAndStop: (frame: any) => any;
    _height: any;
    _highquality: any;
    hitArea: any;
    hitTest: (x: any, y: any, shapeFlag: any) => any;
    lineGradientStyle: (fillType: any, colors: any, alphas: any, ratios: any, matrix: any, spreadMethod: any, interpolationMethod: any, focalPointRatio: any) => any;
    lineStyle: (thickness: any, rgb: any, alpha: any, pixelHinting: any, noScale: any, capsStyle: any, jointStyle: any, miterLimit: any) => any;
    lineTo: (x: any, y: any) => any;
    loadMovie: (url: string, method: string) => any;
    loadVariables: (url: any, method: any) => any;
    localToGlobal: (pt: any) => any;
    _lockroot: any;
    menu: any;
    moveTo: (x: any, y: any) => any;
    _name: any;
    nextFrame: () => any;
    opaqueBackground: any;
    _parent: any;
    play: () => any;
    prevFrame: () => any;
    _quality: any;
    removeMovieClip: () => any;
    _rotation: any;
    scale9Grid: any;
    scrollRect: any;
    setMask: (mc: ASObject) => any;
    _soundbuftime: any;
    startDrag: (lock: any, left: any, top: any, right: any, bottom: any) => any;
    stop: () => any;
    stopDrag: () => any;
    swapDepths: (target: ASObject) => any;
    tabChildren: any;
    tabEnabled: any;
    tabIndex: any;
    _target: any;
    _totalframes: any;
    trackAsMenu: any;
    transform: any;
    unloadMovie: () => any;
    _url: any;
    useHandCursor: any;
    _visible: any;
    _width: any;
    _x: any;
    _xmouse: any;
    _xscale: any;
    _y: any;
    _ymouse: any;
    _yscale: any;

    // AS -> JS Bindings

    // __as3Object: flash.display.MovieClip;
    _init(nativeMovieClip: MovieClip): any {
      if (!nativeMovieClip) {
        return; // delaying initialization, see also _constructSymbol
      }
      this._nativeAS3Object = nativeMovieClip;
      (<any> nativeMovieClip)._as2Object = this;
      initDefaultListeners(this);
    }
    get _as3Object(): MovieClip {
      return this._nativeAS3Object;
    }
    _constructSymbol(symbolId: any, name: any): any {
      var theClass = AS2Context.instance.classes && AS2Context.instance.classes[symbolId];
      var symbolProps = AS2Context.instance.getAsset(symbolId);

      var symbolClass = MovieClip;
      var mc = symbolClass.createAsSymbol(symbolProps);
      mc._avm1SymbolClass = theClass;
      symbolClass.instanceConstructor.call(mc);
      this._nativeAS3Object.addChild(mc);

      return mc;
    }
    _callFrame(frame: any): any {
      this._nativeAS3Object._callFrame(frame);
    }
    _insertChildAtDepth(mc: any, depth: any): any {
      return this._nativeAS3Object._insertChildAtDepth(mc, depth);
    }
    _duplicate(name: any, depth: any, initObject: any): any {
      return this._nativeAS3Object._duplicate(name, depth, initObject);
    }
    _gotoLabel(label: any): any {
      this._nativeAS3Object.gotoLabel(label);
    }
  }
}
