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

var release = true;

var viewerPlayerglobalInfo = {
  abcs: "../build/playerglobal/playerglobal.abcs",
  catalog: "../build/playerglobal/playerglobal.json"
};

var builtinPath = "../build/libs/builtin.abc";

window.print = function (msg) {
  console.log(msg);
};

Shumway.Telemetry.instance = {
  reportTelemetry: function (data) { }
};

var player;

var iframeExternalInterface = {
  onExternalCallback: null,
  processExternalCommand: null,

  get enabled() {
    return !!this.processExternalCommand;
  },

  initJS: function (callback) {
    this.processExternalCommand({action: 'init'});
    this.onExternalCallback = function (functionName, args) {
      return callback(functionName, args);
    };
  },

  registerCallback: function (functionName) {
    var cmd = {action: 'register', functionName: functionName, remove: false};
    this.processExternalCommand(cmd);
  },

  unregisterCallback: function (functionName) {
    var cmd = {action: 'register', functionName: functionName, remove: true};
    this.processExternalCommand(cmd);
  },

  eval: function (expression) {
    var cmd = {action: 'eval', expression: expression};
    this.processExternalCommand(cmd);
    return cmd.result;
  },

  call: function (request) {
    var cmd = {action: 'call', request: request};
    this.processExternalCommand(cmd);
    return cmd.result;
  },

  getId: function () {
    var cmd = {action: 'getId'};
    this.processExternalCommand(cmd);
    return cmd.result;
  }
};

function runSwfPlayer(flashParams) {
  var EXECUTION_MODE = Shumway.AVM2.Runtime.ExecutionMode;

  var compilerSettings = flashParams.compilerSettings;
  var sysMode = compilerSettings.sysCompiler ? EXECUTION_MODE.COMPILE : EXECUTION_MODE.INTERPRET;
  var appMode = compilerSettings.appCompiler ? EXECUTION_MODE.COMPILE : EXECUTION_MODE.INTERPRET;
  var asyncLoading = true;
  var baseUrl = flashParams.baseUrl;
  var movieUrl = flashParams.url;
  Shumway.SystemResourcesLoadingService.instance =
    new Shumway.Player.BrowserSystemResourcesLoadingService(builtinPath, viewerPlayerglobalInfo);
  Shumway.createSecurityDomain(Shumway.AVM2LoadLibrariesFlags.Builtin | Shumway.AVM2LoadLibrariesFlags.Playerglobal).then(function (securityDomain) {
    function runSWF(file, buffer, baseUrl) {
      var movieParams = flashParams.movieParams;
      var objectParams = flashParams.objectParams;

      var gfxService = new Shumway.Player.Window.WindowGFXService(securityDomain, window, window.parent);
      player = new Shumway.Player.Player(securityDomain, gfxService);
      player.defaultStageColor = flashParams.bgcolor;
      player.movieParams = movieParams;
      player.stageAlign = (objectParams && (objectParams.salign || objectParams.align)) || '';
      player.stageScale = (objectParams && objectParams.scale) || 'showall';
      player.displayParameters = flashParams.displayParameters;

      player.pageUrl = baseUrl;
      player.load(file, buffer);

      var parentDocument = window.parent.document;
      var event = parentDocument.createEvent('CustomEvent');
      event.initCustomEvent('shumwaystarted', true, true, null);
      parentDocument.dispatchEvent(event);
    }

    Shumway.FileLoadingService.instance = flashParams.isRemote ?
      new RemoteFileLoadingService() :
      new Shumway.Player.BrowserFileLoadingService();
    Shumway.FileLoadingService.instance.init(baseUrl);
    if (!flashParams.isRemote) {
      Shumway.ExternalInterfaceService.instance = iframeExternalInterface;
    }

    if (asyncLoading) {
      runSWF(movieUrl, undefined, baseUrl);
    } else {
      new Shumway.BinaryFileReader(movieUrl).readAll(null, function(buffer, error) {
        if (!buffer) {
          throw "Unable to open the file " + file + ": " + error;
        }
        runSWF(movieUrl, buffer, baseUrl);
      });
    }
  });
}

function RemoteFileLoadingService() {
  this._baseUrl = null;
  this._nextSessionId = 1;
  this._sessions = [];
}
RemoteFileLoadingService.prototype = {
  init: function (baseUrl) {
    this._baseUrl = baseUrl;
    var service = this;
    window.addEventListener('message', function (e) {
      var data = e.data;
      if (typeof data !== 'object' || data === null ||
          data.type !== 'shumwayFileLoadingResponse') {
        return;
      }
      var session = service._sessions[data.sessionId];
      if (session) {
        service._notifySession(session, data);
      }
    });
  },

  _notifySession: function (session, args) {
    var sessionId = args.sessionId;
    switch (args.topic) {
      case "open":
        session.onopen();
        break;
      case "close":
        session.onclose();
        this._sessions[sessionId] = null;
        console.log('Session #' + sessionId + ': closed');
        break;
      case "error":
        session.onerror && session.onerror(args.error);
        break;
      case "progress":
        console.log('Session #' + sessionId + ': loaded ' + args.loaded + '/' + args.total);
        var data = args.array;
        if (!(data instanceof Uint8Array)) {
          data = new Uint8Array(data);
        }
        session.onprogress && session.onprogress(data, {bytesLoaded: args.loaded, bytesTotal: args.total});
        break;
    }
  },

  createSession: function () {
    var sessionId = this._nextSessionId++;
    var service = this;
    var session = {
      open: function (request) {
        var path = service.resolveUrl(request.url);
        console.log('Session #' + sessionId + ': loading ' + path);
        window.parent.parent.postMessage({type: 'shumwayFileLoading', url: path, method: request.method,
          mimeType: request.mimeType, postData: request.data,
          checkPolicyFile: request.checkPolicyFile, sessionId: sessionId}, '*');
      },
      close: function () {
        if (service._sessions[sessionId]) {
          // TODO send abort
        }
      }
    };
    return (this._sessions[sessionId] = session);
  },

  resolveUrl: function (url) {
    return new URL(url, this._baseUrl).href;
  },

  navigateTo: function (url, target) {
    window.open(this.resolveUrl(url), target || '_blank');
  }
};

window.addEventListener('message', function onWindowMessage(e) {
  var data = e.data;
  if (typeof data !== 'object' || data === null || data.type !== 'runSwf') {
    return;
  }
  window.removeEventListener('message', onWindowMessage);

  if (data.settings) {
    Shumway.Settings.setSettings(data.settings);
  }
  runSwfPlayer(data.flashParams);
  document.body.style.backgroundColor = 'green';
});
