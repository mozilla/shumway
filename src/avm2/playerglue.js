(function () {

  function ensureGlued(inner, proxyConstructor) {
    if (!inner) {
      return undefined;
    }

    if (inner.p) {
      return inner.p;
    }

    var proxy = new proxyConstructor();
    proxy.d = inner;
    inner.p = proxy;
    return proxy;
  }

  const C = Class.passthroughCallable;
  const CC = Class.constructingCallable;

  /**
   * ApplicationDomain.as
   */
  function ApplicationDomainClass(runtime, scope, instance, baseClass) {
    var c = new Class("ApplicationDomain", instance, C(instance));
    c.extend(baseClass);

    c.nativeMethods = {
      ctor: function (parentDomain) {
        // If no parent domain is passed in, get the current system domain.
        var parent;
        if (!parentDomain) {
          parent = Runtime.stack.top().domain;
          while (parent.base) {
            parent = parent.base;
          }
        } else {
          parent = parentDomain.d;
        }

        this.d = new Domain(parent);
      },

      "get parentDomain": function () {
        return ensureGlued(this.d.base, ApplicationDomain);
      },

      getDefinition: function (name) {
        return this.d.getProperty(Multiname.fromSimpleName(name), false, true);
      },

      hasDefinition: function (name) {
        return !!this.d.findProperty(Multiname.fromSimpleName(name), false, false);
      }
    };

    c.nativeStatics = {
      "get currentDomain": function () {
        return ensureGlued(Runtime.stack.top().domain, ApplicationDomain);
      }
    };

    return c;
  }

  natives.ApplicationDomainClass = ApplicationDomainClass;

})();
