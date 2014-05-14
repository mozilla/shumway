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
import flash.geom.Point;
import flash.geom.Rectangle;
import flash.net.NetStream;

[native(cls='StageVideoClass')]
public class StageVideo extends EventDispatcher {
  public function StageVideo() {}
  public native function get viewPort(): Rectangle;
  public native function set viewPort(rect: Rectangle): void;
  public native function get pan(): Point;
  public native function set pan(point: Point): void;
  public native function get zoom(): Point;
  public native function set zoom(point: Point): void;
  public native function get depth(): int;
  public native function set depth(depth: int): void;
  public native function get videoWidth(): int;
  public native function get videoHeight(): int;
  public native function get colorSpaces(): Vector;
  public native function attachNetStream(netStream: NetStream): void;
  public native function attachCamera(theCamera: Camera): void;
}
}
