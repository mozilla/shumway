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
// Class: AS2MovieClip
module Shumway.AVM2.AS.avm1lib {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import AS2Context = Shumway.AVM1.AS2Context;


  export class AS2MovieClip extends ASNative {

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
    _constructSymbol(symbolId: string, name: string): flash.display.MovieClip {
      var theClass = AS2Context.instance.classes && AS2Context.instance.classes[symbolId];
      var symbol = AS2Context.instance.getAsset(symbolId);

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
    _insertChildAtDepth(mc: any, depth: any): any {
      var nativeAS3Object = <flash.display.MovieClip> this._nativeAS3Object;
      nativeAS3Object.addChildAtDepth(mc, Math.min(nativeAS3Object.numChildren, depth));
      var name: string = mc.name;
      if (name) {
        this.asSetPublicProperty(name, mc);
      }
      return mc;
    }
    _duplicate(name: any, depth: any, initObject: any): any {
      var nativeAS3Object = <any> this._nativeAS3Object;
      nativeAS3Object._duplicate(name, depth, initObject);
    }
    _gotoLabel(label: any): any {
      var nativeAS3Object = <any> this._nativeAS3Object;
      nativeAS3Object.gotoLabel(label);
    }
  }
}
