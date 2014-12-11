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
module Shumway.Tools.Mini {
  export class FPS {
    private _container: HTMLDivElement;
    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;
    private _ratio: number;

    private _index = 0;
    private _lastTime: number = 0;
    private _lastWeightedTime = 0;

    private _gradient = [
      "#FF0000",  // Red
      "#FF1100",
      "#FF2300",
      "#FF3400",
      "#FF4600",
      "#FF5700",
      "#FF6900",
      "#FF7B00",
      "#FF8C00",
      "#FF9E00",
      "#FFAF00",
      "#FFC100",
      "#FFD300",
      "#FFE400",
      "#FFF600",
      "#F7FF00",
      "#E5FF00",
      "#D4FF00",
      "#C2FF00",
      "#B0FF00",
      "#9FFF00",
      "#8DFF00",
      "#7CFF00",
      "#6AFF00",
      "#58FF00",
      "#47FF00",
      "#35FF00",
      "#24FF00",
      "#12FF00",
      "#00FF00"   // Green
    ];

    constructor(container: HTMLDivElement) {
      this._container = container;
      this._canvas = document.createElement("canvas");
      this._container.appendChild(this._canvas);
      this._context = this._canvas.getContext("2d");
      this._listenForContainerSizeChanges();
    }

    private _listenForContainerSizeChanges() {
      var pollInterval = 10;
      var w = this._containerWidth;
      var h = this._containerHeight;
      this._onContainerSizeChanged();
      var self = this;
      setInterval(function () {
        if (w !== self._containerWidth || h !== self._containerHeight) {
          self._onContainerSizeChanged();
          w = self._containerWidth;
          h = self._containerHeight;
        }
      }, pollInterval);
    }

    private _onContainerSizeChanged() {
      var cw = this._containerWidth;
      var ch = this._containerHeight;
      var devicePixelRatio = window.devicePixelRatio || 1;
      var backingStoreRatio = 1;
      if (devicePixelRatio !== backingStoreRatio) {
        this._ratio = devicePixelRatio / backingStoreRatio;
        this._canvas.width = cw * this._ratio;
        this._canvas.height = ch * this._ratio;
        this._canvas.style.width = cw + 'px';
        this._canvas.style.height = ch + 'px';
      } else {
        this._ratio = 1;
        this._canvas.width = cw;
        this._canvas.height = ch;
      }
    }

    private get _containerWidth(): number {
      return this._container.clientWidth;
    }

    private get _containerHeight(): number {
      return this._container.clientHeight;
    }

    public tickAndRender(idle: boolean = false, renderTime: number = 0) {
      if (this._lastTime === 0) {
        this._lastTime = performance.now();
        return;
      }

      var elapsedTime = performance.now() - this._lastTime;
      var weightRatio = 0; // Use ratio here if you want smoothing.
      var weightedTime = elapsedTime * (1 - weightRatio) + this._lastWeightedTime * weightRatio;

      var context = this._context;
      var w = 2 * this._ratio;
      var wPadding = 1;
      var fontSize = 8;
      var tickOffset = this._ratio * 30;
      var webkitPerformance: any = performance;
      if (webkitPerformance.memory) {
        tickOffset += this._ratio * 30;
      }

      var count = ((this._canvas.width - tickOffset) / (w + wPadding)) | 0;

      var index = this._index ++;
      if (this._index > count) {
        this._index = 0;
      }

      var canvasHeight = this._canvas.height;
      context.globalAlpha = 1;
      context.fillStyle = "black";
      context.fillRect(tickOffset + index * (w + wPadding), 0, w * 4, this._canvas.height);

      var r = Math.min((1000 / 60) / weightedTime, 1);
      context.fillStyle = "#00FF00"; // this._gradient[r * (this._gradient.length - 1) | 0];
      context.globalAlpha = idle ? 0.5 : 1;
      var v = canvasHeight / 2 * r | 0;
      context.fillRect(tickOffset + index * (w + wPadding), canvasHeight - v, w, v);

      if (renderTime) {
        r = Math.min((1000 / 240) / renderTime, 1);
        context.fillStyle = "#FF6347"; // "#58FF00"; // "#00FF00"; // this._gradient[r * (this._gradient.length - 1) | 0];
        var v = canvasHeight / 2 * r | 0;
        context.fillRect(tickOffset + index * (w + wPadding), (canvasHeight / 2) - v, w, v);
      }

      if (index % 16 === 0) {
        context.globalAlpha = 1;
        context.fillStyle = "black";
        context.fillRect(0, 0, tickOffset, this._canvas.height);
        context.fillStyle = "white";
        context.font = (this._ratio * fontSize) + "px Arial";
        context.textBaseline = "middle";
        var s = (1000 / weightedTime).toFixed(0);
        if (renderTime) {
          s += " " + renderTime.toFixed(0);
        }
        if (webkitPerformance.memory) {
          s += " " + (webkitPerformance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
        }
        context.fillText(s, 2 * this._ratio, this._containerHeight / 2 * this._ratio);
      }

      this._lastTime = performance.now();
      this._lastWeightedTime = weightedTime;
    }
  }
}