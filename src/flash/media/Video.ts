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
// Class: Video
module Shumway.AVM2.AS.flash.media {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class Video extends flash.display.DisplayObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor (width: number /*int*/ = 320, height: number /*int*/ = 240) {
      width = width | 0; height = height | 0;
      false && super();
      notImplemented("Dummy Constructor: public flash.media.Video");
    }

    _initFrame() { }

    _constructFrame() { }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    
    // _deblocking: number /*int*/;
    // _smoothing: boolean;
    // _videoWidth: number /*int*/;
    // _videoHeight: number /*int*/;
    get deblocking(): number /*int*/ {
      notImplemented("public flash.media.Video::get deblocking"); return;
      // return this._deblocking;
    }
    set deblocking(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.media.Video::set deblocking"); return;
      // this._deblocking = value;
    }
    get smoothing(): boolean {
      notImplemented("public flash.media.Video::get smoothing"); return;
      // return this._smoothing;
    }
    set smoothing(value: boolean) {
      value = !!value;
      notImplemented("public flash.media.Video::set smoothing"); return;
      // this._smoothing = value;
    }
    get videoWidth(): number /*int*/ {
      notImplemented("public flash.media.Video::get videoWidth"); return;
      // return this._videoWidth;
    }
    get videoHeight(): number /*int*/ {
      notImplemented("public flash.media.Video::get videoHeight"); return;
      // return this._videoHeight;
    }
    clear(): void {
      notImplemented("public flash.media.Video::clear"); return;
    }
    attachNetStream(netStream: flash.net.NetStream): void {
      netStream = netStream;
      notImplemented("public flash.media.Video::attachNetStream"); return;
    }
    attachCamera(camera: flash.media.Camera): void {
      camera = camera;
      notImplemented("public flash.media.Video::attachCamera"); return;
    }
    ctor(width: number /*int*/, height: number /*int*/): void {
      width = width | 0; height = height | 0;
      notImplemented("public flash.media.Video::ctor"); return;
    }
  }
}
