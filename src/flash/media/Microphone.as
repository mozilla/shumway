package flash.media {
  import flash.events.EventDispatcher;
  import String;
  import Array;
  import Boolean;
  import Number;
  import int;
  import flash.media.SoundTransform;
  import flash.media.MicrophoneEnhancedOptions;
  public final class Microphone extends EventDispatcher {
    public function Microphone() {}
    public static native function getMicrophone(index:int = -1):Microphone;
    public static native function get names():Array;
    public static native function get isSupported():Boolean;
    public static native function getEnhancedMicrophone(index:int = -1):Microphone;
    public native function set gain(gain:Number):void;
    public native function set rate(rate:int):void;
    public native function get rate():int;
    public native function set codec(codec:String):void;
    public native function get codec():String;
    public native function get framesPerPacket():int;
    public native function set framesPerPacket(frames:int):void;
    public native function get encodeQuality():int;
    public native function set encodeQuality(quality:int):void;
    public native function get noiseSuppressionLevel():int;
    public native function set noiseSuppressionLevel(level:int):void;
    public native function get enableVAD():Boolean;
    public native function set enableVAD(enable:Boolean):void;
    public native function setSilenceLevel(silenceLevel:Number, timeout:int = -1):void;
    public native function setUseEchoSuppression(useEchoSuppression:Boolean):void;
    public native function get activityLevel():Number;
    public native function get gain():Number;
    public native function get index():int;
    public native function get muted():Boolean;
    public native function get name():String;
    public native function get silenceLevel():Number;
    public native function get silenceTimeout():int;
    public native function get useEchoSuppression():Boolean;
    public native function setLoopBack(state:Boolean = true):void;
    public native function get soundTransform():SoundTransform;
    public native function set soundTransform(sndTransform:SoundTransform):void;
    public native function get enhancedOptions():MicrophoneEnhancedOptions;
    public native function set enhancedOptions(options:MicrophoneEnhancedOptions):void;
  }
}
