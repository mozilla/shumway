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
/*global Counter */
var EventDefinition = (function () {
  return {
    // (type:String, bubbles:Boolean = false, cancelable:Boolean = false)
    __class__: "flash.events.Event",
    initialize: function () {
      this._stopPropagation = false;
      this._stopImmediatePropagation = false;
      this._isDefaultPrevented = false;
      this._target = null;
      this._currentTarget = null;
      this._eventPhase = 2;
    },
    __glue__: {
      native: {
        instance: {
          ctor: function ctor(type, bubbles, cancelable) { // (type:String, bubbles:Boolean, cancelable:Boolean) -> void
            Counter.count("Event: " + type);

            this._type = type;
            this._bubbles = bubbles;
            this._cancelable = cancelable;

            this._handlerName = 'on' + type[0].toUpperCase() + type.substr(1);
          },
          stopPropagation: function stopPropagation() { // (void) -> void
            this._stopPropagation = true;
          },
          stopImmediatePropagation: function stopImmediatePropagation() { // (void) -> void
            this._stopImmediatePropagation = this._stopPropagation = true;
          },
          preventDefault: function preventDefault() { // (void) -> void
            if (this._cancelable)
              this._isDefaultPrevented = true;
          },
          isDefaultPrevented: function isDefaultPrevented() { // (void) -> Boolean
            return this._isDefaultPrevented;
          },
          type: {
            get: function type() { // (void) -> String
              return this._type;
            }
          },
          bubbles: {
            get: function bubbles() { // (void) -> Boolean
              return this._bubbles;
            }
          },
          cancelable: {
            get: function cancelable() { // (void) -> Boolean
              return this._cancelable;
            }
          },
          target: {
            get: function target() { // (void) -> Object
              return this._target;
            }
          },
          currentTarget: {
            get: function currentTarget() { // (void) -> Object
              return this._currentTarget;
            }
          },
          eventPhase: {
            get: function eventPhase() { // (void) -> uint
              return this._eventPhase;
            }
          }
        }
      },
      script: {
        static: Glue.ALL,
        instance: {
          clone: 'public clone'
        }
      }
    }
  };
}).call(this);
