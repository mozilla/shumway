package flash.net.drm {
  import Object;
  import __AS3__.vec.Vector;
  import flash.utils.ByteArray;
  import flash.net.drm.VoucherAccessInfo;
  import __AS3__.vec.Vector;
  import flash.utils.ByteArray;
  import flash.net.drm.VoucherAccessInfo;
  public class DRMContentData {
    public function DRMContentData(rawData:ByteArray = null) {}
    public function get serverURL():String { notImplemented("serverURL"); }
    public native function get authenticationMethod():String;
    public function get licenseID():String { notImplemented("licenseID"); }
    public function get domain():String { notImplemented("domain"); }
    public function getVoucherAccessInfo():Vector { notImplemented("getVoucherAccessInfo"); }
  }
}
