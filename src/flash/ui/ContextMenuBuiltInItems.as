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
public final class ContextMenuBuiltInItems {
  public function ContextMenuBuiltInItems() {}
  private var _save: Boolean = true;
  private var _zoom: Boolean = true;
  private var _quality: Boolean = true;
  private var _play: Boolean = true;
  private var _loop: Boolean = true;
  private var _rewind: Boolean = true;
  private var _forwardAndBack: Boolean = true;
  private var _print: Boolean = true;
  public function get save(): Boolean {
    return _save;
  }
  public function set save(val: Boolean): void {
    _save = val;
  }
  public function get zoom(): Boolean {
    return _zoom;
  }
  public function set zoom(val: Boolean): void {
    _zoom = val;
  }
  public function get quality(): Boolean {
    return _quality;
  }
  public function set quality(val: Boolean): void {
    _quality = val;
  }
  public function get play(): Boolean {
    return _play;
  }
  public function set play(val: Boolean): void {
    _play = val;
  }
  public function get loop(): Boolean {
    return _loop;
  }
  public function set loop(val: Boolean): void {
    _loop = val;
  }
  public function get rewind(): Boolean {
    return _rewind;
  }
  public function set rewind(val: Boolean): void {
    _rewind = val;
  }
  public function get forwardAndBack(): Boolean {
    return _forwardAndBack;
  }
  public function set forwardAndBack(val: Boolean): void {
    _forwardAndBack = val;
  }
  public function get print(): Boolean {
    return _print;
  }
  public function set print(val: Boolean): void {
    _print = val;
  }
  public function clone(): ContextMenuBuiltInItems {
    var items: ContextMenuBuiltInItems = new ContextMenuBuiltInItems();
    items.save = save;
    items.zoom = zoom;
    items.quality = quality;
    items.play = play;
    items.loop = loop;
    items.rewind = rewind;
    items.forwardAndBack = forwardAndBack;
    items.print = print;
    return items;
  }
}
}
