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
      //static classInitializer: any = function() {
      //  var proto: any = Dictionary.prototype;
      //  ObjectUtilities.defineNonEnumerableProperty(proto, '$BgtoJSON', proto.toJSON);
      //}

      private map: WeakMap<any, any>;
      private keys: any [];
      private weakKeys: boolean;
      private primitiveMap: Object;

      constructor(weakKeys: boolean = false) {
        false && super();
        this.weakKeys = !!weakKeys;
        this.map = new WeakMap();
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

      //toJSON() {
      //  return "Dictionary";
      //}

      public axGetProperty(mn: Multiname): any {
        //if (Dictionary.isTraitsOrDynamicPrototype(this)) {
        //  return _asGetProperty.call(this, namespaces, name, flags);
        //}
        var key = Dictionary.makePrimitiveKey(mn.name);
        if (key !== undefined) {
          return this.primitiveMap[<any>key];
        }
        return this.map.get(Object(mn.name));
      }

      public axSetProperty(mn: Multiname, value: any) {
        //if (Dictionary.isTraitsOrDynamicPrototype(this)) {
        //  return _asSetProperty.call(this, namespaces, name, flags, value);
        //}
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
      // public asCallProperty(namesp aces: Namespace [], name: any, flags: number, isLex: boolean, args: any []) {
      //   notImplemented("asCallProperty");
      // }

      public axHasPropertyInternal(mn: Multiname) {
        //if (Dictionary.isTraitsOrDynamicPrototype(this)) {
        //  return _asHasProperty.call(this, namespaces, name, flags);
        //}
        var key = Dictionary.makePrimitiveKey(mn.name);
        if (key !== undefined) {
          return <any>key in this.primitiveMap;
        }
        return this.map.has(Object(mn.name));
      }

      public axDeleteProperty(mn: Multiname) {
        //if (Dictionary.isTraitsOrDynamicPrototype(this)) {
        //  return _asDeleteProperty.call(this, namespaces, name, flags);
        //}
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

      public axGetEnumerableKeys(): any [] {
        //if (Dictionary.isTraitsOrDynamicPrototype(this)) {
        //  return _asGetEnumerableKeys.call(this);
        //}
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
