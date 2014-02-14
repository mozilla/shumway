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

[native(cls="FileFilterClass")]
public final class FileFilter {
  public function FileFilter(description:String, extension:String, macType:String = null) {
    this.description = description;
    this.extension = extension;
    this.macType = macType;
  }

  public native function get description():String;
  public native function set description(value:String):void;
  public native function get extension():String;
  public native function set extension(value:String):void;
  public native function get macType():String;
  public native function set macType(value:String):void;
}
}
