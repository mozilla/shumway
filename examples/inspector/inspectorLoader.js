/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
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

var body = $("body");
var stage = $("#stage");

function readFile(file) {
  var reader = new FileReader();
  if (file.name.endsWith(".abc") || file.name.endsWith(".swf")) {
    reader.onload = function() {
      executeFile(file.name, this.result);
    }
  } else {
    throw new TypeError("unsupported format");
  }
  reader.readAsArrayBuffer(file);
}

body.on("dragenter dragover", function(event) {
  event.stopPropagation();
  event.preventDefault();
});

body.on("drop", function(event) {
  event.stopPropagation();
  event.preventDefault();
  var file = event.originalEvent.dataTransfer.files[0];
  readFile(file);
});

$("#files").on("change", function(event) {
  var file = event.originalEvent.target.files[0];
  readFile(file);
});

$("#openFile").click(function () {
  $("#files").click();
});

$(".closeButton").click(function (event) {
  event.target.parentElement.setAttribute('hidden', true);
});

$(document).on("keydown", function (event) {
  if (event.keyCode == 119 && event.ctrlKey) { // Ctrl+F8
    pauseExecution = !pauseExecution;
  }
});
