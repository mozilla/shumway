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
    hasProperty(obj, name): boolean;
    getProperty(obj, name): any;
    setProperty(obj, name, value): void;
    warn(msg: string): void;
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

  export class AVM1Context implements IAVM1Context {
    public root: AVM1MovieClip;
    public loaderInfo: Shumway.AVMX.AS.flash.display.LoaderInfo;
    public sec: ISecurityDomain;
    public globals: AVM1Globals;
    public builtins: IAVM1Builtins;
    public isPropertyCaseSensitive: boolean;
    public actionsDataFactory: ActionsDataFactory;
    public swfVersion: number;

    private eventObservers: MapObject<IAVM1EventPropertyObserver[]>;
    private assets: MapObject<number>;
    private assetsSymbols: Array<any>;
    private assetsClasses: Array<any>;

    constructor(swfVersion: number) {
      this.swfVersion = swfVersion;
      this.root = null;
      this.globals = null;
      this.actionsDataFactory = new ActionsDataFactory();
      this.isPropertyCaseSensitive = swfVersion > 6;

      this.builtins = <any>{};
      Shumway.AVM1.Natives.installBuiltins(this);

      this.eventObservers = Object.create(null);
      this.assets = {};
      this.assetsSymbols = [];
      this.assetsClasses = [];
    }

    public utils: IAVM1RuntimeUtils;

    public static create: (loaderInfo: Shumway.AVMX.AS.flash.display.LoaderInfo) => AVM1Context;

    public flushPendingScripts() {}
    public resolveTarget(target): any {}
    public resolveLevel(level: number): any {}
    public addToPendingScripts(fn, defaultTarget) {}
    public checkTimeout() {}

    public executeActions(actionsData: AVM1ActionsData, scopeObj): void {}

    private _getEventPropertyObservers(propertyName: string, create: boolean): IAVM1EventPropertyObserver[] {
      if (!this.isPropertyCaseSensitive) {
        propertyName = propertyName.toLowerCase();
      }
      var observers = this.eventObservers[propertyName];
      if (observers) {
        return observers;
      }
      if (create) {
        observers = [];
        this.eventObservers[propertyName] = observers;
        return observers;
      }
      return null;
    }
    public registerEventPropertyObserver(propertyName: string, observer: IAVM1EventPropertyObserver): void {
      var observers = this._getEventPropertyObservers(propertyName, true);
      observers.push(observer);
    }
    public unregisterEventPropertyObserver(propertyName: string, observer: IAVM1EventPropertyObserver): void {
      var observers = this._getEventPropertyObservers(propertyName, false);
      if (!observers) {
        return;
      }
      var j = observers.indexOf(observer);
      if (j < 0) {
        return;
      }
      observers.splice(j, 1);
    }
    public broadcastEventPropertyChange(propertyName: string): void {
      var observers = this._getEventPropertyObservers(propertyName, false);
      if (!observers) {
        return;
      }
      observers.forEach((observer: IAVM1EventPropertyObserver) => observer.onEventPropertyModified(propertyName));
    }

    public addAsset(className: string, symbolId: number, symbolProps): void {
      release || Debug.assert(typeof className === 'string' && !isNaN(symbolId));
      this.assets[className.toLowerCase()] = symbolId;
      this.assetsSymbols[symbolId] = symbolProps;
    }
    public registerClass(className: string, theClass: AVM1Object): void {
      className = alCoerceString(this, className);
      if (className === null) {
        this.utils.warn('Cannot register class for symbol: className is missing');
        return null;
      }
      var symbolId = this.assets[className.toLowerCase()];
      if (symbolId === undefined) {
        this.utils.warn('Cannot register ' + className + ' class for symbol');
        return;
      }
      this.assetsClasses[symbolId] = theClass;
    }
    public getAsset(className: string) : AVM1ExportedSymbol {
      className = alCoerceString(this, className);
      if (className === null) {
        return undefined;
      }
      var symbolId = this.assets[className.toLowerCase()];
      if (symbolId === undefined) {
        return undefined;
      }
      var symbol = this.assetsSymbols[symbolId];
      if (!symbol) {
        symbol = this.loaderInfo.getSymbolById(symbolId);
        if (!symbol) {
          Debug.warning("Symbol " + symbolId + " is not defined.");
          return undefined;
        }
        this.assetsSymbols[symbolId] = symbol;
      }
      return {
        symbolId: symbolId,
        symbolProps: symbol,
        theClass: this.assetsClasses[symbolId]
      };
    }

    public setStage(stage: Shumway.AVMX.AS.flash.display.Stage): void {
      (<any>this.globals.Key)._bind(stage, this);
      (<any>this.globals.Mouse)._bind(stage, this);
    }

    public setRoot(root: Shumway.AVMX.AS.flash.display.DisplayObject, parameters: any): any {
      var as2Object = <AVM1MovieClip>Lib.getAVM1Object(root, this);
      this.root = as2Object;
      // transfer parameters
      for (var paramName in parameters) {
        if (!as2Object.alHasProperty(paramName)) {
          as2Object.alPut(paramName, parameters[paramName]);
        }
      }
    }
  }
}
