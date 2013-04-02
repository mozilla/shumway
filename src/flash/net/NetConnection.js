var NetConnectionDefinition = (function () {
  return {
    // ()
    __class__: "flash.net.NetConnection",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
          defaultObjectEncoding: {
            get: function defaultObjectEncoding() { // (void) -> uint
              notImplemented("NetConnection.defaultObjectEncoding");
            },
            set: function defaultObjectEncoding(version) { // (version:uint) -> void
              notImplemented("NetConnection.defaultObjectEncoding");
            }
          }
        },
        instance: {
          connect: function connect(command) { // (command:String) -> void
            notImplemented("NetConnection.connect");
          },
          invoke: function invoke(index) { // (index:uint) -> any
            notImplemented("NetConnection.invoke");
          },
          invokeWithArgsArray: function invokeWithArgsArray(index, args) { // (index:uint, args:Array) -> any
            notImplemented("NetConnection.invokeWithArgsArray");
          },
          connected: {
            get: function connected() { // (void) -> Boolean
              notImplemented("NetConnection.connected");
              return this._connected;
            }
          },
          uri: {
            get: function uri() { // (void) -> String
              notImplemented("NetConnection.uri");
              return this._uri;
            }
          },
          client: {
            get: function client() { // (void) -> Object
              notImplemented("NetConnection.client");
              return this._client;
            },
            set: function client(object) { // (object:Object) -> void
              notImplemented("NetConnection.client");
              this._client = object;
            }
          },
          objectEncoding: {
            get: function objectEncoding() { // (void) -> uint
              notImplemented("NetConnection.objectEncoding");
              return this._objectEncoding;
            },
            set: function objectEncoding(version) { // (version:uint) -> void
              notImplemented("NetConnection.objectEncoding");
              this._objectEncoding = version;
            }
          },
          proxyType: {
            get: function proxyType() { // (void) -> String
              notImplemented("NetConnection.proxyType");
              return this._proxyType;
            },
            set: function proxyType(ptype) { // (ptype:String) -> void
              notImplemented("NetConnection.proxyType");
              this._proxyType = ptype;
            }
          },
          connectedProxyType: {
            get: function connectedProxyType() { // (void) -> String
              notImplemented("NetConnection.connectedProxyType");
              return this._connectedProxyType;
            }
          },
          usingTLS: {
            get: function usingTLS() { // (void) -> Boolean
              notImplemented("NetConnection.usingTLS");
              return this._usingTLS;
            }
          },
          protocol: {
            get: function protocol() { // (void) -> String
              notImplemented("NetConnection.protocol");
              return this._protocol;
            }
          },
          maxPeerConnections: {
            get: function maxPeerConnections() { // (void) -> uint
              notImplemented("NetConnection.maxPeerConnections");
              return this._maxPeerConnections;
            },
            set: function maxPeerConnections(maxPeers) { // (maxPeers:uint) -> void
              notImplemented("NetConnection.maxPeerConnections");
              this._maxPeerConnections = maxPeers;
            }
          },
          nearID: {
            get: function nearID() { // (void) -> String
              notImplemented("NetConnection.nearID");
              return this._nearID;
            }
          },
          farID: {
            get: function farID() { // (void) -> String
              notImplemented("NetConnection.farID");
              return this._farID;
            }
          },
          nearNonce: {
            get: function nearNonce() { // (void) -> String
              notImplemented("NetConnection.nearNonce");
              return this._nearNonce;
            }
          },
          farNonce: {
            get: function farNonce() { // (void) -> String
              notImplemented("NetConnection.farNonce");
              return this._farNonce;
            }
          },
          unconnectedPeerStreams: {
            get: function unconnectedPeerStreams() { // (void) -> Array
              notImplemented("NetConnection.unconnectedPeerStreams");
              return this._unconnectedPeerStreams;
            }
          }
        }
      },
      script: {
        static: {
          // ...
        },
        instance: {
          close: function close() { // (void) -> void
            notImplemented("NetConnection.close");
          },
          addHeader: function addHeader(operation, mustUnderstand, param) { // (operation:String, mustUnderstand:Boolean = false, param:Object = null) -> void
            notImplemented("NetConnection.addHeader");
          },
          call: function call(command, responder) { // (command:String, responder:Responder) -> void
            notImplemented("NetConnection.call");
          }
        }
      }
    }
  };
}).call(this);
