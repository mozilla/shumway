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
// Class: NewObjectSample
module Shumway.AVMX.AS.flash.sampler {
  import notImplemented = Shumway.Debug.notImplemented;
  export class NewObjectSample extends flash.sampler.Sample {
    
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
    
    id: number = undefined;
    type: ASClass = undefined;
    
    // AS -> JS Bindings
    
    // _size: number;
    get object(): any {
      release || notImplemented("public flash.sampler.NewObjectSample::get object"); return;
      // return this._object;
    }
    get size(): number {
      release || notImplemented("public flash.sampler.NewObjectSample::get size"); return;
      // return this._size;
    }
  }
}
