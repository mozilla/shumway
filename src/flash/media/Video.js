/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*global TelemetryService, VIDEO_FEATURE */

var VideoDefinition = (function () {
  function burnHole(ctx, x, y, width, height) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.clip();
    ctx.clearRect(0, 0, width, height);
    ctx.restore();
  }

  var def = {
    initialize: function initialize() {
      TelemetryService.reportTelemetry({topic: 'feature', feature: VIDEO_FEATURE});
    },
    attachNetStream: function (netStream) {
      if (this._netStream === netStream) {
        return;
      }
      if (this._netStream) {
        this._netStream._videoReady.then(function (element) {
          this._element = null;
          if (this._added) {
            element.remove();
            this._added = false;
          }
        }.bind(this));
      }
      this._netStream = netStream;
      if (!netStream) {
        return;
      }
      netStream._videoReady.then(function (element) {
        this._element = element;
        netStream._videoMetadataReady.then(function (url) {
          this._element.width = this._videoWidth = this._element.videoWidth;
          this._element.height = this._videoHeight = this._element.videoHeight;
          if (this.stage) {
            this.stage._invalid = true;
          }
        }.bind(this));
      }.bind(this));
    },
    ctor: function(width, height) {
      if (!width || width < 0) width = 320;
      if (!height || height < 0) height = 240;

      this._bbox = {xMin: 0, yMin: 0, xMax: width * 20, yMax: height * 20};

      this._initialWidth = this._videoWidth = width;
      this._initialHeight = this._videoHeight = height;

      this._netStream = null;
      this._element = null;
      this._added = false;
    },
    draw: function (ctx, ratio, ct, parentCtxs) {
      if (!this._element) {
        return;
      }
      if (!this._added && this._stage) {
        this._stage._domContainer.appendChild(this._element);
        this._added = true;
      }

      var width = this._initialWidth;
      var height = this._initialHeight;

      var matrix = this._getConcatenatedTransform(null, true);
      var scaleFactor = (this.stage && this.stage._contentsScaleFactor) || 1;
      var a = matrix.a / scaleFactor;
      var b = matrix.b / scaleFactor;
      var c = matrix.c / scaleFactor;
      var d = matrix.d / scaleFactor;
      var e = matrix.tx / 20 / scaleFactor;
      var f = matrix.ty / 20 / scaleFactor;

      if (width > 0 && height > 0) {
        burnHole(ctx, 0, 0, width, height);
        parentCtxs.forEach(function (ctx) {
          ctx.save();
          ctx.setTransform(a, b, c, d, e, f);
          burnHole(ctx, 0, 0, width, height);
          ctx.restore();
        });
      }

      var sx = width / this._videoWidth;
      var sy = height / this._videoHeight;

      var cssTransform = "transform: matrix(" + (sx * a) + "," + (sx * b) +
        "," + (sy * c) + "," + (sy * d) + "," + e + "," + f + ");";

      if (this._currentCssTransform !== cssTransform) {
        this._currentCssTransform = cssTransform;
        this._element.setAttribute("style", "position: absolute; top:0; left:0; z-index: -100;" +
                                   "transform-origin: 0px 0px 0;" + cssTransform +
                                   "-webkit-transform-origin: 0px 0px 0; -webkit-" + cssTransform);
      }
    }
  };

  def.__glue__ = {
    native: {
      instance: {
        attachNetStream: def.attachNetStream,
        ctor: def.ctor,
        smoothing: {
          get: function smoothing() { // (void) -> Boolean
            return this._smoothing;
          },
          set: function smoothing(value) { // (value:Boolean) -> void
            somewhatImplemented("Video.smoothing");
            this._smoothing = value;
          }
        },
        videoHeight: {
          get: function videoHeight() { // (void) -> int
            return this._videoHeight;
          }
        },
        videoWidth: {
          get: function videoWidth() { // (void) -> int
            return this._videoWidth;
          }
        },
      }
    }
  };

  return def;
}).call(this);
