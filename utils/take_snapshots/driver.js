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

var easel, easelHost, player;

var list = queryVariables.list;
var frames = queryVariables.frames.split(',').map(function (x) { return x|0; });
var base = '../../';
var executionTimeout = 10000;

function runMovie(path, width, height, reportFrames, callback) {
  function frameCallback() {
    while (index < reportFrames.length && currentFrame >= reportFrames[index]) {
      var snapshot = shumwayObj.takeScreenshot({stageContent: true, disableHidpi: true});
      sendImage(reportFrames[index], snapshot.dataURL);
      index++;
    }
    if (index >= reportFrames.length) {
      terminate();
    }
    currentFrame++;
  }

  function terminate() {
    if (terminated) {
      return;
    }

    terminated = true;
    document.getElementById('swfContainer').textContent = '';
    shumwayObj.onFrame = null;
    shumwayObj = null;
    clearTimeout(timeout);

    callback();
  }

  console.log('Running ' + path);
  var div = document.createElement('div');
  div.id = 'testswf';
  document.getElementById('swfContainer').appendChild(div);

  var timeout = setTimeout(function () {
    terminate();
  }, executionTimeout);
  var terminated = false;

  var currentFrame = -1, index = 0;
  var shumwayObj;
  shuobject.embedSWF(path, 'testswf', width, height, '9,0,10', null, {}, {salign: 'tl', scale: 'noscale'}, {}, function (e) {
    shumwayObj = shuobject.getShumwayObject(e.ref);
    shumwayObj.onFrame = frameCallback;
  });
}

var swfsToProcess = [];
function readList() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', list, true);
  xhr.onload = function () {
    var content = xhr.responseText;
    if (content) {
      swfsToProcess = content.split(/\n/g).filter(function (line) {
        return line && line[0] !== '#';
      });
    }
    processNextSwf();
  };
  xhr.send();
}

var swfId;

function processNextSwf() {
  if (swfsToProcess.length === 0) {
    sendQuit();
    return;
  }
  var swfPath = swfsToProcess.shift();
  var i = swfPath.lastIndexOf('/'), j = swfPath.indexOf('.', i);
  swfId = swfPath.substring(i + 1, j);
  runMovie(base + swfPath, 1024, 1024, frames, function () {
    processNextSwf();
  });
}

function sendImage(n, dataURL) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/snapshots/' + swfId + '/' + n, true);
  xhr.send(dataURL);
}

function sendQuit() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/quit', true);
  xhr.onload = function () {
    window.close();
  };
  xhr.send();
}

readList();
