/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2014 Mozilla Foundation
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
var MouseCursorDataDefinition = (function () {
  return {
    // ()
    __class__: "flash.ui.MouseCursorData",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
          data: {
            get: function data() { // (void) -> Vector
              notImplemented("MouseCursorData.data");
              return this._data;
            },
            set: function data(data) { // (data:Vector) -> void
              notImplemented("MouseCursorData.data");
              this._data = data;
            }
          },
          hotSpot: {
            get: function hotSpot() { // (void) -> Point
              notImplemented("MouseCursorData.hotSpot");
              return this._hotSpot;
            },
            set: function hotSpot(data) { // (data:Point) -> void
              notImplemented("MouseCursorData.hotSpot");
              this._hotSpot = data;
            }
          },
          frameRate: {
            get: function frameRate() { // (void) -> Number
              notImplemented("MouseCursorData.frameRate");
              return this._frameRate;
            },
            set: function frameRate(data) { // (data:Number) -> void
              notImplemented("MouseCursorData.frameRate");
              this._frameRate = data;
            }
          }
        }
      }
    }
  };
}).call(this);
