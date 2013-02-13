var LoaderInfoDefinition = (function () {
  return {
    __class__: "flash.display.LoaderInfo",
    initialize: function () {
      this._actionScriptVersion = null;
      this._backgroundColor = null;
      this._bytes = null;
      this._bytesLoaded = 0;
      this._bytesTotal = 0;
      this._content = null;
      this._contentType = null;
      this._frameRate = null;
      this._height = null;
      this._loader = null;
      this._loaderURL = null;
      this._swfVersion = null;
      this._url = null;
      this._width = null;
    },
    __glue__: {
      native: {
        static: {
          getLoaderInfoByDefinition: function getLoaderInfoByDefinition(object) { // (object:Object) -> LoaderInfo
            notImplemented("LoaderInfo.getLoaderInfoByDefinition");
          }
        },
        instance: {
          _getArgs: function _getArgs() { // (void) -> Object
            var params = this._parameters;
            var mangled = {};
            for (var k in params) {
              mangled[Multiname.getPublicQualifiedName(k)] = params[k];
            }
            return mangled;
          },
          _getUncaughtErrorEvents: function _getUncaughtErrorEvents() { // (void) -> UncaughtErrorEvents
            notImplemented("LoaderInfo._getUncaughtErrorEvents");
          },
          _setUncaughtErrorEvents: function _setUncaughtErrorEvents(value) { // (value:UncaughtErrorEvents) -> void
            notImplemented("LoaderInfo._setUncaughtErrorEvents");
          },
          loaderURL: {
            get: function loaderURL() { // (void) -> String
              return this._loaderURL;
            }
          },
          url: {
            get: function url() { // (void) -> String
              return this._url;
            }
          },
          isURLInaccessible: {
            get: function isURLInaccessible() { // (void) -> Boolean
              return this._isURLInaccessible;
            }
          },
          bytesLoaded: {
            get: function bytesLoaded() { // (void) -> uint
              return this._bytesLoaded;
            }
          },
          bytesTotal: {
            get: function bytesTotal() { // (void) -> uint
              return this._bytesTotal;
            }
          },
          applicationDomain: {
            get: function applicationDomain() { // (void) -> ApplicationDomain
              return this._applicationDomain;
            }
          },
          swfVersion: {
            get: function swfVersion() { // (void) -> uint
              if (!this._swfVersion) {
                throw Error();
              }
              return this._swfVersion;
            }
          },
          actionScriptVersion: {
            get: function actionScriptVersion() { // (void) -> uint
              return this._actionScriptVersion;
            }
          },
          frameRate: {
            get: function frameRate() { // (void) -> Number
              return this._frameRate;
            }
          },
          width: {
            get: function width() { // (void) -> int
              return this._width;
            }
          },
          height: {
            get: function height() { // (void) -> int
              return this._height;
            }
          },
          contentType: {
            get: function contentType() { // (void) -> String
              return this._contentType;
            }
          },
          sharedEvents: {
            get: function sharedEvents() { // (void) -> EventDispatcher
              return this._sharedEvents;
            }
          },
          parentSandboxBridge: {
            get: function parentSandboxBridge() { // (void) -> Object
              return this._parentSandboxBridge;
            },
            set: function parentSandboxBridge(door) { // (door:Object) -> void
              this._parentSandboxBridge = door;
            }
          },
          childSandboxBridge: {
            get: function childSandboxBridge() { // (void) -> Object
              return this._childSandboxBridge;
            },
            set: function childSandboxBridge(door) { // (door:Object) -> void
              this._childSandboxBridge = door;
            }
          },
          sameDomain: {
            get: function sameDomain() { // (void) -> Boolean
              return this._sameDomain;
            }
          },
          childAllowsParent: {
            get: function childAllowsParent() { // (void) -> Boolean
              return this._childAllowsParent;
            }
          },
          parentAllowsChild: {
            get: function parentAllowsChild() { // (void) -> Boolean
              return this._parentAllowsChild;
            }
          },
          loader: {
            get: function loader() { // (void) -> Loader
              return this._loader;
            }
          },
          content: {
            get: function content() { // (void) -> DisplayObject
              return this._content;
            }
          },
          bytes: {
            get: function bytes() { // (void) -> ByteArray
              return this._bytes;
            }
          }
        }
      },
      script: {
        instance: scriptProperties("public", [
          "swfVersion",
          "bytesTotal",
          "bytesLoaded"
        ])
      }
    }
  };
}).call(this);
