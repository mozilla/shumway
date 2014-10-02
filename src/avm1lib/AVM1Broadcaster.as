/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package avm1lib {
  public class AVM1Broadcaster {
    public static function initialize(obj: Object): void {
      obj._listeners = [];
      obj.broadcastMessage = _broadcastMessage;
      obj.addListener = _addListener;
      obj.removeListener = _removeListener;
    }
  }
}

function _broadcastMessage(eventName: String, ...args): void {
  var listeners: Array = this._listeners;
  for (var i: int = 0; i < listeners.length; i++) {
    var listener: Object = listeners[i];
    if (!(eventName in listener)) {
      continue;
    }
    listener[eventName].apply(listener, args);
  }
}
function _addListener(listener: Object): void {
  if (this._broadcastEventsRegistrationNeeded) {
    this._broadcastEventsRegistrationNeeded = false;
    for (var i: int = 0; i < this._broadcastEvents.length; i++) {
      (function (subject: Object, eventName: String): void {
        subject[eventName] = function handler(): void {
          _broadcastMessage.apply(subject, [eventName].concat(arguments));
        };
      })(this, this._broadcastEvents[i]);
    }
  }
  this._listeners.push(listener);
}
function _removeListener(listener: Object): Boolean {
  var i: int = this._listeners.indexOf(listener);
  if (i < 0) {
    return false;
  }
  this._listeners.splice(i, 1);
  return true;
}
