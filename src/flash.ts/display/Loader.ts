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
// Class: Loader
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class Loader extends flash.display.DisplayObjectContainer {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["uncaughtErrorEvents", "addChild", "addChildAt", "removeChild", "removeChildAt", "setChildIndex", "load", "sanitizeContext", "loadBytes", "close", "unload", "unloadAndStop", "cloneObject"];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.display.Loader");
    }
    
    // JS -> AS Bindings
    
    uncaughtErrorEvents: flash.events.UncaughtErrorEvents;
//    addChild: (child: flash.display.DisplayObject) => flash.display.DisplayObject;
//    addChildAt: (child: flash.display.DisplayObject, index: number /*int*/) => flash.display.DisplayObject;
//    removeChild: (child: flash.display.DisplayObject) => flash.display.DisplayObject;
//    removeChildAt: (index: number /*int*/) => flash.display.DisplayObject;
//    setChildIndex: (child: flash.display.DisplayObject, index: number /*int*/) => void;
    load: (request: flash.net.URLRequest, context: flash.system.LoaderContext = null) => void;
    sanitizeContext: (context: flash.system.LoaderContext) => flash.system.LoaderContext;
    loadBytes: (bytes: flash.utils.ByteArray, context: flash.system.LoaderContext = null) => void;
    close: () => void;
    unload: () => void;
    unloadAndStop: (gc: boolean = true) => void;
    cloneObject: (obj: ASObject) => ASObject;
    
    // AS -> JS Bindings
    
    // _content: flash.display.DisplayObject;
    // _contentLoaderInfo: flash.display.LoaderInfo;
    // _uncaughtErrorEvents: flash.events.UncaughtErrorEvents;
    get content(): flash.display.DisplayObject {
      notImplemented("public flash.display.Loader::get content"); return;
      // return this._content;
    }
    get contentLoaderInfo(): flash.display.LoaderInfo {
      notImplemented("public flash.display.Loader::get contentLoaderInfo"); return;
      // return this._contentLoaderInfo;
    }
    _close(): void {
      notImplemented("public flash.display.Loader::_close"); return;
    }
    _unload(stopExecution: boolean, gc: boolean): void {
      stopExecution = !!stopExecution; gc = !!gc;
      notImplemented("public flash.display.Loader::_unload"); return;
    }
    _getJPEGLoaderContextdeblockingfilter(context: flash.system.LoaderContext): number {
      context = context;
      notImplemented("public flash.display.Loader::_getJPEGLoaderContextdeblockingfilter"); return;
    }
    _getUncaughtErrorEvents(): flash.events.UncaughtErrorEvents {
      notImplemented("public flash.display.Loader::_getUncaughtErrorEvents"); return;
    }
    _setUncaughtErrorEvents(value: flash.events.UncaughtErrorEvents): void {
      value = value;
      notImplemented("public flash.display.Loader::_setUncaughtErrorEvents"); return;
    }
    _load(request: flash.net.URLRequest, checkPolicyFile: boolean, applicationDomain: flash.system.ApplicationDomain, securityDomain: flash.system.SecurityDomain, requestedContentParent: flash.display.DisplayObjectContainer, parameters: ASObject, deblockingFilter: number, allowCodeExecution: boolean, imageDecodingPolicy: string): void {
      request = request; checkPolicyFile = !!checkPolicyFile; applicationDomain = applicationDomain; securityDomain = securityDomain; requestedContentParent = requestedContentParent; parameters = parameters; deblockingFilter = +deblockingFilter; allowCodeExecution = !!allowCodeExecution; imageDecodingPolicy = asCoerceString(imageDecodingPolicy);
      notImplemented("public flash.display.Loader::_load"); return;
    }
    _loadBytes(bytes: flash.utils.ByteArray, checkPolicyFile: boolean, applicationDomain: flash.system.ApplicationDomain, securityDomain: flash.system.SecurityDomain, requestedContentParent: flash.display.DisplayObjectContainer, parameters: ASObject, deblockingFilter: number, allowCodeExecution: boolean, imageDecodingPolicy: string): void {
      bytes = bytes; checkPolicyFile = !!checkPolicyFile; applicationDomain = applicationDomain; securityDomain = securityDomain; requestedContentParent = requestedContentParent; parameters = parameters; deblockingFilter = +deblockingFilter; allowCodeExecution = !!allowCodeExecution; imageDecodingPolicy = asCoerceString(imageDecodingPolicy);
      notImplemented("public flash.display.Loader::_loadBytes"); return;
    }
  }
}
