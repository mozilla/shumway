/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
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
  import avm1lib.AS2Utils;
  import flash.geom.ColorTransform;

  public dynamic class AS2Color
  {
    var $target: Object;

    public function AS2Color(target_mc)
    {
      this.$target = AS2Utils.resolveTarget(target_mc);
    }
    public function getRGB()
    {
      var transform = this.getTransform();
      return transform.rgb;
    }
    public function getTransform()
    {
      return this.$target._as3Object.transform.colorTransform;
    }
    public function setRGB(offset)
    {
      var transform = new flash.geom.ColorTransform();
      transform.rgb = offset;
      this.setTransform(transform);
    }
    public function setTransform(transform) {
      this.$target._as3Object.transform.colorTransform = transform;
    }
  }
}