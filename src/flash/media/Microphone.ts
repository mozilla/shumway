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
module Shumway.AVM2.AS.flash.media {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class Microphone extends flash.events.EventDispatcher {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.media.Microphone");
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    // static _names: any [];
    // static _isSupported: boolean;
    get names(): any [] {
      notImplemented("public flash.media.Microphone::get names"); return;
      // return this._names;
    }
    get isSupported(): boolean {
      notImplemented("public flash.media.Microphone::get isSupported"); return;
      // return this._isSupported;
    }
    static getMicrophone(index: number /*int*/ = -1): flash.media.Microphone {
      index = index | 0;
      notImplemented("public flash.media.Microphone::static getMicrophone"); return;
    }
    static getEnhancedMicrophone(index: number /*int*/ = -1): flash.media.Microphone {
      index = index | 0;
      notImplemented("public flash.media.Microphone::static getEnhancedMicrophone"); return;
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
      notImplemented("public flash.media.Microphone::get rate"); return;
      // return this._rate;
    }
    set rate(rate: number /*int*/) {
      rate = rate | 0;
      notImplemented("public flash.media.Microphone::set rate"); return;
      // this._rate = rate;
    }
    get codec(): string {
      notImplemented("public flash.media.Microphone::get codec"); return;
      // return this._codec;
    }
    set codec(codec: string) {
      codec = asCoerceString(codec);
      notImplemented("public flash.media.Microphone::set codec"); return;
      // this._codec = codec;
    }
    get framesPerPacket(): number /*int*/ {
      notImplemented("public flash.media.Microphone::get framesPerPacket"); return;
      // return this._framesPerPacket;
    }
    set framesPerPacket(frames: number /*int*/) {
      frames = frames | 0;
      notImplemented("public flash.media.Microphone::set framesPerPacket"); return;
      // this._framesPerPacket = frames;
    }
    get encodeQuality(): number /*int*/ {
      notImplemented("public flash.media.Microphone::get encodeQuality"); return;
      // return this._encodeQuality;
    }
    set encodeQuality(quality: number /*int*/) {
      quality = quality | 0;
      notImplemented("public flash.media.Microphone::set encodeQuality"); return;
      // this._encodeQuality = quality;
    }
    get noiseSuppressionLevel(): number /*int*/ {
      notImplemented("public flash.media.Microphone::get noiseSuppressionLevel"); return;
      // return this._noiseSuppressionLevel;
    }
    set noiseSuppressionLevel(level: number /*int*/) {
      level = level | 0;
      notImplemented("public flash.media.Microphone::set noiseSuppressionLevel"); return;
      // this._noiseSuppressionLevel = level;
    }
    get enableVAD(): boolean {
      notImplemented("public flash.media.Microphone::get enableVAD"); return;
      // return this._enableVAD;
    }
    set enableVAD(enable: boolean) {
      enable = !!enable;
      notImplemented("public flash.media.Microphone::set enableVAD"); return;
      // this._enableVAD = enable;
    }
    get activityLevel(): number {
      notImplemented("public flash.media.Microphone::get activityLevel"); return;
      // return this._activityLevel;
    }
    get gain(): number {
      notImplemented("public flash.media.Microphone::get gain"); return;
      // return this._gain;
    }
    set gain(gain: number) {
      gain = +gain;
      notImplemented("public flash.media.Microphone::set gain"); return;
      // this._gain = gain;
    }
    get index(): number /*int*/ {
      notImplemented("public flash.media.Microphone::get index"); return;
      // return this._index;
    }
    get muted(): boolean {
      notImplemented("public flash.media.Microphone::get muted"); return;
      // return this._muted;
    }
    get name(): string {
      notImplemented("public flash.media.Microphone::get name"); return;
      // return this._name;
    }
    get silenceLevel(): number {
      notImplemented("public flash.media.Microphone::get silenceLevel"); return;
      // return this._silenceLevel;
    }
    get silenceTimeout(): number /*int*/ {
      notImplemented("public flash.media.Microphone::get silenceTimeout"); return;
      // return this._silenceTimeout;
    }
    get useEchoSuppression(): boolean {
      notImplemented("public flash.media.Microphone::get useEchoSuppression"); return;
      // return this._useEchoSuppression;
    }
    get soundTransform(): flash.media.SoundTransform {
      notImplemented("public flash.media.Microphone::get soundTransform"); return;
      // return this._soundTransform;
    }
    set soundTransform(sndTransform: flash.media.SoundTransform) {
      sndTransform = sndTransform;
      notImplemented("public flash.media.Microphone::set soundTransform"); return;
      // this._soundTransform = sndTransform;
    }
//    get enhancedOptions(): flash.media.MicrophoneEnhancedOptions {
//      notImplemented("public flash.media.Microphone::get enhancedOptions"); return;
//      // return this._enhancedOptions;
//    }
//    set enhancedOptions(options: flash.media.MicrophoneEnhancedOptions) {
//      options = options;
//      notImplemented("public flash.media.Microphone::set enhancedOptions"); return;
//      // this._enhancedOptions = options;
//    }
    setSilenceLevel(silenceLevel: number, timeout: number /*int*/ = -1): void {
      silenceLevel = +silenceLevel; timeout = timeout | 0;
      notImplemented("public flash.media.Microphone::setSilenceLevel"); return;
    }
    setUseEchoSuppression(useEchoSuppression: boolean): void {
      useEchoSuppression = !!useEchoSuppression;
      notImplemented("public flash.media.Microphone::setUseEchoSuppression"); return;
    }
    setLoopBack(state: boolean = true): void {
      state = !!state;
      notImplemented("public flash.media.Microphone::setLoopBack"); return;
    }
  }
}
