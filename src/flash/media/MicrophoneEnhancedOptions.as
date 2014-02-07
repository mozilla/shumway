package flash.media {
public final class MicrophoneEnhancedOptions {
    public function MicrophoneEnhancedOptions() {}
    public function get mode():String { notImplemented("mode"); return ""; }
    public function set mode(mode:String):void { notImplemented("mode"); }
    public function get echoPath():int { notImplemented("echoPath"); return -1; }
    public function set echoPath(echoPath:int):void { notImplemented("echoPath"); }
    public function get nonLinearProcessing():Boolean { notImplemented("nonLinearProcessing"); return false; }
    public function set nonLinearProcessing(enabled:Boolean):void { notImplemented("nonLinearProcessing"); }
    public function get autoGain():Boolean { notImplemented("autoGain"); return false; }
    public function set autoGain(enabled:Boolean):void { notImplemented("autoGain"); }
    public function get isVoiceDetected():int { notImplemented("isVoiceDetected"); return -1; }
    public function set isVoiceDetected(voiceDetected:int) { notImplemented("isVoiceDetected"); }
  }
}
