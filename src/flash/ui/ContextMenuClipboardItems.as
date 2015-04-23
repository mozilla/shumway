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
[native(cls='ContextMenuClipboardItemsClass')]
public final class ContextMenuClipboardItems {
  public native function ContextMenuClipboardItems();

  public native function get cut(): Boolean;
  public native function set cut(val: Boolean);
  public native function get copy(): Boolean;
  public native function set copy(val: Boolean);
  public native function get paste(): Boolean;
  public native function set paste(val: Boolean);
  public native function get clear(): Boolean;
  public native function set clear(val: Boolean);
  public native function get selectAll(): Boolean;
  public native function set selectAll(val: Boolean);
  public native function clone(): ContextMenuClipboardItems;
}
}
