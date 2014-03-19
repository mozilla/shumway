/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
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

var MessageCenter = {
  _listeners: { }
};
MessageCenter.subscribe = function (type, listener) {
  if (this._listeners[type]) {
    this._listeners[type].push(listener);
  } else {
    this._listeners[type] = [listener];
  }
};
MessageCenter.post = function (type, data) {
  postMessage({ type: type, data: data }, '*');
};

self.addEventListener('message', function (e) {
  var msg = e.data;
  var listeners = MessageCenter._listeners[msg.type];
  if (listeners) {
    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i];
      if (typeof listener === 'object') {
        listener.handleMessage(msg.data);
      } else {
        listener(msg.data);
      }
    }
  }
});
