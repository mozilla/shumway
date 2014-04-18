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
 * limitations under the License.
 */
// Class: SoundTransform
module Shumway.AVM2.AS.flash.media {
  import notImplemented = Shumway.Debug.notImplemented;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  export class SoundTransform extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = ["pan"];
    
    constructor (vol: number = 1, panning: number = 0) {
      vol = +vol; panning = +panning;
      false && super();
      notImplemented("Dummy Constructor: public flash.media.SoundTransform");
    }
    
    // JS -> AS Bindings
    
    pan: number;
    
    // AS -> JS Bindings
    
    private _volume: number;
    private _leftToLeft: number;
    private _leftToRight: number;
    private _rightToRight: number;
    private _rightToLeft: number;
    private _pan: number;
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
    _updateTransform() {
      somewhatImplemented("public flash.media.SoundTransform::_updateTransform");
      // TODO dispatch updates to the current audio destinations?
    }
  }
}
