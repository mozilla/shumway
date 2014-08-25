/**
 * Compiled with:
 * java -jar utils/asc.jar -import src/avm2/generated/playerGlobal/playerGlobal.abc -swf LoaderTest,600,600 test/swfs/as3-loader/LoaderTest.as
 */
package {
import flash.display.Loader;
import flash.display.Sprite;
import flash.events.Event;
import flash.net.URLRequest;
import flash.system.fscommand;

public class LoaderTest extends Sprite {

        private var _loader:Loader;

        public function LoaderTest() {
            var basePath : String = stage.loaderInfo.url;
            basePath = basePath.split(/\?#/)[0];
            var pathParts : Array = basePath.split('/');
            pathParts[pathParts.length - 1] = '';
            basePath = pathParts.join('/');
            _loader = new Loader();
            _loader.contentLoaderInfo.addEventListener(Event.OPEN, loader_open);
            _loader.contentLoaderInfo.addEventListener(Event.INIT, loader_init);
            _loader.contentLoaderInfo.addEventListener(Event.COMPLETE, loader_complete);
            addChild(_loader);
            _loader.load(new URLRequest(basePath + "Loadee.swf"));
        }

        private function loader_open(event:Event):void {
            trace("loading started");
        }

        private function loader_init(event:Event):void {
            trace("loadee initialized");
        }

        private function loader_complete(event:Event):void {
            trace("loading complete");
            trace('bytes loaded: ' + _loader.contentLoaderInfo.bytesLoaded);
            fscommand('quit');
        }
    }
}
