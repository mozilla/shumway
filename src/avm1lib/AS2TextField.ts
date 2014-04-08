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
// Class: AS2TextField
module Shumway.AVM2.AS.avm1lib {
  import TextField = Shumway.AVM2.AS.flash.text.TextField;

  export class AS2TextField extends ASNative {

    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // Called whenever an instance of the class is initialized.
    static initializer: any = null;

    // List of static symbols to link.
    static staticBindings: string [] = null; // [];

    // List of instance symbols to link.
    static bindings: string [] = ["_alpha", "_alpha", "antiAliasType", "antiAliasType", "autoSize", "autoSize", "background", "background", "backgroundColor", "backgroundColor", "border", "border", "borderColor", "borderColor", "bottomScroll", "condenseWhite", "condenseWhite", "embedFonts", "embedFonts", "getNewTextFormat", "getTextFormat", "_height", "_height", "_highquality", "_highquality", "hscroll", "hscroll", "html", "html", "htmlText", "htmlText", "length", "maxChars", "maxChars", "maxhscroll", "maxscroll", "multiline", "multiline", "_name", "_name", "_parent", "_parent", "password", "password", "_quality", "_quality", "_rotation", "_rotation", "scroll", "scroll", "selectable", "selectable", "setNewTextFormat", "setTextFormat", "_soundbuftime", "_soundbuftime", "tabEnabled", "tabEnabled", "tabIndex", "tabIndex", "_target", "text", "text", "textColor", "textColor", "textHeight", "textHeight", "textWidth", "textWidth", "type", "type", "_url", "_visible", "_visible", "_width", "_width", "wordWrap", "wordWrap", "_x", "_x", "_xmouse", "_xscale", "_xscale", "_y", "_y", "_ymouse", "_yscale", "_yscale"];

    constructor (nativeTextField: TextField) {
      false && super();

      this._variable = '';
    }

    private _nativeAS3Object: TextField;
    _variable: string;


    // JS -> AS Bindings

    _alpha: any;
    antiAliasType: any;
    autoSize: any;
    background: any;
    backgroundColor: any;
    border: any;
    borderColor: any;
    bottomScroll: any;
    condenseWhite: any;
    embedFonts: any;
    getNewTextFormat: () => any;
    getTextFormat: () => any;
    _height: any;
    _highquality: any;
    hscroll: any;
    html: any;
    htmlText: any;
    length: any;
    maxChars: any;
    maxhscroll: any;
    maxscroll: any;
    multiline: any;
    _name: any;
    _parent: any;
    password: any;
    _quality: any;
    _rotation: any;
    scroll: any;
    selectable: any;
    setNewTextFormat: (value: any) => any;
    setTextFormat: () => any;
    _soundbuftime: any;
    tabEnabled: any;
    tabIndex: any;
    _target: any;
    text: any;
    textColor: any;
    textHeight: any;
    textWidth: any;
    type: any;
    _url: any;
    _visible: any;
    _width: any;
    wordWrap: any;
    _x: any;
    _xmouse: any;
    _xscale: any;
    _y: any;
    _ymouse: any;
    _yscale: any;

    // AS -> JS Bindings

    _init(nativeTextField: TextField): any {
      this._nativeAS3Object = nativeTextField;
      (<any> nativeTextField)._as2Object = this;
      initDefaultListeners(this);
    }
    get _as3Object(): TextField {
      return this._nativeAS3Object;
    }
    get variable(): any {
      return this._variable;
    }
    set variable(name: any) {
      if (name === this._variable) {
        return;
      }
      this._variable = name;
      var instance = <any> this._nativeAS3Object; // TODO remove any
      var hasPath = name.indexOf('.') >= 0 || name.indexOf(':') >= 0;
      var clip;
      if (hasPath) {
        var targetPath = name.split(/[.:\/]/g);
        name = targetPath.pop();
        if (targetPath[0] == '_root' || targetPath[0] === '') {
          clip = instance.root._getAS2Object();
          targetPath.shift();
          if (targetPath[0] === '') {
            targetPath.shift();
          }
        } else {
          clip = instance._parent._getAS2Object();
        }
        while (targetPath.length > 0) {
          var childName = targetPath.shift();
          clip = clip.asGetPublicProperty(childName) || clip[childName];
          if (!clip) {
            throw new Error('Cannot find ' + childName + ' variable');
          }
        }
      } else {
        clip = instance._parent._getAS2Object();
      }
      if (!clip.asHasProperty(undefined, name, 0)) {
        clip.asSetPublicProperty(name, instance.text);
      }
      instance._addEventListener('advanceFrame', function() {
        instance.text = '' + clip.asGetPublicProperty(name);
      });
    }
  }
}
