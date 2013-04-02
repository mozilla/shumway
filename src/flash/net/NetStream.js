var NetStreamDefinition = (function () {
  return {
    // (connection:NetConnection, peerID:String = "connectToFMS")
    __class__: "flash.net.NetStream",
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
          ctor: function ctor(connection, peerID) {
            // (connection:NetConnection, peerID:String) -> void
            notImplemented("NetStream.ctor");
          },
          onResult: function onResult(streamId) {
            // (streamId:int) -> void
            notImplemented("NetStream.onResult");
          },
          dispose: function dispose() {
            // (void) -> void
            notImplemented("NetStream.dispose");
          },
          play: function play() {
            // (void) -> void
            this._url = url;
            notImplemented("NetStream.play");
          },
          play2: function play2(param) {
            // (param:NetStreamPlayOptions) -> void
            notImplemented("NetStream.play2");
          },
          invoke: function invoke(index) {
            // (index:uint) -> any
            notImplemented("NetStream.invoke");
          },
          invokeWithArgsArray: function invokeWithArgsArray(index, p_arguments) {
            // (index:uint, p_arguments:Array) -> any
            notImplemented("NetStream.invokeWithArgsArray");
          },
          appendBytes: function appendBytes(bytes) {
            // (bytes:ByteArray) -> void
            notImplemented("NetStream.appendBytes");
          },
          appendBytesAction: function appendBytesAction(netStreamAppendBytesAction) {
            // (netStreamAppendBytesAction:String) -> void
            notImplemented("NetStream.appendBytesAction");
          },
          info: {
            get: function info() {
              // (void) -> NetStreamInfo
              notImplemented("NetStream.info");
              return this._info;
            }
          },
          multicastInfo: {
            get: function multicastInfo() { // (void) -> NetStreamMulticastInfo
              notImplemented("NetStream.multicastInfo");
              return this._multicastInfo;
            }
          },
          soundTransform: {
            get: function soundTransform() {
              // (void) -> SoundTransform
              notImplemented("NetStream.soundTransform");
              return this._soundTransform;
            },
            set: function soundTransform(sndTransform) {
              // (sndTransform:SoundTransform) -> void
              notImplemented("NetStream.soundTransform");
              this._soundTransform = sndTransform;
            }
          },
          checkPolicyFile: {
            get: function checkPolicyFile() {
              // (void) -> Boolean
              notImplemented("NetStream.checkPolicyFile");
              return this._checkPolicyFile;
            },
            set: function checkPolicyFile(state) {
              // (state:Boolean) -> void
              notImplemented("NetStream.checkPolicyFile");
              this._checkPolicyFile = state;
            }
          },
          client: {
            get: function client() {
              // (void) -> Object
              notImplemented("NetStream.client");
              return this._client;
            },
            set: function client(object) {
              // (object:Object) -> void
              notImplemented("NetStream.client");
              this._client = object;
            }
          },
          objectEncoding: {
            get: function objectEncoding() {
              // (void) -> uint
              notImplemented("NetStream.objectEncoding");
              return this._objectEncoding;
            }
          },
          multicastPushNeighborLimit: {
            get: function multicastPushNeighborLimit() {
              // (void) -> Number
              notImplemented("NetStream.multicastPushNeighborLimit");
              return this._multicastPushNeighborLimit;
            },
            set: function multicastPushNeighborLimit(neighbors) {
              // (neighbors:Number) -> void
              notImplemented("NetStream.multicastPushNeighborLimit");
              this._multicastPushNeighborLimit = neighbors;
            }
          },
          multicastWindowDuration: {
            get: function multicastWindowDuration() {
              // (void) -> Number
              notImplemented("NetStream.multicastWindowDuration");
              return this._multicastWindowDuration;
            },
            set: function multicastWindowDuration(seconds) {
              // (seconds:Number) -> void
              notImplemented("NetStream.multicastWindowDuration");
              this._multicastWindowDuration = seconds;
            }
          },
          multicastRelayMarginDuration: {
            get: function multicastRelayMarginDuration() {
              // (void) -> Number
              notImplemented("NetStream.multicastRelayMarginDuration");
              return this._multicastRelayMarginDuration;
            },
            set: function multicastRelayMarginDuration(seconds) {
              // (seconds:Number) -> void
              notImplemented("NetStream.multicastRelayMarginDuration");
              this._multicastRelayMarginDuration = seconds;
            }
          },
          multicastAvailabilityUpdatePeriod: {
            get: function multicastAvailabilityUpdatePeriod() {
              // (void) -> Number
              notImplemented("NetStream.multicastAvailabilityUpdatePeriod");
              return this._multicastAvailabilityUpdatePeriod;
            },
            set: function multicastAvailabilityUpdatePeriod(seconds) {
              // (seconds:Number) -> void
              notImplemented("NetStream.multicastAvailabilityUpdatePeriod");
              this._multicastAvailabilityUpdatePeriod = seconds;
            }
          },
          multicastFetchPeriod: {
            get: function multicastFetchPeriod() {
              // (void) -> Number
              notImplemented("NetStream.multicastFetchPeriod");
              return this._multicastFetchPeriod;
            },
            set: function multicastFetchPeriod(seconds) { // (seconds:Number) -> void
              notImplemented("NetStream.multicastFetchPeriod");
              this._multicastFetchPeriod = seconds;
            }
          },
          multicastAvailabilitySendToAll: {
            get: function multicastAvailabilitySendToAll() {
              // (void) -> Boolean
              notImplemented("NetStream.multicastAvailabilitySendToAll");
              return this._multicastAvailabilitySendToAll;
            },
            set: function multicastAvailabilitySendToAll(value) {
              // (value:Boolean) -> void
              notImplemented("NetStream.multicastAvailabilitySendToAll");
              this._multicastAvailabilitySendToAll = value;
            }
          },
          farID: {
            get: function farID() {
              // (void) -> String
              notImplemented("NetStream.farID");
              return this._farID;
            }
          },
          nearNonce: {
            get: function nearNonce() {
              // (void) -> String
              notImplemented("NetStream.nearNonce");
              return this._nearNonce;
            }
          },
          farNonce: {
            get: function farNonce() {
              // (void) -> String
              notImplemented("NetStream.farNonce");
              return this._farNonce;
            }
          },
          peerStreams: {
            get: function peerStreams() {
              // (void) -> Array
              notImplemented("NetStream.peerStreams");
              return this._peerStreams;
            }
          },
          audioReliable: {
            get: function audioReliable() {
              // (void) -> Boolean
              notImplemented("NetStream.audioReliable");
              return this._audioReliable;
            },
            set: function audioReliable(reliable) {
              // (reliable:Boolean) -> void
              notImplemented("NetStream.audioReliable");
              this._audioReliable = reliable;
            }
          },
          videoReliable: {
            get: function videoReliable() {
              // (void) -> Boolean
              notImplemented("NetStream.videoReliable");
              return this._videoReliable;
            },
            set: function videoReliable(reliable) {
              // (reliable:Boolean) -> void
              notImplemented("NetStream.videoReliable");
              this._videoReliable = reliable;
            }
          },
          dataReliable: {
            get: function dataReliable() {
              // (void) -> Boolean
              notImplemented("NetStream.dataReliable");
              return this._dataReliable;
            },
            set: function dataReliable(reliable) {
              // (reliable:Boolean) -> void
              notImplemented("NetStream.dataReliable");
              this._dataReliable = reliable;
            }
          },
          audioSampleAccess: {
            get: function audioSampleAccess() {
              // (void) -> Boolean
              notImplemented("NetStream.audioSampleAccess");
              return this._audioSampleAccess;
            },
            set: function audioSampleAccess(reliable) {
              // (reliable:Boolean) -> void
              notImplemented("NetStream.audioSampleAccess");
              this._audioSampleAccess = reliable;
            }
          },
          videoSampleAccess: {
            get: function videoSampleAccess() {
              // (void) -> Boolean
              notImplemented("NetStream.videoSampleAccess");
              return this._videoSampleAccess;
            },
            set: function videoSampleAccess(reliable) {
              // (reliable:Boolean) -> void
              notImplemented("NetStream.videoSampleAccess");
              this._videoSampleAccess = reliable;
            }
          },
          useHardwareDecoder: {
            get: function useHardwareDecoder() {
              // (void) -> Boolean
              notImplemented("NetStream.useHardwareDecoder");
              return this._useHardwareDecoder;
            },
            set: function useHardwareDecoder(v) {
              // (v:Boolean) -> void
              notImplemented("NetStream.useHardwareDecoder");
              this._useHardwareDecoder = v;
            }
          },
          useJitterBuffer: {
            get: function useJitterBuffer() {
              // (void) -> Boolean
              notImplemented("NetStream.useJitterBuffer");
              return this._useJitterBuffer;
            },
            set: function useJitterBuffer(value) {
              // (value:Boolean) -> void
              notImplemented("NetStream.useJitterBuffer");
              this._useJitterBuffer = value;
            }
          },
          videoStreamSettings: {
            get: function videoStreamSettings() {
              // (void) -> VideoStreamSettings
              notImplemented("NetStream.videoStreamSettings");
              return this._videoStreamSettings;
            },
            set: function videoStreamSettings(settings) {
              // (settings:VideoStreamSettings) -> void
              notImplemented("NetStream.videoStreamSettings");
              this._videoStreamSettings = settings;
            }
          }
        }
      },
      script: {
        static: {
          // ...
        },
        instance: {
          onStatus: function onStatus(info) { // (info) -> void
            notImplemented("NetStream.onStatus");
          },
          attach: function attach(connection) { // (connection:NetConnection) -> void
            notImplemented("NetStream.attach");
          },
          close: function close() { // (void) -> void
            notImplemented("NetStream.close");
          },
          attachAudio: function attachAudio(microphone) { // (microphone:Microphone) -> void
            notImplemented("NetStream.attachAudio");
          },
          attachCamera: function attachCamera(theCamera, snapshotMilliseconds) { // (theCamera:Camera, snapshotMilliseconds:int = -1) -> void
            notImplemented("NetStream.attachCamera");
          },
          send: function send(handlerName) { // (handlerName:String) -> void
            notImplemented("NetStream.send");
          },
          step: function step(frames) { // (frames:int) -> void
            notImplemented("NetStream.step");
          },
          call: function call(stream, command, responder) { // (stream:NetStream, command:String, responder:Responder) -> void
            notImplemented("NetStream.call");
          },
          receiveAudio: function receiveAudio(flag) { // (flag:Boolean) -> void
            notImplemented("NetStream.receiveAudio");
          },
          receiveVideo: function receiveVideo(flag) { // (flag:Boolean) -> void
            notImplemented("NetStream.receiveVideo");
          },
          receiveVideoFPS: function receiveVideoFPS(FPS) { // (FPS:Number) -> void
            notImplemented("NetStream.receiveVideoFPS");
          },
          pause: function pause() { // (void) -> void
            notImplemented("NetStream.pause");
          },
          resume: function resume() { // (void) -> void
            notImplemented("NetStream.resume");
          },
          togglePause: function togglePause() { // (void) -> void
            notImplemented("NetStream.togglePause");
          },
          seek: function seek(offset) { // (offset:Number) -> void
            notImplemented("NetStream.seek");
          },
          publish: function publish(name, type) { // (name:String = null, type:String = null) -> void
            notImplemented("NetStream.publish");
          },
          onPeerConnect: function onPeerConnect(subscriber) { // (subscriber:NetStream) -> Boolean
            notImplemented("NetStream.onPeerConnect");
          },
          bufferTime: {
            get: function bufferTime() { // (void) -> Number
              notImplemented("NetStream.bufferTime");
              return this._bufferTime;
            },
            set: function bufferTime(bufferTime) { // (bufferTime:Number) -> void
              notImplemented("NetStream.bufferTime");
              this._bufferTime = bufferTime;
            }
          },
          maxPauseBufferTime: {
            get: function maxPauseBufferTime() { // (void) -> Number
              notImplemented("NetStream.maxPauseBufferTime");
              return this._maxPauseBufferTime;
            },
            set: function maxPauseBufferTime(pauseBufferTime) { // (pauseBufferTime:Number) -> void
              notImplemented("NetStream.maxPauseBufferTime");
              this._maxPauseBufferTime = pauseBufferTime;
            }
          },
          backBufferTime: {
            get: function backBufferTime() { // (void) -> Number
              notImplemented("NetStream.backBufferTime");
              return this._backBufferTime;
            },
            set: function backBufferTime(backBufferTime) { // (backBufferTime:Number) -> void
              notImplemented("NetStream.backBufferTime");
              this._backBufferTime = backBufferTime;
            }
          },
          inBufferSeek: {
            get: function inBufferSeek() { // (void) -> Boolean
              notImplemented("NetStream.inBufferSeek");
              return this._inBufferSeek;
            },
            set: function inBufferSeek(value) { // (value:Boolean) -> void
              notImplemented("NetStream.inBufferSeek");
              this._inBufferSeek = value;
            }
          },
          backBufferLength: {
            get: function backBufferLength() { // (void) -> Number
              notImplemented("NetStream.backBufferLength");
              return this._backBufferLength;
            }
          },
          bufferTimeMax: {
            get: function bufferTimeMax() { // (void) -> Number
              notImplemented("NetStream.bufferTimeMax");
              return this._bufferTimeMax;
            },
            set: function bufferTimeMax(bufferTimeMax) { // (bufferTimeMax:Number) -> void
              notImplemented("NetStream.bufferTimeMax");
              this._bufferTimeMax = bufferTimeMax;
            }
          },
          time: {
            get: function time() { // (void) -> Number
              notImplemented("NetStream.time");
              return this._time;
            }
          },
          currentFPS: {
            get: function currentFPS() { // (void) -> Number
              notImplemented("NetStream.currentFPS");
              return this._currentFPS;
            }
          },
          bufferLength: {
            get: function bufferLength() { // (void) -> Number
              notImplemented("NetStream.bufferLength");
              return this._bufferLength;
            }
          },
          liveDelay: {
            get: function liveDelay() { // (void) -> Number
              notImplemented("NetStream.liveDelay");
              return this._liveDelay;
            }
          },
          bytesLoaded: {
            get: function bytesLoaded() { // (void) -> uint
              notImplemented("NetStream.bytesLoaded");
              return this._bytesLoaded;
            }
          },
          bytesTotal: {
            get: function bytesTotal() { // (void) -> uint
              notImplemented("NetStream.bytesTotal");
              return this._bytesTotal;
            }
          },
          decodedFrames: {
            get: function decodedFrames() { // (void) -> uint
              notImplemented("NetStream.decodedFrames");
              return this._decodedFrames;
            }
          },
          videoCodec: {
            get: function videoCodec() { // (void) -> uint
              notImplemented("NetStream.videoCodec");
              return this._videoCodec;
            }
          },
          audioCodec: {
            get: function audioCodec() { // (void) -> uint
              notImplemented("NetStream.audioCodec");
              return this._audioCodec;
            }
          }
        }
      }
    }
  };
}).call(this);
