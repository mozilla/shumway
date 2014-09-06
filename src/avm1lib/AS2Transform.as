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

import flash.geom.ColorTransform;
import flash.geom.Matrix;
import flash.geom.Matrix;
import flash.geom.Rectangle;
import flash.geom.Rectangle;

public dynamic class AS2Transform
{
  private var __target : Object;

  public function AS2Transform(mc : AVM1MovieClip) {
    this.__target = AVM1Utils.resolveTarget(mc);
  }

  public function get matrix() : Object // was Matrix, changed to match setter
  {
    return this.__target._as3Object.transform.matrix;
  }
  public function set matrix(value: Object)
  {
    if (value instanceof Matrix) {
      this.__target._as3Object.matrix = value;
      return;
    }
    if (value == null) {
      return;
    }
    // It accepts random objects with a,b,c,d,tx,ty properties
    var m = this.matrix;
    if ('a' in value) {
      m.a = value.a;
    }
    if ('b' in value) {
      m.b = value.b;
    }
    if ('c' in value) {
      m.c = value.c;
    }
    if ('d' in value) {
      m.d = value.d;
    }
    if ('tx' in value) {
      m.tx = value.tx;
    }
    if ('ty' in value) {
      m.ty = value.ty;
    }
    this.__target._as3Object.transform.matrix = m;
  }
  public function get concatenatedMatrix() : Matrix
  {
    return this.__target._as3Object.transform.concatenatedMatrix;
  }
  public function get colorTransform() : ColorTransform
  {
    return this.__target._as3Object.transform.colorTransform;
  }
  public function set colorTransform(value : ColorTransform)
  {
    this.__target._as3Object.transform.colorTransform = value;
  }
  public function get pixelBounds() : Rectangle
  {
    return this.__target._as3Object.pixelBounds;
  }
}
}
