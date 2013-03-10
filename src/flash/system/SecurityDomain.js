var SecurityDomainDefinition = (function () {
  return {
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
        }
      }
    }
  };
}).call(this);
