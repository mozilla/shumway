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

var ElementFormatDefinition = (function () {
  return {
    // (fontDescription:FontDescription = null, fontSize:Number = 12, color:uint = 0, alpha:Number = 1, textRotation:String = "auto", dominantBaseline:String = "roman", alignmentBaseline:String = "useDominantBaseline", baselineShift:Number = 0, kerning:String = "on", trackingRight:Number = 0, trackingLeft:Number = 0, locale:String = "en", breakOpportunity:String = "auto", digitCase:String = "default", digitWidth:String = "default", ligatureLevel:String = "common", typographicCase:String = "default")
    __class__: "flash.text.engine.ElementFormat",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
          getFontMetrics: function getFontMetrics() { // (void) -> FontMetrics
            notImplemented("ElementFormat.getFontMetrics");
          },
          alignmentBaseline: {
            get: function alignmentBaseline() { // (void) -> String
              return this._alignmentBaseline;
            },
            set: function alignmentBaseline(alignmentBaseline) { // (alignmentBaseline:String) -> void
              somewhatImplemented("ElementFormat.alignmentBaseline");
              this._alignmentBaseline = alignmentBaseline;
            }
          },
          alpha: {
            get: function alpha() { // (void) -> Number
              return this._alpha;
            },
            set: function alpha(value) { // (value:Number) -> void
              somewhatImplemented("ElementFormat.alpha");
              this._alpha = value;
            }
          },
          baselineShift: {
            get: function baselineShift() { // (void) -> Number
              return this._baselineShift;
            },
            set: function baselineShift(value) { // (value:Number) -> void
              somewhatImplemented("ElementFormat.baselineShift");
              this._baselineShift = value;
            }
          },
          breakOpportunity: {
            get: function breakOpportunity() { // (void) -> String
              return this._breakOpportunity;
            },
            set: function breakOpportunity(opportunityType) { // (opportunityType:String) -> void
              somewhatImplemented("ElementFormat.breakOpportunity");
              this._breakOpportunity = opportunityType;
            }
          },
          color: {
            get: function color() { // (void) -> uint
              return this._color;
            },
            set: function color(value) { // (value:uint) -> void
              somewhatImplemented("ElementFormat.color");
              this._color = value;
            }
          },
          dominantBaseline: {
            get: function dominantBaseline() { // (void) -> String
              return this._dominantBaseline;
            },
            set: function dominantBaseline(dominantBaseline) { // (dominantBaseline:String) -> void
              somewhatImplemented("ElementFormat.dominantBaseline");
              this._dominantBaseline = dominantBaseline;
            }
          },
          fontDescription: {
            get: function fontDescription() { // (void) -> FontDescription
              return this._fontDescription;
            },
            set: function fontDescription(value) { // (value:FontDescription) -> void
              somewhatImplemented("ElementFormat.fontDescription");
              this._fontDescription = value;
            }
          },
          digitCase: {
            get: function digitCase() { // (void) -> String
              return this._digitCase;
            },
            set: function digitCase(digitCaseType) { // (digitCaseType:String) -> void
              somewhatImplemented("ElementFormat.digitCase");
              this._digitCase = digitCaseType;
            }
          },
          digitWidth: {
            get: function digitWidth() { // (void) -> String
              return this._digitWidth;
            },
            set: function digitWidth(digitWidthType) { // (digitWidthType:String) -> void
              somewhatImplemented("ElementFormat.digitWidth");
              this._digitWidth = digitWidthType;
            }
          },
          ligatureLevel: {
            get: function ligatureLevel() { // (void) -> String
              return this._ligatureLevel;
            },
            set: function ligatureLevel(ligatureLevelType) { // (ligatureLevelType:String) -> void
              somewhatImplemented("ElementFormat.ligatureLevel");
              this._ligatureLevel = ligatureLevelType;
            }
          },
          fontSize: {
            get: function fontSize() { // (void) -> Number
              return this._fontSize;
            },
            set: function fontSize(value) { // (value:Number) -> void
              somewhatImplemented("ElementFormat.fontSize");
              this._fontSize = value;
            }
          },
          kerning: {
            get: function kerning() { // (void) -> String
              return this._kerning;
            },
            set: function kerning(value) { // (value:String) -> void
              somewhatImplemented("ElementFormat.kerning");
              this._kerning = value;
            }
          },
          locale: {
            get: function locale() { // (void) -> String
              return this._locale;
            },
            set: function locale(value) { // (value:String) -> void
              somewhatImplemented("ElementFormat.locale");
              this._locale = value;
            }
          },
          textRotation: {
            get: function textRotation() { // (void) -> String
              return this._textRotation;
            },
            set: function textRotation(value) { // (value:String) -> void
              somewhatImplemented("ElementFormat.textRotation");
              this._textRotation = value;
            }
          },
          trackingRight: {
            get: function trackingRight() { // (void) -> Number
              return this._trackingRight;
            },
            set: function trackingRight(value) { // (value:Number) -> void
              somewhatImplemented("ElementFormat.trackingRight");
              this._trackingRight = value;
            }
          },
          trackingLeft: {
            get: function trackingLeft() { // (void) -> Number
              return this._trackingLeft;
            },
            set: function trackingLeft(value) { // (value:Number) -> void
              somewhatImplemented("ElementFormat.trackingLeft");
              this._trackingLeft = value;
            }
          },
          typographicCase: {
            get: function typographicCase() { // (void) -> String
              return this._typographicCase;
            },
            set: function typographicCase(typographicCaseType) { // (typographicCaseType:String) -> void
              somewhatImplemented("ElementFormat.typographicCase");
              this._typographicCase = typographicCaseType;
            }
          },
          locked: {
            get: function locked() { // (void) -> Boolean
              notImplemented("ElementFormat.locked");
              return this._locked;
            },
            set: function locked(value) { // (value:Boolean) -> void
              notImplemented("ElementFormat.locked");
              this._locked = value;
            }
          }
        }
      }
    }
  };
}).call(this);
