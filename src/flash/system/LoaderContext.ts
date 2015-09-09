/**
 * Copyright 2015 Mozilla Foundation
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
// Class: LoaderContext
module Shumway.AVMX.AS.flash.system {

  export class LoaderContext extends ASObject {

    static classInitializer: any = null;

    static instanceSymbols: string [] = ["checkPolicyFile!", "applicationDomain!", "sec!",
                                         "allowCodeImport!", "requestedContentParent!",
                                         "parameters!", "imageDecodingPolicy!"];

    private $BgcheckPolicyFile: boolean;
    private $BgapplicationDomain: flash.system.ApplicationDomain;
    private $BgsecurityDomain: flash.system.SecurityDomain;
    private $BgallowCodeImport: boolean;
    private $BgrequestedContentParent: flash.display.DisplayObjectContainer;
    private $Bgparameters: ASObject;
    private $BgimageDecodingPolicy: string;

    _avm1Context: AVM1.AVM1Context;

    constructor(checkPolicyFile: boolean = false,
                applicationDomain: flash.system.ApplicationDomain = null,
                securityDomain: flash.system.SecurityDomain = null)
    {
      super();
      this.$BgcheckPolicyFile = !!checkPolicyFile;
      this.$BgapplicationDomain = applicationDomain;
      this.$BgsecurityDomain = securityDomain;
      this.$BgimageDecodingPolicy = flash.system.ImageDecodingPolicy.ON_DEMAND;

      this._avm1Context = null;
    }

    public get imageDecodingPolicy(): string {
      return this.$BgimageDecodingPolicy;
    }

    public get parameters(): ASObject {
      return this.$Bgparameters;
    }

    public get requestedContentParent(): flash.display.DisplayObjectContainer {
      return this.$BgrequestedContentParent;
    }

    public get allowCodeImport(): boolean {
      return this.$BgallowCodeImport;
    }

    public get securityDomain(): flash.system.SecurityDomain {
      return this.$BgsecurityDomain;
    }

    public get applicationDomain(): flash.system.ApplicationDomain {
      return this.$BgapplicationDomain;
    }

    public get checkPolicyFile(): boolean {
      return this.$BgcheckPolicyFile;
    }
  }
}
