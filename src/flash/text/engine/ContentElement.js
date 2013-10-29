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

var ContentElementDefinition = (function () {
  return {
    // (elementFormat:ElementFormat = null, eventMirror:EventDispatcher = null, textRotation:String = "rotate0")
    __class__: "flash.text.engine.ContentElement",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
          textBlock: {
            get: function textBlock() { // (void) -> TextBlock
              notImplemented("ContentElement.textBlock");
              return this._textBlock;
            }
          },
          textBlockBeginIndex: {
            get: function textBlockBeginIndex() { // (void) -> int
              notImplemented("ContentElement.textBlockBeginIndex");
              return this._textBlockBeginIndex;
            }
          },
          elementFormat: {
            get: function elementFormat() { // (void) -> ElementFormat
              return this._elementFormat;
            },
            set: function elementFormat(value) { // (value:ElementFormat) -> void
              somewhatImplemented("ContentElement.elementFormat");
              this._elementFormat = value;
            }
          },
          eventMirror: {
            get: function eventMirror() { // (void) -> EventDispatcher
              return this._eventMirror;
            },
            set: function eventMirror(value) { // (value:EventDispatcher) -> void
              somewhatImplemented("ContentElement.eventMirror");
              this._eventMirror = value;
            }
          },
          groupElement: {
            get: function groupElement() { // (void) -> GroupElement
              notImplemented("ContentElement.groupElement");
              return this._groupElement;
            }
          },
          rawText: {
            get: function rawText() { // (void) -> String
              notImplemented("ContentElement.rawText");
              return this._rawText;
            }
          },
          text: {
            get: function text() { // (void) -> String
              notImplemented("ContentElement.text");
              return this._text;
            }
          },
          textRotation: {
            get: function textRotation() { // (void) -> String
              return this._textRotation;
            },
            set: function textRotation(value) { // (value:String) -> void
              somewhatImplemented("ContentElement.textRotation");
              this._textRotation = value;
            }
          }
        }
      }
    }
  };
}).call(this);
