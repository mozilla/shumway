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
// Class: SoundChannel
module Shumway.AVM2.AS.flash.media {
  import notImplemented = Shumway.Debug.notImplemented;
  export class SoundChannel extends flash.events.EventDispatcher {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // [];
    
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.media.SoundChannel");
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    
    // _position: number;
    // _soundTransform: flash.media.SoundTransform;
    // _leftPeak: number;
    // _rightPeak: number;
    get position(): number {
      notImplemented("public flash.media.SoundChannel::get position"); return;
      // return this._position;
    }
    get soundTransform(): flash.media.SoundTransform {
      notImplemented("public flash.media.SoundChannel::get soundTransform"); return;
      // return this._soundTransform;
    }
    set soundTransform(sndTransform: flash.media.SoundTransform) {
      sndTransform = sndTransform;
      notImplemented("public flash.media.SoundChannel::set soundTransform"); return;
      // this._soundTransform = sndTransform;
    }
    get leftPeak(): number {
      notImplemented("public flash.media.SoundChannel::get leftPeak"); return;
      // return this._leftPeak;
    }
    get rightPeak(): number {
      notImplemented("public flash.media.SoundChannel::get rightPeak"); return;
      // return this._rightPeak;
    }
    stop(): void {
      notImplemented("public flash.media.SoundChannel::stop"); return;
    }
  }
}
