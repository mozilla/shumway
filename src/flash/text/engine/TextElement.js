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

var TextElementDefinition = (function () {
  return {
    // (text:String = null, elementFormat:ElementFormat = null, eventMirror:EventDispatcher = null, textRotation:String = "rotate0")
    __class__: "flash.text.engine.TextElement",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
          replaceText: function replaceText(beginIndex, endIndex, newText) { // (beginIndex:int, endIndex:int, newText:String) -> void
            somewhatImplemented("TextElement.replaceText");
            var text = this._text || '';
            this._text = text.slice(0, beginIndex) + newText + text.slice(endIndex);
          },
          text: {
            set: function text(value) { // (value:String) -> void
              somewhatImplemented("TextElement.text");
              this._text = value;
            }
          }
        }
      }
    }
  };
}).call(this);
