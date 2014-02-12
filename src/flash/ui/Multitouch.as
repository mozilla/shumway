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

[native(cls='MultitouchClass')]
public final class Multitouch {
  public static native function get inputMode(): String;
  public static native function set inputMode(value: String): void;
  public static native function get supportsTouchEvents(): Boolean;
  public static native function get supportsGestureEvents(): Boolean;
  public static native function get supportedGestures(): Vector;
  public static native function get maxTouchPoints(): int;
  public static native function get mapTouchToMouse(): Boolean;
  public static native function set mapTouchToMouse(value: Boolean): void;
  public function Multitouch() {}
}
}
