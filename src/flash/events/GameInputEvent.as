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

package flash.events {
import flash.ui.GameInputDevice;

public final class GameInputEvent extends Event {
  public static const DEVICE_ADDED:String = "deviceAdded";
  public static const DEVICE_REMOVED:String = "deviceRemoved";
  private var _device:GameInputDevice;
  public function GameInputEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false,
                                 device:GameInputDevice = null)
  {
    super(type, bubbles, cancelable);
    _device = device;
  }
  public function get device():GameInputDevice {
    return _device;
  }
}
}
