natives.NetConnectionClass = function NetConnectionClass(runtime, scope, instance, baseClass) {

  function constructorHook() {
    this.nativeObject = new NetConnection();
    return instance.apply(this, arguments);
  }


  var c = new runtime.domain.system.Class("NetConnection", constructorHook, Domain.passthroughCallable(constructorHook));
  c.extend(baseClass);

  c.nativeStatics = {
    // defaultObjectEncoding :: void -> uint
    "get defaultObjectEncoding": function defaultObjectEncoding() {
      console.info("NetConnection.defaultObjectEncoding");
    },

    // defaultObjectEncoding :: version:uint -> void
    "set defaultObjectEncoding": function defaultObjectEncoding(version) {
      console.info("NetConnection.defaultObjectEncoding");
    }
  };

  c.nativeMethods = {
    // connected :: void -> Boolean
    "get connected": function connected() {
      console.info("NetConnection.connected");
    },

    // uri :: void -> String
    "get uri": function uri() {
      console.info("NetConnection.uri");
    },

    // connect :: command:String -> void
    connect: function connect(command) {
      console.info("NetConnection.connect");
    },

    // client :: void -> Object
    "get client": function client() {
      console.info("NetConnection.client");
    },

    // client :: object:Object -> void
    "set client": function client(object) {
      console.info("NetConnection.client");
    },

    // objectEncoding :: void -> uint
    "get objectEncoding": function objectEncoding() {
      console.info("NetConnection.objectEncoding");
    },

    // objectEncoding :: version:uint -> void
    "set objectEncoding": function objectEncoding(version) {
      console.info("NetConnection.objectEncoding");
    },

    // proxyType :: void -> String
    "get proxyType": function proxyType() {
      console.info("NetConnection.proxyType");
    },

    // proxyType :: ptype:String -> void
    "set proxyType": function proxyType(ptype) {
      console.info("NetConnection.proxyType");
    },

    // connectedProxyType :: void -> String
    "get connectedProxyType": function connectedProxyType() {
      console.info("NetConnection.connectedProxyType");
    },

    // usingTLS :: void -> Boolean
    "get usingTLS": function usingTLS() {
      console.info("NetConnection.usingTLS");
    },

    // protocol :: void -> String
    "get protocol": function protocol() {
      console.info("NetConnection.protocol");
    },

    // maxPeerConnections :: void -> uint
    "get maxPeerConnections": function maxPeerConnections() {
      console.info("NetConnection.maxPeerConnections");
    },

    // maxPeerConnections :: maxPeers:uint -> void
    "set maxPeerConnections": function maxPeerConnections(maxPeers) {
      console.info("NetConnection.maxPeerConnections");
    },

    // nearID :: void -> String
    "get nearID": function nearID() {
      console.info("NetConnection.nearID");
    },

    // farID :: void -> String
    "get farID": function farID() {
      console.info("NetConnection.farID");
    },

    // nearNonce :: void -> String
    "get nearNonce": function nearNonce() {
      console.info("NetConnection.nearNonce");
    },

    // farNonce :: void -> String
    "get farNonce": function farNonce() {
      console.info("NetConnection.farNonce");
    },

    // unconnectedPeerStreams :: void -> Array
    "get unconnectedPeerStreams": function unconnectedPeerStreams() {
      console.info("NetConnection.unconnectedPeerStreams");
    },

    // invoke :: index:uint -> any
    invoke: function invoke(index) {
      console.info("NetConnection.invoke");
    },

    // invokeWithArgsArray :: index:uint, args:Array -> any
    invokeWithArgsArray: function invokeWithArgsArray(index, args) {
      console.info("NetConnection.invokeWithArgsArray");
    }
  };

  return c;
};

natives.NetStreamClass = function NetStreamClass(runtime, scope, instance, baseClass) {

  function constructorHook() {
    this.nativeObject = new NetStream();
    return instance.apply(this, arguments);
  }

  var c = new runtime.domain.system.Class("NetStream", constructorHook, Domain.passthroughCallable(constructorHook));
  c.extend(baseClass);

  c.nativeStatics = {
  };

  c.nativeMethods = {
    // ctor :: connection:NetConnection, peerID:String -> void
    ctor: function ctor(connection, peerID) {
      // console.info("NetStream.ctor");
    },

    // onResult :: streamId:int -> void
    onResult: function onResult(streamId) {
      console.info("NetStream.onResult");
    },

    // dispose :: void -> void
    dispose: function dispose() {
      console.info("NetStream.dispose");
    },

    // play :: void -> void
    play: function play(url) {
      this.nativeObject.play(url);
    },

    // play2 :: param:NetStreamPlayOptions -> void
    play2: function play2(param) {
      console.info("NetStream.play2");
    },

    // info :: void -> NetStreamInfo
    "get info": function info() {
      console.info("NetStream.info");
    },

    // multicastInfo :: void -> NetStreamMulticastInfo
    "get multicastInfo": function multicastInfo() {
      console.info("NetStream.multicastInfo");
    },

    // invoke :: index:uint -> any
    invoke: function invoke(index) {
      console.info("NetStream.invoke");
    },

    // invokeWithArgsArray :: index:uint, p_arguments:Array -> any
    invokeWithArgsArray: function invokeWithArgsArray(index, p_arguments) {
      console.info("NetStream.invokeWithArgsArray");
    },

    // soundTransform :: void -> SoundTransform
    "get soundTransform": function soundTransform() {
      console.info("NetStream.soundTransform");
    },

    // soundTransform :: sndTransform:SoundTransform -> void
    "set soundTransform": function soundTransform(sndTransform) {
      console.info("NetStream.soundTransform");
    },

    // checkPolicyFile :: void -> Boolean
    "get checkPolicyFile": function checkPolicyFile() {
      console.info("NetStream.checkPolicyFile");
    },

    // checkPolicyFile :: state:Boolean -> void
    "set checkPolicyFile": function checkPolicyFile(state) {
      console.info("NetStream.checkPolicyFile");
    },

    // client :: void -> Object
    "get client": function client() {
      console.info("NetStream.client");
    },

    // client :: object:Object -> void
    "set client": function client(object) {
      console.info("NetStream.client");
    },

    // objectEncoding :: void -> uint
    "get objectEncoding": function objectEncoding() {
      console.info("NetStream.objectEncoding");
    },

    // multicastPushNeighborLimit :: void -> Number
    "get multicastPushNeighborLimit": function multicastPushNeighborLimit() {
      console.info("NetStream.multicastPushNeighborLimit");
    },

    // multicastPushNeighborLimit :: neighbors:Number -> void
    "set multicastPushNeighborLimit": function multicastPushNeighborLimit(neighbors) {
      console.info("NetStream.multicastPushNeighborLimit");
    },

    // multicastWindowDuration :: void -> Number
    "get multicastWindowDuration": function multicastWindowDuration() {
      console.info("NetStream.multicastWindowDuration");
    },

    // multicastWindowDuration :: seconds:Number -> void
    "set multicastWindowDuration": function multicastWindowDuration(seconds) {
      console.info("NetStream.multicastWindowDuration");
    },

    // multicastRelayMarginDuration :: void -> Number
    "get multicastRelayMarginDuration": function multicastRelayMarginDuration() {
      console.info("NetStream.multicastRelayMarginDuration");
    },

    // multicastRelayMarginDuration :: seconds:Number -> void
    "set multicastRelayMarginDuration": function multicastRelayMarginDuration(seconds) {
      console.info("NetStream.multicastRelayMarginDuration");
    },

    // multicastAvailabilityUpdatePeriod :: void -> Number
    "get multicastAvailabilityUpdatePeriod": function multicastAvailabilityUpdatePeriod() {
      console.info("NetStream.multicastAvailabilityUpdatePeriod");
    },

    // multicastAvailabilityUpdatePeriod :: seconds:Number -> void
    "set multicastAvailabilityUpdatePeriod": function multicastAvailabilityUpdatePeriod(seconds) {
      console.info("NetStream.multicastAvailabilityUpdatePeriod");
    },

    // multicastFetchPeriod :: void -> Number
    "get multicastFetchPeriod": function multicastFetchPeriod() {
      console.info("NetStream.multicastFetchPeriod");
    },

    // multicastFetchPeriod :: seconds:Number -> void
    "set multicastFetchPeriod": function multicastFetchPeriod(seconds) {
      console.info("NetStream.multicastFetchPeriod");
    },

    // multicastAvailabilitySendToAll :: void -> Boolean
    "get multicastAvailabilitySendToAll": function multicastAvailabilitySendToAll() {
      console.info("NetStream.multicastAvailabilitySendToAll");
    },

    // multicastAvailabilitySendToAll :: value:Boolean -> void
    "set multicastAvailabilitySendToAll": function multicastAvailabilitySendToAll(value) {
      console.info("NetStream.multicastAvailabilitySendToAll");
    },

    // farID :: void -> String
    "get farID": function farID() {
      console.info("NetStream.farID");
    },

    // nearNonce :: void -> String
    "get nearNonce": function nearNonce() {
      console.info("NetStream.nearNonce");
    },

    // farNonce :: void -> String
    "get farNonce": function farNonce() {
      console.info("NetStream.farNonce");
    },

    // peerStreams :: void -> Array
    "get peerStreams": function peerStreams() {
      console.info("NetStream.peerStreams");
    },

    // audioReliable :: void -> Boolean
    "get audioReliable": function audioReliable() {
      console.info("NetStream.audioReliable");
    },

    // audioReliable :: reliable:Boolean -> void
    "set audioReliable": function audioReliable(reliable) {
      console.info("NetStream.audioReliable");
    },

    // videoReliable :: void -> Boolean
    "get videoReliable": function videoReliable() {
      console.info("NetStream.videoReliable");
    },

    // videoReliable :: reliable:Boolean -> void
    "set videoReliable": function videoReliable(reliable) {
      console.info("NetStream.videoReliable");
    },

    // dataReliable :: void -> Boolean
    "get dataReliable": function dataReliable() {
      console.info("NetStream.dataReliable");
    },

    // dataReliable :: reliable:Boolean -> void
    "set dataReliable": function dataReliable(reliable) {
      console.info("NetStream.dataReliable");
    },

    // audioSampleAccess :: void -> Boolean
    "get audioSampleAccess": function audioSampleAccess() {
      console.info("NetStream.audioSampleAccess");
    },

    // audioSampleAccess :: reliable:Boolean -> void
    "set audioSampleAccess": function audioSampleAccess(reliable) {
      console.info("NetStream.audioSampleAccess");
    },

    // videoSampleAccess :: void -> Boolean
    "get videoSampleAccess": function videoSampleAccess() {
      console.info("NetStream.videoSampleAccess");
    },

    // videoSampleAccess :: reliable:Boolean -> void
    "set videoSampleAccess": function videoSampleAccess(reliable) {
      console.info("NetStream.videoSampleAccess");
    },

    // appendBytes :: bytes:ByteArray -> void
    appendBytes: function appendBytes(bytes) {
      console.info("NetStream.appendBytes");
    },

    // appendBytesAction :: netStreamAppendBytesAction:String -> void
    appendBytesAction: function appendBytesAction(netStreamAppendBytesAction) {
      console.info("NetStream.appendBytesAction");
    },

    // useHardwareDecoder :: void -> Boolean
    "get useHardwareDecoder": function useHardwareDecoder() {
      console.info("NetStream.useHardwareDecoder");
    },

    // useHardwareDecoder :: v:Boolean -> void
    "set useHardwareDecoder": function useHardwareDecoder(v) {
      console.info("NetStream.useHardwareDecoder");
    },

    // videoStreamSettings :: void -> VideoStreamSettings
    "get videoStreamSettings": function videoStreamSettings() {
      console.info("NetStream.videoStreamSettings");
    },

    // videoStreamSettings :: settings:VideoStreamSettings -> void
    "set videoStreamSettings": function videoStreamSettings(settings) {
      console.info("NetStream.videoStreamSettings");
    }
  };

  return c;
};

natives.ResponderClass = function ResponderClass(runtime, scope, instance, baseClass) {
  var c = new runtime.domain.system.Class("Responder", instance, Domain.passthroughCallable(instance));
  c.extend(baseClass);

  c.nativeStatics = {
  };

  c.nativeMethods = {
    // ctor :: result:Function, status:Function -> void
    ctor: function ctor(result, status) {
      console.info("Responder.ctor");
    }
  };

  return c;
};