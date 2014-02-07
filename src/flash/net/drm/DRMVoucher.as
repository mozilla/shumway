package flash.net.drm {
import flash.utils.ByteArray;

public class DRMVoucher {
    public function DRMVoucher() {}
    public function get voucherStartDate():Date { notImplemented("voucherStartDate"); return null; }
    public function get voucherEndDate():Date { notImplemented("voucherEndDate"); return null; }
    public function get offlineLeaseStartDate():Date { notImplemented("offlineLeaseStartDate"); return null; }
    public function get offlineLeaseEndDate():Date { notImplemented("offlineLeaseEndDate"); return null; }
    public function get policies():Object { notImplemented("policies"); return null; }
    public function get playbackTimeWindow():DRMPlaybackTimeWindow { notImplemented("playbackTimeWindow"); return null; }
    public function toByteArray():ByteArray { notImplemented("toByteArray"); return null; }
  }
}
