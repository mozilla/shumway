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
// Class: SoundTransform
module Shumway.AVMX.AS.flash.media {
  import notImplemented = Shumway.Debug.notImplemented;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  export class SoundTransform extends ASObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor (vol: number = 1, panning: number = 0) {
      super();
      this.volume = +vol;
      this.pan = +panning;
    }

    private _volume: number;
    private _leftToLeft: number;
    private _leftToRight: number;
    private _rightToRight: number;
    private _rightToLeft: number;

    get volume(): number {
      return this._volume;
    }
    set volume(volume: number) {
      volume = +volume;
      this._volume = volume;
      this._updateTransform();
    }
    get leftToLeft(): number {
      return this._leftToLeft;
    }
    set leftToLeft(leftToLeft: number) {
      leftToLeft = +leftToLeft;
      this._leftToLeft = leftToLeft;
      this._updateTransform();
    }
    get leftToRight(): number {
      return this._leftToRight;
    }
    set leftToRight(leftToRight: number) {
      leftToRight = +leftToRight;
      this._leftToRight = leftToRight;
      this._updateTransform();
    }
    get rightToRight(): number {
      return this._rightToRight;
    }
    set rightToRight(rightToRight: number) {
      rightToRight = +rightToRight;
      this._rightToRight = rightToRight;
      this._updateTransform();
    }
    get rightToLeft(): number {
      return this._rightToLeft;
    }
    set rightToLeft(rightToLeft: number) {
      rightToLeft = +rightToLeft;
      this._rightToLeft = rightToLeft;
      this._updateTransform();
    }
    get pan(): number {
      if (this._leftToRight === 0 && this._rightToLeft === 0) {
        return 1 - this._leftToLeft * this._leftToLeft;
      }
      return 0;
    }
    set pan(panning: number) {
      this.leftToLeft = Math.sqrt(1 - panning);
      this.leftToRight = 0;
      this.rightToRight = Math.sqrt(1 + panning);
      this.rightToLeft = 0;
    }

    _updateTransform() {
      release || somewhatImplemented("public flash.media.SoundTransform::_updateTransform");
      // TODO dispatch updates to the current audio destinations?
    }
  }
}
