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

module Shumway.AVM1 {
  import assert = Shumway.Debug.assert;

  export class AVM1ActionsData {
    public ir; // will cache compiled representation
    constructor(public bytes: Uint8Array, public id: string) {
      release || assert(bytes instanceof Uint8Array);
    }
  }

  export class AVM1Context {
    public static instance: AVM1Context = null;
    public stage;
    public classes;
    public swfVersion: number;
    public globals: Shumway.AVM2.AS.avm1lib.AVM1Globals;
    constructor() {}

    public static create: (swfVersion: number) => AVM1Context;

    public flushPendingScripts() {}
    public addAsset(className: string, symbolProps) {}
    public getAsset(className: string): any {}
    public resolveTarget(target): any {}
    public resolveLevel(level: number): any {}
    public addToPendingScripts(fn) {}

    public executeActions(actionsData: AVM1ActionsData, stage, scopeObj) {}
  }
}
