var ExternalInterfaceDefinition = (function () {
  function getAvailable() {
    return false;
  }
  return {
    // ()
    __class__: "flash.external.ExternalInterface",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
          _initJS: function _initJS() { // (void) -> void
            notImplemented("ExternalInterface._initJS");
          },
          _getPropNames: function _getPropNames(obj) { // (obj:Object) -> Array
            notImplemented("ExternalInterface._getPropNames");
          },
          _addCallback: function _addCallback(functionName, closure, hasNullCallback) { // (functionName:String, closure:Function, hasNullCallback:Boolean) -> void
            notImplemented("ExternalInterface._addCallback");
          },
          _evalJS: function _evalJS(expression) { // (expression:String) -> String
            notImplemented("ExternalInterface._evalJS");
          },
          _callOut: function _callOut(request) { // (request:String) -> String
            notImplemented("ExternalInterface._callOut");
          },
          available: { 
	    get: getAvailable,
          },
          objectID: {
            get: function objectID() { // (void) -> String
              notImplemented("ExternalInterface.objectID");
            }
          },
          activeX: {
            get: function activeX() { // (void) -> Boolean
              notImplemented("ExternalInterface.activeX");
            }
          }
        },
        instance: {
        }
      },
    }
  };
}).call(this);
