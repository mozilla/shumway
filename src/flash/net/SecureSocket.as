package flash.net {
  import flash.net.Socket;
  import String;
  import Boolean;
  import flash.security.X509Certificate;
  import uint;
  import int;
  import flash.utils.ByteArray;
  import flash.events.SecurityErrorEvent;
  import flash.security.CertificateStatus;
  import flash.events.ProgressEvent;
  import flash.events.Event;
  import flash.events.IOErrorEvent;
  public class SecureSocket extends Socket {
    public function SecureSocket() {}
    public static native function get isSupported():Boolean;
    public override function connect(host:String, port:int):void { notImplemented("connect"); }
    public function get serverCertificateStatus():String { notImplemented("serverCertificateStatus"); }
    public native function get serverCertificate():X509Certificate;
    public native function addBinaryChainBuildingCertificate(certificate:ByteArray, trusted:Boolean):void;
  }
}
