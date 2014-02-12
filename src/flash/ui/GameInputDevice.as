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
import flash.utils.ByteArray;

[native(cls='GameInputDeviceClass')]
public final class GameInputDevice extends EventDispatcher {
  public static const MAX_BUFFER_SIZE: int = 4800;
  public function GameInputDevice() {}
  public native function get numControls(): int;
  public native function get sampleInterval(): int;
  public native function set sampleInterval(val: int): void;
  public native function get enabled(): Boolean;
  public native function set enabled(val: Boolean): void;
  public native function get id(): String;
  public native function get name(): String;
  public native function getControlAt(i: int): GameInputControl;
  public native function startCachingSamples(numSamples: int, controls: Vector): void;
  public native function stopCachingSamples(): void;
  public native function getCachedSamples(data: ByteArray, append: Boolean = false): int;
}
}
