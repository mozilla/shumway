var SecurityDefinition = (function () {
  return {
    // ()
    __class__: "flash.system.Security",
    initialize: function () {
    },

    __glue__: {
      native: {
        static: {
          allowDomain: function allowDomain() {
            // (...) -> void
            // notImplemented("Security.allowDomain");
            somewhatImplemented("Security.allowDomain [\"" + Array.prototype.join.call(arguments, "\", \"") + "\"]");
          },
          allowInsecureDomain: function allowInsecureDomain() {
            // (void) -> void
            notImplemented("Security.allowInsecureDomain");
          },
          loadPolicyFile: function loadPolicyFile(url) {
            // (url:String) -> void
            notImplemented("Security.loadPolicyFile");
          },
          duplicateSandboxBridgeInputArguments: function duplicateSandboxBridgeInputArguments(toplevel, args) {
            // (toplevel:Object, args:Array) -> Array
            notImplemented("Security.duplicateSandboxBridgeInputArguments");
          },
          duplicateSandboxBridgeOutputArgument: function duplicateSandboxBridgeOutputArgument(toplevel, arg) {
            // (toplevel:Object, arg) -> any
            notImplemented("Security.duplicateSandboxBridgeOutputArgument");
          },
          showSettings: function showSettings(panel) {
            // (panel:String = "default") -> void
            notImplemented("Security.showSettings");
          },
          exactSettings: {
            get: function () { return _exactSettings; },
            set: function (value) { _exactSettings = value; }
          },
          disableAVM1Loading: {
            get: function disableAVM1Loading() {
              // (void) -> Boolean
              notImplemented("Security.disableAVM1Loading");
            },
            set: function disableAVM1Loading(value) {
              // (value:Boolean) -> void
              notImplemented("Security.disableAVM1Loading");
            }
          },
          sandboxType: {
            get: function () {
              somewhatImplemented("Security.sandboxType");
              return "remote";
            }
          },
          pageDomain: {
            get: function pageDomain() {
              // (void) -> String
              notImplemented("Security.pageDomain");
            }
          }
        }
      }
    }
  };
}).call(this);
