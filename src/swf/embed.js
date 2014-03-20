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
/*global SWF, renderStage, rgbaObjToStr, ShumwayKeyboardListener, forceHidpi */

MessageCenter.subscribe('load', function (data) {
  var file = data.file;

  var stage = new flash.display.Stage();
  var loader = new flash.display.Loader();
  var loaderInfo = loader._contentLoaderInfo;

  stage._loader = loader;

  loaderInfo._parameters = data.movieParams;
  loaderInfo._url = data.url || (typeof file === 'string' ? file : null);
  loaderInfo._loaderURL = data.loaderURL || loaderInfo._url;

  loader._parent = stage;
  loader._stage = stage;

  var pixelRatio = 1;

  if (forceHidpi.value || loaderInfo._swfVersion >= 18) {
    pixelRatio = data.pixelRatio || 1;

    stage._contentsScaleFactor = pixelRatio;

    var m = stage._concatenatedTransform;
    m.a = pixelRatio;
    m.d = pixelRatio;
  }

  loaderInfo._addEventListener('init', function () {
    var bgcolor = loaderInfo._backgroundColor;
    stage._color = bgcolor;

    var root = loader._content;

    root._dispatchEvent("added", undefined, true);
    root._dispatchEvent("addedToStage");

    root._layerId = stage._nextLayerId++;
    root._renderableId = stage._nextRenderableId++;
    stage._addLayer(root._layerId, 0, root);

    MessageCenter.post('init');

    stage._enterEventLoop();
  });

  loaderInfo._addEventListener('complete', function () {
    MessageCenter.post('complete');
  });

  loader._load(typeof file === 'string' ? new flash.net.URLRequest(file) : file);

  MessageCenter.subscribe('mouse', function (data) {
    switch (data.type) {
    case 'click':
      ShumwayKeyboardListener.focus = stage;

      stage._mouseTarget._dispatchEvent('click');
      break;
    case 'dblclick':
      if (stage._mouseTarget._doubleClickEnabled) {
        stage._mouseTarget._dispatchEvent('doubleClick');
      }
      break;
    case 'mousedown':
      stage._mouseEvents.push('mousedown');
      break;
    case 'mousemove':
      var m = stage._concatenatedTransform;
      var mouseX = ((data.x) * pixelRatio - m.tx / 20) / m.a;
      var mouseY = ((data.y) * pixelRatio - m.ty / 20) / m.d;

      if (mouseX !== stage._mouseX || mouseY !== stage._mouseY) {
        stage._mouseMoved = true;
        stage._mouseX = mouseX * 20;
        stage._mouseY = mouseY * 20;
      }
      break;
    case 'mouseup':
      stage._mouseEvents.push('mouseup');
      break;
    case 'mouseover':
      stage._mouseMoved = true;
      stage._mouseOver = true;
      break;
    case 'mouseout':
      stage._mouseMoved = true;
      stage._mouseOver = false;
      break;
    }
  });
});

MessageCenter.subscribe('options', function (data) {
  // TODO
});

SWF.embed = function(file, doc, container, options) {
  var pixelRatio = 'devicePixelRatio' in window ? window.devicePixelRatio : 1;

  var bgcolor;
  if (options.objectParams) {
   var m;
   if (options.objectParams.bgcolor &&
       (m = /#([0-9A-F]{6})/i.exec(options.objectParams.bgcolor)))
    {
      var hexColor = parseInt(m[1], 16);
      bgcolor = hexColor << 8 | 0xff;
    }
    if (options.objectParams.wmode === 'transparent') {
      bgcolor = 0;
    }
  }

  container.setAttribute('style', 'position: relative');

  var renderer = new Renderer(container, bgcolor, options);

  MessageCenter.subscribe('init', function (data) {
    if (options.onStageInitialized) {
      options.onStageInitialized({ _frameRate: 24 });
    }
  });

  if (options.onComplete) {
    MessageCenter.subscribe('complete', function (data) {
      options.onComplete();
    });
  }

  MessageCenter.post('load', {
    file: file,
    url: options.url,
    loaderURL: options.loaderURL,
    movieParams: options.movieParams,
    pixelRatio: pixelRatio
  });
};

function mouseListener(e) {
  var node = e.target;
  if (node instanceof HTMLCanvasElement) {
    var left = 0;
    var top = 0;
    if (node.offsetParent) {
      do {
        left += node.offsetLeft;
        top += node.offsetTop;
      } while ((node = node.offsetParent));
    }

    MessageCenter.post('mouse', {
      type: e.type,
      x: e.pageX - left,
      y: e.pageY - top
    });
  }
}
window.addEventListener('click', mouseListener);
window.addEventListener('dblclick', mouseListener);
window.addEventListener('mousedown', mouseListener);
window.addEventListener('mousemove', mouseListener);
window.addEventListener('mouseup', mouseListener);
window.addEventListener('mouseover', mouseListener);
window.addEventListener('mouseout', mouseListener);

function keyListener(e) {
  MessageCenter.post('key', {
    type: e.type,
    keyCode: e.keyCode,
    charCode: e.charCode,
    keyLocation: e.keyLocation,
    ctrlKey: e.ctrlKey,
    altKey: e.altKey,
    shiftKey: e.shiftKey
  });
}
window.addEventListener('keydown', keyListener);
window.addEventListener('keypress', keyListener);
window.addEventListener('keyup', keyListener);
