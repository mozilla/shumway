/**
 * Proxy.as
 */
function ProxyClass(runtime, scope, instance, baseClass) {
  function ProxyConstructor() {
    somewhatImplemented("Proxy");
  }
  var c = new runtime.domain.system.Class("Proxy", ProxyConstructor, Domain.coerceCallable(ProxyConstructor));
  c.extendBuiltin(baseClass);
  return c;
}

var proxyTrapQns = {
  "getProperty": null,
  "setProperty": null,
  "hasProperty": null
};

for (var name in proxyTrapQns) {
  proxyTrapQns[name] = Multiname.getQualifiedName(new Multiname([ShumwayNamespace.PROXY], name));
}

var VM_IS_PROXY = "vm is proxy";

function isProxy(obj) {
  return obj[VM_IS_PROXY];
}

function installProxyClassWrapper(cls) {
  var TRACE_PROXY = false;
  if (TRACE_PROXY) {
    print("proxy wrapping, class: " + cls);
  }

  var instance = cls.instance;

  function construct() {
    if (TRACE_PROXY) {
      print("proxy create, class: " + cls);
    }

    var target = Object.create(instance.prototype);
    var proxy = Proxy.create({
      get: function(o, qn) {
        if (qn === "isProxy") {
          return true;
        }
        if (TRACE_PROXY) {
          print("proxy get, class: " + target.class + ", qn: " + qn + " inAS: " + inAS());
        }
        if (inAS()) {
          var mn = Multiname.fromQualifiedName(qn);
          if (mn && !nameInTraits(target, qn)) {
            return target[proxyTrapQns.getProperty](mn.name);
          }
        }
        if (target[VM_OPEN_METHODS] && target[VM_OPEN_METHODS][VM_OPEN_METHOD_PREFIX + qn]) {
          return target[VM_OPEN_METHODS][VM_OPEN_METHOD_PREFIX + qn].bind(o);
        }
        TRACE_PROXY && print("> proxy pass through " + qn);
        return target[qn];
      },
      set: function(o, qn, value) {
        target[qn] = value;
        notImplemented("set");
      },
      has: function(qn) {
        if (TRACE_PROXY) {
          print("proxy has, class: " + target.class + ", qn: " + qn + " inAS: " + inAS());
        }
        if (inAS()) {
          var mn = Multiname.fromQualifiedName(qn);
          if (mn) {
            return target[proxyTrapQns.hasProperty](mn.name);
          }
        }
        return qn in target;
      },
      hasOwn: function(qn) {
        if (TRACE_PROXY) {
          print("proxy hasOwn, class: " + target.class + ", qn: " + qn + " inAS: " + inAS());
        }
        if (inAS()) {
          var mn = Multiname.fromQualifiedName(qn);
          if (mn && !nameInTraits(target, qn)) {
            return target[proxyTrapQns.hasProperty](mn.name);
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
    }, instance.prototype);
    // The derived proxy constructor needs to have a reference to the proxy object itself.
    instance.apply(proxy, sliceArguments(arguments, 0));
    return proxy;
  }

  cls.instance = construct;
}