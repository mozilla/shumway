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
  import flash = Shumway.AVM2.AS.flash;
  import notImplemented = Shumway.Debug.notImplemented;

  export class AVM1TextField extends AVM1SymbolBase<flash.text.TextField> {
    static createAVM1Class(): typeof AVM1TextField  {
      return wrapAVM1Class(AVM1TextField,
        [],
        [ '_alpha', 'antiAliasType', 'autoSize', 'background', 'backgroundColor',
          'border', 'borderColor', 'bottomScroll', 'condenseWhite', 'embedFonts',
          'getNewTextFormat', 'getTextFormat',
          '_height', '_highquality', 'hscroll', 'html', 'htmlText', 'length',
          'maxChars', 'maxhscroll', 'maxscroll', 'multiline',
          '_name', '_parent', 'password', '_quality', '_rotation',
          'scroll', 'selectable', 'setNewTextFormat', 'setTextFormat',
          '_soundbuftime', 'tabEnabled', 'tabIndex', '_target',
          'text', 'textColor', 'textHeight', 'textWidth', 'type',
          '_url', '_visible', '_width', 'wordWrap',
          '_x', '_xmouse', '_xscale', '_y', '_ymouse', '_yscale']);
    }

    private _variable: string;
    private _exitFrameHandler: (event: flash.events.Event) => void;


    public initAVM1SymbolInstance(context: AVM1Context, as3Object: flash.text.TextField) {
      super.initAVM1SymbolInstance(context, as3Object);

      this._variable = '';
      this._exitFrameHandler = null;

      if (as3Object._symbol) {
        this.variable = as3Object._symbol.variableName || '';
      }

      this._initEventsHandlers();
    }

    public get _alpha() {
      return this._as3Object.alpha;
    }

    public set _alpha(value) {
      this._as3Object.alpha = value;
    }

    public get antiAliasType() {
      return this._as3Object.antiAliasType;
    }

    public set antiAliasType(value) {
      this._as3Object.antiAliasType = value;
    }

    public get autoSize() {
      return this._as3Object.autoSize;
    }

    public set autoSize(value: any) {
      // AVM1 treats |true| as "LEFT" and |false| as "NONE".
      if (value === true) {
        value = "left";
      } else if (value === false) {
        value = "none";
      }
      this._as3Object.autoSize = value;
    }

    public get background() {
      return this._as3Object.background;
    }

    public set background(value) {
      this._as3Object.background = value;
    }

    public get backgroundColor() {
      return this._as3Object.backgroundColor;
    }

    public set backgroundColor(value) {
      this._as3Object.backgroundColor = value;
    }

    public get border() {
      return this._as3Object.border;
    }

    public set border(value) {
      this._as3Object.border = value;
    }

    public get borderColor() {
      return this._as3Object.borderColor;
    }

    public set borderColor(value) {
      this._as3Object.borderColor = value;
    }

    public get bottomScroll() {
      return this._as3Object.bottomScrollV;
    }

    public get condenseWhite() {
      return this._as3Object.condenseWhite;
    }

    public set condenseWhite(value) {
      this._as3Object.condenseWhite = value;
    }

    public get embedFonts() {
      return this._as3Object.embedFonts;
    }

    public set embedFonts(value) {
      this._as3Object.embedFonts = value;
    }

    public getNewTextFormat() {
      return this._as3Object.defaultTextFormat;
    }

    public getTextFormat() {
      return this._as3Object.getTextFormat;
    }

    public get _height() {
      return this._as3Object.height;
    }

    public set _height(value) {
      if (isNaN(value)) {
        return;
      }
      this._as3Object.height = value;
    }

    public get _highquality() {
      return 1;
    }

    public set _highquality(value) {
    }

    public get hscroll() {
      return this._as3Object.scrollH;
    }

    public set hscroll(value) {
      this._as3Object.scrollH = value;
    }

    public get html() {
      throw 'Not implemented: get$_html';
    }

    public set html(value) {
      throw 'Not implemented: set$_html';
    }

    public get htmlText() {
      return this._as3Object.htmlText;
    }

    public set htmlText(value) {
      this._as3Object.htmlText = value;
    }

    public get length() {
      return this._as3Object.length;
    }

    public get maxChars() {
      return this._as3Object.maxChars;
    }

    public set maxChars(value) {
      this._as3Object.maxChars = value;
    }

    public get maxhscroll() {
      return this._as3Object.maxScrollH;
    }

    public get maxscroll() {
      return this._as3Object.maxScrollV;
    }

    public get multiline() {
      return this._as3Object.multiline;
    }

    public set multiline(value) {
      this._as3Object.multiline = value;
    }

    public get _name() {
      return this.as3Object._name;
    }

    public set _name(value) {
      this.as3Object._name = value;
    }

    public get _parent() {
      return this._as3Object.parent;
    }

    public set _parent(value) {
      throw 'Not implemented: set$_parent';
    }

    public get password() {
      return this._as3Object.displayAsPassword;
    }

    public set password(value) {
      this._as3Object.displayAsPassword = value;
    }

    public get _quality() {
      return 'HIGH';
    }

    public set _quality(value) {
    }

    public get _rotation() {
      return this._as3Object.rotation;
    }

    public set _rotation(value) {
      this._as3Object.rotation = value;
    }

    public get scroll() {
      return this._as3Object.scrollV;
    }

    public set scroll(value) {
      this._as3Object.scrollV = value;
    }

    public get selectable() {
      return this._as3Object.selectable;
    }

    public set selectable(value) {
      this._as3Object.selectable = value;
    }

    public setNewTextFormat(value) {
      this._as3Object.defaultTextFormat = value;
    }

    public setTextFormat() {
      this._as3Object.setTextFormat.apply(this._as3Object, arguments);
    }

    public get _soundbuftime() {
      throw 'Not implemented: get$_soundbuftime';
    }

    public set _soundbuftime(value) {
      throw 'Not implemented: set$_soundbuftime';
    }

    public get tabEnabled() {
      return this._as3Object.tabEnabled;
    }

    public set tabEnabled(value) {
      this._as3Object.tabEnabled = value;
    }

    public get tabIndex() {
      return this._as3Object.tabIndex;
    }

    public set tabIndex(value) {
      this._as3Object.tabIndex = value;
    }

    public get _target() {
      return AVM1Utils.getTarget(this);
    }

    public get text() {
      return this._as3Object.text;
    }

    public set text(value) {
      this._as3Object.text = value;
    }

    public get textColor() {
      return this._as3Object.textColor;
    }

    public set textColor(value) {
      this._as3Object.textColor = value;
    }

    public get textHeight() {
      return this._as3Object.textHeight;
    }

    public set textHeight(value) {
      throw 'Not supported: set$textHeight';
    }

    public get textWidth() {
      return this._as3Object.textWidth;
    }

    public set textWidth(value) {
      throw 'Not supported: set$textWidth';
    }

    public get type() {
      return this._as3Object.type;
    }

    public set type(value) {
      this._as3Object.type = value;
    }

    public get _url() {
      return this._as3Object.loaderInfo.url;
    }

    get variable():any {
      return this._variable;
    }

    set variable(name:any) {
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
      // Sets default values as defined in SWF if this property was not found.
      if (!avm1ContextUtils.hasProperty(clip, name)) {
        avm1ContextUtils.setProperty(clip, name, instance.text);
      }

      instance.text = '' + avm1ContextUtils.getProperty(clip, name);
    }

    public get _visible() {
      return this._as3Object.visible;
    }

    public set _visible(value) {
      this._as3Object.visible = +value !== 0;
    }

    public get _width() {
      return this._as3Object.width;
    }

    public set _width(value) {
      if (isNaN(value)) {
        return;
      }
      this._as3Object.width = value;
    }

    public get wordWrap() {
      return this._as3Object.wordWrap;
    }

    public set wordWrap(value) {
      this._as3Object.wordWrap = value;
    }

    public get _x() {
      return this._as3Object.x;
    }

    public set _x(value) {
      if (isNaN(value)) {
        return;
      }
      this._as3Object.x = value;
    }

    public get _xmouse() {
      return this._as3Object.mouseX;
    }

    public get _xscale() {
      return this._as3Object.scaleX;
    }

    public set _xscale(value) {
      if (isNaN(value)) {
        return;
      }
      this._as3Object.scaleX = value;
    }

    public get _y() {
      return this._as3Object.y;
    }

    public set _y(value) {
      if (isNaN(value)) {
        return;
      }
      this._as3Object.y = value;
    }

    public get _ymouse() {
      return this._as3Object.mouseY;
    }

    public get _yscale() {
      return this._as3Object.scaleY;
    }

    public set _yscale(value) {
      if (isNaN(value)) {
        return;
      }
      this._as3Object.scaleY = value;
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
