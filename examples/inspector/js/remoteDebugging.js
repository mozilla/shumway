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
  remoteDebuggerId = (Date.now() % 888888) * 2;

  remoteDebuggerController = new PingPongConnection(removeDebuggerBaseURL + '/debugController/' + remoteDebuggerId);
  remoteDebuggerController.onData = function (data) {
    switch (data.action) {
      case 'getDebugger':
        if (data.swfUrl && state.remoteSWF && data.swfUrl.indexOf(state.remoteSWF) === 0) {
          remoteDebugger = new PingPongConnection(removeDebuggerBaseURL + '/debug/' + remoteDebuggerId + '/' + data.swfId);
          remoteDebugger.onData = remoteDebugger_onData;

          remoteDebuggerController.send({action: 'setDebugger', swfUrl: data.swfUrl, debuggerId: remoteDebuggerId}, true);
        }
        return;
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

var ShumwayCom;
var shumwayComLoadFileCallback, shumwayComExternalCallback;
function remoteDebuggerInitServices() {
  window.addEventListener('beforeunload', function(event) {
    if (state.remoteAutoReload) {
      remoteDebugger.send({action: 'reload'}, true);
    }
  });

  ShumwayCom = {
    userInput: function () { remoteDebuggerSendMessage('userInput', undefined, true); },
    fallback: function () { remoteDebuggerSendMessage('fallback', undefined, true); },
    reportIssue: function (details) { remoteDebuggerSendMessage('reportIssue', details, true); },
    reportTelemetry: function () { remoteDebuggerSendMessage('reportTelemetry', data, true); },
    enableDebug: function () { remoteDebuggerSendMessage('enableDebug', undefined, true); },
    getPluginParams: function () { return remoteDebuggerSendMessage('getPluginParams', undefined, false); },
    getSettings: function () { return remoteDebuggerSendMessage('getSettings', undefined, false); },
    setClipboard: function (data) { remoteDebuggerSendMessage('setClipboard', data, true); },
    setFullscreen: function (enabled) { remoteDebuggerSendMessage('setFullscreen', enabled, true); },
    externalCom: function (args) { return remoteDebuggerSendMessage('externalCom', args, false); },
    loadFile: function (args) { remoteDebuggerSendMessage('loadFile', args, true); },
    abortLoad: function (sessionId) { remoteDebuggerSendMessage('abortLoad', sessionId, true); },
    navigateTo: function (args) { remoteDebuggerSendMessage('navigateTo', args, true); },

    setLoadFileCallback: function (callback) { shumwayComLoadFileCallback = callback; },
    setExternalCallback: function (callback) { shumwayComExternalCallback = callback; }
  };
}

function remoteDebuggerSendMessage(id, data, async) {
  return remoteDebugger.send({action: 'sendMessage', id: id, data: data, sync: !async}, async);
}

function remoteDebugger_onData(data) {
  switch (data.action) {
    case 'runViewer':
      showOpenFileButton(false);
      remoteDebuggerController.close();
      remoteDebuggerInitServices();

      var flashParams = ShumwayCom.getPluginParams();

      var movieUrl = flashParams.url;
      var movieParams = flashParams.movieParams;
      executeFile(movieUrl, undefined, movieParams, true);
      break;
    case 'onExternalCallback':
      var call = data.detail;
      shumwayComExternalCallback(call);
      break;
    case 'onLoadFileCallback':
      var args = data.detail;
      shumwayComLoadFileCallback(args);
      break;
  }
}
