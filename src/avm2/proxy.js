/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
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
 * Proxy.as
 */
function ProxyClass(runtime, scope, instanceConstructor, baseClass) {
  function ProxyConstructor() {
    somewhatImplemented("Proxy");
  }
  var c = new Class("Proxy", ProxyConstructor, Domain.coerceCallable(ProxyConstructor));
  c.extendBuiltin(baseClass);
  return c;
}

var proxyTrapQns = {
  "getProperty": null,
  "setProperty": null,
  "hasProperty": null,
  "callProperty": null
};

for (var name in proxyTrapQns) {
  proxyTrapQns[name] = VM_OPEN_METHOD_PREFIX + Multiname.getQualifiedName(new Multiname([ShumwayNamespace.PROXY], name));
}

var VM_IS_PROXY = "vm is proxy";
var VM_CALL_PROXY = "vm call proxy";

function isProxyObject(obj) {
  return obj[VM_IS_PROXY];
}

function nameFromQualifiedName(qn) {
  if (isNumeric(qn)) {
    return qn;
  }
  var mn = Multiname.fromQualifiedName(qn);
  if (mn === undefined) {
    return undefined;
  }
  return mn.name;
}

/**
 * Searches the call stack for non-proxying traps.
 */
function hasNonProxyingCaller() {
  var caller = arguments.callee;
  var maxDepth = 5;
  var domain;
  for (var i = 0; i < maxDepth && caller; i++) {
    if (caller === nonProxyingHasProperty) {
      return true;
    }
    caller = caller.caller;
  }
  return false;
}

function installProxyClassWrapper(cls) {
  var TRACE_PROXY = false;
  if (TRACE_PROXY) {
    print("proxy wrapping, class: " + cls);
  }

  var instanceConstructor = cls.instanceConstructor;

  function construct() {
    if (TRACE_PROXY) {
      print("proxy create, class: " + cls);
    }
    var target = Object.create(instanceConstructor.prototype);
    var proxy = Proxy.create({
      get: function(o, qn) {
        if (qn === VM_IS_PROXY) {
          TRACE_PROXY &&  print("proxy check");
          return true;
        }
        if (qn === VM_CALL_PROXY) {
          TRACE_PROXY &&  print("proxy get caller");
          return function apply(mn, receiver, args) {
            receiver = receiver ? target : null;
            if (TRACE_PROXY) {
              print("proxy call, class: " + target.class + ", mn: " + mn + "hasNonProxyingCallerr: " + hasNonProxyingCaller());
            }
            var resolved = Multiname.isQName(mn) ? mn : resolveMultiname(target, mn);
            var qn = resolved ? Multiname.getQualifiedName(resolved) :
                      Multiname.getPublicQualifiedName(mn.name);
            if (!nameInTraits(target, qn)) {
              return target[proxyTrapQns.callProperty](mn.name, args);
            }
            if (TRACE_PROXY) {
              TRACE_PROXY && print("> proxy pass through " + resolved);
            }
            if (target[VM_OPEN_METHODS] && target[VM_OPEN_METHODS][qn]) {
              return target[VM_OPEN_METHODS][qn].apply(o, args);
            }
            // if (target[qn]) {
            //  return target[qn].apply(o, args);
            // }
            return undefined;
          }
        }
        if (TRACE_PROXY) {
          print("proxy get, class: " + target.class + ", qn: " + qn + "hasNonProxyingCallerr: " + hasNonProxyingCaller());
        }
        if (!hasNonProxyingCaller()) {
          var name = nameFromQualifiedName(qn);
          if (name !== undefined && !nameInTraits(target, qn)) {
            return target[proxyTrapQns.getProperty](name);
          }
        }
        if (target[VM_OPEN_METHODS] && target[VM_OPEN_METHODS][qn]) {
          return bindSafely(target[VM_OPEN_METHODS][qn], o);
        }
        TRACE_PROXY && print("> proxy pass through " + qn);
        return target[qn];
      },
      set: function(o, qn, value) {
        if (TRACE_PROXY) {
          print("proxy set, class: " + target.class + ", qn: " + qn + "hasNonProxyingCallerr: " + hasNonProxyingCaller());
        }
        if (!hasNonProxyingCaller()) {
          var name = nameFromQualifiedName(qn);
          if (name !== undefined && !nameInTraits(target, qn)) {
            target[proxyTrapQns.setProperty](name, value);
            return;
          }
        }
        TRACE_PROXY && print("> proxy pass through " + qn);
        target[qn] = value;
      },
      has: function(qn) {
        if (TRACE_PROXY) {
          print("proxy has, class: " + target.class + ", qn: " + qn + "hasNonProxyingCallerr: " + hasNonProxyingCaller());
        }
        if (!hasNonProxyingCaller()) {
          var name = nameFromQualifiedName(qn);
          if (name !== undefined && !nameInTraits(target, qn)) {
            return target[proxyTrapQns.hasProperty](name);
          }
        }
        return qn in target;
      },
      hasOwn: function(qn) {
        if (TRACE_PROXY) {
          print("proxy hasOwn, class: " + target.class + ", qn: " + qn + "hasNonProxyingCallerr: " + hasNonProxyingCaller());
        }
        if (!hasNonProxyingCaller()) {
          var name = nameFromQualifiedName(qn);
          if (name !== undefined && !nameInTraits(target, qn)) {
            return target[proxyTrapQns.hasProperty](name);
          }
        }
        TRACE_PROXY && print("> proxy pass through " + qn);
        return !!Object.getOwnPropertyDescriptor(target, qn);
      },
      enumerate: function() {
        notImplemented("enumerate");
      },
      keys: function() {
        notImplemented("keys");
      }
    }, instanceConstructor.prototype);
    // The derived proxy constructor needs to have a reference to the proxy object itself.
    instanceConstructor.apply(proxy, sliceArguments(arguments, 0));
    return proxy;
  }

  cls.instanceConstructor = construct;
}
