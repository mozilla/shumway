/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
///<reference path='../references.ts' />

module Shumway.AVM2.AS {
  import assertNotImplemented = Shumway.Debug.assertNotImplemented;
  import notImplemented = Shumway.Debug.notImplemented;
  import createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;
  import Namespace = Shumway.AVM2.ABC.Namespace;
  import Multiname = Shumway.AVM2.ABC.Multiname;
  import throwError = Shumway.AVM2.Runtime.throwError;

  export module flash.utils {
    var asGetProperty = Object.prototype.asGetProperty;
    var asSetProperty = Object.prototype.asSetProperty;
    var asCallProperty = Object.prototype.asCallProperty;
    var asHasProperty = Object.prototype.asHasProperty;
    var asDeleteProperty = Object.prototype.asDeleteProperty;

    export class Proxy extends ASNative {
      public static protocol: IProtocol = Proxy.prototype;

      public asGetProperty(namespaces: Namespace [], name: any, flags: number) {
        var self: Object = this;
        if (self.asHasTraitProperty(namespaces, name, flags)) {
          return asGetProperty.call(self, namespaces, name, flags);
        }
        return asCallProperty.call(self, [Namespace.PROXY], "getProperty", 0, false, [name]);
      }

      public asSetProperty(namespaces: Namespace [], name: any, flags: number, value: any) {
        var self: Object = this;
        if (self.asHasTraitProperty(namespaces, name, flags)) {
          asSetProperty.call(self, namespaces, name, flags, value);
          return;
        }
        asCallProperty.call(self, [Namespace.PROXY], "setProperty", 0, false, [name, value]);
      }

      public asCallProperty(namespaces: Namespace [], name: any, flags: number, isLex: boolean, args: any []): any {
        var self: Object = this;
        if (self.asHasTraitProperty(namespaces, name, flags)) {
          return asCallProperty.call(self, namespaces, name, flags, false, args);
        }
        return asCallProperty.call(self, [Namespace.PROXY], "callProperty", 0, false, [name].concat(args));
      }

      public hasProperty(namespaces: Namespace [], name: any, flags: number): any {
        var self: Object = this;
        if (self.asHasTraitProperty(namespaces, name, flags)) {
          return asHasProperty.call(self, namespaces, name);
        }
        return asCallProperty.call(self, [Namespace.PROXY], "hasProperty", 0, false, [name]);
      }

      public deleteProperty(namespaces: Namespace [], name: any, flags: number): any {
        var self: Object = this;
        if (self.asHasTraitProperty(namespaces, name, flags)) {
          return asDeleteProperty.call(self, namespaces, name);
        }
        return asCallProperty.call(self, [Namespace.PROXY], "deleteProperty", 0, false, [name]);
      }

    }
  }

}