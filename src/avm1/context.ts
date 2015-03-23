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

  import AVM1MovieClip = Lib.AVM1MovieClip;
  import AVM1Globals = Lib.AVM1Globals;

  export class AVM1ActionsData {
    public ir; // will cache compiled representation
    constructor(public bytes: Uint8Array, public id: string, public parent: AVM1ActionsData = null) {
      release || assert(bytes instanceof Uint8Array);
    }
  }

  export interface AVM1ExportedSymbol {
    symbolId: number;
    symbolProps;
    theClass;
  }

  export interface IAVM1RuntimeUtils {
    hasProperty(obj, name);
    getProperty(obj, name);
    setProperty(obj, name, value);
  }

  export interface IAVM1EventPropertyObserver {
    onEventPropertyModified(name: string);
  }

  export class ActionsDataFactory {
    private _cache: WeakMap<Uint8Array, AVM1ActionsData> = new WeakMap<Uint8Array, AVM1ActionsData>();
    public createActionsData(bytes: Uint8Array, id: string, parent: AVM1ActionsData = null): AVM1ActionsData {
      var actionsData = this._cache.get(bytes);
      if (!actionsData) {
        actionsData = new AVM1ActionsData(bytes, id, parent);
        this._cache.set(bytes, actionsData);
      }
      release || assert(actionsData.bytes === bytes && actionsData.id === id && actionsData.parent === parent);
      return actionsData;
    }
  }

  export class AVM1Context {
    public static instance: AVM1Context = null;
    public root: AVM1MovieClip;
    public loaderInfo: Shumway.AVM2.AS.flash.display.LoaderInfo;
    public globals: AVM1Globals;
    public actionsDataFactory: ActionsDataFactory;
    constructor() {
      this.root = null;
      this.globals = null;
      this.actionsDataFactory = new ActionsDataFactory();
    }

    public utils: IAVM1RuntimeUtils;

    public static create: (loaderInfo: Shumway.AVM2.AS.flash.display.LoaderInfo) => AVM1Context;

    public flushPendingScripts() {}
    public addAsset(className: string, symbolId: number, symbolProps) {}
    public registerClass(className: string, theClass) {}
    public getAsset(className: string): AVM1ExportedSymbol { return undefined; }
    public resolveTarget(target): any {}
    public resolveLevel(level: number): any {}
    public addToPendingScripts(fn) {}

    public registerEventPropertyObserver(propertyName: string, observer: IAVM1EventPropertyObserver) {}
    public unregisterEventPropertyObserver(propertyName: string, observer: IAVM1EventPropertyObserver) {}

    public enterContext(fn: Function, defaultTarget): void {}
    public executeActions(actionsData: AVM1ActionsData, scopeObj): void {}
  }
}
