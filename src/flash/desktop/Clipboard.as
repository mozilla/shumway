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

package flash.desktop {

[native(cls='ClipboardClass')]
public class Clipboard {
  public static native function get generalClipboard(): Clipboard;
  public function Clipboard() {}
  public native function get formats(): Array;
  public native function clear(): void;
  public native function clearData(format: String): void;
  public function setData(format: String, data: Object, serializable: Boolean = true): Boolean {
    notImplemented("setData");
    return false;
  }
  public function setDataHandler(format: String, handler: Function,
                                 serializable: Boolean = true): Boolean
  {
    notImplemented("setDataHandler");
    return false;
  }
  public function getData(format: String, transferMode: String = "originalPreferred"): Object {
    notImplemented("getData");
    return null;
  }
  public function hasFormat(format: String): Boolean {
    notImplemented("hasFormat");
    return false;
  }
}
}
