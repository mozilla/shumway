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
  import assert = Shumway.Debug.assert;
  export class Video extends flash.display.DisplayObject {
    static classInitializer: any = null;
    static initializer: any = null;
    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;
    
    constructor (width: number /*int*/ = 320, height: number /*int*/ = 240) {
      false && super();
      flash.display.DisplayObject.instanceConstructorNoInitialize.call(this);
      width |= 0;
      height |= 0;
      this._setFillAndLineBoundsFromWidthAndHeight(width * 20, height * 20);
    }
    
    _deblocking: number;
    _smoothing: boolean;
    _videoWidth: number;
    _videoHeight: number;

    _netStream: flash.net.NetStream;
    _camera: flash.media.Camera;

    get deblocking(): number /*int*/ {
      return this._deblocking;
    }

    set deblocking(value: number /*int*/) {
      this._deblocking = value | 0;
    }

    get smoothing(): boolean {
      return this._smoothing;
    }

    set smoothing(value: boolean) {
      this._smoothing = !!value;
    }

    get videoWidth(): number /*int*/ {
      return this._videoWidth;
    }

    get videoHeight(): number /*int*/ {
      return this._videoHeight;
    }

    _containsPointDirectly(x: number, y: number): boolean {
      // If this override is reached, the content bounds have already been checked, which is all
      // we need to do.
      release || assert(this._getContentBounds().contains(x, y));
      return true;
    }

    clear(): void {
      notImplemented("public flash.media.Video::clear"); return;
    }

    attachNetStream(netStream: flash.net.NetStream): void {
      if (this._netStream === netStream) {
        return;
      }
      if (this._netStream) {
        netStream._videoReferrer = null;
      }
      this._netStream = netStream;
      if (this._netStream) {
        netStream._videoReferrer = this;
      }
      this._setDirtyFlags(flash.display.DisplayObjectFlags.DirtyNetStream);
    }

    attachCamera(camera: flash.media.Camera): void {
      notImplemented("public flash.media.Video::attachCamera"); return;
    }
  }
}
