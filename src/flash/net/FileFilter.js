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
var FileFilterDefinition = (function () {
  return {
    // (description:String, extension:String, macType:String = null)
    __class__: "flash.net.FileFilter",
    initialize: function () {
      this._description = null;
      this._extension = null;
      this._macType = null;
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
          description: {
            get: function description() { // (void) -> String
              return this._description;
            },
            set: function description(value) { // (value:String) -> void
              this._description = value;
            }
          },
          extension: {
            get: function extension() { // (void) -> String
              return this._extension;
            },
            set: function extension(value) { // (value:String) -> void
              this._extension = value;
            }
          },
          macType: {
            get: function macType() { // (void) -> String
              return this._macType;
            },
            set: function macType(value) { // (value:String) -> void
              this._macType = value;
            }
          }
        }
      }
    }
  };
}).call(this);
