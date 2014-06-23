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
import flash.display.NativeMenuItem;

[native(cls='ContextMenuItemClass')]
public final class ContextMenuItem extends NativeMenuItem {
  public native function ContextMenuItem(caption: String, separatorBefore: Boolean = false,
                                         enabled: Boolean = true, visible: Boolean = true);
  public native function get caption(): String;
  public native function set caption(value: String): void;
  public native function get separatorBefore(): Boolean;
  public native function set separatorBefore(value: Boolean): void;
  public native function get visible(): Boolean;
  public native function set visible(value: Boolean): void;
  public function clone(): ContextMenuItem {
    notImplemented("clone");
    return null;
  }
}
}
