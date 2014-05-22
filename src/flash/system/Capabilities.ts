/**
 * Copyright 2014 Mozilla Foundation
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
// Class: Capabilities
module Shumway.AVM2.AS.flash.system {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import toKeyValueArray = Shumway.ObjectUtilities.toKeyValueArray;

  declare var window;

  export class Capabilities extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.system.Capabilities");
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    // static _isEmbeddedInAcrobat: boolean;
    // static _hasEmbeddedVideo: boolean;
    // static _hasAudio: boolean;
    // static _avHardwareDisable: boolean;
    private static _hasAccessibility: boolean = false;
    // static _hasAudioEncoder: boolean;
    // static _hasMP3: boolean;
    // static _hasPrinting: boolean;
    // static _hasScreenBroadcast: boolean;
    // static _hasScreenPlayback: boolean;
    // static _hasStreamingAudio: boolean;
    // static _hasStreamingVideo: boolean;
    // static _hasVideoEncoder: boolean;
    private static _isDebugger: boolean = false;
    // static _localFileReadDisable: boolean;
    private static _language: string = 'en';
    private static _manufacturer: string = 'Mozilla Research';
    private static _os: string = null;
    // static _cpuArchitecture: string;
    private static _playerType: string = 'PlugIn';
    private static _version: string = 'SHUMWAY 10,0,0,0';
    // static _screenColor: string;
    // static _pixelAspectRatio: number;
    // static _screenDPI: number;
    // static _touchscreenType: string;
    // static _hasIME: boolean;
    // static _hasTLS: boolean;
    // static _maxLevelIDC: string;
    // static _supports32BitProcesses: boolean;
    // static _supports64BitProcesses: boolean;
    // static __internal: number /*uint*/;
    static get isEmbeddedInAcrobat(): boolean {
      notImplemented("public flash.system.Capabilities::get isEmbeddedInAcrobat"); return;
      // return Capabilities._isEmbeddedInAcrobat;
    }
    static get hasEmbeddedVideo(): boolean {
      notImplemented("public flash.system.Capabilities::get hasEmbeddedVideo"); return;
      // return Capabilities._hasEmbeddedVideo;
    }
    static get hasAudio(): boolean {
      notImplemented("public flash.system.Capabilities::get hasAudio"); return;
      // return Capabilities._hasAudio;
    }
    static get avHardwareDisable(): boolean {
      notImplemented("public flash.system.Capabilities::get avHardwareDisable"); return;
      // return Capabilities._avHardwareDisable;
    }
    static get hasAccessibility(): boolean {
      somewhatImplemented("public flash.system.Capabilities::get hasAccessibility");
      return Capabilities._hasAccessibility;
    }
    static get hasAudioEncoder(): boolean {
      notImplemented("public flash.system.Capabilities::get hasAudioEncoder"); return;
      // return Capabilities._hasAudioEncoder;
    }
    static get hasMP3(): boolean {
      notImplemented("public flash.system.Capabilities::get hasMP3"); return;
      // return Capabilities._hasMP3;
    }
    static get hasPrinting(): boolean {
      notImplemented("public flash.system.Capabilities::get hasPrinting"); return;
      // return Capabilities._hasPrinting;
    }
    static get hasScreenBroadcast(): boolean {
      notImplemented("public flash.system.Capabilities::get hasScreenBroadcast"); return;
      // return Capabilities._hasScreenBroadcast;
    }
    static get hasScreenPlayback(): boolean {
      notImplemented("public flash.system.Capabilities::get hasScreenPlayback"); return;
      // return Capabilities._hasScreenPlayback;
    }
    static get hasStreamingAudio(): boolean {
      notImplemented("public flash.system.Capabilities::get hasStreamingAudio"); return;
      // return Capabilities._hasStreamingAudio;
    }
    static get hasStreamingVideo(): boolean {
      notImplemented("public flash.system.Capabilities::get hasStreamingVideo"); return;
      // return Capabilities._hasStreamingVideo;
    }
    static get hasVideoEncoder(): boolean {
      notImplemented("public flash.system.Capabilities::get hasVideoEncoder"); return;
      // return Capabilities._hasVideoEncoder;
    }
    static get isDebugger(): boolean {
      somewhatImplemented("public flash.system.Capabilities::get isDebugger"); return;
      return Capabilities._isDebugger;
    }
    static get localFileReadDisable(): boolean {
      notImplemented("public flash.system.Capabilities::get localFileReadDisable"); return;
      // return Capabilities._localFileReadDisable;
    }
    static get language(): string {
      somewhatImplemented("public flash.system.Capabilities::get language");
      return Capabilities._language;
    }
    static get manufacturer(): string {
      somewhatImplemented("public flash.system.Capabilities::get manufacturer");
      return Capabilities._manufacturer;
    }
    static get os(): string {
      if (Capabilities._os === null) {
        var os;
        var userAgent = window.navigator.userAgent;
        if (userAgent.indexOf("Macintosh") > 0) {
          os = "Mac OS 10.5.2";
        } else if (userAgent.indexOf("Windows") > 0) {
          os = "Windows XP";
        } else if (userAgent.indexOf("Linux") > 0) {
          os = "Linux";
        } else if (/(iPad|iPhone|iPod|Android)/.test(userAgent)) {
          os = "iPhone3,1";
        } else {
          notImplemented("public flash.system.Capabilities::get os");
        }
        Capabilities._os = os;
      }
      return Capabilities._os;
    }
    static get cpuArchitecture(): string {
      notImplemented("public flash.system.Capabilities::get cpuArchitecture"); return;
      // return Capabilities._cpuArchitecture;
    }
    static get playerType(): string {
      somewhatImplemented("public flash.system.Capabilities::get playerType"); return;
      return Capabilities._playerType;
    }
    static get serverString(): string {
      var str = toKeyValueArray({OS: Capabilities.os}).map(function (pair) {
        return pair[0] + "=" + encodeURIComponent(pair[1]);
      }).join("&");
      somewhatImplemented("Capabilities.serverString: " + str);
      return str;
    }
    static get version(): string {
      return Capabilities._version;
    }
    static get screenColor(): string {
      notImplemented("public flash.system.Capabilities::get screenColor"); return;
      // return Capabilities._screenColor;
    }
    static get pixelAspectRatio(): number {
      notImplemented("public flash.system.Capabilities::get pixelAspectRatio"); return;
      // return Capabilities._pixelAspectRatio;
    }
    static get screenDPI(): number {
      notImplemented("public flash.system.Capabilities::get screenDPI"); return;
      // return Capabilities._screenDPI;
    }
    static get screenResolutionX(): number {
      somewhatImplemented("public flash.system.Capabilities::get screenResolutionX");
      return window.screen.width; // TODO check
    }
    static get screenResolutionY(): number {
      somewhatImplemented("public flash.system.Capabilities::get screenResolutionY");
      return window.screen.height; // TODO check
    }
    static get touchscreenType(): string {
      notImplemented("public flash.system.Capabilities::get touchscreenType"); return;
      // return Capabilities._touchscreenType;
    }
    static get hasIME(): boolean {
      notImplemented("public flash.system.Capabilities::get hasIME"); return;
      // return Capabilities._hasIME;
    }
    static get hasTLS(): boolean {
      notImplemented("public flash.system.Capabilities::get hasTLS"); return;
      // return Capabilities._hasTLS;
    }
    static get maxLevelIDC(): string {
      notImplemented("public flash.system.Capabilities::get maxLevelIDC"); return;
      // return Capabilities._maxLevelIDC;
    }
    static get supports32BitProcesses(): boolean {
      notImplemented("public flash.system.Capabilities::get supports32BitProcesses"); return;
      // return Capabilities._supports32BitProcesses;
    }
    static get supports64BitProcesses(): boolean {
      notImplemented("public flash.system.Capabilities::get supports64BitProcesses"); return;
      // return Capabilities._supports64BitProcesses;
    }
    static get _internal(): number /*uint*/ {
      notImplemented("public flash.system.Capabilities::get _internal"); return;
      // return Capabilities.__internal;
    }
    static hasMultiChannelAudio(type: string): boolean {
      type = asCoerceString(type);
      notImplemented("public flash.system.Capabilities::static hasMultiChannelAudio"); return;
    }
    
  }
}
