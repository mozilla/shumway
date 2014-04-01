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
// Class: LoaderInfo
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  export class LoaderInfo extends flash.events.EventDispatcher {
    static initializer: any = null;
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.display.LoaderInfo");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    static getLoaderInfoByDefinition(object: ASObject): flash.display.LoaderInfo {
      object = object;
      notImplemented("public flash.display.LoaderInfo::static getLoaderInfoByDefinition"); return;
    }
    // Instance JS -> AS Bindings
    parameters: ASObject;
    dispatchEvent: (event: flash.events.Event) => boolean;
    uncaughtErrorEvents: flash.events.UncaughtErrorEvents;
    // Instance AS -> JS Bindings
    get loaderURL(): string {
      notImplemented("public flash.display.LoaderInfo::get loaderURL"); return;
    }
    get url(): string {
      notImplemented("public flash.display.LoaderInfo::get url"); return;
    }
    get isURLInaccessible(): boolean {
      notImplemented("public flash.display.LoaderInfo::get isURLInaccessible"); return;
    }
    get bytesLoaded(): number /*uint*/ {
      notImplemented("public flash.display.LoaderInfo::get bytesLoaded"); return;
    }
    get bytesTotal(): number /*uint*/ {
      notImplemented("public flash.display.LoaderInfo::get bytesTotal"); return;
    }
    get applicationDomain(): flash.system.ApplicationDomain {
      notImplemented("public flash.display.LoaderInfo::get applicationDomain"); return;
    }
    get swfVersion(): number /*uint*/ {
      notImplemented("public flash.display.LoaderInfo::get swfVersion"); return;
    }
    get actionScriptVersion(): number /*uint*/ {
      notImplemented("public flash.display.LoaderInfo::get actionScriptVersion"); return;
    }
    get frameRate(): number {
      notImplemented("public flash.display.LoaderInfo::get frameRate"); return;
    }
    get width(): number /*int*/ {
      notImplemented("public flash.display.LoaderInfo::get width"); return;
    }
    get height(): number /*int*/ {
      notImplemented("public flash.display.LoaderInfo::get height"); return;
    }
    get contentType(): string {
      notImplemented("public flash.display.LoaderInfo::get contentType"); return;
    }
    get sharedEvents(): flash.events.EventDispatcher {
      notImplemented("public flash.display.LoaderInfo::get sharedEvents"); return;
    }
    get parentSandboxBridge(): ASObject {
      notImplemented("public flash.display.LoaderInfo::get parentSandboxBridge"); return;
    }
    set parentSandboxBridge(door: ASObject) {
      door = door;
      notImplemented("public flash.display.LoaderInfo::set parentSandboxBridge"); return;
    }
    get childSandboxBridge(): ASObject {
      notImplemented("public flash.display.LoaderInfo::get childSandboxBridge"); return;
    }
    set childSandboxBridge(door: ASObject) {
      door = door;
      notImplemented("public flash.display.LoaderInfo::set childSandboxBridge"); return;
    }
    get sameDomain(): boolean {
      notImplemented("public flash.display.LoaderInfo::get sameDomain"); return;
    }
    get childAllowsParent(): boolean {
      notImplemented("public flash.display.LoaderInfo::get childAllowsParent"); return;
    }
    get parentAllowsChild(): boolean {
      notImplemented("public flash.display.LoaderInfo::get parentAllowsChild"); return;
    }
    get loader(): flash.display.Loader {
      notImplemented("public flash.display.LoaderInfo::get loader"); return;
    }
    get content(): flash.display.DisplayObject {
      notImplemented("public flash.display.LoaderInfo::get content"); return;
    }
    get bytes(): flash.utils.ByteArray {
      notImplemented("public flash.display.LoaderInfo::get bytes"); return;
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
