/*
 * Copyright 2015 Mozilla Foundation
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

var removeDebuggerBaseURL = 'http://localhost:8010';

var remoteDebuggerId;
var remoteDebugger;
var remoteDebuggerController;
function initRemoteDebugging() {
  remoteDebuggerId = (Date.now() % 100000) + 2;
  remoteDebugger = new PingPongConnection(removeDebuggerBaseURL + '/debug/' + remoteDebuggerId + '/1');
  remoteDebugger.onData = remoteDebugger_onData;

  remoteDebuggerController = new PingPongConnection(removeDebuggerBaseURL + '/debugController/1/2');
  remoteDebuggerController.onData = function (data) {
    switch (data.action) {
      case 'getDebugger':
        if (data.swfUrl && data.swfUrl.indexOf(state.remoteSWF) === 0) {
          return remoteDebuggerId;
        }
        return 0;
      case 'enableDebugging':
        var properties = document.getElementById('settingsContainer').querySelectorAll('.property-name');
        for (var i = 0; i < properties.length; i++) {
          if (properties[i].textContent === 'remoteSWF') {
            var input = properties[i].parentElement.getElementsByTagName('input')[0];
            input.value = data.swfUrl;
            break;
          }
        }
        state.remoteSWF = data.swfUrl;
        saveInspectorState();
        return;
    }
  };
}

var externalInteraceCallback;
function remoteDebuggerInitServices() {
  window.addEventListener('beforeunload', function(event) {
    remoteDebugger.send({action: 'reload'}, true);
  });
  processExternalCommand = function (command) {
    switch (command.action) {
      case 'isEnabled':
        command.result = true;
        break;
      case 'initJS':
        remoteDebuggerSendMessage({action: 'externalCom', data: {action: 'init'}, sync: true});
        externalInteraceCallback = function (functionName, args) {
          return easelHost.sendExernalCallback(functionName, args);
        };
        break;
      default:
        var result = remoteDebuggerSendMessage({action: 'externalCom', data: command, sync: true});
        command.result = result ? JSON.parse(result) : undefined;
        break;
    }
  };
  Shumway.ClipboardService.instance = {
    setClipboard: function (data) {
      remoteDebuggerSendMessage({action: 'setClipboard', data: data}, false);
    }
  };
  Shumway.FileLoadingService.instance = {
    baseUrl: null,
    nextSessionId: 1, // 0 - is reserved
    sessions: [],
    createSession: function () {
      var sessionId = this.nextSessionId++;
      return this.sessions[sessionId] = {
        open: function (request) {
          var self = this;
          var path = Shumway.FileLoadingService.instance.resolveUrl(request.url);
          console.log('Session #' + sessionId + ': loading ' + path);
          remoteDebuggerSendMessage({
            action: 'loadFile',
            data: {url: path, method: request.method,
              mimeType: request.mimeType, postData: request.data,
              checkPolicyFile: request.checkPolicyFile, sessionId: sessionId}
          }, true);
        },
        notify: function (args) {
          switch (args.topic) {
            case "open":
              this.onopen();
              break;
            case "close":
              this.onclose();
              Shumway.FileLoadingService.instance.sessions[sessionId] = null;
              console.log('Session #' + sessionId + ': closed');
              break;
            case "error":
              this.onerror && this.onerror(args.error);
              break;
            case "progress":
              console.log('Session #' + sessionId + ': loaded ' + args.loaded + '/' + args.total);
              this.onprogress && this.onprogress(new Uint8Array(args.array), {bytesLoaded: args.loaded, bytesTotal: args.total});
              break;
          }
        },
        close: function () {
          if (Shumway.FileLoadingService.instance.sessions[sessionId]) {
            // TODO send abort
          }
        }
      };
    },
    setBaseUrl: function (url) {
      return Shumway.FileLoadingService.instance.baseUrl = url;
    },
    resolveUrl: function (url) {
      return new URL(url, Shumway.FileLoadingService.instance.baseUrl).href;
    },
    navigateTo: function (url, target) {
      remoteDebuggerSendMessage({
        action: 'navigateTo',
        data: {
          url: this.resolveUrl(url),
          target: target
        }
      }, true);
    }
  };
}

function remoteDebuggerSendMessage(detail, async) {
  return remoteDebugger.send({action: 'sendMessage', detail: detail}, async);
}

function remoteDebugger_onData(data) {
  switch (data.action) {
    case 'runViewer':
      showOpenFileButton(false);
      remoteDebuggerInitServices();

      var flashParams = JSON.parse(remoteDebuggerSendMessage({action: 'getPluginParams', data: null, sync: true}));

      var movieUrl = flashParams.url;
      var movieParams = flashParams.movieParams;
      executeFile(movieUrl, undefined, movieParams, true);

      remoteDebuggerSendMessage({action: 'endActivation', data: null}, true);
      return;
    case 'onExternalCallback':
      var call = data.detail;
      externalInteraceCallback(call.functionName, call.args);
      return;
    case 'onLoadFileCallback':
      var args = data.detail;
      var session = Shumway.FileLoadingService.instance.sessions[args.sessionId];
      if (session) {
        session.notify(args);
      }
      return;
  }
}
