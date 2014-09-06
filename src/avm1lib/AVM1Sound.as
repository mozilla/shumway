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
import flash.media.Sound;

public dynamic class AVM1Sound {

  private var _target: Object;

  public function AVM1Sound(target: Object) {
    _init(target);
  }

  public function attachSound(id: String): void {}
  public function loadSound(url: String, isStreaming: Boolean): void {}
  public function getBytesLoaded(): Number { return 0; }
  public function getBytesTotal(): Number { return 0; }

  public function getPan(): Number { return 0; }
  public function setPan(value: Number): void {}
  public function getTransform(): Object { return null; }
  public function setTransform(transformObject: Object): void {}
  public function getVolume(): Number { return 0; }
  public function setVolume(value: Number): void {}

  public function start(secondOffset: Number, loops: Number): void {}
  public function stop(linkageID: String): void {}

  private function _init(target: Object): void {
    this._target = target;
    this._as3Object = new Sound();
  }
}
}
