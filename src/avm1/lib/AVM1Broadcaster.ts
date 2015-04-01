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

///<reference path='../references.ts' />

module Shumway.AVM1.Lib {
  import ASObject = Shumway.AVMX.AS.ASObject;

  function _updateAllSymbolEvents(symbolInstance: IAVM1SymbolBase) {
    if (!symbolInstance.isAVM1Instance) {
      return;
    }
    symbolInstance.updateAllEvents();
  }

  export class AVM1Broadcaster extends ASObject {
    private static _context: AVM1Context;

    public static setAVM1Context(context: AVM1Context) {
      this._context = context;
    }

    public static createAVM1Class(securityDomain: ISecurityDomain): typeof AVM1Broadcaster {
      return wrapAVM1Class(securityDomain, AVM1Broadcaster, ['initialize'], []);
    }

    public static initialize(obj: any): void {
      AVM1Broadcaster.initializeWithContext(obj, AVM1Context.instance);
    }

    public static initializeWithContext(obj: any, context: AVM1Context): void {
      obj.axSetPublicProperty('_listeners', []);
      obj.axSetPublicProperty('broadcastMessage', function broadcastMessage(eventName: string, ...args): void {
        avm1BroadcastEvent(context, this, eventName, args);
      });
      obj.axSetPublicProperty('addListener', function addListener(listener: any): void {
        var listeners: any[] = context.utils.getProperty(this, '_listeners');
        listeners.push(listener);
        _updateAllSymbolEvents(<any>this);
      });
      obj.axSetPublicProperty('removeListener', function removeListener(listener: any): boolean {
        var listeners: any[] = context.utils.getProperty(this, '_listeners');
        var i = listeners.indexOf(listener);
        if (i < 0) {
          return false;
        }
        listeners.splice(i, 1);
        _updateAllSymbolEvents(<any>this);
        return true;
      });
    }
  }
}
