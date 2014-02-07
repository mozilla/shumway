package flash.media {
public class VideoStreamSettings {
    public function VideoStreamSettings() {}
    public function setMode(width:int, height:int, fps:Number):void { notImplemented("setMode"); }
    public function get width():int { notImplemented("width"); return -1; }
    public function get height():int { notImplemented("height"); return -1; }
    public function get fps():Number { notImplemented("fps"); return -1; }
    public function setQuality(bandwidth:int, quality:int):void { notImplemented("setQuality"); }
    public function get quality():int { notImplemented("quality"); return -1; }
    public function get bandwidth():int { notImplemented("bandwidth"); return -1; }
    public function setKeyFrameInterval(keyFrameInterval:int):void { notImplemented("setKeyFrameInterval"); }
    public function get keyFrameInterval():int { notImplemented("keyFrameInterval"); return -1; }
    public function get codec():String { notImplemented("codec"); return ""; }
  }
}
