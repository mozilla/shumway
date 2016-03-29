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
  abcs: "../../build/playerglobal/playerglobal.abcs",
  catalog: "../../build/playerglobal/playerglobal.json"
};

var builtinPath = "../../build/libs/builtin.abc";

window.print = function () {};

Shumway.Telemetry.instance = {
  reportTelemetry: function (data) { }
};

Shumway.FileLoadingService.instance = new Shumway.Player.BrowserFileLoadingService();
Shumway.LocalConnectionService.instance = new Shumway.Player.PlayerInternalLocalConnectionService();

function runSwfPlayer(flashParams, settings, gfxWindow) {
  if (settings) {
    Shumway.Settings.setSettings(settings);
  }

  Shumway.dontSkipFramesOption.value = true;
  Shumway.frameRateOption.value = 60; // turbo mode

  var compilerSettings = flashParams.compilerSettings;
  var asyncLoading = true;
  var baseUrl = flashParams.baseUrl;
  var movieParams = flashParams.movieParams;
  var objectParams = flashParams.objectParams;
  var displayParameters = flashParams.displayParameters;
  var movieUrl = flashParams.url;
  Shumway.SystemResourcesLoadingService.instance =
    new Shumway.Player.BrowserSystemResourcesLoadingService(builtinPath, viewerPlayerglobalInfo);
  Shumway.createSecurityDomain(Shumway.AVM2LoadLibrariesFlags.Builtin | Shumway.AVM2LoadLibrariesFlags.Playerglobal).then(function (securityDomain) {
    function runSWF(file) {
      var peer = new Shumway.Remoting.WindowTransportPeer(window, gfxWindow);
      var gfxService = new Shumway.Player.Window.WindowGFXService(securityDomain, peer);
      var player = new Shumway.Player.Player(securityDomain, gfxService);
      player.stageAlign = 'tl';
      player.stageScale = 'noscale';
      player.displayParameters = displayParameters;
      player.load(file);

      document.body.style.backgroundColor = 'green';
    }

    Shumway.FileLoadingService.instance.init(baseUrl);
    movieUrl = Shumway.FileLoadingService.instance.resolveUrl(movieUrl);
    if (asyncLoading) {
      runSWF(movieUrl);
    } else {
      new Shumway.BinaryFileReader(movieUrl).readAll(null, function(buffer, error) {
        if (!buffer) {
          throw "Unable to open the file " + file + ": " + error;
        }
        runSWF(movieUrl, buffer);
      });
    }
  });
}
