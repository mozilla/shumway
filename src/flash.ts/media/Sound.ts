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
// Class: Sound
module Shumway.AVM2.AS.flash.media {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Sound extends flash.events.EventDispatcher {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["load"];
    
    constructor (stream: flash.net.URLRequest = null, context: flash.media.SoundLoaderContext = null) {
      stream = stream; context = context;
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.media.Sound");
    }
    
    // JS -> AS Bindings
    
    load: (stream: flash.net.URLRequest, context: flash.media.SoundLoaderContext = null) => void;
    
    // AS -> JS Bindings
    
    // _url: string;
    // _isURLInaccessible: boolean;
    // _length: number;
    // _isBuffering: boolean;
    // _bytesLoaded: number /*uint*/;
    // _bytesTotal: number /*int*/;
    // _id3: flash.media.ID3Info;
    get url(): string {
      notImplemented("public flash.media.Sound::get url"); return;
      // return this._url;
    }
    get isURLInaccessible(): boolean {
      notImplemented("public flash.media.Sound::get isURLInaccessible"); return;
      // return this._isURLInaccessible;
    }
    get length(): number {
      notImplemented("public flash.media.Sound::get length"); return;
      // return this._length;
    }
    get isBuffering(): boolean {
      notImplemented("public flash.media.Sound::get isBuffering"); return;
      // return this._isBuffering;
    }
    get bytesLoaded(): number /*uint*/ {
      notImplemented("public flash.media.Sound::get bytesLoaded"); return;
      // return this._bytesLoaded;
    }
    get bytesTotal(): number /*int*/ {
      notImplemented("public flash.media.Sound::get bytesTotal"); return;
      // return this._bytesTotal;
    }
    get id3(): flash.media.ID3Info {
      notImplemented("public flash.media.Sound::get id3"); return;
      // return this._id3;
    }
    loadCompressedDataFromByteArray(bytes: flash.utils.ByteArray, bytesLength: number /*uint*/): void {
      bytes = bytes; bytesLength = bytesLength >>> 0;
      notImplemented("public flash.media.Sound::loadCompressedDataFromByteArray"); return;
    }
    loadPCMFromByteArray(bytes: flash.utils.ByteArray, samples: number /*uint*/, format: string = "float", stereo: boolean = true, sampleRate: number = 44100): void {
      bytes = bytes; samples = samples >>> 0; format = "" + format; stereo = !!stereo; sampleRate = +sampleRate;
      notImplemented("public flash.media.Sound::loadPCMFromByteArray"); return;
    }
    play(startTime: number = 0, loops: number /*int*/ = 0, sndTransform: flash.media.SoundTransform = null): flash.media.SoundChannel {
      startTime = +startTime; loops = loops | 0; sndTransform = sndTransform;
      notImplemented("public flash.media.Sound::play"); return;
    }
    close(): void {
      notImplemented("public flash.media.Sound::close"); return;
    }
    extract(target: flash.utils.ByteArray, length: number, startPosition: number = -1): number {
      target = target; length = +length; startPosition = +startPosition;
      notImplemented("public flash.media.Sound::extract"); return;
    }
    _load(stream: flash.net.URLRequest, checkPolicyFile: boolean, bufferTime: number): void {
      stream = stream; checkPolicyFile = !!checkPolicyFile; bufferTime = +bufferTime;
      notImplemented("public flash.media.Sound::_load"); return;
    }
  }
}
