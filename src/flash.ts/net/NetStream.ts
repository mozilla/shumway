/**
 * Copyright 2013 Mozilla Foundation
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
 * limitations undxr the License.
 */
// Class: NetStream
module Shumway.AVM2.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;
  export class NetStream extends flash.events.EventDispatcher {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["attach", "close", "attachAudio", "attachCamera", "send", "bufferTime", "bufferTime", "maxPauseBufferTime", "maxPauseBufferTime", "backBufferTime", "backBufferTime", "inBufferSeek", "inBufferSeek", "backBufferLength", "step", "bufferTimeMax", "bufferTimeMax", "receiveAudio", "receiveVideo", "receiveVideoFPS", "pause", "resume", "togglePause", "seek", "publish", "time", "currentFPS", "bufferLength", "liveDelay", "bytesLoaded", "bytesTotal", "decodedFrames", "videoCodec", "audioCodec", "onPeerConnect", "call"];
    
    constructor (connection: flash.net.NetConnection, peerID: string = "connectToFMS") {
      connection = connection; peerID = "" + peerID;
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.net.NetStream");
    }
    
    // JS -> AS Bindings
    static DIRECT_CONNECTIONS: string = "directConnections";
    static CONNECT_TO_FMS: string = "connectToFMS";
    
    attach: (connection: flash.net.NetConnection) => void;
    close: () => void;
    attachAudio: (microphone: flash.media.Microphone) => void;
    attachCamera: (theCamera: flash.media.Camera, snapshotMilliseconds: number /*int*/ = -1) => void;
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
    publish: (name: string = null, type: string = null) => void;
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
    // _soundTransform: flash.media.SoundTransform;
    // _checkPolicyFile: boolean;
    // _client: ASObject;
    // _objectEncoding: number /*uint*/;
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
    play(): void {
      notImplemented("public flash.net.NetStream::play"); return;
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
      notImplemented("public flash.net.NetStream::get soundTransform"); return;
      // return this._soundTransform;
    }
    set soundTransform(sndTransform: flash.media.SoundTransform) {
      sndTransform = sndTransform;
      notImplemented("public flash.net.NetStream::set soundTransform"); return;
      // this._soundTransform = sndTransform;
    }
    get checkPolicyFile(): boolean {
      notImplemented("public flash.net.NetStream::get checkPolicyFile"); return;
      // return this._checkPolicyFile;
    }
    set checkPolicyFile(state: boolean) {
      state = !!state;
      notImplemented("public flash.net.NetStream::set checkPolicyFile"); return;
      // this._checkPolicyFile = state;
    }
    get client(): ASObject {
      notImplemented("public flash.net.NetStream::get client"); return;
      // return this._client;
    }
    set client(object: ASObject) {
      object = object;
      notImplemented("public flash.net.NetStream::set client"); return;
      // this._client = object;
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
      bytes = bytes;
      notImplemented("public flash.net.NetStream::appendBytes"); return;
    }
    appendBytesAction(netStreamAppendBytesAction: string): void {
      netStreamAppendBytesAction = "" + netStreamAppendBytesAction;
      notImplemented("public flash.net.NetStream::appendBytesAction"); return;
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
      connection = connection; peerID = "" + peerID;
      notImplemented("public flash.net.NetStream::ctor"); return;
    }
    invoke(index: number /*uint*/): any {
      index = index >>> 0;
      notImplemented("public flash.net.NetStream::invoke"); return;
    }
    invokeWithArgsArray(index: number /*uint*/, p_arguments: any []): any {
      index = index >>> 0; p_arguments = p_arguments;
      notImplemented("public flash.net.NetStream::invokeWithArgsArray"); return;
    }
  }
}
