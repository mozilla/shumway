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
// Class: AS2Button
module Shumway.AVM2.AS.avm1lib {
  import SimpleButton = flash.display.SimpleButton;

  export class AS2Button extends ASNative {

    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // Called whenever an instance of the class is initialized.
    static initializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null;

    // List of instance symbols to link.
    static instanceSymbols: string [] = ["_alpha", "_alpha", "blendMode", "blendMode", "cacheAsBitmap", "cacheAsBitmap", "enabled", "enabled", "filters", "filters", "_focusrect", "_focusrect", "getDepth", "_height", "_height", "_highquality", "_highquality", "menu", "menu", "_name", "_name", "_parent", "_parent", "_quality", "_quality", "_rotation", "_rotation", "scale9Grid", "scale9Grid", "_soundbuftime", "_soundbuftime", "tabEnabled", "tabEnabled", "tabIndex", "tabIndex", "_target", "trackAsMenu", "trackAsMenu", "_url", "useHandCursor", "useHandCursor", "_visible", "_visible", "_width", "_width", "_x", "_x", "_xmouse", "_xscale", "_xscale", "_y", "_y", "_ymouse", "_yscale", "_yscale"];

    constructor (nativeButton: SimpleButton) {
      false && super();
    }

    private _nativeAS3Object: SimpleButton;

    // JS -> AS Bindings

    _alpha: any;
    blendMode: any;
    cacheAsBitmap: any;
    enabled: any;
    filters: any;
    _focusrect: any;
    getDepth: () => any;
    _height: any;
    _highquality: any;
    menu: any;
    _name: any;
    _parent: any;
    _quality: any;
    _rotation: any;
    scale9Grid: any;
    _soundbuftime: any;
    tabEnabled: any;
    tabIndex: any;
    _target: any;
    trackAsMenu: any;
    _url: any;
    useHandCursor: any;
    _visible: any;
    _width: any;
    _x: any;
    _xmouse: any;
    _xscale: any;
    _y: any;
    _ymouse: any;
    _yscale: any;

    // AS -> JS Bindings

    // __as3Object: flash.display.SimpleButton;
    _init(nativeButton: SimpleButton): any {
      this._nativeAS3Object = nativeButton;
      initDefaultListeners(this);
    }
    get _as3Object(): SimpleButton {
      return this._nativeAS3Object;
    }
  }
}
