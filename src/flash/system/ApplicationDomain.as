package flash.system {
  import Object;
  import flash.utils.ByteArray;
  public final class ApplicationDomain {
    public function ApplicationDomain(parentDomain:ApplicationDomain = null) {}
    public static native function get currentDomain():ApplicationDomain;
    public static native function get MIN_DOMAIN_MEMORY_LENGTH():uint;
    public native function get parentDomain():ApplicationDomain;
    public native function getDefinition(name:String):Object;
    public native function hasDefinition(name:String):Boolean;
    public native function getQualifiedDefinitionNames():Vector;
    public native function get domainMemory():ByteArray;
    public native function set domainMemory(mem:ByteArray);
  }
}
