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
// Class: SoundChannel
module Shumway.AVM2.AS.flash.media {
  import notImplemented = Shumway.Debug.notImplemented;
  export class SoundChannel extends flash.events.EventDispatcher {
    static initializer: any = null;
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.media.SoundChannel");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    get position(): number {
      notImplemented("public flash.media.SoundChannel::get position"); return;
    }
    get soundTransform(): flash.media.SoundTransform {
      notImplemented("public flash.media.SoundChannel::get soundTransform"); return;
    }
    set soundTransform(sndTransform: flash.media.SoundTransform) {
      sndTransform = sndTransform;
      notImplemented("public flash.media.SoundChannel::set soundTransform"); return;
    }
    stop(): void {
      notImplemented("public flash.media.SoundChannel::stop"); return;
    }
    get leftPeak(): number {
      notImplemented("public flash.media.SoundChannel::get leftPeak"); return;
    }
    get rightPeak(): number {
      notImplemented("public flash.media.SoundChannel::get rightPeak"); return;
    }
  }
}
