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

  export class AVM1ExternalInterface extends AVM1Object {
    static createAVM1Class(context: AVM1Context): AVM1Object {
      return wrapAVM1NativeClass(context, true, AVM1ExternalInterface,
        ['available#', 'addCallback', 'call'],
        []);
    }

    public static getAvailable(context: AVM1Context): boolean {
      return context.sec.flash.external.ExternalInterface.axClass.available;
    }

    public static addCallback(context: AVM1Context, methodName: string, instance: any, method: AVM1Function): boolean {
      methodName = alCoerceString(context, methodName);
      if (!alIsFunction(method)) {
        return false;
      }
      try {
        context.sec.flash.external.ExternalInterface.axClass.addCallback(methodName, function () {
          var args = Array.prototype.slice.call(arguments, 0);
          var result = context.executeFunction(method, instance, args);
          return result;
        });
        return true;
      } catch (e) {
      }
      return false;
    }

    public static call(context: AVM1Context, methodName: string, ...parameters: any[]): any {
      var args = [alCoerceString(context, methodName)];
      for (var i = 0; i < parameters.length; i++) {
        // TODO convert AVM1 objects to AVM2
        args.push(parameters[i]);
      }
      try {
        var result = context.sec.flash.external.ExternalInterface.axClass.call.apply(
          context.sec.flash.external.ExternalInterface.axClass, args);
        // TODO convert AVM2 result to AVM1
        return result;
      } catch (e) {
        return undefined;
      }
    }
  }
}
