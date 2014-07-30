/**
 * Copyright 2014 Mozilla Foundation
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// Class: NetStream
module Shumway.AVM2.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import wrapJSObject = Shumway.AVM2.Runtime.wrapJSObject;
  import NetStatusEvent = Shumway.AVM2.AS.flash.events.NetStatusEvent;
  import URLRequest = Shumway.AVM2.AS.flash.net.URLRequest;
  import URLStream = Shumway.AVM2.AS.flash.net.URLStream;
  import ByteArray = Shumway.AVM2.AS.flash.utils.ByteArray;
  import FileLoadingService = Shumway.FileLoadingService;

  var USE_MEDIASOURCE_API = false;
  declare var MediaSource;
  declare var URL;
  declare var Promise;
  declare var window;

  export class NetStream extends flash.events.EventDispatcher {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["attach", "close", "attachAudio", "attachCamera", "send", "bufferTime", "bufferTime", "maxPauseBufferTime", "maxPauseBufferTime", "backBufferTime", "backBufferTime", "inBufferSeek", "inBufferSeek", "backBufferLength", "step", "bufferTimeMax", "bufferTimeMax", "receiveAudio", "receiveVideo", "receiveVideoFPS", "pause", "resume", "togglePause", "seek", "publish", "time", "currentFPS", "bufferLength", "liveDelay", "bytesLoaded", "bytesTotal", "decodedFrames", "videoCodec", "audioCodec", "onPeerConnect", "call"];
    
    constructor (connection: flash.net.NetConnection, peerID: string = "connectToFMS") {
      peerID = asCoerceString(peerID);
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.net.NetStream");
    }

    private _videoElement;
    private _videoReady;
    private _videoMetadataReady;
    private _videoState;
    private _mediaSource;
    private _contentTypeHint;
    private _mediaSourceBuffer;
    
    // JS -> AS Bindings
    static DIRECT_CONNECTIONS: string = "directConnections";
    static CONNECT_TO_FMS: string = "connectToFMS";
    
    attach: (connection: flash.net.NetConnection) => void;
    close: () => void;
    attachAudio: (microphone: flash.media.Microphone) => void;
    attachCamera: (theCamera: flash.media.Camera, snapshotMilliseconds?: number /*int*/) => void;
    send: (handlerName: string) => void;
    bufferTime: number;
    maxPauseBufferTime: number;
    backBufferTime: number;
    inBufferSeek: boolean;
    backBufferLength: number;
    step: (frames: number /*int*/) => void;
    bufferTimeMax: number;
    receiveAudio: (flag: boolean) => void;
    receiveVideo: (flag: boolean) => void;
    receiveVideoFPS: (FPS: number) => void;
    pause: () => void;
    resume: () => void;
    togglePause: () => void;
    seek: (offset: number) => void;
    publish: (name?: string, type?: string) => void;
    time: number;
    currentFPS: number;
    bufferLength: number;
    liveDelay: number;
    bytesLoaded: number /*uint*/;
    bytesTotal: number /*uint*/;
    decodedFrames: number /*uint*/;
    videoCodec: number /*uint*/;
    audioCodec: number /*uint*/;
    onPeerConnect: (subscriber: flash.net.NetStream) => boolean;
    call: () => void;
    
    // AS -> JS Bindings

    // _bufferTime: number;
    // _maxPauseBufferTime: number;
    // _backBufferTime: number;
    // _inBufferSeek: boolean;
    // _backBufferLength: number;
    // _bufferTimeMax: number;
    // _info: flash.net.NetStreamInfo;
    // _multicastInfo: flash.net.NetStreamMulticastInfo;
    // _time: number;
    // _currentFPS: number;
    // _bufferLength: number;
    // _liveDelay: number;
    // _bytesLoaded: number /*uint*/;
    // _bytesTotal: number /*uint*/;
    // _decodedFrames: number /*uint*/;
    // _videoCodec: number /*uint*/;
    // _audioCodec: number /*uint*/;
    private _soundTransform: flash.media.SoundTransform;
    private _checkPolicyFile: boolean;
    private _client: ASObject;
    private _objectEncoding: number /*uint*/;
    // _multicastPushNeighborLimit: number;
    // _multicastWindowDuration: number;
    // _multicastRelayMarginDuration: number;
    // _multicastAvailabilityUpdatePeriod: number;
    // _multicastFetchPeriod: number;
    // _multicastAvailabilitySendToAll: boolean;
    // _farID: string;
    // _nearNonce: string;
    // _farNonce: string;
    // _peerStreams: any [];
    // _audioReliable: boolean;
    // _videoReliable: boolean;
    // _dataReliable: boolean;
    // _audioSampleAccess: boolean;
    // _videoSampleAccess: boolean;
    // _useHardwareDecoder: boolean;
    // _useJitterBuffer: boolean;
    // _videoStreamSettings: flash.media.VideoStreamSettings;
    dispose(): void {
      notImplemented("public flash.net.NetStream::dispose"); return;
    }
    play(url: string): void {
      // (void) -> void ???
      url = asCoerceString(url);
      var isMediaSourceEnabled = USE_MEDIASOURCE_API;
      if (isMediaSourceEnabled && typeof MediaSource === 'undefined') {
        console.warn('MediaSource API is not enabled, falling back to regular playback');
        isMediaSourceEnabled = false;
      }
      if (!isMediaSourceEnabled) {
        somewhatImplemented("public flash.net.NetStream::play");
        this._createVideoElement(FileLoadingService.instance.resolveUrl(url));
        return;
      }

      var mediaSource = new MediaSource();
      mediaSource.addEventListener('sourceopen', function(e) {
        this._mediaSource = mediaSource;
      }.bind(this));
      mediaSource.addEventListener('sourceend', function(e) {
        this._mediaSource = null;
      }.bind(this));
      this._createVideoElement(URL.createObjectURL(mediaSource));

      if (!url) {
        return;
      }

      var request = new URLRequest(url);
      request._checkPolicyFile = this._checkPolicyFile;
      var stream = new URLStream();
      stream.addEventListener('httpStatus', function (e) {
        var responseHeaders = e.asGetPublicProperty('responseHeaders');
        var contentTypeHeader = responseHeaders.filter(function (h) {
          return h.asGetPublicProperty('name') === 'Content-Type';
        })[0];
        if (contentTypeHeader &&
          contentTypeHeader.asGetPublicProperty('value') !==
            'application/octet-stream') {
          this._contentTypeHint = contentTypeHeader.asGetPublicProperty('value');
        }
      }.bind(this));
      stream.addEventListener('progress', function (e) {
        var available = stream.bytesAvailable;
        var data = new ByteArray();
        stream.readBytes(data, 0, available);
        this.appendBytes(data);
      }.bind(this));
      stream.addEventListener('complete', function (e) {
        this.appendBytesAction('endSequence'); // NetStreamAppendBytesAction.END_SEQUENCE
      }.bind(this));
      stream.load(request);
    }
    play2(param: flash.net.NetStreamPlayOptions): void {
      param = param;
      notImplemented("public flash.net.NetStream::play2"); return;
    }
    get info(): flash.net.NetStreamInfo {
      notImplemented("public flash.net.NetStream::get info"); return;
      // return this._info;
    }
    get multicastInfo(): flash.net.NetStreamMulticastInfo {
      notImplemented("public flash.net.NetStream::get multicastInfo"); return;
      // return this._multicastInfo;
    }
    get soundTransform(): flash.media.SoundTransform {
      return this._soundTransform;
    }
    set soundTransform(sndTransform: flash.media.SoundTransform) {
      somewhatImplemented("public flash.net.NetStream::set soundTransform");
      this._soundTransform = sndTransform;
    }
    get checkPolicyFile(): boolean {
      return this._checkPolicyFile;
    }
    set checkPolicyFile(state: boolean) {
      state = !!state;
      this._checkPolicyFile = state;
    }
    get client(): ASObject {
      return this._client;
    }
    set client(object: ASObject) {
      somewhatImplemented("public flash.net.NetStream::set client");
      this._client = object;
    }
    get objectEncoding(): number /*uint*/ {
      notImplemented("public flash.net.NetStream::get objectEncoding"); return;
      // return this._objectEncoding;
    }
    get multicastPushNeighborLimit(): number {
      notImplemented("public flash.net.NetStream::get multicastPushNeighborLimit"); return;
      // return this._multicastPushNeighborLimit;
    }
    set multicastPushNeighborLimit(neighbors: number) {
      neighbors = +neighbors;
      notImplemented("public flash.net.NetStream::set multicastPushNeighborLimit"); return;
      // this._multicastPushNeighborLimit = neighbors;
    }
    get multicastWindowDuration(): number {
      notImplemented("public flash.net.NetStream::get multicastWindowDuration"); return;
      // return this._multicastWindowDuration;
    }
    set multicastWindowDuration(seconds: number) {
      seconds = +seconds;
      notImplemented("public flash.net.NetStream::set multicastWindowDuration"); return;
      // this._multicastWindowDuration = seconds;
    }
    get multicastRelayMarginDuration(): number {
      notImplemented("public flash.net.NetStream::get multicastRelayMarginDuration"); return;
      // return this._multicastRelayMarginDuration;
    }
    set multicastRelayMarginDuration(seconds: number) {
      seconds = +seconds;
      notImplemented("public flash.net.NetStream::set multicastRelayMarginDuration"); return;
      // this._multicastRelayMarginDuration = seconds;
    }
    get multicastAvailabilityUpdatePeriod(): number {
      notImplemented("public flash.net.NetStream::get multicastAvailabilityUpdatePeriod"); return;
      // return this._multicastAvailabilityUpdatePeriod;
    }
    set multicastAvailabilityUpdatePeriod(seconds: number) {
      seconds = +seconds;
      notImplemented("public flash.net.NetStream::set multicastAvailabilityUpdatePeriod"); return;
      // this._multicastAvailabilityUpdatePeriod = seconds;
    }
    get multicastFetchPeriod(): number {
      notImplemented("public flash.net.NetStream::get multicastFetchPeriod"); return;
      // return this._multicastFetchPeriod;
    }
    set multicastFetchPeriod(seconds: number) {
      seconds = +seconds;
      notImplemented("public flash.net.NetStream::set multicastFetchPeriod"); return;
      // this._multicastFetchPeriod = seconds;
    }
    get multicastAvailabilitySendToAll(): boolean {
      notImplemented("public flash.net.NetStream::get multicastAvailabilitySendToAll"); return;
      // return this._multicastAvailabilitySendToAll;
    }
    set multicastAvailabilitySendToAll(value: boolean) {
      value = !!value;
      notImplemented("public flash.net.NetStream::set multicastAvailabilitySendToAll"); return;
      // this._multicastAvailabilitySendToAll = value;
    }
    get farID(): string {
      notImplemented("public flash.net.NetStream::get farID"); return;
      // return this._farID;
    }
    get nearNonce(): string {
      notImplemented("public flash.net.NetStream::get nearNonce"); return;
      // return this._nearNonce;
    }
    get farNonce(): string {
      notImplemented("public flash.net.NetStream::get farNonce"); return;
      // return this._farNonce;
    }
    get peerStreams(): any [] {
      notImplemented("public flash.net.NetStream::get peerStreams"); return;
      // return this._peerStreams;
    }
    get audioReliable(): boolean {
      notImplemented("public flash.net.NetStream::get audioReliable"); return;
      // return this._audioReliable;
    }
    set audioReliable(reliable: boolean) {
      reliable = !!reliable;
      notImplemented("public flash.net.NetStream::set audioReliable"); return;
      // this._audioReliable = reliable;
    }
    get videoReliable(): boolean {
      notImplemented("public flash.net.NetStream::get videoReliable"); return;
      // return this._videoReliable;
    }
    set videoReliable(reliable: boolean) {
      reliable = !!reliable;
      notImplemented("public flash.net.NetStream::set videoReliable"); return;
      // this._videoReliable = reliable;
    }
    get dataReliable(): boolean {
      notImplemented("public flash.net.NetStream::get dataReliable"); return;
      // return this._dataReliable;
    }
    set dataReliable(reliable: boolean) {
      reliable = !!reliable;
      notImplemented("public flash.net.NetStream::set dataReliable"); return;
      // this._dataReliable = reliable;
    }
    get audioSampleAccess(): boolean {
      notImplemented("public flash.net.NetStream::get audioSampleAccess"); return;
      // return this._audioSampleAccess;
    }
    set audioSampleAccess(reliable: boolean) {
      reliable = !!reliable;
      notImplemented("public flash.net.NetStream::set audioSampleAccess"); return;
      // this._audioSampleAccess = reliable;
    }
    get videoSampleAccess(): boolean {
      notImplemented("public flash.net.NetStream::get videoSampleAccess"); return;
      // return this._videoSampleAccess;
    }
    set videoSampleAccess(reliable: boolean) {
      reliable = !!reliable;
      notImplemented("public flash.net.NetStream::set videoSampleAccess"); return;
      // this._videoSampleAccess = reliable;
    }
    appendBytes(bytes: flash.utils.ByteArray): void {
      if (this._mediaSource) {
        if (!this._mediaSourceBuffer) {
          this._mediaSourceBuffer = this._mediaSource.addSourceBuffer(this._contentTypeHint);
        }
        this._mediaSourceBuffer.appendBuffer(new Uint8Array((<any> bytes)._buffer, 0, bytes.length));
      }

      somewhatImplemented("public flash.net.NetStream::appendBytes");
    }
    appendBytesAction(netStreamAppendBytesAction: string): void {
      netStreamAppendBytesAction = asCoerceString(netStreamAppendBytesAction);
      if (netStreamAppendBytesAction === 'endSequence' && this._mediaSource) {
        this._mediaSource.endOfStream();
      }
      somewhatImplemented("public flash.net.NetStream::appendBytesAction");
    }
    get useHardwareDecoder(): boolean {
      notImplemented("public flash.net.NetStream::get useHardwareDecoder"); return;
      // return this._useHardwareDecoder;
    }
    set useHardwareDecoder(v: boolean) {
      v = !!v;
      notImplemented("public flash.net.NetStream::set useHardwareDecoder"); return;
      // this._useHardwareDecoder = v;
    }
    get useJitterBuffer(): boolean {
      notImplemented("public flash.net.NetStream::get useJitterBuffer"); return;
      // return this._useJitterBuffer;
    }
    set useJitterBuffer(value: boolean) {
      value = !!value;
      notImplemented("public flash.net.NetStream::set useJitterBuffer"); return;
      // this._useJitterBuffer = value;
    }
    get videoStreamSettings(): flash.media.VideoStreamSettings {
      notImplemented("public flash.net.NetStream::get videoStreamSettings"); return;
      // return this._videoStreamSettings;
    }
    set videoStreamSettings(settings: flash.media.VideoStreamSettings) {
      settings = settings;
      notImplemented("public flash.net.NetStream::set videoStreamSettings"); return;
      // this._videoStreamSettings = settings;
    }
    ctor(connection: flash.net.NetConnection, peerID: string): void {
      peerID = asCoerceString(peerID);
      somewhatImplemented("public flash.net.NetStream::ctor");
      this._contentTypeHint = null;
      this._mediaSource = null;
      this._checkPolicyFile = true;
      this._videoElement = null;
      var videoReadyResolve, videoReadyReject;
      this._videoReady = new Promise(function (resolve, reject) {
        videoReadyResolve = resolve;
        videoReadyReject = reject;
      });
      this._videoReady.resolve = videoReadyResolve;
      this._videoReady.reject = videoReadyReject;
      var videoMetadataReadyResolve, videoMetadataReadyReject;
      this._videoMetadataReady = new Promise(function (resolve, reject) {
        videoMetadataReadyResolve = resolve;
        videoMetadataReadyReject = reject;
      });
      this._videoMetadataReady.resolve = videoMetadataReadyResolve;
      this._videoMetadataReady.reject = videoMetadataReadyReject;
      this._videoState = {
        started: false,
        buffer: 'empty',
        bufferTime: 0.1
      };
    }
    invoke(index: number /*uint*/): any {
      index = index >>> 0;
      return this._invoke(index, Array.prototype.slice.call(arguments, 1));
    }
    invokeWithArgsArray(index: number /*uint*/, p_arguments: any []): any {
      index = index >>> 0; p_arguments = p_arguments;
      return this._invoke.call(this, index, p_arguments);
    }

    private _invoke(index: number, args: any[]): any {
      var simulated = false, result;
      var videoElement = this._videoElement;
      switch (index) {
        case 4: // set bufferTime
          this._videoState.bufferTime = args[0];
          simulated = true;
          break;
        case 202: // call, e.g. ('pause', null, paused, time)
          switch (args[1]) {
            case 'pause':
              simulated = true;
              if (videoElement) {
                if (args[3] !== false && !videoElement.paused) {
                  videoElement.pause();
                } else if (args[3] !== true && videoElement.paused) {
                  videoElement.play();
                }
                videoElement.currentTime = args[4] / 1000;
              }
              break;
            case 'seek':
              simulated = true;
              if (videoElement && !videoElement.paused) {
                videoElement.currentTime = args[3] / 1000;
              }
              break;
          }
          break;
        case 300: // time
          result = videoElement ? videoElement.currentTime : 0;
          simulated = true;
          break;
        case 302: // get bufferTime
          result = this._videoState.bufferTime;
          simulated = true;
          break;
        case 303: // get bufferLength
          result = videoElement ? videoElement.duration : 0;
          simulated = true;
          break;
        case 305: // get bytesLoaded
          result = this._videoState.buffer === 'full' ? 100 :
            this._videoState.buffer === 'progress' ? 50 : 0;
          simulated = true;
          break;
        case 306: // get bytesTotal
          result = 100;
          simulated = true;
          break;
      }
      // (index:uint) -> any
      (simulated ? somewhatImplemented : notImplemented)(
        "NetStream._invoke (" + index + ")");
      return result;
    }
    private _createVideoElement(url: string) {
      function notifyPlayStart(e) {
        if (netStream._videoState.started) {
          return;
        }
        netStream._videoState.started = true;
        netStream.dispatchEvent(new NetStatusEvent(NetStatusEvent.NET_STATUS,
          false, false, wrapJSObject({code: "NetStream.Play.Start", level: "status"})));
      }
      function notifyPlayStop(e) {
        netStream._videoState.started = false;
        netStream.dispatchEvent(new NetStatusEvent(NetStatusEvent.NET_STATUS,
          false, false, wrapJSObject({code: "NetStream.Play.Stop", level: "status"})));
      }
      function notifyBufferFull(e) {
        netStream._videoState.buffer = 'full';
        netStream.dispatchEvent(new NetStatusEvent(NetStatusEvent.NET_STATUS,
          false, false, wrapJSObject({code: "NetStream.Buffer.Full", level: "status"})));
      }
      function notifyProgress(e) {
        netStream._videoState.buffer = 'progress';
      }
      function notifyBufferEmpty(e) {
        netStream._videoState.buffer = 'empty';
        netStream.dispatchEvent(new NetStatusEvent(NetStatusEvent.NET_STATUS,
          false, false, wrapJSObject({code: "NetStream.Buffer.Empty", level: "status"})));
      }
      function notifyError(e) {
        var code = e.target.error.code === 4 ? "NetStream.Play.NoSupportedTrackFound" :
          e.target.error.code === 3 ? "NetStream.Play.FileStructureInvalid" : "NetStream.Play.StreamNotFound";
        netStream.dispatchEvent(new NetStatusEvent(NetStatusEvent.NET_STATUS,
          false, false, wrapJSObject({code: code, level: "error"})));
      }
      function notifyMetadata(e) {
        netStream._videoMetadataReady.resolve({
          videoWidth: element.videoWidth,
          videoHeight: element.videoHeight
        });
        if (netStream._client) {
          var data = {};
          data.asSetPublicProperty('width', element.videoWidth);
          data.asSetPublicProperty('height', element.videoHeight);
          data.asSetPublicProperty('duration', element.duration);
          netStream._client.asCallPublicProperty('onMetaData', [data]);
        }
      }

      var netStream = this;

      // HACK Firefox/Mac does not support mp4 yet, using something playable
      if (/\.mp4$/i.test(url) &&
        /Intel Mac OS X.*?Firefox\/\d+/.test(window.navigator.userAgent)) {
        url = 'http://videos-cdn.mozilla.net/brand/Mozilla_2011_Story.webm';
      }

      var element = document.createElement('video');
      element.preload = 'metadata'; // for mobile devices
      element.src = url;
      element.addEventListener("play", notifyPlayStart);
      element.addEventListener("ended", notifyPlayStop);
      element.addEventListener("loadeddata", notifyBufferFull);
      element.addEventListener("progress", notifyProgress);
      element.addEventListener("waiting", notifyBufferEmpty);
      element.addEventListener("loadedmetadata", notifyMetadata);
      element.addEventListener("error", notifyError);
      element.play();

      this._videoElement = element;
      this._videoReady.resolve(element);
    }
  }
}
