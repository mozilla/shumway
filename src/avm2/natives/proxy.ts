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
  import axCoerceString = Shumway.AVMX.axCoerceString;
  import defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;

  export module flash.utils {

    var proxyNamespace = new Namespace(null, NamespaceType.Public,
                                       "http://www.adobe.com/2006/actionscript/flash/proxy");
    var proxyPrefix = '$' + proxyNamespace.getMangledName();

    /**
     * The Proxy class lets you override the default behavior of ActionScript operations (such as retrieving and modifying properties) on an object.
     */
    export class ASProxy extends ASObject {

      static classInitializer() {
        var proto: any = this.tPrototype;
        var asProto: any = ASProxy.prototype;

        defineNonEnumerableProperty(proto, proxyPrefix + 'getProperty', asProto.native_getProperty);
        defineNonEnumerableProperty(proto, proxyPrefix + 'setProperty', asProto.native_setProperty);
        defineNonEnumerableProperty(proto, proxyPrefix + 'callProperty', asProto.native_callProperty);
        defineNonEnumerableProperty(proto, proxyPrefix + 'hasProperty', asProto.native_hasProperty);
        defineNonEnumerableProperty(proto, proxyPrefix + 'deleteProperty', asProto.native_deleteProperty);
        defineNonEnumerableProperty(proto, proxyPrefix + 'getDescendants', asProto.native_getDescendants);
        defineNonEnumerableProperty(proto, proxyPrefix + 'nextNameIndex', asProto.native_nextNameIndex);
        defineNonEnumerableProperty(proto, proxyPrefix + 'nextName', asProto.native_nextName);
        defineNonEnumerableProperty(proto, proxyPrefix + 'nextValue', asProto.native_nextValue);
      }

      native_getProperty() {
        this.securityDomain.throwError("IllegalOperationError", Errors.ProxyGetPropertyError);
      }

      native_setProperty() {
        this.securityDomain.throwError("IllegalOperationError", Errors.ProxySetPropertyError);
      }

      native_callProperty() {
        this.securityDomain.throwError("IllegalOperationError", Errors.ProxyCallPropertyError);
      }

      native_hasProperty() {
        this.securityDomain.throwError("IllegalOperationError", Errors.ProxyHasPropertyError);
      }

      native_deleteProperty() {
        this.securityDomain.throwError("IllegalOperationError", Errors.ProxyDeletePropertyError);
      }

      native_getDescendants() {
        this.securityDomain.throwError("IllegalOperationError", Errors.ProxyGetDescendantsError);
      }

      native_nextNameIndex() {
        this.securityDomain.throwError("IllegalOperationError", Errors.ProxyNextNameIndexError);
      }

      native_nextName() {
        this.securityDomain.throwError("IllegalOperationError", Errors.ProxyNextNameError);
      }

      native_nextValue() {
        this.securityDomain.throwError("IllegalOperationError", Errors.ProxyNextValueError);
      }

      public axGetProperty(mn: Multiname) {
        var value: any;
        var trait = typeof mn.name === 'string' ? this.traits.getTrait(mn.namespaces, mn.name) : null;
        if (trait) {
          var name = trait.name.getMangledName();
          value = this[name];
          if (typeof value === 'function') {
            return this.axGetMethod(name);
          }
        } else {
          value = this[proxyPrefix + 'getProperty'](axCoerceString(mn.name));
        }
        return value;
      }

      public axGetNumericProperty(name: number): any {
        return this[proxyPrefix + 'getProperty']((+name) + '');
      }

      public axSetNumericProperty(name: number, value: any) {
        this[proxyPrefix + 'setProperty']((+name) + '', value);
      }

      public axSetProperty(mn: Multiname, value: any) {
        var trait = typeof mn.name === 'string' ? this.traits.getTrait(mn.namespaces, mn.name) : null;
        if (trait) {
          super.axSetProperty(mn, value);
          return;
        }
        this[proxyPrefix + 'setProperty'](axCoerceString(mn.name), value);
      }

      public axCallProperty(mn: Multiname, args: any[], isLex: boolean): any {
        var trait = typeof mn.name === 'string' ? this.traits.getTrait(mn.namespaces, mn.name) : null;
        if (trait) {
          return super.axCallProperty(mn, args, isLex);
        }
        var callArgs = [axCoerceString(mn.name)].concat(args);
        return this[proxyPrefix + 'callProperty'].apply(this, callArgs);
      }

      public axHasProperty(mn: Multiname): any {
        return this.axHasOwnProperty(mn);
      }

      public axHasOwnProperty(mn: Multiname): any {
        var trait = typeof mn.name === 'string' ? this.traits.getTrait(mn.namespaces, mn.name) : null;
        if (trait) {
          return true;
        }
        return this[proxyPrefix + 'hasProperty'](axCoerceString(mn.name));
      }

      public axDeleteProperty(mn: Multiname): any {
        var trait = typeof mn.name === 'string' ? this.traits.getTrait(mn.namespaces, mn.name) : null;
        if (trait) {
          return delete this[trait.name.getMangledName()];
        }
        return this[proxyPrefix + 'deleteProperty'](axCoerceString(mn.name));
      }

      public axNextName(index: number): any {
        return this[proxyPrefix + 'nextName'](index);
      }

      public axNextValue(index: number): any {
        return this[proxyPrefix + 'nextValue'](index);
      }

      public axNextNameIndex(index: number): number {
        return this[proxyPrefix + 'nextNameIndex'](index);
      }
    }
  }
}
