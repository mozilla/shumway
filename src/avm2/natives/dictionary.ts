/*
 * Copyright 2014 Mozilla Foundation
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

module Shumway.AVMX.AS {
  import assert = Shumway.Debug.assert;

  export module flash.utils {
    /**
     * TODO: We need a more robust Dictionary implementation that doesn't only give you back
     * string keys when enumerating.
     */
    export class Dictionary extends ASObject {
      static classInitializer: any = function() {
        var proto: any = this.dPrototype;
        var asProto: any = Dictionary.prototype;
        addPrototypeFunctionAlias(proto, '$BgtoJSON', asProto.toJSON);
      }

      private map: WeakMap<any, any>;
      private keys: any [];
      private weakKeys: boolean;
      private primitiveMap: Object;

      constructor(weakKeys: boolean = false) {
        super();
        this.map = new WeakMap();
        this.keys = null;
        this.weakKeys = !!weakKeys;
        if (!weakKeys) {
          this.keys = [];
        }
        this.primitiveMap = Object.create(null);
      }

      static makePrimitiveKey(key: any) {
        if (typeof key === "string" || typeof key === "number") {
          return key;
        }
        release || assert (typeof key === "object" || typeof key === "function", typeof key);
        return undefined;
      }

      toJSON() {
        return "Dictionary";
      }

      public axGetProperty(mn: Multiname): any {
        if (<any>this === this.axClass.dPrototype) {
          return super.axGetProperty(mn);
        }
        var key = Dictionary.makePrimitiveKey(mn.name);
        if (key !== undefined) {
          return this.primitiveMap[<any>key];
        }
        return this.map.get(Object(mn.name));
      }

      public axSetProperty(mn: Multiname, value: any, bc: Bytecode) {
        if (<any>this === this.axClass.dPrototype) {
          super.axSetProperty(mn, value, bc);
          return;
        }
        var key = Dictionary.makePrimitiveKey(mn.name);
        if (key !== undefined) {
          this.primitiveMap[<any>key] = value;
          return;
        }
        this.map.set(Object(mn.name), value);
        if (!this.weakKeys && this.keys.indexOf(mn.name) < 0) {
          this.keys.push(mn.name);
        }
      }

      // TODO: Not implemented yet.
      // public axCallProperty(mn: Multiname, args: any []) {
      //   release || release || notImplemented("axCallProperty");
      // }

      public axHasPropertyInternal(mn: Multiname) {
        if (<any>this === this.axClass.dPrototype) {
          return super.axHasProperty(mn);
        }
        var key = Dictionary.makePrimitiveKey(mn.name);
        if (key !== undefined) {
          return <any>key in this.primitiveMap;
        }
        return this.map.has(Object(mn.name));
      }

      public axDeleteProperty(mn: Multiname) {
        if (<any>this === this.axClass.dPrototype) {
          return super.axDeleteProperty(mn);
        }
        var key = Dictionary.makePrimitiveKey(mn.name);
        if (key !== undefined) {
          delete this.primitiveMap[<any>key];
        }
        this.map.delete(Object(mn.name));
        var i;
        if (!this.weakKeys && (i = this.keys.indexOf(mn.name)) >= 0) {
          this.keys.splice(i, 1);
        }
        return true;
      }

      axGetPublicProperty(nm: any): any {
        if (<any>this === this.axClass.dPrototype) {
          return super.axGetPublicProperty(nm);
        }
        var key = Dictionary.makePrimitiveKey(nm);
        if (key !== undefined) {
          return this.primitiveMap[<any>key];
        }
        return this.map.get(Object(nm));
      }

      public axGetEnumerableKeys(): any [] {
        if (<any>this === this.axClass.dPrototype) {
          return super.axGetEnumerableKeys();
        }
        var primitiveMapKeys = [];
        for (var k in this.primitiveMap) {
          primitiveMapKeys.push(k);
        }
        if (this.weakKeys) {
          // TODO implement workaround for flashx.textLayout.external.WeakRef
          return primitiveMapKeys; // assuming all weak ref objects are gone
        }
        if (this.keys) {
          return primitiveMapKeys.concat(this.keys);
        }
        return primitiveMapKeys.slice();
      }
    }
  }
}
