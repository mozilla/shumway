/**
 * Copyright 2015 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
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

var movieURL = queryVariables['swfm'] || 'tiger.swfm';
var scoreRun = queryVariables['score'] === 'true';
var fastRun = queryVariables['fast'] === 'true';
var easelHost;

function startMovie(file) {
  //Shumway.GFX.WebGL.SHADER_ROOT = "../../src/gfx/gl/shaders/";

  var easelContainer = document.getElementById('easelContainer');
  var easel = new Shumway.GFX.Easel(easelContainer);

  easelHost = new Shumway.GFX.Test.PlaybackEaselHost(easel);
  easelHost.playUrl(file);

  if (scoreRun) {
    easelHost.alwaysRenderFrame = true;
    easelHost.ignoreTimestamps = fastRun;
    easelHost.onComplete = function () {
      alert('Score: ' + Math.round(easelHost.cpuTime) + '\n' +
        ' (updates: ' + Math.round(easelHost.cpuTimeUpdates) +
        ', render: ' + Math.round(easelHost.cpuTimeRendering) + ')');
    };
  } else {
    easel.startRendering();
  }
}

window.addEventListener('DOMContentLoaded', function () {
  startMovie(movieURL);
});
