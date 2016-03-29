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

  export const enum UIThemeType {
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

    createProfile(buffers: TimelineBuffer [], startTime: number): Profile {
      var profile = new Profile(buffers, startTime);
      profile.createSnapshots();
      this._profiles.push(profile);
      this.activateProfile(profile);
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
      if (this._activeProfile) {
        var self = this;
        this._overviewHeader = new Profiler.FlameChartHeader(this, FlameChartHeaderType.OVERVIEW);
        this._overview = new Profiler.FlameChartOverview(this, FlameChartOverviewMode.OVERLAY);
        this._activeProfile.forEachSnapshot(function (snapshot:TimelineBufferSnapshot, index:number) {
          self._headers.push(new Profiler.FlameChartHeader(self, FlameChartHeaderType.CHART));
          self._charts.push(new Profiler.FlameChart(self, snapshot));
        });
        window.addEventListener("resize", this._onResize.bind(this));
      }
    }

    private _destroyViews() {
      if (this._activeProfile) {
        this._overviewHeader.destroy();
        this._overview.destroy();
        while (this._headers.length) {
          this._headers.pop().destroy();
        }
        while (this._charts.length) {
          this._charts.pop().destroy();
        }
        window.removeEventListener("resize", this._onResize.bind(this));
      }
    }

    private _initializeViews() {
      if (this._activeProfile) {
        var self = this;
        var startTime = this._activeProfile.startTime;
        var endTime = this._activeProfile.endTime;
        this._overviewHeader.initialize(startTime, endTime);
        this._overview.initialize(startTime, endTime);
        this._activeProfile.forEachSnapshot(function (snapshot:TimelineBufferSnapshot, index:number) {
          self._headers[index].initialize(startTime, endTime);
          self._charts[index].initialize(startTime, endTime);
        });
      }
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
      if (this._activeProfile) {
        var self = this;
        var start = this._activeProfile.windowStart;
        var end = this._activeProfile.windowEnd;
        this._overviewHeader.setWindow(start, end);
        this._overview.setWindow(start, end);
        this._activeProfile.forEachSnapshot(function (snapshot:TimelineBufferSnapshot, index:number) {
          self._headers[index].setWindow(start, end);
          self._charts[index].setWindow(start, end);
        });
      }
    }

    private _drawViews() {
      /*
      var self = this;
      this._overviewHeader.draw();
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
      this.removeTooltipContent();
      this._tooltip.appendChild(this.createTooltipContent(chart, frame));
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

    createTooltipContent(chart: FlameChart, frame: TimelineFrame): HTMLElement {
      var totalTime = Math.round(frame.totalTime * 100000) / 100000;
      var selfTime = Math.round(frame.selfTime * 100000) / 100000;
      var selfPercent = Math.round(frame.selfTime * 100 * 100 / frame.totalTime) / 100;

      var elContent = document.createElement("div");

      var elName = document.createElement("h1");
      elName.textContent = frame.kind.name;
      elContent.appendChild(elName);

      var elTotalTime = document.createElement("p");
      elTotalTime.textContent = "Total: " + totalTime + " ms";
      elContent.appendChild(elTotalTime);

      var elSelfTime = document.createElement("p");
      elSelfTime.textContent = "Self: " + selfTime + " ms (" + selfPercent + "%)";
      elContent.appendChild(elSelfTime);

      var statistics = chart.getStatistics(frame.kind);

      if (statistics) {
        var elAllCount = document.createElement("p");
        elAllCount.textContent = "Count: " + statistics.count;
        elContent.appendChild(elAllCount);

        var allTotalTime = Math.round(statistics.totalTime * 100000) / 100000;
        var elAllTotalTime = document.createElement("p");
        elAllTotalTime.textContent = "All Total: " + allTotalTime + " ms";
        elContent.appendChild(elAllTotalTime);

        var allSelfTime = Math.round(statistics.selfTime * 100000) / 100000;
        var elAllSelfTime = document.createElement("p");
        elAllSelfTime.textContent = "All Self: " + allSelfTime + " ms";
        elContent.appendChild(elAllSelfTime);
      }

      this.appendDataElements(elContent, frame.startData);
      this.appendDataElements(elContent, frame.endData);

      return elContent;
    }

    appendDataElements(el: HTMLElement, data: any) {
      if (!isNullOrUndefined(data)) {
        el.appendChild(document.createElement("hr"));
        var elData:HTMLElement;
        if (isObject(data)) {
          for (var key in data) {
            elData = document.createElement("p");
            elData.textContent = key + ": " + data[key];
            el.appendChild(elData);
          }
        } else {
          elData = document.createElement("p");
          elData.textContent = data.toString();
          el.appendChild(elData);
        }
      }
    }

    removeTooltipContent() {
      var el = this._tooltip;
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      }
    }

  }
}
