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

[native(cls="ObjectEncodingClass")]
public final class ObjectEncoding {
  public static const AMF0:uint;
  public static const AMF3:uint = 3;
  public static const DEFAULT:uint = 3;

  public static native function get dynamicPropertyWriter():IDynamicPropertyWriter;
  public static native function set dynamicPropertyWriter(object:IDynamicPropertyWriter):void;
}
}
