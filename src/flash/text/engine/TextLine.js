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

var TextLineDefinition = (function () {
  return {
    // ()
    __class__: "flash.text.engine.TextLine",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
          getAtomIndexAtPoint: function getAtomIndexAtPoint(stageX, stageY) { // (stageX:Number, stageY:Number) -> int
            notImplemented("TextLine.getAtomIndexAtPoint");
          },
          getAtomIndexAtCharIndex: function getAtomIndexAtCharIndex(charIndex) { // (charIndex:int) -> int
            notImplemented("TextLine.getAtomIndexAtCharIndex");
          },
          getAtomBounds: function getAtomBounds(atomIndex) { // (atomIndex:int) -> Rectangle
            notImplemented("TextLine.getAtomBounds");
          },
          getAtomBidiLevel: function getAtomBidiLevel(atomIndex) { // (atomIndex:int) -> int
            notImplemented("TextLine.getAtomBidiLevel");
          },
          getAtomTextRotation: function getAtomTextRotation(atomIndex) { // (atomIndex:int) -> String
            notImplemented("TextLine.getAtomTextRotation");
          },
          getAtomTextBlockBeginIndex: function getAtomTextBlockBeginIndex(atomIndex) { // (atomIndex:int) -> int
            notImplemented("TextLine.getAtomTextBlockBeginIndex");
          },
          getAtomTextBlockEndIndex: function getAtomTextBlockEndIndex(atomIndex) { // (atomIndex:int) -> int
            notImplemented("TextLine.getAtomTextBlockEndIndex");
          },
          getAtomCenter: function getAtomCenter(atomIndex) { // (atomIndex:int) -> Number
            notImplemented("TextLine.getAtomCenter");
          },
          getAtomWordBoundaryOnLeft: function getAtomWordBoundaryOnLeft(atomIndex) { // (atomIndex:int) -> Boolean
            notImplemented("TextLine.getAtomWordBoundaryOnLeft");
          },
          getAtomGraphic: function getAtomGraphic(atomIndex) { // (atomIndex:int) -> DisplayObject
            notImplemented("TextLine.getAtomGraphic");
          },
          getBaselinePosition: function getBaselinePosition(baseline) { // (baseline:String) -> Number
            notImplemented("TextLine.getBaselinePosition");
          },
          dump: function dump() { // (void) -> String
            notImplemented("TextLine.dump");
          },
          textBlock: {
            get: function textBlock() { // (void) -> TextBlock
              notImplemented("TextLine.textBlock");
              return this._textBlock;
            }
          },
          hasGraphicElement: {
            get: function hasGraphicElement() { // (void) -> Boolean
              notImplemented("TextLine.hasGraphicElement");
              return this._hasGraphicElement;
            }
          },
          hasTabs: {
            get: function hasTabs() { // (void) -> Boolean
              notImplemented("TextLine.hasTabs");
              return this._hasTabs;
            }
          },
          nextLine: {
            get: function nextLine() { // (void) -> TextLine
              somewhatImplemented("TextLine.nextLine");
              return this._nextLine;
            }
          },
          previousLine: {
            get: function previousLine() { // (void) -> TextLine
              somewhatImplemented("TextLine.previousLine");
              return this._previousLine;
            }
          },
          ascent: {
            get: function ascent() { // (void) -> Number
              somewhatImplemented("TextLine.ascent");
              return this._ascent;
            }
          },
          descent: {
            get: function descent() { // (void) -> Number
              somewhatImplemented("TextLine.descent");
              return this._descent;
            }
          },
          textHeight: {
            get: function textHeight() { // (void) -> Number
              somewhatImplemented("TextLine.textHeight");
              return this._textHeight;
            }
          },
          textWidth: {
            get: function textWidth() { // (void) -> Number
              somewhatImplemented("TextLine.textWidth");
              return this._textWidth;
            }
          },
          totalAscent: {
            get: function totalAscent() { // (void) -> Number
              notImplemented("TextLine.totalAscent");
              return this._totalAscent;
            }
          },
          totalDescent: {
            get: function totalDescent() { // (void) -> Number
              notImplemented("TextLine.totalDescent");
              return this._totalDescent;
            }
          },
          totalHeight: {
            get: function totalHeight() { // (void) -> Number
              notImplemented("TextLine.totalHeight");
              return this._totalHeight;
            }
          },
          textBlockBeginIndex: {
            get: function textBlockBeginIndex() { // (void) -> int
              notImplemented("TextLine.textBlockBeginIndex");
              return this._textBlockBeginIndex;
            }
          },
          rawTextLength: {
            get: function rawTextLength() { // (void) -> int
              somewhatImplemented("TextLine.rawTextLength");
              return this._rawTextLength;
            }
          },
          specifiedWidth: {
            get: function specifiedWidth() { // (void) -> Number
              somewhatImplemented("TextLine.specifiedWidth");
              return this._specifiedWidth;
            }
          },
          unjustifiedTextWidth: {
            get: function unjustifiedTextWidth() { // (void) -> Number
              somewhatImplemented("TextLine.unjustifiedTextWidth");
              return this._unjustifiedTextWidth;
            }
          },
          validity: {
            get: function validity() { // (void) -> String
              return this._validity;
            },
            set: function validity(value) { // (value:String) -> void
              somewhatImplemented("TextLine.validity");
              this._validity = value;
            }
          },
          atomCount: {
            get: function atomCount() { // (void) -> int
              notImplemented("TextLine.atomCount");
              return this._atomCount;
            }
          },
          mirrorRegions: {
            get: function mirrorRegions() { // (void) -> Vector
              notImplemented("TextLine.mirrorRegions");
              return this._mirrorRegions;
            }
          }
        }
      }
    }
  };
}).call(this);
