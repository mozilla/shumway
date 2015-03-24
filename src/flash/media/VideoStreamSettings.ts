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
// Class: VideoStreamSettings
module Shumway.AVMX.AS.flash.media {
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  import asCoerceString = Shumway.AVMX.asCoerceString;
  export class VideoStreamSettings extends ASObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["width", "height", "fps", "quality", "bandwidth", "keyFrameInterval", "codec", "setMode", "setQuality", "setKeyFrameInterval"];
    
    constructor () {
      false && super();
      dummyConstructor("public flash.media.VideoStreamSettings");
    }
    
    // JS -> AS Bindings
    
    width: number /*int*/;
    height: number /*int*/;
    fps: number;
    quality: number /*int*/;
    bandwidth: number /*int*/;
    keyFrameInterval: number /*int*/;
    codec: string;
    setMode: (width: number /*int*/, height: number /*int*/, fps: number) => void;
    setQuality: (bandwidth: number /*int*/, quality: number /*int*/) => void;
    setKeyFrameInterval: (keyFrameInterval: number /*int*/) => void;
    
    // AS -> JS Bindings
    
    // _width: number /*int*/;
    // _height: number /*int*/;
    // _fps: number;
    // _quality: number /*int*/;
    // _bandwidth: number /*int*/;
    // _keyFrameInterval: number /*int*/;
    // _codec: string;
  }
}
