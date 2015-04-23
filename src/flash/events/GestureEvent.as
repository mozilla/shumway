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
[native(cls='GestureEventClass')]
public class GestureEvent extends Event {
  public static const GESTURE_TWO_FINGER_TAP: String = "gestureTwoFingerTap";
  public function GestureEvent(type: String, bubbles: Boolean = true,
                                      cancelable: Boolean = false, phase: String = null,
                                      localX: Number = 0, localY: Number = 0,
                                      ctrlKey: Boolean = false, altKey: Boolean = false,
                                      shiftKey: Boolean = false)
  {
    super(type, bubbles, cancelable);
    NativeCtor(phase, localX, localY, ctrlKey, altKey, shiftKey);
  }

  public native function get localX(): Number;
  public native function set localX(value: Number): void;
  public native function get localY(): Number;
  public native function set localY(value: Number): void;

  public native function get phase(): String;
  public native function set phase(value: String): void;

  public native function get ctrlKey(): Boolean;
  public native function set ctrlKey(value: Boolean): void;
  public native function get altKey(): Boolean;
  public native function set altKey(value: Boolean): void;
  public native function get shiftKey(): Boolean;
  public native function set shiftKey(value: Boolean): void;

  public native function get stageX(): Number;
  public native function get stageY(): Number;

  public native override function clone(): Event;
  public native override function toString(): String;
  public native function updateAfterEvent(): void;

  private native function NativeCtor(phase: String = null,
                                     localX: Number = 0, localY: Number = 0,
                                     ctrlKey: Boolean = false, altKey: Boolean = false,
                                     shiftKey: Boolean = false): void;
}
}
