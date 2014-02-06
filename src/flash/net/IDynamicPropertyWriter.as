package flash.net {
  import Object;
  import flash.net.IDynamicPropertyOutput;
  public interface IDynamicPropertyWriter {
     function writeDynamicProperties(obj:Object, output:IDynamicPropertyOutput):void;
  }
}
