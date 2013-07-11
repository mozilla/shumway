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
    __glue__: {
      native: {
        instance: {
          updateAfterEvent: function updateAfterEvent() { // (void) -> void
            //notImplemented("MouseEvent.updateAfterEvent");
          },
          getStageX: function getStageX() { // (void) -> Number
            return this._stageX;
          },
          getStageY: function getStageY() { // (void) -> Number
            return this._stageY;
          },
          localX: {
            get: function localX() { // (void) -> Number
              return this._localX;
            },
            set: function localX(value) { // (value:Number) -> void
              this._localX = value;
            }
          },
          localY: {
            get: function localY() { // (void) -> Number
              return this._localY;
            },
            set: function localY(value) { // (value:Number) -> void
              this._localY = value;
            }
          }
        }
      },
      script: { static: Glue.ALL }
    }
  };
}).call(this);
