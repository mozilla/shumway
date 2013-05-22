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

var KeyboardEventDefinition = (function () {
  return {
    // (type:String, bubbles:Boolean = true, cancelable:Boolean = false, charCodeValue:uint = 0, keyCodeValue:uint = 0, keyLocationValue:uint = 0, ctrlKeyValue:Boolean = false, altKeyValue:Boolean = false, shiftKeyValue:Boolean = false)
    __class__: "flash.events.KeyboardEvent",
    __glue__: {
      native: {
        instance: {
          updateAfterEvent: function updateAfterEvent() { // (void) -> void
            notImplemented("KeyboardEvent.updateAfterEvent");
          },
          charCode: {
            get: function charCode() { // (void) -> uint
              return this._charCode;
            },
            set: function charCode(value) { // (value:uint) -> void
              this._charCode = value;
            }
          },
          ctrlKey: {
            get: function ctrlKey() { // (void) -> Boolean
              return this._ctrlKey;
            },
            set: function ctrlKey(value) { // (value:Boolean) -> void
              this._ctrlKey = value;
            }
          },
          altKey: {
            get: function altKey() { // (void) -> Boolean
              return this._altKey;
            },
            set: function altKey(value) { // (value:Boolean) -> void
              this._altKey = value;
            }
          },
          shiftKey: {
            get: function shiftKey() { // (void) -> Boolean
              return this._shiftKey;
            },
            set: function shiftKey(value) { // (value:Boolean) -> void
              this._shiftKey = value;
            }
          }
        }
      },
      script: {
        static: Glue.ALL,
        instance: {
          keyCode: 'public keyCode'
        }
      }
    }
  };
}).call(this);
