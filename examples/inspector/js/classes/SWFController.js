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

var SWFController = (function() {

  var STATE_INIT = 0;
  var STATE_PAUSED = 1;
  var STATE_PLAYING = 2;

  var state = STATE_INIT;
  var stats = null;

  var pauseTrigger = false;
  var frames = 0;

  var onPauseCallback = null;
  var onPlayCallback = null;

  function stateChange(val) {
    if (state !== val) {
      if (typeof this.onStateChange === "function") {
        this.onStateChange(val, state);
      }
      state = val;
      switch (val) {
        case STATE_PAUSED:
          if (typeof onPauseCallback === "function") {
            onPauseCallback();
            onPauseCallback = null;
          }
          break;
        case STATE_PLAYING:
          if (typeof onPlayCallback === "function") {
            onPlayCallback();
            onPlayCallback = null;
          }
          break;
      }
    }
  }

  var SWFController = function(frameStats, pauseAfterFirstFrame) {
    stats = frameStats;
    pauseTrigger = !!pauseAfterFirstFrame;
    this.STATE_INIT = STATE_INIT;
    this.STATE_PAUSED = STATE_PAUSED;
    this.STATE_PLAYING = STATE_PLAYING;
    this.onStateChange = null;
    this.frameCount = 0;
    this.stage = null;
  }

  SWFController.prototype = {

    pause: function pause(callback) {
      if (!pauseTrigger) {
        frames = 0;
        onPauseCallback = callback;
        pauseTrigger = true;
      }
    },
    play: function play(numFrames, callback) {
      if (pauseTrigger) {
        frames = numFrames || 0;
        if (frames > 0) {
          onPauseCallback = callback;
        } else {
          onPlayCallback = callback;
        }
        pauseTrigger = false;
      }
    },

    togglePause: function togglePause() {
      pauseTrigger = !pauseTrigger;
    },

    isPaused: function isPaused() {
      return state === STATE_PAUSED;
    },
    isPlaying: function isPlaying() {
      return state === STATE_PLAYING;
    },
    isInitializing: function isInitializing() {
      return state === STATE_INIT;
    },

    stageInitializedCallback: function stageInitializedCallback(stage) {
      this.stage = stage;
      timeline.setFrameRate(stage._frameRate);
      timeline.refreshEvery(10);
    },
    completeCallback: function completeCallback() {
    },
    beforeFrameCallback: function beforeFrameCallback(options) {
      // make sure the first frame is always executed
      if (++this.frameCount > 1) {
        if (pauseTrigger) {
          // pause execution
          options.cancel = true;
          if (state !== STATE_PAUSED) {
            stateChange.call(this, STATE_PAUSED);
          }
        } else {
          if (state === STATE_PAUSED) {
            stateChange.call(this, STATE_PLAYING);
          }
        }
      }
      if (state === STATE_INIT) {
        stateChange.call(this, STATE_PLAYING);
      }
      if (state === STATE_PLAYING) {

      }
    },
    afterFrameCallback: function afterFrameCallback() {
      if (state === STATE_PLAYING) {
        // if play() is called with numFrames != 0
        if (frames > 0) {
          // count down number of executed frame since
          if (--frames === 0) {
            // pause execution
            pauseTrigger = true;
            stateChange.call(this, STATE_PAUSED);
          }
        }
      }
    }

  }

  return SWFController;

}());
