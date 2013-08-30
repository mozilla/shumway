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
  import flash.display.SimpleButton;

  [native(cls="AS2Button")]
  public dynamic class AS2Button extends Object {
    private native function init(nativeButton: flash.display.SimpleButton);

    function AS2Button(nativeButton: flash.display.SimpleButton)
    {
      init(nativeButton);
    }

    public native function get $nativeObject(): flash.display.SimpleButton;

    public function get _alpha() { return this.$nativeObject.alpha; }
    public function set _alpha(value) { this.$nativeObject.alpha = value; }

    public function get blendMode() { return this.$nativeObject.blendMode; }
    public function set blendMode(value) { this.$nativeObject.blendMode = value; }

    public function get cacheAsBitmap() { return this.$nativeObject.cacheAsBitmap; }
    public function set cacheAsBitmap(value) { this.$nativeObject.cacheAsBitmap = value; }
    public function get enabled() { return this.$nativeObject.enabled; }
    public function set enabled(value) { this.$nativeObject.enabled = value; }
    public function get filters() { throw 'Not implemented: get$filters';  }
    public function set filters(value) { throw 'Not implemented: set$filters';  }
    public function get _focusrect() { throw 'Not implemented: get$_focusrect';  }
    public function set _focusrect(value) { throw 'Not implemented: set$_focusrect';  }
    public function getDepth()
    {
      return this.$nativeObject._clipDepth;
    }

    public function get _height() { return this.$nativeObject.height; }
    public function set _height(value) { this.$nativeObject.height = value; }

    public function get _highquality() { return 1; }
    public function set _highquality(value) { }

    public function get menu() { return this.$nativeObject.contextMenu;  }
    public function set menu(value) { this.$nativeObject.contextMenu = value;  }

    public function get _name() { return this.$nativeObject.contextMenu;  }
    public function set _name(value) { this.$nativeObject.contextMenu = value;  }

    public function get _parent() { return AS2Utils.getAS2Object(this.$nativeObject.parent);  }
    public function set _parent(value) { throw 'Not implemented: set$_parent';  }

    public function get _quality() { return 'HIGH';  }
    public function set _quality(value) { }

    public function get _rotation() { return this.$nativeObject.rotation;  }
    public function set _rotation(value) { this.$nativeObject.rotation = value;  }

    public function get scale9Grid() { throw 'Not implemented: get$scale9Grid';  }
    public function set scale9Grid(value) { throw 'Not implemented: set$scale9Grid';  }

    public function get _soundbuftime() { throw 'Not implemented: get$_soundbuftime';  }
    public function set _soundbuftime(value) { throw 'Not implemented: set$_soundbuftime';  }

    public function get tabEnabled() { return this.$nativeObject.tabEnabled;  }
    public function set tabEnabled(value) { this.$nativeObject.tabEnabled = value;  }

    public function get tabIndex() { return this.$nativeObject.tabIndex;  }
    public function set tabIndex(value) { this.$nativeObject.tabIndex = value;  }

    public function get _target() { throw 'Not implemented: get$_target'; }


    public function get trackAsMenu() { throw 'Not implemented: get$trackAsMenu';  }
    public function set trackAsMenu(value) { throw 'Not implemented: set$trackAsMenu';  }

    public function get _url() { return this.$nativeObject.loaderInfo.url; }

    public function get useHandCursor() { return this.$nativeObject.useHandCursor;  }
    public function set useHandCursor(value) { this.$nativeObject.useHandCursor = value;  }

    public function get _visible() { return this.$nativeObject.visible;  }
    public function set _visible(value) { this.$nativeObject.visible = +value !== 0;  }

    public function get _width() { return this.$nativeObject.width;  }
    public function set _width(value) { this.$nativeObject.width = value;  }

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