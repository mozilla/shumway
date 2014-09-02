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
import flash.display.DisplayObject;
import flash.net.NetStream;

[native(cls='VideoClass')]
public class Video extends DisplayObject {
  public native function Video(width: int = 320, height: int = 240);
  public native function get deblocking(): int;
  public native function set deblocking(value: int): void;
  public native function get smoothing(): Boolean;
  public native function set smoothing(value: Boolean): void;
  public native function get videoWidth(): int;
  public native function get videoHeight(): int;
  public native function clear(): void;
  public native function attachNetStream(netStream: NetStream): void;
  public native function attachCamera(camera: Camera): void;
}
}
