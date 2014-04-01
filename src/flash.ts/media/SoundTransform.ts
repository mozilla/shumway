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
// Class: SoundTransform
module Shumway.AVM2.AS.flash.media {
  import notImplemented = Shumway.Debug.notImplemented;
  export class SoundTransform extends ASNative {
    static initializer: any = null;
    constructor (vol: number = 1, panning: number = 0) {
      vol = +vol; panning = +panning;
      false && super();
      notImplemented("Dummy Constructor: public flash.media.SoundTransform");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    pan: number;
    // Instance AS -> JS Bindings
    get volume(): number {
      notImplemented("public flash.media.SoundTransform::get volume"); return;
    }
    set volume(volume: number) {
      volume = +volume;
      notImplemented("public flash.media.SoundTransform::set volume"); return;
    }
    get leftToLeft(): number {
      notImplemented("public flash.media.SoundTransform::get leftToLeft"); return;
    }
    set leftToLeft(leftToLeft: number) {
      leftToLeft = +leftToLeft;
      notImplemented("public flash.media.SoundTransform::set leftToLeft"); return;
    }
    get leftToRight(): number {
      notImplemented("public flash.media.SoundTransform::get leftToRight"); return;
    }
    set leftToRight(leftToRight: number) {
      leftToRight = +leftToRight;
      notImplemented("public flash.media.SoundTransform::set leftToRight"); return;
    }
    get rightToRight(): number {
      notImplemented("public flash.media.SoundTransform::get rightToRight"); return;
    }
    set rightToRight(rightToRight: number) {
      rightToRight = +rightToRight;
      notImplemented("public flash.media.SoundTransform::set rightToRight"); return;
    }
    get rightToLeft(): number {
      notImplemented("public flash.media.SoundTransform::get rightToLeft"); return;
    }
    set rightToLeft(rightToLeft: number) {
      rightToLeft = +rightToLeft;
      notImplemented("public flash.media.SoundTransform::set rightToLeft"); return;
    }
  }
}
