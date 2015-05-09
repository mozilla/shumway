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

function fallback() {
  ShumwayCom.fallback();
}

window.print = function(msg) {
  console.log(msg);
};

var playerWindow, gfxWindow;

var initStartTime;

function runViewer() {
  var flashParams = ShumwayCom.getPluginParams();

  movieUrl = flashParams.url;
  if (!movieUrl) {
    console.log("no movie url provided -- stopping here");
    return;
  }

  movieParams = flashParams.movieParams;
  objectParams = flashParams.objectParams;
  var baseUrl = flashParams.baseUrl;
  var isOverlay = flashParams.isOverlay;
  var pauseExecution = flashParams.isPausedAtStart;
  initStartTime = flashParams.initStartTime;
  var isDebuggerEnabled = flashParams.isDebuggerEnabled;

  console.log("url=" + movieUrl + ";params=" + uneval(movieParams));
  if (movieParams.fmt_list && movieParams.url_encoded_fmt_stream_map) {
    // HACK removing FLVs from the fmt_list
    movieParams.fmt_list = movieParams.fmt_list.split(',').filter(function (s) {
      var fid = s.split('/')[0];
      return fid !== '5' && fid !== '34' && fid !== '35'; // more?
    }).join(',');
  }

  playerReady.then(function () {
    ShumwayCom.setupComBridge(document.getElementById('playerIframe'));
    parseSwf(movieUrl, baseUrl, movieParams, objectParams);

    var gfxDocument = gfxWindow.document;
    if (isOverlay) {
      if (isDebuggerEnabled) {
        document.getElementById('overlay').className = 'enabled';
        var fallbackDiv = document.getElementById('fallback');
        fallbackDiv.addEventListener('click', function (e) {
          fallback();
          e.preventDefault();
        });
        var reportDiv = document.getElementById('report');
        reportDiv.addEventListener('click', function (e) {
          reportIssue();
          e.preventDefault();
        });
      }
      var fallbackMenu = gfxDocument.getElementById('fallbackMenu');
      fallbackMenu.removeAttribute('hidden');
      fallbackMenu.addEventListener('click', fallback);
    }
    gfxDocument.getElementById('showURLMenu').addEventListener('click', showURL);
    gfxDocument.getElementById('inspectorMenu').addEventListener('click', showInInspector);
    gfxDocument.getElementById('reportMenu').addEventListener('click', reportIssue);
    gfxDocument.getElementById('aboutMenu').addEventListener('click', showAbout);

    var version = gfxWindow.Shumway.version || '';
    gfxDocument.getElementById('aboutMenu').label =
      gfxDocument.getElementById('aboutMenu').label.replace('%version%', version);

    if (isDebuggerEnabled) {
      gfxDocument.getElementById('debugMenu').addEventListener('click', enableDebug);
    } else {
      gfxDocument.getElementById('debugMenu').remove();
    }
  });
}

function showURL() {
  window.prompt("Copy to clipboard", movieUrl);
}

function showInInspector() {
  var base = "http://www.areweflashyet.com/shumway/examples/inspector/inspector.html?rfile=";
  var params = '';
  for (var k in movieParams) {
    params += '&' + k + '=' + encodeURIComponent(movieParams[k]);
  }
  window.open(base + encodeURIComponent(movieUrl) + params);
}

function reportIssue() {
  //var duplicatesMap = Object.create(null);
  //var prunedExceptions = [];
  //avm2.exceptions.forEach(function(e) {
  //  var ident = e.source + e.message + e.stack;
  //  var entry = duplicatesMap[ident];
  //  if (!entry) {
  //    entry = duplicatesMap[ident] = {
  //      source: e.source,
  //      message: e.message,
  //      stack: e.stack,
  //      count: 0
  //    };
  //    prunedExceptions.push(entry);
  //  }
  //  entry.count++;
  //});
  //ShumwayCom.reportIssue(JSON.stringify(prunedExceptions));
  ShumwayCom.reportIssue();
}

function showAbout() {
  window.open('http://areweflashyet.com/');
}

function enableDebug() {
  ShumwayCom.enableDebug();
}

var movieUrl, movieParams, objectParams;

window.addEventListener("message", function handlerMessage(e) {
  var args = e.data;
  switch (args.callback) {
    case 'started':
      document.body.classList.add('started');
      break;
  }
}, true);

var easelHost;

function parseSwf(url, baseUrl, movieParams, objectParams) {
  var settings = ShumwayCom.getSettings();
  var compilerSettings = settings.compilerSettings;
  var playerSettings = settings.playerSettings;

  // init misc preferences
  gfxWindow.setHudVisible(playerSettings.hud);

  console.info("Compiler settings: " + JSON.stringify(compilerSettings));
  console.info("Parsing " + url + "...");

  var backgroundColor;
  if (objectParams) {
    var m;
    if (objectParams.bgcolor && (m = /#([0-9A-F]{6})/i.exec(objectParams.bgcolor))) {
      var hexColor = parseInt(m[1], 16);
      backgroundColor = hexColor << 8 | 0xff;
    }
    if (objectParams.wmode === 'transparent') {
      backgroundColor = 0;
    }
  }

  var easel = gfxWindow.createEasel(backgroundColor);
  easelHost = gfxWindow.createEaselHost(playerWindow);

  var displayParameters = easel.getDisplayParameters();
  var data = {
    type: 'runSwf',
    flashParams: {
      compilerSettings: compilerSettings,
      movieParams: movieParams,
      objectParams: objectParams,
      displayParameters: displayParameters,
      turboMode: playerSettings.turboMode,
      env: playerSettings.env,
      bgcolor: backgroundColor,
      url: url,
      baseUrl: baseUrl || url,
      initStartTime: initStartTime
    }
  };
  playerWindow.postMessage(data, '*');
}

var playerReady = new Promise(function (resolve) {
  function iframeLoaded() {
    if (--iframesToLoad > 0) {
      return;
    }

    gfxWindow = document.getElementById('gfxIframe').contentWindow;
    playerWindow = document.getElementById('playerIframe').contentWindow;
    resolve();
  }

  var iframesToLoad = 2;
  document.getElementById('gfxIframe').addEventListener('load', iframeLoaded);
  document.getElementById('gfxIframe').src = 'resource://shumway/web/viewer.gfx.html';
  document.getElementById('playerIframe').addEventListener('load', iframeLoaded);
  document.getElementById('playerIframe').src = 'resource://shumway/web/viewer.player.html';
});

window.addEventListener('message', function onWindowMessage(e) {
  if (e.source === playerWindow) {
    gfxWindow.postMessage(e.data, '*');
  }
}, true);
