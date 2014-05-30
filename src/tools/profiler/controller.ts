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
module Shumway.Tools.Profiler {

  export class Controller {

    private _container: HTMLElement;
    private _profile: Profile;

    private _overviewHeader: FlameChartHeader;
    private _overview: FlameChartOverview;
    private _headers: FlameChartHeader [];
    private _charts: FlameChart [];

    constructor(profile:Profile, container:HTMLElement) {
      this._profile = profile;
      this._container = container;
      this._headers = [];
      this._charts = [];
      this._createViews();
    }

    get container(): HTMLElement {
      return this._container;
    }

    get profile(): Profile {
      return this._profile;
    }

    createSnapshot() {
      this._profile.createSnapshots();
      this._initializeViews();
    }

    reset() {
      this._destroyViews();
      this._profile.reset();
    }

    getBufferAt(index: number): TimelineBuffer {
      return this._profile.getBufferAt(index);
    }

    private _createViews() {
      var self = this;
      this._overviewHeader = new Profiler.FlameChartHeader(this, FlameChartHeaderType.OVERVIEW);
      this._overview = new Profiler.FlameChartOverview(this, FlameChartOverviewMode.OVERLAY);
      this._profile.forEachBuffer(function(buffer: TimelineBuffer, index: number) {
        self._headers.push(new Profiler.FlameChartHeader(self, FlameChartHeaderType.CHART));
        self._charts.push(new Profiler.FlameChart(self, index));
      });
      window.addEventListener("resize", this._onResize.bind(this));
    }

    private _destroyViews() {
      if (this._overviewHeader) {
        this._overviewHeader.destroy();
      }
      if (this._overview) {
        this._overview.destroy();
      }
      while (this._headers.length) {
        this._headers.pop().destroy();
      }
      while (this._charts.length) {
        this._charts.pop().destroy();
      }
      window.removeEventListener("resize", this._onResize.bind(this));
    }

    private _initializeViews() {
      var self = this;
      var startTime = this._profile.startTime;
      var endTime = this._profile.endTime;
      this._overviewHeader.initialize(startTime, endTime);
      this._overview.initialize(startTime, endTime);
      this._profile.forEachBuffer(function(buffer: TimelineBuffer, index: number) {
        self._headers[index].initialize(startTime, endTime);
        self._charts[index].initialize(startTime, endTime);
      });
    }

    private _onResize() {
      var self = this;
      var width = this._container.offsetWidth;
      this._overviewHeader.setSize(width);
      this._overview.setSize(width);
      this._profile.forEachBuffer(function(buffer: TimelineBuffer, index: number) {
        self._headers[index].setSize(width);
        self._charts[index].setSize(width);
      });
    }

    private _updateViews() {
      var self = this;
      var start = this._profile.windowStart;
      var end = this._profile.windowEnd;
      this._overviewHeader.setWindow(start, end);
      this._overview.setWindow(start, end);
      this._profile.forEachBuffer(function(buffer: TimelineBuffer, index: number) {
        self._headers[index].setWindow(start, end);
        self._charts[index].setWindow(start, end);
      });
    }

    /**
     * View callbacks
     */

    setWindow(start: number, end: number) {
      this._profile.setWindow(start, end);
      this._updateViews();
    }

    moveWindowTo(time: number) {
      this._profile.moveWindowTo(time);
      this._updateViews();
    }

    showTooltip(bufferIndex: number, frame: TimelineFrame) {
      //console.log("show tooltip", frame);
    }

    hideTooltip() {
      //console.log("hide tooltip");
    }

  }

}

