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
import flash.events.EventDispatcher;

[native(cls='GameInputControlClass')]
public final class GameInputControl extends EventDispatcher {
  public function GameInputControl() {}
  public native function get numValues(): int;
  public native function get index(): int;
  public native function get relative(): Boolean;
  public native function get type(): String;
  public native function get hand(): String;
  public native function get finger(): String;
  public native function get device(): GameInputDevice;
  public native function getValueAt(index: int = 0): Number;
}
}
