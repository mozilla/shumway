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

var FontDescriptionDefinition = (function () {
  return {
    // (fontName:String = "_serif", fontWeight:String = "normal",
    //     fontPosture:String = "normal", fontLookup:String = "device",
    //     renderingMode:String = "cff", cffHinting:String = "horizontalStem")
    __class__: "flash.text.engine.FontDescription",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
          isFontCompatible: function isFontCompatible(fontName, fontWeight, fontPosture) {
            // (fontName:String, fontWeight:String, fontPosture:String) -> Boolean
            notImplemented("FontDescription.isFontCompatible");
          },
          isDeviceFontCompatible: function isDeviceFontCompatible(fontName, fontWeight, fontPosture) {
            // (fontName:String, fontWeight:String, fontPosture:String) -> Boolean
            notImplemented("FontDescription.isDeviceFontCompatible");
          }
        },
        instance: {
          renderingMode: {
            get: function renderingMode() { // (void) -> String
              notImplemented("FontDescription.renderingMode");
              return this._renderingMode;
            },
            set: function renderingMode(value) { // (value:String) -> void
              notImplemented("FontDescription.renderingMode");
              this._renderingMode = value;
            }
          },
          fontLookup: {
            get: function fontLookup() { // (void) -> String
              notImplemented("FontDescription.fontLookup");
              return this._fontLookup;
            },
            set: function fontLookup(value) { // (value:String) -> void
              notImplemented("FontDescription.fontLookup");
              this._fontLookup = value;
            }
          },
          fontName: {
            get: function fontName() { // (void) -> String
              notImplemented("FontDescription.fontName");
              return this._fontName;
            },
            set: function fontName(value) { // (value:String) -> void
              notImplemented("FontDescription.fontName");
              this._fontName = value;
            }
          },
          fontPosture: {
            get: function fontPosture() { // (void) -> String
              notImplemented("FontDescription.fontPosture");
              return this._fontPosture;
            },
            set: function fontPosture(value) { // (value:String) -> void
              notImplemented("FontDescription.fontPosture");
              this._fontPosture = value;
            }
          },
          fontWeight: {
            get: function fontWeight() { // (void) -> String
              notImplemented("FontDescription.fontWeight");
              return this._fontWeight;
            },
            set: function fontWeight(value) { // (value:String) -> void
              notImplemented("FontDescription.fontWeight");
              this._fontWeight = value;
            }
          },
          cffHinting: {
            get: function cffHinting() { // (void) -> String
              notImplemented("FontDescription.cffHinting");
              return this._cffHinting;
            },
            set: function cffHinting(value) { // (value:String) -> void
              notImplemented("FontDescription.cffHinting");
              this._cffHinting = value;
            }
          },
          locked: {
            get: function locked() { // (void) -> Boolean
              notImplemented("FontDescription.locked");
              return this._locked;
            },
            set: function locked(value) { // (value:Boolean) -> void
              notImplemented("FontDescription.locked");
              this._locked = value;
            }
          }
        }
      },
      script: {
        static: {
          // ...
        },
        instance: {
        }
      }
    }
  };
}).call(this);
