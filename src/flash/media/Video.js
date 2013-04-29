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
      this._element = document.createElement('video');
      this._element.setAttribute("style",
          "position: absolute; top:0; left:0; z-index: 100; background: black;");
      this._added = false;
    },

    attachNetStream: function (netStream) {
      this._netStream = netStream;
      netStream._urlReady.then(function (url) {
        this._element.src = url;
      }.bind(this));
    },
    ctor: function(width, height) {
      if (width == null) width = 320;
      if (height == null) height = 240;
      this._width = this._videoWidth = width;
      this._height = this._videoHeight = height;
      this._videoScaleX = 1;
      this._videoScaleY = 1;

      this._bbox = {left: 0, top: 0, right: width, bottom: height};

      this._element.addEventListener('loadedmetadata', function () {
        this._videoScaleX = this._width / this._element.videoWidth;
        this._videoScaleY = this._height / this._element.videoHeight;
        this._element.width = this._element.videoWidth;
        this._element.height = this._element.videoHeight;
      }.bind(this));
    },
    draw: function (ctx) {
      if (!this._added) {
        ctx.canvas.parentNode.appendChild(this._element);
        this._element.play();
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
        ctor: def.ctor
      }
    }
  };

  return def;
}).call(this);
