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
var avm2Options = shumwayOptions.register(new Shumway.Options.OptionSet("AVM2"));
var sysCompiler = avm2Options.register(new Shumway.Options.Option("sysCompiler", "sysCompiler", "boolean", true, "system compiler/interpreter (requires restart)"));
var appCompiler = avm2Options.register(new Shumway.Options.Option("appCompiler", "appCompiler", "boolean", true, "application compiler/interpreter (requires restart)"));

var builtinPath = "../../build/libs/builtin.abc";

// different playerglobals can be used here
var playerglobalInfo = {
  abcs: "../../build/playerglobal/playerglobal.abcs",
  catalog: "../../build/playerglobal/playerglobal.json"
};

Shumway.Telemetry.instance = {
  reportTelemetry: function (data) { }
};

function runSwfPlayer(data) {
  var sysMode = data.sysMode;
  var appMode = data.appMode;
  var asyncLoading = data.asyncLoading;
  var loaderURL = data.loaderURL;
  var movieParams = data.movieParams;
  var stageAlign = data.stageAlign;
  var stageScale = data.stageScale;
  var displayParameters = data.displayParameters;
  var file = data.file;
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
  Shumway.SystemResourcesLoadingService.instance =
    new Shumway.Player.BrowserSystemResourcesLoadingService(builtinPath, playerglobalInfo);
  Shumway.createSecurityDomain(Shumway.AVM2LoadLibrariesFlags.Builtin | Shumway.AVM2LoadLibrariesFlags.Playerglobal).then(function (securityDomain) {
    function runSWF(file) {
      var gfxService = new Shumway.Player.Window.WindowGFXService(securityDomain, window);
      var player = new Shumway.Player.Player(securityDomain, gfxService);
      player.movieParams = movieParams;
      player.stageAlign = stageAlign;
      player.stageScale = stageScale;
      player.displayParameters = displayParameters;
      player.loaderUrl = loaderURL;
      player.load(file);
    }
    if (asyncLoading) {
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

window.addEventListener('message', function onWindowMessage(e) {
  var data = e.data;
  if (typeof data !== 'object' || data === null || data.type !== 'runSwf') {
    return;
  }
  window.removeEventListener('message', onWindowMessage);

  if (data.settings) {
    Shumway.Settings.setSettings(data.settings);
  }
  release = !!data.release;
  runSwfPlayer(data);
  document.body.style.backgroundColor = 'green';
});
