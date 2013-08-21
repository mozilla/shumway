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

function loadScript(file, next) {
  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.onload = function () {
    next && next();
  };
  script.src = file;
  document.getElementsByTagName('head')[0].appendChild(script);
}

function readDirectoryListing(path, next) {
  assert (path.endsWith("/"));
  var files = [];
  var directories = [];
  var xhr = new XMLHttpRequest({mozSystem:true});
  xhr.open("GET", path, true);
  xhr.onload = function() {
    var re = /<a href="([^"]+)/g, m;
    while ((m = re.exec(xhr.response))) {
      var file = m[1];
      if (file.endsWith("/")) {
        if (!(file === "." || file === "..")) {
          directories.push(file);
        }
      } else {
        files.push(path + file);
      }
    }

    function readNextDirectory(done) {
      if (!directories.length) {
        done();
        return;
      }
      readDirectoryListing(path + directories.pop(), function (x) {
        files.pushMany(x);
        readNextDirectory(done);
      });
    }
    readNextDirectory(function () {
      next(files);
    });
  };
  xhr.send();
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
});

document.getElementById("openFile").addEventListener("click", function () {
  document.getElementById("files").click();
});

Array.prototype.forEach.call(document.querySelectorAll(".closeButton"), function (element) {
  element.addEventListener("click", function (event) {
    event.target.parentElement.setAttribute('hidden', true);
  });
});

document.addEventListener("keydown", function (event) {
  if (event.keyCode == 119 && event.ctrlKey) { // Ctrl+F8
    pauseExecution = !pauseExecution;
  }
});

var terminal = new Terminal(document.getElementById("terminal")); terminal.refreshEvery(100);
function appendToTerminal(str, color) {
  var scroll = terminal.isScrolledToBottom();
  terminal.buffer.append(str, color);
  if (scroll) {
    terminal.gotoLine(terminal.buffer.length - 1);
    terminal.scrollIntoView();
  }
}

console.info = console.log = appendToTerminal;
console.warn = function (str) {
  appendToTerminal(str, "#FF6700");
};

var frameInfoTerminal = new Terminal(document.getElementById("frameInfoTerminal")); frameInfoTerminal.refreshEvery(100);

function appendToFrameTerminal(str, color) {
  var scroll = frameInfoTerminal.isScrolledToBottom();
  frameInfoTerminal.buffer.append(str, color);
  if (scroll) {
    frameInfoTerminal.gotoLine(frameInfoTerminal.buffer.length - 1);
    frameInfoTerminal.scrollIntoView();
  }
}

var frameWriter = new IndentingWriter(false, function (str){
  appendToFrameTerminal(str);
});