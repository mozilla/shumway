var SharedObjectDefinition = (function () {

  var _defaultObjectEncoding = 3;

  var sharedObjects = Object.create(null);

  return {
    // ()
    __class__: "flash.net.SharedObject",
    initialize: function () {
      
    },
    __glue__: {
      native: {
        static: {
          deleteAll: function deleteAll(url) { // (url:String) -> int
            notImplemented("SharedObject.deleteAll");
          },
          getDiskUsage: function getDiskUsage(url) { // (url:String) -> int
            notImplemented("SharedObject.getDiskUsage");
          },
          getLocal: function getLocal(name, localPath, secure) { // (name:String, localPath:String = null, secure:Boolean = false) -> SharedObject
            var path = localPath + "/" + name;
            return sharedObjects[path] || (sharedObjects[path] = new flash.net.SharedObject());
          },
          getRemote: function getRemote(name, remotePath, persistence, secure) { // (name:String, remotePath:String = null, persistence:Object = false, secure:Boolean = false) -> SharedObject
            notImplemented("SharedObject.getRemote");
          },
          defaultObjectEncoding: {
            get: function defaultObjectEncoding() { // (void) -> uint
              return _defaultObjectEncoding;
            },
            set: function defaultObjectEncoding(version) { // (version:uint) -> void
              _defaultObjectEncoding = version;
            }
          }
        },
        instance: {
          setDirty: function setDirty(propertyName) { // (propertyName:String) -> void
            notImplemented("SharedObject.setDirty");
          },
          invoke: function invoke(index) { // (index:uint) -> any
            notImplemented("SharedObject.invoke");
          },
          invokeWithArgsArray: function invokeWithArgsArray(index, args) { // (index:uint, args:Array) -> any
            notImplemented("SharedObject.invokeWithArgsArray");
          },
          data: {
            get: function data() { // (void) -> Object
              notImplemented("SharedObject.data");
              return this._data;
            }
          },
          objectEncoding: {
            get: function objectEncoding() { // (void) -> uint
              notImplemented("SharedObject.objectEncoding");
              return this._objectEncoding;
            },
            set: function objectEncoding(version) { // (version:uint) -> void
              notImplemented("SharedObject.objectEncoding");
              this._objectEncoding = version;
            }
          },
          client: {
            get: function client() { // (void) -> Object
              notImplemented("SharedObject.client");
              return this._client;
            },
            set: function client(object) { // (object:Object) -> void
              notImplemented("SharedObject.client");
              this._client = object;
            }
          }
        }
      }
    }
  };
}).call(this);
