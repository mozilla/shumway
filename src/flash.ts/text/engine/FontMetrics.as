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
import flash.geom.Rectangle;

public final class FontMetrics {
  public function FontMetrics(emBox: Rectangle, strikethroughOffset: Number,
                              strikethroughThickness: Number, underlineOffset: Number,
                              underlineThickness: Number, subscriptOffset: Number,
                              subscriptScale: Number, superscriptOffset: Number,
                              superscriptScale: Number, lineGap: Number = 0)
  {
    this.emBox = emBox;
    this.strikethroughOffset = strikethroughOffset;
    this.strikethroughThickness = strikethroughThickness;
    this.underlineOffset = underlineOffset;
    this.underlineThickness = underlineThickness;
    this.subscriptOffset = subscriptOffset;
    this.subscriptScale = subscriptScale;
    this.superscriptOffset = superscriptOffset;
    this.superscriptScale = superscriptScale;
    this.lineGap = lineGap;
  }
  public var emBox: Rectangle;
  public var strikethroughOffset: Number;
  public var strikethroughThickness: Number;
  public var underlineOffset: Number;
  public var underlineThickness: Number;
  public var subscriptOffset: Number;
  public var subscriptScale: Number;
  public var superscriptOffset: Number;
  public var superscriptScale: Number;
  public var lineGap: Number;
}
}
