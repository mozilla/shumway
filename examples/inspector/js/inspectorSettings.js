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

var DEFAULT_SETTINGS = {
  sysCompiler: true,
  appCompiler: true,
  verifier: true,
  trace: false,
  traceCalls: false,
  traceRuntime: false,
  allocator: false,
  render: true,
  mouse: true,
  qtree: false,
  redraw: false,
  wireframe: false,
  release: true,
  logToConsole: false,
  mute: false,
  turbo: true,
  caching: true
};

function loadState() {
  var settings = {};
  if (localStorage["Inspector-Settings"]) {
    settings = JSON.parse(localStorage["Inspector-Settings"]);
  }
  for (var key in DEFAULT_SETTINGS) {
    if (settings[key] === undefined) {
      settings[key] = DEFAULT_SETTINGS[key];
    }
  }
  return settings;
}

function saveState(state) {
  localStorage["Inspector-Settings"] = JSON.stringify(state);
}

var state = loadState();

//updateAVM2State();

function updateAVM2State() {
  enableC4.value = true;
  Shumway.AVM2.Runtime.enableVerifier.value = state.verifier;
  enableRegisterAllocator.value = state.allocator;
  Shumway.AVM2.Runtime.traceExecution.value = state.trace ? 2 : 0;
  traceRenderer.value = state.trace ? 2 : 0;
  disableRenderVisitor.value = state.render ? false : true;
  disableMouseVisitor.value = state.mouse ? false : true;
  showQuadTree.value = state.qtree ? true : false;
  turboMode.value = state.turbo ? true : false;
  Shumway.AVM2.Runtime.codeCaching.value = state.caching ? true : false;
  showRedrawRegions.value = state.redraw ? true : false;
  renderAsWireframe.value = state.wireframe ? true : false;
  Shumway.AVM2.Runtime.traceCallExecution.value = state.traceCalls ? 1 : 0;
  Shumway.AVM2.Runtime.traceCallExecution.value = state.traceRuntime ? 2 : Shumway.AVM2.Runtime.traceCallExecution.value;
  Shumway.AVM2.Runtime.debuggerMode.value = true;
  release = state.release;
}

var lastCounts = {};

setTimeout(function displayInfo() {
  var output = "";
  var pairs = [];

  for (var name in Counter.counts) {
    pairs.push([name, Counter.counts[name]]);
  }

  pairs.sort(function (a, b) {
    return b[1] - a[1];
  });

  var totalCount = 0;
  pairs.forEach(function (pair) {
    var color;
    if (pair[1] > 100000) {
      color = "magenta";
    } else if (pair[1] > 10000) {
      color = "purple";
    } else if (pair[1] > 1000) {
      color = "red";
    } else if (pair[1] > 100) {
      color = "orange";
    } else {
      color = "green";
    }
    output += "<div style='padding: 2px; background-color: " + color + "'>" + pair[0] + ": " + pair[1] + " " + (pair[1] - lastCounts[pair[0]]) + "</div>";
    totalCount += pair[1];
  });
  if (totalCount > 30000000) {
    // Don't delete me, this is meant to be annoying.
    throw "The Counters Are Too Damn High (> 30,000,000).";
  }

  document.getElementById("info").innerHTML = output;

  copyProperties(lastCounts, Counter.counts);

  output = "";
  for (var name in Timer._flat._timers) {
    var timer = Timer._flat._timers[name];
    var str = timer._name + ": " + timer._total.toFixed(2) + " ms" +
      ", count: " + timer._count +
      ", avg: " + (timer._total / timer._count).toFixed(2) + " ms" +
      ", last: " + timer._last.toFixed(2) + " ms";
    output += str + "<br>";
  }
  document.getElementById("timerInfo").innerHTML = output;

  setTimeout(displayInfo, 500);
}, 500);

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
    if (id === "wireframe" && swfController.stage) {
      swfController.stage._invalid = true;
    }
  });
  setElementState(state[id]);
});

document.getElementById("sample").addEventListener("click", function () {
  triggerSampling(5);
});

(function() {
  var chkLogToConsole = document.getElementById("chkLogToConsole")
  chkLogToConsole.checked = state.logToConsole;
  chkLogToConsole.addEventListener("click", function (event) {
    state.logToConsole = event.target.checked;
    saveState(state);
  });
})();

(function() {
  var muteButton = document.getElementById("muteButton");
  function setElementState() {
    if (state.mute) {
      muteButton.classList.remove("icon-volume-up");
      muteButton.classList.add("icon-volume-off");
    } else {
      muteButton.classList.add("icon-volume-up");
      muteButton.classList.remove("icon-volume-off");
    }
  }
  muteButton.addEventListener("click", function (event) {
    state.mute = !state.mute;
    avm2.systemDomain.getClass("flash.media.SoundMixer").native.static._setMasterVolume(state.mute ? 0 : 1);
    setElementState();
    saveState(state);
  });
  setElementState();
})();

(function () {

  var gui = new dat.GUI({ autoPlace: false, width: 499 });

  gui.domElement.addEventListener("click", function(e) {
    if (e.target.nodeName.toLowerCase() == "li" && e.target.classList.contains("title")) {
      var option = findOptionSetByName(e.target.textContent, shumwayOptions);
      if (option) {
        option.open = !e.target.parentElement.classList.contains("closed");
        saveShumwaySettings(shumwayOptions.getSettings());
      }
    }
  });

  function findOptionSetByName(name, optionSet) {
    for (var i = 0, n = optionSet.options.length; i < n; i++) {
      var option = optionSet.options[i];
      if (option instanceof OptionSet) {
        if (option.name === name) {
          return option;
        } else {
          var child = findOptionSetByName(name, option);
          if (child) {
            return child;
          }
        }
      }
    }
    return null;
  }

  function addOptionSet(parent, optionSet) {
    optionSet.options.forEach(function(option) {
      if (option instanceof OptionSet) {
        var folder = parent.addFolder(option.name);
        if (option.open) { folder.open(); }
        addOptionSet(folder, option);
      } else {
        var ctrl;
        if (option.config) {
          if (option.config.list) {
            ctrl = parent.add(option, "value", option.config.list);
          } else if (option.config.choices) {
            ctrl = parent.add(option, "value", option.config.choices);
          } else {
            ctrl = parent.add(option, "value");
          }
          if (option.config.range) {
            var range = option.config.range;
            ctrl.min(range.min).max(range.max).step(range.step);
          }
        } else {
          ctrl = parent.add(option, "value");
        }
        ctrl.name(option.longName);
        ctrl.onChange(function() {
          saveShumwaySettings(shumwayOptions.getSettings());
        });
      }
    });
  }

  // shumwayOptions.register(webGLOptions);
  addOptionSet(gui, shumwayOptions);

  document.getElementById("settingsContainer").appendChild(gui.domElement);

})();
