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

var MouseEventDefinition = (function () {
  return {
    // (type:String, bubbles:Boolean = true, cancelable:Boolean = false, localX:Number, localY:Number, relatedObject:InteractiveObject = null, ctrlKey:Boolean = false, altKey:Boolean = false, shiftKey:Boolean = false, buttonDown:Boolean = false, delta:int = 0)
    __class__: "flash.events.MouseEvent",
    initialize: function () {
      this._localX = NaN;
      this._localY = NaN;
    },
    __glue__: {
      native: {
        instance: {
          updateAfterEvent: function updateAfterEvent() { // (void) -> void
            //notImplemented("MouseEvent.updateAfterEvent");
          },
          getStageX: function getStageX() { // (void) -> Number
            if (this._target) {
              var m = this._target._getConcatenatedTransform();
              var x = m.a * this._localX + m.c * this._localY + m.tx;
              return x/20;
            }

            return this._localX/20;
          },
          getStageY: function getStageY() { // (void) -> Number
            if (this._target) {
              var m = this._target._getConcatenatedTransform();
              var y = m.d * this._localY + m.b * this._localX + m.ty;
              return y/20;
            }

            return this._localY/20;
          },
          localX: {
            get: function localX() { // (void) -> Number
              return this._localX/20;
            },
            set: function localX(value) { // (value:Number) -> void
              this._localX = value*20|0;
            }
          },
          localY: {
            get: function localY() { // (void) -> Number
              return this._localY/20;
            },
            set: function localY(value) { // (value:Number) -> void
              this._localY = value*20|0;
            }
          }
        }
      },
      script: { static: Glue.ALL }
    }
  };
}).call(this);
