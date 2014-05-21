/*
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *totalMemory
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package flash.utils {

  import flash.events.Event;
  import flash.events.TimerEvent;

  internal final class SetIntervalTimer extends Timer {
    
    internal var reference:uint;
    private var closure:Function;
    private var rest:Array;
    private static var intervalArray:Array = [];

    public function SetIntervalTimer(closure:Function, delay:Number, repeats:Boolean, rest:Array) {

      super(delay, repeats ? 0 : 1);

      this.closure = closure;
      this.rest = rest;
      reference = intervalArray.push(this);

      addEventListener(TimerEvent.TIMER, onTimer);
      start();
    }

    private function onTimer(event:Event):void { 
      closure.apply(null, rest);

      if (1 == repeatCount)
      {
        if (this == intervalArray[reference-1])
        {
          delete intervalArray[reference-1];
        }
      }
    }

    internal static function _clearInterval(id:uint):void { 
      var index = id - 1;
      if (intervalArray[index] is SetIntervalTimer) {
        intervalArray[index].stop();
        delete intervalArray[index];
      }
    }
  }

  public function setTimeout(closure:Function, delay:Number, ... args):uint 
  { 
    return new SetIntervalTimer(closure, delay, false, args).reference;  
  }

  public function clearTimeout(id:uint):void { 
    SetIntervalTimer._clearInterval(id);
  }

  public function setInterval(closure:Function, delay:Number, ... args):uint 
  { 
    return new SetIntervalTimer(closure, delay, true, args).reference;
  }

  public function clearInterval(id:uint):void { 
    SetIntervalTimer._clearInterval(id);
  }
  
}


