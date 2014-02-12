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
import flash.geom.Point;

[native(cls='MouseCursorDataClass')]
public final class MouseCursorData {
  public function MouseCursorData() {}
  public native function get data(): Vector;
  public native function set data(data: Vector): void;
  public native function get hotSpot(): Point;
  public native function set hotSpot(data: Point): void;
  public native function get frameRate(): Number;
  public native function set frameRate(data: Number): void;
}
}
