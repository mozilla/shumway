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
  onLoaded();
});

function runViewer() {
  // var frameLoader = viewer.QueryInterface(Components.interfaces.nsIFrameLoaderOwner).frameLoader;

  promise.then(function () {
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
      e.initCustomEvent('shumway.message', true, false,
        {functionName: e0.detail.functionName, args: e0.detail.args});
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
  });
}
