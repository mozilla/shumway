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

function loadState() {
  return localStorage["Inspector-Settings"] ? JSON.parse(localStorage["Inspector-Settings"]) : {
    appCompiler: true,
    sysCompiler: false,
    verifier: true,
    release: true,
    symbolsInfo: false
  };
}

function saveState(state) {
  localStorage["Inspector-Settings"] = JSON.stringify(state);
}

var state = loadState();

updateAVM2State();

function updateAVM2State() {
  enableC4.value = true;
  enableVerifier.value = state.verifier;
  traceExecution.value = state.trace ? 2 : 0;
  debuggerMode.value = true;
  release = state.release;
  TRACE_SYMBOLS_INFO = state.symbolsInfo;
  AVM1_TRACE_ENABLED = state.trace;
}

setTimeout(function displayInfo() {
  var output = "";
  var writer = new IndentingWriter(false, function (x) {
    x = x.replace(" ", "&nbsp;");
    output += x + "<br>";
  });

  Counter.traceSorted(writer);
  // Timer.trace(writer);

  document.getElementById("info").innerHTML = output;
  setTimeout(displayInfo, 1000);
}, 1000);

Array.prototype.forEach.call(document.querySelectorAll(".avm2Option"), function(element) {
  function setElementState(pressed) {
    if (pressed)
      element.classList.add("pressedState");
    else
      element.classList.remove("pressedState");
  }

  var id = element.getAttribute("id");
  element.addEventListener("click", function () {
    setElementState(state[id] = !state[id]);
    updateAVM2State();
    saveState(state);
  });
  setElementState(state[id]);
});


