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

var ShaderDefinition = (function () {
  return {
    // (code:ByteArray = null)
    __class__: "flash.display.Shader",
    initialize: function () {
      this._data = null;
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
          data: {
            get: function data() { // (void) -> ShaderData
              return this._data;
            },
            set: function data(p) { // (p:ShaderData) -> void
              this._data = p;
            }
          },
          precisionHint: {
            get: function precisionHint() { // (void) -> String
              return this._precisionHint;
            },
            set: function precisionHint(p) { // (p:String) -> void
              this._precisionHint = p;
            }
          }
        }
      },
      script: {
        instance: Glue.ALL
      }
    }
  };
}).call(this);
