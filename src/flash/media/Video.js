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

var VideoDefinition = (function () {
  var def = {
    initialize: function initialize() {
    },
    attachNetStream: function (netStream) {
      this._netStream = netStream;
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

      this._bbox = {left: 0, top: 0, right: width, bottom: height};

      this._initialWidth = this._videoWidth = width;
      this._initialHeight = this._videoHeight = height;

      this._element = null;
      this._added = false;
    },
    draw: function (ctx) {
      if (!this._element) {
        return;
      }
      if (!this._added) {
        ctx.canvas.parentNode.appendChild(this._element);
        this._added = true;
      }

      var width = this._initialWidth;
      var height = this._initialHeight;

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, width, height);
      ctx.clip();
      ctx.clearRect(0, 0, width, height);
      ctx.restore();

      var matrix = ctx.currentTransform;
      var sx = width / this._videoWidth;
      var sy = height / this._videoHeight;

      var scaleFactor = (this.stage && this.stage._contentsScaleFactor) || 1;
      var a = sx * matrix.a / scaleFactor;
      var b = sx * matrix.b / scaleFactor;
      var c = sy * matrix.c / scaleFactor;
      var d = sy * matrix.d / scaleFactor;
      var e = matrix.e / scaleFactor;
      var f = matrix.f / scaleFactor;

      var cssTransform = "transform: matrix(" + a + "," + b + "," + c + "," +
         d + "," + e + "," + f + ");";

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
