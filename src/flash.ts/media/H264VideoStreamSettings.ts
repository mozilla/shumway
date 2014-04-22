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
// Class: H264VideoStreamSettings
module Shumway.AVM2.AS.flash.media {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class H264VideoStreamSettings extends flash.media.VideoStreamSettings {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["_profile", "_level", "codec", "profile", "level", "setProfileLevel"];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.media.H264VideoStreamSettings");
    }
    
    // JS -> AS Bindings
    
    _profile: string;
    _level: string;
    codec: string;
    profile: string;
    level: string;
    setProfileLevel: (profile: string, level: string) => void;
    
    // AS -> JS Bindings
    
    // _codec: string;
    // _profile: string;
    // _level: string;
  }
}
