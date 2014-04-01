/**
 * Copyright 2013 Mozilla Foundation
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations undxr the License.
 */
// Class: TextField
module Shumway.AVM2.AS.flash.text {
  import notImplemented = Shumway.Debug.notImplemented;
  export class TextField extends flash.display.InteractiveObject {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.text.TextField");
    }
    // Static   JS -> AS Bindings
    static richTextFields: any [];
    // Static   AS -> JS Bindings
    static isFontCompatible(fontName: string, fontStyle: string): boolean {
      fontName = "" + fontName; fontStyle = "" + fontStyle;
      notImplemented("public flash.text.TextField::static isFontCompatible"); return;
    }
    // Instance JS -> AS Bindings
    selectedText: string;
    appendText: (newText: string) => void;
    copyRichText: () => string;
    getXMLText: (beginIndex: number /*int*/ = 0, endIndex: number /*int*/ = 2147483647) => string;
    insertXMLText: (beginIndex: number /*int*/, endIndex: number /*int*/, richText: string, pasting: boolean = false) => void;
    pasteRichText: (richText: string) => boolean;
    // Instance AS -> JS Bindings
    get alwaysShowSelection(): boolean {
      notImplemented("public flash.text.TextField::get alwaysShowSelection"); return;
    }
    set alwaysShowSelection(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.TextField::set alwaysShowSelection"); return;
    }
    get antiAliasType(): string {
      notImplemented("public flash.text.TextField::get antiAliasType"); return;
    }
    set antiAliasType(antiAliasType: string) {
      antiAliasType = "" + antiAliasType;
      notImplemented("public flash.text.TextField::set antiAliasType"); return;
    }
    get autoSize(): string {
      notImplemented("public flash.text.TextField::get autoSize"); return;
    }
    set autoSize(value: string) {
      value = "" + value;
      notImplemented("public flash.text.TextField::set autoSize"); return;
    }
    get background(): boolean {
      notImplemented("public flash.text.TextField::get background"); return;
    }
    set background(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.TextField::set background"); return;
    }
    get backgroundColor(): number /*uint*/ {
      notImplemented("public flash.text.TextField::get backgroundColor"); return;
    }
    set backgroundColor(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.text.TextField::set backgroundColor"); return;
    }
    get border(): boolean {
      notImplemented("public flash.text.TextField::get border"); return;
    }
    set border(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.TextField::set border"); return;
    }
    get borderColor(): number /*uint*/ {
      notImplemented("public flash.text.TextField::get borderColor"); return;
    }
    set borderColor(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.text.TextField::set borderColor"); return;
    }
    get bottomScrollV(): number /*int*/ {
      notImplemented("public flash.text.TextField::get bottomScrollV"); return;
    }
    get caretIndex(): number /*int*/ {
      notImplemented("public flash.text.TextField::get caretIndex"); return;
    }
    get condenseWhite(): boolean {
      notImplemented("public flash.text.TextField::get condenseWhite"); return;
    }
    set condenseWhite(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.TextField::set condenseWhite"); return;
    }
    get defaultTextFormat(): flash.text.TextFormat {
      notImplemented("public flash.text.TextField::get defaultTextFormat"); return;
    }
    set defaultTextFormat(format: flash.text.TextFormat) {
      format = format;
      notImplemented("public flash.text.TextField::set defaultTextFormat"); return;
    }
    get embedFonts(): boolean {
      notImplemented("public flash.text.TextField::get embedFonts"); return;
    }
    set embedFonts(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.TextField::set embedFonts"); return;
    }
    get gridFitType(): string {
      notImplemented("public flash.text.TextField::get gridFitType"); return;
    }
    set gridFitType(gridFitType: string) {
      gridFitType = "" + gridFitType;
      notImplemented("public flash.text.TextField::set gridFitType"); return;
    }
    get htmlText(): string {
      notImplemented("public flash.text.TextField::get htmlText"); return;
    }
    set htmlText(value: string) {
      value = "" + value;
      notImplemented("public flash.text.TextField::set htmlText"); return;
    }
    get length(): number /*int*/ {
      notImplemented("public flash.text.TextField::get length"); return;
    }
    get textInteractionMode(): string {
      notImplemented("public flash.text.TextField::get textInteractionMode"); return;
    }
    get maxChars(): number /*int*/ {
      notImplemented("public flash.text.TextField::get maxChars"); return;
    }
    set maxChars(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.text.TextField::set maxChars"); return;
    }
    get maxScrollH(): number /*int*/ {
      notImplemented("public flash.text.TextField::get maxScrollH"); return;
    }
    get maxScrollV(): number /*int*/ {
      notImplemented("public flash.text.TextField::get maxScrollV"); return;
    }
    get mouseWheelEnabled(): boolean {
      notImplemented("public flash.text.TextField::get mouseWheelEnabled"); return;
    }
    set mouseWheelEnabled(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.TextField::set mouseWheelEnabled"); return;
    }
    get multiline(): boolean {
      notImplemented("public flash.text.TextField::get multiline"); return;
    }
    set multiline(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.TextField::set multiline"); return;
    }
    get numLines(): number /*int*/ {
      notImplemented("public flash.text.TextField::get numLines"); return;
    }
    get displayAsPassword(): boolean {
      notImplemented("public flash.text.TextField::get displayAsPassword"); return;
    }
    set displayAsPassword(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.TextField::set displayAsPassword"); return;
    }
    get restrict(): string {
      notImplemented("public flash.text.TextField::get restrict"); return;
    }
    set restrict(value: string) {
      value = "" + value;
      notImplemented("public flash.text.TextField::set restrict"); return;
    }
    get scrollH(): number /*int*/ {
      notImplemented("public flash.text.TextField::get scrollH"); return;
    }
    set scrollH(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.text.TextField::set scrollH"); return;
    }
    get scrollV(): number /*int*/ {
      notImplemented("public flash.text.TextField::get scrollV"); return;
    }
    set scrollV(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.text.TextField::set scrollV"); return;
    }
    get selectable(): boolean {
      notImplemented("public flash.text.TextField::get selectable"); return;
    }
    set selectable(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.TextField::set selectable"); return;
    }
    get selectionBeginIndex(): number /*int*/ {
      notImplemented("public flash.text.TextField::get selectionBeginIndex"); return;
    }
    get selectionEndIndex(): number /*int*/ {
      notImplemented("public flash.text.TextField::get selectionEndIndex"); return;
    }
    get sharpness(): number {
      notImplemented("public flash.text.TextField::get sharpness"); return;
    }
    set sharpness(value: number) {
      value = +value;
      notImplemented("public flash.text.TextField::set sharpness"); return;
    }
    get styleSheet(): flash.text.StyleSheet {
      notImplemented("public flash.text.TextField::get styleSheet"); return;
    }
    set styleSheet(value: flash.text.StyleSheet) {
      value = value;
      notImplemented("public flash.text.TextField::set styleSheet"); return;
    }
    get text(): string {
      notImplemented("public flash.text.TextField::get text"); return;
    }
    set text(value: string) {
      value = "" + value;
      notImplemented("public flash.text.TextField::set text"); return;
    }
    get textColor(): number /*uint*/ {
      notImplemented("public flash.text.TextField::get textColor"); return;
    }
    set textColor(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.text.TextField::set textColor"); return;
    }
    get textHeight(): number {
      notImplemented("public flash.text.TextField::get textHeight"); return;
    }
    get textWidth(): number {
      notImplemented("public flash.text.TextField::get textWidth"); return;
    }
    get thickness(): number {
      notImplemented("public flash.text.TextField::get thickness"); return;
    }
    set thickness(value: number) {
      value = +value;
      notImplemented("public flash.text.TextField::set thickness"); return;
    }
    get type(): string {
      notImplemented("public flash.text.TextField::get type"); return;
    }
    set type(value: string) {
      value = "" + value;
      notImplemented("public flash.text.TextField::set type"); return;
    }
    get wordWrap(): boolean {
      notImplemented("public flash.text.TextField::get wordWrap"); return;
    }
    set wordWrap(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.TextField::set wordWrap"); return;
    }
    getCharBoundaries(charIndex: number /*int*/): flash.geom.Rectangle {
      charIndex = charIndex | 0;
      notImplemented("public flash.text.TextField::getCharBoundaries"); return;
    }
    getCharIndexAtPoint(x: number, y: number): number /*int*/ {
      x = +x; y = +y;
      notImplemented("public flash.text.TextField::getCharIndexAtPoint"); return;
    }
    getCharIndexNearestPoint(x: number, y: number): number /*int*/ {
      x = +x; y = +y;
      notImplemented("public flash.text.TextField::getCharIndexNearestPoint"); return;
    }
    getFirstCharInParagraph(charIndex: number /*int*/): number /*int*/ {
      charIndex = charIndex | 0;
      notImplemented("public flash.text.TextField::getFirstCharInParagraph"); return;
    }
    getLineIndexAtPoint(x: number, y: number): number /*int*/ {
      x = +x; y = +y;
      notImplemented("public flash.text.TextField::getLineIndexAtPoint"); return;
    }
    getLineIndexOfChar(charIndex: number /*int*/): number /*int*/ {
      charIndex = charIndex | 0;
      notImplemented("public flash.text.TextField::getLineIndexOfChar"); return;
    }
    getLineLength(lineIndex: number /*int*/): number /*int*/ {
      lineIndex = lineIndex | 0;
      notImplemented("public flash.text.TextField::getLineLength"); return;
    }
    getLineMetrics(lineIndex: number /*int*/): flash.text.TextLineMetrics {
      lineIndex = lineIndex | 0;
      notImplemented("public flash.text.TextField::getLineMetrics"); return;
    }
    getLineOffset(lineIndex: number /*int*/): number /*int*/ {
      lineIndex = lineIndex | 0;
      notImplemented("public flash.text.TextField::getLineOffset"); return;
    }
    getLineText(lineIndex: number /*int*/): string {
      lineIndex = lineIndex | 0;
      notImplemented("public flash.text.TextField::getLineText"); return;
    }
    getParagraphLength(charIndex: number /*int*/): number /*int*/ {
      charIndex = charIndex | 0;
      notImplemented("public flash.text.TextField::getParagraphLength"); return;
    }
    getTextFormat(beginIndex: number /*int*/ = -1, endIndex: number /*int*/ = -1): flash.text.TextFormat {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0;
      notImplemented("public flash.text.TextField::getTextFormat"); return;
    }
    getTextRuns(beginIndex: number /*int*/ = 0, endIndex: number /*int*/ = 2147483647): any [] {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0;
      notImplemented("public flash.text.TextField::getTextRuns"); return;
    }
    getRawText(): string {
      notImplemented("public flash.text.TextField::getRawText"); return;
    }
    replaceSelectedText(value: string): void {
      value = "" + value;
      notImplemented("public flash.text.TextField::replaceSelectedText"); return;
    }
    replaceText(beginIndex: number /*int*/, endIndex: number /*int*/, newText: string): void {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0; newText = "" + newText;
      notImplemented("public flash.text.TextField::replaceText"); return;
    }
    setSelection(beginIndex: number /*int*/, endIndex: number /*int*/): void {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0;
      notImplemented("public flash.text.TextField::setSelection"); return;
    }
    setTextFormat(format: flash.text.TextFormat, beginIndex: number /*int*/ = -1, endIndex: number /*int*/ = -1): void {
      format = format; beginIndex = beginIndex | 0; endIndex = endIndex | 0;
      notImplemented("public flash.text.TextField::setTextFormat"); return;
    }
    getImageReference(id: string): flash.display.DisplayObject {
      id = "" + id;
      notImplemented("public flash.text.TextField::getImageReference"); return;
    }
    get useRichTextClipboard(): boolean {
      notImplemented("public flash.text.TextField::get useRichTextClipboard"); return;
    }
    set useRichTextClipboard(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.TextField::set useRichTextClipboard"); return;
    }
  }
}
