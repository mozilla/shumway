/**
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

package avm1lib {
import flash.text.TextField;

[native(cls="AVM1TextField")]
public dynamic class AVM1TextField extends Object {
  private native function _init(nativeTextField:TextField);

  function AVM1TextField(nativeTextField:TextField) {
    _init(nativeTextField);
  }

  public native function get _as3Object():TextField;

  public function get _alpha() {
    return this._as3Object.alpha;
  }
  public function set _alpha(value) {
    this._as3Object.alpha = value;
  }

  public function get antiAliasType() {
    return this._as3Object.antiAliasType;
  }
  public function set antiAliasType(value) {
    this._as3Object.antiAliasType = value;
  }

  public function get autoSize() {
    return this._as3Object.autoSize;
  }
  public function set autoSize(value) {
    // AS2 treats |true| as "LEFT" and |false| as "NONE".
    if (value === true) {
      value = "left";
    } else if (value === false) {
      value = "none";
    }
    this._as3Object.autoSize = value;
  }

  public function get background() {
    return this._as3Object.background;
  }
  public function set background(value) {
    this._as3Object.background = value;
  }

  public function get backgroundColor() {
    return this._as3Object.backgroundColor;
  }
  public function set backgroundColor(value) {
    this._as3Object.backgroundColor = value;
  }

  public function get border() {
    return this._as3Object.border;
  }
  public function set border(value) {
    this._as3Object.border = value;
  }

  public function get borderColor() {
    return this._as3Object.borderColor;
  }
  public function set borderColor(value) {
    this._as3Object.borderColor = value;
  }

  public function get bottomScroll() {
    return this._as3Object.bottomScrollV;
  }

  public function get condenseWhite() {
    return this._as3Object.condenseWhite;
  }
  public function set condenseWhite(value) {
    this._as3Object.condenseWhite = value;
  }

  public function get embedFonts() {
    return this._as3Object.embedFonts;
  }
  public function set embedFonts(value) {
    this._as3Object.embedFonts = value;
  }

  public function getNewTextFormat() {
    return this._as3Object.defaultTextFormat;
  }

  public function getTextFormat() {
    return this._as3Object.getTextFormat;
  }

  public function get _height() {
    return this._as3Object.height;
  }
  public function set _height(value) {
    this._as3Object.height = value;
  }

  public function get _highquality() {
    return 1;
  }
  public function set _highquality(value) {
  }

  public function get hscroll() {
    return this._as3Object.scrollH;
  }
  public function set hscroll(value) {
    this._as3Object.scrollH = value;
  }

  public function get html() {
    throw 'Not implemented: get$_html';
  }
  public function set html(value) {
    throw 'Not implemented: set$_html';
  }

  public function get htmlText() {
    return this._as3Object.htmlText;
  }
  public function set htmlText(value) {
    this._as3Object.htmlText = value;
  }

  public function get length() {
    return this._as3Object.length;
  }

  public function get maxChars() {
    return this._as3Object.maxChars;
  }
  public function set maxChars(value) {
    this._as3Object.maxChars = value;
  }

  public function get maxhscroll() {
    return this._as3Object.maxScrollH;
  }

  public function get maxscroll() {
    return this._as3Object.maxScrollV;
  }

  public function get multiline() {
    return this._as3Object.multiline;
  }
  public function set multiline(value) {
    this._as3Object.multiline = value;
  }

  public function get _name() {
    return Object(this._as3Object)._name;
  }
  public function set _name(value) {
    Object(this._as3Object)._name = value;
  }

  public function get _parent() {
    return this._as3Object.parent;
  }
  public function set _parent(value) {
    throw 'Not implemented: set$_parent';
  }

  public function get password() {
    return this._as3Object.displayAsPassword;
  }
  public function set password(value) {
    this._as3Object.displayAsPassword = value;
  }

  public function get _quality() {
    return 'HIGH';
  }
  public function set _quality(value) {
  }

  public function get _rotation() {
    return this._as3Object.rotation;
  }
  public function set _rotation(value) {
    this._as3Object.rotation = value;
  }

  public function get scroll() {
    return this._as3Object.scrollV;
  }
  public function set scroll(value) {
    this._as3Object.scrollV = value;
  }

  public function get selectable() {
    return this._as3Object.selectable;
  }
  public function set selectable(value) {
    this._as3Object.selectable = value;
  }

  public function setNewTextFormat(value) {
    this._as3Object.defaultTextFormat = value;
  }

  public function setTextFormat() {
    this._as3Object.setTextFormat.apply(this._as3Object, arguments);
  }

  public function get _soundbuftime() {
    throw 'Not implemented: get$_soundbuftime';
  }
  public function set _soundbuftime(value) {
    throw 'Not implemented: set$_soundbuftime';
  }

  public function get tabEnabled() {
    return this._as3Object.tabEnabled;
  }
  public function set tabEnabled(value) {
    this._as3Object.tabEnabled = value;
  }

  public function get tabIndex() {
    return this._as3Object.tabIndex;
  }
  public function set tabIndex(value) {
    this._as3Object.tabIndex = value;
  }

  public function get _target() {
    return AVM1Utils.getTarget(this);
  }

  public function get text() {
    return this._as3Object.text;
  }
  public function set text(value) {
    this._as3Object.text = value;
  }

  public function get textColor() {
    return this._as3Object.textColor;
  }
  public function set textColor(value) {
    this._as3Object.textColor = value;
  }

  public function get textHeight() {
    return this._as3Object.textHeight;
  }
  public function set textHeight(value) {
    throw 'Not supported: set$textHeight';
  }

  public function get textWidth() {
    return this._as3Object.textWidth;
  }
  public function set textWidth(value) {
    throw 'Not supported: set$textWidth';
  }

  public function get type() {
    return this._as3Object.type;
  }
  public function set type(value) {
    this._as3Object.type = value;
  }

  public function get _url() {
    return this._as3Object.loaderInfo.url;
  }

  public native function get variable();
  public native function set variable(value);

  public function get _visible() {
    return this._as3Object.visible;
  }
  public function set _visible(value) {
    this._as3Object.visible = +value !== 0;
  }

  public function get _width() {
    return this._as3Object.width;
  }
  public function set _width(value) {
    this._as3Object.width = value;
  }

  public function get wordWrap() {
    return this._as3Object.wordWrap;
  }
  public function set wordWrap(value) {
    this._as3Object.wordWrap = value;
  }

  public function get _x() {
    return this._as3Object.x;
  }
  public function set _x(value) {
    this._as3Object.x = value;
  }

  public function get _xmouse() {
    return this._as3Object.mouseX;
  }

  public function get _xscale() {
    return this._as3Object.scaleX;
  }
  public function set _xscale(value) {
    this._as3Object.scaleX = value;
  }

  public function get _y() {
    return this._as3Object.y;
  }
  public function set _y(value) {
    this._as3Object.y = value;
  }

  public function get _ymouse() {
    return this._as3Object.mouseY;
  }

  public function get _yscale() {
    return this._as3Object.scaleY;
  }
  public function set _yscale(value) {
    this._as3Object.scaleY = value;
  }


  {
    AVM1Utils.addEventHandlerProxy(prototype, 'onDragOut', 'dragOut');
    AVM1Utils.addEventHandlerProxy(prototype, 'onDragOver', 'dragOver');
    AVM1Utils.addEventHandlerProxy(prototype, 'onKeyDown', 'keyDown');
    AVM1Utils.addEventHandlerProxy(prototype, 'onKeyUp', 'keyUp');
    AVM1Utils.addEventHandlerProxy(prototype, 'onKillFocus', 'focusOut', function (e) {
      return [e.relatedObject];
    });
    AVM1Utils.addEventHandlerProxy(prototype, 'onLoad', 'load');
    AVM1Utils.addEventHandlerProxy(prototype, 'onMouseDown', 'mouseDown');
    AVM1Utils.addEventHandlerProxy(prototype, 'onMouseUp', 'mouseUp');
    AVM1Utils.addEventHandlerProxy(prototype, 'onPress', 'mouseDown');
    AVM1Utils.addEventHandlerProxy(prototype, 'onRelease', 'mouseUp');
    AVM1Utils.addEventHandlerProxy(prototype, 'onReleaseOutside', 'releaseOutside');
    AVM1Utils.addEventHandlerProxy(prototype, 'onRollOut', 'mouseOut');
    AVM1Utils.addEventHandlerProxy(prototype, 'onRollOver', 'mouseOver');
    AVM1Utils.addEventHandlerProxy(prototype, 'onSetFocus', 'focusIn', function (e) {
      return [e.relatedObject];
    });
  }
}
}
