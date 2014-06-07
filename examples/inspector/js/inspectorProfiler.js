/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
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
  }

  Profiler.prototype.start = function(maxTime) {
    try {
      requestTimelineBuffers().then(function (buffers) {
        for (var i = 0; i < buffers.length; i++) {
          buffers[i].reset();
        }
      });
    }
    catch (e) {}
    controller.deactivateProfile();
    maxTime = maxTime || 0;
    elProfilerToolbar.classList.add("withEmphasis");
    elBtnStartStop.textContent = "Stop";
    startTime = Date.now();
    timerHandle = setInterval(showTimeMessage, 1000);
    if (maxTime) {
      timeoutHandle = setTimeout(this.createProfile.bind(this), state.profileStartupDuration);
    }
    showTimeMessage();
  }

  Profiler.prototype.createProfile = function() {
    requestTimelineBuffers().then(function (buffers) {
      controller.createProfile(buffers);
      elProfilerToolbar.classList.remove("withEmphasis");
      elBtnStartStop.textContent = "Start";
      clearInterval(timerHandle);
      clearTimeout(timeoutHandle);
      timerHandle = 0;
      timeoutHandle = 0;
      showTimeMessage(false);
    });
  }

  Profiler.prototype.openPanel = function() {
    elProfilerContainer.classList.remove("collapsed");
  }

  Profiler.prototype.closePanel = function() {
    elProfilerContainer.classList.add("collapsed");
  }

  Profiler.prototype.resize = function() {
    controller.resize();
  }

  Profiler.prototype._onMinimizeClick = function(e) {
    if (elProfilerContainer.classList.contains("collapsed")) {
      this.openPanel();
    } else {
      this.closePanel();
    }
  }

  Profiler.prototype._onStartStopClick = function(e) {
    if (timerHandle) {
      this.createProfile();
      this.openPanel();
    } else {
      this.start();
    }
  }

  function showTimeMessage(show) {
    show = typeof show === "undefined" ? true : show;
    var time = Math.round((Date.now() - startTime) / 1000);
    elProfilerMessage.textContent = show ? "Running: " + time + " Seconds" : "";
  }

  return new Profiler();

})();

function requestTimelineBuffers() {
  var buffersPromises = [];
  // TODO request timelineBuffers using postMessage (instead of IFramePlayer.Shumway)

  if (IFramePlayer.Shumway) {
    if (IFramePlayer.Shumway.AVM2.timelineBuffer) {
      buffersPromises.push(IFramePlayer.instance.requestTimeline('AVM2'));
    }
    if (IFramePlayer.Shumway.Player.timelineBuffer) {
      buffersPromises.push(IFramePlayer.instance.requestTimeline('Player'));
    }
    if (IFramePlayer.Shumway.SWF.timelineBuffer) {
      buffersPromises.push(IFramePlayer.instance.requestTimeline('SWF'));
    }
  } else {
    if (Shumway.AVM2.timelineBuffer) {
      buffersPromises.push(Promise.resolve(Shumway.AVM2.timelineBuffer));
    }
    if (Shumway.Player.timelineBuffer) {
      buffersPromises.push(Promise.resolve(Shumway.Player.timelineBuffer));
    }
    if (Shumway.SWF.timelineBuffer) {
      buffersPromises.push(Promise.resolve(Shumway.SWF.timelineBuffer));
    }
  }
  if (Shumway.GFX.timelineBuffer) {
    buffersPromises.push(Promise.resolve(Shumway.GFX.timelineBuffer));
  }
  return Promise.all(buffersPromises);
}
