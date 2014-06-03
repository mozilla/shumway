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

if (Object.keys(state).length === 0) {
  state = {
    folderOpen: true,
    debugPanelId: "settingsContainer",
    logToConsole: false,
    mute: false
  }
}

function saveInspectorState() {
  Shumway.Settings.save(state, LC_KEY_INSPECTOR_SETTINGS);
}

var GUI = (function () {

  var gui = new dat.GUI({ autoPlace: false, width: 300 });

  gui.add({ "Reset Options": resetOptions }, "Reset Options");
  //gui.add({ "View Profile": viewProfile }, "View Profile");
  //gui.add({ "Start/Stop Profiling": toggleProfile }, "Start/Stop Profiling");

  var inspectorOptions = gui.addFolder("Inspector Options");
  inspectorOptions.add(state, "logToConsole").onChange(setLogToConsole);
  //inspectorOptions.add(state, "mute").onChange(setMute);
  if (state.folderOpen) {
    inspectorOptions.open();
  }

  gui.domElement.addEventListener("click", function(e) {
    if (e.target.nodeName.toLowerCase() == "li" && e.target.classList.contains("title")) {
      var isOpen = !e.target.parentElement.classList.contains("closed");
      var option = findOptionSetByName(e.target.textContent, shumwayOptions);
      if (option) {
        option.open = isOpen;
        Shumway.Settings.save();
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

  function setMute(value) {
    state.mute = value;
    saveInspectorState();
  }

  function setLogToConsole(value) {
    state.logToConsole = value;
    saveInspectorState();
  }

  function viewProfile() {
    alert("Not Implemented");
    /*
    var Profiler = Shumway.Tools.Profiler;
    var profile = new Profiler.Profile();
    if (Shumway.playerTimelineBuffer) {
      profile.addBuffer(Shumway.playerTimelineBuffer, "Player");
    }
    if (Shumway.GFX.timelineBuffer) {
      profile.addBuffer(Shumway.GFX.timelineBuffer, "GFX");
    }
    var profileController = new Profiler.Controller(profile, document.getElementById("profilePanelContainer"));
    profileController.createSnapshot();
    */
  }

  function toggleProfile() {
    alert("Not Implemented");
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
        });
        addTooltip(ctrl, option.description);
      }
    });
  }

  // shumwayOptions.register(webGLOptions);
  addOptionSet(gui, shumwayOptions);

  document.getElementById("settingsContainer").appendChild(gui.domElement);

  return gui;

})();

function syncGFXOptions(options) {
  options.perspectiveCamera = perspectiveCamera.value;
  options.perspectiveCameraFOV = perspectiveCameraFOV.value;
  options.perspectiveCameraAngle = perspectiveCameraAngle.value;
  options.perspectiveCameraDistance = perspectiveCameraDistance.value;

  options.drawTiles = drawTiles.value;
  options.drawTextures = drawTextures.value;
  options.drawTexture = drawTexture.value;
  options.drawElements = drawElements.value;
  options.ignoreViewport = ignoreViewport.value;
  options.ignoreColorTransform = ignoreColorTransform.value;
  options.clipDirtyRegions = clipDirtyRegions.value;
  options.clipCanvas = clipCanvas.value;

  options.premultipliedAlpha = premultipliedAlpha.value;
  options.unpackPremultiplyAlpha = unpackPremultiplyAlpha.value;

  options.sourceBlendFactor = sourceBlendFactor.value;
  options.destinationBlendFactor = destinationBlendFactor.value;

  // These are set by holding down F and B in the easel, we don't want to
  // override them here.
  // options.paintFlashing = paintFlashing.value;
  // options.paintBounds = paintBounds.value;

  options.cull = cull.value;
  options.disableMasking = disableMasking.value;
  options.debug = debugStage.value;
  options.forcePaint = forcePaint.value;
  // options.disable = disableStage.value;
  options.compositeMask = compositeMask.value;
  options.disableTextureUploads = disableTextureUploads.value;
}
