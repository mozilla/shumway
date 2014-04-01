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
    static initializer: any = null;
    constructor (connection: flash.net.NetConnection, peerID: string = "connectToFMS") {
      connection = connection; peerID = "" + peerID;
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.net.NetStream");
    }
    // Static   JS -> AS Bindings
    static createOnPlayStatusCompleteObject: () => ASObject;
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    onStatus: (info: any) => void;
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
    call: (stream: flash.net.NetStream, command: string, responder: flash.net.Responder) => void;
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
    // Instance AS -> JS Bindings
    ctor(connection: flash.net.NetConnection, peerID: string): void {
      connection = connection; peerID = "" + peerID;
      notImplemented("public flash.net.NetStream::ctor"); return;
    }
    onResult(streamId: number /*int*/): void {
      streamId = streamId | 0;
      notImplemented("public flash.net.NetStream::onResult"); return;
    }
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
    }
    get multicastInfo(): flash.net.NetStreamMulticastInfo {
      notImplemented("public flash.net.NetStream::get multicastInfo"); return;
    }
    invoke(index: number /*uint*/): any {
      index = index >>> 0;
      notImplemented("public flash.net.NetStream::invoke"); return;
    }
    invokeWithArgsArray(index: number /*uint*/, p_arguments: any []): any {
      index = index >>> 0; p_arguments = p_arguments;
      notImplemented("public flash.net.NetStream::invokeWithArgsArray"); return;
    }
    get soundTransform(): flash.media.SoundTransform {
      notImplemented("public flash.net.NetStream::get soundTransform"); return;
    }
    set soundTransform(sndTransform: flash.media.SoundTransform) {
      sndTransform = sndTransform;
      notImplemented("public flash.net.NetStream::set soundTransform"); return;
    }
    get checkPolicyFile(): boolean {
      notImplemented("public flash.net.NetStream::get checkPolicyFile"); return;
    }
    set checkPolicyFile(state: boolean) {
      state = !!state;
      notImplemented("public flash.net.NetStream::set checkPolicyFile"); return;
    }
    get client(): ASObject {
      notImplemented("public flash.net.NetStream::get client"); return;
    }
    set client(object: ASObject) {
      object = object;
      notImplemented("public flash.net.NetStream::set client"); return;
    }
    get objectEncoding(): number /*uint*/ {
      notImplemented("public flash.net.NetStream::get objectEncoding"); return;
    }
    get multicastPushNeighborLimit(): number {
      notImplemented("public flash.net.NetStream::get multicastPushNeighborLimit"); return;
    }
    set multicastPushNeighborLimit(neighbors: number) {
      neighbors = +neighbors;
      notImplemented("public flash.net.NetStream::set multicastPushNeighborLimit"); return;
    }
    get multicastWindowDuration(): number {
      notImplemented("public flash.net.NetStream::get multicastWindowDuration"); return;
    }
    set multicastWindowDuration(seconds: number) {
      seconds = +seconds;
      notImplemented("public flash.net.NetStream::set multicastWindowDuration"); return;
    }
    get multicastRelayMarginDuration(): number {
      notImplemented("public flash.net.NetStream::get multicastRelayMarginDuration"); return;
    }
    set multicastRelayMarginDuration(seconds: number) {
      seconds = +seconds;
      notImplemented("public flash.net.NetStream::set multicastRelayMarginDuration"); return;
    }
    get multicastAvailabilityUpdatePeriod(): number {
      notImplemented("public flash.net.NetStream::get multicastAvailabilityUpdatePeriod"); return;
    }
    set multicastAvailabilityUpdatePeriod(seconds: number) {
      seconds = +seconds;
      notImplemented("public flash.net.NetStream::set multicastAvailabilityUpdatePeriod"); return;
    }
    get multicastFetchPeriod(): number {
      notImplemented("public flash.net.NetStream::get multicastFetchPeriod"); return;
    }
    set multicastFetchPeriod(seconds: number) {
      seconds = +seconds;
      notImplemented("public flash.net.NetStream::set multicastFetchPeriod"); return;
    }
    get multicastAvailabilitySendToAll(): boolean {
      notImplemented("public flash.net.NetStream::get multicastAvailabilitySendToAll"); return;
    }
    set multicastAvailabilitySendToAll(value: boolean) {
      value = !!value;
      notImplemented("public flash.net.NetStream::set multicastAvailabilitySendToAll"); return;
    }
    get farID(): string {
      notImplemented("public flash.net.NetStream::get farID"); return;
    }
    get nearNonce(): string {
      notImplemented("public flash.net.NetStream::get nearNonce"); return;
    }
    get farNonce(): string {
      notImplemented("public flash.net.NetStream::get farNonce"); return;
    }
    get peerStreams(): any [] {
      notImplemented("public flash.net.NetStream::get peerStreams"); return;
    }
    get audioReliable(): boolean {
      notImplemented("public flash.net.NetStream::get audioReliable"); return;
    }
    set audioReliable(reliable: boolean) {
      reliable = !!reliable;
      notImplemented("public flash.net.NetStream::set audioReliable"); return;
    }
    get videoReliable(): boolean {
      notImplemented("public flash.net.NetStream::get videoReliable"); return;
    }
    set videoReliable(reliable: boolean) {
      reliable = !!reliable;
      notImplemented("public flash.net.NetStream::set videoReliable"); return;
    }
    get dataReliable(): boolean {
      notImplemented("public flash.net.NetStream::get dataReliable"); return;
    }
    set dataReliable(reliable: boolean) {
      reliable = !!reliable;
      notImplemented("public flash.net.NetStream::set dataReliable"); return;
    }
    get audioSampleAccess(): boolean {
      notImplemented("public flash.net.NetStream::get audioSampleAccess"); return;
    }
    set audioSampleAccess(reliable: boolean) {
      reliable = !!reliable;
      notImplemented("public flash.net.NetStream::set audioSampleAccess"); return;
    }
    get videoSampleAccess(): boolean {
      notImplemented("public flash.net.NetStream::get videoSampleAccess"); return;
    }
    set videoSampleAccess(reliable: boolean) {
      reliable = !!reliable;
      notImplemented("public flash.net.NetStream::set videoSampleAccess"); return;
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
    }
    set useHardwareDecoder(v: boolean) {
      v = !!v;
      notImplemented("public flash.net.NetStream::set useHardwareDecoder"); return;
    }
    get useJitterBuffer(): boolean {
      notImplemented("public flash.net.NetStream::get useJitterBuffer"); return;
    }
    set useJitterBuffer(value: boolean) {
      value = !!value;
      notImplemented("public flash.net.NetStream::set useJitterBuffer"); return;
    }
    get videoStreamSettings(): flash.media.VideoStreamSettings {
      notImplemented("public flash.net.NetStream::get videoStreamSettings"); return;
    }
    set videoStreamSettings(settings: flash.media.VideoStreamSettings) {
      settings = settings;
      notImplemented("public flash.net.NetStream::set videoStreamSettings"); return;
    }
  }
}
