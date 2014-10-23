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
  import net = Shumway.AVM2.AS.flash.net;
  import utils = Shumway.AVM2.AS.flash.utils;
  import FileLoadingService = Shumway.FileLoadingService;
  import AVM2 = Shumway.AVM2.Runtime.AVM2;
  import VideoPlaybackEvent = Shumway.Remoting.VideoPlaybackEvent;
  import VideoControlEvent = Shumway.Remoting.VideoControlEvent;

  var USE_MEDIASOURCE_API = false;
  declare var MediaSource;
  declare var URL;
  declare var Promise;
  declare var window;

  export class NetStream extends flash.events.EventDispatcher {
    _isDirty: boolean;

    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["attach", "close", "attachAudio", "attachCamera", "send", "bufferTime", "bufferTime", "maxPauseBufferTime", "maxPauseBufferTime", "backBufferTime", "backBufferTime", "inBufferSeek", "inBufferSeek", "backBufferLength", "step", "bufferTimeMax", "bufferTimeMax", "receiveAudio", "receiveVideo", "receiveVideoFPS", "pause", "resume", "togglePause", "seek", "publish", "time", "currentFPS", "bufferLength", "liveDelay", "bytesLoaded", "bytesTotal", "decodedFrames", "videoCodec", "audioCodec", "onPeerConnect", "call"];

    constructor (connection: flash.net.NetConnection, peerID: string = "connectToFMS") {
      false && super(undefined);
      events.EventDispatcher.instanceConstructorNoInitialize.call(this);
      this._connection = connection;
      this._peerID = asCoerceString(peerID);
      this._id = flash.display.DisplayObject.getNextSyncID();
      this._isDirty = true;

      this._contentTypeHint = null;
      this._mediaSource = null;
      this._checkPolicyFile = true;

      this._videoReady = new PromiseWrapper<any>();
      this._videoMetadataReady = new PromiseWrapper<any>();
      this._videoState = {
        started: false,
        buffer: 'empty',
        bufferTime: 0.1
      };
    }

    _connection: flash.net.NetConnection;
    _peerID: string;

    _id: number;

    /**
     * Only one video can be attached to this |NetStream| object. If we attach another video, then
     * the previous attachement is lost. (Validated through experimentation.)
     */
    _videoReferrer: flash.media.Video;

    private _videoReady: PromiseWrapper<any>;
    private _videoMetadataReady: PromiseWrapper<any>;
    private _videoState;
    private _mediaSource;
    private _contentTypeHint;
    private _mediaSourceBuffer;
    private _mediaSourceBufferLock: Promise<any>;
    
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

    // Playing URL, temporary hack for proof of concept.
    _url: string;

    dispose(): void {
      notImplemented("public flash.net.NetStream::dispose"); return;
    }

    play(url: string): void {
      // (void) -> void ???
      url = asCoerceString(url);

      var service: IVideoElementService = AVM2.instance.globals['Shumway.Player.Utils'];
      service.registerEventListener(this._id, this.processVideoEvent.bind(this));

      var isMediaSourceEnabled = USE_MEDIASOURCE_API;
      if (isMediaSourceEnabled && typeof MediaSource === 'undefined') {
        console.warn('MediaSource API is not enabled, falling back to regular playback');
        isMediaSourceEnabled = false;
      }
      if (!isMediaSourceEnabled) {
        somewhatImplemented("public flash.net.NetStream::play");
        this._url = FileLoadingService.instance.resolveUrl(url);
        return;
      }

      var mediaSource = new MediaSource();
      mediaSource.addEventListener('sourceopen', function(e) {
        this._mediaSource = mediaSource;
      }.bind(this));
      mediaSource.addEventListener('sourceend', function(e) {
        this._mediaSource = null;
      }.bind(this));

      if (!url) {
        this._url = null;
        return;
      }

      this._url = URL.createObjectURL(mediaSource);

      var request = new net.URLRequest(url);
      request._checkPolicyFile = this._checkPolicyFile;
      var stream = new net.URLStream();
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
        var data = new utils.ByteArray();
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
          var contentType = this._contentTypeHint || this._detectContentType(bytes);
          this._mediaSourceBufferLock = Promise.resolve(undefined);
          this._mediaSourceBuffer = this._mediaSource.addSourceBuffer(contentType);
          this._mediaSourceBuffer.mode = 'sequence';
        }
        var chunk = new Uint8Array((<any> bytes)._buffer, 0, bytes.length);
        var buffer = this._mediaSourceBuffer;
        var netStream = this;
        this._mediaSourceBufferLock = this._mediaSourceBufferLock.then(function () {
          buffer.appendBuffer(chunk);
          return new Promise(function (resolve) {
            buffer.addEventListener('update', function updateHandler() {
              buffer.removeEventListener('update', updateHandler);
              resolve();
              // netStream._notifyVideoControl(VideoControlEvent.Pause, {paused: false, time: NaN});
            });
          });
        });
      }

      somewhatImplemented("public flash.net.NetStream::appendBytes");
    }
    appendBytesAction(netStreamAppendBytesAction: string): void {
      netStreamAppendBytesAction = asCoerceString(netStreamAppendBytesAction);
      if (netStreamAppendBytesAction === 'endSequence') {
        this._mediaSourceBufferLock.then(function () {
          if (this._mediaSource) {
            this._mediaSource.endOfStream();
          }
        }.bind(this));
      }
      somewhatImplemented("public flash.net.NetStream::appendBytesAction");
    }
    private _detectContentType(bytes: flash.utils.ByteArray): string {
      // TODO check bytes for content type
      return 'video/mp4;codecs=\"avc1.4D4041\"';
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
      switch (index) {
        case 4: // set bufferTime
          this._videoState.bufferTime = args[0];
          simulated = true;
          break;
        case 202: // call, e.g. ('pause', null, paused, time)
          switch (args[1]) {
            case 'pause':
              simulated = true;
              this._notifyVideoControl(VideoControlEvent.Pause, {
                paused: !!args[3],
                time: args[4] / 1000
              });
              break;
            case 'seek':
              simulated = true;
              this._notifyVideoControl(VideoControlEvent.Seek, {
                time: args[3] / 1000
              });
              break;
          }
          break;
        case 300: // time
          result = this._notifyVideoControl(VideoControlEvent.GetTime, null);
          simulated = true;
          break;
        case 302: // get bufferTime
          result = this._videoState.bufferTime;
          simulated = true;
          break;
        case 303: // get bufferLength
          result = this._notifyVideoControl(VideoControlEvent.GetBufferLength, null);
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

    private _notifyVideoControl(eventType: VideoControlEvent, data: any): any {
      var service: IVideoElementService = AVM2.instance.globals['Shumway.Player.Utils'];
      return service.notifyVideoControl(this._id, eventType, data);
    }

    processVideoEvent(eventType: VideoPlaybackEvent, data: any): void {
      switch (eventType) {
        case VideoPlaybackEvent.Initialized:
          this._videoReady.resolve(undefined);
          break;
        case VideoPlaybackEvent.PlayStart:
          if (this._videoState.started) {
            break;
          }
          this._videoState.started = true;
          this.dispatchEvent(new NetStatusEvent(NetStatusEvent.NET_STATUS,
            false, false, wrapJSObject({code: "NetStream.Play.Start", level: "status"})));
          break;
        case VideoPlaybackEvent.PlayStop:
          this._videoState.started = false;
          this.dispatchEvent(new NetStatusEvent(NetStatusEvent.NET_STATUS,
            false, false, wrapJSObject({code: "NetStream.Play.Stop", level: "status"})));
          break;
        case VideoPlaybackEvent.BufferFull:
          this._videoState.buffer = 'full';
          this.dispatchEvent(new NetStatusEvent(NetStatusEvent.NET_STATUS,
            false, false, wrapJSObject({code: "NetStream.Buffer.Full", level: "status"})));
          break;
        case VideoPlaybackEvent.Progress:
          this._videoState.buffer = 'progress';
          break;
        case VideoPlaybackEvent.BufferEmpty:
          this._videoState.buffer = 'empty';
          this.dispatchEvent(new NetStatusEvent(NetStatusEvent.NET_STATUS,
            false, false, wrapJSObject({code: "NetStream.Buffer.Empty", level: "status"})));
          break;
        case VideoPlaybackEvent.Error:
          var code = data.code === 4 ? "NetStream.Play.NoSupportedTrackFound" :
              data.code === 3 ? "NetStream.Play.FileStructureInvalid" : "NetStream.Play.StreamNotFound";
          this.dispatchEvent(new NetStatusEvent(NetStatusEvent.NET_STATUS,
            false, false, wrapJSObject({code: code, level: "error"})));
          break;
        case VideoPlaybackEvent.Metadata:
          this._videoMetadataReady.resolve({
            videoWidth: data.videoWidth,
            videoHeight: data.videoHeight
          });
          if (this._client) {
            var metadata = {};
            metadata.asSetPublicProperty('width', data.videoWidth);
            metadata.asSetPublicProperty('height', data.videoHeight);
            metadata.asSetPublicProperty('duration', data.duration);
            this._client.asCallPublicProperty('onMetaData', [metadata]);
          }
          break;
      }
    }
  }

  export interface IVideoElementService {
    registerEventListener(id: number, listener: (eventType: VideoPlaybackEvent, data: any) => void);
    notifyVideoControl(id: number, eventType: VideoControlEvent, data: any): any;
  }
}
