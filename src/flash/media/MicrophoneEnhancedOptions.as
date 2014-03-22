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
public final class MicrophoneEnhancedOptions {
  public function MicrophoneEnhancedOptions() {}
  public function get mode(): String {
    notImplemented("mode");
    return "";
  }
  public function set mode(mode: String): void { notImplemented("mode"); }
  public function get echoPath(): int {
    notImplemented("echoPath");
    return -1;
  }
  public function set echoPath(echoPath: int): void { notImplemented("echoPath"); }
  public function get nonLinearProcessing(): Boolean {
    notImplemented("nonLinearProcessing");
    return false;
  }
  public function set nonLinearProcessing(enabled: Boolean): void { notImplemented("nonLinearProcessing"); }
  public function get autoGain(): Boolean {
    notImplemented("autoGain");
    return false;
  }
  public function set autoGain(enabled: Boolean): void { notImplemented("autoGain"); }
  public function get isVoiceDetected(): int {
    notImplemented("isVoiceDetected");
    return -1;
  }
  public function set isVoiceDetected(voiceDetected: int) { notImplemented("isVoiceDetected"); }
}
}
