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

package flash.media {

[native(cls='SoundTransformClass')]
public final class SoundTransform {
  public function SoundTransform(vol: Number = 1, panning: Number = 0) {
    this.volume = vol;
    this.pan = panning;
  }
  public native function get volume(): Number;
  public native function set volume(volume: Number): void;
  public native function get leftToLeft(): Number;
  public native function set leftToLeft(leftToLeft: Number): void;
  public native function get leftToRight(): Number;
  public native function set leftToRight(leftToRight: Number): void;
  public native function get rightToRight(): Number;
  public native function set rightToRight(rightToRight: Number): void;
  public native function get rightToLeft(): Number;
  public native function set rightToLeft(rightToLeft: Number): void;
  public native function get pan(): Number;
  public native function set pan(panning: Number): void;
}
}
