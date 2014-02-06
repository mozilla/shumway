package flash.media {
  import Object;
  import flash.utils.ByteArray;
  import flash.media.SoundTransform;
  public final class SoundMixer {
    public function SoundMixer() {}
    public static native function stopAll():void;
    public static native function computeSpectrum(outputArray:ByteArray, FFTMode:Boolean = false, stretchFactor:int = 0):void;
    public static native function get bufferTime():int;
    public static native function set bufferTime(bufferTime:int):void;
    public static native function get soundTransform():SoundTransform;
    public static native function set soundTransform(sndTransform:SoundTransform):void;
    public static native function areSoundsInaccessible():Boolean;
    public static native function get audioPlaybackMode():String;
    public static native function set audioPlaybackMode(value:String):void;
    public static native function get useSpeakerphoneForVoice():Boolean;
    public static native function set useSpeakerphoneForVoice(value:Boolean):void;
  }
}
