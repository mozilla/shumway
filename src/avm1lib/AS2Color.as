/**
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

package avm1lib {
  import avm1lib.AVM1Utils;
  import flash.geom.ColorTransform;

  public dynamic class AS2Color
  {
    private var __target: Object;

    public function AS2Color(target_mc)
    {
      this.__target = AVM1Utils.resolveTarget(target_mc);
    }
    public function getRGB()
    {
      var transform = this.getTransform();
      return transform.rgb;
    }
    public function getTransform()
    {
      return this.__target._as3Object.transform.colorTransform;
    }
    public function setRGB(offset)
    {
      var transform = new flash.geom.ColorTransform();
      transform.rgb = offset;
      this.setTransform(transform);
    }
    public function setTransform(transform) {
      this.__target._as3Object.transform.colorTransform = transform;
    }
  }
}
