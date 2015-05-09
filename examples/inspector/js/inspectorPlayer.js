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

var shumwayOptions = Shumway.Settings.shumwayOptions;

var builtinPath = "../../build/libs/builtin.abc";
var shellAbcPath = "../../build/libs/shell.abc";

// different playerglobals can be used here
var playerglobalInfo = {
  abcs: "../../build/playerglobal/playerglobal.abcs",
  catalog: "../../build/playerglobal/playerglobal.json"
};

Shumway.Telemetry.instance = {
  reportTelemetry: function (data) { }
};

Shumway.SystemResourcesLoadingService.instance =
  new Shumway.Player.BrowserSystemResourcesLoadingService(builtinPath, playerglobalInfo, shellAbcPath);

function runSwfPlayer(data, gfxWindow) {
  window.release = !!data.release;
  if (data.settings) {
    Shumway.Settings.setSettings(data.settings);
  }

  var asyncLoading = data.asyncLoading;
  var loaderURL = data.loaderURL;
  var movieParams = data.movieParams;
  var stageAlign = data.stageAlign;
  var stageScale = data.stageScale;
  var displayParameters = data.displayParameters;
  var recordingLimit = data.recordingLimit;
  var initStartTime = data.initStartTime;
  var file = data.file;
  var buffer = data.buffer;
  configureExternalInterfaceMocks(file);
  if (data.remoteDebugging) {
    window.ShumwayCom = parent.ShumwayCom;
    Shumway.ClipboardService.instance = new Shumway.Player.ShumwayComClipboardService();
    Shumway.ExternalInterfaceService.instance = new Shumway.Player.ShumwayComExternalInterface();
    Shumway.FileLoadingService.instance = new Shumway.Player.ShumwayComFileLoadingService();
    Shumway.FileLoadingService.instance.init(file);
  } else {
    Shumway.FileLoadingService.instance = new Shumway.Player.BrowserFileLoadingService();
    Shumway.FileLoadingService.instance.init(file, data.fileReadChunkSize);
  }
  if (data.flashlog) {
    Shumway.flashlog = new WebServerFlashLog();
  }

  Shumway.createSecurityDomain(Shumway.AVM2LoadLibrariesFlags.Builtin | Shumway.AVM2LoadLibrariesFlags.Playerglobal).then(function (securityDomain) {
    function runSWF(file, buffer) {
      var gfxService = new Shumway.Player.Window.WindowGFXService(securityDomain, window, gfxWindow);
      var player = new Shumway.Player.Player(securityDomain, gfxService);
      player.movieParams = movieParams;
      player.stageAlign = stageAlign;
      player.stageScale = stageScale;
      player.displayParameters = displayParameters;
      player.loaderUrl = loaderURL;
      player.initStartTime = initStartTime;

      player.load(file, buffer);

      reportRunning();
    }
    if (buffer) {
      runSWF(file, buffer);
    } else if (asyncLoading) {
      runSWF(file);
    } else {
      new Shumway.BinaryFileReader(file).readAll(null, function(buffer, error) {
        if (!buffer) {
          throw "Unable to open the file " + file + ": " + error;
        }
        runSWF(file, buffer);
      });
    }

  });
}

function setRelease(release) {
  window.release = release;
}

function setProfile(enabled) {
  window.profile = enabled;
}

var WriterFlags = Shumway.AVMX.WriterFlags;
var writerFlags = WriterFlags.None;
if (Shumway.AVM2.Runtime.traceRuntime.value) {
  writerFlags |= WriterFlags.Runtime;
}
if (Shumway.AVM2.Runtime.traceExecution.value) {
  writerFlags |= WriterFlags.Execution;
}
if (Shumway.AVM2.Runtime.traceInterpreter.value) {
  writerFlags |= WriterFlags.Interpreter;
}
Shumway.AVMX.setWriters(writerFlags);

function runAbc(files) {
  var BinaryFileReader = Shumway.BinaryFileReader;
  var flags = Shumway.AVM2LoadLibrariesFlags.Builtin |
    Shumway.AVM2LoadLibrariesFlags.Playerglobal |
    Shumway.AVM2LoadLibrariesFlags.Shell;
  Shumway.createSecurityDomain(flags).then(function (securityDomain) {
    function runAbc(env, buffer) {
      securityDomain.system.loadAndExecuteABC(new Shumway.AVMX.ABCFile(env, new Uint8Array(buffer)));
    }
    function shift() {
      var file = files.shift();
      new BinaryFileReader(file).readAll(null, function(buffer) {
        var env = {url: file, app: securityDomain.system};
        runAbc(env, buffer);
        if (files.length) {
          shift();
        }
      });
    }
    shift();
  });
}

function runUnitTests(fileName) {
  Shumway.createSecurityDomain(Shumway.AVM2LoadLibrariesFlags.Builtin | Shumway.AVM2LoadLibrariesFlags.Playerglobal).then(function (securityDomain) {
    jsGlobal.securityDomain = securityDomain;
    Shumway.AVMX.AS.installClassLoaders(securityDomain.application, jsGlobal);
    executeUnitTests(fileName);
  });
}

function reportRunning() {
  document.body.style.backgroundColor = 'green';
}
