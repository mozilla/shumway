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

///<reference path='../references.ts' />

module Shumway.AVM1.Lib {
  import flash = Shumway.AVMX.AS.flash;

  var capabilitiesProperties = [
    'avHardwareDisable', 'hasAccessibility', 'hasAudio', 'hasAudioEncoder',
    'hasEmbeddedVideo', 'hasIME', 'hasMP3', 'hasPrinting', 'hasScreenBroadcast',
    'hasScreenPlayback', 'hasStreamingAudio', 'hasStreamingVideo',
    'hasVideoEncoder', 'isDebugger', 'language', 'localFileReadDisable',
    'manufacturer', 'os', 'pixelAspectRatio', 'playerType', 'screenColor',
    'screenDPI', 'screenResolutionX', 'screenResolutionY', 'serverString',
    'version'
  ];

  class AVM1Capabilities extends AVM1Object {
    constructor(context: AVM1Context) {
      super(context);
      this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
      var as3Capabilities = context.sec.flash.system.Capabilities.axClass;
      capabilitiesProperties.forEach((name) => {
        var getter = { alCall: function () { return as3Capabilities.axGetPublicProperty(name); }};
        var desc = new AVM1PropertyDescriptor(AVM1PropertyFlags.ACCESSOR |
                                              AVM1PropertyFlags.DONT_DELETE |
                                              AVM1PropertyFlags.DONT_ENUM,
                                              null, getter);
        this.alSetOwnProperty(name, desc);
      }, this);
    }
  }

  class AVM1Security extends AVM1Object {
    constructor(context: AVM1Context) {
      super(context);
      this.alPrototype = context.builtins.Object.alGetPrototypeProperty();
      alDefineObjectProperties(this, {
        sandboxType: {
          get: this.getSandboxType
        },
        allowDomain: {
          value: this.allowDomain
        },
        allowInsecureDomain: {
          value: this.allowInsecureDomain
        },
        loadPolicyFile: {
          value: this.loadPolicyFile
        }
      });
    }

    getSandboxType(): string {
      return this.context.sec.flash.system.Security.axClass.sandboxType;
    }

    allowDomain(domain: string): void {
      domain = alCoerceString(this.context, domain);
      this.context.sec.flash.system.Security.axClass.allowDomain(domain);
    }

    allowInsecureDomain(domain: string): void {
      domain = alCoerceString(this.context, domain);
      this.context.sec.flash.system.Security.axClass.allowInsecureDomain(domain);
    }

    loadPolicyFile(url: string): void {
      url = alCoerceString(this.context, url);
      this.context.sec.flash.system.Security.axClass.loadPolicyFile(url);
    }
  }

  export class AVM1System extends AVM1Object {
    static _capabilities: AVM1Object;
    static _security: AVM1Object;

    static alInitStatic(context: AVM1Context): void  {
      this._capabilities = new AVM1Capabilities(context);
      this._security = new AVM1Security(context);
    }

    static createAVM1Class(context: AVM1Context): AVM1Object {
      return wrapAVM1NativeClass(context, false, AVM1System,
        ['capabilities#', 'security#'],
        []);
    }

    public static getCapabilities(context: AVM1Context) {
      var staticState: typeof AVM1System = context.getStaticState(AVM1System);
      return staticState._capabilities;
    }

    public static getSecurity(context: AVM1Context) {
      var staticState: typeof AVM1System = context.getStaticState(AVM1System);
      return staticState._security;
    }
  }
}
