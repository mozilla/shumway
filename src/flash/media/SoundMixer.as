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
import flash.utils.ByteArray;

[native(cls='SoundMixerClass')]
public final class SoundMixer {
  public static native function get bufferTime(): int;
  public static native function set bufferTime(bufferTime: int): void;
  public static native function get soundTransform(): SoundTransform;
  public static native function set soundTransform(sndTransform: SoundTransform): void;
  public static native function get audioPlaybackMode(): String;
  public static native function set audioPlaybackMode(value: String): void;
  public static native function get useSpeakerphoneForVoice(): Boolean;
  public static native function set useSpeakerphoneForVoice(value: Boolean): void;
  public static native function stopAll(): void;
  public static native function computeSpectrum(outputArray: ByteArray, FFTMode: Boolean = false,
                                                stretchFactor: int = 0): void;
  public static native function areSoundsInaccessible(): Boolean;
  public function SoundMixer() {}
}
}
