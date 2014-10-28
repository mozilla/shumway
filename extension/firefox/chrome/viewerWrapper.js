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

var viewer = document.getElementById('viewer'), onLoaded;
var promise = new Promise(function (resolve, reject) {
  onLoaded = resolve;
});
viewer.addEventListener('load', function () {
  onLoaded(false);
});
viewer.addEventListener('mozbrowserloadend', function () {
  onLoaded(true);
});

function runViewer() {
  function handler() {
    var childDocument = viewer.contentWindow.document;
    childDocument.addEventListener('shumway.message', function (e0) {
      var e = document.createEvent('CustomEvent');
      e.initCustomEvent('shumway.message', true, false,
        {action: e0.detail.action, data: e0.detail.data, sync: e0.detail.sync});
      if (e0.detail.callback) {
        e.detail.callback = true;
        e.detail.cookie = e0.detail.cookie;
      }
      document.dispatchEvent(e);
      e0.detail.response = e.detail.response;
    }, false);
    document.addEventListener('shumway.remote', function (e0) {
      var e = childDocument.createEvent('CustomEvent');
      e.initCustomEvent('shumway.remote', true, false,
        {functionName: e0.detail.functionName, args: e0.detail.args, result: undefined});
      childDocument.dispatchEvent(e);
      e0.detail.result = e.detail.result;
    }, false);
    window.addEventListener("message", function handlerMessage(e) {
      var args = e.data;
      switch (args.callback) {
        case 'loadFile':
          viewer.contentWindow.postMessage(args, '*');
          break;
      }
    });

    viewer.contentWindow.wrappedJSObject.runViewer();
  }

  function handlerOOP() {
    var frameLoader = viewer.QueryInterface(Components.interfaces.nsIFrameLoaderOwner).frameLoader;
    var messageManager = frameLoader.messageManager;
    messageManager.loadFrameScript('chrome://shumway/content/content.js', false);

    var externalInterface;

    messageManager.addMessageListener('shumway@research.mozilla.org:running', function (message) {
      externalInterface = message.objects.externalInterface;
    });

    messageManager.addMessageListener('shumway@research.mozilla.org:message', function (message) {
      var e = document.createEvent('CustomEvent');
      e.initCustomEvent('shumway.message', true, false,
        {action: message.data.action, data: message.data.data, sync: message.data.sync});
      if (message.data.callback) {
        e.detail.callback = true;
        e.detail.cookie = message.data.cookie;
      }
      document.dispatchEvent(e);
      return e.detail.response;
    });

    document.addEventListener('shumway.remote', function (e0) {
      e0.detail.result = externalInterface.callback(e0.detail.functionName, e0.detail.args);
    }, false);

    window.addEventListener("message", function handlerMessage(e) {
      var args = e.data;
      switch (args.callback) {
        case 'loadFile':
          messageManager.sendAsyncMessage('shumway@research.mozilla.org:loadFile', args);
          break;
      }
    });

    messageManager.sendAsyncMessage('shumway@research.mozilla.org:init', {});
  }

  promise.then(function (oop) {
    if (oop) {
      console.log('Shumway: start OOP');
      handlerOOP();
    } else {
      console.log('Shumway: start normal');
      handler();
    }
  });
}
