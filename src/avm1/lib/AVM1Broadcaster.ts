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
  function _updateAllSymbolEvents(symbolInstance: IAVM1SymbolBase) {
    if (!symbolInstance.isAVM1Instance) {
      return;
    }
    symbolInstance.updateAllEvents();
  }

  export class AVM1Broadcaster extends AVM1Object {
    public static createAVM1Class(context: AVM1Context): AVM1Object {
      return wrapAVM1NativeClass(context, true, AVM1Broadcaster, ['initialize'], []);
    }

    public static initialize(context: AVM1Context, obj: AVM1Object): void {
      obj.alSetOwnProperty('_listeners', {
        flags: AVM1PropertyFlags.DATA | AVM1PropertyFlags.DONT_ENUM,
        value: new Natives.AVM1ArrayNative(context, [])
      });
      obj.alSetOwnProperty('broadcastMessage', {
        flags: AVM1PropertyFlags.DATA | AVM1PropertyFlags.DONT_ENUM,
        value: new AVM1NativeFunction(context, function broadcastMessage(eventName: string, ...args): void {
          avm1BroadcastEvent(context, this, eventName, args);
        })
      });
      obj.alSetOwnProperty('addListener', {
        flags: AVM1PropertyFlags.DATA | AVM1PropertyFlags.DONT_ENUM,
        value: new AVM1NativeFunction(context, function addListener(listener: any): void {
          // REDUX
          var listeners: any[] = context.utils.getProperty(this, '_listeners').value;
          listeners.push(listener);
          _updateAllSymbolEvents(<any>this);
        })
      });
      obj.alSetOwnProperty('removeListener', {
        flags: AVM1PropertyFlags.DATA | AVM1PropertyFlags.DONT_ENUM,
        value: new AVM1NativeFunction(context, function removeListener(listener: any): boolean {
          // REDUX
          var listeners: any[] = context.utils.getProperty(this, '_listeners').value;
          var i = listeners.indexOf(listener);
          if (i < 0) {
            return false;
          }
          listeners.splice(i, 1);
          _updateAllSymbolEvents(<any>this);
          return true;
        })
      });
    }
  }
}
