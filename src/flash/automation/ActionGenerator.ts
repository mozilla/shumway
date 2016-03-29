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
// Class: ActionGenerator
module Shumway.AVMX.AS.flash.automation {
  import notImplemented = Shumway.Debug.notImplemented;
  export class ActionGenerator extends ASObject {
    constructor () {
      super();
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    generateAction: (action: flash.automation.AutomationAction) => void;
    // Instance AS -> JS Bindings
    generateActions(a: any []): void {
      a = a;
      release || release || notImplemented("public flash.automation.ActionGenerator::generateActions"); return;
    }
  }
}
