package flash.net {
internal class DynamicPropertyOutput implements IDynamicPropertyOutput {
    public function DynamicPropertyOutput() {}
    public native function writeDynamicProperty(name:String, value):void;
  }
}
