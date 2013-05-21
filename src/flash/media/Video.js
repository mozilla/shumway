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
    _updateBounds: function () {
      this._videoScaleX = this._width / this._videoWidth;
      this._videoScaleY = this._height / this._videoHeight;
      this._bbox = {left: 0, top: 0, right: this._width, bottom: this._height};
      this._updateCurrentTransform();
    },
    attachNetStream: function (netStream) {
      this._netStream = netStream;
      netStream._videoReady.then(function (element) {
        this._element = element;
        netStream._videoMetadataReady.then(function (url) {
          this._element.width = this._videoWidth = this._element.videoWidth;
          this._element.height = this._videoHeight = this._element.videoHeight;
          this._width = this._width || this._videoWidth;
          this._height = this._height || this._videoHeight;
          this._updateBounds();
        }.bind(this));
      }.bind(this));
    },
    ctor: function(width, height) {
      if (width == null) width = 320;
      if (height == null) height = 240;

      this._width = this._videoWidth = width;
      this._height = this._videoHeight = height;
      this._updateBounds();

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

      ctx.beginPath();
      ctx.rect(0, 0, this._width, this._height);
      ctx.clip();
      ctx.clearRect(0, 0, this._width, this._height);

      var matrix = ctx.currentTransform;
      var sx = this._videoScaleX, sy = this._videoScaleY;
      var cssTransform = "transform: matrix(" + sx * matrix.a + ", " +
         sx * matrix.b + ", " + sy * matrix.c + ", " + sy * matrix.d + ", " +
         matrix.e + ", " + matrix.f + ");";
      if (this._currentCssTransform !== cssTransform) {
        this._currentCssTransform = cssTransform;
        this._element.setAttribute("style", "position: absolute; top:0; left:0; z-index: -100;" +
                                   "transform-origin: 0px 0px 0;" + cssTransform +
                                   "-webkit-transform-origin: 0px 0px 0; -webkit-" + cssTransform);
        this._markAsDirty();
      }
    }
  };

  def.__glue__ = {
    native: {
      instance: {
        attachNetStream: def.attachNetStream,
        ctor: def.ctor,
        height: {
          get: function () {
            return this._height;
          },
          set: function (val) {
            this._height = val;
            this._updateBounds();
          }
        },
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
        width: {
          get: function () {
            return this._width;
          },
          set: function (val) {
            this._width = val;
            this._updateBounds();
          }
        },
      }
    }
  };

  return def;
}).call(this);
