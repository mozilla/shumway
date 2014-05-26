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
    private _chartHeader: FlameChartHeader;
    //private _charts: FlameChart [];

    constructor(profile:Profile, container:HTMLElement) {
      this._profile = profile;
      this._container = container;
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

    private _createViews() {
      this._overviewHeader = new Profiler.FlameChartHeader(this, FlameChartHeaderType.OVERVIEW);
      this._overview = new Profiler.FlameChartOverview(this);
      this._chartHeader = new Profiler.FlameChartHeader(this, FlameChartHeaderType.CHART);
      window.addEventListener("resize", this._onResize.bind(this));
    }

    private _initializeViews() {
      var startTime = this._profile.startTime;
      var endTime = this._profile.endTime;
      this._overviewHeader.initialize(startTime, endTime);
      this._overview.initialize(startTime, endTime);
      this._chartHeader.initialize(startTime, endTime);
    }

    private _onResize() {
      var width = this._container.offsetWidth;
      this._overviewHeader.setSize(width);
      this._overview.setSize(width);
      this._chartHeader.setSize(width);
    }

    public onWindowChange(startTime: number, endTime: number) {
      startTime = this._relToAbsTime(startTime);
      endTime = this._relToAbsTime(endTime);
      if (startTime > endTime) {
        var tmp = startTime;
        startTime = endTime;
        endTime = tmp;
      }
      this._overviewHeader.setWindow(startTime, endTime);
      this._overview.setWindow(startTime, endTime);
      this._chartHeader.setWindow(startTime, endTime);
    }

    private _relToAbsTime(relTime: number): number {
      return relTime * this._profile.totalTime;
    }

  }

}

