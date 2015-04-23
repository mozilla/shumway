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
import flash.events.EventDispatcher;
import flash.net.URLRequest;
import flash.utils.ByteArray;

[native(cls='SoundClass')]
public class Sound extends EventDispatcher {
  public native function Sound(stream: URLRequest = null, context: SoundLoaderContext = null);
  public native function get url(): String;
  public native function get isURLInaccessible(): Boolean;
  public native function get length(): Number;
  public native function get isBuffering(): Boolean;
  public native function get bytesLoaded(): uint;
  public native function get bytesTotal(): int;
  public native function get id3(): ID3Info;
  public native function load(stream: URLRequest, context: SoundLoaderContext = null): void;
  public native function loadCompressedDataFromByteArray(bytes: ByteArray, bytesLength: uint): void;
  public native function loadPCMFromByteArray(bytes: ByteArray, samples: uint,
                                              format: String = "float", stereo: Boolean = true,
                                              sampleRate: Number = 44100): void;
  public native function play(startTime: Number = 0, loops: int = 0,
                              sndTransform: SoundTransform = null): SoundChannel;
  public native function close(): void;
  public native function extract(target: ByteArray, length: Number,
                                 startPosition: Number = -1): Number;
}
}
