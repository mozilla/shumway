package flash.system {

  import flash.utils.ByteArray;

  [native(cls="ApplicationDomainClass")]
  public final class ApplicationDomain {
    public function ApplicationDomain(parentDomain:ApplicationDomain=null) {
      ctor(parentDomain);
    }

    public static native function get currentDomain():ApplicationDomain;
    // [API("662", "663")]
    public static native function get MIN_DOMAIN_MEMORY_LENGTH():uint;

    private native function ctor(parentDomain:ApplicationDomain):void;
    public native function get parentDomain():ApplicationDomain;
    public native function getDefinition(name:String):Object;
    public native function hasDefinition(name:String):Boolean;
    // [API("662", "663")]
    public native function get domainMemory():ByteArray;
    // [API("662", "663")]
    public native function set domainMemory(mem:ByteArray);
  }

}
