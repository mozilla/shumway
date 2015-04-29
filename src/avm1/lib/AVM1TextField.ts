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
  import notImplemented = Shumway.Debug.notImplemented;

  export class AVM1TextField extends AVM1SymbolBase<flash.text.TextField> {
    static createAVM1Class(context: AVM1Context): AVM1Object  {
      return wrapAVM1NativeClass(context, true, AVM1TextField,
        [],
        [ '_alpha#', 'antiAliasType#', 'autoSize#', 'background#', 'backgroundColor#',
          'border#', 'borderColor#', 'bottomScroll#', 'condenseWhite#', 'embedFonts#',
          'filters#', 'getNewTextFormat', 'getTextFormat', 'gridFitType#', 'getDepth',
          '_height#', '_highquality#', 'hscroll#', 'html#', 'htmlText#', 'length#',
          'maxChars#', 'maxhscroll#', 'maxscroll#', 'multiline#',
          '_name#', '_parent#', 'password#', '_quality#', '_rotation#',
          'scroll#', 'selectable#', 'setNewTextFormat', 'setTextFormat',
          '_soundbuftime#', 'tabEnabled#', 'tabIndex#', '_target#',
          'text#', 'textColor#', 'textHeight#', 'textWidth#', 'type#',
          '_url#', 'variable#', '_visible#', '_width#', 'wordWrap#',
          '_x#', '_xmouse#', '_xscale#', '_y#', '_ymouse#', '_yscale#']);
    }

    private _variable: string;
    private _exitFrameHandler: (event: flash.events.Event) => void;

    public initAVM1SymbolInstance(context: AVM1Context, as3Object: flash.text.TextField) {
      super.initAVM1SymbolInstance(context, as3Object);

      this._variable = '';
      this._exitFrameHandler = null;

      if (as3Object._symbol) {
        this.setVariable(as3Object._symbol.variableName || '');
      }

      this._initEventsHandlers();
    }

    public getAntiAliasType(): string {
      return this._as3Object.antiAliasType;
    }

    public setAntiAliasType(value: string) {
      value = alCoerceString(this.context, value);
      this._as3Object.antiAliasType = value;
    }

    public getAutoSize() {
      return this._as3Object.autoSize;
    }

    public setAutoSize(value: any) {
      // AVM1 treats |true| as "LEFT" and |false| as "NONE".
      if (value === true) {
        value = "left";
      } else if (value === false) {
        value = "none";
      }
      value = alCoerceString(this.context, value);
      this._as3Object.autoSize = value;
    }

    public getBackground(): boolean {
      return this._as3Object.background;
    }

    public setBackground(value: boolean) {
      value = alToBoolean(this.context, value);
      this._as3Object.background = value;
    }

    public getBackgroundColor(): number {
      return this._as3Object.backgroundColor;
    }

    public setBackgroundColor(value) {
      value = alToInt32(this.context, value);
      this._as3Object.backgroundColor = value;
    }

    public getBorder(): boolean {
      return this._as3Object.border;
    }

    public setBorder(value: boolean) {
      value = alToBoolean(this.context, value);
      this._as3Object.border = value;
    }

    public getBorderColor(): number {
      return this._as3Object.borderColor;
    }

    public setBorderColor(value: number) {
      value = alToInt32(this.context, value);
      this._as3Object.borderColor = value;
    }

    public getBottomScroll(): number {
      return this._as3Object.bottomScrollV;
    }

    public getCondenseWhite(): boolean {
      return this._as3Object.condenseWhite;
    }

    public setCondenseWhite(value: boolean) {
      value = alToBoolean(this.context, value);
      this._as3Object.condenseWhite = value;
    }

    public getEmbedFonts(): boolean {
      return this._as3Object.embedFonts;
    }

    public setEmbedFonts(value) {
      value = alToBoolean(this.context, value);
      this._as3Object.embedFonts = value;
    }

    public getNewTextFormat() {
      return AVM1TextFormat.createFromNative(this.context, this._as3Object.defaultTextFormat);
    }

    public getTextFormat(beginIndex: number = -1, endIndex: number = -1) {
      beginIndex = alToInteger(this.context, beginIndex);
      endIndex = alToInteger(this.context, endIndex);
      var as3TextFormat = this._as3Object.getTextFormat(beginIndex, endIndex);
      return AVM1TextFormat.createFromNative(this.context, as3TextFormat);
    }

    public getGridFitType(): string {
      return this._as3Object.gridFitType;
    }

    public setGridFitType(value: string) {
      value = alCoerceString(this.context, value);
      this._as3Object.gridFitType = value;
    }

    public getHscroll(): number {
      return this._as3Object.scrollH;
    }

    public setHscroll(value: number) {
      value = alCoerceNumber(this.context, value);
      this._as3Object.scrollH = value;
    }

    public getHtml() {
      Debug.notImplemented('AVM1TextField.getHtml');
    }

    public setHtml(value) {
      Debug.notImplemented('AVM1TextField.setHtml');
    }

    public getHtmlText(): string {
      return this._as3Object.htmlText;
    }

    public setHtmlText(value: string) {
      this._as3Object.htmlText = alCoerceString(this.context, value);
    }

    public getLength(): number {
      return this._as3Object.length;
    }

    public getMaxChars(): number  {
      return this._as3Object.maxChars;
    }

    public setMaxChars(value) {
      value = alCoerceNumber(this.context, value);
      this._as3Object.maxChars = value;
    }

    public getMaxhscroll(): number {
      return this._as3Object.maxScrollH;
    }

    public getMaxscroll(): number {
      return this._as3Object.maxScrollV;
    }

    public getMultiline(): boolean {
      return this._as3Object.multiline;
    }

    public setMultiline(value: boolean) {
      value = alToBoolean(this.context, value);
      this._as3Object.multiline = value;
    }

    public getPassword(): boolean {
      return this._as3Object.displayAsPassword;
    }

    public setPassword(value: boolean) {
      value = alToBoolean(this.context, value);
      this._as3Object.displayAsPassword = value;
    }

    public getScroll(): number {
      return this._as3Object.scrollV;
    }

    public setScroll(value: number) {
      value = alCoerceNumber(this.context, value);
      this._as3Object.scrollV = value;
    }

    public getSelectable(): boolean {
      return this._as3Object.selectable;
    }

    public setSelectable(value: boolean) {
      value = alToBoolean(this.context, value);
      this._as3Object.selectable = value;
    }

    public setNewTextFormat(value) {
      var as3TextFormat;
      if (value instanceof AVM1TextFormat) {
        as3TextFormat = (<AVM1TextFormat>value)._as3Object;
      }
      this._as3Object.defaultTextFormat = as3TextFormat;
    }

    public setTextFormat() {
      var beginIndex: number = -1, endIndex: number = -1, tf;
      switch (arguments.length) {
        case 0:
          return; // invalid amount of arguments
        case 1:
          tf = arguments[0];
          break;
        case 2:
          beginIndex = alToNumber(this.context, arguments[0]);
          tf = arguments[1];
          break;
        default:
          beginIndex = alToNumber(this.context, arguments[0]);
          endIndex = alToNumber(this.context, arguments[1]);
          tf = arguments[2];
          break;
      }
      var as3TextFormat;
      if (tf instanceof AVM1TextFormat) {
        as3TextFormat = (<AVM1TextFormat>tf)._as3Object;
      }
      this._as3Object.setTextFormat(as3TextFormat, beginIndex, endIndex);
    }

    public getText(): string {
      return this._as3Object.text;
    }

    public setText(value: string) {
      value = alCoerceString(this.context, value);
      this._as3Object.text = value;
    }

    public getTextColor(): number {
      return this._as3Object.textColor;
    }

    public setTextColor(value: number) {
      value = alToInt32(this.context, value);
      this._as3Object.textColor = value;
    }

    public getTextHeight(): number {
      return this._as3Object.textHeight;
    }

    public setTextHeight(value: number) {
      Debug.notImplemented('AVM1TextField.setTextHeight');
    }

    public getTextWidth(): number {
      return this._as3Object.textWidth;
    }

    public setTextWidth(value) {
      Debug.notImplemented('AVM1TextField.setTextWidth');
    }

    public getType(): string {
      return this._as3Object.type;
    }

    public setType(value: string) {
      value = alCoerceString(this.context, value);
      this._as3Object.type = value;
    }

    public getVariable(): string {
      return this._variable;
    }

    public setVariable(name: string) {
      name = alCoerceString(this.context, name);
      if (name === this._variable) {
        return;
      }

      var instance = this.as3Object;
      if (this._exitFrameHandler && !name) {
        instance.removeEventListener('exitFrame', this._exitFrameHandler);
        this._exitFrameHandler = null;
      }
      this._variable = name;
      if (!this._exitFrameHandler && name) {
        this._exitFrameHandler = this._onAS3ObjectExitFrame.bind(this);
        instance.addEventListener('exitFrame', this._exitFrameHandler);
      }
    }

    private _onAS3ObjectExitFrame() {
      this._syncTextFieldValue(this.as3Object, this._variable);
    }

    private _syncTextFieldValue(instance, name) {
      var clip;
      var hasPath = name.indexOf('.') >= 0 || name.indexOf(':') >= 0;
      var avm1ContextUtils = this.context.utils;
      if (hasPath) {
        var targetPath = name.split(/[.:\/]/g);
        name = targetPath.pop();
        if (targetPath[0] == '_root' || targetPath[0] === '') {
          if (instance.root === null) {
            return; // text field is not part of the stage yet
          }
          clip = getAVM1Object(instance.root, this.context);
          targetPath.shift();
          if (targetPath[0] === '') {
            targetPath.shift();
          }
        } else {
          clip = getAVM1Object(instance._parent, this.context);
        }
        while (targetPath.length > 0) {
          var childName = targetPath.shift();
          clip = avm1ContextUtils.getProperty(clip, childName);
          if (!clip) {
            return; // cannot find child clip
          }
        }
      } else {
        clip = getAVM1Object(instance._parent, this.context);
      }
      if (!clip) { // REDUX
        avm1ContextUtils.warn('Clip ' + name + ' was not found');
        return;
      }
      // Sets default values as defined in SWF if this property was not found.
      if (!avm1ContextUtils.hasProperty(clip, name)) {
        avm1ContextUtils.setProperty(clip, name, instance.text);
      }

      instance.text = '' + avm1ContextUtils.getProperty(clip, name);
    }

    public getWordWrap(): boolean {
      return this._as3Object.wordWrap;
    }

    public setWordWrap(value: boolean) {
      value = alToBoolean(this.context, value);
      this._as3Object.wordWrap = value;
    }


    private _initEventsHandlers() {
      this.bindEvents([
        new AVM1EventHandler('onDragOut', 'dragOut'),
        new AVM1EventHandler('onDragOver', 'dragOver'),
        new AVM1EventHandler('onKeyDown', 'keyDown'),
        new AVM1EventHandler('onKeyUp', 'keyUp'),
        new AVM1EventHandler('onKillFocus', 'focusOut', function (e) {
          return [e.relatedObject];
        }),
        new AVM1EventHandler('onLoad', 'load'),
        new AVM1EventHandler('onMouseDown', 'mouseDown'),
        new AVM1EventHandler('onMouseUp', 'mouseUp'),
        new AVM1EventHandler('onPress', 'mouseDown'),
        new AVM1EventHandler('onRelease', 'mouseUp'),
        new AVM1EventHandler('onReleaseOutside', 'releaseOutside'),
        new AVM1EventHandler('onRollOut', 'mouseOut'),
        new AVM1EventHandler('onRollOver', 'mouseOver'),
        new AVM1EventHandler('onSetFocus', 'focusIn', function (e) {
          return [e.relatedObject];
        })
      ]);
    }
  }
}
