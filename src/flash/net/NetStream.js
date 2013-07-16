/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*global Promise, FileLoadingService, MediaSource, Multiname, wrapJSObject */

var USE_MEDIASOURCE_API = false;

var NetStreamDefinition = (function () {
  return {
    // (connection:NetConnection, peerID:String = "connectToFMS")
    __class__: "flash.net.NetStream",
    initialize: function () {
    },
    _invoke: function (index, args) {
      var simulated = false, result;
      var videoElement = this._videoElement;
      switch (index) {
      case 4: // set bufferTime
        simulated = true;
        break;
      case 202: // call, e.g. ('pause', null, paused, time)
        simulated = true;
        break;
      case 300: // time
        result = videoElement ? videoElement.currentTime : 0;
        simulated = true;
        return 0;
      case 302: // get bufferTime
        result = videoElement.duration;
        simulated = true;
        return 0;
      case 305: // get bytesLoaded
        result = 1000000;
        simulated = true;
        return 0;
      case 306: // get bytesTotal
        result = 1000005;
        simulated = true;
        return 0;
      }
      // (index:uint) -> any
      (simulated ? somewhatImplemented : notImplemented)(
        "NetStream._invoke (" + index + ")");
      return result;
    },
    _createVideoElement: function (url) {
      function notifyPlayStart(e) {
        netStream._dispatchEvent(new NetStatusEvent(NetStatusEvent.class.NET_STATUS,
          false, false, wrapJSObject({code: "NetStream.Play.Start", level: "status"})));
      }
      function notifyPlayStop(e) {
        netStream._dispatchEvent(new NetStatusEvent(NetStatusEvent.class.NET_STATUS,
          false, false, wrapJSObject({code: "NetStream.Play.Stop", level: "status"})));
      }
      function notifyBufferFull(e) {
        netStream._dispatchEvent(new NetStatusEvent(NetStatusEvent.class.NET_STATUS,
          false, false, wrapJSObject({code: "NetStream.Buffer.Full", level: "status"})));
      }
      function notifyBufferEmpty(e) {
        netStream._dispatchEvent(new NetStatusEvent(NetStatusEvent.class.NET_STATUS,
          false, false, wrapJSObject({code: "NetStream.Buffer.Empty", level: "status"})));
      }
      function notifyError(e) {
        var code = e.target.error.code === 4 ? "NetStream.Play.NoSupportedTrackFound" :
          e.target.error.code === 3 ? "NetStream.Play.FileStructureInvalid" : "NetStream.Play.StreamNotFound";
        netStream._dispatchEvent(new NetStatusEvent(NetStatusEvent.class.NET_STATUS,
          false, false, wrapJSObject({code: code, level: "error"})));
      }
      function notifyMetadata(e) {
        netStream._videoMetadataReady.resolve({
          videoWidth: element.videoWidth,
          videoHeight: element.videoHeight
        });
      }

      var NetStatusEvent = flash.events.NetStatusEvent;
      var netStream = this;

      var element = document.createElement('video');
      element.src = url;
      element.addEventListener("play", notifyPlayStart);
      element.addEventListener("ended", notifyPlayStop);
      element.addEventListener("loadeddata", notifyBufferFull);
      element.addEventListener("waiting", notifyBufferEmpty);
      element.addEventListener("loadedmetadata", notifyMetadata);
      element.addEventListener("error", notifyError);
      element.play();

      this._videoElement = element;
      this._videoReady.resolve(element);
    },
    __glue__: {
      script: {
        instance: scriptProperties("public", ["appendBytes",
                                              "appendBytesAction"])
      },
      native: {
        static: {
        },
        instance: {
          ctor: function ctor(connection, peerID) {
            // (connection:NetConnection, peerID:String) -> void
            somewhatImplemented("NetStream.ctor");
            this._contentTypeHint = null;
            this._mediaSource = null;
            this._checkPolicyFile = true;
            this._videoElement = null;
            this._videoReady = new Promise();
            this._videoMetadataReady = new Promise();
          },
          onResult: function onResult(streamId) {
            // (streamId:int) -> void
            notImplemented("NetStream.onResult");
          },
          dispose: function dispose() {
            // (void) -> void
            notImplemented("NetStream.dispose");
          },
          play: function play(url) {
            // (void) -> void
            var isMediaSourceEnabled = USE_MEDIASOURCE_API;
            if (isMediaSourceEnabled && typeof MediaSource === 'undefined') {
              console.warn('MediaSource API is not enabled, falling back to regular playback');
              isMediaSourceEnabled = false;
            }
            if (!isMediaSourceEnabled) {
              somewhatImplemented("NetStream.play");
              this._createVideoElement(FileLoadingService.resolveUrl(url));
              return;
            }

            var mediaSource = new MediaSource();
            mediaSource.addEventListener('sourceopen', function(e) {
              this._mediaSource = mediaSource;
            }.bind(this));
            mediaSource.addEventListener('sourceend', function(e) {
              this._mediaSource = null;
            }.bind(this));
            this._createVideoElement(window.URL.createObjectURL(mediaSource));

            if (!url) {
              return;
            }

            var request = new flash.net.URLRequest(url);
            request._checkPolicyFile = this._checkPolicyFile;
            var stream = new flash.net.URLStream();
            stream._addEventListener('httpStatus', function (e) {
              var responseHeaders = e[Multiname.getPublicQualifiedName('responseHeaders')];
              var contentTypeHeader = responseHeaders.filter(function (h) {
                return h[Multiname.getPublicQualifiedName('name')] === 'Content-Type';
              })[0];
              if (contentTypeHeader &&
                  contentTypeHeader[Multiname.getPublicQualifiedName('value')] !==
                    'application/octet-stream') {
                this._contentTypeHint = contentTypeHeader[Multiname.getPublicQualifiedName('value')];
              }
            }.bind(this));
            stream._addEventListener('progress', function (e) {
              var available = stream.bytesAvailable;
              var ByteArrayClass = avm2.systemDomain.getClass("flash.utils.ByteArray");
              var data = ByteArrayClass.createInstance();
              stream.readBytes(data, 0, available);
              this.appendBytes(data);
            }.bind(this));
            stream._addEventListener('complete', function (e) {
              this.appendBytesAction('endSequence'); // NetStreamAppendBytesAction.END_SEQUENCE
            }.bind(this));
            stream.load(request);
          },
          play2: function play2(param) {
            // (param:NetStreamPlayOptions) -> void
            notImplemented("NetStream.play2");
          },
          invoke: function invoke(index) {
            // (index:uint, arg1:Array, ...) -> any
            return this._invoke(index, Array.prototype.slice.call(arguments, 1));
          },
          invokeWithArgsArray: function invokeWithArgsArray(index, p_arguments) {
            // (index:uint, p_arguments:Array) -> any
            return this._invoke.call(this, index, p_arguments);
          },
          appendBytes: function appendBytes(bytes) {
            if (this._mediaSource) {
              if (!this._mediaSourceBuffer) {
                this._mediaSourceBuffer = this._mediaSource.addSourceBuffer(this._contentTypeHint);
              }
              this._mediaSourceBuffer.appendBuffer(new Uint8Array(bytes.a, 0, bytes.length));
            }
            // (bytes:ByteArray) -> void
            somewhatImplemented("NetStream.appendBytes");
          },
          appendBytesAction: function appendBytesAction(netStreamAppendBytesAction) {
            // (netStreamAppendBytesAction:String) -> void
            if (netStreamAppendBytesAction === 'endSequence' && this._mediaSource) {
              this._mediaSource.endOfStream();
            }
            somewhatImplemented("NetStream.appendBytesAction");
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
              return this._soundTransform;
            },
            set: function soundTransform(sndTransform) {
              // (sndTransform:SoundTransform) -> void
              somewhatImplemented("NetStream.soundTransform");
              this._soundTransform = sndTransform;
            }
          },
          checkPolicyFile: {
            get: function checkPolicyFile() {
              // (void) -> Boolean
              return this._checkPolicyFile;
            },
            set: function checkPolicyFile(state) {
              // (state:Boolean) -> void
              this._checkPolicyFile = state;
            }
          },
          client: {
            get: function client() {
              // (void) -> Object
              somewhatImplemented("NetStream.client");
              return this._client;
            },
            set: function client(object) {
              // (object:Object) -> void
              somewhatImplemented("NetStream.client");
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
      }
    }
  };
}).call(this);
