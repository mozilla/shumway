package flash.system {

  [native(cls="SecurityDomainClass")]
  public class SecurityDomain {
    public function SecurityDomain() {}
    public static native function get currentDomain():SecurityDomain;
  }

}
