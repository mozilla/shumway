/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module Shumway {
  export class FrameScheduler {
    private static STATS_TO_REMEMBER = 50;
    private static MAX_DRAWS_TO_SKIP = 2;
    private static INTERVAL_PADDING_MS = 4;
    private static SPEED_ADJUST_RATE = 0.9;

    private _drawStats: any [];
    private _drawStatsSum: number;
    private _drawStarted: number;
    private _drawsSkipped: number;
    private _expectedNextFrameAt = performance.now();
    private _onTime: boolean;
    private _trackDelta: boolean;
    private _delta: number;
    private _onTimeDelta: number;

    constructor() {
      this._drawStats = [];
      this._drawStatsSum = 0;
      this._drawStarted = 0;
      this._drawsSkipped = 0;
      this._expectedNextFrameAt = performance.now();
      this._onTime = true;
      this._trackDelta = false;
      this._delta = 0;
      this._onTimeDelta = 0;
    }

    get shallSkipDraw(): boolean {
      if (this._drawsSkipped >= FrameScheduler.MAX_DRAWS_TO_SKIP) {
        return false;
      }
      var averageDraw = this._drawStats.length < FrameScheduler.STATS_TO_REMEMBER ? 0 :
        this._drawStatsSum / this._drawStats.length;
      var estimatedDrawEnd = performance.now() + averageDraw;
      return estimatedDrawEnd + FrameScheduler.INTERVAL_PADDING_MS > this._expectedNextFrameAt;
    }

    get nextFrameIn(): number {
      return Math.max(0, this._expectedNextFrameAt - performance.now());
    }

    get isOnTime(): boolean {
      return this._onTime;
    }

    startFrame(frameRate) {
      var interval = 1000 / frameRate;

      var adjustedInterval = interval;
      var delta = this._onTimeDelta + this._delta;
      if (delta !== 0) {
        if (delta < 0) {
          adjustedInterval *= FrameScheduler.SPEED_ADJUST_RATE;
        } else if (delta > 0) {
          adjustedInterval /= FrameScheduler.SPEED_ADJUST_RATE;
        }
        this._onTimeDelta += (interval - adjustedInterval);
      }

      this._expectedNextFrameAt += adjustedInterval;
      this._onTime = true;
    }

    endFrame() {
      var estimatedNextFrameStart = performance.now() + FrameScheduler.INTERVAL_PADDING_MS;
      if (estimatedNextFrameStart > this._expectedNextFrameAt) {
        if (this._trackDelta) {
          this._onTimeDelta += (this._expectedNextFrameAt - estimatedNextFrameStart);
          console.log(this._onTimeDelta);
        }
        this._expectedNextFrameAt = estimatedNextFrameStart;
        this._onTime = false;
      }
    }

    startDraw() {
      this._drawsSkipped = 0;
      this._drawStarted = performance.now();
    }

    endDraw() {
      var drawTime = performance.now() - this._drawStarted;
      this._drawStats.push(drawTime);
      this._drawStatsSum += drawTime;
      while (this._drawStats.length > FrameScheduler.STATS_TO_REMEMBER) {
        this._drawStatsSum -= this._drawStats.shift();
      }
    }

    skipDraw() {
      this._drawsSkipped++;
    }

    setDelta(value) {
      if (!this._trackDelta) {
        return;
      }
      this._delta = value;
    }

    startTrackDelta() {
      this._trackDelta = true;
    }

    endTrackDelta() {
      if (!this._trackDelta) {
        return;
      }
      this._trackDelta = false;
      this._delta = 0;
      this._onTimeDelta = 0;
    }
  }
}