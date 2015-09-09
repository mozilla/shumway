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
module Shumway.AVMX.AS.flash.system {
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import toKeyValueArray = Shumway.ObjectUtilities.toKeyValueArray;

  declare var window;

  export class Capabilities extends ASObject {
    
    static classInitializer: any = null;

    constructor () {
      super();
    }

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
    // static _localFileReadDisable: boolean;
    private static _language: string = 'en';
    private static _manufacturer: string = 'Mozilla Research';
    private static _os: string = null;
    // static _cpuArchitecture: string;
    private static _playerType: string = 'PlugIn';
    private static _version: string = 'SHUMWAY 10,0,0,0';
    // static _screenColor: string;
    // static _pixelAspectRatio: number;
    private static _screenDPI: number = 96; // Using standard CSS DPI for now.
    // static _touchscreenType: string;
    // static _hasIME: boolean;
    // static _hasTLS: boolean;
    // static _maxLevelIDC: string;
    // static _supports32BitProcesses: boolean;
    // static _supports64BitProcesses: boolean;
    // static __internal: number /*uint*/;
    static get isEmbeddedInAcrobat(): boolean {
      return false;
    }
    static get hasEmbeddedVideo(): boolean {
      release || notImplemented("public flash.system.Capabilities::get hasEmbeddedVideo"); return;
      // return Capabilities._hasEmbeddedVideo;
    }
    static get hasAudio(): boolean {
      // The documentation says "this property is always true".
      return true;
    }
    static get avHardwareDisable(): boolean {
      release || somewhatImplemented("public flash.system.Capabilities::get avHardwareDisable");
      return true;
    }
    static get hasAccessibility(): boolean {
      release || somewhatImplemented("public flash.system.Capabilities::get hasAccessibility");
      return Capabilities._hasAccessibility;
    }
    static get hasAudioEncoder(): boolean {
      release || somewhatImplemented("public flash.system.Capabilities::get hasAudioEncoder");
      return false;
    }
    static get hasMP3(): boolean {
      release || notImplemented("public flash.system.Capabilities::get hasMP3"); return;
      // return Capabilities._hasMP3;
    }
    static get hasPrinting(): boolean {
      release || somewhatImplemented("public flash.system.Capabilities::get hasPrinting");
      return false;
    }
    static get hasScreenBroadcast(): boolean {
      release || somewhatImplemented("public flash.system.Capabilities::get hasScreenBroadcast");
      return false;
    }
    static get hasScreenPlayback(): boolean {
      release || somewhatImplemented("public flash.system.Capabilities::get hasScreenPlayback");
      return false;
    }
    static get hasStreamingAudio(): boolean {
      release || notImplemented("public flash.system.Capabilities::get hasStreamingAudio"); return;
      // return Capabilities._hasStreamingAudio;
    }
    static get hasStreamingVideo(): boolean {
      release || notImplemented("public flash.system.Capabilities::get hasStreamingVideo"); return;
      // return Capabilities._hasStreamingVideo;
    }
    static get hasVideoEncoder(): boolean {
      release || somewhatImplemented("public flash.system.Capabilities::get hasVideoEncoder");
      return false;
    }
    static get isDebugger(): boolean {
      return false;
    }
    static get localFileReadDisable(): boolean {
      release || notImplemented("public flash.system.Capabilities::get localFileReadDisable"); return;
      // return Capabilities._localFileReadDisable;
    }
    static get language(): string {
      release || somewhatImplemented("public flash.system.Capabilities::get language");
      return Capabilities._language;
    }
    static get manufacturer(): string {
      release || somewhatImplemented("public flash.system.Capabilities::get manufacturer");
      return Capabilities._manufacturer;
    }
    static get os(): string {
      if (Capabilities._os === null) {
        var os;
        var userAgent = window.navigator.userAgent;
        if (userAgent.indexOf("Macintosh") > 0) {
          if (userAgent.indexOf('Mac OS X ') === -1) {
            os = 'Mac OS 10.6';
          } else {
            var versionStr = userAgent.split('Mac OS X ')[1];
            os = versionStr.substr(0, versionStr.indexOf(';'));
          }
        } else if (userAgent.indexOf("Windows") > 0) {
          os = "Windows XP";
        } else if (userAgent.indexOf("Linux") > 0) {
          os = "Linux";
        } else if (/(iPad|iPhone|iPod|Android)/.test(userAgent)) {
          os = "iPhone3,1";
        } else {
          release || somewhatImplemented("public flash.system.Capabilities::get os");
          os = "Generic OS";
        }
        Capabilities._os = os;
      }
      return Capabilities._os;
    }
    static get cpuArchitecture(): string {
      release || somewhatImplemented("public flash.system.Capabilities::get cpuArchitecture");
      return 'x86';
    }
    static get playerType(): string {
      return Capabilities._playerType;
    }
    static get serverString(): string {
      var str = toKeyValueArray({OS: Capabilities.os}).map(function (pair) {
        return pair[0] + "=" + encodeURIComponent(pair[1]);
      }).join("&");
      release || somewhatImplemented("Capabilities.serverString: " + str);
      return str;
    }
    static get version(): string {
      release || somewhatImplemented("public flash.system.Capabilities::get version");
      return Capabilities._version;
    }

    /**
     * This can be "color", "gray" or "bw" for black and white. I don't know when you'd have anything
     * other than "color".
     */
    static get screenColor(): string {
      return "color";
    }
    static get pixelAspectRatio(): number {
      release || somewhatImplemented("public flash.system.Capabilities::get pixelAspectRatio");
      return 1;
    }
    static get screenDPI(): number {
      release || somewhatImplemented("public flash.system.Capabilities::get screenDPI");
      return Capabilities._screenDPI;
    }
    static get screenResolutionX(): number {
      release || somewhatImplemented("public flash.system.Capabilities::get screenResolutionX");
      return window.screen.width; // TODO check
    }
    static get screenResolutionY(): number {
      release || somewhatImplemented("public flash.system.Capabilities::get screenResolutionY");
      return window.screen.height; // TODO check
    }
    static get touchscreenType(): string {
      return TouchscreenType.NONE;
    }
    static get hasIME(): boolean {
      return false;
    }
    static get hasTLS(): boolean {
      release || notImplemented("public flash.system.Capabilities::get hasTLS"); return;
      // return Capabilities._hasTLS;
    }
    static get maxLevelIDC(): string {
      release || notImplemented("public flash.system.Capabilities::get maxLevelIDC"); return;
      // return Capabilities._maxLevelIDC;
    }
    static get supports32BitProcesses(): boolean {
      release || notImplemented("public flash.system.Capabilities::get supports32BitProcesses"); return;
      // return Capabilities._supports32BitProcesses;
    }
    static get supports64BitProcesses(): boolean {
      release || notImplemented("public flash.system.Capabilities::get supports64BitProcesses"); return;
      // return Capabilities._supports64BitProcesses;
    }
    static get _internal(): number /*uint*/ {
      release || notImplemented("public flash.system.Capabilities::get _internal"); return;
      // return Capabilities.__internal;
    }
    static hasMultiChannelAudio(type: string): boolean {
      release || somewhatImplemented("public flash.system.Capabilities::static hasMultiChannelAudio");
      return false;
    }
    
  }
}
