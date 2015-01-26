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
[native(cls='ContextMenuBuiltInItemsClass')]
public final class ContextMenuBuiltInItems {
  public native function ContextMenuBuiltInItems();

  public native function get save(): Boolean;
  public native function set save(val: Boolean): void;
  public native function get zoom(): Boolean;
  public native function set zoom(val: Boolean): void;
  public native function get quality(): Boolean;
  public native function set quality(val: Boolean): void;
  public native function get play(): Boolean;
  public native function set play(val: Boolean): void;
  public native function get loop(): Boolean;
  public native function set loop(val: Boolean): void;
  public native function get rewind(): Boolean;
  public native function set rewind(val: Boolean): void;
  public native function get forwardAndBack(): Boolean;
  public native function set forwardAndBack(val: Boolean): void;
  public native function get print(): Boolean;
  public native function set print(val: Boolean): void;

  public native function clone(): ContextMenuBuiltInItems;
}
}
