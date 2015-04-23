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
// Class: AudioDecoder
module Shumway.AVMX.AS.flash.media {
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class AudioDecoder extends ASObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      super();
    }
    
    // JS -> AS Bindings
    static DOLBY_DIGITAL: string = "DolbyDigital";
    static DOLBY_DIGITAL_PLUS: string = "DolbyDigitalPlus";
    static DTS: string = "DTS";
    static DTS_EXPRESS: string = "DTSExpress";
    static DTS_HD_HIGH_RESOLUTION_AUDIO: string = "DTSHDHighResolutionAudio";
    static DTS_HD_MASTER_AUDIO: string = "DTSHDMasterAudio";
    
    
    // AS -> JS Bindings
    
  }
}
