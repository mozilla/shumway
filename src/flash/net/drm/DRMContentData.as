package flash.net.drm {
import flash.utils.ByteArray;

public class DRMContentData {
    public function DRMContentData(rawData:ByteArray = null) {}
    public function get serverURL():String { notImplemented("serverURL"); return ""; }
    public native function get authenticationMethod():String;
    public function get licenseID():String { notImplemented("licenseID"); return ""; }
    public function get domain():String { notImplemented("domain"); return ""; }
    public function getVoucherAccessInfo():Vector { notImplemented("getVoucherAccessInfo"); return null; }
  }
}
