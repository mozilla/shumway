var FrameScheduler = (function () {
  var STATS_TO_REMEMBER = 50;
  var MAX_DRAWS_TO_SKIP = 2;
  var INTERVAL_PADDING_MS = 4;
  var SPEED_ADJUST_RATE = 0.9;
  function FrameScheduler() {
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
  FrameScheduler.prototype = {
    get shallSkipDraw() {
      if (this._drawsSkipped >= MAX_DRAWS_TO_SKIP) {
        return false;
      }
      var averageDraw = this._drawStats.length < STATS_TO_REMEMBER ? 0 :
        this._drawStatsSum / this._drawStats.length;
      var estimatedDrawEnd = performance.now() + averageDraw;
      return estimatedDrawEnd + INTERVAL_PADDING_MS > this._expectedNextFrameAt;
    },
    get nextFrameIn() {
      return Math.max(0, this._expectedNextFrameAt - performance.now());
    },
    get isOnTime() {
      return this._onTime;
    },
    startFrame: function (frameRate) {
      var interval = 1000 / frameRate;

      var adjustedInterval = interval;
      var delta = this._onTimeDelta + this._delta;
      if (delta !== 0) {
        if (delta < 0) {
          adjustedInterval *= SPEED_ADJUST_RATE;
        } else if (delta > 0) {
          adjustedInterval /= SPEED_ADJUST_RATE;
        }
        this._onTimeDelta += (interval - adjustedInterval);
      }

      this._expectedNextFrameAt += adjustedInterval;
      this._onTime = true;
    },
    endFrame: function () {
      var estimatedNextFrameStart = performance.now() + INTERVAL_PADDING_MS;
      if (estimatedNextFrameStart > this._expectedNextFrameAt) {
        if (this._trackDelta) {
          this._onTimeDelta += (this._expectedNextFrameAt - estimatedNextFrameStart);
          console.log(this._onTimeDelta);
        }
        this._expectedNextFrameAt = estimatedNextFrameStart;
        this._onTime = false;
      }
    },
    startDraw: function () {
      this._drawsSkipped = 0;
      this._drawStarted = performance.now();
    },
    endDraw: function () {
      var drawTime = performance.now() - this._drawStarted;
      this._drawStats.push(drawTime);
      this._drawStatsSum += drawTime;
      while (this._drawStats.length > STATS_TO_REMEMBER) {
        this._drawStatsSum -= this._drawStats.shift();
      }
    },
    skipDraw: function () {
      this._drawsSkipped++;
    },
    setDelta: function (value) {
      if (!this._trackDelta) {
        return;
      }
      this._delta = value;
    },
    startTrackDelta: function () {
      this._trackDelta = true;
    },
    endTrackDelta: function () {
      if (!this._trackDelta) {
        return;
      }
      this._trackDelta = false;
      this._delta = 0;
      this._onTimeDelta = 0;
    }
  };
  return FrameScheduler;
})();
