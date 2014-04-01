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
// Class: Security
module Shumway.AVM2.AS.flash.system {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Security extends ASNative {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.system.Security");
    }
    // Static   JS -> AS Bindings
    static createSandboxBridgeProxyFunction: (targetFunc: ASObject, targetObj: ASObject, srcToplevel: ASObject, destToplevel: ASObject) => ASObject;
    // Static   AS -> JS Bindings
    static allowDomain(): void {
      notImplemented("public flash.system.Security::static allowDomain"); return;
    }
    static allowInsecureDomain(): void {
      notImplemented("public flash.system.Security::static allowInsecureDomain"); return;
    }
    static loadPolicyFile(url: string): void {
      url = "" + url;
      notImplemented("public flash.system.Security::static loadPolicyFile"); return;
    }
    get exactSettings(): boolean {
      notImplemented("public flash.system.Security::get exactSettings"); return;
    }
    set exactSettings(value: boolean) {
      value = !!value;
      notImplemented("public flash.system.Security::set exactSettings"); return;
    }
    get disableAVM1Loading(): boolean {
      notImplemented("public flash.system.Security::get disableAVM1Loading"); return;
    }
    set disableAVM1Loading(value: boolean) {
      value = !!value;
      notImplemented("public flash.system.Security::set disableAVM1Loading"); return;
    }
    static duplicateSandboxBridgeInputArguments(toplevel: ASObject, args: any []): any [] {
      toplevel = toplevel; args = args;
      notImplemented("public flash.system.Security::static duplicateSandboxBridgeInputArguments"); return;
    }
    static duplicateSandboxBridgeOutputArgument(toplevel: ASObject, arg: any): any {
      toplevel = toplevel;
      notImplemented("public flash.system.Security::static duplicateSandboxBridgeOutputArgument"); return;
    }
    static showSettings(panel: string = "default"): void {
      panel = "" + panel;
      notImplemented("public flash.system.Security::static showSettings"); return;
    }
    get sandboxType(): string {
      notImplemented("public flash.system.Security::get sandboxType"); return;
    }
    get pageDomain(): string {
      notImplemented("public flash.system.Security::get pageDomain"); return;
    }
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
  }
}
