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

  export enum UIThemeType {
    DARK,
    LIGHT
  }

  export class Controller {

    private _container: HTMLElement;
    private _profiles: Profile [];
    private _activeProfile: Profile;

    private _overviewHeader: FlameChartHeader;
    private _overview: FlameChartOverview;
    private _headers: FlameChartHeader [];
    private _charts: FlameChart [];

    private _themeType: UIThemeType;
    private _theme: Theme.UITheme;

    private _tooltip: HTMLElement;

    constructor(container: HTMLElement, themeType: UIThemeType = UIThemeType.DARK) {
      this._container = container;
      this._headers = [];
      this._charts = [];
      this._profiles = [];
      this._activeProfile = null;
      this.themeType = themeType;
      this._tooltip = this._createTooltip();
    }

    createProfile(buffers: TimelineBuffer [], activate: boolean = true): Profile {
      var profile = new Profile(buffers);
      profile.createSnapshots();
      this._profiles.push(profile);
      if (activate) {
        this.activateProfile(profile);
      }
      return profile;
    }

    activateProfile(profile: Profile) {
      this.deactivateProfile();
      this._activeProfile = profile;
      this._createViews();
      this._initializeViews();
    }

    activateProfileAt(index: number) {
      this.activateProfile(this.getProfileAt(index));
    }

    deactivateProfile() {
      if (this._activeProfile) {
        this._destroyViews();
        this._activeProfile = null;
      }
    }

    resize() {
      this._onResize();
    }

    getProfileAt(index: number): Profile {
      return this._profiles[index];
    }

    get activeProfile(): Profile {
      return this._activeProfile;
    }

    get profileCount(): number {
      return this._profiles.length;
    }


    get container(): HTMLElement {
      return this._container;
    }

    set themeType(value: UIThemeType) {
      switch (value) {
        case UIThemeType.DARK:
          this._theme = new Theme.UIThemeDark();
          break;
        case UIThemeType.LIGHT:
          this._theme = new Theme.UIThemeLight();
          break;
      }
    }
    get themeType(): UIThemeType {
      return this._themeType;
    }

    get theme(): Theme.UITheme {
      return this._theme;
    }

    getSnapshotAt(index: number): TimelineBufferSnapshot {
      return this._activeProfile.getSnapshotAt(index);
    }

    private _createViews() {
      var self = this;
      this._overviewHeader = new Profiler.FlameChartHeader(this, FlameChartHeaderType.OVERVIEW);
      this._overview = new Profiler.FlameChartOverview(this, FlameChartOverviewMode.OVERLAY);
      this._activeProfile.forEachSnapshot(function(snapshot: TimelineBufferSnapshot, index: number) {
        self._headers.push(new Profiler.FlameChartHeader(self, FlameChartHeaderType.CHART));
        self._charts.push(new Profiler.FlameChart(self, snapshot));
      });
      window.addEventListener("resize", this._onResize.bind(this));
    }

    private _destroyViews() {
      if (this._overviewHeader) { this._overviewHeader.destroy(); }
      if (this._overview) { this._overview.destroy(); }
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
      var startTime = this._activeProfile.startTime;
      var endTime = this._activeProfile.endTime;
      this._overviewHeader.initialize(startTime, endTime);
      this._overview.initialize(startTime, endTime);
      this._activeProfile.forEachSnapshot(function(snapshot: TimelineBufferSnapshot, index: number) {
        self._headers[index].initialize(startTime, endTime);
        self._charts[index].initialize(startTime, endTime);
      });
    }

    private _onResize() {
      if (this._activeProfile) {
        var self = this;
        var width = this._container.offsetWidth;
        this._overviewHeader.setSize(width);
        this._overview.setSize(width);
        this._activeProfile.forEachSnapshot(function (snapshot:TimelineBufferSnapshot, index:number) {
          self._headers[index].setSize(width);
          self._charts[index].setSize(width);
        });
      }
    }

    private _updateViews() {
      var self = this;
      var start = this._activeProfile.windowStart;
      var end = this._activeProfile.windowEnd;
      this._overviewHeader.setWindow(start, end);
      this._overview.setWindow(start, end);
      this._activeProfile.forEachSnapshot(function(snapshot: TimelineBufferSnapshot, index: number) {
        self._headers[index].setWindow(start, end);
        self._charts[index].setWindow(start, end);
      });
    }

    private _drawViews() {
      var self = this;
      this._overviewHeader.draw();
      /*
      this._overview.setWindow(start, end);
      this._profile.forEachBuffer(function(buffer: TimelineBufferSnapshot, index: number) {
        self._headers[index].setWindow(start, end);
        self._charts[index].setWindow(start, end);
      });
      */
    }

    private _createTooltip() {
      var el = document.createElement("div");
      el.classList.add("profiler-tooltip");
      el.style.display = "none";
      this._container.insertBefore(el, this._container.firstChild);
      return el;
    }


    /**
     * View callbacks
     */

    setWindow(start: number, end: number) {
      this._activeProfile.setWindow(start, end);
      this._updateViews();
    }

    moveWindowTo(time: number) {
      this._activeProfile.moveWindowTo(time);
      this._updateViews();
    }

    showTooltip(chart: FlameChart, frame: TimelineFrame, x: number, y: number) {
      var totalTime = Math.round(frame.totalTime * 100000) / 100000;
      var selfTime = Math.round(frame.selfTime * 100000) / 100000;
      var selfPercent = Math.round(frame.selfTime * 100 * 100 / frame.totalTime) / 100;
      this._tooltip.innerHTML = "<div>"
                              +   "<h1>" + frame.kind.name + "</h1>"
                              +   "<p>Total time: " + totalTime + " ms</p>"
                              +   "<p>Self time: " + selfTime + " ms (" + selfPercent + "%)</p>"
                              + "</div>";
      this._tooltip.style.display = "block";
      var elContent = <HTMLElement>this._tooltip.firstChild;
      var tooltipWidth = elContent.clientWidth;
      var tooltipHeight = elContent.clientHeight;
      var totalWidth = chart.canvas.clientWidth;
      x += (x + tooltipWidth >= totalWidth - 50) ? -(tooltipWidth + 20) : 25;
      y += chart.canvas.offsetTop - tooltipHeight / 2;
      this._tooltip.style.left = x + "px";
      this._tooltip.style.top = y + "px";
    }

    hideTooltip() {
      this._tooltip.style.display = "none";
    }

  }

}
