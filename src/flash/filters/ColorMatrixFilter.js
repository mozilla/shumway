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
/*global colorFilter */

var ColorMatrixFilterDefinition = (function () {
  return {
    __class__: "flash.filters.ColorMatrixFilter",
    initialize: function () {

    },
    _updateFilterBounds: function (bounds) {

    },
    __glue__: {
      native: {
        instance: {
          matrix: {
            get: function matrix() { return this._matrix; },
            set: function matrix(value) { this._matrix = value; }
          }
        }
      }
    }
  };
}).call(this);
