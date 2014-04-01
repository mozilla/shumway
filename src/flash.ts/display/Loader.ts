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
// Class: Loader
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Loader extends flash.display.DisplayObjectContainer {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.display.Loader");
    }
    // Static   JS -> AS Bindings
    static cloneParams: (lc: flash.system.LoaderContext) => void;
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    load: (request: flash.net.URLRequest, context: flash.system.LoaderContext = null) => void;
    _buildLoaderContext: (context: flash.system.LoaderContext) => flash.system.LoaderContext;
    loadBytes: (bytes: flash.utils.ByteArray, context: flash.system.LoaderContext = null) => void;
    close: () => void;
    unload: () => void;
    unloadAndStop: (gc: boolean = true) => void;
    addChild: (child: flash.display.DisplayObject) => flash.display.DisplayObject;
    addChildAt: (child: flash.display.DisplayObject, index: number /*int*/) => flash.display.DisplayObject;
    removeChild: (child: flash.display.DisplayObject) => flash.display.DisplayObject;
    removeChildAt: (index: number /*int*/) => flash.display.DisplayObject;
    setChildIndex: (child: flash.display.DisplayObject, index: number /*int*/) => void;
    uncaughtErrorEvents: flash.events.UncaughtErrorEvents;
    // Instance AS -> JS Bindings
    _getJPEGLoaderContextdeblockingfilter(context: ASObject): number {
      context = context;
      notImplemented("public flash.display.Loader::_getJPEGLoaderContextdeblockingfilter"); return;
    }
    _loadBytes(bytes: flash.utils.ByteArray, checkPolicyFile: boolean, applicationDomain: flash.system.ApplicationDomain, securityDomain: flash.system.SecurityDomain, requestedContentParent: flash.display.DisplayObjectContainer, parameters: ASObject, deblockingFilter: number, allowLoadBytesCodeExecution: boolean, imageDecodingPolicy: string): void {
      bytes = bytes; checkPolicyFile = !!checkPolicyFile; applicationDomain = applicationDomain; securityDomain = securityDomain; requestedContentParent = requestedContentParent; parameters = parameters; deblockingFilter = +deblockingFilter; allowLoadBytesCodeExecution = !!allowLoadBytesCodeExecution; imageDecodingPolicy = "" + imageDecodingPolicy;
      notImplemented("public flash.display.Loader::_loadBytes"); return;
    }
    _unload(halt: boolean, gc: boolean): void {
      halt = !!halt; gc = !!gc;
      notImplemented("public flash.display.Loader::_unload"); return;
    }
    _close(): void {
      notImplemented("public flash.display.Loader::_close"); return;
    }
    get content(): flash.display.DisplayObject {
      notImplemented("public flash.display.Loader::get content"); return;
    }
    get contentLoaderInfo(): flash.display.LoaderInfo {
      notImplemented("public flash.display.Loader::get contentLoaderInfo"); return;
    }
    _getUncaughtErrorEvents(): flash.events.UncaughtErrorEvents {
      notImplemented("public flash.display.Loader::_getUncaughtErrorEvents"); return;
    }
    _setUncaughtErrorEvents(value: flash.events.UncaughtErrorEvents): void {
      value = value;
      notImplemented("public flash.display.Loader::_setUncaughtErrorEvents"); return;
    }
    _load(request: flash.net.URLRequest, checkPolicyFile: boolean, applicationDomain: flash.system.ApplicationDomain, securityDomain: flash.system.SecurityDomain, requestedContentParent: flash.display.DisplayObjectContainer, parameters: ASObject, deblockingFilter: number, allowCodeExecution: boolean, imageDecodingPolicy: string): void {
      request = request; checkPolicyFile = !!checkPolicyFile; applicationDomain = applicationDomain; securityDomain = securityDomain; requestedContentParent = requestedContentParent; parameters = parameters; deblockingFilter = +deblockingFilter; allowCodeExecution = !!allowCodeExecution; imageDecodingPolicy = "" + imageDecodingPolicy;
      notImplemented("public flash.display.Loader::_load"); return;
    }
  }
}
