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

var TextBlockDefinition = (function () {
  return {
    // (content:ContentElement = null, tabStops:Vector = null, textJustifier:TextJustifier = null, lineRotation:String = "rotate0", baselineZero:String = "roman", bidiLevel:int = 0, applyNonLinearFontScaling:Boolean = true, baselineFontDescription:FontDescription = null, baselineFontSize:Number = 12)
    __class__: "flash.text.engine.TextBlock",
    initialize: function () {
      this._firstLine = null;
      this._lastLine = null;
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
          getTextJustifier: function getTextJustifier() { // (void) -> TextJustifier
            return this._textJustifier;
          },
          setTextJustifier: function setTextJustifier(value) { // (value:TextJustifier) -> void
            somewhatImplemented("TextBlock.setTextJustifier");
            this._textJustifier = value;
          },
          getTabStops: function getTabStops() { // (void) -> Vector
            return this._tabStops;
          },
          setTabStops: function setTabStops(value) { // (value:Vector) -> void
            somewhatImplemented("TextBlock.setTabStops");
            this._tabStops = value;
          },
          findNextAtomBoundary: function findNextAtomBoundary(afterCharIndex) { // (afterCharIndex:int) -> int
            notImplemented("TextBlock.findNextAtomBoundary");
          },
          findPreviousAtomBoundary: function findPreviousAtomBoundary(beforeCharIndex) { // (beforeCharIndex:int) -> int
            notImplemented("TextBlock.findPreviousAtomBoundary");
          },
          findNextWordBoundary: function findNextWordBoundary(afterCharIndex) { // (afterCharIndex:int) -> int
            notImplemented("TextBlock.findNextWordBoundary");
          },
          findPreviousWordBoundary: function findPreviousWordBoundary(beforeCharIndex) { // (beforeCharIndex:int) -> int
            notImplemented("TextBlock.findPreviousWordBoundary");
          },
          getTextLineAtCharIndex: function getTextLineAtCharIndex(charIndex) { // (charIndex:int) -> TextLine
            notImplemented("TextBlock.getTextLineAtCharIndex");
          },
          DoCreateTextLine: function DoCreateTextLine(previousLine, width, lineOffset, fitSomething, reuseLine) { // (previousLine:TextLine, width:Number, lineOffset:Number = 0, fitSomething:Boolean = false, reuseLine:TextLine = null) -> TextLine
            somewhatImplemented("TextBlock.DoCreateTextLine");
            if (previousLine) {
              return null; // only first line
            }
            var textLine = new flash.text.engine.TextLine();
            textLine._textBlock = this;
            textLine._specifiedWidth = width;

            textLine._rawTextLength = 0;
            textLine._textWidth = 0;
            textLine._textHeight = 0;
            textLine._ascent = 0;
            textLine._descent = 0;
            textLine._unjustifiedTextWidth = 0;
            textLine._validity = 'valid';
            textLine._previousLine = null;
            textLine._nextLine = null;

            this._firstLine = textLine;
            this._lastLine = textLine;

            return textLine;
          },
          releaseLineCreationData: function releaseLineCreationData() { // (void) -> void
            notImplemented("TextBlock.releaseLineCreationData");
          },
          releaseLines: function releaseLines(firstLine, lastLine) { // (firstLine:TextLine, lastLine:TextLine) -> void
            notImplemented("TextBlock.releaseLines");
          },
          dump: function dump() { // (void) -> String
            notImplemented("TextBlock.dump");
          },
          applyNonLinearFontScaling: {
            get: function applyNonLinearFontScaling() { // (void) -> Boolean
              return this._applyNonLinearFontScaling;
            },
            set: function applyNonLinearFontScaling(value) { // (value:Boolean) -> void
              somewhatImplemented("TextBlock.applyNonLinearFontScaling");
              this._applyNonLinearFontScaling = value;
            }
          },
          baselineFontDescription: {
            get: function baselineFontDescription() { // (void) -> FontDescription
              return this._baselineFontDescription;
            },
            set: function baselineFontDescription(value) { // (value:FontDescription) -> void
              somewhatImplemented("TextBlock.baselineFontDescription");
              this._baselineFontDescription = value;
            }
          },
          baselineFontSize: {
            get: function baselineFontSize() { // (void) -> Number
              return this._baselineFontSize;
            },
            set: function baselineFontSize(value) { // (value:Number) -> void
              somewhatImplemented("TextBlock.baselineFontSize");
              this._baselineFontSize = value;
            }
          },
          baselineZero: {
            get: function baselineZero() { // (void) -> String
              return this._baselineZero;
            },
            set: function baselineZero(value) { // (value:String) -> void
              somewhatImplemented("TextBlock.baselineZero");
              this._baselineZero = value;
            }
          },
          content: {
            get: function content() { // (void) -> ContentElement
              return this._content;
            },
            set: function content(value) { // (value:ContentElement) -> void
              somewhatImplemented("TextBlock.content");
              this._content = value;
            }
          },
          bidiLevel: {
            get: function bidiLevel() { // (void) -> int
              return this._bidiLevel;
            },
            set: function bidiLevel(value) { // (value:int) -> void
              somewhatImplemented("TextBlock.bidiLevel");
              this._bidiLevel = value;
            }
          },
          firstInvalidLine: {
            get: function firstInvalidLine() { // (void) -> TextLine
              notImplemented("TextBlock.firstInvalidLine");
              return this._firstInvalidLine;
            }
          },
          firstLine: {
            get: function firstLine() { // (void) -> TextLine
              somewhatImplemented("TextBlock.firstLine");
              return this._firstLine;
            }
          },
          lastLine: {
            get: function lastLine() { // (void) -> TextLine
              somewhatImplemented("TextBlock.lastLine");
              return this._lastLine;
            }
          },
          textLineCreationResult: {
            get: function textLineCreationResult() { // (void) -> String
              notImplemented("TextBlock.textLineCreationResult");
              return this._textLineCreationResult;
            }
          },
          lineRotation: {
            get: function lineRotation() { // (void) -> String
              return this._lineRotation;
            },
            set: function lineRotation(value) { // (value:String) -> void
              somewhatImplemented("TextBlock.lineRotation");
              this._lineRotation = value;
            }
          }
        }
      }
    }
  };
}).call(this);
