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
  export class LoaderInfo extends flash.events.EventDispatcher {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["parameters", "uncaughtErrorEvents", "dispatchEvent"];
    
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.display.LoaderInfo");
    }
    
    // JS -> AS Bindings
    
    parameters: ASObject;
    uncaughtErrorEvents: flash.events.UncaughtErrorEvents;
    dispatchEvent: (event: flash.events.Event) => boolean;
    
    // AS -> JS Bindings
    static getLoaderInfoByDefinition(object: ASObject): flash.display.LoaderInfo {
      object = object;
      notImplemented("public flash.display.LoaderInfo::static getLoaderInfoByDefinition"); return;
    }
    
    // _loaderURL: string;
    // _url: string;
    // _isURLInaccessible: boolean;
    // _bytesLoaded: number /*uint*/;
    // _bytesTotal: number /*uint*/;
    // _applicationDomain: flash.system.ApplicationDomain;
    // _swfVersion: number /*uint*/;
    // _actionScriptVersion: number /*uint*/;
    // _frameRate: number;
    // _parameters: ASObject;
    // _width: number /*int*/;
    // _height: number /*int*/;
    // _contentType: string;
    // _sharedEvents: flash.events.EventDispatcher;
    // _parentSandboxBridge: ASObject;
    // _childSandboxBridge: ASObject;
    // _sameDomain: boolean;
    // _childAllowsParent: boolean;
    // _parentAllowsChild: boolean;
    // _loader: flash.display.Loader;
    // _content: flash.display.DisplayObject;
    // _bytes: flash.utils.ByteArray;
    // _uncaughtErrorEvents: flash.events.UncaughtErrorEvents;
    get loaderURL(): string {
      notImplemented("public flash.display.LoaderInfo::get loaderURL"); return;
      // return this._loaderURL;
    }
    get url(): string {
      notImplemented("public flash.display.LoaderInfo::get url"); return;
      // return this._url;
    }
    get isURLInaccessible(): boolean {
      notImplemented("public flash.display.LoaderInfo::get isURLInaccessible"); return;
      // return this._isURLInaccessible;
    }
    get bytesLoaded(): number /*uint*/ {
      notImplemented("public flash.display.LoaderInfo::get bytesLoaded"); return;
      // return this._bytesLoaded;
    }
    get bytesTotal(): number /*uint*/ {
      notImplemented("public flash.display.LoaderInfo::get bytesTotal"); return;
      // return this._bytesTotal;
    }
    get applicationDomain(): flash.system.ApplicationDomain {
      notImplemented("public flash.display.LoaderInfo::get applicationDomain"); return;
      // return this._applicationDomain;
    }
    get swfVersion(): number /*uint*/ {
      notImplemented("public flash.display.LoaderInfo::get swfVersion"); return;
      // return this._swfVersion;
    }
    get actionScriptVersion(): number /*uint*/ {
      notImplemented("public flash.display.LoaderInfo::get actionScriptVersion"); return;
      // return this._actionScriptVersion;
    }
    get frameRate(): number {
      notImplemented("public flash.display.LoaderInfo::get frameRate"); return;
      // return this._frameRate;
    }
    get width(): number /*int*/ {
      notImplemented("public flash.display.LoaderInfo::get width"); return;
      // return this._width;
    }
    get height(): number /*int*/ {
      notImplemented("public flash.display.LoaderInfo::get height"); return;
      // return this._height;
    }
    get contentType(): string {
      notImplemented("public flash.display.LoaderInfo::get contentType"); return;
      // return this._contentType;
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
      notImplemented("public flash.display.LoaderInfo::get loader"); return;
      // return this._loader;
    }
    get content(): flash.display.DisplayObject {
      notImplemented("public flash.display.LoaderInfo::get content"); return;
      // return this._content;
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
