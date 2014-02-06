package flash.media {
  import flash.events.EventDispatcher;
  import String;
  import Boolean;
  import flash.media.SoundChannel;
  import flash.media.SoundLoaderContext;
  import uint;
  import Number;
  import int;
  import flash.utils.ByteArray;
  import flash.media.ID3Info;
  import flash.net.URLRequest;
  import flash.media.SoundTransform;
  import flash.events.ProgressEvent;
  import flash.media.SoundLoaderContext;
  import flash.events.Event;
  import flash.events.SampleDataEvent;
  import flash.events.IOErrorEvent;
  public class Sound extends EventDispatcher {
    public function Sound(stream:URLRequest = null, context:SoundLoaderContext = null) {}
    public function load(stream:URLRequest, context:SoundLoaderContext = null):void { notImplemented("load"); }
    public native function loadCompressedDataFromByteArray(bytes:ByteArray, bytesLength:uint):void;
    public native function loadPCMFromByteArray(bytes:ByteArray, samples:uint, format:String = "float", stereo:Boolean = true, sampleRate:Number = 44100):void;
    public native function get url():String;
    public native function get isURLInaccessible():Boolean;
    public native function play(startTime:Number = 0, loops:int = 0, sndTransform:SoundTransform = null):SoundChannel;
    public native function get length():Number;
    public native function get isBuffering():Boolean;
    public native function get bytesLoaded():uint;
    public native function get bytesTotal():int;
    public native function get id3():ID3Info;
    public native function close():void;
    public native function extract(target:ByteArray, length:Number, startPosition:Number = -1):Number;
  }
}
