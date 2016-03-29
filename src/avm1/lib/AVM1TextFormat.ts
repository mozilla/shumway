/**
 * Copyright 2014 Mozilla Foundation
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
 * limitations under the License.
 */

///<reference path='../references.ts' />

module Shumway.AVM1.Lib {
  import flash = Shumway.AVMX.AS.flash;

  export class AVM1TextFormat extends AVM1Object implements IHasAS3ObjectReference {
    static createAVM1Class(context: AVM1Context): AVM1Object {
      var members = ['align#', 'blockIndent#', 'bold#', 'bullet#', 'color#', 'font#',
                     'getTextExtent', 'indent#', 'italic#', 'kerning#', 'leading#',
                     'leftMargin#', 'letterSpacing#', 'rightMargin#', 'size#', 'tabStops#',
                     'target#', 'underline#', 'url#'];
      var wrapped = wrapAVM1NativeClass(context, true, AVM1TextFormat,
        [],
        members,
        null, AVM1TextFormat.prototype.avm1Constructor);
      var proto = wrapped.alGetPrototypeProperty();
      members.forEach((x) => {
         if (x[x.length - 1] === '#') {
           x = x.slice(0, -1);
         }
         var p = proto.alGetOwnProperty(x);
         p.flags &= ~AVM1PropertyFlags.DONT_ENUM;
         proto.alSetOwnProperty(x, p);
       });
      return wrapped;
    }

    static createFromNative(context: AVM1Context, as3Object: flash.text.TextFormat): AVM1Object {
      var TextFormat = context.globals.TextFormat;
      var obj = new AVM1TextFormat(context);
      obj.alPrototype = TextFormat.alGetPrototypeProperty();
      (<AVM1TextFormat>obj)._as3Object = as3Object;
      return obj;
    }

    _as3Object: any; // TODO flash.text.TextFormat;

    public avm1Constructor(font?: string, size?: number, color?: number, bold?: boolean,
                italic?: boolean, underline?: boolean, url?: string, target?: string,
                align?: string, leftMargin?: number, rightMargin?: number,
                indent?: number, leading?: number) {
      var context = this.context;
      font = isNullOrUndefined(font) ? null : alToString(context, font);
      size = isNullOrUndefined(size) ? null : alToNumber(context, size);
      color = isNullOrUndefined(color) ? null : alToNumber(context, color);
      bold = isNullOrUndefined(bold) ? null : alToBoolean(context, bold);
      italic = isNullOrUndefined(italic) ? null : alToBoolean(context, italic);
      underline = isNullOrUndefined(underline) ? null : alToBoolean(context, underline);
      url = isNullOrUndefined(url) ? null : alToString(context, url);
      target = isNullOrUndefined(target) ? null : alToString(context, target);
      align = isNullOrUndefined(align) ? null : alToString(context, align);
      leftMargin = isNullOrUndefined(leftMargin) ? null : alToNumber(context, leftMargin);
      rightMargin = isNullOrUndefined(rightMargin) ? null : alToNumber(context, rightMargin);
      indent = isNullOrUndefined(indent) ? null : alToNumber(context, indent);
      leading = isNullOrUndefined(leading) ? null : alToNumber(context, leading);
      var as3Object = new this.context.sec.flash.text.TextFormat(
        font, size, color, bold, italic, underline, url, target,
        align, leftMargin, rightMargin, indent, leading);
      this._as3Object = as3Object;
    }

    private static _measureTextField: flash.text.TextField; // REDUX security domain

    static alInitStatic(context: AVM1Context): void {
      // See _measureTextField usage in the getTextExtent() below.
      var measureTextField = new context.sec.flash.text.TextField();
      measureTextField.multiline = true;
      this._measureTextField = measureTextField;
    }

    public getAlign(): string {
      return this._as3Object.align;
    }

    public setAlign(value: string): void {
      this._as3Object.align = alToString(this.context, value);
    }

    public getBlockIndent(): any {
      return this._as3Object.blockIndent;
    }

    public setBlockIndent(value: any): void {
      this._as3Object.blockIndent = alToNumber(this.context, value);
    }

    public getBold(): any {
      return this._as3Object.bold;
    }

    public setBold(value: any): void {
      this._as3Object.bold = alToBoolean(this.context, value);
    }

    public getBullet(): any {
      return this._as3Object.bullet;
    }

    public setBullet(value: any): void {
      this._as3Object.bullet = alToBoolean(this.context, value);
    }

    public getColor(): any {
      return this._as3Object.color;
    }

    public setColor(value: any): void {
      this._as3Object.color = alToNumber(this.context, value);
    }

    public getFont(): string {
      return this._as3Object.font;
    }

    public setFont(value: string): void {
      this._as3Object.font = alToString(this.context, value);
    }

    public getIndent(): any {
      return this._as3Object.indent;
    }

    public setIndent(value: any): void {
      this._as3Object.indent = alToNumber(this.context, value);
    }

    public getItalic(): any {
      return this._as3Object.italic;
    }

    public setItalic(value: any): void {
      this._as3Object.italic = alToBoolean(this.context, value);
    }

    public getKerning(): any {
      return this._as3Object.kerning;
    }

    public setKerning(value: any): void {
      this._as3Object.kerning = alToBoolean(this.context, value);
    }

    public getLeading(): any {
      return this._as3Object.leading;
    }

    public setLeading(value: any): void {
      this._as3Object.leading = alToNumber(this.context, value);
    }

    public getLeftMargin(): any {
      return this._as3Object.leftMargin;
    }

    public setLeftMargin(value: any): void {
      this._as3Object.leftMargin = alToNumber(this.context, value);
    }

    public getLetterSpacing(): any {
      return this._as3Object.letterSpacing;
    }

    public setLetterSpacing(value: any): void {
      this._as3Object.letterSpacing = alToNumber(this.context, value);
    }

    public getRightMargin(): any {
      return this._as3Object.rightMargin;
    }

    public setRightMargin(value: any): void {
      this._as3Object.rightMargin = alToNumber(this.context, value);
    }

    public getSize(): any {
      return this._as3Object.size;
    }

    public setSize(value: any): void {
      this._as3Object.size = alToNumber(this.context, value);
    }

    public getTabStops(): any {
      var tabStops = this._as3Object.tabStops;
      return tabStops ? tabStops.value : null;
    }

    public setTabStops(value: any): void {
      if (!(value instanceof Natives.AVM1ArrayNative) &&
          !isNullOrUndefined(value)) {
        return; // TODO
      }
      var tabStops = value && this.context.sec.createArray(value);
      this._as3Object.tabStops = tabStops;
    }

    public getTarget(): string {
      return this._as3Object.target;
    }

    public setTarget(value: string): void {
      this._as3Object.target = alToString(this.context, value);
    }

    public getTextExtent(text: string, width?: number) {
      text = alCoerceString(this.context, text);
      width = +width;

      var staticState: typeof AVM1TextFormat = this.context.getStaticState(AVM1TextFormat);
      var measureTextField = staticState._measureTextField;
      if (!isNaN(width) && width > 0) {
        measureTextField.width = width + 4;
        measureTextField.wordWrap = true;
      } else {
        measureTextField.wordWrap = false;
      }
      measureTextField.defaultTextFormat = this._as3Object;
      measureTextField.text = text;
      var result: AVM1Object = alNewObject(this.context);
      var textWidth = measureTextField.textWidth;
      var textHeight = measureTextField.textHeight;
      result.alPut('width', textWidth);
      result.alPut('height', textHeight);
      result.alPut('textFieldWidth', textWidth + 4);
      result.alPut('textFieldHeight', textHeight + 4);
      var metrics = measureTextField.getLineMetrics(0);
      result.alPut('ascent',
        metrics.axGetPublicProperty('ascent'));
      result.alPut('descent',
        metrics.axGetPublicProperty('descent'));
      return result;
    }

    public getUnderline(): any {
      return this._as3Object.underline;
    }

    public setUnderline(value: any): void {
      this._as3Object.underline = alToBoolean(this.context, value);
    }

    public getUrl(): string {
      return this._as3Object.url;
    }

    public setUrl(value: string): void {
      this._as3Object.url = alToString(this.context, value);
    }
  }
}
