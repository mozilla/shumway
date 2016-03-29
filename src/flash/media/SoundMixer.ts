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
// Class: SoundMixer
module Shumway.AVMX.AS.flash.media {
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;

  export interface ISoundSource {
    soundTransform: flash.media.SoundTransform;
    updateSoundLevels(volume: number);
    stopSound();
  }

  export class SoundMixer extends ASObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      super();
    }

    private static _masterVolume = 1;
    private static _registeredSoundSources: ISoundSource[] = [];
    private static _bufferTime = 0;
    static _soundTransform: flash.media.SoundTransform;
    // static _audioPlaybackMode: string;
    // static _useSpeakerphoneForVoice: boolean;

    static get bufferTime(): number /*int*/ {
      release || notImplemented("public flash.media.SoundMixer::get bufferTime");
      return SoundMixer._bufferTime;
    }
    
    static set bufferTime(bufferTime: number /*int*/) {
      release || somewhatImplemented("public flash.media.SoundMixer::set bufferTime");
      SoundMixer._bufferTime = bufferTime | 0;
    }

    static get soundTransform(): flash.media.SoundTransform {
      release || somewhatImplemented("public flash.media.SoundMixer::get soundTransform");
      return isNullOrUndefined(SoundMixer._soundTransform) ?
             new this.sec.flash.media.SoundTransform() :
             new this.sec.flash.media.SoundTransform(SoundMixer._soundTransform.volume,
                                                     SoundMixer._soundTransform.pan);
    }
    static set soundTransform(sndTransform: flash.media.SoundTransform) {
      release || somewhatImplemented("public flash.media.SoundMixer::set soundTransform");
      SoundMixer._soundTransform = isNullOrUndefined(sndTransform) ?
                                   new this.sec.flash.media.SoundTransform() :
                                   sndTransform;
      SoundMixer._updateAllSoundSources();
    }
    static get audioPlaybackMode(): string {
      release || notImplemented("public flash.media.SoundMixer::get audioPlaybackMode"); return;
      // return SoundMixer._audioPlaybackMode;
    }
    static set audioPlaybackMode(value: string) {
      value = axCoerceString(value);
      release || notImplemented("public flash.media.SoundMixer::set audioPlaybackMode"); return;
      // SoundMixer._audioPlaybackMode = value;
    }
    static get useSpeakerphoneForVoice(): boolean {
      release || notImplemented("public flash.media.SoundMixer::get useSpeakerphoneForVoice"); return;
      // return SoundMixer._useSpeakerphoneForVoice;
    }
    static set useSpeakerphoneForVoice(value: boolean) {
      value = !!value;
      release || notImplemented("public flash.media.SoundMixer::set useSpeakerphoneForVoice"); return;
      // SoundMixer._useSpeakerphoneForVoice = value;
    }
    static stopAll(): void {
      SoundMixer._registeredSoundSources.forEach(function (channel) {
        channel.stopSound();
      });
      SoundMixer._registeredSoundSources = [];
    }
    static computeSpectrum(outputArray: flash.utils.ByteArray, FFTMode: boolean = false, stretchFactor: number /*int*/ = 0): void {
      FFTMode = !!FFTMode; stretchFactor = stretchFactor | 0;
      release || somewhatImplemented("public flash.media.SoundMixer::static computeSpectrum");
      var data = new Float32Array(1024);
      for (var i = 0; i < 1024; i++) {
        data[i] = Math.random();
      }
      outputArray.writeRawBytes(data);
      outputArray.position = 0;
    }
    static areSoundsInaccessible(): boolean {
      release || notImplemented("public flash.media.SoundMixer::static areSoundsInaccessible"); return;
    }
    static _getMasterVolume(): number {
      return SoundMixer._masterVolume;
    }
    static _setMasterVolume(volume) {
      volume = +volume;
      SoundMixer._masterVolume = volume;
      SoundMixer._updateAllSoundSources();
    }
    static _registerSoundSource(source: ISoundSource) {
      SoundMixer._registeredSoundSources.push(source);
    }
    static _unregisterSoundSource(source: ISoundSource) {
      var index =  SoundMixer._registeredSoundSources.indexOf(source);
      if (index >= 0) {
        SoundMixer._registeredSoundSources.splice(index, 1);
      }
    }
    static _updateSoundSource(source: ISoundSource) {
      var volume = source.soundTransform.volume;
      if (SoundMixer._soundTransform) {
        volume *= SoundMixer._soundTransform.volume;
      }
      volume *= SoundMixer._getMasterVolume();
      source.updateSoundLevels(volume);
    }
    static _updateAllSoundSources() {
      SoundMixer._registeredSoundSources.forEach(SoundMixer._updateSoundSource);
    }
  }
}
