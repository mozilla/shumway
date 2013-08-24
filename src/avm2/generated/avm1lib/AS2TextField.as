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
package avm1lib {
  import avm1lib.AS2Utils;
  import flash.text.TextField;

  [native(cls="AS2TextField")]
  public dynamic class AS2TextField extends Object {
    function AS2TextField() {
    }

    public native function get $nativeObject(); //: flash.text.TextField;

    public function get _alpha() { return this.$nativeObject.alpha; }
    public function set _alpha(value) { this.$nativeObject.alpha = value; }

    public function get antiAliasType() { return this.$nativeObject.antiAliasType; }
    public function set antiAliasType(value) { this.$nativeObject.antiAliasType = value; }

    public function get autoSize() { return this.$nativeObject.autoSize; }
    public function set autoSize(value) { this.$nativeObject.autoSize = value; }

    public function get background() { return this.$nativeObject.background; }
    public function set background(value) { this.$nativeObject.background = value; }

    public function get backgroundColor() { return this.$nativeObject.backgroundColor; }
    public function set backgroundColor(value) { this.$nativeObject.backgroundColor = value; }

    public function get border() { return this.$nativeObject.border; }
    public function set border(value) { this.$nativeObject.border = value; }

    public function get borderColor() { return this.$nativeObject.borderColor; }
    public function set borderColor(value) { this.$nativeObject.borderColor = value; }

    public function get bottomScroll() { return this.$nativeObject.bottomScrollV; }

    public function get condenseWhite() { return this.$nativeObject.condenseWhite; }
    public function set condenseWhite(value) { this.$nativeObject.condenseWhite = value; }

    public function get embedFonts() { return this.$nativeObject.embedFonts; }
    public function set embedFonts(value) { this.$nativeObject.embedFonts = value; }

    public function getNewTextFormat()
    {
      return this.$nativeObject.defaultTextFormat;
    }

    public function getTextFormat() { return this.$nativeObject.getTextFormat; }

    public function get _height() { return this.$nativeObject.height; }
    public function set _height(value) { this.$nativeObject.height = value; }

    public function get _highquality() { return 1; }
    public function set _highquality(value) { }

    public function get hscroll() { return this.$nativeObject.scrollH; }
    public function set hscroll(value) { this.$nativeObject.scrollH = value; }

    public function get html() { throw 'Not implemented: get$_html'; }
    public function set html(value) { throw 'Not implemented: set$_html'; }

    public function get htmlText() { return this.$nativeObject.htmlText; }
    public function set htmlText(value) { this.$nativeObject.htmlText = value; }

    // [Compiler] Error #1024: Overriding a function that is not marked for override.
    //  public function get length() { return this.$nativeObject.length; }

    public function get maxChars() { return this.$nativeObject.maxChars; }
    public function set maxChars(value) { this.$nativeObject.maxChars = value; }

    public function get maxhscroll() { return this.$nativeObject.maxScrollH; }

    public function get maxscroll() { return this.$nativeObject.maxScrollV; }

    public function get multiline() { return this.$nativeObject.multiline; }
    public function set multiline(value) { this.$nativeObject.multiline = value; }

    public function get _name() { return this.$nativeObject._name; }
    public function set _name(value) { this.$nativeObject._name = value; }

    public function get _parent() { return this.$nativeObject.parent; }
    public function set _parent(value) { throw 'Not implemented: set$_parent'; }

    public function get password() { return this.$nativeObject.displayAsPassword; }
    public function set password(value) { this.$nativeObject.displayAsPassword = value; }

    public function get _quality() { return 'HIGH'; }
    public function set _quality(value) { }

    public function get _rotation() { return this.$nativeObject.rotation; }
    public function set _rotation(value) { this.$nativeObject.rotation = value; }

    public function get scroll() { return this.$nativeObject.scrollV; }
    public function set scroll(value) { this.$nativeObject.scrollV = value; }

    public function get selectable() { return this.$nativeObject.selectable; }
    public function set selectable(value) { this.$nativeObject.selectable = value; }

    public function setNewTextFormat(value) { this.$nativeObject.defaultTextFormat = value; }

    public function setTextFormat() { this.$nativeObject.setTextFormat.apply(this.$nativeObject, arguments); }

    public function get _soundbuftime() { throw 'Not implemented: get$_soundbuftime'; }
    public function set _soundbuftime(value) { throw 'Not implemented: set$_soundbuftime'; }

    public function get tabEnabled() { return this.$nativeObject.tabEnabled; }
    public function set tabEnabled(value) { this.$nativeObject.tabEnabled = value; }

    public function get tabIndex() { return this.$nativeObject.tabIndex; }
    public function set tabIndex(value) { this.$nativeObject.tabIndex = value; }

    public function get _target() { throw 'Not implemented: get$_target'; }

    public function get text() { return this.$nativeObject.text; }
    public function set text(value) { this.$nativeObject.text = value; }

    public function get textColor() { return this.$nativeObject.textColor; }
    public function set textColor(value) { this.$nativeObject.textColor = value; }

    public function get textHeight() { return this.$nativeObject.textHeight; }
    public function set textHeight(value) { this.$nativeObject.textHeight = value; }

    public function get textWidth() { return this.$nativeObject.textWidth; }
    public function set textWidth(value) { this.$nativeObject.textWidth = value; }

    public function get type() { return this.$nativeObject.type; }
    public function set type(value) { this.$nativeObject.type = value; }

    public function get _url() { return this.$nativeObject.loaderInfo.url; }

    public function get variable() { throw 'Not implemented: get$variable'; }
    public function set variable(value) { throw 'Not implemented: set$variable'; }

    public function get _visible() { return this.$nativeObject.visible; }
    public function set _visible(value) { this.$nativeObject.visible = +value !== 0; }

    public function get _width() { return this.$nativeObject.width; }
    public function set _width(value) { this.$nativeObject.width= value; }

    public function get wordWrap() { return this.$nativeObject.wordWrap;  }
    public function set wordWrap(value) { this.$nativeObject.wordWrap = value;  }

    public function get _x() { return this.$nativeObject.x;  }
    public function set _x(value) { this.$nativeObject.x = value;  }

    public function get _xmouse() { return this.$nativeObject.mouseX;  }

    public function get _xscale() { return this.$nativeObject.scaleX;  }
    public function set _xscale(value) { this.$nativeObject.scaleX = value;  }

    public function get _y() { return this.$nativeObject.y;  }
    public function set _y(value) { this.$nativeObject.y = value;  }

    public function get _ymouse() { return this.$nativeObject.mouseY;  }

    public function get _yscale() { return this.$nativeObject.scaleY;  }
    public function set _yscale(value) { this.$nativeObject.scaleY = value;  }


    {
      AS2Utils.addProperty(prototype, 'length', function () { return this.$nativeObject.length; }, null);

      AS2Utils.addEventHandlerProxy(prototype, 'onDragOut', 'dragOut');
      AS2Utils.addEventHandlerProxy(prototype, 'onDragOver', 'dragOver');
      AS2Utils.addEventHandlerProxy(prototype, 'onKeyDown', 'keyDown');
      AS2Utils.addEventHandlerProxy(prototype, 'onKeyUp', 'keyUp');
      AS2Utils.addEventHandlerProxy(prototype, 'onKillFocus', 'focusOut', function(e) { return [e.relatedObject]; });
      AS2Utils.addEventHandlerProxy(prototype, 'onLoad', 'load');
      AS2Utils.addEventHandlerProxy(prototype, 'onMouseDown', 'mouseDown');
      AS2Utils.addEventHandlerProxy(prototype, 'onMouseUp', 'mouseUp');
      AS2Utils.addEventHandlerProxy(prototype, 'onPress', 'mouseDown');
      AS2Utils.addEventHandlerProxy(prototype, 'onRelease', 'mouseUp');
      AS2Utils.addEventHandlerProxy(prototype, 'onReleaseOutside', 'releaseOutside');
      AS2Utils.addEventHandlerProxy(prototype, 'onRollOut', 'mouseOut');
      AS2Utils.addEventHandlerProxy(prototype, 'onRollOver', 'mouseOver');
      AS2Utils.addEventHandlerProxy(prototype, 'onSetFocus', 'focusIn', function(e) { return [e.relatedObject]; });
    }
  }
}