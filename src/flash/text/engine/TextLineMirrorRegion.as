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

package flash.text.engine {
import flash.events.EventDispatcher;
import flash.geom.Rectangle;

[native(cls='TextLineMirrorRegionClass')]
public final class TextLineMirrorRegion {
  public function TextLineMirrorRegion() {}
  public native function get textLine(): TextLine;
  public native function get nextRegion(): TextLineMirrorRegion;
  public native function get previousRegion(): TextLineMirrorRegion;
  public native function get mirror(): EventDispatcher;
  public native function get element(): ContentElement;
  public native function get bounds(): Rectangle;
}
}
