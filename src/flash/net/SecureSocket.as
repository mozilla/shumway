/*
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package flash.net {
import flash.security.X509Certificate;
import flash.utils.ByteArray;

[native(cls='SecureSocketClass')]
public class SecureSocket extends Socket {
  public static native function get isSupported(): Boolean;
  public function SecureSocket() {}
  public function get serverCertificateStatus(): String {
    notImplemented("serverCertificateStatus");
    return "";
  }
  public native function get serverCertificate(): X509Certificate;
  public override function connect(host: String, port: int): void { notImplemented("connect"); }
  public native function addBinaryChainBuildingCertificate(certificate: ByteArray,
                                                           trusted: Boolean): void;
}
}
