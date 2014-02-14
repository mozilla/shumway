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

package flash.display {
public final class GraphicsTrianglePath implements IGraphicsPath, IGraphicsData {
  public function GraphicsTrianglePath(vertices:Vector.<Number> = null, indices:Vector.<int> = null,
                                       uvtData:Vector.<Number> = null, culling:String = "none")
  {
    this.vertices = vertices;
    this.indices = indices;
    this.uvtData = uvtData;
    _culling = culling;
    if (culling !== TriangleCulling.NONE && culling !== TriangleCulling.NEGATIVE &&
        culling !== TriangleCulling.POSITIVE)
    {
      Error.throwError(ArgumentError, 2008, "culling");
    }
  }
  public var indices:Vector.<int>;
  public var vertices:Vector.<Number>;
  public var uvtData:Vector.<Number>;
  private var _culling:String;
  public function get culling():String {
    return _culling;
  }
  public function set culling(value:String):void {
    if (culling !== TriangleCulling.NONE && culling !== TriangleCulling.NEGATIVE &&
        culling !== TriangleCulling.POSITIVE)
    {
      Error.throwError(ArgumentError, 2008, "culling");
    }
    _culling = value;
  }
}
}
