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
import flash.display.SimpleButton;

[native(cls="AS2Button")]
public dynamic class AS2Button extends Object {
  private native function _init(nativeButton:SimpleButton);

  function AS2Button(nativeButton:SimpleButton) {
    _init(nativeButton);
  }

  public native function get _as3Object():SimpleButton;

  public function get _alpha() {
    return this._as3Object.alpha;
  }
  public function set _alpha(value) {
    this._as3Object.alpha = value;
  }

  public function get blendMode() {
    return this._as3Object.blendMode;
  }
  public function set blendMode(value) {
    this._as3Object.blendMode = value;
  }

  public function get cacheAsBitmap() {
    return this._as3Object.cacheAsBitmap;
  }
  public function set cacheAsBitmap(value) {
    this._as3Object.cacheAsBitmap = value;
  }
  public function get enabled() {
    return this._as3Object.enabled;
  }
  public function set enabled(value) {
    this._as3Object.enabled = value;
  }
  public function get filters() {
    throw 'Not implemented: get$filters';
  }
  public function set filters(value) {
    throw 'Not implemented: set$filters';
  }
  public function get _focusrect() {
    throw 'Not implemented: get$_focusrect';
  }
  public function set _focusrect(value) {
    throw 'Not implemented: set$_focusrect';
  }
  public function getDepth() {
    return Object(this._as3Object)._clipDepth;
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

  public function get menu() {
    return this._as3Object.contextMenu;
  }
  public function set menu(value) {
    this._as3Object.contextMenu = value;
  }

  public function get _name() {
    return this._as3Object.contextMenu;
  }
  public function set _name(value) {
    this._as3Object.contextMenu = value;
  }

  public function get _parent() {
    return AVM1Utils.getAS2Object(this._as3Object.parent);
  }
  public function set _parent(value) {
    throw 'Not implemented: set$_parent';
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

  public function get scale9Grid() {
    throw 'Not implemented: get$scale9Grid';
  }
  public function set scale9Grid(value) {
    throw 'Not implemented: set$scale9Grid';
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

  public function get trackAsMenu() {
    throw 'Not implemented: get$trackAsMenu';
  }
  public function set trackAsMenu(value) {
    throw 'Not implemented: set$trackAsMenu';
  }

  public function get _url() {
    return this._as3Object.loaderInfo.url;
  }

  public function get useHandCursor() {
    return this._as3Object.useHandCursor;
  }
  public function set useHandCursor(value) {
    this._as3Object.useHandCursor = value;
  }

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
