package {
    import flash.display.Loader;
    import flash.display.Sprite;
    import flash.events.Event;
    import flash.net.URLRequest;

    public class LoaderTest extends Sprite {

        private var _loader:Loader;

        public function LoaderTest() {
//            var basePath : String = stage.loaderInfo.url;
//            basePath = basePath.split(/\?#/)[0];
//            var pathParts : Array = basePath.split('/');
//            pathParts[pathParts.length - 1] = '';
//            basePath = pathParts.join('/');
            _loader = new Loader();
            _loader.contentLoaderInfo.addEventListener(Event.COMPLETE, loader_complete);
            addChild(_loader);
            _loader.load(new URLRequest("../loader/loadee.swf"));
        }

        private function loader_complete(event:Event):void {
            trace("loading complete. Loaded URL: ", _loader.contentLoaderInfo.url);
        }
    }
}
