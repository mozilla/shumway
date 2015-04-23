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

function readFile(file) {
  if (!(file.name.endsWith(".abc") || file.name.endsWith(".swf"))) {
    throw new TypeError("unsupported format");
  }
  var reader = new FileReader();
  reader.onload = function () {
    executeFile(file.name, this.result);
  };
  reader.readAsArrayBuffer(file);
}

function loadScript(file, next) {
  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.onload = next || null;
  script.src = file;
  document.getElementsByTagName('head')[0].appendChild(script);
}

document.body.addEventListener("dragenter", function(event) {
  event.stopPropagation();
  event.preventDefault();
});

document.body.addEventListener("dragover", function(event) {
  event.stopPropagation();
  event.preventDefault();
});

document.body.addEventListener("drop", function(event) {
  event.stopPropagation();
  event.preventDefault();
  var file = event.dataTransfer.files[0];
  readFile(file);
});

document.getElementById("files").addEventListener("change", function(event) {
  var file = event.target.files[0];
  readFile(file);
  showOpenFileButton(false);
});

document.getElementById("openFile").addEventListener("click", function () {
  document.getElementById("files").click();
});
