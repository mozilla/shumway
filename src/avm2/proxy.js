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

console.info(proxyTrapQns.getProperty);

function extractActionScriptName(name) {
  if (name.indexOf("public$") === 0) {
    return name.substr(7);
  }
  return false;
  // return name.indexOf("public$") >= 0 || name.indexOf("private$") >= 0;
}

function installProxyClass(cls) {
  var instance = cls.instance;
  function construct() {
    var target = Object.create(instance.prototype);
    var proxy = Proxy.create({
      get: function(o, name) {
        if (inRuntime()) {
          return target[name];
        }
        var externalName = extractActionScriptName(name);
        if (externalName) {
          return target[proxyTrapQns.getProperty](externalName);
        }
        return target[name];
      },
      set: function(o, name, value) {
        target[name] = value;
        // notImplemented("set");
      },
      has: function(name) {
        if (inRuntime()) {
          return name in target;
        }
        var externalName = extractActionScriptName(name);
        if (externalName) {
          return target[proxyTrapQns.hasProperty](externalName);
        }
        return name in target;
      },
      hasOwn: function(name) {
        if (extractActionScriptName(name)) {

        }
        return !!Object.getOwnPropertyDescriptor(target, name);
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