package flash.security {
public class X500DistinguishedName {
    public function X500DistinguishedName() {}
    public native function get commonName():String;
    public native function get organizationName():String;
    public native function get organizationalUnitName():String;
    public native function get localityName():String;
    public native function get stateOrProvinceName():String;
    public native function get countryName():String;
    public native function toString():String;
  }
}
