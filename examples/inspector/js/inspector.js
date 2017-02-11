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

function parseQueryString(qs) {
  if (!qs)
    return {};

  if (qs.charAt(0) == '?')
    qs = qs.slice(1);

  var values = qs.split('&');
  var obj = {};
  for (var i = 0; i < values.length; i++) {
    var kv = values[i].split('=');
    var key = kv[0], value = kv[1];
    obj[decodeURIComponent(key)] = decodeURIComponent(value);
  }

  return obj;
}

var queryVariables = parseQueryString(window.location.search);

var startPromise = configureMocks(queryVariables);

var asyncLoading = true; // queryVariables['async'] === "true";

/**
 * Files can either be specified via the GET param `rfile`, or by manually selecting a local file.
 */
if (queryVariables['rfile'] && !startPromise) {
  startPromise = Promise.resolve({
    url: queryVariables['rfile'],
    args: parseQueryString(queryVariables['flashvars'])
  });
}

function showMessage(msg) {
  document.getElementById('message').textContent = "(" + msg + ")";
}
function showOpenFileButton(show) {
  document.getElementById('openFile').classList.toggle('active', show);
  document.getElementById('debugInfoToolbarTabs').classList.toggle('active', !show);
}

var gfxWindow;
var gfxReady = new Promise(function (resolve) {
  var iframe = document.getElementById('gfxIframe');
  iframe.addEventListener('load', function () {
    gfxWindow = iframe.contentWindow;
    resolve(gfxWindow);
  });
});
var playerWindow;
var playerReady = new Promise(function (resolve) {
  var iframe = document.getElementById('playerIframe');
  iframe.addEventListener('load', function () {
    playerWindow = iframe.contentWindow;
    resolve(playerWindow);
  });
});

function setRelease(release) {
  window.release = release;
  gfxWindow.setRelease(release);
  playerWindow.setRelease(release);
}

var traceTerminal;
function setLogOptions(logToConsole, logToDebugPanel) {
  if (logToDebugPanel) {
    traceTerminal = new Shumway.Tools.Terminal.Terminal(document.getElementById("traceTerminal"));
    traceTerminal.refreshEvery(100);
  }
  gfxWindow.setLogOptions(logToConsole, logToDebugPanel, traceTerminal);
  playerWindow.setLogOptions(logToConsole, logToDebugPanel, traceTerminal);
}

function monitorGfxOptionsChange() {
  document.addEventListener('shumwayOptionsChanged', function () {
    gfxWindow.syncGFXOptions();
    gfxWindow.invalidateStage();
  });
  gfxWindow.syncGFXOptions();
}

var easelHost;
function runIFramePlayer(data) {
  var easel = gfxWindow.createEasel();

  data.type = 'runSwf';
  data.settings = Shumway.Settings.getSettings();
  data.release = state.release;
  data.displayParameters = easel.getDisplayParameters();

  playerWindow.runSwfPlayer(data, gfxWindow);

  var useRecorder = state.recordingLimit > 0;
  easelHost = useRecorder ?
    gfxWindow.createRecordingEaselHost(playerWindow, state.recordingLimit) :
    gfxWindow.createEaselHost(playerWindow);
  monitorGfxOptionsChange();
  if (state.overlayFlash) {
    gfxWindow.ensureFlashOverlay(data.file, data.stageScale, data.stageAlign);
  }
}

function runPlaybackPlayer(file) {
  var easel = gfxWindow.createEasel();

  easelHost = gfxWindow.createPlaybackEaselHost(file);
  monitorGfxOptionsChange();
}

function runAbcPlayer(files) {
  playerWindow.runAbc(files);
}

function runUnitTestsPlayer(file) {
  playerWindow.runUnitTests(file);
}

/**
 * The |path| argument can be a comma delimited list of files, but this only works for .abc files at the moment.
 */
function executeFile(path, buffer, movieParams, remoteDebugging) {
  var fileNames = path.split('?')[0].split('#')[0].split(",");
  var fileName = fileNames[0];

  var files = fileNames.map(function (file) {
    return new URL(file, document.location.href).href;
  });
  var file = files[0];

  if (fileName.endsWith(".swf")) {
    runIFramePlayer({
      movieParams: movieParams, file: file, asyncLoading: asyncLoading,
      stageAlign: state.salign, stageScale: state.scale,
      fileReadChunkSize: state.fileReadChunkSize, loaderURL: state.loaderURL,
      remoteDebugging: !!remoteDebugging, flashlog: state.flashlogEnabled,
      recordingLimit: state.recordingLimit});
  } else if (fileName.endsWith(".swfm")) {
    runPlaybackPlayer(file);
  } else if (fileName.endsWith(".abc")) {
    runAbcPlayer(files);
  } else if (fileName.endsWith(".js") || fileName.endsWith("/")) {
    runUnitTestsPlayer(file);
  }
}

// toggle info panels (debug info, display list, settings, none)
var panelToggleButtonSelector = "#topToolbar > .toolbarButtonBar > .toolbarButton";
function panelToggleButtonClickHandler(event) {
  Array.prototype.forEach.call(event.target.parentElement.children, function (button) {
    var isActive = (button == event.target);
    button.classList.toggle("pressedState", isActive);
    togglePanelVisibility(button.dataset.panelid, isActive);
  });
  state.debugPanelId = event.target.dataset.panelid;
  saveInspectorState();
}
Array.prototype.forEach.call(document.querySelectorAll(panelToggleButtonSelector), function (element) {
  element.addEventListener("click", panelToggleButtonClickHandler);
  if (element.dataset.panelid === state.debugPanelId) {
    element.click();
  }
});
function togglePanelVisibility(id, visible) {
  if (id !== "none") {
    var panel = document.getElementById(id);
    panel.classList.toggle("active", visible);
  } else {
    document.body.classList.toggle("hideDebugInfoPanels", visible);
  }
  profiler.resize();
  if (traceTerminal) {
    traceTerminal.resize();
  }
}
function resetPanelsToSettings() {
  if (state.debugPanelId === 'settingsContainer') {
    return;
  }
  state.debugPanelId = 'settingsContainer';
  Array.prototype.forEach.call(document.querySelectorAll(panelToggleButtonSelector), function (button) {
    var isActive = button.dataset.panelid === 'settingsContainer';
    button.classList.toggle("pressedState", isActive);
    togglePanelVisibility(button.dataset.panelid, isActive);
  });
  saveInspectorState();
}

Promise.all([gfxReady, playerReady]).then(function () {
  mergeOptionSets(Shumway.Settings.shumwayOptions, gfxWindow.Shumway.Settings.shumwayOptions);
  mergeOptionSets(Shumway.Settings.shumwayOptions, playerWindow.Shumway.Settings.shumwayOptions);

  var shumwaySettings = loadSettingsFromStorage(Shumway.Settings.ROOT);
  Shumway.Settings.shumwayOptions.setSettings(shumwaySettings);

  createOptionsGUI();

  setRelease(state.release);
  setLogOptions(state.logToConsole, state.logToDebugPanel);
  gfxWindow.resizeEaselContainer(state.width, state.height);
  gfxWindow.setLogAssets(state.logAssets, document.getElementById("assetList"));
  gfxWindow.setLogScratchCanvases(state.logScratchCanvases,
    document.getElementById("scratchCanvasContainer"));

  if (state.profileStartup && state.profileStartupDuration > 0) {
    profiler.start(performance.now(), state.profileStartupDuration, false);
  }

  if (startPromise) {
    startPromise.then(function (config) {
      executeFile(config.url, null, config.args);
    });
  } else {
    showOpenFileButton(true);
    if (state.remoteEnabled) {
      initRemoteDebugging();
    }
    resetPanelsToSettings();
  }
});

document.addEventListener('inspectorOptionsChanged', function (e) {
  var propertyName = e.detail.property;
  switch (propertyName) {
    case 'release':
      setRelease(state.release);
      break;
    case 'logAssets':
      gfxWindow.setLogAssets(state.logAssets, document.getElementById("assetList"));
      break;
    case 'logScratchCanvases':
      gfxWindow.setLogScratchCanvases(state.logScratchCanvases,
        document.getElementById("scratchCanvasContainer"));
      break;
    case 'overlayFlash':
      gfxWindow.setFlashOverlayState(state.overlayFlash);
      break;
    case 'width':
    case 'height':
      gfxWindow.resizeEaselContainer(state.width, state.height);
      break;
  }
});

document.addEventListener('shumwayOptionsChanged', function () {
  var shumwaySettings = Shumway.Settings.getSettings();
  saveSettingsToStorage(Shumway.Settings.ROOT, shumwaySettings);
});
