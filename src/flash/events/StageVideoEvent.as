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

package flash.events {
public class StageVideoEvent extends Event {
  public static const RENDER_STATE:String = "renderState";
  public static const RENDER_STATUS_UNAVAILABLE:String = "unavailable";
  public static const RENDER_STATUS_SOFTWARE:String = "software";
  public static const RENDER_STATUS_ACCELERATED:String = "accelerated";
  private var _status:String;
  private var _colorSpace:String;
  public function StageVideoEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false,
                                  status:String = null, colorSpace:String = null)
  {
    super(type, bubbles, cancelable);
    _status = status;
    _colorSpace = colorSpace;
  }
  public function get status():String {
    return _status;
  }
  public function get colorSpace():String {
    return _colorSpace;
  }
}
}
