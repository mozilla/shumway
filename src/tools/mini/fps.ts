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

    constructor(canvas: HTMLCanvasElement) {
      this._canvas = canvas;
      this._context = canvas.getContext("2d");
      window.addEventListener('resize', this._resizeHandler.bind(this), false);
      this._resizeHandler();
    }

    private _resizeHandler() {
      var parent = this._canvas.parentElement;
      var cw = parent.clientWidth;
      var ch = parent.clientHeight - 1;
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


    public tickAndRender(idle: boolean = false) {
      if (this._lastTime === 0) {
        this._lastTime = performance.now();
        return;
      }

      var elapsedTime = performance.now() - this._lastTime;
      var weightRatio = 0.3;
      var weightedTime = elapsedTime * (1 - weightRatio) + this._lastWeightedTime * weightRatio;

      var context = this._context;
      var w = 2 * this._ratio;
      var wPadding = 1;
      var textWidth = 20;
      var count = ((this._canvas.width - textWidth) / (w + wPadding)) | 0;

      var index = this._index ++;
      if (this._index > count) {
        this._index = 0;
      }

      context.fillStyle = "black";
      context.fillRect(textWidth + index * (w + wPadding), 0, w * 4, this._canvas.height);

      var r = (1000 / 60) / weightedTime;
      context.fillStyle = this._gradient[r * (this._gradient.length - 1) | 0];
      context.globalAlpha = idle ? 0.2 : 1;
      var v = this._canvas.height * r | 0;

      context.fillRect(textWidth + index * (w + wPadding), 0, w, v);
      if (index % 16 === 0) {
        context.fillStyle = "black";
        context.fillRect(0, 0, textWidth, this._canvas.height);
        context.globalAlpha = 1;
        context.fillStyle = "white";
        context.font = "10px Arial";
        context.fillText((1000 / weightedTime).toFixed(0), 2, 8);
      }

      this._lastTime = performance.now();
      this._lastWeightedTime = weightedTime;
    }
  }
}