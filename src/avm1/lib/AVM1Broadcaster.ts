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

  function _broadcastMessage(eventName: string, ...args): void {
    var listeners: any[] = this.asGetPublicProperty('_listeners');
    for (var i = 0; i < listeners.length; i++) {
      var listener: any = listeners[i];
      // TODO check __proto__ also
      if (!listener.asHasProperty(undefined, eventName, 0)) {
        continue;
      }
      listener.asCallPublicProperty(eventName, args);
    }
  }

  function _addListener(listener: any): void {
    /* TODO check why it was introduced
    if (this._broadcastEventsRegistrationNeeded) {
      this._broadcastEventsRegistrationNeeded = false;
      for (var i = 0; i < this._broadcastEvents.length; i++) {
        (function (subject: any, eventName: string): void {
          subject[eventName] = function handler(): void {
            _broadcastMessage.apply(subject, [eventName].concat(<any>arguments));
          };
        })(this, this._broadcastEvents[i]);
      }
    }
    */
    var listeners: any[] = this.asGetPublicProperty('_listeners');
    listeners.push(listener);
  }

  function _removeListener(listener: any): Boolean {
    var listeners: any[] = this.asGetPublicProperty('_listeners');
    var i = listeners.indexOf(listener);
    if (i < 0) {
      return false;
    }
    listeners.splice(i, 1);
    return true;
  }

  export class AVM1Broadcaster {
    public static createAVM1Class(): typeof AVM1Broadcaster {
      return wrapAVM1Class(AVM1Broadcaster, ['initialize'], []);
    }
    public static initialize(obj: any): void {
      obj.asSetPublicProperty('_listeners', []);
      obj.asSetPublicProperty('broadcastMessage', _broadcastMessage);
      obj.asSetPublicProperty('addListener', _addListener);
      obj.asSetPublicProperty('removeListener', _removeListener);
    }
  }
}