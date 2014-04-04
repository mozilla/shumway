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
  export class SoundTransform extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["pan", "pan"];
    
    constructor (vol: number = 1, panning: number = 0) {
      vol = +vol; panning = +panning;
      false && super();
      notImplemented("Dummy Constructor: public flash.media.SoundTransform");
    }
    
    // JS -> AS Bindings
    
    pan: number;
    
    // AS -> JS Bindings
    
    // _volume: number;
    // _leftToLeft: number;
    // _leftToRight: number;
    // _rightToRight: number;
    // _rightToLeft: number;
    // _pan: number;
    get volume(): number {
      notImplemented("public flash.media.SoundTransform::get volume"); return;
      // return this._volume;
    }
    set volume(volume: number) {
      volume = +volume;
      notImplemented("public flash.media.SoundTransform::set volume"); return;
      // this._volume = volume;
    }
    get leftToLeft(): number {
      notImplemented("public flash.media.SoundTransform::get leftToLeft"); return;
      // return this._leftToLeft;
    }
    set leftToLeft(leftToLeft: number) {
      leftToLeft = +leftToLeft;
      notImplemented("public flash.media.SoundTransform::set leftToLeft"); return;
      // this._leftToLeft = leftToLeft;
    }
    get leftToRight(): number {
      notImplemented("public flash.media.SoundTransform::get leftToRight"); return;
      // return this._leftToRight;
    }
    set leftToRight(leftToRight: number) {
      leftToRight = +leftToRight;
      notImplemented("public flash.media.SoundTransform::set leftToRight"); return;
      // this._leftToRight = leftToRight;
    }
    get rightToRight(): number {
      notImplemented("public flash.media.SoundTransform::get rightToRight"); return;
      // return this._rightToRight;
    }
    set rightToRight(rightToRight: number) {
      rightToRight = +rightToRight;
      notImplemented("public flash.media.SoundTransform::set rightToRight"); return;
      // this._rightToRight = rightToRight;
    }
    get rightToLeft(): number {
      notImplemented("public flash.media.SoundTransform::get rightToLeft"); return;
      // return this._rightToLeft;
    }
    set rightToLeft(rightToLeft: number) {
      rightToLeft = +rightToLeft;
      notImplemented("public flash.media.SoundTransform::set rightToLeft"); return;
      // this._rightToLeft = rightToLeft;
    }
  }
}
