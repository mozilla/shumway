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
      this._profile.createSnapshot();
      this._initializeViews();
    }

    reset() {
      this._profile.reset();
    }

    private _createViews() {
      this._overviewHeader = new Profiler.FlameChartHeader(this, FlameChartHeaderType.OVERVIEW);
      this._overview = new Profiler.FlameChartOverview(this);
      for (var i = 0, n = this._profile.bufferCount; i < n; i++) {
        this._headers.push(new Profiler.FlameChartHeader(this, FlameChartHeaderType.CHART));
        this._charts.push(new Profiler.FlameChart(this, this._profile.getBufferAt(i)));
      }
      window.addEventListener("resize", this._onResize.bind(this));
    }

    private _initializeViews() {
      var startTime = this._profile.startTime;
      var endTime = this._profile.endTime;
      this._overviewHeader.initialize(startTime, endTime);
      this._overview.initialize(startTime, endTime);
      for (var i = 0, n = this._profile.bufferCount; i < n; i++) {
        this._headers[i].initialize(startTime, endTime);
        this._charts[i].initialize(startTime, endTime);
      }
    }

    private _onResize() {
      var width = this._container.offsetWidth;
      this._overviewHeader.setSize(width);
      this._overview.setSize(width);
      for (var i = 0, n = this._profile.bufferCount; i < n; i++) {
        this._headers[i].setSize(width);
        this._charts[i].setSize(width);
      }
    }

    private _updateViews() {
      var start = this._profile.windowStart;
      var end = this._profile.windowEnd;
      this._overviewHeader.setWindow(start, end);
      this._overview.setWindow(start, end);
      for (var i = 0, n = this._profile.bufferCount; i < n; i++) {
        this._headers[i].setWindow(start, end);
        this._charts[i].setWindow(start, end);
      }
    }

    public setWindow(start: number, end: number) {
      this._profile.setWindow(start, end);
      this._updateViews();
    }

    public moveWindowTo(time: number) {
      this._profile.moveWindowTo(time);
      this._updateViews();
    }

  }

}

