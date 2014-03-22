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

package flash.filters {
import flash.display.Shader;

[native(cls='ShaderFilterClass')]
public class ShaderFilter extends BitmapFilter {
  public function ShaderFilter(shader: Shader = null) {
    if (shader) {
      this.shader = shader;
    }
  }
  public native function get shader(): Shader;
  public native function set shader(shader: Shader): void;
  public function get leftExtension(): int {
    notImplemented("leftExtension");
    return -1;
  }
  public function set leftExtension(v: int): void { notImplemented("leftExtension"); }
  public function get topExtension(): int {
    notImplemented("topExtension");
    return -1;
  }
  public function set topExtension(v: int): void { notImplemented("topExtension"); }
  public function get rightExtension(): int {
    notImplemented("rightExtension");
    return -1;
  }
  public function set rightExtension(v: int): void { notImplemented("rightExtension"); }
  public function get bottomExtension(): int {
    notImplemented("bottomExtension");
    return -1;
  }
  public function set bottomExtension(v: int): void { notImplemented("bottomExtension"); }
}
}
