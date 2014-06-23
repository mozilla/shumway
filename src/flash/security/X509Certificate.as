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

package flash.security {
import flash.utils.ByteArray;

[native(cls='X509CertificateClass')]
public class X509Certificate {
  public function X509Certificate() {}
  public native function get version(): uint;
  public native function get serialNumber(): String;
  public native function get signatureAlgorithmOID(): String;
  public native function get signatureAlgorithmParams(): ByteArray;
  public native function get issuer(): X500DistinguishedName;
  public native function get validNotBefore(): Date;
  public native function get validNotAfter(): Date;
  public native function get subject(): X500DistinguishedName;
  public native function get subjectPublicKeyAlgorithmOID(): String;
  public native function get subjectPublicKey(): String;
  public native function get issuerUniqueID(): String;
  public native function get subjectUniqueID(): String;
  public native function get encoded(): ByteArray;
}
}
