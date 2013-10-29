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

var GroupElementDefinition = (function () {
  return {
    // (elements:Vector = null, elementFormat:ElementFormat = null, eventMirror:EventDispatcher = null, textRotation:String = "rotate0")
    __class__: "flash.text.engine.GroupElement",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
          getElementAt: function getElementAt(index) { // (index:int) -> ContentElement
            notImplemented("GroupElement.getElementAt");
          },
          setElements: function setElements(value) { // (value:Vector) -> void
            somewhatImplemented("GroupElement.setElements");
            this._elements = value;
          },
          groupElements: function groupElements(beginIndex, endIndex) { // (beginIndex:int, endIndex:int) -> GroupElement
            notImplemented("GroupElement.groupElements");
          },
          ungroupElements: function ungroupElements(groupIndex) { // (groupIndex:int) -> void
            notImplemented("GroupElement.ungroupElements");
          },
          mergeTextElements: function mergeTextElements(beginIndex, endIndex) { // (beginIndex:int, endIndex:int) -> TextElement
            notImplemented("GroupElement.mergeTextElements");
          },
          splitTextElement: function splitTextElement(elementIndex, splitIndex) { // (elementIndex:int, splitIndex:int) -> TextElement
            notImplemented("GroupElement.splitTextElement");
          },
          replaceElements: function replaceElements(beginIndex, endIndex, newElements) { // (beginIndex:int, endIndex:int, newElements:Vector) -> Vector
            notImplemented("GroupElement.replaceElements");
          },
          getElementAtCharIndex: function getElementAtCharIndex(charIndex) { // (charIndex:int) -> ContentElement
            notImplemented("GroupElement.getElementAtCharIndex");
          },
          elementCount: {
            get: function elementCount() { // (void) -> int
              notImplemented("GroupElement.elementCount");
              return this._elementCount;
            }
          }
        }
      }
    }
  };
}).call(this);
