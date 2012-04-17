package flash.display {

  public final class Scene {
    public function Scene(name:String, labels:Array, numFrames:int) {}

    private var _name:String;
    private var _labels:Array;
    private var _numFrames:int;

    public function get name():String { notImplemented("name"); }
    public function get labels():Array { notImplemented("labels"); }
    public function get numFrames():int { notImplemented("numFrames"); }
  }

}
