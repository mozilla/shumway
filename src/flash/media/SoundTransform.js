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
    __glue__: {
      native: {
        static: {
        },
        instance: {
          volume: {
            get: function volume() { // (void) -> Number
              notImplemented("SoundTransform.volume");
              return this._volume;
            },
            set: function volume(volume) { // (volume:Number) -> void
              notImplemented("SoundTransform.volume");
              this._volume = volume;
            }
          },
          leftToLeft: {
            get: function leftToLeft() { // (void) -> Number
              notImplemented("SoundTransform.leftToLeft");
              return this._leftToLeft;
            },
            set: function leftToLeft(leftToLeft) { // (leftToLeft:Number) -> void
              notImplemented("SoundTransform.leftToLeft");
              this._leftToLeft = leftToLeft;
            }
          },
          leftToRight: {
            get: function leftToRight() { // (void) -> Number
              notImplemented("SoundTransform.leftToRight");
              return this._leftToRight;
            },
            set: function leftToRight(leftToRight) { // (leftToRight:Number) -> void
              notImplemented("SoundTransform.leftToRight");
              this._leftToRight = leftToRight;
            }
          },
          rightToRight: {
            get: function rightToRight() { // (void) -> Number
              notImplemented("SoundTransform.rightToRight");
              return this._rightToRight;
            },
            set: function rightToRight(rightToRight) { // (rightToRight:Number) -> void
              notImplemented("SoundTransform.rightToRight");
              this._rightToRight = rightToRight;
            }
          },
          rightToLeft: {
            get: function rightToLeft() { // (void) -> Number
              notImplemented("SoundTransform.rightToLeft");
              return this._rightToLeft;
            },
            set: function rightToLeft(rightToLeft) { // (rightToLeft:Number) -> void
              notImplemented("SoundTransform.rightToLeft");
              this._rightToLeft = rightToLeft;
            }
          }
        }
      },
    }
  };
}).call(this);
