package flash.net {
  import Object;
  import flash.net.IDynamicPropertyOutput;
  internal class DynamicPropertyOutput implements IDynamicPropertyOutput {
    public function DynamicPropertyOutput() {}
    public native function writeDynamicProperty(name:String, value):void;
  }
}
