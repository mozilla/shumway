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
// Class: SoundMixer
module Shumway.AVM2.AS.flash.media {
  import notImplemented = Shumway.Debug.notImplemented;
  export class SoundMixer extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // [];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.media.SoundMixer");
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    // static _bufferTime: number /*int*/;
    // static _soundTransform: flash.media.SoundTransform;
    // static _audioPlaybackMode: string;
    // static _useSpeakerphoneForVoice: boolean;
    get bufferTime(): number /*int*/ {
      notImplemented("public flash.media.SoundMixer::get bufferTime"); return;
      // return this._bufferTime;
    }
    set bufferTime(bufferTime: number /*int*/) {
      bufferTime = bufferTime | 0;
      notImplemented("public flash.media.SoundMixer::set bufferTime"); return;
      // this._bufferTime = bufferTime;
    }
    get soundTransform(): flash.media.SoundTransform {
      notImplemented("public flash.media.SoundMixer::get soundTransform"); return;
      // return this._soundTransform;
    }
    set soundTransform(sndTransform: flash.media.SoundTransform) {
      sndTransform = sndTransform;
      notImplemented("public flash.media.SoundMixer::set soundTransform"); return;
      // this._soundTransform = sndTransform;
    }
    get audioPlaybackMode(): string {
      notImplemented("public flash.media.SoundMixer::get audioPlaybackMode"); return;
      // return this._audioPlaybackMode;
    }
    set audioPlaybackMode(value: string) {
      value = "" + value;
      notImplemented("public flash.media.SoundMixer::set audioPlaybackMode"); return;
      // this._audioPlaybackMode = value;
    }
    get useSpeakerphoneForVoice(): boolean {
      notImplemented("public flash.media.SoundMixer::get useSpeakerphoneForVoice"); return;
      // return this._useSpeakerphoneForVoice;
    }
    set useSpeakerphoneForVoice(value: boolean) {
      value = !!value;
      notImplemented("public flash.media.SoundMixer::set useSpeakerphoneForVoice"); return;
      // this._useSpeakerphoneForVoice = value;
    }
    static stopAll(): void {
      notImplemented("public flash.media.SoundMixer::static stopAll"); return;
    }
    static computeSpectrum(outputArray: flash.utils.ByteArray, FFTMode: boolean = false, stretchFactor: number /*int*/ = 0): void {
      outputArray = outputArray; FFTMode = !!FFTMode; stretchFactor = stretchFactor | 0;
      notImplemented("public flash.media.SoundMixer::static computeSpectrum"); return;
    }
    static areSoundsInaccessible(): boolean {
      notImplemented("public flash.media.SoundMixer::static areSoundsInaccessible"); return;
    }
    
  }
}
