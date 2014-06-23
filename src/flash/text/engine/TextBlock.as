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

public final class TextBlock {
  public function TextBlock(content: ContentElement = null, tabStops: Vector.<TabStop> = null,
                            textJustifier: TextJustifier = null, lineRotation: String = "rotate0",
                            baselineZero: String = "roman", bidiLevel: int = 0,
                            applyNonLinearFontScaling: Boolean = true,
                            baselineFontDescription: FontDescription = null,
                            baselineFontSize: Number = 12)
  {
    if (content) {
      this.content = content;
    }
    if (tabStops) {
      this.tabStops = tabStops;
    }
    if (textJustifier) {
      this.textJustifier = textJustifier;
    } else {
      this.textJustifier = TextJustifier.getJustifierForLocale("en");
    }
    this.lineRotation = lineRotation;
    if (baselineZero) {
      this.baselineZero = baselineZero;
    }
    this.bidiLevel = bidiLevel;
    this.applyNonLinearFontScaling = applyNonLinearFontScaling;
    if (baselineFontDescription) {
      this.baselineFontDescription = baselineFontDescription;
      this.baselineFontSize = baselineFontSize;
    }
  }
  public var userData:*;
  public native function get applyNonLinearFontScaling(): Boolean;
  public native function set applyNonLinearFontScaling(value: Boolean): void;
  public native function get baselineFontDescription(): FontDescription;
  public native function set baselineFontDescription(value: FontDescription): void;
  public native function get baselineFontSize(): Number;
  public native function set baselineFontSize(value: Number): void;
  public native function get baselineZero(): String;
  public native function set baselineZero(value: String): void;
  public native function get content(): ContentElement;
  public native function set content(value: ContentElement): void;
  public native function get bidiLevel(): int;
  public native function set bidiLevel(value: int): void;
  public native function get firstInvalidLine(): TextLine;
  public native function get firstLine(): TextLine;
  public native function get lastLine(): TextLine;
  public function get textJustifier(): TextJustifier {
    return getTextJustifier().clone();
  }
  public function set textJustifier(value: TextJustifier): void {
    if (value) {
      value = value.clone();
    }
    setTextJustifier(value);
  }
  public native function get textLineCreationResult(): String;
  public native function get lineRotation(): String;
  public native function set lineRotation(value: String): void;
  public function get tabStops(): Vector.<TabStop> {
    var myTabs: Vector.<TabStop> = getTabStops();

    if (!myTabs) {
      return null;
    }
    var retTabs: Vector.<TabStop> = new Vector.<TabStop>();
    for (var i: uint = 0; i < myTabs.length; i++) {
      retTabs.push(myTabs[i]);
    }
    return retTabs;
  }
  public function set tabStops(value: Vector.<TabStop>): void {
    if (!value) {
      setTabStops(null);
      return;
    }
    var myTabs: Vector.<TabStop> = new Vector.<TabStop>();
    for (var i: uint = 0; i < value.length; i++) {
      myTabs.push(value[i]);
    }
    setTabStops(myTabs);
  }
  public native function findNextAtomBoundary(afterCharIndex: int): int;
  public native function findPreviousAtomBoundary(beforeCharIndex: int): int;
  public native function findNextWordBoundary(afterCharIndex: int): int;
  public native function findPreviousWordBoundary(beforeCharIndex: int): int;
  public native function getTextLineAtCharIndex(charIndex: int): TextLine;
  public function createTextLine(previousLine: TextLine = null, width: Number = 1000000,
                                 lineOffset: Number = 0, fitSomething: Boolean = false): TextLine {
    if (!this.content) {
      return null;
    }
    if (previousLine &&
        (previousLine.validity !== TextLineValidity.VALID || previousLine.textBlock !== this))
    {
      Error.throwError(ArgumentError, 2004, "previousLine");
    }
    if (width < 0 && !fitSomething || width > TextLine.MAX_LINE_WIDTH) {
      Error.throwError(ArgumentError, 2004, "width");
    }
    if (width === 0 && !fitSomething) {
      return null;
    }

    return DoCreateTextLine(previousLine, width, lineOffset, fitSomething, null);
  }
  public function recreateTextLine(textLine: TextLine, previousLine: TextLine = null,
                                   width: Number = 1000000, lineOffset: Number = 0,
                                   fitSomething: Boolean = false): TextLine {
    if (!textLine) {
      Error.throwError(ArgumentError, 2004, "textLine");
    }
    if (previousLine &&
        (previousLine.validity !== TextLineValidity.VALID || previousLine.textBlock !== this ||
         previousLine === textLine))
    {
      Error.throwError(ArgumentError, 2004, "previousLine");
    }
    if (width < 0 && !fitSomething || width > TextLine.MAX_LINE_WIDTH) {
      Error.throwError(ArgumentError, 2004, "width");
    }
    textLine.userData = null;

    return DoCreateTextLine(previousLine, width, lineOffset, fitSomething, textLine);
  }
  public native function releaseLineCreationData(): void;
  public native function releaseLines(firstLine: TextLine, lastLine: TextLine): void;
  public native function dump(): String;
  private native function DoCreateTextLine(previousLine: TextLine, width: Number,
                                           lineOffset: Number = 0.0, fitSomething: Boolean = false,
                                           reuseLine: TextLine = null): TextLine;
  private native function getTabStops(): Vector.<TabStop>;
  private native function setTabStops(value: Vector.<TabStop>): void;
  private native function getTextJustifier(): TextJustifier;
  private native function setTextJustifier(value: TextJustifier): void;
}
}
