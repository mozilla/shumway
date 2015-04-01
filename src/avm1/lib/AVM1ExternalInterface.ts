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
  import ASObject = Shumway.AVMX.AS.ASObject;

  export class AVM1ExternalInterface extends ASObject {
    static createAVM1Class(securityDomain: ISecurityDomain): typeof AVM1ExternalInterface {
      return wrapAVM1Class(securityDomain, AVM1ExternalInterface,
        ['available', 'addCallback', 'call'],
        []);
    }

    public static get available(): boolean {
      return this.securityDomain.flash.external.ExternalInterface.available;
    }

    public static addCallback(methodName: string, instance: any, method: Function): boolean {
      try {
        this.securityDomain.flash.external.ExternalInterface.addCallback(methodName, function () {
          return method.apply(instance, arguments);
        });
        return true;
      } catch (e) {
      }
      return false;
    }

    public static call(methodName: string): any {
      var args = Array.prototype.slice.call(arguments, 0);
      return this.securityDomain.flash.external.ExternalInterface.call(args);
    }
  }
}