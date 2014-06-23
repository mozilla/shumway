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

[native(cls='Utils3DClass')]
public class Utils3D {
  public static native function projectVector(m: Matrix3D, v: Vector3D): Vector3D;
  public static native function projectVectors(m: Matrix3D, verts: Vector, projectedVerts: Vector,
                                               uvts: Vector): void;
  public static native function pointTowards(percent: Number, mat: Matrix3D, pos: Vector3D,
                                             at: Vector3D = null, up: Vector3D = null): Matrix3D;
}
}
