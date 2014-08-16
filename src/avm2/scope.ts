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

module Shumway.AVM2.Runtime {
  import Multiname = Shumway.AVM2.ABC.Multiname;
  import Namespace = Shumway.AVM2.ABC.Namespace;
  import MethodInfo = Shumway.AVM2.ABC.MethodInfo;
  import ClassInfo = Shumway.AVM2.ABC.ClassInfo;
  import InstanceInfo = Shumway.AVM2.ABC.InstanceInfo;
  import InstanceBindings = Shumway.AVM2.Runtime.InstanceBindings;
  import ClassBindings = Shumway.AVM2.Runtime.ClassBindings;

  import defineNonEnumerableGetterOrSetter = Shumway.ObjectUtilities.defineNonEnumerableGetterOrSetter;
  import defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;
  import defineReadOnlyProperty = Shumway.ObjectUtilities.defineReadOnlyProperty;
  import defineNonEnumerableGetter = Shumway.ObjectUtilities.defineNonEnumerableGetter;
  import createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;
  import toKeyValueArray = Shumway.ObjectUtilities.toKeyValueArray;
  import assert = Shumway.Debug.assert;

  import boxValue = Shumway.ObjectUtilities.boxValue;

  var counter = Shumway.Metrics.Counter.instance;

  declare var jsGlobal;

  function makeCacheKey(namespaces: Namespace [], name: any, flags: number) {
    if (!namespaces) {
      return name;
    } else if (namespaces.length > 1) {
      return namespaces.runtimeId + "$" + name;
    } else {
      return namespaces[0].qualifiedName + "$" + name;
    }
  }

  /**
   * Scopes are used to emulate the scope stack as a linked list of scopes, rather than a stack. Each
   * scope holds a reference to a scope [object] (which may exist on multiple scope chains, thus preventing
   * us from chaining the scope objects together directly).
   *
   * Scope Operations:
   *
   *  push scope: scope = new Scope(scope, object)
   *  pop scope: scope = scope.parent
   *  get global scope: scope.global
   *  get scope object: scope.object
   *
   * Method closures have a [savedScope] property which is bound when the closure is created. Since we use a
   * linked list of scopes rather than a scope stack, we don't need to clone the scope stack, we can bind
   * the closure to the current scope.
   *
   * The "scope stack" for a method always starts off as empty and methods push and pop scopes on their scope
   * stack explicitly. If a property is not found on the current scope stack, it is then looked up
   * in the [savedScope]. To emulate this we actually wrap every generated function in a closure, such as
   *
   *  function fnClosure(scope) {
   *    return function fn() {
   *      ... scope;
   *    };
   *  }
   *
   * When functions are created, we bind the function to the current scope, using fnClosure.bind(null, this)();
   *
   * Scope Caching:
   *
   * Calls to |findScopeProperty| are very expensive. They recurse all the way to the top of the scope chain and then
   * laterally across other scripts. We optimize this by caching property lookups in each scope using Multiname
   * |id|s as keys. Each Multiname object is given a unique ID when it's constructed. For QNames we only cache
   * string QNames.
   *
   * TODO: This is not sound, since you can add/delete properties to/from with scopes.
   */

  export class Scope {
    parent: Scope;
    global: Scope;
    object: Object;
    isWith: boolean;
    cache: any;

    constructor(parent: Scope, object: any, isWith: boolean = false) {
      this.parent = parent;
      this.object = boxValue(object);
      release || assert (isObject(this.object));
      this.global = parent ? parent.global : this;
      this.isWith = isWith;
      this.cache = createEmptyObject();
    }

    public findDepth(object: any) {
      var current = this;
      var depth = 0;
      while (current) {
        if (current.object === object) {
          return depth;
        }
        depth ++;
        current = current.parent;
      }
      return -1;
    }

    public getScopeObjects(): any [] {
      var objects = [];
      var current = this;
      while (current) {
        objects.unshift(current.object);
        current = current.parent;
      }
      return objects;
    }

    /**
     * Searches the scope stack for the object containing the specified property. If |strict| is specified then throw
     * an exception if the property is not found. If |scopeOnly| is specified then only search the scope chain and not
     * any of the top level domains (this is used by the verifier to bake in direct object references).
     *
     * Property lookups are cached in scopes but are not used when only looking at |scopesOnly|.
     */
    public findScopeProperty(namespaces: Namespace [], name: any, flags: number, method: MethodInfo, strict: boolean, scopeOnly: boolean) {
      countTimeline("findScopeProperty");
      var object;
      var key = makeCacheKey(namespaces, name, flags);
      if (!scopeOnly && (object = this.cache[key])) {
        return object;
      }
      // Scope lookups should not be trapped by proxies.
      if (this.object.asHasPropertyInternal(namespaces, name, flags)) {
        return this.isWith ? this.object : (this.cache[key] = this.object);
      }
      if (this.parent) {
        return (this.cache[key] = this.parent.findScopeProperty(namespaces, name, flags, method, strict, scopeOnly));
      }
      if (scopeOnly) {
        return null;
      }
      // If we can't find the property look in the domain.
      if ((object = method.abc.applicationDomain.findDomainProperty(new Multiname(namespaces, name, flags), strict, true))) {
        return object;
      }
      if (strict) {
        Shumway.Debug.unexpected("Cannot find property " + name);
      }
      // Can't find it still, return the global object.
      return this.global.object;
    }
  }

  /**
   * Wraps the free method in a closure that passes the dynamic scope object as the
   * first argument and also makes sure that the |asGlobal| object gets passed in as
   * |this| when the method is called with |fn.call(null)|.
   */
  export function bindFreeMethodScope(methodInfo: MethodInfo, scope: Scope) {
    var fn = methodInfo.freeMethod;
    if (methodInfo.lastBoundMethod && methodInfo.lastBoundMethod.scope === scope) {
      return methodInfo.lastBoundMethod.boundMethod;
    }
    release || assert (fn, "There should already be a cached method.");
    var boundMethod;
    var asGlobal = scope.global.object;
    if (!methodInfo.hasOptional() && !methodInfo.needsArguments() && !methodInfo.needsRest()) {
      // Special case the common path.
      switch (methodInfo.parameters.length) {
        case 0:
          boundMethod = function () {
            return fn.call(this === jsGlobal ? asGlobal : this, scope);
          };
          break;
        case 1:
          boundMethod = function (x) {
            return fn.call(this === jsGlobal ? asGlobal : this, scope, x);
          };
          break;
        case 2:
          boundMethod = function (x, y) {
            return fn.call(this === jsGlobal ? asGlobal : this, scope, x, y);
          };
          break;
        case 3:
          boundMethod = function (x, y, z) {
            return fn.call(this === jsGlobal ? asGlobal : this, scope, x, y, z);
          };
          break;
        default:
          // TODO: We can special case more ...
          break;
      }
    }
    if (!boundMethod) {
      countTimeline("Bind Scope - Slow Path");
      boundMethod = function () {
        Array.prototype.unshift.call(arguments, scope);
        var global = (this === jsGlobal ? scope.global.object : this);
        return fn.asApply(global, arguments);
      };
    }
    boundMethod.methodInfo = methodInfo;
    boundMethod.instanceConstructor = boundMethod;
    methodInfo.lastBoundMethod = {
      scope: scope,
      boundMethod: boundMethod
    };
    return boundMethod;
  }

}

/**
 * Top level runtime definitinos used by compiler generated code.
 */

var Scope = Shumway.AVM2.Runtime.Scope;