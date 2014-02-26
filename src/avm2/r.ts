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
///<reference path='references.ts' />

import Namespace = Shumway.AVM2.ABC.Namespace;

interface Object {
  runtimeId: number;
  resolutionMap: Shumway.Map<Shumway.Map<string>>;
  bindings: Shumway.AVM2.Runtime.Bindings;

  getNamespaceResolutionMap: any;
  resolveMultinameProperty: (namespaces: Namespace [], name: any, flags: number) => any;
  asGetProperty: (namespaces: Namespace [], name: any, flags: number) => any;
  asGetNumericProperty: (name: number) => any;
  asGetPublicProperty: (name: any) => any;
  asGetResolvedStringProperty: (name: string) => any;
  asSetProperty: (namespaces: Namespace [], name: any, flags: number, value: any) => void;
  asSetNumericProperty: (name: number, value: any) => void;
  asSetPublicProperty: (name: any, value: any) => void;
  asDefineProperty: (namespaces: Namespace [], name: any, flags: number, descriptor: PropertyDescriptor) => void;
  asDefinePublicProperty: (name: any, descriptor: PropertyDescriptor) => void;
  asCallProperty: (namespaces: Namespace [], name: any, flags: number, isLex: boolean, args: any []) => any;
  asCallSuper: (scope, namespaces: Namespace [], name: any, flags: number, args: any []) => any;
  asGetSuper: (scope, namespaces: Namespace [], name: any, flags: number) => any;
  asSetSuper: (scope, namespaces: Namespace [], name: any, flags: number, value: any) => void;
  asCallPublicProperty: (name: any, args: any []) => void;
  asCallResolvedStringProperty: (resolved: any, isLex: boolean, args: any []) => any;
  asConstructProperty: (namespaces: Namespace [], name: any, flags: number, args: any []) => any;
  asHasProperty: (namespaces: Namespace [], name: any, flags: number, nonProxy?: boolean) => boolean;
  asDeleteProperty: (namespaces: Namespace [], name: any, flags: number) => boolean;
  asNextName: (index: number) => any;
  asNextValue: (index: number) => any;
  asNextNameIndex: (index: number) => number;
  asGetEnumerableKeys: () => any [];
  class: any;
  hasProperty: (namespaces: Namespace [], name: any, flags: number) => boolean; // TODO: What's this?
  enumerableKeys: any [];
}

module Shumway.AVM2.Runtime {

  declare var traceExecution;
  declare var traceCallExecution;
  declare var callCounter;
  declare var isProxy;
  declare var isProxyObject;


  declare var XML;
  declare var XMLList;
  declare var isXMLType;

  declare var useSurrogates;

  declare var getTraitFunction;
  declare var ensureScriptIsExecuted;

  import Map = Shumway.Map;
  import Multiname = Shumway.AVM2.ABC.Multiname;
  import Namespace = Shumway.AVM2.ABC.Namespace;
  import MethodInfo = Shumway.AVM2.ABC.MethodInfo;
  import ClassInfo = Shumway.AVM2.ABC.ClassInfo;
  import InstanceInfo = Shumway.AVM2.ABC.InstanceInfo;
  import ScriptInfo = Shumway.AVM2.ABC.ScriptInfo;
  import SORT = Shumway.AVM2.ABC.SORT;

  import Trait = Shumway.AVM2.ABC.Trait;
  import IndentingWriter = Shumway.IndentingWriter;
  import hasOwnProperty = Shumway.ObjectUtilities.hasOwnProperty;
  import createMap = Shumway.ObjectUtilities.createMap;
  import cloneObject = Shumway.ObjectUtilities.cloneObject;
  import copyProperties = Shumway.ObjectUtilities.copyProperties;
  import createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;
  import boxValue = Shumway.ObjectUtilities.boxValue;
  import bindSafely = Shumway.FunctionUtilities.bindSafely;

  import defineNonEnumerableGetterOrSetter = Shumway.ObjectUtilities.defineNonEnumerableGetterOrSetter;
  import defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;
  import defineReadOnlyProperty = Shumway.ObjectUtilities.defineReadOnlyProperty;
  import defineNonEnumerableGetter = Shumway.ObjectUtilities.defineNonEnumerableGetter;
  import makeForwardingGetter = Shumway.FunctionUtilities.makeForwardingGetter;
  import makeForwardingSetter = Shumway.FunctionUtilities.makeForwardingSetter;
  import toSafeString = Shumway.StringUtilities.toSafeString;
  import toSafeArrayString = Shumway.StringUtilities.toSafeArrayString;

  export var VM_SLOTS = "vm slots";
  export var VM_LENGTH = "vm length";
  export var VM_BINDINGS = "vm bindings";
  export var VM_NATIVE_PROTOTYPE_FLAG = "vm native prototype";
  export var VM_OPEN_METHODS = "vm open methods";
  export var VM_IS_CLASS = "vm is class";
  export var VM_IS_PROXY = "vm is proxy";
  export var VM_CALL_PROXY = "vm call proxy";

  export var VM_OPEN_METHOD_PREFIX = "m";
  export var VM_MEMOIZER_PREFIX = "z";
  export var VM_OPEN_SET_METHOD_PREFIX = "s";
  export var VM_OPEN_GET_METHOD_PREFIX = "g";

  export var VM_NATIVE_BUILTIN_ORIGINALS = "vm originals";

  export function isClass(object) {
    release || assert (object);
    return Object.hasOwnProperty.call(object, VM_IS_CLASS);
  }

  /**
   * Checks if the specified |object| is the prototype of a native JavaScript object.
   */
  export function isNativePrototype(object) {
    return Object.prototype.hasOwnProperty.call(object, VM_NATIVE_PROTOTYPE_FLAG);
  }

  var traitsWriter: IndentingWriter = null; // new IndentingWriter();
  var callWriter: IndentingWriter = null; // new IndentingWriter();

  export interface IPatchTarget {
    object: Object;
    get?: string;
    set?: string;
    name?: string;
  }

  export function patch(patchTargets: IPatchTarget [], value: Function) {
    release || assert (isFunction(value));
    for (var i = 0; i < patchTargets.length; i++) {
      var patchTarget = patchTargets[i];
      if (traceExecution.value >= 3) {
        var str = "Patching: ";
        if (patchTarget.name) {
          str += patchTarget.name;
        } else if (patchTarget.get) {
          str += "get " + patchTarget.get;
        } else if (patchTarget.set) {
          str += "set " + patchTarget.set;
        }
        traitsWriter && traitsWriter.redLn(str);
      }
      if (patchTarget.get) {
        defineNonEnumerableGetterOrSetter(patchTarget.object, patchTarget.get, value, true);
      } else if (patchTarget.set) {
        defineNonEnumerableGetterOrSetter(patchTarget.object, patchTarget.set, value, false);
      } else {
        defineNonEnumerableProperty(patchTarget.object, patchTarget.name, value);
      }
    }
  }

  /**
   * Applies a method trait that doesn't need a memoizer.
   */
  export function applyNonMemoizedMethodTrait(qn: string, trait: Trait, object: Object, scope, natives) {
    release || assert (scope);
    if (trait.isMethod()) {
      var trampoline = makeTrampoline(function (self) {
        var fn = getTraitFunction(trait, scope, natives);
        patch(self.patchTargets, fn);
        return fn;
      }, trait.methodInfo.parameters.length);
      trampoline.patchTargets = [
        { object: object, name: qn },
        { object: object, name: VM_OPEN_METHOD_PREFIX + qn }
      ];
      var closure = bindSafely(trampoline, object);
      defineReadOnlyProperty(closure, VM_LENGTH, trampoline[VM_LENGTH]);
      defineReadOnlyProperty(closure, Multiname.getPublicQualifiedName("prototype"), null);
      defineNonEnumerableProperty(object, qn, closure);
      defineNonEnumerableProperty(object, VM_OPEN_METHOD_PREFIX + qn, closure);
    } else if (trait.isGetter() || trait.isSetter()) {
      var trampoline = makeTrampoline(function (self) {
        var fn = getTraitFunction(trait, scope, natives);
        patch(self.patchTargets, fn);
        return fn;
      }, trait.isSetter() ? 1 : 0);
      if (trait.isGetter()) {
        trampoline.patchTargets = [{ object: object, get: qn }];
      } else {
        trampoline.patchTargets = [{ object: object, set: qn }];
      }
      defineNonEnumerableGetterOrSetter(object, qn, trampoline, trait.isGetter());
    } else {
      unexpected(trait);
    }
  }

  export function applyMemoizedMethodTrait(qn: string, trait: Trait, object: Object, scope, natives) {
    release || assert (scope, trait);

    if (trait.isMethod()) {
      // Patch the target of the memoizer using a temporary |target| object that is visible to both the trampoline
      // and the memoizer. The trampoline closes over it and patches the target value while the memoizer uses the
      // target value for subsequent memoizations.
      var memoizerTarget = { value: null };
      var trampoline = makeTrampoline(function (self) {
        var fn = getTraitFunction(trait, scope, natives);
        patch(self.patchTargets, fn);
        return fn;
      }, trait.methodInfo.parameters.length, String(trait.name));

      memoizerTarget.value = trampoline;
      var openMethods = object[VM_OPEN_METHODS];
      openMethods[qn] = trampoline;
      defineNonEnumerableProperty(object, VM_OPEN_METHOD_PREFIX + qn, trampoline);
      // TODO: We make the |memoizeMethodClosure| configurable since it may be
      // overridden by a derived class. Only do this non final classes.

      defineNonEnumerableGetter(object, qn, makeMemoizer(qn, memoizerTarget));

      trampoline.patchTargets = [
        { object: memoizerTarget, name: "value"},
        { object: openMethods,    name: qn },
        { object: object,         name: VM_OPEN_METHOD_PREFIX + qn }
      ];
    } else if (trait.isGetter() || trait.isSetter()) {
      var trampoline = makeTrampoline(function (self) {
        var fn = getTraitFunction(trait, scope, natives);
        patch(self.patchTargets, fn);
        return fn;
      }, 0, String(trait.name));
      if (trait.isGetter()) {
        defineNonEnumerableProperty(object, VM_OPEN_GET_METHOD_PREFIX + qn, trampoline);
        trampoline.patchTargets = [
          <IPatchTarget>{ object: object, get: qn },
          { object: object, name: VM_OPEN_GET_METHOD_PREFIX + qn }
        ];
      } else {
        defineNonEnumerableProperty(object, VM_OPEN_SET_METHOD_PREFIX + qn, trampoline);
        trampoline.patchTargets = [
          <IPatchTarget>{ object: object, set: qn },
          { object: object, name: VM_OPEN_SET_METHOD_PREFIX + qn }
        ];
      }
      defineNonEnumerableGetterOrSetter(object, qn, trampoline, trait.isGetter());
    }
  }

  /**
   * Property Accessors:
   *
   * Every AS3 object has the following "virtual" accessors methods:
   * - asGetProperty(namespaces, name, flags)
   * - asSetProperty(namespaces, name, flags, value)
   * - asHasProperty(namespaces, name, flags)
   * - asCallProperty(namespaces, name, flags, isLex, args)
   * - asDeleteProperty(namespaces, name, flags)
   *
   * The default implementation of as[Get|Set]Property checks if these properties are defined on the object and
   * calls them if the name is numeric:
   *
   * - asGetNumericProperty(index)
   * - asSetNumericProperty(index, value)
   *
   * Not yet implemented:
   * - asGetDescendants(namespaces, name, flags)
   * - asNextName(index)
   * - asNextNameIndex(index)
   * - asNextValue(index)
   * - asGetEnumerableKeys()
   *
   * Multiname resolution methods:
   * - getNamespaceResolutionMap(namespaces)
   * - resolveMultinameProperty(namespaces, name, flags)
   *
   * Special objects like Vector, Dictionary, XML, etc. can override these to provide different behaviour.
   *
   * To avoid boxing we represent multinames as a group of 3 parts: |namespaces| undefined or an array of
   * namespace objects, |name| any value, and |flags| an integer value. To resolve a multiname to a qualified
   * name we call |resolveMultinameProperty|. The expensive case is when we resolve multinames with multiple
   * namespaces. This is done with the help of |getNamespaceResolutionMap|.
   *
   * Every object that contains traits has a hidden array property called "resolutionMap". This maps between
   * namespace sets to an object that maps all trait names to their resolved qualified names in each namespace.
   *
   * For example, suppose we had the class A { n0 var x; n1 var x; n0 var y; n1 var y; } and two namespace sets:
   * {n0, n2} and {n2, n1}. The namespace sets are given the unique IDs 0 and 1 respectively. The resolution map
   * for class A would be:
   *
   * resolutionMap[0] = {x: n0$$x, y: n0$$y}
   * resolutionMap[1] = {x: n1$$x, y: n1$$y}
   *
   * Resolving {n2, n1}::x on a = new A() then becomes:
   *
   * a[a.resolutionMap[1]["x"]] -> a[{x: n1$$x, y: n1$$y}["x"]] -> a[n1$$x]
   *
   */

  export function getNamespaceResolutionMap(namespaces: Namespace []) {
    var self: Object = this;
    var map = self.resolutionMap[namespaces.runtimeId];
    if (map) return map;
    map = self.resolutionMap[namespaces.runtimeId] = Shumway.ObjectUtilities.createMap<string>();
    var bindings = self.bindings;

    for (var key in bindings.map) {
      var multiname = key;
      var trait = bindings.map[key].trait;
      if (trait.isGetter() || trait.isSetter()) {
        multiname = multiname.substring(Binding.KEY_PREFIX_LENGTH);
      }
      var k = multiname;
      multiname = Multiname.fromQualifiedName(multiname);
      if (multiname.getNamespace().inNamespaceSet(namespaces)) {
        map[multiname.getName()] = Multiname.getQualifiedName(trait.name);
      }
    }
    return map;
  }

  export function resolveMultinameProperty(namespaces: Namespace [], name: string, flags: number) {
    var self: Object = this;
    if (typeof name === "object") {
      name = String(name);
    }
    if (isNumeric(name)) {
      return toNumber(name);
    }
    if (!namespaces) {
      return Multiname.getPublicQualifiedName(name);
    }
    if (namespaces.length > 1) {
      var resolved = self.getNamespaceResolutionMap(namespaces)[name];
      if (resolved) return resolved;
      return Multiname.getPublicQualifiedName(name);
    } else {
      return Multiname.qualifyName(namespaces[0], name);
    }
  }

  export function asGetPublicProperty(name: any) {
    var self: Object = this;
    return self.asGetProperty(undefined, name, 0);
  }

  export function asGetProperty(namespaces: Namespace [], name: any, flags: number) {
    var self: Object = this;
    var resolved = self.resolveMultinameProperty(namespaces, name, flags);
    if (self.asGetNumericProperty && Multiname.isNumeric(resolved)) {
      return self.asGetNumericProperty(resolved);
    }
    return self[resolved];
  }

  export function asGetPropertyLikelyNumeric(namespaces: Namespace [], name: any, flags: number) {
    var self: Object = this;
    if (typeof name === "number") {
      return self.asGetNumericProperty(name);
    }
    return asGetProperty.call(self, namespaces, name, flags);
  }

  /**
   * Resolved string accessors.
   */

  export function asGetResolvedStringProperty(resolved) {
    release || assert(isString(resolved));
    return this[resolved];
  }

  export function asCallResolvedStringProperty(resolved: any, isLex: boolean, args: any []) {
    var self: Object = this;
    var receiver = isLex ? null : this;
    var openMethods = self[VM_OPEN_METHODS];
    // TODO: Passing |null| as |this| doesn't work correctly for free methods. It just happens to work
    // when using memoizers because the function gets bound to |this|.
    var method;
    if (receiver && openMethods && openMethods[resolved]) {
      method = openMethods[resolved];
    } else {
      method = self[resolved];
    }
    return method.apply(receiver, args);
  }

  export function asGetResolvedStringPropertyFallback(resolved: any) {
    var self: Object = this;
    var name = Multiname.getNameFromPublicQualifiedName(resolved);
    return self.asGetProperty([Namespace.PUBLIC], name, 0);
  }

  export function asSetPublicProperty(name: any, value: any) {
    var self: Object = this;
    return self.asSetProperty(undefined, name, 0, value);
  }

  export function asSetProperty(namespaces: Namespace [], name: any, flags: number, value: any) {
    var self: Object = this;
    if (typeof name === "object") {
      name = String(name);
    }
    var resolved = self.resolveMultinameProperty(namespaces, name, flags);
    if (self.asSetNumericProperty && Multiname.isNumeric(resolved)) {
      return self.asSetNumericProperty(resolved, value);
    }
    var slotInfo = self[VM_SLOTS].byQN[resolved];
    if (slotInfo) {
      if (slotInfo.const) {
        return;
      }
      var type = slotInfo.type;
      if (type && type.coerce) {
        value = type.coerce(value);
      }
    }
    self[resolved] = value;
  }

  export function asSetPropertyLikelyNumeric(namespaces: Namespace [], name: any, flags: number, value: any) {
    var self: Object = this;
    if (typeof name === "number") {
      self.asSetNumericProperty(name, value);
      return;
    }
    return asSetProperty.call(self, namespaces, name, flags, value);
  }

  export function asDefinePublicProperty(name: any, descriptor: PropertyDescriptor) {
    var self: Object = this;
    return self.asDefineProperty(undefined, name, 0, descriptor);
  }

  export function asDefineProperty(namespaces: Namespace [], name: any, flags: number, descriptor: PropertyDescriptor) {
    var self: Object = this;
    if (typeof name === "object") {
      name = String(name);
    }
    var resolved = self.resolveMultinameProperty(namespaces, name, flags);
    Object.defineProperty(self, resolved, descriptor);
  }

  export function asCallPublicProperty(name: any, args: any []) {
    var self: Object = this;
    return self.asCallProperty(undefined, name, 0, false, args);
  }

  export function asCallProperty(namespaces: Namespace [], name: any, flags: number, isLex: boolean, args: any []) {
    var self: Object = this;
    if (traceCallExecution.value) {
      var receiverClassName = self.class ? self.class.className + " ": "";
      callWriter.enter("call " + receiverClassName + name + "(" + toSafeArrayString(args) + ") #" + callCounter.count(name));
    }
    var receiver: Object = isLex ? null : self;
    var result;
    if (isProxyObject(self)) {
      result = self[VM_CALL_PROXY](new Multiname(namespaces, name, flags), receiver, args);
    } else {
      var method;
      var resolved = self.resolveMultinameProperty(namespaces, name, flags);
      if (self.asGetNumericProperty && Multiname.isNumeric(resolved)) {
        method = self.asGetNumericProperty(resolved);
      } else {
        var openMethods = self[VM_OPEN_METHODS];
        // TODO: Passing |null| as |this| doesn't work correctly for free methods. It just happens to work
        // when using memoizers because the function gets bound to |this|.
        if (receiver && openMethods && openMethods[resolved]) {
          method = openMethods[resolved];
        } else {
          method = self[resolved];
        }
      }
      result = method.apply(receiver, args);
    }
    traceCallExecution.value > 0 && callWriter.leave("return " + toSafeString(result));
    return result;
  }

  export function asCallSuper(scope, namespaces: Namespace [], name: any, flags: number, args: any []) {
    var self: Object = this;
    if (traceCallExecution.value) {
      var receiverClassName = self.class ? self.class.className + " ": "";
      callWriter.enter("call super " + receiverClassName + name + "(" + toSafeArrayString(args) + ") #" + callCounter.count(name));
    }
    var baseClass = scope.object.baseClass;
    var resolved = baseClass.traitsPrototype.resolveMultinameProperty(namespaces, name, flags);
    var openMethods = baseClass.traitsPrototype[VM_OPEN_METHODS];
    assert (openMethods && openMethods[resolved]);
    var method = openMethods[resolved];
    var result = method.apply(this, args);
    traceCallExecution.value > 0 && callWriter.leave("return " + toSafeString(result));
    return result;
  }

  export function asSetSuper(scope, namespaces: Namespace [], name: any, flags: number, value: any) {
    var self: Object = this;
    if (traceCallExecution.value) {
      var receiverClassName = self.class ? self.class.className + " ": "";
      callWriter.enter("set super " + receiverClassName + name + "(" + toSafeString(value) + ") #" + callCounter.count(name));
    }
    var baseClass = scope.object.baseClass;
    var resolved = baseClass.traitsPrototype.resolveMultinameProperty(namespaces, name, flags);
    if (self[VM_SLOTS].byQN[resolved]) {
      this.asSetProperty(namespaces, name, flags, value);
    } else {
      baseClass.traitsPrototype[VM_OPEN_SET_METHOD_PREFIX + resolved].call(this, value);
    }
    traceCallExecution.value > 0 && callWriter.leave("");
  }

  export function asGetSuper(scope, namespaces: Namespace [], name: any, flags: number) {
    var self: Object = this;
    if (traceCallExecution.value) {
      var receiver = self.class ? self.class.className + " ": "";
      callWriter.enter("get super " + receiver + name + " #" + callCounter.count(name));
    }
    var baseClass = scope.object.baseClass;
    var resolved = baseClass.traitsPrototype.resolveMultinameProperty(namespaces, name, flags);
    var result;
    if (self[VM_SLOTS].byQN[resolved]) {
      result = this.asGetProperty(namespaces, name, flags);
    } else {
      result = baseClass.traitsPrototype[VM_OPEN_GET_METHOD_PREFIX + resolved].call(this);
    }
    traceCallExecution.value > 0 && callWriter.leave("return " + toSafeString(result));
    return result;
  }

  export function construct(cls: Class, args: any []) {
    if (cls.classInfo) {
      // return primitive values for new'd boxes
      var qn = Multiname.getQualifiedName(cls.classInfo.instanceInfo.name);
      if (qn === Multiname.String) {
        return String.apply(null, args);
      }
      if (qn === Multiname.Boolean) {
        return Boolean.apply(null, args);
      }
      if (qn === Multiname.Number) {
        return Number.apply(null, args);
      }
    }
    var c = <any> cls.instanceConstructor;
    var a = args;
    switch (args.length) {
      case  0: return new c();
      case  1: return new c(a[0]);
      case  2: return new c(a[0], a[1]);
      case  3: return new c(a[0], a[1], a[2]);
      case  4: return new c(a[0], a[1], a[2], a[3]);
      case  5: return new c(a[0], a[1], a[2], a[3], a[4]);
      case  6: return new c(a[0], a[1], a[2], a[3], a[4], a[5]);
      case  7: return new c(a[0], a[1], a[2], a[3], a[4], a[5], a[6]);
      case  8: return new c(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7]);
      case  9: return new c(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]);
      case 10: return new c(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9]);
    }
    var applyArguments = [];
    for (var i = 0; args.length; i++) {
      applyArguments[i + 1] = args[i];
    }
    return new (Function.bind.apply(c, applyArguments));
  }

  export function asConstructProperty(namespaces: Namespace [], name: any, flags: number, args: any []) {
    var self: Object = this;
    var constructor = self.asGetProperty(namespaces, name, flags);
    if (traceCallExecution.value) {
      callWriter.enter("construct " + name + "(" + toSafeArrayString(args) + ") #" + callCounter.count(name));
    }
    var result = construct(constructor, args);
    traceCallExecution.value > 0 && callWriter.leave("return " + toSafeString(result));
    return result;
  }

  /**
   * Proxy traps ignore operations passing through nonProxying functions.
   */
  export function nonProxyingHasProperty(object, name) {
    return name in object;
  }

  export function asHasProperty(namespaces: Namespace [], name: any, flags: number, nonProxy: boolean) {
    var self: Object = this;
    if (self.hasProperty) {
      return self.hasProperty(namespaces, name, flags);
    }
    if (nonProxy) {
      return nonProxyingHasProperty(self, self.resolveMultinameProperty(namespaces, name, flags));
    } else {
      return self.resolveMultinameProperty(namespaces, name, flags) in this;
    }
  }

  export function asDeleteProperty(namespaces: Namespace [], name: any, flags: number) {
    var self: Object = this;
    var resolved = self.resolveMultinameProperty(namespaces, name, flags);
    return delete self[resolved];
  }

  export function asGetNumericProperty(i: number) {
    return this[i];
  }

  export function asSetNumericProperty(i: number, v: string) {
    this[i] = v;
  }

  export function asGetDescendants(namespaces: Namespace [], name: any, flags: number) {
    Shumway.Debug.notImplemented("asGetDescendants");
  }

  /**
   * Gets the next name index of an object. Index |zero| is actually not an
   * index, but rather an indicator to start the iteration.
   */
  export function asNextNameIndex(index: number) {
    var self: Object = this;
    if (index === 0) {
      // Gather all enumerable keys since we're starting a new iteration.
      defineNonEnumerableProperty(self, "enumerableKeys", self.asGetEnumerableKeys());
    }
    var enumerableKeys = self.enumerableKeys;
    while (index < enumerableKeys.length) {
      if (self.asHasProperty(undefined, enumerableKeys[index], 0)) {
        return index + 1;
      }
      index ++;
    }
    return 0;
  }

  /**
   * Gets the nextName after the specified |index|, which you would expect to
   * be index + 1, but it's actually index - 1;
   */
  export function asNextName(index: number) {
    var self: Object = this;
    var enumerableKeys = self.enumerableKeys;
    release || assert(enumerableKeys && index > 0 && index < enumerableKeys.length + 1);
    return enumerableKeys[index - 1];
  }

  export function asNextValue(index: number) {
    return this.asGetPublicProperty(this.asNextName(index));
  }

  export function asGetEnumerableKeys(): any [] {
    var self: Object = this;
    var boxedValue = self.valueOf();
    // TODO: This is probably broken if the object has overwritten |valueOf|.
    if (typeof boxedValue === "string" || typeof boxedValue === "number") {
      return [];
    }
    var keys = Object.keys(this);
    var result = [];
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (isNumeric(key)) {
        result.push(key);
      } else {
        var name = Multiname.stripPublicQualifier(key);
        if (name !== undefined) {
          result.push(name);
        }
      }
    }
    return result;
  }

  export function asTypeOf(x) {
    // ABC doesn't box primitives, so typeof returns the primitive type even when
    // the value is new'd
    if (x) {
      if (x.constructor === String) {
        return "string"
      } else if (x.constructor === Number) {
        return "number"
      } else if (x.constructor === Boolean) {
        return "boolean"
      } else if (x instanceof XML || x instanceof XMLList) {
        return "xml"
      }
    }
    return typeof x;
  }

  /**
   * Make an object's properties accessible from AS3. This prefixes all non-numeric
   * properties with the public prefix.
   */
  export function publicizeProperties(object) {
    var keys = Object.keys(object);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (!Multiname.isPublicQualifiedName(k)) {
        var v = object[k];
        object[Multiname.getPublicQualifiedName(k)] = v;
        delete object[k];
      }
    }
  }

  export function asGetSlot(object, index) {
    return object[object[VM_SLOTS].byID[index].name];
  }

  export function asSetSlot(object, index, value) {
    var slotInfo = object[VM_SLOTS].byID[index];
    if (slotInfo.const) {
      return;
    }
    var name = slotInfo.name;
    var type = slotInfo.type;
    if (type && type.coerce) {
      object[name] = type.coerce(value);
    } else {
      object[name] = value;
    }
  }

  export function asIsInstanceOf(type, value) {
    return type.isInstanceOf(value);
  }

  export function asIsType(type, value) {
    return type.isInstance(value);
  }

  export function asAsType(type, value) {
    return asIsType(type, value) ? value : null;
  }

  export function asCoerceByMultiname(domain, multiname, value) {
    release || assert(multiname.isQName());
    switch (Multiname.getQualifiedName(multiname)) {
      case Multiname.Int:
        return asCoerceInt(value);
      case Multiname.Uint:
        return asCoerceUint(value);
      case Multiname.String:
        return asCoerceString(value);
      case Multiname.Number:
        return asCoerceNumber(value);
      case Multiname.Boolean:
        return asCoerceBoolean(value);
      case Multiname.Object:
        return asCoerceObject(value);
    }
    return asCoerce(domain.getType(multiname), value);
  }

  export function asCoerce(type, value) {
    if (type.coerce) {
      return type.coerce(value);
    }

    if (isNullOrUndefined(value)) {
      return null;
    }

    if (type.isInstance(value)) {
      return value;
    } else {
      // FIXME throwErrorFromVM needs to be called from within the runtime
      // because it needs access to the domain or the domain has to be
      // aquired through some other mechanism.
      // throwErrorFromVM("TypeError", "Cannot coerce " + obj + " to type " + type);

      // For now just assert false to print the message.
      release || assert(false, "Cannot coerce " + value + " to type " + type);
    }
  }

  /**
   * Similar to |toString| but returns |null| for |null| or |undefined| instead
   * of "null" or "undefined".
   */
  export function asCoerceString(x) {
    if (typeof x === "string") {
      return x;
    } else if (x == undefined) {
      return null;
    }
    return x + '';
  }

  export function asCoerceInt(x) {
    return x | 0;
  }

  export function asCoerceUint(x) {
    return x >>> 0;
  }

  export function asCoerceNumber(x) {
    return +x;
  }

  export function asCoerceBoolean(x) {
    return !!x;
  }

  export function asCoerceObject(x) {
    if (x == undefined) {
      return null;
    }
    if (typeof x === 'string' || typeof x === 'number') {
      return x;
    }
    return Object(x);
  }

  export function asDefaultCompareFunction(a, b) {
    return String(a).localeCompare(String(b));
  }

  export function asCompare(a, b, options, compareFunction) {
    release || Shumway.Debug.assertNotImplemented (!(options & SORT.UNIQUESORT), "UNIQUESORT");
    release || Shumway.Debug.assertNotImplemented (!(options & SORT.RETURNINDEXEDARRAY), "RETURNINDEXEDARRAY");
    var result = 0;
    if (!compareFunction) {
      compareFunction = asDefaultCompareFunction;
    }
    if (options & SORT.CASEINSENSITIVE) {
      a = String(a).toLowerCase();
      b = String(b).toLowerCase();
    }
    if (options & SORT.NUMERIC) {
      a = toNumber(a);
      b = toNumber(b);
      result = a < b ? -1 : (a > b ? 1 : 0);
    } else {
      result = compareFunction(a, b);
    }
    if (options & SORT.DESCENDING) {
      result *= -1;
    }
    return result;
  }

  /**
   * ActionScript 3 has different behaviour when deciding whether to call toString or valueOf
   * when one operand is a string. Unlike JavaScript, it calls toString if one operand is a
   * string and valueOf otherwise. This sucks, but we have to emulate this behaviour because
   * YouTube depends on it.
   */
  export function asAdd(l, r) {
    if (typeof l === "string" || typeof r === "string") {
      return String(l) + String(r);
    }
    return l + r;
  }


  /**
   * Determine if the given object has any more properties after the specified |index| and if so, return
   * the next index or |zero| otherwise. If the |obj| has no more properties then continue the search in
   * |obj.__proto__|. This function returns an updated index and object to be used during iteration.
   *
   * the |for (x in obj) { ... }| statement is compiled into the following pseudo bytecode:
   *
   * index = 0;
   * while (true) {
   *   (obj, index) = hasNext2(obj, index);
   *   if (index) { #1
   *     x = nextName(obj, index); #2
   *   } else {
   *     break;
   *   }
   * }
   *
   * #1 If we return zero, the iteration stops.
   * #2 The spec says we need to get the nextName at index + 1, but it's actually index - 1, this caused
   * me two hours of my life that I will probably never get back.
   *
   * TODO: We can't match the iteration order semantics of Action Script, hopefully programmers don't rely on it.
   */
  export function asHasNext2(object, index) {
    if (isNullOrUndefined(object)) {
      return {index: 0, object: null};
    }
    object = boxValue(object);
    var nextIndex = object.asNextNameIndex(index);
    if (nextIndex > 0) {
      return {index: nextIndex, object: object};
    }
    // If there are no more properties in the object then follow the prototype chain.
    while (true) {
      var object = Object.getPrototypeOf(object);
      if (!object) {
        return {index: 0, object: null};
      }
      nextIndex = object.asNextNameIndex(0);
      if (nextIndex > 0) {
        return {index: nextIndex, object: object};
      }
    }
    return {index: 0, object: null};
  }

  export function getDescendants(object, mn) {
    if (!isXMLType(object)) {
      throw "Not XML object in getDescendants";
    }
    return object.descendants(mn);
  }

  export function checkFilter(value) {
    if (!value.class || !isXMLType(value)) {
      throw "TypeError operand of childFilter not of XML type";
    }
    return value;
  }

  export function initializeGlobalObject(global) {
    var VM_NATIVE_BUILTIN_SURROGATES = [
      { name: "Object", methods: ["toString", "valueOf"] },
      { name: "Function", methods: ["toString", "valueOf"] }
    ];
    /**
     * Surrogates are used to make |toString| and |valueOf| work transparently. For instance, the expression
     * |a + b| should implicitly expand to |a.$valueOf() + b.$valueOf()|. Since, we don't want to call
     * |$valueOf| explicitly we instead patch the |valueOf| property in the prototypes of native builtins
     * to call the |$valueOf| instead.
     */
    var originals = global[VM_NATIVE_BUILTIN_ORIGINALS] = createEmptyObject();
    VM_NATIVE_BUILTIN_SURROGATES.forEach(function (surrogate) {
      var object = global[surrogate.name];
      assert (object);
      originals[surrogate.name] = createEmptyObject();
      surrogate.methods.forEach(function (originalFunctionName) {
        var originalFunction;
        if (object.prototype.hasOwnProperty(originalFunctionName)) {
          originalFunction = object.prototype[originalFunctionName];
        } else {
          originalFunction = originals["Object"][originalFunctionName];
        }
        // Save the original method in case |getNative| needs it.
        originals[surrogate.name][originalFunctionName] = originalFunction;
        var overrideFunctionName = Multiname.getPublicQualifiedName(originalFunctionName);
        if (useSurrogates) {
          // Patch the native builtin with a surrogate.
          global[surrogate.name].prototype[originalFunctionName] = function surrogate() {
            if (this[overrideFunctionName]) {
              return this[overrideFunctionName]();
            }
            return originalFunction.call(this);
          };
        }
      });
    });

    ["Object", "Number", "Boolean", "String", "Array", "Date", "RegExp"].forEach(function (name) {
      defineReadOnlyProperty(global[name].prototype, VM_NATIVE_PROTOTYPE_FLAG, true);
    });

    defineNonEnumerableProperty(global.Object.prototype, "getNamespaceResolutionMap", getNamespaceResolutionMap);
    defineNonEnumerableProperty(global.Object.prototype, "resolveMultinameProperty", resolveMultinameProperty);
    defineNonEnumerableProperty(global.Object.prototype, "asGetProperty", asGetProperty);
    defineNonEnumerableProperty(global.Object.prototype, "asGetPublicProperty", asGetPublicProperty);
    defineNonEnumerableProperty(global.Object.prototype, "asGetResolvedStringProperty", asGetResolvedStringProperty);
    defineNonEnumerableProperty(global.Object.prototype, "asSetProperty", asSetProperty);
    defineNonEnumerableProperty(global.Object.prototype, "asSetPublicProperty", asSetPublicProperty);
    defineNonEnumerableProperty(global.Object.prototype, "asDefineProperty", asDefineProperty);
    defineNonEnumerableProperty(global.Object.prototype, "asDefinePublicProperty", asDefinePublicProperty);
    defineNonEnumerableProperty(global.Object.prototype, "asCallProperty", asCallProperty);
    defineNonEnumerableProperty(global.Object.prototype, "asCallSuper", asCallSuper);
    defineNonEnumerableProperty(global.Object.prototype, "asGetSuper", asGetSuper);
    defineNonEnumerableProperty(global.Object.prototype, "asSetSuper", asSetSuper);
    defineNonEnumerableProperty(global.Object.prototype, "asCallPublicProperty", asCallPublicProperty);
    defineNonEnumerableProperty(global.Object.prototype, "asCallResolvedStringProperty", asCallResolvedStringProperty);
    defineNonEnumerableProperty(global.Object.prototype, "asConstructProperty", asConstructProperty);
    defineNonEnumerableProperty(global.Object.prototype, "asHasProperty", asHasProperty);
    defineNonEnumerableProperty(global.Object.prototype, "asDeleteProperty", asDeleteProperty);

    defineNonEnumerableProperty(global.Object.prototype, "asNextName", asNextName);
    defineNonEnumerableProperty(global.Object.prototype, "asNextValue", asNextValue);
    defineNonEnumerableProperty(global.Object.prototype, "asNextNameIndex", asNextNameIndex);
    defineNonEnumerableProperty(global.Object.prototype, "asGetEnumerableKeys", asGetEnumerableKeys);

    [
      "Array",
      "Int8Array",
      "Uint8Array",
      "Uint8ClampedArray",
      "Int16Array",
      "Uint16Array",
      "Int32Array",
      "Uint32Array",
      "Float32Array",
      "Float64Array"
    ].forEach(function (name) {
        if (!(name in global)) {
          log(name + ' was not found in globals');
          return;
        }
        defineNonEnumerableProperty(global[name].prototype, "asGetNumericProperty", asGetNumericProperty);
        defineNonEnumerableProperty(global[name].prototype, "asSetNumericProperty", asSetNumericProperty);

        defineNonEnumerableProperty(global[name].prototype, "asGetProperty", asGetPropertyLikelyNumeric);
        defineNonEnumerableProperty(global[name].prototype, "asSetProperty", asSetPropertyLikelyNumeric);
      });

    global.Array.prototype.asGetProperty = function (namespaces: Namespace [], name: any, flags: number): any {
      if (typeof name === "number") {
        return this[name];
      }
      return asGetProperty.call(this, namespaces, name, flags);
    };

    global.Array.prototype.asSetProperty = function (namespaces: Namespace [], name: any, flags: number, value: any) {
      if (typeof name === "number") {
        this[name] = value;
        return;
      }
      return asSetProperty.call(this, namespaces, name, flags, value);
    };
  }

  /**
   * Check if a qualified name is in an object's traits.
   */
  export function nameInTraits(object, qn) {
    // If the object itself holds traits, try to resolve it. This is true for
    // things like global objects and activations, but also for classes, which
    // both have their own traits and the traits of the Class class.
    if (object.hasOwnProperty(VM_BINDINGS) && object.hasOwnProperty(qn)) {
      return true;
    }

    // Else look on the prototype.
    var proto = Object.getPrototypeOf(object);
    return proto.hasOwnProperty(VM_BINDINGS) && proto.hasOwnProperty(qn);
  }

  /**
   * Global object for a script.
   */
  export class Global {
    scriptInfo: ScriptInfo;
    scriptBindings: ScriptBindings;
    constructor(script: ScriptInfo) {
      this.scriptInfo = script;
      script.global = this;
      this.scriptBindings = new ScriptBindings(script, new Scope(null, this, false));
      this.scriptBindings.applyTo(script.abc.applicationDomain, this);
      script.loaded = true;
    }

    public toString() {
      return "[object global]";
    }

    public isExecuted() {
      return this.scriptInfo.executed;
    }

    public isExecuting() {
      return this.scriptInfo.executing;
    }

    public ensureExecuted() {
      ensureScriptIsExecuted(this.scriptInfo);
    }
  }

  defineNonEnumerableProperty(Global.prototype, Multiname.getPublicQualifiedName("toString"), function () {
    return this.toString();
  });

}