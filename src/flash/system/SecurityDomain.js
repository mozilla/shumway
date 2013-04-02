var SecurityDomainDefinition = (function () {
  return {
    // ()
    __class__: "flash.system.SecurityDomain",
    initialize: function () {
    },
    _currentDomain : null,
    __glue__: {
      native: {
        static: {
          currentDomain: {
            get: function () { return this._currentDomain; }
          }
        },
        instance: {
          ctor_impl: function ctor_impl() { // (void) -> void
            notImplemented("SecurityDomain.ctor_impl");
          },
          domainID: {
            get: function domainID() { // (void) -> String
              notImplemented("SecurityDomain.domainID");
              return this._domainID;
            }
          }
        }
      },
    }
  };
}).call(this);
