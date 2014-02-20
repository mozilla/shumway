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

[native(cls='X500DistinguishedNameClass')]
public class X500DistinguishedName {
  public function X500DistinguishedName() {}
  public native function get commonName(): String;
  public native function get organizationName(): String;
  public native function get organizationalUnitName(): String;
  public native function get localityName(): String;
  public native function get stateOrProvinceName(): String;
  public native function get countryName(): String;
  public native function toString(): String;
}
}
