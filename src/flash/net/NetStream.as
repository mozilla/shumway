/*
 * Copyright 2014 Mozilla Foundation
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

package flash.net {
import flash.events.EventDispatcher;
import flash.media.Camera;
import flash.media.Microphone;
import flash.media.SoundTransform;
import flash.media.VideoStreamSettings;
import flash.utils.ByteArray;

[native(cls="NetStreamClass")]
public class NetStream extends EventDispatcher {
  public native function NetStream(connection:NetConnection, peerID:String = "connectToFMS");
  public static const DIRECT_CONNECTIONS:String = "directConnections";
  public static const CONNECT_TO_FMS:String = "connectToFMS";
  public native function dispose():void;
  public function attach(connection:NetConnection):void {
    notImplemented("attach");
  }
  public function close():void {
    notImplemented("close");
  }
  public function attachAudio(microphone:Microphone):void {
    notImplemented("attachAudio");
  }
  public function attachCamera(theCamera:Camera, snapshotMilliseconds:int = -1):void {
    notImplemented("attachCamera");
  }
  public function send(handlerName:String):void {
    notImplemented("send");
  }
  public function get bufferTime():Number {
    return invoke(302);
  }
  public function set bufferTime(bufferTime:Number):void {
    invoke(4, bufferTime);
  }
  public function get maxPauseBufferTime():Number {
    notImplemented("maxPauseBufferTime");
    return -1;
  }
  public function set maxPauseBufferTime(pauseBufferTime:Number):void {
    notImplemented("maxPauseBufferTime");
  }
  public function get backBufferTime():Number {
    notImplemented("backBufferTime");
    return -1;
  }
  public function set backBufferTime(backBufferTime:Number):void {
    notImplemented("backBufferTime");
  }

  public native function get inBufferSeek():Boolean;

  public native function set inBufferSeek(value:Boolean):void;

  public function get backBufferLength():Number {
    notImplemented("backBufferLength");
    return -1;
  }
  public function step(frames:int):void {
    notImplemented("step");
  }
  public function get bufferTimeMax():Number {
    notImplemented("bufferTimeMax");
    return -1;
  }
  public function set bufferTimeMax(bufferTimeMax:Number):void {
    notImplemented("bufferTimeMax");
  }
  public function receiveAudio(flag:Boolean):void {
    notImplemented("receiveAudio");
  }
  public function receiveVideo(flag:Boolean):void {
    notImplemented("receiveVideo");
  }
  public function receiveVideoFPS(FPS:Number):void {
    notImplemented("receiveVideoFPS");
  }
  public function pause():void {
    call(this, 'pause', null, true, time * 1000);
  }
  public function resume():void {
    call(this, 'pause', null, false, time * 1000);
  }
  public function togglePause():void {
    call(this, 'pause', null, undefined, time * 1000);
  }
  public function seek(offset:Number):void {
    call(this, 'seek', null, offset * 1000);
  }
  public native function play(... arguments):void;
  public native function play2(param:NetStreamPlayOptions):void;
  public native function get info():NetStreamInfo;
  public native function get multicastInfo():NetStreamMulticastInfo;
  public function publish(name:String = null, type:String = null):void {
    notImplemented("publish");
  }
  public function get time():Number {
    return invoke(300);
  }
  public function get currentFPS():Number {
    notImplemented("currentFPS");
    return -1;
  }
  public function get bufferLength():Number {
    return invoke(303);
  }
  public function get liveDelay():Number {
    notImplemented("liveDelay");
    return -1;
  }
  public function get bytesLoaded():uint {
    return invoke(305);
  }
  public function get bytesTotal():uint {
    return invoke(306);
  }
  public function get decodedFrames():uint {
    notImplemented("decodedFrames");
    return 0;
  }
  public function get videoCodec():uint {
    notImplemented("videoCodec");
    return 0;
  }
  public function get audioCodec():uint {
    notImplemented("audioCodec");
    return 0;
  }
  public native function get soundTransform():SoundTransform;
  public native function set soundTransform(sndTransform:SoundTransform):void;
  public native function get checkPolicyFile():Boolean;
  public native function set checkPolicyFile(state:Boolean):void;
  public native function get client():Object;
  public native function set client(object:Object):void;
  public native function get objectEncoding():uint;
  public native function get multicastPushNeighborLimit():Number;
  public native function set multicastPushNeighborLimit(neighbors:Number):void;
  public native function get multicastWindowDuration():Number;
  public native function set multicastWindowDuration(seconds:Number):void;
  public native function get multicastRelayMarginDuration():Number;
  public native function set multicastRelayMarginDuration(seconds:Number):void;
  public native function get multicastAvailabilityUpdatePeriod():Number;
  public native function set multicastAvailabilityUpdatePeriod(seconds:Number):void;
  public native function get multicastFetchPeriod():Number;
  public native function set multicastFetchPeriod(seconds:Number):void;
  public native function get multicastAvailabilitySendToAll():Boolean;
  public native function set multicastAvailabilitySendToAll(value:Boolean):void;
  public native function get farID():String;
  public native function get nearNonce():String;
  public native function get farNonce():String;
  public native function get peerStreams():Array;
  public function onPeerConnect(subscriber:NetStream):Boolean {
    notImplemented("onPeerConnect");
    return false;
  }
  public native function get audioReliable():Boolean;
  public native function set audioReliable(reliable:Boolean):void;
  public native function get videoReliable():Boolean;
  public native function set videoReliable(reliable:Boolean):void;
  public native function get dataReliable():Boolean;
  public native function set dataReliable(reliable:Boolean):void;
  public native function get audioSampleAccess():Boolean;
  public native function set audioSampleAccess(reliable:Boolean):void;
  public native function get videoSampleAccess():Boolean;
  public native function set videoSampleAccess(reliable:Boolean):void;
  public native function appendBytes(bytes:ByteArray):void;
  public native function appendBytesAction(netStreamAppendBytesAction:String):void;
  public native function get useHardwareDecoder():Boolean;
  public native function set useHardwareDecoder(v:Boolean):void;
  public native function get useJitterBuffer():Boolean;
  public native function set useJitterBuffer(value:Boolean):void;
  public native function get videoStreamSettings():VideoStreamSettings;
  public native function set videoStreamSettings(settings:VideoStreamSettings):void;

  private function call(... args):void {
    invokeWithArgsArray(202, args);
  }
  private native function invoke(index:uint, ... args):*;
  private native function invokeWithArgsArray(index:uint, p_arguments:Array):*;

}
}
