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
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // [];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.system.Security");
    }
    
    // JS -> AS Bindings
    static REMOTE: string = "remote";
    static LOCAL_WITH_FILE: string = "localWithFile";
    static LOCAL_WITH_NETWORK: string = "localWithNetwork";
    static LOCAL_TRUSTED: string = "localTrusted";
    static APPLICATION: string = "application";
    
    
    // AS -> JS Bindings
    // static _exactSettings: boolean;
    // static _disableAVM1Loading: boolean;
    // static _sandboxType: string;
    // static _pageDomain: string;
    get exactSettings(): boolean {
      notImplemented("public flash.system.Security::get exactSettings"); return;
      // return this._exactSettings;
    }
    set exactSettings(value: boolean) {
      value = !!value;
      notImplemented("public flash.system.Security::set exactSettings"); return;
      // this._exactSettings = value;
    }
    get disableAVM1Loading(): boolean {
      notImplemented("public flash.system.Security::get disableAVM1Loading"); return;
      // return this._disableAVM1Loading;
    }
    set disableAVM1Loading(value: boolean) {
      value = !!value;
      notImplemented("public flash.system.Security::set disableAVM1Loading"); return;
      // this._disableAVM1Loading = value;
    }
    get sandboxType(): string {
      notImplemented("public flash.system.Security::get sandboxType"); return;
      // return this._sandboxType;
    }
    get pageDomain(): string {
      notImplemented("public flash.system.Security::get pageDomain"); return;
      // return this._pageDomain;
    }
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
    static showSettings(panel: string = "default"): void {
      panel = "" + panel;
      notImplemented("public flash.system.Security::static showSettings"); return;
    }
    static duplicateSandboxBridgeInputArguments(toplevel: ASObject, args: any []): any [] {
      toplevel = toplevel; args = args;
      notImplemented("public flash.system.Security::static duplicateSandboxBridgeInputArguments"); return;
    }
    static duplicateSandboxBridgeOutputArgument(toplevel: ASObject, arg: any): any {
      toplevel = toplevel;
      notImplemented("public flash.system.Security::static duplicateSandboxBridgeOutputArgument"); return;
    }
    
  }
}
