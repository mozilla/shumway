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

  export class AVM1ExternalInterface {
    static createAVM1Class(): typeof AVM1ExternalInterface {
      return wrapAVM1Class(AVM1ExternalInterface,
        ['available', 'addCallback', 'call'],
        []);
    }

    public static get available():Boolean {
      return (<any>flash).external.ExternalInterface.asGetPublicProperty('available'); // REDUX
    }

    public static addCallback(methodName: string, instance: any, method: Function): boolean {
      try {
        (<any>flash).external.ExternalInterface.asCallPublicProperty('addCallback', [methodName, function () {
          return method.apply(instance, arguments);  // REDUX
        }]);
        return true;
      } catch (e) {
      }
      return false;
    }

    public static call(methodName: string): any {
      var args = Array.prototype.slice.call(arguments, 0);
      return (<any>flash).external.ExternalInterface.asCallPublicProperty('call', args); // REDUX
    }
  }
}