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

/**
 * Dictionary.as
 *
 * TODO: We need a more robust Dictionary implementation that doesn't only give you back
 * string keys when enumerating.
 */
function DictionaryClass(domain, scope, instanceConstructor, baseClass) {
  function ASDictionary(weakKeys) {
    this.weakKeys = weakKeys;
    this.map = new WeakMap();
    if (!weakKeys) {
      this.keys = [];
    }
    this.primitiveMap = createEmptyObject();
  }

  var c = new Class("Dictionary", ASDictionary, ApplicationDomain.passthroughCallable(ASDictionary));
  c.extendNative(baseClass, ASDictionary);

  function makePrimitiveKey(key) {
    if (typeof key === "string" || typeof key === "number") {
      return key;
    }
    assert (typeof key === "object" || typeof key === "function", typeof key);
    return undefined;
  }

  var prototype = ASDictionary.prototype;

  defineNonEnumerableProperty(prototype, "asGetProperty", function asGetProperty(namespaces, name, flags, isMethod) {
    var key = makePrimitiveKey(name);
    if (key !== undefined) {
      return this.primitiveMap[key];
    }
    return this.map.get(Object(name));
  });

  defineNonEnumerableProperty(prototype, "asGetResolvedStringProperty", asGetResolvedStringPropertyFallback);

  defineNonEnumerableProperty(prototype, "asSetProperty", function asSetProperty(namespaces, name, flags, value) {
    var key = makePrimitiveKey(name);
    if (key !== undefined) {
      this.primitiveMap[key] = value;
      return;
    }
    this.map.set(Object(name), value);
    if (!this.weakKeys && this.keys.indexOf(name) < 0) {
      this.keys.push(name);
    }
  });

  defineNonEnumerableProperty(prototype, "asCallProperty", function asCallProperty(namespaces, name, flags, isLex, args) {
    notImplemented("asCallProperty");
  });

  defineNonEnumerableProperty(prototype, "asHasProperty", function asHasProperty(namespaces, name, flags, nonProxy) {
    var key = makePrimitiveKey(name);
    if (key !== undefined) {
      return key in this.primitiveMap;
    }
    return this.map.has(Object(name));
  });

  defineNonEnumerableProperty(prototype, "asDeleteProperty", function asDeleteProperty(namespaces, name, flags) {
    var key = makePrimitiveKey(name);
    if (key !== undefined) {
      delete this.primitiveMap[key];
    }
    this.map.delete(Object(name));
    var i;
    if (!this.weakKeys && (i = this.keys.indexOf(name)) >= 0) {
      this.keys.splice(i, 1);
    }
    return true;
  });

  defineNonEnumerableProperty(prototype, "asGetEnumerableKeys", function () {
    if (prototype === this) {
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
  });

  c.native = {
    instance: {
      init: function () {}
    }
  };

  return c;
}
