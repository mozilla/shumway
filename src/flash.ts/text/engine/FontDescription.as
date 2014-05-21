/*
 * Copyright 2014 Mozilla Foundation
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

package flash.text.engine {

[native(cls='FontDescriptionClass')]
public final class FontDescription {
  public static native function isFontCompatible(fontName: String, fontWeight: String,
                                                 fontPosture: String): Boolean;
  public static native function isDeviceFontCompatible(fontName: String, fontWeight: String,
                                                       fontPosture: String): Boolean;
  public function FontDescription(fontName: String = "_serif", fontWeight: String = "normal",
                                  fontPosture: String = "normal", fontLookup: String = "device",
                                  renderingMode: String = "cff",
                                  cffHinting: String = "horizontalStem")
  {
    this.fontName = fontName;
    this.fontWeight = fontWeight;
    this.fontPosture = fontPosture;
    this.fontLookup = fontLookup;
    this.renderingMode = renderingMode;
    this.cffHinting = cffHinting;
  }
  public native function get renderingMode(): String;
  public native function set renderingMode(value: String): void;
  public native function get fontLookup(): String;
  public native function set fontLookup(value: String): void;
  public native function get fontName(): String;
  public native function set fontName(value: String): void;
  public native function get fontPosture(): String;
  public native function set fontPosture(value: String): void;
  public native function get fontWeight(): String;
  public native function set fontWeight(value: String): void;
  public native function get cffHinting(): String;
  public native function set cffHinting(value: String): void;
  public native function get locked(): Boolean;
  public native function set locked(value: Boolean): void;
  public function clone(): FontDescription {
    return new FontDescription(this.fontName, this.fontWeight, this.fontPosture, this.fontLookup,
                               this.renderingMode, this.cffHinting);
  }
}
}
