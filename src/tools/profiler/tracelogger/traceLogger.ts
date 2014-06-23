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
module Shumway.Tools.Profiler.TraceLogger {

  export class TraceLoggerProgressInfo {
    constructor (
      public pageLoaded: boolean,
      public threadsTotal: number,
      public threadsLoaded: number,
      public threadFilesTotal: number,
      public threadFilesLoaded: number
    ) {}
    toString(): string {
      return "[" + ["pageLoaded","threadsTotal","threadsLoaded","threadFilesTotal","threadFilesLoaded"].map(function(value, i, arr) {
        return value + ":" + this[value];
      }, this).join(", ") + "]";
    }
  }

  export class TraceLogger {

    private _baseUrl: string;
    private _threads: Thread [];
    private _pageLoadCallback: (err: any, result: any []) => void;
    private _pageLoadProgressCallback: (info: TraceLoggerProgressInfo) => void;
    private _progressInfo: TraceLoggerProgressInfo;

    constructor(baseUrl: string) {
      this._baseUrl = baseUrl;
      this._threads = [];
      this._progressInfo = null;
    }

    loadPage(url: string, callback: (err: any, result: any []) => void, progress?: (info: TraceLoggerProgressInfo) => void) {
      this._threads = [];
      this._pageLoadCallback = callback;
      this._pageLoadProgressCallback = progress;
      this._progressInfo = new TraceLoggerProgressInfo(false, 0, 0, 0, 0);
      this._loadData([url], this._onLoadPage.bind(this));
    }

    get buffers(): TimelineBuffer [] {
      var buffers = [];
      for (var i = 0, n = this._threads.length; i < n; i++) {
        buffers.push(this._threads[i].buffer);
      }
      return buffers;
    }

    private _onProgress() {
      if (this._pageLoadProgressCallback) {
        this._pageLoadProgressCallback.call(this, this._progressInfo);
      }
    }

    private _onLoadPage(result: any []) {
      if (result && result.length == 1) {
        var self = this;
        var count = 0;
        var threads = result[0];
        var threadCount = threads.length;
        this._threads = Array(threadCount);
        this._progressInfo.pageLoaded = true;
        this._progressInfo.threadsTotal = threadCount;
        for (var i = 0; i < threads.length; i++) {
          var thread = threads[i];
          var urls = [thread.dict, thread.tree];
          if (thread.corrections) {
            urls.push(thread.corrections);
          }
          this._progressInfo.threadFilesTotal += urls.length;
          this._loadData(
            urls,
            (function(index: number) {
              return function(result: any []): any {
                if (result) {
                  var thread = new Thread(result);
                  thread.buffer.name = "Thread " + index;
                  self._threads[index] = thread;
                }
                count++;
                self._progressInfo.threadsLoaded++;
                self._onProgress();
                if (count === threadCount) {
                  self._pageLoadCallback.call(self, null, self._threads);
                }
              };
            })(i),
            function(count) {
              self._progressInfo.threadFilesLoaded++;
              self._onProgress();
            }
          );
        }
        this._onProgress();
      } else {
        this._pageLoadCallback.call(this, "Error loading page.", null);
      }
    }

    private _loadData(urls: string [], callback: (result: any []) => void, progress?: (count: number) => void) {
      var count = 0;
      var errors = 0;
      var expected = urls.length;
      var received = [];
      received.length = expected;
      for (var i = 0; i < expected; i++) {
        var url = this._baseUrl + urls[i];
        var isTL = /\.tl$/i.test(url);
        var xhr = new XMLHttpRequest();
        var responseType = isTL ? "arraybuffer" : "json";
        xhr.open('GET', url, true);
        xhr.responseType = responseType;
        xhr.onload = (function(index: number, type: string) {
          return function(event: Event): any {
            if (type === "json") {
              var json = this.response;
              if (typeof json === "string") {
                try {
                  json = JSON.parse(json);
                  received[index] = json;
                }
                catch (e) {
                  errors++;
                }
              } else {
                received[index] = json;
              }
            } else {
              received[index] = this.response;
            }
            ++count;
            if (progress) {
              progress(count);
            }
            if (count === expected) {
              callback(received);
            }
          };
        })(i, responseType);
        xhr.send();
      }
    }

    private static colors = [
      "#0044ff", "#8c4b00", "#cc5c33", "#ff80c4", "#ffbfd9", "#ff8800", "#8c5e00", "#adcc33", "#b380ff", "#bfd9ff",
      "#ffaa00", "#8c0038", "#bf8f30", "#f780ff", "#cc99c9", "#aaff00", "#000073", "#452699", "#cc8166", "#cca799",
      "#000066", "#992626", "#cc6666", "#ccc299", "#ff6600", "#526600", "#992663", "#cc6681", "#99ccc2", "#ff0066",
      "#520066", "#269973", "#61994d", "#739699", "#ffcc00", "#006629", "#269199", "#94994d", "#738299", "#ff0000",
      "#590000", "#234d8c", "#8c6246", "#7d7399", "#ee00ff", "#00474d", "#8c2385", "#8c7546", "#7c8c69", "#eeff00",
      "#4d003d", "#662e1a", "#62468c", "#8c6969", "#6600ff", "#4c2900", "#1a6657", "#8c464f", "#8c6981", "#44ff00",
      "#401100", "#1a2466", "#663355", "#567365", "#d90074", "#403300", "#101d40", "#59562d", "#66614d", "#cc0000",
      "#002b40", "#234010", "#4c2626", "#4d5e66", "#00a3cc", "#400011", "#231040", "#4c3626", "#464359", "#0000bf",
      "#331b00", "#80e6ff", "#311a33", "#4d3939", "#a69b00", "#003329", "#80ffb2", "#331a20", "#40303d", "#00a658",
      "#40ffd9", "#ffc480", "#ffe1bf", "#332b26", "#8c2500", "#9933cc", "#80fff6", "#ffbfbf", "#303326", "#005e8c",
      "#33cc47", "#b2ff80", "#c8bfff", "#263332", "#00708c", "#cc33ad", "#ffe680", "#f2ffbf", "#262a33", "#388c00",
      "#335ccc", "#8091ff", "#bfffd9"
    ];

    /*
    static TextToColor(text: string): number {

    this.map = []

    var usedColors = 0;
    for(var i=0; i<textmap.length; i++) {
      var color = "";
      switch(textmap[i]) {
        case "IonCompilation": color = "green"; break;
        case "IonLinking": color = "green"; break;
        case "YarrCompile": color = "#BE8CFF"; break;
        case "YarrJIT": color = "#BE8CFF"; break;
        case "YarrInterpreter": color = "#BE8CFF"; break;
        case "MinorGC": color = "#CCCCCC"; break;
        case "GC": color = "#666666"; break;
        case "GCSweeping": color = "#666666"; break;
        case "GCAllocation": color = "#666666"; break;
        case "Interpreter": color = "#FFFFFF"; break;
        case "Baseline": color = "#FFE75E"; break;
        case "IonMonkey": color = "#54D93D"; break;
        case "ParserCompileScript": color = "#DB0000"; break;
        case "ParserCompileLazy": color = "#A30000"; break;
        case "ParserCompileFunction": color = "#CC8585"; break;
        case "VM": color = "#00aaff"; break;
        default:
          if (textmap[i].substring(0,6) == "script")
            color = "white";
          else
            color = colors[usedColors++];
          break;
      }
      this.map[textmap[i]] = color;
    }
    }*/

  }

}

