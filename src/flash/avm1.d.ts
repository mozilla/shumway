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

declare module Shumway.AVM2.AS.avm1lib {
  import ASClass = Shumway.AVM2.AS.ASClass;
  export class AS2Globals extends ASClass {}
  export class AS2Utils extends ASClass {}
  export class AS2MovieClip extends ASClass {}
  export class AS2Button extends ASClass {}
  export class AS2TextField extends ASClass {}
  export class AS2MovieClipLoader extends ASClass {}
}
declare module Shumway.AVM1 {
  export function getAS2Object(as3Object: any): any;

  export class AS2ActionsData {
    constructor(actionsBlock: Uint8Array, name: string);
  }
  export class AS2Context {
    static create(swfVersion: number): AS2Context;
    addAsset(className: string, symbolProps);
    executeActions(actionsData: AS2ActionsData, stage, scopeObj);
    flushPendingScripts();

    globals: Shumway.AVM2.AS.avm1lib.AS2Globals;
  }
}
