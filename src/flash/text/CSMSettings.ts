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
// Class: CSMSettings
module Shumway.AVM2.AS.flash.text {
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class CSMSettings extends ASNative {

    static classInitializer: any = null;
    static initializer: any = null;
    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null; // ["fontSize", "insideCutoff", "outsideCutoff"];

    constructor(fontSize: number, insideCutoff: number, outsideCutoff: number) {
      fontSize = +fontSize;
      insideCutoff = +insideCutoff;
      outsideCutoff = +outsideCutoff;
      false && super();
      dummyConstructor("public flash.text.CSMSettings");
    }

    // JS -> AS Bindings
    fontSize: number;
    insideCutoff: number;
    outsideCutoff: number;
  }
}
