/*
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

Components.utils.import('resource://gre/modules/Services.jsm');

addMessageListener('shumway@research.mozilla.org:init', function (message) {
  content.wrappedJSObject.runViewer();
});

var childDocument = content.document;
childDocument.addEventListener('shumway.message', function (e0) {
  var detail =
    {action: e0.detail.action, data: e0.detail.data, sync: e0.detail.sync};
  if (detail.callback) {
    detail.callback = true;
    detail.cookie = e0.detail.cookie;
  }
  var result = sendSyncMessage('shumway@research.mozilla.org:message', detail);
  e0.detail.response = result[0];
}, false, true);

addMessageListener('shumway@research.mozilla.org:loadFile', function (message) {
  content.postMessage(message.data, '*');
});
