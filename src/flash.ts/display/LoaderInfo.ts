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
 * limitations under the License.
 */
// Class: LoaderInfo
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class LoaderInfo extends flash.events.EventDispatcher {

    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // Called whenever an instance of the class is initialized.
    static initializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];

    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["parameters", "uncaughtErrorEvents", "dispatchEvent"];

    constructor () {
      false && super(undefined);
      flash.events.EventDispatcher.instanceConstructorNoInitialize.call(this);
      this._loaderURL = '';
      this._url = '';
      this._isURLInaccessible = false;
      this._bytesLoaded = 0;
      this._bytesTotal = 0;
      this._applicationDomain = null;
      this._swfVersion = 0;
      this._actionScriptVersion = 0;
      this._frameRate = 24;
      this._parameters = null;
      this._width = 0;
      this._height = 0;
      this._contentType = '';
      this._sharedEvents = null;
      this._parentSandboxBridge = null;
      this._childSandboxBridge = null;
      this._sameDomain = false;
      this._childAllowsParent = false;
      this._parentAllowsChild = false;
      this._loader = null;
      this._content = null;
      this._bytes = null;
      this._uncaughtErrorEvents = null;
    }

    // JS -> AS Bindings

    parameters: ASObject;
    uncaughtErrorEvents: flash.events.UncaughtErrorEvents;

    // AS -> JS Bindings
    static getLoaderInfoByDefinition(object: ASObject): flash.display.LoaderInfo {
      object = object;
      notImplemented("public flash.display.LoaderInfo::static getLoaderInfoByDefinition"); return;
    }

    _loaderURL: string;
    _url: string;
    _isURLInaccessible: boolean;
    _bytesLoaded: number /*uint*/;
    _bytesTotal: number /*uint*/;
    _applicationDomain: flash.system.ApplicationDomain;
    _swfVersion: number /*uint*/;
    _actionScriptVersion: number /*uint*/;
    _frameRate: number;
    _parameters: ASObject;
    _width: number /*int*/;
    _height: number /*int*/;
    _contentType: string;
    _sharedEvents: flash.events.EventDispatcher;
    _parentSandboxBridge: ASObject;
    _childSandboxBridge: ASObject;
    _sameDomain: boolean;
    _childAllowsParent: boolean;
    _parentAllowsChild: boolean;
    _loader: flash.display.Loader;
    _content: flash.display.DisplayObject;
    _bytes: flash.utils.ByteArray;
    _uncaughtErrorEvents: flash.events.UncaughtErrorEvents;

    get loaderURL(): string {
      return this._loaderURL;
    }

    get url(): string {
      return this._url;
    }

    get isURLInaccessible(): boolean {
      return this._isURLInaccessible;
    }

    get bytesLoaded(): number /*uint*/ {
      return this._bytesLoaded;
    }

    get bytesTotal(): number /*uint*/ {
      return this._bytesTotal;
    }

    get applicationDomain(): flash.system.ApplicationDomain {
      notImplemented("public flash.display.LoaderInfo::get applicationDomain"); return;
      // return this._applicationDomain;
    }

    get swfVersion(): number /*uint*/ {
      return this._swfVersion;
    }

    get actionScriptVersion(): number /*uint*/ {
      return this._actionScriptVersion;
    }

    get frameRate(): number {
      return this._frameRate;
    }

    get width(): number /*int*/ {
      return this._width;
    }

    get height(): number /*int*/ {
      return this._height;
    }

    get contentType(): string {
      return this._contentType;
    }

    get sharedEvents(): flash.events.EventDispatcher {
      notImplemented("public flash.display.LoaderInfo::get sharedEvents"); return;
      // return this._sharedEvents;
    }
    get parentSandboxBridge(): ASObject {
      notImplemented("public flash.display.LoaderInfo::get parentSandboxBridge"); return;
      // return this._parentSandboxBridge;
    }
    set parentSandboxBridge(door: ASObject) {
      door = door;
      notImplemented("public flash.display.LoaderInfo::set parentSandboxBridge"); return;
      // this._parentSandboxBridge = door;
    }
    get childSandboxBridge(): ASObject {
      notImplemented("public flash.display.LoaderInfo::get childSandboxBridge"); return;
      // return this._childSandboxBridge;
    }
    set childSandboxBridge(door: ASObject) {
      door = door;
      notImplemented("public flash.display.LoaderInfo::set childSandboxBridge"); return;
      // this._childSandboxBridge = door;
    }
    get sameDomain(): boolean {
      notImplemented("public flash.display.LoaderInfo::get sameDomain"); return;
      // return this._sameDomain;
    }
    get childAllowsParent(): boolean {
      notImplemented("public flash.display.LoaderInfo::get childAllowsParent"); return;
      // return this._childAllowsParent;
    }
    get parentAllowsChild(): boolean {
      notImplemented("public flash.display.LoaderInfo::get parentAllowsChild"); return;
      // return this._parentAllowsChild;
    }

    get loader(): flash.display.Loader {
      return this._loader;
    }

    get content(): flash.display.DisplayObject {
      return this._content;
    }

    get bytes(): flash.utils.ByteArray {
      notImplemented("public flash.display.LoaderInfo::get bytes"); return;
      // return this._bytes;
    }
    _getArgs(): ASObject {
      notImplemented("public flash.display.LoaderInfo::_getArgs"); return;
    }
    _getUncaughtErrorEvents(): flash.events.UncaughtErrorEvents {
      notImplemented("public flash.display.LoaderInfo::_getUncaughtErrorEvents"); return;
    }
    _setUncaughtErrorEvents(value: flash.events.UncaughtErrorEvents): void {
      value = value;
      notImplemented("public flash.display.LoaderInfo::_setUncaughtErrorEvents"); return;
    }
  }
}
