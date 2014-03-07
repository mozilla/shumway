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
/*global SWF, renderStage, rgbaObjToStr, ShumwayKeyboardListener, forceHidpi,
         Promise */

SWF.embed = function(file, doc, container, options) {
  var canvas = doc.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var loader = new flash.display.Loader();
  var loaderInfo = loader._contentLoaderInfo;
  var stage = new flash.display.Stage();

  var pixelRatio = 1;
  var forceHidpiSetting = forceHidpi.value;

  stage._loader = loader;
  loaderInfo._parameters = options.movieParams;
  loaderInfo._url = options.url || (typeof file === 'string' ? file : null);
  loaderInfo._loaderURL = options.loaderURL || loaderInfo._url;

  loader._parent = stage;
  loader._stage = stage;

  function setCanvasSize(width, height) {
    if (pixelRatio === 1.0) {
      canvas.width = width | 0;
      canvas.height = height | 0;
      return;
    }
    var canvasWidth = Math.floor(width * pixelRatio);
    var canvasHeight = Math.floor(height * pixelRatio);
    // trying fit into fractional amount of pixels if pixelRatio is not int
    canvas.style.width = (canvasWidth / pixelRatio) + 'px';
    canvas.style.height = (canvasHeight / pixelRatio) + 'px';
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  }

  function fitCanvas(container) {
    setCanvasSize(container.clientWidth, container.clientHeight);
    stage._invalid = true;
  }

  loaderInfo._addEventListener('init', function () {
    if (forceHidpiSetting || loaderInfo._swfVersion >= 18) {
      // Support of HiDPI displays  (for SWF version 18 and above only)
      pixelRatio = 'devicePixelRatio' in window ? window.devicePixelRatio : 1;
    }
    canvas._pixelRatio = pixelRatio;
    stage._contentsScaleFactor = pixelRatio;

    if (container.clientHeight) {
      fitCanvas(container);
      window.addEventListener('resize', function () {
        fitCanvas(container);
      });
    } else {
      setCanvasSize(stage._stageWidth / 20, stage._stageHeight / 20);
    }

    container.setAttribute("style", "position: relative");

    canvas.addEventListener('click', function () {
      ShumwayKeyboardListener.focus = stage;

      stage._mouseTarget._dispatchEvent('click');
    });
    canvas.addEventListener('dblclick', function () {
      if (stage._mouseTarget._doubleClickEnabled) {
        stage._mouseTarget._dispatchEvent('doubleClick');
      }
    });
    canvas.addEventListener('mousedown', function () {
      stage._mouseEvents.push('mousedown');
    });
    canvas.addEventListener('mousemove', function (domEvt) {
      var node = this;
      var left = 0;
      var top = 0;
      if (node.offsetParent) {
        do {
          left += node.offsetLeft;
          top += node.offsetTop;
        } while ((node = node.offsetParent));
      }

      var m = stage._concatenatedTransform;
      var mouseX = ((domEvt.pageX - left) * pixelRatio - m.tx / 20) / m.a;
      var mouseY = ((domEvt.pageY - top) * pixelRatio - m.ty / 20) / m.d;

      if (mouseX !== stage._mouseX || mouseY !== stage._mouseY) {
        stage._mouseMoved = true;
        stage._mouseX = mouseX * 20;
        stage._mouseY = mouseY * 20;
      }
    });
    canvas.addEventListener('mouseup', function () {
      stage._mouseEvents.push('mouseup');
    });
    canvas.addEventListener('mouseover', function () {
      stage._mouseMoved = true;
      stage._mouseOver = true;
    });
    canvas.addEventListener('mouseout', function () {
      stage._mouseMoved = true;
      stage._mouseOver = false;
    });

    // Also accepting postMessages from the parent windows to control
    // mouse and keyboard (e.g. when embedded in iframe).
    window.addEventListener('message', function (evt) {
      var data = evt.data;
      if (typeof data !== 'object' || data === null) {
        return;
      }

      var type = data.type;
      switch (type) {
      case 'mousemove':
      case 'mouseup':
      case 'mousedown':
        var isMouseMove = type === 'mousemove';
        stage._mouseMoved = true;
        stage._mouseOver = true;
        stage._mouseX = data.x * 20;
        stage._mouseY = data.y * 20;
        if (!isMouseMove) {
          stage._mouseEvents.push(type);
        }
        break;
      case 'mouseover':
      case 'mouseout':
        stage._mouseMoved = true;
        stage._mouseOver = type === 'mouseover';
        break;
      case 'keyup':
      case 'keydown':
        stage._dispatchEvent(new flash.events.KeyboardEvent(
          type === 'keyup' ? 'keyUp' : 'keyDown', true, false,
          data.charCode, data.keyCode, data.keyLocation,
          data.ctrlKey || false, data.altKey || false, data.shiftKey || false));
        break;
      }
    }, false);

    var bgcolor = loaderInfo._backgroundColor;
    if (options.objectParams) {
      var m;
      if (options.objectParams.bgcolor &&
          (m = /#([0-9A-F]{6})/i.exec(options.objectParams.bgcolor))) {
        var hexColor = parseInt(m[1], 16);
        bgcolor = {
          red: (hexColor >> 16) & 255,
          green: (hexColor >> 8) & 255,
          blue: hexColor & 255,
          alpha: 255
        };
      }
      if (options.objectParams.wmode === 'transparent') {
        bgcolor = {red: 0, green: 0, blue: 0, alpha: 0};
      }
    }
    stage._color = bgcolor;

    ctx.fillStyle = rgbaObjToStr(bgcolor);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var root = loader._content;

    root._dispatchEvent("added", undefined, true);
    root._dispatchEvent("addedToStage");

    container.appendChild(canvas);
    stage._domContainer = container;

    if (options.onStageInitialized) {
      options.onStageInitialized(stage);
    }

    var startPromise = options.startPromise || Promise.resolve();
    startPromise.then(function () {
      renderStage(stage, ctx, options);
    });
  });

  if (options.onParsed) {
    loaderInfo._addEventListener("parsed", function () {
      options.onParsed();
    });
  }

  if (options.onComplete) {
    loaderInfo._addEventListener("complete", function () {
      options.onComplete();
    });
  }


  loader._load(typeof file === 'string' ? new flash.net.URLRequest(file) : file);

  return loader;
};
