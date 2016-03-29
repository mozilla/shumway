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

function postData(path, data) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", path, true);
  xhr.send(data);
}

function postInfoMessage(message) {
  postData('/info', JSON.stringify({message: message}));
}

function execManifest(path, extension) {
  function exec(manifest) {
    var i = 0;
    function next() {
      if (i >= manifest.length) {
        postData('/tellMeToQuit?browser=' + escape(browser));
        return;
      }
      var test = manifest[i++];
      postData('/progress', JSON.stringify({
        browser: browser,
        id: test.id
      }));


      TestContext._slavePath = extension ? 'harness/slave.extension.html' :
                                           'harness/slave.html';

      switch (test.type) {
      case 'stas':
        // using specified number (or 1) as frame rate by default
        // some tests may fail
        TestContext.defaultRate = test.defaultRate || 1;

        execStas(test.stas, test.filenames,
          function (itemNumber, itemsCount, item, result) {
            postData('/result', JSON.stringify({
              browser: browser,
              id: test.id,
              failure: false,
              item: item,
              numItems: itemsCount,
              snapshot: {
                isDifferent: result.failure,
                data1: result.data1,
                data2: result.data2
              }
            }));
            if (itemNumber + 1 == itemsCount) { // last item
              next();
            }
          });
        break;
      case 'eq':
        execEq(test.swf, test.frames,
          function (itemNumber, itemsCount, item, result) {
            postData('/result', JSON.stringify({
              browser: browser,
              id: test.id,
              failure: result.failure,
              item: item,
              numItems: itemsCount,
              snapshot: result.snapshot
            }));
            if (itemNumber + 1 == itemsCount) { // last item
              next();
            }
        });
        break;
      default:
        throw 'unknown test type';
      }
    }
    next();
  }
  function load() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", path, true);
    xhr.onreadystatechange = function(event) {
      if (xhr.readyState === 4) {
        exec(JSON.parse(xhr.responseText));
      }
    }
    xhr.setRequestHeader("If-Modified-Since", "Fri, 01 Jan 1960 00:00:00 GMT"); // no-cache
    xhr.send(null);
  }
  load();
}

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return unescape(pair[1]);
    }
  }
  return undefined;
}

var manifestFile = getQueryVariable("manifestFile");
var browser = getQueryVariable("browser");
var path = getQueryVariable("path");
var extension = getQueryVariable("extension") === "true";

postInfoMessage('Browser \'' + browser + '\': ' + navigator.userAgent);
execManifest(manifestFile, extension);

