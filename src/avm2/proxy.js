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
  "hasProperty": null,
  "callProperty": null
};

for (var name in proxyTrapQns) {
  proxyTrapQns[name] = VM_OPEN_METHOD_PREFIX + Multiname.getQualifiedName(new Multiname([ShumwayNamespace.PROXY], name));
}

var VM_IS_PROXY = "vm is proxy";
var VM_CALL_PROXY = "vm call proxy";

function isProxyObject(obj) {
  assert (obj);
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
        if (qn === "public$$onPlayPause") {
          debugger;
        }
        if (qn === VM_IS_PROXY) {
          TRACE_PROXY &&  print("proxy check");
          return true;
        }
        if (qn === VM_CALL_PROXY) {
          TRACE_PROXY &&  print("proxy get caller");
          return function apply(mn, receiver, args) {
            receiver = receiver ? target : null;
            if (TRACE_PROXY) {
              print("proxy call, class: " + target.class + ", mn: " + mn + " inAS: " + inAS());
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
            if (target[VM_OPEN_METHODS] && target[VM_OPEN_METHODS][VM_OPEN_METHOD_PREFIX + qn]) {
              return target[VM_OPEN_METHODS][VM_OPEN_METHOD_PREFIX + qn].apply(o, args);
            }
            // if (target[qn]) {
            //  return target[qn].apply(o, args);
            // }
            return undefined;
          }
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
        if (TRACE_PROXY) {
          print("proxy set, class: " + target.class + ", qn: " + qn + " inAS: " + inAS());
        }
        if (inAS()) {
          var mn = Multiname.fromQualifiedName(qn);
          if (mn && !nameInTraits(target, qn)) {
            target[proxyTrapQns.setProperty](mn.name, value);
            return;
          }
        }
        TRACE_PROXY && print("> proxy pass through " + qn);
        target[qn] = value;
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