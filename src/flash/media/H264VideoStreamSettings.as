package flash.media {
public class H264VideoStreamSettings extends VideoStreamSettings {
    public function H264VideoStreamSettings() {}
    public override function get codec():String { notImplemented("codec"); return ""; }
    public function setProfileLevel(profile:String, level:String):void { notImplemented("setProfileLevel"); }
    public function get profile():String { notImplemented("profile"); return ""; }
    public function get level():String { notImplemented("level"); return ""; }
  }
}
