package flash.system {
  import Object;
  public class SecurityDomain {
    public function SecurityDomain() {}
    public static native function get currentDomain():SecurityDomain;
    public native function get domainID():String;
  }
}
