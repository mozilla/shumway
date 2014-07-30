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

var LC_KEY_INSPECTOR_SETTINGS = "Inspector Options";

var state = Shumway.Settings.load(LC_KEY_INSPECTOR_SETTINGS);

var stateDefaults = {
  folderOpen: true,
  debugPanelId: "settingsContainer",
  profileStartup: true,
  profileStartupDuration: 10000,
  logToConsole: false,
  logToDebugPanel: true,
  logAssets: false,
  mute: false,
  release: false
};

for (var option in stateDefaults) {
  if (typeof state[option] === "undefined") {
    state[option] = stateDefaults[option];
  }
}

function setRelease(release) {
  window.release = release;
  Shumway.GFX.Canvas2D.notifyReleaseChanged();
}

setRelease(state.release);

if (state.profileStartup && state.profileStartupDuration > 0) {
  profiler.start(state.profileStartupDuration);
}

function saveInspectorState() {
  Shumway.Settings.save(state, LC_KEY_INSPECTOR_SETTINGS);
}

var GUI = (function () {
  var Option = Shumway.Options.Option;
  var OptionSet = Shumway.Options.OptionSet;

  var gui = new dat.GUI({ autoPlace: false, width: 300 });
  gui.add({ "Reset Options": resetOptions }, "Reset Options");

  var inspectorOptions = gui.addFolder("Inspector Options");
  inspectorOptions.add(state, "release").onChange(saveInspectorOption);
  inspectorOptions.add(state, "logToConsole").onChange(saveInspectorOption);
  inspectorOptions.add(state, "logToDebugPanel").onChange(saveInspectorOption);
  inspectorOptions.add(state, "logAssets").onChange(saveInspectorOption);
  inspectorOptions.add(state, "profileStartup").onChange(saveInspectorOption);
  inspectorOptions.add(state, "profileStartupDuration").onChange(saveInspectorOption);
  //inspectorOptions.add(state, "mute").onChange(saveInspectorOption);
  if (state.folderOpen) {
    inspectorOptions.open();
  }

  gui.domElement.addEventListener("click", function(e) {
    if (e.target.nodeName.toLowerCase() == "li" && e.target.classList.contains("title")) {
      var isOpen = !e.target.parentElement.classList.contains("closed");
      var option = findOptionSetByName(e.target.textContent,
                                       Shumway.Settings.shumwayOptions);
      if (option) {
        option.open = isOpen;
        Shumway.Settings.save();
        notifyOptionsChanged();
      } else {
        if (e.target.textContent === "Inspector Options") {
          state.folderOpen = isOpen;
          saveInspectorState();
        }
      }
    }
  });

  function resetOptions() {
    delete window.localStorage[Shumway.Settings.ROOT];
    delete window.localStorage[LC_KEY_INSPECTOR_SETTINGS];
  }

  function notifyOptionsChanged() {
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent('shumwayOptionsChanged', false, false, null);
    document.dispatchEvent(event);
  }

  function saveInspectorOption(value) {
    if (this.property === "release") {
      setRelease(value);
    }
    state[this.property] = value;
    saveInspectorState();
  }

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

  function addTooltip(ctrl, text) {
    var el = ctrl.domElement;
    while ((el = el.parentElement)) {
      if (el.classList.contains("cr")) {
        el.setAttribute("title", text);
      }
    }
  }

  function addOptionSet(parent, optionSet) {
    var ctrl, folder;
    var isObject = Shumway.isObject;
    var isNullOrUndefined = Shumway.isNullOrUndefined;
    optionSet.options.forEach(function(option) {
      if (option instanceof OptionSet) {
        folder = parent.addFolder(option.name);
        if (option.open) { folder.open(); }
        addOptionSet(folder, option);
      } else {
        if (!isNullOrUndefined(option.config) && isObject(option.config)) {
          if (isObject(option.config.list)) {
            ctrl = parent.add(option, "value", option.config.list);
          } else if (isObject(option.config.choices)) {
            ctrl = parent.add(option, "value", option.config.choices);
          } else if (isObject(option.config.range)) {
            var range = option.config.range;
            ctrl = parent.add(option, "value").min(range.min).max(range.max).step(range.step);
          } else {
            ctrl = parent.add(option, "value");
          }
        } else {
          ctrl = parent.add(option, "value");
        }
        ctrl.name(option.longName);
        ctrl.onChange(function() {
          Shumway.Settings.save();
          notifyOptionsChanged();
        });
        addTooltip(ctrl, option.description);
        option.ctrl = ctrl;
      }
    });
  }

  // shumwayOptions.register(webGLOptions);
  addOptionSet(gui, Shumway.Settings.shumwayOptions);

  document.getElementById("settingsContainer").appendChild(gui.domElement);

  return gui;

})();

function syncGFXOptions(options) {
  var GFX = Shumway.GFX;
  options.perspectiveCamera = GFX.perspectiveCamera.value;
  options.perspectiveCameraFOV = GFX.perspectiveCameraFOV.value;
  options.perspectiveCameraAngle = GFX.perspectiveCameraAngle.value;
  options.perspectiveCameraDistance = GFX.perspectiveCameraDistance.value;

  options.drawTiles = GFX.drawTiles.value;
  options.drawSurfaces = GFX.drawSurfaces.value;
  options.drawSurface = GFX.drawSurface.value;
  options.drawElements = GFX.drawElements.value;
  options.clipDirtyRegions = GFX.clipDirtyRegions.value;
  options.clipCanvas = GFX.clipCanvas.value;

  options.premultipliedAlpha = GFX.premultipliedAlpha.value;
  options.unpackPremultiplyAlpha = GFX.unpackPremultiplyAlpha.value;

  options.sourceBlendFactor = GFX.sourceBlendFactor.value;
  options.destinationBlendFactor = GFX.destinationBlendFactor.value;

  options.cull = GFX.cull.value;
  options.compositeMask = GFX.compositeMask.value;
  options.disableSurfaceUploads = GFX.disableSurfaceUploads.value;

  options.snapToDevicePixels = GFX.snapToDevicePixels.value;
  options.imageSmoothing = GFX.imageSmoothing.value;
  options.blending = GFX.blending.value;
  options.cacheShapes = GFX.cacheShapes.value;
  options.cacheShapesMaxSize = GFX.cacheShapesMaxSize.value;
  options.cacheShapesThreshold = GFX.cacheShapesThreshold.value;
}
