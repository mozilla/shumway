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

package flash.external {
  [native(cls="ExternalInterfaceClass")]
  public final class ExternalInterface {
    public static var marshallExceptions: Boolean = false;

    public static native function addCallback(functionName: String, closure: Function): void;
    public static native function call(functionName: String, ... args): *;

    public static native function get available(): Boolean;
    public static native function get objectID(): String;
  }
}
