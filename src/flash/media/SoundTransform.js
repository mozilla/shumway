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

var SoundTransformDefinition = (function () {
  return {
    // (vol:Number = 1, panning:Number = 0)
    __class__: "flash.media.SoundTransform",
    initialize: function () {
    },
    _updateTransform: function () {
      somewhatImplemented("SoundTransform._updateTransform");
      // TODO dispatch updates to the current audio destinations
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
          volume: {
            get: function volume() { // (void) -> Number
              return this._volume;
            },
            set: function volume(volume) { // (volume:Number) -> void
              this._volume = volume;
              this._updateTransform();
            }
          },
          leftToLeft: {
            get: function leftToLeft() { // (void) -> Number
              return this._leftToLeft;
            },
            set: function leftToLeft(leftToLeft) { // (leftToLeft:Number) -> void
              this._leftToLeft = leftToLeft;
              this._updateTransform();
            }
          },
          leftToRight: {
            get: function leftToRight() { // (void) -> Number
              return this._leftToRight;
            },
            set: function leftToRight(leftToRight) { // (leftToRight:Number) -> void
              this._leftToRight = leftToRight;
              this._updateTransform();
            }
          },
          rightToRight: {
            get: function rightToRight() { // (void) -> Number
              return this._rightToRight;
            },
            set: function rightToRight(rightToRight) { // (rightToRight:Number) -> void
              this._rightToRight = rightToRight;
              this._updateTransform();
            }
          },
          rightToLeft: {
            get: function rightToLeft() { // (void) -> Number
              return this._rightToLeft;
            },
            set: function rightToLeft(rightToLeft) { // (rightToLeft:Number) -> void
              this._rightToLeft = rightToLeft;
              this._updateTransform();
            }
          }
        }
      },
    }
  };
}).call(this);
