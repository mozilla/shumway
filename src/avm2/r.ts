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

  declare var getTraitFunction;

  import Map = Shumway.Map;
  import Multiname = Shumway.AVM2.ABC.Multiname;
  import Namespace = Shumway.AVM2.ABC.Namespace;
  import MethodInfo = Shumway.AVM2.ABC.MethodInfo;
  import ClassInfo = Shumway.AVM2.ABC.ClassInfo;
  import InstanceInfo = Shumway.AVM2.ABC.InstanceInfo;
  import ScriptInfo = Shumway.AVM2.ABC.ScriptInfo;

  import Trait = Shumway.AVM2.ABC.Trait;
  import IndentingWriter = Shumway.IndentingWriter;
  import hasOwnProperty = Shumway.ObjectUtilities.hasOwnProperty;
  import createMap = Shumway.ObjectUtilities.createMap;
  import cloneObject = Shumway.ObjectUtilities.cloneObject;
  import copyProperties = Shumway.ObjectUtilities.copyProperties;
  import createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;
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
}