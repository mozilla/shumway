/*
 * Copyright 2014 Mozilla Foundation
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

var profiler = (function() {

  var elProfilerContainer = document.getElementById("profilerContainer");
  var elProfilerToolbar = document.getElementById("profilerToolbar");
  var elProfilerMessage = document.getElementById("profilerMessage");
  var elProfilerPanel = document.getElementById("profilePanel");
  var elBtnMinimize = document.getElementById("profilerMinimizeButton");
  var elBtnStartStop = document.getElementById("profilerStartStop");

  var controller;
  var startTime;
  var timerHandle;
  var timeoutHandle;

  var Profiler = function() {
    controller = new Shumway.Tools.Profiler.Controller(elProfilerPanel);
    elBtnMinimize.addEventListener("click", this._onMinimizeClick.bind(this));
    elBtnStartStop.addEventListener("click", this._onStartStopClick.bind(this));

    var self = this;
    window.addEventListener("keypress", function (event) {
      if (event.altKey && event.keyCode === 114) { // Alt + R
        self._onStartStopClick();
      }
    }, false);
  };

  Profiler.prototype.start = function(startTime_, maxTime, resetTimeline) {
    setProfile(true);
    if (resetTimeline) {
      resetTimelineBuffers();
    } else {
      getTimelineBuffers();
    }
    controller.deactivateProfile();
    elProfilerToolbar.classList.add("withEmphasis");
    elBtnStartStop.textContent = "Stop";
    startTime = startTime_;
    timerHandle = setInterval(showTimeMessage, 1000);
    if (maxTime) {
      timeoutHandle = setTimeout(this.createProfile.bind(this), maxTime);
    }
    showTimeMessage();
  };

  Profiler.prototype.createProfile = function() {
    var buffers = getTimelineBuffers();
    controller.createProfile(buffers, startTime);
    elProfilerToolbar.classList.remove("withEmphasis");
    elBtnStartStop.textContent = "Start";
    clearInterval(timerHandle);
    clearTimeout(timeoutHandle);
    timerHandle = 0;
    timeoutHandle = 0;
    setProfile(true);
    showTimeMessage(false);
  };

  Profiler.prototype.openPanel = function() {
    elProfilerContainer.classList.remove("collapsed");
  };

  Profiler.prototype.closePanel = function() {
    elProfilerContainer.classList.add("collapsed");
  };

  Profiler.prototype.resize = function() {
    controller.resize();
  };

  Profiler.prototype._onMinimizeClick = function(e) {
    if (elProfilerContainer.classList.contains("collapsed")) {
      this.openPanel();
    } else {
      this.closePanel();
    }
  };

  Profiler.prototype._onStartStopClick = function(e) {
    if (timerHandle) {
      this.createProfile();
      this.openPanel();
    } else {
      this.start(0, 0, true);
    }
  };

  function showTimeMessage(show) {
    show = typeof show === "undefined" ? true : show;
    var time = Math.round((performance.now() - startTime) / 1000);
    elProfilerMessage.textContent = show ? "Running: " + time + " Seconds" : "";
  }

  return new Profiler();

})();

function resetTimelineBuffers() {
  if (typeof gfxWindow !== 'undefined') {
    gfxWindow.Shumway.GFX.timelineBuffer.reset();
  }
  if (typeof playerWindow !== 'undefined') {
    playerWindow.Shumway.AVM2.timelineBuffer.reset();
    playerWindow.Shumway.Player.timelineBuffer.reset();
    playerWindow.Shumway.SWF.timelineBuffer.reset();
  }
}

function getTimelineBuffers() {
  var buffers = [];

  if (typeof gfxWindow !== 'undefined') {
    buffers.push(gfxWindow.Shumway.GFX.timelineBuffer);
  }
  if (typeof playerWindow !== 'undefined') {
    buffers.push(playerWindow.Shumway.AVM2.timelineBuffer);
    buffers.push(playerWindow.Shumway.Player.timelineBuffer);
    buffers.push(playerWindow.Shumway.SWF.timelineBuffer);
  }
  return buffers;
}

function setProfile(enabled) {
  if (typeof gfxWindow !== 'undefined') {
    gfxWindow.setProfile(enabled);
  }
  if (typeof playerWindow !== 'undefined') {
    playerWindow.setProfile(enabled);
  }
}

