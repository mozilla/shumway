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
// Class: Microphone
module Shumway.AVMX.AS.flash.media {
  import notImplemented = Shumway.Debug.notImplemented;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class Microphone extends flash.events.EventDispatcher {
    
    static classInitializer: any = null;

    constructor () {
      super();
    }
    
    static get names(): ASArray {
      release || somewhatImplemented("public flash.media.Microphone::get names");
      return this.sec.createArrayUnsafe([]);
      // return this._names;
    }
    static get isSupported(): boolean {
      release || somewhatImplemented("public flash.media.Microphone::get isSupported");
      return false;
      // return this._isSupported;
    }
    static getMicrophone(index: number /*int*/ = -1): flash.media.Microphone {
      index = index | 0;
      release || notImplemented("public flash.media.Microphone::static getMicrophone"); return;
    }
    static getEnhancedMicrophone(index: number /*int*/ = -1): flash.media.Microphone {
      index = index | 0;
      release || notImplemented("public flash.media.Microphone::static getEnhancedMicrophone"); return;
    }
    
    // _rate: number /*int*/;
    // _codec: string;
    // _framesPerPacket: number /*int*/;
    // _encodeQuality: number /*int*/;
    // _noiseSuppressionLevel: number /*int*/;
    // _enableVAD: boolean;
    // _activityLevel: number;
    // _gain: number;
    // _index: number /*int*/;
    // _muted: boolean;
    // _name: string;
    // _silenceLevel: number;
    // _silenceTimeout: number /*int*/;
    // _useEchoSuppression: boolean;
    // _soundTransform: flash.media.SoundTransform;
    // _enhancedOptions: flash.media.MicrophoneEnhancedOptions;
    get rate(): number /*int*/ {
      release || notImplemented("public flash.media.Microphone::get rate"); return;
      // return this._rate;
    }
    set rate(rate: number /*int*/) {
      rate = rate | 0;
      release || notImplemented("public flash.media.Microphone::set rate"); return;
      // this._rate = rate;
    }
    get codec(): string {
      release || notImplemented("public flash.media.Microphone::get codec"); return;
      // return this._codec;
    }
    set codec(codec: string) {
      codec = axCoerceString(codec);
      release || notImplemented("public flash.media.Microphone::set codec"); return;
      // this._codec = codec;
    }
    get framesPerPacket(): number /*int*/ {
      release || notImplemented("public flash.media.Microphone::get framesPerPacket"); return;
      // return this._framesPerPacket;
    }
    set framesPerPacket(frames: number /*int*/) {
      frames = frames | 0;
      release || notImplemented("public flash.media.Microphone::set framesPerPacket"); return;
      // this._framesPerPacket = frames;
    }
    get encodeQuality(): number /*int*/ {
      release || notImplemented("public flash.media.Microphone::get encodeQuality"); return;
      // return this._encodeQuality;
    }
    set encodeQuality(quality: number /*int*/) {
      quality = quality | 0;
      release || notImplemented("public flash.media.Microphone::set encodeQuality"); return;
      // this._encodeQuality = quality;
    }
    get noiseSuppressionLevel(): number /*int*/ {
      release || notImplemented("public flash.media.Microphone::get noiseSuppressionLevel"); return;
      // return this._noiseSuppressionLevel;
    }
    set noiseSuppressionLevel(level: number /*int*/) {
      level = level | 0;
      release || notImplemented("public flash.media.Microphone::set noiseSuppressionLevel"); return;
      // this._noiseSuppressionLevel = level;
    }
    get enableVAD(): boolean {
      release || notImplemented("public flash.media.Microphone::get enableVAD"); return;
      // return this._enableVAD;
    }
    set enableVAD(enable: boolean) {
      enable = !!enable;
      release || notImplemented("public flash.media.Microphone::set enableVAD"); return;
      // this._enableVAD = enable;
    }
    get activityLevel(): number {
      release || notImplemented("public flash.media.Microphone::get activityLevel"); return;
      // return this._activityLevel;
    }
    get gain(): number {
      release || notImplemented("public flash.media.Microphone::get gain"); return;
      // return this._gain;
    }
    set gain(gain: number) {
      gain = +gain;
      release || notImplemented("public flash.media.Microphone::set gain"); return;
      // this._gain = gain;
    }
    get index(): number /*int*/ {
      release || notImplemented("public flash.media.Microphone::get index"); return;
      // return this._index;
    }
    get muted(): boolean {
      release || notImplemented("public flash.media.Microphone::get muted"); return;
      // return this._muted;
    }
    get name(): string {
      release || notImplemented("public flash.media.Microphone::get name"); return;
      // return this._name;
    }
    get silenceLevel(): number {
      release || notImplemented("public flash.media.Microphone::get silenceLevel"); return;
      // return this._silenceLevel;
    }
    get silenceTimeout(): number /*int*/ {
      release || notImplemented("public flash.media.Microphone::get silenceTimeout"); return;
      // return this._silenceTimeout;
    }
    get useEchoSuppression(): boolean {
      release || notImplemented("public flash.media.Microphone::get useEchoSuppression"); return;
      // return this._useEchoSuppression;
    }
    get soundTransform(): flash.media.SoundTransform {
      release || notImplemented("public flash.media.Microphone::get soundTransform"); return;
      // return this._soundTransform;
    }
    set soundTransform(sndTransform: flash.media.SoundTransform) {
      sndTransform = sndTransform;
      release || notImplemented("public flash.media.Microphone::set soundTransform"); return;
      // this._soundTransform = sndTransform;
    }
    get enhancedOptions(): any /* flash.media.MicrophoneEnhancedOptions */ {
      release || notImplemented("public flash.media.Microphone::get enhancedOptions"); return;
      // return this._enhancedOptions;
    }
    set enhancedOptions(options: any /* flash.media.MicrophoneEnhancedOptions */) {
      options = options;
      release || notImplemented("public flash.media.Microphone::set enhancedOptions"); return;
      // this._enhancedOptions = options;
    }
    setSilenceLevel(silenceLevel: number, timeout: number /*int*/ = -1): void {
      silenceLevel = +silenceLevel; timeout = timeout | 0;
      release || notImplemented("public flash.media.Microphone::setSilenceLevel"); return;
    }
    setUseEchoSuppression(useEchoSuppression: boolean): void {
      useEchoSuppression = !!useEchoSuppression;
      release || notImplemented("public flash.media.Microphone::setUseEchoSuppression"); return;
    }
    setLoopBack(state: boolean = true): void {
      state = !!state;
      release || notImplemented("public flash.media.Microphone::setLoopBack"); return;
    }
  }
}
