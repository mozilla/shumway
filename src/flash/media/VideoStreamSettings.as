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
public class VideoStreamSettings {
  public function VideoStreamSettings() {}
  public function get width(): int {
    notImplemented("width");
    return -1;
  }
  public function get height(): int {
    notImplemented("height");
    return -1;
  }
  public function get fps(): Number {
    notImplemented("fps");
    return -1;
  }
  public function get quality(): int {
    notImplemented("quality");
    return -1;
  }
  public function get bandwidth(): int {
    notImplemented("bandwidth");
    return -1;
  }
  public function get keyFrameInterval(): int {
    notImplemented("keyFrameInterval");
    return -1;
  }
  public function get codec(): String {
    notImplemented("codec");
    return "";
  }
  public function setMode(width: int, height: int, fps: Number): void { notImplemented("setMode"); }
  public function setQuality(bandwidth: int, quality: int): void { notImplemented("setQuality"); }
  public function setKeyFrameInterval(keyFrameInterval: int): void { notImplemented("setKeyFrameInterval"); }
}
}
