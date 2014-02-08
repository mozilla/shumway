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

var ShapeDefinition = (function () {
  /**
  * For shapes parsed in a worker thread, we have to finish their
  * paths after receiving the data in the main thread.
  *
  * This entails creating proper instances for all the contained data types.
  */
  function finishShapePath(path, dictionaryResolved) {
    assert(!inWorker);

    if (path.fullyInitialized) {
      return path;
    }
    if (!(path instanceof ShapePath)) {
      var untypedPath = path;
      path = new ShapePath(path.fillStyle, path.lineStyle, 0, 0, path.isMorph);
      // See the comment in the ShapePath ctor for why we're recreating the
      // typed arrays here.
      path.commands = new Uint8Array(untypedPath.buffers[0]);
      path.data = new Int32Array(untypedPath.buffers[1]);
      if (untypedPath.isMorph) {
        path.morphData = new Int32Array(untypedPath.buffers[2]);
      }
      path.buffers = null;
    }
    //path.fillStyle && initStyle(path.fillStyle, dictionaryResolved);
    //path.lineStyle && initStyle(path.lineStyle, dictionaryResolved);
    path.fullyInitialized = true;
    return path;
  }

  var def = {
    __class__: 'flash.display.Shape',

    initialize: function () {
      var graphics = this._graphics = new flash.display.Graphics();
      graphics._parent = this;
      var s = this.symbol;
      if (s && s.paths) {
        graphics._paths = s.paths;
        for (var i = 0; i < s.paths.length; i++) {
          s.paths[i] = finishShapePath(s.paths[i], s.dictionaryResolved);
        }
        graphics.bbox = s.bbox;
        graphics.strokeBbox = s.strokeBbox;
        this.ratio = s.ratio || 0;
      }

      this._renderableType = Renderer.SHAPE;
    }
  };

  def.__glue__ = {
    native: {
      instance: {
        graphics: {
          get: function () { return this._graphics; }
        }
      }
    }
  };

  return def;
}).call(this);
