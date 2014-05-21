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
public class SyncEvent extends Event {
  public static const SYNC:String = "sync";
  private var _changeList:Array;
  public function SyncEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false,
                            changeList:Array = null)
  {
    super(type, bubbles, cancelable);
    _changeList = changeList;
  }

  public function get changeList():Array {
    return _changeList;
  }
  public override function clone():Event {
    return new SyncEvent(type, bubbles, cancelable, changeList);
  }

  public override function toString():String {
    return formatToString('SyncEvent', 'type', 'bubbles', 'cancelable', 'eventPhase', 'changeList');
  }
}
}
