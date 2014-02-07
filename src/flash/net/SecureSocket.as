package flash.net {
import flash.security.X509Certificate;
import flash.utils.ByteArray;

public class SecureSocket extends Socket {
    public function SecureSocket() {}
    public static native function get isSupported():Boolean;
    public override function connect(host:String, port:int):void { notImplemented("connect"); }
    public function get serverCertificateStatus():String { notImplemented("serverCertificateStatus"); return ""; }
    public native function get serverCertificate():X509Certificate;
    public native function addBinaryChainBuildingCertificate(certificate:ByteArray, trusted:Boolean):void;
  }
}
