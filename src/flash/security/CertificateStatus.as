package flash.security {
  import Object;
  public final class CertificateStatus {
    public function CertificateStatus() {}
    public static const TRUSTED:String = "trusted";
    public static const UNKNOWN:String = "unknown";
    public static const INVALID:String = "invalid";
    public static const EXPIRED:String = "expired";
    public static const NOT_YET_VALID:String = "notYetValid";
    public static const PRINCIPAL_MISMATCH:String = "principalMismatch";
    public static const UNTRUSTED_SIGNERS:String = "untrustedSigners";
    public static const REVOKED:String = "revoked";
    public static const INVALID_CHAIN:String = "invalidChain";
  }
}
