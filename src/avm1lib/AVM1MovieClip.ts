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
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import construct = Shumway.AVM2.Runtime.construct;
  import AVM1Context = Shumway.AVM1.AVM1Context;
  import Bitmap = flash.display.Bitmap;


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
    }

    private _nativeAS3Object: flash.display.MovieClip;

    // JS -> AS Bindings

    __lookupChild: (id: string) => any;
    __targetPath: any;

    // AS -> JS Bindings

    // __as3Object: flash.display.MovieClip;
    _init(nativeMovieClip: flash.display.MovieClip): any {
      if (!nativeMovieClip) {
        return; // delaying initialization, see also _constructSymbol
      }
      this._nativeAS3Object = nativeMovieClip;
      (<any> nativeMovieClip)._as2Object = this;
      initDefaultListeners(this);
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
      var theClass = AVM1Context.instance.classes && AVM1Context.instance.classes[symbolId];
      var symbol = AVM1Context.instance.getAsset(symbolId);

      var mc: flash.display.MovieClip = flash.display.MovieClip.initializeFrom(symbol);
      flash.display.MovieClip.instanceConstructorNoInitialize.call(mc);
      mc._as2SymbolClass = theClass;
      mc._name = name;

      return mc;
    }
    _callFrame(frame: any): any {
      var nativeAS3Object = <any> this._nativeAS3Object;
      nativeAS3Object._callFrame(frame);
    }
    _insertChildAtDepth(mc: any, depth: number): AVM1MovieClip {
      var nativeAS3Object = <flash.display.MovieClip> this._nativeAS3Object;
      nativeAS3Object.addTimelineObjectAtDepth(mc, Math.min(nativeAS3Object.numChildren, depth));
      // Bitmaps aren't reflected in AS2, so the rest here doesn't apply.
      if (flash.display.Bitmap.isType(mc)) {
        return null;
      }
      var as2mc = getAS2Object(mc);
      var name:string = mc.name;
      if (name) {
        this.asSetPublicProperty(name, as2mc);
      }
      return as2mc;
    }

    getInstanceAtDepth(depth: number): AVM1MovieClip {
      var nativeObject = this._nativeAS3Object;
      for (var i = 0, numChildren = nativeObject.numChildren; i < numChildren; i++) {
        var child = nativeObject.getChildAt(i);
        // child is null if it hasn't been constructed yet. This can happen in InitActionBlocks.
        if (child && child._depth === depth) {
          // Somewhat absurdly, this method returns the mc if a bitmap is at the given depth.
          if (flash.display.Bitmap.isType(child)) {
            return this;
          }
          return getAS2Object(child);
        }
      }
      return null;
    }
    getNextHighestDepth() {
      var nativeObject = this._nativeAS3Object;
      var maxDepth = 0;
      for (var i = 0, numChildren = nativeObject.numChildren; i < numChildren; i++) {
        var child = nativeObject.getChildAt(i);
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
    _gotoLabel(label: any): any {
      var nativeAS3Object = <any> this._nativeAS3Object;
      nativeAS3Object._gotoFrame(label, null);
    }
  }
}
