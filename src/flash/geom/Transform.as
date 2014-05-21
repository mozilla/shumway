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
import flash.display.DisplayObject;

[native(cls='TransformClass')]
public class Transform {
  public native function Transform(displayObject:DisplayObject);
  public native function get matrix():Matrix;
  public native function set matrix(value:Matrix):void;
  public native function get colorTransform():ColorTransform;
  public native function set colorTransform(value:ColorTransform):void;
  public native function get concatenatedMatrix():Matrix;
  public native function get concatenatedColorTransform():ColorTransform;
  public native function get pixelBounds():Rectangle;
  public native function get matrix3D():Matrix3D;
  public native function set matrix3D(m:Matrix3D);
  public native function getRelativeMatrix3D(relativeTo:DisplayObject):Matrix3D;
  public native function get perspectiveProjection():PerspectiveProjection;
  public native function set perspectiveProjection(pm:PerspectiveProjection):void;
}
}
