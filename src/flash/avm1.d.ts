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

import ASClass = Shumway.AVMX.AS.ASClass;

declare module Shumway.AVM1 {
  import flash = Shumway.AVMX.AS.flash;

  export class AVM1ActionsData {
  }
  export class AVM1Context {
    static create(loaderInfo: flash.display.LoaderInfo): AVM1Context;
    addAsset(className: string, symbolId: number, symbolProps);
    executeActions(actionsData: AVM1ActionsData, scopeObj);
    flushPendingScripts();

    globals: Lib.AVM1Globals;
    root: Lib.AVM1MovieClip;
    securityDomain: ISecurityDomain;
  }
  export module Lib {
    function getAVM1Object(obj, context: AVM1Context);
    function initializeAVM1Object(as3Object, context: AVM1Context,
                                  placeObjectTag: Shumway.SWF.PlaceObjectTag);
    function installObjectMethods(context: AVM1Context);
    class AVM1Globals extends ASClass {
      Key: typeof AVM1Key;
      Mouse: typeof AVM1Mouse;
    }
    class AVM1MovieClip extends ASClass {}
    class AVM1Key extends ASClass {
      static _bind(stage: flash.display.Stage, context: AVM1Context);
    }
    class AVM1Mouse extends ASClass {
      static _bind(stage: flash.display.Stage, context: AVM1Context);
    }
  }
}
