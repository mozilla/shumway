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

var externalInterfaceWrapper = {
  callback: function (call) {
    if (!shumwayComAdapter.onExternalCallback) {
      return undefined;
    }
    return shumwayComAdapter.onExternalCallback(
      Components.utils.cloneInto(JSON.parse(call), content));
  }
};

var shumwayComAdapter;

function sendMessage(action, data, sync, callbackCookie) {
  var detail = {action: action, data: data, sync: sync};
  if (callbackCookie !== undefined) {
    detail.callback = true;
    detail.cookie = callbackCookie;
  }
  if (!sync) {
    sendAsyncMessage('Shumway:message', detail);
    return;
  }
  var result = sendSyncMessage('Shumway:message', detail);
  return Components.utils.cloneInto(result, content);
}

addMessageListener('Shumway:init', function (message) {
  sendAsyncMessage('Shumway:running', {}, {
    externalInterface: externalInterfaceWrapper
  });

  shumwayComAdapter = Components.utils.createObjectIn(content, {defineAs: 'ShumwayCom'});
  Components.utils.exportFunction(sendMessage, shumwayComAdapter, {defineAs: 'sendMessage'});
  Object.defineProperties(shumwayComAdapter, {
    onLoadFileCallback: { value: null, writable: true },
    onExternalCallback: { value: null, writable: true },
    onMessageCallback: { value: null, writable: true }
  });
  Components.utils.makeObjectPropsNormal(shumwayComAdapter);

  content.wrappedJSObject.runViewer();
});

addMessageListener('Shumway:loadFile', function (message) {
  if (!shumwayComAdapter.onLoadFileCallback) {
    return;
  }
  shumwayComAdapter.onLoadFileCallback(Components.utils.cloneInto(message.data, content));
});

addMessageListener('Shumway:messageCallback', function (message) {
  if (!shumwayComAdapter.onMessageCallback) {
    return;
  }
  shumwayComAdapter.onMessageCallback(message.data.cookie,
    Components.utils.cloneInto(message.data.response, content));
});
