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

package flash.globalization {

[native(cls='LocaleIDClass')]
public final class LocaleID {
  public static const DEFAULT: String = "i-default";
  public static native function determinePreferredLocales(want: Vector, have: Vector,
                                                          keyword: String = "userinterface"): Vector;
  public function LocaleID(name: String) {
    ctor(name);
  }
  public native function get name(): String;
  public native function get lastOperationStatus(): String;
  public native function getLanguage(): String;
  public native function getRegion(): String;
  public native function getScript(): String;
  public native function getVariant(): String;
  public native function getKeysAndValues(): Object;
  public native function isRightToLeft(): Boolean;
  private native function ctor(name: String): void;
}
}
