var ExternalInterfaceDefinition = (function () {
  function getAvailable() {
    return $EXTENSION;
  }

  var initialized = false;
  var registeredCallbacks = {};
  function callIn(functionName, args) {
    if (!registeredCallbacks.hasOwnProperty(functionName))
      return;
    return registeredCallbacks[functionName](functionName, args);
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
            if (initialized)
              return;

            initialized = true;
            FirefoxCom.initJS(callIn);
          },
          _getPropNames: function _getPropNames(obj) { // (obj:Object) -> Array
            var keys = [];
            forEachPublicProperty(obj, function (key) { keys.push(key); });
            return keys;
          },
          _addCallback: function _addCallback(functionName, closure, hasNullCallback) { // (functionName:String, closure:Function, hasNullCallback:Boolean) -> void
            FirefoxCom.request('externalCom',
              {action: 'register', functionName: functionName, remove: hasNullCallback});
            if (hasNullCallback) {
              delete registeredCallbacks[functionName];
            } else {
              registeredCallbacks[functionName] = closure;
            }
          },
          _evalJS: function _evalJS(expression) { // (expression:String) -> String
            return FirefoxCom.requestSync('externalCom', {action: 'eval', expression: expression});
          },
          _callOut: function _callOut(request) { // (request:String) -> String
            return FirefoxCom.requestSync('externalCom', {action: 'call', request: request});
          },
          available: { 
            get: getAvailable // (void) -> Boolean
          },
          objectID: {
            get: function objectID() { // (void) -> String
              return FirefoxCom.requestSync('externalCom', {action: 'getId'});
            }
          },
          activeX: {
            get: function activeX() { // (void) -> Boolean
              return false;
            }
          }
        },
        instance: {
        }
      },
    }
  };
}).call(this);
