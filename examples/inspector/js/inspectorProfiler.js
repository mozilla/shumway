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

function viewProfile() {
  requestTimelineBuffers().then(function (buffers) {
    profiler.createProfile(buffers);
  });
}

function toggleProfile() {
  alert("Not Implemented");
}
