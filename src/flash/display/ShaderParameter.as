package flash.display {
  import Object;
  public final dynamic class ShaderParameter {
    public function ShaderParameter() {}
    public native function get value():Array;
    public native function set value(v:Array):void;
    public native function get type():String;
    public native function get index():int;
  }
}
