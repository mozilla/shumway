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
  import MovieClip = Shumway.AVM2.AS.flash.display.MovieClip;
  import AS2Context = Shumway.AVM1.AS2Context;


  export class AS2MovieClip extends ASNative {

    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // Called whenever an instance of the class is initialized.
    static initializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null;

    // List of instance symbols to link.
    static instanceSymbols: string [] = ["__lookupChild", "__targetPath"];

    constructor (nativeMovieClip: MovieClip) {
      false && super();
    }

    private _nativeAS3Object: MovieClip;

    // JS -> AS Bindings

    __lookupChild: (id: string) => any;
    __targetPath: any;

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

      var symbolClass = <any> MovieClip;
      var mc = symbolClass.createAsSymbol(symbolProps); // TODO review
      mc._avm1SymbolClass = theClass;
      symbolClass.instanceConstructor.call(mc);
      var nativeAS3Object = <any> this._nativeAS3Object;
      nativeAS3Object.addChild(mc);

      return mc;
    }
    _callFrame(frame: any): any {
      var nativeAS3Object = <any> this._nativeAS3Object;
      nativeAS3Object._callFrame(frame);
    }
    _insertChildAtDepth(mc: any, depth: any): any {
      var nativeAS3Object = <any> this._nativeAS3Object;
      nativeAS3Object._insertChildAtDepth(mc, depth);
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
