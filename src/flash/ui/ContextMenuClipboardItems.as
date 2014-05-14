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

package flash.ui {
public final class ContextMenuClipboardItems {
  public function ContextMenuClipboardItems() {}
  public function get cut(): Boolean {
    notImplemented("cut");
    return false;
  }
  public function set cut(val: Boolean): void { notImplemented("cut"); }
  public function get copy(): Boolean {
    notImplemented("copy");
    return false;
  }
  public function set copy(val: Boolean): void { notImplemented("copy"); }
  public function get paste(): Boolean {
    notImplemented("paste");
    return false;
  }
  public function set paste(val: Boolean): void { notImplemented("paste"); }
  public function get clear(): Boolean {
    notImplemented("clear");
    return false;
  }
  public function set clear(val: Boolean): void { notImplemented("clear"); }
  public function get selectAll(): Boolean {
    notImplemented("selectAll");
    return false;
  }
  public function set selectAll(val: Boolean): void { notImplemented("selectAll"); }
  public function clone(): ContextMenuClipboardItems {
    notImplemented("clone");
    return null;
  }
}
}
