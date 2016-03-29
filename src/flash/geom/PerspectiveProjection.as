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

package flash.geom {

[native(cls='PerspectiveProjectionClass')]
public class PerspectiveProjection {
  public native function PerspectiveProjection();
  public native function get fieldOfView(): Number;
  public native function set fieldOfView(fieldOfViewAngleInDegrees: Number): void;
  public native function get projectionCenter(): Point;
  public native function set projectionCenter(p: Point);
  public native function get focalLength(): Number;
  public native function set focalLength(value: Number): void;
  public native function toMatrix3D(): Matrix3D;
}
}
