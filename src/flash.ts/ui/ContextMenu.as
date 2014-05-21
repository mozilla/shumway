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
import flash.display.NativeMenu;
import flash.net.URLRequest;

[native(cls='ContextMenuClass')]
public final class ContextMenu extends NativeMenu {
  public static function get isSupported(): Boolean {
    return true;
  }
  public function ContextMenu() {
    builtInItems = new ContextMenuBuiltInItems();
    customItems = [];
  }
  public native function get builtInItems(): ContextMenuBuiltInItems;
  public native function set builtInItems(value: ContextMenuBuiltInItems): void;
  public native function get customItems(): Array;
  public native function set customItems(value: Array): void;
  public native function get link(): URLRequest;
  public native function set link(value: URLRequest): void;
  public native function get clipboardMenu(): Boolean;
  public native function set clipboardMenu(value: Boolean): void;
  public native function get clipboardItems(): ContextMenuClipboardItems;
  public native function set clipboardItems(value: ContextMenuClipboardItems): void;
  public function hideBuiltInItems(): void {
    var items: ContextMenuBuiltInItems = builtInItems;
    if (!items) {
      return;
    }
    items.save = false;
    items.zoom = false;
    items.quality = false;
    items.play = false;
    items.loop = false;
    items.rewind = false;
    items.forwardAndBack = false;
    items.print = false;
  }
  public function clone(): ContextMenu {
    var result: ContextMenu = new ContextMenu();
    result.builtInItems = builtInItems.clone();

    cloneLinkAndClipboardProperties(result);
    for (var i: int = 0; i < customItems.length; i++) {
      result.customItems.push(customItems[i].clone());
    }
    return result;
  }
  private native function cloneLinkAndClipboardProperties(c: ContextMenu): void;
}
}
