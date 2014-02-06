package flash.net {
  import flash.events.EventDispatcher;
  import flash.net.NetConnection;
  import String;
  import flash.net.NetStreamInfo;
  import flash.net.NetStreamPlayOptions;
  import uint;
  import int;
  import flash.utils.ByteArray;
  import Object;
  import flash.media.Camera;
  import flash.net.Responder;
  import Array;
  import Boolean;
  import Number;
  import flash.net.NetStreamMulticastInfo;
  import flash.media.VideoStreamSettings;
  import flash.media.Microphone;
  import flash.media.SoundTransform;
  import flash.net.Responder;
  import undefined;
  import flash.events.NetDataEvent;
  import flash.events.AsyncErrorEvent;
  import flash.events.DRMStatusEvent;
  import Object;
  import flash.events.StatusEvent;
  import flash.events.DRMAuthenticateEvent;
  import flash.events.NetStatusEvent;
  import flash.events.DRMErrorEvent;
  import flash.events.IOErrorEvent;
  public class NetStream extends EventDispatcher {
    public function NetStream(connection:NetConnection, peerID:String = "connectToFMS") {}
    public static const DIRECT_CONNECTIONS:String = "directConnections";
    public static const CONNECT_TO_FMS:String = "connectToFMS";
    public native function dispose():void;
    public function attach(connection:NetConnection):void { notImplemented("attach"); }
    public function close():void { notImplemented("close"); }
    public function attachAudio(microphone:Microphone):void { notImplemented("attachAudio"); }
    public function attachCamera(theCamera:Camera, snapshotMilliseconds:int = -1):void { notImplemented("attachCamera"); }
    public function send(handlerName:String):void { notImplemented("send"); }
    public function get bufferTime():Number { notImplemented("bufferTime"); }
    public function set bufferTime(bufferTime:Number):void { notImplemented("bufferTime"); }
    public function get maxPauseBufferTime():Number { notImplemented("maxPauseBufferTime"); }
    public function set maxPauseBufferTime(pauseBufferTime:Number):void { notImplemented("maxPauseBufferTime"); }
    public function get backBufferTime():Number { notImplemented("backBufferTime"); }
    public function set backBufferTime(backBufferTime:Number):void { notImplemented("backBufferTime"); }
    public function get inBufferSeek():Boolean { notImplemented("inBufferSeek"); }
    public function set inBufferSeek(value:Boolean):void { notImplemented("inBufferSeek"); }
    public function get backBufferLength():Number { notImplemented("backBufferLength"); }
    public function step(frames:int):void { notImplemented("step"); }
    public function get bufferTimeMax():Number { notImplemented("bufferTimeMax"); }
    public function set bufferTimeMax(bufferTimeMax:Number):void { notImplemented("bufferTimeMax"); }
    public function receiveAudio(flag:Boolean):void { notImplemented("receiveAudio"); }
    public function receiveVideo(flag:Boolean):void { notImplemented("receiveVideo"); }
    public function receiveVideoFPS(FPS:Number):void { notImplemented("receiveVideoFPS"); }
    public function pause():void { notImplemented("pause"); }
    public function resume():void { notImplemented("resume"); }
    public function togglePause():void { notImplemented("togglePause"); }
    public function seek(offset:Number):void { notImplemented("seek"); }
    public native function play():void;
    public native function play2(param:NetStreamPlayOptions):void;
    public native function get info():NetStreamInfo;
    public native function get multicastInfo():NetStreamMulticastInfo;
    public function publish(name:String = null, type:String = null):void { notImplemented("publish"); }
    public function get time():Number { notImplemented("time"); }
    public function get currentFPS():Number { notImplemented("currentFPS"); }
    public function get bufferLength():Number { notImplemented("bufferLength"); }
    public function get liveDelay():Number { notImplemented("liveDelay"); }
    public function get bytesLoaded():uint { notImplemented("bytesLoaded"); }
    public function get bytesTotal():uint { notImplemented("bytesTotal"); }
    public function get decodedFrames():uint { notImplemented("decodedFrames"); }
    public function get videoCodec():uint { notImplemented("videoCodec"); }
    public function get audioCodec():uint { notImplemented("audioCodec"); }
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
    public function onPeerConnect(subscriber:NetStream):Boolean { notImplemented("onPeerConnect"); }
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
  }
}
