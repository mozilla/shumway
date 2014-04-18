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
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;

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

    private static _masterVolume = 1;
    private static _registeredChannels: SoundChannel[] = [];

    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    // static _bufferTime: number /*int*/;
    static _soundTransform: flash.media.SoundTransform;
    // static _audioPlaybackMode: string;
    // static _useSpeakerphoneForVoice: boolean;
    static get bufferTime(): number /*int*/ {
      notImplemented("public flash.media.SoundMixer::get bufferTime"); return;
      // return SoundMixer._bufferTime;
    }
    static set bufferTime(bufferTime: number /*int*/) {
      bufferTime = bufferTime | 0;
      notImplemented("public flash.media.SoundMixer::set bufferTime"); return;
      // SoundMixer._bufferTime = bufferTime;
    }
    static get soundTransform(): flash.media.SoundTransform {
      somewhatImplemented("public flash.media.SoundMixer::get soundTransform");
      return isNullOrUndefined(SoundMixer._soundTransform) ?
        new flash.media.SoundTransform() :
        new flash.media.SoundTransform(SoundMixer._soundTransform.volume, SoundMixer._soundTransform.pan);
    }
    static set soundTransform(sndTransform: flash.media.SoundTransform) {
      somewhatImplemented("public flash.media.SoundMixer::set soundTransform");
      SoundMixer._soundTransform = isNullOrUndefined(sndTransform) ?
        new flash.media.SoundTransform() : sndTransform;
      SoundMixer._registeredChannels.forEach(function (channel) {
        channel._applySoundTransform();
      });
    }
    static get audioPlaybackMode(): string {
      notImplemented("public flash.media.SoundMixer::get audioPlaybackMode"); return;
      // return SoundMixer._audioPlaybackMode;
    }
    static set audioPlaybackMode(value: string) {
      value = asCoerceString(value);
      notImplemented("public flash.media.SoundMixer::set audioPlaybackMode"); return;
      // SoundMixer._audioPlaybackMode = value;
    }
    static get useSpeakerphoneForVoice(): boolean {
      notImplemented("public flash.media.SoundMixer::get useSpeakerphoneForVoice"); return;
      // return SoundMixer._useSpeakerphoneForVoice;
    }
    static set useSpeakerphoneForVoice(value: boolean) {
      value = !!value;
      notImplemented("public flash.media.SoundMixer::set useSpeakerphoneForVoice"); return;
      // SoundMixer._useSpeakerphoneForVoice = value;
    }
    static stopAll(): void {
      SoundMixer._registeredChannels.forEach(function (channel) {
        channel.stop();
      });
      SoundMixer._registeredChannels = [];
    }
    static computeSpectrum(outputArray: flash.utils.ByteArray, FFTMode: boolean = false, stretchFactor: number /*int*/ = 0): void {
      FFTMode = !!FFTMode; stretchFactor = stretchFactor | 0;
      somewhatImplemented("public flash.media.SoundMixer::static computeSpectrum");
      var data = new Float32Array(1024);
      for (var i = 0; i < 1024; i++) {
        data[i] = Math.random();
      }
      outputArray.writeRawBytes(data);
      outputArray.position = 0;
    }
    static areSoundsInaccessible(): boolean {
      notImplemented("public flash.media.SoundMixer::static areSoundsInaccessible"); return;
    }
    static _getMasterVolume(): number {
      return SoundMixer._masterVolume;
    }
    static _setMasterVolume(volume) {
      volume = +volume;
      SoundMixer._masterVolume = volume;
      SoundMixer._registeredChannels.forEach(function (channel) {
        channel._applySoundTransform();
      });
    }
    static _registerChannel(channel: SoundChannel) {
      SoundMixer._registeredChannels.push(channel);
    }
    static _unregisterChannel(channel: SoundChannel) {
      var index =  SoundMixer._registeredChannels.indexOf(channel);
      if (index >= 0) {
        SoundMixer._registeredChannels.splice(index, 1);
      }
    }
  }
}
