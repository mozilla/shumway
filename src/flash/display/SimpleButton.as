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

package flash.display {
import flash.media.SoundTransform;

[native(cls='SimpleButtonClass')]
public class SimpleButton extends InteractiveObject {
  public native function SimpleButton(upState:DisplayObject = null, overState:DisplayObject = null,
                               downState:DisplayObject = null, hitTestState:DisplayObject = null);
  public native function get useHandCursor():Boolean;
  public native function set useHandCursor(value:Boolean):void;
  public native function get enabled():Boolean;
  public native function set enabled(value:Boolean):void;
  public native function get trackAsMenu():Boolean;
  public native function set trackAsMenu(value:Boolean):void;
  public native function get upState():DisplayObject;
  public native function set upState(value:DisplayObject):void;
  public native function get overState():DisplayObject;
  public native function set overState(value:DisplayObject):void;
  public native function get downState():DisplayObject;
  public native function set downState(value:DisplayObject):void;
  public native function get hitTestState():DisplayObject;
  public native function set hitTestState(value:DisplayObject):void;
  public native function get soundTransform():SoundTransform;
  public native function set soundTransform(sndTransform:SoundTransform):void;
}
}
