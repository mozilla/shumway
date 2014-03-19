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
  declare var arraySort;
  declare var checkArguments;
  declare var clamp;

  import assertNotImplemented = Shumway.Debug.assertNotImplemented;
  import notImplemented = Shumway.Debug.notImplemented;
  import createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;
  import Namespace = Shumway.AVM2.ABC.Namespace;
  import throwError = Shumway.AVM2.Runtime.throwError;
  import asCheckVectorGetNumericProperty = Shumway.AVM2.Runtime.asCheckVectorGetNumericProperty;
  import asCheckVectorSetNumericProperty = Shumway.AVM2.Runtime.asCheckVectorSetNumericProperty;

  export module flash.utils {

    /**
     * TODO: We need a more robust Dictionary implementation that doesn't only give you back
     * string keys when enumerating.
     */
    export class Dictionary extends ASNative {

      public static protocol: IProtocol = Dictionary.prototype;

      private map: WeakMap<any, any>;
      private keys: any [];
      private weakKeys: boolean;
      private primitiveMap: Object;

      constructor (weakKeys: boolean = false) {
        super();
      }

      static makePrimitiveKey(key) {
        if (typeof key === "string" || typeof key === "number") {
          return key;
        }
        assert (typeof key === "object" || typeof key === "function", typeof key);
        return undefined;
      }

      private init(weakKeys: boolean): void {
        this.weakKeys = !!weakKeys;
        this.map = new WeakMap();
        if (!weakKeys) {
          this.keys = [];
        }
        this.primitiveMap = createEmptyObject();
      }

      public asGetProperty(namespaces: Namespace [], name: any, flags: number) {
        var key = Dictionary.makePrimitiveKey(name);
        if (key !== undefined) {
          return this.primitiveMap[key];
        }
        return this.map.get(Object(name));
      }

      public asSetProperty(namespaces: Namespace [], name: any, flags: number, value: any) {
        var key = Dictionary.makePrimitiveKey(name);
        if (key !== undefined) {
          this.primitiveMap[key] = value;
          return;
        }
        this.map.set(Object(name), value);
        if (!this.weakKeys && this.keys.indexOf(name) < 0) {
          this.keys.push(name);
        }
      }

      // TODO: Not implemented yet.
      // public asCallProperty(namespaces: Namespace [], name: any, flags: number, isLex: boolean, args: any []) {
      //   notImplemented("asCallProperty");
      // }

      public asHasProperty(namespaces: Namespace [], name: any, flags: number) {
        var key = Dictionary.makePrimitiveKey(name);
        if (key !== undefined) {
          return key in this.primitiveMap;
        }
        return this.map.has(Object(name));
      }

      public asDeleteProperty(namespaces: Namespace [], name: any, flags: number) {
        var key = Dictionary.makePrimitiveKey(name);
        if (key !== undefined) {
          delete this.primitiveMap[key];
        }
        this.map.delete(Object(name));
        var i;
        if (!this.weakKeys && (i = this.keys.indexOf(name)) >= 0) {
          this.keys.splice(i, 1);
        }
        return true;
      }

      public asGetEnumerableKeys() {
        if (Dictionary.traitsPrototype === this || Dictionary.dynamicPrototype === this) {
          return Object.prototype.asGetEnumerableKeys.call(this);
        }
        var primitiveMapKeys = [];
        for (var k in this.primitiveMap) {
          primitiveMapKeys.push(k);
        }
        if (this.weakKeys) {
          // TODO implement workaround for flashx.textLayout.external.WeakRef
          return primitiveMapKeys; // assuming all weak ref objects are gone
        }
        return primitiveMapKeys.concat(this.keys);
      }
    }
  }
}