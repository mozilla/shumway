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
// Class: AS2MovieClipLoader
module Shumway.AVM2.AS.avm1lib {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import Loader = Shumway.AVM2.AS.flash.display.Loader;

  export class AS2MovieClipLoader extends ASNative {

    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // Called whenever an instance of the class is initialized.
    static initializer: any = null;

    // List of static symbols to link.
    static staticBindings: string [] = null;

    // List of instance symbols to link.
    static bindings: string [] = ["loadClip", "unloadClip", "getProgress", "openHandler", "progressHandler", "ioErrorHandler", "completeHandler", "initHandler"];

    constructor () {
      false && super();
    }

    private _nativeAS3Object: Loader;

    // JS -> AS Bindings

    loadClip: (url: string, target: ASObject) => boolean;
    unloadClip: (target: ASObject) => boolean;
    getProgress: (target: ASObject) => ASObject;
    openHandler: (event: flash.events.Event) => void;
    progressHandler: (event: flash.events.ProgressEvent) => void;
    ioErrorHandler: (event: flash.events.IOErrorEvent) => void;
    completeHandler: (event: flash.events.Event) => void;
    initHandler: (event: flash.events.Event) => void;

    // AS -> JS Bindings

    // __bytesLoaded: number;
    get _as3Object(): Loader {
      return this._nativeAS3Object;
    }
    _setAS3Object(nativeLoader: Loader): any {
      this._nativeAS3Object = nativeLoader;
    }
    get _bytesLoaded(): number {
      var nativeAS3Object = <any> this._nativeAS3Object;
      return nativeAS3Object._contentLoaderInfo._bytesLoaded;
    }
  }
}
