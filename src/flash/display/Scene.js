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

var SceneDefinition = (function () {
  return {
    // (name:String, labels:Array, numFrames:int)
    __class__: "flash.display.Scene",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
        }
      },
      script: {
        static: {
          // ...
        },
        instance: {
          name: {
            get: function name() { // (void) -> String
              notImplemented("Scene.name");
              return this._name;
            }
          },
          labels: {
            get: function labels() { // (void) -> Array
              notImplemented("Scene.labels");
              return this._labels;
            }
          },
          numFrames: {
            get: function numFrames() { // (void) -> int
              notImplemented("Scene.numFrames");
              return this._numFrames;
            }
          }
        }
      }
    }
  };
}).call(this);
