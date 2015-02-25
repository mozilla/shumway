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

window.notifyShumwayMessage = function (detail) { };
window.onExternalCallback = null;
window.onLoadFileCallback = null;

var viewer = document.getElementById('viewer'), onLoaded;
var promise = new Promise(function (resolve) {
  onLoaded = resolve;
});
viewer.addEventListener('load', function () {
  onLoaded(false);
});
viewer.addEventListener('mozbrowserloadend', function () {
  onLoaded(true);
});

Components.utils.import('chrome://shumway/content/ShumwayCom.jsm');

function runViewer() {
  function handler() {
    function sendMessage(action, data, sync) {
      var detail = {action: action, data: data, sync: sync};
      var result = window.notifyShumwayMessage(detail);
      return Components.utils.cloneInto(result, childWindow);
    }

    var childWindow = viewer.contentWindow.wrappedJSObject;

    var shumwayComAdapter = ShumwayCom.createAdapter(childWindow, {
      sendMessage: sendMessage,
      enableDebug: enableDebug
    });

    window.onExternalCallback = function (call) {
      return shumwayComAdapter.onExternalCallback(Components.utils.cloneInto(call, childWindow));
    };

    window.onLoadFileCallback = function (args) {
      shumwayComAdapter.onLoadFileCallback(Components.utils.cloneInto(args, childWindow));
    };

    childWindow.runViewer();
  }

  function handlerOOP() {
    var frameLoader = viewer.QueryInterface(Components.interfaces.nsIFrameLoaderOwner).frameLoader;
    var messageManager = frameLoader.messageManager;
    messageManager.loadFrameScript('chrome://shumway/content/content.js', false);

    var externalInterface;

    messageManager.addMessageListener('Shumway:running', function (message) {
      externalInterface = message.objects.externalInterface;
    });

    messageManager.addMessageListener('Shumway:message', function (message) {
      var detail = {
        action: message.data.action,
        data: message.data.data,
        sync: message.data.sync
      };
      if (message.data.callback) {
        detail.callback = true;
        detail.cookie = message.data.cookie;
      }

      return window.notifyShumwayMessage(detail);
    });

    messageManager.addMessageListener('Shumway:enableDebug', function (message) {
      enableDebug();
    });

    window.onExternalCallback = function (call) {
      return externalInterface.callback(JSON.stringify(call));
    };

    window.onLoadFileCallback = function (args) {
      messageManager.sendAsyncMessage('Shumway:loadFile', args);
    };

    messageManager.sendAsyncMessage('Shumway:init', {});
  }


  function handleDebug(connection) {
    viewer.parentNode.removeChild(viewer); // we don't need viewer anymore
    document.body.className = 'remoteDebug';

    function sendMessage(data) {
      var detail = {
        action: data.id,
        data: data.data,
        sync: data.sync
      };
      var result = window.notifyShumwayMessage(detail);
      if (data.sync) {
        return result === undefined ? undefined : JSON.parse(result);
      }
    }

    connection.onData = function (data) {
      switch (data.action) {
        case 'sendMessage':
          return sendMessage(data);
        case 'reload':
          document.body.className = 'remoteReload';
          setTimeout(function () {
            window.top.location.reload();
          }, 1000);
          return;
      }
    };

    window.onExternalCallback = function (call) {
      return connection.send({action: 'onExternalCallback', detail: call});
    };

    window.onLoadFileCallback = function (args) {
      if (args.array) {
        args.array = Array.prototype.slice.call(args.array, 0);
      }
      return connection.send({action: 'onLoadFileCallback', detail: args}, true);
    };

    connection.send({action: 'runViewer'}, true);
  }

  function enableDebug() {
    DebugUtils.enableDebug(window.swfUrlLoading);
    setTimeout(function () {
      window.top.location.reload();
    }, 1000);
  }

  promise.then(function (oop) {
    if (DebugUtils.isEnabled) {
      DebugUtils.createDebuggerConnection(window.swfUrlLoading).then(function (debuggerConnection) {
        if (debuggerConnection) {
          handleDebug(debuggerConnection);
        } else if (oop) {
          handlerOOP();
        } else {
          handler();
        }
      });
      return;
    }

    if (oop) {
      handlerOOP();
    } else {
      handler();
    }
  });
}
