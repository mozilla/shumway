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

var SpaceJustifierDefinition = (function () {
  return {
    // (locale:String = "en", lineJustification:String = "unjustified", letterSpacing:Boolean = false)
    __class__: "flash.text.engine.SpaceJustifier",
    initialize: function () {
      this._letterSpacing = false;
      this._optimumSpacing = 1.0;
      this._minimumSpacing = 0.5;
      this._maximumSpacing = 1.5;
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
          cloneSpacing: function cloneSpacing(justifier) { // (justifier:SpaceJustifier) -> void
            somewhatImplemented("SpaceJustifier.cloneSpacing");
            justifier._optimumSpacing = this._optimumSpacing;
            justifier._minimumSpacing = this._minimumSpacing;
            justifier._maximumSpacing = this._maximumSpacing;
          },
          letterSpacing: {
            get: function letterSpacing() { // (void) -> Boolean
              return this._letterSpacing;
            },
            set: function letterSpacing(value) { // (value:Boolean) -> void
              somewhatImplemented("SpaceJustifier.letterSpacing");
              this._letterSpacing = value;
            }
          },
          minimumSpacing: {
            get: function minimumSpacing() { // (void) -> Number
              return this._minimumSpacing;
            },
            set: function minimumSpacing(value) { // (value:Number) -> void
              somewhatImplemented("SpaceJustifier.minimumSpacing");
              this._minimumSpacing = value;
            }
          },
          optimumSpacing: {
            get: function optimumSpacing() { // (void) -> Number
              return this._optimumSpacing;
            },
            set: function optimumSpacing(value) { // (value:Number) -> void
              somewhatImplemented("SpaceJustifier.optimumSpacing");
              this._optimumSpacing = value;
            }
          },
          maximumSpacing: {
            get: function maximumSpacing() { // (void) -> Number
              return this._maximumSpacing;
            },
            set: function maximumSpacing(value) { // (value:Number) -> void
              somewhatImplemented("SpaceJustifier.maximumSpacing");
              this._maximumSpacing = value;
            }
          }
        }
      }
    }
  };
}).call(this);
