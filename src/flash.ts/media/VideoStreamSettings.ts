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
// Class: VideoStreamSettings
module Shumway.AVM2.AS.flash.media {
  import notImplemented = Shumway.Debug.notImplemented;
  export class VideoStreamSettings extends ASNative {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.media.VideoStreamSettings");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    m_height: number /*int*/;
    m_width: number /*int*/;
    m_fps: number;
    m_bandwidth: number /*int*/;
    m_quality: number /*int*/;
    m_keyFrameInterval: number /*int*/;
    setMode: (width: number /*int*/, height: number /*int*/, fps: number) => void;
    width: number /*int*/;
    height: number /*int*/;
    fps: number;
    setQuality: (bandwidth: number /*int*/, quality: number /*int*/) => void;
    quality: number /*int*/;
    bandwidth: number /*int*/;
    setKeyFrameInterval: (keyFrameInterval: number /*int*/) => void;
    keyFrameInterval: number /*int*/;
    codec: string;
    // Instance AS -> JS Bindings
  }
}
