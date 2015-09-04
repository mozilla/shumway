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
// Class: Configuration
module Shumway.AVMX.AS.flash.automation {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Configuration extends ASObject {
    constructor () {
      super();
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    get testAutomationConfiguration(): string {
      release || release || notImplemented("public flash.automation.Configuration::get testAutomationConfiguration"); return;
    }
    set deviceConfiguration(configData: string) {
      configData = axCoerceString(configData);
      release || release || notImplemented("public flash.automation.Configuration::set deviceConfiguration"); return;
    }
    get deviceConfiguration(): string {
      release || release || notImplemented("public flash.automation.Configuration::get deviceConfiguration"); return;
    }
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
  }
}
