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
// Class: Microphone
module Shumway.AVM2.AS.flash.media {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Microphone extends flash.events.EventDispatcher {
    static initializer: any = null;
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.media.Microphone");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    static getMicrophone(index: number /*int*/ = -1): flash.media.Microphone {
      index = index | 0;
      notImplemented("public flash.media.Microphone::static getMicrophone"); return;
    }
    get names(): any [] {
      notImplemented("public flash.media.Microphone::get names"); return;
    }
    get isSupported(): boolean {
      notImplemented("public flash.media.Microphone::get isSupported"); return;
    }
    static getEnhancedMicrophone(index: number /*int*/ = -1): flash.media.Microphone {
      index = index | 0;
      notImplemented("public flash.media.Microphone::static getEnhancedMicrophone"); return;
    }
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    set gain(gain: number) {
      gain = +gain;
      notImplemented("public flash.media.Microphone::set gain"); return;
    }
    set rate(rate: number /*int*/) {
      rate = rate | 0;
      notImplemented("public flash.media.Microphone::set rate"); return;
    }
    get rate(): number /*int*/ {
      notImplemented("public flash.media.Microphone::get rate"); return;
    }
    set codec(codec: string) {
      codec = "" + codec;
      notImplemented("public flash.media.Microphone::set codec"); return;
    }
    get codec(): string {
      notImplemented("public flash.media.Microphone::get codec"); return;
    }
    get framesPerPacket(): number /*int*/ {
      notImplemented("public flash.media.Microphone::get framesPerPacket"); return;
    }
    set framesPerPacket(frames: number /*int*/) {
      frames = frames | 0;
      notImplemented("public flash.media.Microphone::set framesPerPacket"); return;
    }
    get encodeQuality(): number /*int*/ {
      notImplemented("public flash.media.Microphone::get encodeQuality"); return;
    }
    set encodeQuality(quality: number /*int*/) {
      quality = quality | 0;
      notImplemented("public flash.media.Microphone::set encodeQuality"); return;
    }
    get noiseSuppressionLevel(): number /*int*/ {
      notImplemented("public flash.media.Microphone::get noiseSuppressionLevel"); return;
    }
    set noiseSuppressionLevel(level: number /*int*/) {
      level = level | 0;
      notImplemented("public flash.media.Microphone::set noiseSuppressionLevel"); return;
    }
    get enableVAD(): boolean {
      notImplemented("public flash.media.Microphone::get enableVAD"); return;
    }
    set enableVAD(enable: boolean) {
      enable = !!enable;
      notImplemented("public flash.media.Microphone::set enableVAD"); return;
    }
    setSilenceLevel(silenceLevel: number, timeout: number /*int*/ = -1): void {
      silenceLevel = +silenceLevel; timeout = timeout | 0;
      notImplemented("public flash.media.Microphone::setSilenceLevel"); return;
    }
    setUseEchoSuppression(useEchoSuppression: boolean): void {
      useEchoSuppression = !!useEchoSuppression;
      notImplemented("public flash.media.Microphone::setUseEchoSuppression"); return;
    }
    get activityLevel(): number {
      notImplemented("public flash.media.Microphone::get activityLevel"); return;
    }
    get gain(): number {
      notImplemented("public flash.media.Microphone::get gain"); return;
    }
    get index(): number /*int*/ {
      notImplemented("public flash.media.Microphone::get index"); return;
    }
    get muted(): boolean {
      notImplemented("public flash.media.Microphone::get muted"); return;
    }
    get name(): string {
      notImplemented("public flash.media.Microphone::get name"); return;
    }
    get silenceLevel(): number {
      notImplemented("public flash.media.Microphone::get silenceLevel"); return;
    }
    get silenceTimeout(): number /*int*/ {
      notImplemented("public flash.media.Microphone::get silenceTimeout"); return;
    }
    get useEchoSuppression(): boolean {
      notImplemented("public flash.media.Microphone::get useEchoSuppression"); return;
    }
    setLoopBack(state: boolean = true): void {
      state = !!state;
      notImplemented("public flash.media.Microphone::setLoopBack"); return;
    }
    get soundTransform(): flash.media.SoundTransform {
      notImplemented("public flash.media.Microphone::get soundTransform"); return;
    }
    set soundTransform(sndTransform: flash.media.SoundTransform) {
      sndTransform = sndTransform;
      notImplemented("public flash.media.Microphone::set soundTransform"); return;
    }
    get enhancedOptions(): flash.media.MicrophoneEnhancedOptions {
      notImplemented("public flash.media.Microphone::get enhancedOptions"); return;
    }
    set enhancedOptions(options: flash.media.MicrophoneEnhancedOptions) {
      options = options;
      notImplemented("public flash.media.Microphone::set enhancedOptions"); return;
    }
  }
}
