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
module Shumway.AVMX.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  import assert = Shumway.Debug.assert;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import events = Shumway.AVMX.AS.flash.events;
  import net = Shumway.AVMX.AS.flash.net;
  import utils = Shumway.AVMX.AS.flash.utils;
  import FileLoadingService = Shumway.FileLoadingService;
  import VideoPlaybackEvent = Shumway.Remoting.VideoPlaybackEvent;
  import VideoControlEvent = Shumway.Remoting.VideoControlEvent;
  import ISoundSource = flash.media.ISoundSource;
  import IDataDecoder = Shumway.ArrayUtilities.IDataDecoder;

  declare var MediaSource;
  declare var URL;
  declare var Promise;
  declare var window;

  export class NetStream extends flash.events.EventDispatcher implements ISoundSource {
    _isDirty: boolean;

    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["attach", "close", "attachAudio", "attachCamera", "send", "bufferTime", "bufferTime", "maxPauseBufferTime", "maxPauseBufferTime", "backBufferTime", "backBufferTime", "backBufferLength", "step", "bufferTimeMax", "bufferTimeMax", "receiveAudio", "receiveVideo", "receiveVideoFPS", "pause", "resume", "togglePause", "seek", "publish", "time", "currentFPS", "bufferLength", "liveDelay", "bytesLoaded", "bytesTotal", "decodedFrames", "videoCodec", "audioCodec", "onPeerConnect", "call"];

    constructor (connection: flash.net.NetConnection, peerID: string = "connectToFMS") {
      super();
      this._connection = connection;
      this._peerID = axCoerceString(peerID);
      this._id = flash.display.DisplayObject.getNextSyncID();
      this._isDirty = true;
      this._soundTransform = new this.sec.flash.media.SoundTransform();

      this._contentTypeHint = null;
      this._checkPolicyFile = true;

      this._videoStream = new VideoStream(this);
      this._videoStream._onEnsurePlay = function () {
        this._notifyVideoControl(VideoControlEvent.EnsurePlaying, null);
      }.bind(this);

      this._resourceName = null;
      this._metaData = null;
    }

    _connection: flash.net.NetConnection;
    _peerID: string;

    _id: number;

    private _resourceName: string;
    private _metaData: any;

    /**
     * Only one video can be attached to this |NetStream| object. If we attach another video, then
     * the previous attachement is lost. (Validated through experimentation.)
     */
    _videoReferrer: flash.media.Video;

    private _videoStream: VideoStream;
    private _contentTypeHint;

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

    // _maxPauseBufferTime: number;
    // _backBufferTime: number;
    _inBufferSeek: boolean;
    // _backBufferLength: number;
    // _bufferTimeMax: number;
    private _info: flash.net.NetStreamInfo;
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
      release || notImplemented("public flash.net.NetStream::dispose"); return;
    }

    _getVideoStreamURL(): string {
      return this._videoStream.url;
    }

    play(url: string): void {
      flash.media.SoundMixer._registerSoundSource(this);

      // (void) -> void ???
      url = axCoerceString(url);

      var service: IVideoElementService = this.sec.player;
      service.registerEventListener(this._id, this.processVideoEvent.bind(this));

      if (this._connection && this._connection.uri) {
        this._videoStream.playInConnection(this._connection, url);
      } else if (url === null) {
        this._videoStream.openInDataGenerationMode();
      } else {
        this._videoStream.play(url, this.checkPolicyFile);
      }

      this._notifyVideoControl(VideoControlEvent.Init, {
        url: this._videoStream.url
      });
    }
    play2(param: flash.net.NetStreamPlayOptions): void {
      param = param;
      release || notImplemented("public flash.net.NetStream::play2"); return;
    }
    get info(): flash.net.NetStreamInfo {
      release || somewhatImplemented("public flash.net.NetStream::get info");
      var bufferSeconds = 1;
      var playedSeconds = Math.ceil(this._invoke(304, null));
      var audioBytesPerSecond = 32;
      var videoBytesPerSecond = 200;
      var dataBytesPerSecond = 1;
      return new this.sec.flash.net.NetStreamInfo(
        audioBytesPerSecond + videoBytesPerSecond,
        (audioBytesPerSecond + videoBytesPerSecond + dataBytesPerSecond) * (bufferSeconds + playedSeconds),
        audioBytesPerSecond + videoBytesPerSecond,
        audioBytesPerSecond,
        audioBytesPerSecond * (bufferSeconds + playedSeconds),
        videoBytesPerSecond,
        videoBytesPerSecond * (bufferSeconds + playedSeconds),
        dataBytesPerSecond,
        dataBytesPerSecond * (bufferSeconds + playedSeconds),
        (audioBytesPerSecond + videoBytesPerSecond + dataBytesPerSecond) * playedSeconds,
        0,
        audioBytesPerSecond * bufferSeconds,
        videoBytesPerSecond * bufferSeconds,
        dataBytesPerSecond * bufferSeconds,
        bufferSeconds,
        bufferSeconds,
        bufferSeconds,
        0,
        0,
        0,
        this._metaData,
        null,
        this._connection.uri,
        this._resourceName,
        false
      );
    }
    get multicastInfo(): flash.net.NetStreamMulticastInfo {
      release || notImplemented("public flash.net.NetStream::get multicastInfo"); return;
      // return this._multicastInfo;
    }
    get soundTransform(): flash.media.SoundTransform {
      return this._soundTransform;
    }
    set soundTransform(sndTransform: flash.media.SoundTransform) {
      this._soundTransform = sndTransform;
      flash.media.SoundMixer._updateSoundSource(this);
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
      release || somewhatImplemented("public flash.net.NetStream::set client");
      this._client = object;
    }
    get objectEncoding(): number /*uint*/ {
      release || notImplemented("public flash.net.NetStream::get objectEncoding"); return;
      // return this._objectEncoding;
    }
    get multicastPushNeighborLimit(): number {
      release || notImplemented("public flash.net.NetStream::get multicastPushNeighborLimit"); return;
      // return this._multicastPushNeighborLimit;
    }
    set multicastPushNeighborLimit(neighbors: number) {
      neighbors = +neighbors;
      release || notImplemented("public flash.net.NetStream::set multicastPushNeighborLimit"); return;
      // this._multicastPushNeighborLimit = neighbors;
    }
    get multicastWindowDuration(): number {
      release || notImplemented("public flash.net.NetStream::get multicastWindowDuration"); return;
      // return this._multicastWindowDuration;
    }
    set multicastWindowDuration(seconds: number) {
      seconds = +seconds;
      release || notImplemented("public flash.net.NetStream::set multicastWindowDuration"); return;
      // this._multicastWindowDuration = seconds;
    }
    get multicastRelayMarginDuration(): number {
      release || notImplemented("public flash.net.NetStream::get multicastRelayMarginDuration"); return;
      // return this._multicastRelayMarginDuration;
    }
    set multicastRelayMarginDuration(seconds: number) {
      seconds = +seconds;
      release || notImplemented("public flash.net.NetStream::set multicastRelayMarginDuration"); return;
      // this._multicastRelayMarginDuration = seconds;
    }
    get multicastAvailabilityUpdatePeriod(): number {
      release || notImplemented("public flash.net.NetStream::get multicastAvailabilityUpdatePeriod"); return;
      // return this._multicastAvailabilityUpdatePeriod;
    }
    set multicastAvailabilityUpdatePeriod(seconds: number) {
      seconds = +seconds;
      release || notImplemented("public flash.net.NetStream::set multicastAvailabilityUpdatePeriod"); return;
      // this._multicastAvailabilityUpdatePeriod = seconds;
    }
    get multicastFetchPeriod(): number {
      release || notImplemented("public flash.net.NetStream::get multicastFetchPeriod"); return;
      // return this._multicastFetchPeriod;
    }
    set multicastFetchPeriod(seconds: number) {
      seconds = +seconds;
      release || notImplemented("public flash.net.NetStream::set multicastFetchPeriod"); return;
      // this._multicastFetchPeriod = seconds;
    }
    get multicastAvailabilitySendToAll(): boolean {
      release || notImplemented("public flash.net.NetStream::get multicastAvailabilitySendToAll"); return;
      // return this._multicastAvailabilitySendToAll;
    }
    set multicastAvailabilitySendToAll(value: boolean) {
      value = !!value;
      release || notImplemented("public flash.net.NetStream::set multicastAvailabilitySendToAll"); return;
      // this._multicastAvailabilitySendToAll = value;
    }
    get farID(): string {
      release || notImplemented("public flash.net.NetStream::get farID"); return;
      // return this._farID;
    }
    get nearNonce(): string {
      release || notImplemented("public flash.net.NetStream::get nearNonce"); return;
      // return this._nearNonce;
    }
    get farNonce(): string {
      release || notImplemented("public flash.net.NetStream::get farNonce"); return;
      // return this._farNonce;
    }
    get peerStreams(): ASArray {
      release || notImplemented("public flash.net.NetStream::get peerStreams"); return;
      // return this._peerStreams;
    }
    get audioReliable(): boolean {
      release || notImplemented("public flash.net.NetStream::get audioReliable"); return;
      // return this._audioReliable;
    }
    set audioReliable(reliable: boolean) {
      reliable = !!reliable;
      release || notImplemented("public flash.net.NetStream::set audioReliable"); return;
      // this._audioReliable = reliable;
    }
    get videoReliable(): boolean {
      release || notImplemented("public flash.net.NetStream::get videoReliable"); return;
      // return this._videoReliable;
    }
    set videoReliable(reliable: boolean) {
      reliable = !!reliable;
      release || notImplemented("public flash.net.NetStream::set videoReliable"); return;
      // this._videoReliable = reliable;
    }
    get dataReliable(): boolean {
      release || notImplemented("public flash.net.NetStream::get dataReliable"); return;
      // return this._dataReliable;
    }
    set dataReliable(reliable: boolean) {
      reliable = !!reliable;
      release || notImplemented("public flash.net.NetStream::set dataReliable"); return;
      // this._dataReliable = reliable;
    }
    get audioSampleAccess(): boolean {
      release || notImplemented("public flash.net.NetStream::get audioSampleAccess"); return;
      // return this._audioSampleAccess;
    }
    set audioSampleAccess(reliable: boolean) {
      reliable = !!reliable;
      release || notImplemented("public flash.net.NetStream::set audioSampleAccess"); return;
      // this._audioSampleAccess = reliable;
    }
    get videoSampleAccess(): boolean {
      release || notImplemented("public flash.net.NetStream::get videoSampleAccess"); return;
      // return this._videoSampleAccess;
    }
    set videoSampleAccess(reliable: boolean) {
      reliable = !!reliable;
      release || notImplemented("public flash.net.NetStream::set videoSampleAccess"); return;
      // this._videoSampleAccess = reliable;
    }
    appendBytes(bytes: flash.utils.ByteArray): void {
      var chunk = new Uint8Array((<any> bytes)._buffer, 0, bytes.length);
      // We need to pass cloned data, since the bytes can be reused and
      // VideoStream.appendBytes can hold data for some time.
      this._videoStream.appendBytes(chunk);
    }
    appendBytesAction(netStreamAppendBytesAction: string): void {
      this._videoStream.appendBytesAction(netStreamAppendBytesAction);
    }
    get useHardwareDecoder(): boolean {
      release || notImplemented("public flash.net.NetStream::get useHardwareDecoder"); return;
      // return this._useHardwareDecoder;
    }
    set useHardwareDecoder(v: boolean) {
      v = !!v;
      release || notImplemented("public flash.net.NetStream::set useHardwareDecoder"); return;
      // this._useHardwareDecoder = v;
    }
    get useJitterBuffer(): boolean {
      release || notImplemented("public flash.net.NetStream::get useJitterBuffer"); return;
      // return this._useJitterBuffer;
    }
    set useJitterBuffer(value: boolean) {
      value = !!value;
      release || notImplemented("public flash.net.NetStream::set useJitterBuffer"); return;
      // this._useJitterBuffer = value;
    }
    get videoStreamSettings(): flash.media.VideoStreamSettings {
      release || notImplemented("public flash.net.NetStream::get videoStreamSettings"); return;
      // return this._videoStreamSettings;
    }
    set videoStreamSettings(settings: flash.media.VideoStreamSettings) {
      settings = settings;
      release || notImplemented("public flash.net.NetStream::set videoStreamSettings"); return;
      // this._videoStreamSettings = settings;
    }
    invoke(index: number /*uint*/): any {
      index = index >>> 0;
      return this._invoke(index, Array.prototype.slice.call(arguments, 1));
    }
    invokeWithArgsArray(index: number /*uint*/, p_arguments: ASArray): any {
      index = index >>> 0; p_arguments = p_arguments;
      return this._invoke.call(this, index, p_arguments.value);
    }

    get inBufferSeek(): boolean {
      return this._inBufferSeek;
    }

    set inBufferSeek(value: boolean) {
      this._inBufferSeek = !!value;
    }

    private _invoke(index: number, args: any[]): any {
      var simulated = false, result;
      switch (index) {
        case 4: // set bufferTime
          this._videoStream.bufferTime = args[0];
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
          result = this._videoStream.bufferTime;
          simulated = true;
          break;
        case 303: // get bufferLength
          result = this._notifyVideoControl(VideoControlEvent.GetBufferLength, null);
          simulated = true;
          break;
        case 305: // get bytesLoaded
          result = this._notifyVideoControl(VideoControlEvent.GetBytesLoaded, null);
          simulated = true;
          break;
        case 306: // get bytesTotal
          result = this._notifyVideoControl(VideoControlEvent.GetBytesTotal, null);
          simulated = true;
          break;
      }
      // (index:uint) -> any
      (simulated ? somewhatImplemented : notImplemented)(
        "NetStream._invoke (" + index + ")");
      return result;
    }

    private _notifyVideoControl(eventType: VideoControlEvent, data: any): any {
      var service: IVideoElementService = this.sec.player;
      return service.notifyVideoControl(this._id, eventType, data);
    }

    processVideoEvent(eventType: VideoPlaybackEvent, data: any): void {
      this._videoStream.processVideoPlaybackEvent(eventType, data);

      var netStatusEventCtor = this.sec.flash.events.NetStatusEvent;
      switch (eventType) {
        case VideoPlaybackEvent.Initialized:
          flash.media.SoundMixer._updateSoundSource(this);
          break;
        case VideoPlaybackEvent.PlayStart:
          this.dispatchEvent(new netStatusEventCtor(events.NetStatusEvent.NET_STATUS,
            false, false, this.sec.createObjectFromJS({code: "NetStream.Play.Start", level: "status"})));
          break;
        case VideoPlaybackEvent.PlayStop:
          this.dispatchEvent(new netStatusEventCtor(events.NetStatusEvent.NET_STATUS,
            false, false, this.sec.createObjectFromJS({code: "NetStream.Buffer.Flush", level: "status"})));
          this.dispatchEvent(new netStatusEventCtor(events.NetStatusEvent.NET_STATUS,
            false, false, this.sec.createObjectFromJS({code: "NetStream.Play.Stop", level: "status"})));

          flash.media.SoundMixer._unregisterSoundSource(this);
          break;
        case VideoPlaybackEvent.BufferFull:
          this.dispatchEvent(new netStatusEventCtor(events.NetStatusEvent.NET_STATUS,
            false, false, this.sec.createObjectFromJS({code: "NetStream.Buffer.Full", level: "status"})));
          break;
        case VideoPlaybackEvent.BufferEmpty:
          this.dispatchEvent(new netStatusEventCtor(events.NetStatusEvent.NET_STATUS,
            false, false, this.sec.createObjectFromJS({code: "NetStream.Buffer.Empty", level: "status"})));
          break;
        case VideoPlaybackEvent.Error:
          var code = data.code === 4 ? "NetStream.Play.NoSupportedTrackFound" :
              data.code === 3 ? "NetStream.Play.FileStructureInvalid" : "NetStream.Play.StreamNotFound";
          this.dispatchEvent(new netStatusEventCtor(events.NetStatusEvent.NET_STATUS,
            false, false, this.sec.createObjectFromJS({code: code, level: "error"})));
          break;
        case VideoPlaybackEvent.Pause:
          this.dispatchEvent(new netStatusEventCtor(events.NetStatusEvent.NET_STATUS,
            false, false, this.sec.createObjectFromJS({code: "NetStream.Pause.Notify", level: "status"})));
          break;
        case VideoPlaybackEvent.Unpause:
          this.dispatchEvent(new netStatusEventCtor(events.NetStatusEvent.NET_STATUS,
            false, false, this.sec.createObjectFromJS({code: "NetStream.Unpause.Notify", level: "status"})));
          break;
        case VideoPlaybackEvent.Seeking:
          this.dispatchEvent(new netStatusEventCtor(events.NetStatusEvent.NET_STATUS,
            false, false, this.sec.createObjectFromJS({code: "NetStream.Seek.Notify", level: "status"})));
          break;
        case VideoPlaybackEvent.Seeked:
          this.dispatchEvent(new netStatusEventCtor(events.NetStatusEvent.NET_STATUS,
            false, false, this.sec.createObjectFromJS({code: "NetStream.Seek.Complete", level: "status"})));
          break;
        case VideoPlaybackEvent.Metadata:
          if (this._client) {
            var metadata: ASObject = this.sec.createObject();
            metadata.axSetPublicProperty('width', data.videoWidth);
            metadata.axSetPublicProperty('height', data.videoHeight);
            metadata.axSetPublicProperty('duration', data.duration);
            this._client.axCallPublicProperty('onMetaData', [metadata]);
          }
          break;
      }
    }

    stopSound() {
      this.pause();
    }

    updateSoundLevels(volume: number) {
      this._notifyVideoControl(VideoControlEvent.SetSoundLevels, {
        volume: volume
      });
    }
  }

  export interface IVideoElementService {
    registerEventListener(id: number, listener: (eventType: VideoPlaybackEvent, data: any) => void);
    notifyVideoControl(id: number, eventType: VideoControlEvent, data: any): any;
  }

  var FLV_MIME_TYPE = 'video/x-flv';
  var MP4_MIME_TYPE = 'video/mp4';
  var MP3_MIME_TYPE = 'audio/mpeg';

  function buildMimeType(baseType: string, codecs: string[]) {
    var mimeType = baseType;
    if (codecs) {
      mimeType += ';codecs=\"' + codecs.join(',') + '\"';
    }
    return mimeType;
  }

  enum VideoStreamState {
    CLOSED = 0,
    OPENED =  1,
    ENDED = 2,
    OPENED_DATA_GENERATION = 3,
    ERROR = 4
  }

  /**
   * Helper class that encapsulates VIDEO/MediaSource operations and
   * buffers data before passing to the MSE.
   */
  class VideoStream {
    private sec: ISecurityDomain;
    private _domReady: PromiseWrapper<any>;
    private _metadataReady: PromiseWrapper<any>;
    private _started: boolean;
    private _buffer: string;
    private _bufferTime: number;
    private _url: string;
    private _contentTypeHint: string;
    private _state: VideoStreamState;
    private _mediaSource;
    private _mediaSourceBuffer;
    private _mediaSourceBufferLock: Promise<any>;
    private _head: Uint8Array;
    private _decoder: IDataDecoder;
    private _netStream: NetStream;

    get state(): VideoStreamState {
      return this._state;
    }

    get bufferTime(): number {
      return this._bufferTime;
    }

    set bufferTime(value: number) {
      this._bufferTime = +value;
    }

    constructor(netStream: NetStream) {
      this.sec = netStream.sec;
      this._domReady = new PromiseWrapper<any>();
      this._metadataReady = new PromiseWrapper<any>();
      this._started = false;
      this._buffer = 'empty';
      this._bufferTime = 0.1;
      this._url = null;
      this._mediaSource = null;
      this._mediaSourceBuffer = null;
      this._mediaSourceBufferLock = null;
      this._contentTypeHint = null;
      this._state = VideoStreamState.CLOSED;
      this._head = null;
      this._netStream = netStream;
    }

    get url(): string {
      return this._url;
    }

    play(url: string, checkPolicyFile: boolean) {
      release || assert(this._state === VideoStreamState.CLOSED);

      var isMediaSourceEnabled = mediaSourceOption.value;
      if (isMediaSourceEnabled && typeof MediaSource === 'undefined') {
        Debug.warning('MediaSource API is not enabled, falling back to regular playback');
        isMediaSourceEnabled = false;
      }
      var forceMediaSource = false;
      if (/\.flv($|\?)/i.test(url)) {
        if (flvOption.value === 'supported') {
          forceMediaSource = true;
        } else if (flvOption.value === 'mock') {
          url = 'resource://shumway/web/noflv.mp4';
        } else {
          setTimeout(() => {
            this._netStream.dispatchEvent(new this.sec.flash.events.NetStatusEvent(events.NetStatusEvent.NET_STATUS,
              false, false, this.sec.createObjectFromJS({code: "NetStream.Play.NoSupportedTrackFound", level: "error"})));
          });
          return;
        }
      }
      if (!forceMediaSource && !isMediaSourceEnabled) {
        release || somewhatImplemented("public flash.net.NetStream::play");
        this._state = VideoStreamState.OPENED;
        this._url = FileLoadingService.instance.resolveUrl(url);
        return;
      }

      this.openInDataGenerationMode();

      var request = new this.sec.flash.net.URLRequest(url);
      request._checkPolicyFile = checkPolicyFile;
      var stream = new this.sec.flash.net.URLStream();
      stream.addEventListener('httpStatus', function (e) {
        var responseHeaders = e.axGetPublicProperty('responseHeaders');
        var contentTypeHeader = responseHeaders.filter(function (h) {
          return h.axGetPublicProperty('name') === 'Content-Type';
        })[0];
        if (contentTypeHeader) {
          var hint: string = contentTypeHeader.axGetPublicProperty('value');
          if (hint !== 'application/octet-stream') {
            // this._contentTypeHint = hint;
          }
        }
      }.bind(this));
      stream.addEventListener('progress', function (e) {
        var available = stream.bytesAvailable;
        var bytes = new request.sec.flash.utils.ByteArray();
        stream.readBytes(bytes, 0, available);
        var chunk = new Uint8Array((<any> bytes)._buffer, 0, bytes.length);
        this.appendBytes(chunk);
      }.bind(this));
      stream.addEventListener('complete', function (e) {
        this.appendBytesAction('endSequence'); // NetStreamAppendBytesAction.END_SEQUENCE
      }.bind(this));
      stream.load(request);
    }

    playInConnection(connection: NetConnection, streamPath: string) {
      this.openInDataGenerationMode();

      var self = this;
      var mux: RtmpJs.MP4.MP4Mux;
      var mp4 = {
        packets: 0,
        init: function (metadata) {
          if (!metadata.axGetPublicProperty('audiocodecid') && !metadata.axGetPublicProperty('videocodecid')) {
            return; // useless metadata?
          }
          var parsedMetadata = RtmpJs.MP4.parseFLVMetadata(metadata);
          mux = new RtmpJs.MP4.MP4Mux(parsedMetadata);
          mux.oncodecinfo = function (mediaCodecs) {
            this._contentTypeHint = buildMimeType(MP4_MIME_TYPE, mediaCodecs);
          };
          mux.ondata = function (data) {
            self.appendBytes(new Uint8Array(data));
          }.bind(this);
        },
        packet: function (type, data, timestamp) {
          mux.pushPacket(type, new Uint8Array(data), timestamp);
        },
        generate: function () {
          mux.flush();
        }
      };

      connection._createRtmpStream((ns: RtmpJs.INetStream, streamId: number) => {
        ns.ondata = function (message) {
          console.log('#packet (' + message.typeId + '): @' + message.timestamp);
          if (message.data.length > 0) {
            mp4.packet(message.typeId, message.data, message.timestamp);
          }
        };
        ns.oncallback = function () {
          console.log('#callback');
        };
        ns.onscriptdata = function (type, data) {
          console.log('#object: ' + type);
          if (type === 'onMetaData') {
            mp4.init(data);
          }
        };
        ns.play(streamPath);
      });
    }

    openInDataGenerationMode() {
      release || assert(this._state === VideoStreamState.CLOSED);
      this._state = VideoStreamState.OPENED_DATA_GENERATION;
      var mediaSource = new MediaSource();
      mediaSource.addEventListener('sourceopen', function(e) {
        this._ensurePlaying();
      }.bind(this));
      mediaSource.addEventListener('sourceend', function(e) {
        this._mediaSource = null;
      }.bind(this));
      this._mediaSource = mediaSource;
      this._url = URL.createObjectURL(mediaSource);
    }

    appendBytes(bytes: Uint8Array) {
      release || assert(this._state === VideoStreamState.OPENED_DATA_GENERATION ||
                        this._state === VideoStreamState.OPENED);
      release || assert(this._mediaSource);

      if (this._decoder) {
        this._decoder.push(bytes);
        return;
      }

      // First we need to parse some content to find out mime type and codecs
      // for MediaSource. Caching some data at the beginning until we can tell
      // the type of the content.
      var cached;
      var buffer;
      if (this._head !== null) {
        cached = this._head.length;
        buffer = new Uint8Array(cached + bytes.length);
        buffer.set(bytes, cached);
      } else {
        cached = 0;
        buffer = bytes;
      }

      if (!this._decoder) {
        // Trying to create a data decoder.
        var contentType = this._detectContentType(buffer);
        if (contentType === FLV_MIME_TYPE) {
          // FLV data needs to be parsed and wrapped with MP4 tags.
          var flvDecoder = new FlvMp4Decoder(this.sec);
          flvDecoder.onHeader = function (contentType) {
            this._mediaSourceBuffer = this._mediaSource.addSourceBuffer(contentType);
            this._mediaSourceBufferLock = Promise.resolve(undefined);
          }.bind(this);
          flvDecoder.onData = this._queueData.bind(this);
          this._decoder = flvDecoder;
        } else if (contentType) {
          // Let's use identity decoder for reset of the types.
          this._decoder = {
            onData: this._queueData.bind(this),
            onError: function (e) { /* */ },
            push: function (bytes: Uint8Array) { this.onData(bytes); },
            close: function () { /* */ }
          };
          this._mediaSourceBuffer = this._mediaSource.addSourceBuffer(contentType);
          this._mediaSourceBufferLock = Promise.resolve(undefined);
        }
      }

      if (this._decoder) {
        // The decoder exists, doing first data push, see also above.
        this._decoder.push(buffer);
        if (cached > 0) {
          this._head = null;
        }
      } else {
        // Caching header more header data.
        if (cached === 0) {
          this._head = new Uint8Array(bytes);
        } else {
          this._head = buffer;
        }
      }
    }

    private _queueData(bytes: Uint8Array): void {
      // We need to chain all appendBuffer operations using 'update' event.
      var buffer = this._mediaSourceBuffer;
      this._mediaSourceBufferLock = this._mediaSourceBufferLock.then(function () {
        buffer.appendBuffer(bytes);
        return new Promise(function (resolve) {
          buffer.addEventListener('update', function updateHandler() {
            buffer.removeEventListener('update', updateHandler);
            resolve();
          });
        });
      });
    }

    appendBytesAction(netStreamAppendBytesAction: string) {
      release || assert(this._state === VideoStreamState.OPENED_DATA_GENERATION ||
                        this._state === VideoStreamState.OPENED);
      netStreamAppendBytesAction = axCoerceString(netStreamAppendBytesAction);
      // TODO Ignoring reset actions for now.
      if (netStreamAppendBytesAction === 'endSequence') {
        if (!this._decoder) { // Probably pushed not enough data.
          // REDUX: throw a proper internal error. Or something.
          throw new Error('Internal appendBytes error');
        }
        this._decoder.close();
        this._mediaSourceBufferLock.then(function () {
          if (this._mediaSource) {
            this._mediaSource.endOfStream();
          }
          this.close();
        }.bind(this));
      }
      release || somewhatImplemented("public flash.net.NetStream::appendBytesAction");
    }

    close() {
      this._state = VideoStreamState.CLOSED;
    }

    _onEnsurePlay: () => any;
    private _ensurePlaying() {
      if (!this._onEnsurePlay) {
        return;
      }
      this._onEnsurePlay();
    }

    private _detectContentType(bytes: Uint8Array): string {
      if (bytes.length < 16) {
        return null; // Need more bytes.
      }
      if (bytes[0] === 0x46 /* F */ &&
          bytes[1] === 0x4C /* L */ &&
          bytes[2] === 0x56 /* V */ &&
          bytes[3] === 1 /* version 1 */) {
        // Likely FLV.
        return FLV_MIME_TYPE;
      }
      if (bytes[4] === 0x66 /* f */ &&
          bytes[5] === 0x74 /* t */ &&
          bytes[6] === 0x79 /* y */ &&
          bytes[7] === 0x70 /* p */) {
        if (this._contentTypeHint &&
            /^video\/mp4;\s*codecs=/.test(this._contentTypeHint)) {
          return this._contentTypeHint;
        }
        // TODO check bytes for content type
        return 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
      }
      if ((bytes[0] === 0x49 /* I */ &&
           bytes[1] === 0x44 /* D */ &&
           bytes[2] === 0x33 /* 3 */) ||
          (bytes[0] === 0xFF &&
           (bytes[1] & 0xE0) === 0xE0 &&
           (bytes[1] & 0x1E) !== 0x08)) {
        // Maybe MP3.
        return MP3_MIME_TYPE;
      }
      // Just a wild (and wrong) guess
      return this._contentTypeHint || MP4_MIME_TYPE;
    }

    processVideoPlaybackEvent(eventType: VideoPlaybackEvent, data: any) {
      switch (eventType) {
        case VideoPlaybackEvent.Initialized:
          this._domReady.resolve(undefined);
          break;
        case VideoPlaybackEvent.PlayStart:
          if (this._started) {
            break;
          }
          this._started = true;
          break;
        case VideoPlaybackEvent.PlayStop:
          this._started = false;
          break;
        case VideoPlaybackEvent.BufferFull:
          this._buffer = 'full';
          break;
        case VideoPlaybackEvent.Progress:
          this._buffer = 'progress';
          break;
        case VideoPlaybackEvent.BufferEmpty:
          this._buffer = 'empty';
          break;
        case VideoPlaybackEvent.Metadata:
          this._metadataReady.resolve({
            videoWidth: data.videoWidth,
            videoHeight: data.videoHeight
          });
          break;
      }
    }
  }

  // FLV-to-MP4 data transformation.
  class FlvMp4Decoder implements IDataDecoder {
    public onData: (bytes: Uint8Array) => void;
    public onError: (e) => void;
    public onHeader: (contentType: string) => void;

    private _flvParser: RtmpJs.FLV.FLVParser;
    private _mp4Mux: RtmpJs.MP4.MP4Mux;

    constructor(private sec: ISecurityDomain) {
      this._flvParser = new RtmpJs.FLV.FLVParser();
      this._flvParser.onHeader = this._onFlvHeader.bind(this);
      this._flvParser.onTag = this._onFlvTag.bind(this);
      this._flvParser.onClose = this._onFlvClose.bind(this);
      this._flvParser.onError = this._onFlvError.bind(this);
      this._mp4Mux = null;
    }

    private _onFlvHeader(header: RtmpJs.FLV.FLVHeader) {
      //
    }

    private _onFlvTag(tag: RtmpJs.FLV.FLVTag)  {
      if (tag.type === 18) {
        var ba = new this.sec.flash.utils.ByteArray();
        ba.writeRawBytes(tag.data);
        ba.position = 0;
        var name = AMF0.read(ba);
        var value = AMF0.read(ba);
        if (name === 'onMetaData') {
          var metadata = RtmpJs.MP4.parseFLVMetadata(value);
          var mp4Mux = new RtmpJs.MP4.MP4Mux(metadata);
          mp4Mux.oncodecinfo = function (codecs: string[]) {
            this.onHeader(buildMimeType(MP4_MIME_TYPE, codecs));
          }.bind(this);
          mp4Mux.ondata = function (data) {
            this.onData.call(null, data);
          }.bind(this);
          this._mp4Mux = mp4Mux;
        }
        return;
      }
      this._mp4Mux.pushPacket(tag.type, new Uint8Array(tag.data), tag.timestamp);
    }

    private _onFlvClose() {
      this._mp4Mux.flush();
    }

    private _onFlvError(e) {
      if (this.onError) {
        this.onError(e);
      }
    }

    public push(bytes: Uint8Array) {
      try {
        this._flvParser.push(bytes);
      } catch (e)  {
        if (this.onError) {
          this.onError(e);
        }
      }
    }

    public close() {
      try {
       this._flvParser.close();
      } catch (e)  {
        if (this.onError) {
          this.onError(e);
        }
      }
    }
  }
}
