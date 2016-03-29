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
var reportPath = queryVariables.report;
var swfBase = queryVariables.swfBase || '/test/ats/swfs/';
var fpImagesBase = queryVariables.fpBase || '/test/ats/captures/';
var shumwayImagesBase = queryVariables.shuBase || '/build/snapshots/';

var report;

function loadReport() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', reportPath, true);
  xhr.responseType = 'json';
  xhr.onload = function () {
    report = xhr.response;
    renderReport();
  };
  xhr.send();
}

function renderReport() {
  var tableElement = document.getElementById('report');
  var sumSuccessRate = 0, countSuccessRate = 0;
  for (var i = 0; i < report.length; i++) {
    var trElement = document.createElement('tr');
    var item = report[i];
    var tdElement, aElement;

    tdElement = document.createElement('td');
    tdElement.title = item.id;
    tdElement.textContent = item.id.substring(0, 8);
    trElement.appendChild(tdElement);

    tdElement = document.createElement('td');
    tdElement.textContent = item.avgSuccessRate.toFixed(2);
    trElement.appendChild(tdElement);

    tdElement = document.createElement('td');
    item.framesCaptured.forEach(function (frame) {
      aElement = document.createElement('a');
      aElement.href = '';
      aElement.textContent = frame;
      aElement.onclick = showFrameDetails.bind(null, item, frame);
      if (tdElement.firstChild) {
        tdElement.appendChild(document.createTextNode(' '));
      }
      tdElement.appendChild(aElement);
    });
    trElement.appendChild(tdElement);

    tdElement = document.createElement('td');
    aElement = document.createElement('a');
    aElement.href = '';
    aElement.textContent = 'swf';
    aElement.onclick = showSwf.bind(null, item);
    tdElement.appendChild(aElement);
    trElement.appendChild(tdElement);

    tableElement.appendChild(trElement);

    sumSuccessRate += item.avgSuccessRate;
    countSuccessRate++;
  }

  var avgSuccessRate = sumSuccessRate / countSuccessRate;
  var pElement = document.createElement('pre');
  pElement.textContent =
    'Count: ' + countSuccessRate + '\n' +
    'Average Success Rate: ' + avgSuccessRate.toFixed(2) +'\n';
  document.body.appendChild(pElement);
}

function showFrameDetails(swf, frame) {
  var details = document.getElementById('details');
  details.textContent = '';
  var pElement = document.createElement('pre');
  pElement.textContent =
    'ID: ' + swf.id + '\n' +
    'Size: ' + swf.width + 'x' + swf.height + '=' + swf.totalPixels + 'px\n' +
    'Frame: ' + frame + '\n' +
    'Success Rate: ' + swf.frames[frame].successRate + ' (' + swf.frames[frame].differentPixels + 'px off)\n';

  details.appendChild(pElement);
  var imgElement;
  imgElement = document.createElement('img');
  imgElement.src = fpImagesBase + swf.id + '/' + frame + '.png';
  imgElement.alt = 'FP';
  details.appendChild(wrapResult('fp', imgElement));

  details.appendChild(document.createTextNode(' '));

  imgElement = document.createElement('img');
  imgElement.src = shumwayImagesBase + swf.id + '/' + frame + '.png';
  imgElement.alt = 'Shumway';
  details.appendChild(wrapResult('shumway', imgElement));
  return false;
}

function showSwf(swf) {
  var details = document.getElementById('details');
  details.textContent = '';
  var pElement = document.createElement('pre');
  pElement.textContent =
    'ID: ' + swf.id + '\n' +
    'Size: ' + swf.width + 'x' + swf.height + '=' + swf.totalPixels + 'px\n' +
    'Total Frame: ' + swf.frameCount + '\n' +
    'Frame Rate: ' + swf.rate + '\n';
  details.appendChild(pElement);

  var objElement = document.createElement('object');
  objElement.type = 'application/x-shockwave-flash';
  objElement.data = swfBase + swf.id + '.swf';
  objElement.width = swf.width;
  objElement.height = swf.height;
  var paramElement = document.createElement('param');
  paramElement.name = 'shumwaymode';
  paramElement.value = 'off';
  objElement.appendChild(paramElement);
  details.appendChild(wrapResult('fp', objElement));

  details.appendChild(document.createTextNode(' '));

  var objElement = document.createElement('object');
  objElement.type = 'application/x-shockwave-flash';
  objElement.data = swfBase + swf.id + '.swf';
  objElement.width = swf.width;
  objElement.height = swf.height;
  details.appendChild(wrapResult('shumway', objElement));

  return false;
}

function wrapResult(type, element) {
  var wrapper = document.createElement('span');
  wrapper.className = 'wrapper ' + type;
  var div = document.createElement('div');
  div.textContent = type;
  wrapper.appendChild(div);
  wrapper.appendChild(element);
  return wrapper;
}

loadReport();
