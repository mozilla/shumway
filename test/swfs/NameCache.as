/* -*- Mode: java; indent-tabs-mode: nil -*- */
/*
   Compiled with:
   java -jar utils/asc.jar -import playerglobal.abc -swf NameCacheTest,605,605 test/swfs/NameCache.as
*/

package {
    import flash.display.MovieClip;
    import flash.events.Event;

    public class NameCacheTest extends MovieClip {
        private var color: uint = 0xFFCC00;
        private var pos: uint   = 10;
        private var size: uint  = 80;
        public var loader;
        public function NameCacheTest() {
            loader = new CustomLoader();
            addChild(loader);
        }
    }
}

import flash.display.*;
import flash.events.*;
import flash.net.*;

// This test loads a SWF that defines two classes in different doAction tags. The SWF did not complete
// loading because the first class definition was shadowed by the second one in the name cache, which
// used only its simple name as the key. This resulted in an undefined class.

class CustomLoader extends Loader {
    private var bgColor: uint = 0xFFCC00;
    private var pos: uint     = 10;
    private var size: uint    = 80;
    private var url           = "2cba84b4c5109f373dbd8eb83dd1797b3244942aa9a82396e8c60bb762d1bebf.swf";

    public function CustomLoader() {
        var request:URLRequest = new URLRequest(url);
        load(request);
        contentLoaderInfo.addEventListener(Event.COMPLETE, completeHandler);
    }

    private function completeHandler(event:Event):void {
        trace("completeHandler()");
    }
}
