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

var StageVideoDefinition = (function () {
  return {
    // ()
    __class__: "flash.media.StageVideo",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
          attachNetStream: function attachNetStream(netStream) { // (netStream:NetStream) -> void
            notImplemented("StageVideo.attachNetStream");
          },
          attachCamera: function attachCamera(theCamera) { // (theCamera:Camera) -> void
            notImplemented("StageVideo.attachCamera");
          },
          viewPort: {
            get: function viewPort() { // (void) -> Rectangle
              notImplemented("StageVideo.viewPort");
              return this._viewPort;
            },
            set: function viewPort(rect) { // (rect:Rectangle) -> void
              notImplemented("StageVideo.viewPort");
              this._viewPort = rect;
            }
          },
          pan: {
            set: function pan(point) { // (point:Point) -> void
              notImplemented("StageVideo.pan");
              this._pan = point;
            },
            get: function pan() { // (void) -> Point
              notImplemented("StageVideo.pan");
              return this._pan;
            }
          },
          zoom: {
            set: function zoom(point) { // (point:Point) -> void
              notImplemented("StageVideo.zoom");
              this._zoom = point;
            },
            get: function zoom() { // (void) -> Point
              notImplemented("StageVideo.zoom");
              return this._zoom;
            }
          },
          depth: {
            set: function depth(depth) { // (depth:int) -> void
              notImplemented("StageVideo.depth");
              this._depth = depth;
            },
            get: function depth() { // (void) -> int
              notImplemented("StageVideo.depth");
              return this._depth;
            }
          },
          videoWidth: {
            get: function videoWidth() { // (void) -> int
              notImplemented("StageVideo.videoWidth");
              return this._videoWidth;
            }
          },
          videoHeight: {
            get: function videoHeight() { // (void) -> int
              notImplemented("StageVideo.videoHeight");
              return this._videoHeight;
            }
          },
          colorSpaces: {
            get: function colorSpaces() { // (void) -> Vector
              notImplemented("StageVideo.colorSpaces");
              return this._colorSpaces;
            }
          }
        }
      },
    }
  };
}).call(this);
