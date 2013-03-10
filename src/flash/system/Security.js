var SecurityDefinition = (function () {
  var _exactSettings = true;
  return {
    __class__: "flash.system.Security",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
          exactSettings: {
            get: function () { return _exactSettings; },
            set: function (value) { _exactSettings = value; }
          },
          sandboxType: {
            get: function () { return "remote"; } // TODO: properly implement
          }
        },
        instance: {
        }
      }
    }
  };
}).call(this);
